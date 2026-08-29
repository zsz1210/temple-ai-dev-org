import fs from "node:fs/promises";
import path from "node:path";
import {
  DISCIPLINES,
  agentIsEligible,
  readCollaborationState,
  sponsoredPrincipal
} from "./collaboration.mjs";
import { atomicWrite, formatJson, pathExists, readJson } from "./files.mjs";
import { claimId, collaborativeWorkItemId, isWorkItemId } from "./ids.mjs";
import {
  appendEvent,
  assignedAgentId,
  loadProjectContext,
  nextPositionForState,
  positionName,
  resolveActor,
  suggestedTaskTitle,
  uniqueStrings
} from "./project.mjs";

function workItemPath(target, workItemId) {
  if (!isWorkItemId(workItemId)) {
    throw new Error(`Invalid work item ID: ${workItemId ?? "missing"}`);
  }
  return path.join(target, ".ai-org/work-items", `${workItemId}.json`);
}

function isSafeRepositoryPath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !value.includes("\\") &&
    path.posix.normalize(value) === value &&
    value !== ".." &&
    !value.startsWith("../")
  );
}

export async function readWorkItem(target, workItemId) {
  const itemPath = workItemPath(target, workItemId);
  if (!(await pathExists(itemPath))) throw new Error(`Work item not found: ${workItemId}`);
  return readJson(itemPath);
}

function unresolvedItems(item) {
  if (
    item.unresolved !== undefined &&
    (!Array.isArray(item.unresolved) || item.unresolved.some((value) => typeof value !== "string"))
  ) {
    throw new Error(`Work item ${item.id} has invalid unresolved items; expected an array of strings`);
  }
  return uniqueStrings(item.unresolved);
}

export async function listUnresolvedItems(target, workItemId) {
  const item = await readWorkItem(target, workItemId);
  return {
    work_item_id: item.id,
    unresolved: unresolvedItems(item)
  };
}

async function writeWorkItem(target, item) {
  await atomicWrite(workItemPath(target, item.id), formatJson(item));
}

async function listWorkItemDocuments(target) {
  const directory = path.join(target, ".ai-org/work-items");
  if (!(await pathExists(directory))) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const items = [];
  for (const entry of entries.filter((candidate) => candidate.isFile() && candidate.name.endsWith(".json"))) {
    items.push(await readJson(path.join(directory, entry.name)));
  }
  return items;
}

export async function updateUnresolvedItems(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  const resolutions = uniqueStrings(options.resolve);
  const additions = uniqueStrings(options.merge);
  if (resolutions.length === 0 && additions.length === 0) {
    throw new Error("Provide at least one --resolve or --merge value");
  }
  const overlap = resolutions.filter((resolution) => additions.includes(resolution));
  if (overlap.length > 0) {
    throw new Error(`Cannot resolve and merge the same unresolved item: ${overlap.join(", ")}`);
  }

  const existing = unresolvedItems(item);
  const missing = resolutions.filter((resolution) => !existing.includes(resolution));
  if (missing.length > 0) {
    throw new Error(`Unresolved item not found on ${item.id}: ${missing.join(", ")}`);
  }

  const actor = resolveActor(
    context,
    item.owner_position,
    options.actor ?? (item.claim?.status === "active" ? item.claim.agent_id : undefined),
    item.claim?.status === "active" ? [item.claim.agent_id] : []
  );
  const resolved = new Set(resolutions);
  const remaining = existing.filter((entry) => !resolved.has(entry));
  const merged = additions.filter((addition) => !remaining.includes(addition));
  const unresolved = uniqueStrings([...remaining, ...merged]);
  const original = Array.isArray(item.unresolved) ? item.unresolved : [];
  const changed = JSON.stringify(original) !== JSON.stringify(unresolved);
  const deduplicatedCount = Math.max(0, original.length - existing.length);

  if (!changed) {
    return {
      item: { ...item, unresolved },
      resolved: resolutions,
      merged,
      deduplicated_count: deduplicatedCount,
      changed: false
    };
  }

  const timestamp = new Date().toISOString();
  const updated = {
    ...item,
    updated_at: timestamp,
    unresolved
  };
  await writeWorkItem(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "work_item_unresolved_updated",
    actor,
    work_item_id: item.id,
    resolved: resolutions,
    merged,
    deduplicated_count: deduplicatedCount,
    refs: [`.ai-org/work-items/${item.id}.json`]
  });

  return {
    item: updated,
    resolved: resolutions,
    merged,
    deduplicated_count: deduplicatedCount,
    changed: true
  };
}

