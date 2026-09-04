#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { TextDecoder } from "node:util";

const ROOT = process.cwd();
const OUTPUT_FLAG = process.argv.indexOf("--output");
const OUTPUT = OUTPUT_FLAG >= 0 ? process.argv[OUTPUT_FLAG + 1] : null;
const REVIEWED_FIXTURES_PATH = path.join(ROOT, ".ai-org/artifacts/WI-0165/reviewed-secret-fixtures.json");
const MAX_TEXT_BYTES = 2_097_152;
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const decoder = new TextDecoder("utf-8", { fatal: true });

if (!OUTPUT) throw new Error("Usage: audit-git-history-text.mjs --output <path>");

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: options.encoding === "buffer" ? null : options.encoding ?? "utf8",
    input: options.input,
    maxBuffer: options.maxBuffer ?? 128 * 1024 * 1024
  });
}

function lines(value) {
  return String(value).split("\n").map((entry) => entry.trim()).filter(Boolean);
}

function refsBelow(prefix) {
  return lines(git(["for-each-ref", "--format=%(refname)%00%(objectname)", prefix])).map((entry) => {
    const [name, oid] = entry.split("\0");
    if (!name?.startsWith(prefix) || !SHA_PATTERN.test(oid ?? "")) throw new Error(`Invalid ref record below ${prefix}`);
    return { name, oid };
  });
}

const main = git(["rev-parse", "--verify", "refs/heads/main^{commit}"]).trim();
const originMain = git(["rev-parse", "--verify", "refs/remotes/origin/main^{commit}"]).trim();
if (main !== originMain) throw new Error("Local main and origin/main differ; refuse an ambiguous public boundary");

const tags = refsBelow("refs/tags/");
const pullHeads = refsBelow("refs/temple-audit/pull/");
if (pullHeads.length === 0) throw new Error("No temporary GitHub pull-request head refs found below refs/temple-audit/pull/");
const includedRefs = ["refs/heads/main", ...tags.map((entry) => entry.name), ...pullHeads.map((entry) => entry.name)];
const publicPullHeads = pullHeads.map((entry) => ({ ...entry, name: entry.name.replace("refs/temple-audit/", "refs/") }));

function reachableObjectIds(refs) {
  return new Set(lines(git(["rev-list", "--objects", ...refs])).map((row) => row.slice(0, 40)));
}

const mainReachable = reachableObjectIds(["refs/heads/main"]);
const tagReachable = reachableObjectIds(tags.map((entry) => entry.name));
const pullReachable = reachableObjectIds(pullHeads.map((entry) => entry.name));

const objectRows = lines(git(["rev-list", "--objects", ...includedRefs]));
const objectPath = new Map();
for (const row of objectRows) {
  const separator = row.indexOf(" ");
  const oid = separator < 0 ? row : row.slice(0, separator);
  const pathname = separator < 0 ? null : row.slice(separator + 1);
  if (!SHA_PATTERN.test(oid)) throw new Error("Git returned an invalid reachable object id");
  if (!objectPath.has(oid) || (!objectPath.get(oid) && pathname)) objectPath.set(oid, pathname);
}

const objectIds = [...objectPath.keys()];
const typeRows = lines(git(
  ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
  { input: `${objectIds.join("\n")}\n` }
));
const objects = new Map();
for (const row of typeRows) {
  const [oid, type, sizeText] = row.split(" ");
  const size = Number(sizeText);
  if (!SHA_PATTERN.test(oid ?? "") || !["blob", "commit", "tree", "tag"].includes(type) || !Number.isSafeInteger(size) || size < 0) {
    throw new Error("Git returned an invalid object classification");
  }
  objects.set(oid, { type, size });
}
if (objects.size !== objectIds.length) throw new Error("Not every reachable object was classified");

const excludedMediaExtensions = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".avif", ".heic", ".bmp", ".tif", ".tiff",
  ".pdf", ".mp3", ".m4a", ".wav", ".aac", ".flac", ".ogg", ".mp4", ".m4v", ".mov", ".webm", ".avi", ".mkv",
  ".woff", ".woff2", ".ttf", ".otf"
]);
const syntheticUsernames = new Set(["demo", "example", "fixture", "sample", "test", "tester"]);

