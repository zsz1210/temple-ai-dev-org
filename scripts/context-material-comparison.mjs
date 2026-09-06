#!/usr/bin/env node
// WI-0210: a new, isolated attempt; WI-0208 labs remain immutable.
import fs from "node:fs/promises";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import { digest, sourceDigest, preparePair, inspectProvider, files, gitSafety, runStage, assessStage, stageRequests, operationStatistics, costBreakdown, treatmentAdherence, subprocessEnvironment } from "./delivery-control-pair.mjs";
import { createJsonRpcProcess } from "../src/codex-app-server-provider.mjs";
import { representativeAppServerArguments } from "./run-representative-microservice-comparison.mjs";

const exec = promisify(execFile);
const instrument = path.resolve(import.meta.dirname, "..");
const oldRevision = "87d68a189d03df33a61df753f441acdb387c7835";
const assert = (ok, reason) => { if (!ok) throw Error(reason); };
const json = async filename => JSON.parse(await fs.readFile(filename, "utf8"));
const save = async (root, name, value) => fs.writeFile(path.join(root, name), JSON.stringify(value, null, 2) + "\n");
const git = async (root, ...args) => (await exec("git", args, { cwd: root, env: subprocessEnvironment(), maxBuffer: 1024 * 1024 })).stdout.trim();
export const schedule = Object.freeze(["ordinary", "prior", "slim", "slim", "prior", "ordinary"]);
export const limits = Object.freeze({ stages: 12, per_stage_ms: 360000, aggregate_ms: 4320000, per_stage_operational_tokens: 80000, aggregate_operational_tokens: 960000 });
const policy = Object.freeze({ account: "chatgpt-subscription", purchase: false, refill: false, reset: false, retries: 0, fallback: false, cache: "uncontrolled", extra_judge: false });
export const evidenceScope = Object.freeze({ version: 1, excluded_scratch: schedule.map((_, i) => `subject-${i + 1}.runtime`), excluded_metadata_basename: ".git", self_files: ["seal.json", "evidence-manifest.json"] });
export function isolationArguments(profile) {
  assert(profile?.schema_version === "temple.comparison-isolation/v1" && Array.isArray(profile.sources) && profile.sources.length > 0, "isolation-profile");
  const args = [...representativeAppServerArguments, "--disable", "hooks", "--disable", "multi_agent", "--disable", "tool_suggest", "--disable", "remote_plugin", "-c", 'web_search="disabled"', "-c", "apps._default.enabled=false"];
  for (const field of ["mcp_servers", "plugins", "apps"]) {
    assert(Array.isArray(profile[field]) && profile[field].length <= 200 && new Set(profile[field]).size === profile[field].length, "isolation-map");
    for (const key of profile[field]) {
      // Codex -c paths split on dots, not TOML quoted-key syntax.
      assert(typeof key === "string" && /^[a-zA-Z0-9_@-]{1,160}$/.test(key), "isolation-key");
      args.push("-c", `${field}.${key}.enabled=false`);
    }
  }
  return args;
}
export function configurationHashMatches(bytes, expected, fixtureRoots = []) {
  if (digest(bytes) === expected) return true;
  let text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) return false;
  // Only the exact single-key section emitted by this installed Codex is
  // tolerated. Multiline TOML strings are deliberately unsupported here.
  if (text.includes('"""') || text.includes("'''")) return false;
  for (const root of fixtureRoots) {
      const block = `\n[projects.${JSON.stringify(root)}]\ntrust_level = "trusted"\n`;
      const at = text.indexOf(block);
      if (at < 0) continue;
      if (text.indexOf(block, at + block.length) >= 0) return false;
      const after = text.slice(at + block.length);
      // An additional key would change table semantics; never strip a prefix.
      if (!/^\s*(?:\[|$)/.test(after)) return false;
      text = text.slice(0, at) + after;
  }
  return digest(text) === expected;
}
export function assertIsolationSources(profile) {
  isolationArguments(profile);
  for (const root of profile.fixture_trust_roots ?? []) assert(path.isAbsolute(root) && realpathSync(root) === root, "isolation-trust-root");
  for (const s of profile.sources) {
    assert(typeof s.path === "string" && path.isAbsolute(s.path) && (s.sha256 === null || /^sha256:[a-f0-9]{64}$/.test(s.sha256)), "isolation-source");
    let bytes; try { bytes = readFileSync(s.path); } catch (e) { if (e.code !== "ENOENT") throw e; bytes = null; }
    const roots = s.path === path.join(os.homedir(), ".codex", "config.toml") ? profile.fixture_trust_roots ?? [] : [];
    assert(bytes === null ? s.sha256 === null : configurationHashMatches(bytes, s.sha256, roots), "isolation-source-drift");
  }
}
export function assertIsolatedConfig(reply, profile) {
  isolationArguments(profile);
  const c = reply?.config;
  assert(c?.features?.hooks === false && c.features.multi_agent === false && c.features.tool_suggest === false && c.features.remote_plugin === false && c.web_search === "disabled" && c.apps?._default?.enabled === false, "isolation-effective-config");
  const map = value => value !== null && typeof value === "object" && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  for (const field of ["mcp_servers", "plugins", "apps"]) {
    assert(map(c[field]) && Object.values(c[field]).every(v => map(v) && v.enabled === false), "isolation-effective-tools");
    assert(profile[field].every(k => Object.hasOwn(c[field], k) && c[field][k].enabled === false), "isolation-missing-tool");
  }
}
export function isolatedFactory(profile) {
  return (program, args, options) => {
    assertIsolationSources(profile);
    assert(digest(args) === digest(isolationArguments(profile)), "isolation-arguments");
    const c = createJsonRpcProcess(program, args, options);
    return { ...c, async request(method, params, timeout) { const r = await c.request(method, params, timeout); if (method === "config/read") assertIsolatedConfig(r, profile); return r; } };
  };
}
export async function evidenceFiles(root, relative = "") {
  const result = {};
  for (const e of (await fs.readdir(path.join(root, relative), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const name = path.posix.join(relative, e.name);
    assert(!e.isSymbolicLink(), "evidence-symlink");
    if (!relative && evidenceScope.excluded_scratch.includes(e.name)) { assert(e.isDirectory(), "scratch-not-directory"); continue; }
    if (e.name === ".git") { assert(e.isDirectory(), "git-not-directory"); continue; }
    if (!relative && evidenceScope.self_files.includes(e.name)) { assert(e.isFile(), "seal-not-file"); continue; }
    if (e.isDirectory()) Object.assign(result, await evidenceFiles(root, name));
    else { assert(e.isFile(), "evidence-not-file"); result[name] = digest(await fs.readFile(path.join(root, name))); }
  }
  return result;
}
export async function sealEvidence(lab, betweenSnapshots = async () => {}) {
  const first = await evidenceFiles(lab); await betweenSnapshots();
  const second = await evidenceFiles(lab); assert(digest(first) === digest(second), "evidence-snapshot-drift");
  const manifest = { scope: evidenceScope, files: second };
  await fs.writeFile(path.join(lab, "evidence-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
  const seal = { run_sha256: digest(await json(path.join(lab, "run.json"))), manifest_sha256: digest(manifest), sealed_at: new Date().toISOString() };
  await fs.writeFile(path.join(lab, "seal.json"), JSON.stringify(seal, null, 2) + "\n", { flag: "wx" });
  await verifySeal(lab); return seal;
}
export async function verifySeal(lab) {
  const m = await json(path.join(lab, "evidence-manifest.json")), s = await json(path.join(lab, "seal.json"));
  assert(digest(m.scope) === digest(evidenceScope) && digest(m) === s.manifest_sha256 && digest(await json(path.join(lab, "run.json"))) === s.run_sha256 && digest(await evidenceFiles(lab)) === digest(m.files), "evidence-seal-mismatch");
  const run = await json(path.join(lab, "run.json"));
  if (run.git_safety) {
    const canonicalLab = await fs.realpath(lab);
    const p = await json(path.join(lab, "protocol.json"));
    assert(run.git_safety.length === p.subjects.length, "sealed-git-count");
    for (const [i, subject] of p.subjects.entries()) {
      const relative = path.relative(canonicalLab, await fs.realpath(subject.root));
      assert(relative && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative), "sealed-subject-path");
      assert(run.git_safety[i].subject === i + 1 && run.git_safety[i].sha256 === await gitSafety(subject.root), "sealed-git-drift");
    }
  }
  return true;
}
export async function finalizeEvidence(lab, result, seal = sealEvidence) {
  try { await seal(lab); return result; }
  catch (error) {
    const failure = { status: "stopped", stop_reason: result.stop_reason ?? "evidence-seal-failed", archive_failure: true,
      archive_failure_code: /^[a-z0-9-]{1,80}$/.test(error.message) ? error.message : "archive-error" };
    // This sidecar is outside the immutable evidence scope. Never rewrite the
    // run or any partially created manifest/seal after finalization begins.
    await fs.writeFile(path.resolve(lab) + ".archive-failure.json", JSON.stringify(failure, null, 2) + "\n", { flag: "wx" });
    return { ...result, ...failure };
  }
}
export function commandJson(reply) {
  const diagnostic = { exit_code: Number.isInteger(reply?.exitCode) ? reply.exitCode : null, stdout_bytes: typeof reply?.stdout === "string" ? Buffer.byteLength(reply.stdout) : null, stderr_bytes: typeof reply?.stderr === "string" ? Buffer.byteLength(reply.stderr) : null };
  const fail = code => { const e = Error(code); e.diagnostic = diagnostic; throw e; };
  if (!Number.isInteger(reply?.exitCode)) fail("command-status-missing");
  if (reply.exitCode !== 0) fail("command-nonzero");
  if (typeof reply.stdout !== "string" || !reply.stdout.trim()) fail("command-output-empty");
  try { return JSON.parse(reply.stdout); } catch { fail("command-output-invalid-json"); }
}
export async function consumeApproval(lab, p, a) {
  validateApproval(a, p);
  await fs.writeFile(path.join(lab, "consumed.json"), JSON.stringify({ protocol_sha256: digest(p), at: new Date().toISOString() }), { flag: "wx" });
}
// The production wrapper supplies real source/fixture guards, runtime and oracle.
// Test injection exercises orchestration, never grants live approval or a retry.
export async function executeMatrix(p, result, { beforeStage, runOne, assessOne, persist, now = Date.now, deadline }) {
  for (const [index, s] of p.subjects.entries()) {
    let build;
    for (const stage of ["build", "verify"]) {
      assert(now() < deadline && result.operational_tokens < limits.aggregate_operational_tokens, "aggregate-limit");
      const before = await beforeStage(s, stage);
      result.attempted_stages++; await persist();
      const o = await runOne(s, stage, result.operational_tokens);
      o.variant = s.variant; o.subject = index + 1; o.operations = operationStatistics(o); o.cost_breakdown = costBreakdown(o);
      result.stages.push(o); result.operational_tokens += o.usage?.operational_tokens ?? 0; await persist();
      assert(o.status === "completed" && o.provider_exit_confirmed === true, o.stop_reason ?? "stage-stopped");
      assert(o.usage && Number.isSafeInteger(o.usage.operational_tokens) && o.usage.operational_tokens >= 0, "usage-unavailable");
      assert(o.usage.operational_tokens <= limits.per_stage_operational_tokens && result.operational_tokens <= limits.aggregate_operational_tokens, "observed-token-limit");
      const quality = await assessOne(s, stage, before, build, o);
      Object.assign(o, quality); o.treatment = treatmentAdherence(o);
      assert(["candidate_revision", "test_command", "test_exit_code", "decision", "unresolved"].every(k => digest(quality.record[k]) === digest(o.completion[k])), "completion-disagreement");
      assert(quality.quality_passed && (quality.workflow === null || quality.workflow.pass) && (o.treatment === null || o.treatment.pass), "noncomparable-outcome");
      if (s.variant === "slim") assert(o.events.some(e => e.task_material?.material === "task"), "task-route-not-observed");
      if (stage === "build") build = quality;
      await persist();
    }
  }
  result.status = "completed";
}
export function validatePlan(p) {
  assert(p?.schema_version === "temple.context-comparison/v3" && p.work_item_id === "WI-0210", "plan-schema");
  assert(digest(p.evidence_scope) === digest(evidenceScope), "evidence-scope"); isolationArguments(p.isolation);
  assert(digest(p.isolation.fixture_trust_roots) === digest(p.subjects?.map(s => s.root)), "isolation-trust-scope");
  assert(p.model === "gpt-5.6-terra" && p.reasoning_effort === "medium", "route-boundary");
  assert(digest(p.schedule) === digest(schedule) && digest(p.limits) === digest(limits) && digest(p.policy) === digest(policy), "approved-envelope");
  assert(p.subjects?.length === 6 && p.subjects.every((s, i) => s.variant === schedule[i] && s.arm === (s.variant === "ordinary" ? "ordinary" : "temple")), "subject-mapping");
  return true;
}
export function requestsFor(variant, args) {
  const request = stageRequests(args);
  if (variant !== "slim") return request;
  const declarations = ["AGENTS.md", "TEMPLE.md"].map(relative => ({ path: relative, sha256: digest(readFileSync(path.join(args.root, relative))) }));
  const suffix = ` --material task --available-whole-sources '${JSON.stringify(declarations)}'`;
  request.turn.input[0].text = request.turn.input[0].text.replace(/--principal-id human --no-write --json/g, `--principal-id human --no-write --json${suffix}`);
  request.turn.input[0].text += "\nTask material is explicitly selected for this run. Before declaring availability, actually read the complete AGENTS.md and TEMPLE.md in this fresh actor context. Supplied hashes identify sources, not evidence of reading. If either body is unavailable, changed, or no longer retained, omit --available-whole-sources and acquire normally. Read all other required bodies. Reuse current generated evidence rather than recreating an extra narrative; common DELIVERY.json, HANDOFF.md and VERIFICATION.json remain required by this benchmark.";
  request.instruction = request.turn.input[0].text;
  return request;
}
async function instrumentDigest() {
  return digest({ base: await sourceDigest(instrument), runner: digest(await fs.readFile(new URL(import.meta.url))), tests: digest(await fs.readFile(path.join(instrument, "test/context-material-comparison.test.mjs"))) });
}
export async function accountCheck(profile) {
  const c = isolatedFactory(profile)("codex", isolationArguments(profile), { cwd: instrument, env: subprocessEnvironment() });
  try {
    await c.request("initialize", { clientInfo: { name: "context-comparison", version: "1" }, capabilities: { experimentalApi: false } }); c.notify("initialized", {});
    await c.request("config/read", { cwd: instrument, includeLayers: false });
    const a = await c.request("account/read", { refreshToken: false });
    assert(a.account?.type === "chatgpt", "subscription-auth-required");
    const usage = await c.request("account/rateLimits/read", {});
    const buckets = Object.values(usage.rateLimitsByLimitId ?? {}).concat(usage.rateLimits ? [usage.rateLimits] : []);
    assert(buckets.length > 0, "account-limits-unavailable");
    // No conversion to Tokens or claim of available dollar credit.
    assert(!buckets.some(b => [b.primary, b.secondary].some(w => w?.usedPercent >= 100)), "account-allowance-exhausted");
    return { authentication: "chatgpt", limits_observed: true, purchase_performed: false, token_to_credit_conversion: null };
  } finally { await c.close(); }
}
export async function prepare(lab, priorRoot, isolationFile) {
  const isolation = await json(isolationFile); assertIsolationSources(isolation);
  lab = path.resolve(lab); priorRoot = await fs.realpath(priorRoot);
  assert(await git(priorRoot, "rev-parse", "HEAD") === oldRevision, "prior-revision");
  assert(!lab.startsWith(instrument + path.sep) && !lab.startsWith(priorRoot + path.sep), "lab-outside-source");
  await fs.mkdir(lab); // exclusive: never reuse a lab
  const subjects = [];
  for (const [index, variant] of schedule.entries()) {
    const pairRoot = path.join(lab, `subject-${index + 1}`), sourceRoot = variant === "prior" ? priorRoot : instrument;
    // Only the selected arm executes; its companion is inert setup, never a model subject.
    const pair = await preparePair({ labRoot: pairRoot, sourceRoot, order: ["ordinary", "temple"] });
    const arm = variant === "ordinary" ? "ordinary" : "temple", root = await fs.realpath(path.join(pairRoot, pair.arms[arm].id));
    subjects.push({ variant, arm, root, source_root: sourceRoot, source_sha256: pair.source_sha256, source_revision: pair.source_revision,
      initial: pair.arms[arm], request_sha256: Object.fromEntries(["build", "verify"].map(stage => [stage, digest(requestsFor(variant, { root, arm, stage, protocol: { model: "gpt-5.6-terra", reasoning_effort: "medium" } }))])) });
  }
  isolation.fixture_trust_roots = subjects.map(s => s.root);
  const contract = await inspectProvider({ labRoot: lab, sourceRoot: instrument, model: "gpt-5.6-terra", effort: "medium", providerFactory: isolatedFactory(isolation), serverArguments: isolationArguments(isolation) });
  const p = { schema_version: "temple.context-comparison/v3", work_item_id: "WI-0210", model: "gpt-5.6-terra", reasoning_effort: "medium", schedule, limits, policy, subjects, isolation, evidence_scope: evidenceScope,
    instrument_sha256: await instrumentDigest(), provider_sha256: digest(contract), account: await accountCheck(isolation) };
  validatePlan(p); await save(lab, "protocol.json", p); return p;
}
export async function readiness(lab) {
  const p = await json(path.join(lab, "protocol.json")), contract = await json(path.join(lab, "provider-contract.json")); validatePlan(p);
  assertIsolationSources(p.isolation);
  assert(await instrumentDigest() === p.instrument_sha256, "instrument-drift"); assert(digest(contract) === p.provider_sha256, "provider-binding");
  for (const s of p.subjects) {
    assert(await sourceDigest(s.source_root) === s.source_sha256 && await git(s.source_root, "rev-parse", "HEAD") === s.source_revision, "subject-source-drift");
    assert(digest(await files(s.root)) === digest(s.initial.files) && await git(s.root, "rev-parse", "HEAD") === s.initial.revision, "subject-fixture-drift");
    assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
    for (const stage of ["build", "verify"]) {
      const req = requestsFor(s.variant, { root: s.root, arm: s.arm, stage, protocol: p });
      assert(digest(req) === s.request_sha256[stage], "prompt-drift");
      for (const [name, data] of [["ThreadStartParams", req.thread], ["TurnStartParams", req.turn]]) {
        const validate = new Ajv({ strict: false, validateFormats: false }).compile(contract.schemas[name]); assert(validate(data), "wire-schema");
      }
    }
  }
  return { ready: true, protocol_sha256: digest(p), model_generation_performed: false };
}
export function validateApproval(a, p) {
  validatePlan(p);
  assert(a?.status === "approved" && a.protocol_sha256 === digest(p) && a.work_item_id === "WI-0210" && a.approved_by === "human" && a.evidence_ref === ".ai-org/artifacts/WI-0210/design.md", "approval-binding");
  assert(digest(a.limits) === digest(limits) && digest(a.policy) === digest(policy), "approval-envelope");
}
export async function sandboxProbe(lab) {
  await readiness(lab);
  const p = await json(path.join(lab, "protocol.json"));
  const results = [];
  for (const s of p.subjects.filter(s => s.variant === "slim")) {
    const c = isolatedFactory(p.isolation)("codex", isolationArguments(p.isolation), { cwd: s.root, env: subprocessEnvironment({ TEMPLE_CLI_PATH: path.join(s.source_root, "bin/temple.mjs") }) });
    try {
      await c.request("initialize", { clientInfo: { name: "material-sandbox-probe", version: "1" }, capabilities: { experimentalApi: false } }); c.notify("initialized", {});
      await c.request("config/read", { cwd: s.root, includeLayers: false });
      const declarations = ["AGENTS.md", "TEMPLE.md"].map(relative => ({ path: relative, sha256: digest(readFileSync(path.join(s.root, relative))) }));
      const sandboxPolicy = stageRequests({ root: s.root, arm: s.arm, stage: "build", protocol: p }).turn.sandboxPolicy;
      // The transport must outlive the command's own deadline plus shutdown.
      // This is readiness only; model stage/aggregate ceilings are unchanged.
      const execute = command => c.request("command/exec", { command, cwd: s.root, sandboxPolicy, timeoutMs: 30000, outputBytesCap: 1024 * 1024 }, 45000);
      const read = await execute(["/bin/zsh", "-lc", "cat AGENTS.md TEMPLE.md"]); assert(read.exitCode === 0, "sandbox-read");
      const acquired = await execute(["node", "./templew.mjs", "context", "enter", ".", "--work-item", "WI-0001", "--position", "developer", "--agent-id", "agent-builder", "--principal-id", "human", "--no-write", "--json", "--material", "task", "--available-whole-sources", JSON.stringify(declarations)]);
      const body = commandJson(acquired); assert(body.status === "eligible" && body.packet.material === "task", "sandbox-task-entry");
      assert(declarations.every(d => body.packet.sources.some(row => row.path === d.path && row.body === null && row.source_sha256 === d.sha256)), "sandbox-reuse");
      const deniedPath = path.join(lab, `denied-${crypto.randomBytes(8).toString("hex")}`);
      const denied = await execute(["/bin/zsh", "-lc", `printf probe > '${deniedPath}'`]);
      assert(denied.exitCode !== 0, "outside-write-not-denied");
      assert(!await fs.stat(deniedPath).then(() => true, () => false), "outside-write-created");
      assert(digest(await files(s.root)) === digest(s.initial.files), "probe-mutated-fixture");
      results.push({ entry_passed: true, whole_source_reuse: 2, outside_write_denied: true });
    } catch (e) {
      await save(lab, "readiness-failure.json", { code: /^[a-z0-9-]+$/.test(e.message) ? e.message : "readiness-transport-error", diagnostic: e.diagnostic ?? null, model_generation_performed: false }); throw e;
    } finally { await c.close(); }
  }
  const report = { status: "passed", protocol_sha256: digest(p), instrument_sha256: p.instrument_sha256, model_generation_performed: false, thread_requests: 0, turn_requests: 0, results };
  await save(lab, "sandbox.json", report); return report;
}
export async function run(lab, approvalFile, reviewFile) {
  const p = await json(path.join(lab, "protocol.json")), a = await json(approvalFile), review = await json(reviewFile);
  validateApproval(a, p); await readiness(lab);
  assert(review.status === "passed" && review.protocol_sha256 === digest(p) && review.instrument_sha256 === p.instrument_sha256 && review.reviewer_agent_id === "agent-lulu" && review.developer_agent_id === "agent-rikku", "readiness-qa");
  const sandbox = await json(path.join(lab, "sandbox.json"));
  assert(review.sandbox_status === "passed" && review.sandbox_sha256 === digest(sandbox) && sandbox.status === "passed" && sandbox.protocol_sha256 === digest(p) && sandbox.instrument_sha256 === p.instrument_sha256 && sandbox.results?.length === 2 && sandbox.results.every(r => r.entry_passed && r.outside_write_denied && r.whole_source_reuse === 2) && sandbox.model_generation_performed === false && sandbox.turn_requests === 0 && sandbox.thread_requests === 0, "sandbox-readiness");
  assert(typeof review.evidence_ref === "string" && review.evidence_ref.startsWith(".ai-org/artifacts/WI-0210/") && !review.evidence_ref.includes("..") && review.evidence_sha256 === digest(await fs.readFile(path.join(instrument, review.evidence_ref))), "review-evidence-binding");
  await consumeApproval(lab, p, a);
  const contract = await json(path.join(lab, "provider-contract.json"));
  const result = { schema_version: "temple.context-comparison-run/v1", protocol_sha256: digest(p), status: "running", started_at: new Date().toISOString(), stages: [], attempted_stages: 0, operational_tokens: 0, stop_reason: null };
  const start = Date.now(), deadline = start + limits.aggregate_ms, key = crypto.randomBytes(32).toString("hex");
  const persist = async () => { result.elapsed_ms = Date.now() - start; await save(lab, "run.json", result); };
  await persist();
  try {
    await accountCheck(p.isolation); assert(digest(await inspectProvider({ model: p.model, effort: p.reasoning_effort, providerFactory: isolatedFactory(p.isolation), serverArguments: isolationArguments(p.isolation) })) === p.provider_sha256, "installed-provider-drift");
    await executeMatrix(p, result, { deadline, persist,
      beforeStage: async (s, stage) => {
        assert(await instrumentDigest() === p.instrument_sha256 && await sourceDigest(s.source_root) === s.source_sha256, "source-drift");
        assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
        const before = await files(s.root);
        if (stage === "build") assert(digest(before) === digest(s.initial.files), "fixture-drift");
        return before;
      },
      runOne: async (s, stage, aggregateBefore) => runStage({ root: s.root, arm: s.arm, stage, protocol: p, contract, sourceRoot: s.source_root, providerFactory: createJsonRpcProcess,
        deadline, aggregateBefore, diagnosticKey: key, expectedClaimRevision: await git(s.root, "rev-parse", "HEAD"), contextMaterial: s.variant === "slim", requestFactory: args => requestsFor(s.variant, args), runtimePolicy: { arguments: isolationArguments(p.isolation), beforeStart: () => assertIsolationSources(p.isolation), checkConfig: r => assertIsolatedConfig(r, p.isolation) } }),
      assessOne: async (s, stage, before, build, observation) => {
        assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
        return assessStage({ root: s.root, arm: s.arm, stage, before, baseRevision: s.initial.revision, build, observation });
      }
    });
  } catch (e) { result.status = "stopped"; result.stop_reason = /^[a-z0-9-]{1,80}$/.test(e.message) ? e.message : "validation-or-runtime-error"; }
  finally {
    result.usage_complete = result.status === "completed" && result.stages.length === limits.stages && result.stages.every(s => s.usage !== null);
    result.git_safety = await Promise.all(p.subjects.map(async s => ({ subject: p.subjects.indexOf(s) + 1, sha256: await gitSafety(s.root) })));
    await persist();
  }
  return finalizeEvidence(lab, result);
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const [op, lab, a, r] = process.argv.slice(2);
  try {
    assert(lab, "lab-required");
    const out = op === "prepare" ? await prepare(lab, a, r) : op === "readiness" ? await readiness(lab) : op === "probe" ? await sandboxProbe(lab) : op === "run" ? await run(lab, a, r) : op === "verify-seal" ? { passed: await verifySeal(lab) } : null;
    assert(out, "unknown-operation"); console.log(JSON.stringify(out)); if (out.status === "stopped") process.exitCode = 1;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
