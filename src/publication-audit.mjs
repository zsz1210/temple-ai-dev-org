import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { evidenceProfile, readEvidenceProfiles } from "./evidence-profiles.mjs";

const execFileAsync = promisify(execFile);
export const PUBLICATION_AUDIT_SCHEMA = "temple.publication-audit/v1";
export const PUBLICATION_SURFACES = ["repository", "package", "both"];

const TEXT_RULES = [
  {
    id: "private-key-header",
    evidenceClass: "secret-material",
    pattern: /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/g,
    remediation: "Remove the key material and rotate the affected credential before publication."
  },
  {
    id: "openai-api-key",
    evidenceClass: "secret-material",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
    remediation: "Remove and rotate the Provider credential before publication."
  },
  {
    id: "github-token",
    evidenceClass: "secret-material",
    pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
    remediation: "Remove and rotate the GitHub credential before publication."
  },
  {
    id: "aws-access-key",
    evidenceClass: "secret-material",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    remediation: "Remove and rotate the AWS credential before publication."
  },
  {
    id: "npm-access-token",
    evidenceClass: "secret-material",
    pattern: /\bnpm_[A-Za-z0-9]{20,}\b/g,
    remediation: "Remove and rotate the npm credential before publication."
  },
  {
    id: "maintainer-home-path-posix",
    evidenceClass: "local-environment",
    pattern: /\/(?:Users|home)\/([A-Za-z0-9._-]+)/g,
    usernameGroup: 1,
    remediation: "Replace the maintainer-specific absolute path with a repository-relative path or placeholder."
  },
  {
    id: "maintainer-home-path-windows",
    evidenceClass: "local-environment",
    pattern: /\b[A-Za-z]:\\Users\\([A-Za-z0-9._-]+)/g,
    usernameGroup: 1,
    remediation: "Replace the maintainer-specific absolute path with a repository-relative path or placeholder."
  },
  {
    id: "private-ipv4",
    evidenceClass: "local-environment",
    pattern: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g,
    remediation: "Replace the private network address with a documentation-range address or placeholder."
  },
  {
    id: "private-tailnet-hostname",
    evidenceClass: "local-environment",
    pattern: /\b[a-z0-9][a-z0-9-]*\.tail[a-z0-9-]*\.ts\.net\b/gi,
    remediation: "Replace the private Tailnet hostname with a placeholder."
  }
];

const CLASS_ORDER = new Map([["blocked", 0], ["review-required", 1], ["allowed", 2]]);
const MAX_COMMAND_BUFFER = 64 * 1024 * 1024;

function gitOptions(target, maxBuffer = MAX_COMMAND_BUFFER) {
  return { cwd: target, encoding: "buffer", maxBuffer };
}

async function git(target, args, maxBuffer = MAX_COMMAND_BUFFER) {
  try {
    const { stdout } = await execFileAsync("git", args, gitOptions(target, maxBuffer));
    return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  } catch {
    throw new Error("Git publication inspection failed; verify the repository and requested revision locally");
  }
}

function safeRelativePath(value) {
  const normalized = String(value).split(path.sep).join("/");
  if (!normalized || path.posix.isAbsolute(normalized) || normalized.includes("\\") || path.posix.normalize(normalized) !== normalized || normalized.startsWith("../")) {
    throw new Error("Publication audit encountered an unsafe tracked path");
  }
  return normalized;
}

async function repositoryFiles(target) {
  const output = await git(target, ["ls-files", "-z"]);
  return output.toString("utf8").split("\0").filter(Boolean).map(safeRelativePath).sort();
}

async function packageFiles(target) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  let stdout;
  try {
    ({ stdout } = await execFileAsync(npmCommand, ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: target,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024
    }));
  } catch {
    throw new Error("npm package publication inspection failed; run npm pack --dry-run locally for diagnostics");
  }
  const result = JSON.parse(stdout);
  if (!Array.isArray(result) || result.length !== 1 || !Array.isArray(result[0]?.files)) {
    throw new Error("npm package publication inspection returned an invalid manifest");
  }
  return result[0].files.map((entry) => safeRelativePath(entry.path)).sort();
}

function isSensitiveDotenv(relativePath) {
  const name = path.posix.basename(relativePath).toLowerCase();
  if (name !== ".env" && !name.startsWith(".env.")) return false;
  return !/\.(?:example|sample|template)$/.test(name);
}

function isLocalOnlyRuntimePath(relativePath) {
  if (/^\.ai-org\/(?:telemetry|runtime|local)(?:\/|$)/.test(relativePath)) return true;
  const name = path.posix.basename(relativePath);
  return /^(?:account-(?:usage|limits|balance)|usage-limits|reset-availability)(?:[.-].*)?\.json$/i.test(name);
}

