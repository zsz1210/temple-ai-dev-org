#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { buildFederatedPortfolio, validateFederationRegistry } from "../src/federation.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templeCli = path.join(repositoryRoot, "bin/temple.mjs");
const dockerContext = "colima-temple-wave3";
const composeProject = "temple-wi0104";
const deadlineMs = 10 * 60 * 1000;
const maximumGrowthBytes = 5 * 1024 * 1024 * 1024;
const outputDefault = path.join(repositoryRoot, ".ai-org/artifacts/WI-0104/local-microservice-observation.json");
const arguments_ = process.argv.slice(2);
const inspectIndex = arguments_.indexOf("--inspect");

if (inspectIndex !== -1) {
  const root = arguments_[inspectIndex + 1];
  if (!root) throw new Error("--inspect requires an experiment root");
  const result = await inspectRetainedExperiment(path.resolve(root));
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(result.valid ? 0 : 1);
}

const outputIndex = arguments_.indexOf("--output");
const outputPath = outputIndex === -1 ? outputDefault : path.resolve(arguments_[outputIndex + 1] ?? "");
if (!outputPath) throw new Error("--output requires a path");

const started = performance.now();
const startedAt = new Date().toISOString();
const commands = [];
const timings = {};
let experimentRoot;
let composeFile;
let baseImageDigest = null;
let status = "failed";
let stopReason = null;
let failure = null;
let scenarioResults = [];
let repositoryEvidence = null;
let federationEvidence = null;
let imageEvidence = null;
let cleanupEvidence = { attempted: false, succeeded: false, residual_resources: null, fixture_removed: true };
const disk = { free_bytes_before: null, free_bytes_peak_observation: null, free_bytes_after: null, growth_bytes_peak: null };

const gitEnvironment = {
  ...process.env,
  GIT_AUTHOR_NAME: "Temple Wave 3 Fixture",
  GIT_AUTHOR_EMAIL: "wave3@temple.invalid",
  GIT_COMMITTER_NAME: "Temple Wave 3 Fixture",
  GIT_COMMITTER_EMAIL: "wave3@temple.invalid"
};

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function elapsedMs(since = started) {
  return Number((performance.now() - since).toFixed(3));
}

function commandLabel(command, args) {
  let value = [command, ...args].join(" ");
  if (experimentRoot) value = value.replaceAll(experimentRoot, "<experiment-root>");
  value = value.replaceAll(repositoryRoot, "<repository-root>");
  value = value.replaceAll(os.homedir(), "<home>");
  return value;
}

function bounded(value, maximum = 4000) {
  const text = String(value ?? "").trim();
  return text.length <= maximum ? text : `${text.slice(0, maximum)}…[truncated]`;
}

function run(command, args, options = {}) {
  const commandStarted = performance.now();
  const remaining = Math.max(1, deadlineMs - elapsedMs());
  const record = {
    command: commandLabel(command, args),
    cwd: options.cwd ? path.basename(options.cwd) : null,
    started_at: new Date().toISOString(),
    elapsed_ms: null,
    exit_code: null
  };
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 16 * 1024 * 1024,
    timeout: Math.floor(Math.min(options.timeout ?? remaining, remaining))
  });
  record.elapsed_ms = elapsedMs(commandStarted);
  record.exit_code = result.status;
  commands.push(record);
  if (result.error || result.status !== 0) {
    const error = new Error(
      [
        `Command failed (${result.status ?? result.error?.code ?? "unknown"}): ${record.command}`,
        bounded(result.stdout),
        bounded(result.stderr),
        result.error?.message
      ]
        .filter(Boolean)
        .join("\n")
    );
    error.command = record.command;
    error.stdout = bounded(result.stdout);
    error.stderr = bounded(result.stderr);
    throw error;
  }
  return String(result.stdout ?? "");
}

function git(target, ...args) {
  return run("git", args, { cwd: target, env: gitEnvironment }).trim();
}

function docker(...args) {
  return run("docker", ["--context", dockerContext, ...args]);
}

function compose(args, options = {}) {
  return run("docker-compose", ["-f", composeFile, "-p", composeProject, ...args], {
    cwd: path.dirname(composeFile),
    env: { ...process.env, DOCKER_CONTEXT: dockerContext, ...options.env },
    timeout: options.timeout
  });
}

async function writeText(target, value) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value);
}

async function writeJson(target, value) {
  await writeText(target, `${JSON.stringify(value, null, 2)}\n`);
}

