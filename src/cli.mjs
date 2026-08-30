import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { LEAN_ASSIGNMENT_SLOTS, TEMPLATE_VERSION } from "./constants.mjs";
import {
  buildCapabilityRegistry,
  findCapabilities,
  resolveWorkItemContext,
  writeCapabilityRegistry,
  writeContextCapsule
} from "./context.mjs";
import { runDoctor, formatDoctor } from "./doctor.mjs";
import {
  addMembership,
  addAgentIdentity,
  addPrincipal,
  readCollaborationState,
  setCollaborationProfile,
  sponsorAgent
} from "./collaboration.mjs";
import { assertSafeTarget, readJson } from "./files.mjs";
import { executeInit, formatInitPlan, planInit } from "./install.mjs";
import { readEvidenceRegistry, recordEvidence } from "./evidence.mjs";
import { validateInitConfig } from "./model.mjs";
import {
  executePackInstall,
  executePackRemove,
  formatPackPlan,
  listPackState,
  planPackInstall,
  planPackRemove
} from "./packs.mjs";
import { withProjectMutationLock } from "./project.mjs";
import { buildStatus, renderStatusMarkdown, writeStatus } from "./status.mjs";
import { buildObserverProjection, writeObserverProjection } from "./observer.mjs";
import {
  ingestControlPlaneFixture,
  inspectControlPlane,
  rebuildControlPlane,
  startControlPlaneServer
} from "./control-plane-server.mjs";
import { readControlPlaneConfig } from "./control-plane-config.mjs";
import { captureGitHubEvidence } from "./github-control-plane-provider.mjs";
import { resolveControlPlaneStateDirectory } from "./telemetry.mjs";
import { validateProjectSchemas } from "./schema-validation.mjs";
import { buildMigrationPlan } from "./migrations.mjs";
import {
  addLearningEntry,
  listLearningEntries,
  migrateLearningIndex,
  revalidateLearningEntry
} from "./learning.mjs";
import { evaluateRetrieval, readRetrievalConfig } from "./retrieval.mjs";
import { installArchifyAdapter, inspectArchifyAdapter } from "./archify-adapter.mjs";
import { listTasks, registerTask, updateTask } from "./tasks.mjs";
import {
  configureTracker,
  inspectAndPlanTrackerItem,
  linkTrackerItem,
  readTrackerConfig,
  reconcileTrackerItem,
  removeTrackerProvider,
  setTrackerVisibility,
  unlinkTrackerItem,
  writeTrackerView
} from "./tracker.mjs";
import { executeUpgrade, formatUpgradePlan, planUpgrade } from "./upgrade.mjs";
import { applyRestore, createBackup, inspectBackup, planRestore, recoverRestore } from "./recovery.mjs";
import { buildParallelPlan, writeParallelPlan } from "./orchestration.mjs";
import { defineResource, readResourceRegistry } from "./resources.mjs";
import { attachInternalWorker, listRuntimeWorkers, prepareWorkerDispatch, updateRuntimeWorker } from "./workers.mjs";
import {
  closeWorkItem,
  claimWorkItem,
  configureWorkItem,
  createHandoff,
  createWorkItem,
  evaluateParallelReadiness,
  listUnresolvedItems,
  releaseWorkItemClaim,
  transitionWorkItem,
  updateUnresolvedItems
} from "./work-items.mjs";

const HELP = `Temple ${TEMPLATE_VERSION}

Usage:
  temple init [target] [--config path] [--dry-run] [--integrate-agents] [--self-host]
  temple upgrade [target] [--dry-run]
  temple backup create [target] --output directory [--json]
  temple backup inspect [target] --backup directory [--json]
  temple restore preview [target] --backup directory [--json]
  temple restore apply [target] --backup directory --expected-plan sha256 [--allow-replace] [--json]
  temple restore recover [target] [--json]
  temple doctor [target] [--json]
  temple status [target] [--json] [--no-write]
  temple observe [target] [--json] [--no-write]
  temple control-plane snapshot [target] [--state-dir path] [--json]
  temple control-plane ingest [target] --fixture path [--state-dir path] [--json]
  temple control-plane rebuild [target] [--state-dir path] [--json]
  temple control-plane capture-github [target] --provider-id id --work-item WI-ID --revision commit [--state-dir path] [--actor id] [--title text] [--summary text] [--json]
  temple control-plane start [target] [--host 127.0.0.1] [--port number] [--state-dir path] [--fixture path] [--codex]
  temple collaboration show [target] [--json]
  temple collaboration set-profile [target] --profile solo|collaborative|high-assurance
  temple collaboration add-principal [target] --principal-id principal-name --name "Human Name"
  temple collaboration add-agent [target] --agent-id agent-name --name "Agent Name"
  temple collaboration sponsor [target] --principal-id principal-name --agent-id agent-name
  temple collaboration add-membership [target] --agent-id agent-name --position developer [--discipline backend]
  temple work-item create [target] --title text [--scope text] [--acceptance text] [--affected-path path] [--context-ref id] [--spec-mode gate-evidence|indexed] [--spec-ref ID@revision] [--ui-mode mode] [--risk-tier low|standard|high|critical] [--discipline backend] [--stage-discipline build=backend] [--stage-resource test=ios-simulator[:units]] [--tracker-visibility internal|team-visible]
  temple work-item configure [target] --work-item WI-ID [--parent WI-ID] [--depends-on WI-ID] [--agent-id agent-name] [--discipline backend] [--stage-discipline build=backend] [--stage-resource test=ios-simulator[:units]] [--clear-stage-requirement test] [--base-revision ref] [--parallel-mode mode] [--spec-ref ID@revision] [--replace-spec-refs]
  temple work-item claim [target] --work-item WI-ID --agent-id agent-name --principal-id principal-name --base-revision ref --branch name [--worktree path]
  temple work-item release [target] --work-item WI-ID [--agent-id agent-name] [--principal-id principal-name] [--reason text]
  temple work-item unresolved [target] --work-item WI-0001 [--resolve text] [--merge text]
  temple parallel check [target] --work-item WI-ID [--agent-id agent-name] [--json]
  temple parallel plan [target] [--parent WI-ID] [--max-workers number] [--json] [--no-write]
  temple parallel prepare [target] --work-item WI-ID --agent-id agent-name --principal-id principal-name --base-revision ref --branch name --runtime-kind internal-subagent|user-task [--worktree path]
  temple resource define [target] --resource-id id --name "Display name" --capacity number [--description text]
  temple resource list [target] [--json]
  temple worker attach [target] --worker-id id --runtime-id id
  temple worker update [target] --worker-id id --status active|waiting|attention|completed|failed|cancelled [--revision ref] [--evidence ref]
  temple worker list [target] [--json]
  temple evidence git [target] --work-item WI-ID --revision ref [--title text] [--summary text]
  temple evidence test [target] --work-item WI-ID --observation path [--title text] [--summary text]
  temple evidence runtime [target] --work-item WI-ID --observation path [--title text] [--summary text]
  temple evidence unverified [target] --work-item WI-ID --summary text --reason text --expected-verification text
  temple evidence risk [target] --work-item WI-ID --summary text --severity low|medium|high|critical --risk-status open|accepted|mitigated --mitigation text [--revision ref]
  temple evidence rollback [target] --work-item WI-ID --summary text --procedure path --rollback-status planned|verified [--revision ref]
  temple evidence list [target] [--work-item WI-ID] [--json]
  temple schema validate [target] [--json]
  temple migration plan [target] [--json]
  temple learning add-lesson [target] --title text --summary text --confidence low|medium|high [--tag value] [--applies-to value] [--source-work-item WI-ID] [--evidence ref]
  temple learning add-practice [target] --title text --summary text --confidence low|medium|high --derived-from LESSON-ID --owner-position position [--tag value] [--applies-to value]
  temple learning revalidate [target] --learning-id ID --result confirmed|narrowed|contradicted [--evidence ref] [--review-after timestamp]
  temple learning list [target] [--json]
  temple learning migrate [target] [--dry-run] [--json]
  temple learning evaluate [target] --fixture path [--no-write] [--json]
  temple retrieval show [target] [--json]
  temple adapter archify-status [target] [--json]
  temple adapter archify-install [target] --source local-git-checkout [--json]
  temple handoff [target] --work-item WI-0001 --to position --input-revision ref --completed text --evidence ref
  temple transition [target] --work-item WI-0001 --to state --satisfy requirement=reference
  temple close [target] --work-item WI-0001 --decision go|no-go --tested-revision ref --rollback text --approval record
  temple task register [target] --work-item WI-0001 --position developer --thread-id id [--worker-id worker-id]
  temple task update [target] --task-id task-0001 --status completed
  temple task list [target] [--json]
  temple tracker show [target] [--json]
  temple tracker configure [target] --tracker-profile linked-tracker --provider-id github-main --provider-kind github --project owner/repository [--write-policy plan-only]
  temple tracker remove-provider [target] --provider-id github-main
  temple tracker set-visibility [target] --work-item WI-0001 --visibility internal|team-visible
  temple tracker link [target] --work-item WI-0001 --provider-id github-main --item-id 123 --url https://github.com/owner/repository/issues/123 [--role primary]
  temple tracker unlink [target] --work-item WI-0001 --provider-id github-main --item-id 123
  temple tracker inspect [target] --work-item WI-0001 [--provider-id github-main] [--observation path] [--no-write] [--json]
  temple tracker plan [target] --work-item WI-0001 [--provider-id github-main] [--observation path] [--no-write] [--json]
  temple tracker reconcile [target] --work-item WI-0001 --observation path --resolution resolution --reason text
  temple pack list [target] [--json]
  temple pack install [target] --pack build-quality [--dry-run]
  temple pack remove [target] --pack build-quality [--dry-run]
  temple capability list [target] [--json]
  temple capability find [target] --query text [--position position] [--limit number] [--json]
  temple context resolve [target] --work-item WI-0001 [--position position] [--query text] [--revision ref] [--limit number] [--json] [--no-write]
  temple --version

Core commands:
  init        Install Temple and project-specific Agent Identities.
  upgrade     Update only checksum-clean managed files; preserve project-owned state.
  backup      Create and verify a transparent, content-addressed backup of project-owned Temple state.
  restore     Preview, apply, or safely recover an interrupted project-owned-state restore.
  doctor      Validate managed files, identities, work items, tasks, and integrations.
  status      Rebuild the observable project status from canonical files.
  observe     Build a read-only lifecycle, evidence, approval, and recovery projection.
  control-plane Run the local replay-safe telemetry journal, provider surface, snapshot API, and SSE stream.
  collaboration Configure Human Principals, Agent sponsorship, Position membership, and the operating profile.
  work-item   Create and configure work items, revisioned contracts, UI mode, claims, and unresolved items.
  parallel    Check one item or build deterministic safe dispatch waves for a group.
  resource    Define and inspect shared runtime or verification capacity.
  worker      Correlate reserved work with internal subagents or user-owned Codex tasks.
  evidence    Normalize local Git, test, runtime, claim, risk, and rollback observations without satisfying gates.
  schema      Validate cataloged project and generated JSON through Draft 2020-12 schemas.
  migration   Inspect versioned framework and explicit project-data migrations.
  learning    Capture, revalidate, retrieve, and evaluate project-owned engineering learning.
  retrieval   Inspect the deterministic default and unconfigured local-hybrid boundary.
  adapter     Inspect or install an opt-in, pinned, isolated local adapter.
  handoff     Create an evidence-bearing Position handoff artifact.
  transition  Enforce the workflow edge and its named gate requirements.
  close       Record release readiness and close or block a release-gate item.
  task        Register Codex task/thread identity, status, revision, and archive readiness.
  tracker     Link team-visible Work Items to external trackers through inspect, plan, and explicit reconciliation.
  pack        List, install, or remove checksum-managed optional Skill packs.
  capability  Discover installed repository Skills without taking ownership of project extensions.
  context     Resolve a bounded work-item Context Capsule through the configured Retrieval Provider.

Repeat --scope, --acceptance, --completed, --evidence, --unresolved, --resolve,
--merge, --affected-path, --context-ref, --spec-ref, --ux-ref, --ui-ref,
--contract-ref, --stage-discipline, --stage-resource, --clear-stage-requirement, --rollback, --reason,
or --satisfy as needed. Configure merges document refs by ID;
use the matching --replace-*-refs flag to replace or clear a complete category. Temple never creates, renames, or archives a
Codex task by itself; task registry entries make those app actions observable.
`;

