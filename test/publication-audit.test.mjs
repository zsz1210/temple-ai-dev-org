import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  defaultEvidenceProfiles,
  ensureEvidenceProfiles,
  EVIDENCE_PROFILES_RELATIVE_PATH,
  validateEvidenceProfiles
} from "../src/evidence-profiles.mjs";
import { buildPublicationAudit } from "../src/publication-audit.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repositoryRoot, "bin/temple.mjs");

function git(target, args) {
  const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function runCli(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

async function repositoryFixture(context, name) {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), `temple-publication-${name}-`));
  context.after(() => fs.rm(target, { recursive: true, force: true }));
  git(target, ["init", "-q"]);
  git(target, ["config", "user.email", "publication@example.invalid"]);
  git(target, ["config", "user.name", "Publication Fixture"]);
  await ensureEvidenceProfiles(target);
  const policyPath = path.join(target, EVIDENCE_PROFILES_RELATIVE_PATH);
  const policy = JSON.parse(await fs.readFile(policyPath, "utf8"));
  policy.active_profile = "public";
  await fs.writeFile(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  return { target, policyPath, policy };
}

test("Evidence Profiles default safely and reject weakened profile floors", async (context) => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "temple-evidence-profile-"));
  context.after(() => fs.rm(target, { recursive: true, force: true }));
  const policy = defaultEvidenceProfiles();
  assert.equal(policy.active_profile, "private");
  assert.deepEqual(policy.profiles.map((entry) => entry.id), ["private", "public", "restricted"]);
  assert.deepEqual(validateEvidenceProfiles(policy), { valid: true, errors: [] });

  const weakened = structuredClone(policy);
  weakened.profiles.find((entry) => entry.id === "public").local_environment = "review-required";
  assert.equal(validateEvidenceProfiles(weakened).valid, false);
  const bypass = structuredClone(policy);
  bypass.synthetic_usernames.push("maintainer");
  assert.equal(validateEvidenceProfiles(bypass).valid, false);

  const results = await Promise.all(Array.from({ length: 6 }, () => ensureEvidenceProfiles(target)));
  assert.equal(results.filter((entry) => entry.created).length, 1);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(target, EVIDENCE_PROFILES_RELATIVE_PATH), "utf8")), policy);
});

test("public audit redacts values, counts legacy occurrences, and blocks new duplicates and secrets", async (context) => {
  const { target, policyPath, policy } = await repositoryFixture(context, "legacy");
  const legacyPath = ["/Users", "maintainer", "workspace"].join("/");
  await fs.writeFile(path.join(target, "notes.md"), `Legacy location: ${legacyPath}\n`);
  git(target, ["add", "."]);
  git(target, ["commit", "-qm", "reviewed baseline"]);
  const baseline = git(target, ["rev-parse", "HEAD"]);

  policy.reviewed_legacy_baseline = {
    revision: baseline,
    approved_by: "human",
    approved_at: "2026-09-04T00:00:00.000Z",
    rationale: "Reviewed test baseline"
  };
  await fs.writeFile(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  const credential = `sk-${"A".repeat(24)}`;
  await fs.writeFile(path.join(target, "notes.md"), `Legacy location: ${legacyPath}\nDuplicated location: ${legacyPath}\nCredential: ${credential}\n`);
  await fs.writeFile(path.join(target, "image.bin"), Buffer.from([0, 1, 2, 3]));
  await fs.writeFile(path.join(target, ".env.staging"), "SAFE_LOOKING_VALUE=still-not-for-publication\n");
  git(target, ["add", "."]);

  const result = await buildPublicationAudit(target, { surface: "repository" });
  assert.equal(result.status, "blocked");
  assert.equal(result.authority.publication_authorized, false);
  assert.equal(result.summary.binary_files_requiring_review, 1);
  const findings = result.surfaces[0].findings;
  assert.ok(findings.some((entry) => entry.rule_id === "maintainer-home-path-posix" && entry.disposition === "retained-legacy" && entry.classification === "review-required"));
  assert.ok(findings.some((entry) => entry.rule_id === "maintainer-home-path-posix" && entry.disposition === "new" && entry.classification === "blocked"));
  assert.ok(findings.some((entry) => entry.rule_id === "openai-api-key" && entry.classification === "blocked"));
  assert.ok(findings.some((entry) => entry.rule_id === "sensitive-dotenv" && entry.classification === "blocked"));
  assert.ok(findings.some((entry) => entry.rule_id === "binary-review" && entry.classification === "review-required"));
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes(legacyPath), false);
  assert.equal(serialized.includes(credential), false);
});

test("private profile still blocks credentials while treating local environment details as review-required", async (context) => {
  const { target } = await repositoryFixture(context, "private");
  const privateIp = ["192", "168", "7", "9"].join(".");
  const credential = `ghp_${"B".repeat(24)}`;
  await fs.writeFile(path.join(target, "notes.md"), `Endpoint ${privateIp}\nToken ${credential}\n`);
  git(target, ["add", "."]);

  const result = await buildPublicationAudit(target, { profileId: "private", surface: "repository" });
  assert.equal(result.status, "blocked");
  assert.ok(result.surfaces[0].findings.some((entry) => entry.rule_id === "private-ipv4" && entry.classification === "review-required"));
  assert.ok(result.surfaces[0].findings.some((entry) => entry.rule_id === "github-token" && entry.classification === "blocked"));
});

test("package surface never inherits a repository legacy exception", async (context) => {
  const { target, policyPath, policy } = await repositoryFixture(context, "package");
  const privateIp = ["10", "8", "0", "4"].join(".");
  await fs.writeFile(path.join(target, "README.md"), `Internal endpoint ${privateIp}\n`);
  await fs.writeFile(path.join(target, "package.json"), `${JSON.stringify({ name: "publication-fixture", version: "1.0.0", files: ["README.md"] }, null, 2)}\n`);
  git(target, ["add", "."]);
  git(target, ["commit", "-qm", "reviewed package baseline"]);
  const baseline = git(target, ["rev-parse", "HEAD"]);
  policy.reviewed_legacy_baseline = {
    revision: baseline,
    approved_by: "human",
    approved_at: "2026-09-04T00:00:00.000Z",
    rationale: "Reviewed test baseline"
  };
  await fs.writeFile(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  git(target, ["add", policyPath]);

  const result = await buildPublicationAudit(target, { surface: "package" });
  assert.equal(result.status, "blocked");
  assert.equal(result.legacy_baseline, null);
  assert.ok(result.surfaces[0].findings.some((entry) => entry.rule_id === "private-ipv4" && entry.disposition === "new"));
});

test("publication CLI is read-only and rejects an unknown surface", async (context) => {
  const { target } = await repositoryFixture(context, "cli");
  await fs.writeFile(path.join(target, "README.md"), "Public fixture\n");
  git(target, ["add", "."]);
  const before = git(target, ["status", "--porcelain=v1"]);

  const result = runCli(["publication", "audit", target, "--surface", "repository", "--json"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "allowed");
  assert.equal(report.authority.canonical_state_changed, false);
  assert.equal(git(target, ["status", "--porcelain=v1"]), before);

  const invalid = runCli(["publication", "audit", target, "--surface", "remote"]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unknown publication surface/);
});
