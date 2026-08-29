import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { formatJson, sha256 } from "../src/files.mjs";
import { executeInit, planInit } from "../src/install.mjs";
import { ensureTaskRegistry } from "../src/project.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function configDocument(projectId = "sample-product", projectName = "Sample Product") {
  return {
    schema_version: "temple.init/v1",
    project: { id: projectId, name: projectName },
    naming_mode: "ai-suggested",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

async function fixture() {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-test-"));
  const target = path.join(temporaryRoot, "sample-product");
  const configPath = path.join(temporaryRoot, "init.json");
  await fs.writeFile(configPath, `${JSON.stringify(configDocument(), null, 2)}\n`);
  return { temporaryRoot, target, configPath };
}

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", `'"'"'`)}'`;
}

test("version is available without dependencies", () => {
  const result = run(["--version"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^0\.1\.0-alpha\.10/m);
});

test("dry-run writes nothing", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const result = run(["init", target, "--config", configPath, "--dry-run"]);
  assert.equal(result.status, 0, result.stderr);
  await assert.rejects(() => fs.access(path.join(target, "temple.lock")));
});

test("exclusive task-registry creation journals the content Temple actually wrote", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const result = await ensureTaskRegistry(target);
  const expected = formatJson({ schema_version: "temple.tasks/v1", tasks: [] });
  assert.equal(result.created, true);
  assert.equal(result.afterHash, sha256(expected));
  assert.equal(await fs.readFile(result.path, "utf8"), expected);
});

test("init prints copyable direct commands that survive shell-sensitive paths", async (context) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-command-test-"));
  const target = path.join(temporaryRoot, "sample product's repo");
  const configPath = path.join(temporaryRoot, "init config.json");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await fs.writeFile(configPath, `${JSON.stringify(configDocument(), null, 2)}\n`);

  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  const doctorCommand = [process.execPath, cli, "doctor", target].map(shellQuote).join(" ");
  const statusCommand = [process.execPath, cli, "status", target].map(shellQuote).join(" ");
  assert.match(initialized.stdout, new RegExp(`Doctor: ${doctorCommand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(initialized.stdout, new RegExp(`Status: ${statusCommand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));

  const copiedDoctor = spawnSync("/bin/sh", ["-c", doctorCommand], { encoding: "utf8" });
  assert.equal(copiedDoctor.status, 0, copiedDoctor.stderr || copiedDoctor.stdout);
  const copiedStatus = spawnSync("/bin/sh", ["-c", `${statusCommand} --json --no-write`], { encoding: "utf8" });
  assert.equal(copiedStatus.status, 0, copiedStatus.stderr || copiedStatus.stdout);
  assert.equal(JSON.parse(copiedStatus.stdout).project.id, "sample-product");
});

test("init, doctor, status, and idempotent re-init succeed", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));

  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  const lock = JSON.parse(await fs.readFile(path.join(target, "temple.lock"), "utf8"));
  assert.equal(lock.project_id, "sample-product");
  assert.ok(lock.managed_files.length > 10);
  assert.equal(lock.boundaries.managed_files_authoritative, true);
  assert.equal(lock.boundaries.ownership_precedence, "exact managed_files entry, otherwise project-owned");
  assert.ok(!("managed" in lock.boundaries));
  assert.equal(lock.capabilities.engineering_learning, true);
  assert.ok(!lock.managed_files.some((entry) => entry.path === ".ai-org/learning/index.json"));

  const agents = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/agents.json"), "utf8"));
  assert.equal(agents.agents.length, 5);
  assert.equal(agents.agents[0].display_name, "Fixture Rowan");
  const tasks = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/tasks.json"), "utf8"));
  assert.deepEqual(tasks.tasks, []);
  const learning = JSON.parse(await fs.readFile(path.join(target, ".ai-org/learning/index.json"), "utf8"));
  assert.deepEqual(learning.entries, []);

  const doctor = run(["doctor", target, "--json"]);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  assert.equal(JSON.parse(doctor.stdout).summary.fail, 0);

  const status = run(["status", target, "--json"]);
  assert.equal(status.status, 0, status.stderr);
  assert.equal(JSON.parse(status.stdout).assignments.length, 9);
  assert.equal(JSON.parse(status.stdout).schema_version, "temple.status/v2");
  assert.equal(JSON.parse(status.stdout).learning.total, 0);
  const statusView = await fs.readFile(path.join(target, ".ai-org/views/status.md"), "utf8");
  assert.match(statusView, /^# Sample Product — AI development organization status/m);
  assert.match(statusView, /Independent QA/);
  assert.doesNotMatch(statusView, /Temple status/);
  assert.match(statusView, /Engineering learning: 0 Lessons, 0 Practices/);

  const secondInit = run(["init", target, "--config", configPath]);
  assert.equal(secondInit.status, 0, secondInit.stderr || secondInit.stdout);
  assert.match(secondInit.stdout, /skip-identical/);
});

