import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  CONTEXT_ABLATION_ANALYSIS_SCHEMA,
  acquisitionLimits,
  analyzeContextAblation,
  buildAcquisitionObservation,
  candidateInstruction,
  conditionDefinitions,
  contextAblationApprovalTemplate,
  contextAblationProtocolDigest,
  contextAblationTestProviderContract,
  evaluateContextAblationOutput,
  evaluateRetainedDiagnosticRegression,
  evaluateRetainedFalseNegativeRegression,
  deriveSuccessorLimitBasis,
  multiOutputSchema,
  prepareContextAblationLab,
  preflightContextAblation,
  rehearseContextAblation,
  singleOutputSchema,
  successorLimitBasis,
  validateAnswerFreeOutputSchema,
  validateContextAblationApproval,
  validateContextAblationProtocol
} from "../scripts/run-context-capsule-ablation.mjs";

function syntheticCondition(definition, expected, operationalTokens, latencyMs, toolBytes) {
  return {
    id: definition.id,
    shape: definition.shape,
    strategy: definition.strategy,
    repetition: definition.repetition,
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
    context_acquisition: {
      schema_version: "temple.context-acquisition/v1",
      limits: acquisitionLimits,
      entries: [],
      entry_count: 0,
      unique_path_count: 0,
      overflow_count: 0,
      failed_command_items: 0,
      counts: { control: 1, "required-evidence": 0, routed: 2, "permitted-fallback": 0, "off-route": 0, unknown: 0 },
      reported_output_bytes_by_classification: { control: 20, "required-evidence": 0, routed: toolBytes, "permitted-fallback": 0, "off-route": 0, unknown: 0 },
      classifiable_context_reads: 2,
      policy_adherent_reads: 2,
      known_policy_adherence_percent: 100,
      routed_share_percent: 100,
      coverage_complete: true,
      adherence_pass: true,
      raw_commands_retained: false,
      raw_output_retained: false
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
    "single-stage-aware-a",
    "multi-legacy-expanded-a",
    "single-legacy-expanded-a",
    "multi-stage-aware-a",
    "single-legacy-expanded-b",
    "multi-stage-aware-b",
    "single-stage-aware-b",
    "multi-legacy-expanded-b"
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

test("retained WI-0139 result reproduces the censoring diagnosis and derives the successor ceiling", async () => {
  const retained = JSON.parse(await fs.readFile(path.resolve(".ai-org/artifacts/WI-0139/live-observation.json"), "utf8"));
  const regression = evaluateRetainedDiagnosticRegression(retained);
  assert.equal(regression.pass, true);
  assert.equal(regression.total_operational_tokens, 136851);
  assert.equal(regression.coordinator_multi_repository.operational_tokens_delta_percent, 6.38);
  assert.equal(regression.coordinator_multi_repository.latency_delta_percent, 8.01);
  const basis = deriveSuccessorLimitBasis(retained);
  assert.equal(basis.pass, true);
  assert.equal(basis.observed_single_repository_lower_bound, 40460);
  assert.equal(basis.derived_single_repository_limit, successorLimitBasis.single_repository_limit);
});

test("generation-free preparation produces matched repositories and smaller stage-aware packages", async (context) => {
  const labRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0141-test-"));
  await fs.rm(labRoot, { recursive: true, force: true });
  context.after(() => fs.rm(labRoot, { recursive: true, force: true }));
  const prepared = await prepareContextAblationLab(labRoot, {
    providerContract: contextAblationTestProviderContract(),
    sourceRevision: "a".repeat(40),
    writeArtifacts: false
  });
  const validation = validateContextAblationProtocol(prepared.protocol);
  assert.equal(validation.valid, true, validation.errors.join("\n"));
  assert.equal(prepared.protocol.work_item_id, "WI-0141");
  assert.equal(prepared.protocol.predecessor_integrity.work_item_id, "WI-0140");
  assert.equal(prepared.protocol.predecessor_integrity.artifact_root, ".ai-org/artifacts/WI-0140");
  assert.equal(prepared.protocol.predecessor_integrity.pass, true);
  assert.equal(prepared.protocol.protocol_sha256, contextAblationProtocolDigest(prepared.protocol));
  for (const shape of ["single-repository", "coordinator-multi-repository"]) {
    const stage = prepared.protocol.conditions.filter((entry) => entry.shape === shape && entry.strategy === "stage-aware");
    const legacy = prepared.protocol.conditions.filter((entry) => entry.shape === shape && entry.strategy === "legacy-expanded");
    assert.equal(stage.length, 2);
    assert.equal(legacy.length, 2);
    for (const key of ["selection_digest", "resolver_selection_digest", "selected_source_count", "measured_source_bytes"]) {
      assert.equal(stage[0].treatment[key], stage[1].treatment[key]);
      assert.equal(legacy[0].treatment[key], legacy[1].treatment[key]);
    }
    assert.ok(stage[0].treatment.measured_source_bytes < legacy[0].treatment.measured_source_bytes);
    assert.ok(stage[0].treatment.selected_source_count < legacy[0].treatment.selected_source_count);
    assert.notEqual(stage[0].treatment.selection_digest, legacy[0].treatment.selection_digest);
    assert.deepEqual(stage[0].repository_manifest, legacy[0].repository_manifest);
  }
  const legacyPackage = JSON.parse(await fs.readFile(path.join(labRoot, "conditions/single-legacy-expanded-a/CONTEXT_PACKAGE.json"), "utf8"));
  const stagePackage = JSON.parse(await fs.readFile(path.join(labRoot, "conditions/single-stage-aware-a/CONTEXT_PACKAGE.json"), "utf8"));
  assert.equal(legacyPackage.sources.some((entry) => entry.path === "coordinator/TEMPLE.md"), true);
  assert.equal(stagePackage.sources.some((entry) => entry.path === "coordinator/TEMPLE.md"), false);
  const readiness = await rehearseContextAblation(labRoot, path.join(labRoot, "live-protocol.json"), {
    completedAt: "2026-01-01T00:00:00.000Z",
    writeArtifacts: false
  });
  assert.equal(readiness.pass, true);
  assert.equal(readiness.candidate_turn_count, 0);
  assert.equal(readiness.simulated_condition_count, 8);
  assert.equal(readiness.operational_tokens, 0);
  assert.equal(readiness.model_generation_performed, false);

  const unapprovedPreflight = await preflightContextAblation(
    labRoot,
    path.join(labRoot, "live-protocol.json"),
    path.join(labRoot, "missing-approval.json"),
    { providerContract: contextAblationTestProviderContract(), writeArtifacts: false, observedAt: "2026-01-01T00:00:00.000Z" }
  );
  assert.equal(unapprovedPreflight.generation_ready, false);
  assert.deepEqual(unapprovedPreflight.blockers, ["exact-approval"]);

  const mismatchedRoute = structuredClone(prepared.protocol);
  mismatchedRoute.provider_contract.configuration_acknowledgement.acknowledged_configured_reasoning_effort = "high";
  const mismatchValidation = validateContextAblationProtocol(mismatchedRoute);
  assert.equal(mismatchValidation.valid, false);
  assert.ok(mismatchValidation.errors.includes("Provider contract mismatch"));

  const mismatchedRepetition = structuredClone(prepared.protocol);
  mismatchedRepetition.conditions.find((entry) => entry.id === "single-stage-aware-b").treatment.measured_source_bytes += 1;
  mismatchedRepetition.protocol_sha256 = contextAblationProtocolDigest(mismatchedRepetition);
  const repetitionValidation = validateContextAblationProtocol(mismatchedRepetition);
  assert.equal(repetitionValidation.valid, false);
  assert.ok(repetitionValidation.errors.includes("single-repository.stage-aware repetitions do not match"));

  const mismatchedLimits = structuredClone(prepared.protocol);
  mismatchedLimits.execution.condition_operational_token_limits["single-stage-aware-a"] -= 1;
  mismatchedLimits.protocol_sha256 = contextAblationProtocolDigest(mismatchedLimits);
  const limitValidation = validateContextAblationProtocol(mismatchedLimits);
  assert.equal(limitValidation.valid, false);
  assert.ok(limitValidation.errors.includes("condition token limits mismatch"));

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

test("bounded acquisition evidence classifies safe reads without retaining commands or output", async (context) => {
  const labRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0141-acquisition-"));
  await fs.rm(labRoot, { recursive: true, force: true });
  context.after(() => fs.rm(labRoot, { recursive: true, force: true }));
  await prepareContextAblationLab(labRoot, {
    providerContract: contextAblationTestProviderContract(),
    sourceRevision: "a".repeat(40),
    writeArtifacts: false
  });
  const conditionRoot = path.join(labRoot, "conditions/single-stage-aware-a");
  const package_ = JSON.parse(await fs.readFile(path.join(conditionRoot, "CONTEXT_PACKAGE.json"), "utf8"));
  const routedPath = package_.sources[0].path;
  const offRoutePath = "coordinator/docs/discovery/subscriptions.md";
  const symlinkPath = path.join(conditionRoot, "coordinator/docs/product/escaped-link");
  await fs.symlink("/tmp", symlinkPath);
  const successful = (path_, output, actions = null) => ({
    item: {
      type: "commandExecution",
      cwd: conditionRoot,
      exitCode: 0,
      aggregatedOutput: output,
      commandActions: actions ?? [{ type: "read", command: `sed -n '1,20p' ${path_}`, path: path_ }]
    }
  });
  const items = [
    successful("CONTEXT_PACKAGE.json", "package-body"),
    successful("ignored", "provider-control-body", [{
      type: "read",
      command: "/bin/zsh -lc 'cat CONTEXT_PACKAGE.json'",
      name: "CONTEXT_PACKAGE.json"
    }]),
    successful("ignored", "absolute-control-body", [{
      type: "read",
      command: `cat ${path.join(conditionRoot, "CONTEXT_PACKAGE.json")}`,
      path: path.join(conditionRoot, "CONTEXT_PACKAGE.json")
    }]),
    successful("ignored", "ambiguous-control-body", [{
      type: "read",
      command: "cat CONTEXT_PACKAGE.json coordinator/docs/product/idempotency.md"
    }]),
    {
      item: {
        type: "commandExecution",
        cwd: path.join(conditionRoot, "coordinator"),
        exitCode: 0,
        aggregatedOutput: "wrong-cwd-control-body",
        commandActions: [{ type: "read", command: "cat CONTEXT_PACKAGE.json" }]
      }
    },
    successful(routedPath, "routed-body"),
    successful(offRoutePath, "off-route-body"),
    successful("coordinator/docs/product/escaped-link", "outside-body"),
    successful("../outside", "traversal-body"),
    successful("/tmp", "absolute-body"),
    successful(`coordinator/${"x".repeat(acquisitionLimits.maximum_path_bytes + 1)}`, "oversized-body"),
    successful(routedPath, "multiple-body", [
      { type: "read", command: `sed -n '1,20p' ${routedPath}`, path: routedPath },
      { type: "read", command: `sed -n '1,20p' ${offRoutePath}`, path: offRoutePath }
    ]),
    { item: { type: "commandExecution", cwd: conditionRoot, exitCode: 1, aggregatedOutput: "failed-secret", commandActions: [{ type: "read", command: `sed -n '1,20p' ${routedPath}`, path: routedPath }] } },
    ...Array.from({ length: acquisitionLimits.maximum_entries }, () => successful(routedPath, "bounded"))
  ];
  const observation = await buildAcquisitionObservation({ items, conditionRoot, treatmentPackage: package_ });
  assert.equal(observation.entry_count, acquisitionLimits.maximum_entries);
  assert.ok(observation.overflow_count > 0);
  assert.equal(observation.failed_command_items, 1);
  assert.ok(observation.counts.control >= 3);
  assert.ok(observation.counts.routed >= 1);
  assert.ok(observation.counts["off-route"] >= 1);
  assert.ok(observation.counts.unknown >= 6);
  assert.equal(observation.coverage_complete, false);
  assert.equal(observation.adherence_pass, false);
  assert.equal(observation.entries.filter((entry) => entry.reported_output_bytes === null).length >= 2, true);
  const retainedText = JSON.stringify(observation);
  assert.doesNotMatch(retainedText, /sed -n|cat CONTEXT|package-body|provider-control-body|absolute-control-body|ambiguous-control-body|wrong-cwd-control-body|routed-body|off-route-body|outside-body|traversal-body|absolute-body|oversized-body|failed-secret|multiple-body/);
  assert.equal(observation.raw_commands_retained, false);
  assert.equal(observation.raw_output_retained, false);
});

test("analysis keeps shapes separate and makes correctness primary", () => {
  const protocol = {
    protocol_sha256: "c".repeat(64),
    cache_control: {
      method: "provider-cache-disabled",
      predeclared: true,
      provider_acknowledged: true
    },
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
    "single-repository:stage-aware": [800, 800, 800],
    "single-repository:legacy-expanded": [1000, 1000, 1000],
    "coordinator-multi-repository:stage-aware": [1600, 1600, 1600],
    "coordinator-multi-repository:legacy-expanded": [2000, 2000, 2000]
  };
  const conditions = conditionDefinitions.map((definition) => {
    const [tokens, latency, bytes] = observations[`${definition.shape}:${definition.strategy}`];
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
  assert.equal(analysis.comparisons.every((entry) => entry.context_acquisition.conclusion === "no-off-route-observed-with-complete-coverage"), true);
  assert.equal(analysis.comparisons.every((entry) => entry.repetition_pairs.length === 2), true);
  assert.equal(analysis.comparisons[0].provider_usage.cache_share_percent.legacy_mean, 0);
  assert.equal(analysis.comparisons[0].provider_usage.non_cached_input_tokens.legacy_mean, 900);
  assert.equal(analysis.comparisons.every((entry) => entry.cache_control.status === "sufficient"), true);
  assert.equal(analysis.comparisons.every((entry) => entry.causal_efficiency_claim.status === "eligible"), true);
  assert.equal(analysis.diagnostic_aggregate.operational_tokens_delta.percent, -20);
  assert.equal(analysis.diagnostic_aggregate.non_cached_input_tokens_delta.percent, -21.43);
  const regressed = structuredClone(conditions);
  regressed.find((entry) => entry.id === "single-stage-aware-a").objective.pass = false;
  const regression = analyzeContextAblation({ protocol, observation: { conditions: regressed } });
  assert.equal(regression.comparisons.find((entry) => entry.shape === "single-repository").outcome, "quality-regression");
  const tradeoffConditions = structuredClone(conditions);
  for (const entry of tradeoffConditions.filter((candidate) => candidate.shape === "coordinator-multi-repository")) {
    entry.operational_tokens = entry.strategy === "stage-aware" ? 3000 : 2000;
    entry.turn_elapsed_ms = entry.strategy === "stage-aware" ? 1000 : 2000;
  }
  const tradeoff = analyzeContextAblation({ protocol, observation: { conditions: tradeoffConditions } });
  assert.equal(tradeoff.comparisons.find((entry) => entry.shape === "coordinator-multi-repository").outcome, "tradeoff");
});

test("analysis blocks causal efficiency when cache control was not predeclared", () => {
  const protocol = {
    protocol_sha256: "e".repeat(64),
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
  const conditions = conditionDefinitions.map((definition) => syntheticCondition(
    definition,
    expectedByShape[definition.shape],
    definition.strategy === "legacy-expanded" ? 1000 : 800,
    1000,
    100
  ));
  conditions.find((entry) => entry.id === "single-stage-aware-b").usage = {
    input_tokens: 1900,
    cached_input_tokens: 1200,
    output_tokens: 100,
    reasoning_output_tokens: 0,
    total_tokens: 2000
  };
  const analysis = analyzeContextAblation({ protocol, observation: { conditions } });
  assert.equal(analysis.comparisons.every((entry) => entry.cache_control.status === "insufficient"), true);
  assert.equal(analysis.comparisons.every((entry) => entry.causal_efficiency_claim.status === "blocked"), true);
  assert.equal(analysis.interpretation_boundary.causal_efficiency_claim, false);
  assert.equal(analysis.comparisons[0].repetition_pairs[1].non_cached_input_tokens.stage_aware, 700);
  assert.deepEqual(analysis.comparisons[0].cache_control.reason_codes, ["protocol-cache-control-not-declared"]);
});

test("the reusable model and process evaluation template is non-executable until frozen", async () => {
  const template = JSON.parse(await fs.readFile(path.resolve(".ai-org/templates/model-process-evaluation-protocol.json"), "utf8"));
  assert.equal(template.schema_version, "temple.model-process-evaluation-protocol/v1");
  assert.equal(template.status, "draft-template");
  assert.equal(template.approval.approved, false);
  assert.equal(template.execution.model_generation_authorized, false);
  assert.equal(template.cache_control.method, "select-before-freeze");
  assert.equal(template.analysis.allow_causal_efficiency_claim, false);
  assert.equal(template.authority.external_spend, false);
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
        id: definition.id, shape: definition.shape, strategy: definition.strategy, repetition: definition.repetition,
        status: "stopped", operational_tokens: null, turn_elapsed_ms: null, objective: null
      }))
    }
  });
  assert.equal(analysis.status, "inconclusive");
  assert.equal(analysis.diagnostic_aggregate, null);
  assert.equal(analysis.comparisons.every((entry) => entry.operational_tokens.delta === null), true);
});

test("the retained WI-0141 live run seals mutable protocol preparation", async () => {
  await assert.rejects(
    prepareContextAblationLab(undefined, {
      providerContract: contextAblationTestProviderContract(),
      sourceRevision: "a".repeat(40)
    }),
    /retained WI-0141 run is sealed/
  );
});
