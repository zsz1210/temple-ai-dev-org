import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSOLE_VIEWPORTS,
  PRIMARY_VIEWS,
  failureScreenshotPath,
  rectanglesIntersect,
  verifyConsoleBrowser
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

test("browser harness cleans temporary state and acquired resources on failures and success", async () => {
  for (const stage of ["server", "launch", "views", "success"]) {
    let stateDirectory;
    const closed = [];
    const operation = verifyConsoleBrowser({
      startServer: async (_root, options) => {
        stateDirectory = options.stateDirectory;
        assert.equal(options.host, "127.0.0.1");
        assert.equal(options.port, 0);
        assert.ok((await fs.stat(stateDirectory)).isDirectory());
        if (stage === "server") throw new Error("server failed");
        return { url: "http://127.0.0.1:1234", close: async () => { closed.push("server"); } };
      },
      launchBrowser: async () => {
        if (stage === "launch") throw new Error("launch failed");
        return { version: () => "fixture", close: async () => { closed.push("browser"); throw new Error("close failed"); } };
      },
      checkViews: async () => { if (stage === "views") throw new Error("views failed"); }
    });
    if (stage === "success") await operation;
    else await assert.rejects(operation, /failed/);
    await assert.rejects(fs.stat(stateDirectory), { code: "ENOENT" });
    assert.deepEqual(closed, stage === "server" ? [] : stage === "launch" ? ["server"] : ["browser", "server"]);
  }
});

test("Playwright Core is exact, development-only, licensed, and absent from package files", async () => {
  const packageDocument = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const notices = await fs.readFile(path.join(root, "THIRD_PARTY_NOTICES.md"), "utf8");
  const lock = JSON.parse(await fs.readFile(path.join(root, "package-lock.json"), "utf8"));
  assert.match(packageDocument.devDependencies["playwright-core"], /^\d+\.\d+\.\d+$/);
  assert.equal(packageDocument.devDependencies["playwright-core"], lock.packages["node_modules/playwright-core"].version);
  assert.equal(packageDocument.dependencies["playwright-core"], undefined);
  assert.equal(packageDocument.scripts["test:browser"], "node scripts/verify-console-browser.mjs");
  assert.ok(!packageDocument.files.includes("scripts/"));
  assert.ok(!packageDocument.files.includes("test/"));
  assert.match(notices, /Playwright Core/);
  assert.match(notices, /Apache-2\.0/);
  assert.match(notices, /does not download, vendor, redistribute, or include a browser binary/);
});
