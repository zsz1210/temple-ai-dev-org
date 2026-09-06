import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { schedule, limits, policy, validatePlan, validateApproval, consumeApproval, requestsFor, execute, families, evidenceScope, sealEvidence, verifySeal } from "../scripts/diagnostic-format-comparison.mjs";
import { digest, contextEntryObservation, tokenBudgetDecision, recordTokenBudget } from "../scripts/delivery-control-pair.mjs";
import { maintenanceTask, maintenanceContract, seedSource, referenceSource } from "../scripts/diagnostic-maintenance-fixture.mjs";
import { classifyCommandItem } from "../scripts/delivery-command-policy.mjs";
const plan = () => ({ schema_version: "temple.diagnostic-format-comparison/v1", work_item_id: "WI-0224", model: "gpt-5.6-terra", reasoning_effort: "medium", schedule, limits, policy, source_revision: "revision", source_sha256: "digest", evidence_scope: evidenceScope, family_contract: { families, maintenanceContract, seed_sha256: digest(seedSource), reference_sha256: digest(referenceSource) },
  subjects: schedule.map((variant, i) => ({ family: families[i], variant, arm: "temple", root: `/fixture-${i}`, source_revision: "revision", source_sha256: "digest" })), isolation: { schema_version: "temple.comparison-isolation/v1", sources: [{ path: "/fixture", sha256: null }], mcp_servers: [], plugins: [], apps: [], fixture_trust_roots: schedule.map((_, i) => `/fixture-${i}`) } });
