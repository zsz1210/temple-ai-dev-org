import fs from "node:fs/promises";
import path from "node:path";
import { atomicWrite, formatJson, pathExists, readJson } from "./files.mjs";
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
  if (!/^WI-[0-9]{4,}$/.test(workItemId ?? "")) {
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

  const actor = resolveActor(context, item.owner_position, options.actor);
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

  const workItemId = await nextWorkItemId(target);
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
  const actor = resolveActor(context, item.owner_position, options.actor);
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
  const updated = {
    ...item,
    state: toState,
    owner_position: ownerPosition,
    assigned_agent_id: assignedAgentId(context, ownerPosition),
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

  const actor = resolveActor(context, item.owner_position, options.actor);
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
  const updated = {
    ...item,
    state: destinationState,
    owner_position: ownerPosition,
    assigned_agent_id: assignedAgentId(context, ownerPosition),
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
