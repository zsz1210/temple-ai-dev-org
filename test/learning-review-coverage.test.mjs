import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { recordLearningReview, queryLearningReviews, summarizeLearningReviews, validateLearningReview } from "../src/learning-review.mjs";
import { emptyLearningIndex } from "../src/learning.mjs";

const revision = "a".repeat(40);
const cli = fileURLToPath(new URL("../bin/temple.mjs", import.meta.url));
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-review-coverage-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  async function put(name, data) {
    await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await fs.writeFile(path.join(root, name), typeof data === "string" ? data : JSON.stringify(data));
  }
  const item = { schema_version: "temple.work-item/v1", id: "WI-0001", state: "done", scope: ["bounded"], acceptance_criteria: ["passes"], unresolved: [], tested_revision: revision, evidence: ["docs/result.md"], gate_evidence: {} };
  await put(".ai-org/work-items/WI-0001.json", item);
  await put(".ai-org/project/agents.json", { agents: [{ id: "agent-reviewer", active: true }] });
  await put(".ai-org/learning/index.json", emptyLearningIndex());
  await put("docs/result.md", "Observed result\n");
  await put("docs/review.md", "Reviewed this outcome; no recurring lesson.\n");
  const options = { workItemId: item.id, revision, result: "no-new-lesson", actor: "agent-reviewer", evidence: "docs/review.md", learningIds: [] };
  return { root, put, item, options, query: () => queryLearningReviews(root, { workItemId: item.id }) };
}

test("explicit review, idempotent retry, and stale evidence preserve history and existing state", async t => {
  const f = await fixture(t);
  const before = await fs.readFile(path.join(f.root, ".ai-org/work-items/WI-0001.json"));
  const index = await fs.readFile(path.join(f.root, ".ai-org/learning/index.json"));
  assert.equal((await f.query()).items[0].status, "not-reviewed");
  const first = await recordLearningReview(f.root, f.options);
  assert.equal(first.idempotent, false);
  assert.equal((await f.query()).items[0].status, "no-new-lesson");
  assert.equal((await recordLearningReview(f.root, f.options)).idempotent, true);
  await f.put("docs/result.md", "Updated observation\n");
  assert.equal((await f.query()).items[0].status, "review-required");
  const second = await recordLearningReview(f.root, f.options);
  assert.notEqual(first.path, second.path);
  assert.equal((await f.query()).items[0].status, "no-new-lesson");
  assert.deepEqual(await fs.readFile(path.join(f.root, ".ai-org/work-items/WI-0001.json")), before);
  assert.deepEqual(await fs.readFile(path.join(f.root, ".ai-org/learning/index.json")), index);
});

test("revision, activity, missing evidence and conflicts fail without replacing a review", async t => {
  const f = await fixture(t);
  await assert.rejects(recordLearningReview(f.root, { ...f.options, revision: "b".repeat(40) }), /revision/i);
  await recordLearningReview(f.root, f.options);
  await f.put("docs/review.md", "Different judgment\n");
  assert.equal((await f.query()).items[0].status, "review-required");
  await assert.rejects(recordLearningReview(f.root, f.options), /conflict/i);
  await fs.unlink(path.join(f.root, "docs/result.md"));
  assert.equal((await f.query()).items[0].status, "unknown");
  await f.put(".ai-org/work-items/WI-0001.json", { ...f.item, state: "build" });
  assert.equal((await f.query()).items[0].status, "not-eligible");
  await assert.rejects(recordLearningReview(f.root, f.options), /terminal/i);
});

