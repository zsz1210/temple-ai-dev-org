import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { LEAN_ASSIGNMENT_SLOTS, TEMPLATE_VERSION } from "./constants.mjs";
import { runDoctor, formatDoctor } from "./doctor.mjs";
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
import { executeUpgrade, formatUpgradePlan, planUpgrade } from "./upgrade.mjs";
import {
  closeWorkItem,
  createHandoff,
  createWorkItem,
  listUnresolvedItems,
  transitionWorkItem,
  updateUnresolvedItems
} from "./work-items.mjs";

const HELP = `Temple ${TEMPLATE_VERSION}

Usage:
  temple init [target] [--config path] [--dry-run] [--integrate-agents]
  temple upgrade [target] [--dry-run]
  temple doctor [target] [--json]
  temple status [target] [--json] [--no-write]
  temple work-item create [target] --title text [--scope text] [--acceptance text]
  temple work-item unresolved [target] --work-item WI-0001 [--resolve text] [--merge text]
  temple handoff [target] --work-item WI-0001 --to position --input-revision ref --completed text --evidence ref
  temple transition [target] --work-item WI-0001 --to state --satisfy requirement=reference
  temple close [target] --work-item WI-0001 --decision go|no-go --tested-revision ref --rollback text --approval record
  temple task register [target] --work-item WI-0001 --position developer --thread-id id
  temple task update [target] --task-id task-0001 --status completed
  temple task list [target] [--json]
  temple pack list [target] [--json]
  temple pack install [target] --pack build-quality [--dry-run]
  temple pack remove [target] --pack build-quality [--dry-run]
  temple --version

Core commands:
  init        Install Temple and project-specific Agent Identities.
  upgrade     Update only checksum-clean managed files; preserve project-owned state.
  doctor      Validate managed files, identities, work items, tasks, and integrations.
  status      Rebuild the observable project status from canonical files.
  work-item   Create work items and safely manage their unresolved-item lifecycle.
  handoff     Create an evidence-bearing Position handoff artifact.
  transition  Enforce the workflow edge and its named gate requirements.
  close       Record release readiness and close or block a release-gate item.
  task        Register Codex task/thread identity, status, revision, and archive readiness.
  pack        List, install, or remove checksum-managed optional Skill packs.

Repeat --scope, --acceptance, --completed, --evidence, --unresolved, --resolve,
--merge, --rollback, --reason, or --satisfy as needed. Temple never creates, renames, or archives a
Codex task by itself; task registry entries make those app actions observable.
`;

const BOOLEAN_FLAGS = new Set(["--dry-run", "--integrate-agents", "--json", "--no-write", "--help"]);
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
  "--scope",
  "--acceptance",
  "--completed",
  "--evidence",
  "--unresolved",
  "--resolve",
  "--merge",
  "--rollback",
  "--reason",
  "--satisfy"
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
  "--satisfy"
]);
const NESTED_COMMANDS = new Set(["work-item", "task", "pack"]);

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

async function refreshStatus(target) {
  const status = await buildStatus(target);
  await writeStatus(target, status);
  return status;
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
    const lockedStatusPath = await writeStatus(target, await buildStatus(target));
    return { doctor: lockedDoctor, statusPath: lockedStatusPath };
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
    await refreshStatus(target);
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
  const status = await buildStatus(target);
  if (!parsed.flags.has("--no-write")) await writeStatus(target, status);
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
      evidence: listOption(parsed, "--evidence"),
      unresolved: listOption(parsed, "--unresolved")
    });
    await refreshStatus(target);
    return created;
  });
  printResult(parsed, result, [
    `Created ${result.item.id}: ${result.item.title}`,
    `State: ${result.item.state} (${result.item.owner_position})`,
    `Suggested Codex title: ${result.suggested_title}`
  ]);
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
    if (updated.changed) await refreshStatus(target);
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
    await refreshStatus(target);
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
    await refreshStatus(target);
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
    await refreshStatus(target);
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
      await refreshStatus(target);
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
      await refreshStatus(target);
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
      await refreshStatus(target);
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
      await refreshStatus(target);
    });
    const doctor = await runDoctor(target);
    console.log(`Removed optional pack ${parsed.options["--pack"]}.`);
    console.log(formatDoctor(doctor));
    return doctor.healthy ? 0 : 1;
  }
  throw new Error(`Unknown pack action: ${parsed.action}`);
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
  if (parsed.command === "init") return runInit(parsed);
  if (parsed.command === "upgrade") return runUpgrade(parsed);
  if (parsed.command === "doctor") return runDoctorCommand(parsed);
  if (parsed.command === "status") return runStatusCommand(parsed);
  if (parsed.command === "work-item" && parsed.action === "create") return runWorkItemCreate(parsed);
  if (parsed.command === "work-item" && parsed.action === "unresolved") return runWorkItemUnresolved(parsed);
  if (parsed.command === "handoff") return runHandoff(parsed);
  if (parsed.command === "transition") return runTransition(parsed);
  if (parsed.command === "close") return runClose(parsed);
  if (parsed.command === "task") return runTask(parsed);
  if (parsed.command === "pack") return runPack(parsed);
  throw new Error(`Unknown command: ${parsed.command}${parsed.action ? ` ${parsed.action}` : ""}\n\n${HELP}`);
}
