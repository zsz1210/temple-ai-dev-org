import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

function templeJson(args) {
  return JSON.parse(execFileSync(process.execPath, ["./templew.mjs", ...args, "--json"], { encoding: "utf8" }));
}

const audit = templeJson(["publication", "audit", ".", "--profile", "public", "--surface", "both"]);
const artifactPlan = templeJson(["publication", "artifact-plan", "."]);
const adapter = templeJson(["adapter", "archify-status", "."]);
const binaryReview = JSON.parse(fs.readFileSync(".ai-org/artifacts/WI-0160/binary-review.json", "utf8"));

assert.equal(audit.summary.blocked, 0);
assert.equal(audit.summary.review_required, audit.summary.binary_files_requiring_review);
assert.equal(audit.summary.binary_files_requiring_review, binaryReview.records.length);
assert.equal(audit.summary.reviewed_adapter_fixtures, 1);

const textFindings = audit.surfaces
  .flatMap((surface) => surface.findings)
  .filter((finding) => finding.rule_id !== "binary-review");
assert.deepEqual(textFindings.map((finding) => ({
  rule_id: finding.rule_id,
  classification: finding.classification,
  disposition: finding.disposition,
  count: finding.count
})), [{
  rule_id: "private-ipv4",
  classification: "allowed",
  disposition: "reviewed-adapter-fixture",
  count: 1
}]);

assert.equal(artifactPlan.status, "no-changes");
assert.equal(artifactPlan.summary.changed_files, 0);
assert.equal(artifactPlan.summary.change_count, 0);
assert.equal(adapter.status, "installed");
assert.equal(adapter.usable, true);

for (const record of binaryReview.records) {
  const bytes = fs.readFileSync(record.path);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), record.sha256, record.path);
}

console.log(JSON.stringify({
  status: "pass",
  blocked: audit.summary.blocked,
  unresolved_text_review: audit.summary.review_required - audit.summary.binary_files_requiring_review,
  reviewed_adapter_fixtures: audit.summary.reviewed_adapter_fixtures,
  binary_files: audit.summary.binary_files_requiring_review,
  artifact_plan_status: artifactPlan.status,
  adapter_status: adapter.status,
  publication_authorized: audit.authority.publication_authorized
}, null, 2));