const CHAMBER = `The chamber is open.

Outside: one idea.
Inside: many Positions learn, build, challenge, and verify in parallel.
Only evidence leaves the chamber.`;

const BOOLEAN_FLAGS = new Set([
  "--dry-run",
  "--integrate-agents",
  "--self-host",
  "--json",
  "--no-write",
  "--help",
  "--replace-spec-refs",
  "--replace-ux-refs",
  "--replace-ui-refs",
  "--replace-contract-refs",
  "--codex",
  "--allow-replace"
]);
const VALUE_FLAGS = new Set([
  "--config",
  "--title",
  "--actor",
  "--work-item",
  "--to",
  "--input-revision",
  "--decision",
  "--tested-revision",
  "--approval",
  "--position",
  "--thread-id",
  "--client-thread-id",
  "--host-id",
  "--status",
  "--revision",
  "--task-id",
  "--notes",
  "--pack",
  "--query",
  "--limit",
  "--max-workers",
  "--scope",
  "--acceptance",
  "--completed",
  "--evidence",
  "--unresolved",
  "--resolve",
  "--merge",
  "--rollback",
  "--reason",
  "--satisfy",
  "--affected-path",
  "--context-ref",
  "--spec-ref",
  "--ux-ref",
  "--ui-ref",
  "--contract-ref",
  "--spec-mode",
  "--ui-mode",
  "--profile",
  "--principal-id",
  "--name",
  "--agent-id",
  "--discipline",
  "--stage-discipline",
  "--stage-resource",
  "--clear-stage-requirement",
  "--parent",
  "--depends-on",
  "--base-revision",
  "--parallel-mode",
  "--integration-owner",
  "--shared-contract-ref",
  "--contract-status",
  "--overlap-resolution",
  "--branch",
  "--worktree",
  "--tracker-profile",
  "--sync-granularity",
  "--provider-id",
  "--provider-kind",
  "--project",
  "--base-url",
  "--provider-status",
  "--read-policy",
  "--write-policy",
  "--default-provider",
  "--tracker-visibility",
  "--visibility",
  "--item-id",
  "--url",
  "--role",
  "--observation",
  "--resolution",
  "--resource-id",
  "--capacity",
  "--description",
  "--runtime-kind",
  "--worker-id",
  "--runtime-id",
  "--summary",
  "--expected-verification",
  "--severity",
  "--risk-status",
  "--mitigation",
  "--procedure",
  "--rollback-status",
  "--risk-tier",
  "--confidence",
  "--tag",
  "--applies-to",
  "--source-work-item",
  "--derived-from",
  "--owner-position",
  "--learning-id",
  "--result",
  "--review-after",
  "--fixture",
  "--source",
  "--state-dir",
  "--host",
  "--port",
  "--repository-interval",
  "--output",
  "--backup",
  "--expected-plan"
]);
const REPEATABLE_FLAGS = new Set([
  "--scope",
  "--acceptance",
  "--completed",
  "--evidence",
  "--unresolved",
  "--resolve",
  "--merge",
  "--rollback",
  "--reason",
  "--satisfy",
  "--affected-path",
  "--context-ref",
  "--spec-ref",
  "--ux-ref",
  "--ui-ref",
  "--contract-ref",
  "--discipline",
  "--stage-discipline",
  "--stage-resource",
  "--clear-stage-requirement",
  "--depends-on",
  "--shared-contract-ref",
  "--overlap-resolution",
  "--tag",
  "--applies-to",
  "--source-work-item",
  "--derived-from"
]);
const NESTED_COMMANDS = new Set(["work-item", "task", "tracker", "pack", "capability", "context", "collaboration", "parallel", "resource", "worker", "evidence", "schema", "migration", "learning", "retrieval", "adapter", "control-plane", "backup", "restore"]);

