import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { durableAtomicCreate, formatJson, pathExists, readJson, sha256 } from "./files.mjs";
import { RECOVERY_LEDGER_SCHEMA, resolveRecoveryStateDirectory } from "./recovery.mjs";
import { redactTelemetryData } from "./telemetry.mjs";

export const AUDIT_EXPORT_SCHEMA = "temple.audit-export/v1";

const DEFAULT_MAX_EVENTS = 1_000;
const MAX_EVENTS = 10_000;
const DEFAULT_MAX_RECOVERY_TRANSACTIONS = 20;
const MAX_RECOVERY_TRANSACTIONS = 100;
const MAX_EVENT_SOURCE_LINE_BYTES = 2 * 1024 * 1024;
const SAFE_TRANSACTION_ID = /^[A-Za-z0-9-]{1,160}$/;
const SAFE_RECOVERY_STATES = new Set(["pending", "writing", "applied", "rolled_back"]);
const SAFE_RECOVERY_STATUSES = new Set([
  "prepared",
  "applying",
  "completed",
  "rolling_back",
  "rolled_back",
  "recovery_blocked"
]);
const ALLOWED_EVENT_FIELDS = [
  "timestamp",
  "event_type",
  "actor",
  "position",
  "principal_id",
  "agent_id",
  "work_item_id",
  "task_id",
  "worker_id",
  "runtime_id",
  "claim_id",
  "resource_id",
  "provider_id",
  "evidence_id",
  "evidence_kind",
  "learning_id",
  "learning_kind",
  "from_state",
  "to_state",
  "from_position",
  "to_position",
  "state",
  "status",
  "result",
  "outcome",
  "input_revision",
  "tested_revision",
  "approval_record",
  "external_release",
  "external_action_performed",
  "satisfied_requirements",
  "refs"
];
const EXCLUDED_KEY_MARKERS = [
  "prompt",
  "response",
  "hiddenreasoning",
  "chainofthought",
  "providerpayload",
  "rawpayload",
  "payloadbody",
  "runtimecredential",
  "runtimesecret",
  "commandoutput",
  "toolargument",
  "toolresult"
];
const EXCLUSION_CONTRACT = [
  "raw prompts and responses",
  "hidden reasoning or chain-of-thought",
  "credentials and runtime secrets",
  "provider and business payload bodies",
  "raw command output",
  "tool arguments and results",
  "recovery before-images and per-file payloads"
];

function normalizedKey(value) {
  return String(value).toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

function excludedKey(key) {
  const normalized = normalizedKey(key);
  return EXCLUDED_KEY_MARKERS.some((marker) => normalized.includes(marker));
}

function removeExcludedFields(value, depth = 0) {
  if (depth > 20) return "[DEPTH_LIMIT]";
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((entry) => removeExcludedFields(entry, depth + 1));
  const output = {};
  for (const [key, entry] of Object.entries(value)) {
    if (excludedKey(key)) continue;
    output[key] = removeExcludedFields(entry, depth + 1);
  }
  return output;
}

function stableValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stableValue);
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function safeAuditRef(value) {
  if (typeof value !== "string" || value.length === 0 || Buffer.byteLength(value) > 2_048) {
    return "[REDACTED_REF]";
  }
  if (path.isAbsolute(value) || path.win32.isAbsolute(value) || value.startsWith("~/")) {
    return "[REDACTED_REF]";
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const reference = new URL(value);
      reference.username = "";
      reference.password = "";
      reference.search = "";
      reference.hash = "";
      return reference.toString();
    } catch {
      return "[REDACTED_REF]";
    }
  }
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || value.includes("?") || value.includes("#") || value.includes("=")) {
    return "[REDACTED_REF]";
  }
  if (
    value.includes("\\") ||
    path.posix.normalize(value) !== value ||
    value === ".." ||
    value.startsWith("../")
  ) {
    return "[REDACTED_REF]";
  }
  return value;
}

function boundedAuditString(value) {
  if (typeof value !== "string") return null;
  return Buffer.byteLength(value) <= 2_048 ? value : "[REDACTED_OVERSIZE]";
}

