#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

import { measureContextEnvelope, validateAcceptanceContract } from "../src/context.mjs";
import {
  buildCodexRuntimeRequestResponse,
  createJsonRpcProcess
} from "../src/codex-app-server-provider.mjs";
import {
  isolateWave5CodexEnvironment,
  normalizeTokenUsage,
  parseStructuredCompletion,
  protocolViolationForMessage,
  terminalFailure,
  WAVE5_ALLOWED_COMMAND_PREFIXES,
  WAVE5_COMPLETION_SCHEMA,
  wave5ThreadIsolation
} from "../src/app-server-protocol-replay.mjs";
import { inspectGitRepository } from "../src/validation-program.mjs";
import { analyzeEffectivenessPilotV2, analyzeTerraAbConfirmationV1 } from "./analyze-effectiveness-pilot-v2.mjs";

const execFile = promisify(execFileCallback);
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const defaultProtocolPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0131/pilot-protocol-v2.json");

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

async function command(executable, args, options = {}) {
  try {
    const result = await execFile(executable, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
    return { status: 0, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  } catch (error) {
    if (Number.isInteger(error.code)) {
      return { status: error.code, stdout: String(error.stdout ?? "").trim(), stderr: String(error.stderr ?? "").trim() };
    }
    throw error;
  }
}

async function git(root, args) {
  const result = await command("git", ["-C", root, ...args], {
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_TERMINAL_PROMPT: "0" }
  });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value, { exclusive = false } = {}) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, ...(exclusive ? { flag: "wx" } : {}) });
}

async function regularFiles(root, relative = "") {
  const entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await regularFiles(root, child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

async function fixtureBundleDigest(fixtureRoot, caseId) {
  const files = await regularFiles(path.join(fixtureRoot, caseId));
  files.sort((left, right) => Buffer.compare(Buffer.from(`${caseId}/${left}`), Buffer.from(`${caseId}/${right}`)));
  const digest = crypto.createHash("sha256");
  for (const relative of files) {
    digest.update(`${caseId}/${relative}`);
    digest.update(Buffer.from([0]));
    digest.update(await fs.readFile(path.join(fixtureRoot, caseId, relative)));
    digest.update(Buffer.from([0]));
  }
  return digest.digest("hex");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stableValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stableValue);
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key]) ]));
}

function protocolDigest(protocol) {
  return sha256(JSON.stringify(stableValue(protocol)));
}