const rules = [
  { id: "private-key-header", category: "credential", pattern: /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/g },
  { id: "openai-api-key", category: "credential", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { id: "github-token", category: "credential", pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
  { id: "aws-access-key", category: "credential", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "npm-access-token", category: "credential", pattern: /\bnpm_[A-Za-z0-9]{20,}\b/g },
  { id: "maintainer-home-path-posix", category: "local-environment", pattern: /\/(?:Users|home)\/([A-Za-z0-9._-]+)/g, usernameGroup: 1 },
  { id: "maintainer-home-path-windows", category: "local-environment", pattern: /\b[A-Za-z]:\\Users\\([A-Za-z0-9._-]+)/g, usernameGroup: 1 },
  { id: "private-ipv4", category: "local-environment", pattern: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g },
  { id: "private-tailnet-hostname", category: "local-environment", pattern: /\b[a-z0-9][a-z0-9-]*\.tail[a-z0-9-]*\.ts\.net\b/gi },
  { id: "email-address", category: "privacy-metadata", pattern: /\b[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,63})\b/gi, domainGroup: 1 }
];

function lineNumber(content, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) if (content.charCodeAt(cursor) === 10) line += 1;
  return line;
}

function fixtureLikePath(pathname) {
  return /(^|\/)(?:test|tests|fixtures?|__fixtures__)(?:\/|$)/i.test(pathname) || /(?:^|\/)[^/]*(?:fixture|sample|example)[^/]*$/i.test(pathname);
}

function credentialPayload(ruleId, matched) {
  if (ruleId === "private-key-header") return "";
  return matched.replace(/^(?:sk-(?:proj-)?|gh[pousr]_|AKIA|npm_)/i, "").replace(/[^A-Za-z0-9]/g, "");
}

function clearlySyntheticCredential(ruleId, matched, pathname) {
  if (!fixtureLikePath(pathname) || ruleId === "private-key-header") return false;
  const payload = credentialPayload(ruleId, matched);
  if (payload.length < 16) return false;
  return new Set(payload.toLowerCase()).size <= 2;
}

function classificationFor(rule, matched, pathname) {
  if (rule.category !== "credential") return "review-required";
  return clearlySyntheticCredential(rule.id, matched, pathname) ? "synthetic-fixture" : "blocked";
}

const findings = [];
const content = {
  scanned_text: { blobs: 0, bytes: 0 },
  excluded_media: { blobs: 0, bytes: 0, by_extension: {} },
  non_text_binary: { blobs: 0, bytes: 0 },
  inspection_failure: { blobs: 0, bytes: 0, reasons: {} }
};

for (const [oid, metadata] of objects) {
  if (metadata.type !== "blob") continue;
  const pathname = objectPath.get(oid) ?? "(path-unavailable)";
  const extension = path.posix.extname(pathname).toLowerCase();
  if (excludedMediaExtensions.has(extension)) {
    content.excluded_media.blobs += 1;
    content.excluded_media.bytes += metadata.size;
    content.excluded_media.by_extension[extension] = (content.excluded_media.by_extension[extension] ?? 0) + 1;
    continue;
  }
  if (metadata.size > MAX_TEXT_BYTES) {
    content.inspection_failure.blobs += 1;
    content.inspection_failure.bytes += metadata.size;
    content.inspection_failure.reasons.oversize = (content.inspection_failure.reasons.oversize ?? 0) + 1;
    continue;
  }
  const buffer = git(["cat-file", "blob", oid], { encoding: "buffer", maxBuffer: MAX_TEXT_BYTES + 1024 });
  if (buffer.includes(0)) {
    content.non_text_binary.blobs += 1;
    content.non_text_binary.bytes += metadata.size;
    continue;
  }
  let text;
  try {
    text = decoder.decode(buffer);
  } catch {
    content.non_text_binary.blobs += 1;
    content.non_text_binary.bytes += metadata.size;
    continue;
  }
  content.scanned_text.blobs += 1;
  content.scanned_text.bytes += metadata.size;
  for (const rule of rules) {
    const expression = new RegExp(rule.pattern.source, rule.pattern.flags);
    for (const match of text.matchAll(expression)) {
      const index = match.index ?? 0;
      if (rule.id === "private-ipv4" && /^\/\d{1,2}/.test(text.slice(index + match[0].length))) continue;
      if (rule.usernameGroup && syntheticUsernames.has(String(match[rule.usernameGroup] ?? "").toLowerCase())) continue;
      if (rule.domainGroup && /^(?:example\.(?:com|org|net)|example\.test|localhost|invalid)$/i.test(String(match[rule.domainGroup] ?? ""))) continue;
      findings.push({
        rule_id: rule.id,
        category: rule.category,
        classification: classificationFor(rule, match[0], pathname),
        path: pathname,
        line: lineNumber(text, index),
        blob_oid: oid
      });
    }
  }
}

