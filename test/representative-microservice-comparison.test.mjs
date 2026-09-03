import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import {
  ablationIntegrationInstruction,
  armProcessInstructions,
  analyzeContextAblation,
  comparisonAllowedCommandPrefixes,
  diagnosticConditionFailure,
  diagnosticConditionObservation,
  diagnosticStoppedRun,
  integrationOutputSchema,
  protocolDigest,
  representativeStoppedRun,
  statusPaths,
  successfulContextActionLabels,
  templeRoutedContextInstruction,
  validateAblationApproval,
  validateAblationProtocol,
  validateProviderOutputSchema,
  validateRepresentativeApproval,
  validateRepresentativeProtocol,
  validateEvaluatorCompletion
} from "../scripts/run-representative-microservice-comparison.mjs";
import { analyzeRepresentativeComparison } from "../scripts/analyze-representative-microservice-comparison.mjs";
import { commandTextAllowed } from "../src/app-server-protocol-replay.mjs";

const protocolPath = new URL("../.ai-org/artifacts/WI-0136/live-protocol.json", import.meta.url);
const approvalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/account-approval.template.json", import.meta.url);
const ablationProtocolPath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-protocol.json", import.meta.url);
const ablationApprovalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-approval.template.json", import.meta.url);
const ablationApprovalPath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-approval.json", import.meta.url);

async function readJson(path) {
  return JSON.parse(await fs.readFile(path, "utf8"));
}

test("the representative microservice protocol is frozen but generation-disabled", async () => {
  const protocol = await readJson(protocolPath);
  const result = validateRepresentativeProtocol(protocol);
  assert.deepEqual(result, { valid: true, errors: [] });
  assert.equal(protocol.protocol_sha256, protocolDigest(protocol));
  assert.equal(protocol.execution.generation_ready, false);
  assert.equal(protocol.execution.retry_count, 0);
  assert.equal(protocol.execution.fallback_count, 0);
  assert.equal(protocol.execution.candidate_turns, 10);
  assert.equal(protocol.execution.evaluator_turns, 1);
  assert.equal(protocol.protocol_revision, 4);
  assert.equal(protocol.execution.combined_operational_token_limit, 625000);
  assert.deepEqual(protocol.context_policy.temple_md_fallback_when_missing, ["authority", "current-state", "safe-next-action"]);
  assert.equal(protocol.predecessor.disposition, "stopped-harness-path-parsing-failure");
  assert.equal(protocol.stopped_evidence_policy, "completed-and-active-stage-observations");
});

test("protocol validation rejects product drift, reroute, retry, and digest rewriting", async () => {
  const protocol = await readJson(protocolPath);
  protocol.arms[1].product_revisions.orders = "0".repeat(40);
  protocol.model_route.build.model = "gpt-5.6-luna";
  protocol.execution.retry_count = 1;
  const result = validateRepresentativeProtocol(protocol);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("protocol digest mismatch"));
  assert.ok(result.errors.includes("product revisions are not matched"));
  assert.ok(result.errors.includes("retry, fallback, or network boundary mismatch"));
  assert.ok(result.errors.includes("build model route mismatch"));
});

test("only an exact affirmative account record can unlock the frozen envelope", async () => {
  const protocol = await readJson(protocolPath);
  const template = await readJson(approvalTemplatePath);
  assert.equal(validateRepresentativeApproval(template, protocol).accepted, false);
  const approved = {
    ...template,
    approved: true,
    authorization_source: "exact-test-authorization",
    approved_at: "2026-09-03T00:00:00.000Z"
  };
  assert.deepEqual(validateRepresentativeApproval(approved, protocol), { accepted: true, errors: [] });
  approved.approved_combined_operational_tokens += 1;
  const drifted = validateRepresentativeApproval(approved, protocol);
  assert.equal(drifted.accepted, false);
  assert.ok(drifted.errors.includes("approved_combined_operational_tokens does not match the frozen protocol"));
});

