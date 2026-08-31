import path from "node:path";
import { spawnSync } from "node:child_process";
import { atomicCreate, atomicWrite, formatJson, pathExists, readJson, sha256 } from "./files.mjs";
import { validateDisplayName } from "./model.mjs";
import { appendEvent, uniqueStrings } from "./project.mjs";
import { HIGH_ASSURANCE_PROFILE, validateHighAssuranceProfilePrerequisites } from "./assurance.mjs";

export const COLLABORATION_RELATIVE_PATH = ".ai-org/project/collaboration.json";
export const COLLABORATION_SCHEMA_V1 = "temple.collaboration/v1";
export const COLLABORATION_SCHEMA_V2 = "temple.collaboration/v2";
export const COLLABORATION_PROFILES = ["solo", "collaborative", HIGH_ASSURANCE_PROFILE];
export const PRINCIPAL_STATUSES = ["active", "suspended", "inactive"];
export const MEMBERSHIP_STATUSES = ["provisional", "active", "suspended", "expired", "revoked"];
export const AUTHORITY_GRANT_STATUSES = ["active", "suspended", "expired", "revoked"];
export const AUTHORITY_RISK_LEVELS = ["low", "standard", "high", "critical"];
export const HUMAN_AUTHORITIES = [
  "manage-identities",
  "manage-authority",
  "manage-recovery",
  "approve-critical-governance",
  "approve-high-risk-release"
];
export const VALIDATION_LEVELS = [
  "automated",
  "simulated_collaborative",
  "real_collaborative",
  "representative_pilot",
  "high_assurance_drill"
];
export const VALIDATION_STATUSES = ["not_run", "planned", "passed", "failed"];
export const DISCIPLINES = [
  "architecture",
  "backend",
  "database",
  "frontend",
  "full-stack",
  "general-development",
  "infrastructure",
  "mobile",
  "observability",
  "product",
  "quality",
  "release",
  "security",
  "ui",
  "ux"
];

const PRINCIPAL_ID = /^principal-[a-z0-9][a-z0-9-]*$/;
const AGENT_ID = /^agent-[a-z0-9][a-z0-9-]*$/;
const GRANT_ID = /^grant-[a-z0-9][a-z0-9-]*$/;
const DEFAULT_DISCIPLINES = {
  engineering_manager: ["architecture"],
  product_manager: ["product"],
  ux_designer: ["ux"],
  ui_designer: ["ui"],
  tech_lead: ["architecture"],
  developer: ["general-development"],
  quality_evaluator: ["quality"],
  independent_qa: ["quality"],
  release_manager: ["release"],
  observer: ["observability"]
};

function emptyValidationGate(plan = null) {
  return { status: "not_run", tested_revision: null, evidence: [], participants: [], environments: [], plan };
}

export function buildCollaborationState(assignmentsDocument) {
  const memberships = (assignmentsDocument.assignments ?? [])
    .filter((assignment) => assignment.active !== false)
    .map((assignment) => ({
      position_id: assignment.position_id,
      agent_id: assignment.agent_id,
      disciplines: DEFAULT_DISCIPLINES[assignment.position_id] ?? [],
      default: true,
      status: "active",
      active: true,
      qualification: {
        basis: "bootstrap-assignment",
        evidence_refs: [],
        risk_ceiling: "standard",
        qualified_at: null,
        review_after: null,
        expires_at: null
      }
    }))
    .sort((left, right) => left.position_id.localeCompare(right.position_id));
  return {
    schema_version: COLLABORATION_SCHEMA_V2,
    profile: "solo",
    coordination_backend: "repository",
    principals: [],
    sponsorships: [],
    memberships,
    authority_grants: [],
    bootstrap_owner: null,
    recovery: { status: "not_configured", trustee_principal_ids: [], threshold: 0, last_verified_at: null },
    validation: {
      automated: emptyValidationGate(),
      simulated_collaborative: emptyValidationGate(),
      real_collaborative: emptyValidationGate(".ai-org/templates/collaborative-large-scale-test-plan.md"),
      representative_pilot: emptyValidationGate(),
      high_assurance_drill: emptyValidationGate()
    }
  };
}

export async function ensureCollaborationState(target) {
  const documentPath = path.join(target, COLLABORATION_RELATIVE_PATH);
  if (await pathExists(documentPath)) return { path: documentPath, created: false, afterHash: null };
  const assignments = await readJson(path.join(target, ".ai-org/project/assignments.json"));
  const content = formatJson(buildCollaborationState(assignments));
  try {
    await atomicCreate(documentPath, content);
    return { path: documentPath, created: true, afterHash: sha256(content) };
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    return { path: documentPath, created: false, afterHash: null };
  }
}

