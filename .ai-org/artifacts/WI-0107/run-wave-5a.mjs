import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import {
  buildCodexRuntimeRequestResponse,
  createJsonRpcProcess
} from "../../../src/codex-app-server-provider.mjs";
import {
  runValidationProgram,
  validateValidationProgramManifest
} from "../../../src/validation-program.mjs";
import {
  commandItemAllowed,
  isolateWave5CodexEnvironment,
  normalizeTokenUsage,
  parseStructuredCompletion,
  protocolViolationForMessage,
  terminalFailure,
  WAVE5_ALLOWED_COMMAND_PREFIXES,
  WAVE5_COMPLETION_SCHEMA,
  WAVE5_INHERITED_CODEX_ENVIRONMENT_KEYS,
  wave5ThreadIsolation
} from "../../../src/app-server-protocol-replay.mjs";

const execFile = promisify(execFileCallback);
const frameworkRoot = path.resolve(import.meta.dirname, "../../..");
const fixtureRoot = path.join(frameworkRoot, ".ai-org/artifacts/WI-0106/fixtures");
const expectedWorkItemId = argument("--work-item-id") ?? "WI-0107";
const approvalPath = path.resolve(argument("--approval-path") ?? path.join(import.meta.dirname, "account-approval.json"));
const preflightOutputPath = path.resolve(argument("--preflight-output") ?? path.join(import.meta.dirname, "preflight-observation.json"));
const protocol = JSON.parse(await fs.readFile(path.join(fixtureRoot, "feasibility-protocol.json"), "utf8"));
const toolPolicy = JSON.parse(await fs.readFile(path.join(fixtureRoot, "tool-policy.json"), "utf8"));
const allowedCommandPrefixes = toolPolicy.allowed_command_prefixes;
const defaultLabRoot = "/Users/zsz1210/Documents/ChatGPT/temple-wave-5a-lab";
const labRoot = path.resolve(argument("--lab-root") ?? defaultLabRoot);
const coordinatorRoot = path.join(labRoot, "coordinator");
const manifestPath = path.join(coordinatorRoot, "validation-program.json");
const candidateMapPath = path.join(coordinatorRoot, "candidate-map.json");
const expectedCliVersion = "codex-cli 0.151.0-alpha.7.2";
const expectedSchemaDigests = Object.freeze({
  "ThreadStartParams.json": "792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd",
  "TurnStartParams.json": "a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea",
  "ThreadStartResponse.json": "c8fb6bcd1e4fb5ead6b487f0f35a90d8f13c9272edd4285914012dda403a77d2",
  "TurnStartResponse.json": "7a817a98d78ac8e982c82c24bf8f7a2d2e61cca9fb91e5386e31cae0888e38e2",
  "ItemStartedNotification.json": "e30713dca6e8f6842a0c5350003ea433b6cbb4894209b4f871894450caa67b6f",
  "TurnCompletedNotification.json": "b85470d9eadbcad52700bd1d5aae187a9cd995e50b7099ed05469b6d41d6b997",
  "ItemCompletedNotification.json": "9958dce3bcab754e88323d233dff5f4c2ee04ce35f068a18d8f83f93528acf8b",
  "ThreadTokenUsageUpdatedNotification.json": "aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2",
  "ModelReroutedNotification.json": "37cd3c1b3a3560b85b01d4061a07d830fc9ed93b80e4663f975f9197cdb501ef",
  "TurnInterruptParams.json": "6dff382dae73d1dbc58406ed045605f647e7a49660e2540fbd2c6c24d60c5f2b"
});
const completionSchema = WAVE5_COMPLETION_SCHEMA;

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
      maxBuffer: 32 * 1024 * 1024,
      ...options
    });
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stableValue);
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

async function regularFiles(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await fs.readdir(current, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const candidate = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) output.push(...await regularFiles(root, candidate));
    else if (entry.isFile()) output.push(candidate);
  }
  return output;
}

async function caseDigest(caseId) {
  const files = await regularFiles(path.join(fixtureRoot, caseId));
  files.sort((left, right) => Buffer.compare(Buffer.from(`${caseId}/${left}`), Buffer.from(`${caseId}/${right}`)));
  const digest = createHash("sha256");
  for (const relative of files) {
    digest.update(`${caseId}/${relative}`);
    digest.update(Buffer.from([0]));
    digest.update(await fs.readFile(path.join(fixtureRoot, caseId, relative)));
    digest.update(Buffer.from([0]));
  }
  return digest.digest("hex");
}