test("the evaluator must freeze both packages and every binary dimension exactly once", () => {
  const packages = [{ package_id: "package-a" }, { package_id: "package-b" }];
  const rubric = { dimensions: [{ id: "contract" }, { id: "recovery" }] };
  const valid = {
    packages: packages.map((entry) => ({
      package_id: entry.package_id,
      dimensions: [
        { id: "contract", score: 1, rationale: "pass" },
        { id: "recovery", score: 0, rationale: "missing" }
      ],
      critical_failure: null,
      summary: "bounded"
    })),
    summary: "complete"
  };
  assert.equal(validateEvaluatorCompletion(valid, packages, rubric), valid);
  valid.packages[1].dimensions[1].id = "contract";
  assert.throws(() => validateEvaluatorCompletion(valid, packages, rubric), /dimension count mismatch/);
});

test("analysis treats correctness as primary and reports descriptive deltas", () => {
  const protocol = { work_item_id: "WI-0136", protocol_sha256: "frozen" };
  const arm = (armId, packageId, tokens, pass) => ({
    arm_id: armId,
    design: { operational_tokens: 10, elapsed_ms: 20, usage: { total_tokens: 100 } },
    builds: [{
      operational_tokens: tokens - 20,
      elapsed_ms: 30,
      usage: { total_tokens: 200 },
      repositories: { gateway: { changed_lines: 2, public_test_exit_code: 0 } }
    }],
    integration: {
      operational_tokens: 10,
      elapsed_ms: 40,
      usage: { total_tokens: 100 },
      objective_tests: { pass },
      recovery: { exact_revision_count: 4, exact_revision_total: 4, completed_slice_count: 3, completed_slice_total: 3 }
    },
    sealed: { package_id: packageId, boundary_violations: [], artifact_bytes: armId === "temple" ? 2000 : 1000 }
  });
  const run = {
    status: "candidate-arms-completed",
    protocol_sha256: "frozen",
    arms: [arm("minimal-responsible", "package-a", 100, true), arm("temple", "package-b", 80, true)]
  };
  const dimensions = [{ id: "contract", score: 1 }, { id: "recovery", score: 1 }];
  const evaluator = {
    status: "completed",
    protocol_sha256: "frozen",
    frozen_scores: { packages: [
      { package_id: "package-a", dimensions, critical_failure: null },
      { package_id: "package-b", dimensions, critical_failure: null }
    ] },
    evaluator: { operational_tokens: 30, usage: { total_tokens: 40 }, requested_model: "gpt-5.6-sol", requested_reasoning_effort: "xhigh" }
  };
  const result = analyzeRepresentativeComparison({ protocol, run, evaluator, generatedAt: "2026-09-03T00:00:00.000Z" });
  assert.equal(result.comparison.objective_correctness_delta, 0);
  assert.equal(result.comparison.operational_token_delta_percent, -20);
  assert.equal(result.comparison.artifact_byte_delta_percent, 100);
  assert.equal(result.interpretation.statistical_generalization, false);
});

test("routed Temple context resolves first and treats TEMPLE.md as a fallback", () => {
  const instruction = templeRoutedContextInstruction("the Coordinator repository");
  assert.ok(instruction.indexOf("context resolve") < instruction.indexOf("TEMPLE.md"));
  assert.match(instruction, /if the Context Capsule cannot identify authority/);
  assert.match(instruction, /navigation, not authority/);
  const buildEntry = armProcessInstructions("temple", ["gateway"]);
  assert.ok(buildEntry.indexOf("coordinator/templew.mjs context resolve") < buildEntry.indexOf("gateway/templew.mjs context resolve"));
  assert.ok(buildEntry.indexOf("context resolve") < buildEntry.indexOf("TEMPLE.md"));
  const full = ablationIntegrationInstruction("terra-full-load");
  const routed = ablationIntegrationInstruction("terra-routed");
  assert.ok(full.indexOf("TEMPLE.md") < full.indexOf("context resolve"));
  assert.ok(routed.indexOf("context resolve") < routed.indexOf("TEMPLE.md"));
  assert.match(full, /coordinator\/TEMPLE\.md/);
  assert.match(full, /node coordinator\/templew\.mjs context resolve coordinator/);
  assert.match(routed, /node coordinator\/templew\.mjs context resolve coordinator/);
  assert.ok(full.indexOf("TEMPLE.md") < full.indexOf("inspect all four service repositories"));
  assert.ok(routed.indexOf("context resolve") < routed.indexOf("inspect all four service repositories"));
  assert.match(full, /known bounded Work Item WI-0001, not new or unknown-scope work/);
  assert.match(routed, /known bounded Work Item WI-0001, not new or unknown-scope work/);
  assert.notEqual(full, routed);
});

