import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyChanges,
  isDocumentationOnlyPath,
  isEvidenceStateOnlyPath,
  parseRawDiff,
  selectVerificationScope
} from "../scripts/ci-scope.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const objectA = "a".repeat(40);
const objectB = "b".repeat(40);
const validBase = "1".repeat(40);
const validHead = "2".repeat(40);

function change(pathname, overrides = {}) {
  return {
    oldMode: "100644",
    newMode: "100644",
    oldObject: objectA,
    newObject: objectB,
    status: "M",
    score: "",
    paths: [pathname],
    ...overrides
  };
}

test("Markdown and documentation assets use the documentation-only scope", () => {
  const result = classifyChanges([
    change("README.md"),
    change("docs/getting-started/usage.md"),
    change("docs/assets/overview.svg"),
    change("LICENSE")
  ]);

  assert.equal(result.scope, "documentation-only");
  assert.deepEqual(result.fullVerificationPaths, []);
});

test("strict lifecycle and evidence records use the evidence/state-only scope", () => {
  const result = classifyChanges([
    change(".ai-org/events/events.jsonl"),
    change(".ai-org/project/evidence.json"),
    change(".ai-org/project/runtime-workers.json"),
    change(".ai-org/work-items/WI-0035.json"),
    change(".ai-org/views/status.md"),
    change(".ai-org/artifacts/WI-0035/developer-evidence.md", {
      oldMode: "000000",
      oldObject: "0".repeat(40),
      status: "A"
    })
  ]);

  assert.equal(result.scope, "evidence-state-only");
  assert.equal(result.evidenceStatePaths.length, 6);
});

test("state classification excludes configuration, learning, and executable artifacts", () => {
  assert.equal(isEvidenceStateOnlyPath(".ai-org/project/evidence.json"), true);
  assert.equal(isEvidenceStateOnlyPath(".ai-org/work-items/WI-0035.json"), true);
  assert.equal(isEvidenceStateOnlyPath(".ai-org/artifacts/WI-0035/observation.json"), true);
  assert.equal(isEvidenceStateOnlyPath(".ai-org/project/assignments.json"), false);
  assert.equal(isEvidenceStateOnlyPath(".ai-org/learning/index.json"), false);
  assert.equal(isEvidenceStateOnlyPath(".ai-org/artifacts/WI-0035/runtime-harness.mjs"), false);
});

test("source, schema, workflow, package, test, and unknown paths require full verification", () => {
  for (const pathname of [
    "src/cli.mjs",
    ".ai-org/core/schemas/work-item.schema.json",
    ".github/workflows/ci.yml",
    "package-lock.json",
    "test/ci-scope.test.mjs",
    "docs/example.json",
    "project-overlay/.ai-org/core/policies.json"
  ]) {
    const result = classifyChanges([change(pathname)]);
    assert.equal(result.scope, "full", pathname);
    assert.deepEqual(result.fullVerificationPaths, [pathname]);
  }
});

test("mixed documentation and evidence/state changes fail closed to full", () => {
  const result = classifyChanges([change("docs/getting-started/testing.md"), change(".ai-org/work-items/WI-0035.json")]);
  assert.equal(result.scope, "full");
  assert.match(result.reason, /mixed-scope/);
});

test("rename and copy metadata include both endpoints and always require full verification", () => {
  const renamed = classifyChanges([
    change("docs/old.md", { status: "R", score: "100", paths: ["docs/old.md", "docs/new.md"] })
  ]);
  assert.equal(renamed.scope, "full");
  assert.deepEqual(renamed.changed, ["docs/old.md", "docs/new.md"]);
  assert.match(renamed.reason, /rename/);

  const copied = classifyChanges([
    change("docs/source.md", { status: "C", score: "100", paths: ["docs/source.md", "docs/copy.md"] })
  ]);
  assert.equal(copied.scope, "full");
  assert.deepEqual(copied.changed, ["docs/source.md", "docs/copy.md"]);
  assert.match(copied.reason, /copy/);

  const executableToMarkdown = classifyChanges([
    change("scripts/generate-docs.mjs", {
      status: "R",
      score: "100",
      paths: ["scripts/generate-docs.mjs", "docs/generated.md"]
    })
  ]);
  assert.equal(executableToMarkdown.scope, "full");
  assert.deepEqual(executableToMarkdown.changed, ["scripts/generate-docs.mjs", "docs/generated.md"]);
});

test("deletion, executable mode, and mode changes require full verification", () => {
  const deletion = classifyChanges([
    change("docs/removed.md", { status: "D", newMode: "000000", newObject: "0".repeat(40) })
  ]);
  assert.equal(deletion.scope, "full");
  assert.match(deletion.reason, /deletion/);

  const executableAddition = classifyChanges([
    change("docs/generated.md", {
      oldMode: "000000",
      newMode: "100755",
      oldObject: "0".repeat(40),
      status: "A"
    })
  ]);
  assert.equal(executableAddition.scope, "full");
  assert.match(executableAddition.reason, /executable/);

  const chmod = classifyChanges([change("docs/guide.md", { newMode: "100755" })]);
  assert.equal(chmod.scope, "full");
  assert.match(chmod.reason, /mode change/);
});

