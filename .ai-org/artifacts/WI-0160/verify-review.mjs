import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const textPath = ".ai-org/artifacts/WI-0160/text-inventory.json";
const binaryPath = ".ai-org/artifacts/WI-0160/binary-review.json";
const textInventory = JSON.parse(fs.readFileSync(textPath, "utf8"));
const binaryReview = JSON.parse(fs.readFileSync(binaryPath, "utf8"));
const audit = JSON.parse(
  execFileSync(
    process.execPath,
    ["./templew.mjs", "publication", "audit", ".", "--profile", "public", "--surface", "both", "--json"],
    { encoding: "utf8" },
  ),
);

const textFindings = audit.surfaces
  .flatMap((surface) => surface.findings)
  .filter((finding) => finding.rule_id !== "binary-review");
const findingKey = (finding) =>
  [finding.path, finding.line, finding.rule_id, finding.count].join("\u0000");

assert.equal(textInventory.matched_values_retained, false);
assert.equal(textInventory.summary.finding_records, textFindings.length);
assert.equal(
  textInventory.summary.occurrences,
  textFindings.reduce((total, finding) => total + finding.count, 0),
);
assert.equal(
  textInventory.summary.unique_files,
  new Set(textFindings.map((finding) => finding.path)).size,
);
assert.deepEqual(
  new Set(textInventory.records.map(findingKey)),
  new Set(textFindings.map(findingKey)),
);

const trackedPngs = execFileSync("git", ["ls-files", "*.png"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
assert.equal(binaryReview.recognized_text_retained, false);
assert.equal(binaryReview.records.length, trackedPngs.length);
assert.deepEqual(
  binaryReview.records.map((record) => record.path).sort(),
  trackedPngs.toSorted(),
);

for (const record of binaryReview.records) {
  const bytes = fs.readFileSync(record.path);
  assert.equal(bytes.toString("ascii", 1, 4), "PNG", `${record.path} is not a PNG`);
  assert.equal(record.sha256, crypto.createHash("sha256").update(bytes).digest("hex"));
  assert.equal(record.bytes, bytes.length);
  assert.equal(record.width, bytes.readUInt32BE(16));
  assert.equal(record.height, bytes.readUInt32BE(20));
  assert.equal(record.review.visual, "pass");
  assert.equal(record.review.ocr_privacy, "pass");
  assert.equal(record.review.ocr_restricted_value_matches, 0);
  assert.equal(record.review.ocr_live_account_state_matches, 0);
  assert.deepEqual(record.review.png_text_or_exif_chunks, []);
  assert.equal(record.review.disposition, "retain-current-binary");
}

const retainedText = `${fs.readFileSync(textPath, "utf8")}\n${fs.readFileSync(binaryPath, "utf8")}`;
const prohibitedRetainedValues = [
  /\/Users\/[^/]+\//,
  /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/,
  /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.[a-z0-9-]+\.ts\.net\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];
for (const pattern of prohibitedRetainedValues) {
  assert.equal(pattern.test(retainedText), false, `review inventory retained a prohibited value: ${pattern}`);
}

console.log(
  JSON.stringify(
    {
      status: "pass",
      text_finding_records: textFindings.length,
      text_occurrences: textFindings.reduce((total, finding) => total + finding.count, 0),
      text_files: new Set(textFindings.map((finding) => finding.path)).size,
      tracked_pngs: trackedPngs.length,
      binary_bytes: binaryReview.records.reduce((total, record) => total + record.bytes, 0),
    },
    null,
    2,
  ),
);