export function validatePilotProtocolV2(protocol) {
  const errors = [];
  if (protocol?.schema_version !== "temple.effectiveness-pilot/v2") errors.push("unsupported protocol schema");
  if (!/^WI-\d{4}$/.test(protocol?.work_item_id ?? "")) errors.push("work_item_id must be a durable WI identifier");
  const ids = protocol?.conditions?.map((entry) => entry.id) ?? [];
  if (new Set(ids).size !== 4 || ids.length !== 4) errors.push("exactly four unique conditions are required");
  const byId = new Map((protocol?.conditions ?? []).map((entry) => [entry.id, entry]));
  for (const id of ["conventional-terra", "temple-terra", "temple-luna", "temple-sol"]) {
    if (!byId.has(id)) errors.push(`missing condition ${id}`);
  }
  const conventional = byId.get("conventional-terra");
  const templeTerra = byId.get("temple-terra");
  const templeLuna = byId.get("temple-luna");
  const templeSol = byId.get("temple-sol");
  if (conventional && templeTerra && (conventional.model !== templeTerra.model || conventional.reasoning_effort !== templeTerra.reasoning_effort)) {
    errors.push("A and B must share model and reasoning effort");
  }
  if ([templeTerra, templeLuna, templeSol].some((entry) => entry?.process !== "temple-lean")) errors.push("B, C, and D must use the same Temple process");
  if (templeLuna && (templeLuna.model !== "gpt-5.6-luna" || templeLuna.reasoning_effort !== "max")) errors.push("C must be Luna max");
  if (templeSol && (templeSol.model !== "gpt-5.6-sol" || templeSol.reasoning_effort !== "xhigh")) errors.push("D must be Sol xhigh");
  if (!Array.isArray(protocol?.comparisons) || protocol.comparisons.length !== 3) errors.push("three isolated comparisons are required");
  if (!Array.isArray(protocol?.cases) || protocol.cases.length < 2) errors.push("at least two cases are required");
  for (const caseDefinition of protocol?.cases ?? []) {
    if (caseDefinition.condition_order?.length !== 4 || new Set(caseDefinition.condition_order).size !== 4 || caseDefinition.condition_order.some((id) => !byId.has(id))) {
      errors.push(`${caseDefinition.id ?? "case"} must schedule every condition exactly once`);
    }
  }
  if (protocol?.execution?.retry_count !== 0 || protocol?.execution?.fallback_count !== 0 || protocol?.execution?.network_access !== false) {
    errors.push("retry, fallback, and network boundaries are invalid");
  }
  if (protocol?.evaluation?.objective_held_out_tests_primary !== true) errors.push("objective held-out tests must be primary");
  if (protocol?.claims?.pure_model_effect !== false || protocol?.claims?.automatic_routing !== false) errors.push("claim boundaries are invalid");
  const limits = protocol?.execution ?? {};
  const numericLimits = [
    "candidate_operational_token_limit",
    "candidate_aggregate_operational_token_limit",
    "evaluator_operational_token_limit",
    "combined_operational_token_limit",
    "program_wall_clock_limit_ms"
  ];
  const liveLimitValues = numericLimits.map((field) => limits[field]);
  if (liveLimitValues.some((value) => value !== null && value !== undefined)) {
    for (const field of numericLimits) {
      if (!Number.isSafeInteger(limits[field]) || limits[field] <= 0) errors.push(`${field} must be a positive integer for a live protocol`);
    }
    if (Number.isSafeInteger(limits.candidate_operational_token_limit) && Number.isSafeInteger(limits.candidate_aggregate_operational_token_limit) &&
        limits.candidate_operational_token_limit * limits.candidate_turns < limits.candidate_aggregate_operational_token_limit) {
      errors.push("candidate aggregate limit exceeds the sum of per-candidate limits");
    }
    if (Number.isSafeInteger(limits.candidate_aggregate_operational_token_limit) && Number.isSafeInteger(limits.evaluator_operational_token_limit) &&
        limits.combined_operational_token_limit !== limits.candidate_aggregate_operational_token_limit + limits.evaluator_operational_token_limit) {
      errors.push("combined operational Token limit must equal candidate plus evaluator limits");
    }
    if (!protocol?.provider_contract?.codex_cli_version || !protocol?.provider_contract?.schema_digests || !Array.isArray(protocol?.provider_contract?.required_models)) {
      errors.push("live protocol requires an exact Provider contract");
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateTerraAbConfirmationProtocol(protocol) {
  const errors = [];
  if (protocol?.schema_version !== "temple.effectiveness-terra-ab/v1") errors.push("unsupported Terra A/B protocol schema");
  if (!/^WI-\d{4}$/.test(protocol?.work_item_id ?? "")) errors.push("work_item_id must be a durable WI identifier");
  if (protocol?.source_evidence?.work_item_id !== "WI-0132") errors.push("source evidence must identify WI-0132");
  for (const field of ["result_ref", "raw_evidence_sha256", "analysis_sha256", "frozen_scores_sha256"]) {
    if (typeof protocol?.source_evidence?.[field] !== "string" || !protocol.source_evidence[field]) {
      errors.push(`source_evidence.${field} is required`);
    }
  }

  const conditions = protocol?.conditions ?? [];
  const conditionIds = conditions.map((entry) => entry.id);
  if (conditions.length !== 2 || new Set(conditionIds).size !== 2) errors.push("exactly two unique conditions are required");
  const conventional = conditions.find((entry) => entry.id === "conventional-terra");
  const optimized = conditions.find((entry) => entry.id === "temple-terra-optimized");
  if (!conventional) errors.push("missing condition conventional-terra");
  if (!optimized) errors.push("missing condition temple-terra-optimized");
  if (conventional && optimized) {
    if (conventional.process !== "minimal-responsible" || optimized.process !== "temple-lean-optimized") {
      errors.push("conditions must isolate the conventional and optimized Temple processes");
    }
    if (conventional.model !== "gpt-5.6-terra" || optimized.model !== conventional.model || conventional.reasoning_effort !== "medium" || optimized.reasoning_effort !== conventional.reasoning_effort) {
      errors.push("both conditions must use Terra medium");
    }
  }

  const cases = protocol?.cases ?? [];
  if (cases.length !== 2 || new Set(cases.map((entry) => entry.id)).size !== 2) errors.push("exactly two unique corrected cases are required");
  for (const caseDefinition of cases) {
    if (caseDefinition.condition_order?.length !== 2 || new Set(caseDefinition.condition_order).size !== 2 || caseDefinition.condition_order.some((id) => !conditionIds.includes(id))) {
      errors.push(`${caseDefinition.id ?? "case"} must schedule both conditions exactly once`);
    }
    if (typeof caseDefinition.acceptance_contract !== "string" || !caseDefinition.acceptance_contract) {
      errors.push(`${caseDefinition.id ?? "case"} acceptance_contract is required`);
    }
  }

  const execution = protocol?.execution ?? {};
  if (execution.candidate_turns !== 4 || execution.evaluator_turns !== 1) errors.push("the confirmation requires four candidate turns and one evaluator turn");
  if (execution.retry_count !== 0 || execution.fallback_count !== 0 || execution.network_access !== false) {
    errors.push("retry, fallback, and network boundaries are invalid");
  }
  if (execution.generation_ready !== false || execution.fresh_provider_handshake_required !== true || execution.live_generation_requires_exact_approval !== true) {
    errors.push("the protocol must remain generation-disabled until a fresh handshake and exact approval");
  }
  for (const field of [
    "candidate_operational_token_limit",
    "candidate_aggregate_operational_token_limit",
    "evaluator_operational_token_limit",
    "combined_operational_token_limit",
    "program_wall_clock_limit_ms"
  ]) {
    if (!Number.isSafeInteger(execution[field]) || execution[field] <= 0) errors.push(`${field} must be a positive integer`);
  }
  if (Number.isSafeInteger(execution.candidate_operational_token_limit) && Number.isSafeInteger(execution.candidate_aggregate_operational_token_limit) &&
      execution.candidate_aggregate_operational_token_limit > execution.candidate_operational_token_limit * execution.candidate_turns) {
    errors.push("candidate aggregate limit exceeds the sum of per-candidate limits");
  }
  if (Number.isSafeInteger(execution.candidate_aggregate_operational_token_limit) && Number.isSafeInteger(execution.evaluator_operational_token_limit) &&
      execution.combined_operational_token_limit !== execution.candidate_aggregate_operational_token_limit + execution.evaluator_operational_token_limit) {
    errors.push("combined operational Token limit must equal candidate plus evaluator limits");
  }

  if (protocol?.evaluation?.objective_held_out_tests_primary !== true || protocol?.evaluation?.blind_review_secondary !== true || protocol?.evaluation?.score_freeze_before_mapping_unseal !== true) {
    errors.push("objective and blind evaluation controls are incomplete");
  }
  if (protocol?.decision_contract?.schema_version !== "temple.effectiveness-decision-input/v3") errors.push("the v3 decision contract is required");
  const thresholds = protocol?.decision_contract?.thresholds ?? {};
  for (const field of ["quality_non_inferiority_points", "meaningful_operational_token_reduction_percent", "meaningful_latency_reduction_percent"]) {
    if (!Number.isFinite(thresholds[field]) || thresholds[field] < 0) errors.push(`decision threshold ${field} is invalid`);
  }
  if (protocol?.claims?.automatic_routing !== false || protocol?.claims?.temple_superiority !== false || protocol?.claims?.statistical_qualification !== false || protocol?.claims?.provider_generation_performed !== false) {
    errors.push("claim boundaries are invalid");
  }
  return { valid: errors.length === 0, errors };
}

function validateExecutableProtocol(protocol) {
  return protocol?.schema_version === "temple.effectiveness-terra-ab/v1"
    ? validateTerraAbConfirmationProtocol(protocol)
    : validatePilotProtocolV2(protocol);
}

function isTempleProcess(processId) {
  return processId === "temple-lean" || processId === "temple-lean-optimized";
}

export function matchesNativeLeanCandidate(workItem) {
  return workItem?.workflow_profile === "lean" &&
    workItem?.profile_assessment?.scope_class === "bounded" &&
    workItem?.risk_tier === "low" &&
    workItem?.state === "build";
}

export function validatePilotApprovalV2(approval, protocol) {
  const errors = [];
  const exact = {
    schema_version: "temple.effectiveness-pilot-approval/v2",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocolDigest(protocol),
    approved_by: "repository-owner",
    included_pro_allowance_accepted: true,
    automatic_credit_reload_disabled: true,
    purchased_credits_authorized: false,
    usage_reset_authorized: false,
    approved_candidate_turns: protocol.execution.candidate_turns,
    approved_evaluator_turns: protocol.execution.evaluator_turns,
    max_retries: 0,
    fallback_allowed: false,
    network_access: false
  };
  for (const [key, expected] of Object.entries(exact)) if (approval?.[key] !== expected) errors.push(`${key} must equal ${JSON.stringify(expected)}`);
  const expectedModels = [...new Set(protocol.conditions.map((entry) => entry.model))].sort();
  if (JSON.stringify([...(approval?.approved_models ?? [])].sort()) !== JSON.stringify(expectedModels)) errors.push("approved_models must match all candidate routes");
  for (const field of [
    "approved_per_candidate_operational_tokens",
    "approved_candidate_operational_tokens",
    "approved_evaluator_operational_tokens",
    "approved_combined_operational_tokens",
    "approved_program_wall_clock_ms"
  ]) {
    if (!Number.isSafeInteger(approval?.[field]) || approval[field] <= 0) errors.push(`${field} must be a positive integer`);
  }
  const exactLimits = {
    approved_per_candidate_operational_tokens: protocol.execution.candidate_operational_token_limit,
    approved_candidate_operational_tokens: protocol.execution.candidate_aggregate_operational_token_limit,
    approved_evaluator_operational_tokens: protocol.execution.evaluator_operational_token_limit,
    approved_combined_operational_tokens: protocol.execution.combined_operational_token_limit,
    approved_program_wall_clock_ms: protocol.execution.program_wall_clock_limit_ms
  };
  for (const [field, expected] of Object.entries(exactLimits)) {
    if (approval?.[field] !== expected) errors.push(`${field} must equal protocol limit ${JSON.stringify(expected)}`);
  }
  if (Number.isSafeInteger(approval?.approved_per_candidate_operational_tokens) && Number.isSafeInteger(approval?.approved_candidate_operational_tokens) &&
      approval.approved_per_candidate_operational_tokens * protocol.execution.candidate_turns < approval.approved_candidate_operational_tokens) {
    errors.push("candidate aggregate limit exceeds the sum of per-candidate limits");
  }
  if (Number.isSafeInteger(approval?.approved_candidate_operational_tokens) && Number.isSafeInteger(approval?.approved_evaluator_operational_tokens) &&
      approval.approved_combined_operational_tokens !== approval.approved_candidate_operational_tokens + approval.approved_evaluator_operational_tokens) {
    errors.push("combined operational Token limit must equal candidate plus evaluator limits");
  }
  if (typeof approval?.approved_at !== "string" || Number.isNaN(Date.parse(approval.approved_at))) errors.push("approved_at must be an ISO timestamp");
  return { accepted: errors.length === 0, errors };
}

async function initializeGit(root, message) {
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.name", "Temple Experiment"]);
  await git(root, ["config", "user.email", "experiment@invalid.local"]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}

async function pinnedTemple(snapshotRoot, target, args) {
  const cli = path.join(snapshotRoot, "bin/temple.mjs");
  const targetIndex = ["work-item", "execution", "context"].includes(args[0]) ? 2 : 1;
  const result = await command(process.execPath, [cli, ...args.slice(0, targetIndex), target, ...args.slice(targetIndex)], {
    env: { ...process.env, TEMPLE_CLI_PATH: cli }
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}

function executionRequest(condition) {
  return {
    schema_version: "temple.execution-request/v1",
    work_item_id: "WI-0001",
    steps: [{
      step_id: "candidate-build",
      responsibility: "developer",
      task_shape: {
        position_id: "developer",
        lifecycle_stage: "build",
        task_kind: condition.task_kind,
        risk_class: "low",
        context_profile_digest: "sha256:pending-setup"
      },
      capability_route: { required: ["text.reasoning", "code.change"], optional: [] },
      constraints: {
        required_modalities: ["text"],
        allowed_provider_ids: ["openai-codex"],
        data_class: "internal",
        execution_boundary: "approved-provider",
        resource_limits: []
      },
      selection: condition.selection_mode === "pinned"
        ? { mode: "pinned", pinned_profile_id: condition.profile_id }
        : { mode: condition.selection_mode },
      resource_observations: []
    }]
  };
}

async function mapExperimentExecutionProfiles(root) {
  const policyPath = path.join(root, ".ai-org/project/execution-policy.json");
  const policy = await readJson(policyPath);
  const mappings = {
    "mechanical-fast": ["gpt-5.6-luna", "medium"],
    "lightweight-quality": ["gpt-5.6-luna", "max"],
    standard: ["gpt-5.6-terra", "medium"],
    "critical-planning": ["gpt-5.6-sol", "xhigh"]
  };
  for (const profile of policy.profiles) {
    const mapping = mappings[profile.id];
    if (!mapping) throw new Error(`experiment has no Provider mapping for profile ${profile.id}`);
    profile.provider_id = "openai-codex";
    [profile.model, profile.reasoning_effort] = mapping;
  }
  await writeJson(policyPath, policy);
}

function normalizedCapsule(value) {
  const copy = structuredClone(value);
  delete copy.generated_at;
  copy.revision = null;
  return copy;
}

async function prepareTempleCandidate({ root, caseDefinition, condition, contract, fixtureRoot, snapshotRoot }) {
  const configPath = path.join(fixtureRoot, caseDefinition.temple_init_path);
  const cli = path.join(snapshotRoot, "bin/temple.mjs");
  const initialized = await command(process.execPath, [cli, "init", root, "--config", configPath], { env: { ...process.env, TEMPLE_CLI_PATH: cli } });
  if (initialized.status !== 0) throw new Error(initialized.stderr || initialized.stdout);
  await mapExperimentExecutionProfiles(root);
  await pinnedTemple(snapshotRoot, root, ["work-item", "create",
    "--title", `Complete ${caseDefinition.id} fixture`,
    "--scope", "Complete only TASK.md and change only src/ and test/.",
    "--acceptance", "Satisfy TASK.md and ACCEPTANCE-CONTRACT.json with no out-of-scope writes.",
    "--affected-path", "src", "--affected-path", "test",
    "--spec-mode", "gate-evidence", "--ui-mode", "not-applicable",
    "--workflow-profile", "lean", "--risk-tier", "low", "--scope-class", "bounded",
    "--profile-rationale", "Frozen bounded local experiment case with explicit acceptance evidence.",
    "--profile-evidence", "ACCEPTANCE-CONTRACT.json", "--tracker-visibility", "internal"
  ]);
  const artifact = path.join(root, ".ai-org/artifacts/WI-0001");
  await fs.mkdir(artifact, { recursive: true });
  await fs.writeFile(path.join(artifact, "work-order.md"), "# Work order\n\nComplete TASK.md and the candidate-visible acceptance contract.\n");
  await fs.writeFile(path.join(artifact, "approved-scope.md"), "# Approved scope\n\nOnly src/ and test/ may change. Network, dependencies, retries, fallback models, deployment, and external actions are prohibited.\n");
  await fs.writeFile(path.join(artifact, "technical-design.md"), "# Technical design\n\nPreserve public contracts, make the smallest maintainable change, add focused tests, and run npm test.\n");
  await fs.writeFile(path.join(artifact, "risk-review.md"), "# Risk and profile review\n\nThe case is local, reversible, low-risk, and bounded. Protect every dimension in ACCEPTANCE-CONTRACT.json.\n");
  const baseRevision = await initializeGit(root, "Initialize native Lean Temple candidate");
  await pinnedTemple(snapshotRoot, root, ["work-item", "configure", "--work-item", "WI-0001", "--agent-id", "agent-rikku", "--base-revision", baseRevision, "--parallel-mode", "sequential"]);
  await pinnedTemple(snapshotRoot, root, ["transition", "--work-item", "WI-0001", "--to", "build",
    "--satisfy", "work_order=.ai-org/artifacts/WI-0001/work-order.md",
    "--satisfy", "approved_scope=.ai-org/artifacts/WI-0001/approved-scope.md",
    "--satisfy", "acceptance_criteria=ACCEPTANCE-CONTRACT.json",
    "--satisfy", "technical_design=.ai-org/artifacts/WI-0001/technical-design.md",
    "--satisfy", "risk_review=.ai-org/artifacts/WI-0001/risk-review.md",
    "--satisfy", "profile_eligibility=.ai-org/artifacts/WI-0001/risk-review.md"
  ]);
  const requestPath = path.join(artifact, "execution-request.json");
  await writeJson(requestPath, executionRequest(condition), { exclusive: true });
  const routeResult = await pinnedTemple(snapshotRoot, root, ["execution", "resolve", "--request", ".ai-org/artifacts/WI-0001/execution-request.json", "--json"]);
  await fs.rm(requestPath);
  await pinnedTemple(snapshotRoot, root, ["work-item", "claim", "--work-item", "WI-0001", "--agent-id", "agent-rikku", "--principal-id", "human", "--base-revision", baseRevision, "--branch", "main", "--worktree", root]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Prepare native Lean Developer work"]);
  const capsuleResult = await pinnedTemple(snapshotRoot, root, ["context", "resolve", "--work-item", "WI-0001", "--position", "developer", "--no-write", "--json"]);
  return { route: JSON.parse(routeResult), capsule: normalizedCapsule(JSON.parse(capsuleResult)), contract };
}

async function setup(protocol, labRoot, frameworkRevision) {
  if (!/^[0-9a-f]{7,40}$/i.test(frameworkRevision ?? "")) throw new Error("--framework-revision must be an explicit Git commit");
  await fs.access(labRoot).then(() => { throw new Error(`refusing to replace existing lab ${labRoot}`); }).catch((error) => {
    if (error.message?.startsWith("refusing")) throw error;
    if (error.code !== "ENOENT") throw error;
  });
  const fixtureRoot = path.join(repositoryRoot, protocol.fixture_root);
  const snapshotRoot = path.join(labRoot, "framework-snapshot");
  const candidateRoot = path.join(labRoot, "candidates");
  const coordinatorRoot = path.join(labRoot, "coordinator");
  await fs.mkdir(candidateRoot, { recursive: true });
  await fs.mkdir(coordinatorRoot, { recursive: true });
  const archive = path.join(labRoot, "framework.tar");
  const archived = await command("git", ["-C", repositoryRoot, "archive", "--format=tar", `--output=${archive}`, frameworkRevision]);
  if (archived.status !== 0) throw new Error(archived.stderr || "framework archive failed");
  await fs.mkdir(snapshotRoot, { recursive: true });
  const extracted = await command("tar", ["-xf", archive, "-C", snapshotRoot]);
  if (extracted.status !== 0) throw new Error(extracted.stderr || "framework extraction failed");
  await fs.rm(archive);
  await fs.symlink(path.join(repositoryRoot, "node_modules"), path.join(snapshotRoot, "node_modules"), "dir");

  const conditions = new Map(protocol.conditions.map((entry) => [entry.id, entry]));
  const candidates = [];
  let index = 0;
  for (const caseDefinition of protocol.cases) {
    const contract = await readJson(path.join(repositoryRoot, caseDefinition.acceptance_contract));
    const contractValidation = validateAcceptanceContract(contract);
    if (!contractValidation.ready) throw new Error(`${caseDefinition.id} acceptance contract is not ready: ${[...contractValidation.errors, ...contractValidation.blockers].join("; ")}`);
    for (const conditionId of caseDefinition.condition_order) {
      index += 1;
      const condition = conditions.get(conditionId);
      const directory = `${String(index).padStart(2, "0")}-${caseDefinition.id}-${conditionId}`;
      const root = path.join(candidateRoot, directory);
      await fs.cp(path.join(fixtureRoot, caseDefinition.id, "starter"), root, { recursive: true, errorOnExist: true, force: false });
      await writeJson(path.join(root, "ACCEPTANCE-CONTRACT.json"), contract, { exclusive: true });
      await fs.appendFile(path.join(root, "TASK.md"), "\n## Explicit acceptance contract\n\nRead and satisfy `ACCEPTANCE-CONTRACT.json`; coordinator-held tests enforce only its specified dimensions.\n");
      await fs.writeFile(path.join(root, ".gitignore"), ".DS_Store\n*.log\n", { flag: "wx" });
      let treatment;
      if (isTempleProcess(condition.process)) {
        treatment = await prepareTempleCandidate({ root, caseDefinition, condition, contract, fixtureRoot, snapshotRoot });
      } else {
        await fs.copyFile(path.join(fixtureRoot, "minimal-AGENTS.md"), path.join(root, "AGENTS.md"));
        await initializeGit(root, "Initialize responsible conventional candidate");
        treatment = { route: null, capsule: null, contract };
      }
      const context = measureContextEnvelope({
        "product-task": await fs.readFile(path.join(root, "TASK.md"), "utf8"),
        "acceptance-contract": contract,
        "candidate-instructions": await fs.readFile(path.join(root, "AGENTS.md"), "utf8"),
        "routed-context": treatment.capsule
      });
      candidates.push({
        id: `candidate-${String(index).padStart(2, "0")}`,
        directory,
        root,
        case_id: caseDefinition.id,
        condition_id: condition.id,
        condition: condition.process === "minimal-responsible" ? "minimal" : "temple",
        model: condition.model,
        reasoning_effort: condition.reasoning_effort,
        expected_profile_id: condition.profile_id,
        route: treatment.route,
        context,
        revision: await git(root, ["rev-parse", "HEAD"])
      });
    }
  }
  const map = {
    schema_version: "temple.effectiveness-pilot-candidate-map/v2",
    protocol_id: protocol.protocol_id,
    protocol_sha256: protocolDigest(protocol),
    framework_revision: await git(repositoryRoot, ["rev-parse", frameworkRevision]),
    participants: candidates
  };
  await writeJson(path.join(coordinatorRoot, "candidate-map.json"), map, { exclusive: true });
  const output = { schema_version: "temple.effectiveness-pilot-setup/v2", lab_root: labRoot, candidate_count: candidates.length, model_generation_performed: false };
  await writeJson(path.join(coordinatorRoot, "setup-observation.json"), output, { exclusive: true });
  return output;
}

function routeSummary(route) {
  const step = route?.steps?.[0];
  return {
    status: step?.selection?.status ?? null,
    profile_id: step?.selected?.profile_id ?? null,
    model: step?.selected?.requested?.model ?? null,
    reasoning_effort: step?.selected?.requested?.reasoning_effort ?? null,
    provider_contact: route?.authority?.provider_contact ?? null,
    automatic_execution: route?.authority?.automatic_execution ?? null
  };
}

function modelsFrom(result) {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.models)) return result.models;
  return Array.isArray(result) ? result : [];
}

function modelId(model) {
  return model?.model ?? model?.id ?? model?.slug ?? null;
}

function modelEfforts(model) {
  const values = model?.supportedReasoningEfforts ?? model?.supported_reasoning_efforts ?? model?.reasoningEfforts ?? [];
  return values.map((entry) => typeof entry === "string" ? entry : entry?.reasoningEffort ?? entry?.effort ?? entry?.value).filter(Boolean);
}

async function providerHandshake(protocol, coordinatorRoot) {
  const contract = protocol.provider_contract;
  if (!contract) {
    return {
      pass: false,
      blockers: ["provider-contract-required"],
      model_generation_performed: false
    };
  }
  const checks = [];
  const blockers = [];
  const version = (await command("codex", ["--version"])).stdout;
  checks.push({ id: "codex-cli-version", pass: version === contract.codex_cli_version, expected: contract.codex_cli_version, observed: version });
  if (version !== contract.codex_cli_version) blockers.push("codex-cli-version-drift");

  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-effectiveness-v2-schema-"));
  const schemaDigests = {};
  try {
    const generated = await command("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    if (generated.status !== 0) throw new Error(`schema generation failed: ${generated.stderr}`);
    for (const [name, expected] of Object.entries(contract.schema_digests)) {
      const observed = sha256(await fs.readFile(path.join(schemaRoot, "v2", name)));
      schemaDigests[name] = observed;
      const pass = observed === expected;
      checks.push({ id: `app-server-schema:${name}`, pass, expected, observed });
      if (!pass) blockers.push(`app-server-schema-drift:${name}`);
    }
  } finally {
    await fs.rm(schemaRoot, { recursive: true, force: true });
  }

  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], {
    cwd: coordinatorRoot,
    env: isolateWave5CodexEnvironment(process.env)
  });
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-effectiveness-v2-preflight", title: "Temple Effectiveness V2 Preflight", version: "1" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const models = modelsFrom(await connection.request("model/list", {}));
    for (const required of contract.required_models) {
      const model = models.find((entry) => modelId(entry) === required.model);
      const supported = new Set(modelEfforts(model));
      const missing = required.reasoning_efforts.filter((effort) => !supported.has(effort));
      const pass = Boolean(model) && missing.length === 0;
      checks.push({ id: `model:${required.model}`, pass, required_reasoning_efforts: required.reasoning_efforts, observed_reasoning_efforts: [...supported], missing });
      if (!pass) blockers.push(`model-unavailable:${required.model}`);
    }
  } finally {
    await connection.close().catch(() => {});
  }
  return {
    schema_version: "temple.effectiveness-provider-handshake/v1",
    observed_at: new Date().toISOString(),
    pass: blockers.length === 0,
    blockers,
    checks,
    cli_version: version,
    schema_digests: schemaDigests,
    model_generation_performed: false
  };
}

async function preflight(protocol, labRoot, approvalPath) {
  const map = await readJson(path.join(labRoot, "coordinator/candidate-map.json"));
  const fixtureRoot = path.join(repositoryRoot, protocol.fixture_root);
  const checks = [{
    id: "protocol-digest",
    pass: map.protocol_sha256 === protocolDigest(protocol),
    expected: protocolDigest(protocol),
    observed: map.protocol_sha256
  }];
  for (const caseDefinition of protocol.cases) {
    const observed = await fixtureBundleDigest(fixtureRoot, caseDefinition.id);
    checks.push({ id: `fixture-bundle:${caseDefinition.id}`, pass: observed === caseDefinition.bundle_sha256, expected: caseDefinition.bundle_sha256, observed });
  }
  for (const [id, source] of [["launch-instruction", protocol.launch_instruction], ["tool-policy", protocol.tool_policy]]) {
    const observed = sha256(await fs.readFile(path.join(fixtureRoot, source.path)));
    checks.push({ id, pass: observed === source.sha256, expected: source.sha256, observed });
  }
  for (const candidate of map.participants) {
    const clean = await git(candidate.root, ["status", "--porcelain=v1"]);
    checks.push({ id: `clean:${candidate.id}`, pass: clean === "" && await git(candidate.root, ["rev-parse", "HEAD"]) === candidate.revision });
    if (candidate.condition === "temple") {
      const item = await readJson(path.join(candidate.root, ".ai-org/work-items/WI-0001.json"));
      const route = routeSummary(candidate.route);
      const routeRequestRetained = await fs.access(path.join(candidate.root, ".ai-org/artifacts/WI-0001/execution-request.json")).then(() => true).catch(() => false);
      checks.push({ id: `native-lean:${candidate.id}`, pass: matchesNativeLeanCandidate(item), observed: { workflow_profile: item.workflow_profile, scope_class: item.profile_assessment?.scope_class, risk_tier: item.risk_tier, state: item.state } });
      checks.push({ id: `route:${candidate.id}`, pass: route.status === "resolved" && route.profile_id === candidate.expected_profile_id && route.model === candidate.model && route.reasoning_effort === candidate.reasoning_effort && route.provider_contact === false && route.automatic_execution === false, observed: route });
      checks.push({ id: `route-treatment-hidden:${candidate.id}`, pass: routeRequestRetained === false });
    }
  }
  for (const caseDefinition of protocol.cases) {
    const group = map.participants.filter((entry) => entry.case_id === caseDefinition.id);
    const temple = group.filter((entry) => entry.condition === "temple");
    const productSignatures = group.map((entry) => ({
      condition_id: entry.condition_id,
      components: entry.context.components
        .filter((component) => ["product-task", "acceptance-contract"].includes(component.id))
        .map((component) => ({ id: component.id, sha256: component.sha256, utf8_bytes: component.utf8_bytes }))
    }));
    checks.push({ id: `all-arms:${caseDefinition.id}`, pass: group.length === protocol.conditions.length });
    checks.push({ id: `matched-product:${caseDefinition.id}`, pass: new Set(productSignatures.map((entry) => JSON.stringify(entry.components))).size === 1, signatures: productSignatures });
    checks.push({ id: `matched-temple-context:${caseDefinition.id}`, pass: new Set(temple.map((entry) => entry.context.context_profile_digest)).size === 1, digests: temple.map((entry) => ({ condition_id: entry.condition_id, digest: entry.context.context_profile_digest, utf8_bytes: entry.context.utf8_bytes })) });
  }
  let approval = { accepted: false, errors: ["exact owner approval is absent"] };
  if (approvalPath) approval = validatePilotApprovalV2(await readJson(approvalPath), protocol);
  const offlinePass = validateExecutableProtocol(protocol).valid && checks.every((entry) => entry.pass);
  const handshake = protocol.provider_contract
    ? await providerHandshake(protocol, path.join(labRoot, "coordinator"))
    : { pass: false, blockers: ["provider-contract-required"], model_generation_performed: false };
  const blockers = [
    ...checks.filter((entry) => !entry.pass).map((entry) => entry.id),
    ...(approval.accepted ? [] : ["exact-owner-approval-required"]),
    ...handshake.blockers
  ];
  const generationReady = offlinePass && approval.accepted && handshake.pass;
  const output = {
    schema_version: "temple.effectiveness-pilot-preflight/v2",
    generated_at: new Date().toISOString(),
    offline_pass: offlinePass,
    generation_ready: generationReady,
    model_generation_performed: false,
    blockers,
    approval,
    provider_handshake: handshake,
    checks,
    note: generationReady
      ? "The exact protocol, approval, installed App Server contract, and model availability are ready for one no-retry live attempt."
      : "Generation remains blocked until the exact approval and installed App Server contract both pass."
  };
  await writeJson(path.join(labRoot, "coordinator/preflight-observation.json"), output);
  return output;
}

function operationalTokens(usage) {
  return usage.input_tokens - usage.cached_input_tokens + usage.output_tokens;
}

async function changedPaths(root) {
  return (await inspectGitRepository(root)).dirty_paths;
}

function allowedCandidatePath(candidate) {
  return candidate === "src" || candidate.startsWith("src/") || candidate === "test" || candidate.startsWith("test/");
}

async function runCandidateTests(root, fixtureRoot, caseId) {
  const publicResult = await command("npm", ["test"], { cwd: root, timeout: 300000, env: { ...process.env, CI: "1" } });
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), `temple-effectiveness-v2-${caseId}-`));
  let acceptanceResult;
  try {
    await fs.mkdir(path.join(temporaryRoot, "candidate"), { recursive: true });
    await fs.cp(path.join(root, "src"), path.join(temporaryRoot, "candidate/src"), { recursive: true });
    await fs.mkdir(path.join(temporaryRoot, "evaluator"), { recursive: true });
    await fs.copyFile(path.join(fixtureRoot, caseId, "evaluator/acceptance.test.mjs"), path.join(temporaryRoot, "evaluator/acceptance.test.mjs"));
    acceptanceResult = await command("node", ["--test", "evaluator/acceptance.test.mjs"], {
      cwd: temporaryRoot,
      timeout: 300000,
      env: { ...process.env, CI: "1" }
    });
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
  return {
    public: publicResult.status === 0 ? "pass" : "fail",
    acceptance: acceptanceResult.status === 0 ? "pass" : "fail",
    retained_output: false
  };
}

function patchLineCount(patch) {
  return patch.split("\n").filter((line) => (line.startsWith("+") && !line.startsWith("+++")) || (line.startsWith("-") && !line.startsWith("---"))).length;
}

async function appendJsonLine(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, `${JSON.stringify(value)}\n`, { encoding: "utf8", mode: 0o600 });
}

