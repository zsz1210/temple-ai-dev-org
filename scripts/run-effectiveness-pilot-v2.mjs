#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

import { measureContextEnvelope, validateAcceptanceContract } from "../src/context.mjs";

const execFile = promisify(execFileCallback);
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const defaultProtocolPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0131/pilot-protocol-v2.json");
const legacyRunner = path.join(repositoryRoot, ".ai-org/artifacts/WI-0107/run-wave-5a.mjs");

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
  if (protocol?.work_item_id !== "WI-0131") errors.push("work_item_id must be WI-0131");
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
  return { valid: errors.length === 0, errors };
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
  await writeJson(path.join(artifact, "execution-request.json"), executionRequest(condition));
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
  await pinnedTemple(snapshotRoot, root, ["work-item", "claim", "--work-item", "WI-0001", "--agent-id", "agent-rikku", "--principal-id", "human", "--base-revision", baseRevision, "--branch", "main", "--worktree", root]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Prepare native Lean Developer work"]);
  const routeResult = await pinnedTemple(snapshotRoot, root, ["execution", "resolve", "--request", ".ai-org/artifacts/WI-0001/execution-request.json", "--json"]);
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
      if (condition.process === "temple-lean") {
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

async function preflight(protocol, labRoot, approvalPath) {
  const map = await readJson(path.join(labRoot, "coordinator/candidate-map.json"));
  const checks = [];
  for (const candidate of map.participants) {
    const clean = await git(candidate.root, ["status", "--porcelain=v1"]);
    checks.push({ id: `clean:${candidate.id}`, pass: clean === "" && await git(candidate.root, ["rev-parse", "HEAD"]) === candidate.revision });
    if (candidate.condition === "temple") {
      const item = await readJson(path.join(candidate.root, ".ai-org/work-items/WI-0001.json"));
      const route = routeSummary(candidate.route);
      checks.push({ id: `native-lean:${candidate.id}`, pass: matchesNativeLeanCandidate(item), observed: { workflow_profile: item.workflow_profile, scope_class: item.profile_assessment?.scope_class, risk_tier: item.risk_tier, state: item.state } });
      checks.push({ id: `route:${candidate.id}`, pass: route.status === "resolved" && route.profile_id === candidate.expected_profile_id && route.model === candidate.model && route.reasoning_effort === candidate.reasoning_effort && route.provider_contact === false && route.automatic_execution === false, observed: route });
    }
  }
  for (const caseDefinition of protocol.cases) {
    const group = map.participants.filter((entry) => entry.case_id === caseDefinition.id);
    const temple = group.filter((entry) => entry.condition === "temple");
    checks.push({ id: `all-arms:${caseDefinition.id}`, pass: group.length === 4 });
    checks.push({ id: `matched-temple-context:${caseDefinition.id}`, pass: new Set(temple.map((entry) => entry.context.context_profile_digest)).size === 1, digests: temple.map((entry) => ({ condition_id: entry.condition_id, digest: entry.context.context_profile_digest, utf8_bytes: entry.context.utf8_bytes })) });
  }
  let approval = { accepted: false, errors: ["exact owner approval is absent"] };
  if (approvalPath) approval = validatePilotApprovalV2(await readJson(approvalPath), protocol);
  const offlinePass = validatePilotProtocolV2(protocol).valid && checks.every((entry) => entry.pass);
  const blockers = [
    ...checks.filter((entry) => !entry.pass).map((entry) => entry.id),
    ...(approval.accepted ? [] : ["exact-owner-approval-required"]),
    "provider-contract-handshake-required-before-live-run"
  ];
  const output = {
    schema_version: "temple.effectiveness-pilot-preflight/v2",
    generated_at: new Date().toISOString(),
    offline_pass: offlinePass,
    generation_ready: false,
    model_generation_performed: false,
    blockers,
    approval,
    checks,
    note: "The live Work Item must clear the installed App Server contract and model-availability handshake before materializing a generation manifest."
  };
  await writeJson(path.join(labRoot, "coordinator/preflight-observation.json"), output);
  return output;
}

async function main() {
  const protocol = await readJson(path.resolve(argument("--protocol") ?? defaultProtocolPath));
  const validation = validatePilotProtocolV2(protocol);
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
    else if (mode === "run") throw new Error(`live generation is intentionally unavailable in WI-0131; start a live-run Work Item after exact approval and provider handshake (legacy runner retained at ${legacyRunner})`);
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
