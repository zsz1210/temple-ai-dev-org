import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { sha256 } from "../src/files.mjs";
import { exportEvidenceBundle, importEvidenceBundle, inspectEvidenceDurability, retrieveEvidenceBundleArtifact, verifyEvidenceBundle } from "../src/evidence-bundle.mjs";

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-field-evidence-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const git = (...args) => {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git("init", "-q"); git("config", "user.name", "Fixture"); git("config", "user.email", "fixture@example.invalid");
  const bodies = { "binary.dat": Buffer.from([0, 255, 10, 13, 2]), "empty.txt": Buffer.alloc(0), "space name.txt": Buffer.from("historical\n") };
  for (const [file, body] of Object.entries(bodies)) await fs.writeFile(path.join(root, file), body);
  git("add", "."); git("commit", "-qm", "historical fixture");
  const revision = git("rev-parse", "HEAD");
  const entry = { id: "EVID-fixture", work_item_id: "WI-0001", scope_revision: revision, kind: "test", outcome: "passed",
    invalidated_at: null, artifacts: Object.entries(bodies).map(([file, body]) => ({ path: file, sha256: sha256(body) })) };
  return { root, git, entry, bodies, registry: { entries: [entry] } };
}

test("V11: explicitly selected archive retrieves exact binary, empty and spaced historical bytes in a clone without the source commit", async t => {
  const { root, entry, registry, bodies, git } = await fixture(t);
  for (const file of Object.keys(bodies)) await fs.writeFile(path.join(root, file), "unrelated current content");
  const exported = await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id] });
  assert.equal(exported.valid, true, exported.errors.join(";"));
  assert.equal(exported.artifact_count, 3);
  const fresh = await fs.mkdtemp(path.join(os.tmpdir(), "temple-field-fresh-clone-"));
  t.after(() => fs.rm(fresh, { recursive: true, force: true }));
  // A real single-branch local clone intentionally has an unrelated root commit.
  git("checkout", "--orphan", "portable-target"); git("rm", "--cached", "-rf", ".");
  await fs.writeFile(path.join(root, "README.md"), "Unrelated current checkout\n");
  git("add", "README.md"); git("commit", "-qm", "clean clone baseline");
  const cloned = spawnSync("git", ["clone", "--quiet", "--no-local", "--single-branch", "--branch", "portable-target", root, fresh], { encoding: "utf8" });
  assert.equal(cloned.status, 0, cloned.stderr);
  const imported = await importEvidenceBundle(fresh, exported.bundle);
  assert.equal(imported.valid, true);
  assert.equal(imported.archive_integrity, "verified");
  assert.equal(imported.original_revision_availability[0].available, false);
  assert.equal(imported.registry_mutated, false);
  assert.equal(imported.acceptance_granted, false);
  assert.equal((await importEvidenceBundle(fresh, exported.bundle)).already_present, true);
  await assert.rejects(fs.access(path.join(fresh, ".ai-org/project/evidence.json")), { code: "ENOENT" });
  for (const [file, body] of Object.entries(bodies)) {
    const retrieved = await retrieveEvidenceBundleArtifact(exported.bundle, { evidenceId: entry.id, path: file });
    assert.deepEqual(retrieved.bytes, body);
  }
});

test("V11: missing historical bytes remain missing even when a current file has the recorded digest", async t => {
  const { root, entry } = await fixture(t);
  await fs.writeFile(path.join(root, "later.txt"), "later");
  const registry = { entries: [{ ...entry, artifacts: [{ path: "later.txt", sha256: sha256("later") }] }] };
  const inspected = await inspectEvidenceDurability(root, { registry, candidateRevision: entry.scope_revision });
  assert.equal(inspected.valid, false);
  assert.equal(inspected.current_candidate_debt, 1);
  assert.equal(inspected.items[0].artifacts[0].status, "missing");
  const exported = await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id], outputPath: "archive.json" });
  assert.equal(exported.valid, false);
  assert.match(exported.errors[0], /absent at the recorded Git revision/);
  await assert.rejects(fs.access(path.join(root, "archive.json")), { code: "ENOENT" });
});

