import test from "node:test";
import assert from "node:assert/strict";
import { classifyChangedPaths, isDocumentationOnlyPath } from "../scripts/ci-scope.mjs";

test("Markdown and documentation assets use the documentation-only CI scope", () => {
  const result = classifyChangedPaths([
    "README.md",
    "docs/getting-started/usage.md",
    "docs/assets/overview.svg",
    "LICENSE"
  ]);

  assert.equal(result.scope, "documentation-only");
  assert.deepEqual(result.nonDocumentationPaths, []);
});

test("behavioral changes require the full test suite", () => {
  const result = classifyChangedPaths(["README.md", "src/cli.mjs", "project-overlay/.ai-org/core/policies.json"]);

  assert.equal(result.scope, "full");
  assert.deepEqual(result.nonDocumentationPaths, ["src/cli.mjs", "project-overlay/.ai-org/core/policies.json"]);
});

test("an empty or unknown change set fails safely to the full suite", () => {
  assert.equal(classifyChangedPaths([]).scope, "full");
  assert.equal(classifyChangedPaths(["", "  "]).scope, "full");
});

test("documentation path classification is narrow and platform-neutral", () => {
  assert.equal(isDocumentationOnlyPath("docs\\guide.md"), true);
  assert.equal(isDocumentationOnlyPath("docs/assets/flow.png"), true);
  assert.equal(isDocumentationOnlyPath("docs/example.json"), false);
  assert.equal(isDocumentationOnlyPath("scripts/generate-docs.mjs"), false);
});