function lineNumberFor(content, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) if (content.charCodeAt(cursor) === 10) line += 1;
  return line;
}

function valueFingerprint(ruleId, relativePath, matchedValue) {
  return crypto.createHash("sha256").update(ruleId).update("\0").update(relativePath).update("\0").update(matchedValue).digest("hex");
}

function scanText(content, relativePath, syntheticUsernames) {
  const findings = [];
  for (const rule of TEXT_RULES) {
    const expression = new RegExp(rule.pattern.source, rule.pattern.flags);
    for (const match of content.matchAll(expression)) {
      if (rule.id === "private-ipv4" && /^\/\d{1,2}/.test(content.slice((match.index ?? 0) + match[0].length))) continue;
      if (rule.usernameGroup) {
        const username = String(match[rule.usernameGroup] ?? "").toLowerCase();
        if (syntheticUsernames.has(username)) continue;
      }
      findings.push({
        rule_id: rule.id,
        evidence_class: rule.evidenceClass,
        path: relativePath,
        line: lineNumberFor(content, match.index ?? 0),
        remediation: rule.remediation,
        fingerprint: valueFingerprint(rule.id, relativePath, match[0])
      });
    }
  }
  return findings;
}

async function readCurrentFile(target, relativePath, maximumBytes) {
  const absolutePath = path.join(target, relativePath);
  const stat = await fs.lstat(absolutePath);
  if (stat.isSymbolicLink()) return { kind: "symlink", buffer: Buffer.from(await fs.readlink(absolutePath), "utf8") };
  if (!stat.isFile()) return { kind: "unsupported", buffer: Buffer.alloc(0) };
  if (stat.size > maximumBytes) return { kind: "oversize", buffer: Buffer.alloc(0), size: stat.size };
  const buffer = await fs.readFile(absolutePath);
  return { kind: buffer.includes(0) ? "binary" : "text", buffer, size: stat.size };
}

function metadataFinding(ruleId, evidenceClass, relativePath, remediation) {
  return { rule_id: ruleId, evidence_class: evidenceClass, path: relativePath, line: 1, remediation, fingerprint: null };
}

async function scanCurrentSurface(target, surface, files, policy) {
  const findings = [];
  const binaryPaths = [];
  const fileDigests = new Map();
  let textFiles = 0;
  for (const relativePath of files) {
    if (isSensitiveDotenv(relativePath)) {
      findings.push(metadataFinding("sensitive-dotenv", "secret-material", relativePath, "Remove the tracked environment file and rotate any contained credentials."));
    }
    if (isLocalOnlyRuntimePath(relativePath)) {
      findings.push(metadataFinding("local-only-runtime-data", "local-only-data", relativePath, "Keep raw runtime or live account state outside the tracked publication surface."));
    }
    let read;
    try {
      read = await readCurrentFile(target, relativePath, policy.max_text_file_bytes);
    } catch {
      findings.push(metadataFinding("unreadable-tracked-file", "inspection-failure", relativePath, "Make the tracked file readable and rerun the audit."));
      continue;
    }
    if (read.kind === "oversize") {
      findings.push(metadataFinding("oversize-text-or-binary", "inspection-failure", relativePath, `Review or reduce the file below ${policy.max_text_file_bytes} bytes before publication.`));
      continue;
    }
    if (read.kind === "unsupported") {
      findings.push(metadataFinding("unsupported-tracked-entry", "inspection-failure", relativePath, "Replace the unsupported tracked entry with a regular file or reviewed symlink."));
      continue;
    }
    if (read.kind === "binary") {
      binaryPaths.push(relativePath);
      continue;
    }
    textFiles += 1;
    fileDigests.set(relativePath, crypto.createHash("sha256").update(read.buffer).digest("hex"));
    findings.push(...scanText(read.buffer.toString("utf8"), relativePath, new Set(policy.synthetic_usernames.map((entry) => entry.toLowerCase()))));
  }
  return { surface, files: files.length, textFiles, binaryPaths, fileDigests, findings };
}

function reviewedFixtureKey(pathname, ruleId, line) {
  return [pathname, ruleId, line].join("\0");
}