function parseCommand(argv) {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    return { command: "help", action: null, target: ".", flags: new Set(), options: {} };
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    return { command: "version", action: null, target: ".", flags: new Set(), options: {} };
  }

  const command = argv[0];
  let action = null;
  let start = 1;
  if (NESTED_COMMANDS.has(command)) {
    action = argv[1];
    if (!action || action.startsWith("--")) throw new Error(`${command} requires an action`);
    start = 2;
  }

  const flags = new Set();
  const options = {};
  const positionals = [];
  for (let index = start; index < argv.length; index += 1) {
    const token = argv[index];
    if (BOOLEAN_FLAGS.has(token)) {
      flags.add(token);
    } else if (VALUE_FLAGS.has(token)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${token} requires a value`);
      if (REPEATABLE_FLAGS.has(token)) options[token] = [...(options[token] ?? []), value];
      else options[token] = value;
      index += 1;
    } else if (token.startsWith("--")) {
      throw new Error(`Unknown option: ${token}`);
    } else {
      positionals.push(token);
    }
  }
  if (positionals.length > 1) throw new Error(`Unexpected arguments: ${positionals.slice(1).join(" ")}`);
  return { command, action, target: positionals[0] ?? ".", flags, options };
}

function listOption(parsed, flag) {
  const value = parsed.options[flag];
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function parseSatisfied(values) {
  const output = {};
  for (const value of values) {
    const separator = value.indexOf("=");
    if (separator <= 0 || separator === value.length - 1) {
      throw new Error(`Invalid --satisfy value ${value}; use requirement=reference`);
    }
    const requirement = value.slice(0, separator).trim();
    const reference = value.slice(separator + 1).trim();
    output[requirement] = [...(output[requirement] ?? []), reference];
  }
  return output;
}

function parseDocumentReferences(values, flag) {
  const references = [];
  const seen = new Set();
  for (const value of values) {
    const separator = value.indexOf("@");
    if (separator <= 0 || separator === value.length - 1) {
      throw new Error(`Invalid ${flag} value ${value}; use ID@revision`);
    }
    const id = value.slice(0, separator).trim();
    const revision = value.slice(separator + 1).trim();
    if (!id || !revision) throw new Error(`Invalid ${flag} value ${value}; use ID@revision`);
    if (seen.has(id)) throw new Error(`${flag} contains duplicate reference: ${id}`);
    seen.add(id);
    references.push({ id, revision });
  }
  return references;
}

function parseStageRequirements(disciplineValues, resourceValues, clearStages = []) {
  if (disciplineValues.length === 0 && resourceValues.length === 0 && clearStages.length === 0) return undefined;
  const output = {};
  for (const value of clearStages) {
    const stage = String(value).trim();
    if (!stage) throw new Error("--clear-stage-requirement requires a lifecycle stage");
    output[stage] = null;
  }
  for (const value of disciplineValues) {
    const separator = value.indexOf("=");
    if (separator <= 0 || separator === value.length - 1) {
      throw new Error(`Invalid --stage-discipline value ${value}; use stage=discipline`);
    }
    const stage = value.slice(0, separator).trim();
    const discipline = value.slice(separator + 1).trim();
    output[stage] = { ...(output[stage] ?? {}), disciplines: [...(output[stage]?.disciplines ?? []), discipline] };
  }
  for (const value of resourceValues) {
    const separator = value.indexOf("=");
    if (separator <= 0 || separator === value.length - 1) {
      throw new Error(`Invalid --stage-resource value ${value}; use stage=resource-id[:units]`);
    }
    const stage = value.slice(0, separator).trim();
    const resourceValue = value.slice(separator + 1).trim();
    const unitsSeparator = resourceValue.lastIndexOf(":");
    const hasUnits = unitsSeparator > 0 && /^[0-9]+$/.test(resourceValue.slice(unitsSeparator + 1));
    const resourceId = hasUnits ? resourceValue.slice(0, unitsSeparator) : resourceValue;
    const units = hasUnits ? Number(resourceValue.slice(unitsSeparator + 1)) : 1;
    output[stage] = {
      ...(output[stage] ?? {}),
      resources: [...(output[stage]?.resources ?? []), { resource_id: resourceId, units }]
    };
  }
  return output;
}

function projectIdFromDirectory(target) {
  const fallback = path.basename(path.resolve(target))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return fallback || "software-project";
}

function shellQuote(value) {
  if (process.platform === "win32") return `'${String(value).replaceAll("'", "''")}'`;
  return `'${String(value).replaceAll("'", `'"'"'`)}'`;
}

function directCliCommand(command, target) {
  const invocation = [process.execPath, path.join(path.resolve(target), "templew.mjs"), command, path.resolve(target)]
    .map(shellQuote)
    .join(" ");
  return process.platform === "win32" ? `& ${invocation}` : invocation;
}

async function askWithDefault(interfaceInstance, prompt, defaultValue) {
  const answer = (await interfaceInstance.question(`${prompt} [${defaultValue}]: `)).trim();
  return answer || defaultValue;
}

async function collectInteractiveConfig(target) {
  if (!input.isTTY || !output.isTTY) {
    throw new Error(
      "Non-interactive init requires --config. Use $temple-init in Codex for AI-suggested names or provide a temple.init/v1 JSON file."
    );
  }
  const prompt = readline.createInterface({ input, output });
  try {
    output.write("Temple will create project-specific identities. No names come from the template.\n");
    const defaultProjectId = projectIdFromDirectory(target);
    const projectName = await askWithDefault(prompt, "Project name", path.basename(path.resolve(target)) || "Software Project");
    const projectId = await askWithDefault(prompt, "Project ID", defaultProjectId);
    const agents = [];
    for (const slot of LEAN_ASSIGNMENT_SLOTS) {
      const displayName = (await prompt.question(`English name for ${slot.label}: `)).trim();
      agents.push({ display_name: displayName, positions: slot.positions });
    }
    return { schema_version: "temple.init/v1", project: { id: projectId, name: projectName }, naming_mode: "manual", agents };
  } finally {
    prompt.close();
  }
}

async function readStandardInput() {
  let content = "";
  input.setEncoding("utf8");
  for await (const chunk of input) content += chunk;
  return JSON.parse(content);
}

async function loadConfig(configPath, target) {
  if (!configPath) return collectInteractiveConfig(target);
  if (configPath === "-") return readStandardInput();
  return readJson(path.resolve(configPath));
}

async function refreshViews(target) {
  const registry = await buildCapabilityRegistry(target);
  const status = await buildStatus(target, { capabilityRegistry: registry });
  const [statusPath, capabilityPath] = await Promise.all([
    writeStatus(target, status),
    writeCapabilityRegistry(target, registry)
  ]);
  return { status, statusPath, capabilityPath };
}

function positiveIntegerOption(parsed, flag, fallback = 5) {
  const raw = parsed.options[flag];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 50) {
    throw new Error(`${flag} must be an integer from 1 to 50`);
  }
  return value;
}

function optionalPositiveIntegerOption(parsed, flag) {
  if (parsed.options[flag] === undefined) return null;
  return positiveIntegerOption(parsed, flag, null);
}

function printResult(parsed, result, lines) {
  if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
  else console.log(lines.join("\n"));
}

async function runInit(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const config = await validateInitConfig(await loadConfig(parsed.options["--config"], target));
  const options = {
    integrateAgents: parsed.flags.has("--integrate-agents"),
    selfHost: parsed.flags.has("--self-host")
  };
  const plan = await planInit(target, config, options);
  console.log(formatInitPlan(plan));
  if (plan.conflicts.length > 0) return 1;
  if (parsed.flags.has("--dry-run")) {
    console.log("Dry run complete; no files were written.");
    return 0;
  }
  const { doctor, statusPath } = await withProjectMutationLock(target, async () => {
    const lockedPlan = await planInit(target, config, options);
    if (lockedPlan.conflicts.length > 0) {
      throw new Error(`Initialization stopped before writing:\n- ${lockedPlan.conflicts.join("\n- ")}`);
    }
    await executeInit(lockedPlan);
    const lockedDoctor = await runDoctor(target);
    const views = await refreshViews(target);
    return { doctor: lockedDoctor, statusPath: views.statusPath };
  });
  console.log(`Initialized Temple ${TEMPLATE_VERSION}.`);
  console.log(formatDoctor(doctor));
  console.log(`Status view: ${statusPath}`);
  console.log(`Copyable project commands (${process.platform === "win32" ? "PowerShell" : "POSIX shell"}):`);
  console.log(`  Doctor: ${directCliCommand("doctor", target)}`);
  console.log(`  Status: ${directCliCommand("status", target)}`);
  return doctor.healthy ? 0 : 1;
}

async function runUpgrade(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const plan = await planUpgrade(target);
  console.log(formatUpgradePlan(plan));
  if (plan.conflicts.length > 0) return 1;
  if (parsed.flags.has("--dry-run")) {
    console.log("Dry run complete; no files were written.");
    return 0;
  }
  await withProjectMutationLock(target, async () => {
    const lockedPlan = await planUpgrade(target);
    if (lockedPlan.conflicts.length > 0) throw new Error(`Upgrade stopped before writing:\n- ${lockedPlan.conflicts.join("\n- ")}`);
    await executeUpgrade(lockedPlan);
    await refreshViews(target);
  });
  const doctor = await runDoctor(target);
  console.log(
    plan.actions.some((action) => action.type === "update-lock")
      ? `Upgraded Temple to ${TEMPLATE_VERSION}.`
      : `Temple is already current at ${TEMPLATE_VERSION}.`
  );
  console.log(formatDoctor(doctor));
  return doctor.healthy ? 0 : 1;
}

async function runBackup(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "create") {
    if (!parsed.options["--output"]) throw new Error("backup create requires --output");
    const result = await withProjectMutationLock(target, () => createBackup(target, parsed.options["--output"]));
    printResult(parsed, result, [
      `Created Temple backup: ${result.backup}`,
      `Project / version: ${result.project_id} / ${result.temple_version}`,
      `Files / bytes: ${result.file_count} / ${result.total_size}`,
      `Content digest: ${result.content_digest}`,
      "Application source and external systems: not included"
    ]);
    return 0;
  }
  if (parsed.action === "inspect") {
    if (!parsed.options["--backup"]) throw new Error("backup inspect requires --backup");
    const result = await inspectBackup(parsed.options["--backup"]);
    printResult(parsed, result, [
      `Valid Temple backup: ${result.backup}`,
      `Project / version: ${result.project_id} / ${result.temple_version}`,
      `Files / bytes: ${result.file_count} / ${result.total_size}`,
      `Manifest digest: ${result.manifest_digest}`,
      "Canonical state changed: no"
    ]);
    return 0;
  }
  throw new Error(`Unknown backup action: ${parsed.action}`);
}