test("context treatment observation counts only successful command completions", () => {
  const actions = [
    { type: "read", command: "sed -n '1,200p' coordinator/TEMPLE.md" },
    { type: "unknown", command: "node coordinator/templew.mjs context resolve coordinator --work-item WI-0001 --position developer --no-write --json" }
  ];
  assert.deepEqual(successfulContextActionLabels({ type: "commandExecution", exitCode: 0, commandActions: actions }), [
    "temple-md",
    "context-resolve"
  ]);
  assert.deepEqual(successfulContextActionLabels({ type: "commandExecution", exitCode: 1, commandActions: actions }), []);
  assert.deepEqual(successfulContextActionLabels({ type: "commandExecution", exitCode: 0 }, actions), [
    "temple-md",
    "context-resolve"
  ]);
});

test("comparison command policy permits only fixture-scoped git -C reads", () => {
  for (const repository of ["gateway", "catalog", "orders", "notifications", "coordinator"]) {
    assert.equal(commandTextAllowed(`git -C ${repository} rev-parse HEAD`, comparisonAllowedCommandPrefixes), true);
    assert.equal(commandTextAllowed(`git -C ${repository} status --short`, comparisonAllowedCommandPrefixes), true);
  }
  assert.equal(commandTextAllowed("git -C ../outside rev-parse HEAD", comparisonAllowedCommandPrefixes), false);
  assert.equal(commandTextAllowed("git -C gateway config core.sshCommand exploit", comparisonAllowedCommandPrefixes), false);
});

test("Git porcelain paths survive leading-whitespace trimming", () => {
  assert.deepEqual(statusPaths("M src/order-event.mjs\n M src/consumer.mjs\n?? src/new.mjs"), [
    "src/consumer.mjs",
    "src/new.mjs",
    "src/order-event.mjs"
  ]);
  assert.throws(() => statusPaths("not-porcelain"), /malformed Git porcelain record/);
});

test("a stopped main run retains completed and active stage evidence", () => {
  const stopped = representativeStoppedRun({
    protocol: { work_item_id: "WI-0136", protocol_sha256: "frozen" },
    startedAt: "start",
    stoppedAt: "stop",
    completed: [{ arm_id: "minimal-responsible" }],
    activeArm: { arm_id: "temple", design: { id: "temple-design" }, builds: [{ id: "temple-gateway" }, { id: "temple-orders-catalog" }], portfolio_revision: null, integration: null },
    candidateOperationalTokens: 123,
    reason: "bounded stop"
  });
  assert.equal(stopped.schema_version, "temple.representative-microservice-stopped-run/v2");
  assert.equal(stopped.completed_arm_count, 1);
  assert.equal(stopped.active_arm.design.id, "temple-design");
  assert.deepEqual(stopped.active_arm.builds.map((entry) => entry.id), ["temple-gateway", "temple-orders-catalog"]);
  assert.equal(stopped.candidate_operational_tokens, 123);
});