findings.sort((left, right) =>
  left.classification.localeCompare(right.classification) ||
  left.rule_id.localeCompare(right.rule_id) ||
  left.path.localeCompare(right.path) ||
  left.blob_oid.localeCompare(right.blob_oid) ||
  left.line - right.line
);

const reviewedFixtures = JSON.parse(fs.readFileSync(REVIEWED_FIXTURES_PATH, "utf8"));
if (reviewedFixtures?.schema_version !== "temple.git-history-reviewed-secret-fixtures/v1" ||
    reviewedFixtures?.matched_values_retained !== false || !Array.isArray(reviewedFixtures?.entries)) {
  throw new Error("Reviewed secret-fixture disposition is invalid");
}
const reviewedKeys = new Set();
for (const entry of reviewedFixtures.entries) {
  if (entry?.rule_id !== "openai-api-key" || entry?.path !== "test/control-plane-inbox.test.mjs" ||
      !SHA_PATTERN.test(entry?.blob_oid ?? "") || !Number.isInteger(entry?.occurrence_count) || entry.occurrence_count < 1) {
    throw new Error("Reviewed secret-fixture entry is outside the allowed boundary");
  }
  const key = `${entry.rule_id}\0${entry.path}\0${entry.blob_oid}`;
  if (reviewedKeys.has(key)) throw new Error("Reviewed secret-fixture entry is duplicated");
  reviewedKeys.add(key);
  const matches = findings.filter((finding) =>
    finding.rule_id === entry.rule_id && finding.path === entry.path && finding.blob_oid === entry.blob_oid
  );
  if (matches.length !== entry.occurrence_count || matches.some((finding) => finding.classification !== "blocked")) {
    throw new Error("Reviewed secret-fixture entry no longer matches the raw scan");
  }
  for (const finding of matches) finding.classification = "synthetic-fixture";
}
const unreviewedCredentialFindings = findings.filter((finding) => finding.category === "credential" && finding.classification === "blocked");

function aggregateFindings(entries) {
  const grouped = new Map();
  for (const entry of entries) {
    const key = [entry.classification, entry.rule_id, entry.category, entry.path, entry.blob_oid].join("\0");
    const current = grouped.get(key) ?? { ...entry, occurrence_count: 0, lines: [] };
    current.occurrence_count += 1;
    current.lines.push(entry.line);
    delete current.line;
    grouped.set(key, current);
  }
  return [...grouped.values()].map((entry) => ({ ...entry, lines: [...new Set(entry.lines)].sort((left, right) => left - right) }));
}

function summarizeFindings(entries) {
  const summary = {};
  for (const entry of entries) {
    summary[entry.classification] ??= { occurrences: 0, blobs: new Set(), paths: new Set(), by_rule: {} };
    const bucket = summary[entry.classification];
    bucket.occurrences += 1;
    bucket.blobs.add(entry.blob_oid);
    bucket.paths.add(entry.path);
    bucket.by_rule[entry.rule_id] = (bucket.by_rule[entry.rule_id] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, {
    occurrences: value.occurrences,
    unique_blobs: value.blobs.size,
    unique_paths: value.paths.size,
    by_rule: Object.fromEntries(Object.entries(value.by_rule).sort(([left], [right]) => left.localeCompare(right)))
  }]));
}

function summarizeReachability(entries) {
  const result = { main: {}, tag_only: {}, pull_request_only: {} };
  for (const entry of entries) {
    const surface = mainReachable.has(entry.blob_oid) ? "main" : tagReachable.has(entry.blob_oid) ? "tag_only" : "pull_request_only";
    const key = `${entry.classification}:${entry.rule_id}`;
    result[surface][key] = (result[surface][key] ?? 0) + 1;
  }
  return result;
}

