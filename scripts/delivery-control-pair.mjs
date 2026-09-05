#!/usr/bin/env node
// Bounded delivery comparison v2. Preparation/readiness never start a model turn.
import crypto from "node:crypto";
import { execFile as execCallback } from "node:child_process";
import fs from "node:fs/promises";
import { realpathSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import { createJsonRpcProcess, buildCodexRuntimeRequestResponse } from "../src/codex-app-server-provider.mjs";
import { isolateWave5CodexEnvironment, normalizeTokenUsage, wave5ThreadIsolation } from "../src/app-server-protocol-replay.mjs";
import { representativeAppServerArguments, representativeTurnSandboxPolicy, representativeNoToolPassiveItemTypes } from "./run-representative-microservice-comparison.mjs";
import { commandPolicyContract, commandGuide, classifyCommandItem } from "./delivery-command-policy.mjs";

const execFile = promisify(execCallback);
const sourceDefault = path.resolve(import.meta.dirname, "..");
const schemaNames = ["ThreadStartParams", "TurnStartParams", "ItemStartedNotification", "ItemCompletedNotification", "ThreadTokenUsageUpdatedNotification"];
const gitEnv = { GIT_AUTHOR_NAME: "Delivery Fixture", GIT_AUTHOR_EMAIL: "fixture@example.invalid", GIT_COMMITTER_NAME: "Delivery Fixture", GIT_COMMITTER_EMAIL: "fixture@example.invalid", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: os.devNull, GIT_TERMINAL_PROMPT: "0", GIT_PAGER: "cat" };
export const digest = value => `sha256:${crypto.createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(stable(value))).digest("hex")}`;
function stable(value) { return Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])])) : value; }
function requireThat(condition, message) { if (!condition) throw new Error(message); }
export function subprocessEnvironment(extra = {}) {
  const env = isolateWave5CodexEnvironment({ ...process.env, ...extra });
  for (const key of Object.keys(env)) if (key.startsWith("GIT_") || ["NODE_TEST_CONTEXT", "NODE_OPTIONS"].includes(key)) delete env[key];
  return { ...env, ...gitEnv };
}
async function command(cwd, program, args, extra = {}) {
  const start = Date.now();
  try { const r = await execFile(program, args, { cwd, env: subprocessEnvironment(extra), timeout: 30000, maxBuffer: 1024 * 1024 }); return { command: [program, ...args], exit_code: 0, output: r.stdout + r.stderr, elapsed_ms: Date.now() - start }; }
  catch (e) { return { command: [program, ...args], exit_code: Number.isInteger(e.code) ? e.code : -1, output: String(e.stdout ?? "") + String(e.stderr ?? "") + (e.killed ? "\nprocess limit" : ""), elapsed_ms: Date.now() - start }; }
}
async function checked(cwd, program, args, extra) { const r = await command(cwd, program, args, extra); requireThat(r.exit_code === 0, `${program} ${args.join(" ")}: ${r.output}`); return r.output.trim(); }
async function git(root, args) { return checked(root, "git", args); }
async function write(root, name, value) { const target = path.join(root, name); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n"); }
async function readJson(file) { return JSON.parse(await fs.readFile(file, "utf8")); }
function within(root, candidate) { const relative = path.relative(root, candidate); return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)); }
function canonical(file) { try { return realpathSync(file); } catch { return path.join(canonical(path.dirname(file)), path.basename(file)); } }
async function files(root, relative = "") {
  const result = {};
  for (const entry of (await fs.readdir(path.join(root, relative), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".git") continue;
    const name = path.posix.join(relative, entry.name);
    requireThat(!entry.isSymbolicLink(), `symlink:${name}`);
    if (entry.isDirectory()) Object.assign(result, await files(root, name));
    else result[name] = digest(await fs.readFile(path.join(root, name)));
  }
  return result;
}
export async function sourceDigest(root) {
  const names = (await git(root, ["ls-files", "-z", "--", "bin", "src", "project-overlay", "packs", "package.json", "package-lock.json", "scripts/run-representative-microservice-comparison.mjs", "scripts/analyze-representative-microservice-comparison.mjs"])).split("\0").filter(Boolean);
  names.push("scripts/delivery-control-pair.mjs", "test/delivery-control-pair.test.mjs", "scripts/delivery-command-policy.mjs", "test/delivery-command-policy.test.mjs", "scripts/prepare-optimized-delivery-comparison.mjs", "test/optimized-delivery-comparison.test.mjs");
  return digest(Object.fromEntries(await Promise.all([...new Set(names)].sort().map(async n => [n, digest(await fs.readFile(path.join(root, n)))]))));
}
export async function retainedArtifactDigest(root) { const snapshot = await files(root); delete snapshot["seal.json"]; return digest(snapshot); }
async function gitSafety(root) {
  const directory = path.join(root, ".git"); requireThat((await fs.lstat(directory)).isDirectory(), "git-directory-boundary");
  return digest({ config: digest(await fs.readFile(path.join(directory, "config"))), hooks: await files(path.join(directory, "hooks")), exclude: digest(await fs.readFile(path.join(directory, "info/exclude"))) });
}

export const brief = `# Shipping quote delivery\n\nImplement synchronous immutable quoteOrder(lines, options = {}) in order.mjs.\n\nlines is an array of rows { unitCents, quantity }. unitCents is a nonnegative safe integer; quantity is a positive safe integer. Reject other values, including coercible strings, null rows, overflowed products and sums.\n\nAn omitted or whole-argument undefined options uses defaults. Otherwise options must be a non-null object with prototype Object.prototype or null. Optional shippingCents defaults to 500 and freeShippingAtCents defaults to 3000. Both must be nonnegative safe integers when supplied; an explicitly present property with value undefined is invalid. Ignore extra properties. Do not mutate inputs.\n\nReturn exactly { subtotalCents, shippingCents, totalCents }. Empty orders have zero shipping. Nonempty orders at or above the threshold have zero shipping, otherwise the configured shipping is charged. Zero-price nonempty orders remain nonempty. A zero threshold grants free shipping. Reject total overflow.\n\nInvalid shapes, types and values throw TypeError; arithmetic overflow throws RangeError. Preserve test/public.test.mjs exactly; add meaningful tests in test/added.test.mjs. Run node --test test/*.test.mjs. Commit the implementation and tests, then leave DELIVERY.json and HANDOFF.md with the full exact candidate SHA, command and observed result, completed work and unresolved issues.\n\nA fresh verifier independently reads the repository, identifies that candidate, runs public and added product tests and records accept/reject plus evidence in VERIFICATION.json. The verifier may not edit any product file. No second feature, package installation, network, external action, retries or fallback.\n`;
export const fixture = Object.freeze({
  "order.mjs": "export function quoteOrder(lines, options = {}) { throw new Error('Not implemented'); }\n",
  "package.json": JSON.stringify({ name: "shipping-quote", private: true, type: "module", scripts: { test: "node --test test/*.test.mjs" } }, null, 2) + "\n",
  "README.md": "# Shipping quote\n\nRead BRIEF.md for the approved task. Run `node --test test/*.test.mjs` (no dependencies). Use Git, meaningful tests, exact candidate evidence and a concise HANDOFF.md. The fresh verifier records VERIFICATION.json and an independent accept/reject decision. This local fixture stops after verification.\n",
  "BRIEF.md": brief,
  "test/public.test.mjs": "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { quoteOrder } from '../order.mjs';\ntest('charged order', () => assert.deepEqual(quoteOrder([{unitCents:400,quantity:2}]), {subtotalCents:800,shippingCents:500,totalCents:1300}));\ntest('exact threshold', () => assert.equal(quoteOrder([{unitCents:1500,quantity:2}]).shippingCents,0));\ntest('empty', () => assert.deepEqual(quoteOrder([]), {subtotalCents:0,shippingCents:0,totalCents:0}));\ntest('no coercion', () => assert.throws(() => quoteOrder([{unitCents:'100',quantity:1}]),TypeError));\n"
});
export const completionSchema = Object.freeze({ type: "object", additionalProperties: false, required: ["candidate_revision", "test_command", "test_exit_code", "decision", "summary", "unresolved"], properties: {
  candidate_revision: { type: "string" }, test_command: { type: "string" }, test_exit_code: { type: "integer" }, decision: { type: "string", enum: ["delivered", "accept", "reject"] }, summary: { type: "string" }, unresolved: { type: "array", items: { type: "string" } }
} });
const completionValidator = new Ajv().compile(completionSchema);

async function setupTemple(root, sourceRoot, labRoot, setup) {
  const config = { schema_version: "temple.init/v1", project: { id: "shipping-quote", name: "Shipping Quote" }, naming_mode: "manual", agents: [
    { display_name: "Coordinator", positions: ["engineering_manager", "tech_lead", "release_manager", "observer"] },
    { display_name: "Planner", positions: ["product_manager", "ux_designer", "ui_designer"] },
    { display_name: "Builder", positions: ["developer"] }, { display_name: "Verifier", positions: ["quality_evaluator", "independent_qa"] }
  ] };
  await write(labRoot, "setup/temple-init.json", config);
  async function cli(args, init = false) {
    const result = await command(root, process.execPath, [init ? path.join(sourceRoot, "bin/temple.mjs") : "./templew.mjs", ...args], { TEMPLE_CLI_PATH: path.join(sourceRoot, "bin/temple.mjs") });
    setup.push(result); requireThat(result.exit_code === 0, `temple-setup:${result.output}`);
  }
  await cli(["init", ".", "--config", path.join(labRoot, "setup/temple-init.json"), "--integrate-agents"], true);
  await cli(["work-item", "create", ".", "--title", "Deliver shipping quote", "--scope", "BRIEF.md: one bounded local feature and fresh verifier", "--acceptance", "Preserved public tests, meaningful added tests, exact Git delivery and independent accept/reject", "--affected-path", "order.mjs", "--affected-path", "test/added.test.mjs", "--spec-mode", "gate-evidence", "--ui-mode", "not-applicable", "--workflow-profile", "lean", "--risk-tier", "low", "--scope-class", "bounded", "--profile-rationale", "One local pure function; no external effects", "--profile-evidence", "BRIEF.md"]);
  await cli(["work-item", "configure", ".", "--work-item", "WI-0001", "--agent-id", "agent-builder", "--base-revision", await git(root, ["rev-parse", "HEAD"]), "--parallel-mode", "sequential"]);
  await cli(["transition", ".", "--work-item", "WI-0001", "--to", "build", ...["work_order", "approved_scope", "acceptance_criteria", "technical_design", "risk_review", "profile_eligibility"].flatMap(k => ["--satisfy", `${k}=BRIEF.md`])]);
  await cli(["doctor", ".", "--json"]);
}

export async function preparePair({ labRoot, sourceRoot = sourceDefault, order: requestedOrder }) {
  sourceRoot = await fs.realpath(sourceRoot); labRoot = path.resolve(labRoot);
  requireThat(!within(sourceRoot, canonical(labRoot)), "lab-must-be-outside-source");
  await fs.mkdir(labRoot); labRoot = await fs.realpath(labRoot);
  const start = Date.now(), setup = [], mapping = {};
  // Freeze a random order before any candidate result. Opaque directory IDs prevent label-based oracle scoring.
  requireThat(requestedOrder === undefined || (Array.isArray(requestedOrder) && [...requestedOrder].sort().join() === "ordinary,temple"),"preparation-order");
  const order = requestedOrder ? [...requestedOrder] : crypto.randomInt(2) ? ["ordinary", "temple"] : ["temple", "ordinary"];
  try {
    for (const arm of order) {
      const armSetupStart = Date.now();
      const id = `repo-${crypto.randomBytes(5).toString("hex")}`, root = path.join(labRoot, id);
      await fs.mkdir(root); for (const [name, body] of Object.entries(fixture)) await write(root, name, body);
      const setupGit = async args => { const result = await command(root, "git", args); setup.push({ arm, ...result }); requireThat(result.exit_code === 0, `git-setup:${result.output}`); };
      for (const args of [["init", "-b", "main"], ["config", "user.name", "Delivery Fixture"], ["config", "user.email", "fixture@example.invalid"], ["add", "-A"], ["commit", "-m", "Initial product"]]) await setupGit(args);
      if (arm === "temple") await setupTemple(root, sourceRoot, labRoot, setup);
      else await write(root, "WORK.md", "# Delivery state\n\nBuild is approved by BRIEF.md. Builder owns order.mjs, test/added.test.mjs, DELIVERY.json and HANDOFF.md. Fresh verifier owns VERIFICATION.json. Use exact Git revisions and observed tests. Stop after one verification.\n");
      await setupGit(["add", "-A"]); await setupGit(["commit", "-m", "Prepare delivery workflow"]);
      const initialFiles = await files(root);
      const artifactBytes = (await Promise.all(Object.keys(initialFiles).map(async name => (await fs.stat(path.join(root, name))).size))).reduce((a, b) => a + b, 0);
      mapping[arm] = { id, revision: await git(root, ["rev-parse", "HEAD"]), files: initialFiles, git_safety_sha256: await gitSafety(root), artifact_bytes: artifactBytes, file_count: Object.keys(initialFiles).length, setup_elapsed_ms: Date.now() - armSetupStart };
    }
    const manifest = { schema_version: "temple.delivery-pair-manifest/v1", source_root: sourceRoot, source_revision: await git(sourceRoot, ["rev-parse", "HEAD"]), source_sha256: await sourceDigest(sourceRoot), fixture_sha256: digest(fixture), order, arms: mapping, setup_elapsed_ms: Date.now() - start, setup_commands: setup, model_generation_performed: false };
    await write(labRoot, "manifest.json", manifest); return manifest;
  } catch (error) { await write(labRoot, "setup-stopped.json", { reason: error.message, setup, elapsed_ms: Date.now() - start, model_generation_performed: false }); throw error; }
}

export function createProtocol(manifest, overrides = {}) {
  return { schema_version: "temple.delivery-pair-protocol/v2", work_item_id: "WI-0173", manifest_sha256: digest(manifest), source_sha256: manifest.source_sha256, fixture_sha256: digest(fixture), command_policy_sha256: digest(commandPolicyContract), output_schema_sha256: digest(completionSchema), process_contract_sha256: digest(deliveryProcessContract()), order: manifest.order, model: "gpt-5.6-terra", reasoning_effort: "medium", provider_contract_sha256: null, readiness_review: null,
    limits: { stages: 4, per_stage_ms: 360000, aggregate_ms: 1440000, per_stage_operational_tokens: null, aggregate_operational_tokens: null },
    policy: { fresh_threads: true, memories: false, network: false, fallback: false, retries: 0, cache: "uncontrolled-descriptive-only", effective_turn_effort: "unknown", account: "existing-included-allowance-only", purchases: false, resets: false }, ...overrides };
}
export function validateProtocol(p) {
  requireThat(p?.schema_version === "temple.delivery-pair-protocol/v2" && /^WI-[0-9]{4,}$/.test(p.work_item_id), "protocol-schema");
  requireThat(/^gpt-[a-z0-9.-]{1,64}$/.test(p.model) && ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"].includes(p.reasoning_effort), "protocol-route");
  requireThat(Array.isArray(p.order) && [...p.order].sort().join() === "ordinary,temple", "protocol-order");
  for (const k of ["manifest_sha256", "source_sha256", "fixture_sha256", "provider_contract_sha256", "command_policy_sha256", "output_schema_sha256", "process_contract_sha256"]) requireThat(/^sha256:[a-f0-9]{64}$/.test(p[k]), `protocol-${k}`);
  requireThat(p.limits?.stages === 4, "protocol-stage-limit");
  for (const [key, max] of [["per_stage_ms", 360000], ["aggregate_ms", 1440000], ["per_stage_operational_tokens", 200000], ["aggregate_operational_tokens", 800000]]) requireThat(Number.isSafeInteger(p.limits[key]) && p.limits[key] > 0 && p.limits[key] <= max, `protocol-limit:${key}`);
  requireThat(digest(p.policy) === digest(createProtocol({ order: [] }).policy), "protocol-policy");
  return true;
}
export function validateApproval(a, p) {
  validateProtocol(p);
  requireThat(a?.schema_version === "temple.delivery-pair-approval/v2" && a.status === "approved" && a.work_item_id === p.work_item_id && a.protocol_sha256 === digest(p), "approval-protocol");
  requireThat(typeof a.approved_by === "string" && a.approved_by.trim().length > 0 && typeof a.evidence_ref === "string" && a.evidence_ref.trim().length > 0 && Number.isFinite(Date.parse(a.approved_at)) && Date.parse(a.approved_at) <= Date.now(), "approval-authority");
  requireThat(a.account === "existing-included-allowance-only" && a.maximum_stage_turns === 4 && a.purchase === false && a.refill === false && a.reset === false && a.retries === 0 && a.fallback === false, "approval-account-boundary"); return true;
}

export function stageRequests({ root, arm, stage, protocol, threadId = "schema-preview" }) {
  const temple = arm === "temple";
  const processGuide = temple ? "First read AGENTS.md and TEMPLE.md. Resolve WI-0001 using node ./templew.mjs context resolve . --work-item WI-0001 --position " + (stage === "build" ? "developer" : "quality_evaluator") + " --compact --no-write --json. Read .agents/skills/temple-work/SKILL.md and the routed sources needed for your responsibility. You are " + (stage === "build" ? "agent-builder. Claim before editing with principal human, current full HEAD and branch main. After committing product/tests and writing delivery evidence, read the Lean delivery reference and use work-item deliver with the current claim ID, exact candidate revision and DELIVERY.json evidence. This single operation records handoff, releases your claim and enters Test; do not separately repeat these three mutations." : "agent-verifier, distinct from Builder, acting as quality_evaluator in Lean Test. Claim WI-0001 with principal human, current full HEAD and branch main. Inspect handoff and claim state, independently verify and record VERIFICATION.json. On accept, release your claim then transition test to done with test_evidence=VERIFICATION.json and lean_closeout=VERIFICATION.json. On reject, release your claim with the rejection reason and leave Test unresolved. Do not impersonate Builder or claim formal Independent QA; this is the experiment's fresh verification.") : "Read README.md, BRIEF.md and WORK.md. Use the ordinary Git/test/handoff workflow.";
  const instruction = `${processGuide}\nRead BRIEF.md for the complete product contract. ${stage === "build" ? "Implement order.mjs, add meaningful test/added.test.mjs, preserve all supplied files, run node --test test/*.test.mjs, commit only implementation and tests, then write DELIVERY.json and HANDOFF.md. DELIVERY.json must have candidate_revision, test_command, test_exit_code, decision (delivered), summary and unresolved. HANDOFF.md explains exact candidate, test result and next verifier obligations. Commit evidence separately if desired." : "Fresh verification only: read DELIVERY.json and HANDOFF.md, resolve and independently test the exact candidate. Do not modify order.mjs, tests or product documentation. Write VERIFICATION.json with candidate_revision, test_command, test_exit_code, decision (accept or reject), summary and unresolved. Reject defective products. No second feature."}\nReturn a structured record matching the evidence file's candidate_revision, test_command, test_exit_code, decision and unresolved exactly; summary wording may differ. Within this turn, edit/test iterations are allowed. After the final edit, rerun the complete tests and record the actual observed exit code for the final candidate. Exact test_command: node --test test/*.test.mjs. No hidden tests or expected answers are available to you.`;
  const developer = "One bounded local actor turn; no subagents, network, external tools, installations, user questions, extra actor-turn retries or fallback. No retries means no new actor turn or experiment retry, not a ban on tests: within this turn, iterate edits and tests normally, rerun all product tests after your last edit, and truthfully record that final observed result. Stay in this repository; never read memories, other repositories, coordinator files or parent paths. Use apply_patch for writes, node --test test/*.test.mjs for tests, node ./templew.mjs for Temple, and simple git/read commands. One shell command per call; no pipes, redirects, substitutions, environment changes or arbitrary scripts. The verifier may write only VERIFICATION.json and permitted .ai-org evidence. Do not edit supplied public tests, package.json, BRIEF.md, README.md or workflow instructions. Git hooks/configuration and symlinks are forbidden.";
  return { instruction,
    thread: { model: protocol.model, cwd: root, approvalPolicy: "never", sandbox: "workspace-write", serviceName: `delivery-${stage}`, config: { model_reasoning_effort: protocol.reasoning_effort }, developerInstructions: developer, ...wave5ThreadIsolation(root) },
    turn: { threadId, input: [{ type: "text", text: instruction + "\n\n" + commandGuide({arm,stage}) }], cwd: root, approvalPolicy: "never", sandboxPolicy: deliverySandboxPolicy(root, stage), model: protocol.model, effort: protocol.reasoning_effort, outputSchema: completionSchema }
  };
}
export function deliveryTempRoot(root, stage) { return path.join(path.dirname(root) + ".runtime", path.basename(root) + "-" + stage); }
export function deliverySandboxPolicy(root, stage) {
  return { ...representativeTurnSandboxPolicy(root), writableRoots: [root, path.join(root, ".git"), deliveryTempRoot(root, stage)], excludeTmpdirEnvVar: true, excludeSlashTmp: true };
}
function schemaCheck(schema, value) { const validate = new Ajv({ strict: false, validateFormats: false }).compile(schema); requireThat(validate(value), `provider-wire-schema:${JSON.stringify(validate.errors)}`); }
export function deliveryProcessContract() {
  const templates = ["ordinary", "temple"].flatMap(arm => ["build", "verify"].map(stage => {
    const request = stageRequests({root:"/assigned-repository",arm,stage,protocol:{model:"model-parameter",reasoning_effort:"effort-parameter"}});
    return {arm,stage,user:request.turn.input[0].text,developer:request.thread.developerInstructions,sandbox:request.turn.sandboxPolicy};
  }));
  return {version:"delivery-process/v6",templates,command_policy:commandPolicyContract,fixture_sha256:digest(fixture),output_schema:completionSchema,model_and_effort_are_parameters:true,temporary_environment:"stage-private-TMPDIR-in-sibling-runtime-directory; retained-separately-unsealed-operational-scratch",git_metadata:"explicit-assigned-repository-only; configuration-and-hooks-integrity-checked"};
}
async function validateReadinessReview(sourceRoot, protocol) {
  const review=protocol.readiness_review;
  requireThat(review?.status === "passed" && review.test_only !== true && review.reviewed_source_sha256 === protocol.source_sha256, "readiness-review-required");
  const assignments=(await readJson(path.join(sourceRoot,".ai-org/project/assignments.json"))).assignments;
  const developer=assignments.find(a=>a.position_id === "developer" && a.active)?.agent_id;
  const qa=assignments.find(a=>a.position_id === "independent_qa" && a.active)?.agent_id;
  requireThat(qa && developer && qa !== developer && review.reviewer_agent_id === qa && review.developer_agent_id === developer, "readiness-review-identity");
  requireThat(typeof review.evidence_ref === "string" && review.evidence_ref.startsWith(`.ai-org/artifacts/${protocol.work_item_id}/`) && within(canonical(path.join(sourceRoot,".ai-org/artifacts",protocol.work_item_id)),canonical(path.resolve(sourceRoot,review.evidence_ref))), "readiness-review-path");
  requireThat(digest(await fs.readFile(path.resolve(sourceRoot,review.evidence_ref))) === review.evidence_sha256,"readiness-review-drift");
  const ref=review.sandbox_evidence_ref;
  requireThat(typeof ref === "string" && ref.startsWith(`.ai-org/artifacts/${protocol.work_item_id}/`) && within(canonical(path.join(sourceRoot,".ai-org/artifacts",protocol.work_item_id)),canonical(path.resolve(sourceRoot,ref))),"sandbox-readiness-required");
  const bytes=await fs.readFile(path.resolve(sourceRoot,ref)), sandbox=JSON.parse(bytes);
  requireThat(digest(bytes) === review.sandbox_evidence_sha256 && sandbox.status === "passed" && sandbox.model_generation_performed === false && sandbox.completed_stages === 4 && sandbox.negative_write_checks === 2 && sandbox.source_sha256 === protocol.source_sha256 && sandbox.process_contract_sha256 === protocol.process_contract_sha256,"sandbox-readiness-drift");
}
export async function inspectProvider({ labRoot, sourceRoot = sourceDefault, providerFactory = createJsonRpcProcess, model: requestedModel = "gpt-5.6-terra", effort = "medium" }) {
  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "delivery-schema-"));
  let connection;
  try {
    const version = await checked(sourceRoot, "codex", ["--version"]);
    await checked(sourceRoot, "codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    const schemas = Object.fromEntries(await Promise.all(schemaNames.map(async name => [name, await readJson(path.join(schemaRoot, "v2", `${name}.json`))])));
    connection = providerFactory("codex", representativeAppServerArguments, { cwd: sourceRoot, env: subprocessEnvironment() });
    await connection.request("initialize", { clientInfo: { name: "delivery-readiness", version: "1" }, capabilities: { experimentalApi: false } }); connection.notify("initialized", {});
    const config = await connection.request("config/read", { cwd: sourceRoot, includeLayers: false }); memoryCheck(config);
    const models = await connection.request("model/list", {});
    const model = (models.data ?? models.models ?? []).find(m => (m.model ?? m.id) === requestedModel);
    requireThat(model && (model.supportedReasoningEfforts ?? []).some(e => (e.reasoningEffort ?? e) === effort), "provider-route-unavailable");
    const contract = { schema_version: "temple.delivery-provider/v2", cli_version: version, node_version: process.version, platform: process.platform, architecture: process.arch, arguments_sha256: digest(representativeAppServerArguments), schemas, model: requestedModel, effort, model_release_revision: null, memory_disabled: true, usage_finality_guarantee: "not-established", model_generation_performed: false };
    if (labRoot) await write(labRoot, "provider-contract.json", contract); return contract;
  } finally { await connection?.close(); await fs.rm(schemaRoot, { recursive: true, force: true }); }
}
function memoryCheck(config) { requireThat(config?.config?.memories?.use_memories === false && config?.config?.memories?.generate_memories === false && config?.config?.features?.memories === false, "memory-isolation"); }
export async function inspectReadiness({ labRoot, protocol, providerContract }) {
  validateProtocol(protocol); const manifest = await readJson(path.join(labRoot, "manifest.json"));
  requireThat(digest(manifest) === protocol.manifest_sha256 && digest(manifest.order) === digest(protocol.order), "manifest-drift");
  requireThat(await sourceDigest(manifest.source_root) === protocol.source_sha256 && manifest.source_sha256 === protocol.source_sha256, "source-drift");
  requireThat(digest(fixture) === protocol.fixture_sha256 && manifest.fixture_sha256 === protocol.fixture_sha256, "fixture-source-drift");
  requireThat(digest(commandPolicyContract) === protocol.command_policy_sha256 && digest(completionSchema) === protocol.output_schema_sha256 && digest(deliveryProcessContract()) === protocol.process_contract_sha256, "policy-or-output-schema-drift");
  requireThat(digest(providerContract) === protocol.provider_contract_sha256 && providerContract.arguments_sha256 === digest(representativeAppServerArguments) && providerContract.memory_disabled === true && providerContract.model === protocol.model && providerContract.effort === protocol.reasoning_effort, "provider-contract-drift");
  for (const arm of protocol.order) {
    const entry = manifest.arms[arm], root = path.join(labRoot, entry.id);
    requireThat(/^repo-[a-f0-9]{10}$/.test(entry.id) && within(await fs.realpath(labRoot), await fs.realpath(root)), "arm-path");
    requireThat(digest(await files(root)) === digest(entry.files) && await git(root, ["rev-parse", "HEAD"]) === entry.revision && await git(root, ["status", "--porcelain"]) === "", "fixture-drift");
    requireThat(await gitSafety(root) === entry.git_safety_sha256, "git-safety-drift");
    for (const [name, body] of Object.entries(fixture)) requireThat(entry.files[name] === digest(body), `fixture-mismatch:${name}`);
    for (const stage of ["build", "verify"]) { const request = stageRequests({ root, arm, stage, protocol }); schemaCheck(providerContract.schemas.ThreadStartParams, request.thread); schemaCheck(providerContract.schemas.TurnStartParams, request.turn); }
  }
  if (protocol.readiness_review && !protocol.readiness_review.test_only) await validateReadinessReview(manifest.source_root,protocol);
  return { schema_version: "temple.delivery-readiness/v2", protocol_sha256: digest(protocol), ready: true, model_generation_performed: false, subject_generation_permitted: false, independent_qa_review: protocol.readiness_review?.status ?? "pending", approval_required: true };
}

const passiveTypes = new Set(representativeNoToolPassiveItemTypes);
const itemTypes = new Set([...passiveTypes,"commandExecution","fileChange"]);
const knownMethods = new Set(["configWarning","warning","thread/started","thread/status/changed","turn/started","turn/completed","item/started","item/completed","item/commandExecution/outputDelta","thread/tokenUsage/updated","account/rateLimits/updated","mcpServer/startupStatus/updated","remoteControl/status/changed"]);
const failureCodes = new Set(["model-acknowledgement","effort-acknowledgement","thread-id-missing","turn-id-missing","wrong-thread-event","wrong-turn-event","provider-route-or-approval","provider-terminal","missing-token-usage","invalid-token-usage","usage-regressed","usage-identity-missing","completion-schema","wall-clock-limit","operational-token-limit","provider-protocol","provider-exit","runtime-request","event-count-limit","duplicate-item-start","duplicate-item-completion","completion-without-start","unmatched-item-start","command-outcome-missing","invalid-event-id","invalid-event-shape","command-envelope-changed","memory-isolation","aggregate-wall-clock-limit","source-drift","git-safety-drift","arm-initial-state-drift","write-scope","public-file-changed","verifier-product-write","symlink","candidate-revision","delivery-record-schema","test-command-claim","test-result-mismatch","actor-test-execution-unobserved","verifier-revision","handoff-evidence","incorrect-verifier-acceptance","completion-file-disagreement","installed-provider-drift","synthetic-review-required"]);
export function safeFailureCode(error) {
  const value=typeof error === "string" ? error : error?.message;
  if (failureCodes.has(value)) return value;
  for (const prefix of ["provider-wire-schema","write-scope","public-file-changed","candidate-content","product-test-write-scope","symlink"]) if (typeof value === "string" && value.startsWith(prefix+":")) return prefix;
  return "observation-invalid";
}
function eventDecision(message, context) {
  const p=message?.params??{};
  if (p.threadId && context.threadId && p.threadId !== context.threadId) return {allowed:false,rule:"wrong-thread-event"};
  if (p.turnId && context.turnId && p.turnId !== context.turnId) return {allowed:false,rule:"wrong-turn-event"};
  if (/rerout|requestApproval|requestUserInput/i.test(message?.method??"")) return {allowed:false,rule:"provider-route-or-approval"};
  if (!["item/started","item/completed"].includes(message?.method)) return {allowed:true,rule:"not-item"};
  const item=p.item;
  if (!item || !itemTypes.has(item.type)) return {allowed:false,rule:"forbidden-item"};
  if (item.type === "commandExecution") return classifyCommandItem(item,context);
  if (item.type !== "fileChange") return {allowed:true,rule:"passive-item"};
  if (!Array.isArray(item.changes)||!item.changes.length||item.changes.length>16) return {allowed:false,rule:"malformed-file-change"};
  for (const change of item.changes) {
    if (typeof change.path!=="string"||change.path.length>4096||!within(canonical(context.root),canonical(path.resolve(context.root,change.path)))) return {allowed:false,rule:"file-path-escape"};
    const relative=path.relative(canonical(context.root),canonical(path.resolve(context.root,change.path)));
    if (!allowedPatch(relative,context.stage,context.arm)) return {allowed:false,rule:"file-write-scope"};
    if (change.kind?.move_path) {
      const target=canonical(path.resolve(context.root,change.kind.move_path));
      if (!within(canonical(context.root),target)||!allowedPatch(path.relative(canonical(context.root),target),context.stage,context.arm)) return {allowed:false,rule:"file-write-scope"};
    }
  }
  return {allowed:true,rule:"scoped-patch"};
}
export function eventViolation(message,context) { const d=eventDecision(message,context); return d.allowed?null:d.rule; }
function allowedPatch(name, stage, arm) { return (stage === "build" ? ["order.mjs", "test/added.test.mjs", "DELIVERY.json", "HANDOFF.md"] : ["VERIFICATION.json"]).includes(name) || (arm === "temple" && /^\.ai-org\/artifacts\/WI-0001\/[^/]+\.(?:md|json)$/.test(name)); }
function allowedWrite(name, stage, arm) { return allowedPatch(name, stage, arm) || (arm === "temple" && ([".ai-org/events/events.jsonl", ".ai-org/work-items/WI-0001.json", ".ai-org/project/evidence.json"].includes(name) || name.startsWith(".ai-org/views/"))); }
function usageValue(params) { const u = normalizeTokenUsage(params); requireThat(u && u.cached_input_tokens <= u.input_tokens && u.reasoning_output_tokens <= u.output_tokens && u.total_tokens === u.input_tokens + u.output_tokens, "invalid-token-usage"); return { ...u, non_cached_input_tokens: u.input_tokens - u.cached_input_tokens, operational_tokens: u.input_tokens - u.cached_input_tokens + u.output_tokens }; }

async function runStage({ root, arm, stage, protocol, contract, sourceRoot, providerFactory, deadline, aggregateBefore, diagnosticKey, expectedClaimRevision }) {
  const start = Date.now(), hash = value => "hmac-sha256:" + crypto.createHmac("sha256", diagnosticKey).update(String(value)).digest("hex");
  const observation = { arm, stage, status: "stopped", usage: null, usage_finality: "last-observed-not-account-final", usage_observed_at_ms: null, command_count: 0, command_started_count: 0, command_completed_count: 0, patch_started_count: 0, patch_completed_count: 0, tool_count: 0, reported_output_bytes: 0, events: [], observed_test_exit_codes: [], requested_model: protocol.model, acknowledged_model: null, model_acknowledgement: "not-observed", requested_effort: protocol.reasoning_effort, observed_thread_effort: null, effective_turn_effort: null, terminal_status: null, interrupt_requested: false, interrupt_acknowledged: false, retry_count: 0, fallback_count: 0 };
  let connection, threadId, turnId, completion, terminal, stop, turnStart, wake, abort, interruptPromise, closing = false, terminalWake;
  const terminalDone = new Promise(resolve => { terminalWake = resolve; });
  const pending = [], started = new Map(), completed = new Set();
  const wireValidators=Object.fromEntries([['item/started','ItemStartedNotification'],['item/completed','ItemCompletedNotification'],['thread/tokenUsage/updated','ThreadTokenUsageUpdatedNotification']].map(([method,name])=>[method,new Ajv({strict:false,validateFormats:false}).compile(contract.schemas[name])]));
  observation.model_acknowledgement_basis="unknown"; observation.turn_start_requested=false;
  const validId = value => typeof value === "string" && value.length > 0 && value.length <= 256;
  const done = new Promise(resolve => { wake = resolve; }), failed = new Promise(resolve => { abort = resolve; });
  const interrupt = () => {
    if (!connection || !threadId || !turnId || observation.interrupt_requested) return;
    observation.interrupt_requested = true;
    interruptPromise = Promise.resolve().then(() => connection.request("turn/interrupt", { threadId, turnId }, 250)).then(() => { observation.interrupt_acknowledged = true; }, () => {});
  };
  const fail = reason => { stop ??= reason; interrupt(); abort(); wake(); };
  const context = () => {
    const read = name => { try { const file=path.join(root,name); if (!within(canonical(root),canonical(file))) return null; return JSON.parse(readFileSync(file,"utf8")); } catch { return null; } };
    return {root,arm,stage,threadId,turnId,expectedClaimRevision,expectedClaimId:read(".ai-org/work-items/WI-0001.json")?.claim?.id,expectedCandidateRevision:read("DELIVERY.json")?.candidate_revision,verificationDecision:read("VERIFICATION.json")?.decision};
  };
  const processEvent = message => {
    // A stop does not close observation: correlated trailing counters and the
    // interrupted terminal may arrive while the one interrupt is acknowledged.
    // fail() preserves the first stop; observation never resumes the actor turn.
    if (closing) return;
    try {
      requireThat(message && typeof message.method === "string" && message.params && typeof message.params === "object", "invalid-event-shape");
      const p=message.params, item=p.item, method=message.method;
      const decision=eventDecision(message,context());
      if (observation.events.length >= 2000) { fail("event-count-limit"); return; }
      const event={method:knownMethods.has(method)?method:"unrecognized",item_type:itemTypes.has(item?.type)?item.type:null,item_id:validId(item?.id)?hash(item.id):null,exit_code:Number.isInteger(item?.exitCode)?item.exitCode:null};
      if (item?.type === "commandExecution" && method === "item/started") { observation.command_count++; observation.command_started_count++; }
      if (item?.type === "commandExecution" && method === "item/completed") observation.command_completed_count++;
      if (item?.type === "fileChange" && method === "item/started") observation.patch_started_count++;
      if (item?.type === "fileChange" && method === "item/completed") observation.patch_completed_count++;
      if (item?.type === "commandExecution") Object.assign(event,{classification:decision,command_digest:hash(item.command),
        output_bytes: method === "item/completed" && typeof item.aggregatedOutput === "string" ? Buffer.byteLength(item.aggregatedOutput) : null});
      observation.events.push(event);
      if (!decision.allowed) { fail(decision.rule); return; }
      if (wireValidators[method]) requireThat(wireValidators[method](p),"provider-wire-schema:notification");
      const relevant=["item/started","item/completed","thread/tokenUsage/updated","turn/started","turn/completed"].includes(method);
      if (relevant) {
        requireThat(p.threadId === threadId,"wrong-thread-event");
        const eventTurn=method.startsWith("turn/")?p.turn?.id:p.turnId;
        requireThat(eventTurn === turnId,"wrong-turn-event");
      }
      if (method === "thread/tokenUsage/updated") {
        const next=usageValue(p);
        requireThat(!observation.usage || ["input_tokens","cached_input_tokens","output_tokens","reasoning_output_tokens","total_tokens"].every(key=>next[key] >= observation.usage[key]),"usage-regressed");
        observation.usage=next; observation.usage_observed_at_ms=Date.now()-start;
        if (next.operational_tokens > protocol.limits.per_stage_operational_tokens || aggregateBefore+next.operational_tokens > protocol.limits.aggregate_operational_tokens) fail("operational-token-limit");
      }
      if (["item/started","item/completed"].includes(method)) {
        requireThat(validId(item?.id),"invalid-event-id");
        const tool=["commandExecution","fileChange"].includes(item.type);
        if (tool) {
          const fingerprint=hash(item.type === "commandExecution"?JSON.stringify([item.command,item.cwd]):JSON.stringify(item.changes));
          if (method === "item/started") {
            requireThat(!started.has(item.id),"duplicate-item-start");
            requireThat(item.status === "inProgress","invalid-event-shape");
            started.set(item.id,{type:item.type,fingerprint}); observation.tool_count++;
          } else {
            requireThat(started.has(item.id),"completion-without-start");
            requireThat(!completed.has(item.id),"duplicate-item-completion");
            requireThat(started.get(item.id).fingerprint === fingerprint && started.get(item.id).type === item.type,"command-envelope-changed");
            requireThat(["completed","failed","declined"].includes(item.status),"invalid-event-shape");
            if (item.type === "commandExecution") {
              requireThat(Number.isInteger(item.exitCode),"command-outcome-missing");
              if (decision.operation === "product-tests-all") observation.observed_test_exit_codes.push(item.exitCode);
            }
            completed.add(item.id);
          }
        }
        if (method === "item/completed") {
          observation.reported_output_bytes += Buffer.byteLength(typeof item.aggregatedOutput === "string"?item.aggregatedOutput:typeof item.text === "string"?item.text:"");
          if (item.type === "agentMessage") completion=item.text;
        }
      }
      if (method === "turn/completed") {
        terminal=p.turn;
        terminalWake();
        observation.terminal_status=["completed","interrupted","failed"].includes(terminal?.status)?terminal.status:"unknown";
        requireThat(started.size === completed.size,"unmatched-item-start");
        wake();
      }
    } catch (error) { fail(safeFailureCode(error)); }
  };
  const onNotification = message => {
    // Turn notifications can precede the turn/start response. Correlate against
    // its authoritative ID before recording usage or claiming an outcome.
    if (turnStart && !turnId) { if (pending.length >= 2000) fail("event-count-limit"); else pending.push(message); return; }
    processEvent(message);
  };
  const timer=setTimeout(()=>fail("wall-clock-limit"),Math.max(1,Math.min(protocol.limits.per_stage_ms,deadline-start)));
  try {
    await fs.mkdir(deliveryTempRoot(root,stage),{recursive:true});
    connection=providerFactory("codex",representativeAppServerArguments,{cwd:root,env:subprocessEnvironment({TEMPLE_CLI_PATH:path.join(sourceRoot,"bin/temple.mjs"),TMPDIR:deliveryTempRoot(root,stage)}),onNotification,
      onRequest(message,responder) { try { responder.respond(buildCodexRuntimeRequestResponse(message.method,message.params,{decision:"decline"})); } catch {} fail("runtime-request"); },
      onProtocolError() { fail("provider-protocol"); }, onExit() { if (!terminal && !closing) fail("provider-exit"); }
    });
    const request=(method,params)=>Promise.race([connection.request(method,params,Math.max(1,deadline-Date.now())),failed.then(()=>{throw Error(stop);})]);
    await request("initialize",{clientInfo:{name:"delivery-pair",version:"2"},capabilities:{experimentalApi:false}}); connection.notify("initialized",{});
    memoryCheck(await request("config/read",{cwd:root,includeLayers:false}));
    const requests=stageRequests({root,arm,stage,protocol}); schemaCheck(contract.schemas.ThreadStartParams,requests.thread);
    const thread=await request("thread/start",requests.thread); threadId=thread?.thread?.id;
    observation.acknowledged_model=/^gpt-[a-z0-9.-]{1,64}$/.test(thread?.model??"")?thread.model:null;
    observation.model_acknowledgement=typeof thread?.model !== "string"?"missing":thread.model === protocol.model?"matched":"mismatched";
    observation.model_acknowledgement_basis=observation.acknowledged_model?"direct-response-field":"unknown";
    observation.observed_thread_effort=["none","minimal","low","medium","high","xhigh","max","ultra"].includes(thread?.reasoningEffort)?thread.reasoningEffort:null;
    requireThat(validId(threadId),"thread-id-missing");
    requireThat(thread.model === protocol.model,"model-acknowledgement");
    if (thread.reasoningEffort != null) requireThat(thread.reasoningEffort === protocol.reasoning_effort,"effort-acknowledgement");
    requests.turn.threadId=threadId; schemaCheck(contract.schemas.TurnStartParams,requests.turn); turnStart=Date.now();
    observation.turn_start_requested=true;
    const turn=await request("turn/start",requests.turn); turnId=turn?.turn?.id; requireThat(validId(turnId),"turn-id-missing");
    for (const event of pending) processEvent(event); pending.length=0; if (stop) interrupt();
    await done; requireThat(!stop,stop); requireThat(terminal?.id === turnId && terminal.status === "completed","provider-terminal");
    requireThat(observation.usage,"missing-token-usage");
    let parsed; try { parsed=JSON.parse(completion); } catch { throw Error("completion-schema"); }
    requireThat(completionValidator(parsed),"completion-schema"); observation.completion=parsed; observation.status="completed";
  } catch (error) { fail(stop??safeFailureCode(error)); observation.stop_reason=stop; }
  finally {
    clearTimeout(timer); if (interruptPromise) await Promise.race([interruptPromise,new Promise(resolve=>setTimeout(resolve,250))]);
    if (observation.interrupt_requested && !terminal) {
      let terminalTimer;
      await Promise.race([terminalDone,new Promise(resolve=>{terminalTimer=setTimeout(resolve,2000);})]);
      clearTimeout(terminalTimer);
    }
    closing=true; await connection?.close().catch(()=>{});
    observation.thread_id=validId(threadId)?hash(threadId):null; observation.turn_id=validId(turnId)?hash(turnId):null;
    observation.unmatched_command_starts=Math.max(observation.command_started_count-observation.command_completed_count,[...started].filter(([id,item])=>item.type === "commandExecution" && !completed.has(id)).length);
    observation.unmatched_patch_starts=Math.max(observation.patch_started_count-observation.patch_completed_count,[...started].filter(([id,item])=>item.type === "fileChange" && !completed.has(id)).length);
    observation.total_elapsed_ms=Date.now()-start; observation.setup_elapsed_ms=(turnStart??Date.now())-start; observation.turn_elapsed_ms=turnStart?Date.now()-turnStart:null;
  }
  return observation;
}

// Executed in a coordinator-owned process and temporary directory. Only an import URL crosses the boundary.
export async function evaluateProduct(root) {
  const oracleRoot = await fs.mkdtemp(path.join(os.tmpdir(), "delivery-oracle-"));
  const script = `import assert from 'node:assert/strict'; import {quoteOrder as q} from ${JSON.stringify(pathToFileURL(path.join(root, "order.mjs")).href)};\nconst row=(u,n=1)=>[{unitCents:u,quantity:n}];\nassert.deepEqual(q(row(2999)),{subtotalCents:2999,shippingCents:500,totalCents:3499});\nassert.deepEqual(q(row(0)),{subtotalCents:0,shippingCents:500,totalCents:500});\nassert.equal(q(row(0),{freeShippingAtCents:0}).shippingCents,0);\nassert.deepEqual(q(row(6,2),{shippingCents:3,freeShippingAtCents:13}),{subtotalCents:12,shippingCents:3,totalCents:15});\nfor(const value of [null,{},'x',1]) assert.throws(()=>q(value),TypeError);\nfor(const value of [null,[],1,'x',new Date()]) assert.throws(()=>q([],value),TypeError);\nfor(const key of ['shippingCents','freeShippingAtCents']) for(const value of [undefined,null,'2',-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>q(row(1),{[key]:value}),TypeError);\nfor(const value of [null,1,[],{unitCents:1},{unitCents:1,quantity:0},{unitCents:-1,quantity:1},{unitCents:1.5,quantity:1},{unitCents:1,quantity:'1'},{unitCents:Number.MAX_SAFE_INTEGER+1,quantity:1}]) assert.throws(()=>q([value]),TypeError);\nassert.throws(()=>q(row(Number.MAX_SAFE_INTEGER,2)),RangeError);\nassert.throws(()=>q([{unitCents:Number.MAX_SAFE_INTEGER,quantity:1},{unitCents:1,quantity:1}]),RangeError);\nassert.throws(()=>q(row(Number.MAX_SAFE_INTEGER-1),{shippingCents:2,freeShippingAtCents:Number.MAX_SAFE_INTEGER}),RangeError);\nconst lines=Object.freeze([Object.freeze({unitCents:2,quantity:3,extra:4})]); const options=Object.freeze({shippingCents:7,freeShippingAtCents:9,extra:undefined}); assert.deepEqual(q(lines,options),{subtotalCents:6,shippingCents:7,totalCents:13}); assert.deepEqual(q([],{shippingCents:8}),{subtotalCents:0,shippingCents:0,totalCents:0});\nconsole.log('held-out contract passed');\n`;
  const optionEdges = "assert.deepEqual(q(row(2),undefined),q(row(2))); assert.deepEqual(q(row(2),Object.create(null)),q(row(2))); assert.throws(()=>q(row(2),Object.create({shippingCents:1})),TypeError); assert.throws(()=>q(new Array(1)),TypeError);\n";
  try { await write(oracleRoot, "oracle.mjs", script + optionEdges); const r = await command(oracleRoot, process.execPath, ["oracle.mjs"]); return { exit_code: r.exit_code, output_sha256: digest(r.output), elapsed_ms: r.elapsed_ms }; }
  finally { await fs.rm(oracleRoot, { recursive: true, force: true }); }
}
async function assessStage({ root, arm, stage, before, baseRevision, build, observation }) {
  const after = await files(root), changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(n => before[n] !== after[n]);
  requireThat(changed.every(n => allowedWrite(n, stage, arm)), `write-scope:${changed.filter(n => !allowedWrite(n, stage, arm)).join()}`);
  for (const [n, value] of Object.entries(fixture)) if (n !== "order.mjs") requireThat(after[n] === digest(value), `public-file-changed:${n}`);
  if (stage === "verify") requireThat(after["order.mjs"] === before["order.mjs"] && after["test/added.test.mjs"] === before["test/added.test.mjs"], "verifier-product-write");
  const record = await readJson(path.join(root, stage === "build" ? "DELIVERY.json" : "VERIFICATION.json"));
  requireThat(completionValidator(record) && /^[a-f0-9]{40}$/.test(record.candidate_revision), "delivery-record-schema");
  const rev = await git(root, ["rev-parse", `${record.candidate_revision}^{commit}`]); requireThat(rev === record.candidate_revision && rev !== baseRevision, "candidate-revision");
  await git(root, ["merge-base", "--is-ancestor", baseRevision, rev]); await git(root, ["merge-base", "--is-ancestor", rev, "HEAD"]);
  for (const n of ["order.mjs", "test/public.test.mjs", "test/added.test.mjs"]) {
    const blob = await command(root, "git", ["show", `${rev}:${n}`]); requireThat(blob.exit_code === 0 && digest(blob.output) === digest(await fs.readFile(path.join(root, n))), `candidate-content:${n}`);
  }
  requireThat(record.test_command === "node --test test/*.test.mjs", "test-command-claim");
  const tests = await command(root, process.execPath, ["--test", ...Object.keys(after).filter(n => /^test\/.*\.test\.mjs$/.test(n)).sort()]);
  requireThat(record.test_exit_code === tests.exit_code, "test-result-mismatch");
  requireThat(observation.observed_test_exit_codes.includes(record.test_exit_code), "actor-test-execution-unobserved");
  requireThat(stage !== "verify" || rev === build.candidate_revision, "verifier-revision");
  const oracle = await evaluateProduct(root);
  requireThat(digest(await files(root)) === digest(after), "product-test-write-scope");
  const quality = tests.exit_code === 0 && oracle.exit_code === 0;
  if (stage === "build") { requireThat(record.decision === "delivered" && (await fs.readFile(path.join(root, "HANDOFF.md"), "utf8")).includes(rev), "handoff-evidence"); }
  else requireThat(["accept", "reject"].includes(record.decision) && !(record.decision === "accept" && !quality), "incorrect-verifier-acceptance");
  let workflow = null;
  if (arm === "temple") {
    const item = await readJson(path.join(root, ".ai-org/work-items/WI-0001.json"));
    const expected = stage === "build" || record.decision === "reject" ? "test" : "done";
    const handoff = item.handoffs?.at(-1);
    const claimReleased = item.claim?.status === "released" && item.claim?.agent_id === `agent-${stage === "build" ? "builder" : "verifier"}`;
    const exactHandoff = handoff?.input_revision === rev && handoff?.from_position === "developer" && handoff?.to_position === "quality_evaluator";
    workflow = { observed_state: item.state, expected_state: expected, exact_handoff: exactHandoff, claim_status: item.claim?.status ?? null, claim_agent_id: item.claim?.agent_id ?? null, pass: item.state === expected && exactHandoff && claimReleased };
  }
  return { candidate_revision: rev, changed_paths: changed, public_tests: { exit_code: tests.exit_code, output_sha256: digest(tests.output), elapsed_ms: tests.elapsed_ms }, oracle, quality_passed: quality && (stage === "build" || record.decision === "accept"), workflow, record };
}

export function operationStatistics(observation) {
  const result = {};
  for (const event of observation.events) {
    if (event.method !== "item/completed" || event.item_type !== "commandExecution") continue;
    const operation = event.classification?.operation ?? "unknown";
    const row = result[operation] ??= { completed: 0, succeeded: 0, reported_output_bytes: 0, output_bytes_complete: true };
    row.completed++;
    if (event.exit_code === 0) row.succeeded++;
    if (Number.isSafeInteger(event.output_bytes) && event.output_bytes >= 0) row.reported_output_bytes += event.output_bytes;
    else row.output_bytes_complete = false;
  }
  return result;
}

export function treatmentAdherence(observation) {
  if (observation.arm !== "temple") return null;
  const commands = observation.events.filter(e => e.method === "item/completed" && e.exit_code === 0 && e.classification?.allowed);
  const compact = commands.some(e => e.classification.operation === "temple-context-compact");
  const delivery = commands.some(e => e.classification.operation === "temple-deliver" && e.classification.dry_run === false);
  const receiptMatched = observation.workflow?.exact_handoff === true && observation.workflow?.pass === true;
  return { compact_context_observed: compact, composed_delivery_observed: observation.stage === "build" ? delivery : null,
    pass: compact && (observation.stage !== "build" || (delivery && receiptMatched)),
    basis: "successful-observed-commands-and-verified-lifecycle; not-inferred-from-prompt" };
}

export async function runPair({ labRoot, protocol, approval, providerContract, providerFactory, diagnosticKey, deadline }) {
  // All authority, source and fixture validation precedes even starting a Provider process.
  validateApproval(approval, protocol); await inspectReadiness({ labRoot, protocol, providerContract });
  const manifest = await readJson(path.join(labRoot, "manifest.json"));
  if (providerFactory) requireThat(protocol.readiness_review?.test_only === true, "synthetic-review-required");
  else { requireThat(diagnosticKey === undefined, "private-diagnostic-key"); await validateReadinessReview(manifest.source_root,protocol); }
  diagnosticKey ??= crypto.randomBytes(32);
  const claim = await fs.open(path.join(labRoot, "run-once.lock"), "wx"); await claim.close();
  const start = Date.now(), run = { schema_version: "temple.delivery-pair-run/v2", protocol_sha256: digest(protocol), approval_sha256: digest(approval), process_contract_sha256:protocol.process_contract_sha256, source_sha256:protocol.source_sha256, fixture_sha256:protocol.fixture_sha256, command_policy_sha256:protocol.command_policy_sha256, output_schema_sha256:protocol.output_schema_sha256, model:protocol.model, requested_effort:protocol.reasoning_effort, provider_cli_version:providerContract.cli_version, node_version:providerContract.node_version, model_release_revision:providerContract.model_release_revision??null, status: "running", model_generation_performed: !providerFactory, synthetic_provider_replay: Boolean(providerFactory), stages: [], operational_tokens: 0, cache: "uncontrolled-descriptive-only", setup_elapsed_ms: manifest.setup_elapsed_ms, started_at: new Date().toISOString() };
  const save = async () => {
    run.elapsed_ms = Date.now() - start;
    run.subject_turn_requests=run.stages.filter(s=>s.turn_start_requested).length;
    run.model_generation_attempted=!providerFactory && run.subject_turn_requests>0;
    run.model_generation_performed=providerFactory?false:run.stages.some(s=>s.usage?.total_tokens>0)?true:run.model_generation_attempted?null:false;
    await write(labRoot, "run.json", run);
  };
  await save();
  try {
    if (!providerFactory) { const current = await inspectProvider({ sourceRoot: manifest.source_root,model:protocol.model,effort:protocol.reasoning_effort }); requireThat(digest(current) === digest(providerContract), "installed-provider-drift"); }
    const pairDeadline = Math.min(start + protocol.limits.aggregate_ms, deadline ?? Infinity);
    requireThat(Number.isFinite(pairDeadline) && pairDeadline > start, "aggregate-wall-clock-limit");
    for (const arm of protocol.order) {
      const root = path.join(labRoot, manifest.arms[arm].id); let build;
      for (const stage of ["build", "verify"]) {
        requireThat(Date.now() < pairDeadline, "aggregate-wall-clock-limit");
        requireThat(await sourceDigest(manifest.source_root) === protocol.source_sha256, "source-drift");
        const before = await files(root);
        requireThat(await gitSafety(root) === manifest.arms[arm].git_safety_sha256, "git-safety-drift");
        if (stage === "build") requireThat(digest(before) === digest(manifest.arms[arm].files), "arm-initial-state-drift");
        const observation = await runStage({ root, arm, stage, protocol, contract: providerContract, sourceRoot: manifest.source_root, providerFactory: providerFactory ?? createJsonRpcProcess, deadline: pairDeadline, aggregateBefore: run.operational_tokens, diagnosticKey, expectedClaimRevision:await git(root,["rev-parse","HEAD"]) });
        observation.operations = operationStatistics(observation);
        run.stages.push(observation); run.operational_tokens += observation.usage?.operational_tokens ?? 0; await save();
        requireThat(await gitSafety(root) === manifest.arms[arm].git_safety_sha256, "git-safety-drift");
        if (observation.status !== "completed") { run.stop_reason=observation.stop_reason; throw Error("stage-stopped"); }
        const validationStart = Date.now();
        try {
          const quality = await assessStage({ root, arm, stage, before, baseRevision: manifest.arms[arm].revision, build, observation });
          observation.completion_agreement = { evidence_matches: ["candidate_revision","test_command","test_exit_code","decision","unresolved"].every(key => digest(quality.record[key]) === digest(observation.completion[key])), summary_matches: quality.record.summary === observation.completion.summary };
          requireThat(observation.completion_agreement.evidence_matches, "completion-file-disagreement"); Object.assign(observation, quality); observation.treatment = treatmentAdherence(observation); if (stage === "build") build = quality;
          if (!quality.quality_passed) { observation.status = "quality-failed"; await save(); break; }
        } catch (e) {
          if (/write-scope|public-file-changed|verifier-product-write|symlink/.test(e.message)) throw e;
          observation.status = "quality-failed"; observation.quality_reason = safeFailureCode(e); await save(); break;
        } finally { observation.coordinator_validation_ms = Date.now() - validationStart; }
        await save();
      }
    }
    run.status = "completed";
    run.efficiency_comparable = run.stages.length === 4 && run.stages.every(s => s.quality_passed === true && (s.workflow === null || s.workflow?.pass === true) && (s.treatment === null || s.treatment?.pass === true));
  } catch (e) { run.status = "stopped"; run.stop_reason ??= safeFailureCode(e); run.efficiency_comparable = false; }
  finally {
    run.known_usage_subtotal = Object.fromEntries(["input_tokens", "cached_input_tokens", "non_cached_input_tokens", "output_tokens", "reasoning_output_tokens", "operational_tokens"].map(k => [k, run.stages.reduce((n, s) => n + (s.usage?.[k] ?? 0), 0)]));
    run.usage_complete = run.stages.length === 4 && run.stages.every(s => s.usage !== null && s.status === "completed"); run.total_usage = run.usage_complete ? run.known_usage_subtotal : null; run.total_usage_final=null; run.usage_finality="last-observed-not-account-final"; await save();
    run.arms = Object.fromEntries(protocol.order.map(arm => { const stages = run.stages.filter(s => s.arm === arm); return [arm, {
      setup_elapsed_ms: manifest.arms[arm].setup_elapsed_ms, setup_artifact_bytes: manifest.arms[arm].artifact_bytes,
      completed_stages: stages.filter(s => s.status === "completed").length,
      observed_stage_elapsed_ms: stages.length?stages.reduce((n, s) => n + s.total_elapsed_ms, 0):null,
      coordinator_validation_ms: stages.length > 0 && stages.every(s => Number.isFinite(s.coordinator_validation_ms)) ? stages.reduce((n, s) => n + s.coordinator_validation_ms, 0) : null,
      operational_tokens: stages.length > 0 && stages.every(s => s.usage) ? stages.reduce((n, s) => n + s.usage.operational_tokens, 0) : null
    }]; })); await save();
    // A manifest seals retained observations and every surviving actor artifact; no failed run is deleted or retried.
    let artifactDigest = null, archiveError = null;
    try { artifactDigest = await retainedArtifactDigest(labRoot); } catch (e) { archiveError = safeFailureCode(e); }
    await write(labRoot, "seal.json", { run_sha256: digest(run), artifact_sha256: artifactDigest, archive_error: archiveError, sealed_at: new Date().toISOString(), model_generation_performed: run.model_generation_performed });
  }
  return run;
}

async function main(args) {
  const [operation, labRoot, protocolPath, approvalPath] = args;
  requireThat(["prepare", "readiness", "run"].includes(operation) && labRoot, "Usage: delivery-control-pair.mjs prepare LAB | readiness LAB PROTOCOL | run LAB PROTOCOL APPROVAL");
  if (operation === "prepare") { const manifest = await preparePair({ labRoot }); const contract = await inspectProvider({ labRoot }); const protocol = createProtocol(manifest, { provider_contract_sha256: digest(contract) }); await write(labRoot, "protocol.pending.json", protocol); console.log(JSON.stringify({ prepared: true, model_generation_performed: false, token_limits_and_exact_approval_required: true })); return; }
  const protocol = await readJson(protocolPath), providerContract = await readJson(path.join(labRoot, "provider-contract.json"));
  if (operation === "readiness") { const result = await inspectReadiness({ labRoot, protocol, providerContract }); await write(labRoot, "readiness.json", result); console.log(JSON.stringify(result)); return; }
  requireThat(approvalPath, "exact-account-approval-required"); const result = await runPair({ labRoot, protocol, approval: await readJson(approvalPath), providerContract }); console.log(JSON.stringify({ status: result.status, stop_reason: result.stop_reason ?? null, efficiency_comparable: result.efficiency_comparable })); if (result.status !== "completed") process.exitCode = 1;
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main(process.argv.slice(2)).catch(e => { console.error(e.message); process.exitCode = 1; });
