import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const planEvidence = JSON.parse(fs.readFileSync(".ai-org/artifacts/WI-0161/canonical-plan.json", "utf8"));
const correctionPlan = JSON.parse(fs.readFileSync(".ai-org/artifacts/WI-0161/canonical-correction-plan.json", "utf8"));
const evidence = JSON.parse(fs.readFileSync(".ai-org/project/evidence.json", "utf8"));
const workers = JSON.parse(fs.readFileSync(".ai-org/project/runtime-workers.json", "utf8"));
const tasks = JSON.parse(fs.readFileSync(".ai-org/project/tasks.json", "utf8"));
const events = fs.readFileSync(".ai-org/events/events.jsonl", "utf8").trim().split("\n").map(JSON.parse);

const preservedEvidence = evidence.entries.filter((entry) => entry.work_item_id !== "WI-0161");
const evidencePayload = preservedEvidence.map((entry) => ({
  id: entry.id,
  work_item_id: entry.work_item_id,
  kind: entry.kind,
  scope_revision: entry.scope_revision,
  artifacts: entry.artifacts
}));
const evidenceDigest = crypto.createHash("sha256").update(JSON.stringify(evidencePayload)).digest("hex");
assert.equal(preservedEvidence.length, planEvidence.preserved_evidence_invariants.entries);
assert.equal(evidencePayload.reduce((total, entry) => total + entry.artifacts.length, 0), planEvidence.preserved_evidence_invariants.artifact_refs);
assert.equal(evidenceDigest, planEvidence.preserved_evidence_invariants.sha256);

const workItemPaths = execFileSync("git", ["ls-files", ".ai-org/work-items/*.json"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
for (const workItemPath of workItemPaths) {
  const item = JSON.parse(fs.readFileSync(workItemPath, "utf8"));
  if (item.claim?.status === "released") assert.equal(item.claim.worktree, null, `${workItemPath} current released claim`);
  for (const claim of item.claims ?? []) {
    if (claim.status === "released") assert.equal(claim.worktree, null, `${workItemPath} released claim ${claim.id}`);
  }
}
for (const worker of workers.workers) {
  if (["completed", "failed", "cancelled"].includes(worker.status)) assert.equal(worker.worktree, null, worker.id);
}
for (const task of tasks.tasks) {
  if (["completed", "archived"].includes(task.status)) assert.equal(task.worktree, null, task.id);
}

const noOpPlan = JSON.parse(execFileSync(process.execPath, ["./templew.mjs", "publication", "normalize-plan", ".", "--json"], { encoding: "utf8" }));
assert.equal(noOpPlan.status, "no-changes");
assert.equal(noOpPlan.summary.change_count, 0);
assert.equal(noOpPlan.summary.retained_active_coordinates, 0);

const audit = JSON.parse(execFileSync(process.execPath, ["./templew.mjs", "publication", "audit", ".", "--profile", "public", "--surface", "repository", "--json"], { encoding: "utf8" }));
const canonicalFindings = audit.surfaces[0].findings.filter((finding) =>
  finding.path.startsWith(".ai-org/work-items/") || [
    ".ai-org/project/evidence.json",
    ".ai-org/project/runtime-workers.json",
    ".ai-org/project/tasks.json"
  ].includes(finding.path)
);
assert.equal(canonicalFindings.length, 0);
assert.ok(events.some((event) =>
  event.event_type === "publication_canonical_state_normalized" &&
  event.work_item_id === "WI-0161" &&
  event.plan_digest === planEvidence.plan_digest &&
  event.matched_values_retained === false
));
assert.ok(events.some((event) =>
  event.event_type === "publication_canonical_state_normalized" &&
  event.work_item_id === "WI-0161" &&
  event.plan_digest === correctionPlan.plan_digest &&
  event.matched_values_retained === false
));

console.log(JSON.stringify({
  status: "pass",
  normalized_fields: planEvidence.summary.change_count + correctionPlan.summary.change_count,
  changed_files: planEvidence.summary.changed_files,
  canonical_audit_occurrences_before: planEvidence.public_audit_before.canonical_occurrences,
  canonical_audit_occurrences_after: 0,
  evidence_entries_preserved: preservedEvidence.length,
  artifact_refs_preserved: planEvidence.preserved_evidence_invariants.artifact_refs,
  idempotent: true,
  publication_authorized: false
}, null, 2));
