import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ReleaseValidationError,
  validateReleasePreparation,
  verifyReleaseAsset
} from "../scripts/validate-npm-release.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function packageDocument(version = "0.2.0-alpha.1") {
  return {
    name: "@zsz1210/temple-ai-dev-org",
    version,
    repository: {
      type: "git",
      url: "git+https://github.com/zsz1210/temple-ai-dev-org.git"
    },
    publishConfig: { access: "public", tag: "next" }
  };
}

async function preparationFixture(version = "0.2.0-alpha.1") {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "temple-npm-release-"));
  const filename = `zsz1210-temple-ai-dev-org-${version}.tgz`;
  await fs.writeFile(path.join(directory, filename), "qualified package bytes");
  return {
    packageDocument: packageDocument(version),
    packResult: [
      {
        name: "@zsz1210/temple-ai-dev-org",
        version,
        filename
      }
    ],
    packDirectory: directory,
    tagName: `v${version}`,
    releasePrerelease: version.includes("-"),
    githubRepository: "zsz1210/temple-ai-dev-org",
    npmVersion: "11.5.1"
  };
}

test("prerelease metadata routes only to npm next", async (t) => {
  const fixture = await preparationFixture();
  t.after(() => fs.rm(fixture.packDirectory, { recursive: true, force: true }));
  const result = await validateReleasePreparation(fixture);
  assert.equal(result.package_version, "0.2.0-alpha.1");
  assert.equal(result.dist_tag, "next");
});

test("stable Release metadata routes only to npm latest", async (t) => {
  const fixture = await preparationFixture("0.2.0");
  t.after(() => fs.rm(fixture.packDirectory, { recursive: true, force: true }));
  const result = await validateReleasePreparation(fixture);
  assert.equal(result.package_version, "0.2.0");
  assert.equal(result.dist_tag, "latest");
});

test("tag, release channel, repository, package policy, npm CLI, and pack identity fail closed", async (t) => {
  const fixture = await preparationFixture();
  t.after(() => fs.rm(fixture.packDirectory, { recursive: true, force: true }));

  for (const override of [
    { tagName: "v0.2.0-alpha.2" },
    { releasePrerelease: false },
    { githubRepository: "another/project" },
    { packageDocument: { ...fixture.packageDocument, publishConfig: { access: "public", tag: "latest" } } },
    { npmVersion: "11.5.0" },
    { packResult: [{ ...fixture.packResult[0], version: "0.2.0-alpha.2" }] }
  ]) {
    await assert.rejects(
      validateReleasePreparation({ ...fixture, ...override }),
      ReleaseValidationError
    );
  }
});

test("Release asset must be a byte-identical regular file", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "temple-npm-asset-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const fresh = path.join(directory, "fresh.tgz");
  const release = path.join(directory, "release.tgz");
  await fs.writeFile(fresh, "same bytes");
  await fs.writeFile(release, "same bytes");

  const result = await verifyReleaseAsset({ freshArchive: fresh, releaseArchive: release });
  assert.equal(result.archive_size, 10);
  assert.match(result.archive_sha256, /^[a-f0-9]{64}$/);

  await fs.writeFile(release, "other data");
  await assert.rejects(
    verifyReleaseAsset({ freshArchive: fresh, releaseArchive: release }),
    /differ/
  );
});

test("npm publication workflow has one Release-only OIDC boundary", async () => {
  const workflow = await fs.readFile(path.join(root, ".github/workflows/publish-npm.yml"), "utf8");
  const trigger = workflow.slice(workflow.indexOf("on:\n"), workflow.indexOf("\nconcurrency:\n"));

  assert.match(trigger, /^on:\n  release:\n    types: \[published\]$/m);
  assert.doesNotMatch(trigger, /push:|pull_request:|workflow_dispatch:|schedule:/);
  assert.match(workflow, /^permissions:\n  contents: read\n  id-token: write$/m);
  assert.match(workflow, /runs-on: ubuntu-latest/);
  assert.match(workflow, /package-manager-cache: false/);
  assert.match(workflow, /npm ci --ignore-scripts/);
  assert.match(workflow, /npm run verify/);
  assert.match(workflow, /gh release download/);
  assert.match(workflow, /verify-asset/);
  assert.match(workflow, /npm publish .* --access public --tag "\$DIST_TAG"/);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./);
  assert.doesNotMatch(workflow, /continue-on-error|retry|fallback/i);

  const actionReferences = [...workflow.matchAll(/^\s+uses: ([^\s#]+)/gm)].map((match) => match[1]);
  assert.equal(actionReferences.length, 2);
  for (const reference of actionReferences) {
    assert.match(reference, /^[^@]+@[a-f0-9]{40}$/);
  }
});
