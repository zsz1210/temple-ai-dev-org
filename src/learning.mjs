import fs from "node:fs/promises";
import path from "node:path";
import { atomicCreate, atomicWrite, formatJson, pathExists, readJson, rollbackFileChanges, sha256 } from "./files.mjs";
import { isWorkItemId } from "./ids.mjs";
import { appendEvent } from "./project.mjs";

export const LEARNING_INDEX_RELATIVE_PATH = ".ai-org/learning/index.json";
export const LEARNING_INDEX_SCHEMA = "ai-org.learning-index/v2";
export const LEGACY_LEARNING_INDEX_SCHEMA = "ai-org.learning-index/v1";
export const LEARNING_STATUSES_BY_KIND = {
  lesson: ["candidate", "validated", "deprecated"],
  practice: ["candidate", "active", "deprecated"]
};
export const LEARNING_CONFIDENCE = ["low", "medium", "high"];
export const LEARNING_PROMOTION_TARGETS = [
  "none",
  "practice",
  "skill",
  "automated-check",
  "adr",
  "instruction"
];
export const LEARNING_PROMOTION_STATUSES = ["none", "proposed", "accepted", "rejected"];

const LEARNING_ID = /^(LESSON|PRACTICE)-[0-9]{4,}$/;
const REVALIDATION_RESULTS = ["confirmed", "narrowed", "contradicted"];

export function emptyLearningIndex() {
  return { schema_version: LEARNING_INDEX_SCHEMA, entries: [] };
}

function uniqueStrings(values) {
  return (
    Array.isArray(values) &&
    values.every((value) => typeof value === "string" && value.trim().length > 0) &&
    new Set(values).size === values.length
  );
}