async function reviewedAdapterFixtureState(target, repository, policy) {
  const state = new Map();
  const blockers = [];
  for (const entry of policy.reviewed_adapter_fixtures ?? []) {
    const drift = (reason) => blockers.push(metadataFinding(
      "reviewed-adapter-fixture-drift",
      "inspection-failure",
      entry.path,
      `Re-review the adapter fixture before publication: ${reason}.`
    ));
    if (repository.fileDigests.get(entry.path) !== entry.source_sha256) {
      drift("the tracked source digest no longer matches the reviewed digest");
      continue;
    }
    let manifest;
    try {
      manifest = JSON.parse(await fs.readFile(path.join(target, ...entry.manifest_path.split("/")), "utf8"));
    } catch {
      drift("the provenance manifest is missing or unreadable");
      continue;
    }
    const recorded = Array.isArray(manifest?.files)
      ? manifest.files.find((file) => file?.path === entry.path)
      : null;
    if (recorded?.sha256 !== entry.source_sha256) {
      drift("the provenance manifest does not record the reviewed source digest");
      continue;
    }
    state.set(reviewedFixtureKey(entry.path, entry.rule_id, entry.line), {
      remaining: entry.occurrence_count,
      entry
    });
  }
  return { state, blockers };
}

async function resolveBaselineRevision(target, configuredRevision) {
  if (!configuredRevision) return null;
  const output = await git(target, ["rev-parse", "--verify", `${configuredRevision}^{commit}`], 1024 * 1024);
  const resolved = output.toString("utf8").trim();
  if (resolved !== configuredRevision) throw new Error("Reviewed legacy baseline must resolve to the configured full Git commit id");
  return resolved;
}

async function baselineCounts(target, revision, currentFindings, policy) {
  if (!revision) return new Map();
  const candidatePaths = [...new Set(currentFindings.filter((entry) => entry.evidence_class === "local-environment").map((entry) => entry.path))].sort();
  const counts = new Map();
  const synthetic = new Set(policy.synthetic_usernames.map((entry) => entry.toLowerCase()));
  for (const relativePath of candidatePaths) {
    let buffer;
    try {
      buffer = await git(target, ["show", `${revision}:${relativePath}`], policy.max_text_file_bytes + 1);
    } catch {
      continue;
    }
    if (buffer.length > policy.max_text_file_bytes || buffer.includes(0)) continue;
    for (const finding of scanText(buffer.toString("utf8"), relativePath, synthetic)) {
      if (finding.evidence_class !== "local-environment") continue;
      counts.set(finding.fingerprint, (counts.get(finding.fingerprint) ?? 0) + 1);
    }
  }
  return counts;
}

function classifyFinding(finding, profile, surface, legacyCounts, reviewedFixtures) {
  if (["secret-material", "local-only-data", "inspection-failure"].includes(finding.evidence_class)) {
    return { classification: "blocked", disposition: "must-not-publish" };
  }
  if (finding.evidence_class !== "local-environment") {
    return { classification: "review-required", disposition: "manual-review" };
  }
  if (surface === "repository") {
    const reviewed = reviewedFixtures.get(reviewedFixtureKey(finding.path, finding.rule_id, finding.line));
    if (reviewed) {
      if (reviewed.remaining > 0) {
        reviewed.remaining -= 1;
        return { classification: "allowed", disposition: "reviewed-adapter-fixture" };
      }
      return { classification: "blocked", disposition: "reviewed-adapter-fixture-excess" };
    }
  }
  const remaining = surface === "repository" && finding.fingerprint ? legacyCounts.get(finding.fingerprint) ?? 0 : 0;
  if (remaining > 0) {
    legacyCounts.set(finding.fingerprint, remaining - 1);
    return {
      classification: profile.retained_legacy_repository,
      disposition: "retained-legacy"
    };
  }
  return {
    classification: profile.local_environment,
    disposition: profile.local_environment === "review-required" ? "policy-allowed" : "new"
  };
}

function publicFinding(finding, classification) {
  return {
    rule_id: finding.rule_id,
    evidence_class: finding.evidence_class,
    classification: classification.classification,
    disposition: classification.disposition,
    path: finding.path,
    line: finding.line,
    count: 1,
    remediation: finding.remediation
  };
}

function aggregateFindings(findings) {
  const byKey = new Map();
  for (const finding of findings) {
    const key = [finding.rule_id, finding.evidence_class, finding.classification, finding.disposition, finding.path, finding.line, finding.remediation].join("\0");
    const existing = byKey.get(key);
    if (existing) existing.count += finding.count;
    else byKey.set(key, { ...finding });
  }
  return [...byKey.values()].sort((left, right) =>
    (CLASS_ORDER.get(left.classification) - CLASS_ORDER.get(right.classification)) ||
    left.rule_id.localeCompare(right.rule_id) ||
    left.path.localeCompare(right.path) ||
    left.line - right.line
  );
}

