import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  CONTEXT_ABLATION_ANALYSIS_SCHEMA,
  analyzeContextAblation,
  candidateInstruction,
  conditionDefinitions,
  contextAblationApprovalTemplate,
  contextAblationProtocolDigest,
  contextAblationTestProviderContract,
  evaluateContextAblationOutput,
  evaluateRetainedFalseNegativeRegression,
  multiOutputSchema,
  prepareContextAblationLab,
  preflightContextAblation,
  rehearseContextAblation,
  singleOutputSchema,
  validateAnswerFreeOutputSchema,
  validateContextAblationApproval,
  validateContextAblationProtocol
} from "../scripts/run-context-capsule-ablation.mjs";

function syntheticCondition(definition, expected, operationalTokens, latencyMs, toolBytes) {
  return {
    id: definition.id,
    shape: definition.shape,
    strategy: definition.strategy,
    status: "completed",
    stop_scope: null,
    stop_reason: null,
    requested_model: definition.model,
    acknowledged_model: definition.model,
    requested_reasoning_effort: definition.reasoning_effort,
    acknowledged_configured_reasoning_effort: "medium",
    effective_turn_reasoning_effort: null,
    reasoning_effort_evidence_kind: "requested-and-thread-configured-not-per-turn-execution-telemetry",
    usage: {
      input_tokens: operationalTokens - 100,
      cached_input_tokens: 0,
      output_tokens: 100,
      reasoning_output_tokens: 0,
      total_tokens: operationalTokens
    },
    operational_tokens: operationalTokens,
    elapsed_ms: latencyMs,
    turn_elapsed_ms: latencyMs,
    time_to_first_activity_ms: 10,
    tool_activity: {
      command_items: 2,
      command_actions: 2,
      temple_md_reads: definition.strategy === "legacy-expanded" ? 1 : 0,
      context_package_reads: 1,
      reported_output_bytes: toolBytes,
      item_types: { commandExecution: 2, agentMessage: 1 }
    },
    completion: structuredClone(expected),
    objective: evaluateContextAblationOutput(definition.shape, expected, expected),
    retry_count: 0,
    fallback_count: 0,
    raw_prompt_retained: false,
    raw_response_retained: false,
    hidden_reasoning_retained: false,
    model_generation_performed: true
  };
}

test("Context Capsule ablation schemas and instructions reveal no frozen answers", () => {
  assert.deepEqual(conditionDefinitions.map((entry) => entry.id), [
    "single-stage-aware",
    "multi-legacy-expanded",
    "single-legacy-expanded",
    "multi-stage-aware"
  ]);
  assert.equal(conditionDefinitions.every((entry) => entry.model === "gpt-5.6-terra" && entry.reasoning_effort === "medium"), true);
  assert.equal(singleOutputSchema.additionalProperties, false);
  assert.equal(multiOutputSchema.additionalProperties, false);
  assert.equal(validateAnswerFreeOutputSchema(singleOutputSchema).pass, true);
  assert.equal(validateAnswerFreeOutputSchema(multiOutputSchema).pass, true);
  assert.equal(validateAnswerFreeOutputSchema({ type: "string", enum: ["leaked"] }).pass, false);
  for (const shape of ["single-repository", "coordinator-multi-repository"]) {
    const instruction = candidateInstruction(shape);
    assert.match(instruction, /CONTEXT_PACKAGE\.json/);
    assert.doesNotMatch(instruction, /Crash recovery after fsync/);
    assert.doesNotMatch(instruction, /Coordinator persistence coverage/);
    assert.doesNotMatch(instruction, /REQ-IDEMPOTENCY-001|ADR-0042|OrderPlaced\/v2|ACTION-INDEPENDENT-CRASH-QA/);
  }
});

