import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ablationIntegrationInstruction,
  armProcessInstructions,
  analyzeContextAblation,
  comparisonAllowedCommandPrefixes,
  buildEvaluatorOutputSchema,
  diagnosticConditionFailure,
  diagnosticConditionObservation,
  diagnosticStoppedRun,
  evaluatorOutputSchema,
  executeEvaluatorContinuation,
  integrationOutputSchema,
  modelTurnStopReason,
  normalizeProviderCommandText,
  protocolDigest,
  representativeAppServerArguments,
  representativeCommandItemAllowed,
  representativeProtocolViolationForMessage,
  representativeTurnSandboxPolicy,
  representativeStoppedRun,
  settleFailClosedParallel,
  statusPaths,
  stoppedStageObservation,
  successfulContextActionLabels,
  templeRoutedContextInstruction,
  validateAblationApproval,
  validateAblationProtocol,
  validateProviderOutputSchema,
  validateRepresentativeApproval,
  validateEvaluatorContinuationApproval,
  validateEvaluatorContinuationProtocol,
  validateEvaluatorContinuationReadiness,
  validateRepresentativeHarnessReadiness,
  validateRepresentativeProtocol,
  validateEvaluatorCompletion,
  waitForModelTurnSignal
} from "../scripts/run-representative-microservice-comparison.mjs";
import { analyzeRepresentativeComparison } from "../scripts/analyze-representative-microservice-comparison.mjs";
import { commandTextAllowed } from "../src/app-server-protocol-replay.mjs";

