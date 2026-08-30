import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runDoctor } from "../src/doctor.mjs";
import { formatJson, sha256 } from "../src/files.mjs";
import { executeInit, planInit } from "../src/install.mjs";
import { validateInitConfig } from "../src/model.mjs";
import {
  applyRestore,
  createBackup,
  inspectBackup,
  planRestore,
  recoverRestore,
  resolveRecoveryStateDirectory
} from "../src/recovery.mjs";
import { buildStatus, writeStatus } from "../src/status.mjs";
import { executeUpgrade, planUpgrade } from "../src/upgrade.mjs";

function configDocument(projectId = "recovery-fixture") {
  return {
    schema_version: "temple.init/v1",
    project: { id: projectId, name: "Recovery Fixture" },
    naming_mode: "ai-suggested",
    agents: [
      { display_name: "Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Ellis", positions: ["tech_lead"] },
      { display_name: "Devon", positions: ["developer"] },
      { display_name: "Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

async function fixture(projectId) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-recovery-test-"));
  const target = path.join(temporaryRoot, "project");
  const backup = path.join(temporaryRoot, "backup");
  const plan = await planInit(target, await validateInitConfig(configDocument(projectId)));
  assert.deepEqual(plan.conflicts, []);
  await executeInit(plan);
  return { temporaryRoot, target, backup };
}

test("backup includes only project-owned Temple state and verifies every payload", async (context) => {
  const state = await fixture("backup-boundary");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  await fs.mkdir(path.join(state.target, ".agents/skills/custom-review"), { recursive: true });
  await fs.writeFile(path.join(state.target, ".agents/skills/custom-review/SKILL.md"), "# Custom review\n");
  await fs.mkdir(path.join(state.target, ".ai-org/views"), { recursive: true });
  await fs.writeFile(path.join(state.target, ".ai-org/views/status.md"), "generated\n");
  await fs.mkdir(path.join(state.target, "src"), { recursive: true });
  await fs.writeFile(path.join(state.target, "src/app.mjs"), "export default true;\n");

  const targetAlias = path.join(state.temporaryRoot, "target-alias");
  await fs.symlink(state.target, targetAlias, "dir");
  await assert.rejects(
    () => createBackup(state.target, path.join(targetAlias, "nested-backup")),
    /outside the project worktree/
  );

  const created = await createBackup(state.target, state.backup);
  const inspected = await inspectBackup(state.backup);
  const paths = inspected.manifest.files.map((entry) => entry.path);
  assert.equal(created.content_digest, inspected.content_digest);
  assert.ok(paths.includes("temple.lock"));
  assert.ok(paths.includes("AGENTS.md"));
  assert.ok(paths.includes(".ai-org/project/project.json"));
  assert.ok(paths.includes(".agents/skills/custom-review/SKILL.md"));
  assert.ok(!paths.includes(".ai-org/views/status.md"));
  assert.ok(!paths.includes("src/app.mjs"));
  assert.ok(!paths.includes(".agents/skills/temple-work/SKILL.md"));

  const firstPayload = path.join(state.backup, "files", paths[0]);
  await fs.appendFile(firstPayload, "tampered");
  await assert.rejects(() => inspectBackup(state.backup), /size mismatch|checksum mismatch/);
});

test("inspection rejects structural, path, payload-set, link, and bound tampering", async (context) => {
  const state = await fixture("backup-adversarial");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  await createBackup(state.target, state.backup);
  let sequence = 0;
  async function cloneBackup() {
    sequence += 1;
    const clone = path.join(state.temporaryRoot, `backup-case-${sequence}`);
    await fs.cp(state.backup, clone, { recursive: true });
    return clone;
  }
  async function editManifest(backup, edit) {
    const manifestPath = path.join(backup, "manifest.json");
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    edit(manifest);
    await fs.writeFile(manifestPath, formatJson(manifest));
  }

  const unsupported = await cloneBackup();
  await editManifest(unsupported, (manifest) => { manifest.schema_version = "temple.backup-manifest/v999"; });
  await assert.rejects(() => inspectBackup(unsupported), /Unsupported backup manifest schema/);

  const traversal = await cloneBackup();
  await editManifest(traversal, (manifest) => { manifest.files[0].path = "../escape"; });
  await assert.rejects(() => inspectBackup(traversal), /Unsafe backup path/);

  const duplicate = await cloneBackup();
  await editManifest(duplicate, (manifest) => {
    manifest.files.splice(1, 0, { ...manifest.files[0] });
    manifest.content_digest = sha256(JSON.stringify(manifest.files));
  });
  await assert.rejects(() => inspectBackup(duplicate), /duplicate paths/);

  const unordered = await cloneBackup();
  await editManifest(unordered, (manifest) => {
    manifest.files.reverse();
    manifest.content_digest = sha256(JSON.stringify(manifest.files));
  });
  await assert.rejects(() => inspectBackup(unordered), /not sorted/);

  const missing = await cloneBackup();
  const missingManifest = JSON.parse(await fs.readFile(path.join(missing, "manifest.json"), "utf8"));
  await fs.unlink(path.join(missing, "files", missingManifest.files[0].path));
  await assert.rejects(() => inspectBackup(missing), /do not exactly match/);

  const extra = await cloneBackup();
  await fs.writeFile(path.join(extra, "files/extra.txt"), "extra\n");
  await assert.rejects(() => inspectBackup(extra), /do not exactly match/);

  const linked = await cloneBackup();
  const linkedManifest = JSON.parse(await fs.readFile(path.join(linked, "manifest.json"), "utf8"));
  const linkedPath = path.join(linked, "files", linkedManifest.files[0].path);
  await fs.unlink(linkedPath);
  await fs.symlink(path.join(state.target, "temple.lock"), linkedPath);
  await assert.rejects(() => inspectBackup(linked), /Symbolic links are not allowed/);

  const oversized = await cloneBackup();
  await editManifest(oversized, (manifest) => {
    manifest.files[0].size = 256 * 1024 * 1024 + 1;
    manifest.content_digest = sha256(JSON.stringify(manifest.files));
  });
  await assert.rejects(() => inspectBackup(oversized), /Invalid or oversized backup entry/);

  const rootExtra = await cloneBackup();
  await fs.writeFile(path.join(rootExtra, "notes.txt"), "not part of the format\n");
  await assert.rejects(() => inspectBackup(rootExtra), /must contain only/);
});

test("restore preview is stale-safe, requires replacement consent, and preserves target-only files", async (context) => {
  const state = await fixture("restore-contract");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  const projectPath = path.join(state.target, ".ai-org/project/project.json");
  const original = await fs.readFile(projectPath, "utf8");
  await createBackup(state.target, state.backup);
  await fs.writeFile(projectPath, original.replace("Recovery Fixture", "Changed once"));
  const extraPath = path.join(state.target, ".ai-org/learning/after-backup.md");
  await fs.writeFile(extraPath, "preserve me\n");

  const stalePlan = await planRestore(state.target, state.backup);
  assert.ok(stalePlan.actions.some((entry) => entry.path === ".ai-org/project/project.json" && entry.action === "replace"));
  assert.ok(stalePlan.extras.includes(".ai-org/learning/after-backup.md"));
  await fs.writeFile(projectPath, original.replace("Recovery Fixture", "Changed twice"));
  await assert.rejects(
    () => applyRestore(state.target, state.backup, { expectedPlan: stalePlan.plan_digest, allowReplace: true }),
    /preview is stale/
  );

  const freshPlan = await planRestore(state.target, state.backup);
  await assert.rejects(
    () => applyRestore(state.target, state.backup, { expectedPlan: freshPlan.plan_digest }),
    /pass --allow-replace/
  );
  const result = await applyRestore(state.target, state.backup, {
    expectedPlan: freshPlan.plan_digest,
    allowReplace: true
  });
  assert.equal(result.status, "completed");
  assert.equal(await fs.readFile(projectPath, "utf8"), original);
  assert.equal(await fs.readFile(extraPath, "utf8"), "preserve me\n");
  assert.equal((await recoverRestore(state.target)).status, "clean");
});

test("an interrupted restore rolls back from its external ledger", async (context) => {
  const state = await fixture("restore-recovery");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  const agentsPath = path.join(state.target, ".ai-org/project/agents.json");
  await createBackup(state.target, state.backup);
  const changed = `${await fs.readFile(agentsPath, "utf8")}\n`;
  await fs.writeFile(agentsPath, changed);
  const preview = await planRestore(state.target, state.backup);

  await assert.rejects(
    () =>
      applyRestore(state.target, state.backup, {
        expectedPlan: preview.plan_digest,
        allowReplace: true,
        simulateCrashAfterWrites: 1
      }),
    /Simulated restore interruption/
  );
  assert.ok(await fs.stat(path.join(resolveRecoveryStateDirectory(state.target), "active.json")));
  const recovered = await recoverRestore(state.target);
  assert.equal(recovered.status, "rolled_back");
  assert.equal(await fs.readFile(agentsPath, "utf8"), changed);
});

test("an ordinary mid-write failure rolls back immediately", async (context) => {
  const state = await fixture("restore-immediate-rollback");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  const agentsPath = path.join(state.target, ".ai-org/project/agents.json");
  await createBackup(state.target, state.backup);
  const changed = `${await fs.readFile(agentsPath, "utf8")}\n`;
  await fs.writeFile(agentsPath, changed);
  const preview = await planRestore(state.target, state.backup);

  await assert.rejects(
    () =>
      applyRestore(state.target, state.backup, {
        expectedPlan: preview.plan_digest,
        allowReplace: true,
        simulateFailureAfterWrites: 1
      }),
    /Simulated ordinary restore failure/
  );
  assert.equal(await fs.readFile(agentsPath, "utf8"), changed);
  assert.equal((await recoverRestore(state.target)).status, "clean");
});

test("recovery finalizes a durably completed restore instead of rolling it back", async (context) => {
  const state = await fixture("restore-commit-boundary");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  const agentsPath = path.join(state.target, ".ai-org/project/agents.json");
  const backupContent = await fs.readFile(agentsPath, "utf8");
  await createBackup(state.target, state.backup);
  await fs.appendFile(agentsPath, "\n");
  const preview = await planRestore(state.target, state.backup);

  await assert.rejects(
    () =>
      applyRestore(state.target, state.backup, {
        expectedPlan: preview.plan_digest,
        allowReplace: true,
        simulateCrashAfterCommit: true
      }),
    /after commit/
  );
  assert.equal(await fs.readFile(agentsPath, "utf8"), backupContent);
  const recovered = await recoverRestore(state.target);
  assert.equal(recovered.status, "completed");
  assert.equal(await fs.readFile(agentsPath, "utf8"), backupContent);
});

test("recovery refuses to overwrite a human change made after interruption", async (context) => {
  const state = await fixture("restore-human-change");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  const agentsPath = path.join(state.target, ".ai-org/project/agents.json");
  await createBackup(state.target, state.backup);
  await fs.appendFile(agentsPath, "\n");
  const preview = await planRestore(state.target, state.backup);
  await assert.rejects(
    () =>
      applyRestore(state.target, state.backup, {
        expectedPlan: preview.plan_digest,
        allowReplace: true,
        simulateCrashAfterWrites: 1
      }),
    /Simulated restore interruption/
  );
  await fs.writeFile(agentsPath, "human edit after interruption\n");
  await assert.rejects(() => recoverRestore(state.target), /preserve newer changes/);
  assert.equal(await fs.readFile(agentsPath, "utf8"), "human edit after interruption\n");
});

test("restore refuses project identity mismatches and backups from newer Temple versions", async (context) => {
  const source = await fixture("source-project");
  const target = await fixture("target-project");
  context.after(() => Promise.all([
    fs.rm(source.temporaryRoot, { recursive: true, force: true }),
    fs.rm(target.temporaryRoot, { recursive: true, force: true })
  ]));
  await createBackup(source.target, source.backup);
  const mismatch = await planRestore(target.target, source.backup);
  assert.ok(mismatch.conflicts.some((entry) => entry.includes("does not match")));

  const manifestPath = path.join(source.backup, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  manifest.temple.version = "99.0.0";
  const backupLockPath = path.join(source.backup, "files/temple.lock");
  const backupLock = JSON.parse(await fs.readFile(backupLockPath, "utf8"));
  backupLock.template.version = "99.0.0";
  const backupLockContent = formatJson(backupLock);
  await fs.writeFile(backupLockPath, backupLockContent);
  const lockEntry = manifest.files.find((entry) => entry.path === "temple.lock");
  lockEntry.size = Buffer.byteLength(backupLockContent);
  lockEntry.sha256 = sha256(backupLockContent);
  manifest.content_digest = sha256(JSON.stringify(manifest.files));
  await fs.writeFile(manifestPath, formatJson(manifest));
  const newer = await planRestore(source.target, source.backup);
  assert.ok(newer.conflicts.some((entry) => entry.includes("newer than this CLI")));
});

test("same-version backup restores into a separately initialized checkout and generated views rebuild", async (context) => {
  const source = await fixture("clean-restore");
  const target = await fixture("clean-restore");
  context.after(() => Promise.all([
    fs.rm(source.temporaryRoot, { recursive: true, force: true }),
    fs.rm(target.temporaryRoot, { recursive: true, force: true })
  ]));
  const sourceArtifact = path.join(source.target, ".ai-org/artifacts/data-bearing.md");
  await fs.mkdir(path.dirname(sourceArtifact), { recursive: true });
  await fs.writeFile(sourceArtifact, "data-bearing fixture\n");
  await createBackup(source.target, source.backup);

  const preview = await planRestore(target.target, source.backup);
  assert.deepEqual(preview.conflicts, []);
  const restored = await applyRestore(target.target, source.backup, {
    expectedPlan: preview.plan_digest,
    allowReplace: true
  });
  assert.equal(restored.upgrade_required, false);
  const inspected = await inspectBackup(source.backup);
  for (const entry of inspected.manifest.files) {
    assert.equal(sha256(await fs.readFile(path.join(target.target, entry.path))), entry.sha256);
  }
  await writeStatus(target.target, await buildStatus(target.target));
  const doctor = await runDoctor(target.target);
  assert.equal(doctor.healthy, true, JSON.stringify(doctor.checks.filter((check) => check.status !== "pass"), null, 2));
});

test("an internally consistent older backup restores with an upgrade-required result", async (context) => {
  const state = await fixture("older-restore");
  context.after(() => fs.rm(state.temporaryRoot, { recursive: true, force: true }));
  await createBackup(state.target, state.backup);
  const olderVersion = "0.1.0-alpha.23";
  const backupLockPath = path.join(state.backup, "files/temple.lock");
  const targetLockPath = path.join(state.target, "temple.lock");
  const olderLock = JSON.parse(await fs.readFile(backupLockPath, "utf8"));
  olderLock.template.version = olderVersion;
  olderLock.template.bootstrap.version = olderVersion;
  olderLock.template.bootstrap.package_spec = `@zsz1210/temple-ai-dev-org@${olderVersion}`;
  const olderLockContent = formatJson(olderLock);
  await fs.writeFile(backupLockPath, olderLockContent);
  await fs.writeFile(targetLockPath, olderLockContent);

  const manifestPath = path.join(state.backup, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  manifest.temple.version = olderVersion;
  const lockEntry = manifest.files.find((entry) => entry.path === "temple.lock");
  lockEntry.size = Buffer.byteLength(olderLockContent);
  lockEntry.sha256 = sha256(olderLockContent);
  manifest.content_digest = sha256(JSON.stringify(manifest.files));
  await fs.writeFile(manifestPath, formatJson(manifest));
  await fs.appendFile(path.join(state.target, ".ai-org/project/agents.json"), "\n");

  const preview = await planRestore(state.target, state.backup);
  assert.deepEqual(preview.conflicts, []);
  assert.equal(preview.compatibility.upgrade_required, true);
  const restored = await applyRestore(state.target, state.backup, {
    expectedPlan: preview.plan_digest,
    allowReplace: true
  });
  assert.equal(restored.upgrade_required, true);

  const upgrade = await planUpgrade(state.target);
  assert.deepEqual(upgrade.conflicts, []);
  const upgradedLock = await executeUpgrade(upgrade);
  assert.equal(upgradedLock.template.version, "0.1.0-alpha.25");
});