async function nextWorkItemId(target) {
  const directory = path.join(target, ".ai-org/work-items");
  await fs.mkdir(directory, { recursive: true });
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const numbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => /^WI-([0-9]+)\.json$/.exec(entry.name)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `WI-${String(next).padStart(4, "0")}`;
}

async function newWorkItemId(target, profile) {
  if (profile !== "collaborative") return nextWorkItemId(target);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = collaborativeWorkItemId();
    if (!(await pathExists(workItemPath(target, candidate)))) return candidate;
  }
  throw new Error("Could not allocate a collision-resistant work item ID");
}

function normalizedEvidence(item, additions) {
  return uniqueStrings([...(item.evidence ?? []), ...(additions ?? [])]);
}

function mergeGateEvidence(item, additions) {
  const output = { ...(item.gate_evidence ?? {}) };
  for (const [requirement, references] of Object.entries(additions ?? {})) {
    output[requirement] = uniqueStrings([...(output[requirement] ?? []), ...references]);
  }
  return output;
}

export async function createWorkItem(target, options) {
  const context = await loadProjectContext(target);
  const collaboration = await readCollaborationState(target);
  const title = String(options.title ?? "").trim();
  if (!title) throw new Error("--title is required");

  const affectedPaths = uniqueStrings(options.affectedPaths);
  const unsafePaths = affectedPaths.filter((value) => !isSafeRepositoryPath(value));
  if (unsafePaths.length > 0) throw new Error(`Unsafe affected path: ${unsafePaths.join(", ")}`);
  const contextRefs = uniqueStrings(options.contextRefs);
  const contextMap = await readJson(path.join(target, ".ai-org/project/context-map.json"));
  const routeIds = new Set((contextMap.routes ?? []).map((route) => route.id));
  const missingContextRefs = contextRefs.filter((value) => !routeIds.has(value));
  if (missingContextRefs.length > 0) {
    throw new Error(`Unknown context route: ${missingContextRefs.join(", ")}`);
  }

  const parentWorkItemId = String(options.parentWorkItemId ?? "").trim() || null;
  const dependencies = uniqueStrings(options.dependencies);
  for (const reference of [parentWorkItemId, ...dependencies].filter(Boolean)) await readWorkItem(target, reference);
  const requiredDisciplines = uniqueStrings(options.requiredDisciplines);
  const unsupportedDisciplines = requiredDisciplines.filter((value) => !DISCIPLINES.includes(value));
  if (unsupportedDisciplines.length > 0) {
    throw new Error(`Unsupported disciplines: ${unsupportedDisciplines.join(", ")}`);
  }
  const parallelMode = options.parallelMode ?? "pending";
  if (!["pending", "parallel", "sequential", "blocked"].includes(parallelMode)) {
    throw new Error("--parallel-mode must be pending, parallel, sequential, or blocked");
  }
  const contractStatus = options.contractStatus ?? "not_required";
  if (!["not_required", "draft", "stable"].includes(contractStatus)) {
    throw new Error("--contract-status must be not_required, draft, or stable");
  }
  const integrationOwner = String(options.integrationOwnerAgentId ?? "").trim() || null;
  if (integrationOwner && !context.agents.has(integrationOwner)) throw new Error(`Unknown integration owner: ${integrationOwner}`);

  const workItemId = await newWorkItemId(target, collaboration.profile);
  const state = context.workflow.initial_state;
  const ownerPosition = context.states.get(state)?.owner_position;
  if (!ownerPosition) throw new Error(`Workflow initial state ${state} has no owner Position`);
  const assignedAgentIdValue = assignedAgentId(context, ownerPosition);
  const actor = resolveActor(context, ownerPosition, options.actor);
  const timestamp = new Date().toISOString();
  const item = {
    schema_version: "temple.work-item/v1",
    id: workItemId,
    title,
    state,
    owner_position: ownerPosition,
    assigned_agent_id: assignedAgentIdValue,
    created_at: timestamp,
    updated_at: timestamp,
    scope: uniqueStrings(options.scope),
    acceptance_criteria: uniqueStrings(options.acceptance),
    affected_paths: affectedPaths,
    context_refs: contextRefs,
    parent_work_item_id: parentWorkItemId,
    dependencies,
    required_disciplines: requiredDisciplines,
    base_revision: String(options.baseRevision ?? "").trim() || null,
    parallel_mode: parallelMode,
    integration_owner_agent_id: integrationOwner,
    planned_agent_id: null,
    shared_contract_refs: uniqueStrings(options.sharedContractRefs),
    contract_status: contractStatus,
    overlap_resolution: uniqueStrings(options.overlapResolution),
    claim: null,
    claims: [],
    gate_evidence: {},
    evidence: uniqueStrings(options.evidence),
    unresolved: uniqueStrings(options.unresolved),
    next_position: nextPositionForState(context, state)
  };

  await writeWorkItem(target, item);
  await appendEvent(target, {
    timestamp,
    event_type: "work_item_created",
    actor,
    work_item_id: workItemId,
    state,
    refs: [`.ai-org/work-items/${workItemId}.json`]
  });

  return {
    item,
    suggested_title: suggestedTaskTitle(context, workItemId, ownerPosition)
  };
}

