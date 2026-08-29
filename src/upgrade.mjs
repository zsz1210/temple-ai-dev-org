import fs from "node:fs/promises";
import path from "node:path";
import {
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
import { packSourcesForLock } from "./packs.mjs";
import { CONTEXT_MAP_RELATIVE_PATH, ensureContextMap } from "./context.mjs";
import { ensureLearningIndex, LEARNING_INDEX_RELATIVE_PATH } from "./learning.mjs";
import { ensureTaskRegistry } from "./project.mjs";

function isManaged(relativePath) {
  return MANAGED_EXACT_PATHS.has(relativePath) || MANAGED_SOURCE_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function isSafeManagedPath(relativePath) {
  return (
    typeof relativePath === "string" &&
    relativePath.length > 0 &&
    !path.isAbsolute(relativePath) &&
    !path.win32.isAbsolute(relativePath) &&
    !relativePath.includes("\\") &&
    path.posix.normalize(relativePath) === relativePath &&
    isManaged(relativePath)
  );
}

async function filesEqual(leftPath, rightPath) {
  const [left, right] = await Promise.all([fs.readFile(leftPath), fs.readFile(rightPath)]);
  return left.equals(right);
}

async function planUiAssignmentMigration(target, conflicts) {
  const assignmentsPath = path.join(target, ".ai-org/project/assignments.json");
  const agentsPath = path.join(target, ".ai-org/project/agents.json");
  if (!(await pathExists(assignmentsPath)) || !(await pathExists(agentsPath))) {
    conflicts.push("UI Designer assignment migration requires project assignments and Agent identities");
    return null;
  }

  try {
    const [before, assignmentsDocument, agentsDocument] = await Promise.all([
      fs.readFile(assignmentsPath),
      readJson(assignmentsPath),
      readJson(agentsPath)
    ]);
    if (assignmentsDocument.schema_version !== "temple.assignments/v1" || !Array.isArray(assignmentsDocument.assignments)) {
      conflicts.push("UI Designer assignment migration requires a valid assignments document");
      return null;
    }

    const activeAssignments = assignmentsDocument.assignments.filter((assignment) => assignment.active !== false);
    const uiAssignments = activeAssignments.filter((assignment) => assignment.position_id === "ui_designer");
    const agentIds = new Set((agentsDocument.agents ?? []).map((agent) => agent.id));
    if (uiAssignments.length === 1) {
      if (!agentIds.has(uiAssignments[0].agent_id)) {
        conflicts.push("UI Designer assignment references an unknown Agent Identity");
      }
      return null;
    }
    if (uiAssignments.length > 1) {
      conflicts.push("UI Designer has more than one active assignment");
      return null;
    }

    const uxAssignments = activeAssignments.filter((assignment) => assignment.position_id === "ux_designer");
    if (uxAssignments.length !== 1) {
      conflicts.push("Cannot infer UI Designer owner without exactly one active UX Designer assignment");
      return null;
    }
    if (!agentIds.has(uxAssignments[0].agent_id)) {
      conflicts.push("UX Designer assignment references an unknown Agent Identity");
      return null;
    }
    return {
      path: ".ai-org/project/assignments.json",
      agentId: uxAssignments[0].agent_id,
      beforeHash: sha256(before)
    };
  } catch (error) {
    conflicts.push(`Cannot plan UI Designer assignment migration: ${error.message}`);
    return null;
  }
}

export async function planUpgrade(target) {
  const lockPath = path.join(target, "temple.lock");
  if (!(await pathExists(lockPath))) throw new Error("temple.lock is missing; run temple init instead of upgrade");
  const lock = await readJson(lockPath);
  if (!KNOWN_PACKAGE_NAMES.has(lock.template?.name)) throw new Error("temple.lock belongs to an unknown template");

  const conflicts = [];
  const actions = [];
  const previousManaged = new Map((lock.managed_files ?? []).map((entry) => [entry.path, entry.sha256]));
  for (const [relativePath, expectedHash] of previousManaged) {
    if (!isSafeManagedPath(relativePath)) {
      conflicts.push(`invalid managed path in temple.lock: ${relativePath}`);
      continue;
    }
    const installedPath = path.join(target, relativePath);
    if (!(await pathExists(installedPath))) {
      conflicts.push(`managed file is missing: ${relativePath}`);
    } else if ((await sha256File(installedPath)) !== expectedHash) {
      conflicts.push(`managed file changed since ${lock.template.version}: ${relativePath}`);
    }
  }

  const sourceFiles = new Map();
  for (const relativePath of (await walkFiles(PROJECT_OVERLAY_ROOT)).filter(isManaged)) {
    sourceFiles.set(relativePath, path.join(PROJECT_OVERLAY_ROOT, relativePath));
  }
  const packSources = await packSourcesForLock(lock);
  conflicts.push(...packSources.conflicts);
  for (const [relativePath, sourcePath] of packSources.sources) {
    if (sourceFiles.has(relativePath)) conflicts.push(`optional pack overlaps core managed path: ${relativePath}`);
    else sourceFiles.set(relativePath, sourcePath);
  }
  const templateFiles = [...sourceFiles.keys()].sort();
  const currentManaged = new Set(templateFiles);
  for (const relativePath of templateFiles) {
    const sourcePath = sourceFiles.get(relativePath);
    const installedPath = path.join(target, relativePath);
    if (!(await pathExists(installedPath))) {
      actions.push({ type: "add-managed", path: relativePath });
    } else {
      if (!previousManaged.has(relativePath)) {
        conflicts.push(`untracked file blocks new managed path: ${relativePath}`);
      } else if (await filesEqual(sourcePath, installedPath)) {
        actions.push({ type: "skip-identical", path: relativePath });
      } else {
        actions.push({ type: "update-managed", path: relativePath });
      }
    }
  }

  for (const relativePath of previousManaged.keys()) {
    if (isSafeManagedPath(relativePath) && !currentManaged.has(relativePath)) {
      actions.push({ type: "remove-managed", path: relativePath });
    }
  }

  const tasksPath = path.join(target, ".ai-org/project/tasks.json");
  const hasTasks = await pathExists(tasksPath);
  actions.push({ type: hasTasks ? "skip-project-tasks" : "create-project-tasks", path: ".ai-org/project/tasks.json" });
  const hasLearningIndex = await pathExists(path.join(target, LEARNING_INDEX_RELATIVE_PATH));
  actions.push({
    type: hasLearningIndex ? "skip-learning-index" : "create-learning-index",
    path: LEARNING_INDEX_RELATIVE_PATH
  });
  const hasContextMap = await pathExists(path.join(target, CONTEXT_MAP_RELATIVE_PATH));
  actions.push({
    type: hasContextMap ? "skip-context-map" : "create-context-map",
    path: CONTEXT_MAP_RELATIVE_PATH
  });
  const assignmentMigration = await planUiAssignmentMigration(target, conflicts);
  actions.push({
    type: assignmentMigration ? "add-ui-assignment" : "skip-ui-assignment",
    path: ".ai-org/project/assignments.json"
  });
  const managedChanges = actions.some((action) =>
    ["add-managed", "update-managed", "remove-managed"].includes(action.type)
  );
  const packMetadataChanges = packSources.definitions.some(
    ({ definition, installed }) =>
      definition.manifest.version !== installed.version ||
      JSON.stringify(definition.manifest.skills) !== JSON.stringify(installed.skills ?? []) ||
      JSON.stringify(definition.manifest.files) !== JSON.stringify(installed.managed_files ?? [])
  );
  const capabilityChanges =
    lock.capabilities?.engineering_learning !== true ||
    lock.capabilities?.ui_delivery_modes !== true ||
    lock.capabilities?.progressive_context_routing !== true ||
    lock.capabilities?.capability_registry !== true ||
    lock.capabilities?.retrieval_provider_contract !== true;
  if (packMetadataChanges) actions.push({ type: "update-pack-metadata", path: "temple.lock" });
  if (capabilityChanges) actions.push({ type: "update-capabilities", path: "temple.lock" });
  actions.push({
    type:
      lock.template.version === TEMPLATE_VERSION &&
      !managedChanges &&
      !packMetadataChanges &&
      !capabilityChanges &&
      !assignmentMigration &&
      hasTasks &&
      hasLearningIndex &&
      hasContextMap
        ? "skip-current-lock"
        : "update-lock",
    path: "temple.lock"
  });

  return {
    target,
    lock,
    fromVersion: lock.template.version,
    toVersion: TEMPLATE_VERSION,
    templateFiles,
    sourceFiles,
    packDefinitions: packSources.definitions,
    assignmentMigration,
    actions,
    conflicts
  };
}

export async function executeUpgrade(plan) {
  if (plan.conflicts.length > 0) {
    throw new Error(`Upgrade stopped before writing:\n- ${plan.conflicts.join("\n- ")}`);
  }

  const changes = [];
  try {
    for (const action of plan.actions) {
      const installedPath = path.join(plan.target, action.path);
      if (action.type === "remove-managed") {
        const expectedHash = (plan.lock.managed_files ?? []).find((entry) => entry.path === action.path)?.sha256;
        if (!expectedHash || (await sha256File(installedPath)) !== expectedHash) {
          throw new Error(`Managed file changed before removal: ${action.path}`);
        }
        const before = await fs.readFile(installedPath);
        await fs.unlink(installedPath);
        changes.push({ path: installedPath, before, afterHash: null });
        continue;
      }
      if (!["add-managed", "update-managed"].includes(action.type)) continue;
      const sourcePath = plan.sourceFiles.get(action.path);
      const sourceContent = await fs.readFile(sourcePath);
      if (action.type === "add-managed") {
        await atomicCreate(installedPath, sourceContent);
        changes.push({ path: installedPath, before: null, afterHash: sha256(sourceContent) });
      } else {
        const expectedHash = (plan.lock.managed_files ?? []).find((entry) => entry.path === action.path)?.sha256;
        if (!expectedHash || (await sha256File(installedPath)) !== expectedHash) {
          throw new Error(`Managed file changed before update: ${action.path}`);
        }
        const before = await fs.readFile(installedPath);
        await atomicWrite(installedPath, sourceContent);
        changes.push({ path: installedPath, before, afterHash: sha256(sourceContent) });
      }
    }

    const taskRegistry = await ensureTaskRegistry(plan.target);
    if (taskRegistry.created) {
      changes.push({ path: taskRegistry.path, before: null, afterHash: taskRegistry.afterHash });
    }
    const learningIndex = await ensureLearningIndex(plan.target);
    if (learningIndex.created) {
      changes.push({ path: learningIndex.path, before: null, afterHash: learningIndex.afterHash });
    }
    const contextMap = await ensureContextMap(plan.target);
    if (contextMap.created) {
      changes.push({ path: contextMap.path, before: null, afterHash: contextMap.afterHash });
    }
    if (plan.assignmentMigration) {
      const assignmentsPath = path.join(plan.target, plan.assignmentMigration.path);
      const before = await fs.readFile(assignmentsPath);
      if (sha256(before) !== plan.assignmentMigration.beforeHash) {
        throw new Error("assignments.json changed after upgrade planning");
      }
      const assignmentsDocument = JSON.parse(before.toString("utf8"));
      const activeUiAssignments = assignmentsDocument.assignments.filter(
        (assignment) => assignment.active !== false && assignment.position_id === "ui_designer"
      );
      if (activeUiAssignments.length > 0) throw new Error("UI Designer assignment appeared after upgrade planning");
      const content = formatJson({
        ...assignmentsDocument,
        assignments: [
          ...assignmentsDocument.assignments,
          { position_id: "ui_designer", agent_id: plan.assignmentMigration.agentId, active: true }
        ].sort((left, right) => left.position_id.localeCompare(right.position_id))
      });
      await atomicWrite(assignmentsPath, content);
      changes.push({ path: assignmentsPath, before, afterHash: sha256(content) });
    }

    if (!plan.actions.some((action) => action.type === "update-lock")) return plan.lock;

    const managedFiles = [];
    for (const relativePath of plan.templateFiles) {
      managedFiles.push({ path: relativePath, sha256: await sha256File(path.join(plan.target, relativePath)) });
    }
    const timestamp = new Date().toISOString();
    const optionalPacks = plan.packDefinitions.map(({ definition, installed }) => ({
      id: definition.manifest.id,
      version: definition.manifest.version,
      installed_at: installed.installed_at ?? timestamp,
      ...(installed.version === definition.manifest.version
        ? {}
        : { upgraded_at: timestamp, upgraded_from: installed.version }),
      skills: definition.manifest.skills,
      managed_files: definition.manifest.files
    }));
    const lock = {
      ...plan.lock,
      template: {
        name: PACKAGE_NAME,
        version: TEMPLATE_VERSION,
        repository: TEMPLATE_REPOSITORY,
        installed_at: plan.lock.template.installed_at,
        upgraded_at: timestamp,
        upgraded_from: plan.fromVersion
      },
      boundaries: {
        managed_files_authoritative: true,
        allowed_managed_roots: MANAGED_SOURCE_PREFIXES,
        allowed_managed_exact_paths: [...MANAGED_EXACT_PATHS],
        ownership_precedence: "exact managed_files entry, otherwise project-owned",
        project_owned: PROJECT_OWNED_PATHS,
        generated: GENERATED_PATHS
      },
      capabilities: {
        ...(plan.lock.capabilities ?? {}),
        work_item_cli: true,
        task_registry: true,
        engineering_learning: true,
        ui_delivery_modes: true,
        progressive_context_routing: true,
        capability_registry: true,
        retrieval_provider_contract: true,
        checksum_upgrade: true,
        optional_packs: true
      },
      optional_packs: optionalPacks,
      managed_files: managedFiles
    };
    if (JSON.stringify(await readJson(path.join(plan.target, "temple.lock"))) !== JSON.stringify(plan.lock)) {
      throw new Error("temple.lock changed after upgrade planning");
    }
    await atomicWrite(path.join(plan.target, "temple.lock"), formatJson(lock));
    return lock;
  } catch (error) {
    try {
      await rollbackFileChanges(changes);
    } catch (rollbackError) {
      throw new AggregateError([error, rollbackError], "Upgrade failed and rollback was incomplete");
    }
    throw error;
  }
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
