// Read-only, zero-model recalculation of the sealed WI-0179 results.
// Usage: node .ai-org/artifacts/WI-0179/analyze-results.mjs PRIVATE_MATRIX_ROOT
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { digest, retainedArtifactDigest, operationStatistics } from "../../../scripts/delivery-control-pair.mjs";

const root = process.argv[2];
if (!root) throw new Error("A retained private matrix root is required; no model execution is supported.");
const json = async p => JSON.parse(await fs.readFile(p, "utf8"));
const local = name => new URL(name, import.meta.url);
const matrix = await json(local("matrix.v2.frozen.json"));
const approval = await json(local("approval.v2.json"));
const observed = await json(path.join(root, "matrix-run.json"));
assert.equal(observed.matrix_sha256, digest(matrix));
assert.equal(observed.approval_sha256, digest(approval));
const select = (value, keys) => Object.fromEntries(keys.map(key => [key, value[key] ?? null]));
const sum = (rows, key) => rows.reduce((n, row) => n + row[key], 0);
const delta = (ordinary, temple) => ({ ordinary, temple, absolute: temple - ordinary, percent: (temple / ordinary - 1) * 100 });
const stageKeys = ["arm", "stage", "status", "stop_reason", "requested_model", "acknowledged_model", "model_acknowledgement", "model_acknowledgement_basis", "requested_effort", "observed_thread_effort", "effective_turn_effort", "usage", "usage_finality", "usage_observed_at_ms", "total_elapsed_ms", "setup_elapsed_ms", "turn_elapsed_ms", "coordinator_validation_ms", "quality_passed", "candidate_revision", "completion_agreement", "workflow", "treatment", "public_tests", "oracle", "observed_test_exit_codes", "command_started_count", "command_completed_count", "patch_started_count", "patch_completed_count", "tool_count", "reported_output_bytes", "unmatched_command_starts", "unmatched_patch_starts", "interrupt_requested", "interrupt_acknowledged", "terminal_status", "retry_count", "fallback_count"];
const pairs = [];
for (const planned of matrix.plan.pairs) {
  const result = observed.pairs.find(pair => pair.id === planned.id);
  if (!result) {
    await assert.rejects(fs.access(path.join(root, planned.id, "run.json")), { code: "ENOENT" });
    pairs.push({ ...planned, status: "not-started", efficiency_comparable: null, stages: [], observed_operational_tokens: null });
    continue;
  }
  const pairRoot = path.join(root, planned.id);
  const run = await json(path.join(pairRoot, "run.json"));
  const seal = await json(path.join(pairRoot, "seal.json"));
  const frozen = matrix.pairs.find(pair => pair.id === planned.id);
  assert.equal(digest(run), seal.run_sha256);
  assert.equal(digest(run), result.run_sha256);
  assert.equal(await retainedArtifactDigest(pairRoot), seal.artifact_sha256);
  assert.equal(seal.archive_error, null);
  assert.equal(run.protocol_sha256, frozen.protocol_sha256);
  assert.equal(run.source_sha256, matrix.source_sha256);
  assert.equal(run.model, planned.model);
  assert.equal(run.requested_effort, planned.reasoning_effort);
  assert.equal(sum(run.stages.map(s => s.usage), "operational_tokens"), result.observed_operational_tokens);
  const stages = run.stages.map(s => {
    assert.deepEqual(operationStatistics(s), s.operations);
    assert.equal(s.usage.non_cached_input_tokens, s.usage.input_tokens - s.usage.cached_input_tokens);
    assert.equal(s.usage.operational_tokens, s.usage.non_cached_input_tokens + s.usage.output_tokens);
    assert.equal(s.usage.total_tokens, s.usage.input_tokens + s.usage.output_tokens);
    assert.equal(s.retry_count, 0); assert.equal(s.fallback_count, 0);
    return { ...select(s, stageKeys), operations: s.operations,
      command_timeline: s.events.filter(e => e.method === "item/completed" && e.item_type === "commandExecution").map(e => ({ operation: e.classification?.operation ?? "unknown", exit_code: e.exit_code, output_bytes: e.output_bytes })) };
  });
  pairs.push({ ...planned, ...select(run, ["status", "stop_reason", "efficiency_comparable", "elapsed_ms", "subject_turn_requests", "usage_complete", "usage_finality", "provider_cli_version", "node_version", "model_release_revision", "process_contract_sha256", "fixture_sha256", "command_policy_sha256", "output_schema_sha256", "arms"]),
    observed_operational_tokens: result.observed_operational_tokens, protocol_sha256: run.protocol_sha256,
    provider_contract_sha256: frozen.provider_sha256, seal: { ...seal, run_verified: true, artifacts_verified: true }, stages });
}
const attempted = pairs.filter(p => p.status !== "not-started");
assert.equal(sum(attempted, "observed_operational_tokens"), observed.observed_operational_tokens);
assert.equal(sum(attempted, "subject_turn_requests"), observed.subject_turn_requests);
const terra = pairs.find(p => p.id === "terra-ordinary-first");
assert.equal(terra.efficiency_comparable, true);
const comparisons = {};
for (const stage of ["build", "verify"]) {
  const ordinary = terra.stages.find(s => s.arm === "ordinary" && s.stage === stage);
  const temple = terra.stages.find(s => s.arm === "temple" && s.stage === stage);
  comparisons[stage] = { operational_tokens: delta(ordinary.usage.operational_tokens, temple.usage.operational_tokens), elapsed_ms: delta(ordinary.total_elapsed_ms, temple.total_elapsed_ms) };
}
comparisons.total = { operational_tokens: delta(terra.arms.ordinary.operational_tokens, terra.arms.temple.operational_tokens), elapsed_ms: delta(terra.arms.ordinary.observed_stage_elapsed_ms, terra.arms.temple.observed_stage_elapsed_ms) };
comparisons.verifier_share_of_operational_token_difference_percent = comparisons.verify.operational_tokens.absolute / comparisons.total.operational_tokens.absolute * 100;
const interrupted = pairs.find(p => p.id === "gpt6-temple-first").stages[0];
const deliverIndex = interrupted.command_timeline.findIndex(e => e.operation === "temple-deliver" && e.exit_code === 0);
assert.ok(deliverIndex >= 0);
const afterDelivery = interrupted.command_timeline.slice(deliverIndex + 1);
const diagnostic = await json(local("post-stop-diagnostic.json"));
assert.equal(diagnostic.archive_unchanged, true);
assert.equal(diagnostic.changes_original_outcome, false);
console.log(JSON.stringify({
  schema_version: "temple.optimized-delivery-analysis/v1", work_item_id: "WI-0179",
  status: "partial-measured-comparison-matrix-stopped", matrix_sha256: digest(matrix), approval_sha256: digest(approval), source_sha256: matrix.source_sha256,
  matrix_run: { ...observed, run_sha256: digest(observed) }, planned: matrix.plan,
  completed_comparable_pairs: attempted.filter(p => p.efficiency_comparable).length,
  pairs, terra_current_comparison: comparisons,
  gpt6_stop_diagnosis: { original_acceptance: "not-assessed-after-interruption", post_delivery_commands: afterDelivery,
    post_delivery_reported_output_bytes: sum(afterDelivery, "output_bytes"),
    observed_cap_overshoot: interrupted.usage.operational_tokens - matrix.plan.pair_limits.per_stage_operational_tokens,
    per_operation_token_attribution: null, post_stop_diagnostic: diagnostic },
  limitations: ["One completed pair; counterbalancing incomplete", "Cache uncontrolled", "Output byte counts are not Token counts; missing command output is unknown", "Usage is last observed, not account-final", "Effective turn effort and model release revision unobserved", "Stage wall time includes tools and provider latency, not pure model generation", "Coordinator and report-author model usage not attributed", "Post-stop product checks do not replace the unstarted fresh Verifier"],
  publication: { raw_prompts: false, raw_outputs: false, private_paths: false, provider_session_ids: false, account_identifiers: false, credentials: false },
  recalculation_model_turns: 0, additional_actor_execution: false
}, null, 2));
