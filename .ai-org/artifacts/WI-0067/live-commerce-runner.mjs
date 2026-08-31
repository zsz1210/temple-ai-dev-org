import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import {
  createJsonRpcProcess,
  startCodexAppServerProvider
} from "../../../src/codex-app-server-provider.mjs";
import {
  createProviderRegistry,
  repositoryProviderContract
} from "../../../src/control-plane-providers.mjs";
import { defaultControlPlaneConfig } from "../../../src/control-plane-config.mjs";
import { formatJson, readJson } from "../../../src/files.mjs";
import { openTelemetryJournal } from "../../../src/telemetry.mjs";
import { updateTask } from "../../../src/tasks.mjs";
import {
  claimWorkItem,
  readWorkItem,
  releaseWorkItemClaim
} from "../../../src/work-items.mjs";
import {
  resolveValidationProgram,
  runValidationProgram
} from "../../../src/validation-program.mjs";

const execFile = promisify(execFileCallback);
const frameworkRoot = path.resolve(import.meta.dirname, "../../..");
const templeCli = path.join(frameworkRoot, "bin/temple.mjs");
const coordinatorRoot = "/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab/commerce-coordinator";
const allowedRoot = "/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab";
const manifestPath = ".ai-org/project/validation-program.json";
const expectedCliVersion = "codex-cli 0.151.0-alpha.7.2";
const expectedSchemaDigests = Object.freeze({
  "ThreadStartParams.json": "792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd",
  "TurnStartParams.json": "a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea",
  "ThreadStartResponse.json": "c8fb6bcd1e4fb5ead6b487f0f35a90d8f13c9272edd4285914012dda403a77d2",
  "ModelReroutedNotification.json": "37cd3c1b3a3560b85b01d4061a07d830fc9ed93b80e4663f975f9197cdb501ef",
  "ThreadTokenUsageUpdatedNotification.json": "aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2"
});
const actorByPosition = Object.freeze({
  product_manager: "agent-yuna",
  tech_lead: "agent-tidus",
  developer: "agent-rikku",
  independent_qa: "agent-lulu"
});

process.env.TEMPLE_CLI_PATH = templeCli;

async function command(executable, args, options = {}) {
  const result = await execFile(executable, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    ...options
  });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

async function git(root, args) {
  return command("git", ["-C", root, ...args], {
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0" }
  });
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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

async function protocolPreflight() {
  const version = (await command("codex", ["--version"])).stdout;
  if (version !== expectedCliVersion) throw new Error(`installed Codex CLI drifted: ${version}`);
  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0067-schema-"));
  const digests = {};
  try {
    await command("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    for (const [name, expected] of Object.entries(expectedSchemaDigests)) {
      const bytes = await fs.readFile(path.join(schemaRoot, "v2", name));
      const observed = sha256(bytes);
      digests[name] = observed;
      if (observed !== expected) throw new Error(`installed App Server schema drifted: ${name}`);
    }
  } finally {
    await fs.rm(schemaRoot, { recursive: true, force: true });
  }

  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: coordinatorRoot });
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-wi0067-preflight", title: "Temple WI-0067 Preflight", version: "0.1.0-alpha.27" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const models = modelList(await connection.request("model/list", {}));
    const luna = models.find((entry) => modelId(entry) === "gpt-5.6-luna");
    if (!luna || !modelEfforts(luna).includes("max")) throw new Error("Luna Max is unavailable in the installed Provider model list");
    return {
      pass: true,
      cli_version: version,
      schema_digests: digests,
      requested_model: "gpt-5.6-luna",
      requested_reasoning_effort: "max",
      model_count: models.length,
      generation_performed: false
    };
  } finally {
    await connection.close().catch(() => {});
  }
}

function statusPaths(output) {
  return output.split("\0").filter(Boolean).map((record) => record.slice(3)).filter(Boolean).sort();
}

function pathAllowed(candidate, allowed) {
  return allowed.some((rule) => candidate === rule || candidate.startsWith(`${rule}/`));
}