const approval = p => ({ status: "approved", approved_by: "human", work_item_id: "WI-0224", protocol_sha256: digest(p), evidence_ref: ".ai-org/artifacts/WI-0223/execution-authorization.md", limits, policy });
test("format protocol binds exact approved route, order, sources and one-shot envelope", async t => {
  const p = plan(); validatePlan(p); validateApproval(approval(p), p);
  for (const modify of [x => x.limits = { ...limits, stages: 9 }, x => x.policy = { ...policy, reset: true }, x => x.model = "other", x => x.reasoning_effort = "high", x => x.subjects[0].source_revision = "drift", x => x.subjects[0].variant = "model", x => x.isolation.fixture_trust_roots = []]) {
    const q = structuredClone(p); modify(q); assert.throws(() => validatePlan(q));
  }
  assert.throws(() => validateApproval({ ...approval(p), protocol_sha256: "old" }, p), /approval/);
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "format-approval-")); t.after(() => fs.rm(root, { recursive: true, force: true }));
  await consumeApproval(root, p, approval(p)); await assert.rejects(consumeApproval(root, p, approval(p)), /EEXIST/);
});
test("requests differ only by explicit format and keep common developer instructions", async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "format-request-")); t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const name of ["AGENTS.md", "TEMPLE.md"]) await fs.writeFile(path.join(root, name), "required body");
  for (const family of ["replication", "maintenance"]) for (const stage of ["build", "verify"]) {
    const args = { family, root, arm: "temple", stage, protocol: plan() };
    const a = requestsFor("full", args), b = requestsFor("model", args);
    assert.deepEqual(a.thread, b.thread);
    assert.equal(a.instruction.includes(maintenanceTask), family === "maintenance");
    assert.ok(!a.instruction.includes(referenceSource));
    assert.notEqual(a.thread.baseInstructions, "");
    assert.deepEqual(JSON.parse(JSON.stringify(a).replaceAll("--format full", "--format model")), b);
    assert.match(a.instruction, /--material task --format full/);
    assert.match(a.instruction, /Writing only delivery, handoff or verification evidence/);
  }
});
test("format command guard rejects missing, opposite, duplicate and non-opted formats", () => {
  const root = process.cwd();
  const base = "node ./templew.mjs context enter . --work-item WI-0001 --position developer --agent-id agent-builder --principal-id human --no-write --json --material task";
  const check = (command, format) => classifyCommandItem({ type: "commandExecution", id: "format-command", status: "inProgress", command, cwd: root, commandActions: [] }, { root, arm: "temple", stage: "build", contextMaterial: true, contextFormat: format });
  for (const format of ["full", "model"]) {
    assert.equal(check(`${base} --format ${format}`, format).allowed, true);
    assert.equal(check(base, format).allowed, false);
    assert.equal(check(`${base} --format ${format === "full" ? "model" : "full"}`, format).allowed, false);
    assert.equal(check(`${base} --format ${format} --format ${format}`, format).allowed, false);
    assert.equal(check(`${base} --format ${format}`, null).allowed, false);
  }
  assert.equal(check(base, null).allowed, true);
});
test("model root is recognized only by opted-in model observation", () => {
  for (const format of ["full", "model"]) {
    const body = { schema_version: format === "full" ? "temple.context-enter/v1" : "temple.context-model-view/v1", status: "eligible", packet: {} };
    assert.deepEqual(contextEntryObservation(body, format), { entry_eligible: true, context_format: format });
    assert.equal(contextEntryObservation(body, format === "full" ? "model" : "full").entry_eligible, false);
    assert.equal(contextEntryObservation({ ...body, status: "fallback" }, format).entry_eligible, false);
    assert.equal(contextEntryObservation({ ...body, packet: null }, format).entry_eligible, false);
  }
  assert.equal(contextEntryObservation({ schema_version: "temple.context-model-view/v1", status: "eligible", packet: {} }).entry_eligible, false);
});
test("sixteen-stage executor stops on failure and preserves partial measurements without retries", async () => {
  const record = { candidate_revision: "fixture", test_command: "node --test test/*.test.mjs", test_exit_code: 0, decision: "accept", unresolved: [] };
  const observe = (s, stage) => ({ arm: "temple", stage, status: "completed", provider_exit_confirmed: true, usage: { operational_tokens: 100 }, completion: record, events: [
    { method: "item/completed", item_type: "commandExecution", exit_code: 0, classification: { allowed: true, operation: "temple-context-enter" }, entry_eligible: true, context_format: s.variant, task_material: { material: "task" } },
    { method: "item/completed", item_type: "commandExecution", exit_code: 0, classification: { allowed: true, operation: "temple-finish", dry_run: false }, finish_current_passed: true }
  ] });
  const initial = () => ({ status: "running", stages: [], attempted_stages: 0, operational_tokens: 0 });
  const helpers = extra => ({ deadline: 100, now: () => 0, beforeStage: async () => ({}), runOne: async (s, stage) => observe(s, stage), assessOne: async () => ({ record, quality_passed: true, workflow: { pass: true, exact_handoff: true } }), persist: async () => {}, ...extra });
  const r = initial(); await execute(plan(), r, helpers()); assert.equal(r.status, "completed"); assert.equal(r.operational_tokens, 1600); assert.deepEqual(r.stages.map(s => s.variant), schedule.flatMap(s => [s, s]));
  assert.deepEqual(r.stages.map(s => s.family), families.flatMap(s => [s, s]));
  assert.deepEqual(r.stages.map(s => s.stage), schedule.flatMap(() => ['build', 'verify']));
  let snapshots = [];
  const thrown = initial(); await assert.rejects(execute(plan(), thrown, helpers({ runOne: async () => { throw Error('injected-error'); }, persist: async () => { snapshots.push(structuredClone(thrown)); } })), /injected-error/);
  assert.equal(thrown.attempted_stages, 1); assert.equal(thrown.stages.length, 1); assert.equal(thrown.stages[0].usage, null);
  assert.equal(snapshots.at(-1).stages[0].stop_reason, 'stage-runtime-error');
  const quality = initial(); await assert.rejects(execute(plan(), quality, helpers({ assessOne: async () => ({ record, quality_passed: false, workflow: { pass: true } }) })), /noncomparable-outcome/);
  assert.equal(quality.attempted_stages, 1); assert.equal(quality.stages[0].quality_passed, false);
  for (const patch of [{ status: "stopped", stop_reason: "guard-failure" }, { usage: null }, { usage: { operational_tokens: 1280001 } }, { provider_exit_confirmed: false }, { events: [] }]) {
    const r = initial(); await assert.rejects(execute(plan(), r, helpers({ runOne: async (s, stage) => ({ ...observe(s, stage), ...patch }) }))); assert.equal(r.attempted_stages, 1); assert.equal(r.stages.length, 1);
  }
  const exhausted = initial(); await assert.rejects(execute(plan(), exhausted, helpers({ now: () => 100 })), /aggregate-limit/); assert.equal(exhausted.attempted_stages, 0);
  const warning = initial();
  await execute(plan(), warning, helpers({ runOne: async (s, stage) => ({ ...observe(s, stage), usage: { operational_tokens: warning.attempted_stages === 1 ? 80151 : 100 } }) }));
  assert.equal(warning.status, "completed"); assert.equal(warning.stages.length, 16);
  const total = initial();
  await assert.rejects(execute(plan(), total, helpers({ runOne: async (s, stage) => ({ ...observe(s, stage), usage: { operational_tokens: 400000 } }) })), /usage-or-token-limit/);
  assert.equal(total.attempted_stages, 4);
  let clock = 0;
  const delayed = initial();
  await assert.rejects(execute(plan(), delayed, helpers({ now: () => clock, beforeStage: async () => { clock = 100; } })), /aggregate-limit/);
  assert.equal(delayed.attempted_stages, 0);
  clock = 0; const last = initial();
  await assert.rejects(execute(plan(), last, helpers({ now: () => clock, assessOne: async () => {
    if (last.attempted_stages === 16) clock = 100;
    return { record, quality_passed: true, workflow: { pass: true, exact_handoff: true } };
  } })), /aggregate-limit/);
  assert.notEqual(last.status, "completed");
});

