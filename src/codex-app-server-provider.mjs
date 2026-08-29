import { spawn } from "node:child_process";
import readline from "node:readline";
import path from "node:path";
import { TEMPLATE_VERSION } from "./constants.mjs";
import { readJson, sha256 } from "./files.mjs";
import {
  PROVIDER_CAPABILITIES,
  PROVIDER_CONTRACT_SCHEMA
} from "./control-plane-providers.mjs";

export const CODEX_APP_SERVER_PROTOCOL_PROFILE = "codex-app-server-v2-observer-2026-08-30";
export const CODEX_APP_SERVER_SOURCE = "urn:temple:provider:codex-app-server:local";

const NOTIFICATION_TYPES = new Map([
  ["thread/started", "org.temple.codex.thread.started.v1"],
  ["thread/status/changed", "org.temple.codex.thread.status.v1"],
  ["turn/started", "org.temple.codex.turn.started.v1"],
  ["turn/completed", "org.temple.codex.turn.completed.v1"],
  ["item/started", "org.temple.codex.item.started.v1"],
  ["item/completed", "org.temple.codex.item.completed.v1"],
  ["turn/plan/updated", "org.temple.codex.plan.updated.v1"],
  ["turn/diff/updated", "org.temple.codex.diff.updated.v1"],
  ["thread/tokenUsage/updated", "org.temple.codex.usage.updated.v1"],
  ["serverRequest/resolved", "org.temple.codex.runtime-request.resolved.v1"],
  ["error", "org.temple.codex.failure.observed.v1"]
]);

const REQUEST_CLASSES = new Map([
  ["item/commandExecution/requestApproval", "runtime-permission"],
  ["item/fileChange/requestApproval", "runtime-permission"],
  ["item/permissions/requestApproval", "runtime-permission"],
  ["item/tool/requestUserInput", "business-fact"]
]);

function capabilities(overrides = {}) {
  return Object.fromEntries(
    PROVIDER_CAPABILITIES.map((capability) => [capability, overrides[capability] ?? "unsupported"])
  );
}

export function codexAppServerProviderContract(options = {}) {
  const status = options.status ?? "offline";
  return {
    schema_version: PROVIDER_CONTRACT_SCHEMA,
    id: options.id ?? "codex-local",
    kind: "codex-app-server",
    version: CODEX_APP_SERVER_PROTOCOL_PROFILE,
    status,
    capabilities: capabilities({
      enumeration: "supported",
      history_snapshot: "supported",
      live_events: "supported",
      plan_summary: "supported",
      diff_summary: "supported",
      token_usage: "supported",
      runtime_approval: "supported",
      thread_resume: "supported"
    }),
    last_observed_at: null,
    degraded_reason: options.degradedReason ?? (status === "ready" ? null : "not connected"),
    protocol: {
      profile: CODEX_APP_SERVER_PROTOCOL_PROFILE,
      detected_cli_version: options.detectedCliVersion ?? null,
      connection_mode: "explicit-opt-in"
    }
  };
}

