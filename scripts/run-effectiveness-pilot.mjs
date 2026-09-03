#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import { pathToFileURL } from "node:url";

import { buildCodexRuntimeRequestResponse, createJsonRpcProcess } from "../src/codex-app-server-provider.mjs";
import { isolateWave5CodexEnvironment, normalizeTokenUsage, terminalFailure } from "../src/app-server-protocol-replay.mjs";

const execFile = promisify(execFileCallback);
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const artifactRoot = path.join(repositoryRoot, ".ai-org/artifacts/WI-0130");
const historicalSetup = path.join(repositoryRoot, ".ai-org/artifacts/WI-0107/setup-wave-5a.mjs");
const historicalRunner = path.join(repositoryRoot, ".ai-org/artifacts/WI-0107/run-wave-5a.mjs");
const protocol = await readJson(path.join(artifactRoot, "pilot-protocol.json"));

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

async function command(executable, args, options = {}) {
  try {
    const result = await execFile(executable, args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...options
    });
    return { exit_code: 0, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  } catch (error) {
    if (Number.isInteger(error.code)) {
      return {
        exit_code: error.code,
        stdout: String(error.stdout ?? "").trim(),
        stderr: String(error.stderr ?? "").trim()
      };
    }
    throw error;
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value, { exclusive = false } = {}) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
    ...(exclusive ? { flag: "wx" } : {})
  });
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function pathExists(candidate) {
  return fs.access(candidate).then(() => true).catch(() => false);
}

async function git(root, args) {
  const result = await command("git", ["-C", root, ...args], {
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0" }
  });
  if (result.exit_code !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout;
}

async function productDigest(root) {
  const paths = (await git(root, ["ls-files", "TASK.md", "package.json", "src", "test"])).split("\n").filter(Boolean).sort();
  const digest = crypto.createHash("sha256");
  for (const relative of paths) {
    digest.update(relative);
    digest.update(Buffer.from([0]));
    digest.update(await fs.readFile(path.join(root, relative)));
    digest.update(Buffer.from([0]));
  }
  return digest.digest("hex");
}

function normalizedWorkItem(workItem) {
  const volatile = new Set(["created_at", "updated_at", "evaluated_at", "base_revision", "claim", "claims"]);
  function visit(value) {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !volatile.has(key))
      .map(([key, child]) => [key, visit(child)]));
  }
  return visit(workItem);
}

export function matchesPilotTempleProfile(workItem) {
  return workItem?.workflow_profile === "lean" && workItem?.scope_class === "bounded" && workItem?.risk_tier === "low";
}

async function templeTreatmentDigest(root) {
  const files = [
    "AGENTS.md",
    "TEMPLE.md",
    ".ai-org/project/assignments.json",
    ".ai-org/project/collaboration.json",
    ".ai-org/project/context-map.json",
    ".ai-org/project/execution-policy.json",
    ".ai-org/project/retrieval.json",
    ".ai-org/artifacts/WI-0001/work-order.md",
    ".ai-org/artifacts/WI-0001/approved-scope.md",
    ".ai-org/artifacts/WI-0001/technical-design.md",
    ".ai-org/artifacts/WI-0001/risk-review.md"
  ];
  const digest = crypto.createHash("sha256");
  for (const relative of files) {
    digest.update(relative);
    digest.update(Buffer.from([0]));
    digest.update(await fs.readFile(path.join(root, relative)));
    digest.update(Buffer.from([0]));
  }
  const workItem = normalizedWorkItem(await readJson(path.join(root, ".ai-org/work-items/WI-0001.json")));
  digest.update(".ai-org/work-items/WI-0001.json\0");
  digest.update(JSON.stringify(workItem));
  return digest.digest("hex");
}

function fixedRoot(labRoot) {
  return path.join(labRoot, "fixed");
}

function adaptiveRoot(labRoot) {
  return path.join(labRoot, "adaptive");
}