async function runRestore(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "preview") {
    if (!parsed.options["--backup"]) throw new Error("restore preview requires --backup");
    const plan = await planRestore(target, parsed.options["--backup"]);
    const counts = Object.fromEntries(
      ["create", "replace", "identical"].map((action) => [
        action,
        plan.actions.filter((entry) => entry.action === action).length
      ])
    );
    printResult(parsed, plan, [
      `Temple restore preview for ${target}`,
      `Create / replace / identical: ${counts.create} / ${counts.replace} / ${counts.identical}`,
      `Target-only files preserved: ${plan.extras.length}`,
      `Upgrade required after restore: ${plan.compatibility.upgrade_required ? "yes" : "no"}`,
      `Conflicts: ${plan.conflicts.length}`,
      `Plan digest: ${plan.plan_digest}`,
      "Canonical state changed: no"
    ]);
    return plan.conflicts.length > 0 ? 1 : 0;
  }
  if (parsed.action === "apply") {
    if (!parsed.options["--backup"] || !parsed.options["--expected-plan"]) {
      throw new Error("restore apply requires --backup and --expected-plan");
    }
    const result = await withProjectMutationLock(target, async () => {
      const restored = await applyRestore(target, parsed.options["--backup"], {
        expectedPlan: parsed.options["--expected-plan"],
        allowReplace: parsed.flags.has("--allow-replace")
      });
      await refreshViews(target);
      return restored;
    });
    printResult(parsed, result, [
      `Restore transaction ${result.transaction_id}: ${result.status}`,
      `Created / replaced / identical: ${result.created} / ${result.replaced} / ${result.identical}`,
      `Target-only files preserved: ${result.extras_preserved}`,
      `Upgrade required: ${result.upgrade_required ? "yes" : "no"}`
    ]);
    return 0;
  }
  if (parsed.action === "recover") {
    const result = await withProjectMutationLock(target, async () => {
      const recovered = await recoverRestore(target);
      if (recovered.status === "rolled_back") await refreshViews(target);
      return recovered;
    });
    printResult(parsed, result, [
      result.status === "clean"
        ? `No interrupted Temple restore exists for ${target}`
        : `Restore transaction ${result.transaction_id}: ${result.status}`
    ]);
    return 0;
  }
  throw new Error(`Unknown restore action: ${parsed.action}`);
}

async function runDoctorCommand(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await runDoctor(target);
  console.log(parsed.flags.has("--json") ? JSON.stringify(result, null, 2) : formatDoctor(result));
  return result.healthy ? 0 : 1;
}

async function runStatusCommand(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const registry = await buildCapabilityRegistry(target);
  const status = await buildStatus(target, { capabilityRegistry: registry });
  if (!parsed.flags.has("--no-write")) {
    await Promise.all([writeStatus(target, status), writeCapabilityRegistry(target, registry)]);
  }
  console.log(parsed.flags.has("--json") ? JSON.stringify(status, null, 2) : renderStatusMarkdown(status));
  return 0;
}

async function runObserveCommand(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const projection = await buildObserverProjection(target);
  if (!parsed.flags.has("--no-write")) await writeObserverProjection(target, projection);
  if (parsed.flags.has("--json")) console.log(JSON.stringify(projection, null, 2));
  else {
    console.log(`${projection.project.name} Observer`);
    console.log(`Work: ${projection.work.total}`);
    console.log(`Active / blocked / QA / approval / queued: ${projection.work.categories.active} / ${projection.work.categories.blocked} / ${projection.work.categories.qa_pending} / ${projection.work.categories.approval_pending} / ${projection.work.categories.queued}`);
    console.log(`Evidence: ${projection.evidence.total} (${projection.evidence.stale} stale, ${projection.evidence.unverified} unverified, ${projection.evidence.failed} failed)`);
    console.log(`Attention: ${projection.attention.length}`);
    console.log(`Canonical state changed: no`);
    console.log(`External action: not performed`);
  }
  return 0;
}

function controlPlanePort(parsed) {
  if (parsed.options["--port"] === undefined) return undefined;
  const port = Number(parsed.options["--port"]);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("--port must be an integer from 0 to 65535");
  return port;
}

function controlPlaneInterval(parsed) {
  if (parsed.options["--repository-interval"] === undefined) return undefined;
  const interval = Number(parsed.options["--repository-interval"]);
  if (!Number.isInteger(interval) || interval < 50 || interval > 60000) {
    throw new Error("--repository-interval must be an integer from 50 to 60000 milliseconds");
  }
  return interval;
}

async function runControlPlane(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const options = {
    stateDirectory: parsed.options["--state-dir"],
    fixturePath: parsed.options["--fixture"]
  };
  if (parsed.action === "snapshot") {
    const result = await inspectControlPlane(target, options);
    printResult(parsed, result.snapshot, [
      `${result.snapshot.project.name} control plane`,
      `State: ${result.stateDirectory}`,
      `Events: ${result.snapshot.journal.retained_events}`,
      `Providers: ${result.snapshot.providers.providers.map((provider) => `${provider.id}:${provider.status}`).join(", ")}`,
      "Canonical state changed: no",
      "External action: not performed"
    ]);
    return 0;
  }
  if (parsed.action === "ingest") {
    if (!parsed.options["--fixture"]) throw new Error("control-plane ingest requires --fixture");
    const result = await ingestControlPlaneFixture(target, parsed.options["--fixture"], options);
    printResult(parsed, result, [
      `Fixture provider: ${result.result.provider_id}`,
      `Appended / duplicate: ${result.result.appended} / ${result.result.duplicates}`,
      `State: ${result.stateDirectory}`
    ]);
    return 0;
  }
  if (parsed.action === "rebuild") {
    const result = await rebuildControlPlane(target, options);
    printResult(parsed, result, [
      `Rebuilt control-plane journal from canonical repository state.`,
      `Canonical events: ${result.repository.source_events}`,
      `Archive: ${result.archivePath ?? "none"}`,
      `State: ${result.stateDirectory}`
    ]);
    return 0;
  }
  if (parsed.action === "capture-github") {
    if (!parsed.options["--provider-id"] || !parsed.options["--work-item"] || !parsed.options["--revision"]) {
      throw new Error("control-plane capture-github requires --provider-id, --work-item, and --revision");
    }
    const config = await readControlPlaneConfig(target);
    const stateDirectory = resolveControlPlaneStateDirectory(
      target,
      parsed.options["--state-dir"] ?? config.state_directory
    );
    const entry = await captureGitHubEvidence(target, stateDirectory, {
      providerId: parsed.options["--provider-id"],
      workItemId: parsed.options["--work-item"],
      revision: parsed.options["--revision"],
      actor: parsed.options["--actor"],
      title: parsed.options["--title"],
      summary: parsed.options["--summary"]
    });
    printResult(parsed, entry, [
      `Captured GitHub evidence: ${entry.id}`,
      `Work Item / revision: ${entry.work_item_id} / ${entry.scope_revision}`,
      `Outcome: ${entry.outcome}`,
      "Lifecycle gate changed: no",
      "External action: not performed"
    ]);
    return 0;
  }
  if (parsed.action === "start") {
    const controlPlane = await startControlPlaneServer(target, {
      ...options,
      host: parsed.options["--host"],
      port: controlPlanePort(parsed),
      repositoryIntervalMs: controlPlaneInterval(parsed),
      enableCodex: parsed.flags.has("--codex")
    });
    console.log(`Control plane: ${controlPlane.url}`);
    console.log(`State: ${controlPlane.stateDirectory}`);
    console.log("Press Ctrl-C to stop.");
    await new Promise((resolve) => {
      const stop = () => resolve();
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
    await controlPlane.close();
    return 0;
  }
  throw new Error("control-plane action must be snapshot, ingest, rebuild, capture-github, or start");
}

async function runEvidence(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "list") {
    const registry = await readEvidenceRegistry(target);
    const entries = parsed.options["--work-item"]
      ? registry.entries.filter((entry) => entry.work_item_id === parsed.options["--work-item"])
      : registry.entries;
    if (parsed.flags.has("--json")) console.log(JSON.stringify({ ...registry, entries }, null, 2));
    else if (entries.length === 0) console.log("No normalized evidence recorded.");
    else for (const entry of entries) console.log(`${entry.id}\t${entry.work_item_id}\t${entry.kind}\t${entry.outcome}\t${entry.scope_revision ?? "unbound"}`);
    return 0;
  }
  const kindByAction = {
    git: "git-revision",
    test: "test",
    runtime: "runtime",
    unverified: "unverified-claim",
    risk: "risk",
    rollback: "rollback"
  };
  const kind = kindByAction[parsed.action];
  if (!kind) throw new Error(`Unknown evidence action: ${parsed.action}`);
  if (!parsed.options["--work-item"]) throw new Error(`evidence ${parsed.action} requires --work-item`);
  const entry = await withProjectMutationLock(target, () => recordEvidence(target, kind, {
    workItemId: parsed.options["--work-item"],
    actor: parsed.options["--actor"],
    title: parsed.options["--title"],
    summary: parsed.options["--summary"],
    revision: parsed.options["--revision"],
    observation: parsed.options["--observation"],
    reason: listOption(parsed, "--reason").join("; "),
    expectedVerification: parsed.options["--expected-verification"],
    severity: parsed.options["--severity"],
    riskStatus: parsed.options["--risk-status"],
    mitigation: parsed.options["--mitigation"],
    procedure: parsed.options["--procedure"],
    rollbackStatus: parsed.options["--rollback-status"]
  }));
  printResult(parsed, entry, [
    `Recorded ${entry.id}: ${entry.kind} (${entry.outcome})`,
    `Scope revision: ${entry.scope_revision ?? "unbound"}`,
    `Lifecycle gate satisfied: no`,
    `External action: not performed`
  ]);
  return 0;
}

async function runSchema(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action !== "validate") throw new Error(`Unknown schema action: ${parsed.action}`);
  const report = await validateProjectSchemas(target);
  if (parsed.flags.has("--json")) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Runtime JSON Schema validation: ${report.valid ? "PASS" : "FAIL"}`);
    console.log(`Documents: ${report.documents_checked}; Schemas: ${report.schemas_checked}`);
    for (const error of report.errors) console.log(`[FAIL] ${error.document ?? error.schema}${error.instance_path}: ${error.message}`);
  }
  return report.valid ? 0 : 1;
}

async function runMigration(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action !== "plan") throw new Error(`Unknown migration action: ${parsed.action}`);
  const plan = await buildMigrationPlan(target);
  if (parsed.flags.has("--json")) console.log(JSON.stringify(plan, null, 2));
  else {
    console.log(`Migration plan: ${plan.from_version} -> ${plan.to_version}`);
    if (plan.pending.length === 0) console.log("No pending migrations.");
    else for (const entry of plan.pending) console.log(`${entry.id}\t${entry.mode}\t${entry.description}`);
    console.log("Project-owned content changed: no");
    console.log("External action: not performed");
  }
  return 0;
}

async function runLearning(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (["add-lesson", "add-practice"].includes(parsed.action)) {
    const kind = parsed.action === "add-lesson" ? "lesson" : "practice";
    const entry = await withProjectMutationLock(target, () => addLearningEntry(target, kind, {
      title: parsed.options["--title"],
      summary: parsed.options["--summary"],
      confidence: parsed.options["--confidence"],
      tags: listOption(parsed, "--tag"),
      appliesTo: listOption(parsed, "--applies-to"),
      sourceWorkItems: listOption(parsed, "--source-work-item"),
      evidence: listOption(parsed, "--evidence"),
      derivedFrom: listOption(parsed, "--derived-from"),
      ownerPosition: parsed.options["--owner-position"],
      actor: parsed.options["--actor"]
    }));
    printResult(parsed, entry, [`Created ${entry.id}: ${entry.title}`, `Index: .ai-org/learning/index.json`, `Record: ${entry.path}`]);
    return 0;
  }
  if (parsed.action === "revalidate") {
    const entry = await withProjectMutationLock(target, () => revalidateLearningEntry(target, {
      learningId: parsed.options["--learning-id"],
      result: parsed.options["--result"],
      evidence: listOption(parsed, "--evidence"),
      reviewAfter: parsed.options["--review-after"],
      actor: parsed.options["--actor"]
    }));
    printResult(parsed, entry, [`Revalidated ${entry.id}: ${entry.revalidation.last_result}`, `Signal: ${entry.revalidation.signal}`]);
    return 0;
  }
  if (parsed.action === "list") {
    const result = await listLearningEntries(target);
    if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
    else if (result.entries.length === 0) console.log("No project learning recorded.");
    else for (const entry of result.entries) console.log(`${entry.id}\t${entry.status}\t${entry.revalidation.signal}\t${entry.title}`);
    return 0;
  }
  if (parsed.action === "migrate") {
    const result = await withProjectMutationLock(target, () => migrateLearningIndex(target, { dryRun: parsed.flags.has("--dry-run") }));
    printResult(parsed, result, [`Learning index: ${result.from_schema} -> ${result.to_schema}`, `Changed: ${result.changed && !parsed.flags.has("--dry-run") ? "yes" : "no"}`, `Dry run: ${parsed.flags.has("--dry-run") ? "yes" : "no"}`]);
    return 0;
  }
  if (parsed.action === "evaluate") {
    if (!parsed.options["--fixture"]) throw new Error("learning evaluate requires --fixture");
    const report = await evaluateRetrieval(target, parsed.options["--fixture"], { write: !parsed.flags.has("--no-write") });
    if (parsed.flags.has("--json")) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Retrieval evaluation: ${report.summary.passed}/${report.summary.cases} cases`);
      console.log(`Hit rate: ${report.summary.hit_rate_at_limit}; MRR: ${report.summary.mean_reciprocal_rank}`);
      console.log(`Large-repository validation: ${report.large_repository_validation}`);
    }
    return report.summary.passed === report.summary.cases ? 0 : 1;
  }
  throw new Error(`Unknown learning action: ${parsed.action}`);
}