test("engineering learning is indexed, observable, project-owned, and consistency-checked", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["init", target, "--config", configPath]).status, 0);

  const recordPath = path.join(target, ".ai-org/learning/lessons/LESSON-0001.md");
  const indexPath = path.join(target, ".ai-org/learning/index.json");
  const record = "# Runtime evidence\n\nEvidence must identify the tested revision.\n";
  const index = {
    schema_version: "ai-org.learning-index/v1",
    entries: [
      {
        id: "LESSON-0001",
        kind: "lesson",
        title: "Keep runtime evidence revision-specific",
        summary: "Runtime evidence is trustworthy only when its tested revision is recorded.",
        status: "candidate",
        confidence: "medium",
        tags: ["verification", "revision"],
        applies_to: ["release-gate", "independent-qa"],
        source_work_items: ["WI-0001"],
        path: ".ai-org/learning/lessons/LESSON-0001.md",
        updated_at: "2026-08-29",
        last_validated_at: null,
        promotion: { target: "none", status: "none", reference: null }
      }
    ]
  };
  await fs.mkdir(path.dirname(recordPath), { recursive: true });
  await fs.writeFile(recordPath, record);
  await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);

  const doctor = run(["doctor", target, "--json"]);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  const learningCheck = JSON.parse(doctor.stdout).checks.find((check) => check.id === "engineering_learning");
  assert.equal(learningCheck.status, "pass");
  assert.match(learningCheck.message, /1 Lessons and 0 Practices/);

  const status = run(["status", target, "--json", "--no-write"]);
  assert.equal(status.status, 0, status.stderr || status.stdout);
  assert.deepEqual(
    { total: JSON.parse(status.stdout).learning.total, candidates: JSON.parse(status.stdout).learning.candidates },
    { total: 1, candidates: 1 }
  );

  index.entries[0].status = "active";
  await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  const invalidState = run(["doctor", target]);
  assert.equal(invalidState.status, 1);
  assert.match(invalidState.stdout, /status is invalid for lesson/);
  index.entries[0].status = "candidate";
  await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);

  const reinitialized = run(["init", target, "--config", configPath]);
  assert.equal(reinitialized.status, 0, reinitialized.stderr || reinitialized.stdout);
  assert.deepEqual(JSON.parse(await fs.readFile(indexPath, "utf8")), index);
  assert.equal(await fs.readFile(recordPath, "utf8"), record);
  const lockPath = path.join(target, "temple.lock");
  const lock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  assert.ok(!lock.managed_files.some((entry) => entry.path === ".ai-org/learning/index.json"));

  lock.template.version = "0.1.0-alpha.9";
  delete lock.capabilities.engineering_learning;
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 0, upgraded.stderr || upgraded.stdout);
  assert.deepEqual(JSON.parse(await fs.readFile(indexPath, "utf8")), index);
  assert.equal(await fs.readFile(recordPath, "utf8"), record);
  assert.ok(
    !JSON.parse(await fs.readFile(lockPath, "utf8")).managed_files.some(
      (entry) => entry.path === ".ai-org/learning/index.json"
    )
  );

  const orphanPath = path.join(target, ".ai-org/learning/practices/PRACTICE-0002.md");
  await fs.mkdir(path.dirname(orphanPath), { recursive: true });
  await fs.writeFile(orphanPath, "# Unindexed practice\n");
  const orphaned = run(["doctor", target]);
  assert.equal(orphaned.status, 1);
  assert.match(orphaned.stdout, /unindexed records: \.ai-org\/learning\/practices\/PRACTICE-0002\.md/);
  await fs.rm(orphanPath);

  await fs.rm(recordPath);
  const inconsistent = run(["doctor", target]);
  assert.equal(inconsistent.status, 1);
  assert.match(inconsistent.stdout, /missing records: \.ai-org\/learning\/lessons\/LESSON-0001\.md/);
});

test("upgrade adds a missing project-owned learning index without managing it", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["init", target, "--config", configPath]).status, 0);

  const indexPath = path.join(target, ".ai-org/learning/index.json");
  const lockPath = path.join(target, "temple.lock");
  await fs.rm(indexPath);
  const lock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  lock.template.version = "0.1.0-alpha.9";
  delete lock.capabilities.engineering_learning;
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const dryRun = run(["upgrade", target, "--dry-run"]);
  assert.equal(dryRun.status, 0, dryRun.stderr || dryRun.stdout);
  assert.match(dryRun.stdout, /create-learning-index: 1/);
  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 0, upgraded.stderr || upgraded.stdout);
  assert.deepEqual(JSON.parse(await fs.readFile(indexPath, "utf8")), {
    schema_version: "ai-org.learning-index/v1",
    entries: []
  });
  const upgradedLock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  assert.equal(upgradedLock.template.version, "0.1.0-alpha.10");
  assert.equal(upgradedLock.capabilities.engineering_learning, true);
  assert.ok(!upgradedLock.managed_files.some((entry) => entry.path === ".ai-org/learning/index.json"));
});