async function routeObservation(requestFile) {
  const result = await command(process.execPath, [path.join(repositoryRoot, "templew.mjs"), "execution", "resolve", repositoryRoot, "--request", requestFile, "--json"], { cwd: repositoryRoot });
  if (result.exit_code !== 0) throw new Error(result.stderr || `route resolution failed for ${requestFile}`);
  return JSON.parse(result.stdout);
}

function routeSummary(route) {
  const step = route?.steps?.[0];
  return {
    status: step?.selection?.status ?? null,
    mode: step?.selection?.mode ?? null,
    authority: step?.selection?.authority ?? null,
    rule_id: step?.selection?.rule_id ?? null,
    profile_id: step?.selected?.profile_id ?? null,
    model: step?.selected?.requested?.model ?? null,
    reasoning_effort: step?.selected?.requested?.reasoning_effort ?? null,
    effective_status: step?.selected?.effective?.status ?? null
  };
}

function validateApproval(value) {
  const expected = protocol.limits;
  const problems = [];
  const exact = {
    schema_version: "temple.effectiveness-pilot-approval/v1",
    work_item_id: "WI-0130",
    approved_by: "repository-owner",
    automatic_credit_reload_disabled: true,
    purchased_credits_authorized: false,
    usage_reset_authorized: false,
    included_pro_allowance_accepted: true,
    approved_candidate_turns: expected.candidate_turns,
    approved_evaluator_turns: expected.evaluator_turns,
    approved_candidate_operational_tokens: expected.candidate_aggregate_hard_operational_tokens,
    approved_evaluator_operational_tokens: expected.evaluator_hard_operational_tokens,
    approved_combined_operational_tokens: expected.combined_hard_operational_tokens,
    approved_program_wall_clock_ms: expected.program_hard_ms,
    max_retries: 0,
    fallback_allowed: false,
    network_access: false
  };
  for (const [key, expectedValue] of Object.entries(exact)) {
    if (value?.[key] !== expectedValue) problems.push(`${key}: expected ${JSON.stringify(expectedValue)}`);
  }
  if (typeof value?.approved_at !== "string" || Number.isNaN(Date.parse(value.approved_at))) problems.push("approved_at: expected an ISO timestamp");
  return { accepted: problems.length === 0, problems };
}

async function readApproval(file) {
  if (!file || !await pathExists(file)) return { accepted: false, problems: ["owner approval record is absent"], value: null };
  const value = await readJson(file);
  return { ...validateApproval(value), value };
}

async function compatibilityApproval(labRoot, approval) {
  const file = path.join(labRoot, "coordinator/compatibility-approval.json");
  await writeJson(file, {
    ...approval,
    schema_version: "temple.wave-5b-account-approval/v1"
  });
  return file;
}