function pathsOverlap(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function dependencyCycleFrom(itemId, itemsById, visiting = new Set(), visited = new Set()) {
  if (visiting.has(itemId)) return true;
  if (visited.has(itemId)) return false;
  visiting.add(itemId);
  for (const dependencyId of itemsById.get(itemId)?.dependencies ?? []) {
    if (itemsById.has(dependencyId) && dependencyCycleFrom(dependencyId, itemsById, visiting, visited)) return true;
  }
  visiting.delete(itemId);
  visited.add(itemId);
  return false;
}

export async function evaluateParallelReadiness(target, workItemId, options = {}) {
  const context = await loadProjectContext(target);
  const collaboration = await readCollaborationState(target);
  const item = await readWorkItem(target, workItemId);
  const terminalStates = new Set(context.workflow.terminal_states ?? []);
  const allItems = await listWorkItemDocuments(target);
  const dependencyItems = new Map(allItems.map((candidate) => [candidate.id, candidate]));
  const overlaps = allItems
    .filter((candidate) => candidate.id !== item.id && !terminalStates.has(candidate.state))
    .flatMap((candidate) => {
      const shared = (item.affected_paths ?? []).filter((left) =>
        (candidate.affected_paths ?? []).some((right) => pathsOverlap(left, right))
      );
      return shared.length ? [{ work_item_id: candidate.id, paths: shared }] : [];
    });
  const agentId = options.agentId ?? item.claim?.agent_id ?? item.planned_agent_id ?? item.assigned_agent_id;
  const checks = [
    { id: "scope_defined", pass: (item.scope ?? []).length > 0 },
    { id: "acceptance_defined", pass: (item.acceptance_criteria ?? []).length > 0 },
    { id: "owner_assigned", pass: Boolean(agentId) },
    { id: "base_revision_recorded", pass: Boolean(item.base_revision) },
    { id: "affected_paths_declared", pass: (item.affected_paths ?? []).length > 0 },
    {
      id: "dependencies_resolved",
      pass: (item.dependencies ?? []).every((id) => terminalStates.has(dependencyItems.get(id)?.state))
    },
    { id: "dependency_graph_acyclic", pass: !dependencyCycleFrom(item.id, dependencyItems) },
    {
      id: "shared_contract_stable",
      pass: item.contract_status === "not_required" || item.contract_status === "stable"
    },
    {
      id: "overlap_resolved",
      pass: overlaps.length === 0 || (item.overlap_resolution ?? []).length > 0
    },
    { id: "integration_owner_assigned", pass: Boolean(item.integration_owner_agent_id) },
    { id: "unresolved_items_cleared", pass: (item.unresolved ?? []).length === 0 },
    {
      id: "agent_membership_eligible",
      pass: Boolean(agentId) && agentIsEligible(collaboration, agentId, item.owner_position, item.required_disciplines ?? [])
    }
  ];
  const blocked = checks.some(
    (check) =>
      !check.pass &&
      ["dependencies_resolved", "dependency_graph_acyclic", "shared_contract_stable", "unresolved_items_cleared"].includes(check.id)
  );
  const ready = checks.every((check) => check.pass);
  return {
    schema_version: "temple.parallel-readiness/v1",
    work_item_id: item.id,
    requested_mode: item.parallel_mode ?? "pending",
    ready,
    recommended_mode: ready ? "parallel" : blocked ? "blocked" : "sequential",
    agent_id: agentId ?? null,
    checks,
    overlaps
  };
}

export async function configureWorkItem(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  const dependencies = options.dependencies === undefined ? item.dependencies ?? [] : uniqueStrings(options.dependencies);
  const parent = options.parentWorkItemId === undefined ? item.parent_work_item_id ?? null : String(options.parentWorkItemId).trim() || null;
  for (const reference of [parent, ...dependencies].filter(Boolean)) {
    if (reference === item.id) throw new Error(`${item.id} cannot depend on itself`);
    await readWorkItem(target, reference);
  }
  const disciplines =
    options.requiredDisciplines === undefined ? item.required_disciplines ?? [] : uniqueStrings(options.requiredDisciplines);
  const unsupported = disciplines.filter((value) => !DISCIPLINES.includes(value));
  if (unsupported.length > 0) throw new Error(`Unsupported disciplines: ${unsupported.join(", ")}`);
  const parallelMode = options.parallelMode ?? item.parallel_mode ?? "pending";
  if (!["pending", "parallel", "sequential", "blocked"].includes(parallelMode)) throw new Error("Invalid parallel mode");
  const contractStatus = options.contractStatus ?? item.contract_status ?? "not_required";
  if (!["not_required", "draft", "stable"].includes(contractStatus)) throw new Error("Invalid contract status");
  const integrationOwner =
    options.integrationOwnerAgentId === undefined
      ? item.integration_owner_agent_id ?? null
      : String(options.integrationOwnerAgentId).trim() || null;
  if (integrationOwner && !context.agents.has(integrationOwner)) throw new Error(`Unknown integration owner: ${integrationOwner}`);
  const plannedAgent =
    options.agentId === undefined ? item.planned_agent_id ?? null : String(options.agentId).trim() || null;
  if (plannedAgent && !context.agents.has(plannedAgent)) throw new Error(`Unknown planned Agent Identity: ${plannedAgent}`);
  const timestamp = new Date().toISOString();
  const updated = {
    ...item,
    updated_at: timestamp,
    parent_work_item_id: parent,
    dependencies,
    required_disciplines: disciplines,
    base_revision: options.baseRevision === undefined ? item.base_revision ?? null : String(options.baseRevision).trim() || null,
    parallel_mode: parallelMode,
    integration_owner_agent_id: integrationOwner,
    planned_agent_id: plannedAgent,
    shared_contract_refs:
      options.sharedContractRefs === undefined ? item.shared_contract_refs ?? [] : uniqueStrings(options.sharedContractRefs),
    contract_status: contractStatus,
    overlap_resolution:
      options.overlapResolution === undefined ? item.overlap_resolution ?? [] : uniqueStrings(options.overlapResolution)
  };
  const dependencyItems = new Map((await listWorkItemDocuments(target)).map((candidate) => [candidate.id, candidate]));
  dependencyItems.set(item.id, updated);
  if (dependencyCycleFrom(item.id, dependencyItems)) throw new Error(`Dependency cycle detected from ${item.id}`);
  await writeWorkItem(target, updated);
  let readiness;
  try {
    readiness = await evaluateParallelReadiness(target, item.id);
    if (parallelMode === "parallel" && !readiness.ready) {
      throw new Error(
        `Parallel mode rejected; failed checks: ${readiness.checks.filter((check) => !check.pass).map((check) => check.id).join(", ")}`
      );
    }
  } catch (error) {
    await writeWorkItem(target, item);
    throw error;
  }
  await appendEvent(target, {
    timestamp,
    event_type: "work_item_coordination_configured",
    actor: options.actor ?? item.assigned_agent_id ?? "human",
    work_item_id: item.id,
    parallel_mode: parallelMode,
    refs: [`.ai-org/work-items/${item.id}.json`]
  });
  return { item: updated, readiness };
}

export async function claimWorkItem(target, options) {
  const context = await loadProjectContext(target);
  const collaboration = await readCollaborationState(target);
  const item = await readWorkItem(target, options.workItemId);
  const agentId = String(options.agentId ?? "").trim();
  if (!context.agents.has(agentId)) throw new Error(`Unknown Agent Identity: ${agentId || "missing"}`);
  if (item.planned_agent_id && item.planned_agent_id !== agentId) {
    throw new Error(`${item.id} is planned for ${item.planned_agent_id}, not ${agentId}`);
  }
  if (!agentIsEligible(collaboration, agentId, item.owner_position, item.required_disciplines ?? [])) {
    throw new Error(`${agentId} is not eligible for ${item.owner_position} with disciplines ${(item.required_disciplines ?? []).join(", ") || "none"}`);
  }
  if (item.claim?.status === "active") throw new Error(`${item.id} is already claimed by ${item.claim.agent_id}`);
  const expectedPrincipal = sponsoredPrincipal(collaboration, agentId);
  const principalId = String(options.principalId ?? expectedPrincipal ?? "human").trim();
  if (collaboration.profile === "collaborative" && !expectedPrincipal) throw new Error(`${agentId} has no Human Principal sponsor`);
  if (expectedPrincipal && principalId !== expectedPrincipal) {
    throw new Error(`${agentId} is sponsored by ${expectedPrincipal}, not ${principalId}`);
  }
  const baseRevision = String(options.baseRevision ?? item.base_revision ?? "").trim();
  const branch = String(options.branch ?? "").trim();
  if (!baseRevision) throw new Error("--base-revision is required");
  if (!branch) throw new Error("--branch is required");
  const readiness = await evaluateParallelReadiness(target, item.id, { agentId });
  if ((item.parallel_mode ?? "pending") === "parallel" && !readiness.ready) {
    throw new Error(`Cannot claim parallel work; failed checks: ${readiness.checks.filter((check) => !check.pass).map((check) => check.id).join(", ")}`);
  }
  const timestamp = new Date().toISOString();
  const claim = {
    id: claimId(),
    status: "active",
    principal_id: principalId,
    agent_id: agentId,
    base_revision: baseRevision,
    branch,
    worktree: String(options.worktree ?? "").trim() || null,
    claimed_at: timestamp,
    released_at: null
  };
  const priorClaims = (item.claims ?? []).filter((entry) => entry.id !== item.claim?.id);
  if (item.claim) priorClaims.push(item.claim);
  const updated = {
    ...item,
    assigned_agent_id: agentId,
    base_revision: baseRevision,
    claim,
    claims: [...priorClaims, claim],
    updated_at: timestamp
  };
  await writeWorkItem(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "work_item_claimed",
    actor: principalId,
    agent_id: agentId,
    work_item_id: item.id,
    claim_id: claim.id,
    base_revision: baseRevision,
    branch,
    refs: [`.ai-org/work-items/${item.id}.json`]
  });
  return { item: updated, readiness };
}