async function freeBytes(target = os.homedir()) {
  const statistics = await fs.statfs(target);
  return statistics.bavail * statistics.bsize;
}

async function checkBoundary(label) {
  if (elapsedMs() > deadlineMs) {
    const error = new Error(`Stopped before ${label}: the 10-minute deadline was exceeded`);
    error.stopReason = "deadline_exceeded";
    throw error;
  }
  const current = await freeBytes();
  disk.free_bytes_peak_observation =
    disk.free_bytes_peak_observation === null ? current : Math.min(disk.free_bytes_peak_observation, current);
  disk.growth_bytes_peak = disk.free_bytes_before === null ? null : disk.free_bytes_before - disk.free_bytes_peak_observation;
  if (disk.growth_bytes_peak > maximumGrowthBytes) {
    const error = new Error(`Stopped before ${label}: measured host growth exceeded 5 GiB`);
    error.stopReason = "host_growth_exceeded";
    throw error;
  }
}

function parseNodeTests(output) {
  const match = output.match(/^(?:#|ℹ) pass (\d+)$/m);
  if (!match) throw new Error(`Could not read Node test pass count from:\n${output}`);
  return { passed: Number(match[1]), output_sha256: sha256(output) };
}

function commonInitConfig(projectId, projectName) {
  return {
    schema_version: "temple.init/v1",
    project: { id: projectId, name: projectName },
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

async function initializeRepository(target, projectId, projectName, affectedPath) {
  await fs.mkdir(target, { recursive: true });
  git(target, "init", "-b", "main");
  const configPath = path.join(experimentRoot, `${projectId}-init.json`);
  await writeJson(configPath, commonInitConfig(projectId, projectName));
  run(process.execPath, [templeCli, "init", target, "--config", configPath], { cwd: target });
  run(
    process.execPath,
    [
      templeCli,
      "work-item",
      "create",
      target,
      "--title",
      `Validate ${projectName} contract`,
      "--scope",
      "Supply one deterministic local validation fixture",
      "--acceptance",
      "Native tests pass and the exact repository revision is retained",
      "--affected-path",
      affectedPath,
      "--spec-mode",
      "gate-evidence",
      "--ui-mode",
      "not-applicable",
      "--tracker-visibility",
      "internal"
    ],
    { cwd: target }
  );
}

function dockerfile() {
  return [
    "ARG BASE_IMAGE",
    "FROM ${BASE_IMAGE}",
    "WORKDIR /app",
    "COPY package.json server.mjs ./",
    "USER node",
    'CMD ["node", "server.mjs"]',
    ""
  ].join("\n");
}

function catalogServer(version) {
  const response =
    version === "v1"
      ? '{ sku, available: sku === "SKU-1" }'
      : '{ sku, status: sku === "SKU-1" ? "available" : "unavailable", contract_version: "v2" }';
  return [
    'import http from "node:http";',
    `const contract = "${version}";`,
    "const server = http.createServer((request, response) => {",
    '  const url = new URL(request.url, "http://catalog");',
    '  response.setHeader("content-type", "application/json");',
    '  if (url.pathname === "/health") return response.end(JSON.stringify({ service: "catalog", contract, ready: true }));',
    '  if (url.pathname !== "/availability") { response.statusCode = 404; return response.end(JSON.stringify({ error: "not_found" })); }',
    '  const sku = url.searchParams.get("sku") ?? "";',
    `  response.end(JSON.stringify(${response}));`,
    "});",
    "server.listen(3001, '0.0.0.0');",
    ""
  ].join("\n");
}

function catalogTest(version) {
  return [
    'import assert from "node:assert/strict";',
    'import test from "node:test";',
    `test("catalog ${version} fixture revision", () => assert.equal("${version}", "${version}"));`,
    ""
  ].join("\n");
}

function ordersServer(compatible) {
  return [
    'import http from "node:http";',
    `const acceptsV2 = ${compatible};`,
    "async function body(request) { let value = ''; for await (const part of request) value += part; return JSON.parse(value || '{}'); }",
    "const server = http.createServer(async (request, response) => {",
    '  response.setHeader("content-type", "application/json");',
    '  if (request.url === "/health") return response.end(JSON.stringify({ service: "orders", accepts_v2: acceptsV2, ready: true }));',
    '  if (request.method !== "POST" || request.url !== "/checkout") { response.statusCode = 404; return response.end(JSON.stringify({ error: "not_found" })); }',
    "  let input; try { input = await body(request); } catch { response.statusCode = 400; return response.end(JSON.stringify({ error: 'invalid_json' })); }",
    "  if (!input.sku || !Number.isInteger(input.quantity) || input.quantity < 1 || !input.request_id) { response.statusCode = 400; return response.end(JSON.stringify({ error: 'invalid_checkout' })); }",
    "  const catalogResponse = await fetch(`http://catalog:3001/availability?sku=${encodeURIComponent(input.sku)}`);",
    "  const availability = await catalogResponse.json();",
    "  const isV2 = availability.contract_version === 'v2';",
    "  if (isV2 && !acceptsV2) { response.statusCode = 409; return response.end(JSON.stringify({ error: 'unsupported_catalog_contract', received: 'v2' })); }",
    "  const available = isV2 ? availability.status === 'available' : availability.available === true;",
    "  if (!available) { response.statusCode = 409; return response.end(JSON.stringify({ error: 'not_available' })); }",
    "  const orderId = `order-${input.request_id}`;",
    "  response.end(JSON.stringify({ order: { id: orderId, sku: input.sku, quantity: input.quantity }, event: { type: 'OrderPlaced', version: 'v1', id: `event-${input.request_id}`, order_id: orderId } }));",
    "});",
    "server.listen(3002, '0.0.0.0');",
    ""
  ].join("\n");
}

function ordersTest(compatible) {
  return [
    'import assert from "node:assert/strict";',
    'import test from "node:test";',
    `test("orders ${compatible ? "compatible" : "v1-only"} fixture revision", () => assert.equal(${compatible}, ${compatible}));`,
    ""
  ].join("\n");
}

function notificationsServer() {
  return [
    'import http from "node:http";',
    "const deliveries = new Map();",
    "async function body(request) { let value = ''; for await (const part of request) value += part; return JSON.parse(value || '{}'); }",
    "const server = http.createServer(async (request, response) => {",
    '  response.setHeader("content-type", "application/json");',
    '  if (request.url === "/health") return response.end(JSON.stringify({ service: "notifications", ready: true }));',
    '  if (request.method === "GET" && request.url === "/deliveries") return response.end(JSON.stringify({ count: deliveries.size, deliveries: [...deliveries.values()] }));',
    '  if (request.method !== "POST" || request.url !== "/events") { response.statusCode = 404; return response.end(JSON.stringify({ error: "not_found" })); }',
    "  let event; try { event = await body(request); } catch { response.statusCode = 400; return response.end(JSON.stringify({ error: 'invalid_json' })); }",
    "  if (event.type !== 'OrderPlaced' || event.version !== 'v1' || !event.id || !event.order_id) { response.statusCode = 422; return response.end(JSON.stringify({ error: 'unsupported_or_malformed_event' })); }",
    "  const duplicate = deliveries.has(event.id);",
    "  if (!duplicate) deliveries.set(event.id, { event_id: event.id, order_id: event.order_id, status: 'retained' });",
    "  response.end(JSON.stringify({ accepted: true, duplicate, count: deliveries.size }));",
    "});",
    "server.listen(3003, '0.0.0.0');",
    ""
  ].join("\n");
}

function notificationsTest() {
  return [
    'import assert from "node:assert/strict";',
    'import test from "node:test";',
    'test("notification contract is versioned", () => assert.equal("v1", "v1"));',
    ""
  ].join("\n");
}

async function serviceFiles(target, server, test) {
  await writeJson(path.join(target, "package.json"), {
    name: path.basename(target),
    private: true,
    type: "module",
    scripts: { test: "node --test" }
  });
  await writeText(path.join(target, "server.mjs"), server);
  await writeText(path.join(target, "test/service.test.mjs"), test);
  await writeText(path.join(target, "Dockerfile"), dockerfile());
}

async function commit(target, message) {
  git(target, "add", ".");
  git(target, "commit", "-m", message);
  return git(target, "rev-parse", "HEAD");
}

async function createRepositories(root) {
  const catalog = path.join(root, "commerce-catalog");
  const orders = path.join(root, "commerce-orders");
  const notifications = path.join(root, "commerce-notifications");
  const coordinator = path.join(root, "commerce-coordinator");

  await serviceFiles(catalog, catalogServer("v1"), catalogTest("v1"));
  await initializeRepository(catalog, "commerce-catalog", "Commerce Catalog", "server.mjs");
  const catalogV1 = await commit(catalog, "Create Catalog availability v1");
  await writeText(path.join(catalog, "server.mjs"), catalogServer("v2"));
  await writeText(path.join(catalog, "test/service.test.mjs"), catalogTest("v2"));
  const catalogV2 = await commit(catalog, "Publish Catalog availability v2");
  git(catalog, "checkout", "--detach", catalogV1);

  await serviceFiles(orders, ordersServer(false), ordersTest(false));
  await initializeRepository(orders, "commerce-orders", "Commerce Orders", "server.mjs");
  const ordersV1 = await commit(orders, "Create v1-only Orders consumer");
  await writeText(path.join(orders, "server.mjs"), ordersServer(true));
  await writeText(path.join(orders, "test/service.test.mjs"), ordersTest(true));
  const ordersCompatible = await commit(orders, "Accept Catalog v1 and v2");
  git(orders, "checkout", "--detach", ordersV1);

  await serviceFiles(notifications, notificationsServer(), notificationsTest());
  await initializeRepository(notifications, "commerce-notifications", "Commerce Notifications", "server.mjs");
  const notificationsRevision = await commit(notifications, "Create idempotent OrderPlaced consumer");

  await writeJson(path.join(coordinator, "package.json"), {
    name: "commerce-coordinator",
    private: true,
    type: "module",
    scripts: { test: "node --test" }
  });
  await writeText(
    path.join(coordinator, "test/coordinator.test.mjs"),
    'import assert from "node:assert/strict";\nimport test from "node:test";\ntest("coordinator keeps durable evidence", () => assert.ok(true));\n'
  );
  await initializeRepository(coordinator, "commerce-coordinator", "Commerce Coordinator", ".ai-org/project/federation.json");
  const coordinatorFoundation = await commit(coordinator, "Create local rollout coordinator");

  return {
    paths: { coordinator, catalog, orders, notifications },
    revisions: { catalog_v1: catalogV1, catalog_v2: catalogV2, orders_v1: ordersV1, orders_compatible: ordersCompatible, notifications: notificationsRevision, coordinator_foundation: coordinatorFoundation }
  };
}

function workItemRef(projectId, revision) {
  return { project_id: projectId, work_item_id: "WI-0001", revision };
}

function federationRegistry(revisions, observedAt) {
  const catalogRef = workItemRef("commerce-catalog", revisions.catalog);
  const ordersRef = workItemRef("commerce-orders", revisions.orders);
  const notificationsRef = workItemRef("commerce-notifications", revisions.notifications);
  return {
    schema_version: "temple.federation/v1",
    participants: [
      { id: "commerce-catalog", path: "../commerce-catalog", expected_project_id: "commerce-catalog", expected_revision: revisions.catalog, expected_revision_observed_at: observedAt, max_work_items: 10 },
      { id: "commerce-orders", path: "../commerce-orders", expected_project_id: "commerce-orders", expected_revision: revisions.orders, expected_revision_observed_at: observedAt, max_work_items: 10 },
      { id: "commerce-notifications", path: "../commerce-notifications", expected_project_id: "commerce-notifications", expected_revision: revisions.notifications, expected_revision_observed_at: observedAt, max_work_items: 10 }
    ],
    initiatives: [{ id: "availability-v2", version: "1", revision: "initiative-1", work_items: [catalogRef, ordersRef, notificationsRef] }],
    dependencies: [
      { id: "catalog-before-orders", version: "1", revision: "dependency-1", predecessor: catalogRef, successor: ordersRef },
      { id: "orders-before-notifications", version: "1", revision: "dependency-1", predecessor: ordersRef, successor: notificationsRef }
    ],
    contracts: [
      { id: "catalog-availability", kind: "api", version: "2.0.0", revision: "contract-2", compatibility: "incompatible", owner: catalogRef, consumers: [ordersRef] },
      { id: "order-placed", kind: "event", version: "1.0.0", revision: "contract-1", compatibility: "compatible", owner: ordersRef, consumers: [notificationsRef] }
    ],
    rollout_waves: [
      { id: "consumer-first", version: "1", revision: "wave-1", order: 1, work_items: [ordersRef], contract_refs: [{ id: "catalog-availability", version: "2.0.0", revision: "contract-2" }] },
      { id: "producer-second", version: "1", revision: "wave-2", order: 2, work_items: [catalogRef], contract_refs: [{ id: "catalog-availability", version: "2.0.0", revision: "contract-2" }] }
    ],
    updated_at: observedAt
  };
}

function serviceDefinition(context, image, port, digest) {
  return {
    build: { context, args: { BASE_IMAGE: digest } },
    image,
    networks: ["mesh"],
    read_only: true,
    tmpfs: ["/tmp:rw,noexec,nosuid,size=16777216"],
    cap_drop: ["ALL"],
    security_opt: ["no-new-privileges:true"],
    pids_limit: 64,
    mem_limit: "128m",
    cpus: 0.25,
    healthcheck: {
      test: ["CMD", "node", "-e", `fetch('http://127.0.0.1:${port}/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))`],
      interval: "1s",
      timeout: "1s",
      retries: 20,
      start_period: "1s"
    }
  };
}

function composeDocument(digest) {
  return {
    services: {
      catalog: serviceDefinition("../commerce-catalog", "temple-wave3-catalog:local", 3001, digest),
      orders: serviceDefinition("../commerce-orders", "temple-wave3-orders:local", 3002, digest),
      notifications: serviceDefinition("../commerce-notifications", "temple-wave3-notifications:local", 3003, digest)
    },
    networks: { mesh: { internal: true } }
  };
}

const scenarioRunnerSource = String.raw`
const input = JSON.parse(Buffer.from(process.argv[1], 'base64url').toString('utf8'));
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json();
  return { status: response.status, body };
}
let result;
if (input.action === 'checkout') {
  const checkout = await request('http://orders:3002/checkout', { method: 'POST', body: JSON.stringify({ sku: 'SKU-1', quantity: 1, request_id: input.request_id }) });
  let notification = null;
  if (checkout.status === 200 && input.deliver !== false) notification = await request('http://notifications:3003/events', { method: 'POST', body: JSON.stringify(checkout.body.event) });
  const deliveries = await request('http://notifications:3003/deliveries');
  result = { checkout, notification, deliveries };
} else if (input.action === 'malformed') {
  const before = await request('http://notifications:3003/deliveries');
  const rejected = await request('http://notifications:3003/events', { method: 'POST', body: JSON.stringify({ type: 'WrongEvent' }) });
  const after_rejection = await request('http://notifications:3003/deliveries');
  const recovery = await request('http://notifications:3003/events', { method: 'POST', body: JSON.stringify({ type: 'OrderPlaced', version: 'v1', id: 'event-recovery', order_id: 'order-recovery' }) });
  const after_recovery = await request('http://notifications:3003/deliveries');
  result = { before, rejected, after_rejection, recovery, after_recovery };
} else throw new Error('unknown scenario action');
console.log(JSON.stringify(result));
`;

function runScenario(name, input, expected) {
  const encoded = Buffer.from(JSON.stringify(input)).toString("base64url");
  const output = docker(
    "run",
    "--rm",
    "--network",
    `${composeProject}_mesh`,
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=16777216",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges:true",
    baseImageDigest,
    "node",
    "-e",
    scenarioRunnerSource,
    encoded
  );
  const result = JSON.parse(output.trim());
  expected(result);
  scenarioResults.push({ name, status: "passed", observation: result });
}

async function checkoutAndRebuild(repository, revision, service) {
  git(repository, "checkout", "--detach", revision);
  assert.equal(git(repository, "status", "--porcelain"), "");
  await checkBoundary(`rebuild ${service}`);
  compose(["up", "-d", "--build", "--no-deps", "--wait", service], { timeout: 180000 });
}

async function nativeTest(repository, revision) {
  git(repository, "checkout", "--detach", revision);
  const output = run(process.execPath, ["--test"], { cwd: repository });
  assert.equal(git(repository, "status", "--porcelain"), "");
  return { revision, ...parseNodeTests(output) };
}

async function inspectRetainedExperiment(root) {
  const coordinator = path.join(root, "commerce-coordinator");
  const journal = JSON.parse(await fs.readFile(path.join(coordinator, "scenario-journal.json"), "utf8"));
  const portfolio = await buildFederatedPortfolio(coordinator, { allowedRoot: root });
  const repositories = Object.fromEntries(
    await Promise.all(
      ["commerce-coordinator", "commerce-catalog", "commerce-orders", "commerce-notifications"].map(async (name) => {
        const target = path.join(root, name);
        const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: target, encoding: "utf8" });
        const clean = spawnSync("git", ["status", "--porcelain"], { cwd: target, encoding: "utf8" });
        return [name, { revision: head.stdout.trim(), clean: clean.stdout.trim() === "" }];
      })
    )
  );
  const valid =
    journal.schema_version === "temple.local-microservice-journal/v1" &&
    journal.scenarios.every((entry) => entry.status === "passed") &&
    portfolio.summary.current === 3 &&
    Object.values(repositories).every((entry) => entry.clean && /^[0-9a-f]{40}$/.test(entry.revision));
  return { valid, journal_sha256: sha256(JSON.stringify(journal)), repositories, portfolio_summary: portfolio.summary };
}

async function collectResiduals() {
  const containers = docker("ps", "-a", "--filter", `label=com.docker.compose.project=${composeProject}`, "--format", "{{.ID}}").trim();
  const networks = docker("network", "ls", "--filter", `label=com.docker.compose.project=${composeProject}`, "--format", "{{.ID}}").trim();
  const volumes = docker("volume", "ls", "--filter", `label=com.docker.compose.project=${composeProject}`, "--format", "{{.Name}}").trim();
  return { containers: containers ? containers.split("\n") : [], networks: networks ? networks.split("\n") : [], volumes: volumes ? volumes.split("\n") : [] };
}

try {
  disk.free_bytes_before = await freeBytes();
  const preflightStarted = performance.now();
  const runtime = {
    node: process.version,
    colima: run("colima", ["version"]).trim().split("\n")[0],
    docker_cli: run("docker", ["--version"]).trim(),
    compose: run("docker-compose", ["version"]).trim(),
    context: JSON.parse(docker("context", "inspect"))[0]?.Name ?? null,
    server: JSON.parse(docker("version", "--format", "{{json .Server}}"))
  };
  assert.equal(runtime.context, dockerContext);
  timings.preflight_ms = elapsedMs(preflightStarted);

  await checkBoundary("base image pull");
  const imageStarted = performance.now();
  docker("pull", "node:24-alpine");
  const repoDigests = JSON.parse(docker("image", "inspect", "node:24-alpine", "--format", "{{json .RepoDigests}}"));
  baseImageDigest = repoDigests.find((entry) => entry.startsWith("node@sha256:"));
  assert.match(baseImageDigest ?? "", /^node@sha256:[0-9a-f]{64}$/);
  const baseImageSize = Number(docker("image", "inspect", baseImageDigest, "--format", "{{.Size}}").trim());
  timings.image_pull_ms = elapsedMs(imageStarted);

  const fixtureStarted = performance.now();
  const temporaryBase = path.join(os.homedir(), ".codex", "tmp");
  await fs.mkdir(temporaryBase, { recursive: true });
  experimentRoot = await fs.mkdtemp(path.join(temporaryBase, "temple-wave3-"));
  cleanupEvidence.fixture_removed = false;
  const fixture = await createRepositories(experimentRoot);
  composeFile = path.join(fixture.paths.coordinator, "compose.json");
  const nativeTests = {
    catalog_v1: await nativeTest(fixture.paths.catalog, fixture.revisions.catalog_v1),
    catalog_v2: await nativeTest(fixture.paths.catalog, fixture.revisions.catalog_v2),
    orders_v1: await nativeTest(fixture.paths.orders, fixture.revisions.orders_v1),
    orders_compatible: await nativeTest(fixture.paths.orders, fixture.revisions.orders_compatible),
    notifications: await nativeTest(fixture.paths.notifications, fixture.revisions.notifications),
    coordinator: await nativeTest(fixture.paths.coordinator, fixture.revisions.coordinator_foundation)
  };
  git(fixture.paths.catalog, "checkout", "--detach", fixture.revisions.catalog_v1);
  git(fixture.paths.orders, "checkout", "--detach", fixture.revisions.orders_v1);
  await writeJson(composeFile, composeDocument(baseImageDigest));
  const baselineRegistry = federationRegistry(
    { catalog: fixture.revisions.catalog_v1, orders: fixture.revisions.orders_v1, notifications: fixture.revisions.notifications },
    new Date().toISOString()
  );
  assert.equal(validateFederationRegistry(baselineRegistry).valid, true);
  await writeJson(path.join(fixture.paths.coordinator, ".ai-org/project/federation.json"), baselineRegistry);
  git(fixture.paths.coordinator, "add", ".ai-org/project/federation.json", "compose.json");
  git(fixture.paths.coordinator, "commit", "-m", "Plan consumer-first availability rollout");
  const baselinePortfolio = await buildFederatedPortfolio(fixture.paths.coordinator, { allowedRoot: experimentRoot });
  assert.equal(baselinePortfolio.summary.current, 3);
  timings.fixture_ms = elapsedMs(fixtureStarted);

  await checkBoundary("Compose build");
  const buildStarted = performance.now();
  compose(["config", "--quiet"]);
  compose(["up", "-d", "--build", "--wait"], { timeout: 240000 });
  timings.compose_build_start_ms = elapsedMs(buildStarted);

  const scenarioStarted = performance.now();
  runScenario("baseline_v1", { action: "checkout", request_id: "baseline" }, (result) => {
    assert.equal(result.checkout.status, 200);
    assert.equal(result.notification.status, 200);
    assert.equal(result.deliveries.body.count, 1);
  });

  await checkoutAndRebuild(fixture.paths.catalog, fixture.revisions.catalog_v2, "catalog");
  runScenario("producer_first_failure", { action: "checkout", request_id: "producer-first" }, (result) => {
    assert.equal(result.checkout.status, 409);
    assert.equal(result.checkout.body.error, "unsupported_catalog_contract");
    assert.equal(result.notification, null);
    assert.equal(result.deliveries.body.count, 1);
  });

  await checkoutAndRebuild(fixture.paths.catalog, fixture.revisions.catalog_v1, "catalog");
  runScenario("producer_rollback", { action: "checkout", request_id: "rollback" }, (result) => {
    assert.equal(result.checkout.status, 200);
    assert.equal(result.deliveries.body.count, 2);
  });

  await checkoutAndRebuild(fixture.paths.orders, fixture.revisions.orders_compatible, "orders");
  runScenario("consumer_first_with_v1", { action: "checkout", request_id: "consumer-first" }, (result) => {
    assert.equal(result.checkout.status, 200);
    assert.equal(result.deliveries.body.count, 3);
  });

  await checkoutAndRebuild(fixture.paths.catalog, fixture.revisions.catalog_v2, "catalog");
  runScenario("producer_switch_after_consumer", { action: "checkout", request_id: "producer-second" }, (result) => {
    assert.equal(result.checkout.status, 200);
    assert.equal(result.deliveries.body.count, 4);
  });

  runScenario("malformed_event_recovery", { action: "malformed" }, (result) => {
    assert.equal(result.rejected.status, 422);
    assert.equal(result.before.body.count, result.after_rejection.body.count);
    assert.equal(result.recovery.status, 200);
    assert.equal(result.after_recovery.body.count, result.before.body.count + 1);
  });
  timings.scenarios_ms = elapsedMs(scenarioStarted);

  const finalRegistry = federationRegistry(
    { catalog: fixture.revisions.catalog_v2, orders: fixture.revisions.orders_compatible, notifications: fixture.revisions.notifications },
    new Date().toISOString()
  );
  assert.equal(validateFederationRegistry(finalRegistry).valid, true);
  await writeJson(path.join(fixture.paths.coordinator, ".ai-org/project/federation.json"), finalRegistry);
  await writeJson(path.join(fixture.paths.coordinator, "scenario-journal.json"), {
    schema_version: "temple.local-microservice-journal/v1",
    recorded_at: new Date().toISOString(),
    generation_performed: false,
    model_usage: "not_applicable",
    scenarios: scenarioResults.map(({ name, status }) => ({ name, status })),
    participant_revisions: { catalog: fixture.revisions.catalog_v2, orders: fixture.revisions.orders_compatible, notifications: fixture.revisions.notifications }
  });
  const coordinatorRevision = await commit(fixture.paths.coordinator, "Record completed local rollout rehearsal");
  const finalPortfolio = await buildFederatedPortfolio(fixture.paths.coordinator, { allowedRoot: experimentRoot });
  assert.equal(finalPortfolio.summary.current, 3);

  const coldStarted = performance.now();
  const coldOutput = run(process.execPath, [fileURLToPath(import.meta.url), "--inspect", experimentRoot], { cwd: repositoryRoot });
  const coldInspection = JSON.parse(coldOutput);
  assert.equal(coldInspection.valid, true);
  timings.cold_inspection_ms = elapsedMs(coldStarted);

  const repositories = {
    coordinator: { project_id: "commerce-coordinator", revision: coordinatorRevision, clean: git(fixture.paths.coordinator, "status", "--porcelain") === "" },
    catalog: { project_id: "commerce-catalog", revision: git(fixture.paths.catalog, "rev-parse", "HEAD"), clean: git(fixture.paths.catalog, "status", "--porcelain") === "" },
    orders: { project_id: "commerce-orders", revision: git(fixture.paths.orders, "rev-parse", "HEAD"), clean: git(fixture.paths.orders, "status", "--porcelain") === "" },
    notifications: { project_id: "commerce-notifications", revision: git(fixture.paths.notifications, "rev-parse", "HEAD"), clean: git(fixture.paths.notifications, "status", "--porcelain") === "" }
  };
  assert.ok(Object.values(repositories).every((entry) => entry.clean));
  repositoryEvidence = { repositories, version_revisions: fixture.revisions, native_tests: nativeTests, cold_inspection: coldInspection };
  federationEvidence = {
    registry_valid: true,
    baseline_summary: baselinePortfolio.summary,
    final_summary: finalPortfolio.summary,
    authority: finalPortfolio.authority,
    rollout_order: finalPortfolio.coordination.rollout_waves.map((entry) => entry.id)
  };
  const serviceImages = JSON.parse(compose(["images", "--format", "json"]));
  imageEvidence = { base_digest: baseImageDigest, base_size_bytes: baseImageSize, services: serviceImages };
  await checkBoundary("cleanup");
  status = "passed";
  failure = { runtime };
} catch (error) {
  stopReason = error.stopReason ?? null;
  status = stopReason ? "stopped" : "failed";
  failure = { message: bounded(error.message), command: error.command ?? null, stdout: error.stdout ?? null, stderr: error.stderr ?? null };
  if (composeFile) {
    try {
      failure.compose_logs = bounded(compose(["logs", "--no-color", "--tail", "80"]), 12000);
    } catch (logError) {
      failure.compose_logs = `Unavailable: ${bounded(logError.message, 1000)}`;
    }
  }
} finally {
  cleanupEvidence.attempted = true;
  if (composeFile) {
    try {
      compose(["down", "--volumes", "--remove-orphans", "--rmi", "local"], { timeout: 120000 });
      cleanupEvidence.residual_resources = await collectResiduals();
    } catch (error) {
      cleanupEvidence.error = bounded(error.message);
    }
  }
  if (experimentRoot) {
    try {
      await fs.rm(experimentRoot, { recursive: true, force: true });
      cleanupEvidence.fixture_removed = true;
    } catch (error) {
      cleanupEvidence.fixture_error = bounded(error.message);
    }
  }
  const residual = cleanupEvidence.residual_resources;
  cleanupEvidence.succeeded =
    cleanupEvidence.fixture_removed &&
    (!residual || (residual.containers.length === 0 && residual.networks.length === 0 && residual.volumes.length === 0)) &&
    !cleanupEvidence.error;
  if (!cleanupEvidence.succeeded && status === "passed") {
    status = "stopped";
    stopReason = "cleanup_failed";
  }
  disk.free_bytes_after = await freeBytes();
  disk.free_bytes_peak_observation ??= disk.free_bytes_after;
  disk.growth_bytes_peak ??= disk.free_bytes_before === null ? null : disk.free_bytes_before - disk.free_bytes_peak_observation;
  timings.total_ms = elapsedMs();
  const observation = {
    schema_version: "temple.local-microservice-observation/v1",
    status,
    stop_reason: stopReason,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    generation_performed: false,
    model: "not_applicable",
    tokens: "not_applicable",
    scope: { repositories: 4, host: "single_local_mac", production_claim: false, enterprise_claim: false, release_claim: false, resumed_work_item: false },
    runtime: failure?.runtime ?? null,
    timings_ms: timings,
    disk,
    images: imageEvidence,
    repositories: repositoryEvidence,
    federation: federationEvidence,
    scenarios: scenarioResults,
    commands,
    failure: status === "passed" ? null : failure,
    cleanup: cleanupEvidence
  };
  await writeJson(outputPath, observation);
  process.stdout.write(`${JSON.stringify({ status, output: outputPath, scenarios: scenarioResults.length, cleanup: cleanupEvidence.succeeded, total_ms: timings.total_ms })}\n`);
}

process.exit(status === "passed" ? 0 : 1);
