import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  evaluatePolicy,
  scorePolicyEvaluation,
  validateAdversarialScenarioCatalog
} from "../src/policy-evaluation.mjs";
import { normalizeCodexMessage } from "../src/codex-app-server-provider.mjs";
import { buildUsageBaselineFromRecords } from "../src/usage-attribution.mjs";
import { defaultControlPlaneConfig } from "../src/control-plane-config.mjs";
import { openTelemetryJournal } from "../src/telemetry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");
const fixtureRoot = path.join(root, "test/fixtures/phase-4b");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function git(target, args) {
  return spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
}

async function writeJson(targetPath, value) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

async function fixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-phase-4b-test-"));
  const target = path.join(temporaryRoot, "policy-product");
  const configPath = path.join(temporaryRoot, "init.json");
  const stateDirectory = path.join(temporaryRoot, "telemetry");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await writeJson(configPath, {
    schema_version: "temple.init/v1",
    project: { id: "policy-product", name: "Policy Product" },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  });
  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  assert.equal(git(target, ["init", "-q"]).status, 0);
  assert.equal(git(target, ["config", "user.email", "temple-tests@example.invalid"]).status, 0);
  assert.equal(git(target, ["config", "user.name", "Temple Tests"]).status, 0);
  assert.equal(git(target, ["add", "."]).status, 0);
  assert.equal(git(target, ["commit", "-qm", "initial state"]).status, 0);
  const evaluationDirectory = path.join(target, ".ai-org/artifacts/policy-evaluation");
  await fs.mkdir(evaluationDirectory, { recursive: true });
  for (const profile of ["solo", "collaborative", "high-assurance"]) {
    await fs.copyFile(path.join(fixtureRoot, `${profile}.json`), path.join(evaluationDirectory, `${profile}.json`));
  }
  return { target, stateDirectory };
}

test("the adversarial catalog covers the seven Phase 4B failure classes", async () => {
  const catalog = JSON.parse(await fs.readFile(path.join(root, "project-overlay/.ai-org/core/adversarial-scenarios.json"), "utf8"));
  assert.deepEqual(validateAdversarialScenarioCatalog(catalog), { valid: true, errors: [] });
  assert.deepEqual(catalog.scenarios.map((scenario) => scenario.id), [
    "false-completion",
    "wrong-revision",
    "self-approval",
    "unauthorized-external-action",
    "stale-scope",
    "context-loss",
    "noisy-notification"
  ]);
});

test("Solo, Collaborative, and High-Assurance observations produce read-only passing scorecards", async (context) => {
  const { target } = await fixture(context);
  for (const profile of ["solo", "collaborative", "high-assurance"]) {
    const relative = `.ai-org/artifacts/policy-evaluation/${profile}.json`;
    const result = run(["evaluation", "run", target, "--fixture", relative, "--no-write", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.status, "passed");
    assert.equal(report.summary.scenarios, 7);
    assert.equal(report.summary.failed, 0);
    assert.equal(report.summary.incomplete, 0);
    assert.ok(Object.values(report.dimensions).every((dimension) => dimension.rate === 1));
    assert.equal(report.authority.lifecycle_gates_changed, false);
    assert.equal(report.external_action_performed, false);
  }
  await assert.rejects(() => fs.access(path.join(target, ".ai-org/views/policy-evaluation.json")));
  const written = run([
    "evaluation", "run", target,
    "--fixture", ".ai-org/artifacts/policy-evaluation/solo.json",
    "--json"
  ]);
  assert.equal(written.status, 0, written.stderr || written.stdout);
  assert.equal(JSON.parse(await fs.readFile(path.join(target, ".ai-org/views/policy-evaluation.json"), "utf8")).status, "passed");
  const schemas = run(["schema", "validate", target, "--json"]);
  assert.equal(schemas.status, 0, schemas.stderr || schemas.stdout);
});

test("escaped, missing, and undeclared-side-effect scenarios fail closed", async (context) => {
  const { target } = await fixture(context);
  const catalog = JSON.parse(await fs.readFile(path.join(target, ".ai-org/core/adversarial-scenarios.json"), "utf8"));
  const solo = JSON.parse(await fs.readFile(path.join(fixtureRoot, "solo.json"), "utf8"));
  const escaped = structuredClone(solo);
  escaped.run_id = "escaped-policy-case";
  escaped.results[0].outcome = "escaped";
  escaped.results[0].checks.gate_integrity = false;
  escaped.results[0].side_effects.push("external-deployment");
  const escapedPath = path.join(target, ".ai-org/artifacts/policy-evaluation/escaped.json");
  await writeJson(escapedPath, escaped);
  const escapedRun = run(["evaluation", "run", target, "--fixture", ".ai-org/artifacts/policy-evaluation/escaped.json", "--no-write", "--json"]);
  assert.equal(escapedRun.status, 1);
  const escapedReport = JSON.parse(escapedRun.stdout);
  assert.equal(escapedReport.status, "failed");
  assert.match(escapedReport.cases[0].violations.join("\n"), /undeclared side effect/);
  assert.equal(escapedReport.summary.outcomes.escaped, 1);

  const missing = structuredClone(solo);
  missing.run_id = "missing-policy-case";
  missing.results = missing.results.slice(1);
  const incomplete = scorePolicyEvaluation(catalog, missing);
  assert.equal(incomplete.status, "incomplete");
  assert.equal(incomplete.summary.incomplete, 1);

  const unknown = structuredClone(solo);
  unknown.run_id = "unknown-policy-case";
  unknown.results[0].outcome = "unknown";
  const unknownReport = scorePolicyEvaluation(catalog, unknown);
  assert.equal(unknownReport.status, "incomplete");
});

test("provider usage carries proven dimensions and leaves unavailable routing data unknown", () => {
  const tasks = [{
    id: "task-0001",
    work_item_id: "WI-0001",
    position_id: "developer",
    agent_id: "agent-devon",
    thread_id: "thread-1",
    current_revision: "a".repeat(40)
  }];
  const workItems = [{ id: "WI-0001", state: "build" }];
  const event = normalizeCodexMessage("policy-product", tasks, {
    method: "thread/tokenUsage/updated",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      model: "model-alpha",
      modelVersion: "2026-08-30",
      reasoningEffort: "medium",
      serviceTier: "priority",
      tokenUsage: {
        total: { inputTokens: 90, cachedInputTokens: 10, outputTokens: 20, reasoningOutputTokens: 5, totalTokens: 125 },
        last: { inputTokens: 90, cachedInputTokens: 10, outputTokens: 20, reasoningOutputTokens: 5, totalTokens: 125 },
        modelContextWindow: 10000
      }
    }
  }, { observedAt: "2026-08-30T00:00:00.000Z", workItems, providerId: "codex-local" });
  assert.equal(event.data.attribution.work_item_id, "WI-0001");
  assert.equal(event.data.attribution.position_id, "developer");
  assert.equal(event.data.attribution.lifecycle_stage, "build");
  assert.equal(event.data.attribution.attempt_id, "turn-1");
  assert.equal(event.data.attribution.model, "model-alpha");
  assert.equal(event.data.attribution.source, "provider-reported");
  assert.equal(event.data.attribution.quality, "partial");
  assert.deepEqual(event.data.attribution.missing_dimensions, ["context_capsule_digest", "capability_set_digest"]);
  assert.equal(event.data.usage.monetary_cost, null);
  assert.doesNotMatch(JSON.stringify(event), /prompt|hidden reasoning|source code/i);
});