test("objective evaluation is exact and fails partial or duplicated recovery", () => {
  const single = {
    requirement_id: "REQ-IDEMPOTENCY-001",
    duplicate_request_effect: "return-original-receipt",
    decision_id: "ADR-0042",
    repository_revision: "a".repeat(40),
    public_tests_passed: 18,
    public_tests_failed: 0,
    unresolved_risk_id: "RISK-CRASH-RECOVERY",
    safe_next_action_id: "ACTION-INDEPENDENT-CRASH-QA",
    authority_source: "docs/product/idempotency.md"
  };
  assert.equal(evaluateContextAblationOutput("single-repository", single, single).pass, true);
  const shortRevision = evaluateContextAblationOutput("single-repository", { ...single, repository_revision: "a".repeat(39) }, single);
  assert.equal(shortRevision.pass, false);
  assert.equal(shortRevision.typed_fact_pass, false);
  assert.equal(evaluateContextAblationOutput("single-repository", { ...single, public_tests_failed: -1 }, single).pass, false);
  assert.equal(evaluateContextAblationOutput("single-repository", { ...single, authority_source: "/tmp/authority" }, single).pass, false);
  const multi = {
    contract_id: "OrderPlaced/v2",
    compatibility_policy_id: "COMPAT-V1-CONSUMERS",
    component_revisions: Object.fromEntries(["gateway", "catalog", "orders", "notifications"].map((id) => [id, "b".repeat(40)])),
    completed_slice_ids: ["orders-catalog", "notifications", "gateway"],
    unresolved_risk_id: "RISK-COORDINATOR-PERSISTENCE",
    authority_owner_id: "coordinator",
    safe_next_action_id: "ACTION-BOUNDED-INTEGRATION-TEST"
  };
  assert.equal(evaluateContextAblationOutput("coordinator-multi-repository", multi, multi).pass, true);
  assert.equal(evaluateContextAblationOutput("coordinator-multi-repository", { ...multi, completed_slice_ids: [...multi.completed_slice_ids, "gateway"] }, multi).pass, false);
  assert.equal(evaluateContextAblationOutput("coordinator-multi-repository", { ...multi, contract_id: "OrderPlaced version 2" }, multi).pass, false);
  assert.equal(evaluateContextAblationOutput("coordinator-multi-repository", { ...multi, authority_owner_id: "Coordinator Team" }, multi).pass, false);
});

test("retained WI-0138 display variants project to the same typed facts without rescoring history", async () => {
  const retained = JSON.parse(await fs.readFile(path.resolve(".ai-org/artifacts/WI-0138/live-observation.json"), "utf8"));
  const result = evaluateRetainedFalseNegativeRegression(retained);
  assert.equal(result.pass, true);
  assert.equal(result.historical_result_changed, false);
  assert.deepEqual(result.single.map((entry) => entry.facts), [
    { public_tests_passed: 18, public_tests_failed: 0 },
    { public_tests_passed: 18, public_tests_failed: 0 }
  ]);
  assert.deepEqual(result.multi.map((entry) => entry.facts), [
    { contract_id: "OrderPlaced/v2" },
    { contract_id: "OrderPlaced/v2" }
  ]);
});

test("generation-free preparation produces matched repositories and smaller stage-aware packages", async (context) => {
  const labRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0139-test-"));
  await fs.rm(labRoot, { recursive: true, force: true });
  context.after(() => fs.rm(labRoot, { recursive: true, force: true }));
  const prepared = await prepareContextAblationLab(labRoot, {
    providerContract: contextAblationTestProviderContract(),
    sourceRevision: "a".repeat(40),
    writeArtifacts: false
  });
  const validation = validateContextAblationProtocol(prepared.protocol);
  assert.equal(validation.valid, true, validation.errors.join("\n"));
  assert.equal(prepared.protocol.protocol_sha256, contextAblationProtocolDigest(prepared.protocol));
  for (const shape of ["single-repository", "coordinator-multi-repository"]) {
    const stage = prepared.protocol.conditions.find((entry) => entry.shape === shape && entry.strategy === "stage-aware");
    const legacy = prepared.protocol.conditions.find((entry) => entry.shape === shape && entry.strategy === "legacy-expanded");
    assert.ok(stage.treatment.measured_source_bytes < legacy.treatment.measured_source_bytes);
    assert.ok(stage.treatment.selected_source_count < legacy.treatment.selected_source_count);
    assert.notEqual(stage.treatment.selection_digest, legacy.treatment.selection_digest);
    assert.deepEqual(stage.repository_manifest, legacy.repository_manifest);
  }
  const legacyPackage = JSON.parse(await fs.readFile(path.join(labRoot, "conditions/single-legacy-expanded/CONTEXT_PACKAGE.json"), "utf8"));
  const stagePackage = JSON.parse(await fs.readFile(path.join(labRoot, "conditions/single-stage-aware/CONTEXT_PACKAGE.json"), "utf8"));
  assert.equal(legacyPackage.sources.some((entry) => entry.path === "coordinator/TEMPLE.md"), true);
  assert.equal(stagePackage.sources.some((entry) => entry.path === "coordinator/TEMPLE.md"), false);
  const readiness = await rehearseContextAblation(labRoot, path.join(labRoot, "live-protocol.json"), {
    completedAt: "2026-01-01T00:00:00.000Z",
    writeArtifacts: false
  });
  assert.equal(readiness.pass, true);
  assert.equal(readiness.operational_tokens, 0);
  assert.equal(readiness.model_generation_performed, false);

  const template = contextAblationApprovalTemplate(prepared.protocol);
  assert.equal(validateContextAblationApproval(template, prepared.protocol).accepted, false);
  const approved = {
    ...template,
    approved: true,
    authorization_source: "test fixture",
    approved_at: "2026-01-01T00:00:00.000Z"
  };
  assert.equal(validateContextAblationApproval(approved, prepared.protocol).accepted, true);
  assert.equal(validateContextAblationApproval({ ...approved, approved_aggregate_operational_tokens: 1 }, prepared.protocol).accepted, false);
  const approvalPath = path.join(labRoot, "account-approval.json");
  await fs.writeFile(approvalPath, `${JSON.stringify(approved, null, 2)}\n`);
  const preflight = await preflightContextAblation(
    labRoot,
    path.join(labRoot, "live-protocol.json"),
    approvalPath,
    { providerContract: contextAblationTestProviderContract(), writeArtifacts: false, observedAt: "2026-01-01T00:00:00.000Z" }
  );
  assert.equal(preflight.generation_ready, true, preflight.blockers.join(", "));
});