function boundedText(value, limit = 240) {
  if (typeof value !== "string") return null;
  const normalized = value.replaceAll(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
}

function timestamp(value, fallback) {
  if (Number.isFinite(value)) {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(milliseconds);
    if (!Number.isNaN(date.valueOf())) return date.toISOString();
  }
  return fallback;
}

function taskForThread(tasks, threadId) {
  return (tasks ?? []).find((task) => task.thread_id === threadId) ?? null;
}

function commonData(projectId, tasks, params) {
  const threadId = params?.threadId ?? params?.thread?.id ?? null;
  const task = taskForThread(tasks, threadId);
  return {
    project_id: projectId,
    work_item_id: task?.work_item_id ?? null,
    task_id: task?.id ?? null,
    runtime_worker_id: task?.worker_id ?? null,
    provider_thread_id: threadId,
    provider_turn_id: params?.turnId ?? params?.turn?.id ?? null,
    provider_item_id: params?.itemId ?? params?.item?.id ?? null,
    scope_revision: task?.current_revision ?? null,
    correlation: task ? "registered" : "unregistered"
  };
}

function subject(projectId, data) {
  return data.work_item_id
    ? `project/${projectId}/work-item/${data.work_item_id}`
    : `project/${projectId}`;
}

function safePlan(plan) {
  return (Array.isArray(plan) ? plan : []).slice(0, 50).map((step) => ({
    status: boundedText(step?.status, 40) ?? "unknown",
    step: boundedText(step?.step, 240) ?? "Unlabelled step"
  }));
}

export function summarizeUnifiedDiff(diff) {
  const files = new Set();
  let additions = 0;
  let deletions = 0;
  let hunks = 0;
  for (const line of String(diff ?? "").split(/\r?\n/)) {
    if (line.startsWith("+++ ")) {
      const value = line.slice(4).trim().replace(/^b\//, "");
      if (value && value !== "/dev/null") files.add(boundedText(value, 240));
    } else if (line.startsWith("@@")) hunks += 1;
    else if (line.startsWith("+") && !line.startsWith("+++")) additions += 1;
    else if (line.startsWith("-") && !line.startsWith("---")) deletions += 1;
  }
  return {
    files: [...files].filter(Boolean).slice(0, 100),
    file_count: files.size,
    additions,
    deletions,
    hunks,
    raw_diff_retained: false
  };
}

function safeItem(item, lifecycle) {
  const changes = Array.isArray(item?.changes) ? item.changes : [];
  const paths = changes
    .map((change) => boundedText(change?.path ?? change?.filePath, 240))
    .filter(Boolean)
    .slice(0, 100);
  return {
    item_type: boundedText(item?.type, 80) ?? "unknown",
    item_status: boundedText(item?.status, 80) ?? lifecycle,
    lifecycle,
    terminal: lifecycle === "completed",
    exit_code: Number.isInteger(item?.exitCode) ? item.exitCode : null,
    changed_files: paths,
    change_count: changes.length,
    raw_content_retained: false
  };
}

function safeUsage(tokenUsage) {
  const total = tokenUsage?.total ?? {};
  const last = tokenUsage?.last ?? {};
  const number = (value) => (Number.isFinite(value) && value >= 0 ? value : 0);
  return {
    total: {
      input_tokens: number(total.inputTokens),
      cached_input_tokens: number(total.cachedInputTokens),
      output_tokens: number(total.outputTokens),
      reasoning_output_tokens: number(total.reasoningOutputTokens),
      total_tokens: number(total.totalTokens)
    },
    last: {
      input_tokens: number(last.inputTokens),
      cached_input_tokens: number(last.cachedInputTokens),
      output_tokens: number(last.outputTokens),
      reasoning_output_tokens: number(last.reasoningOutputTokens),
      total_tokens: number(last.totalTokens)
    },
    model_context_window: Number.isFinite(tokenUsage?.modelContextWindow) ? tokenUsage.modelContextWindow : null,
    monetary_cost: null,
    price_source: null
  };
}

function safeRuntimeRequest(method, requestId, params) {
  return {
    request_id: String(requestId),
    request_method: method,
    request_class: REQUEST_CLASSES.get(method),
    status: "pending",
    answerable: true,
    started_at: timestamp(params?.startedAtMs, null),
    reason: boundedText(params?.reason),
    command_present: typeof params?.command === "string" && params.command.length > 0,
    question_count: Array.isArray(params?.questions) ? params.questions.length : 0,
    available_decisions: (params?.availableDecisions ?? []).slice(0, 20).map((entry) =>
      boundedText(typeof entry === "string" ? entry : entry?.decision ?? entry?.type, 80)
    ).filter(Boolean),
    raw_request_retained: false
  };
}

function eventId(method, data, occurredAt) {
  const identity = [
    CODEX_APP_SERVER_PROTOCOL_PROFILE,
    method,
    data.provider_thread_id,
    data.provider_turn_id,
    data.provider_item_id,
    data.request_id,
    data.status,
    data.lifecycle,
    data.plan,
    data.diff_summary,
    data.usage,
    occurredAt
  ];
  return `${method.replaceAll(/[^a-zA-Z0-9]+/g, "-")}-${sha256(JSON.stringify(identity)).slice(0, 32)}`;
}

export function normalizeCodexMessage(projectId, tasks, message, options = {}) {
  const observedAt = options.observedAt ?? new Date().toISOString();
  const method = message?.method;
  const params = message?.params ?? {};
  const notificationType = NOTIFICATION_TYPES.get(method);
  const requestClass = REQUEST_CLASSES.get(method);
  if (!notificationType && !requestClass) return null;
  const data = commonData(projectId, tasks, params);
  let type = notificationType;
  let occurredAt = timestamp(message?.emittedAtMs ?? params?.emittedAtMs, observedAt);

  if (method === "thread/started") {
    data.status = params.thread?.status?.type ?? "unknown";
    data.provider_thread_id = params.thread?.id ?? null;
  } else if (method === "thread/status/changed") {
    data.status = params.status?.type ?? "unknown";
    data.active_flags = Array.isArray(params.status?.activeFlags) ? params.status.activeFlags.slice(0, 20) : [];
  } else if (method === "turn/started") {
    data.status = params.turn?.status ?? "inProgress";
    occurredAt = timestamp(params.turn?.startedAt, occurredAt);
  } else if (method === "turn/completed") {
    data.status = params.turn?.status ?? "unknown";
    data.duration_ms = Number.isFinite(params.turn?.durationMs) ? params.turn.durationMs : null;
    data.error_code = boundedText(params.turn?.error?.code ?? params.turn?.error?.type, 120);
    occurredAt = timestamp(params.turn?.completedAt, occurredAt);
  } else if (method === "item/started" || method === "item/completed") {
    Object.assign(data, safeItem(params.item, method.endsWith("completed") ? "completed" : "started"));
    occurredAt = timestamp(method.endsWith("completed") ? params.completedAtMs : params.startedAtMs, occurredAt);
  } else if (method === "turn/plan/updated") {
    data.status = "updated";
    data.plan = safePlan(params.plan);
    data.explanation_retained = false;
  } else if (method === "turn/diff/updated") {
    data.status = "updated";
    data.diff_summary = summarizeUnifiedDiff(params.diff);
  } else if (method === "thread/tokenUsage/updated") {
    data.status = "updated";
    data.usage = safeUsage(params.tokenUsage);
  } else if (method === "serverRequest/resolved") {
    data.request_id = String(params.requestId);
    data.status = "resolved";
    data.answerable = false;
  } else if (method === "error") {
    data.status = "failed";
    data.error_code = boundedText(params?.error?.code ?? params?.code ?? "provider-error", 120);
  } else if (requestClass) {
    type = "org.temple.codex.runtime-request.pending.v1";
    Object.assign(data, safeRuntimeRequest(method, message.id, params));
    occurredAt = timestamp(params.startedAtMs, occurredAt);
  }

  const task = taskForThread(tasks, data.provider_thread_id);
  if (task) {
    data.work_item_id = task.work_item_id;
    data.task_id = task.id;
    data.runtime_worker_id = task.worker_id ?? null;
    data.scope_revision = task.current_revision ?? null;
    data.correlation = "registered";
  }
  return {
    specversion: "1.0",
    id: eventId(method, data, occurredAt),
    source: CODEX_APP_SERVER_SOURCE,
    type,
    subject: subject(projectId, data),
    time: occurredAt,
    data
  };
}

function snapshotMessages(thread, observedAt) {
  const output = [{
    method: "thread/status/changed",
    params: { threadId: thread.id, status: thread.status },
    emittedAtMs: Date.parse(observedAt)
  }];
  for (const turn of thread.turns ?? []) {
    const method = turn.status === "inProgress" ? "turn/started" : "turn/completed";
    output.push({ method, params: { threadId: thread.id, turn }, emittedAtMs: Date.parse(observedAt) });
    for (const item of turn.items ?? []) {
      const completed = turn.status !== "inProgress" || ["completed", "failed", "declined"].includes(item?.status);
      output.push({
        method: completed ? "item/completed" : "item/started",
        params: {
          threadId: thread.id,
          turnId: turn.id,
          item,
          ...(completed ? { completedAtMs: Date.parse(observedAt) } : { startedAtMs: Date.parse(observedAt) })
        },
        emittedAtMs: Date.parse(observedAt)
      });
    }
  }
  return output;
}

export function normalizeCodexThreadSnapshot(projectId, tasks, thread, options = {}) {
  const observedAt = options.observedAt ?? new Date().toISOString();
  const snapshotTime = timestamp(thread?.updatedAt ?? thread?.createdAt, observedAt);
  return snapshotMessages(thread, observedAt)
    .map((message) => normalizeCodexMessage(projectId, tasks, message, { observedAt }))
    .filter(Boolean)
    .map((event) => ({
      ...event,
      id: `reconcile-${sha256(JSON.stringify([
        event.type,
        event.data.provider_thread_id,
        event.data.provider_turn_id,
        event.data.provider_item_id,
        event.data.status,
        event.data.lifecycle,
        event.data.item_status,
        snapshotTime
      ])).slice(0, 32)}`,
      time: snapshotTime,
      data: { ...event.data, reconciled: true, reconciliation_source: "provider-snapshot" }
    }));
}

export function createJsonRpcProcess(command, args = [], options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: ["pipe", "pipe", "pipe"]
  });
  const pending = new Map();
  let sequence = 0;
  let stderr = "";
  let closed = false;
  const lines = readline.createInterface({ input: child.stdout });

  function send(message) {
    if (closed || child.stdin.destroyed) throw new Error("Codex App Server connection is closed");
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
  }

  lines.on("line", (line) => {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      options.onProtocolError?.(new Error("Codex App Server emitted invalid JSON"));
      return;
    }
    if (message.id !== undefined && message.method === undefined) {
      const request = pending.get(String(message.id));
      if (!request) return;
      pending.delete(String(message.id));
      if (message.error) request.reject(new Error(`Codex App Server ${request.method} failed (${message.error.code ?? "unknown"})`));
      else request.resolve(message.result);
      return;
    }
    if (message.method && message.id !== undefined) options.onRequest?.(message, { respond: (result) => send({ id: message.id, result }) });
    else if (message.method) options.onNotification?.(message);
  });
  child.stderr.on("data", (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-4096);
  });
  child.on("error", (error) => options.onExit?.(error));
  child.on("exit", (code, signal) => {
    closed = true;
    const error = new Error(`Codex App Server exited (${code ?? signal ?? "unknown"})`);
    for (const request of pending.values()) request.reject(error);
    pending.clear();
    options.onExit?.(error, { code, signal, stderr_present: Boolean(stderr.trim()) });
  });

  return {
    child,
    request(method, params = {}, timeoutMs = 15000) {
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(String(id));
          reject(new Error(`Codex App Server ${method} timed out`));
        }, timeoutMs);
        pending.set(String(id), {
          method,
          resolve: (value) => { clearTimeout(timer); resolve(value); },
          reject: (error) => { clearTimeout(timer); reject(error); }
        });
        send({ id, method, params });
      });
    },
    respond(id, result) {
      send({ id, result });
    },
    async close() {
      if (closed) return;
      closed = true;
      lines.close();
      child.kill("SIGTERM");
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 1000);
        child.once("exit", () => { clearTimeout(timer); resolve(); });
      });
    }
  };
}

