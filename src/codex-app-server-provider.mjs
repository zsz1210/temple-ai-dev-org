import { spawn } from "node:child_process";
import readline from "node:readline";
import path from "node:path";
import { TEMPLATE_VERSION } from "./constants.mjs";
import { readJson, sha256 } from "./files.mjs";
import { listWorkItemDocuments } from "./work-items.mjs";
import {
  PROVIDER_CAPABILITIES,
  PROVIDER_CONTRACT_SCHEMA
} from "./control-plane-providers.mjs";

export const CODEX_APP_SERVER_PROTOCOL_PROFILE = "codex-app-server-v2-observer-2026-08-30";
export const CODEX_APP_SERVER_SOURCE = "urn:temple:provider:codex-app-server:local";
export const DEFAULT_CODEX_HISTORY_TURN_LIMIT = 20;
export const DEFAULT_CODEX_HISTORY_ITEM_LIMIT = 200;
export const CODEX_LIVE_TASK_STATUSES = ["active", "waiting", "attention"];
export const CODEX_TERMINAL_TASK_STATUSES = ["completed", "archived"];
export const CODEX_TERMINAL_WORK_ITEM_STATES = ["done", "cancelled"];
export const CODEX_ATTACH_OUTCOMES = ["detached", "pending", "history-only", "live-attached", "degraded"];
export const CODEX_ATTACH_REASON_CODES = [
  "archived-task",
  "live-resume-disabled",
  "live-resume-not-eligible",
  "thread-read-empty",
  "thread-read-invalid",
  "thread-read-unsupported",
  "thread-read-unavailable",
  "thread-resume-invalid",
  "thread-resume-unsupported",
  "thread-resume-unavailable",
  "thread-not-in-app-server-store"
];

const LIVE_TASK_STATUS_SET = new Set(CODEX_LIVE_TASK_STATUSES);
const TERMINAL_TASK_STATUS_SET = new Set(CODEX_TERMINAL_TASK_STATUSES);
const TERMINAL_WORK_ITEM_STATE_SET = new Set(CODEX_TERMINAL_WORK_ITEM_STATES);

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
  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf())) return date.toISOString();
  }
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

function terminalWorkItemIds(workItems = []) {
  return new Set(
    workItems
      .filter((item) => TERMINAL_WORK_ITEM_STATE_SET.has(item?.state))
      .map((item) => item.id)
  );
}

export function classifyCodexTasks(tasks = [], options = {}) {
  const registered = tasks.filter((task) => typeof task?.thread_id === "string" && task.thread_id.trim());
  const terminalItems = terminalWorkItemIds(options.workItems);
  const terminal = (task) => TERMINAL_TASK_STATUS_SET.has(task.status) || terminalItems.has(task.work_item_id);
  return {
    registered,
    history_reconcilable: registered.filter((task) => task.status !== "archived"),
    live_resumable: registered.filter((task) => LIVE_TASK_STATUS_SET.has(task.status) && !terminal(task)),
    terminal: registered.filter(terminal),
    non_live: registered.filter((task) => !LIVE_TASK_STATUS_SET.has(task.status) && !terminal(task))
  };
}

export function shouldResumeCodexTask(task, options = {}) {
  return classifyCodexTasks([task], options).live_resumable.length === 1;
}

export function classifyCodexAttachFailure(error, operation = "thread/resume") {
  const prefix = operation === "thread/read" ? "thread-read" : "thread-resume";
  const rpcCode = Number.isInteger(error?.rpcCode) ? error.rpcCode : null;
  const providerReason = String(error?.providerReason ?? error?.message ?? "").toLowerCase();
  if (rpcCode === -32601 || providerReason.includes("method not found") || providerReason.includes("unsupported")) {
    return { reason_code: `${prefix}-unsupported`, retryable: false, provider_wide: true };
  }
  if (rpcCode === -32600 || rpcCode === -32602 || providerReason.includes("invalid request") || providerReason.includes("invalid params")) {
    return { reason_code: `${prefix}-invalid`, retryable: false, provider_wide: false };
  }
  if (
    operation === "thread/resume" &&
    (providerReason.includes("not found") || providerReason.includes("unknown thread") || providerReason.includes("no such thread"))
  ) {
    return { reason_code: "thread-not-in-app-server-store", retryable: false, provider_wide: false };
  }
  return { reason_code: `${prefix}-unavailable`, retryable: true, provider_wide: false };
}

