import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { executeUpgrade, planUpgrade } from "../src/upgrade.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function configDocument() {
  return {
    schema_version: "temple.init/v1",
    project: { id: "workflow-product", name: "Workflow Product" },
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
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-workflow-test-"));
  const target = path.join(temporaryRoot, "workflow-product");
  const configPath = path.join(temporaryRoot, "init.json");
  await fs.writeFile(configPath, `${JSON.stringify(configDocument(), null, 2)}\n`);
  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  return { temporaryRoot, target, configPath };
}

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function runAsync(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args]);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

async function readJson(targetPath) {
  return JSON.parse(await fs.readFile(targetPath, "utf8"));
}

test("work item lifecycle, handoff, task registry, close, and observer status work together", async (context) => {
  const { temporaryRoot, target, configPath } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));

  const created = run([
    "work-item",
    "create",
    target,
    "--title",
    "Prove the lifecycle",
    "--scope",
    "Local fixture only",
    "--acceptance",
    "Every gate is evidence-backed"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  assert.match(created.stdout, /WI-0001 · Engineering Manager · Fixture Rowan/);

  const transitions = [
    ["spec", ["work_order=docs/work-order.md"]],
    ["design", ["approved_scope=docs/spec.md", "acceptance_criteria=docs/spec.md"]],
    ["build", ["technical_design=docs/design.md", "risk_review=docs/design.md"]]
  ];
  for (const [state, requirements] of transitions) {
    const args = ["transition", target, "--work-item", "WI-0001", "--to", state];
    for (const requirement of requirements) args.push("--satisfy", requirement);
    const transitioned = run(args);
    assert.equal(transitioned.status, 0, transitioned.stderr || transitioned.stdout);
  }

  const registered = run([
    "task",
    "register",
    target,
    "--work-item",
    "WI-0001",
    "--position",
    "developer",
    "--thread-id",
    "thread-fixture-developer",
    "--host-id",
    "local",
    "--revision",
    "design-revision"
  ]);
  assert.equal(registered.status, 0, registered.stderr || registered.stdout);
  assert.match(registered.stdout, /WI-0001 · Developer · Fixture Devon/);

  const handoff = run([
    "handoff",
    target,
    "--work-item",
    "WI-0001",
    "--to",
    "quality_evaluator",
    "--input-revision",
    "candidate-123",
    "--completed",
    "Implemented accepted scope",
    "--evidence",
    "artifacts/developer-test.md"
  ]);
  assert.equal(handoff.status, 0, handoff.stderr || handoff.stdout);
  const candidateStatus = run(["status", target, "--json", "--no-write"]);
  assert.equal(candidateStatus.status, 0, candidateStatus.stderr || candidateStatus.stdout);
  assert.equal(JSON.parse(candidateStatus.stdout).work_items.items[0].latest_revision, "candidate-123");

  const laterTransitions = [
    ["test", []],
    ["eval", ["test_evidence=artifacts/test.md"]],
    ["independent_qa", ["evaluation_report=artifacts/evaluation.md"]],
    ["release_gate", ["independent_qa_pass=artifacts/qa.md"]]
  ];
  for (const [state, requirements] of laterTransitions) {
    const args = ["transition", target, "--work-item", "WI-0001", "--to", state];
    for (const requirement of requirements) args.push("--satisfy", requirement);
    const transitioned = run(args);
    assert.equal(transitioned.status, 0, transitioned.stderr || transitioned.stdout);
  }

  const closed = run([
    "close",
    target,
    "--work-item",
    "WI-0001",
    "--decision",
    "go",
    "--tested-revision",
    "candidate-123",
    "--approval",
    "not-required",
    "--rollback",
    "git revert the closeout commit",
    "--satisfy",
    "accepted_scope=docs/spec.md",
    "--satisfy",
    "independent_qa_report=artifacts/qa.md"
  ]);
  assert.equal(closed.status, 0, closed.stderr || closed.stdout);
  assert.match(closed.stdout, /External release: not performed/);

  const completed = run([
    "task",
    "update",
    target,
    "--task-id",
    "task-0001",
    "--status",
    "completed",
    "--revision",
    "candidate-123"
  ]);
  assert.equal(completed.status, 0, completed.stderr || completed.stdout);

  const taskList = run(["task", "list", target, "--json"]);
  assert.equal(taskList.status, 0, taskList.stderr || taskList.stdout);
  assert.equal(JSON.parse(taskList.stdout)[0].archive_ready, true);

  const item = await readJson(path.join(target, ".ai-org/work-items/WI-0001.json"));
  assert.equal(item.state, "done");
  assert.equal(item.release_gate_result, "go");
  assert.equal(item.developer_candidate_revision, "candidate-123");
  assert.ok(item.evidence.includes(".ai-org/artifacts/WI-0001/release-record.md"));
  const releaseRecord = await fs.readFile(path.join(target, ".ai-org/artifacts/WI-0001/release-record.md"), "utf8");
  assert.match(releaseRecord, /accepted_scope:/);
  assert.match(releaseRecord, /required_human_approval:/);
  assert.doesNotMatch(releaseRecord, /\bTemple\b/);

  const registry = await readJson(path.join(target, ".ai-org/project/tasks.json"));
  assert.equal(registry.tasks[0].registered_by, "agent-fixture-rowan");
  assert.equal(registry.tasks[0].last_updated_by, "agent-fixture-devon");

  const status = run(["status", target, "--json", "--no-write"]);
  assert.equal(status.status, 0, status.stderr || status.stdout);
  const statusDocument = JSON.parse(status.stdout);
  assert.equal(statusDocument.work_items.by_state.done, 1);
  assert.equal(statusDocument.tasks.archive_ready, 1);
  assert.ok(statusDocument.attention.some((signal) => signal.type === "archive_ready"));

  const doctor = run(["doctor", target, "--json"]);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  assert.equal(JSON.parse(doctor.stdout).summary.fail, 0);

  const reinit = run(["init", target, "--config", configPath]);
  assert.equal(reinit.status, 0, reinit.stderr || reinit.stdout);
  assert.equal((await readJson(path.join(target, ".ai-org/project/tasks.json"))).tasks.length, 1);
});