test("raw diff parsing preserves ordinary and rename/copy records", () => {
  const raw = [
    `:100644 100644 ${objectA} ${objectB} M`,
    "docs/guide.md",
    `:100644 100644 ${objectA} ${objectB} R090`,
    "docs/old.md",
    "docs/new.md",
    `:100644 100644 ${objectA} ${objectB} C100`,
    "docs/source.md",
    "docs/copy.md",
    ""
  ].join("\0");
  const parsed = parseRawDiff(raw);

  assert.equal(parsed.length, 3);
  assert.deepEqual(parsed[0].paths, ["docs/guide.md"]);
  assert.deepEqual(parsed[1].paths, ["docs/old.md", "docs/new.md"]);
  assert.equal(parsed[1].score, "090");
  assert.deepEqual(parsed[2].paths, ["docs/source.md", "docs/copy.md"]);
});

test("empty, manual, unavailable, failed, and malformed comparisons select full", async () => {
  assert.equal(classifyChanges([]).scope, "full");
  assert.equal(
    (await selectVerificationScope({ eventName: "workflow_dispatch", base: validBase, head: validHead })).scope,
    "full"
  );
  assert.match(
    (await selectVerificationScope({ eventName: "pull_request", base: "missing", head: validHead })).reason,
    /unavailable/
  );
  assert.match(
    (
      await selectVerificationScope({
        eventName: "pull_request",
        base: validBase,
        head: validHead,
        diffLoader: async () => {
          throw new Error("comparison unavailable");
        }
      })
    ).reason,
    /change detection failed/
  );
  assert.equal(
    (
      await selectVerificationScope({
        eventName: "pull_request",
        base: validBase,
        head: validHead,
        diffLoader: async () => "malformed"
      })
    ).scope,
    "full"
  );
});

test("documentation path classification is narrow and platform-neutral", () => {
  assert.equal(isDocumentationOnlyPath("docs\\guide.md"), true);
  assert.equal(isDocumentationOnlyPath("docs/assets/flow.png"), true);
  assert.equal(isDocumentationOnlyPath("docs/example.json"), false);
  assert.equal(isDocumentationOnlyPath("scripts/generate-docs.mjs"), false);
  assert.equal(isDocumentationOnlyPath("AGENTS.md"), false);
  assert.equal(isDocumentationOnlyPath("project-overlay/README.md"), false);
  assert.equal(isDocumentationOnlyPath("LICENSE.mjs"), false);
  assert.equal(isDocumentationOnlyPath(" docs/guide.md"), false);
  assert.equal(isDocumentationOnlyPath("docs/guide.md "), false);
});

test("CI keeps one job, always reports both lanes, and aggregates failures", async () => {
  const workflow = await fs.readFile(path.join(root, ".github/workflows/ci.yml"), "utf8");
  const jobs = workflow.slice(workflow.indexOf("\njobs:\n"));
  const jobNames = [...jobs.matchAll(/^  ([a-zA-Z0-9_-]+):\s*$/gm)].map((match) => match[1]);
  const step = (id) => {
    const start = workflow.indexOf(`      - id: ${id}\n`);
    const end = workflow.indexOf("\n      - ", start + 1);
    return workflow.slice(start, end === -1 ? workflow.length : end);
  };

  assert.deepEqual(jobNames, ["verify"]);
  assert.match(workflow, /matrix:\n\s+node-version:\n\s+- 22\n\s+- 24/);
  assert.match(workflow, /node-version: \$\{\{ matrix\.node-version \}\}/);
  const actionReferences = [...workflow.matchAll(/^\s+- uses: ([^\s#]+)/gm)].map((match) => match[1]);
  assert.ok(actionReferences.length > 0);
  for (const reference of actionReferences) {
    assert.match(reference, /^[^@]+@[a-f0-9]{40}$/, reference);
  }
  assert.match(workflow, /^permissions:\n  contents: read$/m);
  for (const id of ["install", "governance", "schema", "doctor", "behavior_evidence", "behavior_full"]) {
    assert.match(step(id), /if:.*always\(\)/, id);
  }
  assert.match(step("schema"), /scope != 'documentation-only'/);
  assert.match(step("doctor"), /scope != 'documentation-only'/);
  assert.match(step("behavior_full"), /steps\.scope\.outcome != 'success'/);
  assert.match(workflow, /GITHUB_STEP_SUMMARY/);
  assert.match(workflow, /Enforce aggregated verification result/);
});
