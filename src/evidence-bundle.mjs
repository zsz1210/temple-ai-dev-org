import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { durableAtomicCreate, formatJson, sha256 } from "./files.mjs";

export const EVIDENCE_BUNDLE_SCHEMA = "temple.evidence-bundle/v1";
export const EVIDENCE_ARCHIVE_DIRECTORY = ".ai-org/artifacts/evidence-archives";
const REGISTRY_PATH = ".ai-org/project/evidence.json";
const REVISION = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const DEFAULT_LIMITS = { maxArtifactBytes: 16 * 1024 * 1024, maxTotalBytes: 64 * 1024 * 1024, maxEntries: 1000 };

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
function digest(value) { return sha256(JSON.stringify(canonical(value))); }
function limits(options) {
  const result = { ...DEFAULT_LIMITS };
  for (const key of Object.keys(result)) {
    if (options[key] !== undefined) result[key] = options[key];
    if (!Number.isSafeInteger(result[key]) || result[key] < 1 || result[key] > DEFAULT_LIMITS[key]) throw new Error(`${key} must be a positive integer no larger than ${DEFAULT_LIMITS[key]}`);
  }
  return result;
}
function safePath(value) {
  return typeof value === "string" && value.length > 0 && !/[:\\\x00-\x1f\x7f]/.test(value)
    && !path.posix.isAbsolute(value) && value.split("/").every(part => part && part !== "." && part !== ".." && part !== ".git");
}
async function safeFile(target, relativePath) {
  if (!safePath(relativePath)) throw new Error(`Unsafe repository path: ${relativePath}`);
  const root = await fs.realpath(target);
  let current = root;
  for (const part of relativePath.split("/")) {
    current = path.join(current, part);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${relativePath}`);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return current;
}
function git(target, args, maxBuffer = 4096) {
  return spawnSync("git", ["-C", target, ...args], { encoding: null, maxBuffer });
}
function revisionAvailable(target, revision) {
  return REVISION.test(revision ?? "") && git(target, ["cat-file", "-e", `${revision}^{commit}`]).status === 0;
}
function historicalArtifact(target, revision, artifact, maxBytes) {
  if (!safePath(artifact?.path) || !DIGEST.test(artifact?.sha256 ?? "")) return { status: "invalid", reason: "invalid artifact path or digest" };
  if (!REVISION.test(revision ?? "")) return { status: "missing", reason: "exact source revision is not recorded" };
  const object = `${revision}:${artifact.path}`;
  const type = git(target, ["cat-file", "-t", object]);
  if (type.status !== 0) return { status: "missing", reason: "artifact is absent at the recorded Git revision" };
  if (type.stdout.toString().trim() !== "blob") return { status: "invalid", reason: "artifact is not a Git blob" };
  // Check the tree mode too: a Git symlink is also a blob.
  const tree = git(target, ["ls-tree", "-z", revision, "--", artifact.path]);
  if (tree.status !== 0 || !/^100(644|755) blob /.test(tree.stdout.toString())) return { status: "invalid", reason: "artifact is not a regular Git file" };
  const sizeResult = git(target, ["cat-file", "-s", object]);
  const size = sizeResult.status === 0 ? Number(sizeResult.stdout.toString().trim()) : NaN;
  if (!Number.isSafeInteger(size) || size < 0 || size > maxBytes) return { status: "invalid", reason: "artifact exceeds size limit or has unknown size" };
  const result = git(target, ["cat-file", "blob", object], maxBytes + 1024);
  if (result.status !== 0 || result.error || result.stdout?.length !== size) return { status: "missing", reason: "recorded artifact bytes could not be retrieved" };
  if (sha256(result.stdout) !== artifact.sha256) return { status: "invalid", reason: "digest mismatch at recorded Git revision" };
  if (artifact.size_bytes !== undefined && artifact.size_bytes !== size) return { status: "invalid", reason: "recorded artifact size mismatch" };
  return { status: "verified", size_bytes: size, bytes: result.stdout };
}
async function selectEntries(target, options, explicit = false) {
  const registry = options.registry ?? JSON.parse(await fs.readFile(await safeFile(target, REGISTRY_PATH), "utf8"));
  if (!Array.isArray(registry?.entries)) throw new Error("Evidence registry entries must be an array");
  for (const name of ["evidenceIds", "workItemIds"]) if (options[name] !== undefined
    && (!Array.isArray(options[name]) || options[name].some(value => typeof value !== "string" || !value))) throw new Error(`${name} must be an array of non-empty IDs`);
  const ids = options.evidenceIds === undefined ? null : new Set(options.evidenceIds);
  const workIds = options.workItemIds === undefined ? null : new Set(options.workItemIds);
  if (explicit && (!ids || ids.size === 0)) throw new Error("Select at least one explicit evidence ID for export");
  if (options.evidenceIds && ids.size !== options.evidenceIds.length) throw new Error("Duplicate selected evidence IDs");
  const selected = registry.entries.filter(entry => (!ids || ids.has(entry.id)) && (!workIds || workIds.has(entry.work_item_id)));
  const seen = new Set();
  for (const entry of selected) {
    if (typeof entry.id !== "string" || !entry.id || seen.has(entry.id)) throw new Error("Invalid or duplicate evidence record ID");
    seen.add(entry.id);
  }
  if (ids) for (const id of ids) if (!seen.has(id)) throw new Error(`Selected evidence is missing: ${id}`);
  return selected;
}
function failure(error, extras = {}) { return { valid: false, errors: [error.message ?? String(error)], mutation_performed: false, acceptance_granted: false,
  next_action: "Inspect the selected evidence and its original source; recover exact recorded bytes or correct the archive input before retrying.", ...extras }; }

/** Read only. A historical source is never replaced with current working-tree bytes. */
export async function inspectEvidenceDurability(target, options = {}) {
  try {
    const bound = limits(options);
    const entries = await selectEntries(target, options);
    const items = entries.map(entry => {
      const available = revisionAvailable(target, entry.scope_revision);
      const artifacts = (entry.artifacts ?? []).map(artifact => {
        const { bytes: _bytes, ...result } = historicalArtifact(target, entry.scope_revision, artifact, bound.maxArtifactBytes);
        return { path: artifact.path, sha256: artifact.sha256, ...result };
      });
      const missing = !available || artifacts.some(artifact => artifact.status !== "verified");
      return { evidence_id: entry.id, work_item_id: entry.work_item_id, scope_revision: entry.scope_revision,
        invalidated: Boolean(entry.invalidated_at), original_revision_available: available,
        candidate_scope: options.candidateRevision ? (entry.scope_revision === options.candidateRevision ? "current-candidate" : "historical") : "unspecified",
        status: missing ? "historical-evidence-debt" : "verified", artifacts,
        next_action: missing ? "Retrieve the original commit and recorded artifact bytes from their source; preserve missing and invalidated attempts." : "Use these measurements only with an eligible candidate-specific review." };
    });
    return { schema_version: "temple.evidence-durability/v1", valid: items.every(item => item.status === "verified"), errors: [],
      mutation_performed: false, acceptance_granted: false, items,
      next_action: items.some(item => item.status !== "verified") ? "Retrieve the named historical sources; current working-tree content cannot repair a missing recorded version." : "The selected historical artifacts are retrievable; assess candidate acceptance separately.",
      current_candidate_debt: items.filter(item => item.status !== "verified" && item.candidate_scope === "current-candidate").length,
      historical_debt: items.filter(item => item.status !== "verified" && item.candidate_scope !== "current-candidate").length };
  } catch (error) { return failure(error, { items: [] }); }
}

export async function exportEvidenceBundle(target, options = {}) {
  try {
    const bound = limits(options);
    const entries = await selectEntries(target, options, true);
    if (entries.length > bound.maxEntries) throw new Error("Evidence selection exceeds entry limit");
    const artifacts = [];
    let total = 0;
    for (const entry of entries) {
      if (!revisionAvailable(target, entry.scope_revision)) throw new Error(`${entry.id}: original Git revision is unavailable or unrecorded; retrieve it before export`);
      if (!Array.isArray(entry.artifacts)) throw new Error(`${entry.id}: artifacts must be an array`);
      for (const artifact of entry.artifacts) {
        const source = historicalArtifact(target, entry.scope_revision, artifact, bound.maxArtifactBytes);
        if (source.status !== "verified") throw new Error(`${entry.id}:${artifact.path}: ${source.reason}`);
        total += source.size_bytes;
        if (total > bound.maxTotalBytes) throw new Error("Evidence selection exceeds total size limit");
        artifacts.push({ evidence_id: entry.id, scope_revision: entry.scope_revision, path: artifact.path,
          sha256: artifact.sha256, size_bytes: source.size_bytes, content_base64: source.bytes.toString("base64") });
      }
    }
    const content = { schema_version: EVIDENCE_BUNDLE_SCHEMA, entries: structuredClone(entries), artifacts };
    const bundle = { ...content, bundle_sha256: digest(content) };
    const verified = await verifyEvidenceBundle(bundle, { ...options, target });
    if (!verified.valid) return verified;
    if (options.outputPath) await durableAtomicCreate(await safeFile(target, options.outputPath), formatJson(bundle));
    return { ...verified, bundle, output_path: options.outputPath ?? null, mutation_performed: Boolean(options.outputPath) };
  } catch (error) { return failure(error); }
}

/** Integrity establishes archive consistency, not review approval or source authentication. */
export async function verifyEvidenceBundle(bundle, options = {}) {
  try {
    const bound = limits(options);
    if (bundle?.schema_version !== EVIDENCE_BUNDLE_SCHEMA) throw new Error(`schema_version must be ${EVIDENCE_BUNDLE_SCHEMA}`);
    if (!Array.isArray(bundle.entries) || !Array.isArray(bundle.artifacts) || !bundle.entries.length || bundle.entries.length > bound.maxEntries) throw new Error("Invalid evidence archive entries or artifacts");
    if (bundle.artifacts.length > bound.maxEntries * 100) throw new Error("Archive artifact count exceeds limit");
    // Bound metadata as well as decoded blobs. Limit checks precede decoding and hashing.
    if (JSON.stringify(bundle.entries).length > 4 * 1024 * 1024) throw new Error("Archive metadata exceeds limit");
    const records = new Map();
    const expected = new Map();
    for (const entry of bundle.entries) {
      if (typeof entry?.id !== "string" || !entry.id || records.has(entry.id)) throw new Error("Invalid or duplicate evidence record ID");
      if (!REVISION.test(entry.scope_revision ?? "") || !Array.isArray(entry.artifacts)) throw new Error(`${entry.id}: invalid exact revision or artifact list`);
      records.set(entry.id, entry);
      for (const artifact of entry.artifacts) {
        if (!safePath(artifact?.path) || !DIGEST.test(artifact?.sha256 ?? "")) throw new Error(`${entry.id}: unsafe artifact path or invalid digest`);
        const key = JSON.stringify([entry.id, artifact.path]);
        if (expected.has(key)) throw new Error(`${entry.id}: duplicate artifact path`);
        expected.set(key, { ...artifact, scope_revision: entry.scope_revision });
      }
    }
    const sources = new Map();
    let total = 0;
    for (const artifact of bundle.artifacts) {
      if (!safePath(artifact?.path)) throw new Error("Unsafe archive artifact path");
      const key = JSON.stringify([artifact.evidence_id, artifact.path]);
      const recorded = expected.get(key);
      if (!recorded) throw new Error("Unselected, duplicate or unexpected archive artifact");
      if (artifact.scope_revision !== recorded.scope_revision || artifact.sha256 !== recorded.sha256) throw new Error("Archive artifact conflicts with its evidence record");
      if (!Number.isSafeInteger(artifact.size_bytes) || artifact.size_bytes < 0 || artifact.size_bytes > bound.maxArtifactBytes) throw new Error("Archive artifact exceeds size limit or has invalid size");
      total += artifact.size_bytes;
      if (total > bound.maxTotalBytes) throw new Error("Archive exceeds total size limit");
      if (typeof artifact.content_base64 !== "string" || artifact.content_base64.length !== 4 * Math.ceil(artifact.size_bytes / 3)
        || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(artifact.content_base64)) throw new Error("Archive artifact has invalid base64 or encoded size");
      const bytes = Buffer.from(artifact.content_base64, "base64");
      if (bytes.length !== artifact.size_bytes || bytes.toString("base64") !== artifact.content_base64 || sha256(bytes) !== artifact.sha256) throw new Error("Archive artifact size or digest mismatch");
      if (recorded.size_bytes !== undefined && recorded.size_bytes !== bytes.length) throw new Error("Evidence record artifact size mismatch");
      const sourceKey = JSON.stringify([artifact.scope_revision, artifact.path]);
      if (sources.has(sourceKey) && sources.get(sourceKey) !== artifact.sha256) throw new Error("Divergent archive records for the same revision and path");
      sources.set(sourceKey, artifact.sha256);
      expected.delete(key);
    }
    if (expected.size) throw new Error("Archive is missing selected evidence artifacts");
    const { bundle_sha256: checksum, ...content } = bundle;
    if (!DIGEST.test(checksum ?? "") || digest(content) !== checksum) throw new Error("Archive manifest digest mismatch");
    const revisions = [...new Set(bundle.entries.map(entry => entry.scope_revision))].map(revision => ({ revision,
      available: options.target ? revisionAvailable(options.target, revision) : null }));
    // When source Git objects exist locally, a self-consistent forged archive
    // cannot contradict those exact source bytes. An absent source stays absent.
    const available = new Set(revisions.filter(entry => entry.available).map(entry => entry.revision));
    for (const artifact of bundle.artifacts) {
      if (!available.has(artifact.scope_revision)) continue;
      const source = historicalArtifact(options.target, artifact.scope_revision, artifact, bound.maxArtifactBytes);
      if (source.status !== "verified") throw new Error(`Archive contradicts available original Git source: ${artifact.path}: ${source.reason}`);
    }
    return { valid: true, errors: [], mutation_performed: false, acceptance_granted: false, archive_integrity: "verified",
      source_authentication: "not-established-by-archive", original_revision_availability: revisions,
      bundle_sha256: checksum, evidence_count: bundle.entries.length, artifact_count: bundle.artifacts.length, size_bytes: total,
      invalidated_evidence_ids: bundle.entries.filter(entry => entry.invalidated_at).map(entry => entry.id),
      next_action: revisions.some(entry => entry.available === false) ? "Archive bytes are retrievable; fetch the original Git commits separately before claiming revision availability." : "Apply the current candidate's independent acceptance requirements separately." };
  } catch (error) { return failure(error, { archive_integrity: "invalid" }); }
}

/** Store the selected archive immutably; never create/replace normalized evidence or gate records. */
export async function importEvidenceBundle(target, bundle, options = {}) {
  const verification = await verifyEvidenceBundle(bundle, { ...options, target });
  if (!verification.valid) return verification;
  const relativePath = `${EVIDENCE_ARCHIVE_DIRECTORY}/${verification.bundle_sha256}.json`;
  try {
    const destination = await safeFile(target, relativePath);
    try {
      await durableAtomicCreate(destination, formatJson(bundle));
      return { ...verification, archive_path: relativePath, mutation_performed: true, registry_mutated: false };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const existing = JSON.parse(await fs.readFile(destination, "utf8"));
      if (digest(existing) !== digest(bundle)) throw new Error("Archive destination contains conflicting bytes; preserve it for investigation");
      return { ...verification, archive_path: relativePath, mutation_performed: false, registry_mutated: false, already_present: true };
    }
  } catch (error) { return failure(error); }
}

export async function retrieveEvidenceBundleArtifact(bundle, options = {}) {
  const verification = await verifyEvidenceBundle(bundle, options);
  if (!verification.valid) return verification;
  const artifact = bundle.artifacts.find(entry => entry.evidence_id === options.evidenceId && entry.path === options.path);
  if (!artifact) return failure(new Error("Selected artifact is missing from this archive"));
  return { ...verification, path: artifact.path, sha256: artifact.sha256, bytes: Buffer.from(artifact.content_base64, "base64") };
}