async function runRetrieval(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action !== "show") throw new Error(`Unknown retrieval action: ${parsed.action}`);
  const config = await readRetrievalConfig(target);
  if (parsed.flags.has("--json")) console.log(JSON.stringify(config, null, 2));
  else {
    console.log(`Selected provider: ${config.selected_provider}`);
    console.log(`Local hybrid: ${config.local_hybrid.status} (${config.local_hybrid.privacy}, deterministic fallback=${config.local_hybrid.deterministic_fallback})`);
    console.log("Installed model / embeddings / vector database / daemon: no / no / no / no");
  }
  return 0;
}

async function runAdapter(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "archify-status") {
    const status = await inspectArchifyAdapter(target);
    printResult(parsed, status, [
      `Archify adapter: ${status.status}`,
      `Usable: ${status.usable ? "yes" : "no"}`,
      `Reason: ${status.reason}`,
      "External action: not performed"
    ]);
    return status.status === "invalid" ? 1 : 0;
  }
  if (parsed.action === "archify-install") {
    if (!parsed.options["--source"]) throw new Error("adapter archify-install requires --source");
    const manifest = await withProjectMutationLock(target, () => installArchifyAdapter(target, parsed.options["--source"]));
    printResult(parsed, manifest, [
      `Installed Archify ${manifest.provenance.tag} at ${manifest.provenance.commit}`,
      `Files: ${manifest.files.length}`,
      `Isolation root: ${manifest.isolation_root}`,
      "External action: not performed"
    ]);
    return 0;
  }
  throw new Error(`Unknown adapter action: ${parsed.action}`);
}

async function runWorkItemCreate(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await withProjectMutationLock(target, async () => {
    const created = await createWorkItem(target, {
      title: parsed.options["--title"],
      actor: parsed.options["--actor"],
      scope: listOption(parsed, "--scope"),
      acceptance: listOption(parsed, "--acceptance"),
      affectedPaths: listOption(parsed, "--affected-path"),
      contextRefs: listOption(parsed, "--context-ref"),
      specRefs: parseDocumentReferences(listOption(parsed, "--spec-ref"), "--spec-ref"),
      uxRefs: parseDocumentReferences(listOption(parsed, "--ux-ref"), "--ux-ref"),
      uiRefs: parseDocumentReferences(listOption(parsed, "--ui-ref"), "--ui-ref"),
      contractRefs: parseDocumentReferences(listOption(parsed, "--contract-ref"), "--contract-ref"),
      specificationMode: parsed.options["--spec-mode"],
      uiDeliveryMode: parsed.options["--ui-mode"],
      riskTier: parsed.options["--risk-tier"],
      parentWorkItemId: parsed.options["--parent"],
      dependencies: listOption(parsed, "--depends-on"),
      requiredDisciplines: listOption(parsed, "--discipline"),
      stageRequirements: parseStageRequirements(
        listOption(parsed, "--stage-discipline"),
        listOption(parsed, "--stage-resource"),
        listOption(parsed, "--clear-stage-requirement")
      ),
      baseRevision: parsed.options["--base-revision"],
      integrationOwnerAgentId: parsed.options["--integration-owner"],
      sharedContractRefs: listOption(parsed, "--shared-contract-ref"),
      contractStatus: parsed.options["--contract-status"],
      overlapResolution: listOption(parsed, "--overlap-resolution"),
      evidence: listOption(parsed, "--evidence"),
      unresolved: listOption(parsed, "--unresolved"),
      trackerVisibility: parsed.options["--tracker-visibility"]
    });
    await refreshViews(target);
    return created;
  });
  printResult(parsed, result, [
    `Created ${result.item.id}: ${result.item.title}`,
    `State: ${result.item.state} (${result.item.owner_position})`,
    `Suggested Codex title: ${result.suggested_title}`
  ]);
  return 0;
}

async function runCollaboration(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "show") {
    const document = await readCollaborationState(target);
    printResult(parsed, document, [
      `Profile: ${document.profile}`,
      `Human Principals: ${(document.principals ?? []).length}`,
      `Sponsorships: ${(document.sponsorships ?? []).length}`,
      `Position memberships: ${(document.memberships ?? []).filter((entry) => entry.active !== false).length}`,
      `Large-scale validation: ${document.large_scale_validation?.status ?? "not_run"}`
    ]);
    return 0;
  }
  const result = await withProjectMutationLock(target, async () => {
    let changed;
    if (parsed.action === "set-profile") {
      changed = await setCollaborationProfile(target, parsed.options["--profile"]);
    } else if (parsed.action === "add-principal") {
      changed = await addPrincipal(target, {
        principalId: parsed.options["--principal-id"],
        displayName: parsed.options["--name"]
      });
    } else if (parsed.action === "add-agent") {
      changed = await addAgentIdentity(target, {
        agentId: parsed.options["--agent-id"],
        displayName: parsed.options["--name"]
      });
    } else if (parsed.action === "sponsor") {
      changed = await sponsorAgent(target, {
        principalId: parsed.options["--principal-id"],
        agentId: parsed.options["--agent-id"]
      });
    } else if (parsed.action === "add-membership") {
      changed = await addMembership(target, {
        agentId: parsed.options["--agent-id"],
        positionId: parsed.options["--position"],
        disciplines: listOption(parsed, "--discipline")
      });
    } else {
      throw new Error(`Unknown collaboration action: ${parsed.action}`);
    }
    await refreshViews(target);
    return changed;
  });
  printResult(parsed, result, [`Updated collaboration state: ${parsed.action}`]);
  return 0;
}

