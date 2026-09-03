import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import {
  ablationIntegrationInstruction,
  analyzeContextAblation,
  protocolDigest,
  templeRoutedContextInstruction,
  validateAblationApproval,
  validateAblationProtocol,
  validateRepresentativeApproval,
  validateRepresentativeProtocol,
  validateEvaluatorCompletion
} from "../scripts/run-representative-microservice-comparison.mjs";
import { analyzeRepresentativeComparison } from "../scripts/analyze-representative-microservice-comparison.mjs";

const protocolPath = new URL("../.ai-org/artifacts/WI-0136/live-protocol.json", import.meta.url);
const approvalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/account-approval.template.json", import.meta.url);
const ablationProtocolPath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-protocol.json", import.meta.url);
const ablationApprovalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-approval.template.json", import.meta.url);

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
  assert.equal(protocol.execution.combined_operational_token_limit, 620000);
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
  assert.match(instruction, /only if the Context Capsule cannot identify authority/);
  const full = ablationIntegrationInstruction("full-load");
  const routed = ablationIntegrationInstruction("routed");
  assert.ok(full.indexOf("TEMPLE.md") < full.indexOf("context resolve"));
  assert.ok(routed.indexOf("context resolve") < routed.indexOf("TEMPLE.md"));
  assert.notEqual(full, routed);
});

test("the frozen context ablation requires matched repositories and exact approval", async () => {
  const protocol = await readJson(ablationProtocolPath);
  const template = await readJson(ablationApprovalTemplatePath);
  assert.deepEqual(validateAblationProtocol(protocol), { valid: true, errors: [] });
  assert.equal(protocol.protocol_sha256, protocolDigest(protocol));
  assert.equal(protocol.execution.candidate_turns, 2);
  assert.equal(protocol.execution.evaluator_turns, 0);
  assert.equal(protocol.execution.combined_operational_token_limit, 160000);
  assert.equal(validateAblationApproval(template, protocol).accepted, false);
  const approved = {
    ...template,
    approved: true,
    authorization_source: "exact-test-authorization",
    approved_at: "2026-09-03T00:00:00.000Z"
  };
  assert.deepEqual(validateAblationApproval(approved, protocol), { accepted: true, errors: [] });
  approved.approved_candidate_operational_tokens += 1;
  assert.equal(validateAblationApproval(approved, protocol).accepted, false);
});

test("context ablation analysis keeps correctness primary and reports routed deltas", () => {
  const recovery = { pass: true, exact_revision_count: 4 };
  const condition = (id, operationalTokens, totalTokens, elapsedMs, templeReads) => ({
    condition: id,
    recovery,
    operational_tokens: operationalTokens,
    elapsed_ms: elapsedMs,
    usage: { input_tokens: totalTokens - 100, cached_input_tokens: 50, output_tokens: 100, total_tokens: totalTokens },
    prompt_metrics: { explicit_bytes: 2000 },
    tool_activity: { command_actions: 5, temple_md_reads: templeReads, context_resolve_calls: 1, reported_output_bytes: templeReads ? 13000 : 5600 }
  });
  const protocol = { work_item_id: "WI-0136", protocol_sha256: "ablation" };
  const run = {
    status: "completed",
    protocol_sha256: "ablation",
    conditions: [condition("full-load", 1000, 1200, 2000, 1), condition("routed", 600, 800, 1500, 0)]
  };
  const result = analyzeContextAblation({ protocol, run, generatedAt: "2026-09-03T00:00:00.000Z" });
  assert.equal(result.comparison.operational_token_delta, -400);
  assert.equal(result.comparison.operational_token_delta_percent, -40);
  assert.equal(result.interpretation.outcome, "routed-context-supported");
  assert.equal(result.interpretation.statistical_generalization, false);
  assert.equal(result.interpretation.main_comparison_result, false);
});