test("Lesson linkage uses the existing index without promoting or changing its entries", async t => {
  const f = await fixture(t);
  const added = run(["learning", "add-lesson", f.root, "--title", "Bounded observation", "--summary", "One reviewed case", "--confidence", "low"]);
  assert.equal(added.status, 0, added.stderr);
  const indexPath = path.join(f.root, ".ai-org/learning/index.json");
  const before = await fs.readFile(indexPath);
  const options = { ...f.options, result: "linked-lessons", learningIds: ["LESSON-0001"] };
  const result = await recordLearningReview(f.root, options);
  assert.equal(validateLearningReview(result.record).valid, true);
  assert.deepEqual((await f.query()).items[0].lesson_ids, ["LESSON-0001"]);
  assert.equal((await f.query()).items[0].status, "linked-lessons");
  assert.deepEqual(await fs.readFile(indexPath), before);
  const document = JSON.parse(before);
  document.entries[0].status = "deprecated";
  await f.put(".ai-org/learning/index.json", document);
  assert.equal((await f.query()).items[0].status, "review-required");
  await f.put(".ai-org/learning/index.json", { schema_version: "ai-org.learning-index/v2", entries: [] });
  assert.equal((await f.query()).items[0].status, "unknown");
});

test("invalid judgments, unknown actors and unlinked IDs never create review storage", async t => {
  const f = await fixture(t);
  for (const override of [{ result: "pass" }, { result: "linked-lessons" }, { actor: "agent-absent" }, { learningIds: ["LESSON-0001"] }, { evidence: "../outside.md" }, { evidence: "/tmp/outside.md" }, { evidence: "docs/../review.md" }]) {
    await assert.rejects(recordLearningReview(f.root, { ...f.options, ...override }));
  }
  await assert.rejects(fs.stat(path.join(f.root, ".ai-org/learning/reviews")), { code: "ENOENT" });
});

test("administrative timestamps do not stale a review; exact revisions, scope and gates do", async t => {
  const f = await fixture(t);
  await recordLearningReview(f.root, f.options);
  await f.put(".ai-org/work-items/WI-0001.json", { ...f.item, updated_at: new Date().toISOString(), assigned_agent_id: "different" });
  assert.equal((await f.query()).items[0].status, "no-new-lesson");
  for (const extra of [{ tested_revision: "b".repeat(40) }, { scope: ["different"] }, { gate_evidence: { test: ["docs/review.md"] } }, { unresolved: ["remaining issue"] }, { state: "concluded", lifecycle_outcome: "inconclusive" }]) {
    await f.put(".ai-org/work-items/WI-0001.json", { ...f.item, ...extra });
    assert.equal((await f.query()).items[0].status, "review-required");
  }
  await f.put(".ai-org/work-items/WI-0001.json", { ...f.item, tested_revision: null });
  assert.equal((await f.query()).items[0].status, "unknown");
});

test("malformed storage, missing items, and symlinks remain visible as unknown/errors", async t => {
  const f = await fixture(t);
  const saved = await recordLearningReview(f.root, f.options);
  await f.put(saved.path, "{broken");
  assert.equal((await f.query()).items[0].status, "unknown");
  assert.ok((await summarizeLearningReviews(f.root)).errors.length);
  await f.put(saved.path, saved.record);
  await fs.unlink(path.join(f.root, ".ai-org/work-items/WI-0001.json"));
  assert.ok((await summarizeLearningReviews(f.root)).errors.length);
  await f.put(".ai-org/work-items/WI-0001.json", f.item);
  await fs.unlink(path.join(f.root, "docs/result.md"));
  await fs.symlink(path.join(f.root, "docs/review.md"), path.join(f.root, "docs/result.md"));
  assert.equal((await f.query()).items[0].status, "unknown");
  await assert.rejects(recordLearningReview(f.root, f.options), /Symlink/);
});

test("symlinked review parents cannot redirect reads or writes", async t => {
  const f = await fixture(t);
  const elsewhere = await fs.mkdtemp(path.join(os.tmpdir(), "temple-review-outside-"));
  t.after(() => fs.rm(elsewhere, { recursive: true, force: true }));
  await fs.symlink(elsewhere, path.join(f.root, ".ai-org/learning/reviews"));
  await assert.rejects(recordLearningReview(f.root, f.options), /Symlink/);
  assert.equal((await f.query()).items[0].status, "unknown");
  assert.ok((await summarizeLearningReviews(f.root)).errors.length);
  assert.deepEqual(await fs.readdir(elsewhere), []);
});

