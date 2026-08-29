import path from "node:path";
import { atomicCreate, atomicWrite, formatJson, pathExists, readJson, sha256 } from "./files.mjs";
import { validateDisplayName } from "./model.mjs";
import { appendEvent, uniqueStrings } from "./project.mjs";

export const COLLABORATION_RELATIVE_PATH = ".ai-org/project/collaboration.json";
export const COLLABORATION_PROFILES = ["solo", "collaborative"];
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

export function buildCollaborationState(assignmentsDocument) {
  const memberships = (assignmentsDocument.assignments ?? [])
    .filter((assignment) => assignment.active !== false)
    .map((assignment) => ({
      position_id: assignment.position_id,
      agent_id: assignment.agent_id,
      disciplines: DEFAULT_DISCIPLINES[assignment.position_id] ?? [],
      default: true,
      active: true
    }))
    .sort((left, right) => left.position_id.localeCompare(right.position_id));
  return {
    schema_version: "temple.collaboration/v1",
    profile: "solo",
    coordination_backend: "repository",
    principals: [],
    sponsorships: [],
    memberships,
    large_scale_validation: {
      status: "not_run",
      plan: ".ai-org/templates/collaborative-large-scale-test-plan.md"
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
      active: true
    }))
    .sort((left, right) => left.position_id.localeCompare(right.position_id));
  return { ...document, memberships: [...defaults, ...nonDefaults] };
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
  const principalNames = new Set();
  if (document?.schema_version !== "temple.collaboration/v1") errors.push("invalid schema_version");
  if (!COLLABORATION_PROFILES.includes(document?.profile)) errors.push("unsupported collaboration profile");
  if (document?.coordination_backend !== "repository") errors.push("coordination_backend must be repository");
  const largeScale = document?.large_scale_validation;
  if (
    !largeScale ||
    !["not_run", "planned", "passed", "failed"].includes(largeScale.status) ||
    typeof largeScale.plan !== "string" ||
    largeScale.plan.length === 0
  ) {
    errors.push("large_scale_validation must have a supported status and plan");
  }
  if (
    largeScale?.status === "passed" &&
    (!(Array.isArray(largeScale.evidence) && largeScale.evidence.length > 0) || !largeScale.tested_revision)
  ) {
    errors.push("passed large-scale validation requires evidence and tested_revision");
  }

  for (const principal of document?.principals ?? []) {
    const normalizedName = String(principal.display_name ?? "").toLowerCase();
    if (!PRINCIPAL_ID.test(principal.id ?? "") || principalIds.has(principal.id)) errors.push("invalid or duplicate principal ID");
    if (validateDisplayName(principal.display_name) || principalNames.has(normalizedName)) errors.push("invalid or duplicate principal name");
    principalIds.add(principal.id);
    principalNames.add(normalizedName);
  }

  const sponsoredAgents = new Set();
  for (const sponsorship of document?.sponsorships ?? []) {
    if (!principalIds.has(sponsorship.principal_id) || !agentIds.has(sponsorship.agent_id)) {
      errors.push("sponsorship references an unknown principal or Agent Identity");
    }
    if (sponsoredAgents.has(sponsorship.agent_id)) errors.push("an Agent Identity may have only one active sponsor");
    sponsoredAgents.add(sponsorship.agent_id);
  }

  const memberships = document?.memberships ?? [];
  const membershipKeys = new Set();
  const defaultPositions = new Set();
  for (const membership of memberships) {
    if (membership.active === false) continue;
    const key = `${membership.position_id}:${membership.agent_id}`;
    if (!positionIds.has(membership.position_id) || !agentIds.has(membership.agent_id) || membershipKeys.has(key)) {
      errors.push("membership is invalid, duplicated, or references an unknown identity");
    }
    if (!Array.isArray(membership.disciplines) || membership.disciplines.some((value) => !DISCIPLINES.includes(value))) {
      errors.push("membership contains an unsupported discipline");
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
        membership.active !== false &&
        membership.default === true &&
        membership.position_id === assignment.position_id &&
        membership.agent_id === assignment.agent_id
    );
    if (!matching) errors.push(`default membership does not match assignment for ${assignment.position_id}`);
  }

  if (document?.profile === "collaborative") {
    if (principalIds.size === 0) warnings.push("Collaborative profile has no Human Principal");
    const unsponsored = [...agentIds].filter((agentId) => !sponsoredAgents.has(agentId));
    if (unsponsored.length > 0) warnings.push(`unsponsored Agent Identities: ${unsponsored.join(", ")}`);
    if (document.large_scale_validation?.status !== "passed") {
      warnings.push("large multi-human, multi-machine validation has not passed");
    }
  }
  return { valid: errors.length === 0, errors: uniqueStrings(errors), warnings: uniqueStrings(warnings) };
}

export async function setCollaborationProfile(target, profile) {
  if (!COLLABORATION_PROFILES.includes(profile)) {
    throw new Error(`Unsupported profile ${profile}; use ${COLLABORATION_PROFILES.join(" or ")}`);
  }
  const document = await readCollaborationState(target);
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
  if ((document.principals ?? []).some((principal) => principal.display_name.toLowerCase() === displayName.toLowerCase())) {
    throw new Error(`Principal display name already exists: ${displayName}`);
  }
  const principal = { id: principalId, display_name: displayName, active: true, created_at: new Date().toISOString() };
  const updated = { ...document, principals: [...(document.principals ?? []), principal] };
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
  if (!(document.principals ?? []).some((principal) => principal.id === options.principalId && principal.active !== false)) {
    throw new Error(`Unknown active principal: ${options.principalId ?? "missing"}`);
  }
  if (!(agents.agents ?? []).some((agent) => agent.id === options.agentId && agent.active !== false)) {
    throw new Error(`Unknown active Agent Identity: ${options.agentId ?? "missing"}`);
  }
  const sponsorship = { principal_id: options.principalId, agent_id: options.agentId, active: true };
  const updated = {
    ...document,
    sponsorships: [...(document.sponsorships ?? []).filter((entry) => entry.agent_id !== options.agentId), sponsorship]
  };
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
  if ((document.agents ?? []).some((agent) => agent.display_name.toLowerCase() === displayName.toLowerCase())) {
    throw new Error(`Agent display name already exists: ${displayName}`);
  }
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
  const membership = {
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

export function sponsoredPrincipal(document, agentId) {
  return (document.sponsorships ?? []).find((entry) => entry.agent_id === agentId && entry.active !== false)?.principal_id ?? null;
}

export function agentIsEligible(document, agentId, positionId, requiredDisciplines = []) {
  const memberships = (document.memberships ?? []).filter(
    (entry) => entry.active !== false && entry.agent_id === agentId && entry.position_id === positionId
  );
  const available = new Set(memberships.flatMap((entry) => entry.disciplines ?? []));
  return memberships.length > 0 && requiredDisciplines.every((discipline) => available.has(discipline));
}