export async function releaseWorkItemClaim(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  if (item.claim?.status !== "active") throw new Error(`${item.id} has no active claim`);
  if (options.agentId && options.agentId !== item.claim.agent_id) throw new Error(`Claim belongs to ${item.claim.agent_id}`);
  if (options.principalId && options.principalId !== item.claim.principal_id) throw new Error(`Claim belongs to ${item.claim.principal_id}`);
  const timestamp = new Date().toISOString();
  const claim = { ...item.claim, status: "released", released_at: timestamp, release_reason: options.reason ?? "completed" };
  const updated = {
    ...item,
    assigned_agent_id: assignedAgentId(context, item.owner_position),
    claim,
    claims: [...(item.claims ?? []).filter((entry) => entry.id !== claim.id), claim],
    updated_at: timestamp
  };
  await writeWorkItem(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "work_item_claim_released",
    actor: item.claim.principal_id,
    agent_id: item.claim.agent_id,
    work_item_id: item.id,
    claim_id: item.claim.id,
    refs: [`.ai-org/work-items/${item.id}.json`]
  });
  return updated;
}

function parseTransition(context, item, toState) {
  const regular = (context.workflow.transitions ?? []).find(
    (transition) => transition.from === item.state && transition.to === toState
  );
  if (regular) return regular;

  const escape = (context.workflow.escape_transitions ?? []).find((transition) => {
    if (!(transition.from === "*" || transition.from === item.state)) return false;
    if (transition.to === toState) return true;
    return transition.to === "previous" && item.previous_state === toState;
  });
  if (escape) return escape;

  throw new Error(`Illegal work item transition: ${item.state} -> ${toState}`);
}