export function synchronizeDefaultMembershipDocument(document, assignments) {
  const v2 = document.schema_version === COLLABORATION_SCHEMA_V2;
  const activeAssignments = (assignments.assignments ?? []).filter((assignment) => assignment.active !== false);
  const defaultKeys = new Set(activeAssignments.map((assignment) => `${assignment.position_id}:${assignment.agent_id}`));
  const nonDefaults = (document.memberships ?? []).filter(
    (membership) => membership.default !== true && !defaultKeys.has(`${membership.position_id}:${membership.agent_id}`)
  );
  const existingDefaults = new Map(
    (document.memberships ?? [])
      .filter((membership) => membership.default === true)
      .map((membership) => [membership.position_id, membership])
  );
  const defaults = activeAssignments
    .map((assignment) => ({
      position_id: assignment.position_id,
      agent_id: assignment.agent_id,
      disciplines:
        existingDefaults.get(assignment.position_id)?.disciplines ?? DEFAULT_DISCIPLINES[assignment.position_id] ?? [],
      default: true,
      ...(v2
        ? {
            status: "active",
            active: true,
            qualification: existingDefaults.get(assignment.position_id)?.qualification ?? {
              basis: "bootstrap-assignment",
              evidence_refs: [],
              risk_ceiling: "standard",
              qualified_at: null,
              review_after: null,
              expires_at: null
            }
          }
        : { active: true })
    }))
    .sort((left, right) => left.position_id.localeCompare(right.position_id));
  return { ...document, memberships: [...defaults, ...nonDefaults] };
}

export function principalStatus(principal) {
  return principal?.status ?? (principal?.active === false ? "inactive" : "active");
}

export function membershipStatus(membership) {
  return membership?.status ?? (membership?.active === false ? "revoked" : "active");
}

export function sponsorshipStatus(sponsorship) {
  return sponsorship?.status ?? (sponsorship?.active === false ? "inactive" : "active");
}

function legacyValidation(document) {
  const legacy = document.large_scale_validation ?? {
    status: "not_run",
    plan: ".ai-org/templates/collaborative-large-scale-test-plan.md"
  };
  const real = emptyValidationGate(legacy.plan);
  real.status = legacy.status ?? "not_run";
  real.tested_revision = legacy.tested_revision ?? null;
  real.evidence = legacy.evidence ?? [];
  return {
    automated: emptyValidationGate(),
    simulated_collaborative: emptyValidationGate(),
    real_collaborative: real,
    representative_pilot: emptyValidationGate(),
    high_assurance_drill: emptyValidationGate()
  };
}

export function normalizedCollaborationState(document) {
  if (document?.schema_version === COLLABORATION_SCHEMA_V2) return document;
  if (document?.schema_version !== COLLABORATION_SCHEMA_V1) return document;
  return {
    schema_version: COLLABORATION_SCHEMA_V2,
    profile: document.profile,
    coordination_backend: document.coordination_backend,
    principals: (document.principals ?? []).map((principal) => ({
      id: principal.id,
      display_name: principal.display_name,
      status: principalStatus(principal),
      active: principalStatus(principal) === "active",
      provider_identities: [],
      created_at: principal.created_at ?? null,
      updated_at: principal.created_at ?? null
    })),
    sponsorships: (document.sponsorships ?? []).map((entry) => ({
      principal_id: entry.principal_id,
      agent_id: entry.agent_id,
      status: sponsorshipStatus(entry),
      active: sponsorshipStatus(entry) === "active",
      created_at: entry.created_at ?? null,
      ended_at: entry.active === false ? entry.ended_at ?? null : null
    })),
    memberships: (document.memberships ?? []).map((entry) => ({
      position_id: entry.position_id,
      agent_id: entry.agent_id,
      disciplines: entry.disciplines ?? [],
      default: entry.default === true,
      status: entry.default === true && membershipStatus(entry) === "active" ? "active" : membershipStatus(entry) === "active" ? "provisional" : membershipStatus(entry),
      active: entry.default === true && membershipStatus(entry) === "active",
      qualification: {
        basis: entry.default === true ? "bootstrap-assignment" : "legacy-unverified",
        evidence_refs: [],
        risk_ceiling: entry.default === true ? "standard" : "low",
        qualified_at: null,
        review_after: null,
        expires_at: null
      }
    })),
    authority_grants: [],
    bootstrap_owner: null,
    recovery: { status: "not_configured", trustee_principal_ids: [], threshold: 0, last_verified_at: null },
    validation: legacyValidation(document)
  };
}

export function planCollaborationMigration(document) {
  if (document?.schema_version === COLLABORATION_SCHEMA_V2) {
    return { changed: false, from: COLLABORATION_SCHEMA_V2, to: COLLABORATION_SCHEMA_V2, document };
  }
  if (document?.schema_version !== COLLABORATION_SCHEMA_V1) throw new Error("Unsupported collaboration schema_version");
  return { changed: true, from: COLLABORATION_SCHEMA_V1, to: COLLABORATION_SCHEMA_V2, document: normalizedCollaborationState(document) };
}

