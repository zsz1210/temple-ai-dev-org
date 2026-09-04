#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const [logRoot, runsTsv, outputPath] = process.argv.slice(2);
if (!logRoot || !runsTsv || !outputPath) {
  console.error("Usage: audit-actions-logs.mjs <extracted-log-root> <runs.tsv> <output.json>");
  process.exit(2);
}

const rules = [
  { id: "private_key", severity: "blocker", regex: /-----BEGIN (?:RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----/g },
  { id: "github_token", severity: "blocker", regex: /(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,255})/g },
  { id: "npm_token", severity: "blocker", regex: /npm_[A-Za-z0-9]{20,255}/g },
  { id: "openai_key", severity: "blocker", regex: /(?<![A-Za-z0-9])sk-(?:proj-)?[A-Za-z0-9_-]{20,255}/g },
  { id: "aws_access_key", severity: "blocker", regex: /(?:AKIA|ASIA)[A-Z0-9]{16}/g },
  { id: "slack_token", severity: "blocker", regex: /xox[baprs]-[A-Za-z0-9-]{20,255}/g },
  { id: "gitlab_token", severity: "blocker", regex: /glpat-[A-Za-z0-9_-]{20,255}/g },
  { id: "google_api_key", severity: "blocker", regex: /AIza[A-Za-z0-9_-]{30,255}/g },
  { id: "email", severity: "review", regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { id: "mac_home_path", severity: "review", regex: /\/Users\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._+@%:,=-]+)*/g },
  { id: "private_ipv4", severity: "review", regex: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g },
  { id: "tailscale_hostname", severity: "review", regex: /\b[A-Za-z0-9.-]+\.ts\.net\b/gi },
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(candidate));
    else if (entry.isFile()) files.push(candidate);
  }
  return files;
}

const runRows = (await readFile(runsTsv, "utf8")).split(/\r?\n/).filter(Boolean);
const files = await walk(logRoot);
const findings = Object.fromEntries(rules.map((rule) => [rule.id, {
  severity: rule.severity,
  occurrences: 0,
  files: new Set(),
} ]));

let bytes = 0;
let binaryFiles = 0;
let readFailures = 0;
let maskedValueMarkers = 0;
const aggregate = createHash("sha256");

for (const file of files.sort()) {
  try {
    const info = await stat(file);
    const buffer = await readFile(file);
    bytes += info.size;
    aggregate.update(path.relative(logRoot, file));
    aggregate.update(buffer);
    if (buffer.includes(0)) {
      binaryFiles += 1;
      continue;
    }
    const text = buffer.toString("utf8");
    maskedValueMarkers += [...text.matchAll(/\*\*\*/g)].length;
    for (const rule of rules) {
      const matches = [...text.matchAll(rule.regex)];
      if (matches.length > 0) {
        findings[rule.id].occurrences += matches.length;
        findings[rule.id].files.add(path.relative(logRoot, file));
      }
      rule.regex.lastIndex = 0;
    }
  } catch {
    readFailures += 1;
  }
}

const normalizedFindings = Object.fromEntries(Object.entries(findings).map(([id, finding]) => [id, {
  severity: finding.severity,
  occurrences: finding.occurrences,
  file_count: finding.files.size,
} ]));
const blockerOccurrences = Object.values(normalizedFindings)
  .filter((finding) => finding.severity === "blocker")
  .reduce((sum, finding) => sum + finding.occurrences, 0);

const result = {
  schema_version: "temple.github-actions-log-audit/v1",
  generated_at: new Date().toISOString(),
  repository: "zsz1210/temple-ai-dev-org",
  boundary: {
    workflow_runs_listed: runRows.length,
    workflow_runs_with_logs: new Set(files.map((file) => path.relative(logRoot, file).split(path.sep)[0])).size,
    log_files: files.length,
    log_bytes: bytes,
    aggregate_sha256: aggregate.digest("hex"),
  },
  exclusions: {
    images_or_media_reviewed: false,
    actions_artifact_contents_reviewed: false,
  },
  inspection: {
    binary_files_skipped: binaryFiles,
    read_failures: readFailures,
    masked_value_markers: maskedValueMarkers,
  },
  findings: normalizedFindings,
  conclusion: blockerOccurrences === 0 && readFailures === 0 && binaryFiles === 0 ? "pass" : "manual-review-required",
  retained_values: false,
};

await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  conclusion: result.conclusion,
  boundary: result.boundary,
  inspection: result.inspection,
  findings: result.findings,
  retained_values: false,
}, null, 2));
