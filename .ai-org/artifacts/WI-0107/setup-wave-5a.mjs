import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const frameworkRoot = path.resolve(import.meta.dirname, "../../..");
const fixtureRoot = path.join(frameworkRoot, ".ai-org/artifacts/WI-0106/fixtures");
const protocolPath = path.resolve(argument("--protocol-path") ?? path.join(fixtureRoot, "feasibility-protocol.json"));
const protocol = JSON.parse(await fs.readFile(protocolPath, "utf8"));
const defaultLabRoot = "<LOCAL_HOME>/Documents/ChatGPT/temple-wave-5a-lab";
const labRoot = path.resolve(argument("--lab-root") ?? defaultLabRoot);
const coordinatorRoot = path.join(labRoot, "coordinator");
const candidateRoot = path.join(labRoot, "candidates");
const frameworkSnapshot = path.join(labRoot, "framework-snapshot");
const gitIdentity = Object.freeze({ name: "Temple Wave 5A", email: "wave5a@invalid.local" });

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

async function run(command, args, options = {}) {
  const result = await execFile(command, args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    ...options
  });
  return result.stdout.trim();
}

async function git(root, args) {
  return run("git", ["-C", root, ...args], {
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  });
}

async function writeExclusive(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, value.endsWith("\n") ? value : `${value}\n`, { encoding: "utf8", flag: "wx" });
}

function conditionProjectId(caseId, condition) {
  return `wave5-${caseId}-${condition}`;
}

function candidateId(index, caseId, condition) {
  return `${String(index + 1).padStart(2, "0")}-${caseId}-${condition}`;
}

async function extractPinnedFramework() {
  const archive = path.join(labRoot, "framework-snapshot.tar");
  await run("git", ["-C", frameworkRoot, "archive", "--format=tar", `--output=${archive}`, protocol.temple_framework_revision]);
  await fs.mkdir(frameworkSnapshot, { recursive: true });
  await run("tar", ["-xf", archive, "-C", frameworkSnapshot]);
  await fs.rm(archive);
  const dependencySource = path.join(frameworkRoot, "node_modules");
  const dependencyStat = await fs.stat(dependencySource);
  if (!dependencyStat.isDirectory()) throw new Error("framework node_modules is unavailable");
  await fs.symlink(dependencySource, path.join(frameworkSnapshot, "node_modules"), "dir");
  const observed = JSON.parse(await fs.readFile(path.join(frameworkSnapshot, "package.json"), "utf8"));
  if (observed.version !== "0.1.0-alpha.29") throw new Error(`unexpected pinned framework version ${observed.version}`);
}

async function pinnedTemple(root, args) {
  const cli = path.join(frameworkSnapshot, "bin/temple.mjs");
  const targetIndex = args[0] === "work-item" ? 2 : 1;
  return run(process.execPath, [cli, ...args.slice(0, targetIndex), root, ...args.slice(targetIndex)], {
    env: { ...process.env, TEMPLE_CLI_PATH: cli }
  });
}

async function initializeGit(root, message) {
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.name", gitIdentity.name]);
  await git(root, ["config", "user.email", gitIdentity.email]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]);
}

