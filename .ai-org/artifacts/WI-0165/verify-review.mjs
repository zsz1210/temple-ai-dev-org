#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const auditPath = ".ai-org/artifacts/WI-0165/git-history-text-audit.json";
const fixturePath = ".ai-org/artifacts/WI-0165/reviewed-secret-fixtures.json";
const auditText = fs.readFileSync(auditPath, "utf8");
const audit = JSON.parse(auditText);
const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const checks = [];

function check(name, condition) {
  if (!condition) throw new Error(`Verification failed: ${name}`);
  checks.push(name);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 }).trim();
}

check("schema", audit.schema_version === "temple.git-history-text-audit/v1");
check("main pinned", audit.boundary.local_main === git(["rev-parse", "refs/heads/main^{commit}"]));
check("origin main pinned", audit.boundary.origin_main === git(["rev-parse", "refs/remotes/origin/main^{commit}"]));
check("main equals origin", audit.boundary.main_matches_origin === true && audit.boundary.local_main === audit.boundary.origin_main);

const livePullHeads = git(["ls-remote", "origin", "refs/pull/*/head"]).split("\n").filter(Boolean).map((row) => {
  const [oid, name] = row.split("\t");
  return { name, oid };
}).sort((left, right) => left.name.localeCompare(right.name));
check("GitHub pull-request heads pinned", JSON.stringify(audit.boundary.github_pull_request_heads) === JSON.stringify(livePullHeads));

const localTags = git(["for-each-ref", "--format=%(refname)%00%(objectname)", "refs/tags/"]).split("\n").filter(Boolean).map((row) => {
  const [name, oid] = row.split("\0");
  return { name, oid };
}).sort((left, right) => left.name.localeCompare(right.name));
check("tags pinned", JSON.stringify(audit.boundary.tags) === JSON.stringify(localTags));
check("temporary refs removed", git(["for-each-ref", "--format=%(refname)", "refs/temple-audit/"]) === "");

const content = audit.coverage.content;
check("all blobs classified", audit.coverage.object_types.blob === content.scanned_text.blobs + content.excluded_media.blobs + content.non_text_binary.blobs + content.inspection_failure.blobs);
check("no inspection failure", content.inspection_failure.blobs === 0);
check("media excluded", audit.coverage.images_or_media_reviewed === false && content.excluded_media.blobs === 114);
check("only expected media types", content.excluded_media.by_extension[".png"] === 68 && content.excluded_media.by_extension[".svg"] === 46 && Object.keys(content.excluded_media.by_extension).length === 2);

check("review is not a clean-publication claim", audit.status === "review-required");
check("no unreviewed credential", audit.reviewed_secret_fixtures.unreviewed_credential_occurrences === 0);
check("secret fixtures pinned", audit.reviewed_secret_fixtures.entries === fixtures.entries.length && audit.reviewed_secret_fixtures.occurrences === fixtures.entries.reduce((sum, entry) => sum + entry.occurrence_count, 0));
check("secret fixtures are exact", audit.summary["synthetic-fixture"].occurrences === 57 && audit.summary["synthetic-fixture"].unique_blobs === 10);
check("privacy queue exact", audit.summary["review-required"].occurrences === 3745 && audit.summary["review-required"].unique_blobs === 738 && audit.summary["review-required"].unique_paths === 158);
check("all findings already reachable from main", Object.keys(audit.finding_occurrences_by_reachability.tag_only).length === 0 && Object.keys(audit.finding_occurrences_by_reachability.pull_request_only).length === 0);
check("identity values redacted", audit.commit_identity_metadata.values_retained_in_report === false && audit.commit_identity_metadata.commits_observed === 764);
check("report values redacted", audit.redaction.matched_values_retained === false && audit.redaction.source_lines_retained === false && audit.redaction.reversible_value_digests_retained === false);
check("authority unchanged", Object.values(audit.authority).every((value) => value === false));

for (const expression of [
  /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/g,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bnpm_[A-Za-z0-9]{20,}\b/g,
  /\/(?:Users|home)\/[A-Za-z0-9._-]+/g,
  /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g,
  /\b[a-z0-9][a-z0-9-]*\.tail[a-z0-9-]*\.ts\.net\b/gi
]) check(`redaction pattern ${expression.source}`, !expression.test(auditText));

console.log(JSON.stringify({
  schema_version: "temple.git-history-text-review-verification/v1",
  result: "pass",
  checks: checks.length,
  audit_sha256: crypto.createHash("sha256").update(auditText).digest("hex"),
  tested_public_boundary: audit.boundary.local_main,
  remote_write_performed: false,
  history_rewrite_performed: false,
  publication_performed: false,
  media_content_reviewed: false
}, null, 2));