async function runWorkItemConfigure(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await withProjectMutationLock(target, async () => {
    const configured = await configureWorkItem(target, {
      workItemId: parsed.options["--work-item"],
      actor: parsed.options["--actor"],
      parentWorkItemId: parsed.options["--parent"],
      dependencies: parsed.options["--depends-on"] === undefined ? undefined : listOption(parsed, "--depends-on"),
      requiredDisciplines: parsed.options["--discipline"] === undefined ? undefined : listOption(parsed, "--discipline"),
      stageRequirements: parseStageRequirements(
        listOption(parsed, "--stage-discipline"),
        listOption(parsed, "--stage-resource"),
        listOption(parsed, "--clear-stage-requirement")
      ),
      baseRevision: parsed.options["--base-revision"],
      parallelMode: parsed.options["--parallel-mode"],
      integrationOwnerAgentId: parsed.options["--integration-owner"],
      agentId: parsed.options["--agent-id"],
      sharedContractRefs:
        parsed.options["--shared-contract-ref"] === undefined ? undefined : listOption(parsed, "--shared-contract-ref"),
      contractStatus: parsed.options["--contract-status"],
      overlapResolution:
        parsed.options["--overlap-resolution"] === undefined ? undefined : listOption(parsed, "--overlap-resolution"),
      specRefs:
        parsed.options["--spec-ref"] === undefined
          ? undefined
          : parseDocumentReferences(listOption(parsed, "--spec-ref"), "--spec-ref"),
      replaceSpecRefs: parsed.flags.has("--replace-spec-refs"),
      uxRefs:
        parsed.options["--ux-ref"] === undefined
          ? undefined
          : parseDocumentReferences(listOption(parsed, "--ux-ref"), "--ux-ref"),
      replaceUxRefs: parsed.flags.has("--replace-ux-refs"),
      uiRefs:
        parsed.options["--ui-ref"] === undefined
          ? undefined
          : parseDocumentReferences(listOption(parsed, "--ui-ref"), "--ui-ref"),
      replaceUiRefs: parsed.flags.has("--replace-ui-refs"),
      contractRefs:
        parsed.options["--contract-ref"] === undefined
          ? undefined
          : parseDocumentReferences(listOption(parsed, "--contract-ref"), "--contract-ref"),
      replaceContractRefs: parsed.flags.has("--replace-contract-refs"),
      specificationMode: parsed.options["--spec-mode"],
      uiDeliveryMode: parsed.options["--ui-mode"]
    });
    await refreshViews(target);
    return configured;
  });
  printResult(parsed, result, [
    `Configured ${result.item.id}: ${result.item.parallel_mode}`,
    `Parallel ready: ${result.readiness.ready ? "yes" : "no"}`,
    `Recommendation: ${result.readiness.recommended_mode}`
  ]);
  return 0;
}

async function runWorkItemClaim(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await withProjectMutationLock(target, async () => {
    const claimed = await claimWorkItem(target, {
      workItemId: parsed.options["--work-item"],
      agentId: parsed.options["--agent-id"],
      principalId: parsed.options["--principal-id"],
      baseRevision: parsed.options["--base-revision"],
      branch: parsed.options["--branch"],
      worktree: parsed.options["--worktree"]
    });
    await refreshViews(target);
    return claimed;
  });
  printResult(parsed, result, [
    `Claimed ${result.item.id}: ${result.item.claim.id}`,
    `Agent: ${result.item.claim.agent_id}`,
    `Principal: ${result.item.claim.principal_id}`,
    `Base revision: ${result.item.claim.base_revision}`
  ]);
  return 0;
}

async function runWorkItemRelease(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const item = await withProjectMutationLock(target, async () => {
    const released = await releaseWorkItemClaim(target, {
      workItemId: parsed.options["--work-item"],
      agentId: parsed.options["--agent-id"],
      principalId: parsed.options["--principal-id"],
      reason: parsed.options["--reason"]
    });
    await refreshViews(target);
    return released;
  });
  printResult(parsed, item, [`Released ${item.id}: ${item.claim.id}`, `Reason: ${item.claim.release_reason}`]);
  return 0;
}

async function runParallel(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "prepare") {
    const prepared = await withProjectMutationLock(target, async () => {
      const result = await prepareWorkerDispatch(target, {
        workItemId: parsed.options["--work-item"],
        agentId: parsed.options["--agent-id"],
        principalId: parsed.options["--principal-id"],
        baseRevision: parsed.options["--base-revision"],
        branch: parsed.options["--branch"],
        worktree: parsed.options["--worktree"],
        runtimeKind: parsed.options["--runtime-kind"]
      });
      await refreshViews(target);
      return result;
    });
    printResult(parsed, prepared, [
      `Prepared ${prepared.worker.id} for ${prepared.worker.work_item_id}`,
      `Runtime kind: ${prepared.worker.runtime_kind}`,
      `Claim: ${prepared.claim.id}`,
      prepared.instruction
    ]);
    return 0;
  }
  if (parsed.action === "plan") {
    const plan = await buildParallelPlan(target, {
      parentWorkItemId: parsed.options["--parent"],
      maxWorkers: optionalPositiveIntegerOption(parsed, "--max-workers")
    });
    let outputPath = null;
    if (!parsed.flags.has("--no-write")) {
      outputPath = await writeParallelPlan(target, plan);
      await refreshViews(target);
    }
    if (parsed.flags.has("--json")) console.log(JSON.stringify(plan, null, 2));
    else {
      console.log(
        `Parallel plan: ${plan.summary.waves} wave(s), ${plan.summary.dispatchable} dispatchable, ${plan.summary.active} active, ${plan.summary.sequential} sequential, ${plan.summary.blocked} blocked`
      );
      for (const wave of plan.waves) {
        console.log(`[${wave.id}] ${wave.dispatch.map((entry) => entry.work_item_id).join(", ")}`);
      }
      for (const entry of plan.sequential) console.log(`[SEQUENTIAL] ${entry.work_item_id}: ${entry.reasons.join(", ")}`);
      for (const entry of plan.blocked) console.log(`[BLOCKED] ${entry.work_item_id}: ${entry.reasons.join(", ")}`);
      console.log("No Codex task, claim, or external action was performed.");
      if (outputPath) console.log(`Parallel plan: ${path.relative(target, outputPath).split(path.sep).join("/")}`);
    }
    return 0;
  }
  if (parsed.action !== "check") throw new Error(`Unknown parallel action: ${parsed.action}`);
  const result = await evaluateParallelReadiness(target, parsed.options["--work-item"], {
    agentId: parsed.options["--agent-id"]
  });
  if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`${result.work_item_id}: ${result.ready ? "parallel-ready" : result.recommended_mode}`);
    for (const check of result.checks) console.log(`[${check.pass ? "PASS" : "FAIL"}] ${check.id}`);
    for (const overlap of result.overlaps) console.log(`[OVERLAP] ${overlap.work_item_id}: ${overlap.paths.join(", ")}`);
  }
  return result.ready ? 0 : 2;
}

async function runWorker(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "list") {
    const workers = await listRuntimeWorkers(target);
    if (parsed.flags.has("--json")) console.log(JSON.stringify(workers, null, 2));
    else if (workers.length === 0) console.log("No runtime workers registered.");
    else for (const worker of workers) console.log(`${worker.id}\t${worker.runtime_kind}\t${worker.status}\t${worker.work_item_id}`);
    return 0;
  }
  const worker = await withProjectMutationLock(target, async () => {
    let result;
    if (parsed.action === "attach") {
      result = await attachInternalWorker(target, {
        workerId: parsed.options["--worker-id"],
        runtimeId: parsed.options["--runtime-id"]
      });
    } else if (parsed.action === "update") {
      result = await updateRuntimeWorker(target, {
        workerId: parsed.options["--worker-id"],
        status: parsed.options["--status"],
        revision: parsed.options["--revision"],
        evidence: listOption(parsed, "--evidence"),
        actor: parsed.options["--actor"]
      });
    } else throw new Error(`Unknown worker action: ${parsed.action}`);
    await refreshViews(target);
    return result;
  });
  printResult(parsed, worker, [`${worker.id}: ${worker.status}`, `Work Item: ${worker.work_item_id}`]);
  return 0;
}

async function runResource(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "list") {
    const registry = await readResourceRegistry(target);
    printResult(parsed, registry, [
      `Shared resources: ${(registry.resources ?? []).length}`,
      `Active reservations: ${(registry.reservations ?? []).filter((entry) => entry.status === "active").length}`
    ]);
    return 0;
  }
  if (parsed.action !== "define") throw new Error(`Unknown resource action: ${parsed.action}`);
  const result = await withProjectMutationLock(target, async () => {
    const capacity = Number(parsed.options["--capacity"]);
    const defined = await defineResource(target, {
      resourceId: parsed.options["--resource-id"],
      displayName: parsed.options["--name"],
      capacity,
      description: parsed.options["--description"],
      actor: parsed.options["--actor"]
    });
    await refreshViews(target);
    return defined;
  });
  printResult(parsed, result, [`Defined shared resource ${result.id}: capacity ${result.capacity}`]);
  return 0;
}

