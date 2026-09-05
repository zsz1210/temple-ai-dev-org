import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { matrixPlan, validateMatrix, validateMatrixApproval, prepareMatrix, runMatrix } from "../scripts/prepare-optimized-delivery-comparison.mjs";
import { digest, treatmentAdherence, operationStatistics, stageRequests } from "../scripts/delivery-control-pair.mjs";

function frozen(selection = "both") {
  const plan = matrixPlan(selection);
  return { schema_version: "temple.optimized-delivery-matrix/v1", plan, source_sha256: digest("source"),
    pairs: plan.pairs.map(row => ({ id: row.id, protocol_sha256: digest(row), provider_sha256: digest(row.model) })),
    model_generation_performed: false };
}
function approval(matrix) {
  return { schema_version: "temple.optimized-delivery-matrix-approval/v1", status: "approved", work_item_id: "WI-0179",
    matrix_sha256: digest(matrix), approved_by: "synthetic-test-authority", evidence_ref: "test-only-never-live",
    approved_at: "2026-01-01T00:00:00Z", ...Object.fromEntries(["maximum_stage_turns", "maximum_operational_tokens", "maximum_ms"].map(k => [k, matrix.plan[k]])),
    ...Object.fromEntries(["account", "purchase", "refill", "reset", "retries", "fallback"].map(k => [k, matrix.plan.policy[k]])) };
}

test("matched matrix has two opposite orders per model and exact aggregate ceilings", () => {
  for (const selection of ["both", "terra"]) {
    const matrix = frozen(selection), plan = matrix.plan;
    assert.equal(validateMatrix(matrix), true);
    assert.equal(plan.maximum_stage_turns, selection === "both" ? 16 : 8);
    assert.equal(plan.maximum_operational_tokens, selection === "both" ? 1280000 : 640000);
    assert.equal(plan.maximum_ms, selection === "both" ? 5760000 : 2880000);
    for (const model of new Set(plan.pairs.map(p => p.model))) {
      const pairs = plan.pairs.filter(p => p.model === model);
      assert.deepEqual(pairs.map(p => p.order.join()).sort(), ["ordinary,temple", "temple,ordinary"]);
      assert.equal(pairs.every(p => p.reasoning_effort === "medium"), true);
    }
  }
  assert.throws(() => matrixPlan("fallback"), /matrix-selection/);
  assert.deepEqual(matrixPlan(), matrixPlan()); // Fresh values do not drift across preparations.
});

test("approval pins the entire selected matrix; old, partial or broader permissions are rejected", () => {
  const matrix = frozen();
  assert.equal(validateMatrixApproval(approval(matrix), matrix), true);
  const changes = [
    a => { a.status = "proposed"; }, a => { a.matrix_sha256 = digest("older-protocol"); },
    a => { a.maximum_stage_turns = 17; }, a => { a.maximum_operational_tokens += 1; }, a => { a.maximum_ms += 1; },
    a => { a.purchase = true; }, a => { a.refill = true; }, a => { a.reset = true; },
    a => { a.retries = 1; }, a => { a.fallback = true; }, a => { a.account = "api"; },
    a => { a.approved_at = "2999-01-01T00:00:00Z"; }, a => { a.evidence_ref = ""; }, a => { a.approved_by = ""; }
  ];
  for (const change of changes) { const a = approval(matrix); change(a); assert.throws(() => validateMatrixApproval(a, matrix)); }
  assert.throws(() => validateMatrixApproval(approval(matrix), frozen("terra")), /matrix-approval-binding/);
  for (const change of [
    m => m.plan.pairs.reverse(), m => { m.plan.maximum_operational_tokens++; },
    m => { m.plan.pairs[0].model = "gpt-5.6-sol"; }, m => { m.pairs[0].id = "../old-lab"; },
    m => { m.pairs.push(m.pairs[0]); }, m => { m.source_sha256 = "unknown"; }
  ]) { const altered = structuredClone(matrix); change(altered); assert.throws(() => validateMatrix(altered)); }
});

test("optimized treatment requires successful real operations, not a prompt, preview or product pass", () => {
  const command = (operation, changes = {}) => ({ method: "item/completed", exit_code: 0, classification: { allowed: true, operation, dry_run: false }, ...changes });
  const observation = { arm: "temple", stage: "build", workflow: { pass: true, exact_handoff: true },
    events: [command("temple-context-compact"), command("temple-deliver")] };
  assert.equal(treatmentAdherence(observation).pass, true);
  for (const events of [
    [], [command("temple-context")], [command("temple-context-compact")],
    [command("temple-context-compact"), command("temple-deliver", { method: "item/started" })],
    [command("temple-context-compact"), command("temple-deliver", { exit_code: 1 })],
    [command("temple-context-compact"), command("temple-deliver", { classification: { allowed: true, operation: "temple-deliver", dry_run: true } })]
  ]) assert.equal(treatmentAdherence({ ...observation, events }).pass, false);
  assert.equal(treatmentAdherence({ ...observation, workflow: { pass: false, exact_handoff: true } }).pass, false);
  assert.equal(treatmentAdherence({ ...observation, stage: "verify", events: [command("temple-context-compact")] }).pass, true);
  assert.equal(treatmentAdherence({ ...observation, arm: "ordinary" }), null);
  const requests = arm => stageRequests({ root: "/assigned-repository", arm, stage: "build", protocol: { model: "gpt-5.6-terra", reasoning_effort: "medium" } });
  assert.match(requests("temple").instruction, /--compact --no-write --json/);
  assert.match(requests("temple").instruction, /work-item deliver/);
  assert.doesNotMatch(requests("ordinary").turn.input[0].text, /work-item deliver|--compact/);
  assert.match(requests("ordinary").instruction, /ordinary Git\/test\/handoff/);
});

test("operation volume is counted once from completion and missing output stays unknown", () => {
  const command = { item_type: "commandExecution", classification: { operation: "temple-context-compact" } };
  const statistics = operationStatistics({ events: [
    { ...command, method: "item/started", output_bytes: null },
    { ...command, method: "item/completed", exit_code: 0, output_bytes: 123 },
    { ...command, method: "item/completed", exit_code: 1, output_bytes: null },
    { method: "item/completed", item_type: "agentMessage", output_bytes: 999 }
  ] });
  assert.deepEqual(statistics, { "temple-context-compact": { completed: 2, succeeded: 1, reported_output_bytes: 123, output_bytes_complete: false } });
});

test("unapproved generation and unreviewed preparation stop before any provider or lab mutation", async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "optimized-comparison-test-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const matrix = frozen();
  await fs.writeFile(path.join(root, "matrix.frozen.json"), JSON.stringify(matrix));
  await assert.rejects(runMatrix({ matrixRoot: root, approval: null }), /matrix-approval-binding/);
  await assert.rejects(prepareMatrix({ matrixRoot: path.join(root, "new"), sourceRoot: root }), /matrix-independent-readiness-required/);
  await assert.rejects(prepareMatrix({ matrixRoot: path.join(root, "new"), sourceRoot: root, readinessReview: { status: "passed", test_only: true } }), /matrix-independent-readiness-required/);
  assert.deepEqual(await fs.readdir(root), ["matrix.frozen.json"]);
});