async function ensureBlindSalt(coordinatorRoot) {
  const file = path.join(coordinatorRoot, "sealed/salt.txt");
  try {
    return (await fs.readFile(file, "utf8")).trim();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const salt = crypto.randomBytes(32).toString("hex");
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${salt}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    return salt;
  }
}

async function exportCandidate({ coordinatorRoot, participant, usage, completion, tests, startedAt, completedAt, launchRevision, candidateRevision, modelEvidence, changed }) {
  const salt = await ensureBlindSalt(coordinatorRoot);
  const seed = `${salt}\0${participant.id}\0${candidateRevision}`;
  const packageId = `pkg-${sha256(`package\0${seed}`).slice(0, 16)}`;
  const evidenceId = `evd-${sha256(`evidence\0${seed}`).slice(0, 16)}`;
  const patch = await git(participant.root, ["diff", "--binary", "--no-ext-diff", launchRevision, candidateRevision, "--", "src", "test"]);
  const blind = {
    package_id: packageId,
    case_id: participant.case_id,
    evidence_id: evidenceId,
    product_patch: patch,
    tests: { public: tests.public, acceptance: tests.acceptance },
    completion
  };
  const sealed = {
    schema_version: "temple.effectiveness-pilot-sealed-candidate/v2",
    package_id: packageId,
    evidence_id: evidenceId,
    participant_id: participant.id,
    case_id: participant.case_id,
    condition_id: participant.condition_id,
    candidate_repository_path: participant.root,
    launch_revision: launchRevision,
    candidate_revision: candidateRevision,
    usage,
    latency_ms: Date.parse(completedAt) - Date.parse(startedAt),
    model: modelEvidence,
    context: participant.context,
    changed_paths: changed,
    changed_lines: patchLineCount(patch),
    retry_count: 0,
    fallback_count: 0,
    quality_score_frozen: false,
    raw_prompt_retained: false,
    raw_response_retained: false,
    hidden_reasoning_retained: false
  };
  await fs.mkdir(path.join(coordinatorRoot, "blind"), { recursive: true });
  await fs.mkdir(path.join(coordinatorRoot, "sealed"), { recursive: true });
  await writeJson(path.join(coordinatorRoot, "blind", `${packageId}.json`), blind, { exclusive: true });
  await writeJson(path.join(coordinatorRoot, "sealed", `${packageId}.json`), sealed, { exclusive: true });
  return { packageId, evidenceId, sealed };
}

