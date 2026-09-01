import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildCliBootstrapMetadata, SUPPORTED_NODE_RANGE } from "../src/bootstrap.mjs";
import {
  FORBIDDEN_PACKAGE_PREFIXES,
  REQUIRED_PACKAGE_PATHS,
  inspectPackageDryRun,
  validatePackageDryRun
} from "../scripts/check-package.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("package and installed bootstrap expose the same qualified Node.js LTS range", async () => {
  const packageDocument = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const bootstrap = await buildCliBootstrapMetadata();
  assert.equal(packageDocument.engines.node, SUPPORTED_NODE_RANGE);
  assert.equal(bootstrap.node, SUPPORTED_NODE_RANGE);
  assert.equal(packageDocument.private, true, "npm publication remains a separate release action");
});

test("npm dry-run package is allowlisted and excludes development state", async () => {
  const pack = await inspectPackageDryRun(root);
  assert.deepEqual(validatePackageDryRun(pack), []);
  const paths = pack.files.map((entry) => entry.path);
  for (const requiredPath of REQUIRED_PACKAGE_PATHS) assert.ok(paths.includes(requiredPath), requiredPath);
  for (const prefix of FORBIDDEN_PACKAGE_PREFIXES) {
    assert.equal(paths.some((pathname) => pathname.startsWith(prefix)), false, prefix);
  }
});