async function callHistoricalSetup(labRoot, armProtocolPath) {
  const result = await command(process.execPath, [historicalSetup, "--lab-root", labRoot, "--protocol-path", armProtocolPath], { cwd: repositoryRoot });
  if (result.exit_code !== 0) throw new Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

async function setup(labRoot) {
  if (await pathExists(labRoot)) throw new Error(`refusing to replace existing pilot lab: ${labRoot}`);
  const fixed = await callHistoricalSetup(fixedRoot(labRoot), path.join(artifactRoot, "fixed-arm-protocol.json"));
  const adaptive = await callHistoricalSetup(adaptiveRoot(labRoot), path.join(artifactRoot, "adaptive-arm-protocol.json"));
  const fixedMap = await readJson(path.join(fixedRoot(labRoot), "coordinator/candidate-map.json"));
  const adaptiveMap = await readJson(path.join(adaptiveRoot(labRoot), "coordinator/candidate-map.json"));
  const candidates = [
    ...fixedMap.participants.map((entry) => ({ ...entry, condition_id: entry.condition === "minimal" ? "conventional-fixed" : "temple-fixed", arm_lab: "fixed" })),
    ...adaptiveMap.participants.map((entry) => ({ ...entry, condition_id: "temple-adaptive", arm_lab: "adaptive" }))
  ];
  await writeJson(path.join(labRoot, "coordinator/candidate-map.json"), {
    schema_version: "temple.effectiveness-pilot-candidate-map/v1",
    protocol_id: protocol.protocol_id,
    candidates
  }, { exclusive: true });
  const output = {
    schema_version: "temple.effectiveness-pilot-setup/v1",
    lab_root: labRoot,
    candidate_count: candidates.length,
    fixed_candidate_count: fixed.candidates.length,
    adaptive_candidate_count: adaptive.candidates.length,
    model_generation_performed: false
  };
  await writeJson(path.join(labRoot, "coordinator/setup-observation.json"), output, { exclusive: true });
  return output;
}

async function candidateChecks(labRoot) {
  const mapping = await readJson(path.join(labRoot, "coordinator/candidate-map.json"));
  const checks = [];
  for (const candidate of mapping.candidates) {
    const clean = (await git(candidate.root, ["status", "--porcelain=v1"])) === "";
    const revision = await git(candidate.root, ["rev-parse", "HEAD"]);
    checks.push({ id: `clean:${candidate.id}`, pass: clean && revision === candidate.revision, expected_revision: candidate.revision, observed_revision: revision });
    if (candidate.condition_id === "temple-fixed" || candidate.condition_id === "temple-adaptive") {
      const workItem = await readJson(path.join(candidate.root, ".ai-org/work-items/WI-0001.json"));
      checks.push({
        id: `lean-profile:${candidate.condition_id}:${candidate.case_id}`,
        pass: matchesPilotTempleProfile(workItem),
        expected: { workflow_profile: "lean", scope_class: "bounded", risk_tier: "low" },
        observed: { workflow_profile: workItem.workflow_profile ?? null, scope_class: workItem.scope_class ?? null, risk_tier: workItem.risk_tier ?? null }
      });
    }
  }
  for (const caseDefinition of protocol.cases) {
    const sameCase = mapping.candidates.filter((entry) => entry.case_id === caseDefinition.id);
    const productDigests = await Promise.all(sameCase.map(async (entry) => ({ condition_id: entry.condition_id, digest: await productDigest(entry.root) })));
    checks.push({ id: `matched-product:${caseDefinition.id}`, pass: new Set(productDigests.map((entry) => entry.digest)).size === 1, digests: productDigests });
    const fixed = sameCase.find((entry) => entry.condition_id === "temple-fixed");
    const adaptive = sameCase.find((entry) => entry.condition_id === "temple-adaptive");
    const treatmentDigests = [
      { condition_id: "temple-fixed", digest: await templeTreatmentDigest(fixed.root) },
      { condition_id: "temple-adaptive", digest: await templeTreatmentDigest(adaptive.root) }
    ];
    checks.push({ id: `matched-temple-process:${caseDefinition.id}`, pass: treatmentDigests[0].digest === treatmentDigests[1].digest, digests: treatmentDigests });
  }
  return checks;
}

async function historicalPreflight(armRoot, armProtocolPath, compatibilityApprovalPath, outputPath) {
  const args = [
    historicalRunner,
    "--lab-root", armRoot,
    "--protocol-path", armProtocolPath,
    "--work-item-id", "WI-0130",
    "--approval-path", compatibilityApprovalPath ?? path.join(armRoot, "coordinator/missing-approval.json"),
    "--preflight-output", outputPath,
    "--preflight-only"
  ];
  const result = await command(process.execPath, args, { cwd: repositoryRoot });
  const observation = await readJson(outputPath);
  return { result, observation };
}

async function preflight(labRoot, approvalPath) {
  const approval = await readApproval(approvalPath);
  const compatibilityPath = approval.accepted ? await compatibilityApproval(labRoot, approval.value) : null;
  const [fixedRoute, adaptiveRoute] = await Promise.all([
    routeObservation(".ai-org/artifacts/WI-0130/execution-request-fixed.json"),
    routeObservation(".ai-org/artifacts/WI-0130/execution-request-adaptive.json")
  ]);
  const fixedSummary = routeSummary(fixedRoute);
  const adaptiveSummary = routeSummary(adaptiveRoute);
  const routeChecks = [
    { id: "fixed-route", pass: fixedSummary.status === "resolved" && fixedSummary.mode === "pinned" && fixedSummary.profile_id === "standard" && fixedSummary.model === "gpt-5.6-terra" && fixedSummary.reasoning_effort === "medium" && fixedSummary.effective_status === "unobserved", observed: fixedSummary },
    { id: "adaptive-route", pass: adaptiveSummary.status === "resolved" && adaptiveSummary.mode === "advisory" && adaptiveSummary.profile_id === "lightweight-quality" && adaptiveSummary.model === "gpt-5.6-luna" && adaptiveSummary.reasoning_effort === "max" && adaptiveSummary.effective_status === "unobserved", observed: adaptiveSummary }
  ];
  const checks = [...await candidateChecks(labRoot), ...routeChecks];
  const fixedOutput = path.join(labRoot, "fixed/coordinator/wi0130-preflight.json");
  const adaptiveOutput = path.join(labRoot, "adaptive/coordinator/wi0130-preflight.json");
  const fixed = await historicalPreflight(fixedRoot(labRoot), path.join(artifactRoot, "fixed-arm-protocol.json"), compatibilityPath, fixedOutput);
  const adaptive = await historicalPreflight(adaptiveRoot(labRoot), path.join(artifactRoot, "adaptive-arm-protocol.json"), compatibilityPath, adaptiveOutput);
  const inheritedBlockers = [
    ...fixed.observation.blockers.filter((entry) => entry !== "owner-confirmation-required"),
    ...adaptive.observation.blockers.filter((entry) => entry !== "owner-confirmation-required")
  ];
  if (fixed.result.exit_code !== 0) inheritedBlockers.push("fixed-preflight-command-failed");
  if (adaptive.result.exit_code !== 0) inheritedBlockers.push("adaptive-preflight-command-failed");
  const offlinePass = checks.every((entry) => entry.pass) && inheritedBlockers.length === 0;
  const blockers = [...new Set([
    ...inheritedBlockers,
    ...checks.filter((entry) => !entry.pass).map((entry) => entry.id),
    ...(approval.accepted ? [] : ["exact-owner-approval-required"])
  ])];
  const output = {
    schema_version: "temple.effectiveness-pilot-preflight/v1",
    generated_at: new Date().toISOString(),
    offline_pass: offlinePass,
    generation_ready: offlinePass && approval.accepted,
    model_generation_performed: false,
    blockers,
    approval: { accepted: approval.accepted, problems: approval.problems },
    checks,
    provider_checks: {
      fixed: fixed.observation,
      adaptive: adaptive.observation
    }
  };
  await writeJson(path.join(labRoot, "coordinator/preflight-observation.json"), output);
  return output;
}

async function runArm(armRoot, armProtocolPath, compatibilityApprovalPath) {
  return command(process.execPath, [
    historicalRunner,
    "--lab-root", armRoot,
    "--protocol-path", armProtocolPath,
    "--work-item-id", "WI-0130",
    "--approval-path", compatibilityApprovalPath,
    "--preflight-output", path.join(armRoot, "coordinator/live-preflight.json")
  ], { cwd: repositoryRoot, timeout: protocol.limits.program_hard_ms });
}

async function runLive(labRoot, approvalPath) {
  const before = await preflight(labRoot, approvalPath);
  if (!before.generation_ready) throw new Error(`generation blocked: ${before.blockers.join(", ")}`);
  const compatibilityPath = path.join(labRoot, "coordinator/compatibility-approval.json");
  const fixed = await runArm(fixedRoot(labRoot), path.join(artifactRoot, "fixed-arm-protocol.json"), compatibilityPath);
  if (fixed.exit_code !== 0) throw new Error(`fixed arm stopped: ${fixed.stderr || fixed.stdout}`);
  const adaptive = await runArm(adaptiveRoot(labRoot), path.join(artifactRoot, "adaptive-arm-protocol.json"), compatibilityPath);
  if (adaptive.exit_code !== 0) throw new Error(`adaptive arm stopped: ${adaptive.stderr || adaptive.stdout}`);
  const output = {
    schema_version: "temple.effectiveness-pilot-run/v1",
    generated_at: new Date().toISOString(),
    status: "candidate-matrix-completed",
    fixed: JSON.parse(fixed.stdout),
    adaptive: JSON.parse(adaptive.stdout),
    evaluator_pending: true,
    retry_count: 0,
    fallback_count: 0
  };
  await writeJson(path.join(labRoot, "coordinator/run-result.json"), output);
  return output;
}

const evaluatorSchema = {
  type: "object",
  additionalProperties: false,
  required: ["packages", "summary"],
  properties: {
    packages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["package_id", "case_id", "score", "decision", "critical_failure", "rationale"],
        properties: {
          package_id: { type: "string" },
          case_id: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 100 },
          decision: { type: "string", enum: ["pass", "reject"] },
          critical_failure: { type: ["string", "null"] },
          rationale: { type: "string" }
        }
      }
    },
    summary: { type: "string" }
  }
};

