import fs from "node:fs/promises";
import path from "node:path";
import {
  buildCapabilityRegistry,
  CONTEXT_MAP_RELATIVE_PATH,
  emptyContextMap,
  readContextMap
} from "./context.mjs";
import { atomicWrite, pathExists, readJson } from "./files.mjs";
import { emptyLearningIndex, LEARNING_INDEX_RELATIVE_PATH, summarizeLearningIndex } from "./learning.mjs";
import { COLLABORATION_RELATIVE_PATH, buildCollaborationState } from "./collaboration.mjs";
import {
  SPEC_INDEX_RELATIVE_PATH,
  emptySpecIndex,
  evaluateWorkItemSpecRefs,
  summarizeSpecIndex,
  validateRepositorySpecSources,
  validateSpecIndex
} from "./specifications.mjs";

function markdown(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function shortRevision(value) {
  return value ? String(value).slice(0, 8) : "—";
}

async function readEvents(target) {
  const eventsPath = path.join(target, ".ai-org/events/events.jsonl");
  if (!(await pathExists(eventsPath))) return [];
  const lines = (await fs.readFile(eventsPath, "utf8")).split(/\r?\n/).filter((line) => line.trim());
  return lines.map((line) => JSON.parse(line));
}

export async function buildStatus(target, options = {}) {
  const specIndexInstalled = await pathExists(path.join(target, SPEC_INDEX_RELATIVE_PATH));
  const [
    lock,
    project,
    agentsDocument,
    assignmentsDocument,
    positionsDocument,
    workflow,
    tasksDocument,
    events,
    learningIndex,
    contextMap,
    specIndex,
    capabilityRegistry,
    collaboration
  ] =
    await Promise.all([
      readJson(path.join(target, "temple.lock")),
      readJson(path.join(target, ".ai-org/project/project.json")),
      readJson(path.join(target, ".ai-org/project/agents.json")),
      readJson(path.join(target, ".ai-org/project/assignments.json")),
      readJson(path.join(target, ".ai-org/core/positions.json")),
      readJson(path.join(target, ".ai-org/core/workflow.json")),
      pathExists(path.join(target, ".ai-org/project/tasks.json")).then((exists) =>
        exists ? readJson(path.join(target, ".ai-org/project/tasks.json")) : { schema_version: "temple.tasks/v1", tasks: [] }
      ),
      readEvents(target),
      pathExists(path.join(target, LEARNING_INDEX_RELATIVE_PATH)).then((exists) =>
        exists ? readJson(path.join(target, LEARNING_INDEX_RELATIVE_PATH)) : emptyLearningIndex()
      ),
      pathExists(path.join(target, CONTEXT_MAP_RELATIVE_PATH)).then((exists) =>
        exists ? readContextMap(target) : emptyContextMap()
      ),
      specIndexInstalled ? readJson(path.join(target, SPEC_INDEX_RELATIVE_PATH)) : emptySpecIndex(),
      options.capabilityRegistry ?? buildCapabilityRegistry(target),
      pathExists(path.join(target, COLLABORATION_RELATIVE_PATH)).then((exists) =>
        exists ? readJson(path.join(target, COLLABORATION_RELATIVE_PATH)) : null
      )
    ]);

  const agents = new Map(agentsDocument.agents.map((agent) => [agent.id, agent]));
  const positions = new Map(positionsDocument.positions.map((position) => [position.id, position]));
  const specIndexValidation = validateSpecIndex(specIndex, new Set(positions.keys()));
  const specSourceValidation = specIndexValidation.valid
    ? await validateRepositorySpecSources(target, specIndex)
    : { valid: false, errors: [] };
  const assignmentMap = new Map(
    assignmentsDocument.assignments
      .filter((assignment) => assignment.active !== false)
      .map((assignment) => [assignment.position_id, assignment.agent_id])
  );
  const assignments = assignmentsDocument.assignments
    .filter((assignment) => assignment.active !== false)
    .map((assignment) => ({
      position_id: assignment.position_id,
      position_name: positions.get(assignment.position_id)?.display_name ?? assignment.position_id,
      agent_id: assignment.agent_id,
      agent_name: agents.get(assignment.agent_id)?.display_name ?? "Unknown Agent"
    }))
    .sort((left, right) => left.position_name.localeCompare(right.position_name));

  const terminalStates = new Set(workflow.terminal_states ?? []);
  const workItemsDirectory = path.join(target, ".ai-org/work-items");
  const workItems = [];
  const rawItems = new Map();
  if (await pathExists(workItemsDirectory)) {
    const entries = await fs.readdir(workItemsDirectory, { withFileTypes: true });
    for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".json")).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(workItemsDirectory, entry.name);
      try {
        const item = await readJson(absolute);
        rawItems.set(item.id, item);
        const assignedAgentId =
          (item.claim?.status === "active" ? item.claim.agent_id : null) ??
          item.planned_agent_id ??
          item.assigned_agent_id ??
          assignmentMap.get(item.owner_position) ??
          null;
        const latestRevision =
          item.closeout_revision ??
          item.qa_evidence_revision ??
          item.tested_revision ??
          item.developer_candidate_revision ??
          item.dispatch_revision ??
          null;
        const specificationReferences = evaluateWorkItemSpecRefs(item, specIndex);
        workItems.push({
          id: item.id ?? entry.name.replace(/\.json$/, ""),
          title: item.title ?? "Untitled",
          state: item.state ?? "unknown",
          owner_position: item.owner_position ?? "unknown",
          owner_name: positions.get(item.owner_position)?.display_name ?? item.owner_position ?? "unknown",
          assigned_agent_id: assignedAgentId,
          assigned_agent_name: agents.get(assignedAgentId)?.display_name ?? "Unassigned",
          latest_revision: latestRevision,
          evidence_count: Array.isArray(item.evidence) ? item.evidence.length : 0,
          unresolved_count: Array.isArray(item.unresolved) ? item.unresolved.length : 0,
          terminal: terminalStates.has(item.state),
          parallel_mode: item.parallel_mode ?? "pending",
          required_disciplines: item.required_disciplines ?? [],
          active_claim: item.claim?.status === "active" ? item.claim : null,
          parent_work_item_id: item.parent_work_item_id ?? null,
          dependency_count: (item.dependencies ?? []).length,
          specification_mode: item.specification_mode ?? null,
          ui_delivery_mode: item.ui_delivery_mode ?? null,
          specification_reference_count: specificationReferences.resolved_refs.length,
          stale_specification_count: specificationReferences.stale_count,
          unapproved_specification_count: specificationReferences.unapproved_count,
          specification_references: specificationReferences.resolved_refs,
          specification_warnings: specificationReferences.warnings
        });
      } catch (error) {
        workItems.push({
          id: entry.name,
          title: error.message,
          state: "invalid",
          owner_position: "unknown",
          owner_name: "unknown",
          assigned_agent_id: null,
          assigned_agent_name: "Unassigned",
          latest_revision: null,
          evidence_count: 0,
          unresolved_count: 1,
          terminal: false,
          ui_delivery_mode: null,
          specification_mode: null,
          specification_reference_count: 0,
          stale_specification_count: 0,
          unapproved_specification_count: 0,
          specification_references: [],
          specification_warnings: []
        });
      }
    }
  }

  const tasks = (tasksDocument.tasks ?? []).map((task) => {
    const workItem = rawItems.get(task.work_item_id);
    return {
      ...task,
      position_name: positions.get(task.position_id)?.display_name ?? task.position_id,
      agent_name: agents.get(task.agent_id)?.display_name ?? task.agent_id,
      archive_ready: task.status === "completed" && terminalStates.has(workItem?.state)
    };
  });
  for (const item of workItems) item.task_count = tasks.filter((task) => task.work_item_id === item.id).length;

  const byState = {};
  for (const item of workItems) byState[item.state] = (byState[item.state] ?? 0) + 1;
  const collaborationState = collaboration ?? buildCollaborationState(assignmentsDocument);
  const attention = [
    ...workItems
      .filter((item) => item.state === "blocked")
      .map((item) => ({ type: "blocked_work_item", work_item_id: item.id, message: `${item.id} is blocked` })),
    ...tasks
      .filter((task) => task.status === "attention")
      .map((task) => ({ type: "task_attention", work_item_id: task.work_item_id, task_id: task.id, message: `${task.id} needs attention` })),
    ...tasks
      .filter((task) => task.archive_ready)
      .map((task) => ({ type: "archive_ready", work_item_id: task.work_item_id, task_id: task.id, message: `${task.id} can be archived` })),
    ...workItems
      .filter((item) => item.stale_specification_count > 0)
      .map((item) => ({
        type: "stale_specification_reference",
        work_item_id: item.id,
        message: `${item.id} has ${item.stale_specification_count} stale specification reference(s)`
      })),
    ...workItems
      .filter((item) => item.unapproved_specification_count > 0)
      .map((item) => ({
        type: "unapproved_specification_reference",
        work_item_id: item.id,
        message: `${item.id} has ${item.unapproved_specification_count} unapproved specification reference(s)`
      })),
    ...(!specIndexValidation.valid
      ? [{ type: "invalid_specification_index", message: `Specification index is invalid: ${specIndexValidation.errors.join("; ")}` }]
      : []),
    ...(!specIndexInstalled
      ? [{ type: "specification_index_missing", message: "Specification index is missing; run temple upgrade" }]
      : []),
    ...(!specSourceValidation.valid && specSourceValidation.errors.length > 0
      ? [{ type: "invalid_specification_source", message: `Specification source is invalid: ${specSourceValidation.errors.join("; ")}` }]
      : []),
    ...(collaborationState.profile === "collaborative" && collaborationState.large_scale_validation?.status !== "passed"
      ? [{
          type: "large_collaboration_validation_pending",
          message: "Large multi-human, multi-machine collaboration validation is still pending"
        }]
      : [])
  ];

  return {
    schema_version: "temple.status/v5",
    project: { id: project.id, name: project.name },
    template_version: lock.template.version,
    agents: agentsDocument.agents.map((agent) => ({ id: agent.id, display_name: agent.display_name, active: agent.active !== false })),
    assignments,
    work_items: { total: workItems.length, by_state: byState, items: workItems },
    tasks: { total: tasks.length, archive_ready: tasks.filter((task) => task.archive_ready).length, items: tasks },
    attention,
    recent_events: events.slice(-8).reverse(),
    optional_packs: (lock.optional_packs ?? []).map((pack) => ({
      id: pack.id,
      version: pack.version,
      skills: pack.skills ?? []
    })),
    learning: summarizeLearningIndex(learningIndex),
    specifications: {
      ...summarizeSpecIndex(specIndex),
      installed: specIndexInstalled,
      valid: specIndexInstalled && specIndexValidation.valid,
      errors: specIndexValidation.errors,
      warnings: specIndexValidation.warnings,
      sources_valid: specIndexInstalled && specSourceValidation.valid,
      source_errors: specSourceValidation.errors
    },
    context_routing: {
      routes: contextMap.routes?.length ?? 0,
      active_routes: (contextMap.routes ?? []).filter((route) => route.status === "active").length,
      provider_id: "repository-deterministic",
      semantic: false
    },
    capabilities: capabilityRegistry.counts,
    collaboration: {
      profile: collaborationState.profile,
      coordination_backend: collaborationState.coordination_backend,
      principals: (collaborationState.principals ?? []).length,
      sponsorships: (collaborationState.sponsorships ?? []).length,
      memberships: (collaborationState.memberships ?? []).filter((entry) => entry.active !== false).length,
      active_claims: workItems.filter((item) => item.active_claim).length,
      principal_items: collaborationState.principals ?? [],
      sponsorship_items: collaborationState.sponsorships ?? [],
      membership_items: (collaborationState.memberships ?? []).filter((entry) => entry.active !== false),
      large_scale_validation: collaborationState.large_scale_validation ?? { status: "not_run" }
    },
    integrations: lock.integrations
  };
}

