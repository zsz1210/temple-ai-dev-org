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
import { openTelemetryJournal } from "../../../src/telemetry.mjs";
import { updateTask } from "../../../src/tasks.mjs";

const target = "/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot";
const projectId = "temple-instrumentation-pilot";
const coordinatorWorkItemId = "WI-0064";
const targetWorkItemId = "WI-0003";
const positionId = "developer";
const agentId = "agent-casey";
const launchRevision = "8e575dcc9d336a4d1aef622e740d103e5a0c271c";
const requestedModel = "gpt-5.6-luna";
const reasoningEffort = "max";
const taskCeilingMs = 15 * 60 * 1000;
const warningTokens = 40_000;
const stopTokens = 60_000;
const expectedSchemaDigests = Object.freeze({
  "ThreadStartParams.json": "792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd",
  "TurnStartParams.json": "a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea",
  "ThreadStartResponse.json": "c8fb6bcd1e4fb5ead6b487f0f35a90d8f13c9272edd4285914012dda403a77d2",
  "ModelReroutedNotification.json": "37cd3c1b3a3560b85b01d4061a07d830fc9ed93b80e4663f975f9197cdb501ef",
  "ThreadTokenUsageUpdatedNotification.json": "aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2"
});

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} failed during preflight`);
  }
  return result.stdout.trim();
}

function git(args) {
  return run("git", ["-C", target, ...args]);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function sha256(file) {
  return createHash("sha256").update(await fs.readFile(file)).digest("hex");
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

function exactResponseCandidate(value) {
  if (typeof value !== "string") return false;
  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");
  if (first < 0 || last <= first) return false;
  try {
    const parsed = JSON.parse(value.slice(first, last + 1));
    return parsed?.project_id === projectId &&
      parsed?.work_item_id === targetWorkItemId &&
      parsed?.position === positionId &&
      parsed?.launch_revision === launchRevision;
  } catch {
    return false;
  }
}

function responseContractMatches(value) {
  if (exactResponseCandidate(value)) return true;
  if (Array.isArray(value)) return value.some(responseContractMatches);
  if (value && typeof value === "object") return Object.values(value).some(responseContractMatches);
  return false;
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
  const values = model?.supportedReasoningEfforts ??
    model?.supported_reasoning_efforts ??
    model?.reasoningEfforts ??
    [];
  return values.map((entry) => typeof entry === "string"
    ? entry
    : entry?.reasoningEffort ?? entry?.effort ?? entry?.value ?? null).filter(Boolean);
}

async function protocolPreflight() {
  const cliVersion = run("codex", ["--version"]);
  if (cliVersion !== "codex-cli 0.151.0-alpha.7.2") {
    throw new Error("installed Codex CLI version drifted");
  }
  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0064-schema-"));
  run("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
  const digests = {};
  for (const [name, expected] of Object.entries(expectedSchemaDigests)) {
    const observed = await sha256(path.join(schemaRoot, "v2", name));
    digests[name] = observed;
    if (observed !== expected) throw new Error(`installed App Server schema drifted: ${name}`);
  }

  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: target });
  try {
    await connection.request("initialize", {
      clientInfo: {
        name: "temple-wi0064-preflight",
        title: "Temple WI-0064 Preflight",
        version: "0.1.0-alpha.27"
      },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const models = modelList(await connection.request("model/list", {}));
    const luna = models.find((entry) => modelId(entry) === requestedModel);
    const efforts = modelEfforts(luna);
    if (!luna || !efforts.includes(reasoningEffort)) {
      throw new Error("Luna Max is unavailable in the installed Provider model list");
    }
    return {
      pass: true,
      cli_version: cliVersion,
      schema_digests: digests,
      model_count: models.length,
      requested_model_available: true,
      requested_reasoning_available: true,
      generation_performed: false
    };
  } finally {
    await connection.close().catch(() => {});
  }
}

async function inspectResponse(threadId) {
  if (!threadId) return { checked: false, matched: false, raw_response_retained: false };
  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: target });
  try {
    await connection.request("initialize", {
      clientInfo: {
        name: "temple-wi0064-review",
        title: "Temple WI-0064 Review",
        version: "0.1.0-alpha.27"
      },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const response = await connection.request("thread/read", { threadId });
    return {
      checked: true,
      matched: responseContractMatches(response),
      raw_response_retained: false
    };
  } catch {
    return { checked: false, matched: false, raw_response_retained: false };
  } finally {
    await connection.close().catch(() => {});
  }
}

const startedAt = new Date().toISOString();
const started = Date.now();
const stateDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0064-state-"));
const durableTelemetryPath = path.join(target, ".ai-org", "artifacts", targetWorkItemId, "telemetry-events.jsonl");
const dirtyBefore = git(["status", "--short"]);
const nonOrganizationBefore = git(["diff", "--name-only", "--", ".", ":(exclude).ai-org/**"]);
let preflight = null;
let launch = null;
let launchError = null;
let terminalEvent = null;
let usageEvent = null;
let interruptRequested = false;
let warningObserved = false;
let timedOut = false;
let registryStatus = "not-started";
let finalRecords = [];
let provider = null;
let journal = null;

try {
  preflight = await protocolPreflight();
  const config = defaultControlPlaneConfig();
  journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 500,
    privacy: config.privacy
  });
  const registry = createProviderRegistry([repositoryProviderContract()]);
  provider = await startCodexAppServerProvider(target, journal, registry, {
    resumeThreads: false,
    reconnectMs: 60_000,
    launchTimeoutMs: 15_000
  });
  await provider.start();
  registryStatus = registry.get("codex-local")?.status ?? "unknown";
  if (registryStatus !== "ready") throw new Error("Provider did not become ready");

  launch = await provider.launchProviderOwnedTask({
    workItemId: targetWorkItemId,
    positionId,
    actor: agentId,
    instruction: `Return only compact JSON naming project_id ${projectId}, work_item_id ${targetWorkItemId}, position ${positionId}, and launch_revision ${launchRevision}. Do not use tools, modify files, access the network, or perform any other work.`,
    requestedModel,
    reasoningEffort,
    launchRevision,
    approvalPolicy: "never",
    sandboxMode: "readOnly",
    networkAccess: false
  });

  while (!terminalEvent && Date.now() - started < taskCeilingMs) {
    const records = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
    const usages = records.filter((record) => record.type === "org.temple.codex.usage.updated.v1");
    usageEvent = usages.at(-1) ?? usageEvent;
    const totalTokens = usageEvent?.data?.usage?.total?.total_tokens;
    if (!warningObserved && Number.isFinite(totalTokens) && totalTokens >= warningTokens) {
      warningObserved = true;
    }
    if (!interruptRequested && Number.isFinite(totalTokens) && totalTokens >= stopTokens) {
      const targetView = (await provider.agentCommandTargets()).find((entry) => entry.task_id === launch.task_id);
      if (targetView?.active_turn_id) {
        await provider.dispatchAgentCommand({
          operation: "interrupt",
          idempotency_key: `wi-0064-token-stop-${launch.task_id}`,
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
        idempotency_key: `wi-0064-time-stop-${launch.task_id}`,
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
  if (journal && launch?.task_id) {
    finalRecords = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
    terminalEvent = finalRecords.find((record) => record.type === "org.temple.codex.turn.completed.v1") ?? terminalEvent;
    usageEvent = finalRecords.filter((record) => record.type === "org.temple.codex.usage.updated.v1").at(-1) ?? usageEvent;
  }
  await journal?.close().catch(() => {});
}

await fs.mkdir(path.dirname(durableTelemetryPath), { recursive: true });
try {
  await fs.copyFile(path.join(stateDirectory, "journal", "events.jsonl"), durableTelemetryPath);
} catch {
  // The bounded result below remains authoritative when no journal was created.
}

const responseCheck = await inspectResponse(launch?.provider_thread_id ?? launchError?.provider_thread_id ?? null);
const tasks = await readJson(path.join(target, ".ai-org", "project", "tasks.json"));
let task = (tasks.tasks ?? []).find((entry) => entry.id === launch?.task_id) ?? null;
const totalTokens = usageEvent?.data?.usage?.total?.total_tokens ?? null;
const attribution = usageEvent?.data?.attribution ?? null;
const reroutes = finalRecords.filter((record) => record.type === "org.temple.codex.model.rerouted.v1");
const finalEffectiveModel = task?.effective_model ?? launch?.effective_model ?? null;
const acknowledgedReasoning = task?.reasoning_effort ?? attribution?.reasoning_effort ?? null;
const terminalStatus = terminalEvent?.data?.status ?? null;
const allowedModel = typeof finalEffectiveModel === "string" && finalEffectiveModel.startsWith("gpt-5.6-");
const reroutesAllowed = reroutes.every((record) => String(record.data?.to_model ?? "").startsWith("gpt-5.6-"));
const tokenWithinLimit = Number.isFinite(totalTokens) && totalTokens > 0 && totalTokens <= stopTokens;

const exactCorrelation = Boolean(
  launch?.task_id &&
  terminalEvent &&
  usageEvent?.data?.project_id === projectId &&
  usageEvent?.data?.work_item_id === targetWorkItemId &&
  usageEvent?.data?.task_id === launch.task_id &&
  usageEvent?.data?.position_id === positionId &&
  usageEvent?.data?.agent_id === agentId &&
  usageEvent?.data?.scope_revision === launchRevision &&
  attribution?.provider_id === "codex-local" &&
  attribution?.attempt_id === launch.provider_turn_id &&
  attribution?.model === finalEffectiveModel &&
  attribution?.model_source === "canonical-effective" &&
  acknowledgedReasoning === reasoningEffort &&
  attribution?.reasoning_effort === reasoningEffort &&
  tokenWithinLimit &&
  usageEvent?.time &&
  usageEvent?.source
);

const dirtyAfter = git(["status", "--short"]);
const nonOrganizationAfter = git(["diff", "--name-only", "--", ".", ":(exclude).ai-org/**"]);
const strictPass = Boolean(
  preflight?.pass &&
  !launchError &&
  terminalStatus === "completed" &&
  responseCheck.matched &&
  exactCorrelation &&
  allowedModel &&
  reroutesAllowed &&
  !timedOut &&
  !interruptRequested &&
  !nonOrganizationAfter
);

if (task) {
  task = await updateTask(target, {
    taskId: task.id,
    status: strictPass ? "completed" : "attention",
    revision: launchRevision,
    effectiveModel: finalEffectiveModel,
    reasoningEffort: acknowledgedReasoning,
    serviceTier: task.service_tier ?? attribution?.service_tier ?? null,
    notes: "WI-0064 one-shot revalidation; instruction and response content not retained; automatic retry disabled.",
    actor: agentId
  });
}

const result = {
  schema_version: "temple.live-instrumentation-observation/v1",
  coordinator_work_item_id: coordinatorWorkItemId,
  target_work_item_id: targetWorkItemId,
  classification: strictPass ? "pass" : launch?.task_id ? "partial" : "fail",
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  elapsed_milliseconds: Date.now() - started,
  execution_contract: {
    requested_model: requestedModel,
    reasoning_effort: reasoningEffort,
    approval_policy: "never",
    sandbox_mode: "read-only",
    network_access: false,
    maximum_launch_attempts: 1,
    maximum_turns: 1,
    automatic_retries: 0,
    fallback_models: [],
    warning_total_tokens: warningTokens,
    stop_total_tokens: stopTokens,
    task_ceiling_minutes: 15
  },
  preflight,
  observed: {
    launch_attempts: 1,
    turn_started: Boolean(launch?.provider_turn_id),
    canonical_task_id: launch?.task_id ?? launchError?.canonical_task_id ?? null,
    provider_thread_id: launch?.provider_thread_id ?? launchError?.provider_thread_id ?? null,
    provider_turn_id: launch?.provider_turn_id ?? null,
    terminal_status: terminalStatus,
    task_status: task?.status ?? null,
    provider_status_before_launch: registryStatus,
    interrupt_requested: interruptRequested,
    timed_out: timedOut,
    warning_observed: warningObserved,
    automatic_retry_performed: false,
    response_contract_checked: responseCheck.checked,
    response_contract_matched: responseCheck.matched,
    raw_response_retained: false,
    reroute_count: reroutes.length,
    reroutes: reroutes.map((record) => ({
      from_model: record.data?.from_model ?? null,
      to_model: record.data?.to_model ?? null,
      reason: record.data?.reason ?? null
    })),
    repository_status_before_lines: dirtyBefore ? dirtyBefore.split("\n").length : 0,
    repository_status_after_lines: dirtyAfter ? dirtyAfter.split("\n").length : 0,
    non_organization_changes_before: nonOrganizationBefore ? nonOrganizationBefore.split("\n") : [],
    non_organization_changes_after: nonOrganizationAfter ? nonOrganizationAfter.split("\n") : []
  },
  usage: {
    detailed_observation_received: Boolean(usageEvent),
    input_tokens: usageEvent?.data?.usage?.total?.input_tokens ?? null,
    cached_input_tokens: usageEvent?.data?.usage?.total?.cached_input_tokens ?? null,
    output_tokens: usageEvent?.data?.usage?.total?.output_tokens ?? null,
    reasoning_output_tokens: usageEvent?.data?.usage?.total?.reasoning_output_tokens ?? null,
    total_tokens: totalTokens,
    model_context_window: usageEvent?.data?.usage?.model_context_window ?? null,
    requested_model: requestedModel,
    observed_model: finalEffectiveModel,
    model_source: attribution?.model_source ?? null,
    reasoning_effort: attribution?.reasoning_effort ?? null,
    service_tier: attribution?.service_tier ?? null,
    observation_time: usageEvent?.time ?? null,
    provenance: usageEvent?.source ?? null,
    exact_correlation_passed: exactCorrelation,
    token_limit_passed: tokenWithinLimit,
    monetary_cost: null,
    price_source: null
  },
  failure: launchError,
  privacy: {
    instruction_retained_in_telemetry: false,
    hidden_reasoning_retained: false,
    raw_provider_payload_retained: false,
    company_or_production_data_used: false
  },
  claims: {
    token_savings: false,
    monetary_savings: false,
    model_quality: false,
    routing_preference: false,
    microservice_effectiveness: false,
    enterprise_readiness: false
  },
  durable_telemetry_path: durableTelemetryPath,
  temporary_state_directory: stateDirectory
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
