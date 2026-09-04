import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { extractLocalLinks, resolveLocalLink } from "../scripts/check-doc-links.mjs";

test("documentation link extraction keeps local targets and ignores external destinations", () => {
  const markdown = [
    "[Guide](docs/guide.md)",
    "[Section](#section)",
    "[Web](https://example.com)",
    "![Diagram](docs/assets/flow.svg)",
    "`[Code](not-a-link.md)`"
  ].join("\n");

  assert.deepEqual(extractLocalLinks(markdown), ["docs/guide.md", "docs/assets/flow.svg"]);
});

test("documentation link resolution handles relative paths, fragments, and encoded names", () => {
  const source = path.join("/workspace", "docs", "guide.md");

  assert.equal(resolveLocalLink(source, "../README.md#start"), path.join("/workspace", "README.md"));
  assert.equal(resolveLocalLink(source, "assets/My%20Flow.svg?raw=1"), path.join("/workspace", "docs", "assets", "My Flow.svg"));
  assert.equal(resolveLocalLink(source, "#local"), null);
});

test("localized Temple Concept Layers assets use explicit L1 through L6 labels", async () => {
  const assetNames = [
    "temple-layers.en.svg",
    "temple-layers.ja.svg",
    "temple-layers.zh-TW.svg",
    "temple-layers-mobile.en.svg",
    "temple-layers-mobile.ja.svg",
    "temple-layers-mobile.zh-TW.svg"
  ];
  const expected = ["L1", "L2", "L3", "L4", "L5", "L6"];

  for (const assetName of assetNames) {
    const source = await fs.readFile(new URL(`../docs/assets/${assetName}`, import.meta.url), "utf8");
    const labels = [...source.matchAll(/class="(?:index|idx)"[^>]*>([^<]+)<\/text>/g)].map((match) => match[1]);

    assert.deepEqual(labels, expected, assetName);
  }
});

test("fresh-session guidance keeps recovery titles neutral and unavailable usage unknown", async () => {
  const recoveryPlan = await fs.readFile(
    new URL("../docs/validation/greenfield-cold-task-recovery-test-plan.md", import.meta.url),
    "utf8"
  );
  const usageGuide = await fs.readFile(new URL("../docs/getting-started/usage.md", import.meta.url), "utf8");

  assert.match(recoveryPlan, /Keep the pre-recovery task title neutral/);
  assert.match(recoveryPlan, /Do not place the coordinator's Work Item ID/);
  assert.match(recoveryPlan, /After repository inspection discovers the target Work Item/);
  assert.match(usageGuide, /missing usage is reported as unknown, never zero/);
});