test("V11: tampering, path escape, duplicate records, size limits and manifest collisions fail closed", async t => {
  const { root, entry, registry } = await fixture(t);
  const { bundle } = await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id] });
  const cases = [
    copy => { copy.artifacts[0].content_base64 = Buffer.from("wrong").toString("base64"); },
    copy => { copy.artifacts[0].path = "../outside"; },
    copy => { copy.entries[0].artifacts[0].path = "C:/outside"; },
    copy => { copy.entries.push(structuredClone(copy.entries[0])); },
    copy => { copy.artifacts.push(structuredClone(copy.artifacts[0])); },
    copy => { copy.artifacts[0].size_bytes = 99_999_999; },
    copy => { copy.entries[0].outcome = "invented acceptance"; },
    copy => { copy.artifacts.pop(); }
  ];
  for (const mutate of cases) {
    const copy = structuredClone(bundle); mutate(copy);
    assert.equal((await verifyEvidenceBundle(copy)).valid, false);
    assert.equal((await importEvidenceBundle(root, copy)).mutation_performed, false);
  }
  assert.equal((await verifyEvidenceBundle(bundle, { maxTotalBytes: 3 })).valid, false);
  assert.equal((await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id], maxArtifactBytes: 2 })).valid, false);
});

test("V11: export selection, source symlinks and output symlink parents cannot leak or replace bytes", async t => {
  const { root, entry, registry, git } = await fixture(t);
  assert.equal((await exportEvidenceBundle(root, { registry })).valid, false);
  assert.equal((await exportEvidenceBundle(root, { registry, evidenceIds: ["missing"] })).valid, false);
  assert.equal((await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id, entry.id] })).valid, false);
  await fs.symlink("binary.dat", path.join(root, "linked"));
  git("add", "."); git("commit", "-qm", "symlink fixture");
  const source = { ...entry, scope_revision: git("rev-parse", "HEAD"), artifacts: [{ path: "linked", sha256: sha256("binary.dat") }] };
  assert.match((await exportEvidenceBundle(root, { registry: { entries: [source] }, evidenceIds: [entry.id] })).errors[0], /regular Git file/);
  await fs.symlink(os.tmpdir(), path.join(root, "escaped"));
  assert.equal((await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id], outputPath: "escaped/archive.json" })).valid, false);
});

test("V08/V11: scoped durability separates old debt and keeps invalidated attempt metadata", async t => {
  const { root, entry, registry } = await fixture(t);
  const invalidated = { ...entry, id: "EVID-invalidated", invalidated_at: "2026-09-16T00:00:00Z", invalidated_by: "reviewer", invalidation_reason: "superseded measurement" };
  const missing = { ...entry, id: "EVID-old-missing", scope_revision: "f".repeat(40) };
  registry.entries.push(invalidated, missing, { ...missing, id: "other-work", work_item_id: "WI-0002" });
  const scoped = await inspectEvidenceDurability(root, { registry, workItemIds: ["WI-0001"], candidateRevision: entry.scope_revision });
  assert.equal(scoped.items.length, 3);
  assert.equal(scoped.historical_debt, 1);
  assert.equal(scoped.current_candidate_debt, 0);
  const exported = await exportEvidenceBundle(root, { registry, evidenceIds: [invalidated.id] });
  assert.equal(exported.valid, true);
  assert.deepEqual(exported.invalidated_evidence_ids, [invalidated.id]);
  assert.equal(exported.bundle.entries[0].invalidation_reason, invalidated.invalidation_reason);
  assert.equal(exported.bundle.entries.length, 1);
  assert.equal(exported.acceptance_granted, false);
});

test("V11: self-consistent archive integrity does not authenticate its claimed source; available Git bytes detect contradiction", async t => {
  const { root, entry, registry } = await fixture(t);
  const { bundle } = await exportEvidenceBundle(root, { registry, evidenceIds: [entry.id] });
  const forged = structuredClone(bundle);
  const bytes = Buffer.from([1, 1, 1, 1, 1]);
  forged.artifacts[0].content_base64 = bytes.toString("base64");
  forged.artifacts[0].sha256 = sha256(bytes);
  forged.entries[0].artifacts[0].sha256 = sha256(bytes);
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  const { bundle_sha256: _previous, ...body } = forged;
  forged.bundle_sha256 = sha256(JSON.stringify(canonical(body)));
  const withoutSource = await verifyEvidenceBundle(forged);
  assert.equal(withoutSource.valid, true);
  assert.equal(withoutSource.source_authentication, "not-established-by-archive");
  assert.equal(withoutSource.acceptance_granted, false);
  const againstGit = await verifyEvidenceBundle(forged, { target: root });
  assert.equal(againstGit.valid, false);
  assert.match(againstGit.errors[0], /contradicts available original Git source/);
});