export function renderStatusMarkdown(status) {
  const activeItems = status.work_items.items.filter((item) => !item.terminal && item.state !== "cancelled").length;
  const lines = [
    `# ${status.project.name} — AI development organization status`,
    "",
    `- Project ID: \`${status.project.id}\``,
    `- Organization system version: \`${status.template_version}\``,
    `- Active Agent Identities: ${status.agents.filter((agent) => agent.active).length}`,
    `- Collaboration profile: \`${status.collaboration.profile}\` (${status.collaboration.principals} Human Principals, ${status.collaboration.active_claims} active claims)`,
    `- Work items: ${status.work_items.total} total, ${activeItems} active`,
    `- Codex tasks: ${status.tasks.total} registered, ${status.tasks.archive_ready} archive-ready`,
    `- Optional Skill packs: ${status.optional_packs.length} installed`,
    `- Repository capabilities: ${status.capabilities.available} available, ${status.capabilities.invalid} invalid`,
    `- Context routes: ${status.context_routing.active_routes} active (${status.context_routing.provider_id}, semantic=${status.context_routing.semantic})`,
    `- Engineering learning: ${status.learning.lessons} Lessons, ${status.learning.practices} Practices`,
    `- Specifications: ${status.specifications.total_entries} indexed, ${status.specifications.approved_entries} approved (${status.specifications.adoption_profile})`,
    `- Attention signals: ${status.attention.length}`,
    "",
    "## Collaboration",
    "",
    `- Profile: \`${status.collaboration.profile}\``,
    `- Coordination backend: \`${status.collaboration.coordination_backend}\``,
    `- Human Principals: ${status.collaboration.principals}`,
    `- Agent sponsorships: ${status.collaboration.sponsorships}`,
    `- Active Position memberships: ${status.collaboration.memberships}`,
    `- Active Work Item claims: ${status.collaboration.active_claims}`,
    `- Large-scale validation: \`${status.collaboration.large_scale_validation.status}\` (${status.collaboration.large_scale_validation.plan ?? "no plan recorded"})`,
    "",
    "## Work items",
    ""
  ];

  if (status.work_items.items.length === 0) {
    lines.push("No work items yet.");
  } else {
    lines.push(
      "| ID | Title | State | Owner | Agent | Parallel | Spec mode | UI | Specs | Stale | Unapproved | Claim | Revision | Tasks | Evidence | Unresolved |",
      "|---|---|---|---|---|---|---|---|---:|---:|---:|---|---|---:|---:|---:|"
    );
    for (const item of status.work_items.items) {
      lines.push(
        `| ${item.id} | ${markdown(item.title)} | ${item.state} | ${markdown(item.owner_name)} | ${markdown(item.assigned_agent_name)} | ${item.parallel_mode} | ${markdown(item.specification_mode ?? "legacy")} | ${markdown(item.ui_delivery_mode ?? "undecided")} | ${item.specification_reference_count} | ${item.stale_specification_count} | ${item.unapproved_specification_count} | ${item.active_claim ? markdown(item.active_claim.id) : "—"} | \`${shortRevision(item.latest_revision)}\` | ${item.task_count} | ${item.evidence_count} | ${item.unresolved_count} |`
      );
    }
  }

  lines.push("", "## Codex task registry", "");
  if (status.tasks.items.length === 0) {
    lines.push("No Codex tasks registered yet.");
  } else {
    lines.push(
      "| Task | Work item | Suggested title | Position / Agent | Principal | Branch | Status | Revision | Archive |",
      "|---|---|---|---|---|---|---|---|---|"
    );
    for (const task of status.tasks.items) {
      lines.push(
        `| ${task.id} | ${task.work_item_id} | ${markdown(task.suggested_title)} | ${markdown(task.position_name)} / ${markdown(task.agent_name)} | ${markdown(task.principal_id ?? "—")} | ${markdown(task.branch ?? "—")} | ${task.status} | \`${shortRevision(task.current_revision)}\` | ${task.archive_ready ? "ready" : "—"} |`
      );
    }
  }

  lines.push("", "## Attention", "");
  if (status.attention.length === 0) lines.push("No blockers, task attention requests, or archive-ready tasks.");
  else for (const signal of status.attention) lines.push(`- ${signal.message}`);

  lines.push(
    "",
    "## Product specifications",
    "",
    `- Adoption profile: \`${status.specifications.adoption_profile}\``,
    `- Delivery method: \`${status.specifications.delivery_method}\``,
    `- Indexed: ${status.specifications.total_entries}`,
    `- Approved: ${status.specifications.approved_entries}`,
    `- Registry installed: ${status.specifications.installed ? "yes" : "no"}`,
    `- Registry valid: ${status.specifications.valid ? "yes" : "no"}`,
    `- Repository sources valid: ${status.specifications.sources_valid ? "yes" : "no"}`,
    `- External authorities: ${status.specifications.by_authority.authoritative_external}`,
    `- Derived projections: ${status.specifications.by_authority.derived_projection}`,
    `- Legacy unverified: ${status.specifications.by_authority.legacy_unverified}`,
    `- Registry: \`${SPEC_INDEX_RELATIVE_PATH}\``,
    "",
    "## Progressive context routing",
    "",
    `- Context Map: \`${CONTEXT_MAP_RELATIVE_PATH}\``,
    `- Active routes: ${status.context_routing.active_routes}`,
    `- Capability Registry: \`.ai-org/views/capabilities.json\``,
    `- Available capabilities: ${status.capabilities.available}`,
    `- Retrieval Provider: \`${status.context_routing.provider_id}\``,
    `- Semantic retrieval: ${status.context_routing.semantic ? "enabled" : "disabled"}`,
    "",
    "## Engineering learning",
    "",
    `- Candidate: ${status.learning.candidates}`,
    `- Validated: ${status.learning.validated}`,
    `- Active: ${status.learning.active}`,
    `- Deprecated: ${status.learning.deprecated}`,
    "- Retrieval index: `.ai-org/learning/index.json`",
    ""
  );

  lines.push("", "## Recent events", "");
  if (status.recent_events.length === 0) lines.push("No events recorded.");
  else {
    lines.push("| Time | Event | Work item | Actor |", "|---|---|---|---|");
    for (const event of status.recent_events) {
      lines.push(
        `| ${markdown(event.timestamp ?? "unknown")} | ${markdown(event.event_type ?? "unknown")} | ${markdown(event.work_item_id ?? "—")} | ${markdown(event.actor ?? "—")} |`
      );
    }
  }

  lines.push(
    "",
    "## Assignments",
    "",
    "| Position | Agent Identity | Stable ID |",
    "|---|---|---|",
    ...status.assignments.map(
      (assignment) => `| ${assignment.position_name} | ${assignment.agent_name} | \`${assignment.agent_id}\` |`
    ),
    "",
    "## Optional Skill packs",
    ""
  );
  if (status.optional_packs.length === 0) {
    lines.push("No optional Skill packs installed.");
  } else {
    lines.push("| Pack | Version | Skills |", "|---|---|---|");
    for (const pack of status.optional_packs) {
      lines.push(`| ${markdown(pack.id)} | \`${markdown(pack.version)}\` | ${markdown(pack.skills.join(", "))} |`);
    }
  }

  lines.push(
    "",
    "## Integration",
    "",
    `- Root AGENTS.md: ${status.integrations?.agents_md ?? "unknown"}`,
    `- Archify: ${status.integrations?.archify?.status ?? "unknown"}`,
    "",
    "> This file is a generated projection. Update canonical files, then rebuild this view.",
    ""
  );
  return lines.join("\n");
}

export async function writeStatus(target, status) {
  const outputPath = path.join(target, ".ai-org/views/status.md");
  await atomicWrite(outputPath, renderStatusMarkdown(status));
  return outputPath;
}
