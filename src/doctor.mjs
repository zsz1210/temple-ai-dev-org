import fs from "node:fs/promises";
import path from "node:path";
import {
  AGENTS_MARKER_START,
  REQUIRED_POSITIONS,
  REQUIRED_SKILLS,
  TASK_STATUSES,
  TEMPLATE_VERSION
} from "./constants.mjs";
import { pathExists, readJson, sha256File } from "./files.mjs";
import {
  LEARNING_INDEX_RELATIVE_PATH,
  summarizeLearningIndex,
  validateLearningIndex
} from "./learning.mjs";
import { validateProjectState } from "./model.mjs";
import { listPackDefinitions } from "./packs.mjs";

function summarize(checks) {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { pass: 0, warn: 0, fail: 0 }
  );
}

async function safeJson(targetPath, checks, id) {
  try {
    return await readJson(targetPath);
  } catch (error) {
    checks.push({ id, status: "fail", message: error.message });
    return null;
  }
}

export async function runDoctor(target) {
  const checks = [];
  const lockPath = path.join(target, "temple.lock");
  if (!(await pathExists(lockPath))) {
    checks.push({ id: "temple_lock", status: "fail", message: "temple.lock is missing; run temple init first" });
    return { target, checks, summary: summarize(checks), healthy: false };
  }

  const lock = await safeJson(lockPath, checks, "temple_lock");
  if (!lock) {
    return { target, checks, summary: summarize(checks), healthy: false };
  }
  if (lock.schema_version === "temple.lock/v1" && lock.template?.version === TEMPLATE_VERSION) {
    checks.push({ id: "temple_lock", status: "pass", message: `Organization system ${lock.template.version} lock is valid` });
  } else {
    checks.push({
      id: "temple_lock",
      status: "fail",
      message: `Unsupported or mismatched organization lock version: ${lock.template?.version ?? "unknown"}`
    });
  }

  const changedManaged = [];
  const missingManaged = [];
  for (const entry of lock.managed_files ?? []) {
    const managedPath = path.join(target, entry.path);
    if (!(await pathExists(managedPath))) {
      missingManaged.push(entry.path);
    } else if ((await sha256File(managedPath)) !== entry.sha256) {
      changedManaged.push(entry.path);
    }
  }
  if (missingManaged.length || changedManaged.length) {
    checks.push({
      id: "managed_files",
      status: "fail",
      message: [
        missingManaged.length ? `missing: ${missingManaged.join(", ")}` : null,
        changedManaged.length ? `changed: ${changedManaged.join(", ")}` : null
      ]
        .filter(Boolean)
        .join("; ")
    });
  } else {
    checks.push({ id: "managed_files", status: "pass", message: `${lock.managed_files?.length ?? 0} managed files match checksums` });
  }

  const availablePacks = new Map((await listPackDefinitions()).map((definition) => [definition.manifest.id, definition]));
  const invalidPacks = [];
  const installedPackIds = new Set();
  const managedPaths = new Set((lock.managed_files ?? []).map((entry) => entry.path));
  for (const installed of lock.optional_packs ?? []) {
    const definition = availablePacks.get(installed.id);
    if (
      !definition ||
      installedPackIds.has(installed.id) ||
      installed.version !== definition.manifest.version ||
      JSON.stringify(installed.skills ?? []) !== JSON.stringify(definition.manifest.skills) ||
      JSON.stringify(installed.managed_files ?? []) !== JSON.stringify(definition.manifest.files) ||
      definition.manifest.files.some((relativePath) => !managedPaths.has(relativePath))
    ) {
      invalidPacks.push(installed.id ?? "unknown");
    }
    installedPackIds.add(installed.id);
  }
  checks.push({
    id: "optional_packs",
    status: invalidPacks.length ? "fail" : "pass",
    message: invalidPacks.length
      ? `Invalid or outdated optional packs: ${invalidPacks.join(", ")}`
      : `${installedPackIds.size} optional packs are valid`
  });

  const positionsDocument = await safeJson(
    path.join(target, ".ai-org/core/positions.json"),
    checks,
    "positions_document"
  );
  const positionIds = new Set((positionsDocument?.positions ?? []).map((position) => position.id));
  const exactPositions =
    positionIds.size === REQUIRED_POSITIONS.length && REQUIRED_POSITIONS.every((positionId) => positionIds.has(positionId));
  checks.push({
    id: "position_catalog",
    status: exactPositions ? "pass" : "fail",
    message: exactPositions ? "All nine required Positions are present" : "Position catalog differs from the required nine Positions"
  });

  const [project, agents, assignments] = await Promise.all([
    safeJson(path.join(target, ".ai-org/project/project.json"), checks, "project_json"),
    safeJson(path.join(target, ".ai-org/project/agents.json"), checks, "agents_json"),
    safeJson(path.join(target, ".ai-org/project/assignments.json"), checks, "assignments_json")
  ]);
  if (project && agents && assignments) {
    checks.push(...validateProjectState(project, agents, assignments, positionIds));
  }

  const workflow = await safeJson(path.join(target, ".ai-org/core/workflow.json"), checks, "workflow_json");
  const workflowStates = new Set((workflow?.states ?? []).map((state) => state.id));
  const agentIds = new Set((agents?.agents ?? []).map((agent) => agent.id));
  const ownersForDoctor = new Map(
    (assignments?.assignments ?? [])
      .filter((assignment) => assignment.active !== false)
      .map((assignment) => [assignment.position_id, assignment.agent_id])
  );
  const workItemsDirectory = path.join(target, ".ai-org/work-items");
  const invalidWorkItems = [];
  let workItemCount = 0;
  if (await pathExists(workItemsDirectory)) {
    const entries = await fs.readdir(workItemsDirectory, { withFileTypes: true });
    const seenWorkItemIds = new Set();
    for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".json"))) {
      workItemCount += 1;
      try {
        const item = await readJson(path.join(workItemsDirectory, entry.name));
        const valid =
          item.schema_version === "temple.work-item/v1" &&
          /^WI-[0-9]{4,}$/.test(item.id) &&
          !seenWorkItemIds.has(item.id) &&
          workflowStates.has(item.state) &&
          positionIds.has(item.owner_position) &&
          (item.assigned_agent_id === null || item.assigned_agent_id === undefined || agentIds.has(item.assigned_agent_id)) &&
          Array.isArray(item.evidence) &&
          (item.unresolved === undefined ||
            (Array.isArray(item.unresolved) && item.unresolved.every((value) => typeof value === "string")));
        if (!valid) invalidWorkItems.push(entry.name);
        seenWorkItemIds.add(item.id);
      } catch {
        invalidWorkItems.push(entry.name);
      }
    }
  }
  checks.push({
    id: "work_items",
    status: invalidWorkItems.length ? "fail" : "pass",
    message: invalidWorkItems.length
      ? `Invalid work item files: ${invalidWorkItems.join(", ")}`
      : `${workItemCount} canonical work items are valid`
  });

  const tasksDocument = await safeJson(path.join(target, ".ai-org/project/tasks.json"), checks, "tasks_json");
  if (tasksDocument) {
    const seenTaskIds = new Set();
    const seenThreadIds = new Set();
    const workItemIds = new Set();
    if (await pathExists(workItemsDirectory)) {
      for (const entry of await fs.readdir(workItemsDirectory, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(".json")) workItemIds.add(entry.name.replace(/\.json$/, ""));
      }
    }
    const invalidTasks = [];
    for (const task of tasksDocument.tasks ?? []) {
      const taskThreadIds = [task.thread_id, task.client_thread_id].filter(Boolean);
      const valid =
        /^task-[0-9]{4,}$/.test(task.id ?? "") &&
        !seenTaskIds.has(task.id) &&
        workItemIds.has(task.work_item_id) &&
        positionIds.has(task.position_id) &&
        agentIds.has(task.agent_id) &&
        ownersForDoctor.get(task.position_id) === task.agent_id &&
        TASK_STATUSES.includes(task.status) &&
        taskThreadIds.length > 0 &&
        (!task.registered_by || task.registered_by === "human" || agentIds.has(task.registered_by)) &&
        (!task.last_updated_by || task.last_updated_by === "human" || agentIds.has(task.last_updated_by)) &&
        taskThreadIds.every((threadId) => !seenThreadIds.has(threadId));
      if (!valid) invalidTasks.push(task.id ?? "unknown");
      seenTaskIds.add(task.id);
      for (const threadId of taskThreadIds) seenThreadIds.add(threadId);
    }
    checks.push({
      id: "task_registry",
      status: invalidTasks.length ? "fail" : "pass",
      message: invalidTasks.length
        ? `Invalid task records: ${invalidTasks.join(", ")}`
        : `${tasksDocument.tasks?.length ?? 0} Codex task records are valid`
    });
  }

  const learningIndex = await safeJson(
    path.join(target, LEARNING_INDEX_RELATIVE_PATH),
    checks,
    "learning_index_json"
  );
  if (learningIndex) {
    const validation = validateLearningIndex(learningIndex);
    const indexedPaths = new Set((learningIndex.entries ?? []).map((entry) => entry.path));
    const missingRecords = [];
    const orphanRecords = [];
    if (validation.valid) {
      for (const relativePath of indexedPaths) {
        if (!(await pathExists(path.join(target, relativePath)))) missingRecords.push(relativePath);
      }
      for (const kind of ["lessons", "practices"]) {
        const directory = path.join(target, `.ai-org/learning/${kind}`);
        if (!(await pathExists(directory))) continue;
        for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
          if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
          const relativePath = `.ai-org/learning/${kind}/${entry.name}`;
          if (!indexedPaths.has(relativePath)) orphanRecords.push(relativePath);
        }
      }
    }
    const issues = [
      ...validation.errors,
      ...(missingRecords.length ? [`missing records: ${missingRecords.join(", ")}`] : []),
      ...(orphanRecords.length ? [`unindexed records: ${orphanRecords.join(", ")}`] : [])
    ];
    const summary = summarizeLearningIndex(learningIndex);
    checks.push({
      id: "engineering_learning",
      status: issues.length ? "fail" : "pass",
      message: issues.length
        ? issues.join("; ")
        : `${summary.lessons} Lessons and ${summary.practices} Practices are indexed`
    });
  }

  const optionalSkills = [...installedPackIds].flatMap((packId) => availablePacks.get(packId)?.manifest.skills ?? []);
  const expectedSkills = [...REQUIRED_SKILLS, ...optionalSkills];
  const missingSkills = [];
  for (const skill of expectedSkills) {
    if (!(await pathExists(path.join(target, `.agents/skills/${skill}/SKILL.md`)))) {
      missingSkills.push(skill);
    }
  }
  checks.push({
    id: "repository_skills",
    status: missingSkills.length ? "fail" : "pass",
    message: missingSkills.length
      ? `Missing repository skills: ${missingSkills.join(", ")}`
      : `All ${REQUIRED_SKILLS.length} core and ${optionalSkills.length} optional repository Skills are installed`
  });

  const agentsPath = path.join(target, "AGENTS.md");
  const agentsIntegrated =
    (await pathExists(agentsPath)) && (await fs.readFile(agentsPath, "utf8")).includes(AGENTS_MARKER_START);
  checks.push({
    id: "agents_md_integration",
    status: agentsIntegrated ? "pass" : "warn",
    message: agentsIntegrated
      ? "Root AGENTS.md includes AI organization instructions"
      : "AI organization instructions are not in root AGENTS.md; review .ai-org/project/AGENTS.temple.md"
  });

  const eventsPath = path.join(target, ".ai-org/events/events.jsonl");
  if (!(await pathExists(eventsPath))) {
    checks.push({ id: "events_stream", status: "fail", message: "events.jsonl is missing" });
  } else {
    const lines = (await fs.readFile(eventsPath, "utf8")).split(/\r?\n/).filter((line) => line.trim());
    const badLines = [];
    for (const [index, line] of lines.entries()) {
      try {
        JSON.parse(line);
      } catch {
        badLines.push(index + 1);
      }
    }
    checks.push({
      id: "events_stream",
      status: badLines.length ? "fail" : "pass",
      message: badLines.length ? `Invalid JSONL at event lines: ${badLines.join(", ")}` : `${lines.length} event records are valid`
    });
  }

  const summary = summarize(checks);
  return { target, checks, summary, healthy: summary.fail === 0 };
}

export function formatDoctor(result) {
  const lines = [`AI development organization doctor — ${result.target}`];
  for (const check of result.checks) {
    const symbol = check.status === "pass" ? "PASS" : check.status === "warn" ? "WARN" : "FAIL";
    lines.push(`[${symbol}] ${check.id}: ${check.message}`);
  }
  lines.push(`Summary: ${result.summary.pass} pass, ${result.summary.warn} warn, ${result.summary.fail} fail`);
  return lines.join("\n");
}
