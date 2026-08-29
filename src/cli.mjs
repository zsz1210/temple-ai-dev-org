import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { LEAN_ASSIGNMENT_SLOTS, TEMPLATE_VERSION } from "./constants.mjs";
import { runDoctor, formatDoctor } from "./doctor.mjs";
import { assertSafeTarget, readJson } from "./files.mjs";
import { executeInit, formatInitPlan, planInit } from "./install.mjs";
import { validateInitConfig } from "./model.mjs";
import { buildStatus, writeStatus } from "./status.mjs";

const HELP = `Temple ${TEMPLATE_VERSION}

Usage:
  temple init [target] [--config path] [--dry-run] [--integrate-agents]
  temple doctor [target] [--json]
  temple status [target] [--json] [--no-write]
  temple --version

Commands:
  init     Install the organization template and project-specific identities.
  doctor   Validate managed files, identity/assignment rules, and integrations.
  status   Project canonical state into a readable status view.

Run init with --config for AI-suggested names. Without --config, an interactive
terminal asks for five manually chosen English names. Existing user files are
not overwritten; use --integrate-agents only after approving an append to an
existing root AGENTS.md.
`;

function parseCommand(argv) {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    return { command: "help", target: ".", flags: new Set(), options: {} };
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    return { command: "version", target: ".", flags: new Set(), options: {} };
  }

  const command = argv[0];
  const flags = new Set();
  const options = {};
  const positionals = [];
  const booleanFlags = new Set(["--dry-run", "--integrate-agents", "--json", "--no-write", "--help"]);
  const valueFlags = new Set(["--config"]);

  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (booleanFlags.has(token)) {
      flags.add(token);
    } else if (valueFlags.has(token)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${token} requires a value`);
      }
      options[token] = value;
      index += 1;
    } else if (token.startsWith("--")) {
      throw new Error(`Unknown option: ${token}`);
    } else {
      positionals.push(token);
    }
  }

  if (positionals.length > 1) {
    throw new Error(`Unexpected arguments: ${positionals.slice(1).join(" ")}`);
  }
  return { command, target: positionals[0] ?? ".", flags, options };
}

function projectIdFromDirectory(target) {
  const fallback = path.basename(path.resolve(target))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return fallback || "software-project";
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
  for await (const chunk of input) {
    content += chunk;
  }
  return JSON.parse(content);
}

async function loadConfig(configPath, target) {
  if (!configPath) {
    return collectInteractiveConfig(target);
  }
  if (configPath === "-") {
    return readStandardInput();
  }
  return readJson(path.resolve(configPath));
}

async function runInit(parsed) {
  const target = await assertSafeTarget(parsed.target);
  const config = await validateInitConfig(await loadConfig(parsed.options["--config"], target));
  const plan = await planInit(target, config, {
    integrateAgents: parsed.flags.has("--integrate-agents")
  });
  console.log(formatInitPlan(plan));

  if (plan.conflicts.length > 0) {
    return 1;
  }
  if (parsed.flags.has("--dry-run")) {
    console.log("Dry run complete; no files were written.");
    return 0;
  }

  await executeInit(plan);
  const doctor = await runDoctor(target);
  const status = await buildStatus(target);
  const statusPath = await writeStatus(target, status);
  console.log(`Initialized Temple ${TEMPLATE_VERSION}.`);
  console.log(formatDoctor(doctor));
  console.log(`Status view: ${statusPath}`);
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
  if (!parsed.flags.has("--no-write")) {
    await writeStatus(target, status);
  }
  if (parsed.flags.has("--json")) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    const { renderStatusMarkdown } = await import("./status.mjs");
    console.log(renderStatusMarkdown(status));
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
  if (parsed.command === "init") {
    return runInit(parsed);
  }
  if (parsed.command === "doctor") {
    return runDoctorCommand(parsed);
  }
  if (parsed.command === "status") {
    return runStatusCommand(parsed);
  }
  throw new Error(`Unknown command: ${parsed.command}\n\n${HELP}`);
}