async function changedPaths(root) {
  return statusPaths((await git(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])).stdout);
}

async function ensureClaim(root, turn, actor, launchRevision) {
  const item = await readWorkItem(root, turn.work_item_id);
  if (item.owner_position !== turn.position_id) throw new Error(`${turn.id}: current Position is ${item.owner_position}, not ${turn.position_id}`);
  if (item.claim?.status === "active") {
    if (item.claim.agent_id !== actor) throw new Error(`${turn.id}: active claim belongs to ${item.claim.agent_id}`);
    return item.claim;
  }
  const claimed = await claimWorkItem(root, {
    workItemId: turn.work_item_id,
    agentId: actor,
    principalId: "human",
    baseRevision: launchRevision,
    branch: "main",
    worktree: root
  });
  return claimed.item.claim;
}

async function interruptActive(provider, launch, turn, reason) {
  const target = (await provider.agentCommandTargets()).find((entry) => entry.task_id === launch.task_id);
  if (!target?.active_turn_id) return false;
  const result = await provider.dispatchAgentCommand({
    operation: "interrupt",
    idempotency_key: `wi-0067-${turn.id}-${reason}-${launch.task_id}`,
    task_id: launch.task_id,
    work_item_id: target.work_item_id,
    expected_provider_thread_id: target.provider_thread_id,
    expected_task_status: target.task_status,
    expected_work_item_state: target.work_item_state,
    expected_active_turn_id: target.active_turn_id
  });
  return result.transport_status === "provider-accepted";
}

function finalUsage(records) {
  return records.filter((record) => record.type === "org.temple.codex.usage.updated.v1").at(-1) ?? null;
}

function terminal(records) {
  return records.filter((record) => record.type === "org.temple.codex.turn.completed.v1").at(-1) ?? null;
}

function reroutes(records) {
  return records.filter((record) => record.type === "org.temple.codex.model.rerouted.v1");
}

