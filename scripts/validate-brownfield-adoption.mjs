#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templeCli = path.join(repositoryRoot, "bin/temple.mjs");
const outputPath = parseOutputPath(process.argv.slice(2));
const gitEnvironment = {
  ...process.env,
  GIT_AUTHOR_NAME: "Temple Brownfield Fixture",
  GIT_AUTHOR_EMAIL: "fixture@temple.invalid",
  GIT_COMMITTER_NAME: "Temple Brownfield Fixture",
  GIT_COMMITTER_EMAIL: "fixture@temple.invalid"
};

function parseOutputPath(arguments_) {
  const outputIndex = arguments_.indexOf("--output");
  if (outputIndex === -1) return null;
  if (!arguments_[outputIndex + 1]) throw new Error("--output requires a path");
  return path.resolve(arguments_[outputIndex + 1]);
}

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed (${result.status}): ${command} ${arguments_.join(" ")}`,
        result.stdout?.trim(),
        result.stderr?.trim()
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
  return result.stdout;
}

function git(target, ...arguments_) {
  return run("git", arguments_, { cwd: target, env: gitEnvironment }).trim();
}

function templeGroup(target, ...arguments_) {
  const [group, operation, ...rest] = arguments_;
  return run(process.execPath, [templeCli, group, operation, target, ...rest], { cwd: target });
}

function templeTopLevel(target, command, ...arguments_) {
  return run(process.execPath, [templeCli, command, target, ...arguments_], { cwd: target });
}

function elapsedSince(start) {
  return Number((performance.now() - start).toFixed(3));
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function digestFiles(target, relativePaths) {
  return Object.fromEntries(
    await Promise.all(
      relativePaths.map(async (relativePath) => [relativePath, sha256(await fs.readFile(path.join(target, relativePath)))])
    )
  );
}

function changedPaths(target, fromRevision, toRevision) {
  return git(target, "diff", "--name-only", fromRevision, toRevision)
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .sort();
}

function parseNodeTestCount(output) {
  const match = output.match(/^(?:#|ℹ) pass (\d+)$/m);
  if (!match) throw new Error(`Could not read Node test pass count from:\n${output}`);
  return Number(match[1]);
}

async function writeJson(relativePath, value) {
  await fs.mkdir(path.dirname(relativePath), { recursive: true });
  await fs.writeFile(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function runRehearsal() {
  const startedAt = new Date().toISOString();
  const totalStarted = performance.now();
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-brownfield-"));
  const target = path.join(temporaryRoot, "ledger-lantern");
  const qaWorktree = path.join(temporaryRoot, "qa-candidate");
  const humanDocumentPaths = ["README.md", "docs/requirements.md", "CONTRIBUTING.md"];

  try {
    const setupStarted = performance.now();
    await fs.mkdir(path.join(target, "src"), { recursive: true });
    await fs.mkdir(path.join(target, "test"), { recursive: true });
    await fs.mkdir(path.join(target, "docs"), { recursive: true });
    await fs.writeFile(
      path.join(target, "README.md"),
      "# Ledger Lantern\n\nA small existing application used to summarize invoice line totals.\n"
    );
    await writeJson(path.join(target, "package.json"), {
      name: "ledger-lantern",
      private: true,
      type: "module",
      scripts: { test: "node --test" }
    });
    await fs.writeFile(
      path.join(target, "src/pricing.mjs"),
      [
        "export function subtotal(lines) {",
        "  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);",
        "}",
        ""
      ].join("\n")
    );
    await fs.writeFile(
      path.join(target, "test/pricing.test.mjs"),
      [
        'import assert from "node:assert/strict";',
        'import test from "node:test";',
        'import { subtotal } from "../src/pricing.mjs";',
        "",
        'test("subtotal sums invoice lines", () => {',
        "  assert.equal(subtotal([{ quantity: 2, unitPrice: 300 }, { quantity: 1, unitPrice: 450 }]), 1050);",
        "});",
        ""
      ].join("\n")
    );
    git(target, "init", "-b", "main");
    git(target, "add", ".");
    git(target, "commit", "-m", "Create existing invoice utility");

    await fs.writeFile(
      path.join(target, "docs/requirements.md"),
      [
        "# Product requirements",
        "",
        "- Invoice totals use integer minor units.",
        "- Human-facing totals use an explicit currency code.",
        "- Existing documentation remains authoritative until its owner changes it.",
        ""
      ].join("\n")
    );
    await fs.writeFile(
      path.join(target, "CONTRIBUTING.md"),
      [
        "# Contribution policy",
        "",
        "Use an isolated branch for changes. Run the application tests and require review before integration into `main`.",
        ""
      ].join("\n")
    );
    git(target, "add", ".");
    git(target, "commit", "-m", "Record existing product and review policy");
    const initialHead = git(target, "rev-parse", "HEAD");
    const initialCommitCount = Number(git(target, "rev-list", "--count", "HEAD"));
    assert.equal(initialCommitCount, 2);
    const documentsBefore = await digestFiles(target, humanDocumentPaths);
    const initialTestOutput = run(process.execPath, ["--test", "test/pricing.test.mjs"], { cwd: target });
    const setupElapsedMs = elapsedSince(setupStarted);

    const initStarted = performance.now();
    const initConfigPath = path.join(temporaryRoot, "init.json");
    await writeJson(initConfigPath, {
      schema_version: "temple.init/v1",
      project: { id: "ledger-lantern", name: "Ledger Lantern" },
      naming_mode: "manual",
      agents: [
        {
          display_name: "Fixture Rowan",
          positions: ["engineering_manager", "release_manager", "observer"]
        },
        {
          display_name: "Fixture Linden",
          positions: ["product_manager", "ux_designer", "ui_designer"]
        },
        { display_name: "Fixture Ellis", positions: ["tech_lead"] },
        { display_name: "Fixture Devon", positions: ["developer"] },
        { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
      ],
      repository_integration: {
        schema_version: "temple.repository-integration/v1",
        status: "confirmed",
        authority: "project",
        source: "repository-policy",
        policy_refs: ["CONTRIBUTING.md"],
        summary: "Use isolated changes and review before integration.",
        integration_target: "main",
        change_isolation: "required",
        review_gate: "required",
        recorded_at: "2026-09-02T00:00:00.000Z",
        recorded_by: "human"
      }
    });
    run(process.execPath, [templeCli, "init", target, "--config", initConfigPath], { cwd: target });
    const integration = JSON.parse(
      await fs.readFile(path.join(target, ".ai-org/project/repository-integration.json"), "utf8")
    );
    assert.equal(integration.status, "confirmed");
    assert.deepEqual(integration.policy_refs, ["CONTRIBUTING.md"]);
    const documentsAfterInit = await digestFiles(target, humanDocumentPaths);
    assert.deepEqual(documentsAfterInit, documentsBefore);
    const initializationPaths = git(target, "status", "--porcelain")
      .split("\n")
      .map((entry) => entry.slice(3).trim())
      .filter(Boolean)
      .sort();
    assert.ok(initializationPaths.includes(".ai-org/"));
    assert.ok(initializationPaths.includes("temple.lock"));
    git(target, "add", ".");
    git(target, "commit", "-m", "Adopt Temple without replacing project policy");
    const adoptionRevision = git(target, "rev-parse", "HEAD");
    const initElapsedMs = elapsedSince(initStarted);

    const deliveryStarted = performance.now();
    git(target, "switch", "-c", "fixture/wi-0001-currency-format");
    templeGroup(
      target,
      "work-item",
      "create",
      "--title",
      "Format invoice totals with a currency code",
      "--scope",
      "Add one deterministic formatter without changing subtotal behavior",
      "--acceptance",
      "JPY totals render with a currency code and grouping",
      "--affected-path",
      "src/pricing.mjs",
      "--affected-path",
      "test/pricing.test.mjs",
      "--spec-mode",
      "gate-evidence",
      "--ui-mode",
      "not-applicable"
    );
    const fixtureArtifacts = path.join(target, ".ai-org/artifacts/WI-0001");
    await fs.mkdir(fixtureArtifacts, { recursive: true });
    await fs.writeFile(path.join(fixtureArtifacts, "work-order.md"), "# Work order\n\nAdd the approved JPY formatter only.\n");
    await fs.writeFile(
      path.join(fixtureArtifacts, "spec.md"),
      "# Accepted scope\n\nFormat integer minor units as `JPY 1,050`; preserve subtotal behavior.\n"
    );
    await fs.writeFile(
      path.join(fixtureArtifacts, "design.md"),
      "# Technical design\n\nUse `Intl.NumberFormat` with a fixed `en-US` locale and no currency conversion.\n"
    );
    templeGroup(
      target,
      "work-item",
      "configure",
      "--work-item",
      "WI-0001",
      "--agent-id",
      "agent-fixture-devon",
      "--base-revision",
      adoptionRevision,
      "--parallel-mode",
      "sequential"
    );
    templeTopLevel(
      target,
      "transition",
      "--work-item",
      "WI-0001",
      "--to",
      "spec",
      "--satisfy",
      "work_order=.ai-org/artifacts/WI-0001/work-order.md"
    );
    templeTopLevel(
      target,
      "transition",
      "--work-item",
      "WI-0001",
      "--to",
      "design",
      "--satisfy",
      "approved_scope=.ai-org/artifacts/WI-0001/spec.md",
      "--satisfy",
      "acceptance_criteria=.ai-org/artifacts/WI-0001/spec.md"
    );
    templeTopLevel(
      target,
      "transition",
      "--work-item",
      "WI-0001",
      "--to",
      "build",
      "--satisfy",
      "technical_design=.ai-org/artifacts/WI-0001/design.md",
      "--satisfy",
      "risk_review=.ai-org/artifacts/WI-0001/design.md"
    );
    templeGroup(
      target,
      "work-item",
      "claim",
      "--work-item",
      "WI-0001",
      "--agent-id",
      "agent-fixture-devon",
      "--principal-id",
      "human",
      "--base-revision",
      adoptionRevision,
      "--branch",
      "fixture/wi-0001-currency-format"
    );
    git(target, "add", ".");
    git(target, "commit", "-m", "Plan bounded brownfield change");
    const planRevision = git(target, "rev-parse", "HEAD");

    await fs.writeFile(
      path.join(target, "src/pricing.mjs"),
      [
        "export function subtotal(lines) {",
        "  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);",
        "}",
        "",
        "export function formatTotal(currency, amount) {",
        '  return `${currency} ${new Intl.NumberFormat("en-US").format(amount)}`;',
        "}",
        ""
      ].join("\n")
    );
    await fs.writeFile(
      path.join(target, "test/pricing.test.mjs"),
      [
        'import assert from "node:assert/strict";',
        'import test from "node:test";',
        'import { formatTotal, subtotal } from "../src/pricing.mjs";',
        "",
        'test("subtotal sums invoice lines", () => {',
        "  assert.equal(subtotal([{ quantity: 2, unitPrice: 300 }, { quantity: 1, unitPrice: 450 }]), 1050);",
        "});",
        "",
        'test("formatTotal keeps the explicit currency code", () => {',
        '  assert.equal(formatTotal("JPY", 1050), "JPY 1,050");',
        "});",
        ""
      ].join("\n")
    );
    const changedProductPaths = git(target, "diff", "--name-only")
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .sort();
    assert.deepEqual(changedProductPaths, ["src/pricing.mjs", "test/pricing.test.mjs"]);
    const developerTestOutput = run(process.execPath, ["--test", "test/pricing.test.mjs"], { cwd: target });
    git(target, "add", "src/pricing.mjs", "test/pricing.test.mjs");
    git(target, "commit", "-m", "Format invoice totals with a currency code");
    const candidateRevision = git(target, "rev-parse", "HEAD");
    assert.deepEqual(changedPaths(target, planRevision, candidateRevision), changedProductPaths);
    const deliveryElapsedMs = elapsedSince(deliveryStarted);

    templeTopLevel(
      target,
      "handoff",
      "--work-item",
      "WI-0001",
      "--to",
      "quality_evaluator",
      "--input-revision",
      candidateRevision,
      "--completed",
      "Implemented the bounded formatter and preserved existing behavior",
      "--evidence",
      ".ai-org/artifacts/WI-0001/developer-test.md"
    );
    await fs.writeFile(
      path.join(fixtureArtifacts, "developer-test.md"),
      `# Developer test\n\nCandidate \`${candidateRevision}\`: ${parseNodeTestCount(developerTestOutput)} tests passed.\n`
    );
    templeTopLevel(target, "transition", "--work-item", "WI-0001", "--to", "test");
    await fs.writeFile(path.join(fixtureArtifacts, "test.md"), "# Test result\n\nApplication tests passed.\n");
    templeTopLevel(
      target,
      "transition",
      "--work-item",
      "WI-0001",
      "--to",
      "eval",
      "--satisfy",
      "test_evidence=.ai-org/artifacts/WI-0001/test.md"
    );
    await fs.writeFile(
      path.join(fixtureArtifacts, "evaluation.md"),
      "# Evaluation\n\nThe formatter meets the accepted scope without changing subtotal behavior.\n"
    );
    templeTopLevel(
      target,
      "transition",
      "--work-item",
      "WI-0001",
      "--to",
      "independent_qa",
      "--satisfy",
      "evaluation_report=.ai-org/artifacts/WI-0001/evaluation.md"
    );

    const qaStarted = performance.now();
    git(target, "worktree", "add", "--detach", qaWorktree, candidateRevision);
    let independentQaOutput;
    try {
      independentQaOutput = run(process.execPath, ["--test", "test/pricing.test.mjs"], { cwd: qaWorktree });
      assert.equal(git(qaWorktree, "status", "--porcelain"), "");
    } finally {
      git(target, "worktree", "remove", "--force", qaWorktree);
    }
    const independentQaElapsedMs = elapsedSince(qaStarted);
    await fs.writeFile(
      path.join(fixtureArtifacts, "qa.md"),
      `# Independent QA\n\nFixture Hollis reproduced ${parseNodeTestCount(independentQaOutput)} passing tests at exact candidate \`${candidateRevision}\` in a detached worktree.\n`
    );
    templeTopLevel(
      target,
      "transition",
      "--work-item",
      "WI-0001",
      "--to",
      "release_gate",
      "--satisfy",
      "independent_qa_pass=.ai-org/artifacts/WI-0001/qa.md"
    );
    templeTopLevel(
      target,
      "close",
      "--work-item",
      "WI-0001",
      "--decision",
      "go",
      "--tested-revision",
      candidateRevision,
      "--approval",
      "not-required",
      "--rollback",
      `git revert ${candidateRevision}`,
      "--satisfy",
      "accepted_scope=.ai-org/artifacts/WI-0001/spec.md",
      "--satisfy",
      "independent_qa_report=.ai-org/artifacts/WI-0001/qa.md"
    );

    const doctor = JSON.parse(
      run(process.execPath, [templeCli, "doctor", target, "--json"], { cwd: target })
    );
    const doctorCounts = doctor.checks.reduce(
      (counts, check) => {
        counts[check.status] = (counts[check.status] ?? 0) + 1;
        return counts;
      },
      { pass: 0, warn: 0, fail: 0 }
    );
    assert.equal(doctorCounts.fail, 0);
    const finalWorkItem = JSON.parse(
      await fs.readFile(path.join(target, ".ai-org/work-items/WI-0001.json"), "utf8")
    );
    assert.equal(finalWorkItem.state, "done");
    assert.equal(finalWorkItem.assigned_agent_id, "agent-fixture-rowan");
    assert.equal(finalWorkItem.developer_candidate_revision, candidateRevision);
    assert.equal(finalWorkItem.tested_revision, candidateRevision);
    assert.equal(finalWorkItem.external_release_status, "not_performed");

    const documentsAfterClose = await digestFiles(target, humanDocumentPaths);
    assert.deepEqual(documentsAfterClose, documentsBefore);
    git(target, "add", ".");
    git(target, "commit", "-m", "Record bounded Temple closeout");
    const finalRevision = git(target, "rev-parse", "HEAD");
    const finalCommitCount = Number(git(target, "rev-list", "--count", "HEAD"));
    run("git", ["merge-base", "--is-ancestor", initialHead, finalRevision], {
      cwd: target,
      env: gitEnvironment
    });

    return {
      schema_version: "temple.brownfield-adoption-observation/v1",
      work_item_id: "WI-0102",
      result: "pass",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      environment: {
        platform: process.platform,
        architecture: process.arch,
        node: process.version,
        git: git(target, "--version")
      },
      fixture: {
        project_id: "ledger-lantern",
        kind: "isolated-local-existing-repository",
        initial_revision: initialHead,
        adoption_revision: adoptionRevision,
        plan_revision: planRevision,
        candidate_revision: candidateRevision,
        final_revision: finalRevision,
        initial_commit_count: initialCommitCount,
        final_commit_count: finalCommitCount,
        original_history_preserved: true
      },
      timing_ms: {
        setup: setupElapsedMs,
        temple_initialization: initElapsedMs,
        bounded_delivery: deliveryElapsedMs,
        independent_qa: independentQaElapsedMs,
        total: elapsedSince(totalStarted)
      },
      preservation: {
        project_native_documents: documentsBefore,
        unchanged_after_initialization: true,
        unchanged_after_closeout: true,
        repository_policy_status: integration.status,
        repository_policy_refs: integration.policy_refs
      },
      mutation_scope: {
        initialization_paths: initializationPaths,
        bounded_product_change_paths: changedProductPaths
      },
      verification: {
        application_tests_before: parseNodeTestCount(initialTestOutput),
        developer_tests: parseNodeTestCount(developerTestOutput),
        independent_qa_tests: parseNodeTestCount(independentQaOutput),
        developer_agent_id: "agent-fixture-devon",
        independent_qa_agent_id: "agent-fixture-hollis",
        exact_candidate_reproduced: true,
        doctor: doctorCounts,
        lifecycle_state: finalWorkItem.state,
        external_release_status: finalWorkItem.external_release_status
      },
      usage: {
        token_measurement: "not_applicable_no_model_invoked",
        model_generation_requested: false,
        observer_required: false,
        usage_collector_required: false
      },
      external_actions: {
        network_write: false,
        docker_installed_or_started: false,
        deployment: false,
        publication: false,
        release: false
      },
      limitations: [
        "Synthetic existing repository rather than an independently maintained product",
        "One human operator and one local machine",
        "Agent identity separation is organizational, not independent-human separation",
        "No external document system, hosted pull request, CI, deployment, or production runtime",
        "No model was invoked, so this run measures framework mechanics rather than AI Token cost"
      ]
    };
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}

try {
  const observation = await runRehearsal();
  const serialized = `${JSON.stringify(observation, null, 2)}\n`;
  if (outputPath) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, serialized, { flag: "wx" });
  }
  process.stdout.write(serialized);
} catch (error) {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exitCode = 1;
}
