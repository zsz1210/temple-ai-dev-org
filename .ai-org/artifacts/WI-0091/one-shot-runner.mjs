import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  createJsonRpcProcess,
  startCodexAppServerProvider
} from "../../../src/codex-app-server-provider.mjs";
import {
  createProviderRegistry,
  repositoryProviderContract
} from "../../../src/control-plane-providers.mjs";
import { defaultControlPlaneConfig } from "../../../src/control-plane-config.mjs";
import { readJson } from "../../../src/files.mjs";
import { openTelemetryJournal, resolveControlPlaneStateDirectory } from "../../../src/telemetry.mjs";
import { updateTask } from "../../../src/tasks.mjs";

const target = "/Users/zsz1210/Documents/ChatGPT/temple-ai-dev-org";
const projectId = "temple";
const workItemId = "WI-0091";
const positionId = "developer";
const agentId = "agent-rikku";
const launchRevision = process.env.TEMPLE_WI0091_LAUNCH_REVISION;
const requestedModel = "gpt-5.6-luna";
const reasoningEffort = "max";
const expectedResponse = "TEMPLE_USAGE_CAPTURE_HEALTH_OK";
const warningTokens = 40_000;
const stopTokens = 60_000;
const taskCeilingMs = 3 * 60 * 1000;
const expectedSchemaDigests = Object.freeze({
  "ThreadStartParams.json": "792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd",
  "TurnStartParams.json": "a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea",
  "ThreadStartResponse.json": "c8fb6bcd1e4fb5ead6b487f0f35a90d8f13c9272edd4285914012dda403a77d2",
  "ThreadTokenUsageUpdatedNotification.json": "aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2"
});

