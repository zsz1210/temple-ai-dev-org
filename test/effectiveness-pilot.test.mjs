import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { analyzeEffectivenessPilot } from "../scripts/analyze-effectiveness-pilot.mjs";

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

test("analysis turns neutral quality with process overhead into a simplify action", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const result = analyzeEffectivenessPilot(evidence(), protocol);
  assert.equal(result.validity.status, "diagnostic-complete");
  assert.equal(result.process_effect.summary.median_operational_token_delta_percent, 20);
  assert.equal(result.process_effect.recommendation.decision, "simplify");
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

test("invalid blind scores and retry contamination fail closed", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const invalidScore = evidence();
  invalidScore.candidates[0].blind_score = 101;
  assert.throws(() => analyzeEffectivenessPilot(invalidScore, protocol), /invalid blind score/);
  const retried = evidence();
  retried.candidates[0].retry_count = 1;
  assert.throws(() => analyzeEffectivenessPilot(retried, protocol), /contaminated/);
});