async function fileDigest(relative) {
  return sha256(await fs.readFile(path.join(fixtureRoot, relative)));
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

async function readApproval() {
  try {
    const approval = JSON.parse(await fs.readFile(approvalPath, "utf8"));
    const accepted = approval?.schema_version === "temple.wave-5a-account-approval/v1" &&
      approval?.work_item_id === expectedWorkItemId &&
      approval?.approved_by === "repository-owner" &&
      approval?.automatic_credit_reload_disabled === true &&
      approval?.included_pro_allowance_accepted === true &&
      typeof approval?.approved_at === "string";
    return { accepted, approval: accepted ? approval : null };
  } catch (error) {
    if (error.code === "ENOENT") return { accepted: false, approval: null };
    throw error;
  }
}

async function protocolPreflight() {
  const blockers = [];
  const checks = [];
  const isolatedEnvironment = isolateWave5CodexEnvironment(Object.fromEntries([
    ...WAVE5_INHERITED_CODEX_ENVIRONMENT_KEYS.map((key) => [key, "inherited"]),
    ["PATH", "/usr/bin"]
  ]));
  const environmentIsolationPass = isolatedEnvironment.PATH === "/usr/bin" &&
    WAVE5_INHERITED_CODEX_ENVIRONMENT_KEYS.every((key) => !(key in isolatedEnvironment));
  checks.push({
    id: "parent-codex-environment-isolated",
    pass: environmentIsolationPass,
    removed_keys: WAVE5_INHERITED_CODEX_ENVIRONMENT_KEYS
  });
  if (!environmentIsolationPass) blockers.push("parent-codex-environment-not-isolated");
  const threadIsolation = wave5ThreadIsolation("/tmp/candidate");
  const threadIsolationPass = threadIsolation.ephemeral === true &&
    threadIsolation.allowProviderModelFallback === false &&
    typeof threadIsolation.baseInstructions === "string" &&
    !("runtimeWorkspaceRoots" in threadIsolation) &&
    !("selectedCapabilityRoots" in threadIsolation) &&
    !("environments" in threadIsolation);
  checks.push({ id: "thread-context-isolated", pass: threadIsolationPass });
  if (!threadIsolationPass) blockers.push("thread-context-not-isolated");
  const serializedOutputSchema = JSON.stringify(completionSchema);
  const outputSchemaPass = !serializedOutputSchema.includes('"uniqueItems"');
  checks.push({
    id: "provider-output-schema-subset",
    pass: outputSchemaPass,
    rule: "The installed Responses structured-output subset rejects uniqueItems."
  });
  if (!outputSchemaPass) blockers.push("unsupported-output-schema-keyword");
  const commandActionPolicyPass = JSON.stringify(allowedCommandPrefixes) === JSON.stringify(WAVE5_ALLOWED_COMMAND_PREFIXES) && commandItemAllowed({
    type: "commandExecution",
    command: "/bin/zsh -lc \"sed -n '1,320p' TASK.md\"",
    commandActions: [{ type: "read", command: "sed -n '1,320p' TASK.md", name: "TASK.md", path: "TASK.md" }]
  }, allowedCommandPrefixes) && commandItemAllowed({
    type: "commandExecution",
    command: "/bin/zsh -lc 'rg -n \"applyCommand|balance|event|command\" src test'",
    commandActions: [{ type: "search", command: "rg -n 'applyCommand|balance|event|command' src test", query: "applyCommand|balance|event|command", path: "src" }]
  }, allowedCommandPrefixes) && !commandItemAllowed({
    type: "commandExecution",
    command: "/bin/zsh -lc \"curl https://example.invalid\"",
    commandActions: [{ type: "unknown", command: "curl https://example.invalid" }]
  }, allowedCommandPrefixes) && !commandItemAllowed({
    type: "commandExecution",
    command: "/bin/zsh -lc \"rg -n 'safe|query' src | node exploit.mjs\"",
    commandActions: [{ type: "search", command: "rg -n 'safe|query' src | node exploit.mjs", query: "safe|query", path: "src" }]
  }, allowedCommandPrefixes);
  checks.push({
    id: "provider-command-action-policy",
    pass: commandActionPolicyPass,
    rule: "Validate App Server commandActions rather than its shell-formatted display command."
  });
  if (!commandActionPolicyPass) blockers.push("command-action-policy-invalid");
  const version = (await command("codex", ["--version"])).stdout;
  checks.push({ id: "codex-cli-version", pass: version === expectedCliVersion, expected: expectedCliVersion, observed: version });
  if (version !== expectedCliVersion) blockers.push("codex-cli-version-drift");

  const fixtureRevision = await command("git", ["-C", frameworkRoot, "merge-base", "--is-ancestor", protocol.fixture_source_revision, "HEAD"]);
  checks.push({
    id: "fixture-source-provenance",
    pass: fixtureRevision.status === 0,
    expected_ancestor_revision: protocol.fixture_source_revision,
    note: "Pinned content digests below, rather than later protocol metadata edits, establish fixture byte identity."
  });
  if (fixtureRevision.status !== 0) blockers.push("fixture-source-provenance-missing");

  for (const caseDefinition of protocol.cases) {
    const observed = await caseDigest(caseDefinition.id);
    const pass = observed === caseDefinition.bundle_sha256;
    checks.push({ id: `case-bundle-${caseDefinition.id}`, pass, expected: caseDefinition.bundle_sha256, observed });
    if (!pass) blockers.push(`case-bundle-drift:${caseDefinition.id}`);
  }
  for (const [relative, expected, id] of [
    ["launch-instruction.md", protocol.launch_instruction.sha256, "launch-instruction"],
    ["tool-policy.json", protocol.tool_policy.sha256, "tool-policy"]
  ]) {
    const observed = await fileDigest(relative);
    const pass = observed === expected;
    checks.push({ id, pass, expected, observed });
    if (!pass) blockers.push(`${id}-drift`);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const validation = validateValidationProgramManifest(manifest);
  checks.push({ id: "manifest-semantics", pass: validation.valid, errors: validation.errors });
  if (!validation.valid) blockers.push("invalid-validation-manifest");

  const candidateMap = JSON.parse(await fs.readFile(candidateMapPath, "utf8"));
  for (const candidate of candidateMap.participants) {
    const status = await git(candidate.root, ["status", "--porcelain=v1"]);
    const currentRevision = await git(candidate.root, ["rev-parse", "HEAD"]);
    const pass = status === "" && currentRevision === candidate.revision;
    checks.push({ id: `candidate-${candidate.directory}`, pass, clean: status === "", expected_revision: candidate.revision, observed_revision: currentRevision });
    if (!pass) blockers.push(`candidate-drift:${candidate.directory}`);
    if (candidate.condition === "minimal") {
      const hasAiOrg = await fs.access(path.join(candidate.root, ".ai-org")).then(() => true).catch(() => false);
      checks.push({ id: `minimal-boundary-${candidate.directory}`, pass: !hasAiOrg });
      if (hasAiOrg) blockers.push(`minimal-treatment-contaminated:${candidate.directory}`);
    }
  }

  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0107-schema-"));
  const schemaDigests = {};
  try {
    const generated = await command("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    if (generated.status !== 0) throw new Error(`schema generation failed: ${generated.stderr}`);
    for (const [name, expected] of Object.entries(expectedSchemaDigests)) {
      const observed = sha256(await fs.readFile(path.join(schemaRoot, "v2", name)));
      schemaDigests[name] = observed;
      const pass = observed === expected;
      checks.push({ id: `app-server-schema-${name}`, pass, expected, observed });
      if (!pass) blockers.push(`app-server-schema-drift:${name}`);
    }
  } finally {
    await fs.rm(schemaRoot, { recursive: true, force: true });
  }

  let modelAvailable = false;
  const connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], { cwd: coordinatorRoot });
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-wave-5a-preflight", title: "Temple Wave 5A Preflight", version: "1" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const models = modelsFrom(await connection.request("model/list", {}));
    const model = models.find((entry) => modelId(entry) === protocol.model.requested_model);
    modelAvailable = Boolean(model && modelEfforts(model).includes(protocol.model.requested_reasoning_effort));
    checks.push({ id: "requested-model", pass: modelAvailable, model: protocol.model.requested_model, reasoning_effort: protocol.model.requested_reasoning_effort });
    if (!modelAvailable) blockers.push("requested-model-unavailable");
  } finally {
    await connection.close().catch(() => {});
  }

  const approval = await readApproval();
  checks.push({ id: "no-new-payment-owner-confirmation", pass: approval.accepted, source: approval.accepted ? path.relative(frameworkRoot, approvalPath) : null });
  if (!approval.accepted) blockers.push("owner-confirmation-required");
  return {
    schema_version: "temple.wave-5a-preflight/v1",
    work_item_id: expectedWorkItemId,
    generated_at: new Date().toISOString(),
    pass: blockers.length === 0,
    generation_ready: blockers.length === 0,
    blockers,
    checks,
    cli_version: version,
    schema_digests: schemaDigests,
    model_generation_performed: false,
    billing_guarantee_available: false,
    reactive_token_interrupt: true
  };
}