async function runWorkItemUnresolved(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const resolutions = listOption(parsed, "--resolve");
  const additions = listOption(parsed, "--merge");
  if (resolutions.length === 0 && additions.length === 0) {
    const result = await listUnresolvedItems(target, parsed.options["--work-item"]);
    if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
    else if (result.unresolved.length === 0) console.log(`No unresolved items for ${result.work_item_id}.`);
    else {
      console.log(`${result.work_item_id} unresolved items:`);
      result.unresolved.forEach((entry, index) => console.log(`${index + 1}. ${entry}`));
    }
    return 0;
  }

  const result = await withProjectMutationLock(target, async () => {
    const updated = await updateUnresolvedItems(target, {
      workItemId: parsed.options["--work-item"],
      actor: parsed.options["--actor"],
      resolve: resolutions,
      merge: additions
    });
    if (updated.changed) await refreshViews(target);
    return updated;
  });
  printResult(parsed, result, [
    `${result.item.id} unresolved items: ${result.item.unresolved.length}`,
    `Resolved: ${result.resolved.length ? result.resolved.join(" | ") : "none"}`,
    `Merged: ${result.merged.length ? result.merged.join(" | ") : "none"}`,
    `Changed: ${result.changed ? "yes" : "no"}`
  ]);
  return 0;
}

async function runHandoff(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await withProjectMutationLock(target, async () => {
    const handoff = await createHandoff(target, {
      workItemId: parsed.options["--work-item"],
      toPosition: parsed.options["--to"],
      inputRevision: parsed.options["--input-revision"],
      actor: parsed.options["--actor"],
      completed: listOption(parsed, "--completed"),
      evidence: listOption(parsed, "--evidence"),
      unresolved: listOption(parsed, "--unresolved")
    });
    await refreshViews(target);
    return handoff;
  });
  printResult(parsed, result, [
    `Created handoff: ${result.artifact}`,
    `Next Position: ${result.item.next_position}`,
    `Suggested Codex title: ${result.suggested_title}`
  ]);
  return 0;
}

async function runTransition(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await withProjectMutationLock(target, async () => {
    const transitioned = await transitionWorkItem(target, {
      workItemId: parsed.options["--work-item"],
      toState: parsed.options["--to"],
      actor: parsed.options["--actor"],
      satisfied: parseSatisfied(listOption(parsed, "--satisfy")),
      evidence: listOption(parsed, "--evidence")
    });
    await refreshViews(target);
    return transitioned;
  });
  printResult(parsed, result, [
    `${result.item.id}: ${result.item.state}`,
    `Owner: ${result.item.owner_position} (${result.item.assigned_agent_id})`,
    `Suggested Codex title: ${result.suggested_title}`
  ]);
  return 0;
}

async function runClose(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const result = await withProjectMutationLock(target, async () => {
    const closed = await closeWorkItem(target, {
      workItemId: parsed.options["--work-item"],
      decision: parsed.options["--decision"],
      testedRevision: parsed.options["--tested-revision"],
      approval: parsed.options["--approval"],
      actor: parsed.options["--actor"],
      rollback: listOption(parsed, "--rollback"),
      reason: listOption(parsed, "--reason"),
      evidence: listOption(parsed, "--evidence"),
      satisfied: parseSatisfied(listOption(parsed, "--satisfy"))
    });
    await refreshViews(target);
    return closed;
  });
  printResult(parsed, result, [
    `${result.item.id}: ${result.item.state}`,
    `Release gate: ${result.item.release_gate_result}`,
    `Record: ${result.artifact}`,
    "External release: not performed"
  ]);
  return 0;
}

