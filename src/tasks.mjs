import fs from "node:fs/promises";
import path from "node:path";
import { TASK_STATUSES } from "./constants.mjs";
import { atomicWrite, pathExists } from "./files.mjs";
import {
  appendEvent,
  assignedAgent,
  loadProjectContext,
  positionName,
  readTaskRegistry,
  suggestedTaskTitle,
  writeTaskRegistry
} from "./project.mjs";
import { readWorkItem } from "./work-items.mjs";
import { attachUserTaskWorker, syncUserTaskWorker, validateUserTaskReservation } from "./workers.mjs";

function nextTaskId(tasks) {
  const numbers = tasks.map((task) => /^task-([0-9]+)$/.exec(task.id)?.[1]).filter(Boolean).map(Number);
  return `task-${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(4, "0")}`;
}

function validateStatus(status) {
  if (!TASK_STATUSES.includes(status)) throw new Error(`Invalid task status ${status}; use ${TASK_STATUSES.join(", ")}`);
}

async function snapshotTaskMutationFiles(target) {
  const paths = [
    path.join(target, ".ai-org/project/tasks.json"),
    path.join(target, ".ai-org/project/runtime-workers.json"),
    path.join(target, ".ai-org/project/resources.json"),
    path.join(target, ".ai-org/events/events.jsonl")
  ];
  return Promise.all(
    paths.map(async (filePath) => ({
      path: filePath,
      before: (await pathExists(filePath)) ? await fs.readFile(filePath) : null
    }))
  );
}

async function restoreTaskMutationFiles(snapshots) {
  for (const snapshot of [...snapshots].reverse()) {
    if (snapshot.before === null) {
      await fs.unlink(snapshot.path).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    } else await atomicWrite(snapshot.path, snapshot.before);
  }
}

export async function registerTask(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  const positionId = String(options.positionId ?? item.owner_position).trim();
  if (!context.positions.has(positionId)) throw new Error(`Unknown Position: ${positionId}`);
  const threadId = String(options.threadId ?? "").trim();
  const clientThreadId = String(options.clientThreadId ?? "").trim();
  if (!threadId && !clientThreadId) throw new Error("--thread-id or --client-thread-id is required");
  const status = options.status ?? "active";
  validateStatus(status);

  const registry = await readTaskRegistry(target);
  if ((registry.tasks ?? []).some((task) => threadId && task.thread_id === threadId)) {
    throw new Error(`Thread is already registered: ${threadId}`);
  }
  if ((registry.tasks ?? []).some((task) => clientThreadId && task.client_thread_id === clientThreadId)) {
    throw new Error(`Client thread is already registered: ${clientThreadId}`);
  }

  const defaultAgent = assignedAgent(context, positionId);
  const claimedAgentId =
    item.claim?.status === "active" && item.owner_position === positionId ? item.claim.agent_id : null;
  const agent = claimedAgentId ? context.agents.get(claimedAgentId) : defaultAgent;
  if (!agent) throw new Error(`Claim references unknown Agent Identity ${claimedAgentId}`);
  const manager = assignedAgent(context, "engineering_manager");
  const actor = options.actor ?? manager.id;
  if (![agent.id, manager.id, "human"].includes(actor)) {
    throw new Error(`Actor ${actor} cannot register a task for ${positionId}; expected ${agent.id}, ${manager.id}, or human`);
  }
  const timestamp = new Date().toISOString();
  const workerId = String(options.workerId ?? "").trim() || null;
  if (workerId) {
    await validateUserTaskReservation(target, workerId, {
      work_item_id: item.id,
      position_id: positionId,
      agent_id: agent.id,
      claim_id: item.claim?.status === "active" ? item.claim.id : null
    });
  }
  const task = {
    id: nextTaskId(registry.tasks ?? []),
    work_item_id: item.id,
    position_id: positionId,
    agent_id: agent.id,
    suggested_title:
      agent.id === defaultAgent.id
        ? suggestedTaskTitle(context, item.id, positionId)
        : `${item.id} · ${positionName(context, positionId)} · ${agent.display_name}`,
    status,
    thread_id: threadId || null,
    client_thread_id: clientThreadId || null,
    host_id: options.hostId ?? null,
    current_revision: options.revision ?? null,
    principal_id: item.claim?.status === "active" ? item.claim.principal_id : null,
    claim_id: item.claim?.status === "active" ? item.claim.id : null,
    base_revision: item.claim?.status === "active" ? item.claim.base_revision : null,
    branch: item.claim?.status === "active" ? item.claim.branch : null,
    worktree: item.claim?.status === "active" ? item.claim.worktree : null,
    worker_id: workerId,
    created_at: timestamp,
    updated_at: timestamp,
    registered_by: actor,
    notes: options.notes ?? null
  };
  const snapshots = await snapshotTaskMutationFiles(target);
  try {
    registry.tasks = [...(registry.tasks ?? []), task];
    await writeTaskRegistry(target, registry);
    if (workerId) await attachUserTaskWorker(target, workerId, task);
    await appendEvent(target, {
      timestamp,
      event_type: "task_registered",
      actor,
      task_id: task.id,
      work_item_id: item.id,
      position: positionId,
      thread_id: task.thread_id,
      status,
      refs: [".ai-org/project/tasks.json"]
    });
  } catch (error) {
    await restoreTaskMutationFiles(snapshots);
    throw error;
  }
  return task;
}