async function resolvedProgram() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const candidateMap = JSON.parse(await fs.readFile(candidateMapPath, "utf8"));
  const byId = new Map(candidateMap.participants.map((entry) => [entry.id, entry]));
  const launchInstruction = path.join(fixtureRoot, "launch-instruction.md");
  const participants = manifest.participants.map((participant) => {
    const candidate = byId.get(participant.id);
    if (!candidate) throw new Error(`candidate mapping missing for ${participant.id}`);
    const instructions = new Map();
    for (const wave of manifest.waves) {
      for (const turn of wave.turns.filter((entry) => entry.project_id === participant.id)) instructions.set(turn.id, launchInstruction);
    }
    return {
      ...participant,
      root: candidate.root,
      project: { id: participant.expected_project_id },
      instructions,
      case_id: candidate.case_id,
      condition: candidate.condition,
      baseline_revision: candidate.revision
    };
  });
  return {
    manifest,
    manifest_path: manifestPath,
    manifest_digest: sha256(JSON.stringify(stableValue(manifest))),
    coordinator_root: coordinatorRoot,
    allowed_root: labRoot,
    participants
  };
}

async function runTests(root, caseId) {
  const publicResult = await command("npm", ["test"], { cwd: root, timeout: 300000, env: { ...process.env, CI: "1" } });
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), `temple-wave5-${caseId}-`));
  let acceptanceResult;
  try {
    await fs.mkdir(path.join(temporaryRoot, "candidate"), { recursive: true });
    await fs.cp(path.join(root, "src"), path.join(temporaryRoot, "candidate/src"), { recursive: true });
    await fs.mkdir(path.join(temporaryRoot, "evaluator"), { recursive: true });
    await fs.copyFile(
      path.join(fixtureRoot, caseId, "evaluator/acceptance.test.mjs"),
      path.join(temporaryRoot, "evaluator/acceptance.test.mjs")
    );
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

async function changedPaths(root) {
  const output = await git(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  return output.split("\0").filter(Boolean).map((record) => record.slice(3)).filter(Boolean).sort();
}

function allowedPath(candidate) {
  return candidate === "src" || candidate.startsWith("src/") || candidate === "test" || candidate.startsWith("test/");
}

async function appendJsonLine(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, `${JSON.stringify(value)}\n`, { encoding: "utf8", mode: 0o600 });
}

async function ensureBlindSalt() {
  const file = path.join(coordinatorRoot, "sealed/salt.txt");
  try {
    return (await fs.readFile(file, "utf8")).trim();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const salt = randomBytes(32).toString("hex");
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${salt}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    return salt;
  }
}

async function exportCandidate({ participant, turn, usage, completion, tests, startedAt, completedAt, launchRevision, candidateRevision, modelEvidence }) {
  const salt = await ensureBlindSalt();
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
    completion,
    usage: {
      input_tokens: null,
      cached_input_tokens: null,
      output_tokens: null,
      reasoning_output_tokens: null,
      total_tokens: null,
      latency_ms: null
    }
  };
  const sealed = {
    schema_version: "temple.wave-5a-sealed-mapping/v1",
    package_id: packageId,
    evidence_id: evidenceId,
    case_id: participant.case_id,
    condition_id: participant.condition,
    candidate_repository_path: participant.root,
    launch_revision: launchRevision,
    candidate_revision: candidateRevision,
    usage,
    latency_ms: Date.parse(completedAt) - Date.parse(startedAt),
    model: modelEvidence,
    turn_id: turn.id,
    quality_score_frozen: false,
    raw_prompt_retained: false,
    raw_response_retained: false,
    hidden_reasoning_retained: false
  };
  await fs.mkdir(path.join(coordinatorRoot, "blind"), { recursive: true });
  await fs.mkdir(path.join(coordinatorRoot, "sealed"), { recursive: true });
  await fs.writeFile(path.join(coordinatorRoot, "blind", `${packageId}.json`), `${JSON.stringify(blind, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  await fs.writeFile(path.join(coordinatorRoot, "sealed", `${packageId}.json`), `${JSON.stringify(sealed, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  return { package_id: packageId, evidence_id: evidenceId };
}

async function launchTurn({ turn, participant, instruction_path: instructionPath, signal, onUsage }) {
  const launchRevision = await git(participant.root, ["rev-parse", "HEAD"]);
  const instruction = await fs.readFile(instructionPath, "utf8");
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
    if (connection && threadId && turnId) {
      await connection.request("turn/interrupt", { threadId, turnId }, 15000).catch(() => {});
    }
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
          usageQueue = usageQueue.then(() => onUsage(usage));
        }
      }
      const protocolViolation = protocolViolationForMessage(message, { turnId, allowedCommandPrefixes });
      if (protocolViolation?.code === "model-rerouted") {
        reroute = { from: params.fromModel ?? params.from_model ?? null, to: params.toModel ?? params.to_model ?? null };
      }
      if (protocolViolation) void interrupt(`${protocolViolation.code}:${protocolViolation.message}`);
      if (message.method === "item/completed" && (!turnId || params.turnId === turnId) && params.item?.type === "agentMessage") {
        completionText = params.item.text;
      }
      if (message.method === "turn/completed" && (!turnId || params.turn?.id === turnId)) {
        terminal = params.turn;
        resolveTerminal(params.turn);
      }
    },
    onRequest(message, responder) {
      if (["item/commandExecution/requestApproval", "item/fileChange/requestApproval", "item/permissions/requestApproval"].includes(message.method)) {
        try {
          responder.respond(buildCodexRuntimeRequestResponse(message.method, message.params, { decision: "decline" }));
        } catch {
          // The turn is interrupted below; no alternate permission is granted.
        }
      }
      const protocolViolation = protocolViolationForMessage(message, { turnId, direction: "request", allowedCommandPrefixes });
      if (protocolViolation) void interrupt(`${protocolViolation.code}:${protocolViolation.message}`);
    }
  });

  const abortHandler = () => { void interrupt(String(signal.reason?.message ?? "bounded-stop")); };
  signal.addEventListener("abort", abortHandler, { once: true });
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-wave-5a", title: "Temple Wave 5A", version: "1" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    let threadResponse;
    try {
      threadResponse = await connection.request("thread/start", {
        model: turn.requested_model,
        cwd: participant.root,
        approvalPolicy: "never",
        sandbox: "workspace-write",
        serviceName: `temple-wave-5a-${turn.id}`,
        developerInstructions,
        ...wave5ThreadIsolation(participant.root)
      });
    } catch (error) {
      const reason = error.providerReason ? `: ${error.providerReason}` : "";
      throw Object.assign(new Error(`Provider rejected thread/start${reason}`), { code: "provider-thread-start-rejected" });
    }
    threadId = threadResponse?.thread?.id;
    if (!threadId) throw Object.assign(new Error("thread/start did not return a thread ID"), { code: "thread-start-invalid" });
    if (threadResponse.model !== turn.requested_model) {
      throw Object.assign(new Error("thread/start did not acknowledge the requested model"), { code: "model-profile-mismatch" });
    }
    const turnResponse = await connection.request("turn/start", {
      threadId,
      clientUserMessageId: `wave5a-${turn.id}`,
      input: [{ type: "text", text: instruction }],
      turnTrigger: "user",
      cwd: participant.root,
      approvalPolicy: "never",
      sandboxPolicy: { type: "workspaceWrite", writableRoots: [participant.root], networkAccess: false },
      model: turn.requested_model,
      effort: turn.requested_reasoning_effort,
      outputSchema: completionSchema
    });
    turnId = turnResponse?.turn?.id;
    if (!turnId) throw Object.assign(new Error("turn/start did not return a turn ID"), { code: "turn-start-invalid" });
    await terminalPromise;
    await usageQueue;
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (violation) throw Object.assign(new Error(violation), { code: violation.split(":")[0] });
    const terminalProblem = terminalFailure(terminal);
    if (terminalProblem) throw Object.assign(new Error(terminalProblem.message), { code: terminalProblem.code });
    if (!latestUsage || !Number.isSafeInteger(latestUsage.total_tokens)) throw Object.assign(new Error("detailed Token usage is missing"), { code: "usage-missing" });
    if (reroute) throw Object.assign(new Error("model rerouted"), { code: "model-rerouted" });

    const completion = parseStructuredCompletion(completionText);
    const changed = await changedPaths(participant.root);
    const disallowed = changed.filter((candidate) => !allowedPath(candidate));
    if (disallowed.length > 0) throw Object.assign(new Error(`out-of-scope changes: ${disallowed.join(", ")}`), { code: "path-allowlist-violation" });
    const tests = await runTests(participant.root, participant.case_id);
    if (changed.length > 0) {
      await git(participant.root, ["add", "--", "src", "test"]);
      await git(participant.root, ["commit", "-m", `Complete ${participant.case_id} candidate`]);
    }
    const candidateRevision = await git(participant.root, ["rev-parse", "HEAD"]);
    const remaining = await changedPaths(participant.root);
    if (remaining.length > 0) throw Object.assign(new Error(`candidate remained dirty: ${remaining.join(", ")}`), { code: "dirty-candidate-end" });
    const completedAt = new Date().toISOString();
    const normalizedCompletion = {
      ...completion,
      changed_paths: changed,
      test_command: "npm test",
      test_result: tests.public
    };
    const modelEvidence = {
      requested_model: turn.requested_model,
      acknowledged_model: threadResponse.model,
      requested_reasoning_effort: turn.requested_reasoning_effort,
      observed_thread_reasoning_effort: threadResponse.reasoningEffort ?? null,
      effective_turn_reasoning_effort: null,
      reasoning_effort_source: "turn-request",
      rerouted: false
    };
    const blind = await exportCandidate({
      participant,
      turn,
      usage: latestUsage,
      completion: normalizedCompletion,
      tests,
      startedAt,
      completedAt,
      launchRevision,
      candidateRevision,
      modelEvidence
    });
    await appendJsonLine(path.join(coordinatorRoot, "run-observations.jsonl"), {
      schema_version: "temple.wave-5a-turn-observation/v1",
      turn_id: turn.id,
      participant_id: participant.id,
      started_at: startedAt,
      completed_at: completedAt,
      launch_revision: launchRevision,
      candidate_revision: candidateRevision,
      tests,
      usage: latestUsage,
      model: modelEvidence,
      package_id: blind.package_id,
      raw_prompt_retained: false,
      raw_response_retained: false,
      automatic_retry: false,
      fallback_used: false
    });
    return {
      status: "completed",
      usage: latestUsage,
      launch_revision: launchRevision,
      after_revision: candidateRevision,
      tests,
      package_id: blind.package_id
    };
  } finally {
    signal.removeEventListener("abort", abortHandler);
    await connection?.close().catch(() => {});
  }
}