async function jsonFiles(root) {
  return (await fs.readdir(root)).filter((entry) => entry.endsWith(".json")).sort();
}

function sanitizeBlindPackage(value) {
  const forbidden = /condition|usage|token|latency|candidate_revision|repository_path|sealed_mapping|arm_mapping|agent|position|work_item/i;
  function visit(input) {
    if (Array.isArray(input)) return input.map(visit);
    if (!input || typeof input !== "object") return input;
    return Object.fromEntries(Object.entries(input).filter(([key]) => !forbidden.test(key)).map(([key, child]) => [key, visit(child)]));
  }
  const sanitized = visit(value);
  if (!sanitized.package_id || !sanitized.case_id || !sanitized.evidence_id) throw new Error("blind package identity is incomplete");
  return sanitized;
}

async function prepareEvaluatorInputs(labRoot) {
  const evaluatorRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0130-evaluator-"));
  const packages = [];
  const inputManifest = [];
  try {
    for (const arm of ["fixed", "adaptive"]) {
      const blindRoot = path.join(labRoot, arm, "coordinator/blind");
      for (const filename of await jsonFiles(blindRoot)) {
        const value = sanitizeBlindPackage(await readJson(path.join(blindRoot, filename)));
        packages.push(value);
      }
    }
    if (packages.length !== protocol.limits.candidate_turns) throw new Error(`expected six blind packages, received ${packages.length}`);
    packages.sort((left, right) => left.package_id.localeCompare(right.package_id));
    await fs.mkdir(path.join(evaluatorRoot, "inputs"), { recursive: true });
    for (const value of packages) {
      const relative = `inputs/${value.package_id}.json`;
      const text = `${JSON.stringify(value, null, 2)}\n`;
      await fs.writeFile(path.join(evaluatorRoot, relative), text, { flag: "wx", mode: 0o600 });
      inputManifest.push({ path: relative, sha256: sha256(text), kind: "arm-neutral-package" });
    }
    for (const caseDefinition of protocol.cases) {
      const relative = `inputs/rubric-${caseDefinition.id}.json`;
      const source = path.join(repositoryRoot, protocol.fixture_root, caseDefinition.id, "evaluator/rubric.json");
      const text = await fs.readFile(source, "utf8");
      await fs.writeFile(path.join(evaluatorRoot, relative), text, { flag: "wx", mode: 0o600 });
      inputManifest.push({ path: relative, sha256: sha256(text), kind: "frozen-rubric" });
    }
    return { evaluatorRoot, packages, inputManifest };
  } catch (error) {
    await fs.rm(evaluatorRoot, { recursive: true, force: true });
    throw error;
  }
}

