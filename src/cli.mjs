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
  temple init [target] [--config path] [--dry-run] [--integrate-agents]
  temple upgrade [target] [--dry-run]
  temple doctor [target] [--json]
  temple status [target] [--json] [--no-write]
  temple collaboration show [target] [--json]
  temple collaboration set-profile [target] --profile solo|collaborative
  temple collaboration add-principal [target] --principal-id principal-name --name "Human Name"
  temple collaboration add-agent [target] --agent-id agent-name --name "Agent Name"
  temple collaboration sponsor [target] --principal-id principal-name --agent-id agent-name
  temple collaboration add-membership [target] --agent-id agent-name --position developer [--discipline backend]
  temple work-item create [target] --title text [--scope text] [--acceptance text] [--affected-path path] [--context-ref id] [--spec-mode gate-evidence|indexed] [--spec-ref ID@revision] [--ui-mode mode] [--tracker-visibility internal|team-visible]
  temple work-item configure [target] --work-item WI-ID [--parent WI-ID] [--depends-on WI-ID] [--agent-id agent-name] [--discipline backend] [--base-revision ref] [--parallel-mode mode] [--spec-ref ID@revision] [--replace-spec-refs]
  temple work-item claim [target] --work-item WI-ID --agent-id agent-name --principal-id principal-name --base-revision ref --branch name [--worktree path]
  temple work-item release [target] --work-item WI-ID [--agent-id agent-name] [--principal-id principal-name] [--reason text]
  temple work-item unresolved [target] --work-item WI-0001 [--resolve text] [--merge text]
  temple parallel check [target] --work-item WI-ID [--agent-id agent-name] [--json]
  temple handoff [target] --work-item WI-0001 --to position --input-revision ref --completed text --evidence ref
  temple transition [target] --work-item WI-0001 --to state --satisfy requirement=reference
  temple close [target] --work-item WI-0001 --decision go|no-go --tested-revision ref --rollback text --approval record
  temple task register [target] --work-item WI-0001 --position developer --thread-id id
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
  doctor      Validate managed files, identities, work items, tasks, and integrations.
  status      Rebuild the observable project status from canonical files.
  collaboration Configure Human Principals, Agent sponsorship, Position membership, and the operating profile.
  work-item   Create and configure work items, revisioned contracts, UI mode, claims, and unresolved items.
  parallel    Evaluate whether a work item is safe to execute concurrently.
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
--contract-ref, --rollback, --reason, or --satisfy as needed. Configure merges document refs by ID;
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
  "--json",
  "--no-write",
  "--help",
  "--replace-spec-refs",
  "--replace-ux-refs",
  "--replace-ui-refs",
  "--replace-contract-refs"
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
  "--resolution"
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
  "--depends-on",
  "--shared-contract-ref",
  "--overlap-resolution"
]);
const NESTED_COMMANDS = new Set(["work-item", "task", "tracker", "pack", "capability", "context", "collaboration", "parallel"]);

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
  const invocation = [process.execPath, path.resolve(process.argv[1]), command, path.resolve(target)]
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

function printResult(parsed, result, lines) {
  if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
  else console.log(lines.join("\n"));
}

async function runInit(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const config = await validateInitConfig(await loadConfig(parsed.options["--config"], target));
  const options = { integrateAgents: parsed.flags.has("--integrate-agents") };
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
      parentWorkItemId: parsed.options["--parent"],
      dependencies: listOption(parsed, "--depends-on"),
      requiredDisciplines: listOption(parsed, "--discipline"),
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
  if (parsed.action !== "check") throw new Error(`Unknown parallel action: ${parsed.action}`);
  const target = await assertSafeTarget(parsed.target);
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
  if (parsed.command === "doctor") return runDoctorCommand(parsed);
  if (parsed.command === "status") return runStatusCommand(parsed);
  if (parsed.command === "collaboration") return runCollaboration(parsed);
  if (parsed.command === "work-item" && parsed.action === "create") return runWorkItemCreate(parsed);
  if (parsed.command === "work-item" && parsed.action === "configure") return runWorkItemConfigure(parsed);
  if (parsed.command === "work-item" && parsed.action === "claim") return runWorkItemClaim(parsed);
  if (parsed.command === "work-item" && parsed.action === "release") return runWorkItemRelease(parsed);
  if (parsed.command === "work-item" && parsed.action === "unresolved") return runWorkItemUnresolved(parsed);
  if (parsed.command === "parallel") return runParallel(parsed);
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
