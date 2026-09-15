import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { cli } from "./helpers/lean-delivery-fixture.mjs";
import { privateViewerSnapshot } from "../src/control-plane-server.mjs";

test("V06/V07/V09 CLI reports reusable checks, actual execution and failures without stranded required status", async t => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "temple-field-cli-"));
  t.after(() => fs.rm(target, { recursive: true, force: true }));
  await fs.writeFile(path.join(target, "input.txt"), "one");
  await fs.writeFile(path.join(target, "check.mjs"), 'import fs from "node:fs"; const n=fs.existsSync("count.txt")?Number(fs.readFileSync("count.txt")):0; fs.writeFileSync("count.txt",String(n+1));\n');
  const plan = { schema_version: "temple.measurement-plan/v1", check_policy: "trusted-local",
    command: { executable: process.execPath, args: ["check.mjs"], cwd: "." },
    inputs: { files: ["input.txt"], directories: [], tests: ["check.mjs"], fixtures: [], dependencies: [] },
    toolchain: { identity: process.version, files: [] }, environment: { identity: "synthetic-fixture", names: [] },
    timeout_ms: 3000, output_limit_bytes: 32768, outputs: ["count.txt"] };
  const config = path.join(target, "measurement.json"); await fs.writeFile(config, JSON.stringify(plan));
  const run = extra => cli(["measurement", "run", target, "--config", config, "--json", ...extra], { allowFailure: true });
  const rejected = run(["--dry-run"]);
  assert.equal(rejected.status, 1); assert.equal(JSON.parse(rejected.stdout).mutation_status, "not_started");
  assert.equal(await fs.stat(path.join(target, "count.txt")).catch(() => null), null);
  const first = run([]); assert.equal(first.status, 0, first.stdout || first.stderr);
  assert.equal(JSON.parse(first.stdout).execution_started, true);
  const reused = run([]); assert.equal(reused.status, 0, reused.stdout || reused.stderr);
  const result = JSON.parse(reused.stdout);
  assert.equal(result.cache_status, "hit"); assert.equal(result.execution_started, false); assert.equal(result.acceptance_granted, false);
  assert.equal(await fs.readFile(path.join(target, "count.txt"), "utf8"), "1");
  await fs.writeFile(path.join(target, "input.txt"), "two");
  const changed = run([]); assert.equal(changed.status, 0, changed.stdout || changed.stderr);
  assert.equal(JSON.parse(changed.stdout).cache_status, "miss");
  assert.equal(await fs.readFile(path.join(target, "count.txt"), "utf8"), "2");
  await fs.writeFile(path.join(target, "check.mjs"), "process.exit(7);\n");
  const failed = run([]); assert.equal(failed.status, 1);
  assert.equal(JSON.parse(failed.stdout).successful, false);
});

test("V08 diagnostic detail preserves private-view Principal and condition redaction", () => {
  const item = { id: "WI-0001", delivery_attention: { state: "awaiting-environment",
    owner: { position_id: "independent_qa", agent_id: "agent-review", principal_id: "principal-private", source: "active-claim" },
    missing_conditions: [{ kind: "environment", description: "private device condition", owner: { principal_id: "principal-private" } }], next_action: "private action" } };
  const snapshot = { observer: { work: { items: [item] } }, live_observer: { work: { items: [item] } } };
  const result = privateViewerSnapshot(snapshot, { login: "viewer" });
  const bytes = JSON.stringify(result);
  assert.ok(!bytes.includes("principal-private")); assert.ok(!bytes.includes("private device condition"));
  assert.equal(result.live_observer.work.items[0].delivery_attention.state, "awaiting-environment");
  assert.equal(snapshot.observer.work.items[0].delivery_attention.owner.principal_id, "principal-private");
});
