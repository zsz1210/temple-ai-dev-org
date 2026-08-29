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
    capabilityRegistry
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
      options.capabilityRegistry ?? buildCapabilityRegistry(target)
    ]);

  const agents = new Map(agentsDocument.agents.map((agent) => [agent.id, agent]));
  const positions = new Map(positionsDocument.positions.map((position) => [position.id, position]));
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
        const assignedAgentId = item.assigned_agent_id ?? assignmentMap.get(item.owner_position) ?? null;
        const latestRevision =
          item.closeout_revision ??
          item.qa_evidence_revision ??
          item.tested_revision ??
          item.developer_candidate_revision ??
          item.dispatch_revision ??
          null;
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
          terminal: terminalStates.has(item.state)
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
          terminal: false
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
  const attention = [
    ...workItems
      .filter((item) => item.state === "blocked")
      .map((item) => ({ type: "blocked_work_item", work_item_id: item.id, message: `${item.id} is blocked` })),
    ...tasks
      .filter((task) => task.status === "attention")
      .map((task) => ({ type: "task_attention", work_item_id: task.work_item_id, task_id: task.id, message: `${task.id} needs attention` })),
    ...tasks
      .filter((task) => task.archive_ready)
      .map((task) => ({ type: "archive_ready", work_item_id: task.work_item_id, task_id: task.id, message: `${task.id} can be archived` }))
  ];

  return {
    schema_version: "temple.status/v3",
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
    context_routing: {
      routes: contextMap.routes?.length ?? 0,
      active_routes: (contextMap.routes ?? []).filter((route) => route.status === "active").length,
      provider_id: "repository-deterministic",
      semantic: false
    },
    capabilities: capabilityRegistry.counts,
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
    `- Work items: ${status.work_items.total} total, ${activeItems} active`,
    `- Codex tasks: ${status.tasks.total} registered, ${status.tasks.archive_ready} archive-ready`,
    `- Optional Skill packs: ${status.optional_packs.length} installed`,
    `- Repository capabilities: ${status.capabilities.available} available, ${status.capabilities.invalid} invalid`,
    `- Context routes: ${status.context_routing.active_routes} active (${status.context_routing.provider_id}, semantic=${status.context_routing.semantic})`,
    `- Engineering learning: ${status.learning.lessons} Lessons, ${status.learning.practices} Practices`,
    `- Attention signals: ${status.attention.length}`,
    "",
    "## Work items",
    ""
  ];

  if (status.work_items.items.length === 0) {
    lines.push("No work items yet.");
  } else {
    lines.push(
      "| ID | Title | State | Owner | Agent | Revision | Tasks | Evidence | Unresolved |",
      "|---|---|---|---|---|---|---:|---:|---:|"
    );
    for (const item of status.work_items.items) {
      lines.push(
        `| ${item.id} | ${markdown(item.title)} | ${item.state} | ${markdown(item.owner_name)} | ${markdown(item.assigned_agent_name)} | \`${shortRevision(item.latest_revision)}\` | ${item.task_count} | ${item.evidence_count} | ${item.unresolved_count} |`
      );
    }
  }

  lines.push("", "## Codex task registry", "");
  if (status.tasks.items.length === 0) {
    lines.push("No Codex tasks registered yet.");
  } else {
    lines.push(
      "| Task | Work item | Suggested title | Position / Agent | Status | Revision | Archive |",
      "|---|---|---|---|---|---|---|"
    );
    for (const task of status.tasks.items) {
      lines.push(
        `| ${task.id} | ${task.work_item_id} | ${markdown(task.suggested_title)} | ${markdown(task.position_name)} / ${markdown(task.agent_name)} | ${task.status} | \`${shortRevision(task.current_revision)}\` | ${task.archive_ready ? "ready" : "—"} |`
      );
    }
  }

  lines.push("", "## Attention", "");
  if (status.attention.length === 0) lines.push("No blockers, task attention requests, or archive-ready tasks.");
  else for (const signal of status.attention) lines.push(`- ${signal.message}`);

  lines.push(
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
