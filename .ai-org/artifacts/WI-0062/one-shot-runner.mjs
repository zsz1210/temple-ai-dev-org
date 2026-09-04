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

const target = "<LOCAL_HOME>/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot";
const launchRevision = "402fb3e97dfba0fd6531752cc1a9c453830db5e0";
const requestedModel = "gpt-5.6-luna";
const reasoningEffort = "max";
const taskCeilingMs = 15 * 60 * 1000;
const warningTokens = 40_000;
const stopTokens = 60_000;

function git(args) {
  const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Git inspection failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    return parsed?.project_id === "temple-instrumentation-pilot" &&
      parsed?.work_item_id === "WI-0002" &&
      parsed?.position === "developer" &&
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

async function inspectResponse(threadId) {
  if (!threadId) return { checked: false, matched: false };
  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: target });
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-pilot-review", title: "Temple Pilot Review", version: "0.1.0-alpha.27" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const response = await connection.request("thread/read", { threadId });
    return { checked: true, matched: responseContractMatches(response), raw_response_retained: false };
  } catch {
    return { checked: false, matched: false, raw_response_retained: false };
  } finally {
    await connection.close().catch(() => {});
  }
}

const startedAt = new Date().toISOString();
const started = Date.now();
const stateDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0062-state-"));
const dirtyBefore = git(["status", "--short"]);
const nonOrganizationBefore = git(["diff", "--name-only", "--", ".", ":(exclude).ai-org/**"]);
const config = defaultControlPlaneConfig();
const journal = await openTelemetryJournal(stateDirectory, {
  maxEvents: 500,
  privacy: config.privacy
});
const registry = createProviderRegistry([repositoryProviderContract()]);
const provider = await startCodexAppServerProvider(target, journal, registry, {
  resumeThreads: false,
  reconnectMs: 60_000,
  launchTimeoutMs: 15_000
});

let launch = null;
let launchError = null;
let terminalEvent = null;
let usageEvent = null;
let interruptRequested = false;
let warningObserved = false;
let timedOut = false;