if (!/^[0-9a-f]{40}$/.test(launchRevision ?? "")) {
  throw new Error("TEMPLE_WI0091_LAUNCH_REVISION must be one exact commit");
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} failed during preflight`);
  return result.stdout.trim();
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function sha256(file) {
  return createHash("sha256").update(await fs.readFile(file)).digest("hex");
}

function modelList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.models)) return response.models;
  return Array.isArray(response) ? response : [];
}

function modelId(model) {
  return model?.model ?? model?.id ?? model?.slug ?? null;
}

function modelEfforts(model) {
  const values = model?.supportedReasoningEfforts ?? model?.supported_reasoning_efforts ?? model?.reasoningEfforts ?? [];
  return values.map((entry) => typeof entry === "string"
    ? entry
    : entry?.reasoningEffort ?? entry?.effort ?? entry?.value ?? null).filter(Boolean);
}

function containsExactResponse(value) {
  if (value === expectedResponse) return true;
  if (Array.isArray(value)) return value.some(containsExactResponse);
  if (value && typeof value === "object") return Object.values(value).some(containsExactResponse);
  return false;
}

function boundedError(error) {
  return {
    name: error?.name ?? "Error",
    reason_code: error?.reasonCode ?? "runner-failure",
    provider_rpc_code: Number.isInteger(error?.providerRpcCode) ? error.providerRpcCode : null,
    rejection_category: error?.rejectionCategory ?? null,
    provider_thread_id: error?.providerThreadId ?? null,
    canonical_task_id: error?.taskId ?? null,
    turn_started: error?.turnStarted === true,
    automatic_retry: false,
    raw_provider_error_retained: false
  };
}

async function protocolPreflight() {
  const cliVersion = run("codex", ["--version"]);
  if (cliVersion !== "codex-cli 0.151.0-alpha.7.2") throw new Error("installed Codex CLI version drifted");
  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0091-schema-"));
  try {
    run("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    const schemaDigests = {};
    for (const [name, expected] of Object.entries(expectedSchemaDigests)) {
      const observed = await sha256(path.join(schemaRoot, "v2", name));
      schemaDigests[name] = observed;
      if (observed !== expected) throw new Error(`installed App Server schema drifted: ${name}`);
    }
    const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: target });
    try {
      await connection.request("initialize", {
        clientInfo: { name: "temple-wi0091-preflight", title: "Temple WI-0091 Preflight", version: "0.1.0-alpha.29" },
        capabilities: { experimentalApi: false }
      });
      connection.notify("initialized", {});
      const models = modelList(await connection.request("model/list", {}));
      const luna = models.find((entry) => modelId(entry) === requestedModel);
      if (!luna || !modelEfforts(luna).includes(reasoningEffort)) {
        throw new Error("Luna Max is unavailable in the installed Provider model list");
      }
      return {
        pass: true,
        cli_version: cliVersion,
        schema_digests: schemaDigests,
        requested_model_available: true,
        requested_reasoning_available: true,
        generation_performed: false
      };
    } finally {
      await connection.close().catch(() => {});
    }
  } finally {
    await fs.rm(schemaRoot, { recursive: true, force: true });
  }
}

async function inspectResponse(threadId) {
  if (!threadId) return { checked: false, matched: false, raw_response_retained: false };
  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: target });
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-wi0091-review", title: "Temple WI-0091 Review", version: "0.1.0-alpha.29" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const response = await connection.request("thread/read", { threadId, includeTurns: true });
    return { checked: true, matched: containsExactResponse(response), raw_response_retained: false };
  } catch {
    return { checked: false, matched: false, raw_response_retained: false };
  } finally {
    await connection.close().catch(() => {});
  }
}

const startedAt = new Date().toISOString();
const started = Date.now();
const stateDirectory = resolveControlPlaneStateDirectory(target);
const config = defaultControlPlaneConfig();
let journal = null;
let provider = null;
let preflight = null;
let launch = null;
let launchError = null;
let terminalEvent = null;
let usageEvent = null;
let finalRecords = [];
let interruptRequested = false;
let timedOut = false;
let providerStatus = "not-started";

try {
  preflight = await protocolPreflight();
  journal = await openTelemetryJournal(stateDirectory, { maxEvents: config.retention.max_events, privacy: config.privacy });
  const registry = createProviderRegistry([repositoryProviderContract()]);
  provider = await startCodexAppServerProvider(target, journal, registry, {
    resumeThreads: false,
    reconnectMs: 60_000,
    launchTimeoutMs: 15_000
  });
  await provider.start();
  providerStatus = registry.get("codex-local")?.status ?? "unknown";
  if (providerStatus !== "ready") throw new Error("Provider did not become ready");

  launch = await provider.launchProviderOwnedTask({
    workItemId,
    positionId,
    actor: agentId,
    instruction: `Return exactly ${expectedResponse}. Do not use tools, modify files, access the network, or perform any other work.`,
    requestedModel,
    reasoningEffort,
    launchRevision,
    approvalPolicy: "never",
    sandboxMode: "readOnly",
    networkAccess: false
  });

  while (!terminalEvent && Date.now() - started < taskCeilingMs) {
    const records = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
    usageEvent = records.filter((record) => record.type === "org.temple.codex.usage.updated.v1").at(-1) ?? usageEvent;
    const observedTotal = usageEvent?.data?.usage?.total?.total_tokens;
    if (!interruptRequested && Number.isFinite(observedTotal) && observedTotal >= stopTokens) {
      const targetView = (await provider.agentCommandTargets()).find((entry) => entry.task_id === launch.task_id);
      if (targetView?.active_turn_id) {
        await provider.dispatchAgentCommand({
          operation: "interrupt",
          idempotency_key: `wi-0091-token-stop-${launch.task_id}`,
          task_id: launch.task_id,
          work_item_id: targetView.work_item_id,
          expected_provider_thread_id: targetView.provider_thread_id,
          expected_task_status: targetView.task_status,
          expected_work_item_state: targetView.work_item_state,
          expected_active_turn_id: targetView.active_turn_id
        });
        interruptRequested = true;
      }
    }
    terminalEvent = records.find((record) => record.type === "org.temple.codex.turn.completed.v1") ?? null;
    if (!terminalEvent) await sleep(250);
  }

  if (!terminalEvent) {
    timedOut = true;
    const targetView = (await provider.agentCommandTargets()).find((entry) => entry.task_id === launch.task_id);
    if (!interruptRequested && targetView?.active_turn_id) {
      await provider.dispatchAgentCommand({
        operation: "interrupt",
        idempotency_key: `wi-0091-time-stop-${launch.task_id}`,
        task_id: launch.task_id,
        work_item_id: targetView.work_item_id,
        expected_provider_thread_id: targetView.provider_thread_id,
        expected_task_status: targetView.task_status,
        expected_work_item_state: targetView.work_item_state,
        expected_active_turn_id: targetView.active_turn_id
      });
      interruptRequested = true;
    }
  }

  await sleep(2_000);
  finalRecords = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
  terminalEvent = finalRecords.find((record) => record.type === "org.temple.codex.turn.completed.v1") ?? terminalEvent;
  usageEvent = finalRecords.filter((record) => record.type === "org.temple.codex.usage.updated.v1").at(-1) ?? usageEvent;
} catch (error) {
  launchError = boundedError(error);
} finally {
  await provider?.stop().catch(() => {});
  await journal?.close().catch(() => {});
}

const responseCheck = await inspectResponse(launch?.provider_thread_id ?? launchError?.provider_thread_id ?? null);
const tasks = await readJson(path.join(target, ".ai-org", "project", "tasks.json"));
let task = (tasks.tasks ?? []).find((entry) => entry.id === launch?.task_id) ?? null;
const terminalStatus = terminalEvent?.data?.status ?? null;
const attribution = usageEvent?.data?.attribution ?? null;
const lastUsage = usageEvent?.data?.usage?.last ?? null;
const observedTotal = usageEvent?.data?.usage?.total?.total_tokens ?? lastUsage?.total_tokens ?? null;
const effectiveModel = task?.effective_model ?? launch?.effective_model ?? null;
const exactCorrelation = Boolean(
  launch?.task_id &&
  terminalStatus === "completed" &&
  usageEvent?.data?.project_id === projectId &&
  usageEvent?.data?.work_item_id === workItemId &&
  usageEvent?.data?.task_id === launch.task_id &&
  usageEvent?.data?.position_id === positionId &&
  usageEvent?.data?.agent_id === agentId &&
  usageEvent?.data?.scope_revision === launchRevision &&
  attribution?.provider_id === "codex-local" &&
  attribution?.attempt_id === launch.provider_turn_id &&
  Number.isFinite(observedTotal) && observedTotal > 0
);
const passed = Boolean(
  preflight?.pass && !launchError && responseCheck.matched && exactCorrelation &&
  !timedOut && !interruptRequested && String(effectiveModel).startsWith("gpt-5.6-")
);

if (task) {
  task = await updateTask(target, {
    taskId: task.id,
    status: passed ? "completed" : "attention",
    revision: launchRevision,
    effectiveModel,
    reasoningEffort: task.reasoning_effort ?? attribution?.reasoning_effort ?? reasoningEffort,
    serviceTier: task.service_tier ?? attribution?.service_tier ?? null,
    notes: "WI-0091 one-shot Token capture proof; instruction and response content not retained; automatic retry disabled.",
    actor: agentId
  });
}

process.stdout.write(`${JSON.stringify({
  schema_version: "temple.usage-capture-proof/v1",
  work_item_id: workItemId,
  classification: passed ? "pass" : launch?.task_id ? "partial" : "fail",
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  elapsed_milliseconds: Date.now() - started,
  launch_revision: launchRevision,
  preflight,
  execution_contract: {
    requested_model: requestedModel,
    reasoning_effort: reasoningEffort,
    approval_policy: "never",
    sandbox_mode: "read-only",
    network_access: false,
    maximum_launch_attempts: 1,
    maximum_turns: 1,
    automatic_retries: 0,
    warning_total_tokens: warningTokens,
    stop_total_tokens: stopTokens,
    task_ceiling_seconds: taskCeilingMs / 1000
  },
  observed: {
    provider_status_before_launch: providerStatus,
    task_id: launch?.task_id ?? launchError?.canonical_task_id ?? null,
    provider_thread_id: launch?.provider_thread_id ?? launchError?.provider_thread_id ?? null,
    provider_turn_id: launch?.provider_turn_id ?? null,
    terminal_status: terminalStatus,
    task_status: task?.status ?? null,
    requested_model: requestedModel,
    effective_model: effectiveModel,
    response_contract_checked: responseCheck.checked,
    response_contract_matched: responseCheck.matched,
    detailed_observation_received: Boolean(usageEvent),
    exact_correlation_passed: exactCorrelation,
    interrupt_requested: interruptRequested,
    timed_out: timedOut,
    automatic_retry_performed: false
  },
  usage: {
    input_tokens: lastUsage?.input_tokens ?? null,
    cached_input_tokens: lastUsage?.cached_input_tokens ?? null,
    output_tokens: lastUsage?.output_tokens ?? null,
    reasoning_output_tokens: lastUsage?.reasoning_output_tokens ?? null,
    total_tokens: lastUsage?.total_tokens ?? observedTotal,
    provider_cumulative_total_tokens: usageEvent?.data?.usage?.total?.total_tokens ?? null,
    observation_time: usageEvent?.time ?? null,
    monetary_cost: null,
    price_source: null
  },
  failure: launchError,
  privacy: {
    instruction_retained_in_telemetry: false,
    raw_response_retained: false,
    hidden_reasoning_retained: false,
    raw_provider_payload_retained: false
  },
  claims: {
    token_savings: false,
    monetary_savings: false,
    model_quality: false,
    routing_preference: false
  }
}, null, 2)}\n`);
