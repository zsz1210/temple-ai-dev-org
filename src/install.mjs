import fs from "node:fs/promises";
import path from "node:path";
import {
  AGENTS_MARKER_START,
  GENERATED_PATHS,
  KNOWN_PACKAGE_NAMES,
  MANAGED_EXACT_PATHS,
  MANAGED_SOURCE_PREFIXES,
  PACKAGE_NAME,
  PROJECT_OVERLAY_ROOT,
  PROJECT_OWNED_PATHS,
  TEMPLATE_REPOSITORY,
  TEMPLATE_VERSION
} from "./constants.mjs";
import {
  atomicCreate,
  atomicWrite,
  formatJson,
  pathExists,
  readJson,
  rollbackFileChanges,
  sha256,
  sha256File,
  walkFiles
} from "./files.mjs";
import { buildProjectState } from "./model.mjs";

function isManaged(relativePath) {
  return MANAGED_EXACT_PATHS.has(relativePath) || MANAGED_SOURCE_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function compareFile(leftPath, rightPath) {
  const [left, right] = await Promise.all([fs.readFile(leftPath), fs.readFile(rightPath)]);
  return left.equals(right);
}

export async function planInit(target, config, { integrateAgents = false } = {}) {
  const templateFiles = await walkFiles(PROJECT_OVERLAY_ROOT);
  const actions = [];
  const conflicts = [];
  const warnings = [];

  let existingLock = null;
  const lockPath = path.join(target, "temple.lock");
  if (await pathExists(lockPath)) {
    existingLock = await readJson(lockPath);
    if (!KNOWN_PACKAGE_NAMES.has(existingLock?.template?.name)) {
      conflicts.push("temple.lock belongs to an unknown template");
    } else if (existingLock.template.version !== TEMPLATE_VERSION) {
      conflicts.push(
        `Installed Temple version is ${existingLock.template.version}; use a future temple upgrade instead of init ${TEMPLATE_VERSION}`
      );
    }
  }
  const existingManagedPaths = new Set((existingLock?.managed_files ?? []).map((entry) => entry.path));

  for (const relativePath of templateFiles) {
    if (relativePath === "AGENTS.md") {
      continue;
    }
    const sourcePath = path.join(PROJECT_OVERLAY_ROOT, relativePath);
    const destinationPath = path.join(target, relativePath);
    if (!(await pathExists(destinationPath))) {
      actions.push({ type: "copy", ownership: isManaged(relativePath) ? "managed" : "project-owned", path: relativePath });
      continue;
    }

    if (isManaged(relativePath)) {
      if (!existingManagedPaths.has(relativePath)) {
        conflicts.push(`untracked file blocks new managed path: ${relativePath}`);
      } else if (await compareFile(sourcePath, destinationPath)) {
        actions.push({ type: "skip-identical", ownership: "managed", path: relativePath });
      } else {
        conflicts.push(`managed file has different content: ${relativePath}`);
      }
    } else {
      actions.push({ type: "skip-existing", ownership: "project-owned", path: relativePath });
    }
  }

  let initializedAt = new Date().toISOString();
  const existingProjectPath = path.join(target, ".ai-org/project/project.json");
  if (await pathExists(existingProjectPath)) {
    const existingProject = await readJson(existingProjectPath);
    initializedAt = existingProject.initialized_at ?? initializedAt;
  }
  const state = buildProjectState(config, initializedAt);

  const stateFiles = [
    [".ai-org/project/project.json", state.project],
    [".ai-org/project/agents.json", state.agents],
    [".ai-org/project/assignments.json", state.assignments]
  ];
  for (const [relativePath, expected] of stateFiles) {
    const destinationPath = path.join(target, relativePath);
    if (!(await pathExists(destinationPath))) {
      actions.push({ type: "write", ownership: "project-owned", path: relativePath });
      continue;
    }
    const actual = await readJson(destinationPath);
    if (sameJson(actual, expected)) {
      actions.push({ type: "skip-identical", ownership: "project-owned", path: relativePath });
    } else {
      conflicts.push(`project state differs from init config: ${relativePath}`);
    }
  }

  const tasksPath = path.join(target, ".ai-org/project/tasks.json");
  if (!(await pathExists(tasksPath))) {
    actions.push({ type: "write", ownership: "project-owned", path: ".ai-org/project/tasks.json" });
  } else {
    const tasks = await readJson(tasksPath);
    if (tasks.schema_version !== "temple.tasks/v1" || !Array.isArray(tasks.tasks)) {
      conflicts.push("project task registry is invalid: .ai-org/project/tasks.json");
    } else {
      actions.push({ type: "skip-existing", ownership: "project-owned", path: ".ai-org/project/tasks.json" });
    }
  }

  const eventsPath = path.join(target, ".ai-org/events/events.jsonl");
  if (await pathExists(eventsPath)) {
    actions.push({ type: "skip-existing", ownership: "project-owned", path: ".ai-org/events/events.jsonl" });
  } else {
    actions.push({ type: "write-empty", ownership: "project-owned", path: ".ai-org/events/events.jsonl" });
  }

  const sourceAgentsPath = path.join(PROJECT_OVERLAY_ROOT, "AGENTS.md");
  const targetAgentsPath = path.join(target, "AGENTS.md");
  let agentsIntegration = "installed";
  if (!(await pathExists(targetAgentsPath))) {
    actions.push({ type: "copy-agents", ownership: "project-owned", path: "AGENTS.md" });
  } else {
    const existingAgents = await fs.readFile(targetAgentsPath, "utf8");
    if (existingAgents.includes(AGENTS_MARKER_START)) {
      agentsIntegration = "present";
      actions.push({ type: "skip-integrated", ownership: "project-owned", path: "AGENTS.md" });
    } else if (integrateAgents) {
      agentsIntegration = "appended";
      actions.push({ type: "append-agents", ownership: "project-owned", path: "AGENTS.md" });
    } else {
      agentsIntegration = "pending_merge";
      const snippetPath = path.join(target, ".ai-org/project/AGENTS.temple.md");
      if (!(await pathExists(snippetPath))) {
        actions.push({ type: "copy-agents-snippet", ownership: "project-owned", path: ".ai-org/project/AGENTS.temple.md" });
      } else if (await compareFile(sourceAgentsPath, snippetPath)) {
        actions.push({ type: "skip-identical", ownership: "project-owned", path: ".ai-org/project/AGENTS.temple.md" });
      } else {
        warnings.push("Existing .ai-org/project/AGENTS.temple.md differs; it will not be overwritten");
      }
      warnings.push("Existing AGENTS.md was preserved; AI organization instructions still need an approved merge");
    }
  }

  if (existingLock?.project_id && existingLock.project_id !== config.project.id) {
    conflicts.push(`temple.lock belongs to project ${existingLock.project_id}, not ${config.project.id}`);
  }

  actions.push({ type: existingLock ? "update-lock" : "write-lock", ownership: "system", path: "temple.lock" });

  return {
    target,
    config,
    state,
    templateFiles,
    actions,
    conflicts,
    warnings,
    agentsIntegration,
    existingLock
  };
}

export async function executeInit(plan) {
  if (plan.conflicts.length > 0) {
    throw new Error(`Initialization stopped before writing:\n- ${plan.conflicts.join("\n- ")}`);
  }

  await fs.mkdir(plan.target, { recursive: true });
  const changes = [];
  try {
    for (const action of plan.actions) {
      const destinationPath = path.join(plan.target, action.path);
      let before = null;
      let content = null;
      if (action.type === "copy") {
        content = await fs.readFile(path.join(PROJECT_OVERLAY_ROOT, action.path));
      } else if (action.type === "write") {
        const stateByPath = {
          ".ai-org/project/project.json": plan.state.project,
          ".ai-org/project/agents.json": plan.state.agents,
          ".ai-org/project/assignments.json": plan.state.assignments,
          ".ai-org/project/tasks.json": plan.state.tasks
        };
        content = formatJson(stateByPath[action.path]);
      } else if (action.type === "write-empty") {
        content = "";
      } else if (action.type === "copy-agents" || action.type === "copy-agents-snippet") {
        content = await fs.readFile(path.join(PROJECT_OVERLAY_ROOT, "AGENTS.md"));
      } else if (action.type === "append-agents") {
        before = await fs.readFile(destinationPath);
        const templeBlock = (await fs.readFile(path.join(PROJECT_OVERLAY_ROOT, "AGENTS.md"), "utf8")).trim();
        content = `${before.toString("utf8").trimEnd()}\n\n${templeBlock}\n`;
      }
      if (content === null) continue;
      if (before === null) await atomicCreate(destinationPath, content);
      else await atomicWrite(destinationPath, content);
      changes.push({ path: destinationPath, before, afterHash: sha256(content) });
    }

    const managedFiles = [];
    for (const relativePath of plan.templateFiles.filter(isManaged)) {
      managedFiles.push({
        path: relativePath,
        sha256: await sha256File(path.join(plan.target, relativePath))
      });
    }
    const optionalManagedPaths = new Set(
      (plan.existingLock?.optional_packs ?? []).flatMap((pack) => pack.managed_files ?? [])
    );
    for (const entry of plan.existingLock?.managed_files ?? []) {
      if (optionalManagedPaths.has(entry.path)) managedFiles.push(entry);
    }
    managedFiles.sort((left, right) => left.path.localeCompare(right.path));

    const lock = {
      schema_version: "temple.lock/v1",
      template: {
        name: PACKAGE_NAME,
        version: TEMPLATE_VERSION,
        repository: TEMPLATE_REPOSITORY,
        installed_at: plan.existingLock?.template?.installed_at ?? new Date().toISOString()
      },
      project_id: plan.config.project.id,
      boundaries: {
        managed_files_authoritative: true,
        allowed_managed_roots: MANAGED_SOURCE_PREFIXES,
        allowed_managed_exact_paths: [...MANAGED_EXACT_PATHS],
        ownership_precedence: "exact managed_files entry, otherwise project-owned",
        project_owned: PROJECT_OWNED_PATHS,
        generated: GENERATED_PATHS
      },
      integrations: {
        agents_md: plan.agentsIntegration,
        archify: {
          status: "available_not_enabled",
          pinned_tag: "v2.15.0",
          pinned_commit: "e1ac748f19cf805e44bf74fb93c796662152e273"
        }
      },
      capabilities: {
        work_item_cli: true,
        task_registry: true,
        checksum_upgrade: true,
        optional_packs: true
      },
      optional_packs: plan.existingLock?.optional_packs ?? [],
      managed_files: managedFiles
    };

    const lockPath = path.join(plan.target, "temple.lock");
    if (plan.existingLock) {
      if (!sameJson(await readJson(lockPath), plan.existingLock)) {
        throw new Error("temple.lock changed after initialization planning");
      }
      await atomicWrite(lockPath, formatJson(lock));
    } else await atomicCreate(lockPath, formatJson(lock));
    return { lock, actions: plan.actions, warnings: plan.warnings };
  } catch (error) {
    try {
      await rollbackFileChanges(changes);
    } catch (rollbackError) {
      throw new AggregateError([error, rollbackError], "Initialization failed and rollback was incomplete");
    }
    throw error;
  }
}

export function formatInitPlan(plan) {
  const lines = [`Temple init plan for ${plan.target}`];
  const counts = new Map();
  for (const action of plan.actions) {
    counts.set(action.type, (counts.get(action.type) ?? 0) + 1);
  }
  for (const [type, count] of [...counts].sort(([left], [right]) => left.localeCompare(right))) {
    lines.push(`- ${type}: ${count}`);
  }
  if (plan.conflicts.length > 0) {
    lines.push("Conflicts:", ...plan.conflicts.map((conflict) => `- ${conflict}`));
  }
  if (plan.warnings.length > 0) {
    lines.push("Warnings:", ...plan.warnings.map((warning) => `- ${warning}`));
  }
  lines.push(`AGENTS.md integration: ${plan.agentsIntegration}`);
  return lines.join("\n");
}
