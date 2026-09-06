#!/usr/bin/env node
// Format-only successor. Earlier sealed laboratories and approvals are immutable.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import { digest, sourceDigest, preparePair, inspectProvider, files, gitSafety, runStage, assessStage, operationStatistics, costBreakdown, treatmentAdherence, subprocessEnvironment, tokenBudgetDecision } from "./delivery-control-pair.mjs";
import { requestsFor as materialRequests, isolatedFactory, isolationArguments, assertIsolationSources, assertIsolatedConfig, accountCheck, commandJson, evidenceScope, finalizeEvidence, verifySeal } from "./context-material-comparison.mjs";
import { createJsonRpcProcess } from "../src/codex-app-server-provider.mjs";

const exec = promisify(execFile), source = path.resolve(import.meta.dirname, "..");
const assert = (ok, code) => { if (!ok) throw Error(code); };
const json = async file => JSON.parse(await fs.readFile(file, "utf8"));
const save = (root, name, value, exclusive = false) => fs.writeFile(path.join(root, name), JSON.stringify(value, null, 2) + "\n", exclusive ? { flag: "wx" } : {});
const git = async (root, ...args) => (await exec("git", args, { cwd: root, env: subprocessEnvironment(), maxBuffer: 1024 * 1024 })).stdout.trim();
export const schedule = Object.freeze(["full", "model", "model", "full"]);
export const limits = Object.freeze({ stages: 8, per_stage_ms: 360000, aggregate_ms: 2880000, per_stage_operational_tokens: 80000, per_stage_token_action: "warning", aggregate_operational_tokens: 640000 });
export const policy = Object.freeze({ account: "chatgpt-subscription", purchase: false, refill: false, reset: false, retries: 0, fallback: false, cache: "uncontrolled", extra_judge: false });
export function requestsFor(format, args) {
  assert(schedule.includes(format), "format-invalid");
  const r = materialRequests("slim", args);
  r.turn.input[0].text = r.turn.input[0].text.replaceAll("--material task", `--material task --format ${format}`);
  r.instruction = r.turn.input[0].text;
  return r;
}
async function instrumentDigest() {
  const names = ["scripts/context-format-comparison.mjs", "scripts/context-material-comparison.mjs", "test/context-format-comparison.test.mjs"];
  return digest({ source: await sourceDigest(source), extra: Object.fromEntries(await Promise.all(names.map(async n => [n, digest(await fs.readFile(path.join(source, n)))]))) });
}
export function validatePlan(p) {
  assert(p?.schema_version === "temple.format-comparison/v2" && p.work_item_id === "WI-0216", "plan-schema");
  assert(p.model === "gpt-5.6-terra" && p.reasoning_effort === "medium", "route-boundary");
  assert(digest(p.limits) === digest(limits) && digest(p.policy) === digest(policy) && digest(p.schedule) === digest(schedule), "envelope-drift");
  assert(p.subjects?.length === 4 && p.subjects.every((s, i) => s.variant === schedule[i] && s.arm === "temple" && s.source_revision === p.source_revision && s.source_sha256 === p.source_sha256), "subject-mapping");
  assert(digest(p.isolation?.fixture_trust_roots) === digest(p.subjects.map(s => s.root)), "isolation-scope");
  assert(digest(p.evidence_scope) === digest(evidenceScope), "evidence-scope");
  isolationArguments(p.isolation);
}
export function validateApproval(a, p) {
  validatePlan(p);
  assert(a?.status === "approved" && a.approved_by === "human" && a.work_item_id === p.work_item_id && a.protocol_sha256 === digest(p), "approval-binding");
  assert(a.evidence_ref === ".ai-org/artifacts/WI-0216/design.md" && digest(a.limits) === digest(limits) && digest(a.policy) === digest(policy), "approval-envelope");
}
export async function consumeApproval(lab, p, a) {
  validateApproval(a, p);
  await save(lab, "consumed.json", { protocol_sha256: digest(p), at: new Date().toISOString() }, true);
}
export async function prepare(lab, isolationFile) {
  const isolation = await json(isolationFile); assertIsolationSources(isolation);
  lab = path.resolve(lab); assert(!lab.startsWith(source + path.sep) && lab !== source, "lab-outside-source");
  await fs.mkdir(lab); lab = await fs.realpath(lab);
  const subjects = [];
  for (const [i, variant] of schedule.entries()) {
    const pairRoot = path.join(lab, `subject-${i + 1}`);
    const pair = await preparePair({ labRoot: pairRoot, sourceRoot: source, order: ["ordinary", "temple"] });
    const root = await fs.realpath(path.join(pairRoot, pair.arms.temple.id));
    subjects.push({ variant, arm: "temple", root, source_revision: pair.source_revision, source_sha256: pair.source_sha256, initial: pair.arms.temple,
      request_sha256: Object.fromEntries(["build", "verify"].map(stage => [stage, digest(requestsFor(variant, { root, arm: "temple", stage, protocol: { model: "gpt-5.6-terra", reasoning_effort: "medium" } }))])) });
  }
  isolation.fixture_trust_roots = subjects.map(s => s.root);
  const contract = await inspectProvider({ labRoot: lab, sourceRoot: source, model: "gpt-5.6-terra", effort: "medium", providerFactory: isolatedFactory(isolation), serverArguments: isolationArguments(isolation) });
  const p = { schema_version: "temple.format-comparison/v2", work_item_id: "WI-0216", model: "gpt-5.6-terra", reasoning_effort: "medium", schedule, limits, policy, subjects, isolation, evidence_scope: evidenceScope,
    source_revision: await git(source, "rev-parse", "HEAD"), source_sha256: await sourceDigest(source), instrument_sha256: await instrumentDigest(), provider_sha256: digest(contract), account: await accountCheck(isolation) };
  validatePlan(p); await save(lab, "protocol.json", p, true); return p;
}
export async function readiness(lab) {
  const p = await json(path.join(lab, "protocol.json")), c = await json(path.join(lab, "provider-contract.json")); validatePlan(p);
  assertIsolationSources(p.isolation);
  assert(await instrumentDigest() === p.instrument_sha256 && await sourceDigest(source) === p.source_sha256 && await git(source, "rev-parse", "HEAD") === p.source_revision, "source-drift");
  assert(digest(c) === p.provider_sha256, "provider-binding");
  for (const s of p.subjects) {
    assert(await fs.realpath(s.root) === s.root && s.root.startsWith((await fs.realpath(lab)) + path.sep), "subject-boundary");
    assert(digest(await files(s.root)) === digest(s.initial.files) && await git(s.root, "rev-parse", "HEAD") === s.initial.revision, "fixture-drift");
    assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
    for (const stage of ["build", "verify"]) {
      const r = requestsFor(s.variant, { root: s.root, arm: "temple", stage, protocol: p });
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
      const sandboxPolicy = requestsFor(s.variant, { root: s.root, arm: "temple", stage: "build", protocol: p }).turn.sandboxPolicy;
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
  for (const [i, s] of p.subjects.entries()) {
    let build;
    for (const stage of ["build", "verify"]) {
      assert(now() < deadline && result.operational_tokens < limits.aggregate_operational_tokens, "aggregate-limit");
      const before = await beforeStage(s, stage);
      assert(now() < deadline, "aggregate-limit");
      result.attempted_stages++; await persist();
      const o = await runOne(s, stage, result.operational_tokens);
      Object.assign(o, { variant: s.variant, subject: i + 1, operations: operationStatistics(o), cost_breakdown: costBreakdown(o) });
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
  assert(review.sandbox_sha256 === digest(sandbox) && sandbox.status === "passed" && sandbox.protocol_sha256 === digest(p) && sandbox.instrument_sha256 === p.instrument_sha256 && sandbox.results?.length === 4 && sandbox.results.every(r => r.entry_passed && r.bodies_identical && r.outside_write_denied) && sandbox.model_generation_performed === false && sandbox.turn_requests === 0, "sandbox-readiness");
  assert(typeof review.evidence_ref === "string" && review.evidence_ref.startsWith(".ai-org/artifacts/WI-0216/") && !review.evidence_ref.includes("..") && review.evidence_sha256 === digest(await fs.readFile(path.join(source, review.evidence_ref))), "review-evidence-binding");
  await accountCheck(p.isolation);
  assert(digest(await inspectProvider({ model: p.model, effort: p.reasoning_effort, providerFactory: isolatedFactory(p.isolation), serverArguments: isolationArguments(p.isolation) })) === p.provider_sha256, "provider-drift");
  await consumeApproval(lab, p, a);
  const contract = await json(path.join(lab, "provider-contract.json"));
  const result = { schema_version: "temple.format-comparison-run/v1", protocol_sha256: digest(p), status: "running", started_at: new Date().toISOString(), stages: [], attempted_stages: 0, operational_tokens: 0, stop_reason: null };
  const start = Date.now(), deadline = start + limits.aggregate_ms, diagnosticKey = crypto.randomBytes(32).toString("hex");
  const persist = async () => { result.elapsed_ms = Date.now() - start; await save(lab, "run.json", result); };
  await persist();
  try {
    await execute(p, result, { deadline, persist,
      beforeStage: async (s, stage) => {
        assert(await instrumentDigest() === p.instrument_sha256 && await sourceDigest(source) === p.source_sha256, "source-drift");
        assert(await gitSafety(s.root) === s.initial.git_safety_sha256, "git-safety-drift");
        const before = await files(s.root); if (stage === "build") assert(digest(before) === digest(s.initial.files), "fixture-drift"); return before;
      },
      runOne: async (s, stage, aggregateBefore) => runStage({ root: s.root, arm: "temple", stage, protocol: p, contract, sourceRoot: source, providerFactory: createJsonRpcProcess, deadline, aggregateBefore, diagnosticKey,
        expectedClaimRevision: await git(s.root, "rev-parse", "HEAD"), contextMaterial: true, contextFormat: s.variant, requestFactory: args => requestsFor(s.variant, args),
        runtimePolicy: { arguments: isolationArguments(p.isolation), beforeStart: () => assertIsolationSources(p.isolation), checkConfig: r => assertIsolatedConfig(r, p.isolation) } }),
      assessOne: (s, stage, before, build, observation) => assessStage({ root: s.root, arm: "temple", stage, before, baseRevision: s.initial.revision, build, observation })
    });
  } catch (e) { result.status = "stopped"; result.stop_reason = /^[a-z0-9-]{1,80}$/.test(e.message) ? e.message : "validation-or-runtime-error"; }
  finally {
    result.usage_complete = result.status === "completed" && result.stages.length === 8 && result.stages.every(s => s.usage != null);
    result.git_safety = await Promise.all(p.subjects.map(async (s, i) => ({ subject: i + 1, sha256: await gitSafety(s.root) })));
    await persist();
  }
  return finalizeEvidence(lab, result);
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const [op, lab, a, r] = process.argv.slice(2);
  try {
    assert(lab, "lab-required");
    const out = op === "prepare" ? await prepare(lab, a) : op === "readiness" ? await readiness(lab) : op === "probe" ? await probe(lab) : op === "run" ? await run(lab, a, r) : op === "verify-seal" ? { passed: await verifySeal(lab) } : null;
    assert(out, "unknown-operation"); console.log(JSON.stringify(out)); if (out.status === "stopped") process.exitCode = 1;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