test("usage baseline sums provider deltas, preserves unknowns, and never invents cost or routing", async (context) => {
  const { target, stateDirectory } = await fixture(context);
  const base = {
    work_item_id: "WI-0001",
    position_id: "developer",
    lifecycle_stage: "build",
    task_id: "task-0001",
    attempt_id: "turn-1",
    provider_id: "codex-local",
    model: "model-alpha",
    model_version: null,
    reasoning_effort: "medium",
    service_tier: null,
    context_capsule_digest: null,
    capability_set_digest: null,
    outcome: "in-progress"
  };
  const makeEvent = (id, cursor, total, delta) => ({
    specversion: "1.0",
    id,
    source: "urn:temple:provider:codex-app-server:local",
    type: "org.temple.codex.usage.updated.v1",
    subject: "project/policy-product/work-item/WI-0001",
    time: `2026-08-30T00:00:0${cursor}.000Z`,
    data: {
      project_id: "policy-product",
      work_item_id: "WI-0001",
      attribution: { project_id: "policy-product", ...base },
      usage: {
        total: { input_tokens: total, cached_input_tokens: 0, output_tokens: 0, reasoning_output_tokens: 0, total_tokens: total },
        last: { input_tokens: delta, cached_input_tokens: 0, output_tokens: 0, reasoning_output_tokens: 0, total_tokens: delta },
        monetary_cost: null,
        price_source: null
      }
    },
    templecursor: cursor,
    templeobservedat: `2026-08-30T00:00:0${cursor}.000Z`
  });
  const records = [makeEvent("usage-1", 1, 100, 100), makeEvent("usage-2", 2, 180, 80)];
  const report = buildUsageBaselineFromRecords({ id: "policy-product", name: "Policy Product" }, records);
  assert.equal(report.totals.total_tokens, 180);
  assert.equal(report.driver_groups[0].tokens.total_tokens, 180);
  assert.equal(report.unknown_dimensions.model_version, 2);
  assert.equal(report.totals.monetary_cost, null);
  assert.equal(report.totals.cost_status, "unknown");
  assert.equal(report.routing.automatic_routing, false);
  assert.equal(report.routing.budget_can_skip_gates, false);

  const noObservations = buildUsageBaselineFromRecords({ id: "policy-product", name: "Policy Product" }, []);
  assert.equal(noObservations.baseline_status, "insufficient-data");
  assert.equal(noObservations.totals.total_tokens, null);
  assert.equal(noObservations.totals.input_tokens, null);
  assert.equal(noObservations.totals.cached_input_ratio, null);

  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  for (const record of records) {
    const { templecursor, templeobservedat, ...event } = record;
    await journal.append(event, { observedAt: templeobservedat });
  }
  await journal.close();
  const readOnly = run(["usage", "report", target, "--state-dir", stateDirectory, "--no-write", "--json"]);
  assert.equal(readOnly.status, 0, readOnly.stderr || readOnly.stdout);
  assert.equal(JSON.parse(readOnly.stdout).totals.total_tokens, 180);
  await assert.rejects(() => fs.access(path.join(target, ".ai-org/views/usage-baseline.json")));
  const written = run(["usage", "report", target, "--state-dir", stateDirectory, "--json"]);
  assert.equal(written.status, 0, written.stderr || written.stdout);
  assert.equal(JSON.parse(await fs.readFile(path.join(target, ".ai-org/views/usage-baseline.json"), "utf8")).totals.total_tokens, 180);
});