function validateScores(scores, packages) {
  if (!scores || !Array.isArray(scores.packages)) throw new Error("evaluator scores are missing");
  const expected = new Map(packages.map((entry) => [entry.package_id, entry.case_id]));
  if (scores.packages.length !== expected.size) throw new Error("evaluator score count mismatch");
  const seen = new Set();
  for (const score of scores.packages) {
    if (seen.has(score.package_id)) throw new Error("duplicate evaluator package score");
    if (expected.get(score.package_id) !== score.case_id) throw new Error("evaluator score identity mismatch");
    if (!Number.isInteger(score.score) || score.score < 0 || score.score > 100) throw new Error("evaluator score outside 0..100");
    if (!["pass", "reject"].includes(score.decision)) throw new Error("invalid evaluator decision");
    seen.add(score.package_id);
  }
  return scores;
}

async function launchEvaluator(prepared) {
  const inputs = await Promise.all(prepared.inputManifest.map(async (entry) => ({
    ...entry,
    contents: JSON.parse(await fs.readFile(path.join(prepared.evaluatorRoot, entry.path), "utf8"))
  })));
  const prompt = [
    "Independently score every arm-neutral implementation package against its matching frozen rubric.",
    "Use only the supplied JSON. Do not infer workflow condition or compare resource use. A failed held-out acceptance test is a critical failure.",
    "Return one integer score from 0 through 100 for each package. The registered passing threshold is 85.",
    JSON.stringify({ inputs })
  ].join("\n\n");
  let connection;
  let threadId = null;
  let turnId = null;
  let terminal = null;
  let completionText = null;
  let usage = null;
  let violation = null;
  let acknowledgedModel = null;
  let observedThreadReasoningEffort = null;
  let resolveTerminal;
  const terminalPromise = new Promise((resolve) => { resolveTerminal = resolve; });
  async function interrupt(reason) {
    if (!violation) violation = reason;
    if (connection && threadId && turnId) await connection.request("turn/interrupt", { threadId, turnId }, 15000).catch(() => {});
  }
  connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], {
    cwd: prepared.evaluatorRoot,
    env: isolateWave5CodexEnvironment(process.env),
    onNotification(message) {
      const params = message.params ?? {};
      if (message.method === "thread/tokenUsage/updated" && (!turnId || params.turnId === turnId)) {
        usage = normalizeTokenUsage(params);
        const operational = usage ? usage.input_tokens - usage.cached_input_tokens + usage.output_tokens : null;
        if (operational !== null && operational > protocol.limits.evaluator_hard_operational_tokens) void interrupt("evaluator-operational-token-limit");
      }
      if (message.method === "item/started" && ["commandExecution", "fileChange", "mcpToolCall"].includes(params.item?.type)) void interrupt("evaluator-tool-use-forbidden");
      if (message.method === "item/completed" && params.item?.type === "agentMessage") completionText = params.item.text;
      if (message.method === "turn/completed" && (!turnId || params.turn?.id === turnId)) {
        terminal = params.turn;
        resolveTerminal();
      }
      if (message.method === "model/rerouted") void interrupt("evaluator-model-rerouted");
    },
    onRequest(message, responder) {
      if (["item/commandExecution/requestApproval", "item/fileChange/requestApproval", "item/permissions/requestApproval"].includes(message.method)) {
        try { responder.respond(buildCodexRuntimeRequestResponse(message.method, message.params, { decision: "decline" })); } catch {}
      }
      void interrupt("evaluator-request-forbidden");
    }
  });
  const timer = setTimeout(() => { void interrupt("evaluator-wall-clock-limit"); }, protocol.limits.evaluator_hard_ms);
  try {
    await connection.request("initialize", { clientInfo: { name: "temple-effectiveness-evaluator", title: "Temple Effectiveness Evaluator", version: "1" }, capabilities: { experimentalApi: false } });
    connection.notify("initialized", {});
    const thread = await connection.request("thread/start", {
      model: protocol.blind_evaluation.model,
      cwd: prepared.evaluatorRoot,
      approvalPolicy: "never",
      sandbox: "read-only",
      serviceName: "temple-wi0130-independent-evaluator",
      developerInstructions: "You are an independent blind evaluator. Use only supplied evidence, do not use tools, and return exactly the requested structured document.",
      baseInstructions: "Evaluate correctness and engineering quality only. Never infer process condition, model, cost, or timing.",
      allowProviderModelFallback: false,
      ephemeral: true
    });
    threadId = thread?.thread?.id;
    acknowledgedModel = thread?.model ?? null;
    observedThreadReasoningEffort = thread?.reasoningEffort ?? null;
    if (!threadId || acknowledgedModel !== protocol.blind_evaluation.model) throw new Error("evaluator thread did not acknowledge the pinned model");
    const turn = await connection.request("turn/start", {
      threadId,
      clientUserMessageId: "wi0130-independent-evaluation",
      input: [{ type: "text", text: prompt }],
      turnTrigger: "user",
      cwd: prepared.evaluatorRoot,
      approvalPolicy: "never",
      sandboxPolicy: { type: "readOnly", networkAccess: false },
      model: protocol.blind_evaluation.model,
      effort: protocol.blind_evaluation.reasoning_effort,
      outputSchema: evaluatorSchema
    });
    turnId = turn?.turn?.id;
    if (!turnId) throw new Error("evaluator turn did not start");
    await terminalPromise;
    if (violation) throw new Error(violation);
    const failure = terminalFailure(terminal);
    if (failure) throw new Error(`${failure.code}: ${failure.message}`);
    if (!usage) throw new Error("evaluator detailed Token usage is missing");
    return {
      thread_id: threadId,
      turn_id: turnId,
      model: {
        requested_model: protocol.blind_evaluation.model,
        acknowledged_model: acknowledgedModel,
        requested_reasoning_effort: protocol.blind_evaluation.reasoning_effort,
        observed_thread_reasoning_effort: observedThreadReasoningEffort,
        effective_turn_reasoning_effort: null,
        rerouted: false
      },
      usage,
      scores: validateScores(JSON.parse(completionText), prepared.packages)
    };
  } finally {
    clearTimeout(timer);
    await connection?.close().catch(() => {});
  }
}

