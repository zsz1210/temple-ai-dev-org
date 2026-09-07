#!/usr/bin/env node
// WI-0224 diagnostic successor. Earlier runners, sealed labs and approvals are immutable.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import { digest, sourceDigest, preparePair, inspectProvider, files, gitSafety, runStage, assessStage, operationStatistics, costBreakdown, treatmentAdherence, subprocessEnvironment, tokenBudgetDecision } from "./delivery-control-pair.mjs";
import { requestsFor as materialRequests, isolatedFactory, isolationArguments, assertIsolationSources, assertIsolatedConfig, accountCheck, commandJson, finalizeEvidence } from "./context-material-comparison.mjs";
import { seedSource, referenceSource, maintenanceTask, maintenanceContract } from "./diagnostic-maintenance-fixture.mjs";
import { createJsonRpcProcess } from "../src/codex-app-server-provider.mjs";

const exec = promisify(execFile), source = path.resolve(import.meta.dirname, "..");
const assert = (ok, code) => { if (!ok) throw Error(code); };
const json = async file => JSON.parse(await fs.readFile(file, "utf8"));
const save = (root, name, value, exclusive = false) => fs.writeFile(path.join(root, name), JSON.stringify(value, null, 2) + "\n", exclusive ? { flag: "wx" } : {});
const git = async (root, ...args) => (await exec("git", args, { cwd: root, env: subprocessEnvironment(), maxBuffer: 1024 * 1024 })).stdout.trim();
export const schedule = Object.freeze(["full", "model", "model", "full", "model", "full", "full", "model"]);
export const families = Object.freeze(["replication", "replication", "replication", "replication", "maintenance", "maintenance", "maintenance", "maintenance"]);
export const evidenceScope = Object.freeze({ version: 2, excluded_scratch: schedule.map((_, i) => `subject-${i + 1}.runtime`), excluded_metadata_basename: ".git", self_files: ["seal.json", "evidence-manifest.json"] });
export const limits = Object.freeze({ stages: 16, per_stage_ms: 360000, aggregate_ms: 5760000, per_stage_operational_tokens: 80000, per_stage_token_action: "warning", aggregate_operational_tokens: 1280000 });
export const policy = Object.freeze({ account: "chatgpt-subscription", purchase: false, refill: false, reset: false, retries: 0, fallback: false, cache: "uncontrolled", extra_judge: false });
export function requestsFor(format, args) {
  assert(schedule.includes(format), "format-invalid");
  assert(["replication", "maintenance"].includes(args.family), "family-invalid");
  const r = materialRequests("slim", args);
  r.turn.input[0].text = r.turn.input[0].text.replaceAll("--material task", `--material task --format ${format}`);
  if (args.family === "maintenance") r.turn.input[0].text += "\n" + maintenanceTask;
  r.instruction = r.turn.input[0].text;
  return r;
}
async function instrumentDigest() {
  const names = ["scripts/diagnostic-format-comparison.mjs", "scripts/diagnostic-maintenance-fixture.mjs", "scripts/context-material-comparison.mjs", "test/diagnostic-format-comparison.test.mjs", "test/diagnostic-maintenance-fixture.test.mjs"];
  return digest({ source: await sourceDigest(source), extra: Object.fromEntries(await Promise.all(names.map(async n => [n, digest(await fs.readFile(path.join(source, n)))]))) });
}
export function validatePlan(p) {
  assert(p?.schema_version === "temple.diagnostic-format-comparison/v1" && p.work_item_id === "WI-0224", "plan-schema");
  assert(p.model === "gpt-5.6-terra" && p.reasoning_effort === "medium", "route-boundary");
  assert(digest(p.limits) === digest(limits) && digest(p.policy) === digest(policy) && digest(p.schedule) === digest(schedule), "envelope-drift");
  assert(p.subjects?.length === 8 && p.subjects.every((s, i) => s.variant === schedule[i] && s.family === families[i] && s.arm === "temple" && s.source_revision === p.source_revision && s.source_sha256 === p.source_sha256), "subject-mapping");
  assert(new Set(p.subjects.map(s => s.root)).size === 8, "subject-reuse");
  assert(digest(p.isolation?.fixture_trust_roots) === digest(p.subjects.map(s => s.root)), "isolation-scope");
  assert(digest(p.family_contract) === digest({ families, maintenanceContract, seed_sha256: digest(seedSource), reference_sha256: digest(referenceSource) }), "family-contract");
  assert(digest(p.evidence_scope) === digest(evidenceScope), "evidence-scope");
  isolationArguments(p.isolation);
}
export function validateApproval(a, p) {
  validatePlan(p);
  assert(a?.status === "approved" && a.approved_by === "human" && a.work_item_id === p.work_item_id && a.protocol_sha256 === digest(p), "approval-binding");
  assert(a.evidence_ref === ".ai-org/artifacts/WI-0223/execution-authorization.md" && digest(a.limits) === digest(limits) && digest(a.policy) === digest(policy), "approval-envelope");
}
export async function consumeApproval(lab, p, a) {
  validateApproval(a, p);
  await save(lab, "consumed.json", { protocol_sha256: digest(p), at: new Date().toISOString() }, true);
}
export async function prepareSubject(pairRoot, family) {
  assert(["replication", "maintenance"].includes(family), "family-invalid");
  const pair = await preparePair({ labRoot: pairRoot, sourceRoot: source, order: ["ordinary", "temple"] });
  const root = await fs.realpath(path.join(pairRoot, pair.arms.temple.id));
  if (family === "maintenance") {
    await fs.writeFile(path.join(root, "order.mjs"), seedSource);
    await git(root, "add", "order.mjs"); await git(root, "commit", "-m", "Seed option compatibility regression");
    const snapshot = await files(root);
    const bytes = (await Promise.all(Object.keys(snapshot).map(async name => (await fs.stat(path.join(root, name))).size))).reduce((a, b) => a + b, 0);
    pair.arms.temple = { ...pair.arms.temple, revision: await git(root, "rev-parse", "HEAD"), files: snapshot, git_safety_sha256: await gitSafety(root), artifact_bytes: bytes, file_count: Object.keys(snapshot).length };
  }
  // A successor manifest explicitly supersedes the unchanged preparation manifest.
  await save(pairRoot, "diagnostic-subject.json", { family, root, initial: pair.arms.temple }, true);
  return { pair, root };
}
export async function prepare(lab, isolationFile) {
  const isolation = await json(isolationFile); assertIsolationSources(isolation);
  lab = path.resolve(lab); assert(!lab.startsWith(source + path.sep) && lab !== source, "lab-outside-source");
  await fs.mkdir(lab); lab = await fs.realpath(lab);
  const subjects = [];
  for (const [i, variant] of schedule.entries()) {
    const pairRoot = path.join(lab, `subject-${i + 1}`);
    const { pair, root } = await prepareSubject(pairRoot, families[i]);
    subjects.push({ family: families[i], variant, arm: "temple", root, source_revision: pair.source_revision, source_sha256: pair.source_sha256, initial: pair.arms.temple,
      request_sha256: Object.fromEntries(["build", "verify"].map(stage => [stage, digest(requestsFor(variant, { family: families[i], root, arm: "temple", stage, protocol: { model: "gpt-5.6-terra", reasoning_effort: "medium" } }))])) });
  }
  isolation.fixture_trust_roots = subjects.map(s => s.root);
  const contract = await inspectProvider({ labRoot: lab, sourceRoot: source, model: "gpt-5.6-terra", effort: "medium", providerFactory: isolatedFactory(isolation), serverArguments: isolationArguments(isolation) });
  const p = { schema_version: "temple.diagnostic-format-comparison/v1", work_item_id: "WI-0224", model: "gpt-5.6-terra", reasoning_effort: "medium", schedule, limits, policy, subjects, isolation, evidence_scope: evidenceScope, family_contract: { families, maintenanceContract, seed_sha256: digest(seedSource), reference_sha256: digest(referenceSource) },
    design_sha256: digest(await fs.readFile(path.join(source, ".ai-org/artifacts/WI-0223/design.md"))), source_revision: await git(source, "rev-parse", "HEAD"), source_sha256: await sourceDigest(source), instrument_sha256: await instrumentDigest(), provider_sha256: digest(contract), account: await accountCheck(isolation) };
  validatePlan(p); await save(lab, "protocol.json", p, true); return p;
}
export async function readiness(lab) {
  const p = await json(path.join(lab, "protocol.json")), c = await json(path.join(lab, "provider-contract.json")); validatePlan(p);
  assertIsolationSources(p.isolation);
  assert(p.design_sha256 === digest(await fs.readFile(path.join(source, ".ai-org/artifacts/WI-0223/design.md"))), "design-drift");
  assert(await instrumentDigest() === p.instrument_sha256 && await sourceDigest(source) === p.source_sha256 && await git(source, "rev-parse", "HEAD") === p.source_revision, "source-drift");
  assert(digest(c) === p.provider_sha256, "provider-binding");
  for (const s of p.subjects) {
    assert(await fs.realpath(s.root) === s.root && s.root.startsWith((await fs.realpath(lab)) + path.sep), "subject-boundary");
    assert(digest(await files(s.root)) === digest(s.initial.files) && await git(s.root, "rev-parse", "HEAD") === s.initial.revision, "fixture-drift");
    assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
    for (const stage of ["build", "verify"]) {
      const r = requestsFor(s.variant, { family: s.family, root: s.root, arm: "temple", stage, protocol: p });
      assert(digest(r) === s.request_sha256[stage], "request-drift");
      for (const [name, data] of [["ThreadStartParams", r.thread], ["TurnStartParams", r.turn]]) {
        const validate = new Ajv({ strict: false, validateFormats: false }).compile(c.schemas[name]); assert(validate(data), "wire-schema");
      }
    }
  }
  return { ready: true, protocol_sha256: digest(p), model_generation_performed: false };
}
export async function probe(lab) {
  await readiness(lab);
  const p = await json(path.join(lab, "protocol.json")), results = [];
  for (const s of p.subjects) {
    const c = isolatedFactory(p.isolation)("codex", isolationArguments(p.isolation), { cwd: s.root, env: subprocessEnvironment({ TEMPLE_CLI_PATH: path.join(source, "bin/temple.mjs") }) });
    try {
      await c.request("initialize", { clientInfo: { name: "format-probe", version: "1" }, capabilities: { experimentalApi: false } }); c.notify("initialized", {});
      await c.request("config/read", { cwd: s.root, includeLayers: false });
      const sandboxPolicy = requestsFor(s.variant, { family: s.family, root: s.root, arm: "temple", stage: "build", protocol: p }).turn.sandboxPolicy;
      const execute = command => c.request("command/exec", { command, cwd: s.root, sandboxPolicy, timeoutMs: 30000, outputBytesCap: 1024 * 1024 }, 45000);
      const read = await execute(["/bin/zsh", "-lc", "cat AGENTS.md TEMPLE.md"]); assert(read.exitCode === 0, "sandbox-read");
      const available = await Promise.all(["AGENTS.md", "TEMPLE.md"].map(async name => ({ path: name, sha256: digest(await fs.readFile(path.join(s.root, name))) })));
      const values = {};
      for (const format of ["full", "model"]) {
        const out = await execute(["node", "./templew.mjs", "context", "enter", ".", "--work-item", "WI-0001", "--position", "developer", "--agent-id", "agent-builder", "--principal-id", "human", "--no-write", "--json", "--material", "task", "--format", format, "--available-whole-sources", JSON.stringify(available)]);
        const body = commandJson(out);
        assert(body.status === "eligible" && body.schema_version === (format === "full" ? "temple.context-enter/v1" : "temple.context-model-view/v1"), "sandbox-format");
        assert(available.every(d => body.packet.sources.some(row => row.path === d.path && row.body === null && row.source_sha256 === d.sha256)), "sandbox-reuse");
        values[format] = { body, bytes: Buffer.byteLength(out.stdout) };
      }
      assert(digest(values.full.body.packet.sources) === digest(values.model.body.packet.sources) && values.full.body.entry_digest === values.model.body.entry_digest, "format-material-drift");
      const deniedPath = path.join(lab, `denied-${crypto.randomBytes(8).toString("hex")}`);
      const denied = await execute(["/bin/zsh", "-lc", `printf probe > '${deniedPath}'`]);
      assert(denied.exitCode !== 0 && !await fs.stat(deniedPath).then(() => true, () => false), "outside-write-not-denied");
      assert(digest(await files(s.root)) === digest(s.initial.files), "probe-fixture-drift");
      results.push({ format: s.variant, entry_passed: true, bodies_identical: true, outside_write_denied: true, full_bytes: values.full.bytes, model_bytes: values.model.bytes });
    } finally { await c.close(); }
  }
  const r = { status: "passed", protocol_sha256: digest(p), instrument_sha256: p.instrument_sha256, model_generation_performed: false, turn_requests: 0, results };
  await save(lab, "sandbox.json", r, true); return r;
}
export async function execute(p, result, { beforeStage, runOne, assessOne, persist, deadline, now = Date.now }) {
  validatePlan(p);
  for (const [i, s] of p.subjects.entries()) {
    let build;
    for (const stage of ["build", "verify"]) {
      assert(now() < deadline && result.operational_tokens < limits.aggregate_operational_tokens, "aggregate-limit");
      const before = await beforeStage(s, stage);
      assert(now() < deadline, "aggregate-limit");
      result.attempted_stages++; await persist();
      let o;
      try { o = await runOne(s, stage, result.operational_tokens); }
      catch (error) {
        result.stages.push({ family: s.family, variant: s.variant, subject: i + 1, stage, status: "stopped", usage: null, stop_reason: "stage-runtime-error" });
        await persist(); throw error;
      }
      Object.assign(o, { family: s.family, variant: s.variant, subject: i + 1, operations: operationStatistics(o), cost_breakdown: costBreakdown(o) });
      result.stages.push(o); result.operational_tokens += o.usage?.operational_tokens ?? 0; await persist();
      assert(o.status === "completed" && o.provider_exit_confirmed === true, o.stop_reason ?? "stage-stopped");
      assert(Number.isSafeInteger(o.usage?.operational_tokens) && o.usage.operational_tokens >= 0, "usage-or-token-limit");
      assert(!tokenBudgetDecision(limits, o.usage.operational_tokens, result.operational_tokens - o.usage.operational_tokens).stop, "usage-or-token-limit");
      assert(now() < deadline, "aggregate-limit");
      const q = await assessOne(s, stage, before, build, o); Object.assign(o, q); o.treatment = treatmentAdherence(o);
      assert(["candidate_revision", "test_command", "test_exit_code", "decision", "unresolved"].every(k => digest(q.record[k]) === digest(o.completion[k])), "completion-disagreement");
      assert(q.quality_passed && q.workflow?.pass && o.treatment?.pass, "noncomparable-outcome");
      assert(o.events.some(e => e.context_format === s.variant && e.entry_eligible === true && e.task_material?.material === "task"), "format-not-observed");
      if (stage === "build") build = q;
      await persist();
      assert(now() < deadline, "aggregate-limit");
    }
  }
  result.status = "completed";
}
export async function run(lab, approvalFile, reviewFile) {
  const p = await json(path.join(lab, "protocol.json")), a = await json(approvalFile), review = await json(reviewFile), sandbox = await json(path.join(lab, "sandbox.json"));
  validateApproval(a, p); await readiness(lab);
  assert(review.status === "passed" && review.protocol_sha256 === digest(p) && review.instrument_sha256 === p.instrument_sha256 && review.reviewer_agent_id === "agent-lulu" && review.developer_agent_id === "agent-rikku", "readiness-qa");
  assert(review.sandbox_sha256 === digest(sandbox) && sandbox.status === "passed" && sandbox.protocol_sha256 === digest(p) && sandbox.instrument_sha256 === p.instrument_sha256 && sandbox.results?.length === 8 && sandbox.results.every(r => r.entry_passed && r.bodies_identical && r.outside_write_denied) && sandbox.model_generation_performed === false && sandbox.turn_requests === 0, "sandbox-readiness");
  assert(typeof review.evidence_ref === "string" && review.evidence_ref.startsWith(".ai-org/artifacts/WI-0224/") && !review.evidence_ref.includes("..") && review.evidence_sha256 === digest(await fs.readFile(path.join(source, review.evidence_ref))), "review-evidence-binding");
  await accountCheck(p.isolation);
  assert(digest(await inspectProvider({ model: p.model, effort: p.reasoning_effort, providerFactory: isolatedFactory(p.isolation), serverArguments: isolationArguments(p.isolation) })) === p.provider_sha256, "provider-drift");
  await consumeApproval(lab, p, a);
  const contract = await json(path.join(lab, "provider-contract.json"));
  const result = { schema_version: "temple.diagnostic-format-comparison-run/v1", protocol_sha256: digest(p), model: p.model, requested_effort: p.reasoning_effort, cache: "uncontrolled-descriptive-only", model_generation_performed: true, status: "running", started_at: new Date().toISOString(), stages: [], attempted_stages: 0, operational_tokens: 0, stop_reason: null };
  const start = Date.now(), deadline = start + limits.aggregate_ms;
  const persist = async () => { result.elapsed_ms = Date.now() - start; await save(lab, "run.json", result); };
  await persist();
  try {
    await execute(p, result, { deadline, persist,
      beforeStage: async (s, stage) => {
        assert(await instrumentDigest() === p.instrument_sha256 && await sourceDigest(source) === p.source_sha256, "source-drift");
        assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
        const before = await files(s.root); if (stage === "build") assert(digest(before) === digest(s.initial.files), "fixture-drift"); return before;
      },
      runOne: async (s, stage, aggregateBefore) => runStage({ root: s.root, arm: "temple", stage, protocol: p, contract, sourceRoot: source, providerFactory: createJsonRpcProcess, deadline, aggregateBefore, diagnosticKey: crypto.randomBytes(32),
        expectedClaimRevision: await git(s.root, "rev-parse", "HEAD"), contextMaterial: true, contextFormat: s.variant, requestFactory: args => requestsFor(s.variant, { ...args, family: s.family }),
        runtimePolicy: { arguments: isolationArguments(p.isolation), beforeStart: () => assertIsolationSources(p.isolation), checkConfig: r => assertIsolatedConfig(r, p.isolation) } }),
      assessOne: (s, stage, before, build, observation) => assessStage({ root: s.root, arm: "temple", stage, before, baseRevision: s.initial.revision, build, observation })
    });
  } catch (e) { result.status = "stopped"; result.stop_reason = /^[a-z0-9-]{1,80}$/.test(e.message) ? e.message : "validation-or-runtime-error"; }
  finally {
    result.usage_complete = result.status === "completed" && result.stages.length === 16 && result.stages.every(s => s.usage != null);
    try { result.git_safety = await Promise.all(p.subjects.map(async (s, i) => ({ subject: i + 1, sha256: await gitSafety(s.root) }))); }
    catch { result.status = "stopped"; result.stop_reason ??= "git-safety-unavailable"; result.usage_complete = false; }
    await persist();
  }
  return finalizeEvidence(lab, result, sealEvidence);
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
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const [op, lab, a, r] = process.argv.slice(2);
  try {
    assert(lab, "lab-required");
    const out = op === "prepare" ? await prepare(lab, a) : op === "readiness" ? await readiness(lab) : op === "probe" ? await probe(lab) : op === "run" ? await run(lab, a, r) : op === "verify-seal" ? { passed: await verifySeal(lab) } : null;
    assert(out, "unknown-operation"); console.log(JSON.stringify(out)); if (out.status === "stopped") process.exitCode = 1;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