export async function updateTask(target, options) {
  const context = await loadProjectContext(target);
  const registry = await readTaskRegistry(target);
  const index = (registry.tasks ?? []).findIndex((task) => task.id === options.taskId);
  if (index < 0) throw new Error(`Task not found: ${options.taskId}`);
  const current = registry.tasks[index];
  const taskAgent = context.agents.get(current.agent_id) ?? assignedAgent(context, current.position_id);
  const manager = assignedAgent(context, "engineering_manager");
  const actor = options.actor ?? taskAgent.id;
  if (![taskAgent.id, manager.id, "human"].includes(actor)) {
    throw new Error(`Actor ${actor} cannot update ${current.id}; expected ${taskAgent.id}, ${manager.id}, or human`);
  }
  const status = options.status ?? current.status;
  validateStatus(status);
  const item = await readWorkItem(target, current.work_item_id);
  const terminalStates = new Set(context.workflow.terminal_states ?? []);
  if (status === "archived" && current.status !== "completed" && !terminalStates.has(item.state)) {
    throw new Error("A task may be archived only after it is completed or its work item is terminal");
  }
  const timestamp = new Date().toISOString();
  const updated = {
    ...current,
    status,
    current_revision: options.revision ?? current.current_revision,
    notes: options.notes ?? current.notes,
    registered_by: current.registered_by ?? actor,
    last_updated_by: actor,
    updated_at: timestamp
  };
  const snapshots = await snapshotTaskMutationFiles(target);
  try {
    registry.tasks[index] = updated;
    await writeTaskRegistry(target, registry);
    if (updated.worker_id) await syncUserTaskWorker(target, updated.worker_id, status, updated.current_revision);
    await appendEvent(target, {
      timestamp,
      event_type: current.status === status ? "task_metadata_updated" : "task_status_changed",
      actor,
      task_id: current.id,
      work_item_id: current.work_item_id,
      from_status: current.status,
      to_status: status,
      revision: updated.current_revision,
      refs: [".ai-org/project/tasks.json"]
    });
  } catch (error) {
    await restoreTaskMutationFiles(snapshots);
    throw error;
  }
  return updated;
}

export async function listTasks(target) {
  const context = await loadProjectContext(target);
  const registry = await readTaskRegistry(target);
  const terminalStates = new Set(context.workflow.terminal_states ?? []);
  const items = new Map();
  for (const task of registry.tasks ?? []) {
    if (!items.has(task.work_item_id)) items.set(task.work_item_id, await readWorkItem(target, task.work_item_id));
  }
  return (registry.tasks ?? []).map((task) => ({
    ...task,
    position_name: positionName(context, task.position_id),
    agent_name: context.agents.get(task.agent_id)?.display_name ?? task.agent_id,
    archive_ready: task.status === "completed" && terminalStates.has(items.get(task.work_item_id)?.state) && task.status !== "archived"
  }));
}
