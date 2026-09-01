import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSOLE_VIEWPORTS,
  PRIMARY_VIEWS,
  failureScreenshotPath,
  rectanglesIntersect
} from "../scripts/verify-console-browser.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("browser gate covers the approved responsive viewports and primary views", () => {
  assert.deepEqual(
    CONSOLE_VIEWPORTS.map(({ name, width, height }) => [name, width, height]),
    [
      ["mobile", 390, 844],
      ["tablet", 768, 1024],
      ["desktop", 1440, 1000],
      ["ultrawide", 3440, 1440]
    ]
  );
  assert.deepEqual(
    PRIMARY_VIEWS.map(({ target, label }) => [target, label]),
    [
      ["now", "Overview"],
      ["execution", "Work"],
      ["organization", "Team"],
      ["usage", "Usage"],
      ["system", "System"],
      ["history", "History"]
    ]
  );
});

test("overlap math treats shared edges as separate and catches real intersections", () => {
  const left = { left: 0, right: 100, top: 0, bottom: 100 };
  assert.equal(rectanglesIntersect(left, { left: 100, right: 200, top: 0, bottom: 100 }), false);
  assert.equal(rectanglesIntersect(left, { left: 99.5, right: 200, top: 0, bottom: 100 }), false);
  assert.equal(rectanglesIntersect(left, { left: 95, right: 200, top: 10, bottom: 90 }), true);
  assert.equal(rectanglesIntersect(left, { left: 10, right: 90, top: 101, bottom: 200 }), false);
});

test("failure screenshot names stay below the bounded Playwright output directory", () => {
  const outputRoot = path.join(root, "output", "playwright", "wi-0088");
  const ordinary = failureScreenshotPath(root, "mobile", "Overview");
  const hostile = failureScreenshotPath(root, "../../outside", "../Team");
  assert.equal(ordinary, path.join(outputRoot, "mobile-overview-failure.png"));
  assert.equal(hostile, path.join(outputRoot, "outside-team-failure.png"));
  assert.ok(hostile.startsWith(`${outputRoot}${path.sep}`));
});

test("browser harness uses installed Chrome, an ephemeral server, and finally cleanup", async () => {
  const source = await fs.readFile(path.join(root, "scripts/verify-console-browser.mjs"), "utf8");
  assert.match(source, /chromium\.launch\(\{ channel: "chrome", headless: true \}\)/);
  assert.match(source, /startControlPlaneServer\(repositoryRoot/);
  assert.match(source, /host: "127\.0\.0\.1"/);
  assert.match(source, /port: 0/);
  assert.match(source, /fs\.mkdtemp\(path\.join\(os\.tmpdir\(\), "temple-console-browser-"\)\)/);
  assert.match(source, /if \(browser\) await browser\.close/);
  assert.match(source, /if \(controlPlane\) await controlPlane\.close/);
  assert.match(source, /await fs\.rm\(stateDirectory, \{ recursive: true, force: true, maxRetries: 3 \}\)/);
  assert.doesNotMatch(source, /playwright\s+install|install-deps/);
});

test("Playwright Core is exact, development-only, licensed, and absent from package files", async () => {
  const packageDocument = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const notices = await fs.readFile(path.join(root, "THIRD_PARTY_NOTICES.md"), "utf8");
  assert.equal(packageDocument.devDependencies["playwright-core"], "1.62.1");
  assert.equal(packageDocument.dependencies["playwright-core"], undefined);
  assert.equal(packageDocument.scripts["test:browser"], "node scripts/verify-console-browser.mjs");
  assert.ok(!packageDocument.files.includes("scripts/"));
  assert.ok(!packageDocument.files.includes("test/"));
  assert.match(notices, /Playwright Core/);
  assert.match(notices, /Apache-2\.0/);
  assert.match(notices, /does not download, vendor, redistribute, or include a browser binary/);
});

test("CI runs the browser gate only inside the existing Node 24 full lane and aggregates it", async () => {
  const workflow = await fs.readFile(path.join(root, ".github/workflows/ci.yml"), "utf8");
  const jobs = workflow.slice(workflow.indexOf("\njobs:\n"));
  const jobNames = [...jobs.matchAll(/^  ([a-zA-Z0-9_-]+):\s*$/gm)].map((match) => match[1]);
  const browserStepStart = workflow.indexOf("      - id: browser_console\n");
  const browserStepEnd = workflow.indexOf("\n      - ", browserStepStart + 1);
  const browserStep = workflow.slice(browserStepStart, browserStepEnd);

  assert.deepEqual(jobNames, ["verify"]);
  assert.ok(browserStepStart >= 0);
  assert.match(browserStep, /scope\.outputs\.scope == 'full'/);
  assert.match(browserStep, /scope\.outcome != 'success'/);
  assert.match(browserStep, /matrix\.node-version == 24/);
  assert.match(browserStep, /run: npm run test:browser/);
  assert.match(workflow, /BROWSER_CONSOLE_OUTCOME: \$\{\{ steps\.browser_console\.outcome \}\}/);
  assert.match(workflow, /if \[ "\$NODE_VERSION" = "24" \]; then\n\s+require_success "Management Console browser gate" "\$BROWSER_CONSOLE_OUTCOME"/);
});
