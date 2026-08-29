import fs from "node:fs/promises";
import path from "node:path";
import {
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
import { ensureTaskRegistry } from "./project.mjs";

function isManaged(relativePath) {
  return MANAGED_EXACT_PATHS.has(relativePath) || MANAGED_PATH_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

async function filesEqual(leftPath, rightPath) {
  const [left, right] = await Promise.all([fs.readFile(leftPath), fs.readFile(rightPath)]);
  return left.equals(right);
}

export async function planUpgrade(target) {
  const lockPath = path.join(target, "temple.lock");
  if (!(await pathExists(lockPath))) throw new Error("temple.lock is missing; run temple init instead of upgrade");
  const lock = await readJson(lockPath);
  if (lock.template?.name !== PACKAGE_NAME) throw new Error("temple.lock belongs to an unknown template");

  const conflicts = [];
  const actions = [];
  const previousManaged = new Map((lock.managed_files ?? []).map((entry) => [entry.path, entry.sha256]));
  for (const [relativePath, expectedHash] of previousManaged) {
    const installedPath = path.join(target, relativePath);
    if (!(await pathExists(installedPath))) {
      conflicts.push(`managed file is missing: ${relativePath}`);
    } else if ((await sha256File(installedPath)) !== expectedHash) {
      conflicts.push(`managed file changed since ${lock.template.version}: ${relativePath}`);
    }
  }

  const templateFiles = (await walkFiles(TEMPLATE_ROOT)).filter(isManaged);
  for (const relativePath of templateFiles) {
    const sourcePath = path.join(TEMPLATE_ROOT, relativePath);
    const installedPath = path.join(target, relativePath);
    if (!(await pathExists(installedPath))) {
      actions.push({ type: "add-managed", path: relativePath });
    } else if (await filesEqual(sourcePath, installedPath)) {
      actions.push({ type: "skip-identical", path: relativePath });
    } else if (previousManaged.has(relativePath)) {
      actions.push({ type: "update-managed", path: relativePath });
    } else {
      conflicts.push(`untracked file blocks new managed path: ${relativePath}`);
    }
  }

  const tasksPath = path.join(target, ".ai-org/project/tasks.json");
  const hasTasks = await pathExists(tasksPath);
  actions.push({ type: hasTasks ? "skip-project-tasks" : "create-project-tasks", path: ".ai-org/project/tasks.json" });
  const managedChanges = actions.some((action) => action.type === "add-managed" || action.type === "update-managed");
  actions.push({
    type: lock.template.version === TEMPLATE_VERSION && !managedChanges && hasTasks ? "skip-current-lock" : "update-lock",
    path: "temple.lock"
  });

  return {
    target,
    lock,
    fromVersion: lock.template.version,
    toVersion: TEMPLATE_VERSION,
    templateFiles,
    actions,
    conflicts
  };
}

export async function executeUpgrade(plan) {
  if (plan.conflicts.length > 0) {
    throw new Error(`Upgrade stopped before writing:\n- ${plan.conflicts.join("\n- ")}`);
  }

  for (const action of plan.actions) {
    if (!["add-managed", "update-managed"].includes(action.type)) continue;
    const sourcePath = path.join(TEMPLATE_ROOT, action.path);
    const installedPath = path.join(plan.target, action.path);
    await fs.mkdir(path.dirname(installedPath), { recursive: true });
    await atomicWrite(installedPath, await fs.readFile(sourcePath));
  }
  await ensureTaskRegistry(plan.target);

  if (!plan.actions.some((action) => action.type === "update-lock")) return plan.lock;

  const managedFiles = [];
  for (const relativePath of plan.templateFiles) {
    managedFiles.push({ path: relativePath, sha256: await sha256File(path.join(plan.target, relativePath)) });
  }
  const lock = {
    ...plan.lock,
    template: {
      name: PACKAGE_NAME,
      version: TEMPLATE_VERSION,
      repository: TEMPLATE_REPOSITORY,
      installed_at: plan.lock.template.installed_at,
      upgraded_at: new Date().toISOString(),
      upgraded_from: plan.fromVersion
    },
    boundaries: {
      managed: [...MANAGED_PATH_PREFIXES, ...MANAGED_EXACT_PATHS],
      project_owned: PROJECT_OWNED_PATHS,
      generated: GENERATED_PATHS
    },
    capabilities: {
      work_item_cli: true,
      task_registry: true,
      checksum_upgrade: true
    },
    managed_files: managedFiles
  };
  await atomicWrite(path.join(plan.target, "temple.lock"), formatJson(lock));
  return lock;
}

export function formatUpgradePlan(plan) {
  const lines = [`Temple upgrade plan for ${plan.target}`, `- version: ${plan.fromVersion} -> ${plan.toVersion}`];
  const counts = new Map();
  for (const action of plan.actions) counts.set(action.type, (counts.get(action.type) ?? 0) + 1);
  for (const [type, count] of [...counts].sort(([left], [right]) => left.localeCompare(right))) {
    lines.push(`- ${type}: ${count}`);
  }
  if (plan.conflicts.length > 0) lines.push("Conflicts:", ...plan.conflicts.map((conflict) => `- ${conflict}`));
  return lines.join("\n");
}