test("unresolved items can be listed, resolved, merged, and deduplicated safely", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));

  const created = run([
    "work-item",
    "create",
    target,
    "--title",
    "Manage unresolved items",
    "--unresolved",
    "Simulator coverage is pending",
    "--unresolved",
    "API contract needs review"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);

  const listed = run(["work-item", "unresolved", target, "--work-item", "WI-0001", "--json"]);
  assert.equal(listed.status, 0, listed.stderr || listed.stdout);
  assert.deepEqual(JSON.parse(listed.stdout), {
    work_item_id: "WI-0001",
    unresolved: ["Simulator coverage is pending", "API contract needs review"]
  });

  const updated = run([
    "work-item",
    "unresolved",
    target,
    "--work-item",
    "WI-0001",
    "--resolve",
    "API contract needs review",
    "--merge",
    "Device coverage is pending",
    "--merge",
    " Device coverage is pending "
  ]);
  assert.equal(updated.status, 0, updated.stderr || updated.stdout);
  assert.match(updated.stdout, /Resolved: API contract needs review/);
  assert.match(updated.stdout, /Merged: Device coverage is pending/);
  const itemPath = path.join(target, ".ai-org/work-items/WI-0001.json");
  const item = await readJson(itemPath);
  assert.deepEqual(item.unresolved, ["Simulator coverage is pending", "Device coverage is pending"]);

  const beforeRejectedResolution = await fs.readFile(itemPath, "utf8");
  const rejected = run([
    "work-item",
    "unresolved",
    target,
    "--work-item",
    "WI-0001",
    "--resolve",
    "Unknown issue"
  ]);
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /Unresolved item not found on WI-0001: Unknown issue/);
  assert.equal(await fs.readFile(itemPath, "utf8"), beforeRejectedResolution);

  const idempotent = run([
    "work-item",
    "unresolved",
    target,
    "--work-item",
    "WI-0001",
    "--merge",
    "Device coverage is pending"
  ]);
  assert.equal(idempotent.status, 0, idempotent.stderr || idempotent.stdout);
  assert.match(idempotent.stdout, /Merged: none/);
  assert.match(idempotent.stdout, /Changed: no/);

  const overlapping = run([
    "work-item",
    "unresolved",
    target,
    "--work-item",
    "WI-0001",
    "--resolve",
    "Device coverage is pending",
    "--merge",
    "Device coverage is pending"
  ]);
  assert.equal(overlapping.status, 1);
  assert.match(overlapping.stderr, /Cannot resolve and merge the same unresolved item/);
  assert.equal(await fs.readFile(itemPath, "utf8"), beforeRejectedResolution);

  const events = (await fs.readFile(path.join(target, ".ai-org/events/events.jsonl"), "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(events.at(-1).event_type, "work_item_unresolved_updated");
  assert.deepEqual(events.at(-1).resolved, ["API contract needs review"]);
  assert.deepEqual(events.at(-1).merged, ["Device coverage is pending"]);

  await fs.writeFile(itemPath, `${JSON.stringify({ ...item, unresolved: "not-an-array" }, null, 2)}\n`);
  const malformedDoctor = run(["doctor", target]);
  assert.equal(malformedDoctor.status, 1);
  assert.match(malformedDoctor.stdout, /Invalid work item files: WI-0001.json/);
  const malformedList = run(["work-item", "unresolved", target, "--work-item", "WI-0001"]);
  assert.equal(malformedList.status, 1);
  assert.match(malformedList.stderr, /invalid unresolved items; expected an array of strings/);

  await fs.writeFile(itemPath, `${JSON.stringify({ ...item, unresolved: ["valid", { invalid: true }] }, null, 2)}\n`);
  const malformedElementDoctor = run(["doctor", target]);
  assert.equal(malformedElementDoctor.status, 1);
  assert.match(malformedElementDoctor.stdout, /Invalid work item files: WI-0001.json/);
  const malformedElementList = run(["work-item", "unresolved", target, "--work-item", "WI-0001"]);
  assert.equal(malformedElementList.status, 1);
  assert.match(malformedElementList.stderr, /invalid unresolved items; expected an array of strings/);
});