const preflight = await protocolPreflight();
await fs.writeFile(preflightOutputPath, `${JSON.stringify(preflight, null, 2)}\n`, "utf8");
if (process.argv.includes("--preflight-only")) {
  process.stdout.write(`${JSON.stringify(preflight, null, 2)}\n`);
  process.exit(preflight.blockers.filter((entry) => entry !== "owner-confirmation-required").length === 0 ? 0 : 2);
}
if (!preflight.pass) {
  throw new Error(`Wave 5A generation is blocked: ${preflight.blockers.join(", ")}`);
}
const resolved = await resolvedProgram();
const result = await runValidationProgram({ resolved, launchTurn });
const output = {
  schema_version: "temple.wave-5a-run-result/v1",
  work_item_id: expectedWorkItemId,
  generated_at: new Date().toISOString(),
  preflight_digest: sha256(JSON.stringify(stableValue(preflight))),
  manifest_digest: resolved.manifest_digest,
  status: result.state.status,
  counters: result.state.counters,
  warnings: result.state.warnings,
  stop: result.state.stop,
  state_path: result.statePath,
  events_path: result.eventsPath,
  feasibility_only: true,
  causal_savings_claim: false,
  temple_superiority_claim: false,
  automatic_routing_authorized: false
};
await fs.writeFile(path.join(coordinatorRoot, "run-result.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
if (result.state.status !== "completed") process.exitCode = 2;