async function readValidationState(armRoot, protocolId) {
  return readJson(path.join(armRoot, "coordinator/.ai-org/runtime/validation-program", protocolId, "state.json"));
}

function patchLineCount(patch) {
  return patch.split("\n").filter((line) => (line.startsWith("+") && !line.startsWith("+++")) || (line.startsWith("-") && !line.startsWith("---"))).length;
}

async function collectEvidence(labRoot, evaluator) {
  const candidates = [];
  for (const [arm, protocolFile] of [["fixed", "fixed-arm-protocol.json"], ["adaptive", "adaptive-arm-protocol.json"]]) {
    const armProtocol = await readJson(path.join(artifactRoot, protocolFile));
    const state = await readValidationState(path.join(labRoot, arm), armProtocol.protocol_id);
    const sealedRoot = path.join(labRoot, arm, "coordinator/sealed");
    for (const filename of await jsonFiles(sealedRoot)) {
      const sealed = await readJson(path.join(sealedRoot, filename));
      const blind = await readJson(path.join(labRoot, arm, "coordinator/blind", filename));
      const score = evaluator.scores.packages.find((entry) => entry.package_id === sealed.package_id);
      const turn = state.turns[sealed.turn_id];
      const conditionId = arm === "adaptive" ? "temple-adaptive" : sealed.condition_id === "minimal" ? "conventional-fixed" : "temple-fixed";
      candidates.push({
        case_id: sealed.case_id,
        condition_id: conditionId,
        package_id: sealed.package_id,
        public_tests: blind.tests.public,
        acceptance_tests: blind.tests.acceptance,
        blind_score: score.score,
        blind_decision: score.decision,
        operational_tokens: sealed.usage.input_tokens - sealed.usage.cached_input_tokens + sealed.usage.output_tokens,
        gross_tokens: sealed.usage.total_tokens,
        latency_ms: sealed.latency_ms,
        changed_lines: patchLineCount(blind.product_patch),
        changed_paths: turn.changed_paths,
        disk_growth_bytes: turn.disk_delta_bytes,
        retry_count: 0,
        fallback_count: 0,
        intervention_count: 0,
        path_violation_count: 0,
        model: sealed.model
      });
    }
  }
  candidates.sort((left, right) => `${left.case_id}/${left.condition_id}`.localeCompare(`${right.case_id}/${right.condition_id}`));
  return {
    schema_version: "temple.effectiveness-pilot-evidence/v1",
    work_item_id: "WI-0130",
    generated_at: new Date().toISOString(),
    candidates,
    evaluator: {
      model: evaluator.model,
      usage: evaluator.usage,
      retry_count: 0,
      fallback_count: 0,
      input_manifest_digest: evaluator.input_manifest_digest
    },
    effective_reasoning_effort_observed: false,
    billed_cost_known: false
  };
}