async function prepareTempleCandidate(root, caseId) {
  const configPath = path.join(fixtureRoot, protocol.cases.find((entry) => entry.id === caseId).temple_init_path);
  await run(process.execPath, [path.join(frameworkSnapshot, "bin/temple.mjs"), "init", root, "--config", configPath], {
    env: { ...process.env, TEMPLE_CLI_PATH: path.join(frameworkSnapshot, "bin/temple.mjs") }
  });
  await pinnedTemple(root, [
    "work-item", "create",
    "--title", `Complete ${caseId} fixture`,
    "--scope", "Complete only TASK.md and change only src/ and test/.",
    "--acceptance", "The product behavior passes public and coordinator-held acceptance tests without dependencies or out-of-scope writes.",
    "--affected-path", "src",
    "--affected-path", "test",
    "--spec-mode", "gate-evidence",
    "--ui-mode", "not-applicable",
    "--tracker-visibility", "internal"
  ]);
  const artifact = path.join(root, ".ai-org/artifacts/WI-0001");
  await writeExclusive(path.join(artifact, "work-order.md"), "# Work order\n\nComplete the bounded product task in `TASK.md`.\n");
  await writeExclusive(path.join(artifact, "approved-scope.md"), "# Approved scope\n\nOnly `src/` and `test/` may change. Network, dependencies, retries, fallback models, deployment, and external actions are prohibited.\n");
  await writeExclusive(path.join(artifact, "technical-design.md"), "# Technical design\n\nPreserve public contracts, implement the smallest maintainable change, add focused tests, and run `npm test`.\n");
  await writeExclusive(path.join(artifact, "risk-review.md"), "# Risk review\n\nProtect compatibility, immutability, idempotence, path scope, and deterministic local behavior.\n");
  const baseRevision = await initializeGit(root, "Initialize pinned Temple candidate");
  await pinnedTemple(root, ["work-item", "configure", "--work-item", "WI-0001", "--agent-id", "agent-rikku", "--base-revision", baseRevision, "--parallel-mode", "sequential"]);
  await pinnedTemple(root, ["transition", "--work-item", "WI-0001", "--to", "spec", "--satisfy", "work_order=.ai-org/artifacts/WI-0001/work-order.md"]);
  await pinnedTemple(root, ["transition", "--work-item", "WI-0001", "--to", "design", "--satisfy", "approved_scope=.ai-org/artifacts/WI-0001/approved-scope.md", "--satisfy", "acceptance_criteria=.ai-org/artifacts/WI-0001/approved-scope.md"]);
  await pinnedTemple(root, ["transition", "--work-item", "WI-0001", "--to", "build", "--satisfy", "technical_design=.ai-org/artifacts/WI-0001/technical-design.md", "--satisfy", "risk_review=.ai-org/artifacts/WI-0001/risk-review.md"]);
  await pinnedTemple(root, ["work-item", "claim", "--work-item", "WI-0001", "--agent-id", "agent-rikku", "--principal-id", "human", "--base-revision", baseRevision, "--branch", "main", "--worktree", root]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Prepare routed Developer work"]);
}

async function prepareMinimalCandidate(root) {
  await fs.copyFile(path.join(fixtureRoot, "minimal-AGENTS.md"), path.join(root, "AGENTS.md"));
  await initializeGit(root, "Initialize minimal candidate");
}

function manifest(participants) {
  const turns = participants.map((participant, index) => ({
    id: `turn-${String(index + 1).padStart(2, "0")}`,
    project_id: participant.id,
    work_item_id: "WI-0001",
    position_id: "developer",
    requested_model: protocol.model.requested_model,
    requested_reasoning_effort: protocol.model.requested_reasoning_effort,
    sandbox_mode: protocol.model.sandbox,
    approval_policy: protocol.model.approval_policy,
    network_access: protocol.model.network_access,
    instruction_path: "TASK.md",
    allowed_paths: ["src", "test"]
  }));
  return {
    schema_version: "temple.validation-program/v1",
    id: protocol.protocol_id,
    coordinator_project_id: "temple-ai-development-organization-framework",
    authority: {
      network_access: false,
      external_writes: false,
      external_spend_yen: 0,
      api_key_use: false,
      usage_reset: false,
      deployment: false,
      publication: false,
      fallback_allowed: false
    },
    limits: protocol.limits ?? {
      max_turns: 4,
      max_launch_attempts: 4,
      max_retries: 0,
      max_concurrency: 1,
      per_turn_warning_tokens: 50000,
      per_turn_hard_tokens: 80000,
      aggregate_warning_tokens: 200000,
      aggregate_hard_tokens: 320000,
      per_turn_warning_ms: 300000,
      per_turn_hard_ms: 600000,
      program_warning_ms: 1800000,
      program_hard_ms: 3600000,
      per_repository_warning_bytes: 67108864,
      per_repository_hard_bytes: 134217728,
      aggregate_warning_bytes: 268435456,
      aggregate_hard_bytes: 536870912
    },
    participants: participants.map((participant) => ({
      id: participant.id,
      path: path.posix.join("..", "candidates", participant.directory),
      expected_project_id: participant.project_id,
      allowed_paths: ["src", "test"]
    })),
    waves: turns.map((turn, index) => ({ id: `wave-${String(index + 1).padStart(2, "0")}`, order: index + 1, turns: [turn] }))
  };
}

async function main() {
  try {
    await fs.access(labRoot);
    throw new Error(`refusing to replace existing Wave 5A lab: ${labRoot}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await fs.mkdir(coordinatorRoot, { recursive: true });
  await fs.mkdir(candidateRoot, { recursive: true });
  await extractPinnedFramework();

  const participants = [];
  let index = 0;
  for (const caseDefinition of protocol.cases) {
    for (const condition of caseDefinition.condition_order) {
      const directory = candidateId(index, caseDefinition.id, condition);
      const root = path.join(candidateRoot, directory);
      await fs.cp(path.join(fixtureRoot, caseDefinition.id, "starter"), root, { recursive: true, errorOnExist: true, force: false });
      await writeExclusive(path.join(root, ".gitignore"), ".DS_Store\n*.log\n");
      if (condition === "temple") await prepareTempleCandidate(root, caseDefinition.id);
      else await prepareMinimalCandidate(root);
      const status = await git(root, ["status", "--porcelain=v1"]);
      if (status) throw new Error(`${directory} is dirty after setup`);
      participants.push({
        id: conditionProjectId(caseDefinition.id, condition),
        project_id: conditionProjectId(caseDefinition.id, condition),
        directory,
        case_id: caseDefinition.id,
        condition,
        root,
        revision: await git(root, ["rev-parse", "HEAD"])
      });
      index += 1;
    }
  }

  const outputManifest = manifest(participants);
  await writeExclusive(path.join(coordinatorRoot, "validation-program.json"), JSON.stringify(outputManifest, null, 2));
  await writeExclusive(path.join(coordinatorRoot, "candidate-map.json"), JSON.stringify({
    schema_version: "temple.wave-5a-candidate-map/v1",
    protocol_id: protocol.protocol_id,
    fixture_source_revision: protocol.fixture_source_revision,
    temple_framework_revision: protocol.temple_framework_revision,
    participants
  }, null, 2));
  process.stdout.write(`${JSON.stringify({
    schema_version: "temple.wave-5a-setup/v1",
    lab_root: labRoot,
    coordinator_root: coordinatorRoot,
    candidates: participants.map(({ root, ...entry }) => ({ ...entry, root })),
    model_generation_performed: false
  }, null, 2)}\n`);
}

await main();
