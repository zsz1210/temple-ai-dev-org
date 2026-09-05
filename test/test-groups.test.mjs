import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { testInventory, groupFor, fastFiles, selectChangedTests, changedPaths } from "../scripts/test-groups.mjs";

test("every discovered test belongs to exactly one group; new tests default to core", async () => {
  const inventory = await testInventory();
  assert.ok(inventory.length > 0);
  assert.equal(new Set(inventory).size, inventory.length);
  const combined = ["core", "optional", "experiments"].flatMap((group) => inventory.filter((file) => groupFor(file) === group));
  assert.deepEqual(combined.sort(), inventory);
  assert.equal(groupFor("test/new.test.mjs"), "core");
  assert.ok(fastFiles.every((file) => inventory.includes(file)));
});

test("prose uses fast checks; changed tests include their entire group", async () => {
  const inventory = await testInventory();
  assert.deepEqual(selectChangedTests(["README.md", "docs/getting-started/testing.md"], inventory).files, [...fastFiles].sort());
  for (const file of ["test/context.test.mjs", "test/control-plane-live.test.mjs", "test/context-capsule-ablation.test.mjs"]) {
    const selection = selectChangedTests([file], inventory);
    assert.ok(inventory.filter((candidate) => groupFor(candidate) === groupFor(file)).every((candidate) => selection.files.includes(candidate)));
  }
});

test("unknown, shared, state, fixture and deleted test paths fail toward the full suite", async () => {
  const inventory = await testInventory();
  for (const paths of [[], ["src/evidence.mjs"], ["scripts/test-groups.mjs"], ["package.json"], [".ai-org/project/evidence.json"],
    ["test/fixtures/example.json"], ["test/deleted.test.mjs"], ["README.md", "unknown"], ["AGENTS.md"], ["docs/../src/a.md"]]) {
    assert.deepEqual(selectChangedTests(paths, inventory).files, inventory);
    assert.equal(selectChangedTests(paths, inventory).mode, "full");
  }
});

test("comparison includes committed, staged, unstaged, untracked and both rename paths", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-test-selection-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const git = (...args) => {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
  };
  git("init", "-q"); git("config", "user.name", "Test"); git("config", "user.email", "test@example.invalid");
  for (const file of ["committed", "staged", "unstaged", "old name"]) await fs.writeFile(path.join(root, file), file);
  git("add", "."); git("commit", "-qm", "base"); const base = git("rev-parse", "HEAD");
  await fs.writeFile(path.join(root, "committed"), "new"); git("add", "."); git("commit", "-qm", "change");
  await fs.writeFile(path.join(root, "staged"), "new"); git("add", "staged");
  await fs.writeFile(path.join(root, "unstaged"), "new"); await fs.writeFile(path.join(root, "untracked"), "new");
  git("mv", "old name", "new name");
  assert.deepEqual(changedPaths(root, base).sort(), ["committed", "new name", "old name", "staged", "unstaged", "untracked"].sort());
  assert.throws(() => changedPaths(root, "missing-ref"));
  assert.throws(() => changedPaths(root));
});