export async function migrateCollaborationState(target, options = {}) {
  const document = await readCollaborationState(target);
  const plan = planCollaborationMigration(document);
  if (!plan.changed || options.dryRun) return plan;
  await writeCollaborationState(target, plan.document);
  await appendEvent(target, {
    timestamp: new Date().toISOString(),
    event_type: "collaboration_state_migrated",
    actor: options.actor ?? "human",
    from_schema: plan.from,
    to_schema: plan.to,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return plan;
}

export async function readCollaborationState(target) {
  const documentPath = path.join(target, COLLABORATION_RELATIVE_PATH);
  if (!(await pathExists(documentPath))) {
    throw new Error(`${COLLABORATION_RELATIVE_PATH} is missing; run temple upgrade`);
  }
  return readJson(documentPath);
}

async function writeCollaborationState(target, document) {
  await atomicWrite(path.join(target, COLLABORATION_RELATIVE_PATH), formatJson(document));
}

export function validateCollaborationState(document, agentsDocument, assignmentsDocument, positionIds) {
  const errors = [];
  const warnings = [];
  const agentIds = new Set((agentsDocument?.agents ?? []).map((agent) => agent.id));
  const principalIds = new Set();
  const activeProviderSubjects = new Set();
  const v2 = document?.schema_version === COLLABORATION_SCHEMA_V2;
  if (![COLLABORATION_SCHEMA_V1, COLLABORATION_SCHEMA_V2].includes(document?.schema_version)) errors.push("invalid schema_version");
  if (!COLLABORATION_PROFILES.includes(document?.profile)) errors.push("unsupported collaboration profile");
  if (document?.coordination_backend !== "repository") errors.push("coordination_backend must be repository");
  if (v2) {
    for (const level of VALIDATION_LEVELS) {
      const gate = document.validation?.[level];
      if (!gate || !VALIDATION_STATUSES.includes(gate.status)) {
        errors.push(`validation.${level} must have a supported status`);
        continue;
      }
      if (!Array.isArray(gate.evidence) || !Array.isArray(gate.participants) || !Array.isArray(gate.environments)) {
        errors.push(`validation.${level} evidence, participants, and environments must be arrays`);
      }
      if (gate.status === "passed" && (!gate.tested_revision || gate.evidence.length === 0)) {
        errors.push(`passed ${level} validation requires evidence and tested_revision`);
      }
      if (level === "real_collaborative" && gate.status === "passed") {
        if (new Set(gate.participants).size < 2 || new Set(gate.environments).size < 2) {
          errors.push("passed real_collaborative validation requires two distinct Principals and environments");
        }
      }
    }
  } else {
    const largeScale = document?.large_scale_validation;
    if (
      !largeScale ||
      !VALIDATION_STATUSES.includes(largeScale.status) ||
      typeof largeScale.plan !== "string" ||
      largeScale.plan.length === 0
    ) {
      errors.push("large_scale_validation must have a supported status and plan");
    }
    if (largeScale?.status === "passed" && (!(Array.isArray(largeScale.evidence) && largeScale.evidence.length > 0) || !largeScale.tested_revision)) {
      errors.push("passed large-scale validation requires evidence and tested_revision");
    }
  }

  for (const principal of document?.principals ?? []) {
    if (!PRINCIPAL_ID.test(principal.id ?? "") || principalIds.has(principal.id)) errors.push("invalid or duplicate principal ID");
    if (validateDisplayName(principal.display_name)) errors.push("invalid principal display name");
    if (v2 && !PRINCIPAL_STATUSES.includes(principal.status)) errors.push("principal status is invalid");
    if (v2 && !Array.isArray(principal.provider_identities)) errors.push("principal provider_identities must be an array");
    if (
      v2 &&
      (principal.provider_identities ?? []).some(
        (identity) =>
          !identity ||
          typeof identity.provider !== "string" ||
          !identity.provider.trim() ||
          typeof identity.subject !== "string" ||
          !identity.subject.trim() ||
          !["active", "inactive"].includes(identity.status)
      )
    ) {
      errors.push("principal provider identity is invalid");
    }
    if (v2) {
      for (const identity of (principal.provider_identities ?? []).filter((entry) => entry.status === "active")) {
        const key = `${identity.provider}:${identity.subject}`;
        if (activeProviderSubjects.has(key)) errors.push("active provider identity is linked to more than one Principal");
        activeProviderSubjects.add(key);
      }
    }
    principalIds.add(principal.id);
  }

  const sponsoredAgents = new Set();
  for (const sponsorship of document?.sponsorships ?? []) {
    if (!principalIds.has(sponsorship.principal_id) || !agentIds.has(sponsorship.agent_id)) {
      errors.push("sponsorship references an unknown principal or Agent Identity");
    }
    if (v2 && !["active", "inactive"].includes(sponsorship.status)) errors.push("sponsorship status is invalid");
    if (sponsorshipStatus(sponsorship) === "active") {
      if (sponsoredAgents.has(sponsorship.agent_id)) errors.push("an Agent Identity may have only one active sponsor");
      sponsoredAgents.add(sponsorship.agent_id);
    }
  }

  const memberships = document?.memberships ?? [];
  const membershipKeys = new Set();
  const defaultPositions = new Set();
  for (const membership of memberships) {
    const key = `${membership.position_id}:${membership.agent_id}`;
    if (!positionIds.has(membership.position_id) || !agentIds.has(membership.agent_id) || membershipKeys.has(key)) {
      errors.push("membership is invalid, duplicated, or references an unknown identity");
    }
    if (!Array.isArray(membership.disciplines) || membership.disciplines.some((value) => !DISCIPLINES.includes(value))) {
      errors.push("membership contains an unsupported discipline");
    }
    if (v2) {
      if (!MEMBERSHIP_STATUSES.includes(membership.status)) errors.push("membership status is invalid");
      if (!membership.qualification || !Array.isArray(membership.qualification.evidence_refs)) {
        errors.push("membership qualification is invalid");
      }
      if (!AUTHORITY_RISK_LEVELS.includes(membership.qualification?.risk_ceiling)) errors.push("membership risk ceiling is invalid");
    }
    if (membership.default) {
      if (defaultPositions.has(membership.position_id)) errors.push("a Position may have only one default membership");
      defaultPositions.add(membership.position_id);
    }
    membershipKeys.add(key);
  }

  for (const assignment of (assignmentsDocument?.assignments ?? []).filter((entry) => entry.active !== false)) {
    const matching = memberships.find(
      (membership) =>
        membershipStatus(membership) === "active" &&
        membership.default === true &&
        membership.position_id === assignment.position_id &&
        membership.agent_id === assignment.agent_id
    );
    if (!matching) errors.push(`default membership does not match assignment for ${assignment.position_id}`);
  }

  if (v2) {
    const activePrincipals = new Set(
      (document.principals ?? []).filter((entry) => principalStatus(entry) === "active").map((entry) => entry.id)
    );
    const grantIds = new Set();
    for (const grant of document.authority_grants ?? []) {
      if (!GRANT_ID.test(grant.id ?? "") || grantIds.has(grant.id)) errors.push("invalid or duplicate authority grant ID");
      if (!principalIds.has(grant.principal_id)) errors.push("authority grant references an unknown Principal");
      if (!HUMAN_AUTHORITIES.includes(grant.authority)) errors.push("authority grant names an unsupported authority");
      if (!AUTHORITY_GRANT_STATUSES.includes(grant.status)) errors.push("authority grant status is invalid");
      if (!AUTHORITY_RISK_LEVELS.includes(grant.risk_ceiling)) errors.push("authority grant risk ceiling is invalid");
      if (!Array.isArray(grant.approved_by) || grant.approved_by.some((id) => !principalIds.has(id))) {
        errors.push("authority grant approval provenance is invalid");
      }
      grantIds.add(grant.id);
    }
    const bootstrap = document.bootstrap_owner;
    if (bootstrap !== null) {
      if (!principalIds.has(bootstrap.principal_id) || !["active", "retired"].includes(bootstrap.status)) {
        errors.push("bootstrap_owner is invalid");
      }
      if (bootstrap.status === "active" && !activePrincipals.has(bootstrap.principal_id)) {
        errors.push("active bootstrap owner must be an active Principal");
      }
    }
    const recovery = document.recovery;
    if (!recovery || !["not_configured", "ready", "degraded"].includes(recovery.status)) {
      errors.push("recovery configuration is invalid");
    } else {
      const trustees = new Set(recovery.trustee_principal_ids ?? []);
      if (trustees.size !== (recovery.trustee_principal_ids ?? []).length || [...trustees].some((id) => !principalIds.has(id))) {
        errors.push("recovery trustees are invalid");
      }
      if (!Number.isInteger(recovery.threshold) || recovery.threshold < 0 || recovery.threshold > trustees.size) {
        errors.push("recovery threshold is invalid");
      }
      if (recovery.status === "ready" && (recovery.threshold < 1 || [...trustees].filter((id) => activePrincipals.has(id)).length < recovery.threshold)) {
        errors.push("ready recovery requires enough active trustees");
      }
    }
  }

  if (["collaborative", HIGH_ASSURANCE_PROFILE].includes(document?.profile)) {
    const activePrincipalIds = new Set(
      (document.principals ?? []).filter((entry) => principalStatus(entry) === "active").map((entry) => entry.id)
    );
    if (activePrincipalIds.size === 0) warnings.push("Collaborative profile has no active Human Principal");
    const unsponsored = [...agentIds].filter((agentId) => !sponsoredAgents.has(agentId));
    if (unsponsored.length > 0) warnings.push(`unsponsored Agent Identities: ${unsponsored.join(", ")}`);
    const realValidationStatus = v2 ? document.validation?.real_collaborative?.status : document.large_scale_validation?.status;
    if (realValidationStatus !== "passed") {
      warnings.push("real multi-human, multi-machine validation has not passed");
    }
  }
  if (document?.profile === HIGH_ASSURANCE_PROFILE) {
    errors.push(...validateHighAssuranceProfilePrerequisites(document, agentsDocument, assignmentsDocument).errors);
  }
  return { valid: errors.length === 0, errors: uniqueStrings(errors), warnings: uniqueStrings(warnings) };
}

export async function setCollaborationProfile(target, profile) {
  if (!COLLABORATION_PROFILES.includes(profile)) {
    throw new Error(`Unsupported profile ${profile}; use ${COLLABORATION_PROFILES.join(" or ")}`);
  }
  const document = await readCollaborationState(target);
  if (profile === HIGH_ASSURANCE_PROFILE) {
    const [agentsDocument, assignmentsDocument] = await Promise.all([
      readJson(path.join(target, ".ai-org/project/agents.json")),
      readJson(path.join(target, ".ai-org/project/assignments.json"))
    ]);
    const readiness = validateHighAssuranceProfilePrerequisites(document, agentsDocument, assignmentsDocument);
    if (!readiness.valid) throw new Error(readiness.errors.join("; "));
  }
  const updated = { ...document, profile };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp: new Date().toISOString(),
    event_type: "collaboration_profile_changed",
    actor: "human",
    profile,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return updated;
}

export async function addPrincipal(target, options) {
  const principalId = String(options.principalId ?? "").trim();
  const displayName = String(options.displayName ?? "").trim();
  if (!PRINCIPAL_ID.test(principalId)) throw new Error("--principal-id must match principal-<lowercase-slug>");
  const nameError = validateDisplayName(displayName);
  if (nameError) throw new Error(`Principal display name ${nameError}`);
  const document = await readCollaborationState(target);
  if ((document.principals ?? []).some((principal) => principal.id === principalId)) throw new Error(`Principal already exists: ${principalId}`);
  const timestamp = new Date().toISOString();
  const providerId = String(options.providerId ?? "").trim();
  const providerSubject = String(options.providerSubject ?? "").trim();
  const providerHandle = String(options.providerHandle ?? "").trim() || null;
  const evidenceRef = String(options.evidenceRef ?? "").trim() || null;
  if (Boolean(providerId) !== Boolean(providerSubject)) throw new Error("Provider identity requires both --provider-id and --provider-subject");
  if (providerId.length > 80 || providerSubject.length > 200 || (providerHandle?.length ?? 0) > 160 || (evidenceRef?.length ?? 0) > 500) {
    throw new Error("Provider identity value exceeds its supported length");
  }
  if (
    providerId &&
    (document.principals ?? []).some((principal) =>
      (principal.provider_identities ?? []).some(
        (identity) => identity.status === "active" && identity.provider === providerId && identity.subject === providerSubject
      )
    )
  ) {
    throw new Error("Provider identity is already linked to another Human Principal");
  }
  const principal =
    document.schema_version === COLLABORATION_SCHEMA_V2
      ? {
          id: principalId,
          display_name: displayName,
          status: "active",
          active: true,
          provider_identities: providerId
            ? [{ provider: providerId, subject: providerSubject, handle: providerHandle, status: "active", verified_at: null, evidence_ref: evidenceRef }]
            : [],
          created_at: timestamp,
          updated_at: timestamp
        }
      : { id: principalId, display_name: displayName, active: true, created_at: timestamp };
  const bootstrapOwner =
    document.schema_version === COLLABORATION_SCHEMA_V2 && document.bootstrap_owner === null && (document.principals ?? []).length === 0
      ? { principal_id: principalId, status: "active", granted_at: timestamp, retired_at: null }
      : document.bootstrap_owner;
  const updated = {
    ...document,
    principals: [...(document.principals ?? []), principal],
    ...(document.schema_version === COLLABORATION_SCHEMA_V2 ? { bootstrap_owner: bootstrapOwner } : {})
  };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp: principal.created_at,
    event_type: "human_principal_added",
    actor: principalId,
    principal_id: principalId,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return principal;
}

export async function sponsorAgent(target, options) {
  const document = await readCollaborationState(target);
  const agents = await readJson(path.join(target, ".ai-org/project/agents.json"));
  if (!(document.principals ?? []).some((principal) => principal.id === options.principalId && principalStatus(principal) === "active")) {
    throw new Error(`Unknown active principal: ${options.principalId ?? "missing"}`);
  }
  if (!(agents.agents ?? []).some((agent) => agent.id === options.agentId && agent.active !== false)) {
    throw new Error(`Unknown active Agent Identity: ${options.agentId ?? "missing"}`);
  }
  const timestamp = new Date().toISOString();
  const sponsorship =
    document.schema_version === COLLABORATION_SCHEMA_V2
      ? { principal_id: options.principalId, agent_id: options.agentId, status: "active", active: true, created_at: timestamp, ended_at: null }
      : { principal_id: options.principalId, agent_id: options.agentId, active: true };
  const prior =
    document.schema_version === COLLABORATION_SCHEMA_V2
      ? (document.sponsorships ?? []).map((entry) =>
          entry.agent_id === options.agentId && sponsorshipStatus(entry) === "active"
            ? { ...entry, status: "inactive", active: false, ended_at: timestamp }
            : entry
        )
      : (document.sponsorships ?? []).filter((entry) => entry.agent_id !== options.agentId);
  const updated = { ...document, sponsorships: [...prior, sponsorship] };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp: new Date().toISOString(),
    event_type: "agent_sponsored",
    actor: options.principalId,
    principal_id: options.principalId,
    agent_id: options.agentId,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return sponsorship;
}

export async function addAgentIdentity(target, options) {
  const agentId = String(options.agentId ?? "").trim();
  const displayName = String(options.displayName ?? "").trim();
  if (!AGENT_ID.test(agentId)) throw new Error("--agent-id must match agent-<lowercase-slug>");
  const nameError = validateDisplayName(displayName);
  if (nameError) throw new Error(`Agent display name ${nameError}`);
  const documentPath = path.join(target, ".ai-org/project/agents.json");
  const document = await readJson(documentPath);
  if ((document.agents ?? []).some((agent) => agent.id === agentId)) throw new Error(`Agent Identity already exists: ${agentId}`);
  const agent = { id: agentId, display_name: displayName, active: true, created_at: new Date().toISOString() };
  await atomicWrite(documentPath, formatJson({ ...document, agents: [...(document.agents ?? []), agent] }));
  await appendEvent(target, {
    timestamp: agent.created_at,
    event_type: "agent_identity_added",
    actor: "human",
    agent_id: agentId,
    refs: [".ai-org/project/agents.json"]
  });
  return agent;
}

export async function addMembership(target, options) {
  const document = await readCollaborationState(target);
  const [agents, positions] = await Promise.all([
    readJson(path.join(target, ".ai-org/project/agents.json")),
    readJson(path.join(target, ".ai-org/core/positions.json"))
  ]);
  if (!(agents.agents ?? []).some((agent) => agent.id === options.agentId && agent.active !== false)) {
    throw new Error(`Unknown active Agent Identity: ${options.agentId ?? "missing"}`);
  }
  if (!(positions.positions ?? []).some((position) => position.id === options.positionId)) {
    throw new Error(`Unknown Position: ${options.positionId ?? "missing"}`);
  }
  const disciplines = uniqueStrings(options.disciplines);
  const unsupported = disciplines.filter((value) => !DISCIPLINES.includes(value));
  if (unsupported.length > 0) throw new Error(`Unsupported disciplines: ${unsupported.join(", ")}`);
  const memberships = [...(document.memberships ?? [])];
  const index = memberships.findIndex(
    (membership) => membership.agent_id === options.agentId && membership.position_id === options.positionId
  );
  const membership =
    document.schema_version === COLLABORATION_SCHEMA_V2
      ? {
          position_id: options.positionId,
          agent_id: options.agentId,
          disciplines,
          default: index >= 0 ? memberships[index].default === true : false,
          status: index >= 0 && memberships[index].default === true ? "active" : "provisional",
          active: index >= 0 && memberships[index].default === true,
          qualification:
            index >= 0 && memberships[index].qualification
              ? memberships[index].qualification
              : {
                  basis: index >= 0 && memberships[index].default === true ? "bootstrap-assignment" : "pending-evidence",
                  evidence_refs: [],
                  risk_ceiling: index >= 0 && memberships[index].default === true ? "standard" : "low",
                  qualified_at: null,
                  review_after: null,
                  expires_at: null
                }
        }
      : {
          position_id: options.positionId,
          agent_id: options.agentId,
          disciplines,
          default: index >= 0 ? memberships[index].default === true : false,
          active: true
        };
  if (index >= 0) memberships[index] = membership;
  else memberships.push(membership);
  const updated = { ...document, memberships };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp: new Date().toISOString(),
    event_type: "position_membership_changed",
    actor: "human",
    position: options.positionId,
    agent_id: options.agentId,
    disciplines,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return membership;
}

function requireV2(document, action) {
  if (document.schema_version !== COLLABORATION_SCHEMA_V2) {
    throw new Error(`${action} requires collaboration v2; run temple collaboration migrate first`);
  }
}

function validDateOrNull(value) {
  return value === null || value === undefined || (typeof value === "string" && !Number.isNaN(Date.parse(value)));
}

function activePrincipalIds(document) {
  return new Set((document.principals ?? []).filter((entry) => principalStatus(entry) === "active").map((entry) => entry.id));
}

function activeAuthorityGrant(document, principalId, authority) {
  const now = Date.now();
  return (document.authority_grants ?? []).some(
    (entry) =>
      entry.principal_id === principalId &&
      entry.authority === authority &&
      entry.status === "active" &&
      (!entry.expires_at || Date.parse(entry.expires_at) > now)
  );
}

function assertGovernanceApprovals(document, approvedBy, authority = "manage-authority") {
  const approvals = uniqueStrings(approvedBy);
  const active = activePrincipalIds(document);
  if (approvals.some((id) => !active.has(id))) throw new Error("Governance approval references an inactive or unknown Principal");
  if (document.bootstrap_owner?.status === "active") {
    if (!approvals.includes(document.bootstrap_owner.principal_id)) throw new Error("Active Bootstrap Owner approval is required");
    return approvals;
  }
  if (approvals.length < 2 || approvals.filter((id) => activeAuthorityGrant(document, id, authority)).length < 2) {
    throw new Error(`Two distinct active ${authority} grant holders are required`);
  }
  return approvals;
}

export async function setPrincipalStatus(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Principal lifecycle");
  const status = String(options.status ?? "").trim();
  if (!PRINCIPAL_STATUSES.includes(status)) throw new Error(`--status must be ${PRINCIPAL_STATUSES.join(", ")}`);
  const index = (document.principals ?? []).findIndex((entry) => entry.id === options.principalId);
  if (index < 0) throw new Error(`Unknown Human Principal: ${options.principalId ?? "missing"}`);
  if (document.bootstrap_owner?.status === "active" && document.bootstrap_owner.principal_id === options.principalId && status !== "active") {
    throw new Error("Retire the Bootstrap Owner before suspending or deactivating that Principal");
  }
  const timestamp = new Date().toISOString();
  const principals = [...document.principals];
  principals[index] = { ...principals[index], status, active: status === "active", updated_at: timestamp };
  const active = new Set(principals.filter((entry) => principalStatus(entry) === "active").map((entry) => entry.id));
  const recovery = document.recovery;
  const activeTrustees = (recovery.trustee_principal_ids ?? []).filter((id) => active.has(id)).length;
  const updatedRecovery =
    recovery.status === "not_configured"
      ? recovery
      : { ...recovery, status: recovery.threshold > 0 && activeTrustees >= recovery.threshold ? "ready" : "degraded" };
  const updated = { ...document, principals, recovery: updatedRecovery };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "human_principal_status_changed",
    actor: options.actor ?? "human",
    principal_id: options.principalId,
    status,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return principals[index];
}

export async function setMembershipQualification(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Membership qualification");
  const status = String(options.status ?? "active").trim();
  if (!MEMBERSHIP_STATUSES.includes(status)) throw new Error(`--status must be ${MEMBERSHIP_STATUSES.join(", ")}`);
  const memberships = [...(document.memberships ?? [])];
  const index = memberships.findIndex((entry) => entry.agent_id === options.agentId && entry.position_id === options.positionId);
  if (index < 0) throw new Error("Unknown Position Membership");
  if (memberships[index].default === true && status !== "active") throw new Error("A default Assignment membership must remain active");
  const evidenceRefs = uniqueStrings(options.evidenceRefs);
  if (status === "active" && memberships[index].default !== true && evidenceRefs.length === 0) {
    throw new Error("Activating a non-default membership requires evidence");
  }
  const riskCeiling = String(options.riskCeiling ?? memberships[index].qualification?.risk_ceiling ?? "standard").trim();
  if (!AUTHORITY_RISK_LEVELS.includes(riskCeiling)) throw new Error(`--risk-tier must be ${AUTHORITY_RISK_LEVELS.join(", ")}`);
  const reviewAfter = String(options.reviewAfter ?? "").trim() || null;
  const expiresAt = String(options.expiresAt ?? "").trim() || null;
  if (!validDateOrNull(reviewAfter) || !validDateOrNull(expiresAt)) throw new Error("Membership review or expiry timestamp is invalid");
  const timestamp = new Date().toISOString();
  memberships[index] = {
    ...memberships[index],
    status,
    active: status === "active",
    qualification: {
      basis: status === "active" ? (memberships[index].default ? "bootstrap-assignment" : "evidence") : memberships[index].qualification?.basis ?? "pending-evidence",
      evidence_refs: evidenceRefs.length > 0 ? evidenceRefs : memberships[index].qualification?.evidence_refs ?? [],
      risk_ceiling: riskCeiling,
      qualified_at: status === "active" ? timestamp : memberships[index].qualification?.qualified_at ?? null,
      review_after: reviewAfter,
      expires_at: expiresAt
    }
  };
  const updated = { ...document, memberships };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "position_membership_qualification_changed",
    actor: options.actor ?? "human",
    agent_id: options.agentId,
    position: options.positionId,
    status,
    refs: [COLLABORATION_RELATIVE_PATH, ...evidenceRefs]
  });
  return memberships[index];
}

