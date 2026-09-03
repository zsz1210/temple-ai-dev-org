import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { approvedEvaluatorEnvelope, evaluatorStoppedResult, sanitizeBlindPackage, scoreSchema, validateFrozenScores } from "../scripts/run-wave-5b-evaluator.mjs";

const blind = {
  package_id: "pkg-001",
  evidence_id: "evd-001",
  case_id: "case-a",
  product_patch: "patch",
  tests: { public: "pass", acceptance: "pass" },
  completion: { remaining_risks: [] },
  usage: { total_tokens: null },
  candidate_revision: "secret",
  condition: "temple"
};

test("evaluator package sanitizer removes condition, usage, Token, and revision fields", () => {
  const result = sanitizeBlindPackage(blind);
  assert.equal(result.package_id, "pkg-001");
  assert.equal(result.usage, undefined);
  assert.equal(result.candidate_revision, undefined);
  assert.equal(result.condition, undefined);
  assert.doesNotMatch(JSON.stringify(result), /token/i);
});

test("Wave 5B setup accepts a pinned protocol path and emits Luna Medium candidate limits", async (testContext) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wave5b-setup-test-"));
  const lab = path.join(root, "lab");
  testContext.after(() => fs.rm(root, { recursive: true, force: true }));
  const run = spawnSync(process.execPath, [
    new URL("../.ai-org/artifacts/WI-0107/setup-wave-5a.mjs", import.meta.url).pathname,
    "--protocol-path", new URL("../.ai-org/artifacts/WI-0117/wave-5b-protocol.json", import.meta.url).pathname,
    "--lab-root", lab
  ], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const manifest = JSON.parse(await fs.readFile(path.join(lab, "coordinator", "validation-program.json"), "utf8"));
  assert.equal(manifest.id, "wave-5b-lean-process-comparison");
  assert.equal(manifest.limits.aggregate_hard_tokens, 240000);
  assert.equal(manifest.waves.length, 4);
  for (const wave of manifest.waves) {
    assert.equal(wave.turns[0].requested_model, "gpt-5.6-luna");
    assert.equal(wave.turns[0].requested_reasoning_effort, "medium");
  }
});

test("frozen scores require one bounded score for every exact package identity", () => {
  const packages = [sanitizeBlindPackage(blind)];
  const result = validateFrozenScores({
    packages: [{
      package_id: "pkg-001",
      case_id: "case-a",
      weighted_score: 1,
      decision: "pass",
      critical_failure: null,
      rationale: "All acceptance evidence passes."
    }],
    summary: "Qualified"
  }, packages);
  assert.equal(result.packages[0].decision, "pass");
});

test("the Provider output schema declares the same normalized score interval as post-validation", () => {
  const property = scoreSchema.properties.packages.items.properties.weighted_score;
  assert.equal(property.minimum, 0);
  assert.equal(property.maximum, 1);
});

test("frozen scores reject missing, duplicate, unknown, or unbounded package results", () => {
  const packages = [sanitizeBlindPackage(blind)];
  assert.throws(() => validateFrozenScores({ packages: [], summary: "" }, packages), /count/);
  assert.throws(() => validateFrozenScores({ packages: [{ package_id: "other", case_id: "case-a", weighted_score: 1, decision: "pass" }] }, packages), /identity/);
  assert.throws(() => validateFrozenScores({ packages: [{ package_id: "pkg-001", case_id: "case-a", weighted_score: 2, decision: "pass" }] }, packages), /outside/);
});

test("evaluator stop evidence retains exact observed usage without freezing or unsealing", () => {
  const error = Object.assign(new Error("evaluator-operational-token-limit"), {
    code: "evaluator-operational-token-limit",
    evaluator_details: {
      threadId: "thread-1",
      turnId: "turn-1",
      usage: { input_tokens: 25000, cached_input_tokens: 1000, output_tokens: 1000, reasoning_output_tokens: 500, total_tokens: 26000 },
      model: { requested_model: "gpt-5.6-luna", acknowledged_model: "gpt-5.6-luna" },
      invalidScoreObservation: { returned_score_count: 4, minimum_returned_score: 95, maximum_returned_score: 100 }
    }
  });
  const result = evaluatorStoppedResult({ workItemId: "WI-0117", error });
  assert.equal(result.status, "stopped");
  assert.equal(result.evaluator.operational_budget_tokens, 25000);
  assert.equal(result.scores_frozen, false);
  assert.equal(result.mapping_unsealed, false);
  assert.equal(result.automatic_retry, false);
  assert.equal(result.evaluator.model.acknowledged_model, "gpt-5.6-luna");
  assert.equal(result.invalid_score_observation.maximum_returned_score, 100);
});

test("replacement evaluator approval is exact, bounded, and cannot authorize an automatic retry", () => {
  const approval = {
    schema_version: "temple.wave-5b-evaluator-replacement-approval/v1",
    work_item_id: "WI-0117",
    approved_by: "repository-owner",
    approved_at: "2026-09-02T23:17:00Z",
    replacement_for: "evaluator-stopped-attempt-1",
    automatic_credit_reload_disabled: true,
    included_pro_allowance_accepted: true,
    purchased_credits_authorized: false,
    usage_reset_authorized: false,
    approved_evaluator_turns: 1,
    approved_additional_operational_tokens: 40000,
    approved_model: "gpt-5.6-luna",
    approved_reasoning_effort: "medium",
    approved_wall_clock_ms: 600000,
    max_retries: 0,
    fallback_allowed: false,
    tool_use_allowed: false,
    network_access: false
  };
  const accepted = approvedEvaluatorEnvelope(approval, "WI-0117");
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.replacement, true);
  assert.equal(accepted.evaluatorHardTokens, 40000);
  assert.equal(accepted.evaluatorHardMs, 600000);
  assert.equal(approvedEvaluatorEnvelope({ ...approval, max_retries: 1 }, "WI-0117").accepted, false);
  assert.equal(approvedEvaluatorEnvelope({ ...approval, approved_additional_operational_tokens: 40001 }, "WI-0117").accepted, false);
});
