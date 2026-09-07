import test from "node:test";
import assert from "node:assert/strict";
import { runEvaluationSequence } from "../scripts/evaluation-sequence.mjs";

function fixture(overrides = {}) {
  const calls = [], snapshots = [];
  const options = {
    subjects: [{ id: "first" }, { id: "second" }],
    limits: { operational_tokens: 100, elapsed_ms: 1000 },
    continuation: { product_failure: true, local_invalid: false }, now: () => 0,
    beforeStage: async () => ({ source_unchanged: true, isolation_confirmed: true }),
    runOne: async (s, stage) => { calls.push(`${s.id}/${stage}`); return { status: "completed", provider_exit_confirmed: true, usage: { operational_tokens: 10 } }; },
    assessOne: async () => ({ outcome: "passed", validity_confirmed: true, isolation_confirmed: true, cleanup_confirmed: true }),
    persist: async value => { snapshots.push(value); }, ...overrides
  };
  return { calls, snapshots, run: () => runEvaluationSequence(options), options };
}
test("qualified sequence retains every attempt and does not repeat stages", async () => {
  const f = fixture(), r = await f.run();
  assert.equal(r.status, "completed"); assert.equal(r.operational_tokens, 40);
  assert.deepEqual(f.calls, ["first/build", "first/verify", "second/build", "second/verify"]);
  assert.equal(r.attempted_stages, 4); assert.ok(r.usage_complete);
  assert.equal(f.snapshots[0].stages[0].status, "attempting");
});
test("product failure retains cost, skips dependent verification and permits only authorized continuation", async () => {
  for (const allowed of [false, true]) {
    const f = fixture({ continuation: { product_failure: allowed, local_invalid: false },
      assessOne: async (s) => ({ outcome: s.id === "first" ? "product-failure" : "passed", validity_confirmed: true, isolation_confirmed: true, cleanup_confirmed: true }) });
    const r = await f.run();
    assert.equal(r.status, allowed ? "completed-with-failures" : "stopped");
    assert.equal(r.operational_tokens, allowed ? 30 : 10);
    assert.equal(r.stages[1].status, "skipped-dependency");
    assert.deepEqual(f.calls, allowed ? ["first/build", "second/build", "second/verify"] : ["first/build"]);
  }
});
test("unknown usage, containment, protocol stop and invalid assessment are global stops", async () => {
  for (const override of [
    { runOne: async () => ({ status: "completed", provider_exit_confirmed: true }) },
    { runOne: async () => ({ status: "completed", provider_exit_confirmed: false, usage: { operational_tokens: 10 } }) },
    { runOne: async () => ({ status: "stopped", provider_exit_confirmed: true, usage: { operational_tokens: 10 } }) },
    { assessOne: async () => ({ outcome: "passed", validity_confirmed: false, isolation_confirmed: true, cleanup_confirmed: true }) },
    { assessOne: async () => { throw Error("PRIVATE OUTPUT"); } },
    { beforeStage: async () => ({ source_unchanged: false, isolation_confirmed: true }) }
  ]) {
    const f = fixture(override), r = await f.run();
    assert.equal(r.status, "stopped"); assert.ok(r.attempted_stages <= 1);
    assert.ok(!JSON.stringify(r).includes("PRIVATE OUTPUT"));
    if (["usage-unavailable", "cleanup-unconfirmed", "runtime-stopped"].includes(r.stop_reason)) assert.equal(r.usage_complete, false);
    if (r.stop_reason === "cleanup-unconfirmed") assert.equal(r.operational_tokens, 10);
  }
});

test("typed stop and supplied immutable observation reference survive without raw fields", async () => {
  const ref = "sha256:" + "a".repeat(64), itemId = "hmac-sha256:" + "b".repeat(64);
  const f = fixture({ runOne: async () => ({ status: "stopped", provider_exit_confirmed: true,
    stop_reason: "revision-boundary", usage: { operational_tokens: 10 }, observation_sha256: ref,
    first_stop: { reason: "revision-boundary", stage: "build", event_index: 0, item_id: itemId },
    events: [{ classification: { argument_index: 3, revision_category: "named-ref" }, command: "PRIVATE COMMAND" }], raw: "PRIVATE OUTPUT" }) });
  const r = await f.run();
  assert.equal(r.stop_reason, "runtime-stopped");
  assert.equal(r.stages[0].diagnostics.stop_reason, "revision-boundary");
  assert.equal(r.stages[0].diagnostics.observation_sha256, ref);
  assert.equal(r.stages[0].diagnostics.first_stop.argument_index, 3);
  assert.equal(r.stages[0].diagnostics.first_stop.item_id, itemId);
  assert.ok(!JSON.stringify(f.snapshots).includes("PRIVATE"));
});
test("incomplete runtime stays incomplete when budget or deadline stops also apply", async () => {
  for (const limit of ["tokens", "deadline"]) {
    let time = 0, runs = 0, assessments = 0;
    const tokens = limit === "tokens" ? 101 : 10;
    const f = fixture({ now: () => time,
      runOne: async () => {
        runs++; if (limit === "deadline") time = 1000;
        return { status: "stopped", provider_exit_confirmed: true,
          stop_reason: "revision-boundary", usage: { operational_tokens: tokens } };
      },
      assessOne: async () => { assessments++; throw Error("must-not-assess"); }
    });
    const r = await f.run();
    assert.equal(r.stop_reason, "aggregate-limit");
    assert.equal(r.usage_complete, false);
    assert.equal(r.operational_tokens, tokens);
    assert.equal(r.stages[0].status, "invalid");
    assert.equal(r.stages[0].diagnostics.stop_reason, "revision-boundary");
    assert.equal(runs, 1); assert.equal(assessments, 0);
    assert.ok(f.snapshots.filter(s => s.operational_tokens > 0).every(s => !s.usage_complete));
  }
});
test("scoped invalid samples require explicit continuation and confirmed cleanup", async () => {
  for (const allowed of [false, true]) {
    const f = fixture({ continuation: { product_failure: true, local_invalid: allowed },
      assessOne: async () => ({ outcome: "local-invalid", failure_scope: "subject", shared_validity_confirmed: true, isolation_confirmed: true, cleanup_confirmed: true }) });
    const r = await f.run();
    assert.equal(r.status, allowed ? "completed-with-failures" : "stopped");
    assert.equal(r.operational_tokens, allowed ? 20 : 10);
  }
});
test("budget exhaustion and persistence failure cannot dispatch another actor", async () => {
  const f = fixture({ limits: { operational_tokens: 10, elapsed_ms: 1000 } });
  const r = await f.run(); assert.equal(r.stop_reason, "aggregate-limit"); assert.equal(f.calls.length, 1);
  const broken = fixture({ persist: async () => { throw Error("disk-unavailable"); } });
  await assert.rejects(broken.run, /disk-unavailable/); assert.equal(broken.calls.length, 0);
  const late = fixture({ now: (() => { let n = 0; return () => n++ * 1000; })() });
  assert.equal((await late.run()).status, "stopped"); assert.equal(late.calls.length, 0);
  const exact = fixture({ limits: { operational_tokens: 40, elapsed_ms: 1000 } });
  assert.equal((await exact.run()).status, "completed");
  let time = 0;
  const lateAssessment = fixture({ now: () => time, assessOne: async () => { time = 1001; return { outcome: "passed", validity_confirmed: true, isolation_confirmed: true, cleanup_confirmed: true }; } });
  assert.equal((await lateAssessment.run()).stop_reason, "aggregate-limit"); assert.equal(lateAssessment.calls.length, 1);
});