function normalizeSatisfiedRequirements(satisfied = {}) {
  const output = {};
  for (const [requirement, references] of Object.entries(satisfied)) {
    output[requirement] = uniqueStrings(Array.isArray(references) ? references : [references]);
  }
  return output;
}

export async function transitionWorkItem(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  const toState = String(options.toState ?? "").trim();
  if (!context.states.has(toState)) throw new Error(`Unknown workflow state: ${toState || "missing"}`);
  const transition = parseTransition(context, item, toState);
  const actor = resolveActor(
    context,
    item.owner_position,
    options.actor ?? (item.claim?.status === "active" ? item.claim.agent_id : undefined),
    item.claim?.status === "active" ? [item.claim.agent_id] : []
  );
  const additions = normalizeSatisfiedRequirements(options.satisfied);
  const mergedGates = mergeGateEvidence(item, additions);
  const missing = (transition.requires ?? []).filter((requirement) => !(mergedGates[requirement]?.length > 0));
  if (missing.length > 0) {
    throw new Error(
      `Transition ${item.state} -> ${toState} is missing gate evidence: ${missing.join(", ")}. Use --satisfy requirement=reference.`
    );
  }

  const timestamp = new Date().toISOString();
  const ownerPosition = context.states.get(toState).owner_position;
  const previousState = toState === "blocked" ? item.state : item.previous_state;
  const ownerChanged = ownerPosition !== item.owner_position;
  const releasedClaim =
    ownerChanged && item.claim?.status === "active"
      ? {
          ...item.claim,
          status: "released",
          released_at: timestamp,
          release_reason: "position_transition"
        }
      : item.claim ?? null;
  const updated = {
    ...item,
    state: toState,
    owner_position: ownerPosition,
    assigned_agent_id: assignedAgentId(context, ownerPosition),
    planned_agent_id: ownerChanged ? null : item.planned_agent_id ?? null,
    claim: releasedClaim,
    claims:
      ownerChanged && item.claim?.status === "active"
        ? [...(item.claims ?? []).filter((entry) => entry.id !== releasedClaim.id), releasedClaim]
        : item.claims ?? [],
    updated_at: timestamp,
    gate_evidence: mergedGates,
    evidence: normalizedEvidence(item, [
      ...uniqueStrings(options.evidence),
      ...Object.values(additions).flat()
    ]),
    next_position: nextPositionForState(context, toState)
  };
  if (previousState) updated.previous_state = previousState;
  if (item.state === "blocked" && toState === item.previous_state) delete updated.previous_state;

  await writeWorkItem(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "work_item_transitioned",
    actor,
    work_item_id: item.id,
    from_state: item.state,
    to_state: toState,
    satisfied_requirements: transition.requires ?? [],
    refs: uniqueStrings([...Object.values(additions).flat(), ...(options.evidence ?? [])])
  });

  return {
    item: updated,
    suggested_title: suggestedTaskTitle(context, item.id, ownerPosition)
  };
}