async function launchCandidate({ protocol, participant, fixtureRoot, coordinatorRoot, toolPolicy, aggregateOperationalTokens, programDeadline }) {
  const launchRevision = await git(participant.root, ["rev-parse", "HEAD"]);
  const instruction = await fs.readFile(path.join(fixtureRoot, protocol.launch_instruction.path), "utf8");
  const developerInstructions = [
    "This is one bounded controlled-comparison candidate. Do not create subagents or ask the user questions.",
    `Allowed command prefixes: ${toolPolicy.allowed_command_prefixes.map((entry) => entry.join(" ")).join(", ")}.`,
    "Submit exactly one allowlisted command per shell tool call. Never combine commands or use control operators, pipes, redirects, command substitutions, or printf; use separate tool calls instead.",
    "Do not inspect any path outside the current candidate repository. Do not modify Temple lifecycle files; the coordinator owns them.",
    "Change only src/ and test/. Network access, dependency installation, retries, fallback models, external services, and external writes are prohibited.",
    "Use apply_patch for file changes. Complete one attempt only and return only the requested structured completion record."
  ].join("\n");
  let connection;
  let threadId = null;
  let turnId = null;
  let terminal = null;
  let latestUsage = null;
  let completionText = null;
  let violation = null;
  let reroute = null;
  let usageQueue = Promise.resolve();
  let resolveTerminal;
  const terminalPromise = new Promise((resolve) => { resolveTerminal = resolve; });
  const startedAt = new Date().toISOString();
  async function interrupt(reason) {
    if (violation === null) violation = reason;
    if (connection && threadId && turnId) await connection.request("turn/interrupt", { threadId, turnId }, 15000).catch(() => {});
  }

  connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], {
    cwd: participant.root,
    env: isolateWave5CodexEnvironment(process.env),
    onNotification(message) {
      const params = message.params ?? {};
      if (message.method === "thread/tokenUsage/updated" && (!turnId || params.turnId === turnId)) {
        const usage = normalizeTokenUsage(params);
        if (usage) {
          latestUsage = usage;
          usageQueue = usageQueue.then(async () => {
            const candidateOperational = operationalTokens(usage);
            if (candidateOperational > protocol.execution.candidate_operational_token_limit) await interrupt("candidate-operational-token-limit");
            if (aggregateOperationalTokens + candidateOperational > protocol.execution.candidate_aggregate_operational_token_limit) await interrupt("candidate-aggregate-operational-token-limit");
          });
        }
      }
      const protocolViolation = protocolViolationForMessage(message, { turnId, allowedCommandPrefixes: toolPolicy.allowed_command_prefixes });
      if (protocolViolation?.code === "model-rerouted") reroute = { from: params.fromModel ?? params.from_model ?? null, to: params.toModel ?? params.to_model ?? null };
      if (protocolViolation) void interrupt(`${protocolViolation.code}:${protocolViolation.message}`);
      if (message.method === "item/started" && ["mcpToolCall", "webSearch"].includes(params.item?.type)) void interrupt("candidate-tool-policy-violation");
      if (message.method === "item/completed" && (!turnId || params.turnId === turnId) && params.item?.type === "agentMessage") completionText = params.item.text;
      if (message.method === "turn/completed" && (!turnId || params.turn?.id === turnId)) {
        terminal = params.turn;
        resolveTerminal(params.turn);
      }
    },
    onRequest(message, responder) {
      if (["item/commandExecution/requestApproval", "item/fileChange/requestApproval", "item/permissions/requestApproval"].includes(message.method)) {
        try { responder.respond(buildCodexRuntimeRequestResponse(message.method, message.params, { decision: "decline" })); } catch {}
      }
      const protocolViolation = protocolViolationForMessage(message, { turnId, direction: "request", allowedCommandPrefixes: toolPolicy.allowed_command_prefixes });
      if (protocolViolation) void interrupt(`${protocolViolation.code}:${protocolViolation.message}`);
    }
  });

  const remainingMs = Math.max(1, programDeadline - Date.now());
  const timer = setTimeout(() => { void interrupt("program-wall-clock-limit"); }, remainingMs);
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-effectiveness-v2", title: "Temple Effectiveness V2", version: "1" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const thread = await connection.request("thread/start", {
      model: participant.model,
      cwd: participant.root,
      approvalPolicy: "never",
      sandbox: "workspace-write",
      serviceName: `temple-effectiveness-v2-${participant.id}`,
      developerInstructions,
      ...wave5ThreadIsolation(participant.root)
    });
    threadId = thread?.thread?.id;
    if (!threadId || thread.model !== participant.model) throw new Error("thread/start did not acknowledge the requested model");
    const turn = await connection.request("turn/start", {
      threadId,
      clientUserMessageId: `effectiveness-v2-${participant.id}`,
      input: [{ type: "text", text: instruction }],
      turnTrigger: "user",
      cwd: participant.root,
      approvalPolicy: "never",
      sandboxPolicy: { type: "workspaceWrite", writableRoots: [participant.root], networkAccess: false },
      model: participant.model,
      effort: participant.reasoning_effort,
      outputSchema: WAVE5_COMPLETION_SCHEMA
    });
    turnId = turn?.turn?.id;
    if (!turnId) throw new Error("turn/start did not return a turn ID");
    await terminalPromise;
    await usageQueue;
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (violation) throw new Error(violation);
    const terminalProblem = terminalFailure(terminal);
    if (terminalProblem) throw new Error(`${terminalProblem.code}:${terminalProblem.message}`);
    if (!latestUsage) throw new Error("detailed Token usage is missing");
    if (reroute) throw new Error("model rerouted");
    const completion = parseStructuredCompletion(completionText);
    const changed = await changedPaths(participant.root);
    const disallowed = changed.filter((candidate) => !allowedCandidatePath(candidate));
    if (disallowed.length > 0) throw new Error(`out-of-scope changes: ${disallowed.join(", ")}`);
    const tests = await runCandidateTests(participant.root, fixtureRoot, participant.case_id);
    if (changed.length > 0) {
      await git(participant.root, ["add", "--", "src", "test"]);
      await git(participant.root, ["commit", "-m", `Complete ${participant.case_id} candidate`]);
    }
    const candidateRevision = await git(participant.root, ["rev-parse", "HEAD"]);
    const remaining = await changedPaths(participant.root);
    if (remaining.length > 0) throw new Error(`candidate remained dirty: ${remaining.join(", ")}`);
    const completedAt = new Date().toISOString();
    const normalizedCompletion = { ...completion, changed_paths: changed, test_command: "npm test", test_result: tests.public };
    const modelEvidence = {
      requested_model: participant.model,
      acknowledged_model: thread.model,
      requested_reasoning_effort: participant.reasoning_effort,
      observed_thread_reasoning_effort: thread.reasoningEffort ?? null,
      effective_turn_reasoning_effort: null,
      reasoning_effort_source: "turn-request",
      rerouted: false
    };
    const exported = await exportCandidate({ coordinatorRoot, participant, usage: latestUsage, completion: normalizedCompletion, tests, startedAt, completedAt, launchRevision, candidateRevision, modelEvidence, changed });
    const observation = {
      schema_version: "temple.effectiveness-pilot-turn-observation/v2",
      participant_id: participant.id,
      case_id: participant.case_id,
      condition_id: participant.condition_id,
      started_at: startedAt,
      completed_at: completedAt,
      launch_revision: launchRevision,
      candidate_revision: candidateRevision,
      tests,
      usage: latestUsage,
      model: modelEvidence,
      package_id: exported.packageId,
      raw_prompt_retained: false,
      raw_response_retained: false,
      automatic_retry: false,
      fallback_used: false
    };
    await appendJsonLine(path.join(coordinatorRoot, "run-observations.jsonl"), observation);
    return { ...observation, operational_tokens: operationalTokens(latestUsage) };
  } finally {
    clearTimeout(timer);
    await connection?.close().catch(() => {});
  }
}

