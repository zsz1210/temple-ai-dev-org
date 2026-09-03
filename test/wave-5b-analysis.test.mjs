import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { analyzeWave5A } from "../scripts/analyze-wave-5a-overhead.mjs";
import { manifestDigest, validateWave5BProtocol } from "../scripts/validate-wave-5b-protocol.mjs";

const source = JSON.parse(await fs.readFile(new URL("../.ai-org/artifacts/WI-0113/experiment-result.json", import.meta.url), "utf8"));

function validProtocol() {
  const files = [
    { path: "blind/pkg-a.json", sha256: "a".repeat(64), kind: "arm-neutral-package" },
    { path: "rubric/v1.json", sha256: "b".repeat(64), kind: "frozen-rubric" }
  ];
  const digest = manifestDigest(files);
  const scoreDigest = "c".repeat(64);
  return {
    schema_version: "temple.wave-5b-evaluator-protocol/v1",
    evaluator_context: {
      context_id: "task-evaluator-001",
      fresh: true,
      coordinator_inputs_available: false,
      arm_mapping_available: false,
      provider_context_evidence_ref: "task-registry/task-evaluator-001"
    },
    input_manifest: { files, digest },
    evaluator_visible_metadata: { study_id: "wave-5b", package_count: 1, rubric_version: "v1" },
    score_freeze: {
      frozen_at: "2026-09-03T00:00:00Z",
      artifact_sha256: scoreDigest,
      evaluator_context_id: "task-evaluator-001",
      input_manifest_digest: digest,
      signed_by: "independent-evaluator"
    },
    mapping_unseal: {
      unsealed_at: "2026-09-03T00:01:00Z",
      score_artifact_sha256: scoreDigest,
      joined_by: "coordinator"
    }
  };
}

test("Wave 5A analysis reproduces retained totals and qualifying-pair deltas", () => {
  const result = analyzeWave5A(source, "d".repeat(64));
  assert.equal(result.recomputed.gross_total_tokens, 1662089);
  assert.equal(result.recomputed.operational_budget_tokens, 153481);
  assert.equal(result.recomputed.program_elapsed_ms, 473047);
  assert.equal(result.recomputed.candidate_latency_ms, 472441);
  assert.equal(result.recomputed.coordinator_overhead_ms, 606);
  assert.equal(result.observations.qualifying_pair_count, 1);
  assert.equal(result.observations.quality_excluded_pair_count, 1);
  const qualified = result.pairs.find((entry) => entry.qualified_for_resource_comparison);
  assert.equal(qualified.temple_minus_minimal.operational_budget_tokens, 22471);
  assert.equal(qualified.temple_minus_minimal.operational_budget_percent, 71.8888);
  assert.equal(qualified.temple_minus_minimal.latency_ms, 118330);
  assert.equal(qualified.temple_minus_minimal.latency_percent, 145.3757);
});

test("Wave 5A analysis fails when retained aggregates drift", () => {
  const changed = structuredClone(source);
  changed.aggregate.operational_budget_tokens += 1;
  assert.throws(() => analyzeWave5A(changed), /operational Token total drifted/);
});

test("Wave 5B protocol qualifies a fresh evaluator context after score freeze", () => {
  const result = validateWave5BProtocol(validProtocol());
  assert.equal(result.status, "qualified");
  assert.equal(result.score_frozen_before_mapping_unseal, true);
  assert.equal(result.os_security_sandbox_claimed, false);
});

test("Wave 5B protocol rejects coordinator mapping exposure", () => {
  const observation = validProtocol();
  observation.evaluator_context.coordinator_inputs_available = true;
  observation.input_manifest.files.push({ path: "coordinator/sealed/mapping.json", sha256: "e".repeat(64), kind: "mapping" });
  observation.input_manifest.digest = manifestDigest(observation.input_manifest.files);
  observation.evaluator_visible_metadata.condition = "temple";
  const result = validateWave5BProtocol(observation);
  assert.equal(result.status, "rejected");
  assert.match(result.failures.join("\n"), /coordinator inputs|forbidden evaluator input path|metadata/);
});

test("Wave 5B protocol rejects unseal before score freeze and digest drift", () => {
  const observation = validProtocol();
  observation.mapping_unseal.unsealed_at = "2026-09-02T23:59:00Z";
  observation.input_manifest.digest = "f".repeat(64);
  const result = validateWave5BProtocol(observation);
  assert.equal(result.status, "rejected");
  assert.match(result.failures.join("\n"), /manifest digest mismatch|not frozen before/);
});
