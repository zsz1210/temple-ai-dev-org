import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { analyzeEffectivenessPilotV2 } from "../scripts/analyze-effectiveness-pilot-v2.mjs";
import {
  matchesNativeLeanCandidate,
  validatePilotApprovalV2,
  validatePilotProtocolV2
} from "../scripts/run-effectiveness-pilot-v2.mjs";

const protocolUrl = new URL("../.ai-org/artifacts/WI-0131/pilot-protocol-v2.json", import.meta.url);

function candidate(caseId, conditionId, overrides = {}) {
  return {
    case_id: caseId,
    condition_id: conditionId,
    public_tests: "pass",
    acceptance_tests: "pass",
    blind_score: 90,
    blind_decision: "pass",
    operational_tokens: 10000,
    gross_tokens: 20000,
    latency_ms: 10000,
    context_utf8_bytes: conditionId === "conventional-terra" ? 1000 : 2000,
    context_profile_digest: `sha256:${conditionId.padEnd(64, "0").slice(0, 64)}`,
    retry_count: 0,
    fallback_count: 0,
    ...overrides
  };
}

function evidence() {
  return {
    schema_version: "temple.effectiveness-pilot-evidence/v2",
    candidates: ["idempotent-command", "compatible-event-evolution"].flatMap((caseId) => [
      candidate(caseId, "conventional-terra"),
      candidate(caseId, "temple-terra", { operational_tokens: 11000 }),
      candidate(caseId, "temple-luna", { operational_tokens: 18000, latency_ms: 18000 }),
      candidate(caseId, "temple-sol", { operational_tokens: 30000, latency_ms: 30000 })
    ])
  };
}

test("v2 protocol isolates process, efficient escalation, and flagship ceiling questions", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  assert.deepEqual(validatePilotProtocolV2(protocol), { valid: true, errors: [] });
  assert.deepEqual(protocol.comparisons.map((entry) => entry.attribution), ["process", "route-bundle", "route-bundle"]);
  assert.equal(protocol.evaluation.objective_held_out_tests_primary, true);
  assert.equal(protocol.claims.pure_model_effect, false);
});

test("native Lean recognition reads the canonical profile-assessment scope", () => {
  assert.equal(matchesNativeLeanCandidate({ workflow_profile: "lean", profile_assessment: { scope_class: "bounded" }, risk_tier: "low", state: "build" }), true);
  assert.equal(matchesNativeLeanCandidate({ workflow_profile: "standard", profile_assessment: { scope_class: "bounded" }, risk_tier: "low", state: "build" }), false);
});

test("approval template binds the exact protocol but rejects unset limits and absent allowance consent", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const template = JSON.parse(await fs.readFile(new URL("../.ai-org/artifacts/WI-0131/account-approval.template.json", import.meta.url), "utf8"));
  const result = validatePilotApprovalV2(template, protocol);
  assert.equal(result.accepted, false);
  assert.ok(!result.errors.some((entry) => entry.includes("protocol_sha256")));
  assert.ok(result.errors.some((entry) => entry.includes("included_pro_allowance_accepted")));
  assert.ok(result.errors.some((entry) => entry.includes("approved_combined_operational_tokens")));
});

test("analysis keeps Sol as a ceiling when it adds no objective quality", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const result = analyzeEffectivenessPilotV2(evidence(), protocol);
  assert.equal(result.validity.status, "diagnostic-complete");
  assert.equal(result.comparisons["process-effect"].recommendation.decision, "simplify-and-rerun");
  assert.equal(result.comparisons["efficient-escalation"].recommendation.decision, "keep-terra-default");
  assert.equal(result.comparisons["flagship-ceiling"].recommendation.decision, "reserve-only");
  assert.equal(result.claims.pure_model_effect_proven, false);
  assert.equal(result.claims.automatic_routing_authorized, false);
});

test("an objective Sol-only win retains Sol as a capability ceiling, not a default", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const source = evidence();
  const luna = source.candidates.find((entry) => entry.case_id === "idempotent-command" && entry.condition_id === "temple-luna");
  luna.acceptance_tests = "fail";
  luna.blind_score = 60;
  luna.blind_decision = "reject";
  const result = analyzeEffectivenessPilotV2(source, protocol);
  assert.equal(result.comparisons["flagship-ceiling"].recommendation.decision, "retain-as-capability-ceiling");
});

test("retry contamination and incomplete matrices fail closed", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolUrl, "utf8"));
  const contaminated = evidence();
  contaminated.candidates[0].retry_count = 1;
  assert.throws(() => analyzeEffectivenessPilotV2(contaminated, protocol), /contaminated/);
  const incomplete = evidence();
  incomplete.candidates.pop();
  assert.throws(() => analyzeEffectivenessPilotV2(incomplete, protocol), /exactly 8 candidates/);
});