test("transition refuses missing named gate evidence without changing state", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["work-item", "create", target, "--title", "Guard the gate"]).status, 0);

  const rejected = run(["transition", target, "--work-item", "WI-0001", "--to", "spec"]);
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /missing gate evidence: work_order/);
  assert.equal((await readJson(path.join(target, ".ai-org/work-items/WI-0001.json"))).state, "intake");
});

test("upgrade migrates legacy identity and safely removes obsolete managed skills", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["work-item", "create", target, "--title", "Preserve me"]).status, 0);

  const installedTemple = path.join(target, "TEMPLE.md");
  const oldContent = "# Simulated alpha.3 managed contract\n";
  await fs.writeFile(installedTemple, oldContent);
  const obsoleteSkills = [
    ".agents/skills/temple-grill/SKILL.md",
    ".agents/skills/temple-grill-with-docs/SKILL.md",
    ".agents/skills/evidence-backed-decision-interview/SKILL.md"
  ];
  for (const relativePath of obsoleteSkills) {
    const absolutePath = path.join(target, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, `legacy managed skill: ${relativePath}\n`);
  }
  const lockPath = path.join(target, "temple.lock");
  const lock = await readJson(lockPath);
  lock.template.name = "@zsz1210/ai-development-org-template";
  lock.template.version = "0.1.0-alpha.3";
  lock.template.repository = "zsz1210/ai-development-org-template";
  lock.managed_files.find((entry) => entry.path === "TEMPLE.md").sha256 = crypto.createHash("sha256").update(oldContent).digest("hex");
  for (const relativePath of obsoleteSkills) {
    const content = await fs.readFile(path.join(target, relativePath));
    lock.managed_files.push({ path: relativePath, sha256: crypto.createHash("sha256").update(content).digest("hex") });
  }
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const dryRun = run(["upgrade", target, "--dry-run"]);
  assert.equal(dryRun.status, 0, dryRun.stderr || dryRun.stdout);
  assert.match(dryRun.stdout, /0\.1\.0-alpha\.3 -> 0\.1\.0-alpha\.9/);
  assert.match(dryRun.stdout, /remove-managed: 3/);
  assert.equal(await fs.readFile(installedTemple, "utf8"), oldContent);
  await fs.access(path.join(target, obsoleteSkills[0]));

  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 0, upgraded.stderr || upgraded.stdout);
  const upgradedLock = await fs.readFile(lockPath, "utf8");
  assert.equal(JSON.parse(upgradedLock).template.name, "@zsz1210/temple-ai-dev-org");
  assert.equal(JSON.parse(upgradedLock).template.version, "0.1.0-alpha.9");
  assert.match(await fs.readFile(installedTemple, "utf8"), /Project AI development organization operating contract/);
  assert.equal((await readJson(path.join(target, ".ai-org/work-items/WI-0001.json"))).title, "Preserve me");
  for (const relativePath of obsoleteSkills) {
    await assert.rejects(() => fs.access(path.join(target, relativePath)));
  }
  await fs.access(path.join(target, ".agents/skills/domain-modeling/SKILL.md"));

  const repeated = run(["upgrade", target]);
  assert.equal(repeated.status, 0, repeated.stderr || repeated.stdout);
  assert.match(repeated.stdout, /skip-current-lock/);
  assert.equal(await fs.readFile(lockPath, "utf8"), upgradedLock);
});