function handoffSequence(entries) {
  const numbers = entries
    .map((entry) => /^handoff-([0-9]+)-/.exec(entry.name)?.[1])
    .filter(Boolean)
    .map(Number);
  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

function markdownList(values, emptyValue = "None recorded.") {
  const items = uniqueStrings(values);
  return items.length ? items.map((value) => `- ${value}`).join("\n") : emptyValue;
}

export async function createHandoff(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  const toPosition = String(options.toPosition ?? "").trim();
  if (!context.positions.has(toPosition)) throw new Error(`Unknown Position: ${toPosition || "missing"}`);
  if (item.next_position && item.next_position !== toPosition) {
    throw new Error(`Handoff for ${item.id} must go to next Position ${item.next_position}, not ${toPosition}`);
  }
  const inputRevision = String(options.inputRevision ?? "").trim();
  if (!inputRevision) throw new Error("--input-revision is required");
  const completed = uniqueStrings(options.completed);
  const evidence = uniqueStrings(options.evidence);
  if (completed.length === 0) throw new Error("At least one --completed value is required");
  if (evidence.length === 0) throw new Error("At least one --evidence value is required");

  const actor = resolveActor(
    context,
    item.owner_position,
    options.actor ?? (item.claim?.status === "active" ? item.claim.agent_id : undefined),
    item.claim?.status === "active" ? [item.claim.agent_id] : []
  );
  const artifactDirectory = path.join(target, ".ai-org/artifacts", item.id);
  await fs.mkdir(artifactDirectory, { recursive: true });
  const entries = await fs.readdir(artifactDirectory, { withFileTypes: true });
  const sequence = handoffSequence(entries.filter((entry) => entry.isFile()));
  const relativePath = `.ai-org/artifacts/${item.id}/handoff-${String(sequence).padStart(3, "0")}-${item.owner_position}-to-${toPosition}.md`;
  const timestamp = new Date().toISOString();
  const unresolved = uniqueStrings(options.unresolved);
  const content = `# Handoff — ${item.id}\n\n- Created: \`${timestamp}\`\n- From Position: ${positionName(context, item.owner_position)} (\`${item.owner_position}\`)\n- To Position: ${positionName(context, toPosition)} (\`${toPosition}\`)\n- Input revision: \`${inputRevision}\`\n- Actor: \`${actor}\`\n\n## Completed\n\n${markdownList(completed)}\n\n## Evidence\n\n${markdownList(evidence)}\n\n## Unresolved\n\n${markdownList(unresolved)}\n\n## Next action\n\nContinue as ${positionName(context, toPosition)} using the canonical work item and exact input revision above.\n`;
  await atomicWrite(path.join(target, relativePath), content);

  const gateAdditions = {};
  if (item.owner_position === "developer") {
    gateAdditions.developer_handoff = [relativePath];
    gateAdditions.developer_evidence = evidence;
  }
  const updated = {
    ...item,
    updated_at: timestamp,
    handoffs: [
      ...(item.handoffs ?? []),
      {
        from_position: item.owner_position,
        to_position: toPosition,
        input_revision: inputRevision,
        artifact: relativePath,
        created_at: timestamp
      }
    ],
    gate_evidence: mergeGateEvidence(item, gateAdditions),
    evidence: normalizedEvidence(item, [relativePath, ...evidence]),
    unresolved: uniqueStrings([...(item.unresolved ?? []), ...unresolved]),
    next_position: toPosition
  };
  if (item.owner_position === "developer") updated.developer_candidate_revision = inputRevision;
  await writeWorkItem(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "handoff_created",
    actor,
    work_item_id: item.id,
    from_position: item.owner_position,
    to_position: toPosition,
    input_revision: inputRevision,
    refs: [relativePath, ...evidence]
  });

  return {
    item: updated,
    artifact: relativePath,
    suggested_title: suggestedTaskTitle(context, item.id, toPosition)
  };
}

