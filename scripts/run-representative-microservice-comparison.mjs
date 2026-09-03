#!/usr/bin/env node

import crypto from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

import {
  buildCodexRuntimeRequestResponse,
  createJsonRpcProcess
} from "../src/codex-app-server-provider.mjs";
import {
  commandTextAllowed,
  isolateWave5CodexEnvironment,
  normalizeTokenUsage,
  protocolViolationForMessage,
  terminalFailure,
  WAVE5_ALLOWED_COMMAND_PREFIXES,
  wave5ThreadIsolation
} from "../src/app-server-protocol-replay.mjs";
import { analyzeRepresentativeComparison } from "./analyze-representative-microservice-comparison.mjs";

const execFile = promisify(execFileCallback);
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const fixtureRoot = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/fixture");
const defaultLabRoot = path.join(os.tmpdir(), "temple-wi0136-representative-microservice");
const defaultProtocolPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/live-protocol.json");
const defaultApprovalTemplatePath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/account-approval.template.json");
const priorAblationLabRoots = Object.freeze({
  v7: path.join(os.tmpdir(), "temple-wi0136-context-recovery-qualification-v7"),
  v8: path.join(os.tmpdir(), "temple-wi0136-context-recovery-qualification-v8"),
  v9: path.join(os.tmpdir(), "temple-wi0136-context-recovery-qualification-v9")
});
const defaultAblationLabRoot = path.join(os.tmpdir(), "temple-wi0136-context-recovery-qualification-v10");
const defaultAblationProtocolPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/context-ablation-protocol.json");
const defaultAblationApprovalTemplatePath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/context-ablation-approval.template.json");
const defaultAblationApprovalPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/context-ablation-approval.json");
const services = Object.freeze(["gateway", "catalog", "orders", "notifications"]);
const repositories = Object.freeze([...services, "coordinator"]);
const arms = Object.freeze(["minimal-responsible", "temple"]);
const integrationSliceIds = Object.freeze(["orders-catalog", "notifications", "gateway"]);
const ablationConditionDefinitions = Object.freeze([
  Object.freeze({ id: "terra-routed", context_strategy: "routed", model: "gpt-5.6-terra", reasoning_effort: "medium", operational_token_limit: 80000 }),
  Object.freeze({ id: "terra-full-load", context_strategy: "full-load", model: "gpt-5.6-terra", reasoning_effort: "medium", operational_token_limit: 120000 })
]);
const ablationConditions = Object.freeze(ablationConditionDefinitions.map((entry) => entry.id));

function ablationConditionDefinition(id) {
  const definition = ablationConditionDefinitions.find((entry) => entry.id === id);
  if (!definition) throw new Error(`unknown diagnostic condition: ${id}`);
  return definition;
}
const repositoryScopedGitReadPrefixes = Object.freeze(repositories.flatMap((repositoryId) =>
  ["status", "diff", "rev-parse", "log", "ls-tree"].map((subcommand) =>
    Object.freeze(["git", "-C", repositoryId, subcommand])
  )
));
export const comparisonAllowedCommandPrefixes = Object.freeze([
  ...WAVE5_ALLOWED_COMMAND_PREFIXES,
  Object.freeze(["git", "rev-parse"]),
  Object.freeze(["git", "log"]),
  Object.freeze(["git", "ls-tree"]),
  ...repositoryScopedGitReadPrefixes
]);
const fixedGitEnvironment = Object.freeze({
  GIT_AUTHOR_NAME: "Temple Representative Fixture",
  GIT_AUTHOR_EMAIL: "wi-0136@temple.invalid",
  GIT_COMMITTER_NAME: "Temple Representative Fixture",
  GIT_COMMITTER_EMAIL: "wi-0136@temple.invalid",
  GIT_AUTHOR_DATE: "2026-09-03T00:00:00Z",
  GIT_COMMITTER_DATE: "2026-09-03T00:00:00Z"
});

function parseArguments(argv) {
  const command = argv[0];
  const commands = [
    "setup", "freeze", "preflight", "inspect", "run", "evaluate", "report",
    "ablation-setup", "ablation-freeze", "ablation-preflight", "ablation-inspect", "ablation-run", "ablation-report"
  ];
  if (!command || !commands.includes(command)) {
    throw new Error(`Usage: run-representative-microservice-comparison.mjs ${commands.join("|")} [--lab path] [--protocol path] [--approval path]`);
  }
  const value = (name, fallback) => {
    const index = argv.indexOf(name);
    if (index < 0) return fallback;
    const result = argv[index + 1];
    if (!result || result.startsWith("--")) throw new Error(`${name} requires a value`);
    return path.resolve(result);
  };
  const allowed = new Set([command, "--lab", "--protocol", "--approval"]);
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!allowed.has(argument)) throw new Error(`unsupported argument: ${argument}`);
    if (argument.startsWith("--")) index += 1;
  }
  const ablation = command.startsWith("ablation-");
  return {
    command,
    labRoot: value("--lab", ablation ? defaultAblationLabRoot : defaultLabRoot),
    protocolPath: value("--protocol", ablation ? defaultAblationProtocolPath : defaultProtocolPath),
    approvalPath: value("--approval", null)
  };
}

async function command(executable, args, options = {}) {
  try {
    const result = await execFile(executable, args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...options
    });
    return { status: 0, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  } catch (error) {
    if (Number.isInteger(error.code)) {
      return {
        status: error.code,
        stdout: String(error.stdout ?? "").trim(),
        stderr: String(error.stderr ?? "").trim()
      };
    }
    throw error;
  }
}