async function evaluateLive(labRoot, approvalPath) {
  const approval = await readApproval(approvalPath);
  if (!approval.accepted) throw new Error(`evaluation blocked: ${approval.problems.join(", ")}`);
  const runResult = await readJson(path.join(labRoot, "coordinator/run-result.json"));
  if (runResult.status !== "candidate-matrix-completed") throw new Error("candidate matrix is not complete");
  const prepared = await prepareEvaluatorInputs(labRoot);
  try {
    const result = await launchEvaluator(prepared);
    const frozen = {
      schema_version: "temple.effectiveness-pilot-scores/v1",
      work_item_id: "WI-0130",
      frozen_at: new Date().toISOString(),
      input_manifest_digest: sha256(JSON.stringify(prepared.inputManifest)),
      evaluator_thread_id: result.thread_id,
      packages: result.scores.packages,
      summary: result.scores.summary
    };
    await writeJson(path.join(labRoot, "coordinator/quality-scores-frozen.json"), frozen, { exclusive: true });
    result.input_manifest_digest = frozen.input_manifest_digest;
    const evidence = await collectEvidence(labRoot, result);
    await writeJson(path.join(labRoot, "coordinator/effectiveness-evidence.json"), evidence, { exclusive: true });
    const output = {
      schema_version: "temple.effectiveness-pilot-evaluator-result/v1",
      status: "completed",
      scores_frozen: true,
      mapping_unsealed_after_freeze: true,
      evaluator: { thread_id: result.thread_id, turn_id: result.turn_id, model: result.model, usage: result.usage },
      evidence_path: path.join(labRoot, "coordinator/effectiveness-evidence.json"),
      automatic_retry: false,
      fallback_used: false
    };
    await writeJson(path.join(labRoot, "coordinator/evaluator-result.json"), output, { exclusive: true });
    return output;
  } finally {
    await fs.rm(prepared.evaluatorRoot, { recursive: true, force: true });
  }
}

async function main() {
  const mode = argument("--mode") ?? "preflight";
  const labArgument = argument("--lab-root");
  if (!labArgument) throw new Error("--lab-root is required");
  const labRoot = path.resolve(labArgument);
  const approvalPath = argument("--approval-path");
  let output;
  if (mode === "setup") output = await setup(labRoot);
  else if (mode === "preflight") output = await preflight(labRoot, approvalPath ? path.resolve(approvalPath) : null);
  else if (mode === "run") output = await runLive(labRoot, approvalPath ? path.resolve(approvalPath) : null);
  else if (mode === "evaluate") output = await evaluateLive(labRoot, approvalPath ? path.resolve(approvalPath) : null);
  else throw new Error(`unsupported --mode ${mode}`);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