test("stage warnings are explicit, deduplicated and never waive aggregate limits", () => {
  assert.deepEqual(tokenBudgetDecision(limits, 80000, 0), { warning: false, stop: false });
  assert.deepEqual(tokenBudgetDecision(limits, 80001, 0), { warning: true, stop: false });
  assert.equal(tokenBudgetDecision(limits, 80001, 1200000).stop, true);
  assert.equal(tokenBudgetDecision(limits, 1280000, 0).stop, false);
  assert.equal(tokenBudgetDecision(limits, 1280001, 0).stop, true);
  const legacy = { ...limits }; delete legacy.per_stage_token_action;
  assert.equal(tokenBudgetDecision(legacy, 80001, 0).stop, true);
  assert.throws(() => tokenBudgetDecision({ ...limits, per_stage_token_action: "ignore" }, 1, 0));
  for (const n of [null, NaN, -1, 0.5]) assert.throws(() => tokenBudgetDecision(limits, n, 0));
  const observation = {};
  recordTokenBudget(observation, limits, 80151, 0, 100);
  recordTokenBudget(observation, limits, 90000, 0, 200);
  assert.deepEqual(observation.stage_token_warning, { threshold: 80000, observed_operational_tokens: 80151, elapsed_ms: 100 });
  const old = { ...plan(), schema_version: "temple.format-comparison/v1", work_item_id: "WI-0215" };
  assert.throws(() => validatePlan(old), /plan-schema/);
});

test('eight-subject seal excludes exact scratch only, detects durable drift and rejects symlinks', async t => {
  const lab = await fs.mkdtemp(path.join(os.tmpdir(), 'diagnostic-seal-')); t.after(() => fs.rm(lab, { recursive: true, force: true }));
  await fs.writeFile(path.join(lab, 'run.json'), JSON.stringify({ status: 'stopped' }));
  await fs.mkdir(path.join(lab, 'subject-8.runtime'));
  await fs.writeFile(path.join(lab, 'subject-8.runtime', 'scratch'), 'private operational scratch');
  await fs.writeFile(path.join(lab, 'subject-8.runtime-durable'), 'evidence');
  await sealEvidence(lab);
  const manifest = JSON.parse(await fs.readFile(path.join(lab, 'evidence-manifest.json')));
  assert.equal(manifest.scope.excluded_scratch.length, 8);
  assert.ok(!Object.keys(manifest.files).some(n => n.startsWith('subject-8.runtime/')));
  assert.ok(manifest.files['subject-8.runtime-durable']);
  await fs.writeFile(path.join(lab, 'subject-8.runtime', 'scratch'), 'changed scratch');
  assert.equal(await verifySeal(lab), true);
  await fs.writeFile(path.join(lab, 'subject-8.runtime-durable'), 'changed evidence');
  await assert.rejects(verifySeal(lab), /evidence-seal-mismatch/);
  const unsafe = await fs.mkdtemp(path.join(os.tmpdir(), 'diagnostic-symlink-')); t.after(() => fs.rm(unsafe, { recursive: true, force: true }));
  await fs.writeFile(path.join(unsafe, 'run.json'), '{}');
  await fs.symlink(lab, path.join(unsafe, 'subject-8.runtime'));
  await assert.rejects(sealEvidence(unsafe), /evidence-symlink/);
});
