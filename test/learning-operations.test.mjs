import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createLocalHybridRetrievalProvider, createRepositoryRetrievalProvider } from "../src/context.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

async function fixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-learning-op-test-"));
  const target = path.join(temporaryRoot, "learning-product");
  const configPath = path.join(temporaryRoot, "init.json");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await fs.writeFile(configPath, `${JSON.stringify({
    schema_version: "temple.init/v1",
    project: { id: "learning-product", name: "Learning Product" },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  }, null, 2)}\n`);
  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  return { target };
}

test("learning CLI keeps Markdown, index, and revalidation signals consistent", async (context) => {
  const { target } = await fixture(context);
  const lesson = run([
    "learning", "add-lesson", target,
    "--title", "Bind runtime evidence to a revision",
    "--summary", "Runtime evidence is reusable only when its exact revision is preserved.",
    "--confidence", "medium",
    "--tag", "runtime",
    "--tag", "verification",
    "--applies-to", "independent-qa",
    "--evidence", ".ai-org/artifacts/runtime.json"
  ]);
  assert.equal(lesson.status, 0, lesson.stderr || lesson.stdout);
  assert.match(lesson.stdout, /LESSON-0001/);
  await fs.access(path.join(target, ".ai-org/learning/lessons/LESSON-0001.md"));

  const practice = run([
    "learning", "add-practice", target,
    "--title", "Revision-bound runtime evidence",
    "--summary", "Record an exact revision for every runtime claim.",
    "--confidence", "medium",
    "--tag", "runtime",
    "--applies-to", "quality",
    "--derived-from", "LESSON-0001",
    "--owner-position", "tech_lead"
  ]);
  assert.equal(practice.status, 0, practice.stderr || practice.stdout);
  assert.match(practice.stdout, /PRACTICE-0001/);

  const revalidated = run([
    "learning", "revalidate", target,
    "--learning-id", "PRACTICE-0001",
    "--result", "confirmed",
    "--evidence", ".ai-org/artifacts/second-runtime.json",
    "--review-after", "2020-01-01T00:00:00.000Z"
  ]);
  assert.equal(revalidated.status, 0, revalidated.stderr || revalidated.stdout);
  const listed = run(["learning", "list", target, "--json"]);
  assert.equal(listed.status, 0, listed.stderr || listed.stdout);
  const entries = JSON.parse(listed.stdout).entries;
  const storedPractice = entries.find((entry) => entry.id === "PRACTICE-0001");
  assert.equal(storedPractice.status, "active");
  assert.equal(storedPractice.revalidation.signal, "overdue");
  assert.equal(storedPractice.revalidation.last_result, "confirmed");
  assert.match(await fs.readFile(path.join(target, storedPractice.path), "utf8"), /confirmed/);

  const observer = JSON.parse(run(["observe", target, "--json", "--no-write"]).stdout);
  assert.ok(observer.attention.some((entry) => entry.type === "learning_revalidation_overdue"));
});

test("deterministic retrieval evaluation records hit rate and reciprocal rank", async (context) => {
  const { target } = await fixture(context);
  const added = run([
    "learning", "add-lesson", target,
    "--title", "Checkout totals use the public seam",
    "--summary", "Verify checkout totals through the supported public output.",
    "--confidence", "high",
    "--tag", "checkout",
    "--applies-to", "developer"
  ]);
  assert.equal(added.status, 0, added.stderr || added.stdout);
  const validated = run(["learning", "revalidate", target, "--learning-id", "LESSON-0001", "--result", "confirmed"]);
  assert.equal(validated.status, 0, validated.stderr || validated.stdout);
  const fixturePath = ".ai-org/artifacts/retrieval-evaluation.json";
  await fs.mkdir(path.dirname(path.join(target, fixturePath)), { recursive: true });
  await fs.writeFile(path.join(target, fixturePath), `${JSON.stringify({
    schema_version: "temple.retrieval-evaluation/v1",
    cases: [
      { id: "checkout-learning", kind: "learning", query: "checkout public totals", position: "developer", expected_ids: ["LESSON-0001"], limit: 3 }
    ]
  }, null, 2)}\n`);
  const evaluated = run(["learning", "evaluate", target, "--fixture", fixturePath, "--json", "--no-write"]);
  assert.equal(evaluated.status, 0, evaluated.stderr || evaluated.stdout);
  const report = JSON.parse(evaluated.stdout);
  assert.equal(report.schema_version, "temple.retrieval-evaluation-result/v1");
  assert.equal(report.provider.id, "repository-deterministic");
  assert.equal(report.summary.hit_rate_at_limit, 1);
  assert.equal(report.summary.mean_reciprocal_rank, 1);
  assert.equal(report.external_action_performed, false);
  await assert.rejects(() => fs.access(path.join(target, ".ai-org/views/retrieval-evaluation.json")));
});

test("local hybrid provider preserves provenance and falls back deterministically", async () => {
  const deterministic = createRepositoryRetrievalProvider();
  const documents = [{ id: "route-one", title: "Checkout route", summary: "Public checkout totals", tags: ["checkout"], paths: ["docs/checkout.md"], retrieval_kind: "context-route", status: "active" }];
  const failedSemantic = createLocalHybridRetrievalProvider({
    deterministicProvider: deterministic,
    semanticProvider: {
      id: "local-test-semantic",
      async search() { throw new Error("local model unavailable"); }
    }
  });
  const fallback = await failedSemantic.search({ query: "checkout", documents, pinned_ids: [], limit: 3 });
  assert.equal(fallback[0].id, "route-one");
  assert.equal(fallback[0].provider_provenance.semantic.status, "failed_fallback");
  assert.equal(failedSemantic.semantic, true);
  assert.equal(failedSemantic.privacy, "local-only");
  assert.equal(failedSemantic.installs_runtime, false);
});

test("local hybrid provider accepts semantic ranking only for canonical repository documents", async () => {
  const documents = [{ id: "route-one", title: "Checkout route", summary: "Canonical public checkout totals", tags: ["checkout"], paths: ["docs/checkout.md"], retrieval_kind: "context-route", status: "active" }];
  const hybrid = createLocalHybridRetrievalProvider({
    semanticProvider: {
      id: "local-test-semantic",
      async search() {
        return [
          { id: "unknown-document", source: { paths: ["../../outside"] } },
          { id: "route-one", kind: "poisoned", source: { paths: ["../../outside"], summary: "Untrusted replacement" } }
        ];
      }
    }
  });
  const results = await hybrid.search({ query: "unmatched semantic phrase", documents, pinned_ids: [], limit: 3 });
  assert.deepEqual(results.map((entry) => entry.id), ["route-one"]);
  assert.equal(results[0].kind, "context-route");
  assert.equal(results[0].source.summary, "Canonical public checkout totals");
  assert.deepEqual(results[0].source.paths, ["docs/checkout.md"]);
});