test("integration completion schema and recovery evaluator require the same exact slice IDs", () => {
  assert.deepEqual(integrationOutputSchema.properties.completed_slices, {
    type: "array",
    items: { type: "string", enum: ["orders-catalog", "notifications", "gateway"] },
    minItems: 3,
    maxItems: 3
  });
  const expectedRevisions = {
    gateway: "a",
    catalog: "b",
    orders: "c",
    notifications: "d"
  };
  const completion = (completedSlices) => ({
    recovered_revisions: Object.entries(expectedRevisions).map(([repository, revision]) => ({ repository, revision })),
    governing_contract: "Coordinator TASK.md governs OrderPlaced/v2",
    completed_slices: completedSlices,
    unresolved: [],
    safe_next_action: "Run bounded local tests",
    summary: "Recovered"
  });
  const observation = (completedSlices) => diagnosticConditionObservation({
    condition: "terra-routed",
    contextStrategy: "routed",
    turn: {
      status: "completed",
      tool_activity: { context_sequence: ["context-resolve"] },
      completion: completion(completedSlices)
    },
    expectedRevisions
  });
  assert.equal(observation(["orders-catalog", "notifications", "gateway"]).recovery.pass, true);
  assert.equal(observation(["orders-catalog — handoff", "notifications", "gateway"]).recovery.pass, false);
});

test("the generation-free schema check accepts the live schema and rejects unsupported keywords", () => {
  const supported = validateProviderOutputSchema(integrationOutputSchema);
  assert.equal(supported.supported, true);
  assert.deepEqual(supported.errors, []);
  assert.match(supported.schema_sha256, /^[a-f0-9]{64}$/);
  const unsupported = structuredClone(integrationOutputSchema);
  unsupported.properties.completed_slices.uniqueItems = true;
  const rejected = validateProviderOutputSchema(unsupported);
  assert.equal(rejected.supported, false);
  assert.ok(rejected.errors.includes("#/properties/completed_slices: unsupported keyword uniqueItems"));
});

test("the frozen context ablation requires matched repositories and exact approval", async () => {
  const protocol = await readJson(ablationProtocolPath);
  const template = await readJson(ablationApprovalTemplatePath);
  const currentApproval = await readJson(ablationApprovalPath);
  assert.deepEqual(validateAblationProtocol(protocol), { valid: true, errors: [] });
  assert.equal(protocol.protocol_sha256, protocolDigest(protocol));
  assert.equal(protocol.schema_version, "temple.context-model-diagnostic/v10");
  assert.equal(protocol.execution.candidate_turns, 2);
  assert.equal(protocol.execution.evaluator_turns, 0);
  assert.equal(protocol.execution.combined_operational_token_limit, 200000);
  assert.equal(protocol.execution.candidate_limit_disposition, "record-censored-and-continue-independent-conditions");
  assert.equal(currentApproval.schema_version, "temple.context-model-diagnostic-account-approval/v10");
  if (currentApproval.approved) {
    assert.deepEqual(validateAblationApproval(currentApproval, protocol), { accepted: true, errors: [] });
  } else {
    assert.deepEqual(currentApproval, template);
  }
  assert.deepEqual(protocol.conditions.map((entry) => [entry.id, entry.model_route.model, entry.model_route.reasoning_effort]), [
    ["terra-routed", "gpt-5.6-terra", "medium"],
    ["terra-full-load", "gpt-5.6-terra", "medium"]
  ]);
  assert.deepEqual(Object.fromEntries(protocol.conditions.map((entry) => [entry.id, entry.operational_token_limit])), {
    "terra-routed": 80000,
    "terra-full-load": 120000
  });
  assert.equal(validateAblationApproval(template, protocol).accepted, false);
  const approved = {
    ...template,
    approved: true,
    authorization_source: "exact-test-authorization",
    approved_at: "2026-09-03T00:00:00.000Z"
  };
  assert.deepEqual(validateAblationApproval(approved, protocol), { accepted: true, errors: [] });
  const driftedLimits = structuredClone(approved);
  driftedLimits.approved_condition_operational_token_limits["terra-full-load"] = 80000;
  assert.ok(validateAblationApproval(driftedLimits, protocol).errors.includes("approved ablation condition limits mismatch"));
  approved.approved_candidate_operational_tokens += 1;
  assert.equal(validateAblationApproval(approved, protocol).accepted, false);
});