function boundedAuditToken(value) {
  const bounded = boundedAuditString(value);
  if (bounded === null || bounded === "[REDACTED_OVERSIZE]") return bounded;
  return /^[A-Za-z0-9][A-Za-z0-9._:@,+/-]{0,511}$/.test(bounded) ? bounded : "[REDACTED_TEXT]";
}

function uniqueSortedStrings(values, label) {
  if (values === undefined) return [];
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`);
  if (values.length > 100) throw new Error(`${label} must contain no more than 100 entries`);
  const normalized = values.map((value) => String(value).trim());
  if (normalized.some((value) => value.length === 0)) throw new Error(`${label} must contain non-empty strings`);
  if (normalized.some((value) => boundedAuditToken(value) !== value)) {
    throw new Error(`${label} must contain bounded token-like strings`);
  }
  return [...new Set(normalized)].sort();
}

function boundedInteger(value, fallback, maximum, label) {
  const resolved = value ?? fallback;
  if (!Number.isSafeInteger(resolved) || resolved < 1 || resolved > maximum) {
    throw new Error(`${label} must be an integer from 1 to ${maximum}`);
  }
  return resolved;
}

function projectEvent(event, privacy) {
  const allowed = {};
  for (const key of ALLOWED_EVENT_FIELDS) {
    if (!Object.hasOwn(event, key)) continue;
    if (key === "timestamp") {
      allowed.timestamp = new Date(Date.parse(event.timestamp)).toISOString();
      continue;
    }
    if (key === "refs") {
      allowed.refs = Array.isArray(event.refs) ? event.refs.slice(0, 100).map(safeAuditRef) : [];
      continue;
    }
    if (key === "satisfied_requirements") {
      allowed.satisfied_requirements = Array.isArray(event.satisfied_requirements)
        ? event.satisfied_requirements.slice(0, 100).map(boundedAuditToken).filter((value) => value !== null)
        : [];
      continue;
    }
    if (key === "approval_record") {
      allowed.approval_record = safeAuditRef(event.approval_record);
      continue;
    }
    if (typeof event[key] === "boolean" || typeof event[key] === "number") {
      allowed[key] = event[key];
      continue;
    }
    const value = boundedAuditToken(event[key]);
    if (value !== null) allowed[key] = value;
  }
  return stableValue(
    redactTelemetryData(removeExcludedFields(allowed), {
      redact_keys: privacy.redactKeys,
      max_data_bytes: privacy.maxEventBytes
    })
  );
}

async function readCanonicalEvents(target, selection, privacy) {
  const eventPath = path.join(target, ".ai-org/events/events.jsonl");
  if (!(await pathExists(eventPath))) {
    return { source_count: 0, matched_count: 0, selected: [] };
  }
  const eventStat = await fs.lstat(eventPath);
  if (eventStat.isSymbolicLink() || !eventStat.isFile()) {
    throw new Error("Canonical event source must be a real file");
  }
  const selected = [];
  let sourceCount = 0;
  let matchedCount = 0;
  let lineNumber = 0;
  const lines = readline.createInterface({ input: createReadStream(eventPath, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (const line of lines) {
    lineNumber += 1;
    if (!line.trim()) continue;
    if (Buffer.byteLength(line) > MAX_EVENT_SOURCE_LINE_BYTES) {
      throw new Error(`Canonical event at line ${lineNumber} exceeds ${MAX_EVENT_SOURCE_LINE_BYTES} bytes`);
    }
    sourceCount += 1;
    let event;
    try {
      event = JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid canonical event JSON at line ${lineNumber}: ${error.message}`);
    }
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      throw new Error(`Canonical event at line ${lineNumber} must be an object`);
    }
    if (typeof event.timestamp !== "string" || Number.isNaN(Date.parse(event.timestamp))) {
      throw new Error(`Canonical event at line ${lineNumber} has an invalid timestamp`);
    }
    if (typeof event.event_type !== "string" || event.event_type.length === 0) {
      throw new Error(`Canonical event at line ${lineNumber} has no event_type`);
    }
    if (selection.workItemIds.length > 0 && !selection.workItemIds.includes(event.work_item_id)) continue;
    if (selection.eventTypes.length > 0 && !selection.eventTypes.includes(event.event_type)) continue;
    matchedCount += 1;
    selected.push(projectEvent(event, privacy));
    if (selected.length > selection.maxEvents) selected.shift();
  }
  return { source_count: sourceCount, matched_count: matchedCount, selected };
}