test("analysis keeps shapes separate and makes correctness primary", () => {
  const protocol = {
    protocol_sha256: "c".repeat(64),
    conditions: conditionDefinitions.map((definition) => ({
      ...definition,
      treatment: {
        measured_source_bytes: definition.strategy === "legacy-expanded" ? 10000 : 5000,
        selected_source_count: definition.strategy === "legacy-expanded" ? 8 : 4
      }
    }))
  };
  const expectedByShape = {
    "single-repository": {
      requirement_id: "REQ-ONE", duplicate_request_effect: "return-original", decision_id: "ADR-0042",
      repository_revision: "a".repeat(40), public_tests_passed: 18, public_tests_failed: 0,
      unresolved_risk_id: "RISK-ONE", safe_next_action_id: "ACTION-ONE", authority_source: "source"
    },
    "coordinator-multi-repository": {
      contract_id: "Event/v2", compatibility_policy_id: "COMPAT-V1",
      component_revisions: Object.fromEntries(["gateway", "catalog", "orders", "notifications"].map((id) => [id, "b".repeat(40)])),
      completed_slice_ids: ["one"], unresolved_risk_id: "RISK-ONE",
      authority_owner_id: "coordinator", safe_next_action_id: "ACTION-ONE"
    }
  };
  const observations = {
    "single-stage-aware": [800, 800, 800],
    "single-legacy-expanded": [1000, 1000, 1000],
    "multi-stage-aware": [1600, 1600, 1600],
    "multi-legacy-expanded": [2000, 2000, 2000]
  };
  const conditions = conditionDefinitions.map((definition) => {
    const [tokens, latency, bytes] = observations[definition.id];
    return syntheticCondition(definition, expectedByShape[definition.shape], tokens, latency, bytes);
  });
  const analysis = analyzeContextAblation({
    protocol,
    observation: { conditions, retry_count: 0, fallback_count: 0 },
    generatedAt: "2026-01-01T00:00:00.000Z"
  });
  assert.equal(analysis.schema_version, CONTEXT_ABLATION_ANALYSIS_SCHEMA);
  assert.equal(analysis.all_candidates_correct, true);
  assert.deepEqual(analysis.comparisons.map((entry) => entry.outcome), ["supported", "supported"]);
  assert.equal(analysis.diagnostic_aggregate.operational_tokens_delta.percent, -20);
  const regressed = structuredClone(conditions);
  regressed.find((entry) => entry.id === "single-stage-aware").objective.pass = false;
  const regression = analyzeContextAblation({ protocol, observation: { conditions: regressed } });
  assert.equal(regression.comparisons.find((entry) => entry.shape === "single-repository").outcome, "quality-regression");
});

test("analysis preserves unknown usage instead of inventing a savings delta", () => {
  const protocol = {
    protocol_sha256: "d".repeat(64),
    conditions: conditionDefinitions.map((definition) => ({
      ...definition,
      treatment: { measured_source_bytes: 1, selected_source_count: 1 }
    }))
  };
  const analysis = analyzeContextAblation({
    protocol,
    observation: {
      conditions: conditionDefinitions.map((definition) => ({
        id: definition.id, shape: definition.shape, strategy: definition.strategy,
        status: "stopped", operational_tokens: null, turn_elapsed_ms: null, objective: null
      }))
    }
  });
  assert.equal(analysis.status, "inconclusive");
  assert.equal(analysis.diagnostic_aggregate, null);
  assert.equal(analysis.comparisons.every((entry) => entry.operational_tokens.delta === null), true);
});