async function pathExists(candidate) {
  return fs.access(candidate).then(() => true).catch(() => false);
}

async function runLive(protocol, labRoot, approvalPath) {
  const coordinatorRoot = path.join(labRoot, "coordinator");
  for (const retained of ["run-result.json", "run-observations.jsonl"]) {
    if (await pathExists(path.join(coordinatorRoot, retained))) throw new Error("live attempt already started; retries and resumes are prohibited");
  }
  const before = await preflight(protocol, labRoot, approvalPath);
  if (!before.generation_ready) throw new Error(`generation blocked: ${before.blockers.join(", ")}`);
  const map = await readJson(path.join(coordinatorRoot, "candidate-map.json"));
  const fixtureRoot = path.join(repositoryRoot, protocol.fixture_root);
  const toolPolicy = await readJson(path.join(fixtureRoot, protocol.tool_policy.path));
  if (JSON.stringify(toolPolicy.allowed_command_prefixes) !== JSON.stringify(WAVE5_ALLOWED_COMMAND_PREFIXES)) throw new Error("tool policy differs from the contract-tested command allowlist");
  const programStartedAt = new Date().toISOString();
  const programDeadline = Date.now() + protocol.execution.program_wall_clock_limit_ms;
  const results = [];
  let aggregateOperationalTokens = 0;
  try {
    for (const participant of map.participants) {
      const result = await launchCandidate({ protocol, participant, fixtureRoot, coordinatorRoot, toolPolicy, aggregateOperationalTokens, programDeadline });
      results.push(result);
      aggregateOperationalTokens += result.operational_tokens;
    }
  } catch (error) {
    const stopped = {
      schema_version: "temple.effectiveness-pilot-run/v2",
      work_item_id: protocol.work_item_id,
      started_at: programStartedAt,
      stopped_at: new Date().toISOString(),
      status: "stopped",
      completed_candidates: results.length,
      candidate_operational_tokens: aggregateOperationalTokens,
      stop_reason: String(error.message ?? error),
      retry_count: 0,
      fallback_count: 0
    };
    await writeJson(path.join(coordinatorRoot, "run-result.json"), stopped, { exclusive: true });
    throw error;
  }
  const output = {
    schema_version: "temple.effectiveness-pilot-run/v2",
    work_item_id: protocol.work_item_id,
    started_at: programStartedAt,
    completed_at: new Date().toISOString(),
    status: "candidate-matrix-completed",
    completed_candidates: results.length,
    candidate_operational_tokens: aggregateOperationalTokens,
    evaluator_pending: true,
    retry_count: 0,
    fallback_count: 0,
    model_generation_performed: true
  };
  await writeJson(path.join(coordinatorRoot, "run-result.json"), output, { exclusive: true });
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
  const forbidden = /condition|usage|token|latency|candidate_revision|repository_path|sealed_mapping|arm_mapping|agent|position|work_item|model|reasoning/i;
  function visit(input) {
    if (Array.isArray(input)) return input.map(visit);
    if (!input || typeof input !== "object") return input;
    return Object.fromEntries(Object.entries(input).filter(([key]) => !forbidden.test(key)).map(([key, child]) => [key, visit(child)]));
  }
  const sanitized = visit(value);
  if (!sanitized.package_id || !sanitized.case_id || !sanitized.evidence_id) throw new Error("blind package identity is incomplete");
  return sanitized;
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

async function prepareEvaluatorInputs(protocol, labRoot) {
  const coordinatorRoot = path.join(labRoot, "coordinator");
  const evaluatorRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-effectiveness-v2-evaluator-"));
  const packages = [];
  const inputManifest = [];
  try {
    for (const filename of await jsonFiles(path.join(coordinatorRoot, "blind"))) {
      const value = sanitizeBlindPackage(await readJson(path.join(coordinatorRoot, "blind", filename)));
      packages.push(value);
    }
    if (packages.length !== protocol.execution.candidate_turns) throw new Error(`expected ${protocol.execution.candidate_turns} blind packages, received ${packages.length}`);
    packages.sort((left, right) => left.package_id.localeCompare(right.package_id));
    await fs.mkdir(path.join(evaluatorRoot, "inputs"), { recursive: true });
    for (const value of packages) {
      const relative = `inputs/${value.package_id}.json`;
      const contents = `${JSON.stringify(value, null, 2)}\n`;
      await fs.writeFile(path.join(evaluatorRoot, relative), contents, { flag: "wx", mode: 0o600 });
      inputManifest.push({ path: relative, sha256: sha256(contents), kind: "arm-neutral-package" });
    }
    for (const caseDefinition of protocol.cases) {
      const relative = `inputs/rubric-${caseDefinition.id}.json`;
      const source = path.join(repositoryRoot, protocol.fixture_root, caseDefinition.id, "evaluator/rubric.json");
      const contents = await fs.readFile(source, "utf8");
      await fs.writeFile(path.join(evaluatorRoot, relative), contents, { flag: "wx", mode: 0o600 });
      inputManifest.push({ path: relative, sha256: sha256(contents), kind: "frozen-rubric" });
    }
    return { evaluatorRoot, packages, inputManifest };
  } catch (error) {
    await fs.rm(evaluatorRoot, { recursive: true, force: true });
    throw error;
  }
}

async function launchEvaluator(protocol, prepared, candidateOperationalTokens, programDeadline) {
  const inputs = await Promise.all(prepared.inputManifest.map(async (entry) => ({ ...entry, contents: JSON.parse(await fs.readFile(path.join(prepared.evaluatorRoot, entry.path), "utf8")) })));
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
        if (usage) {
          const evaluatorOperational = operationalTokens(usage);
          if (evaluatorOperational > protocol.execution.evaluator_operational_token_limit) void interrupt("evaluator-operational-token-limit");
          if (candidateOperationalTokens + evaluatorOperational > protocol.execution.combined_operational_token_limit) void interrupt("combined-operational-token-limit");
        }
      }
      if (message.method === "item/started" && ["commandExecution", "fileChange", "mcpToolCall", "webSearch"].includes(params.item?.type)) void interrupt("evaluator-tool-use-forbidden");
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
  const timer = setTimeout(() => { void interrupt("program-wall-clock-limit"); }, Math.max(1, programDeadline - Date.now()));
  try {
    await connection.request("initialize", { clientInfo: { name: "temple-effectiveness-v2-evaluator", title: "Temple Effectiveness V2 Evaluator", version: "1" }, capabilities: { experimentalApi: false } });
    connection.notify("initialized", {});
    const thread = await connection.request("thread/start", {
      model: protocol.evaluation.evaluator_model,
      cwd: prepared.evaluatorRoot,
      approvalPolicy: "never",
      sandbox: "read-only",
      serviceName: "temple-effectiveness-v2-independent-evaluator",
      developerInstructions: "You are an independent blind evaluator. Use only supplied evidence, do not use tools, and return exactly the requested structured document.",
      baseInstructions: "Evaluate correctness and engineering quality only. Never infer process condition, model, cost, or timing.",
      allowProviderModelFallback: false,
      ephemeral: true
    });
    threadId = thread?.thread?.id;
    if (!threadId || thread.model !== protocol.evaluation.evaluator_model) throw new Error("evaluator thread did not acknowledge the pinned model");
    const turn = await connection.request("turn/start", {
      threadId,
      clientUserMessageId: "effectiveness-v2-independent-evaluation",
      input: [{ type: "text", text: prompt }],
      turnTrigger: "user",
      cwd: prepared.evaluatorRoot,
      approvalPolicy: "never",
      sandboxPolicy: { type: "readOnly", networkAccess: false },
      model: protocol.evaluation.evaluator_model,
      effort: protocol.evaluation.evaluator_reasoning_effort,
      outputSchema: evaluatorSchema
    });
    turnId = turn?.turn?.id;
    if (!turnId) throw new Error("evaluator turn did not start");
    await terminalPromise;
    if (violation) throw new Error(violation);
    const failure = terminalFailure(terminal);
    if (failure) throw new Error(`${failure.code}:${failure.message}`);
    if (!usage) throw new Error("evaluator detailed Token usage is missing");
    return {
      thread_id: threadId,
      turn_id: turnId,
      model: {
        requested_model: protocol.evaluation.evaluator_model,
        acknowledged_model: thread.model,
        requested_reasoning_effort: protocol.evaluation.evaluator_reasoning_effort,
        observed_thread_reasoning_effort: thread.reasoningEffort ?? null,
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

async function collectEvidence(protocol, labRoot, evaluator) {
  const coordinatorRoot = path.join(labRoot, "coordinator");
  const map = await readJson(path.join(coordinatorRoot, "candidate-map.json"));
  const participantById = new Map(map.participants.map((entry) => [entry.id, entry]));
  const candidates = [];
  for (const filename of await jsonFiles(path.join(coordinatorRoot, "sealed"))) {
    const sealed = await readJson(path.join(coordinatorRoot, "sealed", filename));
    const blind = await readJson(path.join(coordinatorRoot, "blind", filename));
    const score = evaluator.scores.packages.find((entry) => entry.package_id === sealed.package_id);
    const participant = participantById.get(sealed.participant_id);
    if (!participant || !score) throw new Error("sealed candidate mapping or blind score is missing");
    candidates.push({
      case_id: sealed.case_id,
      condition_id: sealed.condition_id,
      package_id: sealed.package_id,
      public_tests: blind.tests.public,
      acceptance_tests: blind.tests.acceptance,
      blind_score: score.score,
      blind_decision: score.decision,
      operational_tokens: operationalTokens(sealed.usage),
      gross_tokens: sealed.usage.total_tokens,
      latency_ms: sealed.latency_ms,
      context_utf8_bytes: participant.context.utf8_bytes,
      context_profile_digest: participant.context.context_profile_digest,
      changed_lines: sealed.changed_lines,
      changed_paths: sealed.changed_paths,
      retry_count: 0,
      fallback_count: 0,
      model: sealed.model
    });
  }
  candidates.sort((left, right) => `${left.case_id}/${left.condition_id}`.localeCompare(`${right.case_id}/${right.condition_id}`));
  return {
    schema_version: "temple.effectiveness-pilot-evidence/v2",
    work_item_id: protocol.work_item_id,
    generated_at: new Date().toISOString(),
    candidates,
    evaluator: { model: evaluator.model, usage: evaluator.usage, retry_count: 0, fallback_count: 0 },
    effective_reasoning_effort_observed: false,
    billed_cost_known: false
  };
}

async function evaluateLive(protocol, labRoot, approvalPath) {
  const coordinatorRoot = path.join(labRoot, "coordinator");
  if (await pathExists(path.join(coordinatorRoot, "evaluator-result.json"))) throw new Error("evaluator attempt already exists; retries are prohibited");
  const approval = validatePilotApprovalV2(await readJson(approvalPath), protocol);
  if (!approval.accepted) throw new Error(`evaluation blocked: ${approval.errors.join(", ")}`);
  const runResult = await readJson(path.join(coordinatorRoot, "run-result.json"));
  if (runResult.status !== "candidate-matrix-completed") throw new Error("candidate matrix is not complete");
  const prepared = await prepareEvaluatorInputs(protocol, labRoot);
  const programDeadline = Date.parse(runResult.started_at) + protocol.execution.program_wall_clock_limit_ms;
  try {
    const evaluator = await launchEvaluator(protocol, prepared, runResult.candidate_operational_tokens, programDeadline);
    const frozen = {
      schema_version: "temple.effectiveness-pilot-scores/v2",
      work_item_id: protocol.work_item_id,
      frozen_at: new Date().toISOString(),
      input_manifest_digest: sha256(JSON.stringify(prepared.inputManifest)),
      evaluator_thread_id: evaluator.thread_id,
      packages: evaluator.scores.packages,
      summary: evaluator.scores.summary,
      mapping_unsealed_after_freeze: true
    };
    await writeJson(path.join(coordinatorRoot, "quality-scores-frozen.json"), frozen, { exclusive: true });
    const evidence = await collectEvidence(protocol, labRoot, evaluator);
    await writeJson(path.join(coordinatorRoot, "effectiveness-evidence.json"), evidence, { exclusive: true });
    const analysis = protocol.schema_version === "temple.effectiveness-terra-ab/v1"
      ? analyzeTerraAbConfirmationV1(evidence, protocol)
      : analyzeEffectivenessPilotV2(evidence, protocol);
    await writeJson(path.join(coordinatorRoot, "effectiveness-analysis.json"), analysis, { exclusive: true });
    const output = {
      schema_version: "temple.effectiveness-pilot-evaluator-result/v2",
      work_item_id: protocol.work_item_id,
      status: "completed",
      scores_frozen: true,
      mapping_unsealed_after_freeze: true,
      evaluator: { thread_id: evaluator.thread_id, turn_id: evaluator.turn_id, model: evaluator.model, usage: evaluator.usage },
      evidence_path: path.join(coordinatorRoot, "effectiveness-evidence.json"),
      analysis_path: path.join(coordinatorRoot, "effectiveness-analysis.json"),
      automatic_retry: false,
      fallback_used: false
    };
    await writeJson(path.join(coordinatorRoot, "evaluator-result.json"), output, { exclusive: true });
    return output;
  } finally {
    await fs.rm(prepared.evaluatorRoot, { recursive: true, force: true });
  }
}

async function main() {
  const protocol = await readJson(path.resolve(argument("--protocol") ?? defaultProtocolPath));
  const validation = validateExecutableProtocol(protocol);
  if (!validation.valid) throw new Error(validation.errors.join("; "));
  const mode = argument("--mode") ?? "validate";
  let output;
  if (mode === "validate") output = { ...validation, protocol_sha256: protocolDigest(protocol), model_generation_performed: false };
  else {
    const lab = argument("--lab-root");
    if (!lab) throw new Error("--lab-root is required");
    const labRoot = path.resolve(lab);
    if (mode === "setup") output = await setup(protocol, labRoot, argument("--framework-revision"));
    else if (mode === "preflight") output = await preflight(protocol, labRoot, argument("--approval") ? path.resolve(argument("--approval")) : null);
    else if (mode === "run") {
      const approval = argument("--approval");
      if (!approval) throw new Error("--approval is required for live generation");
      output = await runLive(protocol, labRoot, path.resolve(approval));
    } else if (mode === "evaluate") {
      const approval = argument("--approval");
      if (!approval) throw new Error("--approval is required for evaluation");
      output = await evaluateLive(protocol, labRoot, path.resolve(approval));
    }
    else throw new Error(`unsupported mode ${mode}`);
  }
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
