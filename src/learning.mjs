import path from "node:path";
import { atomicCreate, formatJson, pathExists, readJson, sha256 } from "./files.mjs";

export const LEARNING_INDEX_RELATIVE_PATH = ".ai-org/learning/index.json";
export const LEARNING_INDEX_SCHEMA = "ai-org.learning-index/v1";
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
  if (index?.schema_version !== LEARNING_INDEX_SCHEMA) errors.push(`schema_version must be ${LEARNING_INDEX_SCHEMA}`);
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
      !entry.source_work_items.every((value) => /^WI-[0-9]{4,}$/.test(value)) ||
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
  }
  return { valid: errors.length === 0, errors };
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
    entries
  };
}