async function launchTurn({ turn, participant, instruction_path: instructionPath, signal, onUsage }) {
  const root = participant.root;
  const actor = actorByPosition[turn.position_id];
  if (!actor) throw new Error(`${turn.id}: no approved actor for ${turn.position_id}`);
  const launchRevision = (await git(root, ["rev-parse", "HEAD"])).stdout;
  await ensureClaim(root, turn, actor, launchRevision);
  const stateDirectory = path.join(root, participant.usage_state_directory ?? ".ai-org/runtime/control-plane");
  const config = defaultControlPlaneConfig();
  const journal = await openTelemetryJournal(stateDirectory, { maxEvents: 5000, privacy: config.privacy });
  const registry = createProviderRegistry([repositoryProviderContract()]);
  let provider = null;
  let launch = null;
  let latestUsage = null;
  let terminalEvent = null;
  let interruptRequested = false;
  let usageEventId = null;
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  process.stderr.write(`[${turn.id}] starting ${participant.id}:${turn.work_item_id} ${turn.position_id} @ ${launchRevision.slice(0, 8)}\n`);

  try {
    provider = await startCodexAppServerProvider(root, journal, registry, {
      resumeThreads: false,
      reconnectMs: 60000,
      launchTimeoutMs: 15000,
      commandTimeoutMs: 15000
    });
    await provider.start();
    if (registry.get("codex-local")?.status !== "ready") throw new Error(`${turn.id}: Provider did not become ready`);
    const instruction = await fs.readFile(instructionPath, "utf8");
    launch = await provider.launchProviderOwnedTask({
      workItemId: turn.work_item_id,
      positionId: turn.position_id,
      actor,
      instruction,
      requestedModel: turn.requested_model,
      reasoningEffort: turn.requested_reasoning_effort,
      launchRevision,
      approvalPolicy: "never",
      sandboxMode: turn.sandbox_mode === "workspace-write" ? "workspaceWrite" : "readOnly",
      networkAccess: false
    });
    if (launch.status !== "turn-started" || !launch.provider_turn_id) throw Object.assign(new Error(`${turn.id}: Provider did not start the turn`), { code: launch.rejection_code ?? "turn-not-started" });

    while (!terminalEvent) {
      const records = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
      const usage = finalUsage(records);
      if (usage && usage.id !== usageEventId) {
        usageEventId = usage.id;
        latestUsage = usage;
        await onUsage(usage.data?.usage?.total ?? { total_tokens: 0 });
      }
      terminalEvent = terminal(records);
      if (!terminalEvent && signal.aborted && !interruptRequested) {
        interruptRequested = await interruptActive(provider, launch, turn, "bounded-stop");
      }
      if (!terminalEvent) await sleep(400);
    }
    await sleep(1000);
    const finalRecords = journal.readAfter(0).records.filter((record) => record.data?.task_id === launch.task_id);
    terminalEvent = terminal(finalRecords) ?? terminalEvent;
    latestUsage = finalUsage(finalRecords) ?? latestUsage;
    if (latestUsage) await onUsage(latestUsage.data?.usage?.total ?? { total_tokens: 0 });
    if (signal.aborted) throw Object.assign(new Error(String(signal.reason?.message ?? "bounded-stop")), { code: signal.reason?.message ?? "bounded-stop" });
    if (terminalEvent?.data?.status !== "completed") throw Object.assign(new Error(`${turn.id}: terminal status ${terminalEvent?.data?.status ?? "missing"}`), { code: "turn-terminal-not-completed" });
    if (!latestUsage) throw Object.assign(new Error(`${turn.id}: detailed usage observation missing`), { code: "usage-observation-missing" });

    const attribution = latestUsage.data?.attribution ?? {};
    const effectiveModel = launch.effective_model ?? attribution.model ?? turn.requested_model;
    const correlation = latestUsage.data?.project_id === participant.expected_project_id &&
      latestUsage.data?.work_item_id === turn.work_item_id &&
      latestUsage.data?.task_id === launch.task_id &&
      latestUsage.data?.position_id === turn.position_id &&
      latestUsage.data?.agent_id === actor &&
      latestUsage.data?.scope_revision === launchRevision &&
      attribution.provider_id === "codex-local" &&
      attribution.attempt_id === launch.provider_turn_id;
    if (!correlation) throw Object.assign(new Error(`${turn.id}: usage correlation mismatch`), { code: "usage-correlation-mismatch" });
    const observedReroutes = reroutes(finalRecords);
    if (!String(effectiveModel).startsWith("gpt-5.6-") || observedReroutes.some((event) => !String(event.data?.to_model ?? "").startsWith("gpt-5.6-"))) {
      throw Object.assign(new Error(`${turn.id}: model left the gpt-5.6 family`), { code: "model-family-drift" });
    }

    const testResult = await command("npm", ["test"], { cwd: root, timeout: 300000, env: { ...process.env, CI: "1" } });
    const task = await updateTask(root, {
      taskId: launch.task_id,
      status: "completed",
      revision: launchRevision,
      effectiveModel,
      requestedReasoningEffort: launch.requested_reasoning_effort,
      observedThreadReasoningEffort: launch.observed_thread_reasoning_effort,
      effectiveTurnReasoningEffort: launch.effective_turn_reasoning_effort,
      serviceTier: launch.service_tier,
      notes: "WI-0067 bounded local rehearsal; zero retry; raw instruction and response content not copied into telemetry evidence.",
      actor
    });
    await releaseWorkItemClaim(root, {
      workItemId: turn.work_item_id,
      agentId: actor,
      principalId: "human",
      reason: "provider-turn-completed"
    });

    const observationPath = path.join(root, ".ai-org/artifacts", turn.work_item_id, "live-turn-observation.json");
    const total = latestUsage.data?.usage?.total ?? {};
    const observation = {
      schema_version: "temple.live-commerce-turn-observation/v1",
      program_id: "commerce-rehearsal-2026-08-31",
      turn_id: turn.id,
      project_id: participant.expected_project_id,
      work_item_id: turn.work_item_id,
      position_id: turn.position_id,
      agent_id: actor,
      launch_revision: launchRevision,
      canonical_task_id: launch.task_id,
      provider_thread_id: launch.provider_thread_id,
      provider_turn_id: launch.provider_turn_id,
      terminal_status: terminalEvent.data.status,
      requested_model: turn.requested_model,
      effective_model: effectiveModel,
      requested_reasoning_effort: turn.requested_reasoning_effort,
      observed_thread_reasoning_effort: launch.observed_thread_reasoning_effort ?? null,
      effective_turn_reasoning_effort: launch.effective_turn_reasoning_effort ?? null,
      reasoning_effort_source: task.reasoning_effort_source,
      service_tier: launch.service_tier ?? null,
      usage: {
        input_tokens: total.input_tokens ?? null,
        cached_input_tokens: total.cached_input_tokens ?? null,
        output_tokens: total.output_tokens ?? null,
        reasoning_output_tokens: total.reasoning_output_tokens ?? null,
        total_tokens: total.total_tokens ?? null,
        monetary_cost: null,
        price_source: null
      },
      tests: { command: "npm test", status: "pass", output_retained: false },
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      elapsed_ms: Date.now() - startedMs,
      automatic_retry: false,
      fallback_used: false,
      interrupt_requested: interruptRequested,
      raw_instruction_retained: false,
      raw_response_retained: false,
      claims: {
        monetary_cost: false,
        savings: false,
        model_superiority: false,
        enterprise_readiness: false,
        release_approval: false
      }
    };
    await fs.writeFile(observationPath, formatJson(observation), "utf8");

    const changed = await changedPaths(root);
    const disallowed = changed.filter((candidate) => !pathAllowed(candidate, turn.allowed_paths));
    if (disallowed.length > 0) throw Object.assign(new Error(`${turn.id}: disallowed changed paths: ${disallowed.join(", ")}`), { code: "path-allowlist-violation" });
    await git(root, ["add", "-A"]);
    await git(root, ["commit", "-m", `${turn.work_item_id}: complete ${turn.id}`]);
    const afterRevision = (await git(root, ["rev-parse", "HEAD"])).stdout;
    const remaining = await changedPaths(root);
    if (remaining.length > 0) throw Object.assign(new Error(`${turn.id}: repository remained dirty after commit`), { code: "dirty-turn-end" });
    process.stderr.write(`[${turn.id}] completed ${total.total_tokens ?? 0} tokens -> ${afterRevision.slice(0, 8)}\n`);
    return {
      status: "completed",
      usage: total,
      task_id: launch.task_id,
      launch_revision: launchRevision,
      after_revision: afterRevision,
      effective_model: effectiveModel,
      requested_reasoning_effort: turn.requested_reasoning_effort,
      observed_thread_reasoning_effort: launch.observed_thread_reasoning_effort ?? null,
      effective_turn_reasoning_effort: launch.effective_turn_reasoning_effort ?? null,
      test_status: testResult.stderr ? "pass-with-stderr" : "pass"
    };
  } finally {
    await provider?.stop().catch(() => {});
    await journal.close().catch(() => {});
  }
}

const preflight = await protocolPreflight();
process.stderr.write(`[preflight] ${preflight.cli_version}; Luna Max available; schema digests pinned; no generation\n`);
if (process.argv.includes("--preflight-only")) {
  process.stdout.write(`${JSON.stringify({ schema_version: "temple.live-commerce-preflight/v1", ...preflight }, null, 2)}\n`);
  process.exit(0);
}
const resolved = await resolveValidationProgram(coordinatorRoot, { manifestPath, allowedRoot });
const result = await runValidationProgram({ resolved, launchTurn });
const output = {
  schema_version: "temple.live-commerce-program-result/v1",
  preflight,
  manifest_digest: resolved.manifest_digest,
  state_path: result.statePath,
  events_path: result.eventsPath,
  resumed: result.resumed,
  state: result.state
};
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
if (result.state.status !== "completed") process.exitCode = 2;
