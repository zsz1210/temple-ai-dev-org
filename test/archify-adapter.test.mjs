import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { installArchifyAdapter, inspectArchifyAdapter } from "../src/archify-adapter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

async function projectFixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-archify-test-"));
  const target = path.join(temporaryRoot, "adapter-product");
  const configPath = path.join(temporaryRoot, "init.json");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await fs.writeFile(configPath, `${JSON.stringify({ schema_version: "temple.init/v1", project: { id: "adapter-product", name: "Adapter Product" }, naming_mode: "manual", agents: [
    { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
    { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
    { display_name: "Fixture Ellis", positions: ["tech_lead"] },
    { display_name: "Fixture Devon", positions: ["developer"] },
    { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
  ] }, null, 2)}\n`);
  assert.equal(run(["init", target, "--config", configPath]).status, 0);
  return { temporaryRoot, target };
}

async function fakeArchifySource(temporaryRoot) {
  const source = path.join(temporaryRoot, "archify-source");
  await fs.mkdir(path.join(source, "archify/bin"), { recursive: true });
  await fs.mkdir(path.join(source, "archify/schemas"), { recursive: true });
  await fs.writeFile(path.join(source, "LICENSE"), "MIT License\n\nCopyright test fixture\n");
  await fs.writeFile(path.join(source, "archify/SKILL.md"), "---\nname: archify\ndescription: Test fixture.\n---\n");
  await fs.writeFile(path.join(source, "archify/bin/archify.mjs"), "console.log('fixture archify');\n");
  await fs.writeFile(path.join(source, "archify/schemas/architecture.schema.json"), "{}\n");
  const git = (args) => spawnSync("git", ["-C", source, ...args], { encoding: "utf8" });
  assert.equal(git(["init", "-q"]).status, 0);
  assert.equal(git(["config", "user.email", "fixture@example.invalid"]).status, 0);
  assert.equal(git(["config", "user.name", "Fixture"]).status, 0);
  assert.equal(git(["add", "."]).status, 0);
  assert.equal(git(["commit", "-qm", "fixture"]).status, 0);
  return { source, revision: git(["rev-parse", "HEAD"]).stdout.trim() };
}

test("Archify status degrades safely when the opt-in adapter is absent", async (context) => {
  const { target } = await projectFixture(context);
  const status = run(["adapter", "archify-status", target, "--json"]);
  assert.equal(status.status, 0, status.stderr || status.stdout);
  assert.deepEqual(JSON.parse(status.stdout), {
    schema_version: "temple.archify-adapter-status/v1",
    status: "not_installed",
    usable: false,
    reason: "optional adapter is not installed",
    external_action_performed: false
  });
});

test("isolated Archify installation records exact provenance and file digests", async (context) => {
  const { temporaryRoot, target } = await projectFixture(context);
  const { source, revision } = await fakeArchifySource(temporaryRoot);
  const contract = { tag: "v-test", commit: revision, repository: "fixture/archify", license: "MIT" };
  const installed = await installArchifyAdapter(target, source, { contract });
  assert.equal(installed.provenance.commit, revision);
  assert.equal(installed.provenance.license, "MIT");
  assert.ok(installed.files.some((entry) => entry.path.endsWith("archify/bin/archify.mjs")));
  assert.ok(installed.files.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)));
  const inspected = await inspectArchifyAdapter(target, { contract });
  assert.equal(inspected.status, "installed");
  assert.equal(inspected.usable, true);
  assert.equal(inspected.external_action_performed, false);

  const installedFile = path.join(target, ".ai-org/adapters/archify/v-test/archify/bin/archify.mjs");
  await fs.appendFile(installedFile, "// drift\n");
  const drifted = await inspectArchifyAdapter(target, { contract });
  assert.equal(drifted.status, "invalid");
  assert.match(drifted.reason, /digest mismatch/);
});

test("Archify rejects a dirty pinned checkout and detects unrecorded installed files", async (context) => {
  const { temporaryRoot, target } = await projectFixture(context);
  const { source, revision } = await fakeArchifySource(temporaryRoot);
  const contract = { tag: "v-test", commit: revision, repository: "fixture/archify", license: "MIT" };

  await fs.appendFile(path.join(source, "archify/SKILL.md"), "\nUncommitted drift.\n");
  await assert.rejects(
    installArchifyAdapter(target, source, { contract }),
    /working tree is not clean/
  );

  spawnSync("git", ["-C", source, "restore", "archify/SKILL.md"], { encoding: "utf8" });
  await installArchifyAdapter(target, source, { contract });
  await fs.writeFile(path.join(target, ".ai-org/adapters/archify/v-test/archify/unrecorded.txt"), "unexpected\n");
  const inspected = await inspectArchifyAdapter(target, { contract });
  assert.equal(inspected.status, "invalid");
  assert.match(inspected.reason, /unrecorded or missing files/);
});
