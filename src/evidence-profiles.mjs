import path from "node:path";
import { atomicCreate, formatJson, pathExists, readJson, sha256 } from "./files.mjs";

export const EVIDENCE_PROFILES_SCHEMA = "temple.evidence-profiles/v1";
export const EVIDENCE_PROFILES_RELATIVE_PATH = ".ai-org/project/evidence-profiles.json";
export const EVIDENCE_PROFILE_IDS = ["private", "public", "restricted"];

const PROFILE_FLOORS = Object.freeze({
  private: { local_environment: "review-required", retained_legacy_repository: "review-required" },
  public: { local_environment: "blocked", retained_legacy_repository: "review-required" },
  restricted: { local_environment: "blocked", retained_legacy_repository: "blocked" }
});

const REQUIRED_PUBLIC_EVIDENCE = [
  "lifecycle-and-handoffs",
  "quality-and-release-gates",
  "model-routing-metadata",
  "token-counts-and-budgets",
  "credits-reset-retry-and-fallback-approvals",
  "experiment-protocols-observations-and-outcomes"
];

const REQUIRED_LOCAL_ONLY_EVIDENCE = [
  "credentials-and-secret-values",
  "raw-provider-telemetry",
  "raw-prompts-and-responses",
  "live-account-balance-and-reset-availability"
];

const SYNTHETIC_USERNAMES = ["demo", "example", "fixture", "sample", "test", "tester"];

export function defaultEvidenceProfiles() {
  return {
    schema_version: EVIDENCE_PROFILES_SCHEMA,
    active_profile: "private",
    profiles: EVIDENCE_PROFILE_IDS.map((id) => ({ id, ...PROFILE_FLOORS[id] })),
    reviewed_legacy_baseline: null,
    public_evidence: [...REQUIRED_PUBLIC_EVIDENCE],
    local_only_evidence: [...REQUIRED_LOCAL_ONLY_EVIDENCE],
    synthetic_usernames: [...SYNTHETIC_USERNAMES],
    max_text_file_bytes: 2097152,
    binary_review: "required"
  };
}

function uniqueNonEmptyStrings(values) {
  return Array.isArray(values) && values.length > 0 &&
    values.every((value) => typeof value === "string" && value.trim()) &&
    new Set(values).size === values.length;
}

export function validateEvidenceProfiles(document) {
  const errors = [];
  if (document?.schema_version !== EVIDENCE_PROFILES_SCHEMA) {
    errors.push(`schema_version must be ${EVIDENCE_PROFILES_SCHEMA}`);
  }
  if (!EVIDENCE_PROFILE_IDS.includes(document?.active_profile)) errors.push("active_profile is invalid");
  const profiles = Array.isArray(document?.profiles) ? document.profiles : [];
  const byId = new Map(profiles.map((entry) => [entry?.id, entry]));
  if (profiles.length !== EVIDENCE_PROFILE_IDS.length || byId.size !== EVIDENCE_PROFILE_IDS.length) {
    errors.push("profiles must contain private, public, and restricted exactly once");
  }
  for (const id of EVIDENCE_PROFILE_IDS) {
    const profile = byId.get(id);
    if (!profile) {
      errors.push(`profile ${id} is missing`);
      continue;
    }
    for (const [field, expected] of Object.entries(PROFILE_FLOORS[id])) {
      if (profile[field] !== expected) errors.push(`profile ${id}.${field} must be ${expected}`);
    }
  }
  const baseline = document?.reviewed_legacy_baseline;
  if (baseline !== null) {
    if (!/^[0-9a-f]{40}$/.test(baseline?.revision ?? "")) errors.push("reviewed_legacy_baseline.revision must be a full Git commit id");
    if (typeof baseline?.approved_by !== "string" || !baseline.approved_by.trim()) errors.push("reviewed_legacy_baseline.approved_by is required");
    if (typeof baseline?.approved_at !== "string" || Number.isNaN(Date.parse(baseline.approved_at))) errors.push("reviewed_legacy_baseline.approved_at must be an ISO date-time");
    if (typeof baseline?.rationale !== "string" || !baseline.rationale.trim()) errors.push("reviewed_legacy_baseline.rationale is required");
  }
  if (!uniqueNonEmptyStrings(document?.public_evidence)) errors.push("public_evidence must contain unique non-empty values");
  else for (const entry of REQUIRED_PUBLIC_EVIDENCE) if (!document.public_evidence.includes(entry)) errors.push(`public_evidence is missing ${entry}`);
  if (!uniqueNonEmptyStrings(document?.local_only_evidence)) errors.push("local_only_evidence must contain unique non-empty values");
  else for (const entry of REQUIRED_LOCAL_ONLY_EVIDENCE) if (!document.local_only_evidence.includes(entry)) errors.push(`local_only_evidence is missing ${entry}`);
  if (!uniqueNonEmptyStrings(document?.synthetic_usernames) ||
      document.synthetic_usernames.length !== SYNTHETIC_USERNAMES.length ||
      document.synthetic_usernames.some((entry, index) => entry !== SYNTHETIC_USERNAMES[index])) {
    errors.push(`synthetic_usernames must remain ${SYNTHETIC_USERNAMES.join(", ")}`);
  }
  if (!Number.isInteger(document?.max_text_file_bytes) || document.max_text_file_bytes < 16384 || document.max_text_file_bytes > 8388608) {
    errors.push("max_text_file_bytes must be an integer from 16384 to 8388608");
  }
  if (document?.binary_review !== "required") errors.push("binary_review must remain required");
  return { valid: errors.length === 0, errors };
}

export async function ensureEvidenceProfiles(target) {
  const policyPath = path.join(target, EVIDENCE_PROFILES_RELATIVE_PATH);
  if (await pathExists(policyPath)) return { path: policyPath, created: false, afterHash: null };
  const content = formatJson(defaultEvidenceProfiles());
  try {
    await atomicCreate(policyPath, content);
    return { path: policyPath, created: true, afterHash: sha256(content) };
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    return { path: policyPath, created: false, afterHash: null };
  }
}

export async function readEvidenceProfiles(target) {
  const policyPath = path.join(target, EVIDENCE_PROFILES_RELATIVE_PATH);
  const source = await pathExists(policyPath) ? "project" : "framework-default";
  const policy = source === "project" ? await readJson(policyPath) : defaultEvidenceProfiles();
  const validation = validateEvidenceProfiles(policy);
  if (!validation.valid) throw new Error(`Invalid Evidence Profiles: ${validation.errors.join("; ")}`);
  return { policy, source };
}

export function evidenceProfile(policy, requestedId) {
  const id = requestedId ?? policy.active_profile;
  const profile = policy.profiles.find((entry) => entry.id === id);
  if (!profile) throw new Error(`Unknown Evidence Profile: ${id}`);
  return profile;
}