async function checked(executable, args, options = {}) {
  const result = await command(executable, args, options);
  if (result.status !== 0) {
    throw new Error(`${executable} ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

async function git(root, args) {
  return checked("git", ["-C", root, ...args], {
    env: {
      ...process.env,
      ...fixedGitEnvironment,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0"
    }
  });
}

async function writeText(target, value, options = {}) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value.endsWith("\n") ? value : `${value}\n`, {
    encoding: "utf8",
    ...(options.exclusive ? { flag: "wx" } : {})
  });
}

async function writeJson(target, value, options = {}) {
  await writeText(target, `${JSON.stringify(value, null, 2)}\n`, options);
}

async function readJson(target) {
  return JSON.parse(await fs.readFile(target, "utf8"));
}

async function exists(target) {
  return fs.access(target).then(() => true).catch(() => false);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function protocolDigest(protocol) {
  const copy = structuredClone(protocol);
  copy.protocol_sha256 = null;
  return sha256(JSON.stringify(stable(copy)));
}

async function regularFiles(root, relative = "") {
  const entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await regularFiles(root, child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

async function bundleDigest(root, included = null) {
  const files = (included ?? await regularFiles(root)).toSorted((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  const digest = crypto.createHash("sha256");
  for (const relative of files) {
    digest.update(relative);
    digest.update(Buffer.from([0]));
    digest.update(await fs.readFile(path.join(root, relative)));
    digest.update(Buffer.from([0]));
  }
  return digest.digest("hex");
}

async function copyTree(source, destination, filter = () => true, relative = "") {
  for (const entry of await fs.readdir(path.join(source, relative), { withFileTypes: true })) {
    const child = path.posix.join(relative, entry.name);
    if (!filter(child, entry)) continue;
    if (entry.isDirectory()) await copyTree(source, destination, filter, child);
    else if (entry.isFile()) {
      const target = path.join(destination, child);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(path.join(source, child), target, fs.constants.COPYFILE_EXCL);
    }
  }
}

async function initializeProductRepository(root, repositoryId) {
  await fs.mkdir(root, { recursive: true });
  const source = path.join(fixtureRoot, repositoryId);
  if (repositoryId === "coordinator") {
    await copyTree(source, root, (relative) => !relative.startsWith("evaluator-only"));
  } else {
    await copyTree(source, root);
  }
  await fs.copyFile(path.join(fixtureRoot, "task.md"), path.join(root, "TASK.md"), fs.constants.COPYFILE_EXCL);
  await writeText(path.join(root, "README.md"), `# ${repositoryId}\n\nSynthetic local repository for Temple WI-0136. No production or external authority.\n`);
  await checked("git", ["init", "-b", "main", root], { env: { ...process.env, ...fixedGitEnvironment } });
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", `Create ${repositoryId} benchmark baseline`]);
  return git(root, ["rev-parse", "HEAD"]);
}

function templeInitConfig(repositoryId) {
  return {
    schema_version: "temple.init/v1",
    project: {
      id: `wi0136-${repositoryId}`,
      name: `WI-0136 ${repositoryId}`
    },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Mog", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Yuna", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Tidus", positions: ["tech_lead"] },
      { display_name: "Fixture Rikku", positions: ["developer"] },
      { display_name: "Fixture Lulu", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

async function temple(root, args) {
  const launcher = path.join(root, "templew.mjs");
  return checked(process.execPath, [launcher, ...args], {
    cwd: root,
    env: { ...process.env, TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs") }
  });
}

function serviceAffectedPath(repositoryId) {
  return {
    catalog: "src/catalog.mjs",
    orders: "src/order-event.mjs",
    notifications: "src/consumer.mjs",
    gateway: "src/checkout-response.mjs",
    coordinator: "integration-report.json"
  }[repositoryId];
}

async function installTempleOrganization(root, repositoryId, configPath) {
  await writeJson(configPath, templeInitConfig(repositoryId));
  await checked(process.execPath, [path.join(repositoryRoot, "bin/temple.mjs"), "init", root, "--config", configPath], {
    cwd: root,
    env: { ...process.env, TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs") }
  });
  const title = repositoryId === "coordinator"
    ? "Integrate and recover OrderPlaced v2 delivery"
    : `Implement ${repositoryId} OrderPlaced v2 slice`;
  const affectedPath = serviceAffectedPath(repositoryId);
  const createArguments = [
    "work-item", "create", ".",
    "--title", title,
    "--scope", `Complete only the bounded ${repositoryId} responsibility from TASK.md and preserve exact-revision evidence for the next owner.`,
    "--acceptance", "The assigned public tests pass, changed paths remain in scope, and a repository-backed handoff names the exact revision and unresolved work.",
    "--affected-path", affectedPath,
    "--spec-mode", "gate-evidence",
    "--ui-mode", "not-applicable",
    "--workflow-profile", repositoryId === "coordinator" ? "standard" : "lean",
    "--risk-tier", repositoryId === "coordinator" ? "standard" : "low",
    "--scope-class", repositoryId === "coordinator" ? "cross-system" : "bounded",
    "--profile-rationale", repositoryId === "coordinator"
      ? "The coordinator owns the shared cross-repository contract and cold integration, so Standard preserves design and independent evidence boundaries."
      : "The shared contract is already frozen by the coordinator; this repository owns one bounded local slice with no external action.",
    "--profile-evidence", "TASK.md",
    "--tracker-visibility", "internal"
  ];
  if (repositoryId === "coordinator") createArguments.push("--affected-path", "design-record.json");
  await temple(root, createArguments);
  const artifact = path.join(root, ".ai-org/artifacts/WI-0001/delivery-brief.md");
  await writeText(artifact, [
    "# WI-0001 delivery brief",
    "",
    `Repository responsibility: ${repositoryId}.`,
    `Affected path: ${affectedPath}.`,
    "Governing product requirement: TASK.md.",
    "Acceptance: assigned public tests pass; exact revision and unresolved work are handed off.",
    "Risk: local synthetic fixture only; no network, package install, deployment, publication, or external write.",
    ""
  ].join("\n"));
  const beforeTransition = await git(root, ["rev-parse", "HEAD"]);
  await temple(root, [
    "work-item", "configure", ".",
    "--work-item", "WI-0001",
    "--agent-id", repositoryId === "coordinator" ? "agent-fixture-tidus" : "agent-fixture-rikku",
    "--base-revision", beforeTransition,
    "--parallel-mode", "sequential"
  ]);
  if (repositoryId === "coordinator") {
    await temple(root, ["transition", ".", "--work-item", "WI-0001", "--to", "spec", "--satisfy", "work_order=.ai-org/artifacts/WI-0001/delivery-brief.md"]);
    await temple(root, [
      "transition", ".", "--work-item", "WI-0001", "--to", "design",
      "--satisfy", "approved_scope=.ai-org/artifacts/WI-0001/delivery-brief.md",
      "--satisfy", "acceptance_criteria=.ai-org/artifacts/WI-0001/delivery-brief.md"
    ]);
  } else {
    await temple(root, [
      "transition", ".",
      "--work-item", "WI-0001",
      "--to", "build",
      "--satisfy", "work_order=.ai-org/artifacts/WI-0001/delivery-brief.md",
      "--satisfy", "approved_scope=.ai-org/artifacts/WI-0001/delivery-brief.md",
      "--satisfy", "acceptance_criteria=.ai-org/artifacts/WI-0001/delivery-brief.md",
      "--satisfy", "technical_design=.ai-org/artifacts/WI-0001/delivery-brief.md",
      "--satisfy", "risk_review=.ai-org/artifacts/WI-0001/delivery-brief.md",
      "--satisfy", "profile_eligibility=.ai-org/artifacts/WI-0001/delivery-brief.md"
    ]);
  }
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", `Install Temple ${repositoryId} responsibility`]);
  return git(root, ["rev-parse", "HEAD"]);
}

async function installMinimalOrganization(root, repositoryId) {
  await writeText(path.join(root, "organization/WORK_ITEM.md"), [
    `# ${repositoryId} responsibility`,
    "",
    "Governing product requirement: `TASK.md` in the Coordinator repository.",
    `Owned path: \`${serviceAffectedPath(repositoryId)}\`.`,
    "Run the repository public tests, commit the accepted change, and write `organization/HANDOFF.md` with the exact revision, tests, completed work, and unresolved issues.",
    "Do not use conversation memory as state and do not deploy, publish, install packages, or access the network.",
    ""
  ].join("\n"));
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", `Record minimal ${repositoryId} responsibility`]);
  return git(root, ["rev-parse", "HEAD"]);
}

function workItemReference(repositoryId, revision) {
  return { project_id: `wi0136-${repositoryId}`, work_item_id: "WI-0001", revision };
}

function federationRegistry(revisions, observedAt = new Date().toISOString()) {
  const gateway = workItemReference("gateway", revisions.gateway);
  const catalog = workItemReference("catalog", revisions.catalog);
  const orders = workItemReference("orders", revisions.orders);
  const notifications = workItemReference("notifications", revisions.notifications);
  return {
    schema_version: "temple.federation/v1",
    participants: services.map((repositoryId) => ({
      id: `wi0136-${repositoryId}`,
      path: `../${repositoryId}`,
      expected_project_id: `wi0136-${repositoryId}`,
      expected_revision: revisions[repositoryId],
      expected_revision_observed_at: observedAt,
      max_work_items: 10
    })),
    initiatives: [{
      id: "order-placed-v2",
      version: "2.0.0",
      revision: "order-placed-v2",
      work_items: [gateway, catalog, orders, notifications]
    }],
    dependencies: [
      { id: "catalog-before-orders", version: "1", revision: "dependency-1", predecessor: catalog, successor: orders },
      { id: "notifications-before-orders", version: "1", revision: "dependency-1", predecessor: notifications, successor: orders },
      { id: "orders-before-gateway", version: "1", revision: "dependency-1", predecessor: orders, successor: gateway }
    ],
    contracts: [
      {
        id: "catalog-availability",
        kind: "api",
        version: "2.0.0",
        revision: "catalog-availability-v2",
        compatibility: "compatible",
        owner: catalog,
        consumers: [orders]
      },
      {
        id: "order-placed",
        kind: "event",
        version: "2.0.0",
        revision: "order-placed-v2",
        compatibility: "compatible",
        owner: orders,
        consumers: [notifications, gateway]
      }
    ],
    rollout_waves: [
      {
        id: "prepare-consumers",
        version: "1",
        revision: "wave-1",
        order: 1,
        work_items: [notifications, catalog],
        contract_refs: [
          { id: "order-placed", version: "2.0.0", revision: "order-placed-v2" },
          { id: "catalog-availability", version: "2.0.0", revision: "catalog-availability-v2" }
        ]
      },
      {
        id: "publish-producer",
        version: "1",
        revision: "wave-2",
        order: 2,
        work_items: [orders],
        contract_refs: [{ id: "order-placed", version: "2.0.0", revision: "order-placed-v2" }]
      },
      {
        id: "expose-gateway",
        version: "1",
        revision: "wave-3",
        order: 3,
        work_items: [gateway],
        contract_refs: [{ id: "order-placed", version: "2.0.0", revision: "order-placed-v2" }]
      }
    ],
    updated_at: observedAt
  };
}

async function installArmPortfolio(armRoot, armId, revisions) {
  const coordinatorRoot = path.join(armRoot, "coordinator");
  const registry = federationRegistry(revisions);
  if (armId === "temple") {
    await writeJson(path.join(coordinatorRoot, ".ai-org/project/federation.json"), registry);
    const validation = JSON.parse(await temple(coordinatorRoot, ["federation", "validate", ".", "--json"]));
    if (validation.valid !== true) throw new Error(`Temple federation registry invalid: ${JSON.stringify(validation.errors ?? validation)}`);
  } else {
    await writeJson(path.join(coordinatorRoot, "organization/PORTFOLIO.json"), {
      schema_version: "minimal-responsible.portfolio/v1",
      participants: services.map((repositoryId) => ({
        repository: repositoryId,
        revision: revisions[repositoryId],
        responsibility: serviceAffectedPath(repositoryId),
        work_item: `${repositoryId}/organization/WORK_ITEM.md`,
        handoff: `${repositoryId}/organization/HANDOFF.md`
      })),
      contracts: registry.contracts.map((entry) => ({ id: entry.id, version: entry.version, compatibility: entry.compatibility })),
      rollout_order: registry.rollout_waves.map((entry) => entry.id),
      updated_at: registry.updated_at
    });
  }
  await git(coordinatorRoot, ["add", "-A"]);
  await git(coordinatorRoot, ["commit", "-m", `Record ${armId} cross-repository portfolio`]);
  return git(coordinatorRoot, ["rev-parse", "HEAD"]);
}

async function runNodeTests(root, args = ["--test"]) {
  return command(process.execPath, args, { cwd: root, env: { ...process.env, TEMPLE_BENCHMARK_ARM_ROOT: root } });
}

async function startingTestEvidence(armRoot) {
  const publicResults = {};
  for (const repositoryId of services) {
    const result = await command("npm", ["test"], { cwd: path.join(armRoot, repositoryId), env: process.env });
    publicResults[repositoryId] = { exit_code: result.status, output_sha256: sha256(`${result.stdout}\n${result.stderr}`) };
  }
  const publicIntegration = await command("npm", ["test"], { cwd: path.join(armRoot, "coordinator"), env: process.env });
  const heldOut = await runNodeTests(armRoot, ["--test", path.join(fixtureRoot, "coordinator/evaluator-only/held-out-integration.test.mjs")]);
  return {
    public: publicResults,
    public_integration: { exit_code: publicIntegration.status, output_sha256: sha256(`${publicIntegration.stdout}\n${publicIntegration.stderr}`) },
    held_out: { exit_code: heldOut.status, output_sha256: sha256(`${heldOut.stdout}\n${heldOut.stderr}`) }
  };
}

async function validateGoldenFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0136-golden-"));
  try {
    for (const repositoryId of services) {
      const target = path.join(root, repositoryId);
      await copyTree(path.join(fixtureRoot, repositoryId), target);
      await fs.copyFile(
        path.join(fixtureRoot, "evaluator-only/golden", `${serviceAffectedPath(repositoryId).split("/").at(-1)}`),
        path.join(target, serviceAffectedPath(repositoryId))
      );
    }
    await copyTree(path.join(fixtureRoot, "coordinator"), path.join(root, "coordinator"), (relative) => !relative.startsWith("evaluator-only"));
    const result = await objectiveTests(root);
    return {
      pass: result.pass,
      service_exit_codes: Object.fromEntries(Object.entries(result.services).map(([id, entry]) => [id, entry.exit_code])),
      public_integration_exit_code: result.public_integration.exit_code,
      held_out_exit_code: result.held_out.exit_code
    };
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function repositorySnapshot(root) {
  return {
    revision: await git(root, ["rev-parse", "HEAD"]),
    tree: await git(root, ["rev-parse", "HEAD^{tree}"]),
    clean: (await git(root, ["status", "--porcelain=v1", "--untracked-files=all"])) === "",
    bytes: (await Promise.all((await regularFiles(root)).filter((entry) => !entry.startsWith(".git/")).map(async (entry) => (await fs.stat(path.join(root, entry))).size))).reduce((sum, value) => sum + value, 0)
  };
}

async function createArm(labRoot, armId, organizationMode = armId) {
  const armRoot = path.join(labRoot, "arms", armId);
  await fs.mkdir(armRoot, { recursive: true });
  await writeText(path.join(armRoot, ".gitignore"), `${repositories.map((entry) => `${entry}/`).join("\n")}\n`);
  await writeText(path.join(armRoot, "ARM.md"), `# ${armId}\n\nThis umbrella repository bounds one isolated WI-0136 experiment arm. Product state lives in the ignored child Git repositories.\n`);
  await checked("git", ["init", "-b", "main", armRoot], { env: { ...process.env, ...fixedGitEnvironment } });
  await git(armRoot, ["add", ".gitignore", "ARM.md"]);
  await git(armRoot, ["commit", "-m", `Create ${armId} experiment workspace`]);
  const productRevisions = {};
  for (const repositoryId of repositories) {
    productRevisions[repositoryId] = await initializeProductRepository(path.join(armRoot, repositoryId), repositoryId);
  }
  const organizationRevisions = {};
  for (const repositoryId of repositories) {
    const root = path.join(armRoot, repositoryId);
    if (organizationMode === "temple") {
      const configPath = path.join(labRoot, "config", `${repositoryId}-temple-init.json`);
      organizationRevisions[repositoryId] = await installTempleOrganization(root, repositoryId, configPath);
    } else {
      organizationRevisions[repositoryId] = await installMinimalOrganization(root, repositoryId);
    }
  }
  organizationRevisions.coordinator = await installArmPortfolio(armRoot, organizationMode, Object.fromEntries(services.map((repositoryId) => [repositoryId, organizationRevisions[repositoryId]])));
  return {
    id: armId,
    organization_mode: organizationMode,
    root: armRoot,
    product_revisions: productRevisions,
    organization_revisions: organizationRevisions,
    starting_tests: await startingTestEvidence(armRoot),
    repositories: Object.fromEntries(await Promise.all(repositories.map(async (repositoryId) => [repositoryId, await repositorySnapshot(path.join(armRoot, repositoryId))])))
  };
}

function productParity(armResults) {
  const baseline = armResults[0].product_revisions;
  return armResults.every((arm) => JSON.stringify(arm.product_revisions) === JSON.stringify(baseline));
}

async function sourceDigests() {
  const publicFiles = [];
  const hiddenFiles = [];
  for (const relative of await regularFiles(fixtureRoot)) {
    if (relative.startsWith("coordinator/evaluator-only/")) hiddenFiles.push(relative);
    else if (relative.endsWith(".test.mjs")) publicFiles.push(relative);
  }
  return {
    fixture_sha256: await bundleDigest(fixtureRoot),
    runner_sha256: sha256(await fs.readFile(import.meta.filename)),
    analyzer_sha256: sha256(await fs.readFile(new URL("./analyze-representative-microservice-comparison.mjs", import.meta.url))),
    task_sha256: sha256(await fs.readFile(path.join(fixtureRoot, "task.md"))),
    public_tests_sha256: await bundleDigest(fixtureRoot, publicFiles),
    held_out_tests_sha256: await bundleDigest(fixtureRoot, hiddenFiles),
    tool_policy_sha256: sha256(await fs.readFile(path.join(fixtureRoot, "tool-policy.json"))),
    rubric_sha256: sha256(await fs.readFile(path.join(fixtureRoot, "rubric.json")))
  };
}

function buildProtocol(manifest) {
  const protocol = {
    schema_version: "temple.representative-microservice-comparison/v3",
    protocol_revision: 5,
    work_item_id: "WI-0136",
    status: "generation-disabled",
    protocol_sha256: null,
    fixture: manifest.source_digests,
    lab_manifest_sha256: manifest.manifest_sha256,
    arms: manifest.arms.map((arm) => ({
      id: arm.id,
      product_revisions: arm.product_revisions,
      organization_revisions: arm.organization_revisions
    })),
    execution: {
      arm_order: ["minimal-responsible", "temple"],
      candidate_turns: 10,
      evaluator_turns: 1,
      build_wave_concurrency: 3,
      retry_count: 0,
      fallback_count: 0,
      network_access: false,
      generation_ready: false,
      exact_approval_required: true,
      design_operational_token_limit: null,
      build_operational_token_limit: null,
      integration_operational_token_limit: null,
      candidate_aggregate_operational_token_limit: null,
      evaluator_operational_token_limit: null,
      combined_operational_token_limit: null,
      program_wall_clock_limit_ms: null
    },
    model_route: {
      design: { model: "gpt-5.6-sol", reasoning_effort: "xhigh" },
      build: { model: "gpt-5.6-terra", reasoning_effort: "medium" },
      integration: { model: "gpt-5.6-terra", reasoning_effort: "medium" },
      evaluator: { model: "gpt-5.6-sol", reasoning_effort: "xhigh" }
    },
    context_policy: {
      known_bounded_work_item_start: "context-capsule-first",
      canonical_source_bodies_required: true,
      route_metadata_is_authority: false,
      temple_md_fallback_when_missing: ["authority", "current-state", "safe-next-action"],
      new_unknown_recovery_start: "temple-md-first"
    },
    predecessor: {
      protocol_sha256: "b01f96b48bb585e4b24390fa0b0c322d2abfc03d8f99650fa9b07a3da4932c71",
      disposition: "stopped-temple-design-operational-token-limit",
      stopped_run: ".ai-org/artifacts/WI-0136/representative-main-v4-stopped-run.json",
      stop_report: ".ai-org/artifacts/WI-0136/representative-main-v4-stop-report.md"
    },
    stopped_evidence_policy: "completed-and-active-stage-observations-v2",
    stop_rules: {
      protocol_mismatch: true,
      model_reroute: true,
      provider_approval_request: true,
      command_policy_violation: true,
      out_of_scope_write: true,
      missing_usage: true,
      malformed_completion: true,
      token_limit: true,
      wall_clock_limit: true
    },
    claims: {
      statistical_generalization: false,
      automatic_routing_authority: false,
      monetary_cost_known: false,
      raw_prompts_retained: false,
      raw_responses_retained: false,
      hidden_reasoning_retained: false
    }
  };
  protocol.protocol_sha256 = protocolDigest(protocol);
  return protocol;
}

export function validateRepresentativeProtocol(protocol) {
  const errors = [];
  if (protocol?.schema_version !== "temple.representative-microservice-comparison/v3") errors.push("unsupported schema");
  if (protocol?.protocol_revision !== 5) errors.push("unexpected protocol revision");
  if (protocol?.work_item_id !== "WI-0136") errors.push("unexpected work item");
  if (protocol?.status !== "generation-disabled") errors.push("protocol status must remain generation-disabled before exact approval");
  if (protocol?.protocol_sha256 !== protocolDigest(protocol)) errors.push("protocol digest mismatch");
  const armIds = protocol?.arms?.map((arm) => arm.id).toSorted() ?? [];
  if (JSON.stringify(armIds) !== JSON.stringify([...arms].toSorted())) errors.push("two exact arms are required");
  if (protocol?.arms?.length === 2 && JSON.stringify(protocol.arms[0].product_revisions) !== JSON.stringify(protocol.arms[1].product_revisions)) {
    errors.push("product revisions are not matched");
  }
  const execution = protocol?.execution ?? {};
  if (execution.candidate_turns !== 10 || execution.evaluator_turns !== 1 || execution.build_wave_concurrency !== 3) errors.push("execution shape mismatch");
  if (execution.retry_count !== 0 || execution.fallback_count !== 0 || execution.network_access !== false) errors.push("retry, fallback, or network boundary mismatch");
  if (execution.generation_ready !== false || execution.exact_approval_required !== true) errors.push("generation boundary mismatch");
  for (const value of Object.values(protocol?.stop_rules ?? {})) if (value !== true) errors.push("every stop rule must fail closed");
  for (const [stage, expected] of Object.entries({
    design: ["gpt-5.6-sol", "xhigh"],
    build: ["gpt-5.6-terra", "medium"],
    integration: ["gpt-5.6-terra", "medium"],
    evaluator: ["gpt-5.6-sol", "xhigh"]
  })) {
    const observed = protocol?.model_route?.[stage];
    if (observed?.model !== expected[0] || observed?.reasoning_effort !== expected[1]) errors.push(`${stage} model route mismatch`);
  }
  const contextPolicy = protocol?.context_policy ?? {};
  if (contextPolicy.known_bounded_work_item_start !== "context-capsule-first" ||
      contextPolicy.canonical_source_bodies_required !== true ||
      contextPolicy.route_metadata_is_authority !== false ||
      JSON.stringify(contextPolicy.temple_md_fallback_when_missing) !== JSON.stringify(["authority", "current-state", "safe-next-action"]) ||
      contextPolicy.new_unknown_recovery_start !== "temple-md-first") {
    errors.push("context policy mismatch");
  }
  if (protocol?.predecessor?.protocol_sha256 !== "b01f96b48bb585e4b24390fa0b0c322d2abfc03d8f99650fa9b07a3da4932c71" ||
      protocol?.predecessor?.disposition !== "stopped-temple-design-operational-token-limit" ||
      protocol?.stopped_evidence_policy !== "completed-and-active-stage-observations-v2") {
    errors.push("successor provenance mismatch");
  }
  if (!/^[a-f0-9]{64}$/.test(protocol?.fixture?.fixture_sha256 ?? "")) errors.push("fixture digest missing");
  const numericLimitFields = [
    "design_operational_token_limit",
    "build_operational_token_limit",
    "integration_operational_token_limit",
    "candidate_aggregate_operational_token_limit",
    "evaluator_operational_token_limit",
    "combined_operational_token_limit",
    "program_wall_clock_limit_ms"
  ];
  const numericLimits = numericLimitFields.map((field) => execution[field]);
  if (numericLimits.some((value) => value !== null && value !== undefined)) {
    for (const [index, value] of numericLimits.entries()) {
      if (!Number.isSafeInteger(value) || value <= 0) errors.push(`${numericLimitFields[index]} must be a positive integer when frozen`);
    }
    if (execution.combined_operational_token_limit !== execution.candidate_aggregate_operational_token_limit + execution.evaluator_operational_token_limit) {
      errors.push("combined Token limit must equal candidate plus evaluator limits");
    }
    if (!protocol?.provider_contract?.codex_cli_version || !protocol?.provider_contract?.schema_digests) errors.push("frozen protocol requires a Provider contract");
  }
  return { valid: errors.length === 0, errors };
}

async function setup(labRoot, protocolPath) {
  if (await exists(labRoot)) throw new Error(`refusing to replace existing lab: ${labRoot}`);
  await fs.mkdir(labRoot, { recursive: true });
  const startedAt = new Date().toISOString();
  const armResults = [];
  try {
    const goldenValidation = await validateGoldenFixture();
    if (!goldenValidation.pass) throw new Error("golden acceptance fixture does not pass every objective check");
    for (const armId of arms) armResults.push(await createArm(labRoot, armId));
    const manifest = {
      schema_version: "temple.representative-microservice-lab/v1",
      work_item_id: "WI-0136",
      created_at: startedAt,
      lab_root: labRoot,
      source_digests: await sourceDigests(),
      golden_validation: goldenValidation,
      product_revisions_matched: productParity(armResults),
      arms: armResults,
      model_generation_performed: false,
      manifest_sha256: null
    };
    manifest.manifest_sha256 = sha256(JSON.stringify(stable({ ...manifest, manifest_sha256: null })));
    await writeJson(path.join(labRoot, "lab-manifest.json"), manifest, { exclusive: true });
    const protocol = buildProtocol(manifest);
    const validation = validateRepresentativeProtocol(protocol);
    if (!validation.valid) throw new Error(`generated protocol invalid: ${validation.errors.join(", ")}`);
    await writeJson(protocolPath, protocol);
    return { manifest, protocol, validation };
  } catch (error) {
    await writeJson(path.join(labRoot, "setup-failure.json"), {
      schema_version: "temple.representative-microservice-setup-failure/v1",
      work_item_id: "WI-0136",
      stopped_at: new Date().toISOString(),
      reason: String(error.message ?? error),
      model_generation_performed: false
    }).catch(() => {});
    throw error;
  }
}

async function inspect(labRoot, protocolPath) {
  const manifest = await readJson(path.join(labRoot, "lab-manifest.json"));
  const protocol = await readJson(protocolPath);
  const checks = [];
  checks.push({ id: "protocol-valid", pass: validateRepresentativeProtocol(protocol).valid });
  checks.push({ id: "manifest-digest", pass: manifest.manifest_sha256 === sha256(JSON.stringify(stable({ ...manifest, manifest_sha256: null }))) });
  checks.push({ id: "protocol-manifest", pass: protocol.lab_manifest_sha256 === manifest.manifest_sha256 });
  checks.push({ id: "product-revisions-matched", pass: manifest.product_revisions_matched === true && productParity(manifest.arms) });
  checks.push({ id: "fixture-current", pass: JSON.stringify(await sourceDigests()) === JSON.stringify(manifest.source_digests) });
  checks.push({ id: "golden-acceptance-pass", pass: manifest.golden_validation?.pass === true });
  const toolPolicy = await readJson(path.join(fixtureRoot, "tool-policy.json"));
  checks.push({
    id: "runtime-tool-policy-matched",
    pass: toolPolicy.network_access === false && JSON.stringify(toolPolicy.allowed_command_prefixes) === JSON.stringify(comparisonAllowedCommandPrefixes)
  });
  for (const arm of manifest.arms) {
    for (const repositoryId of repositories) {
      const root = path.join(labRoot, "arms", arm.id, repositoryId);
      const snapshot = await repositorySnapshot(root);
      checks.push({ id: `${arm.id}:${repositoryId}:revision`, pass: snapshot.revision === arm.repositories[repositoryId].revision });
      checks.push({ id: `${arm.id}:${repositoryId}:clean`, pass: snapshot.clean });
    }
    checks.push({ id: `${arm.id}:seeded-public-failure`, pass: Object.values(arm.starting_tests.public).every((entry) => entry.exit_code !== 0) && arm.starting_tests.public_integration.exit_code !== 0 });
    checks.push({ id: `${arm.id}:seeded-held-out-failure`, pass: arm.starting_tests.held_out.exit_code !== 0 });
  }
  return {
    schema_version: "temple.representative-microservice-inspection/v1",
    work_item_id: "WI-0136",
    inspected_at: new Date().toISOString(),
    valid: checks.every((entry) => entry.pass),
    checks,
    model_generation_performed: false
  };
}

function modelEntries(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.models)) return response.models;
  return Array.isArray(response) ? response : [];
}

function modelId(model) {
  return model?.model ?? model?.id ?? model?.slug ?? null;
}

function modelEfforts(model) {
  const values = model?.supportedReasoningEfforts ?? model?.supported_reasoning_efforts ?? model?.reasoningEfforts ?? [];
  return values.map((entry) => typeof entry === "string" ? entry : entry?.reasoningEffort ?? entry?.effort ?? entry?.value ?? null).filter(Boolean);
}

async function providerHandshake() {
  const cli = await checked("codex", ["--version"]);
  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0136-schema-"));
  const names = [
    "ThreadStartParams.json",
    "TurnStartParams.json",
    "ThreadStartResponse.json",
    "TurnStartResponse.json",
    "ItemStartedNotification.json",
    "TurnCompletedNotification.json",
    "ItemCompletedNotification.json",
    "ThreadTokenUsageUpdatedNotification.json",
    "ModelReroutedNotification.json",
    "TurnInterruptParams.json"
  ];
  const schemaDigests = {};
  let connection;
  try {
    await checked("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    for (const name of names) schemaDigests[name] = sha256(await fs.readFile(path.join(schemaRoot, "v2", name)));
    connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], {
      cwd: repositoryRoot,
      env: isolateWave5CodexEnvironment(process.env)
    });
    await connection.request("initialize", {
      clientInfo: { name: "temple-wi0136-preflight", title: "Temple WI-0136 Preflight", version: "1" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const models = modelEntries(await connection.request("model/list", {}));
    const required = [
      { model: "gpt-5.6-sol", reasoning_efforts: ["xhigh"] },
      { model: "gpt-5.6-terra", reasoning_efforts: ["medium"] }
    ];
    const checks = required.map((requirement) => {
      const observed = models.find((entry) => modelId(entry) === requirement.model);
      const efforts = new Set(modelEfforts(observed));
      return {
        ...requirement,
        available: Boolean(observed) && requirement.reasoning_efforts.every((effort) => efforts.has(effort)),
        observed_reasoning_efforts: [...efforts]
      };
    });
    return {
      pass: checks.every((entry) => entry.available),
      codex_cli_version: cli,
      schema_digests: schemaDigests,
      required_models: required,
      model_checks: checks,
      model_generation_performed: false
    };
  } finally {
    await connection?.close().catch(() => {});
    await fs.rm(schemaRoot, { recursive: true, force: true });
  }
}

function freezeLimits(protocol, handshake) {
  const next = structuredClone(protocol);
  next.provider_contract = {
    codex_cli_version: handshake.codex_cli_version,
    schema_digests: handshake.schema_digests,
    required_models: handshake.required_models
  };
  Object.assign(next.execution, {
    design_operational_token_limit: 150000,
    build_operational_token_limit: 69000,
    integration_operational_token_limit: 80000,
    candidate_aggregate_operational_token_limit: 650000,
    evaluator_operational_token_limit: 100000,
    combined_operational_token_limit: 750000,
    program_wall_clock_limit_ms: 2700000
  });
  next.limit_basis = {
    design: {
      source: ".ai-org/artifacts/WI-0136/representative-main-v4-stopped-run.json",
      observed_censored_temple_design_operational_tokens: 101815,
      prior_limit: 100000,
      frozen_limit: 150000,
      meaning: "A bounded safety ceiling above the observed censored lower bound; not a completion forecast."
    },
    evaluator: {
      source: ".ai-org/artifacts/WI-0132/live-experiment-observation.json",
      observed_sol_xhigh_candidate_maximum: 78497,
      frozen_limit: 100000
    },
    build: {
      source: ".ai-org/artifacts/WI-0135/live-protocol.json",
      prior_terra_per_candidate_limit: 69000,
      frozen_limit: 69000
    },
    integration: {
      source: ".ai-org/artifacts/WI-0136/context-recovery-qualification-v10-analysis.json",
      observed_routed_terra_operational_tokens: 57296,
      headroom_percent: 39.63,
      frozen_limit: 80000
    },
    aggregate: {
      source: ".ai-org/artifacts/WI-0136/representative-main-v4-stopped-run.json",
      completed_minimal_arm_operational_tokens: 234099,
      censored_temple_design_operational_tokens: 101815,
      remaining_declared_stage_ceiling: 287000,
      observed_plus_remaining_declared_ceiling: 623914,
      rounded_candidate_limit: 650000,
      candidate_limit: 650000,
      evaluator_limit: 100000
    },
    meaning: "Safety stops based on retained operational-Token observations; not forecasts, prices, or statistical estimates."
  };
  next.protocol_sha256 = protocolDigest(next);
  return next;
}

function approvalTemplate(protocol) {
  return {
    schema_version: "temple.representative-microservice-account-approval/v1",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    approved: false,
    authorization_source: null,
    approved_candidate_turns: protocol.execution.candidate_turns,
    approved_evaluator_turns: protocol.execution.evaluator_turns,
    approved_models: ["gpt-5.6-sol", "gpt-5.6-terra"],
    approved_reasoning_efforts: ["xhigh", "medium"],
    approved_candidate_operational_tokens: protocol.execution.candidate_aggregate_operational_token_limit,
    approved_evaluator_operational_tokens: protocol.execution.evaluator_operational_token_limit,
    approved_combined_operational_tokens: protocol.execution.combined_operational_token_limit,
    approved_program_wall_clock_ms: protocol.execution.program_wall_clock_limit_ms,
    pro_included_allowance_only: true,
    credits_purchase_authorized: false,
    automatic_refill_authorized: false,
    usage_reset_authorized: false,
    retry_count: 0,
    fallback_count: 0,
    approved_at: null
  };
}

export function validateRepresentativeApproval(approval, protocol) {
  const expected = approvalTemplate(protocol);
  const errors = [];
  if (approval?.schema_version !== expected.schema_version) errors.push("unsupported approval schema");
  if (approval?.work_item_id !== expected.work_item_id || approval?.protocol_sha256 !== expected.protocol_sha256) errors.push("approval target mismatch");
  if (approval?.approved !== true || !approval?.authorization_source || !approval?.approved_at) errors.push("affirmative approval record is incomplete");
  for (const key of [
    "approved_candidate_turns",
    "approved_evaluator_turns",
    "approved_candidate_operational_tokens",
    "approved_evaluator_operational_tokens",
    "approved_combined_operational_tokens",
    "approved_program_wall_clock_ms",
    "pro_included_allowance_only",
    "credits_purchase_authorized",
    "automatic_refill_authorized",
    "usage_reset_authorized",
    "retry_count",
    "fallback_count"
  ]) {
    if (approval?.[key] !== expected[key]) errors.push(`${key} does not match the frozen protocol`);
  }
  if (JSON.stringify(approval?.approved_models) !== JSON.stringify(expected.approved_models)) errors.push("approved models mismatch");
  if (JSON.stringify(approval?.approved_reasoning_efforts) !== JSON.stringify(expected.approved_reasoning_efforts)) errors.push("approved efforts mismatch");
  return { accepted: errors.length === 0, errors };
}

async function freeze(protocolPath) {
  const protocol = await readJson(protocolPath);
  const before = validateRepresentativeProtocol(protocol);
  if (!before.valid) throw new Error(`protocol invalid before freeze: ${before.errors.join(", ")}`);
  const handshake = await providerHandshake();
  if (!handshake.pass) throw new Error("required Provider models or efforts are unavailable");
  const frozen = freezeLimits(protocol, handshake);
  const after = validateRepresentativeProtocol(frozen);
  if (!after.valid) throw new Error(`frozen protocol invalid: ${after.errors.join(", ")}`);
  await writeJson(protocolPath, frozen);
  const template = approvalTemplate(frozen);
  await writeJson(defaultApprovalTemplatePath, template);
  return {
    schema_version: "temple.representative-microservice-freeze/v1",
    work_item_id: frozen.work_item_id,
    protocol_sha256: frozen.protocol_sha256,
    provider_handshake: handshake,
    limits: frozen.execution,
    approval_template: path.relative(repositoryRoot, defaultApprovalTemplatePath),
    model_generation_performed: false
  };
}

async function preflight(labRoot, protocolPath, approvalPath) {
  const inspection = await inspect(labRoot, protocolPath);
  const protocol = await readJson(protocolPath);
  const handshake = await providerHandshake();
  const lifecycleRehearsal = inspection.valid
    ? await rehearseTempleLifecycle(labRoot)
    : { pass: false, reason: "local fixture invalid" };
  const providerMatch = handshake.pass && protocol?.provider_contract?.codex_cli_version === handshake.codex_cli_version &&
    JSON.stringify(protocol?.provider_contract?.schema_digests) === JSON.stringify(handshake.schema_digests);
  const approval = approvalPath && await exists(approvalPath) ? validateRepresentativeApproval(await readJson(approvalPath), protocol) : { accepted: false, errors: ["exact approval missing"] };
  const blockers = [];
  if (!inspection.valid) blockers.push("local-fixture-invalid");
  if (!lifecycleRehearsal.pass) blockers.push("temple-lifecycle-rehearsal-failed");
  if (!providerMatch) blockers.push("provider-contract-drift");
  if (!approval.accepted) blockers.push("exact-human-approval-required");
  const output = {
    schema_version: "temple.representative-microservice-preflight/v1",
    work_item_id: "WI-0136",
    observed_at: new Date().toISOString(),
    local_fixture_ready: inspection.valid,
    protocol_sha256: protocol.protocol_sha256,
    provider_handshake_performed: true,
    provider_contract_matches: providerMatch,
    provider_handshake: handshake,
    temple_lifecycle_rehearsal: lifecycleRehearsal,
    exact_approval_present: approval.accepted,
    approval_errors: approval.errors,
    generation_ready: blockers.length === 0,
    blockers,
    checks: inspection.checks,
    model_generation_performed: false
  };
  await writeJson(path.join(labRoot, "preflight.json"), output);
  return output;
}

const designOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["contract_version", "rollout_order", "slices", "risks", "assumptions"],
  properties: {
    contract_version: { type: "string" },
    rollout_order: { type: "array", items: { type: "string" } },
    slices: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "repositories", "responsibility"],
        properties: {
          id: { type: "string" },
          repositories: { type: "array", items: { type: "string" } },
          responsibility: { type: "string" }
        }
      }
    },
    risks: { type: "array", items: { type: "string" } },
    assumptions: { type: "array", items: { type: "string" } }
  }
});

const buildOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["summary", "changed_paths", "test_command", "test_result", "unresolved"],
  properties: {
    summary: { type: "string" },
    changed_paths: { type: "array", items: { type: "string" } },
    test_command: { type: "string" },
    test_result: { type: "string" },
    unresolved: { type: "array", items: { type: "string" } }
  }
});

export const integrationOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["recovered_revisions", "governing_contract", "completed_slices", "unresolved", "safe_next_action", "summary"],
  properties: {
    recovered_revisions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["repository", "revision"],
        properties: { repository: { type: "string" }, revision: { type: "string" } }
      }
    },
    governing_contract: { type: "string" },
    completed_slices: {
      type: "array",
      items: { type: "string", enum: [...integrationSliceIds] },
      minItems: integrationSliceIds.length,
      maxItems: integrationSliceIds.length
    },
    unresolved: { type: "array", items: { type: "string" } },
    safe_next_action: { type: "string" },
    summary: { type: "string" }
  }
});