export async function grantHumanAuthority(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Human Authority Grants");
  const grantId = String(options.grantId ?? "").trim();
  const principalId = String(options.principalId ?? "").trim();
  const authority = String(options.authority ?? "").trim();
  const riskCeiling = String(options.riskCeiling ?? "standard").trim();
  const scope = String(options.scope ?? "project").trim();
  if (!GRANT_ID.test(grantId)) throw new Error("--grant-id must match grant-<lowercase-slug>");
  if ((document.authority_grants ?? []).some((entry) => entry.id === grantId)) throw new Error(`Authority grant already exists: ${grantId}`);
  if (!activePrincipalIds(document).has(principalId)) throw new Error(`Unknown active Human Principal: ${principalId}`);
  if (!HUMAN_AUTHORITIES.includes(authority)) throw new Error(`--authority must be ${HUMAN_AUTHORITIES.join(", ")}`);
  if (!AUTHORITY_RISK_LEVELS.includes(riskCeiling)) throw new Error(`--risk-tier must be ${AUTHORITY_RISK_LEVELS.join(", ")}`);
  if (!scope || scope.length > 240) throw new Error("--scope is invalid");
  const approvedBy = assertGovernanceApprovals(document, options.approvedBy);
  const expiresAt = String(options.expiresAt ?? "").trim() || null;
  if (!validDateOrNull(expiresAt)) throw new Error("Authority grant expiry is invalid");
  const timestamp = new Date().toISOString();
  const grant = {
    id: grantId,
    principal_id: principalId,
    authority,
    scope,
    risk_ceiling: riskCeiling,
    status: "active",
    approved_by: approvedBy,
    granted_at: timestamp,
    expires_at: expiresAt,
    revoked_at: null
  };
  await writeCollaborationState(target, { ...document, authority_grants: [...(document.authority_grants ?? []), grant] });
  await appendEvent(target, {
    timestamp,
    event_type: "human_authority_granted",
    actor: options.actor ?? approvedBy[0] ?? "human",
    principal_id: principalId,
    grant_id: grantId,
    authority,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return grant;
}

export async function revokeHumanAuthority(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Human Authority Grants");
  const index = (document.authority_grants ?? []).findIndex((entry) => entry.id === options.grantId);
  if (index < 0) throw new Error(`Unknown Human Authority Grant: ${options.grantId ?? "missing"}`);
  const approvedBy = assertGovernanceApprovals(document, options.approvedBy);
  const timestamp = new Date().toISOString();
  const grants = [...document.authority_grants];
  grants[index] = { ...grants[index], status: "revoked", revoked_at: timestamp, revoked_by: approvedBy };
  await writeCollaborationState(target, { ...document, authority_grants: grants });
  await appendEvent(target, {
    timestamp,
    event_type: "human_authority_revoked",
    actor: options.actor ?? approvedBy[0] ?? "human",
    grant_id: options.grantId,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return grants[index];
}

export async function configureGovernanceRecovery(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Governance recovery");
  const approvedBy = assertGovernanceApprovals(document, options.approvedBy, "manage-recovery");
  const trustees = uniqueStrings(options.trusteePrincipalIds);
  const active = activePrincipalIds(document);
  if (trustees.length === 0 || trustees.some((id) => !active.has(id))) throw new Error("Recovery trustees must be distinct active Human Principals");
  const threshold = Number(options.threshold);
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > trustees.length) throw new Error("Recovery threshold must be between one and the trustee count");
  const timestamp = new Date().toISOString();
  const recovery = { status: "ready", trustee_principal_ids: trustees, threshold, last_verified_at: timestamp, approved_by: approvedBy };
  await writeCollaborationState(target, { ...document, recovery });
  await appendEvent(target, {
    timestamp,
    event_type: "governance_recovery_configured",
    actor: options.actor ?? approvedBy[0] ?? "human",
    threshold,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return recovery;
}

export async function establishBootstrapOwner(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Bootstrap establishment");
  if (document.bootstrap_owner !== null) throw new Error("Bootstrap Owner has already been established or retired");
  const principalId = String(options.principalId ?? "").trim();
  const active = activePrincipalIds(document);
  if (!active.has(principalId)) throw new Error(`Unknown active Human Principal: ${principalId || "missing"}`);
  const approvedBy = uniqueStrings(options.approvedBy);
  const minimum = active.size >= 2 ? 2 : 1;
  if (approvedBy.length < minimum || !approvedBy.includes(principalId) || approvedBy.some((id) => !active.has(id))) {
    throw new Error(`Bootstrap establishment requires the proposed owner and ${minimum === 2 ? "another distinct" : "the"} active Principal approval`);
  }
  const timestamp = new Date().toISOString();
  const bootstrapOwner = {
    principal_id: principalId,
    status: "active",
    granted_at: timestamp,
    retired_at: null,
    approved_by: approvedBy
  };
  await writeCollaborationState(target, { ...document, bootstrap_owner: bootstrapOwner });
  await appendEvent(target, {
    timestamp,
    event_type: "bootstrap_owner_established",
    actor: options.actor ?? approvedBy[0],
    principal_id: principalId,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return bootstrapOwner;
}

export async function retireBootstrapOwner(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Bootstrap retirement");
  if (!document.bootstrap_owner || document.bootstrap_owner.status !== "active") throw new Error("No active Bootstrap Owner exists");
  const approvedBy = uniqueStrings(options.approvedBy);
  const active = activePrincipalIds(document);
  if (approvedBy.length < 2 || !approvedBy.includes(document.bootstrap_owner.principal_id) || approvedBy.some((id) => !active.has(id))) {
    throw new Error("Bootstrap retirement requires the Bootstrap Owner and another distinct active Principal");
  }
  const managers = [...active].filter((id) => activeAuthorityGrant(document, id, "manage-authority"));
  if (managers.length < 2) throw new Error("Bootstrap retirement requires two active manage-authority grant holders");
  if (document.recovery?.status !== "ready") throw new Error("Bootstrap retirement requires ready governance recovery");
  const timestamp = new Date().toISOString();
  const bootstrapOwner = { ...document.bootstrap_owner, status: "retired", retired_at: timestamp, approved_by: approvedBy };
  await writeCollaborationState(target, { ...document, bootstrap_owner: bootstrapOwner });
  await appendEvent(target, {
    timestamp,
    event_type: "bootstrap_owner_retired",
    actor: options.actor ?? document.bootstrap_owner.principal_id,
    refs: [COLLABORATION_RELATIVE_PATH]
  });
  return bootstrapOwner;
}

function resolvedRevision(target, revision) {
  const result = spawnSync("git", ["-C", target, "rev-parse", "--verify", `${revision}^{commit}`], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Cannot resolve validation revision: ${revision}`);
  return result.stdout.trim();
}

export async function recordCollaborationValidation(target, options) {
  const document = await readCollaborationState(target);
  requireV2(document, "Tiered collaboration validation");
  const level = String(options.level ?? "").trim();
  const status = String(options.status ?? "").trim();
  if (!VALIDATION_LEVELS.includes(level)) throw new Error(`--validation-level must be ${VALIDATION_LEVELS.join(", ")}`);
  if (!VALIDATION_STATUSES.includes(status)) throw new Error(`--status must be ${VALIDATION_STATUSES.join(", ")}`);
  const evidence = uniqueStrings(options.evidenceRefs);
  const participants = uniqueStrings(options.participants);
  const environments = uniqueStrings(options.environments);
  const revision = options.revision ? resolvedRevision(target, options.revision) : null;
  if (status === "passed" && (!revision || evidence.length === 0)) throw new Error("Passed validation requires an exact revision and evidence");
  if (level === "real_collaborative" && status === "passed") {
    const active = activePrincipalIds(document);
    if (participants.length < 2 || participants.some((id) => !active.has(id)) || environments.length < 2) {
      throw new Error("Real Collaborative pass requires two distinct active Principals and independently administered environments");
    }
  }
  const current = document.validation[level];
  const gate = {
    ...current,
    status,
    tested_revision: revision,
    evidence,
    participants,
    environments,
    recorded_at: new Date().toISOString()
  };
  const updated = { ...document, validation: { ...document.validation, [level]: gate } };
  await writeCollaborationState(target, updated);
  await appendEvent(target, {
    timestamp: gate.recorded_at,
    event_type: "collaboration_validation_recorded",
    actor: options.actor ?? "human",
    validation_level: level,
    status,
    tested_revision: revision,
    refs: [COLLABORATION_RELATIVE_PATH, ...evidence]
  });
  return gate;
}

export function sponsoredPrincipal(document, agentId) {
  return (document.sponsorships ?? []).find((entry) => entry.agent_id === agentId && sponsorshipStatus(entry) === "active")?.principal_id ?? null;
}

export function agentIsEligible(document, agentId, positionId, requiredDisciplines = []) {
  const memberships = (document.memberships ?? []).filter(
    (entry) =>
      membershipStatus(entry) === "active" &&
      (!entry.qualification?.expires_at || Date.parse(entry.qualification.expires_at) > Date.now()) &&
      entry.agent_id === agentId &&
      entry.position_id === positionId
  );
  const available = new Set(memberships.flatMap((entry) => entry.disciplines ?? []));
  return memberships.length > 0 && requiredDisciplines.every((discipline) => available.has(discipline));
}
