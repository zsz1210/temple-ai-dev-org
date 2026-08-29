import fs from "node:fs/promises";
import path from "node:path";
import { atomicWrite, pathExists, readJson } from "./files.mjs";

export async function buildStatus(target) {
  const [lock, project, agentsDocument, assignmentsDocument, positionsDocument] = await Promise.all([
    readJson(path.join(target, "temple.lock")),
    readJson(path.join(target, ".ai-org/project/project.json")),
    readJson(path.join(target, ".ai-org/project/agents.json")),
    readJson(path.join(target, ".ai-org/project/assignments.json")),
    readJson(path.join(target, ".ai-org/core/positions.json"))
  ]);

  const agents = new Map(agentsDocument.agents.map((agent) => [agent.id, agent]));
  const positions = new Map(positionsDocument.positions.map((position) => [position.id, position]));
  const assignments = assignmentsDocument.assignments
    .filter((assignment) => assignment.active !== false)
    .map((assignment) => ({
      position_id: assignment.position_id,
      position_name: positions.get(assignment.position_id)?.display_name ?? assignment.position_id,
      agent_id: assignment.agent_id,
      agent_name: agents.get(assignment.agent_id)?.display_name ?? "Unknown Agent"
    }))
    .sort((left, right) => left.position_name.localeCompare(right.position_name));

  const workItemsDirectory = path.join(target, ".ai-org/work-items");
  const workItems = [];
  if (await pathExists(workItemsDirectory)) {
    const entries = await fs.readdir(workItemsDirectory, { withFileTypes: true });
    for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".json")).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(workItemsDirectory, entry.name);
      try {
        const item = await readJson(absolute);
        workItems.push({
          id: item.id ?? entry.name.replace(/\.json$/, ""),
          title: item.title ?? "Untitled",
          state: item.state ?? "unknown",
          owner_position: item.owner_position ?? "unknown",
          evidence_count: Array.isArray(item.evidence) ? item.evidence.length : 0,
          unresolved_count: Array.isArray(item.unresolved) ? item.unresolved.length : 0
        });
      } catch (error) {
        workItems.push({ id: entry.name, title: error.message, state: "invalid", owner_position: "unknown", evidence_count: 0, unresolved_count: 1 });
      }
    }
  }

  const byState = {};
  for (const item of workItems) {
    byState[item.state] = (byState[item.state] ?? 0) + 1;
  }

  return {
    schema_version: "temple.status/v1",
    project: { id: project.id, name: project.name },
    template_version: lock.template.version,
    agents: agentsDocument.agents.map((agent) => ({ id: agent.id, display_name: agent.display_name, active: agent.active !== false })),
    assignments,
    work_items: { total: workItems.length, by_state: byState, items: workItems },
    integrations: lock.integrations
  };
}

export function renderStatusMarkdown(status) {
  const lines = [
    `# Temple status — ${status.project.name}`,
    "",
    `- Project ID: \`${status.project.id}\``,
    `- Template: \`${status.template_version}\``,
    `- Active Agent Identities: ${status.agents.filter((agent) => agent.active).length}`,
    `- Work items: ${status.work_items.total}`,
    "",
    "## Assignments",
    "",
    "| Position | Agent Identity | Stable ID |",
    "|---|---|---|",
    ...status.assignments.map(
      (assignment) => `| ${assignment.position_name} | ${assignment.agent_name} | \`${assignment.agent_id}\` |`
    ),
    "",
    "## Work items",
    ""
  ];

  if (status.work_items.items.length === 0) {
    lines.push("No work items yet.");
  } else {
    lines.push("| ID | Title | State | Owner Position | Evidence | Unresolved |", "|---|---|---|---|---:|---:|");
    for (const item of status.work_items.items) {
      lines.push(
        `| ${item.id} | ${item.title.replace(/\|/g, "\\|")} | ${item.state} | ${item.owner_position} | ${item.evidence_count} | ${item.unresolved_count} |`
      );
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