const metadataRows = git(["log", "--format=%aN%x00%aE%x00%cN%x00%cE", ...includedRefs]).split("\n").filter(Boolean);
const authorNames = new Set();
const authorEmails = new Set();
const authorPairs = new Set();
const committerNames = new Set();
const committerEmails = new Set();
const committerPairs = new Set();
for (const row of metadataRows) {
  const [authorName, authorEmail, committerName, committerEmail] = row.split("\0");
  authorNames.add(authorName); authorEmails.add(authorEmail); authorPairs.add(`${authorName}\0${authorEmail}`);
  committerNames.add(committerName); committerEmails.add(committerEmail); committerPairs.add(`${committerName}\0${committerEmail}`);
}

const localBranches = refsBelow("refs/heads/");
const objectTypeCounts = {};
for (const metadata of objects.values()) objectTypeCounts[metadata.type] = (objectTypeCounts[metadata.type] ?? 0) + 1;

const report = {
  schema_version: "temple.git-history-text-audit/v1",
  generated_at: new Date().toISOString(),
  repository: ".",
  status: unreviewedCredentialFindings.length > 0 || content.inspection_failure.blobs > 0 ? "blocked" : findings.some((entry) => entry.classification === "review-required") ? "review-required" : "allowed",
  boundary: {
    local_main: main,
    origin_main: originMain,
    main_matches_origin: true,
    tags: tags.sort((left, right) => left.name.localeCompare(right.name)),
    github_pull_request_heads: publicPullHeads.sort((left, right) => left.name.localeCompare(right.name)),
    included_ref_count: includedRefs.length,
    unique_ref_targets: new Set([main, ...tags.map((entry) => entry.oid), ...pullHeads.map((entry) => entry.oid)]).size,
    excluded_local_branch_count: localBranches.filter((entry) => entry.name !== "refs/heads/main").length,
    excluded_local_branch_names_retained: false
  },
  coverage: {
    reachable_objects: objects.size,
    reachable_objects_by_surface: {
      main: mainReachable.size,
      tags: tagReachable.size,
      github_pull_request_heads: pullReachable.size
    },
    object_types: Object.fromEntries(Object.entries(objectTypeCounts).sort(([left], [right]) => left.localeCompare(right))),
    content,
    max_text_blob_bytes: MAX_TEXT_BYTES,
    images_or_media_reviewed: false
  },
  summary: summarizeFindings(findings),
  finding_occurrences_by_reachability: summarizeReachability(findings),
  findings: aggregateFindings(findings),
  reviewed_secret_fixtures: {
    entries: reviewedFixtures.entries.length,
    occurrences: findings.filter((entry) => entry.classification === "synthetic-fixture").length,
    unreviewed_credential_occurrences: unreviewedCredentialFindings.length,
    matched_values_retained: false
  },
  commit_identity_metadata: {
    commits_observed: metadataRows.length,
    unique_author_names: authorNames.size,
    unique_author_emails: authorEmails.size,
    unique_author_pairs: authorPairs.size,
    unique_committer_names: committerNames.size,
    unique_committer_emails: committerEmails.size,
    unique_committer_pairs: committerPairs.size,
    values_retained_in_report: false,
    disposition: "owner-review"
  },
  redaction: {
    matched_values_retained: false,
    source_lines_retained: false,
    reversible_value_digests_retained: false
  },
  authority: {
    remote_refs_changed: false,
    git_history_changed: false,
    repository_visibility_changed: false,
    publication_authorized: false,
    security_certification: false
  }
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
for (const rule of rules.filter((entry) => entry.category !== "privacy-metadata")) {
  const expression = new RegExp(rule.pattern.source, rule.pattern.flags);
  if (expression.test(serialized)) throw new Error(`Generated report retained a value matching ${rule.id}`);
}
fs.mkdirSync(path.dirname(path.resolve(ROOT, OUTPUT)), { recursive: true });
fs.writeFileSync(path.resolve(ROOT, OUTPUT), serialized, { encoding: "utf8", flag: "w" });
console.log(JSON.stringify({
  output: OUTPUT,
  status: report.status,
  included_refs: report.boundary.included_ref_count,
  reachable_objects: report.coverage.reachable_objects,
  scanned_text_blobs: report.coverage.content.scanned_text.blobs,
  excluded_media_blobs: report.coverage.content.excluded_media.blobs,
  non_text_binary_blobs: report.coverage.content.non_text_binary.blobs,
  inspection_failures: report.coverage.content.inspection_failure.blobs,
  findings: report.summary
}, null, 2));
