import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCUMENT_ASSET = /^docs\/assets\/.*\.(?:gif|jpe?g|png|svg|webp)$/i;
const ROOT_DOCUMENT = /^(?:(?:README(?:\.[^/]+)?|CHANGELOG|SECURITY|CODE_OF_CONDUCT|CONTRIBUTING|THIRD_PARTY_NOTICES)\.md|(?:LICENSE|NOTICE)(?:\.(?:md|txt))?)$/i;
const SAFE_EVIDENCE_ARTIFACT = /^\.ai-org\/artifacts\/(?:WI-\d{4}|observations|work-orders)\/.*\.(?:gif|jpe?g|jsonl?|log|md|pdf|png|svg|txt|webp)$/i;
const SAFE_STATE_PATHS = new Set([
  ".ai-org/events/events.jsonl",
  ".ai-org/project/evidence.json",
  ".ai-org/project/resources.json",
  ".ai-org/project/runtime-workers.json",
  ".ai-org/project/tasks.json",
  ".ai-org/views/capabilities.json",
  ".ai-org/views/parallel-plan.json",
  ".ai-org/views/status.md",
  ".ai-org/views/tracker.json"
]);
const WORK_ITEM_STATE = /^\.ai-org\/(?:views\/)?work-items\/WI-\d{4}\.json$/;
const SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;
const RAW_HEADER = /^:(\d{6}) (\d{6}) ([0-9a-f]+) ([0-9a-f]+) ([A-Z])([0-9]{0,3})$/;
const SAFE_CHANGE_STATUSES = new Set(["A", "M"]);

function normalizePath(candidate) {
  return String(candidate ?? "").replaceAll("\\", "/").replace(/^\.\//, "");
}

export function isDocumentationOnlyPath(candidate) {
  const normalized = normalizePath(candidate);
  return ROOT_DOCUMENT.test(normalized) || /^docs\/.*\.md$/i.test(normalized) || DOCUMENT_ASSET.test(normalized);
}

export function isEvidenceStateOnlyPath(candidate) {
  const normalized = normalizePath(candidate);
  return SAFE_STATE_PATHS.has(normalized) || WORK_ITEM_STATE.test(normalized) || SAFE_EVIDENCE_ARTIFACT.test(normalized);
}

export function parseRawDiff(output) {
  const fields = String(output ?? "").split("\0");
  const changes = [];
  let index = 0;

  while (index < fields.length) {
    const header = fields[index++];
    if (header === "" && index === fields.length) break;
    const match = RAW_HEADER.exec(header);
    if (!match) throw new Error(`unrecognized git raw diff record: ${JSON.stringify(header)}`);

    const [, oldMode, newMode, oldObject, newObject, status, score] = match;
    const pathCount = status === "R" || status === "C" ? 2 : 1;
    const paths = fields.slice(index, index + pathCount).map(normalizePath);
    if (paths.length !== pathCount || paths.some((candidate) => candidate.length === 0)) {
      throw new Error(`incomplete git raw diff record for status ${status}`);
    }
    index += pathCount;
    changes.push({ oldMode, newMode, oldObject, newObject, status, score, paths });
  }

  return changes;
}

function fullResult(reason, changes = []) {
  const changed = [...new Set(changes.flatMap((change) => change.paths ?? []).map(normalizePath).filter(Boolean))];
  return {
    scope: "full",
    reason,
    changed,
    documentationPaths: [],
    evidenceStatePaths: [],
    fullVerificationPaths: changed
  };
}

function unsafeChangeReason(change) {
  if (!SAFE_CHANGE_STATUSES.has(change.status)) {
    const description = {
      C: "copy",
      D: "deletion",
      R: "rename",
      T: "type change",
      U: "unmerged change",
      X: "unknown change",
      B: "broken pairing"
    }[change.status] ?? `unknown status ${change.status}`;
    return `${description} requires full verification`;
  }
  if (change.paths.length !== 1) return "ambiguous path metadata requires full verification";
  if (change.status === "M" && change.oldMode !== change.newMode) return "mode change requires full verification";
  if (change.newMode !== "100644") return "executable or non-regular file requires full verification";
  if (change.status === "M" && change.oldMode !== "100644") {
    return "executable or non-regular file requires full verification";
  }
  return null;
}

export function classifyChanges(changes) {
  if (!Array.isArray(changes) || changes.length === 0) {
    return fullResult("an empty change set cannot prove a narrow scope");
  }

  for (const change of changes) {
    const reason = unsafeChangeReason(change);
    if (reason) return fullResult(reason, changes);
  }

  const changed = [...new Set(changes.flatMap((change) => change.paths).map(normalizePath).filter(Boolean))];
  const documentationPaths = changed.filter(isDocumentationOnlyPath);
  const evidenceStatePaths = changed.filter(isEvidenceStateOnlyPath);

  if (documentationPaths.length === changed.length) {
    return {
      scope: "documentation-only",
      reason: "every changed path is in the documentation allowlist",
      changed,
      documentationPaths,
      evidenceStatePaths: [],
      fullVerificationPaths: []
    };
  }
  if (evidenceStatePaths.length === changed.length) {
    return {
      scope: "evidence-state-only",
      reason: "every changed path is in the evidence/state allowlist",
      changed,
      documentationPaths: [],
      evidenceStatePaths,
      fullVerificationPaths: []
    };
  }

  return {
    scope: "full",
    reason: "the change set contains a behavioral, mixed-scope, or unknown path",
    changed,
    documentationPaths,
    evidenceStatePaths,
    fullVerificationPaths: changed.filter(
      (candidate) => !isDocumentationOnlyPath(candidate) && !isEvidenceStateOnlyPath(candidate)
    )
  };
}

async function loadRawDiff(base, head) {
  const { stdout } = await execFileAsync(
    "git",
    [
      "diff",
      "--raw",
      "--no-abbrev",
      "-z",
      "--find-renames",
      "--find-copies",
      "--find-copies-harder",
      "--diff-filter=ACDMRTUXB",
      base,
      head,
      "--"
    ],
    { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 1024 * 1024 }
  );
  return stdout;
}

export async function selectVerificationScope({ eventName, base, head, diffLoader = loadRawDiff }) {
  if (eventName === "workflow_dispatch") {
    return fullResult("manual runs always execute the complete suite");
  }
  if (!SHA.test(base ?? "") || !SHA.test(head ?? "") || /^0+$/.test(base ?? "")) {
    return fullResult("a safe comparison range was unavailable");
  }

  try {
    return classifyChanges(parseRawDiff(await diffLoader(base, head)));
  } catch (error) {
    return fullResult(`change detection failed: ${error.message}`);
  }
}

async function writeOutput(result) {
  if (!process.env.GITHUB_OUTPUT) return;
  const reason = result.reason.replace(/[\r\n]+/g, " ");
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    [
      `scope=${result.scope}`,
      `reason=${reason}`,
      `run_full_tests=${result.scope === "full"}`,
      `run_evidence_state_tests=${result.scope === "evidence-state-only"}`,
      ""
    ].join("\n"),
    "utf8"
  );
}

async function main() {
  const result = await selectVerificationScope({
    eventName: process.env.CI_EVENT_NAME ?? "",
    base: process.env.CI_BASE_SHA ?? "",
    head: process.env.CI_HEAD_SHA ?? ""
  });
  console.log(`CI scope: ${result.scope} (${result.changed.length} changed path(s); ${result.reason})`);
  if (result.fullVerificationPaths.length > 0) {
    console.log(`Full-verification paths: ${result.fullVerificationPaths.join(", ")}`);
  }
  await writeOutput(result);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