const protocolPath = new URL("../.ai-org/artifacts/WI-0136/live-protocol.json", import.meta.url);
const approvalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/account-approval.template.json", import.meta.url);
const ablationProtocolPath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-protocol.json", import.meta.url);
const ablationApprovalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-approval.template.json", import.meta.url);
const ablationApprovalPath = new URL("../.ai-org/artifacts/WI-0136/context-ablation-approval.json", import.meta.url);
const harnessReadinessPath = new URL("../.ai-org/artifacts/WI-0136/representative-harness-readiness-v1.json", import.meta.url);
const evaluatorContinuationProtocolPath = new URL("../.ai-org/artifacts/WI-0136/evaluator-continuation-protocol.json", import.meta.url);
const evaluatorContinuationApprovalTemplatePath = new URL("../.ai-org/artifacts/WI-0136/evaluator-continuation-approval.template.json", import.meta.url);
const evaluatorContinuationReadinessPath = new URL("../.ai-org/artifacts/WI-0136/evaluator-continuation-readiness-v15.json", import.meta.url);
const archivedV13CandidatePath = new URL("../.ai-org/artifacts/WI-0136/representative-main-v13-candidate-run.json", import.meta.url);

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
  assert.equal(protocol.protocol_revision, 13);
  assert.equal(protocol.execution.design_operational_token_limit, 150000);
  assert.equal(protocol.execution.candidate_aggregate_operational_token_limit, 650000);
  assert.equal(protocol.execution.combined_operational_token_limit, 750000);
  assert.deepEqual(protocol.context_policy.temple_md_fallback_when_missing, ["authority", "current-state", "safe-next-action"]);
  assert.equal(protocol.predecessor.disposition, "stopped-candidate-ambient-memory-context-contamination");
  assert.equal(protocol.predecessor.stopped_run, ".ai-org/artifacts/WI-0136/representative-main-v12-stopped-run.json");
  assert.equal(protocol.stopped_evidence_policy, "completed-active-and-settled-sibling-observations-v3");
  assert.equal(protocol.runner_safety.relative_git_target_policy, "exact-fixture-repository-id-plus-installed-provider-turn-sandbox");
  assert.equal(protocol.runner_safety.parallel_failure_policy, "interrupt-and-await-all-siblings-before-stop-record");
  assert.equal(protocol.runner_safety.build_command_policy, "arm-root-repository-ids-without-candidate-git-self-check");
  assert.equal(protocol.runner_safety.provider_shell_wrapper_policy, "unwrap-one-exact-zsh-lc-single-quoted-layer-then-reapply-full-policy");
  assert.equal(protocol.runner_safety.provider_cwd_policy, "diagnostic-only-for-nested-code-mode-command-items");
  assert.equal(protocol.runner_safety.turn_sandbox_policy, "installed-provider-arm-write-boundary-network-disabled-plus-command-and-explicit-path-gates");
  assert.equal(protocol.runner_safety.memory_isolation_policy, "strict-app-server-config-disables-memory-use-generation-and-feature");
  assert.equal(protocol.runner_safety.harness_readiness_policy, "production-orchestration-with-injected-generation-free-provider-v1");
  assert.equal(protocol.runner_safety.readiness_required_before_exact_approval, true);
  assert.deepEqual(protocol.provider_contract.turn_sandbox_capabilities, {
    restricted_read_access_supported: false,
    workspace_write_roots_supported: true,
    network_access_toggle_supported: true
  });
  const memoryIsolation = protocol.provider_contract.memory_isolation;
  assert.deepEqual({ ...memoryIsolation, app_server_arguments_sha256: "<digest>" }, {
    use_memories: false,
    generate_memories: false,
    feature_enabled: false,
    app_server_arguments_sha256: "<digest>",
    pass: true
  });
  assert.match(memoryIsolation.app_server_arguments_sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(representativeAppServerArguments, [
    "app-server",
    "--stdio",
    "--strict-config",
    "-c",
    "memories.use_memories=false",
    "-c",
    "memories.generate_memories=false",
    "--disable",
    "memories"
  ]);
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

test("the readiness marker binds the full generation-free production-path rehearsal", async () => {
  const protocol = await readJson(protocolPath);
  const readiness = await readJson(harnessReadinessPath);
  const labRoot = readiness.source_lab;
  assert.deepEqual(validateRepresentativeHarnessReadiness(readiness, protocol, labRoot), { valid: true, errors: [] });
  const incomplete = structuredClone(readiness);
  incomplete.checks.pop();
  incomplete.repository_cleanliness[0].clean = false;
  incomplete.operational_tokens = 1;
  const result = validateRepresentativeHarnessReadiness(incomplete, protocol, labRoot);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("readiness check set mismatch"));
  assert.ok(result.errors.includes("readiness repository cleanliness mismatch"));
  assert.ok(result.errors.includes("readiness must be generation-free"));
});

