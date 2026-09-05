// Read-only sealed-result reconciliation. No provider calls or source/lab writes.
// Usage: node .ai-org/artifacts/WI-0182/analyze.mjs PRIVATE_MATRIX_ROOT
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { digest, retainedArtifactDigest, operationStatistics } from "../../../scripts/delivery-control-pair.mjs";
const root = process.argv[2];
assert.ok(root, "A retained matrix root is required");
const read = async file => JSON.parse(await fs.readFile(file, "utf8"));
const matrix = await read(path.join(root, "matrix.frozen.json"));
const approval = await read(new URL("approval.json", import.meta.url));
const observed = await read(path.join(root, "matrix-run.json"));
assert.equal(observed.matrix_sha256, digest(matrix));
assert.equal(observed.approval_sha256, digest(approval));
const pick = (value, keys) => Object.fromEntries(keys.map(key => [key, value[key] ?? null]));
const delta = (a, b) => ({ ordinary: a, temple: b, difference: b-a, percent: a ? (b/a-1)*100 : null });
const pairs = [];
for (const planned of matrix.plan.pairs) {
  const summary = observed.pairs.find(pair => pair.id === planned.id);
  const pairRoot = path.join(root, planned.id);
  if (!summary) {
    await assert.rejects(fs.access(path.join(pairRoot, "run.json")), { code: "ENOENT" });
    pairs.push({ ...planned, status: "not-started", stages: [], comparison: null });
    continue;
  }
  const run = await read(path.join(pairRoot, "run.json"));
  const seal = await read(path.join(pairRoot, "seal.json"));
  assert.equal(digest(run), summary.run_sha256);
  assert.equal(digest(run), seal.run_sha256);
  assert.equal(await retainedArtifactDigest(pairRoot), seal.artifact_sha256);
  assert.equal(seal.archive_error, null);
  assert.equal(run.source_sha256, matrix.source_sha256);
  assert.equal(run.protocol_sha256, matrix.pairs.find(p => p.id === planned.id).protocol_sha256);
  assert.equal(run.model, planned.model);
  assert.equal(run.requested_effort, planned.reasoning_effort);
  const stages = run.stages.map(stage => {
    assert.deepEqual(operationStatistics(stage), stage.operations);
    const usage = stage.usage;
    if (usage) {
      assert.equal(usage.non_cached_input_tokens, usage.input_tokens-usage.cached_input_tokens);
      assert.equal(usage.operational_tokens, usage.non_cached_input_tokens+usage.output_tokens);
      assert.equal(usage.total_tokens, usage.input_tokens+usage.output_tokens);
    }
    return { ...pick(stage, ["arm", "stage", "status", "stop_reason", "requested_model", "acknowledged_model", "model_acknowledgement_basis", "requested_effort", "observed_thread_effort", "effective_turn_effort", "usage", "usage_finality", "total_elapsed_ms", "turn_elapsed_ms", "quality_passed", "quality_reason", "candidate_revision", "completion_agreement", "workflow", "treatment", "public_tests", "oracle", "retry_count", "fallback_count", "operations", "command_started_count", "command_completed_count", "unmatched_command_starts", "unmatched_patch_starts"]),
      command_timeline: stage.events.filter(e => e.method === "item/completed" && e.item_type === "commandExecution").map(e => ({ operation: e.classification?.operation ?? "unknown", exit_code: e.exit_code, output_bytes: e.output_bytes })) };
  });
  for (const arm of ["ordinary", "temple"]) {
    const rows = stages.filter(stage => stage.arm === arm);
    assert.equal(rows.reduce((n,stage) => n+(stage.usage?.operational_tokens ?? 0), 0), run.arms[arm].operational_tokens);
    assert.equal(rows.reduce((n,stage) => n+(stage.total_elapsed_ms ?? 0), 0), run.arms[arm].observed_stage_elapsed_ms);
  }
  if (run.efficiency_comparable === true) {
    assert.equal(stages.length, 4);
    for (const stage of stages) {
      assert.equal(stage.quality_passed, true);
      assert.equal(stage.public_tests.exit_code, 0);
      assert.equal(stage.oracle.exit_code, 0);
      assert.equal(stage.acknowledged_model, planned.model);
      assert.equal(stage.requested_effort, planned.reasoning_effort);
      if (stage.arm === "temple") {
        assert.equal(stage.workflow.pass, true);
        assert.equal(stage.treatment.pass, true);
      }
    }
  }
  const comparison = run.efficiency_comparable === true ? {
    operational_tokens: delta(run.arms.ordinary.operational_tokens, run.arms.temple.operational_tokens),
    stage_elapsed_ms: delta(run.arms.ordinary.observed_stage_elapsed_ms, run.arms.temple.observed_stage_elapsed_ms)
  } : null;
  pairs.push({ ...planned, ...pick(run, ["status", "stop_reason", "efficiency_comparable", "operational_tokens", "elapsed_ms", "subject_turn_requests", "usage_complete", "provider_cli_version", "node_version", "model_release_revision", "process_contract_sha256", "arms"]),
    seal: { run_sha256: seal.run_sha256, artifact_sha256: seal.artifact_sha256, verified: true }, stages, comparison });
}
assert.equal(pairs.reduce((n,p) => n+(p.operational_tokens ?? 0), 0), observed.observed_operational_tokens);
assert.equal(pairs.reduce((n,p) => n+(p.subject_turn_requests ?? 0), 0), observed.subject_turn_requests);
console.log(JSON.stringify({ schema_version: "temple.compact-comparison-analysis/v1", work_item_id: matrix.plan.work_item_id,
  matrix_sha256: digest(matrix), source_sha256: matrix.source_sha256, approval_sha256: digest(approval),
  matrix_status: observed.status, stop_reason: observed.stop_reason ?? null,
  observed_operational_tokens: observed.observed_operational_tokens, observed_stage_turns: observed.subject_turn_requests,
  planned_stage_turns: matrix.plan.maximum_stage_turns, elapsed_ms: observed.elapsed_ms, pairs,
  limitations: ["One pair per model; within-model order not counterbalanced", "Cache uncontrolled", "Last-observed usage is not account-final", "Effective effort and immutable model revision unobserved", "Output bytes are not causal Token attribution", "Historical runs are descriptive context only", "Coordinator and reviewer model usage excluded"],
  recalculation_model_turns: 0, raw_prompts_or_outputs_published: false
}, null, 2));