function validDate(value, { nullable = false } = {}) {
  if (nullable && value === null) return true;
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function validateLearningIndex(index) {
  const errors = [];
  if (![LEGACY_LEARNING_INDEX_SCHEMA, LEARNING_INDEX_SCHEMA].includes(index?.schema_version)) {
    errors.push(`schema_version must be ${LEGACY_LEARNING_INDEX_SCHEMA} or ${LEARNING_INDEX_SCHEMA}`);
  }
  if (!Array.isArray(index?.entries)) return { valid: false, errors: [...errors, "entries must be an array"] };

  const ids = new Set();
  const paths = new Set();
  for (const [position, entry] of index.entries.entries()) {
    const label = `entries[${position}]`;
    if (!LEARNING_ID.test(entry?.id ?? "")) errors.push(`${label}.id is invalid`);
    if (ids.has(entry?.id)) errors.push(`${label}.id is duplicated`);
    ids.add(entry?.id);

    const expectedKind = entry?.id?.startsWith("LESSON-") ? "lesson" : entry?.id?.startsWith("PRACTICE-") ? "practice" : null;
    if (entry?.kind !== expectedKind) errors.push(`${label}.kind must match the ID prefix`);
    if (typeof entry?.title !== "string" || entry.title.trim().length === 0) errors.push(`${label}.title is required`);
    if (typeof entry?.summary !== "string" || entry.summary.trim().length === 0) errors.push(`${label}.summary is required`);
    if (!LEARNING_STATUSES_BY_KIND[expectedKind]?.includes(entry?.status)) {
      errors.push(`${label}.status is invalid for ${expectedKind ?? "an unknown kind"}`);
    }
    if (!LEARNING_CONFIDENCE.includes(entry?.confidence)) errors.push(`${label}.confidence is invalid`);
    if (!uniqueStrings(entry?.tags)) errors.push(`${label}.tags must contain unique non-empty strings`);
    if (!uniqueStrings(entry?.applies_to)) errors.push(`${label}.applies_to must contain unique non-empty strings`);
    if (
      !Array.isArray(entry?.source_work_items) ||
      !entry.source_work_items.every(isWorkItemId) ||
      new Set(entry.source_work_items).size !== entry.source_work_items.length
    ) {
      errors.push(`${label}.source_work_items must contain unique work item IDs`);
    }

    const expectedPath = expectedKind ? `.ai-org/learning/${expectedKind === "lesson" ? "lessons" : "practices"}/${entry.id}.md` : null;
    if (entry?.path !== expectedPath) errors.push(`${label}.path must be ${expectedPath ?? "derived from a valid ID"}`);
    if (paths.has(entry?.path)) errors.push(`${label}.path is duplicated`);
    paths.add(entry?.path);

    if (!validDate(entry?.updated_at)) errors.push(`${label}.updated_at must be an ISO-compatible date`);
    if (!validDate(entry?.last_validated_at, { nullable: true })) {
      errors.push(`${label}.last_validated_at must be null or an ISO-compatible date`);
    }

    if (!LEARNING_PROMOTION_TARGETS.includes(entry?.promotion?.target)) {
      errors.push(`${label}.promotion.target is invalid`);
    }
    if (!LEARNING_PROMOTION_STATUSES.includes(entry?.promotion?.status)) {
      errors.push(`${label}.promotion.status is invalid`);
    }
    if (!(entry?.promotion?.reference === null || typeof entry?.promotion?.reference === "string")) {
      errors.push(`${label}.promotion.reference must be null or a string`);
    }
    if (index.schema_version === LEARNING_INDEX_SCHEMA) {
      if (!Array.isArray(entry?.derived_from) || entry.derived_from.some((value) => !/^LESSON-[0-9]{4,}$/.test(value)) || new Set(entry.derived_from).size !== entry.derived_from.length) {
        errors.push(`${label}.derived_from must contain unique Lesson IDs`);
      }
      if (!(entry?.owner_position === null || typeof entry?.owner_position === "string")) errors.push(`${label}.owner_position is invalid`);
      const revalidation = entry?.revalidation;
      if (!(revalidation?.last_result === null || REVALIDATION_RESULTS.includes(revalidation?.last_result))) {
        errors.push(`${label}.revalidation.last_result is invalid`);
      }
      if (!validDate(revalidation?.review_after, { nullable: true })) errors.push(`${label}.revalidation.review_after is invalid`);
      if (!uniqueStrings(revalidation?.evidence_refs)) errors.push(`${label}.revalidation.evidence_refs must contain unique strings`);
      if (!Array.isArray(revalidation?.history)) errors.push(`${label}.revalidation.history must be an array`);
      for (const [historyIndex, history] of (revalidation?.history ?? []).entries()) {
        if (!REVALIDATION_RESULTS.includes(history?.result) || !validDate(history?.validated_at) || !nonEmptyString(history?.validated_by) || !uniqueStrings(history?.evidence_refs) || !validDate(history?.review_after, { nullable: true })) {
          errors.push(`${label}.revalidation.history[${historyIndex}] is invalid`);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueNormalized(values) {
  return [...new Set((values ?? []).map((value) => String(value).trim()).filter(Boolean))];
}

function v2Entry(entry) {
  if (entry.revalidation && Array.isArray(entry.derived_from) && Object.hasOwn(entry, "owner_position")) return entry;
  return {
    ...entry,
    derived_from: [],
    owner_position: null,
    revalidation: { last_result: null, review_after: null, evidence_refs: [], history: [] }
  };
}

export function migrateLearningIndexDocument(index) {
  const validation = validateLearningIndex(index);
  if (!validation.valid) throw new Error(`Cannot migrate invalid learning index: ${validation.errors.join("; ")}`);
  if (index.schema_version === LEARNING_INDEX_SCHEMA) return index;
  return { schema_version: LEARNING_INDEX_SCHEMA, entries: index.entries.map(v2Entry) };
}

export async function migrateLearningIndex(target, { dryRun = false } = {}) {
  const indexPath = path.join(target, LEARNING_INDEX_RELATIVE_PATH);
  const current = await readJson(indexPath);
  const migrated = migrateLearningIndexDocument(current);
  const changed = JSON.stringify(current) !== JSON.stringify(migrated);
  if (changed && !dryRun) {
    await atomicWrite(indexPath, formatJson(migrated));
    await appendEvent(target, {
      timestamp: new Date().toISOString(),
      event_type: "learning_index_migrated",
      actor: "human",
      from_schema: current.schema_version,
      to_schema: migrated.schema_version,
      refs: [LEARNING_INDEX_RELATIVE_PATH]
    });
  }
  return { changed, from_schema: current.schema_version, to_schema: migrated.schema_version, index: migrated };
}

function nextLearningId(index, kind) {
  const prefix = kind === "lesson" ? "LESSON" : "PRACTICE";
  const numbers = index.entries
    .map((entry) => new RegExp(`^${prefix}-([0-9]+)$`).exec(entry.id)?.[1])
    .filter(Boolean)
    .map(Number);
  return `${prefix}-${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(4, "0")}`;
}

function markdownList(values, empty = "None recorded.") {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : empty;
}

function learningMarkdown(entry, options, timestamp) {
  return `# ${entry.kind === "lesson" ? "Engineering lesson" : "Engineering practice"}: ${entry.title}\n\n- ID: \`${entry.id}\`\n- Status: \`${entry.status}\`\n- Confidence: \`${entry.confidence}\`\n- Owner Position: ${entry.owner_position ?? "not assigned"}\n- Created: \`${timestamp}\`\n- Last validated: not yet\n\n## Summary\n\n${entry.summary}\n\n## Applicability\n\n${markdownList(entry.applies_to)}\n\n## Tags\n\n${markdownList(entry.tags)}\n\n## Source Work Items\n\n${markdownList(entry.source_work_items)}\n\n## Derived Lessons\n\n${markdownList(entry.derived_from)}\n\n## Evidence\n\n${markdownList(uniqueNormalized(options.evidence))}\n\n## Authority boundary\n\nThis learning guides relevant work. It does not grant permission, change lifecycle state, or replace verification.\n\n## Validation history\n\nNo revalidation recorded.\n`;
}

export async function addLearningEntry(target, kind, options) {
  if (!["lesson", "practice"].includes(kind)) throw new Error(`Unsupported learning kind: ${kind}`);
  const title = String(options.title ?? "").trim();
  const summary = String(options.summary ?? "").trim();
  if (!title || !summary) throw new Error("Learning requires --title and --summary");
  if (!LEARNING_CONFIDENCE.includes(options.confidence)) throw new Error(`--confidence must be ${LEARNING_CONFIDENCE.join(", ")}`);
  const current = await readLearningIndex(target);
  const index = migrateLearningIndexDocument(current);
  const derivedFrom = uniqueNormalized(options.derivedFrom);
  if (kind === "lesson" && derivedFrom.length > 0) throw new Error("A Lesson cannot use --derived-from");
  const missingLessons = derivedFrom.filter((id) => !index.entries.some((entry) => entry.id === id && entry.kind === "lesson"));
  if (missingLessons.length > 0) throw new Error(`Unknown derived Lesson: ${missingLessons.join(", ")}`);
  const sourceWorkItems = uniqueNormalized(options.sourceWorkItems);
  if (sourceWorkItems.some((id) => !isWorkItemId(id))) throw new Error("--source-work-item must contain Work Item IDs");
  const id = nextLearningId(index, kind);
  const timestamp = new Date().toISOString();
  const entry = {
    id,
    kind,
    title,
    summary,
    status: "candidate",
    confidence: options.confidence,
    tags: uniqueNormalized(options.tags),
    applies_to: uniqueNormalized(options.appliesTo),
    source_work_items: sourceWorkItems,
    path: `.ai-org/learning/${kind === "lesson" ? "lessons" : "practices"}/${id}.md`,
    updated_at: timestamp,
    last_validated_at: null,
    promotion: { target: "none", status: "none", reference: null },
    derived_from: derivedFrom,
    owner_position: String(options.ownerPosition ?? "").trim() || null,
    revalidation: { last_result: null, review_after: null, evidence_refs: uniqueNormalized(options.evidence), history: [] }
  };
  const updated = { schema_version: LEARNING_INDEX_SCHEMA, entries: [...index.entries, entry] };
  const validation = validateLearningIndex(updated);
  if (!validation.valid) throw new Error(`Invalid learning entry: ${validation.errors.join("; ")}`);
  const recordPath = path.join(target, entry.path);
  const indexPath = path.join(target, LEARNING_INDEX_RELATIVE_PATH);
  const beforeIndex = await fs.readFile(indexPath);
  const changes = [];
  try {
    const record = learningMarkdown(entry, options, timestamp);
    await atomicCreate(recordPath, record);
    changes.push({ path: recordPath, before: null, afterHash: sha256(record) });
    await atomicWrite(indexPath, formatJson(updated));
    await appendEvent(target, { timestamp, event_type: "learning_added", actor: options.actor ?? "human", learning_id: id, learning_kind: kind, refs: [entry.path, LEARNING_INDEX_RELATIVE_PATH] });
  } catch (error) {
    await atomicWrite(indexPath, beforeIndex).catch(() => {});
    await rollbackFileChanges(changes).catch(() => {});
    throw error;
  }
  return entry;
}

export function revalidationSignal(entry, now = new Date()) {
  if (entry.status === "deprecated") return "not_applicable";
  if (entry.revalidation?.last_result === "contradicted") return "contradicted";
  const reviewAfter = entry.revalidation?.review_after;
  if (!reviewAfter) return "not_scheduled";
  const dueAt = Date.parse(reviewAfter);
  if (dueAt <= now.getTime()) return "overdue";
  if (dueAt - now.getTime() <= 30 * 24 * 60 * 60 * 1000) return "due";
  return "current";
}

export async function listLearningEntries(target) {
  const index = migrateLearningIndexDocument(await readLearningIndex(target));
  return {
    schema_version: "temple.learning-list/v1",
    index_schema: index.schema_version,
    entries: index.entries.map((entry) => ({ ...entry, revalidation: { ...entry.revalidation, signal: revalidationSignal(entry) } }))
  };
}

export async function revalidateLearningEntry(target, options) {
  const result = String(options.result ?? "").trim();
  if (!REVALIDATION_RESULTS.includes(result)) throw new Error(`--result must be ${REVALIDATION_RESULTS.join(", ")}`);
  const reviewAfter = String(options.reviewAfter ?? "").trim() || null;
  if (!validDate(reviewAfter, { nullable: true })) throw new Error("--review-after must be an ISO-compatible timestamp");
  const indexPath = path.join(target, LEARNING_INDEX_RELATIVE_PATH);
  const current = await readLearningIndex(target);
  const index = migrateLearningIndexDocument(current);
  const entryIndex = index.entries.findIndex((entry) => entry.id === options.learningId);
  if (entryIndex < 0) throw new Error(`Learning entry not found: ${options.learningId}`);
  const originalEntry = index.entries[entryIndex];
  const timestamp = new Date().toISOString();
  const evidenceRefs = uniqueNormalized(options.evidence);
  const history = { result, validated_at: timestamp, validated_by: options.actor ?? "human", evidence_refs: evidenceRefs, review_after: reviewAfter };
  const entry = {
    ...originalEntry,
    status: result === "confirmed" ? (originalEntry.kind === "lesson" ? "validated" : "active") : originalEntry.status,
    updated_at: timestamp,
    last_validated_at: timestamp,
    revalidation: {
      last_result: result,
      review_after: reviewAfter,
      evidence_refs: uniqueNormalized([...(originalEntry.revalidation?.evidence_refs ?? []), ...evidenceRefs]),
      history: [...(originalEntry.revalidation?.history ?? []), history]
    }
  };
  const entries = [...index.entries];
  entries[entryIndex] = entry;
  const updated = { schema_version: LEARNING_INDEX_SCHEMA, entries };
  const validation = validateLearningIndex(updated);
  if (!validation.valid) throw new Error(`Invalid learning revalidation: ${validation.errors.join("; ")}`);
  const recordPath = path.join(target, entry.path);
  const [beforeIndex, beforeRecord] = await Promise.all([fs.readFile(indexPath), fs.readFile(recordPath)]);
  const addition = `\n### ${timestamp}\n\n- Result: \`${result}\`\n- Validated by: \`${history.validated_by}\`\n- Review after: ${reviewAfter ? `\`${reviewAfter}\`` : "not scheduled"}\n- Evidence:\n${markdownList(evidenceRefs)}\n`;
  try {
    await atomicWrite(recordPath, `${beforeRecord.toString("utf8").trimEnd()}\n${addition}`);
    await atomicWrite(indexPath, formatJson(updated));
    await appendEvent(target, { timestamp, event_type: "learning_revalidated", actor: history.validated_by, learning_id: entry.id, result, refs: [entry.path, ...evidenceRefs] });
  } catch (error) {
    await Promise.all([atomicWrite(indexPath, beforeIndex).catch(() => {}), atomicWrite(recordPath, beforeRecord).catch(() => {})]);
    throw error;
  }
  return { ...entry, revalidation: { ...entry.revalidation, signal: revalidationSignal(entry) } };
}

export async function readLearningIndex(target) {
  return readJson(path.join(target, LEARNING_INDEX_RELATIVE_PATH));
}

export async function ensureLearningIndex(target) {
  const indexPath = path.join(target, LEARNING_INDEX_RELATIVE_PATH);
  if (await pathExists(indexPath)) return { path: indexPath, created: false, afterHash: null };
  const content = formatJson(emptyLearningIndex());
  try {
    await atomicCreate(indexPath, content);
    return { path: indexPath, created: true, afterHash: sha256(content) };
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    return { path: indexPath, created: false, afterHash: null };
  }
}

export function summarizeLearningIndex(index) {
  const entries = Array.isArray(index?.entries) ? index.entries : [];
  return {
    total: entries.length,
    lessons: entries.filter((entry) => entry.kind === "lesson").length,
    practices: entries.filter((entry) => entry.kind === "practice").length,
    candidates: entries.filter((entry) => entry.status === "candidate").length,
    validated: entries.filter((entry) => entry.status === "validated").length,
    active: entries.filter((entry) => entry.status === "active").length,
    deprecated: entries.filter((entry) => entry.status === "deprecated").length,
    revalidation_due: entries.filter((entry) => ["due", "overdue"].includes(revalidationSignal(v2Entry(entry)))).length,
    contradicted: entries.filter((entry) => revalidationSignal(v2Entry(entry)) === "contradicted").length,
    entries
  };
}