async function runTask(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "register") {
    const task = await withProjectMutationLock(target, async () => {
      const registered = await registerTask(target, {
        workItemId: parsed.options["--work-item"],
        positionId: parsed.options["--position"],
        threadId: parsed.options["--thread-id"],
        clientThreadId: parsed.options["--client-thread-id"],
        hostId: parsed.options["--host-id"],
        status: parsed.options["--status"],
        revision: parsed.options["--revision"],
        notes: parsed.options["--notes"],
        workerId: parsed.options["--worker-id"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return registered;
    });
    printResult(parsed, task, [
      `Registered ${task.id} for ${task.work_item_id}`,
      `Suggested Codex title: ${task.suggested_title}`,
      `Status: ${task.status}`
    ]);
    return 0;
  }
  if (parsed.action === "update") {
    const task = await withProjectMutationLock(target, async () => {
      const updated = await updateTask(target, {
        taskId: parsed.options["--task-id"],
        status: parsed.options["--status"],
        revision: parsed.options["--revision"],
        notes: parsed.options["--notes"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return updated;
    });
    printResult(parsed, task, [`Updated ${task.id}: ${task.status}`, `Revision: ${task.current_revision ?? "not recorded"}`]);
    return 0;
  }
  if (parsed.action === "list") {
    const tasks = await listTasks(target);
    if (parsed.flags.has("--json")) console.log(JSON.stringify(tasks, null, 2));
    else if (tasks.length === 0) console.log("No Codex tasks registered.");
    else for (const task of tasks) console.log(`${task.id}\t${task.status}\t${task.suggested_title}\tarchive=${task.archive_ready}`);
    return 0;
  }
  throw new Error(`Unknown task action: ${parsed.action}`);
}

async function runTracker(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "show") {
    const config = await readTrackerConfig(target);
    printResult(parsed, config, [
      `Tracker profile: ${config.profile}`,
      `Sync granularity: ${config.sync_granularity}`,
      `Providers: ${(config.providers ?? []).map((provider) => provider.id).join(", ") || "none"}`
    ]);
    return 0;
  }
  if (parsed.action === "configure") {
    const config = await withProjectMutationLock(target, async () => {
      const updated = await configureTracker(target, {
        profile: parsed.options["--tracker-profile"],
        syncGranularity: parsed.options["--sync-granularity"],
        defaultProviderId: parsed.options["--default-provider"],
        providerId: parsed.options["--provider-id"],
        providerKind: parsed.options["--provider-kind"],
        project: parsed.options["--project"],
        baseUrl: parsed.options["--base-url"],
        providerStatus: parsed.options["--provider-status"],
        readPolicy: parsed.options["--read-policy"],
        writePolicy: parsed.options["--write-policy"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return updated;
    });
    printResult(parsed, config, [
      `Tracker profile: ${config.profile}`,
      `Sync granularity: ${config.sync_granularity}`,
      `Default provider: ${config.default_provider_id ?? "none"}`
    ]);
    return 0;
  }
  if (parsed.action === "remove-provider") {
    const config = await withProjectMutationLock(target, async () => {
      const updated = await removeTrackerProvider(target, {
        providerId: parsed.options["--provider-id"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return updated;
    });
    printResult(parsed, config, [`Removed tracker provider`, `Tracker profile: ${config.profile}`]);
    return 0;
  }
  if (parsed.action === "set-visibility") {
    const item = await withProjectMutationLock(target, async () => {
      const updated = await setTrackerVisibility(target, {
        workItemId: parsed.options["--work-item"],
        visibility: parsed.options["--visibility"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return updated;
    });
    printResult(parsed, item, [`${item.id} tracker visibility: ${item.tracker_visibility}`]);
    return 0;
  }
  if (parsed.action === "link") {
    const result = await withProjectMutationLock(target, async () => {
      const linked = await linkTrackerItem(target, {
        workItemId: parsed.options["--work-item"],
        providerId: parsed.options["--provider-id"],
        itemId: parsed.options["--item-id"],
        url: parsed.options["--url"],
        role: parsed.options["--role"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return linked;
    });
    printResult(parsed, result, [
      `Linked ${result.item.id} to ${result.reference.provider_id}:${result.reference.item_id}`,
      `External write: not performed`
    ]);
    return 0;
  }
  if (parsed.action === "unlink") {
    const item = await withProjectMutationLock(target, async () => {
      const updated = await unlinkTrackerItem(target, {
        workItemId: parsed.options["--work-item"],
        providerId: parsed.options["--provider-id"],
        itemId: parsed.options["--item-id"],
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return updated;
    });
    printResult(parsed, item, [`Unlinked tracker item from ${item.id}`, `External write: not performed`]);
    return 0;
  }
  if (["inspect", "plan"].includes(parsed.action)) {
    const result = await inspectAndPlanTrackerItem(target, {
      workItemId: parsed.options["--work-item"],
      providerId: parsed.options["--provider-id"],
      observationPath: parsed.options["--observation"],
      writeView: false
    });
    if (!parsed.flags.has("--no-write")) {
      await withProjectMutationLock(target, async () => {
        await writeTrackerView(target, result.item, result.observation, result.plan);
        await refreshViews(target);
      });
    }
    if (parsed.flags.has("--json")) {
      console.log(JSON.stringify(parsed.action === "inspect" ? result.observation : result.plan, null, 2));
    } else if (parsed.action === "inspect") {
      console.log(`${result.observation.provider_id}:${result.observation.item_id} ${result.observation.status}`);
      console.log(`Title: ${result.observation.title}`);
      console.log(`Revision: ${result.observation.revision}`);
      console.log(`External write: not performed`);
    } else {
      console.log(`${result.plan.work_item_id}: ${result.plan.review_count} tracker action(s)`);
      for (const action of result.plan.actions) console.log(`[${action.severity.toUpperCase()}] ${action.id}: ${action.reason}`);
      console.log(`External write: not performed`);
    }
    return 0;
  }
  if (parsed.action === "reconcile") {
    if (!parsed.options["--observation"]) throw new Error("tracker reconcile requires --observation for reproducible evidence");
    const result = await withProjectMutationLock(target, async () => {
      const reconciled = await reconcileTrackerItem(target, {
        workItemId: parsed.options["--work-item"],
        providerId: parsed.options["--provider-id"],
        observationPath: parsed.options["--observation"],
        resolution: parsed.options["--resolution"],
        reason: listOption(parsed, "--reason").join("; "),
        actor: parsed.options["--actor"]
      });
      await refreshViews(target);
      return reconciled;
    });
    printResult(parsed, result, [
      `Reconciled ${result.item.id}: ${result.resolution}`,
      `Evidence: ${result.artifact}`,
      `External write: not performed`
    ]);
    return 0;
  }
  throw new Error(`Unknown tracker action: ${parsed.action}`);
}

async function runPack(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action === "list") {
    const packs = await listPackState(target);
    if (parsed.flags.has("--json")) console.log(JSON.stringify(packs, null, 2));
    else {
      for (const pack of packs) {
        console.log(
          `${pack.id}\t${pack.installed ? `installed@${pack.installed_version}` : "available"}\t${pack.skills.join(",")}`
        );
      }
    }
    return 0;
  }
  if (!parsed.options["--pack"]) throw new Error(`pack ${parsed.action ?? "command"} requires --pack`);
  if (parsed.action === "install") {
    const plan = await planPackInstall(target, parsed.options["--pack"]);
    console.log(formatPackPlan(plan, "install"));
    if (plan.conflicts.length > 0) return 1;
    if (parsed.flags.has("--dry-run")) {
      console.log("Dry run complete; no files were written.");
      return 0;
    }
    await withProjectMutationLock(target, async () => {
      const lockedPlan = await planPackInstall(target, parsed.options["--pack"]);
      if (lockedPlan.conflicts.length > 0) {
        throw new Error(`Pack installation stopped before writing:\n- ${lockedPlan.conflicts.join("\n- ")}`);
      }
      await executePackInstall(lockedPlan);
      await refreshViews(target);
    });
    const doctor = await runDoctor(target);
    console.log(`Installed optional pack ${parsed.options["--pack"]}.`);
    console.log(formatDoctor(doctor));
    return doctor.healthy ? 0 : 1;
  }
  if (parsed.action === "remove") {
    const plan = await planPackRemove(target, parsed.options["--pack"]);
    console.log(formatPackPlan(plan, "remove"));
    if (plan.conflicts.length > 0) return 1;
    if (parsed.flags.has("--dry-run")) {
      console.log("Dry run complete; no files were written.");
      return 0;
    }
    await withProjectMutationLock(target, async () => {
      const lockedPlan = await planPackRemove(target, parsed.options["--pack"]);
      if (lockedPlan.conflicts.length > 0) {
        throw new Error(`Pack removal stopped before writing:\n- ${lockedPlan.conflicts.join("\n- ")}`);
      }
      await executePackRemove(lockedPlan);
      await refreshViews(target);
    });
    const doctor = await runDoctor(target);
    console.log(`Removed optional pack ${parsed.options["--pack"]}.`);
    console.log(formatDoctor(doctor));
    return doctor.healthy ? 0 : 1;
  }
  throw new Error(`Unknown pack action: ${parsed.action}`);
}

async function runCapability(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const registry = await buildCapabilityRegistry(target);
  if (parsed.action === "list") {
    if (parsed.flags.has("--json")) console.log(JSON.stringify(registry, null, 2));
    else if (registry.capabilities.length === 0) console.log("No repository Skills discovered.");
    else {
      for (const capability of registry.capabilities) {
        console.log(
          `${capability.id}\t${capability.status}\t${capability.distribution}\t${capability.invocation}\t${capability.path}`
        );
      }
    }
    return registry.issues.length ? 1 : 0;
  }
  if (parsed.action === "find") {
    const query = String(parsed.options["--query"] ?? "").trim();
    if (!query) throw new Error("capability find requires --query");
    const results = await findCapabilities(target, {
      query,
      position: parsed.options["--position"],
      limit: positiveIntegerOption(parsed, "--limit"),
      registry
    });
    if (parsed.flags.has("--json")) console.log(JSON.stringify(results, null, 2));
    else if (results.length === 0) console.log("No matching repository capability found.");
    else {
      for (const result of results) {
        console.log(`${result.id}\t${result.score}\t${result.reasons.join(",")}\t${result.source.path}`);
      }
    }
    return registry.issues.length ? 1 : 0;
  }
  throw new Error(`Unknown capability action: ${parsed.action}`);
}

async function runContext(parsed) {
  const target = await assertSafeTarget(parsed.target);
  if (parsed.action !== "resolve") throw new Error(`Unknown context action: ${parsed.action}`);
  if (!parsed.options["--work-item"]) throw new Error("context resolve requires --work-item");
  const capsule = await resolveWorkItemContext(target, {
    workItemId: parsed.options["--work-item"],
    position: parsed.options["--position"],
    query: parsed.options["--query"],
    revision: parsed.options["--revision"],
    limit: positiveIntegerOption(parsed, "--limit")
  });
  const outputPath = parsed.flags.has("--no-write") ? null : await writeContextCapsule(target, capsule);
  if (parsed.flags.has("--json")) console.log(JSON.stringify(capsule, null, 2));
  else {
    console.log(`${capsule.work_item.id} context for ${capsule.position.name} / ${capsule.agent.display_name}`);
    console.log(`Revision: ${capsule.revision ?? "not recorded"}`);
    console.log(`Context routes: ${capsule.context_routes.map((entry) => entry.id).join(", ") || "none"}`);
    console.log(`Learning: ${capsule.learning.map((entry) => entry.id).join(", ") || "none"}`);
    console.log(`Capabilities: ${capsule.capabilities.map((entry) => entry.id).join(", ") || "none"}`);
    console.log(`Affected-path overlaps: ${capsule.affected_path_overlaps.length}`);
    console.log(
      `Parallel execution: ${capsule.parallel_execution.disposition ?? "unplanned"} (fresh=${capsule.parallel_execution.plan_fresh ?? "n/a"})`
    );
    console.log(`Retrieval: ${capsule.retrieval.provider_id} (semantic=${capsule.retrieval.semantic})`);
    if (outputPath) console.log(`Context Capsule: ${path.relative(target, outputPath).split(path.sep).join("/")}`);
    if (capsule.warnings.length) console.log(`Warnings: ${capsule.warnings.join(" | ")}`);
  }
  return 0;
}

export async function main(argv) {
  const parsed = parseCommand(argv);
  if (parsed.command === "help" || parsed.flags.has("--help")) {
    console.log(HELP);
    return 0;
  }
  if (parsed.command === "version") {
    console.log(TEMPLATE_VERSION);
    return 0;
  }
  if (parsed.command === "chamber") {
    console.log(CHAMBER);
    return 0;
  }
  if (parsed.command === "init") return runInit(parsed);
  if (parsed.command === "upgrade") return runUpgrade(parsed);
  if (parsed.command === "backup") return runBackup(parsed);
  if (parsed.command === "restore") return runRestore(parsed);
  if (parsed.command === "doctor") return runDoctorCommand(parsed);
  if (parsed.command === "status") return runStatusCommand(parsed);
  if (parsed.command === "observe") return runObserveCommand(parsed);
  if (parsed.command === "control-plane") return runControlPlane(parsed);
  if (parsed.command === "collaboration") return runCollaboration(parsed);
  if (parsed.command === "work-item" && parsed.action === "create") return runWorkItemCreate(parsed);
  if (parsed.command === "work-item" && parsed.action === "configure") return runWorkItemConfigure(parsed);
  if (parsed.command === "work-item" && parsed.action === "claim") return runWorkItemClaim(parsed);
  if (parsed.command === "work-item" && parsed.action === "release") return runWorkItemRelease(parsed);
  if (parsed.command === "work-item" && parsed.action === "unresolved") return runWorkItemUnresolved(parsed);
  if (parsed.command === "parallel") return runParallel(parsed);
  if (parsed.command === "resource") return runResource(parsed);
  if (parsed.command === "worker") return runWorker(parsed);
  if (parsed.command === "evidence") return runEvidence(parsed);
  if (parsed.command === "schema") return runSchema(parsed);
  if (parsed.command === "migration") return runMigration(parsed);
  if (parsed.command === "learning") return runLearning(parsed);
  if (parsed.command === "retrieval") return runRetrieval(parsed);
  if (parsed.command === "adapter") return runAdapter(parsed);
  if (parsed.command === "handoff") return runHandoff(parsed);
  if (parsed.command === "transition") return runTransition(parsed);
  if (parsed.command === "close") return runClose(parsed);
  if (parsed.command === "task") return runTask(parsed);
  if (parsed.command === "tracker") return runTracker(parsed);
  if (parsed.command === "pack") return runPack(parsed);
  if (parsed.command === "capability") return runCapability(parsed);
  if (parsed.command === "context") return runContext(parsed);
  throw new Error(`Unknown command: ${parsed.command}${parsed.action ? ` ${parsed.action}` : ""}\n\n${HELP}`);
}