const structuredOutputSchemaProfile = "openai-structured-outputs-subset/2026-09-03";
const structuredOutputCommonKeywords = new Set(["type", "description", "enum", "const", "anyOf", "$ref", "$defs"]);
const structuredOutputTypeKeywords = Object.freeze({
  object: new Set(["properties", "required", "additionalProperties"]),
  array: new Set(["items", "minItems", "maxItems"]),
  string: new Set(["pattern", "format"]),
  number: new Set(["multipleOf", "maximum", "exclusiveMaximum", "minimum", "exclusiveMinimum"]),
  integer: new Set(["multipleOf", "maximum", "exclusiveMaximum", "minimum", "exclusiveMinimum"]),
  boolean: new Set(),
  null: new Set()
});

export function validateProviderOutputSchema(schema) {
  const errors = [];
  let objectPropertyCount = 0;
  let enumValueCount = 0;
  let constrainedStringCharacters = 0;
  let maximumDepth = 0;

  function visit(node, pointer, depth, root = false) {
    maximumDepth = Math.max(maximumDepth, depth);
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      errors.push(`${pointer}: schema node must be an object`);
      return;
    }
    const types = Array.isArray(node.type) ? node.type : node.type ? [node.type] : [];
    if (root && (types.length !== 1 || types[0] !== "object" || Object.hasOwn(node, "anyOf"))) {
      errors.push(`${pointer}: root schema must be an object and must not use anyOf`);
    }
    for (const type of types) {
      if (!Object.hasOwn(structuredOutputTypeKeywords, type)) errors.push(`${pointer}: unsupported type ${type}`);
    }
    const allowedKeywords = new Set(structuredOutputCommonKeywords);
    for (const type of types) {
      for (const keyword of structuredOutputTypeKeywords[type] ?? []) allowedKeywords.add(keyword);
    }
    for (const keyword of Object.keys(node)) {
      if (!allowedKeywords.has(keyword)) errors.push(`${pointer}: unsupported keyword ${keyword}`);
    }

    if (types.includes("object")) {
      const properties = node.properties;
      if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
        errors.push(`${pointer}: object properties must be an object`);
      } else {
        const propertyNames = Object.keys(properties);
        objectPropertyCount += propertyNames.length;
        constrainedStringCharacters += propertyNames.reduce((sum, name) => sum + name.length, 0);
        const required = Array.isArray(node.required) ? node.required : [];
        const missingRequired = propertyNames.filter((name) => !required.includes(name));
        const unknownRequired = required.filter((name) => !Object.hasOwn(properties, name));
        if (missingRequired.length > 0 || unknownRequired.length > 0 || new Set(required).size !== required.length) {
          errors.push(`${pointer}: every object property must be required exactly once`);
        }
        for (const [name, child] of Object.entries(properties)) visit(child, `${pointer}/properties/${name}`, depth + 1);
      }
      if (node.additionalProperties !== false) errors.push(`${pointer}: additionalProperties must be false`);
    }
    if (types.includes("array")) {
      if (!node.items) errors.push(`${pointer}: array items schema is required`);
      else visit(node.items, `${pointer}/items`, depth + 1);
    }
    if (Object.hasOwn(node, "anyOf")) {
      if (!Array.isArray(node.anyOf) || node.anyOf.length === 0) errors.push(`${pointer}: anyOf must contain schemas`);
      else node.anyOf.forEach((child, index) => visit(child, `${pointer}/anyOf/${index}`, depth + 1));
    }
    if (Object.hasOwn(node, "$defs")) {
      if (!node.$defs || typeof node.$defs !== "object" || Array.isArray(node.$defs)) errors.push(`${pointer}: $defs must be an object`);
      else {
        for (const [name, child] of Object.entries(node.$defs)) {
          constrainedStringCharacters += name.length;
          visit(child, `${pointer}/$defs/${name}`, depth + 1);
        }
      }
    }
    if (Object.hasOwn(node, "enum")) {
      if (!Array.isArray(node.enum) || node.enum.length === 0) errors.push(`${pointer}: enum must contain values`);
      else {
        enumValueCount += node.enum.length;
        const enumStringCharacters = node.enum.reduce((sum, value) => sum + (typeof value === "string" ? value.length : 0), 0);
        constrainedStringCharacters += enumStringCharacters;
        if (node.enum.length > 250 && enumStringCharacters > 15000) {
          errors.push(`${pointer}: large string enum exceeds 15000 characters`);
        }
      }
    }
    if (typeof node.const === "string") constrainedStringCharacters += node.const.length;
  }

  visit(schema, "#", 1, true);
  if (objectPropertyCount > 5000) errors.push("#: more than 5000 total object properties");
  if (maximumDepth > 10) errors.push("#: more than 10 schema nesting levels");
  if (constrainedStringCharacters > 120000) errors.push("#: constrained schema strings exceed 120000 characters");
  if (enumValueCount > 1000) errors.push("#: more than 1000 total enum values");
  return {
    profile: structuredOutputSchemaProfile,
    supported: errors.length === 0,
    errors,
    schema_sha256: sha256(JSON.stringify(schema)),
    object_property_count: objectPropertyCount,
    enum_value_count: enumValueCount,
    constrained_string_characters: constrainedStringCharacters,
    maximum_depth: maximumDepth
  };
}

const evaluatorOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["packages", "summary"],
  properties: {
    packages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["package_id", "dimensions", "critical_failure", "summary"],
        properties: {
          package_id: { type: "string" },
          dimensions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "score", "rationale"],
              properties: {
                id: { type: "string" },
                score: { type: "integer", minimum: 0, maximum: 1 },
                rationale: { type: "string" }
              }
            }
          },
          critical_failure: { type: ["string", "null"] },
          summary: { type: "string" }
        }
      }
    },
    summary: { type: "string" }
  }
});

function operationalTokens(usage) {
  return usage.input_tokens - usage.cached_input_tokens + usage.output_tokens;
}

function parseStructuredMessage(value) {
  if (typeof value !== "string" || value.trim() === "") throw new Error("structured completion message missing");
  const normalized = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(normalized);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("structured completion must be an object");
  return parsed;
}

function stageLimit(protocol, stage) {
  return {
    design: protocol.execution.design_operational_token_limit,
    build: protocol.execution.build_operational_token_limit,
    integration: protocol.execution.integration_operational_token_limit,
    evaluator: protocol.execution.evaluator_operational_token_limit
  }[stage];
}

function createBudget(protocol) {
  const active = new Map();
  let settled = 0;
  return {
    update(id, value) {
      active.set(id, value);
      return settled + [...active.values()].reduce((sum, entry) => sum + entry, 0);
    },
    settle(id, value) {
      active.delete(id);
      settled += value;
      return settled;
    },
    total() {
      return settled + [...active.values()].reduce((sum, entry) => sum + entry, 0);
    },
    limit: protocol.execution.candidate_aggregate_operational_token_limit
  };
}

const boundedBaseInstructions = "You are a bounded coding worker. Follow the developer instructions and user task, use only available local tools, and return the requested structured completion record.";

const boundedDeveloperInstructions = [
  "This is one bounded controlled-comparison turn. Do not create subagents or ask the user questions.",
  `Allowed shell command prefixes: ${comparisonAllowedCommandPrefixes.map((entry) => entry.join(" ")).join(", ")}.`,
  "Use one command per shell call; do not use pipes, redirects, control operators, command substitutions, package installation, network access, external services, deployment, or publication.",
  "Use apply_patch for allowed file changes. Treat repository files as state and complete exactly one attempt.",
  "Return only the requested structured JSON object."
].join("\n");

function textMetrics(value) {
  return {
    bytes: Buffer.byteLength(value),
    characters: [...value].length,
    sha256: sha256(value)
  };
}

function promptMetrics(instruction, outputSchema) {
  const schema = JSON.stringify(outputSchema);
  const components = {
    base_instructions: textMetrics(boundedBaseInstructions),
    developer_instructions: textMetrics(boundedDeveloperInstructions),
    user_input: textMetrics(instruction),
    output_schema: textMetrics(schema)
  };
  return {
    components,
    explicit_bytes: Object.values(components).reduce((sum, entry) => sum + entry.bytes, 0),
    raw_prompt_retained: false
  };
}