async function lstatOrNull(targetPath) {
  try {
    return await fs.lstat(targetPath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function recoveryTimestamp(ledger) {
  return ledger.completed_at ?? ledger.rolled_back_at ?? ledger.created_at ?? "";
}

function canonicalTimestamp(value, label, { optional = false } = {}) {
  if ((value === undefined || value === null) && optional) return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be a valid timestamp`);
  }
  return new Date(Date.parse(value)).toISOString();
}

function summarizeRecoveryLedger(ledger) {
  if (ledger?.schema_version !== RECOVERY_LEDGER_SCHEMA || !SAFE_TRANSACTION_ID.test(ledger.transaction_id ?? "")) {
    throw new Error("Recovery transaction ledger is invalid");
  }
  canonicalTimestamp(recoveryTimestamp(ledger), `Recovery transaction ${ledger.transaction_id} timestamp`);
  const actions = Array.isArray(ledger.actions) ? ledger.actions : [];
  const actionStates = {};
  for (const action of actions) {
    const state = SAFE_RECOVERY_STATES.has(action?.state) ? action.state : "unknown";
    actionStates[state] = (actionStates[state] ?? 0) + 1;
  }
  for (const [label, digest] of [
    ["plan", ledger.plan_digest],
    ["backup manifest", ledger.backup_manifest_digest]
  ]) {
    if (digest !== undefined && digest !== null && !/^[a-f0-9]{64}$/.test(digest)) {
      throw new Error(`Recovery transaction ${ledger.transaction_id} has an invalid ${label} digest`);
    }
  }
  return stableValue({
    transaction_id: ledger.transaction_id,
    status: SAFE_RECOVERY_STATUSES.has(ledger.status) ? ledger.status : "unknown",
    created_at: canonicalTimestamp(ledger.created_at, `Recovery transaction ${ledger.transaction_id} created_at`, { optional: true }),
    completed_at: canonicalTimestamp(ledger.completed_at, `Recovery transaction ${ledger.transaction_id} completed_at`, { optional: true }),
    rolled_back_at: canonicalTimestamp(ledger.rolled_back_at, `Recovery transaction ${ledger.transaction_id} rolled_back_at`, { optional: true }),
    plan_digest: ledger.plan_digest ?? null,
    backup_manifest_digest: ledger.backup_manifest_digest ?? null,
    action_count: actions.length,
    action_states: actionStates,
    recovery_failure_count: Array.isArray(ledger.recovery_failures) ? ledger.recovery_failures.length : 0
  });
}

async function readRecoveryMetadata(target, maximumTransactions) {
  const stateDirectory = resolveRecoveryStateDirectory(target);
  const stateStat = await lstatOrNull(stateDirectory);
  if (!stateStat) {
    return { status: "clean", active_transaction_id: null, source_transaction_count: 0, transactions: [] };
  }
  if (stateStat.isSymbolicLink() || !stateStat.isDirectory()) {
    throw new Error("Recovery state directory must be a real directory for audit export");
  }

  let activeTransactionId = null;
  const activePath = path.join(stateDirectory, "active.json");
  const activeStat = await lstatOrNull(activePath);
  if (activeStat) {
    if (activeStat.isSymbolicLink() || !activeStat.isFile()) throw new Error("Recovery active pointer is unsafe");
    const active = await readJson(activePath);
    if (active.schema_version !== RECOVERY_LEDGER_SCHEMA || !SAFE_TRANSACTION_ID.test(active.transaction_id ?? "")) {
      throw new Error("Recovery active pointer is invalid");
    }
    activeTransactionId = active.transaction_id;
  }

  const transactionRoot = path.join(stateDirectory, "transactions");
  const rootStat = await lstatOrNull(transactionRoot);
  const ledgers = [];
  if (rootStat) {
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error("Recovery transaction root is unsafe");
    const entries = await fs.readdir(transactionRoot, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (!SAFE_TRANSACTION_ID.test(entry.name)) throw new Error(`Unsafe recovery transaction name: ${entry.name}`);
      const directory = path.join(transactionRoot, entry.name);
      const directoryStat = await fs.lstat(directory);
      if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
        throw new Error(`Recovery transaction entry is unsafe: ${entry.name}`);
      }
      const ledgerPath = path.join(directory, "ledger.json");
      const ledgerStat = await lstatOrNull(ledgerPath);
      if (!ledgerStat || ledgerStat.isSymbolicLink() || !ledgerStat.isFile()) {
        throw new Error(`Recovery transaction ledger is missing or unsafe: ${entry.name}`);
      }
      const ledger = await readJson(ledgerPath);
      const summary = summarizeRecoveryLedger(ledger);
      if (summary.transaction_id !== entry.name) throw new Error(`Recovery transaction ID mismatch: ${entry.name}`);
      ledgers.push({ summary, timestamp: canonicalTimestamp(recoveryTimestamp(ledger), `Recovery transaction ${entry.name} timestamp`) });
    }
  }
  ledgers.sort(
    (left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp) ||
      left.summary.transaction_id.localeCompare(right.summary.transaction_id)
  );
  const retained = ledgers.slice(0, maximumTransactions).map((entry) => entry.summary);
  return {
    status: activeTransactionId ? "recovery-required" : "clean",
    active_transaction_id: activeTransactionId,
    source_transaction_count: ledgers.length,
    transactions: retained
  };
}

function auditExportDigest(document) {
  return sha256(JSON.stringify(document));
}

export async function buildAuditExport(target, options = {}) {
  const absoluteTarget = await fs.realpath(path.resolve(target));
  const maxEvents = boundedInteger(options.maxEvents, DEFAULT_MAX_EVENTS, MAX_EVENTS, "maxEvents");
  const maxRecoveryTransactions = boundedInteger(
    options.maxRecoveryTransactions,
    DEFAULT_MAX_RECOVERY_TRANSACTIONS,
    MAX_RECOVERY_TRANSACTIONS,
    "maxRecoveryTransactions"
  );
  const workItemIds = uniqueSortedStrings(options.workItemIds, "workItemIds");
  const eventTypes = uniqueSortedStrings(options.eventTypes, "eventTypes");
  const redactKeys = uniqueSortedStrings(options.redactKeys, "redactKeys");
  const maxEventBytes = boundedInteger(options.maxEventBytes, 16_384, 1_048_576, "maxEventBytes");
  const [project, lock, eventSelection, recovery] = await Promise.all([
    readJson(path.join(absoluteTarget, ".ai-org/project/project.json")),
    readJson(path.join(absoluteTarget, "temple.lock")),
    readCanonicalEvents(
      absoluteTarget,
      { maxEvents, workItemIds, eventTypes },
      { redactKeys, maxEventBytes }
    ),
    readRecoveryMetadata(absoluteTarget, maxRecoveryTransactions)
  ]);
  if (!project.id) throw new Error("Project identity is required for audit export");
  if (boundedAuditToken(project.id) !== project.id) throw new Error("Project identity is unsafe for audit export");
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(lock.template?.version ?? "")) {
    throw new Error("Installed Temple version is invalid for audit export");
  }

  const document = stableValue({
    schema_version: AUDIT_EXPORT_SCHEMA,
    project: {
      id: project.id,
      temple_version: lock.template?.version ?? null
    },
    selection: {
      max_events: maxEvents,
      work_item_ids: workItemIds,
      event_types: eventTypes,
      source_event_count: eventSelection.source_count,
      matched_event_count: eventSelection.matched_count,
      selected_event_count: eventSelection.selected.length,
      max_recovery_transactions: maxRecoveryTransactions
    },
    events: eventSelection.selected,
    recovery,
    exclusions: EXCLUSION_CONTRACT
  });
  return { ...document, export_digest: auditExportDigest(document) };
}

export async function writeAuditExport(target, outputPath, options = {}) {
  if (typeof outputPath !== "string" || outputPath.trim().length === 0) {
    throw new Error("Audit export requires an explicit output path");
  }
  const output = path.resolve(outputPath);
  const document = await buildAuditExport(target, options);
  await durableAtomicCreate(output, formatJson(document));
  return {
    schema_version: AUDIT_EXPORT_SCHEMA,
    output,
    export_digest: document.export_digest,
    event_count: document.events.length,
    recovery_transaction_count: document.recovery.transactions.length
  };
}
