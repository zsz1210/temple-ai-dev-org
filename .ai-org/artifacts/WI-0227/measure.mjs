// Maintainer-local, generation-free reproduction. Requires baseline Git history.
// Run from repository root: node .ai-org/artifacts/WI-0227/measure.mjs
// Only the disposable fixture is mutated; no real project lock may be rewritten.
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { fixture, cli, deliveryArgs } from "../../../test/helpers/lean-delivery-fixture.mjs";
import { enterWorkItemContext, modelContextView } from "../../../src/context-enter.mjs";
import { sha256 } from "../../../src/files.mjs";

const baselineRevision = "34c4fb71";
const f = await fixture(), files = ["TEMPLE.md", "AGENTS.md"], current = {}, older = {};
const bytes = x => Buffer.byteLength(JSON.stringify(x, null, 2));
try {
  for (const file of files) {
    current[file] = await fs.readFile(path.join(f.target, file), "utf8");
    const git = spawnSync("git", ["show", `${baselineRevision}:project-overlay/${file}`], { encoding: "utf8" });
    assert.equal(git.status, 0, "required baseline history unavailable; do not substitute another baseline");
    older[file] = git.stdout;
  }
  const originalLock = JSON.parse(await fs.readFile(path.join(f.target, "temple.lock"), "utf8"));
  async function setInstructions(texts) {
    const lock = structuredClone(originalLock);
    for (const file of files) {
      await fs.writeFile(path.join(f.target, file), texts[file]);
      const row = lock.managed_files.find(r => r.path === file);
      if (row) row.sha256 = sha256(Buffer.from(texts[file]));
    }
    await fs.writeFile(path.join(f.target, "temple.lock"), JSON.stringify(lock, null, 2) + "\n");
  }
  for (const position of ["developer", "quality_evaluator"]) {
    if (position === "quality_evaluator") cli(deliveryArgs(f));
    const records = []; let baseline;
    for (const [variant, texts] of [["baseline", older], ["candidate", current]]) {
      await setInstructions(texts);
      const r = await enterWorkItemContext(f.target, { workItemId: f.item.id, position,
        agentId: position === "developer" ? f.request.agentId : f.qualityAgent, principalId: "human" });
      assert.equal(r.status, "eligible");
      if (!baseline) baseline = r;
      else {
        assert.deepEqual(r.packet.sources.map(s => s.path), baseline.packet.sources.map(s => s.path));
        for (const s of r.packet.sources.filter(s => ![...files, "temple.lock"].includes(s.path))) {
          assert.equal(s.body, baseline.packet.sources.find(p => p.path === s.path).body);
        }
      }
      records.push({ variant, full_bytes: bytes(r), model_bytes: bytes(modelContextView(r)),
        source_bytes: r.packet.measurements.emitted_source_bytes, source_count: r.packet.sources.length });
    }
    console.log(JSON.stringify({ position, records }, null, 2));
  }
  console.log(JSON.stringify({ baseline_revision: baselineRevision,
    instructions: files.map(file => ({ path: file, baseline_bytes: Buffer.byteLength(older[file]),
      candidate_bytes: Buffer.byteLength(current[file]), candidate_sha256: sha256(Buffer.from(current[file])) })) }));
} finally { await f.cleanup(); }