test("init refuses to adopt an identical untracked managed destination", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const relativePath = ".agents/skills/domain-modeling/SKILL.md";
  const destinationPath = path.join(target, relativePath);
  const original = await fs.readFile(path.join(root, "project-overlay", relativePath), "utf8");
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.writeFile(destinationPath, original);

  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 1);
  assert.match(initialized.stdout, /untracked file blocks new managed path/);
  assert.equal(await fs.readFile(destinationPath, "utf8"), original);
  await assert.rejects(() => fs.access(path.join(target, "temple.lock")));
});

test("executeInit never overwrites a project file created after planning", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const plan = await planInit(target, configDocument());
  const relativePath = ".agents/skills/decision-interview/SKILL.md";
  const destinationPath = path.join(target, relativePath);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.writeFile(destinationPath, "project-owned race winner\n");

  await assert.rejects(() => executeInit(plan), (error) => error.code === "EEXIST");
  assert.equal(await fs.readFile(destinationPath, "utf8"), "project-owned race winner\n");
  await assert.rejects(() => fs.access(path.join(target, "temple.lock")));
});

test("executeInit rolls back earlier files when a later path appears after planning", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const plan = await planInit(target, configDocument());
  const copyActions = plan.actions.filter((action) => action.type === "copy");
  const firstPath = path.join(target, copyActions[0].path);
  const racePath = path.join(target, copyActions.at(-1).path);
  await fs.mkdir(path.dirname(racePath), { recursive: true });
  await fs.writeFile(racePath, "late project-owned file\n");

  await assert.rejects(() => executeInit(plan), (error) => error.code === "EEXIST");
  await assert.rejects(() => fs.access(firstPath));
  assert.equal(await fs.readFile(racePath, "utf8"), "late project-owned file\n");
  await assert.rejects(() => fs.access(path.join(target, "temple.lock")));
});

test("a unique project Skill survives re-init and upgrade without entering the managed lock", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["init", target, "--config", configPath]).status, 0);
  const relativePath = ".agents/skills/project-helper/SKILL.md";
  const skillPath = path.join(target, relativePath);
  const content = "---\nname: project-helper\ndescription: Project-owned fixture Skill.\n---\n\nPreserve this file.\n";
  await fs.mkdir(path.dirname(skillPath), { recursive: true });
  await fs.writeFile(skillPath, content);

  const reinitialized = run(["init", target, "--config", configPath]);
  assert.equal(reinitialized.status, 0, reinitialized.stderr || reinitialized.stdout);
  const lockPath = path.join(target, "temple.lock");
  const previousLock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  previousLock.template.version = "0.1.0-alpha.7";
  await fs.writeFile(lockPath, `${JSON.stringify(previousLock, null, 2)}\n`);
  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 0, upgraded.stderr || upgraded.stdout);
  assert.equal(await fs.readFile(skillPath, "utf8"), content);
  const lock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  assert.ok(!lock.managed_files.some((entry) => entry.path === relativePath));
  assert.equal(run(["doctor", target]).status, 0);
});

test("existing AGENTS.md is preserved until explicit integration", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await fs.cp(path.join(root, "examples/sample-project"), target, { recursive: true });
  const original = await fs.readFile(path.join(target, "AGENTS.md"), "utf8");

  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  assert.equal(await fs.readFile(path.join(target, "AGENTS.md"), "utf8"), original);
  assert.match(initialized.stdout, /pending_merge/);

  const integrated = run(["init", target, "--config", configPath, "--integrate-agents"]);
  assert.equal(integrated.status, 0, integrated.stderr || integrated.stdout);
  const updated = await fs.readFile(path.join(target, "AGENTS.md"), "utf8");
  assert.ok(updated.startsWith(original.trimEnd()));
  assert.match(updated, /temple:instructions:start/);
});

test("managed conflicts stop without overwriting", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["init", target, "--config", configPath]).status, 0);
  const managedPath = path.join(target, ".ai-org/core/policies.json");
  await fs.appendFile(managedPath, "\nchanged by project\n");

  const reinit = run(["init", target, "--config", configPath]);
  assert.equal(reinit.status, 1);
  assert.match(reinit.stdout, /managed file has different content/);
  assert.match(await fs.readFile(managedPath, "utf8"), /changed by project/);

  const doctor = run(["doctor", target]);
  assert.equal(doctor.status, 1);
  assert.match(doctor.stdout, /\[FAIL\] managed_files/);
});

test("doctor rejects an invalid canonical work item", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["init", target, "--config", configPath]).status, 0);
  await fs.writeFile(
    path.join(target, ".ai-org/work-items/WI-0001.json"),
    `${JSON.stringify({ schema_version: "temple.work-item/v1", id: "WI-0001", state: "made-up" })}\n`
  );

  const doctor = run(["doctor", target]);
  assert.equal(doctor.status, 1);
  assert.match(doctor.stdout, /\[FAIL\] work_items/);
});

test("the distributable project overlay contains no project identities", async () => {
  await assert.rejects(() => fs.access(path.join(root, "project-overlay/.ai-org/project/agents.json")));
  await assert.rejects(() => fs.access(path.join(root, "project-overlay/.ai-org/project/assignments.json")));
});