function releaseRecordMarkdown(context, item, options, timestamp, actor, gateEvidence) {
  const evidence = uniqueStrings([...(item.evidence ?? []), ...(options.evidence ?? []), ...Object.values(gateEvidence).flat()]);
  const gateLines = Object.entries(gateEvidence)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([requirement, references]) => [`- ${requirement}:`, ...uniqueStrings(references).map((reference) => `  - ${reference}`)]);
  return `# Release gate and closeout record — ${item.id}\n\n- Decision time: \`${timestamp}\`\n- Release Manager: ${context.agents.get(actor)?.display_name ?? actor} (\`${actor}\`)\n- Decision: **${options.decision.toUpperCase()} for organizational closeout**\n- Tested revision: \`${options.testedRevision}\`\n- External release: **not performed by organizational closeout**\n- Approval record: \`${options.approval}\`\n\n## Gate evidence\n\n${gateLines.join("\n")}\n\n## Supporting evidence\n\n${markdownList(evidence)}\n\n## Rollback plan\n\n${markdownList(options.rollback)}\n\n## Residual risk or no-go reason\n\n${markdownList(options.reason)}\n\n## Disposition\n\n${
    options.decision === "go"
      ? `The accepted scope is closed as \`done\`. This record is not reusable as authorization for a production or external release.`
      : `The release gate is no-go. The work item returns to Engineering Manager ownership as \`blocked\`.`
  }\n`;
}

export async function closeWorkItem(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  if (item.state !== "release_gate") throw new Error(`temple close requires release_gate; ${item.id} is ${item.state}`);
  if (!["go", "no-go"].includes(options.decision)) throw new Error("--decision must be go or no-go");
  if (!String(options.testedRevision ?? "").trim()) throw new Error("--tested-revision is required");
  if (!String(options.approval ?? "").trim()) throw new Error("--approval is required (use not-required only when policy permits)");
  if (uniqueStrings(options.rollback).length === 0) throw new Error("At least one --rollback value is required");
  if (options.decision === "no-go" && uniqueStrings(options.reason).length === 0) {
    throw new Error("A no-go close requires at least one --reason");
  }

  const actor = resolveActor(context, "release_manager", options.actor);
  const satisfied = normalizeSatisfiedRequirements(options.satisfied);
  const gateEvidence = mergeGateEvidence(item, satisfied);
  const required = (context.policies.release_gate?.requires ?? []).filter((requirement) => requirement !== "rollback_plan");
  const missing = required.filter((requirement) => !(gateEvidence[requirement]?.length > 0));
  if (missing.length > 0) {
    throw new Error(`Release gate is missing evidence: ${missing.join(", ")}. Use --satisfy requirement=reference.`);
  }

  const timestamp = new Date().toISOString();
  const relativePath = `.ai-org/artifacts/${item.id}/release-record.md`;
  gateEvidence.rollback_plan = [relativePath];
  gateEvidence.required_human_approval = [options.approval];
  await atomicWrite(
    path.join(target, relativePath),
    releaseRecordMarkdown(context, item, options, timestamp, actor, gateEvidence)
  );

  const destinationState = options.decision === "go" ? "done" : "blocked";
  const ownerPosition = context.states.get(destinationState).owner_position;
  const closeClaim =
    item.claim?.status === "active"
      ? {
          ...item.claim,
          status: "released",
          released_at: timestamp,
          release_reason: "work_item_closed"
        }
      : item.claim ?? null;
  const updated = {
    ...item,
    state: destinationState,
    owner_position: ownerPosition,
    assigned_agent_id: assignedAgentId(context, ownerPosition),
    planned_agent_id: null,
    claim: closeClaim,
    claims:
      item.claim?.status === "active"
        ? [...(item.claims ?? []).filter((entry) => entry.id !== closeClaim.id), closeClaim]
        : item.claims ?? [],
    updated_at: timestamp,
    tested_revision: options.testedRevision,
    release_gate_result: options.decision,
    external_release_status: "not_performed",
    approval_record: options.approval,
    gate_evidence: gateEvidence,
    evidence: normalizedEvidence(item, [relativePath, ...(options.evidence ?? []), ...Object.values(satisfied).flat()]),
    unresolved: options.decision === "go" ? uniqueStrings(item.unresolved) : uniqueStrings([...(item.unresolved ?? []), ...(options.reason ?? [])]),
    next_position: null
  };
  if (options.decision === "no-go") updated.previous_state = "release_gate";
  await writeWorkItem(target, updated);
  await appendEvent(target, {
    timestamp,
    event_type: "release_gate_completed",
    actor,
    position: "release_manager",
    work_item_id: item.id,
    from_state: "release_gate",
    to_state: destinationState,
    tested_revision: options.testedRevision,
    result: options.decision,
    approval_record: options.approval,
    external_release: false,
    refs: [relativePath]
  });
  if (options.decision === "go") {
    await appendEvent(target, {
      timestamp,
      event_type: "work_item_closed",
      actor,
      position: "release_manager",
      work_item_id: item.id,
      from_state: "release_gate",
      to_state: "done",
      next_owner_position: "engineering_manager",
      refs: [`.ai-org/work-items/${item.id}.json`, relativePath]
    });
  }

  return { item: updated, artifact: relativePath };
}