test("context ablation analysis keeps correctness primary and reports routed deltas", () => {
  const recovery = { pass: true, exact_revision_count: 4 };
  const condition = (id, model, effort, operationalTokens, totalTokens, elapsedMs, templeReads) => ({
    condition: id,
    requested_model: model,
    requested_reasoning_effort: effort,
    recovery,
    operational_tokens: operationalTokens,
    elapsed_ms: elapsedMs,
    session_setup_ms: 100,
    turn_elapsed_ms: elapsedMs - 100,
    time_to_first_activity_ms: 200,
    time_to_first_command_ms: 300,
    effective_output_tokens_per_second: 10,
    usage: { input_tokens: totalTokens - 100, cached_input_tokens: 50, output_tokens: 100, reasoning_output_tokens: 25, total_tokens: totalTokens },
    prompt_metrics: { explicit_bytes: 2000 },
    tool_activity: { command_actions: 5, temple_md_reads: templeReads, context_resolve_calls: 1, reported_output_bytes: templeReads ? 13000 : 5600 }
  });
  const protocol = { work_item_id: "WI-0136", protocol_sha256: "ablation" };
  const run = {
    status: "completed",
    protocol_sha256: "ablation",
    conditions: [
      condition("terra-full-load", "gpt-5.6-terra", "medium", 1000, 1200, 2000, 1),
      condition("terra-routed", "gpt-5.6-terra", "medium", 600, 800, 1500, 0),
      condition("sol-routed-medium", "gpt-5.6-sol", "medium", 500, 700, 1300, 0),
      condition("sol-routed-xhigh", "gpt-5.6-sol", "xhigh", 700, 900, 1700, 0)
    ]
  };
  const result = analyzeContextAblation({ protocol, run, generatedAt: "2026-09-03T00:00:00.000Z" });
  assert.equal(result.comparison.context_routing.operational_token_delta, -400);
  assert.equal(result.comparison.context_routing.operational_token_delta_percent, -40);
  assert.equal(result.comparison.model_same_effort.operational_token_delta, -100);
  assert.equal(result.comparison.sol_reasoning_effort.operational_token_delta, 200);
  assert.equal(result.interpretation.context_outcome, "routed-context-supported");
  assert.equal(result.interpretation.statistical_generalization, false);
  assert.equal(result.interpretation.main_comparison_result, false);
});

test("a stopped diagnostic retains normalized completed conditions without authorizing retry", () => {
  const completed = [{ condition: "terra-full-load", operational_tokens: 4321, raw_prompt_retained: false }];
  const result = diagnosticStoppedRun({
    protocol: { work_item_id: "WI-0136", protocol_sha256: "v5" },
    startedAt: "2026-09-03T00:00:00.000Z",
    stoppedAt: "2026-09-03T00:01:00.000Z",
    completed,
    operationalTokens: 5000,
    reason: "bounded-stop"
  });
  assert.equal(result.observed_condition_count, 1);
  assert.equal(result.completed_condition_count, 1);
  assert.equal(result.censored_condition_count, 0);
  assert.equal(result.stopped_condition_count, 0);
  assert.deepEqual(result.completed_conditions, completed);
  assert.equal(result.retry_count, 0);
  assert.equal(result.fallback_count, 0);
  assert.equal(result.model_generation_performed, true);
});

test("a Provider schema rejection before usage is recorded as zero generation", () => {
  const result = diagnosticStoppedRun({
    protocol: { work_item_id: "WI-0136", protocol_sha256: "v7" },
    startedAt: "2026-09-03T00:00:00.000Z",
    stoppedAt: "2026-09-03T00:00:04.000Z",
    completed: [],
    operationalTokens: 0,
    reason: "provider-invalid-output-schema"
  });
  assert.equal(result.observed_condition_count, 0);
  assert.equal(result.candidate_operational_tokens, 0);
  assert.equal(result.model_generation_performed, false);
});