try {
  await provider.start();
  process.stderr.write(`${JSON.stringify({ phase: "provider-ready", provider: registry.get("codex-local")?.status ?? "unknown" })}\n`);
  launch = await provider.launchProviderOwnedTask({
    workItemId: "WI-0002",
    positionId: "developer",
    actor: "agent-casey",
    instruction: `Return only compact JSON with project_id temple-instrumentation-pilot, work_item_id WI-0002, position developer, and launch_revision ${launchRevision}. Do not use tools, modify files, access the network, or perform any other work.`,
    requestedModel,
    reasoningEffort,
    launchRevision,
    approvalPolicy: "never",
    sandboxMode: "readOnly",
    networkAccess: false
  });
  process.stderr.write(`${JSON.stringify({ phase: "turn-started", task_id: launch.task_id, turn_id: launch.provider_turn_id })}\n`);

  while (!terminalEvent && Date.now() - started < taskCeilingMs) {
    const records = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
    const usages = records.filter((record) => record.type === "org.temple.codex.usage.updated.v1");
    if (usages.length) usageEvent = usages.at(-1);
    const totalTokens = usageEvent?.data?.usage?.total?.total_tokens;
    if (!warningObserved && Number.isFinite(totalTokens) && totalTokens >= warningTokens) {
      warningObserved = true;
      process.stderr.write(`${JSON.stringify({ phase: "token-warning", total_tokens: totalTokens })}\n`);
    }
    if (!interruptRequested && Number.isFinite(totalTokens) && totalTokens >= stopTokens) {
      const targetView = (await provider.agentCommandTargets()).find((entry) => entry.task_id === launch.task_id);
      if (targetView?.active_turn_id) {
        await provider.dispatchAgentCommand({
          operation: "interrupt",
          idempotency_key: `wi-0062-token-stop-${launch.task_id}`,
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
        idempotency_key: `wi-0062-time-stop-${launch.task_id}`,
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
  const finalRecords = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
  terminalEvent = finalRecords.find((record) => record.type === "org.temple.codex.turn.completed.v1") ?? terminalEvent;
  usageEvent = finalRecords.filter((record) => record.type === "org.temple.codex.usage.updated.v1").at(-1) ?? usageEvent;
} catch (error) {
  launchError = boundedError(error);
} finally {
  await provider.stop().catch(() => {});
  await journal.close().catch(() => {});
}

const responseCheck = await inspectResponse(launch?.provider_thread_id ?? launchError?.provider_thread_id ?? null);
const tasks = await readJson(path.join(target, ".ai-org/project/tasks.json"));
let task = (tasks.tasks ?? []).find((entry) => entry.id === launch?.task_id) ?? null;
const totalTokens = usageEvent?.data?.usage?.total?.total_tokens ?? null;
const observedModel = launch?.effective_model ??
  (usageEvent?.data?.attribution?.model_source === "provider-event" ? usageEvent.data.attribution.model : null);
const terminalStatus = terminalEvent?.data?.status ?? null;
const taskStatus = terminalStatus === "completed" && !timedOut ? "completed" : task ? "attention" : null;

if (task && taskStatus) {
  task = await updateTask(target, {
    taskId: task.id,
    status: taskStatus,
    revision: launchRevision,
    effectiveModel: observedModel,
    reasoningEffort,
    serviceTier: usageEvent?.data?.attribution?.service_tier ?? null,
    notes: `WI-0062 one-shot result; raw instruction and response not retained; automatic retry disabled.`,
    actor: "agent-casey"
  });
}

const attribution = usageEvent?.data?.attribution ?? null;
const minimumCorrelation = Boolean(
  launch?.task_id &&
  terminalEvent &&
  usageEvent?.data?.project_id === "temple-instrumentation-pilot" &&
  usageEvent?.data?.work_item_id === "WI-0002" &&
  usageEvent?.data?.task_id === launch.task_id &&
  usageEvent?.data?.position_id === "developer" &&
  usageEvent?.data?.agent_id === "agent-casey" &&
  usageEvent?.data?.scope_revision === launchRevision &&
  attribution?.provider_id === "codex-local" &&
  attribution?.attempt_id === launch.provider_turn_id &&
  attribution?.reasoning_effort === reasoningEffort &&
  Number.isFinite(totalTokens) && totalTokens > 0 &&
  observedModel &&
  usageEvent?.time &&
  usageEvent?.source
);

const dirtyAfter = git(["status", "--short"]);
const nonOrganizationAfter = git(["diff", "--name-only", "--", ".", ":(exclude).ai-org/**"]);
const classification = launchError
  ? "fail"
  : minimumCorrelation && terminalStatus === "completed" && responseCheck.matched && !nonOrganizationAfter
    ? "pass"
    : launch?.task_id
      ? "partial"
      : "fail";

const completedAt = new Date().toISOString();
const result = {
  schema_version: "temple.live-instrumentation-observation/v1",
  coordinator_work_item_id: "WI-0062",
  target_work_item_id: "WI-0002",
  classification,
  started_at: startedAt,
  completed_at: completedAt,
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
    warning_total_tokens: warningTokens,
    stop_total_tokens: stopTokens,
    task_ceiling_minutes: 15
  },
  prelaunch: {
    codex_cli: "0.151.0-alpha.7.2",
    thread_start_schema_sha256: "792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd",
    turn_start_schema_sha256: "a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea",
    combined_v2_schema_sha256: "2442b15801bc019ad55987ad03e0f0ae60c51417825b9b6d708db640e6c2651c",
    model_list_confirmed: true,
    luna_max_confirmed: true,
    provider_status_before_launch: launch ? "ready" : registry.get("codex-local")?.status ?? "unknown"
  },
  observed: {
    launch_attempts: 1,
    turn_started: Boolean(launch?.provider_turn_id),
    canonical_task_id: launch?.task_id ?? launchError?.canonical_task_id ?? null,
    provider_thread_id: launch?.provider_thread_id ?? launchError?.provider_thread_id ?? null,
    provider_turn_id: launch?.provider_turn_id ?? null,
    terminal_status: terminalStatus,
    task_status: task?.status ?? null,
    interrupt_requested: interruptRequested,
    timed_out: timedOut,
    warning_observed: warningObserved,
    automatic_retry_performed: false,
    response_contract_checked: responseCheck.checked,
    response_contract_matched: responseCheck.matched,
    raw_response_retained: false,
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
    observed_model: observedModel,
    model_source: attribution?.model_source ?? null,
    reasoning_effort: attribution?.reasoning_effort ?? null,
    service_tier: attribution?.service_tier ?? null,
    observation_time: usageEvent?.time ?? null,
    provenance: usageEvent?.source ?? null,
    minimum_correlation_passed: minimumCorrelation,
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
  temporary_state_directory: stateDirectory
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