test("upgrade stops before overwriting a changed managed file", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const managedPath = path.join(target, "TEMPLE.md");
  await fs.appendFile(managedPath, "project mutation\n");
  const before = await fs.readFile(managedPath, "utf8");

  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 1);
  assert.match(upgraded.stdout, /managed file changed/);
  assert.equal(await fs.readFile(managedPath, "utf8"), before);
});

test("upgrade refuses to adopt an identical destination missing from managed_files", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const relativePath = ".agents/skills/domain-modeling/SKILL.md";
  const installedPath = path.join(target, relativePath);
  const installedContent = await fs.readFile(installedPath, "utf8");
  const lockPath = path.join(target, "temple.lock");
  const lock = await readJson(lockPath);
  lock.managed_files = lock.managed_files.filter((entry) => entry.path !== relativePath);
  const editedLock = `${JSON.stringify(lock, null, 2)}\n`;
  await fs.writeFile(lockPath, editedLock);

  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 1);
  assert.match(upgraded.stdout, /untracked file blocks new managed path/);
  assert.equal(await fs.readFile(installedPath, "utf8"), installedContent);
  assert.equal(await fs.readFile(lockPath, "utf8"), editedLock);
});

test("upgrade rolls back earlier updates when a later managed file changes", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const lockPath = path.join(target, "temple.lock");
  const lock = await readJson(lockPath);
  lock.template.version = "0.1.0-alpha.8";
  const candidatePaths = [".agents/skills/domain-modeling/SKILL.md", "TEMPLE.md"];
  const oldContents = new Map();
  for (const relativePath of candidatePaths) {
    const content = `old managed content for ${relativePath}\n`;
    oldContents.set(relativePath, content);
    await fs.writeFile(path.join(target, relativePath), content);
    lock.managed_files.find((entry) => entry.path === relativePath).sha256 = crypto
      .createHash("sha256")
      .update(content)
      .digest("hex");
  }
  const lockBefore = `${JSON.stringify(lock, null, 2)}\n`;
  await fs.writeFile(lockPath, lockBefore);
  const plan = await planUpgrade(target);
  const updates = plan.actions.filter((action) => action.type === "update-managed");
  assert.equal(updates.length, 2);
  const first = updates[0].path;
  const second = updates[1].path;
  await fs.writeFile(path.join(target, second), "late external managed edit\n");

  await assert.rejects(() => executeUpgrade(plan), /changed before update/);
  assert.equal(await fs.readFile(path.join(target, first), "utf8"), oldContents.get(first));
  assert.equal(await fs.readFile(path.join(target, second), "utf8"), "late external managed edit\n");
  assert.equal(await fs.readFile(lockPath, "utf8"), lockBefore);
});

test("upgrade rejects a managed path that escapes the project", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const outsidePath = path.join(temporaryRoot, "outside.txt");
  await fs.writeFile(outsidePath, "preserve me\n");

  const lockPath = path.join(target, "temple.lock");
  const lock = await readJson(lockPath);
  lock.managed_files.push({
    path: ".agents/skills/../../../outside.txt",
    sha256: crypto.createHash("sha256").update("preserve me\n").digest("hex")
  });
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 1);
  assert.match(upgraded.stdout, /invalid managed path in temple\.lock/);
  assert.equal(await fs.readFile(outsidePath, "utf8"), "preserve me\n");
});

test("parallel canonical mutations are serialized without losing task records", async (context) => {
  const { temporaryRoot, target } = await fixture();
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  assert.equal(run(["work-item", "create", target, "--title", "Concurrent registry"]).status, 0);

  const registrations = await Promise.all([
    runAsync([
      "task",
      "register",
      target,
      "--work-item",
      "WI-0001",
      "--position",
      "developer",
      "--thread-id",
      "parallel-developer"
    ]),
    runAsync([
      "task",
      "register",
      target,
      "--work-item",
      "WI-0001",
      "--position",
      "independent_qa",
      "--thread-id",
      "parallel-qa"
    ])
  ]);
  for (const registration of registrations) {
    assert.equal(registration.status, 0, registration.stderr || registration.stdout);
  }
  const registry = await readJson(path.join(target, ".ai-org/project/tasks.json"));
  assert.equal(registry.tasks.length, 2);
  assert.deepEqual(new Set(registry.tasks.map((task) => task.thread_id)), new Set(["parallel-developer", "parallel-qa"]));
});