export async function startCodexAppServerProvider(target, journal, registry, options = {}) {
  const project = await readJson(path.join(target, ".ai-org/project/project.json"));
  const taskRegistry = await readJson(path.join(target, ".ai-org/project/tasks.json"));
  const tasks = (taskRegistry.tasks ?? []).filter((task) => task.thread_id && task.status !== "archived");
  const providerId = options.providerId ?? "codex-local";
  const command = options.command ?? "codex";
  const commandArgs = options.commandArgs ?? ["app-server", "--stdio"];
  const pendingRuntimeRequests = new Map();
  let connection = null;
  let stopped = false;
  let reconnectTimer = null;
  let connecting = null;

  registry.set(codexAppServerProviderContract({ id: providerId }));

  async function append(message) {
    const event = normalizeCodexMessage(project.id, tasks, message);
    if (!event) return null;
    const result = await journal.append(event);
    registry.update(providerId, { last_observed_at: result.record?.templeobservedat ?? new Date().toISOString() });
    return result;
  }

  async function reconcile(thread, source) {
    for (const event of normalizeCodexThreadSnapshot(project.id, tasks, thread, { source })) await journal.append(event);
  }

  function scheduleReconnect() {
    if (stopped || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, options.reconnectMs ?? 2000);
  }

  async function connect() {
    if (stopped || connecting) return connecting;
    connecting = (async () => {
      try {
        const activeConnection = createJsonRpcProcess(command, commandArgs, {
          cwd: target,
          onNotification(message) {
            if (message.method === "serverRequest/resolved") pendingRuntimeRequests.delete(String(message.params?.requestId));
            void append(message).catch((error) => {
              registry.update(providerId, { status: "degraded", degraded_reason: error.message });
            });
          },
          onRequest(message, responder) {
            const safe = normalizeCodexMessage(project.id, tasks, message);
            if (!safe) return;
            pendingRuntimeRequests.set(String(message.id), {
              id: String(message.id),
              method: message.method,
              params: message.params,
              responder,
              safe: safe.data,
              observed_at: new Date().toISOString()
            });
            void journal.append(safe).catch((error) => {
              registry.update(providerId, { status: "degraded", degraded_reason: error.message });
            });
          },
          onProtocolError(error) {
            registry.update(providerId, { status: "degraded", degraded_reason: error.message });
          },
          onExit(error) {
            if (connection !== activeConnection) return;
            connection = null;
            for (const request of pendingRuntimeRequests.values()) request.safe.answerable = false;
            registry.update(providerId, {
              status: stopped ? "disabled" : "offline",
              degraded_reason: stopped ? "stopped" : error.message
            });
            scheduleReconnect();
          }
        });
        connection = activeConnection;
        const initialized = await activeConnection.request("initialize", {
          clientInfo: { name: "temple", title: "Temple Control Plane", version: TEMPLATE_VERSION },
          capabilities: { experimentalApi: false }
        });
        const detectedCliVersion = initialized?.serverInfo?.version ?? initialized?.serverInfo?.name ??
          boundedText(initialized?.userAgent, 240);
        registry.set(codexAppServerProviderContract({
          id: providerId,
          status: "ready",
          detectedCliVersion
        }));
        registry.update(providerId, { last_observed_at: new Date().toISOString(), degraded_reason: null });

        for (const task of tasks) {
          try {
            const read = await activeConnection.request("thread/read", { threadId: task.thread_id, includeTurns: true });
            if (read?.thread) await reconcile(read.thread, "thread/read");
            if (options.resumeThreads !== false) {
              const resumed = await activeConnection.request("thread/resume", { threadId: task.thread_id });
              if (resumed?.thread) await reconcile(resumed.thread, "thread/resume");
            }
          } catch (error) {
            const event = normalizeCodexMessage(project.id, tasks, {
              method: "error",
              params: { threadId: task.thread_id, code: "thread-attach-failed" }
            });
            await journal.append(event);
            registry.update(providerId, { status: "degraded", degraded_reason: error.message });
          }
        }
        return true;
      } catch (error) {
        registry.update(providerId, { status: "offline", degraded_reason: error.message });
        if (connection) await connection.close().catch(() => {});
        connection = null;
        scheduleReconnect();
        return false;
      } finally {
        connecting = null;
      }
    })();
    return connecting;
  }

  return {
    providerId,
    tasks,
    async start() {
      await connect();
      return this;
    },
    pendingRequests() {
      return [...pendingRuntimeRequests.values()].map((request) => ({ ...request.safe, observed_at: request.observed_at }));
    },
    answerRuntimeRequest(requestId, result) {
      const request = pendingRuntimeRequests.get(String(requestId));
      if (!request || !request.safe.answerable || !connection) throw new Error("Runtime request is no longer live or answerable");
      request.responder.respond(result);
      request.safe.answerable = false;
      request.safe.status = "answered";
      pendingRuntimeRequests.delete(String(requestId));
      return { request_id: String(requestId), method: request.method, answered: true };
    },
    async reconnect() {
      if (connection) await connection.close();
      return connect();
    },
    async stop() {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = null;
      if (connection) await connection.close();
      connection = null;
      registry.update(providerId, { status: "disabled", degraded_reason: "stopped" });
    }
  };
}