test("a candidate Token ceiling becomes a retained censored condition rather than recovered output", () => {
  const turn = {
    status: "censored",
    stop_scope: "condition",
    stop_reason: "integration-operational-token-limit",
    operational_tokens: 80621,
    tool_activity: {
      context_sequence: ["temple-md"],
      command_actions: 1,
      temple_md_reads: 1,
      context_resolve_calls: 0,
      reported_output_bytes: 5000
    },
    completion: null
  };
  const result = diagnosticConditionObservation({
    condition: "terra-full-load",
    contextStrategy: "full-load",
    turn,
    expectedRevisions: { gateway: "a" }
  });
  assert.equal(result.status, "censored");
  assert.equal(result.context_strategy_observed, true);
  assert.equal(result.recovery, null);
  assert.equal(result.operational_tokens, 80621);
  const mismatched = diagnosticConditionObservation({
    condition: "terra-routed",
    contextStrategy: "routed",
    turn,
    expectedRevisions: { gateway: "a" }
  });
  assert.equal(mismatched.context_strategy_observed, false);
});

test("a whole-run stop preserves prior censored and active stopped condition telemetry", () => {
  const censored = { condition: "terra-full-load", status: "censored", operational_tokens: 80621 };
  const stopped = { condition: "terra-routed", status: "stopped", stop_scope: "run", operational_tokens: 240000 };
  const result = diagnosticStoppedRun({
    protocol: { work_item_id: "WI-0136", protocol_sha256: "v5" },
    startedAt: "2026-09-03T00:00:00.000Z",
    stoppedAt: "2026-09-03T00:02:00.000Z",
    completed: [censored, stopped],
    operationalTokens: 320621,
    reason: "candidate-aggregate-operational-token-limit"
  });
  assert.equal(result.observed_condition_count, 2);
  assert.equal(result.completed_condition_count, 0);
  assert.equal(result.censored_condition_count, 1);
  assert.equal(result.stopped_condition_count, 1);
  assert.deepEqual(result.censored_conditions, [censored]);
  assert.deepEqual(result.stopped_conditions, [stopped]);
  assert.equal(result.retry_count, 0);
  assert.equal(result.fallback_count, 0);
});

test("a causal stopped condition wins over a later missing context observation", () => {
  assert.equal(diagnosticConditionFailure("terra-full-load", {
    status: "stopped",
    stop_reason: "command-policy-violation",
    context_strategy_observed: false
  }), "terra-full-load:command-policy-violation");
  assert.equal(diagnosticConditionFailure("terra-full-load", {
    status: "completed",
    stop_reason: null,
    context_strategy_observed: false
  }), "terra-full-load:context-strategy-not-observed");
});

