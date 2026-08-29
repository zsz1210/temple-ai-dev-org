import fs from "node:fs/promises";
import path from "node:path";
import {
  AGENTS_MARKER_START,
  GENERATED_PATHS,
  MANAGED_EXACT_PATHS,
  MANAGED_PATH_PREFIXES,
  PACKAGE_NAME,
  PROJECT_OWNED_PATHS,
  TEMPLATE_REPOSITORY,
  TEMPLATE_ROOT,
  TEMPLATE_VERSION
} from "./constants.mjs";
import { atomicWrite, formatJson, pathExists, readJson, sha256File, walkFiles } from "./files.mjs";
import { buildProjectState } from "./model.mjs";

function isManaged(relativePath) {
  return MANAGED_EXACT_PATHS.has(relativePath) || MANAGED_PATH_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function compareFile(leftPath, rightPath) {
  const [left, right] = await Promise.all([fs.readFile(leftPath), fs.readFile(rightPath)]);
  return left.equals(right);
}

export async function planInit(target, config, { integrateAgents = false } = {}) {
  const templateFiles = await walkFiles(TEMPLATE_ROOT);
  const actions = [];
  const conflicts = [];
  const warnings = [];

  let existingLock = null;
  const lockPath = path.join(target, "temple.lock");
  if (await pathExists(lockPath)) {
    existingLock = await readJson(lockPath);
    if (existingLock?.template?.name !== PACKAGE_NAME) {
      conflicts.push("temple.lock belongs to an unknown template");
    } else if (existingLock.template.version !== TEMPLATE_VERSION) {
      conflicts.push(
        `Installed Temple version is ${existingLock.template.version}; use a future temple upgrade instead of init ${TEMPLATE_VERSION}`
      );
    }
  }

  for (const relativePath of templateFiles) {
    if (relativePath === "AGENTS.md") {
      continue;
    }
    const sourcePath = path.join(TEMPLATE_ROOT, relativePath);
    const destinationPath = path.join(target, relativePath);
    if (!(await pathExists(destinationPath))) {
      actions.push({ type: "copy", ownership: isManaged(relativePath) ? "managed" : "project-owned", path: relativePath });
      continue;
    }

    if (isManaged(relativePath)) {
      if (await compareFile(sourcePath, destinationPath)) {
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

  const eventsPath = path.join(target, ".ai-org/events/events.jsonl");
  if (await pathExists(eventsPath)) {
    actions.push({ type: "skip-existing", ownership: "project-owned", path: ".ai-org/events/events.jsonl" });
  } else {
    actions.push({ type: "write-empty", ownership: "project-owned", path: ".ai-org/events/events.jsonl" });
  }

  const sourceAgentsPath = path.join(TEMPLATE_ROOT, "AGENTS.md");
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
      warnings.push("Existing AGENTS.md was preserved; Temple instructions still need an approved merge");
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

  for (const action of plan.actions) {
    const destinationPath = path.join(plan.target, action.path);
    if (action.type === "copy") {
      const sourcePath = path.join(TEMPLATE_ROOT, action.path);
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      await fs.copyFile(sourcePath, destinationPath);
    } else if (action.type === "write") {
      const stateByPath = {
        ".ai-org/project/project.json": plan.state.project,
        ".ai-org/project/agents.json": plan.state.agents,
        ".ai-org/project/assignments.json": plan.state.assignments
      };
      await atomicWrite(destinationPath, formatJson(stateByPath[action.path]));
    } else if (action.type === "write-empty") {
      await atomicWrite(destinationPath, "");
    } else if (action.type === "copy-agents" || action.type === "copy-agents-snippet") {
      await atomicWrite(destinationPath, await fs.readFile(path.join(TEMPLATE_ROOT, "AGENTS.md"), "utf8"));
    } else if (action.type === "append-agents") {
      const current = await fs.readFile(destinationPath, "utf8");
      const templeBlock = (await fs.readFile(path.join(TEMPLATE_ROOT, "AGENTS.md"), "utf8")).trim();
      await atomicWrite(destinationPath, `${current.trimEnd()}\n\n${templeBlock}\n`);
    }
  }

  const managedFiles = [];
  for (const relativePath of plan.templateFiles.filter(isManaged)) {
    managedFiles.push({
      path: relativePath,
      sha256: await sha256File(path.join(plan.target, relativePath))
    });
  }

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
      managed: [...MANAGED_PATH_PREFIXES, ...MANAGED_EXACT_PATHS],
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
    managed_files: managedFiles
  };

  await atomicWrite(path.join(plan.target, "temple.lock"), formatJson(lock));
  return { lock, actions: plan.actions, warnings: plan.warnings };
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