function contextActionLabels(actions) {
  const labels = [];
  for (const action of actions ?? []) {
    const commandText = typeof action?.command === "string" ? action.command : "";
    if (/(^|[ /])TEMPLE\.md(?:$|[ '"/])/i.test(commandText)) labels.push("temple-md");
    if (/\bcontext resolve\b/i.test(commandText)) labels.push("context-resolve");
  }
  return labels;
}

function summarizeToolActivity(item, activity, includeActions = true) {
  if (item?.type !== "commandExecution") return;
  if (includeActions) {
    activity.command_items += 1;
    for (const action of item.commandActions ?? []) {
      activity.command_actions += 1;
      const type = typeof action?.type === "string" ? action.type : "unknown";
      activity.action_types[type] = (activity.action_types[type] ?? 0) + 1;
    }
    for (const label of contextActionLabels(item.commandActions)) {
      if (label === "temple-md") activity.temple_md_attempts += 1;
      if (label === "context-resolve") activity.context_resolve_attempts += 1;
    }
  }
  for (const key of ["aggregatedOutput", "output", "formattedOutput"]) {
    if (typeof item?.[key] === "string") activity.reported_output_bytes += Buffer.byteLength(item[key]);
  }
}

export function successfulContextActionLabels(item, fallbackActions = []) {
  if (item?.type !== "commandExecution" || item.exitCode !== 0) return [];
  const actions = Array.isArray(item.commandActions) && item.commandActions.length > 0
    ? item.commandActions
    : fallbackActions;
  return contextActionLabels(actions);
}

export function stoppedStageObservation(observation, stopReason, candidateLimitObserved = false) {
  return {
    ...observation,
    status: candidateLimitObserved ? "censored" : "stopped",
    stop_scope: candidateLimitObserved ? "condition" : "run",
    stop_reason: stopReason,
    completion: null
  };
}

function summarizeSuccessfulContextActivity(item, activity, fallbackActions = []) {
  for (const label of successfulContextActionLabels(item, fallbackActions)) {
    if (label === "temple-md") activity.temple_md_reads += 1;
    if (label === "context-resolve") activity.context_resolve_calls += 1;
    activity.context_sequence.push(label);
  }
}

async function launchModelTurn({
  id,
  cwd,
  stage,
  route,
  instruction,
  outputSchema,
  protocol,
  budget,
  deadline,
  sandbox = "workspace-write",
  allowTools = true,
  retainStopOutcome = false,
  operationalTokenLimit = null
}) {
  let connection;
  let threadId = null;
  let turnId = null;
  let terminal = null;
  let completionText = null;
  let latestUsage = null;
  let violation = null;
  const toolActivity = {
    command_items: 0,
    command_actions: 0,
    action_types: {},
    temple_md_attempts: 0,
    context_resolve_attempts: 0,
    temple_md_reads: 0,
    context_resolve_calls: 0,
    context_sequence: [],
    reported_output_bytes: 0
  };
  const observedCommandItems = new Set();
  const successfulContextItems = new Set();
  const commandActionsByItem = new Map();
  let resolveTerminal;
  const terminalPromise = new Promise((resolve) => { resolveTerminal = resolve; });
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  let turnRequestedMs = null;
  let firstActivityMs = null;
  let firstCommandMs = null;

  async function interrupt(reason) {
    if (violation === null) violation = reason;
    if (connection && threadId && turnId) await connection.request("turn/interrupt", { threadId, turnId }, 15000).catch(() => {});
  }

  connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], {
    cwd,
    env: isolateWave5CodexEnvironment({
      ...process.env,
      TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs")
    }),
    onNotification(message) {
      const params = message.params ?? {};
      if (turnRequestedMs !== null && message.method === "item/started" && (!turnId || params.turnId === turnId)) {
        if (firstActivityMs === null) firstActivityMs = Date.now();
        if (params.item?.type === "commandExecution" && firstCommandMs === null) firstCommandMs = Date.now();
      }
      if (message.method === "thread/tokenUsage/updated" && (!turnId || params.turnId === turnId)) {
        const usage = normalizeTokenUsage(params);
        if (usage) {
          latestUsage = usage;
          const stageTokens = operationalTokens(usage);
          const aggregate = budget.update(id, stageTokens);
          if (aggregate > budget.limit) void interrupt("candidate-aggregate-operational-token-limit");
          else if (stageTokens > (operationalTokenLimit ?? stageLimit(protocol, stage))) void interrupt(`${stage}-operational-token-limit`);
        }
      }
      const policyViolation = protocolViolationForMessage(message, {
        turnId,
        allowedCommandPrefixes: comparisonAllowedCommandPrefixes
      });
      if (policyViolation) void interrupt(`${policyViolation.code}:${policyViolation.message}`);
      if (message.method === "item/started" && (!allowTools || ["mcpToolCall", "webSearch"].includes(params.item?.type))) {
        void interrupt(`${stage}-tool-policy-violation`);
      }
      if (message.method === "item/started" && params.item?.type === "commandExecution") {
        const key = params.item.id ?? `${toolActivity.command_items}`;
        if (!observedCommandItems.has(key)) {
          observedCommandItems.add(key);
          commandActionsByItem.set(key, params.item.commandActions ?? []);
          summarizeToolActivity(params.item, toolActivity, true);
        }
      }
      if (message.method === "item/completed" && (!turnId || params.turnId === turnId) && params.item?.type === "agentMessage") {
        completionText = params.item.text;
      }
      if (message.method === "item/completed" && (!turnId || params.turnId === turnId)) {
        const key = params.item?.id ?? null;
        const includeActions = params.item?.type === "commandExecution" && (key === null || !observedCommandItems.has(key));
        if (includeActions && key !== null) observedCommandItems.add(key);
        summarizeToolActivity(params.item, toolActivity, includeActions);
        if (params.item?.type === "commandExecution") {
          const contextKey = key ?? `completed-${successfulContextItems.size}`;
          if (!successfulContextItems.has(contextKey)) {
            successfulContextItems.add(contextKey);
            summarizeSuccessfulContextActivity(
              params.item,
              toolActivity,
              key === null ? [] : commandActionsByItem.get(key)
            );
          }
        }
      }
      if (message.method === "turn/completed" && (!turnId || params.turn?.id === turnId)) {
        terminal = params.turn;
        resolveTerminal();
      }
    },
    onRequest(message, responder) {
      if (["item/commandExecution/requestApproval", "item/fileChange/requestApproval", "item/permissions/requestApproval"].includes(message.method)) {
        try { responder.respond(buildCodexRuntimeRequestResponse(message.method, message.params, { decision: "decline" })); } catch {}
      }
      void interrupt(`runtime-request:${message.method}`);
    }
  });

  const timer = setTimeout(() => { void interrupt("program-wall-clock-limit"); }, Math.max(1, deadline - Date.now()));
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-wi0136", title: "Temple WI-0136 Representative Comparison", version: "1" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const thread = await connection.request("thread/start", {
      model: route.model,
      cwd,
      approvalPolicy: "never",
      sandbox,
      serviceName: `temple-wi0136-${id}`,
      developerInstructions: boundedDeveloperInstructions,
      ...wave5ThreadIsolation(cwd),
      baseInstructions: boundedBaseInstructions
    });
    threadId = thread?.thread?.id;
    if (!threadId || thread.model !== route.model) throw new Error(`${id}: requested model was not acknowledged`);
    turnRequestedMs = Date.now();
    const turn = await connection.request("turn/start", {
      threadId,
      clientUserMessageId: `wi0136-${id}`,
      input: [{ type: "text", text: instruction }],
      turnTrigger: "user",
      cwd,
      approvalPolicy: "never",
      sandboxPolicy: sandbox === "read-only"
        ? { type: "readOnly", networkAccess: false }
        : { type: "workspaceWrite", writableRoots: [cwd], networkAccess: false },
      model: route.model,
      effort: route.reasoning_effort,
      outputSchema
    });
    turnId = turn?.turn?.id;
    if (!turnId) throw new Error(`${id}: turn did not start`);
    await terminalPromise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    const candidateLimitObserved = violation === `${stage}-operational-token-limit`;
    const failure = terminalFailure(terminal);
    const stopReason = violation ?? (failure ? `${failure.code}:${failure.message}` : null);
    const retainObservedStop = retainStopOutcome && stopReason !== null && latestUsage !== null;
    if (!latestUsage) throw new Error(`${id}:detailed Token usage missing`);
    const tokens = operationalTokens(latestUsage);
    const completedMs = Date.now();
    const turnElapsedMs = completedMs - turnRequestedMs;
    budget.settle(id, tokens);
    const observation = {
      id,
      stage,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      elapsed_ms: completedMs - startedMs,
      session_setup_ms: turnRequestedMs - startedMs,
      turn_elapsed_ms: turnElapsedMs,
      time_to_first_activity_ms: firstActivityMs === null ? null : firstActivityMs - turnRequestedMs,
      time_to_first_command_ms: firstCommandMs === null ? null : firstCommandMs - turnRequestedMs,
      effective_output_tokens_per_second: turnElapsedMs === 0
        ? null
        : Number((latestUsage.output_tokens / (turnElapsedMs / 1000)).toFixed(3)),
      thread_id: threadId,
      turn_id: turnId,
      requested_model: route.model,
      acknowledged_model: thread.model,
      requested_reasoning_effort: route.reasoning_effort,
      observed_thread_reasoning_effort: thread.reasoningEffort ?? null,
      effective_turn_reasoning_effort: null,
      usage: latestUsage,
      operational_tokens: tokens,
      prompt_metrics: promptMetrics(instruction, outputSchema),
      tool_activity: toolActivity,
      retry_count: 0,
      fallback_count: 0,
      raw_prompt_retained: false,
      raw_response_retained: false,
      hidden_reasoning_retained: false
    };
    if (stopReason && !retainObservedStop) {
      const error = new Error(`${id}:${stopReason}`);
      error.stage_observation = stoppedStageObservation(observation, stopReason, candidateLimitObserved);
      throw error;
    }
    if (retainObservedStop) {
      return stoppedStageObservation(observation, stopReason, candidateLimitObserved);
    }
    return {
      ...observation,
      status: "completed",
      stop_scope: null,
      stop_reason: null,
      completion: parseStructuredMessage(completionText)
    };
  } finally {
    clearTimeout(timer);
    await connection?.close().catch(() => {});
  }
}

export function statusPaths(output) {
  return output.split("\n").filter(Boolean).map((entry) => {
    if (entry.length >= 4 && entry[2] === " ") return entry.slice(3);
    if (/^[ MADRCU?!] /.test(entry)) return entry.slice(2);
    throw new Error(`malformed Git porcelain record: ${entry}`);
  }).toSorted();
}

async function changedPaths(root) {
  return statusPaths(await git(root, ["status", "--porcelain=v1", "--untracked-files=all"]));
}

async function diffLineCount(root) {
  const output = await git(root, ["diff", "--numstat"]);
  let total = 0;
  for (const line of output.split("\n").filter(Boolean)) {
    const [added, removed] = line.split("\t");
    if (/^\d+$/.test(added)) total += Number(added);
    if (/^\d+$/.test(removed)) total += Number(removed);
  }
  return total;
}