test("the evaluator must freeze both packages and every binary dimension exactly once", () => {
  const packages = [{ package_id: "package-a" }, { package_id: "package-b" }];
  const rubric = {
    dimensions: [{ id: "contract" }, { id: "recovery" }],
    critical_failures: ["held-out-tests-failed"]
  };
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

test("the evaluator schema binds exact package, dimension, and critical-failure identities", () => {
  const schema = buildEvaluatorOutputSchema(
    [{ package_id: "package-b" }, { package_id: "package-a" }],
    {
      dimensions: [{ id: "recovery" }, { id: "contract" }],
      critical_failures: ["out-of-scope-write", "held-out-tests-failed"]
    }
  );
  const packageProperties = schema.properties.packages.items.properties;
  assert.deepEqual(packageProperties.package_id.enum, ["package-a", "package-b"]);
  assert.deepEqual(packageProperties.dimensions.items.properties.id.enum, ["contract", "recovery"]);
  assert.deepEqual(packageProperties.critical_failure.enum, [null, "held-out-tests-failed", "out-of-scope-write"]);
});

test("the evaluator semantic gate rejects vague or invented score evidence", () => {
  const packages = [{ package_id: "package-a" }];
  const rubric = {
    dimensions: [{ id: "contract" }],
    critical_failures: ["held-out-tests-failed"]
  };
  const result = {
    packages: [{
      package_id: "package-a",
      dimensions: [{ id: "contract", score: 1, rationale: "" }],
      critical_failure: "invented-failure",
      summary: ""
    }],
    summary: ""
  };
  assert.throws(
    () => validateEvaluatorCompletion(result, packages, rubric),
    /summary missing.*rationale missing.*critical failure invalid/
  );
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

test("representative command policy permits only exact fixture repository IDs for Git reads", () => {
  const armRoot = "/tmp/temple-arm";
  const item = (cwd, command) => ({
    type: "commandExecution",
    cwd,
    commandActions: [{ type: "read", command }]
  });
  assert.equal(
    representativeCommandItemAllowed(item(armRoot, "git -C orders status --short"), armRoot),
    true
  );
  assert.equal(
    representativeCommandItemAllowed(item(armRoot, "git -C ../orders status --short"), armRoot),
    false
  );
  assert.equal(
    representativeCommandItemAllowed(item(armRoot, "git -C orders config core.sshCommand exploit"), armRoot),
    false
  );
  assert.equal(
    representativeCommandItemAllowed(item(`${armRoot}/catalog`, "rg OrderPlaced ../../outside"), armRoot),
    false
  );
});

test("nested Code Mode Provider cwd is diagnostic while explicit paths remain bounded", () => {
  const armRoot = "/tmp/temple-arm";
  const item = (cwd, command, action = {}) => ({
    type: "commandExecution",
    cwd,
    commandActions: [{ type: "read", command, ...action }]
  });
  assert.equal(representativeCommandItemAllowed(item("notifications", "rg --files coordinator"), armRoot), true);
  assert.equal(representativeCommandItemAllowed(item("/tmp/provider-presentation-root", "rg --files"), armRoot), true);
  assert.equal(representativeCommandItemAllowed(item("https://example.invalid/notifications", "rg --files"), armRoot), true);
  assert.equal(representativeCommandItemAllowed(item("/tmp/provider-presentation-root", "sed -n '1,20p' /tmp/outside/secret"), armRoot), false);
  assert.equal(representativeCommandItemAllowed(item(
    "/tmp/provider-presentation-root",
    `rg WI-0136 ${path.join(os.homedir(), ".codex", "memories", "MEMORY.md")}`,
    { path: path.join(os.homedir(), ".codex", "memories", "MEMORY.md") }
  ), armRoot), false);
  assert.equal(representativeCommandItemAllowed(item("/tmp/provider-presentation-root", "sed -n '1,20p' source.mjs", { path: "/tmp/outside/secret" }), armRoot), false);
  assert.equal(representativeCommandItemAllowed(item("/tmp/provider-presentation-root", "sed -n '1,20p' source.mjs", { path: "/tmp/temple-arm/gateway/source.mjs" }), armRoot), true);
  assert.equal(representativeCommandItemAllowed(item("/tmp/provider-presentation-root", "rg OrderPlaced ../outside"), armRoot), false);
});

test("turn sandbox uses only fields supported by the pinned installed Provider contract", () => {
  const root = "/tmp/temple-arm";
  assert.deepEqual(representativeTurnSandboxPolicy(root, "read-only"), {
    type: "readOnly",
    networkAccess: false
  });
  assert.deepEqual(representativeTurnSandboxPolicy(root, "workspace-write"), {
    type: "workspaceWrite",
    writableRoots: [root],
    networkAccess: false
  });
});

test("historical Provider command events are classified by normalized scope rather than display wrapper", () => {
  const armRoot = "/tmp/temple-arm";
  const event = (cwd, actionCommand, displayCommand = actionCommand) => ({
    method: "item/started",
    params: {
      turnId: "turn-1",
      item: {
        type: "commandExecution",
        cwd,
        command: displayCommand,
        commandActions: [{ type: "read", command: actionCommand }]
      }
    }
  });
  const classify = (message) => representativeProtocolViolationForMessage(message, { turnId: "turn-1", armRoot });
  assert.equal(classify(event("notifications", "rg --files coordinator", "/bin/zsh -lc 'rg --files coordinator'")), null);
  assert.equal(classify(event("notifications", "rg --files coordinator", "/bin/zsh -lc \"rg --files coordinator\"")), null);
  assert.equal(classify(event(
    "notifications",
    "/bin/zsh -lc 'node coordinator/templew.mjs context resolve coordinator --work-item WI-0001 --position developer --no-write --json'"
  )), null);
  assert.equal(classify(event(`${armRoot}/catalog/src`, "git -C orders status --short")), null);
  assert.match(classify(event(`${armRoot}/catalog/src`, "git -C ../notifications status --short")).message, /command policy rejected/);
  assert.match(classify(event("notifications", "curl https://example.invalid")).message, /command policy rejected/);
  assert.match(classify(event("notifications", "/bin/zsh -lc 'node coordinator/templew.mjs; curl https://example.invalid'")).message, /command policy rejected/);
  assert.match(classify(event("notifications", "/bin/zsh -lc \"node coordinator/templew.mjs context resolve coordinator\"")).message, /command policy rejected/);
  assert.equal(classify(event("../outside", "rg OrderPlaced")), null);
  assert.match(classify(event("../outside", "rg OrderPlaced /tmp/outside")).message, /command policy rejected/);
  assert.equal(classify({ ...event("notifications", "rg OrderPlaced"), params: { ...event("notifications", "rg OrderPlaced").params, turnId: "other" } }), null);
});

test("representative command policy canonicalizes explicit paths and rejects symlink escapes", async () => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-command-cwd-"));
  const armRoot = path.join(temporaryRoot, "arm");
  const aliasRoot = path.join(temporaryRoot, "arm-alias");
  const outsideRoot = path.join(temporaryRoot, "outside");
  await fs.mkdir(path.join(armRoot, "notifications"), { recursive: true });
  await fs.mkdir(outsideRoot, { recursive: true });
  await fs.symlink(armRoot, aliasRoot, "dir");
  await fs.symlink(outsideRoot, path.join(armRoot, "escape"), "dir");
  const item = (path_) => ({
    type: "commandExecution",
    cwd: "/tmp/provider-presentation-root",
    commandActions: [{ type: "read", command: "sed -n '1,20p' source.mjs", path: path_ }]
  });
  try {
    assert.equal(representativeCommandItemAllowed(item(path.join(aliasRoot, "notifications", "source.mjs")), armRoot), true);
    assert.equal(representativeCommandItemAllowed(item(path.join(armRoot, "escape", "secret")), armRoot), false);
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("Provider shell normalization unwraps one safe layer and rejects ambiguous wrappers", () => {
  assert.equal(
    normalizeProviderCommandText("/bin/zsh -lc 'node coordinator/templew.mjs context resolve coordinator --work-item WI-0001 --position developer --no-write --json'"),
    "node coordinator/templew.mjs context resolve coordinator --work-item WI-0001 --position developer --no-write --json"
  );
  assert.equal(normalizeProviderCommandText("node coordinator/templew.mjs"), "node coordinator/templew.mjs");
  assert.equal(normalizeProviderCommandText('/bin/zsh -lc "node coordinator/templew.mjs"'), null);
  assert.equal(normalizeProviderCommandText("/bin/zsh -lc 'node coordinator/templew.mjs ' nested"), null);
});

test("parallel fail-closed settlement aborts and awaits siblings before reporting the primary error", async () => {
  const events = [];
  const primary = new Error("primary failure");
  await assert.rejects(
    settleFailClosedParallel([
      async () => { throw primary; },
      async (signal) => {
        await new Promise((resolve) => {
          if (signal.aborted) resolve();
          else signal.addEventListener("abort", resolve, { once: true });
        });
        events.push("sibling-cleaned");
        throw new Error("cancelled sibling");
      }
    ]),
    (error) => error === primary
  );
  assert.deepEqual(events, ["sibling-cleaned"]);
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

test("a stage Token stop retains partial telemetry before the main run fails closed", () => {
  const stopped = stoppedStageObservation({
    id: "temple-design",
    stage: "design",
    operational_tokens: 101815,
    usage: { input_tokens: 1, cached_input_tokens: 0, output_tokens: 1, reasoning_output_tokens: 0, total_tokens: 2 }
  }, "design-operational-token-limit", true);
  assert.equal(stopped.status, "censored");
  assert.equal(stopped.stop_scope, "condition");
  assert.equal(stopped.stop_reason, "design-operational-token-limit");
  assert.equal(stopped.operational_tokens, 101815);
  assert.equal(stopped.completion, null);
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

test("the evaluator schema uses the portable binary enum contract", () => {
  const score = evaluatorOutputSchema.properties.packages.items.properties.dimensions.items.properties.score;
  assert.deepEqual(score, { type: "integer", enum: [0, 1] });
  const portable = validateProviderOutputSchema(evaluatorOutputSchema, { portable: true });
  assert.equal(portable.supported, true);
  assert.deepEqual(portable.errors, []);
  assert.match(portable.profile, /portable-subset/);

  const numericBounds = structuredClone(evaluatorOutputSchema);
  delete numericBounds.properties.packages.items.properties.dimensions.items.properties.score.enum;
  numericBounds.properties.packages.items.properties.dimensions.items.properties.score.minimum = 0;
  numericBounds.properties.packages.items.properties.dimensions.items.properties.score.maximum = 1;
  const rejected = validateProviderOutputSchema(numericBounds, { portable: true });
  assert.equal(rejected.supported, false);
  assert.ok(rejected.errors.some((entry) => entry.includes("keyword minimum is not portable")));
  assert.ok(rejected.errors.some((entry) => entry.includes("keyword maximum is not portable")));
});

test("a failed Provider terminal is reported before missing usage", () => {
  assert.equal(
    modelTurnStopReason({ status: "failed", error: { code: "invalid_json_schema" } }),
    "provider-invalid-output-schema:provider rejected the structured-output schema before generation"
  );
  assert.equal(modelTurnStopReason({ status: "completed" }), null);
  assert.equal(modelTurnStopReason({ status: "failed" }, "runtime-request:test"), "runtime-request:test");
});

test("the model-turn wait releases on process exit and deadline without a terminal event", async () => {
  const pending = new Promise(() => {});
  assert.equal(await waitForModelTurnSignal({
    terminal: pending,
    abort: pending,
    processExit: Promise.resolve("process-exit"),
    deadline: pending
  }), "process-exit");
  assert.equal(await waitForModelTurnSignal({
    terminal: pending,
    abort: pending,
    processExit: pending,
    deadline: Promise.resolve("deadline")
  }), "deadline");
});

test("the evaluator-only continuation binds the immutable v13 candidate and requires exact approval", async () => {
  const protocol = await readJson(evaluatorContinuationProtocolPath);
  const template = await readJson(evaluatorContinuationApprovalTemplatePath);
  assert.deepEqual(validateEvaluatorContinuationProtocol(protocol), { valid: true, errors: [] });
  assert.equal(protocol.protocol_sha256, protocolDigest(protocol));
  assert.equal(protocol.source.candidate_run_sha256, "c78c1ab4753e9aca3c095389cafe19fead5cb98328a4faf23adba71ca0303165");
  assert.equal(protocol.source.candidate_turns, 10);
  assert.equal(protocol.source.candidate_operational_tokens, 361250);
  assert.equal(protocol.protocol_revision, 15);
  assert.equal(protocol.execution.evaluator_turns, 1);
  assert.equal(protocol.execution.evaluator_operational_token_limit, 100000);
  assert.equal(protocol.execution.retry_count, 0);
  assert.equal(protocol.execution.fallback_count, 0);
  assert.deepEqual(protocol.output_schema.package_ids, ["package-60b8212567fe0e47", "package-836fb4e9fe89a6e4"]);
  assert.equal(protocol.output_schema.dimension_ids.length, 8);
  assert.equal(protocol.output_schema.critical_failures.length, 5);
  assert.equal(protocol.provider_contract.wire_request_validation.thread_start.pass, true);
  assert.equal(protocol.provider_contract.wire_request_validation.turn_start.pass, true);
  assert.match(protocol.evaluator_prompt.instruction_sha256, /^[a-f0-9]{64}$/);
  assert.equal(validateEvaluatorContinuationApproval(template, protocol).accepted, false);

  const approved = {
    ...template,
    approved: true,
    authorization_source: "exact-test-authorization",
    approved_at: "2026-09-04T00:00:00.000Z"
  };
  assert.deepEqual(validateEvaluatorContinuationApproval(approved, protocol), { accepted: true, errors: [] });
  approved.approved_evaluator_operational_tokens += 1;
  assert.equal(validateEvaluatorContinuationApproval(approved, protocol).accepted, false);

  const drifted = structuredClone(protocol);
  drifted.source.candidate_run_sha256 = "0".repeat(64);
  assert.equal(validateEvaluatorContinuationProtocol(drifted).valid, false);
});

test("the durable evaluator readiness binds a generation-free production-path rehearsal", async () => {
  const protocol = await readJson(evaluatorContinuationProtocolPath);
  const readiness = await readJson(evaluatorContinuationReadinessPath);
  assert.deepEqual(
    validateEvaluatorContinuationReadiness(readiness, protocol, protocol.source.lab_root),
    { valid: true, errors: [] }
  );
  const drifted = structuredClone(readiness);
  drifted.operational_tokens = 1;
  drifted.checks.pop();
  const result = validateEvaluatorContinuationReadiness(drifted, protocol, protocol.source.lab_root);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("evaluator continuation readiness check set mismatch"));
  assert.ok(result.errors.includes("evaluator continuation readiness must be generation-free"));
});

test("post-generation semantic failure retains evaluator usage and the exact stop reason", async () => {
  const labRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0136-evaluator-stop-test-"));
  try {
    await fs.copyFile(archivedV13CandidatePath, path.join(labRoot, "candidate-run.json"));
    const continuation = await readJson(evaluatorContinuationProtocolPath);
    const sourceProtocol = await readJson(protocolPath);
    const run = await readJson(path.join(labRoot, "candidate-run.json"));
    const completion = structuredClone(run.arms[0].blind);
    await assert.rejects(
      executeEvaluatorContinuation({
        labRoot,
        continuation,
        sourceProtocol,
        modelGenerationPerformed: false,
        launchTurn: async ({ id, stage, route }) => ({
          id,
          stage,
          requested_model: route.model,
          requested_reasoning_effort: route.reasoning_effort,
          usage: {
            input_tokens: 100,
            cached_input_tokens: 20,
            output_tokens: 10,
            reasoning_output_tokens: 0,
            total_tokens: 110
          },
          operational_tokens: 90,
          completion: {
            packages: [{
              package_id: completion.package_id,
              dimensions: [],
              critical_failure: null,
              summary: "invalid incomplete package"
            }],
            summary: "invalid incomplete evaluation"
          }
        })
      }),
      /evaluator package count mismatch/
    );
    const stopped = await readJson(path.join(labRoot, "evaluator-continuation-stopped-run.json"));
    assert.equal(stopped.evaluator_observation.operational_tokens, 90);
    assert.equal(stopped.evaluator_observation.usage.input_tokens, 100);
    assert.match(stopped.evaluator_observation.stop_reason, /^evaluator-contract-invalid:/);
    assert.equal(stopped.model_generation_status, "not-performed");
  } finally {
    await fs.rm(labRoot, { recursive: true, force: true });
  }
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
