import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { analyzeEffectivenessPilot } from "../scripts/analyze-effectiveness-pilot.mjs";
import { matchesPilotTempleProfile } from "../scripts/run-effectiveness-pilot.mjs";

const protocolUrl = new URL("../.ai-org/artifacts/WI-0130/pilot-protocol.json", import.meta.url);

function candidate(caseId, conditionId, overrides = {}) {
  const base = {
    case_id: caseId,
    condition_id: conditionId,
    public_tests: "pass",
    acceptance_tests: "pass",
    blind_score: 90,
    blind_decision: "pass",
    operational_tokens: 10000,
    gross_tokens: 30000,
    latency_ms: 10000,
    changed_lines: 20,
    retry_count: 0,
    fallback_count: 0,
    intervention_count: 0,
    path_violation_count: 0
  };
  return { ...base, ...overrides };
}

function evidence() {
  return {
    schema_version: "temple.effectiveness-pilot-evidence/v1",
    candidates: ["idempotent-command", "compatible-event-evolution"].flatMap((caseId) => [
      candidate(caseId, "conventional-fixed"),
      candidate(caseId, "temple-fixed", { operational_tokens: 12000, latency_ms: 12000 }),
      candidate(caseId, "temple-adaptive", { operational_tokens: 9000, latency_ms: 9000 })
    ])
  };
}

test("pilot protocol isolates process and route effects", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const conditions = Object.fromEntries(protocol.conditions.map((entry) => [entry.id, entry]));
  assert.deepEqual(
    [conditions["conventional-fixed"].model, conditions["conventional-fixed"].reasoning_effort],
    [conditions["temple-fixed"].model, conditions["temple-fixed"].reasoning_effort]
  );
  assert.equal(conditions["temple-fixed"].process, conditions["temple-adaptive"].process);
  assert.notEqual(conditions["temple-fixed"].profile_id, conditions["temple-adaptive"].profile_id);
  assert.equal(protocol.codex.retry_count, 0);
  assert.equal(protocol.codex.fallback_count, 0);
  assert.equal(protocol.codex.concurrency, 1);
});

test("pilot preflight rejects Standard workflow candidates registered as Lean", () => {
  assert.equal(matchesPilotTempleProfile({ workflow_profile: "standard", scope_class: null, risk_tier: "standard" }), false);
  assert.equal(matchesPilotTempleProfile({ workflow_profile: "lean", scope_class: "bounded", risk_tier: "low" }), true);
});

test("analysis turns neutral quality with process overhead into a simplify-and-rerun action", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const result = analyzeEffectivenessPilot(evidence(), protocol);
  assert.equal(result.validity.status, "diagnostic-complete");
  assert.equal(result.process_effect.summary.median_operational_token_delta_percent, 20);
  assert.equal(result.process_effect.recommendation.decision, "simplify-and-rerun");
  assert.equal(result.route_effect.summary.median_operational_token_delta_percent, -25);
  assert.equal(result.route_effect.recommendation.decision, "retain-advisory");
  assert.equal(result.claims.automatic_routing_authorized, false);
});

test("missing blind evidence remains inconclusive rather than becoming zero", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const source = evidence();
  source.candidates[1].blind_score = null;
  source.candidates[1].blind_decision = null;
  const result = analyzeEffectivenessPilot(source, protocol);
  assert.equal(result.validity.status, "diagnostic-incomplete");
  assert.equal(result.process_effect.recommendation.decision, "inconclusive");
});

test("a correctness win with a large resource regression redesigns the broad adaptive rule", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const source = evidence();
  const fixed = source.candidates.find((entry) => entry.case_id === "idempotent-command" && entry.condition_id === "temple-fixed");
  fixed.acceptance_tests = "fail";
  fixed.blind_score = 60;
  fixed.blind_decision = "reject";
  const adaptive = source.candidates.find((entry) => entry.case_id === "idempotent-command" && entry.condition_id === "temple-adaptive");
  adaptive.operational_tokens = 18000;
  adaptive.latency_ms = 18000;
  const qualifiedAdaptive = source.candidates.find((entry) => entry.case_id === "compatible-event-evolution" && entry.condition_id === "temple-adaptive");
  qualifiedAdaptive.operational_tokens = 18000;
  qualifiedAdaptive.latency_ms = 18000;
  const result = analyzeEffectivenessPilot(source, protocol);
  assert.equal(result.validity.status, "diagnostic-complete-with-quality-exclusions");
  assert.equal(result.route_effect.summary.next_only_correctness_wins, 1);
  assert.equal(result.route_effect.recommendation.decision, "redesign");
});

test("invalid blind scores and retry contamination fail closed", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const invalidScore = evidence();
  invalidScore.candidates[0].blind_score = 101;
  assert.throws(() => analyzeEffectivenessPilot(invalidScore, protocol), /invalid blind score/);
  const retried = evidence();
  retried.candidates[0].retry_count = 1;
  assert.throws(() => analyzeEffectivenessPilot(retried, protocol), /contaminated/);
});

test("retained live observation stays within approval and preserves its protocol deviation", async () => {
  const observation = JSON.parse(await fs.readFile(new URL("../.ai-org/artifacts/WI-0130/live-experiment-observation.json", import.meta.url), "utf8"));
  assert.equal(observation.execution.candidate_turns_completed, 6);
  assert.equal(observation.execution.evaluator_turns_completed, 1);
  assert.ok(observation.execution.combined_operational_tokens <= observation.execution.approved_combined_operational_tokens);
  assert.equal(observation.protocol_audit.status, "completed_with_deviation");
  assert.equal(observation.protocol_audit.lean_core_path_claim_valid, false);
  assert.equal(observation.protocol_audit.standard_temple_process_diagnostic_valid, true);
  assert.equal(observation.protocol_audit.automatic_routing_qualified, false);
});