async function claimTempleRepository(root, agentId) {
  const revision = await git(root, ["rev-parse", "HEAD"]);
  await temple(root, [
    "work-item", "claim", ".",
    "--work-item", "WI-0001",
    "--agent-id", agentId,
    "--principal-id", "human",
    "--base-revision", revision,
    "--branch", "main",
    "--worktree", root
  ]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Record bounded experiment claim"]);
  return git(root, ["rev-parse", "HEAD"]);
}

async function completeTempleBuildRepository(root, summary, evidenceRevision) {
  await temple(root, [
    "handoff", ".", "--work-item", "WI-0001", "--to", "quality_evaluator",
    "--input-revision", evidenceRevision,
    "--completed", summary,
    "--evidence", evidenceRevision
  ]);
  await temple(root, ["work-item", "release", ".", "--work-item", "WI-0001", "--agent-id", "agent-fixture-rikku", "--principal-id", "human", "--reason", "Bounded build handoff complete"]);
  await temple(root, [
    "transition", ".", "--work-item", "WI-0001", "--to", "test",
    "--satisfy", `developer_handoff=${evidenceRevision}`,
    "--satisfy", `developer_evidence=${evidenceRevision}`
  ]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Record Temple build handoff"]);
  return git(root, ["rev-parse", "HEAD"]);
}

async function finalizeTempleDesign(coordinatorRoot, design) {
  const designPath = path.join(coordinatorRoot, "design-record.json");
  await writeJson(designPath, design);
  await writeText(path.join(coordinatorRoot, ".ai-org/artifacts/WI-0001/technical-design.md"), `# WI-0001 technical design\n\nFrozen structured design: \`design-record.json\`.\n\nContract: ${design.contract_version}.\n`);
  await writeText(path.join(coordinatorRoot, ".ai-org/artifacts/WI-0001/risk-review.md"), "# WI-0001 risk review\n\nLocal synthetic cross-repository change. Preserve v1 compatibility, exact revisions, disjoint slice ownership, and no external action.\n");
  await git(coordinatorRoot, ["add", "-A"]);
  await git(coordinatorRoot, ["commit", "-m", "Freeze Temple design record"]);
  const designRevision = await git(coordinatorRoot, ["rev-parse", "HEAD"]);
  await temple(coordinatorRoot, [
    "handoff", ".", "--work-item", "WI-0001", "--to", "developer",
    "--input-revision", designRevision,
    "--completed", "Frozen the OrderPlaced v2 contract, rollout, slices, and risks.",
    "--evidence", "design-record.json"
  ]);
  await temple(coordinatorRoot, ["work-item", "release", ".", "--work-item", "WI-0001", "--agent-id", "agent-fixture-tidus", "--principal-id", "human", "--reason", "Design handoff complete"]);
  await temple(coordinatorRoot, [
    "transition", ".", "--work-item", "WI-0001", "--to", "build",
    "--satisfy", "technical_design=.ai-org/artifacts/WI-0001/technical-design.md",
    "--satisfy", "risk_review=.ai-org/artifacts/WI-0001/risk-review.md"
  ]);
  await temple(coordinatorRoot, ["work-item", "configure", ".", "--work-item", "WI-0001", "--agent-id", "agent-fixture-rikku"]);
  await git(coordinatorRoot, ["add", "-A"]);
  await git(coordinatorRoot, ["commit", "-m", "Advance Temple coordinator to integration"]);
  return { design_revision: designRevision, organization_revision: await git(coordinatorRoot, ["rev-parse", "HEAD"]) };
}

async function finalizeMinimalDesign(coordinatorRoot, design) {
  await writeJson(path.join(coordinatorRoot, "design-record.json"), design);
  await writeText(path.join(coordinatorRoot, "organization/DESIGN_HANDOFF.md"), [
    "# Design handoff",
    "",
    "The structured contract, rollout, slice ownership, assumptions, and risks are frozen in `design-record.json`.",
    "The three implementation slices may start because their writable repositories do not overlap.",
    ""
  ].join("\n"));
  await git(coordinatorRoot, ["add", "-A"]);
  await git(coordinatorRoot, ["commit", "-m", "Freeze minimal responsible design"]);
  return { design_revision: await git(coordinatorRoot, ["rev-parse", "HEAD"]) };
}

function buildSlices() {
  return [
    { id: "orders-catalog", repositories: ["orders", "catalog"] },
    { id: "notifications", repositories: ["notifications"] },
    { id: "gateway", repositories: ["gateway"] }
  ];
}

export function templeRoutedContextInstruction(repositoryLabel = "the assigned repository", launcher = "./templew.mjs", target = ".") {
  return [
    `From the experiment workspace root, before reading any repository file, first preview \`node ${launcher} context resolve ${target} --work-item WI-0001 --position developer --no-write --json\` for ${repositoryLabel}.`,
    "Treat the Context Capsule as navigation, not authority, and open the routed canonical source bodies needed for this responsibility.",
    "Do not read TEMPLE.md before that command. Read it afterward if the Context Capsule cannot identify authority, current state, or the safe next action."
  ].join(" ");
}

export function armProcessInstructions(armId, repositories_) {
  if (armId === "temple") {
    return [
      templeRoutedContextInstruction(
        "the Coordinator repository",
        "coordinator/templew.mjs",
        "coordinator"
      ),
      ...repositories_.map((repositoryId) => templeRoutedContextInstruction(
        `the assigned ${repositoryId} repository`,
        `${repositoryId}/templew.mjs`,
        repositoryId
      )),
      "Only after those first-action requirements, use the routed canonical state needed for this slice. Claims and lifecycle mutations are owned by the experiment coordinator; do not edit .ai-org files."
    ].join(" ");
  }
  return `For each assigned repository, read organization/WORK_ITEM.md and the Coordinator design record. Use the ordinary repository handoff as durable state. Assigned repositories: ${repositories_.join(", ")}.`;
}

async function runDesignTurn({ armId, armRoot, protocol, budget, deadline }) {
  const coordinatorRoot = path.join(armRoot, "coordinator");
  if (armId === "temple") await claimTempleRepository(coordinatorRoot, "agent-fixture-tidus");
  const task = await fs.readFile(path.join(coordinatorRoot, "TASK.md"), "utf8");
  const instruction = [
    armId === "temple"
      ? templeRoutedContextInstruction("the Coordinator repository", "coordinator/templew.mjs", "coordinator")
      : "Use TASK.md and organization/WORK_ITEM.md as the ordinary responsible workflow records.",
    "Design the bounded OrderPlaced v2 rolling-compatibility change described below.",
    "Only after the preceding workflow entry requirement, inspect the four service repositories and return one structured design record. Do not modify files.",
    "Use contract_version `OrderPlaced/v2`. Use rollout_order with consumer preparation before producer publication.",
    "Define exactly these slice IDs: orders-catalog, notifications, gateway. Keep their writable repositories disjoint.",
    task
  ].join("\n\n");
  const turn = await launchModelTurn({
    id: `${armId}-design`, cwd: armRoot, stage: "design", route: protocol.model_route.design,
    instruction, outputSchema: designOutputSchema, protocol, budget, deadline, sandbox: "read-only"
  });
  const result = armId === "temple"
    ? await finalizeTempleDesign(coordinatorRoot, turn.completion)
    : await finalizeMinimalDesign(coordinatorRoot, turn.completion);
  return { ...turn, ...result };
}

async function runBuildSlice({ armId, armRoot, slice, protocol, budget, deadline }) {
  const coordinatorRoot = path.join(armRoot, "coordinator");
  if (armId === "temple") {
    for (const repositoryId of slice.repositories) await claimTempleRepository(path.join(armRoot, repositoryId), "agent-fixture-rikku");
  }
  const before = Object.fromEntries(await Promise.all(slice.repositories.map(async (repositoryId) => [repositoryId, await git(path.join(armRoot, repositoryId), ["rev-parse", "HEAD"])])));
  const instruction = [
    armProcessInstructions(armId, slice.repositories),
    `Implement only the ${slice.id} slice in these repositories: ${slice.repositories.join(", ")}.`,
    "Read coordinator/TASK.md and coordinator/design-record.json. Preserve the exact contract and rolling v1 compatibility.",
    "Change only the declared service source file in each assigned repository. Tests and organizational files are read-only.",
    "Run `npm test` separately in each assigned repository. Do not commit; the experiment coordinator records exact revisions and handoff evidence."
  ].join("\n\n");
  const turn = await launchModelTurn({
    id: `${armId}-${slice.id}`, cwd: armRoot, stage: "build", route: protocol.model_route.build,
    instruction, outputSchema: buildOutputSchema, protocol, budget, deadline
  });
  const repositoriesResult = {};
  for (const repositoryId of slice.repositories) {
    const root = path.join(armRoot, repositoryId);
    const changed = await changedPaths(root);
    const allowed = serviceAffectedPath(repositoryId);
    const disallowed = changed.filter((entry) => entry !== allowed);
    if (disallowed.length > 0) throw new Error(`${armId}-${slice.id}: out-of-scope writes in ${repositoryId}: ${disallowed.join(", ")}`);
    const changedLines = await diffLineCount(root);
    const testResult = await command("npm", ["test"], { cwd: root, env: process.env });
    if (changed.length > 0) {
      await git(root, ["add", "--", allowed]);
      await git(root, ["commit", "-m", `Implement ${slice.id} candidate`]);
    }
    const productRevision = await git(root, ["rev-parse", "HEAD"]);
    let handoffRevision = productRevision;
    if (armId === "temple") {
      handoffRevision = await completeTempleBuildRepository(root, turn.completion.summary, productRevision);
    } else {
      await writeText(path.join(root, "organization/HANDOFF.md"), [
        `# ${slice.id} handoff`, "", `Exact candidate revision: \`${productRevision}\`.`,
        `Tests: npm test exited ${testResult.status}.`, `Completed: ${turn.completion.summary}`,
        `Unresolved: ${turn.completion.unresolved.join("; ") || "none"}.`, ""
      ].join("\n"));
      await git(root, ["add", "organization/HANDOFF.md"]);
      await git(root, ["commit", "-m", `Record ${slice.id} handoff`]);
      handoffRevision = await git(root, ["rev-parse", "HEAD"]);
    }
    repositoriesResult[repositoryId] = {
      launch_revision: before[repositoryId],
      product_revision: productRevision,
      handoff_revision: handoffRevision,
      changed_paths: changed,
      changed_lines: changedLines,
      public_test_exit_code: testResult.status,
      public_test_output_sha256: sha256(`${testResult.stdout}\n${testResult.stderr}`)
    };
  }
  return { ...turn, repositories: repositoriesResult };
}

async function currentProductRevisions(armRoot) {
  const result = {};
  for (const repositoryId of services) {
    const root = path.join(armRoot, repositoryId);
    result[repositoryId] = await git(root, ["rev-parse", "HEAD"]);
  }
  return result;
}

async function objectiveTests(armRoot) {
  const serviceResults = {};
  for (const repositoryId of services) {
    const result = await command("npm", ["test"], { cwd: path.join(armRoot, repositoryId), env: process.env });
    serviceResults[repositoryId] = { exit_code: result.status, output_sha256: sha256(`${result.stdout}\n${result.stderr}`) };
  }
  const publicIntegration = await command("npm", ["test"], { cwd: path.join(armRoot, "coordinator"), env: process.env });
  const heldOut = await command(process.execPath, ["--test", path.join(fixtureRoot, "coordinator/evaluator-only/held-out-integration.test.mjs")], {
    cwd: armRoot,
    env: { ...process.env, TEMPLE_BENCHMARK_ARM_ROOT: armRoot }
  });
  return {
    services: serviceResults,
    public_integration: { exit_code: publicIntegration.status, output_sha256: sha256(`${publicIntegration.stdout}\n${publicIntegration.stderr}`) },
    held_out: { exit_code: heldOut.status, output_sha256: sha256(`${heldOut.stdout}\n${heldOut.stderr}`) },
    pass: Object.values(serviceResults).every((entry) => entry.exit_code === 0) && publicIntegration.status === 0 && heldOut.status === 0
  };
}

async function finalizeTempleIntegration(coordinatorRoot, report) {
  await writeJson(path.join(coordinatorRoot, "integration-report.json"), report);
  await git(coordinatorRoot, ["add", "integration-report.json"]);
  await git(coordinatorRoot, ["commit", "-m", "Record Temple cold integration recovery"]);
  const revision = await git(coordinatorRoot, ["rev-parse", "HEAD"]);
  await temple(coordinatorRoot, [
    "handoff", ".", "--work-item", "WI-0001", "--to", "quality_evaluator",
    "--input-revision", revision,
    "--completed", report.summary,
    "--evidence", "integration-report.json"
  ]);
  await temple(coordinatorRoot, ["work-item", "release", ".", "--work-item", "WI-0001", "--agent-id", "agent-fixture-rikku", "--principal-id", "human", "--reason", "Cold integration handoff complete"]);
  await temple(coordinatorRoot, [
    "transition", ".", "--work-item", "WI-0001", "--to", "test",
    "--satisfy", "developer_handoff=integration-report.json",
    "--satisfy", "developer_evidence=integration-report.json"
  ]);
  await git(coordinatorRoot, ["add", "-A"]);
  await git(coordinatorRoot, ["commit", "-m", "Advance Temple integration to test"]);
  return { product_revision: revision, organization_revision: await git(coordinatorRoot, ["rev-parse", "HEAD"]) };
}

async function finalizeMinimalIntegration(coordinatorRoot, report) {
  await writeJson(path.join(coordinatorRoot, "integration-report.json"), report);
  await writeText(path.join(coordinatorRoot, "organization/INTEGRATION_HANDOFF.md"), `# Integration handoff\n\n${report.summary}\n\nNext action: ${report.safe_next_action}\n`);
  await git(coordinatorRoot, ["add", "integration-report.json", "organization/INTEGRATION_HANDOFF.md"]);
  await git(coordinatorRoot, ["commit", "-m", "Record minimal cold integration recovery"]);
  return { product_revision: await git(coordinatorRoot, ["rev-parse", "HEAD"]) };
}

function goldenDesignRecord() {
  return {
    contract_version: "OrderPlaced/v2",
    rollout_order: ["notifications", "orders-catalog", "gateway"],
    slices: buildSlices().map((slice) => ({ id: slice.id, repositories: slice.repositories, responsibility: `${slice.id} golden rehearsal` })),
    risks: ["retained v1 compatibility"],
    assumptions: ["local synthetic fixture"]
  };
}

async function prepareGoldenTempleRecoveryState(armRoot) {
  const coordinatorRoot = path.join(armRoot, "coordinator");
  await claimTempleRepository(coordinatorRoot, "agent-fixture-tidus");
  await finalizeTempleDesign(coordinatorRoot, goldenDesignRecord());
  for (const repositoryId of services) {
    const root = path.join(armRoot, repositoryId);
    await claimTempleRepository(root, "agent-fixture-rikku");
    await fs.copyFile(
      path.join(fixtureRoot, "evaluator-only/golden", serviceAffectedPath(repositoryId).split("/").at(-1)),
      path.join(root, serviceAffectedPath(repositoryId))
    );
    await git(root, ["add", "--", serviceAffectedPath(repositoryId)]);
    await git(root, ["commit", "-m", `Apply ${repositoryId} golden recovery fixture`]);
    const productRevision = await git(root, ["rev-parse", "HEAD"]);
    await completeTempleBuildRepository(root, "Golden no-generation recovery fixture", productRevision);
  }
  const expectedRevisions = Object.fromEntries(await Promise.all(
    services.map(async (repositoryId) => [repositoryId, await git(path.join(armRoot, repositoryId), ["rev-parse", "HEAD"])])
  ));
  const portfolioRevision = await installArmPortfolio(armRoot, "temple", expectedRevisions);
  const objective = await objectiveTests(armRoot);
  const states = {};
  let doctorPass = true;
  for (const repositoryId of repositories) {
    const root = path.join(armRoot, repositoryId);
    const item = await readJson(path.join(root, ".ai-org/work-items/WI-0001.json"));
    states[repositoryId] = item.state;
    const doctor = JSON.parse(await temple(root, ["doctor", ".", "--json"]));
    doctorPass = doctorPass && doctor.summary?.fail === 0;
  }
  return {
    pass: objective.pass && doctorPass && states.coordinator === "build" && services.every((repositoryId) => states[repositoryId] === "test"),
    expected_revisions: expectedRevisions,
    portfolio_revision: portfolioRevision,
    objective_pass: objective.pass,
    doctor_pass: doctorPass,
    states,
    model_generation_performed: false
  };
}

async function rehearseTempleLifecycle(labRoot) {
  const rehearsalRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0136-lifecycle-"));
  try {
    const sourceRoot = path.join(labRoot, "arms", "temple");
    for (const repositoryId of repositories) {
      await checked("git", ["clone", "--quiet", "--no-hardlinks", path.join(sourceRoot, repositoryId), path.join(rehearsalRoot, repositoryId)], {
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
      });
    }
    const coordinatorRoot = path.join(rehearsalRoot, "coordinator");
    await claimTempleRepository(coordinatorRoot, "agent-fixture-tidus");
    await finalizeTempleDesign(coordinatorRoot, goldenDesignRecord());
    for (const repositoryId of services) {
      const root = path.join(rehearsalRoot, repositoryId);
      await claimTempleRepository(root, "agent-fixture-rikku");
      await fs.copyFile(
        path.join(fixtureRoot, "evaluator-only/golden", serviceAffectedPath(repositoryId).split("/").at(-1)),
        path.join(root, serviceAffectedPath(repositoryId))
      );
      await git(root, ["add", "--", serviceAffectedPath(repositoryId)]);
      await git(root, ["commit", "-m", `Apply ${repositoryId} golden rehearsal`]);
      const productRevision = await git(root, ["rev-parse", "HEAD"]);
      await completeTempleBuildRepository(root, "Golden no-generation lifecycle rehearsal", productRevision);
    }
    await installArmPortfolio(
      rehearsalRoot,
      "temple",
      Object.fromEntries(await Promise.all(services.map(async (repositoryId) => [repositoryId, await git(path.join(rehearsalRoot, repositoryId), ["rev-parse", "HEAD"])])))
    );
    await claimTempleRepository(coordinatorRoot, "agent-fixture-rikku");
    await finalizeTempleIntegration(coordinatorRoot, {
      recovered_revisions: await Promise.all(services.map(async (repositoryId) => ({ repository: repositoryId, revision: await git(path.join(rehearsalRoot, repositoryId), ["rev-parse", "HEAD"]) }))),
      governing_contract: "TASK.md and OrderPlaced/v2",
      completed_slices: buildSlices().map((slice) => slice.id),
      unresolved: [],
      safe_next_action: "Run bounded independent evaluation without deployment or publication.",
      summary: "Recovered every exact repository revision and completed the bounded local integration."
    });
    const states = {};
    let doctorPass = true;
    for (const repositoryId of repositories) {
      const root = path.join(rehearsalRoot, repositoryId);
      const item = await readJson(path.join(root, ".ai-org/work-items/WI-0001.json"));
      states[repositoryId] = item.state;
      const doctor = JSON.parse(await temple(root, ["doctor", ".", "--json"]));
      doctorPass = doctorPass && doctor.summary?.fail === 0;
    }
    const objective = await objectiveTests(rehearsalRoot);
    return {
      pass: doctorPass && objective.pass && Object.values(states).every((state) => state === "test"),
      states,
      doctor_pass: doctorPass,
      objective_pass: objective.pass,
      model_generation_performed: false
    };
  } catch (error) {
    return {
      pass: false,
      reason: String(error.message ?? error),
      model_generation_performed: false
    };
  } finally {
    await fs.rm(rehearsalRoot, { recursive: true, force: true });
  }
}

async function runIntegrationTurn({ armId, armRoot, protocol, budget, deadline }) {
  const coordinatorRoot = path.join(armRoot, "coordinator");
  if (armId === "temple") await claimTempleRepository(coordinatorRoot, "agent-fixture-rikku");
  const instruction = [
    "You are a fresh integration owner with no prior conversation. This is the known bounded Work Item WI-0001, not new or unknown-scope work. Recover its exact current state using repository files only.",
    armId === "temple"
      ? `${templeRoutedContextInstruction("the Coordinator repository", "coordinator/templew.mjs", "coordinator")} Do not mutate lifecycle state.`
      : "Start from coordinator/TASK.md, coordinator/design-record.json, and ordinary organization handoffs.",
    "Only after completing that first-action requirement, inspect all four service repositories, their current Git revisions, the governing contract, the design record, and every retained slice handoff.",
    "Return exact revisions for gateway, catalog, orders, and notifications; name completed slice IDs, unresolved work, and the safe bounded next action.",
    "Do not modify files, fix code, deploy, publish, or infer anything from conversation memory."
  ].join("\n\n");
  const turn = await launchModelTurn({
    id: `${armId}-integration`, cwd: armRoot, stage: "integration", route: protocol.model_route.integration,
    instruction, outputSchema: integrationOutputSchema, protocol, budget, deadline, sandbox: "read-only"
  });
  const objective = await objectiveTests(armRoot);
  const expectedRevisions = await currentProductRevisions(armRoot);
  const recovered = Object.fromEntries(turn.completion.recovered_revisions.map((entry) => [entry.repository, entry.revision]));
  const recovery = {
    exact_revision_count: services.filter((entry) => recovered[entry] === expectedRevisions[entry]).length,
    exact_revision_total: services.length,
    governing_contract_named: /TASK\.md|OrderPlaced\/v2|OrderPlaced v2/i.test(turn.completion.governing_contract),
    completed_slice_count: buildSlices().filter((slice) => turn.completion.completed_slices.includes(slice.id)).length,
    completed_slice_total: buildSlices().length,
    unresolved_reported: Array.isArray(turn.completion.unresolved),
    safe_next_action_bounded: !/deploy|publish|release to production/i.test(turn.completion.safe_next_action)
  };
  const finalized = armId === "temple"
    ? await finalizeTempleIntegration(coordinatorRoot, turn.completion)
    : await finalizeMinimalIntegration(coordinatorRoot, turn.completion);
  return { ...turn, ...finalized, expected_revisions: expectedRevisions, recovery, objective_tests: objective };
}

export function ablationIntegrationInstruction(condition) {
  const definition = ablationConditionDefinition(condition);
  const contextInstruction = definition.context_strategy === "full-load"
    ? "From the experiment workspace root, before reading any other repository file, read `coordinator/TEMPLE.md` in full. Only after that successful full read, preview `node coordinator/templew.mjs context resolve coordinator --work-item WI-0001 --position developer --no-write --json`, then inspect the sources named by the Context Capsule."
    : templeRoutedContextInstruction("the Coordinator repository", "coordinator/templew.mjs", "coordinator");
  return [
    "You are a fresh integration owner with no prior conversation. This is the known bounded Work Item WI-0001, not new or unknown-scope work. Recover its exact current state using repository files only.",
    "Before inspecting repository content, follow this condition-specific first-action requirement exactly:",
    contextInstruction,
    "Only after completing that first-action requirement, inspect all four service repositories, their current Git revisions, the governing contract, the design record, and every retained slice handoff.",
    "Return exact revisions for gateway, catalog, orders, and notifications; name completed slice IDs, unresolved work, and the safe bounded next action.",
    "Do not modify files, fix code, deploy, publish, or infer anything from conversation memory."
  ].join("\n\n");
}

function contextPromptContract() {
  return {
    base_instructions: textMetrics(boundedBaseInstructions),
    developer_instructions: textMetrics(boundedDeveloperInstructions),
    output_schema: textMetrics(JSON.stringify(integrationOutputSchema)),
    conditions: Object.fromEntries(ablationConditions.map((condition) => {
      const definition = ablationConditionDefinition(condition);
      return [condition, {
      strategy: definition.context_strategy === "full-load" ? "temple-full-load-v3" : "temple-routed-context-v3",
      model: definition.model,
      reasoning_effort: definition.reasoning_effort,
      user_input: textMetrics(ablationIntegrationInstruction(condition))
    }];
    }))
  };
}

function conditionParity(conditions) {
  if (!Array.isArray(conditions) || conditions.length !== ablationConditions.length) return false;
  const normalized = conditions.map((condition) => Object.fromEntries(
    repositories.map((repositoryId) => [repositoryId, {
      revision: condition.repositories?.[repositoryId]?.revision,
      tree: condition.repositories?.[repositoryId]?.tree,
      clean: condition.repositories?.[repositoryId]?.clean
    }])
  ));
  return normalized.slice(1).every((entry) => JSON.stringify(entry) === JSON.stringify(normalized[0]));
}

function buildAblationProtocol(manifest) {
  const protocol = {
    schema_version: "temple.context-model-diagnostic/v10",
    work_item_id: "WI-0136",
    status: "generation-disabled",
    protocol_sha256: null,
    lab_manifest_sha256: manifest.manifest_sha256,
    source_digests: manifest.source_digests,
    prompt_contract: contextPromptContract(),
    conditions: manifest.conditions.map((condition) => ({
      id: condition.id,
      context_strategy: ablationConditionDefinition(condition.id).context_strategy,
      model_route: {
        model: ablationConditionDefinition(condition.id).model,
        reasoning_effort: ablationConditionDefinition(condition.id).reasoning_effort
      },
      operational_token_limit: ablationConditionDefinition(condition.id).operational_token_limit,
      repositories: Object.fromEntries(repositories.map((repositoryId) => [repositoryId, {
        revision: condition.repositories[repositoryId].revision,
        tree: condition.repositories[repositoryId].tree
      }]))
    })),
    execution: {
      condition_order: [...ablationConditions],
      candidate_turns: ablationConditions.length,
      evaluator_turns: 0,
      retry_count: 0,
      fallback_count: 0,
      network_access: false,
      generation_ready: false,
      exact_approval_required: true,
      candidate_limit_disposition: "record-censored-and-continue-independent-conditions",
      integration_operational_token_limit: null,
      candidate_aggregate_operational_token_limit: null,
      combined_operational_token_limit: null,
      program_wall_clock_limit_ms: null
    },
    provider_contract: null,
    limit_basis: null,
    measures: [
      "objective-recovery",
      "exact-revisions",
      "governing-contract",
      "completed-slices",
      "safe-next-action",
      "input-tokens",
      "cached-input-tokens",
      "output-tokens",
      "operational-tokens",
      "reasoning-output-tokens",
      "elapsed-ms",
      "session-setup-ms",
      "turn-elapsed-ms",
      "time-to-first-activity-ms",
      "time-to-first-command-ms",
      "effective-output-tokens-per-second",
      "explicit-prompt-bytes",
      "context-command-sequence",
      "reported-tool-output-bytes"
    ],
    claims: {
      statistical_generalization: false,
      main_comparison_result: false,
      automatic_routing_authority: false,
      monetary_cost_known: false,
      raw_prompts_retained: false,
      raw_responses_retained: false,
      hidden_reasoning_retained: false
    }
  };
  protocol.protocol_sha256 = protocolDigest(protocol);
  return protocol;
}

export function validateAblationProtocol(protocol) {
  const errors = [];
  if (protocol?.schema_version !== "temple.context-model-diagnostic/v10") errors.push("unsupported ablation schema");
  if (protocol?.work_item_id !== "WI-0136" || protocol?.status !== "generation-disabled") errors.push("ablation identity or status mismatch");
  if (protocol?.protocol_sha256 !== protocolDigest(protocol)) errors.push("ablation protocol digest mismatch");
  if (JSON.stringify(protocol?.execution?.condition_order) !== JSON.stringify(ablationConditions)) errors.push("condition order mismatch");
  if (protocol?.execution?.candidate_turns !== ablationConditions.length || protocol?.execution?.evaluator_turns !== 0) errors.push("ablation execution shape mismatch");
  if (protocol?.execution?.retry_count !== 0 || protocol?.execution?.fallback_count !== 0 || protocol?.execution?.network_access !== false) errors.push("ablation retry, fallback, or network boundary mismatch");
  if (protocol?.execution?.candidate_limit_disposition !== "record-censored-and-continue-independent-conditions") errors.push("ablation candidate-limit disposition mismatch");
  for (const definition of ablationConditionDefinitions) {
    const condition = protocol?.conditions?.find((entry) => entry.id === definition.id);
    if (condition?.context_strategy !== definition.context_strategy ||
      condition?.model_route?.model !== definition.model ||
      condition?.model_route?.reasoning_effort !== definition.reasoning_effort ||
      condition?.operational_token_limit !== definition.operational_token_limit) {
      errors.push(`${definition.id} diagnostic route mismatch`);
    }
  }
  if (!conditionParity(protocol?.conditions?.map((condition) => ({
    ...condition,
    repositories: Object.fromEntries(Object.entries(condition.repositories ?? {}).map(([id, value]) => [id, { ...value, clean: true }]))
  })))) errors.push("ablation repository conditions are not matched");
  const promptContract = protocol?.prompt_contract;
  const outputSchemaCheck = validateProviderOutputSchema(integrationOutputSchema);
  if (!outputSchemaCheck.supported) errors.push(`Provider output schema is unsupported: ${outputSchemaCheck.errors.join("; ")}`);
  if (promptContract?.output_schema?.sha256 !== outputSchemaCheck.schema_sha256) errors.push("ablation output schema digest mismatch");
  if (!ablationConditions.every((condition) => promptContract?.conditions?.[condition])) errors.push("ablation prompt contract missing");
  for (const definition of ablationConditionDefinitions) {
    const prompt = promptContract?.conditions?.[definition.id];
    if (prompt?.model !== definition.model || prompt?.reasoning_effort !== definition.reasoning_effort) {
      errors.push(`${definition.id} prompt route mismatch`);
    }
  }
  if (promptContract?.conditions?.["terra-full-load"]?.user_input?.sha256 === promptContract?.conditions?.["terra-routed"]?.user_input?.sha256) errors.push("ablation prompt strategies are not distinct");
  const frozen = protocol?.execution?.integration_operational_token_limit !== null && protocol?.execution?.integration_operational_token_limit !== undefined;
  if (frozen) {
    for (const field of ["integration_operational_token_limit", "candidate_aggregate_operational_token_limit", "combined_operational_token_limit", "program_wall_clock_limit_ms"]) {
      if (!Number.isSafeInteger(protocol.execution[field]) || protocol.execution[field] <= 0) errors.push(`${field} must be a positive integer when frozen`);
    }
    const conditionLimitTotal = protocol.conditions.reduce((sum, condition) => sum + condition.operational_token_limit, 0);
    const maximumConditionLimit = Math.max(...protocol.conditions.map((condition) => condition.operational_token_limit));
    if (protocol.execution.integration_operational_token_limit !== maximumConditionLimit) errors.push("ablation maximum condition limit mismatch");
    if (protocol.execution.candidate_aggregate_operational_token_limit !== conditionLimitTotal) errors.push("ablation aggregate limit mismatch");
    if (protocol.execution.combined_operational_token_limit !== protocol.execution.candidate_aggregate_operational_token_limit) errors.push("ablation combined limit mismatch");
    if (!protocol?.provider_contract?.codex_cli_version || !protocol?.provider_contract?.schema_digests) errors.push("frozen ablation requires a Provider contract");
    const expectedOutputSchemaContract = validateProviderOutputSchema(integrationOutputSchema);
    if (JSON.stringify(protocol?.provider_contract?.structured_output_schema) !== JSON.stringify(expectedOutputSchemaContract)) {
      errors.push("frozen diagnostic output schema contract mismatch");
    }
    const expectedModels = [
      { model: "gpt-5.6-terra", reasoning_efforts: ["medium"] }
    ];
    if (JSON.stringify(protocol?.provider_contract?.required_models) !== JSON.stringify(expectedModels)) errors.push("frozen diagnostic Provider routes mismatch");
  }
  return { valid: errors.length === 0, errors };
}

async function preserveExactArtifact(source, target, expectedSchemaVersion) {
  if (!await exists(source)) return;
  const parsed = await readJson(source);
  if (parsed.schema_version !== expectedSchemaVersion) return;
  const sourceBytes = await fs.readFile(source);
  if (await exists(target)) {
    const targetBytes = await fs.readFile(target);
    if (!sourceBytes.equals(targetBytes)) throw new Error(`refusing to replace drifted preserved artifact: ${target}`);
    return;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, sourceBytes, { flag: "wx" });
}

async function preservePriorAblationEvidence(protocolPath) {
  const artifactRoot = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136");
  await preserveExactArtifact(
    protocolPath,
    path.join(artifactRoot, "context-recovery-qualification-v6-protocol.json"),
    "temple.context-model-diagnostic/v6"
  );
  await preserveExactArtifact(
    defaultAblationApprovalPath,
    path.join(artifactRoot, "context-recovery-qualification-v6-approval.json"),
    "temple.context-model-diagnostic-account-approval/v6"
  );
  await preserveExactArtifact(
    defaultAblationApprovalTemplatePath,
    path.join(artifactRoot, "context-recovery-qualification-v6-approval-template.json"),
    "temple.context-model-diagnostic-account-approval/v6"
  );
  await preserveExactArtifact(
    protocolPath,
    path.join(artifactRoot, "context-recovery-qualification-v7-protocol.json"),
    "temple.context-model-diagnostic/v7"
  );
  await preserveExactArtifact(
    defaultAblationApprovalPath,
    path.join(artifactRoot, "context-recovery-qualification-v7-approval.json"),
    "temple.context-model-diagnostic-account-approval/v7"
  );
  await preserveExactArtifact(
    defaultAblationApprovalTemplatePath,
    path.join(artifactRoot, "context-recovery-qualification-v7-approval-template.json"),
    "temple.context-model-diagnostic-account-approval/v7"
  );
  await preserveExactArtifact(
    path.join(priorAblationLabRoots.v7, "ablation-preflight.json"),
    path.join(artifactRoot, "context-recovery-qualification-v7-preflight.json"),
    "temple.context-model-diagnostic-preflight/v7"
  );
  await preserveExactArtifact(
    path.join(priorAblationLabRoots.v7, "ablation-stopped-run.json"),
    path.join(artifactRoot, "context-recovery-qualification-v7-stopped-run.json"),
    "temple.context-model-diagnostic-stopped-run/v7"
  );
  await preserveExactArtifact(
    protocolPath,
    path.join(artifactRoot, "context-recovery-qualification-v8-protocol.json"),
    "temple.context-model-diagnostic/v8"
  );
  await preserveExactArtifact(
    defaultAblationApprovalPath,
    path.join(artifactRoot, "context-recovery-qualification-v8-approval.json"),
    "temple.context-model-diagnostic-account-approval/v8"
  );
  await preserveExactArtifact(
    defaultAblationApprovalTemplatePath,
    path.join(artifactRoot, "context-recovery-qualification-v8-approval-template.json"),
    "temple.context-model-diagnostic-account-approval/v8"
  );
  await preserveExactArtifact(
    path.join(priorAblationLabRoots.v8, "ablation-preflight.json"),
    path.join(artifactRoot, "context-recovery-qualification-v8-preflight.json"),
    "temple.context-model-diagnostic-preflight/v8"
  );
  await preserveExactArtifact(
    path.join(priorAblationLabRoots.v8, "ablation-stopped-run.json"),
    path.join(artifactRoot, "context-recovery-qualification-v8-stopped-run.json"),
    "temple.context-model-diagnostic-stopped-run/v8"
  );
  await preserveExactArtifact(
    protocolPath,
    path.join(artifactRoot, "context-recovery-qualification-v9-protocol.json"),
    "temple.context-model-diagnostic/v9"
  );
  await preserveExactArtifact(
    defaultAblationApprovalPath,
    path.join(artifactRoot, "context-recovery-qualification-v9-approval.json"),
    "temple.context-model-diagnostic-account-approval/v9"
  );
  await preserveExactArtifact(
    defaultAblationApprovalTemplatePath,
    path.join(artifactRoot, "context-recovery-qualification-v9-approval-template.json"),
    "temple.context-model-diagnostic-account-approval/v9"
  );
  await preserveExactArtifact(
    path.join(priorAblationLabRoots.v9, "ablation-preflight.json"),
    path.join(artifactRoot, "context-recovery-qualification-v9-preflight.json"),
    "temple.context-model-diagnostic-preflight/v9"
  );
  await preserveExactArtifact(
    path.join(priorAblationLabRoots.v9, "ablation-stopped-run.json"),
    path.join(artifactRoot, "context-recovery-qualification-v9-stopped-run.json"),
    "temple.context-model-diagnostic-stopped-run/v9"
  );
}

async function setupAblation(labRoot, protocolPath) {
  if (await exists(labRoot)) throw new Error(`refusing to replace existing ablation lab: ${labRoot}`);
  await preservePriorAblationEvidence(protocolPath);
  await fs.mkdir(labRoot, { recursive: true });
  const createdAt = new Date().toISOString();
  try {
    const source = await createArm(labRoot, "source", "temple");
    const sourceRoot = path.join(labRoot, "arms", "source");
    const prepared = await prepareGoldenTempleRecoveryState(sourceRoot);
    if (!prepared.pass) throw new Error("generation-free recovery state preparation failed");
    const conditions = [];
    for (const condition of ablationConditions) {
      const conditionRoot = path.join(labRoot, "conditions", condition);
      await fs.mkdir(path.dirname(conditionRoot), { recursive: true });
      await fs.cp(sourceRoot, conditionRoot, { recursive: true, force: false, errorOnExist: true });
      conditions.push({
        id: condition,
        root: conditionRoot,
        repositories: Object.fromEntries(await Promise.all(repositories.map(async (repositoryId) => [repositoryId, await repositorySnapshot(path.join(conditionRoot, repositoryId))])))
      });
    }
    if (!conditionParity(conditions)) throw new Error("ablation conditions are not byte-equivalent at Git revision and tree boundaries");
    const manifest = {
      schema_version: "temple.context-model-diagnostic-lab/v10",
      work_item_id: "WI-0136",
      created_at: createdAt,
      lab_root: labRoot,
      source_digests: await sourceDigests(),
      source_arm: source,
      prepared_recovery_state: prepared,
      conditions,
      model_generation_performed: false,
      manifest_sha256: null
    };
    manifest.manifest_sha256 = sha256(JSON.stringify(stable({ ...manifest, manifest_sha256: null })));
    await writeJson(path.join(labRoot, "ablation-manifest.json"), manifest, { exclusive: true });
    const protocol = buildAblationProtocol(manifest);
    const validation = validateAblationProtocol(protocol);
    if (!validation.valid) throw new Error(`generated ablation protocol invalid: ${validation.errors.join(", ")}`);
    await writeJson(protocolPath, protocol);
    return { manifest, protocol, validation };
  } catch (error) {
    await writeJson(path.join(labRoot, "setup-failure.json"), {
      schema_version: "temple.context-model-diagnostic-setup-failure/v10",
      work_item_id: "WI-0136",
      stopped_at: new Date().toISOString(),
      reason: String(error.message ?? error),
      model_generation_performed: false
    }).catch(() => {});
    throw error;
  }
}

function ablationApprovalTemplate(protocol) {
  const routes = protocol.conditions.map((condition) => condition.model_route);
  return {
    schema_version: "temple.context-model-diagnostic-account-approval/v10",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    approved: false,
    authorization_source: null,
    approved_candidate_turns: protocol.execution.candidate_turns,
    approved_models: [...new Set(routes.map((route) => route.model))],
    approved_reasoning_efforts: [...new Set(routes.map((route) => route.reasoning_effort))],
    approved_condition_operational_token_limits: Object.fromEntries(protocol.conditions.map((condition) => [condition.id, condition.operational_token_limit])),
    approved_candidate_operational_tokens: protocol.execution.candidate_aggregate_operational_token_limit,
    approved_combined_operational_tokens: protocol.execution.combined_operational_token_limit,
    approved_program_wall_clock_ms: protocol.execution.program_wall_clock_limit_ms,
    pro_included_allowance_only: true,
    credits_purchase_authorized: false,
    automatic_refill_authorized: false,
    usage_reset_authorized: false,
    retry_count: 0,
    fallback_count: 0,
    approved_at: null
  };
}

export function validateAblationApproval(approval, protocol) {
  const expected = ablationApprovalTemplate(protocol);
  const errors = [];
  if (approval?.schema_version !== expected.schema_version) errors.push("unsupported ablation approval schema");
  if (approval?.work_item_id !== expected.work_item_id || approval?.protocol_sha256 !== expected.protocol_sha256) errors.push("ablation approval target mismatch");
  if (approval?.approved !== true || !approval?.authorization_source || !approval?.approved_at) errors.push("affirmative ablation approval record is incomplete");
  for (const key of [
    "approved_candidate_turns", "approved_candidate_operational_tokens", "approved_combined_operational_tokens",
    "approved_program_wall_clock_ms", "pro_included_allowance_only", "credits_purchase_authorized",
    "automatic_refill_authorized", "usage_reset_authorized", "retry_count", "fallback_count"
  ]) {
    if (approval?.[key] !== expected[key]) errors.push(`${key} does not match the frozen ablation protocol`);
  }
  if (JSON.stringify(approval?.approved_models) !== JSON.stringify(expected.approved_models)) errors.push("approved ablation models mismatch");
  if (JSON.stringify(approval?.approved_reasoning_efforts) !== JSON.stringify(expected.approved_reasoning_efforts)) errors.push("approved ablation efforts mismatch");
  if (JSON.stringify(approval?.approved_condition_operational_token_limits) !== JSON.stringify(expected.approved_condition_operational_token_limits)) errors.push("approved ablation condition limits mismatch");
  return { accepted: errors.length === 0, errors };
}

async function freezeAblation(protocolPath) {
  const protocol = await readJson(protocolPath);
  const before = validateAblationProtocol(protocol);
  if (!before.valid) throw new Error(`ablation protocol invalid before freeze: ${before.errors.join(", ")}`);
  const handshake = await providerHandshake();
  const terra = handshake.model_checks.find((entry) => entry.model === "gpt-5.6-terra");
  const terraEfforts = new Set(terra?.observed_reasoning_efforts ?? []);
  if (!terra?.available || !terraEfforts.has("medium")) {
    throw new Error("required Terra medium Provider route is unavailable");
  }
  const frozen = structuredClone(protocol);
  const outputSchemaContract = validateProviderOutputSchema(integrationOutputSchema);
  if (!outputSchemaContract.supported) {
    throw new Error(`Provider output schema is unsupported: ${outputSchemaContract.errors.join(", ")}`);
  }
  frozen.provider_contract = {
    codex_cli_version: handshake.codex_cli_version,
    schema_digests: handshake.schema_digests,
    structured_output_schema: outputSchemaContract,
    required_models: [
      { model: "gpt-5.6-terra", reasoning_efforts: ["medium"] }
    ]
  };
  Object.assign(frozen.execution, {
    integration_operational_token_limit: 120000,
    candidate_aggregate_operational_token_limit: 200000,
    combined_operational_token_limit: 200000,
    program_wall_clock_limit_ms: 1200000
  });
  frozen.limit_basis = {
    sources: [
      ".ai-org/artifacts/WI-0136/context-model-diagnostic-v3-stopped-run.json",
      ".ai-org/artifacts/WI-0136/context-model-diagnostic-v5-stopped-run.json"
    ],
    source_sha256: {
      v3_stopped_run: sha256(await fs.readFile(path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/context-model-diagnostic-v3-stopped-run.json"))),
      v5_stopped_run: sha256(await fs.readFile(path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/context-model-diagnostic-v5-stopped-run.json")))
    },
    routed_operational_token_limit: 80000,
    full_load_operational_token_limit: 120000,
    v5_completed_routed_operational_tokens: 53823,
    v3_full_load_stop_operational_tokens: 80621,
    meaning: "The two-condition qualification retains the reviewed 80,000 routed ceiling that v5 completed within 53,823 and the evidence-backed 120,000 full-load ceiling. The 200,000 total is the exact sum of condition ceilings, not expected use or price."
  };
  frozen.protocol_sha256 = protocolDigest(frozen);
  const after = validateAblationProtocol(frozen);
  if (!after.valid) throw new Error(`frozen ablation protocol invalid: ${after.errors.join(", ")}`);
  const approvalTemplate = ablationApprovalTemplate(frozen);
  if (await exists(defaultAblationApprovalPath)) {
    const currentApproval = await readJson(defaultAblationApprovalPath);
    if (currentApproval.schema_version === approvalTemplate.schema_version && currentApproval.approved === true) {
      throw new Error("refusing to replace an affirmative approval for the current ablation version");
    }
  }
  await writeJson(protocolPath, frozen);
  await writeJson(defaultAblationApprovalTemplatePath, approvalTemplate);
  await writeJson(defaultAblationApprovalPath, approvalTemplate);
  return {
    schema_version: "temple.context-model-diagnostic-freeze/v10",
    work_item_id: frozen.work_item_id,
    protocol_sha256: frozen.protocol_sha256,
    provider_handshake: handshake,
    limits: frozen.execution,
    approval_template: path.relative(repositoryRoot, defaultAblationApprovalTemplatePath),
    model_generation_performed: false
  };
}

async function inspectAblation(labRoot, protocolPath) {
  const manifest = await readJson(path.join(labRoot, "ablation-manifest.json"));
  const protocol = await readJson(protocolPath);
  const checks = [
    { id: "protocol-valid", pass: validateAblationProtocol(protocol).valid },
    { id: "manifest-digest", pass: manifest.manifest_sha256 === sha256(JSON.stringify(stable({ ...manifest, manifest_sha256: null }))) },
    { id: "protocol-manifest", pass: protocol.lab_manifest_sha256 === manifest.manifest_sha256 },
    { id: "source-current", pass: JSON.stringify(await sourceDigests()) === JSON.stringify(manifest.source_digests) },
    { id: "prompt-contract-current", pass: JSON.stringify(protocol.prompt_contract) === JSON.stringify(contextPromptContract()) },
    { id: "conditions-matched", pass: conditionParity(manifest.conditions) },
    { id: "prepared-recovery-state", pass: manifest.prepared_recovery_state?.pass === true }
  ];
  for (const condition of manifest.conditions) {
    for (const repositoryId of repositories) {
      const observed = await repositorySnapshot(path.join(condition.root, repositoryId));
      const expected = condition.repositories[repositoryId];
      checks.push({ id: `${condition.id}:${repositoryId}:revision`, pass: observed.revision === expected.revision });
      checks.push({ id: `${condition.id}:${repositoryId}:tree`, pass: observed.tree === expected.tree });
      checks.push({ id: `${condition.id}:${repositoryId}:clean`, pass: observed.clean === true });
    }
    const templePath = path.join(condition.root, "coordinator/TEMPLE.md");
    const templeText = await fs.readFile(templePath, "utf8").catch(() => "");
    checks.push({ id: `${condition.id}:coordinator-temple-readable`, pass: templeText.length > 0 });
    const contextProbe = await command(process.execPath, [
      "coordinator/templew.mjs", "context", "resolve", "coordinator",
      "--work-item", "WI-0001", "--position", "developer", "--no-write", "--json"
    ], {
      cwd: condition.root,
      env: {
        ...process.env,
        TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs")
      }
    });
    let contextProbePass = false;
    if (contextProbe.status === 0) {
      try {
        const capsule = JSON.parse(contextProbe.stdout);
        contextProbePass = capsule.schema_version === "temple.context-capsule/v1" &&
          capsule.work_item?.id === "WI-0001" && capsule.position?.id === "developer";
      } catch {}
    }
    checks.push({ id: `${condition.id}:root-relative-context-command`, pass: contextProbePass });
    for (const repositoryId of repositories) {
      checks.push({
        id: `${condition.id}:command-policy:git-c-${repositoryId}-rev-parse`,
        pass: commandTextAllowed(`git -C ${repositoryId} rev-parse HEAD`, comparisonAllowedCommandPrefixes)
      });
    }
  }
  return {
    schema_version: "temple.context-model-diagnostic-inspection/v10",
    work_item_id: "WI-0136",
    inspected_at: new Date().toISOString(),
    valid: checks.every((entry) => entry.pass),
    checks,
    model_generation_performed: false
  };
}

async function preflightAblation(labRoot, protocolPath, approvalPath) {
  const inspection = await inspectAblation(labRoot, protocolPath);
  const protocol = await readJson(protocolPath);
  const handshake = await providerHandshake();
  const requiredModels = protocol?.provider_contract?.required_models ?? [];
  const routeMatch = requiredModels.every((requirement) => {
    const observed = handshake.model_checks.find((entry) => entry.model === requirement.model);
    const efforts = new Set(observed?.observed_reasoning_efforts ?? []);
    return Boolean(observed?.available) && requirement.reasoning_efforts.every((effort) => efforts.has(effort));
  });
  const providerMatch = routeMatch && protocol?.provider_contract?.codex_cli_version === handshake.codex_cli_version &&
    JSON.stringify(protocol?.provider_contract?.schema_digests) === JSON.stringify(handshake.schema_digests);
  const outputSchemaCheck = validateProviderOutputSchema(integrationOutputSchema);
  const outputSchemaMatch = outputSchemaCheck.supported &&
    JSON.stringify(protocol?.provider_contract?.structured_output_schema) === JSON.stringify(outputSchemaCheck);
  const approval = approvalPath && await exists(approvalPath)
    ? validateAblationApproval(await readJson(approvalPath), protocol)
    : { accepted: false, errors: ["exact approval missing"] };
  const blockers = [];
  if (!inspection.valid) blockers.push("ablation-fixture-invalid");
  if (!providerMatch) blockers.push("provider-contract-drift");
  if (!outputSchemaMatch) blockers.push("provider-output-schema-unsupported-or-drifted");
  if (!approval.accepted) blockers.push("exact-human-approval-required");
  const output = {
    schema_version: "temple.context-model-diagnostic-preflight/v10",
    work_item_id: "WI-0136",
    observed_at: new Date().toISOString(),
    protocol_sha256: protocol.protocol_sha256,
    local_fixture_ready: inspection.valid,
    provider_handshake_performed: true,
    provider_contract_matches: providerMatch,
    provider_output_schema_checked_without_generation: true,
    provider_output_schema_matches: outputSchemaMatch,
    provider_output_schema_check: outputSchemaCheck,
    exact_approval_present: approval.accepted,
    approval_errors: approval.errors,
    generation_ready: blockers.length === 0,
    blockers,
    checks: [...inspection.checks, { id: "provider-output-schema-subset", pass: outputSchemaMatch }],
    model_generation_performed: false
  };
  await writeJson(path.join(labRoot, "ablation-preflight.json"), output);
  return output;
}

function recoveryObservation(completion, expectedRevisions) {
  const recovered = Object.fromEntries((completion?.recovered_revisions ?? []).map((entry) => [entry.repository, entry.revision]));
  const metrics = {
    exact_revision_count: services.filter((entry) => recovered[entry] === expectedRevisions[entry]).length,
    exact_revision_total: services.length,
    governing_contract_named: /TASK\.md|OrderPlaced\/v2|OrderPlaced v2/i.test(completion?.governing_contract ?? ""),
    completed_slice_count: integrationSliceIds.filter((sliceId) => completion?.completed_slices?.includes(sliceId)).length,
    completed_slice_total: integrationSliceIds.length,
    unresolved_reported: Array.isArray(completion?.unresolved),
    safe_next_action_bounded: !/deploy|publish|release to production/i.test(completion?.safe_next_action ?? "")
  };
  return {
    ...metrics,
    pass: metrics.exact_revision_count === metrics.exact_revision_total && metrics.governing_contract_named &&
      metrics.completed_slice_count === metrics.completed_slice_total && metrics.unresolved_reported && metrics.safe_next_action_bounded
  };
}

function validateContextSequence(contextStrategy, activity, allowIncompletePrefix = false) {
  const firstTemple = activity.context_sequence.indexOf("temple-md");
  const firstResolve = activity.context_sequence.indexOf("context-resolve");
  if (contextStrategy === "full-load") {
    return firstTemple >= 0 && (firstResolve < 0 ? allowIncompletePrefix : firstTemple < firstResolve);
  }
  if (firstResolve < 0) return false;
  return firstTemple < 0 || firstResolve < firstTemple;
}

export function diagnosticConditionObservation({ condition, contextStrategy, turn, expectedRevisions }) {
  const censored = turn?.status === "censored";
  return {
    condition,
    context_strategy: contextStrategy,
    context_strategy_observed: validateContextSequence(
      contextStrategy,
      turn?.tool_activity ?? { context_sequence: [] },
      turn?.status !== "completed"
    ),
    ...turn,
    expected_revisions: expectedRevisions,
    recovery: censored ? null : recoveryObservation(turn.completion, expectedRevisions)
  };
}

export function diagnosticStoppedRun({ protocol, startedAt, stoppedAt, completed, operationalTokens, reason }) {
  const completedConditions = completed.filter((entry) => entry.status === "completed" || entry.status === undefined);
  const censoredConditions = completed.filter((entry) => entry.status === "censored");
  const stoppedConditions = completed.filter((entry) => entry.status === "stopped");
  return {
    schema_version: "temple.context-model-diagnostic-stopped-run/v10",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    started_at: startedAt,
    stopped_at: stoppedAt,
    observed_condition_count: completed.length,
    completed_condition_count: completedConditions.length,
    censored_condition_count: censoredConditions.length,
    stopped_condition_count: stoppedConditions.length,
    observed_conditions: completed,
    completed_conditions: completedConditions,
    censored_conditions: censoredConditions,
    stopped_conditions: stoppedConditions,
    candidate_operational_tokens: operationalTokens,
    reason,
    retry_count: 0,
    fallback_count: 0,
    model_generation_performed: operationalTokens > 0 || completed.length > 0
  };
}

export function diagnosticConditionFailure(condition, observation) {
  if (observation.status === "stopped") return `${condition}:${observation.stop_reason}`;
  if (!observation.context_strategy_observed) return `${condition}:context-strategy-not-observed`;
  return null;
}

async function runAblation(labRoot, protocolPath, approvalPath) {
  if (!approvalPath) throw new Error("--approval is required for live ablation generation");
  const resultPath = path.join(labRoot, "ablation-run.json");
  if (await exists(resultPath) || await exists(path.join(labRoot, "ablation-stopped-run.json"))) throw new Error("live ablation attempt already exists; retries and resumes are prohibited");
  const protocol = await readJson(protocolPath);
  const preservedRunPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136/context-recovery-qualification-v10-run.json");
  if (await exists(preservedRunPath)) {
    const preservedRun = await readJson(preservedRunPath);
    if (preservedRun.protocol_sha256 === protocol.protocol_sha256) {
      throw new Error("the exact-approved ablation attempt has already been consumed and preserved");
    }
  }
  const gate = await preflightAblation(labRoot, protocolPath, approvalPath);
  if (!gate.generation_ready) throw new Error(`ablation generation blocked: ${gate.blockers.join(", ")}`);
  const manifest = await readJson(path.join(labRoot, "ablation-manifest.json"));
  const budget = createBudget(protocol);
  const startedAt = new Date().toISOString();
  const deadline = Date.now() + protocol.execution.program_wall_clock_limit_ms;
  const observed = [];
  try {
    for (const condition of protocol.execution.condition_order) {
      const conditionProtocol = protocol.conditions.find((entry) => entry.id === condition);
      if (!conditionProtocol) throw new Error(`${condition}:protocol-condition-missing`);
      const conditionRoot = path.join(labRoot, "conditions", condition);
      const turn = await launchModelTurn({
        id: `context-${condition}`,
        cwd: conditionRoot,
        stage: "integration",
        route: conditionProtocol.model_route,
        instruction: ablationIntegrationInstruction(condition),
        outputSchema: integrationOutputSchema,
        protocol,
        budget,
        deadline,
        sandbox: "read-only",
        retainStopOutcome: true,
        operationalTokenLimit: conditionProtocol.operational_token_limit
      });
      const expected = manifest.prepared_recovery_state.expected_revisions;
      const observation = diagnosticConditionObservation({
        condition,
        contextStrategy: conditionProtocol.context_strategy,
        turn,
        expectedRevisions: expected
      });
      observed.push(observation);
      const conditionFailure = diagnosticConditionFailure(condition, observation);
      if (conditionFailure) throw new Error(conditionFailure);
    }
    const completedCount = observed.filter((entry) => entry.status === "completed").length;
    const censoredCount = observed.filter((entry) => entry.status === "censored").length;
    const output = {
      schema_version: "temple.context-model-diagnostic-run/v10",
      work_item_id: protocol.work_item_id,
      protocol_sha256: protocol.protocol_sha256,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: censoredCount > 0 ? "completed-with-censored-conditions" : "completed",
      observed_condition_count: observed.length,
      completed_condition_count: completedCount,
      censored_condition_count: censoredCount,
      conditions: observed,
      candidate_operational_tokens: budget.total(),
      retry_count: 0,
      fallback_count: 0,
      model_generation_performed: true
    };
    await writeJson(resultPath, output, { exclusive: true });
    return output;
  } catch (error) {
    await writeJson(path.join(labRoot, "ablation-stopped-run.json"), diagnosticStoppedRun({
      protocol,
      startedAt,
      stoppedAt: new Date().toISOString(),
      completed: observed,
      operationalTokens: budget.total(),
      reason: String(error.message ?? error)
    }), { exclusive: true });
    throw error;
  }
}

export function analyzeContextAblation({ protocol, run, generatedAt = new Date().toISOString() }) {
  const runConditions = run?.conditions ?? run?.observed_conditions;
  const completedRun = ["completed", "completed-with-censored-conditions"].includes(run?.status);
  const stoppedRun = /^temple\.context-model-diagnostic-stopped-run\/v\d+$/.test(run?.schema_version ?? "");
  if ((!completedRun && !stoppedRun) || run?.protocol_sha256 !== protocol?.protocol_sha256) {
    throw new Error("completed protocol-matched ablation run required");
  }
  const byCondition = Object.fromEntries((runConditions ?? []).map((entry) => [entry.condition, entry]));
  const requiredConditions = ["terra-full-load", "terra-routed"];
  if (!requiredConditions.every((condition) => byCondition[condition])) throw new Error("both context qualification conditions are required");
  const metric = (entry) => ({
    status: entry.status,
    completed: entry.status === "completed" || entry.status === undefined,
    censored: entry.status === "censored",
    stopped: entry.status === "stopped",
    stop_reason: entry.stop_reason,
    requested_model: entry.requested_model,
    requested_reasoning_effort: entry.requested_reasoning_effort,
    observed_thread_reasoning_effort: entry.observed_thread_reasoning_effort ?? null,
    effective_turn_reasoning_effort: entry.effective_turn_reasoning_effort ?? null,
    recovery_pass: entry.recovery?.pass ?? null,
    exact_revision_count: entry.recovery?.exact_revision_count ?? null,
    operational_tokens: entry.operational_tokens,
    input_tokens: entry.usage.input_tokens,
    cached_input_tokens: entry.usage.cached_input_tokens,
    output_tokens: entry.usage.output_tokens,
    reasoning_output_tokens: entry.usage.reasoning_output_tokens,
    gross_tokens: entry.usage.total_tokens,
    elapsed_ms: entry.elapsed_ms,
    session_setup_ms: entry.session_setup_ms,
    turn_elapsed_ms: entry.turn_elapsed_ms,
    time_to_first_activity_ms: entry.time_to_first_activity_ms,
    time_to_first_command_ms: entry.time_to_first_command_ms,
    effective_output_tokens_per_second: entry.effective_output_tokens_per_second,
    explicit_prompt_bytes: entry.prompt_metrics.explicit_bytes,
    command_actions: entry.tool_activity.command_actions,
    temple_md_reads: entry.tool_activity.temple_md_reads,
    context_resolve_calls: entry.tool_activity.context_resolve_calls,
    reported_tool_output_bytes: entry.tool_activity.reported_output_bytes
  });
  const conditions = Object.fromEntries(Object.keys(byCondition).map((condition) => [condition, metric(byCondition[condition])]));
  const comparison = (baselineId, candidateId) => {
    const baseline = conditions[baselineId];
    const candidate = conditions[candidateId];
    const exactComparisonAvailable = baseline.completed && candidate.completed;
    const delta = (key) => Number.isFinite(candidate[key]) && Number.isFinite(baseline[key])
      ? candidate[key] - baseline[key]
      : null;
    const percent = (key) => baseline[key] === 0 || delta(key) === null
      ? null
      : Number(((delta(key) / baseline[key]) * 100).toFixed(2));
    return {
      baseline: baselineId,
      candidate: candidateId,
      exact_comparison_available: exactComparisonAvailable,
      baseline_censored: baseline.censored,
      candidate_censored: candidate.censored,
      baseline_stopped: baseline.stopped,
      candidate_stopped: candidate.stopped,
      objective_quality_equal: exactComparisonAvailable ? baseline.recovery_pass === candidate.recovery_pass : null,
      operational_token_delta: exactComparisonAvailable ? delta("operational_tokens") : null,
      operational_token_delta_percent: exactComparisonAvailable ? percent("operational_tokens") : null,
      gross_token_delta: exactComparisonAvailable ? delta("gross_tokens") : null,
      elapsed_ms_delta: exactComparisonAvailable ? delta("turn_elapsed_ms") : null,
      elapsed_ms_delta_percent: exactComparisonAvailable ? percent("turn_elapsed_ms") : null,
      time_to_first_activity_ms_delta: exactComparisonAvailable ? delta("time_to_first_activity_ms") : null,
      effective_output_tokens_per_second_delta: exactComparisonAvailable ? delta("effective_output_tokens_per_second") : null,
      reported_tool_output_byte_delta: exactComparisonAvailable ? delta("reported_tool_output_bytes") : null,
      effective_effort_comparison_available: exactComparisonAvailable &&
        baseline.effective_turn_reasoning_effort !== null && candidate.effective_turn_reasoning_effort !== null,
      observed_operational_token_lower_bound_delta: baseline.censored && !candidate.censored
        ? candidate.operational_tokens - baseline.operational_tokens
        : candidate.censored && baseline.completed
          ? candidate.operational_tokens - baseline.operational_tokens
        : null
    };
  };
  const contextComparison = comparison("terra-full-load", "terra-routed");
  const modelComparison = byCondition["sol-routed-medium"] ? comparison("terra-routed", "sol-routed-medium") : null;
  const effortComparison = byCondition["sol-routed-medium"] && byCondition["sol-routed-xhigh"]
    ? comparison("sol-routed-medium", "sol-routed-xhigh")
    : null;
  const contextOutcome = !conditions["terra-routed"].completed || conditions["terra-routed"].recovery_pass !== true
    ? "routed-context-not-ready"
    : conditions["terra-full-load"].censored
      ? "routed-context-supported-within-ceiling"
      : conditions["terra-full-load"].stopped
        ? "routed-context-supported-with-full-load-failure"
      : !conditions["terra-full-load"].recovery_pass || conditions["terra-routed"].operational_tokens < conditions["terra-full-load"].operational_tokens
      ? "routed-context-supported"
      : "routed-context-correct-savings-not-observed";
  return {
    schema_version: "temple.context-model-diagnostic-analysis/v10",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    generated_at: generatedAt,
    conditions,
    comparison: {
      context_routing: contextComparison,
      model_same_effort: modelComparison,
      sol_reasoning_effort: effortComparison
    },
    interpretation: {
      context_outcome: contextOutcome,
      use_routed_context_in_main_comparison: conditions["terra-routed"].recovery_pass === true,
      model_routing_change_authorized: false,
      statistical_generalization: false,
      main_comparison_result: false,
      note: "The declared one-attempt diagnostic conditions isolate context loading and, when present, requested model or effort choices. A censored condition proves only that its approved ceiling was reached, and a stopped condition preserves its causal failure; exact deltas involving either remain unavailable. Effective turn effort remains unknown unless the Provider reports it. These observations do not prove a population effect, automatic routing policy, or Temple effectiveness."
    }
  };
}

async function reportAblation(labRoot, protocolPath) {
  const protocol = await readJson(protocolPath);
  const completedPath = path.join(labRoot, "ablation-run.json");
  const stoppedPath = path.join(labRoot, "ablation-stopped-run.json");
  const completed = await exists(completedPath);
  const runPath = completed ? completedPath : stoppedPath;
  const run = await readJson(runPath);
  const generatedAt = run.completed_at ?? run.stopped_at;
  if (!generatedAt) throw new Error("ablation run completion time is required for deterministic analysis");
  const analysisPath = path.join(labRoot, "ablation-analysis.json");
  const analysis = analyzeContextAblation({ protocol, run, generatedAt });
  await writeJson(analysisPath, analysis);

  const artifactRoot = path.join(repositoryRoot, ".ai-org/artifacts/WI-0136");
  await preserveExactArtifact(
    protocolPath,
    path.join(artifactRoot, "context-recovery-qualification-v10-protocol.json"),
    "temple.context-model-diagnostic/v10"
  );
  await preserveExactArtifact(
    defaultAblationApprovalPath,
    path.join(artifactRoot, "context-recovery-qualification-v10-approval.json"),
    "temple.context-model-diagnostic-account-approval/v10"
  );
  await preserveExactArtifact(
    defaultAblationApprovalTemplatePath,
    path.join(artifactRoot, "context-recovery-qualification-v10-approval-template.json"),
    "temple.context-model-diagnostic-account-approval/v10"
  );
  await preserveExactArtifact(
    path.join(labRoot, "ablation-preflight.json"),
    path.join(artifactRoot, "context-recovery-qualification-v10-preflight.json"),
    "temple.context-model-diagnostic-preflight/v10"
  );
  await preserveExactArtifact(
    runPath,
    path.join(artifactRoot, completed
      ? "context-recovery-qualification-v10-run.json"
      : "context-recovery-qualification-v10-stopped-run.json"),
    completed
      ? "temple.context-model-diagnostic-run/v10"
      : "temple.context-model-diagnostic-stopped-run/v10"
  );
  await preserveExactArtifact(
    analysisPath,
    path.join(artifactRoot, "context-recovery-qualification-v10-analysis.json"),
    "temple.context-model-diagnostic-analysis/v10"
  );
  return analysis;
}

async function directoryBytes(root) {
  let total = 0;
  for (const relative of await regularFiles(root)) total += (await fs.stat(path.join(root, relative))).size;
  return total;
}

function armNeutralValue(value) {
  if (Array.isArray(value)) return value.map(armNeutralValue);
  if (value === null || typeof value !== "object") {
    return typeof value === "string"
      ? value
        .replaceAll("minimal-responsible", "process-arm")
        .replaceAll("Temple", "process framework")
        .replaceAll("temple", "process-framework")
        .replace(/Fixture (Mog|Yuna|Tidus|Rikku|Lulu)/g, "assigned worker")
      : value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, armNeutralValue(child)]));
}

async function buildArmPackage({ armId, armRoot, design, builds, integration }) {
  const packageId = `package-${sha256(`${armId}:${integration.product_revision}`).slice(0, 16)}`;
  const boundaryViolations = builds.flatMap((entry) => Object.values(entry.repositories).flatMap((repository) => repository.changed_paths.filter((candidate) => !candidate.startsWith("src/"))));
  const artifactBytes = await directoryBytes(armRoot);
  return {
    sealed: {
      package_id: packageId,
      arm_id: armId,
      design,
      builds,
      integration,
      artifact_bytes: artifactBytes,
      boundary_violations: boundaryViolations,
      retry_count: 0,
      fallback_count: 0
    },
    blind: armNeutralValue({
      package_id: packageId,
      objective_tests: integration.objective_tests,
      design_record: {
        contract_version: design.completion.contract_version,
        rollout_order: design.completion.rollout_order,
        slices: design.completion.slices
      },
      build_evidence: builds.map((entry) => ({
        slice_id: entry.id.replace(/^.*?-(?=(orders-catalog|notifications|gateway)$)/, ""),
        repositories: Object.fromEntries(Object.entries(entry.repositories).map(([id, value]) => [id, {
          changed_paths: value.changed_paths,
          changed_lines: value.changed_lines,
          public_test_exit_code: value.public_test_exit_code
        }]))
      })),
      recovery: integration.recovery,
      integration_record: integration.completion,
      boundary_violations: boundaryViolations,
      exact_revision_evidence_present: Object.keys(integration.expected_revisions).length === services.length,
      retry_count: 0,
      fallback_count: 0
    })
  };
}

async function runArm({ armId, labRoot, protocol, budget, deadline, progress }) {
  const armRoot = path.join(labRoot, "arms", armId);
  let design;
  try {
    design = await runDesignTurn({ armId, armRoot, protocol, budget, deadline });
    progress.design = design;
  } catch (error) {
    if (error.stage_observation) progress.design = error.stage_observation;
    throw error;
  }
  const builds = await Promise.all(buildSlices().map(async (slice) => {
    try {
      const build = await runBuildSlice({ armId, armRoot, slice, protocol, budget, deadline });
      progress.builds.push(build);
      return build;
    } catch (error) {
      if (error.stage_observation) progress.builds.push(error.stage_observation);
      throw error;
    }
  }));
  progress.builds.sort((left, right) => left.id.localeCompare(right.id));
  const serviceRevisions = Object.fromEntries(await Promise.all(services.map(async (repositoryId) => [repositoryId, await git(path.join(armRoot, repositoryId), ["rev-parse", "HEAD"])])));
  const portfolioRevision = await installArmPortfolio(armRoot, armId, serviceRevisions);
  progress.portfolio_revision = portfolioRevision;
  let integration;
  try {
    integration = await runIntegrationTurn({ armId, armRoot, protocol, budget, deadline });
    progress.integration = integration;
  } catch (error) {
    if (error.stage_observation) progress.integration = error.stage_observation;
    throw error;
  }
  const packages = await buildArmPackage({ armId, armRoot, design, builds, integration });
  return { arm_id: armId, design, builds, portfolio_revision: portfolioRevision, integration, ...packages };
}

export function representativeStoppedRun({ protocol, startedAt, stoppedAt, completed, activeArm, candidateOperationalTokens, reason }) {
  return {
    schema_version: "temple.representative-microservice-stopped-run/v2",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    started_at: startedAt,
    stopped_at: stoppedAt,
    completed_arm_count: completed.length,
    completed_arms: completed,
    active_arm: activeArm ? {
      ...activeArm,
      builds: activeArm.builds.toSorted((left, right) => left.id.localeCompare(right.id))
    } : null,
    candidate_operational_tokens: candidateOperationalTokens,
    reason,
    retry_count: 0,
    fallback_count: 0,
    model_generation_performed: true
  };
}

async function runProgram(labRoot, protocolPath, approvalPath) {
  if (!approvalPath) throw new Error("--approval is required for live generation");
  const resultPath = path.join(labRoot, "candidate-run.json");
  if (await exists(resultPath) || await exists(path.join(labRoot, "stopped-run.json"))) throw new Error("live candidate attempt already exists; retries and resumes are prohibited");
  const gate = await preflight(labRoot, protocolPath, approvalPath);
  if (!gate.generation_ready) throw new Error(`generation blocked: ${gate.blockers.join(", ")}`);
  const protocol = await readJson(protocolPath);
  const budget = createBudget(protocol);
  const startedAt = new Date().toISOString();
  const deadline = Date.now() + protocol.execution.program_wall_clock_limit_ms;
  const completed = [];
  let activeArm = null;
  try {
    for (const armId of protocol.execution.arm_order) {
      activeArm = { arm_id: armId, design: null, builds: [], portfolio_revision: null, integration: null };
      completed.push(await runArm({ armId, labRoot, protocol, budget, deadline, progress: activeArm }));
      activeArm = null;
    }
    const output = {
      schema_version: "temple.representative-microservice-candidate-run/v1",
      work_item_id: protocol.work_item_id,
      protocol_sha256: protocol.protocol_sha256,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: "candidate-arms-completed",
      arms: completed,
      candidate_operational_tokens: budget.total(),
      retry_count: 0,
      fallback_count: 0,
      evaluator_pending: true,
      model_generation_performed: true
    };
    await writeJson(resultPath, output, { exclusive: true });
    return output;
  } catch (error) {
    const stopped = representativeStoppedRun({
      protocol,
      startedAt,
      stoppedAt: new Date().toISOString(),
      completed,
      activeArm,
      candidateOperationalTokens: budget.total(),
      reason: String(error.message ?? error)
    });
    await writeJson(path.join(labRoot, "stopped-run.json"), stopped, { exclusive: true });
    throw error;
  }
}

export function validateEvaluatorCompletion(completion, blindPackages, rubric) {
  const expectedPackages = new Set(blindPackages.map((entry) => entry.package_id));
  const expectedDimensions = new Set(rubric.dimensions.map((entry) => entry.id));
  const errors = [];
  if (!Array.isArray(completion?.packages) || completion.packages.length !== expectedPackages.size) errors.push("evaluator package count mismatch");
  const seen = new Set();
  for (const packageResult of completion?.packages ?? []) {
    if (!expectedPackages.has(packageResult.package_id) || seen.has(packageResult.package_id)) errors.push("evaluator package identity mismatch");
    seen.add(packageResult.package_id);
    const dimensions = packageResult.dimensions ?? [];
    if (dimensions.length !== expectedDimensions.size || new Set(dimensions.map((entry) => entry.id)).size !== expectedDimensions.size) errors.push("evaluator dimension count mismatch");
    for (const dimension of dimensions) {
      if (!expectedDimensions.has(dimension.id) || ![0, 1].includes(dimension.score)) errors.push("evaluator dimension invalid");
    }
  }
  if (errors.length > 0) throw new Error(errors.join(", "));
  return completion;
}

async function evaluateProgram(labRoot, protocolPath, approvalPath) {
  if (!approvalPath) throw new Error("--approval is required for live evaluation");
  const evaluatorPath = path.join(labRoot, "evaluator-result.json");
  if (await exists(evaluatorPath)) throw new Error("evaluator attempt already exists; retries are prohibited");
  const protocol = await readJson(protocolPath);
  const approval = validateRepresentativeApproval(await readJson(approvalPath), protocol);
  if (!approval.accepted) throw new Error(`evaluation approval mismatch: ${approval.errors.join(", ")}`);
  const run = await readJson(path.join(labRoot, "candidate-run.json"));
  if (run.status !== "candidate-arms-completed" || run.protocol_sha256 !== protocol.protocol_sha256) throw new Error("candidate run is incomplete or protocol-mismatched");
  const blindPackages = run.arms.map((entry) => entry.blind).toSorted((left, right) => left.package_id.localeCompare(right.package_id));
  const rubric = await readJson(path.join(fixtureRoot, "rubric.json"));
  const forbidden = /arm_id|armId|temple|minimal-responsible|model|usage|token|latency|thread_id|turn_id|organization_revision/i;
  for (const package_ of blindPackages) {
    const serialized = JSON.stringify(package_);
    if (forbidden.test(serialized)) throw new Error("blind package leaked a condition or resource identity");
  }
  const instruction = [
    "Independently evaluate both arm-neutral packages against the frozen binary rubric.",
    "Use only the supplied JSON. Do not use tools, infer process identity, or compare resource use.",
    "A failed held-out objective test is a critical failure. Return each rubric dimension exactly once with score 0 or 1.",
    JSON.stringify({ rubric, packages: blindPackages })
  ].join("\n\n");
  const evaluatorBudget = {
    active: 0,
    limit: protocol.execution.combined_operational_token_limit,
    update(_id, value) {
      this.active = value;
      return run.candidate_operational_tokens + value;
    },
    settle(_id, value) {
      this.active = value;
      return value;
    },
    total() { return run.candidate_operational_tokens + this.active; }
  };
  const deadline = Date.parse(run.started_at) + protocol.execution.program_wall_clock_limit_ms;
  const turn = await launchModelTurn({
    id: "blind-evaluator",
    cwd: labRoot,
    stage: "evaluator",
    route: protocol.model_route.evaluator,
    instruction,
    outputSchema: evaluatorOutputSchema,
    protocol,
    budget: evaluatorBudget,
    deadline,
    sandbox: "read-only",
    allowTools: false
  });
  const completion = validateEvaluatorCompletion(turn.completion, blindPackages, rubric);
  const frozen = {
    schema_version: "temple.representative-microservice-frozen-scores/v1",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    frozen_at: new Date().toISOString(),
    packages: completion.packages,
    summary: completion.summary,
    mapping_unsealed_after_freeze: true
  };
  await writeJson(path.join(labRoot, "quality-scores-frozen.json"), frozen, { exclusive: true });
  const output = {
    schema_version: "temple.representative-microservice-evaluator-result/v1",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    completed_at: new Date().toISOString(),
    status: "completed",
    scores_frozen_before_mapping_unseal: true,
    evaluator: { ...turn, completion: undefined },
    frozen_scores: frozen,
    arm_mapping: Object.fromEntries(run.arms.map((entry) => [entry.sealed.package_id, entry.arm_id])),
    combined_operational_tokens: run.candidate_operational_tokens + turn.operational_tokens,
    retry_count: 0,
    fallback_count: 0
  };
  await writeJson(evaluatorPath, output, { exclusive: true });
  return output;
}

async function reportProgram(labRoot, protocolPath) {
  const protocol = await readJson(protocolPath);
  const run = await readJson(path.join(labRoot, "candidate-run.json"));
  const evaluator = await readJson(path.join(labRoot, "evaluator-result.json"));
  if (run.protocol_sha256 !== protocol.protocol_sha256 || evaluator.protocol_sha256 !== protocol.protocol_sha256) throw new Error("report evidence does not match protocol");
  const analysis = analyzeRepresentativeComparison({ protocol, run, evaluator });
  await writeJson(path.join(labRoot, "analysis.json"), analysis);
  return analysis;
}

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2));
  const result = arguments_.command === "setup"
    ? await setup(arguments_.labRoot, arguments_.protocolPath)
    : arguments_.command === "ablation-setup"
      ? await setupAblation(arguments_.labRoot, arguments_.protocolPath)
    : arguments_.command === "freeze"
      ? await freeze(arguments_.protocolPath)
      : arguments_.command === "ablation-freeze"
        ? await freezeAblation(arguments_.protocolPath)
      : arguments_.command === "preflight"
        ? await preflight(arguments_.labRoot, arguments_.protocolPath, arguments_.approvalPath)
        : arguments_.command === "ablation-preflight"
          ? await preflightAblation(arguments_.labRoot, arguments_.protocolPath, arguments_.approvalPath)
        : arguments_.command === "run"
          ? await runProgram(arguments_.labRoot, arguments_.protocolPath, arguments_.approvalPath)
          : arguments_.command === "ablation-run"
            ? await runAblation(arguments_.labRoot, arguments_.protocolPath, arguments_.approvalPath)
          : arguments_.command === "evaluate"
            ? await evaluateProgram(arguments_.labRoot, arguments_.protocolPath, arguments_.approvalPath)
          : arguments_.command === "report"
            ? await reportProgram(arguments_.labRoot, arguments_.protocolPath)
            : arguments_.command === "ablation-report"
              ? await reportAblation(arguments_.labRoot, arguments_.protocolPath)
            : arguments_.command === "ablation-inspect"
              ? await inspectAblation(arguments_.labRoot, arguments_.protocolPath)
              : await inspect(arguments_.labRoot, arguments_.protocolPath);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if ((result.valid === false) || (result.local_fixture_ready === false)) process.exitCode = 2;
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