test("single-item queries ignore unrelated broken data and all-item queries preserve unknown", async t => {
  const f = await fixture(t);
  await f.put(".ai-org/work-items/WI-0002.json", "{broken");
  assert.equal((await f.query()).items.length, 1);
  const result = await queryLearningReviews(f.root);
  assert.equal(result.counts["not-reviewed"], 1);
  assert.equal(result.counts.unknown, 1);
  assert.equal(result.mutation_performed, false);
  assert.equal(result.model_calls_performed, 0);
  await assert.rejects(fs.stat(path.join(f.root, ".ai-org/learning/reviews")), { code: "ENOENT" });
});

test("CLI serializes concurrent retries and exposes compact statuses", async t => {
  const f = await fixture(t);
  const args = [cli, "learning", "record-review", f.root, "--work-item", f.item.id, "--revision", revision, "--result", "no-new-lesson", "--actor", "agent-reviewer", "--evidence", "docs/review.md", "--json"];
  const invoke = () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args); let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; }); child.stderr.on("data", chunk => { stderr += chunk; });
    child.on("error", reject); child.on("close", code => resolve({ code, stdout, stderr }));
  });
  const outputs = await Promise.all([invoke(), invoke()]);
  for (const out of outputs) assert.equal(out.code, 0, out.stderr);
  assert.deepEqual(outputs.map(o => JSON.parse(o.stdout).idempotent).sort(), [false, true]);
  assert.equal((await f.query()).items[0].record_count, 1);
  const status = run(["learning", "review-status", f.root, "--work-item", f.item.id]);
  assert.equal(status.status, 0, status.stderr); assert.match(status.stdout, /WI-0001\s+no-new-lesson/);
  const entries = await fs.readdir(path.join(f.root, ".ai-org/learning/reviews/WI-0001"));
  assert.equal(entries.length, 1);
});

test("normalized Evidence IDs track just their record and never fetch external references", async t => {
  const f = await fixture(t);
  const id = "EVID-20260909T000000Z-ABCDEF12";
  await f.put(".ai-org/project/evidence.json", { entries: [{ id, summary: "first" }] });
  await f.put(".ai-org/work-items/WI-0001.json", { ...f.item, evidence: [id, "https://example.invalid/never-fetch", revision] });
  await recordLearningReview(f.root, f.options);
  await f.put(".ai-org/project/evidence.json", { entries: [{ id, summary: "first" }, { id: "unrelated" }] });
  assert.equal((await f.query()).items[0].status, "no-new-lesson");
  await f.put(".ai-org/project/evidence.json", { entries: [{ id, summary: "changed" }] });
  assert.equal((await f.query()).items[0].status, "review-required");
});

test("fresh installation, Doctor and status expose review storage without changing the Learning index", async t => {
  const f = await fixture(t);
  const target = path.join(f.root, "installed");
  const config = path.join(f.root, "init.json");
  await f.put("init.json", {
    schema_version: "temple.init/v1", project: { id: "review-fixture", name: "Review fixture" }, naming_mode: "manual",
    agents: [
      { display_name: "Coordinator", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Planner", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Architect", positions: ["tech_lead"] },
      { display_name: "Builder", positions: ["developer"] },
      { display_name: "Reviewer", positions: ["quality_evaluator", "independent_qa"] }
    ]
  });
  const initialized = run(["init", target, "--config", config]);
  assert.equal(initialized.status, 0, initialized.stderr);
  const doctor = () => run(["doctor", target, "--json"]);
  assert.equal(doctor().status, 0);
  await f.put("installed/.ai-org/work-items/WI-0001.json", f.item);
  await f.put("installed/docs/result.md", "Outcome\n");
  await f.put("installed/docs/review.md", "Reviewed\n");
  const saved = await recordLearningReview(target, { ...f.options, actor: "agent-reviewer" });
  const status = run(["status", target, "--json"]);
  assert.equal(status.status, 0, status.stderr);
  assert.equal(JSON.parse(status.stdout).learning.reviews.counts["no-new-lesson"], 1);
  const healthy = JSON.parse(doctor().stdout);
  assert.equal(healthy.checks.find(c => c.id === "engineering_learning").status, "pass");
  await f.put(`installed/${saved.path}`, "broken");
  const broken = JSON.parse(doctor().stdout);
  assert.equal(broken.checks.find(c => c.id === "engineering_learning").status, "fail");
});