function commonData(projectId, tasks, params) {
  const threadId = params?.threadId ?? params?.thread?.id ?? null;
  const task = taskForThread(tasks, threadId);
  return {
    project_id: projectId,
    work_item_id: task?.work_item_id ?? null,
    task_id: task?.id ?? null,
    position_id: task?.position_id ?? null,
    agent_id: task?.agent_id ?? null,
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
  const number = (value) => (Number.isFinite(value) && value >= 0 ? value : null);
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

function optionalDimension(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return boundedText(value, 160);
  }
  return null;
}

function usageOutcome(workItem) {
  if (!workItem) return "unknown";
  if (workItem.state === "done") return "accepted";
  if (workItem.state === "cancelled") return "abandoned";
  if (workItem.state === "blocked") return "blocked";
  return "in-progress";
}

function safeUsageAttribution(data, task, workItem, params, tokenUsage, options) {
  const model = optionalDimension(params?.model, params?.effectiveModel, tokenUsage?.model, tokenUsage?.effectiveModel);
  const attribution = {
    project_id: data.project_id,
    work_item_id: data.work_item_id,
    position_id: task?.position_id ?? null,
    lifecycle_stage: workItem?.state ?? "unknown",
    lifecycle_stage_source: options.reconciliation === true ? "current-canonical-at-reconciliation" : "current-canonical-at-observation",
    task_id: task?.id ?? null,
    provider_thread_id: data.provider_thread_id,
    attempt_id: data.provider_turn_id,
    retry_of_attempt_id: optionalDimension(params?.retryOfTurnId, params?.retryOfAttemptId),
    provider_id: options.providerId ?? "codex-local",
    model,
    model_version: optionalDimension(params?.modelVersion, params?.effectiveModelVersion, tokenUsage?.modelVersion),
    reasoning_effort: optionalDimension(params?.reasoningEffort, tokenUsage?.reasoningEffort),
    service_tier: optionalDimension(params?.serviceTier, tokenUsage?.serviceTier),
    context_capsule_digest: optionalDimension(params?.contextCapsuleDigest, task?.context_capsule_digest),
    capability_set_digest: optionalDimension(params?.capabilitySetDigest, task?.capability_set_digest),
    source: "provider-reported",
    quality: "exact",
    outcome: usageOutcome(workItem)
  };
  const required = [
    "work_item_id",
    "position_id",
    "lifecycle_stage",
    "task_id",
    "attempt_id",
    "provider_id",
    "model",
    "model_version",
    "reasoning_effort",
    "service_tier",
    "context_capsule_digest",
    "capability_set_digest",
    "outcome"
  ];
  attribution.missing_dimensions = required.filter((field) => attribution[field] === null || attribution[field] === "unknown");
  attribution.quality = attribution.missing_dimensions.length === 0 ? "exact" : "partial";
  return attribution;
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

function safeRequestView(eventData, params) {
  return {
    ...eventData,
    questions: (params?.questions ?? []).slice(0, 20).map((question) => ({
      id: boundedText(question?.id, 120),
      header: boundedText(question?.header, 120),
      question: boundedText(question?.question, 500),
      is_secret: question?.isSecret === true,
      options: (question?.options ?? []).slice(0, 20).map((option) => ({
        label: boundedText(option?.label, 160),
        description: boundedText(option?.description, 300)
      }))
    })).filter((question) => question.id && question.question)
  };
}

export function buildCodexRuntimeRequestResponse(method, params, action) {
  const request = { method, params };
  if (request.method === "item/commandExecution/requestApproval" || request.method === "item/fileChange/requestApproval") {
    const decision = String(action?.decision ?? "");
    const allowed = new Set(["accept", "acceptForSession", "decline", "cancel"]);
    if (!allowed.has(decision)) throw new Error(`Unsupported runtime decision: ${decision || "missing"}`);
    if (
      request.params?.availableDecisions?.length &&
      !request.params.availableDecisions.some((entry) => (typeof entry === "string" ? entry : entry?.type) === decision)
    ) {
      throw new Error(`Runtime provider did not offer decision ${decision}`);
    }
    return { decision };
  }
  if (request.method === "item/permissions/requestApproval") {
    const decision = String(action?.decision ?? "");
    if (!new Set(["accept", "decline"]).has(decision)) throw new Error("Permission requests accept only accept or decline");
    return {
      permissions: decision === "accept" ? structuredClone(request.params?.permissions ?? {}) : {},
      scope: "turn"
    };
  }
  if (request.method === "item/tool/requestUserInput") {
    const answers = action?.answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new Error("Business response answers are required");
    const questions = request.params?.questions ?? [];
    const expectedIds = new Set(questions.map((question) => question.id));
    if (Object.keys(answers).some((id) => !expectedIds.has(id)) || [...expectedIds].some((id) => !Object.hasOwn(answers, id))) {
      throw new Error("Business response must answer every current question exactly once");
    }
    const normalized = {};
    for (const question of questions) {
      const values = answers[question.id];
      if (!Array.isArray(values) || values.length === 0 || values.length > 20) throw new Error(`Question ${question.id} requires one or more answers`);
      normalized[question.id] = {
        answers: values.map((value) => {
          const bounded = boundedText(String(value), 1000);
          if (!bounded) throw new Error(`Question ${question.id} contains an empty answer`);
          return bounded;
        })
      };
    }
    return { answers: normalized };
  }
  throw new Error(`Unsupported live runtime request method: ${request.method}`);
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
  const task = taskForThread(tasks, data.provider_thread_id);
  const workItem = (options.workItems ?? []).find((item) => item.id === data.work_item_id) ?? null;
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
    data.attribution = safeUsageAttribution(data, task, workItem, params, params.tokenUsage, options);
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

function validatedHistoryLimit(value, fallback, maximum, name) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved < 1 || resolved > maximum) {
    throw new Error(`${name} must be an integer from 1 to ${maximum}`);
  }
  return resolved;
}

function boundedSnapshotWindow(thread, options = {}) {
  const turnLimit = validatedHistoryLimit(
    options.historyTurnLimit,
    DEFAULT_CODEX_HISTORY_TURN_LIMIT,
    100,
    "Codex history turn limit"
  );
  const itemLimit = validatedHistoryLimit(
    options.historyItemLimit,
    DEFAULT_CODEX_HISTORY_ITEM_LIMIT,
    1000,
    "Codex history item limit"
  );
  const availableTurns = Array.isArray(thread?.turns) ? thread.turns : [];
  const retainedTurns = availableTurns.slice(-turnLimit);
  const boundedTurns = new Array(retainedTurns.length);
  let remainingItems = itemLimit;
  for (let index = retainedTurns.length - 1; index >= 0; index -= 1) {
    const turn = retainedTurns[index];
    const availableItems = Array.isArray(turn?.items) ? turn.items : [];
    const retainedItems = remainingItems > 0 ? availableItems.slice(-remainingItems) : [];
    remainingItems -= retainedItems.length;
    boundedTurns[index] = { ...turn, items: retainedItems };
  }
  const availableItemCount = availableTurns.reduce(
    (total, turn) => total + (Array.isArray(turn?.items) ? turn.items.length : 0),
    0
  );
  const retainedItemCount = boundedTurns.reduce((total, turn) => total + turn.items.length, 0);
  return {
    turns: boundedTurns,
    metadata: {
      turn_limit: turnLimit,
      item_limit: itemLimit,
      available_turns: availableTurns.length,
      retained_turns: boundedTurns.length,
      available_items: availableItemCount,
      retained_items: retainedItemCount,
      truncated: availableTurns.length > boundedTurns.length || availableItemCount > retainedItemCount
    }
  };
}

function snapshotMessages(thread, fallbackTime, options = {}) {
  const window = boundedSnapshotWindow(thread, options);
  const output = [{
    method: "thread/status/changed",
    params: { threadId: thread.id, status: thread.status },
    emittedAtMs: fallbackTime
  }];
  for (const turn of window.turns) {
    const method = turn.status === "inProgress" ? "turn/started" : "turn/completed";
    output.push({ method, params: { threadId: thread.id, turn }, emittedAtMs: fallbackTime });
    for (const item of turn.items ?? []) {
      const completed = turn.status !== "inProgress" || ["completed", "failed", "declined"].includes(item?.status);
      const itemTime = completed
        ? item?.completedAtMs ?? item?.completedAt ?? fallbackTime
        : item?.startedAtMs ?? item?.startedAt ?? fallbackTime;
      output.push({
        method: completed ? "item/completed" : "item/started",
        params: {
          threadId: thread.id,
          turnId: turn.id,
          item,
          ...(completed ? { completedAtMs: itemTime } : { startedAtMs: itemTime })
        },
        emittedAtMs: fallbackTime
      });
    }
  }
  return { messages: output, metadata: window.metadata };
}

export function normalizeCodexThreadSnapshot(projectId, tasks, thread, options = {}) {
  const observedAt = options.observedAt ?? new Date().toISOString();
  const task = taskForThread(tasks, thread?.id);
  const snapshotTime = timestamp(thread?.createdAt, timestamp(task?.created_at, observedAt));
  const snapshot = snapshotMessages(thread, snapshotTime, options);
  return snapshot.messages
    .map((message) => normalizeCodexMessage(projectId, tasks, message, {
      observedAt,
      workItems: options.workItems,
      providerId: options.providerId,
      reconciliation: true
    }))
    .filter(Boolean)
    .map((event, index) => {
      const windowState = index === 0 ? snapshot.metadata : null;
      return {
        ...event,
        id: `reconcile-${sha256(JSON.stringify([
          event.type,
          event.data.provider_thread_id,
          event.data.provider_turn_id,
          event.data.provider_item_id,
          event.data.status,
          event.data.lifecycle,
          event.data.item_status,
          event.data.scope_revision,
          event.time,
          windowState
        ])).slice(0, 32)}`,
        data: {
          ...event.data,
          reconciled: true,
          reconciliation_source: options.source ?? "provider-snapshot",
          reconciliation_bounds: {
            turn_limit: snapshot.metadata.turn_limit,
            item_limit: snapshot.metadata.item_limit
          },
          ...(windowState ? { reconciliation_window: windowState } : {})
        }
      };
    });
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
      if (message.error) {
        const error = new Error(`Codex App Server ${request.method} failed (${message.error.code ?? "unknown"})`);
        error.rpcCode = Number.isInteger(message.error.code) ? message.error.code : null;
        error.providerReason = boundedText(message.error.message, 240);
        request.reject(error);
      } else request.resolve(message.result);
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
    notify(method, params = {}) {
      send({ method, params });
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
  const workItems = await listWorkItemDocuments(target);
  const taskTopology = classifyCodexTasks(taskRegistry.tasks ?? [], { workItems });
  const tasks = taskTopology.history_reconcilable;
  const providerId = options.providerId ?? "codex-local";
  const command = options.command ?? "codex";
  const commandArgs = options.commandArgs ?? ["app-server", "--stdio"];
  const pendingRuntimeRequests = new Map();
  const historyTurnLimit = validatedHistoryLimit(
    options.historyTurnLimit,
    DEFAULT_CODEX_HISTORY_TURN_LIMIT,
    100,
    "Codex history turn limit"
  );
  const historyItemLimit = validatedHistoryLimit(
    options.historyItemLimit,
    DEFAULT_CODEX_HISTORY_ITEM_LIMIT,
    1000,
    "Codex history item limit"
  );
  let connection = null;
  let stopped = false;
  let reconnectTimer = null;
  let connecting = null;
  const attachOutcomes = new Map();
  const suppressedReadTasks = new Set();
  const suppressedResumeTasks = new Set();
  const suppressedReadReasons = new Map();
  const suppressedResumeReasons = new Map();
  let readMethodUnavailable = false;
  let resumeMethodUnavailable = false;

  function initialAttachOutcome(task) {
    const archived = task.status === "archived";
    const liveEligible = shouldResumeCodexTask(task, { workItems });
    return {
      task_id: task.id,
      work_item_id: task.work_item_id ?? null,
      provider_thread_id: task.thread_id,
      history_read: archived ? "not-eligible" : "pending",
      live_resume: archived || !liveEligible ? "not-eligible" : options.resumeThreads === false ? "disabled" : "pending",
      attach_outcome: archived ? "detached" : "pending",
      reason_code: archived
        ? "archived-task"
        : !liveEligible
          ? "live-resume-not-eligible"
          : options.resumeThreads === false
            ? "live-resume-disabled"
            : null,
      retry_suppressed: false
    };
  }

  for (const task of taskTopology.registered) attachOutcomes.set(task.id, initialAttachOutcome(task));

  function attachmentOutcomeList() {
    return [...attachOutcomes.values()]
      .map((outcome) => structuredClone(outcome))
      .sort((left, right) => String(left.task_id).localeCompare(String(right.task_id)));
  }

  function attachmentSummary() {
    const outcomes = attachmentOutcomeList();
    return {
      registered_tasks: outcomes.length,
      outcomes: Object.fromEntries(CODEX_ATTACH_OUTCOMES.map((outcome) => [
        outcome,
        outcomes.filter((entry) => entry.attach_outcome === outcome).length
      ])),
      retry_suppressed_tasks: outcomes.filter((outcome) => outcome.retry_suppressed).length,
      tasks: outcomes.slice(0, 100).map((outcome) => ({
        task_id: outcome.task_id,
        history_read: outcome.history_read,
        live_resume: outcome.live_resume,
        attach_outcome: outcome.attach_outcome,
        reason_code: outcome.reason_code,
        retry_suppressed: outcome.retry_suppressed
      })),
      truncated: outcomes.length > 100
    };
  }

  function updateAttachOutcome(task, patch) {
    const current = attachOutcomes.get(task.id) ?? initialAttachOutcome(task);
    attachOutcomes.set(task.id, { ...current, ...patch });
    registry.update(providerId, { attachment: attachmentSummary() });
  }

  async function recordAttachFailure(task, operation, error) {
    const failure = classifyCodexAttachFailure(error, operation);
    const isRead = operation === "thread/read";
    const prior = attachOutcomes.get(task.id);
    if (!failure.retryable) {
      (isRead ? suppressedReadTasks : suppressedResumeTasks).add(task.id);
      (isRead ? suppressedReadReasons : suppressedResumeReasons).set(task.id, failure.reason_code);
    }
    if (failure.provider_wide) {
      if (isRead) readMethodUnavailable = true;
      else resumeMethodUnavailable = true;
    }
    updateAttachOutcome(task, {
      ...(isRead ? { history_read: "failed" } : { live_resume: "failed" }),
      attach_outcome: "degraded",
      reason_code: failure.reason_code,
      retry_suppressed: prior?.retry_suppressed === true || !failure.retryable
    });
    const event = normalizeCodexMessage(project.id, tasks, {
      method: "error",
      params: { threadId: task.thread_id, code: failure.reason_code }
    }, { workItems, providerId });
    await journal.append(event);
    registry.update(providerId, { status: "degraded", degraded_reason: failure.reason_code });
    return failure;
  }

  registry.set({
    ...codexAppServerProviderContract({ id: providerId }),
    attachment: attachmentSummary()
  });

  async function append(message) {
    const event = normalizeCodexMessage(project.id, tasks, message, { workItems, providerId });
    if (!event) return null;
    const result = await journal.append(event);
    registry.update(providerId, { last_observed_at: result.record?.templeobservedat ?? new Date().toISOString() });
    return result;
  }

  async function reconcile(thread, source) {
    const events = normalizeCodexThreadSnapshot(project.id, tasks, thread, {
      source,
      historyTurnLimit,
      historyItemLimit,
      workItems,
      providerId
    });
    for (const event of events) await journal.append(event);
    return events.length;
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
    if (connection) return true;
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
            const safe = normalizeCodexMessage(project.id, tasks, message, { workItems, providerId });
            if (!safe) return;
            pendingRuntimeRequests.set(String(message.id), {
              id: String(message.id),
              method: message.method,
              params: message.params,
              responder,
              safe: safeRequestView(safe.data, message.params),
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
        activeConnection.notify("initialized", {});
        const detectedCliVersion = initialized?.serverInfo?.version ?? initialized?.serverInfo?.name ??
          boundedText(initialized?.userAgent, 240);
        registry.set({
          ...codexAppServerProviderContract({
            id: providerId,
            status: "ready",
            detectedCliVersion
          }),
          attachment: attachmentSummary()
        });
        registry.update(providerId, { last_observed_at: new Date().toISOString(), degraded_reason: null });

        for (const task of tasks) {
          let snapshotReconciled = false;
          if (readMethodUnavailable || suppressedReadTasks.has(task.id)) {
            updateAttachOutcome(task, {
              history_read: "suppressed",
              attach_outcome: "degraded",
              reason_code: readMethodUnavailable ? "thread-read-unsupported" : suppressedReadReasons.get(task.id),
              retry_suppressed: true
            });
            registry.update(providerId, {
              status: "degraded",
              degraded_reason: readMethodUnavailable ? "thread-read-unsupported" : suppressedReadReasons.get(task.id)
            });
          } else {
            try {
              const read = await activeConnection.request("thread/read", { threadId: task.thread_id, includeTurns: true });
              if (read?.thread) {
                await reconcile(read.thread, "thread/read");
                snapshotReconciled = true;
                updateAttachOutcome(task, { history_read: "succeeded", attach_outcome: "history-only", reason_code: null });
              } else {
                updateAttachOutcome(task, {
                  history_read: "failed",
                  attach_outcome: "degraded",
                  reason_code: "thread-read-empty"
                });
                registry.update(providerId, { status: "degraded", degraded_reason: "thread-read-empty" });
              }
            } catch (error) {
              await recordAttachFailure(task, "thread/read", error);
            }
          }

          if (options.resumeThreads === false || !shouldResumeCodexTask(task, { workItems })) continue;
          if (resumeMethodUnavailable || suppressedResumeTasks.has(task.id)) {
            updateAttachOutcome(task, {
              live_resume: "suppressed",
              attach_outcome: "degraded",
              reason_code: resumeMethodUnavailable ? "thread-resume-unsupported" : suppressedResumeReasons.get(task.id),
              retry_suppressed: true
            });
            registry.update(providerId, {
              status: "degraded",
              degraded_reason: resumeMethodUnavailable ? "thread-resume-unsupported" : suppressedResumeReasons.get(task.id)
            });
            continue;
          }
          try {
            const resumed = await activeConnection.request("thread/resume", { threadId: task.thread_id });
            if (resumed?.thread && !snapshotReconciled) await reconcile(resumed.thread, "thread/resume");
            const prior = attachOutcomes.get(task.id);
            updateAttachOutcome(task, {
              live_resume: "succeeded",
              attach_outcome: "live-attached",
              reason_code: prior?.history_read === "succeeded" ? null : prior?.reason_code ?? null,
              retry_suppressed: prior?.retry_suppressed === true
            });
          } catch (error) {
            await recordAttachFailure(task, "thread/resume", error);
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
    taskTopology,
    attachmentOutcomes() {
      return attachmentOutcomeList();
    },
    async start() {
      await connect();
      return this;
    },
    pendingRequests() {
      return [...pendingRuntimeRequests.values()].map((request) => ({ ...request.safe, observed_at: request.observed_at }));
    },
    answerRuntimeRequest(requestId, action) {
      const request = pendingRuntimeRequests.get(String(requestId));
      if (!request || !request.safe.answerable || !connection) throw new Error("Runtime request is no longer live or answerable");
      const result = buildCodexRuntimeRequestResponse(request.method, request.params, action);
      request.responder.respond(result);
      request.safe.answerable = false;
      request.safe.status = "answered";
      pendingRuntimeRequests.delete(String(requestId));
      return { request_id: String(requestId), method: request.method, answered: true, request_class: request.safe.request_class };
    },
    async reconnect() {
      if (connection) await connection.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = null;
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