test("analysis preserves a censored full-load result without inventing an exact savings delta", () => {
  const condition = (id, status, tokens, pass) => ({
    condition: id,
    status,
    stop_reason: status === "censored" ? "integration-operational-token-limit" : null,
    requested_model: id.startsWith("terra") ? "gpt-5.6-terra" : "gpt-5.6-sol",
    requested_reasoning_effort: id === "sol-routed-xhigh" ? "xhigh" : "medium",
    recovery: status === "censored" ? null : { pass, exact_revision_count: pass ? 4 : 0 },
    operational_tokens: tokens,
    elapsed_ms: 1000,
    session_setup_ms: 100,
    turn_elapsed_ms: 900,
    time_to_first_activity_ms: 100,
    time_to_first_command_ms: 200,
    effective_output_tokens_per_second: 2,
    usage: { input_tokens: tokens - 100, cached_input_tokens: 50, output_tokens: 100, reasoning_output_tokens: 25, total_tokens: tokens + 50 },
    prompt_metrics: { explicit_bytes: 1000 },
    tool_activity: { command_actions: 2, temple_md_reads: id === "terra-full-load" ? 1 : 0, context_resolve_calls: 1, reported_output_bytes: 2000 }
  });
  const protocol = { work_item_id: "WI-0136", protocol_sha256: "v5" };
  const run = {
    status: "completed-with-censored-conditions",
    protocol_sha256: "v5",
    conditions: [
      condition("terra-full-load", "censored", 80621, false),
      condition("terra-routed", "completed", 20000, true),
      condition("sol-routed-medium", "completed", 18000, true),
      condition("sol-routed-xhigh", "completed", 24000, true)
    ]
  };
  const result = analyzeContextAblation({ protocol, run, generatedAt: "2026-09-03T00:00:00.000Z" });
  assert.equal(result.interpretation.context_outcome, "routed-context-supported-within-ceiling");
  assert.equal(result.comparison.context_routing.exact_comparison_available, false);
  assert.equal(result.comparison.context_routing.operational_token_delta, null);
  assert.equal(result.comparison.context_routing.observed_operational_token_lower_bound_delta, -60621);
  assert.equal(result.comparison.model_same_effort.exact_comparison_available, true);
  assert.equal(result.comparison.model_same_effort.operational_token_delta, -2000);
});

test("analysis accepts a fully observed stopped run without inventing exact comparisons", () => {
  const condition = (id, status, tokens, pass) => ({
    condition: id,
    status,
    stop_reason: status === "stopped" ? "command-policy-violation" : status === "censored" ? "integration-operational-token-limit" : null,
    requested_model: id.startsWith("terra") ? "gpt-5.6-terra" : "gpt-5.6-sol",
    requested_reasoning_effort: id === "sol-routed-xhigh" ? "xhigh" : "medium",
    observed_thread_reasoning_effort: "high",
    effective_turn_reasoning_effort: null,
    recovery: status === "completed" ? { pass, exact_revision_count: pass ? 4 : 0 } : null,
    operational_tokens: tokens,
    elapsed_ms: 1000,
    session_setup_ms: 100,
    turn_elapsed_ms: 900,
    time_to_first_activity_ms: 100,
    time_to_first_command_ms: 200,
    effective_output_tokens_per_second: 2,
    usage: { input_tokens: tokens - 100, cached_input_tokens: 50, output_tokens: 100, reasoning_output_tokens: 25, total_tokens: tokens + 50 },
    prompt_metrics: { explicit_bytes: 1000 },
    tool_activity: { command_actions: 2, temple_md_reads: id === "terra-full-load" ? 0 : 1, context_resolve_calls: 1, reported_output_bytes: 2000 }
  });
  const protocol = { work_item_id: "WI-0136", protocol_sha256: "v5" };
  const run = {
    schema_version: "temple.context-model-diagnostic-stopped-run/v5",
    protocol_sha256: "v5",
    observed_conditions: [
      condition("terra-routed", "completed", 53823, true),
      condition("sol-routed-medium", "censored", 80156, false),
      condition("sol-routed-xhigh", "censored", 80156, false),
      condition("terra-full-load", "stopped", 19618, false)
    ]
  };
  const result = analyzeContextAblation({ protocol, run, generatedAt: "2026-09-03T00:00:00.000Z" });
  assert.equal(result.interpretation.context_outcome, "routed-context-supported-with-full-load-failure");
  assert.equal(result.comparison.context_routing.exact_comparison_available, false);
  assert.equal(result.comparison.context_routing.baseline_stopped, true);
  assert.equal(result.comparison.model_same_effort.candidate_censored, true);
  assert.equal(result.comparison.model_same_effort.operational_token_delta, null);
  assert.equal(result.comparison.model_same_effort.observed_operational_token_lower_bound_delta, 26333);
  assert.equal(result.comparison.sol_reasoning_effort.effective_effort_comparison_available, false);
});
