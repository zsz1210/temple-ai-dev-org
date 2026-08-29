import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

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

test("version is available without dependencies", () => {
  const result = run(["--version"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^0\.1\.0-alpha\.5/m);
});

test("dry-run writes nothing", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const result = run(["init", target, "--config", configPath, "--dry-run"]);
  assert.equal(result.status, 0, result.stderr);
  await assert.rejects(() => fs.access(path.join(target, "temple.lock")));
});

test("init, doctor, status, and idempotent re-init succeed", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));

  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  const lock = JSON.parse(await fs.readFile(path.join(target, "temple.lock"), "utf8"));
  assert.equal(lock.project_id, "sample-product");
  assert.ok(lock.managed_files.length > 10);

  const agents = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/agents.json"), "utf8"));
  assert.equal(agents.agents.length, 5);
  assert.equal(agents.agents[0].display_name, "Fixture Rowan");
  const tasks = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/tasks.json"), "utf8"));
  assert.deepEqual(tasks.tasks, []);

  const doctor = run(["doctor", target, "--json"]);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  assert.equal(JSON.parse(doctor.stdout).summary.fail, 0);

  const status = run(["status", target, "--json"]);
  assert.equal(status.status, 0, status.stderr);
  assert.equal(JSON.parse(status.stdout).assignments.length, 9);
  assert.equal(JSON.parse(status.stdout).schema_version, "temple.status/v2");
  const statusView = await fs.readFile(path.join(target, ".ai-org/views/status.md"), "utf8");
  assert.match(statusView, /^# Sample Product — AI development organization status/m);
  assert.match(statusView, /Independent QA/);
  assert.doesNotMatch(statusView, /Temple status/);

  const secondInit = run(["init", target, "--config", configPath]);
  assert.equal(secondInit.status, 0, secondInit.stderr || secondInit.stdout);
  assert.match(secondInit.stdout, /skip-identical/);
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