function summarize(surfaces) {
  const allFindings = surfaces.flatMap((surface) => surface.findings);
  return {
    blocked: allFindings.filter((entry) => entry.classification === "blocked").reduce((sum, entry) => sum + entry.count, 0),
    review_required: allFindings.filter((entry) => entry.classification === "review-required").reduce((sum, entry) => sum + entry.count, 0),
    reviewed_adapter_fixtures: allFindings.filter((entry) => entry.disposition === "reviewed-adapter-fixture").reduce((sum, entry) => sum + entry.count, 0),
    allowed_files: surfaces.reduce((sum, surface) => sum + Math.max(0, surface.files - new Set(surface.findings.filter((entry) => entry.classification !== "allowed").map((entry) => entry.path)).size), 0),
    files: surfaces.reduce((sum, surface) => sum + surface.files, 0),
    text_files: surfaces.reduce((sum, surface) => sum + surface.text_files, 0),
    binary_files_requiring_review: surfaces.reduce((sum, surface) => sum + surface.binary_files_requiring_review, 0)
  };
}

export async function buildPublicationAudit(target, options = {}) {
  const { policy, source } = await readEvidenceProfiles(target);
  const profile = evidenceProfile(policy, options.profileId);
  const requestedSurface = options.surface ?? "both";
  if (!PUBLICATION_SURFACES.includes(requestedSurface)) throw new Error(`Unknown publication surface: ${requestedSurface}`);
  const surfaceIds = requestedSurface === "both" ? ["repository", "package"] : [requestedSurface];
  const scanned = [];
  for (const surfaceId of surfaceIds) {
    const providedFiles = options.filesBySurface?.[surfaceId];
    const files = providedFiles
      ? [...providedFiles].map(safeRelativePath).sort()
      : surfaceId === "repository" ? await repositoryFiles(target) : await packageFiles(target);
    scanned.push(await scanCurrentSurface(target, surfaceId, files, policy));
  }
  const repository = scanned.find((entry) => entry.surface === "repository");
  const configuredBaseline = profile.id === "private" ? null : policy.reviewed_legacy_baseline?.revision ?? null;
  const resolvedBaseline = repository ? await resolveBaselineRevision(target, configuredBaseline) : null;
  const legacy = repository ? await baselineCounts(target, resolvedBaseline, repository.findings, policy) : new Map();
  const reviewedAdapterFixtures = repository
    ? await reviewedAdapterFixtureState(target, repository, policy)
    : { state: new Map(), blockers: [] };
  const surfaces = scanned.map((surface) => {
    const classified = surface.findings.map((finding) => publicFinding(
      finding,
      classifyFinding(finding, profile, surface.surface, legacy, reviewedAdapterFixtures.state)
    ));
    const exceptionBlockers = surface.surface === "repository" ? reviewedAdapterFixtures.blockers : [];
    if (surface.surface === "repository") {
      for (const reviewed of reviewedAdapterFixtures.state.values()) {
        if (reviewed.remaining > 0) {
          exceptionBlockers.push(metadataFinding(
            "reviewed-adapter-fixture-count-mismatch",
            "inspection-failure",
            reviewed.entry.path,
            "Re-review the adapter fixture because the approved occurrence count was not found."
          ));
        }
      }
    }
    const binaryFindings = surface.binaryPaths.map((relativePath) => ({
      rule_id: "binary-review",
      evidence_class: "binary-content",
      classification: "review-required",
      disposition: "manual-review",
      path: relativePath,
      line: 1,
      count: 1,
      remediation: "Review rendered binary content separately; this text audit does not declare it safe."
    }));
    return {
      id: surface.surface,
      files: surface.files,
      text_files: surface.textFiles,
      binary_files_requiring_review: surface.binaryPaths.length,
      findings: aggregateFindings([
        ...classified,
        ...exceptionBlockers.map((finding) => publicFinding(finding, { classification: "blocked", disposition: "must-not-publish" })),
        ...binaryFindings
      ])
    };
  });
  const summary = summarize(surfaces);
  return {
    schema_version: PUBLICATION_AUDIT_SCHEMA,
    profile: profile.id,
    profile_source: source,
    requested_surface: requestedSurface,
    status: summary.blocked > 0 ? "blocked" : summary.review_required > 0 ? "review-required" : "allowed",
    legacy_baseline: resolvedBaseline ? { revision: resolvedBaseline, scope: "repository-only", values_retained_in_report: false } : null,
    summary,
    allowed_evidence: [...policy.public_evidence],
    local_only_evidence: [...policy.local_only_evidence],
    surfaces,
    authority: {
      canonical_state_changed: false,
      repository_visibility_changed: false,
      publication_authorized: false,
      security_certification: false
    }
  };
}
