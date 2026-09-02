import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { renderControlPlaneDashboard } from "../src/control-plane-dashboard.mjs";
import {
  managementConsoleSnapshot,
  startManagementConsoleServer
} from "../src/management-console-server.mjs";
import { inspectLocalObserverService } from "../src/local-observer-service.mjs";
import { acquireControlPlaneLease } from "../src/telemetry.mjs";
import { startUsageCollector } from "../src/usage-collector.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function git(target, args) {
  return spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
}

async function writeJson(targetPath, value) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

async function fixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-optional-console-test-"));
  const target = path.join(temporaryRoot, "optional-product");
  const configPath = path.join(temporaryRoot, "init.json");
  const stateDirectory = path.join(temporaryRoot, "runtime-state");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }));
  await writeJson(configPath, {
    schema_version: "temple.init/v1",
    project: { id: "optional-product", name: "Optional Product" },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  });
  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  assert.equal(git(target, ["init", "-q"]).status, 0);
  assert.equal(git(target, ["config", "user.email", "temple-tests@example.invalid"]).status, 0);
  assert.equal(git(target, ["config", "user.name", "Temple Tests"]).status, 0);
  assert.equal(git(target, ["add", "."]).status, 0);
  assert.equal(git(target, ["commit", "-qm", "initial state"]).status, 0);
  return { target, stateDirectory };
}

async function fileSize(targetPath) {
  try {
    return (await fs.stat(targetPath)).size;
  } catch (error) {
    if (error.code === "ENOENT") return 0;
    throw error;
  }
}

test("the Management Console has a truthful local read-only presentation mode", () => {
  const local = renderControlPlaneDashboard("Optional Product", { viewMode: "management-read-only" });
  assert.match(local, /Local · Read only/);
  assert.match(local, /Read-only local view/);
  assert.doesNotMatch(local, /<div class="nav-group local-tools">/);
  assert.doesNotMatch(local, /id="view-inbox"/);
  assert.doesNotMatch(local, /id="view-agent-commands"/);

  const privateView = renderControlPlaneDashboard("Optional Product", { viewMode: "private-read-only" });
  assert.match(privateView, /Private network · Read only/);
  assert.match(privateView, /Read-only private view/);
});

test("Temple Core initialization installs neither optional runtime", async (context) => {
  const state = await fixture(context);
  const status = await inspectLocalObserverService(state.target);
  assert.equal(status.service_status, "not-installed");
  assert.equal(status.running, false);
  assert.equal(status.observation_mode, "off");
  await assert.rejects(() => fs.access(status.state_directory), /ENOENT/);
});

