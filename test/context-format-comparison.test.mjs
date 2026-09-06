import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { schedule, limits, policy, validatePlan, validateApproval, consumeApproval, requestsFor, execute } from "../scripts/context-format-comparison.mjs";
import { digest, contextEntryObservation } from "../scripts/delivery-control-pair.mjs";
import { evidenceScope } from "../scripts/context-material-comparison.mjs";
import { classifyCommandItem } from "../scripts/delivery-command-policy.mjs";
const plan = () => ({ schema_version: "temple.format-comparison/v1", work_item_id: "WI-0215", model: "gpt-5.6-terra", reasoning_effort: "medium", schedule, limits, policy, source_revision: "revision", source_sha256: "digest", evidence_scope: evidenceScope,
  subjects: schedule.map((variant, i) => ({ variant, arm: "temple", root: `/fixture-${i}`, source_revision: "revision", source_sha256: "digest" })), isolation: { schema_version: "temple.comparison-isolation/v1", sources: [{ path: "/fixture", sha256: null }], mcp_servers: [], plugins: [], apps: [], fixture_trust_roots: schedule.map((_, i) => `/fixture-${i}`) } });
const approval = p => ({ status: "approved", approved_by: "human", work_item_id: "WI-0215", protocol_sha256: digest(p), evidence_ref: ".ai-org/artifacts/WI-0215/design.md", limits, policy });
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
  for (const stage of ["build", "verify"]) {
    const args = { root, arm: "temple", stage, protocol: plan() };
    const a = requestsFor("full", args), b = requestsFor("model", args);
    assert.deepEqual(a.thread, b.thread);
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
test("eight-stage executor stops on failure and preserves partial measurements without retries", async () => {
  const record = { candidate_revision: "fixture", test_command: "node --test test/*.test.mjs", test_exit_code: 0, decision: "accept", unresolved: [] };
  const observe = (s, stage) => ({ arm: "temple", stage, status: "completed", provider_exit_confirmed: true, usage: { operational_tokens: 100 }, completion: record, events: [
    { method: "item/completed", item_type: "commandExecution", exit_code: 0, classification: { allowed: true, operation: "temple-context-enter" }, entry_eligible: true, context_format: s.variant, task_material: { material: "task" } },
    { method: "item/completed", item_type: "commandExecution", exit_code: 0, classification: { allowed: true, operation: "temple-finish", dry_run: false }, finish_current_passed: true }
  ] });
  const initial = () => ({ status: "running", stages: [], attempted_stages: 0, operational_tokens: 0 });
  const helpers = extra => ({ deadline: 100, now: () => 0, beforeStage: async () => ({}), runOne: async (s, stage) => observe(s, stage), assessOne: async () => ({ record, quality_passed: true, workflow: { pass: true, exact_handoff: true } }), persist: async () => {}, ...extra });
  const r = initial(); await execute(plan(), r, helpers()); assert.equal(r.status, "completed"); assert.equal(r.operational_tokens, 800); assert.deepEqual(r.stages.map(s => s.variant), schedule.flatMap(s => [s, s]));
  for (const patch of [{ status: "stopped", stop_reason: "guard-failure" }, { usage: null }, { usage: { operational_tokens: 80001 } }, { provider_exit_confirmed: false }, { events: [] }]) {
    const r = initial(); await assert.rejects(execute(plan(), r, helpers({ runOne: async (s, stage) => ({ ...observe(s, stage), ...patch }) }))); assert.equal(r.attempted_stages, 1); assert.equal(r.stages.length, 1);
  }
  const exhausted = initial(); await assert.rejects(execute(plan(), exhausted, helpers({ now: () => 100 })), /aggregate-limit/); assert.equal(exhausted.attempted_stages, 0);
});