test("the optional Console is read-only, does not own the writer lease, and does not grow telemetry", async (context) => {
  const state = await fixture(context);
  const journalPath = path.join(state.stateDirectory, "journal", "events.jsonl");
  const before = await fileSize(journalPath);
  const consoleServer = await startManagementConsoleServer(state.target, {
    stateDirectory: state.stateDirectory,
    port: 0,
    snapshotMaxAgeMs: 0
  });
  context.after(() => consoleServer.close());
  assert.equal(consoleServer.writer_lease_acquired, false);
  assert.equal(consoleServer.provider_started, false);
  assert.equal(consoleServer.repository_polling_started, false);

  const competingWriter = await acquireControlPlaneLease(state.stateDirectory);
  await competingWriter.release();

  const health = await fetch(`${consoleServer.url}/healthz`).then((response) => response.json());
  assert.equal(health.read_only, true);
  assert.equal(health.writer_lease_acquired, false);
  assert.equal(health.provider_started, false);
  const html = await fetch(consoleServer.url).then((response) => response.text());
  assert.match(html, /Local · Read only/);
  assert.doesNotMatch(html, /id="view-inbox"/);
  const snapshotResponse = await fetch(`${consoleServer.url}/api/v1/snapshot`);
  assert.equal(snapshotResponse.status, 200);
  const snapshot = await snapshotResponse.json();
  assert.equal(snapshot.management_console.optional, true);
  assert.equal(snapshot.management_console.read_only, true);
  assert.equal(snapshot.authority.mutations_available, false);
  assert.equal(Object.hasOwn(snapshot, "inbox"), false);
  const rejected = await fetch(`${consoleServer.url}/api/v1/inbox/agent-command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  assert.equal(rejected.status, 405);
  await fetch(`${consoleServer.url}/api/v1/snapshot`);
  assert.equal(await fileSize(journalPath), before);
});

test("the optional Console emits a bounded refresh signal after canonical state changes", async (context) => {
  const state = await fixture(context);
  const consoleServer = await startManagementConsoleServer(state.target, {
    stateDirectory: state.stateDirectory,
    port: 0
  });
  context.after(() => consoleServer.close());

  const controller = new AbortController();
  const events = await fetch(`${consoleServer.url}/api/v1/events`, { signal: controller.signal });
  const reader = events.body.getReader();
  const decoder = new TextDecoder();
  await reader.read();

  const projectPath = path.join(state.target, ".ai-org/project/project.json");
  const projectContents = await fs.readFile(projectPath, "utf8");
  await fs.writeFile(projectPath, projectContents);

  const refresh = Promise.race([
    (async () => {
      let received = "";
      while (!received.includes("event: temple.refresh")) {
        const chunk = await reader.read();
        if (chunk.done) break;
        received += decoder.decode(chunk.value, { stream: true });
      }
      return received;
    })(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Console refresh signal timed out")), 2000))
  ]);
  assert.match(await refresh, /event: temple\.refresh/);
  controller.abort();
});

test("the on-demand Collector writes retained telemetry without HTTP and can coexist with the Console", async (context) => {
  const state = await fixture(context);
  const providerLifecycle = [];
  const startProvider = async (_target, journal, registry, options) => {
    const providerId = options.providerId ?? "codex-local";
    return {
      providerId,
      async start() {
        providerLifecycle.push("start");
        registry.update(providerId, { status: "ready", degraded_reason: null });
        await journal.append({
          id: "usage-fixture-1",
          source: "urn:temple:provider:codex-app-server:fixture",
          type: "org.temple.codex.usage.updated.v1",
          time: "2026-09-02T04:00:00.000Z",
          data: {
            project_id: "optional-product",
            work_item_id: "WI-0001",
            task_id: "task-0001",
            position_id: "developer",
            input_tokens: 100,
            output_tokens: 20,
            total_tokens: 120
          }
        });
      },
      async stop() {
        providerLifecycle.push("stop");
        registry.update(providerId, { status: "disabled", degraded_reason: "stopped" });
      }
    };
  };
  const collector = await startUsageCollector(state.target, {
    stateDirectory: state.stateDirectory,
    observationMode: "on-demand",
    startProvider
  });
  context.after(() => collector.close());
  assert.equal(collector.http_listener_started, false);
  assert.equal(collector.console_started, false);
  assert.equal(collector.writer_lease_acquired, true);
  assert.deepEqual(providerLifecycle, ["start"]);
  await assert.rejects(() => acquireControlPlaneLease(state.stateDirectory), /already running/);
  const running = await inspectLocalObserverService(state.target, { stateDirectory: state.stateDirectory });
  assert.equal(running.observation_mode, "on-demand");
  assert.equal(running.running, true);
  assert.equal(running.loopback_url, null);

  const consoleServer = await startManagementConsoleServer(state.target, {
    stateDirectory: state.stateDirectory,
    port: 0,
    snapshotMaxAgeMs: 0
  });
  const snapshot = await fetch(`${consoleServer.url}/api/v1/snapshot`).then((response) => response.json());
  assert.equal(snapshot.management_console.read_only, true);
  assert.equal(snapshot.journal.retained_events, 1);
  await consoleServer.close();

  await collector.close();
  assert.deepEqual(providerLifecycle, ["start", "stop"]);
  const stopped = await inspectLocalObserverService(state.target, { stateDirectory: state.stateDirectory });
  assert.equal(stopped.observation_mode, "off");
  assert.equal(stopped.running, false);
  const retained = await fs.readFile(path.join(state.stateDirectory, "journal", "events.jsonl"), "utf8");
  assert.match(retained, /usage-fixture-1/);
});

test("the Console snapshot removes local mutation and telemetry path details", () => {
  const safe = managementConsoleSnapshot({
    authority: { canonical: ".ai-org/" },
    usage: { source: { state_directory: "/private/runtime", capture_health: { provider_status: "disabled" } } },
    daemon: { pid: 123 },
    inbox: { runtime_permissions: [] },
    recent_events: [{ data: { secret: "redacted" } }]
  });
  assert.equal(safe.authority.viewer, "local-read-only");
  assert.equal(safe.authority.mutations_available, false);
  assert.equal(safe.management_console.optional, true);
  assert.equal(safe.management_console.usage_collection_active, false);
  assert.equal(Object.hasOwn(safe, "daemon"), false);
  assert.equal(Object.hasOwn(safe, "inbox"), false);
  assert.equal(Object.hasOwn(safe, "recent_events"), false);
  assert.equal(Object.hasOwn(safe.usage.source, "state_directory"), false);
});

test("CLI help presents Console and collection as separate optional commands", () => {
  const help = run(["--help"]);
  assert.equal(help.status, 0, help.stderr || help.stdout);
  assert.match(help.stdout, /temple console start/);
  assert.match(help.stdout, /temple usage collect/);
  assert.match(help.stdout, /Optionally serve the read-only human Management Console/);
});
