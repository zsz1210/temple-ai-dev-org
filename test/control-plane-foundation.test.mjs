import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ingestControlPlaneFixture,
  inspectControlPlane,
  rebuildControlPlane,
  startControlPlaneServer
} from "../src/control-plane-server.mjs";
import {
  acquireControlPlaneLease,
  openTelemetryJournal,
  resolveControlPlaneStateDirectory
} from "../src/telemetry.mjs";
import { defaultControlPlaneConfig, validateControlPlaneConfig } from "../src/control-plane-config.mjs";
import { createRefreshCoordinator, renderControlPlaneDashboard } from "../src/control-plane-dashboard.mjs";

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
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-control-plane-test-"));
  const target = path.join(temporaryRoot, "control-product");
  const configPath = path.join(temporaryRoot, "init.json");
  const stateDirectory = path.join(temporaryRoot, "runtime-state");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await writeJson(configPath, {
    schema_version: "temple.init/v1",
    project: { id: "control-product", name: "Control Product" },
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
  return { temporaryRoot, target, stateDirectory };
}

function event(id, data = {}) {
  return {
    id,
    source: "urn:temple:provider:fixture:test",
    type: "org.temple.fixture.updated.v1",
    subject: "project/control-product/work-item/WI-0001",
    time: "2026-08-30T00:00:00.000Z",
    data
  };
}

test("Dashboard refresh coordination coalesces replay bursts without concurrent snapshot loads", async () => {
  let calls = 0;
  let active = 0;
  let maximumActive = 0;
  const releases = [];
  const scheduled = [];
  const coordinator = createRefreshCoordinator(async () => {
    calls += 1;
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => releases.push(resolve));
    active -= 1;
  }, (callback) => scheduled.push(callback));

  const initial = coordinator.load();
  for (let index = 0; index < 2_000; index += 1) coordinator.scheduleLoad();
  assert.equal(calls, 1);
  assert.equal(maximumActive, 1);
  assert.equal(scheduled.length, 0);

  releases.shift()();
  while (calls < 2) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 2);
  assert.equal(maximumActive, 1);
  releases.shift()();
  await initial;
  assert.equal(active, 0);

  let idleCalls = 0;
  const idleScheduled = [];
  const idleCoordinator = createRefreshCoordinator(async () => {
    idleCalls += 1;
  }, (callback) => idleScheduled.push(callback));
  for (let index = 0; index < 2_000; index += 1) idleCoordinator.scheduleLoad();
  assert.equal(idleScheduled.length, 1);
  idleScheduled.shift()();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(idleCalls, 1);
});

test("telemetry journal redacts secrets, deduplicates stable identities, retains cursors, and excludes a second writer", async (context) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-journal-test-"));
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const lease = await acquireControlPlaneLease(temporaryRoot);
  await assert.rejects(() => acquireControlPlaneLease(temporaryRoot), /already running/);
  const journal = await openTelemetryJournal(temporaryRoot, {
    maxEvents: 2,
    privacy: { max_data_bytes: 4096, redact_keys: ["token", "password"] }
  });
  const first = await journal.append(event("event-1", {
    authorization: "Bearer live-secret-value",
    nested: { password: "do-not-store", message: "safe" }
  }));
  assert.equal(first.duplicate, false);
  assert.equal(first.record.data.authorization, "[REDACTED]");
  assert.equal(first.record.data.nested.password, "[REDACTED]");
  assert.equal(first.record.data.nested.message, "safe");
  const duplicate = await journal.append(event("event-1", {
    authorization: "Bearer another-value",
    nested: { password: "different", message: "safe" }
  }));
  assert.equal(duplicate.duplicate, true);
  await assert.rejects(() => journal.append(event("event-1", { status: "different" })), /identity collision/);
  await journal.append(event("event-2", { status: "active" }));
  await journal.append(event("event-3", { status: "completed" }));
  assert.deepEqual(journal.snapshot(), {
    schema_version: "temple.control-plane-checkpoint/v1",
    first_cursor: 2,
    last_cursor: 3,
    retained_events: 2
  });
  assert.equal(journal.readAfter(0).reset_required, true);
  assert.deepEqual(journal.readAfter(2).records.map((record) => record.id), ["event-3"]);
  await journal.close();
  await lease.release();
});

test("linked worktrees resolve one generated control-plane state directory", async (context) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-worktree-state-test-"));
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const repository = path.join(temporaryRoot, "repository");
  const linked = path.join(temporaryRoot, "linked");
  await fs.mkdir(repository);
  assert.equal(git(repository, ["init", "-q"]).status, 0);
  assert.equal(git(repository, ["config", "user.email", "temple-tests@example.invalid"]).status, 0);
  assert.equal(git(repository, ["config", "user.name", "Temple Tests"]).status, 0);
  await fs.writeFile(path.join(repository, "README.md"), "fixture\n");
  assert.equal(git(repository, ["add", "."]).status, 0);
  assert.equal(git(repository, ["commit", "-qm", "initial"]).status, 0);
  assert.equal(git(repository, ["worktree", "add", "-q", "-b", "linked-test", linked]).status, 0);
  assert.equal(resolveControlPlaneStateDirectory(repository), resolveControlPlaneStateDirectory(linked));
  assert.match(resolveControlPlaneStateDirectory(repository), /\.git\/temple\/control-plane$/);
});

test("init installs the safe control-plane config and fixture ingestion is replay-safe", async (context) => {
  const { temporaryRoot, target, stateDirectory } = await fixture(context);
  const config = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/control-plane.json"), "utf8"));
  assert.equal(config.schema_version, "temple.control-plane-config/v1");
  assert.equal(config.server.host, "127.0.0.1");
  assert.equal(config.privacy.capture_raw_payloads, false);
  assert.equal(config.alerts.stalled_after_ms, 300000);
  const lock = JSON.parse(await fs.readFile(path.join(target, "temple.lock"), "utf8"));
  assert.equal(lock.capabilities.local_telemetry_journal, true);
  assert.equal(lock.capabilities.control_plane_http_sse, true);
  assert.equal(lock.capabilities.live_observer, true);
  assert.equal(lock.capabilities.codex_app_server_adapter, true);
  assert.equal(lock.capabilities.control_plane_conditions, true);
  assert.equal(lock.capabilities.human_inbox, true);
  assert.equal(lock.capabilities.inbox_command_gateway, true);
  assert.equal(lock.capabilities.github_pr_checks_provider, true);
  assert.equal(lock.capabilities.github_evidence_capture, true);

  const fixturePath = path.join(temporaryRoot, "provider-fixture.json");
  await writeJson(fixturePath, {
    schema_version: "temple.provider-fixture/v1",
    provider_id: "fixture-alpha",
    observed_at: "2026-08-30T00:00:01.000Z",
    events: [event("fixture-event", { status: "active", token: "never-store" })]
  });
  const first = await ingestControlPlaneFixture(target, fixturePath, { stateDirectory });
  const second = await ingestControlPlaneFixture(target, fixturePath, { stateDirectory });
  assert.equal(first.result.appended, 1);
  assert.equal(second.result.duplicates, 1);
  const snapshot = (await inspectControlPlane(target, { stateDirectory })).snapshot;
  assert.equal(snapshot.authority.telemetry_satisfies_gates, false);
  assert.ok(snapshot.providers.providers.some((provider) => provider.id === "fixture-alpha"));
  assert.equal(snapshot.recent_events.find((entry) => entry.id === "fixture-event").data.token, "[REDACTED]");
});

test("upgrade seeds missing project-owned control-plane configuration without managing later changes", async (context) => {
  const { target } = await fixture(context);
  const configPath = path.join(target, ".ai-org/project/control-plane.json");
  const lockPath = path.join(target, "temple.lock");
  const lock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  lock.template.version = "0.1.0-alpha.19";
  for (const capability of [
    "control_plane_config",
    "telemetry_event_envelope",
    "local_telemetry_journal",
    "provider_capability_contract",
    "repository_telemetry_provider",
    "fixture_telemetry_provider",
    "control_plane_http_sse"
  ]) delete lock.capabilities[capability];
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  await fs.rm(configPath);
  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 0, upgraded.stderr || upgraded.stdout);
  const upgradedLock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  assert.equal(upgradedLock.template.version, "0.1.0-alpha.27");
  assert.equal(upgradedLock.capabilities.local_telemetry_journal, true);
  assert.equal(upgradedLock.capabilities.live_observer, true);
  assert.ok(!upgradedLock.managed_files.some((entry) => entry.path === ".ai-org/project/control-plane.json"));
  const projectConfig = JSON.parse(await fs.readFile(configPath, "utf8"));
  projectConfig.retention.max_events = 250;
  await fs.writeFile(configPath, `${JSON.stringify(projectConfig, null, 4)}\n`);
  const before = await fs.readFile(configPath, "utf8");
  const current = run(["upgrade", target]);
  assert.equal(current.status, 0, current.stderr || current.stdout);
  assert.equal(await fs.readFile(configPath, "utf8"), before);
});

test("HTTP snapshot and SSE replay expose local events while arbitrary mutation stays unavailable", async (context) => {
  const { target, stateDirectory } = await fixture(context);
  const controlPlane = await startControlPlaneServer(target, {
    stateDirectory,
    port: 0,
    repositoryIntervalMs: 50
  });
  context.after(() => controlPlane.close());
  const initialResponse = await fetch(`${controlPlane.url}/api/v1/snapshot`);
  assert.equal(initialResponse.status, 200);
  const initial = await initialResponse.json();
  assert.equal(initial.schema_version, "temple.control-plane-snapshot/v1");
  assert.equal(initial.usage.schema_version, "temple.usage-baseline/v1");
  assert.equal(initial.usage.baseline_status, "insufficient-data");
  assert.equal(initial.usage.totals.total_tokens, null);
  assert.equal(initial.usage.source.longitudinal_coverage.qualification.status, "not-qualified");
  assert.equal(initial.usage.canonical_state_changed, false);
  const cursor = initial.journal.last_cursor;
  const appended = await controlPlane.journal.append(event("sse-event", { status: "active" }));
  assert.equal(appended.record.templecursor, cursor + 1);
  await controlPlane.journal.append({
    id: "usage-observation",
    source: "urn:temple:provider:codex-local",
    type: "org.temple.codex.usage.updated.v1",
    subject: "project/control-product/task/task-unregistered",
    time: "2026-08-30T00:00:02.000Z",
    data: {
      raw_prompt: "must-not-enter-the-usage-projection",
      attribution: {
        project_id: "control-product",
        work_item_id: "WI-unregistered",
        position_id: "developer",
        lifecycle_stage: "build",
        task_id: "task-unregistered",
        attempt_id: "attempt-1",
        provider_id: "codex-local",
        model: "fixture-model",
        model_version: "fixture-model-1",
        reasoning_effort: "medium",
        service_tier: "fixture",
        context_capsule_digest: "sha256:fixture-context",
        capability_set_digest: "sha256:fixture-capabilities",
        outcome: "observed"
      },
      usage: {
        last: {
          input_tokens: 100,
          cached_input_tokens: 25,
          output_tokens: 40,
          reasoning_output_tokens: 10,
          total_tokens: 175
        }
      }
    }
  });
  const observedUsage = (await (await fetch(`${controlPlane.url}/api/v1/snapshot`)).json()).usage;
  assert.equal(observedUsage.baseline_status, "observed");
  assert.equal(observedUsage.totals.total_tokens, 175);
  assert.equal(observedUsage.driver_groups[0].dimensions.model, "fixture-model");
  assert.equal(observedUsage.source.longitudinal_coverage.detailed_token_observation_coverage.uncorrelated_observations, 1);
  assert.doesNotMatch(JSON.stringify(observedUsage), /must-not-enter-the-usage-projection/);

  const controller = new AbortController();
  const response = await fetch(`${controlPlane.url}/api/v1/events?after=${cursor}`, { signal: controller.signal });
  assert.equal(response.status, 200);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  const deadline = Date.now() + 2000;
  while (!text.includes("sse-event") && Date.now() < deadline) {
    const next = await Promise.race([
      reader.read(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SSE replay timed out")), 500))
    ]);
    if (next.done) break;
    text += decoder.decode(next.value, { stream: true });
  }
  controller.abort();
  await reader.cancel().catch(() => {});
  assert.match(text, new RegExp(`id: ${cursor + 1}`));
  assert.equal((text.match(/sse-event/g) ?? []).length, 1);

  const mutation = await fetch(`${controlPlane.url}/api/v1/snapshot`, { method: "POST" });
  assert.equal(mutation.status, 405);
  assert.equal((await mutation.json()).error, "Phase 3C accepts mutations only through bounded Human Inbox routes");
  await controlPlane.close();
});

test("HTTP becomes available before a slow Codex history reconciliation completes", async (context) => {
  const { temporaryRoot, target, stateDirectory } = await fixture(context);
  const created = run([
    "work-item", "create", target,
    "--title", "Slow provider fixture",
    "--scope", "Prove HTTP-first startup",
    "--acceptance", "Health remains responsive",
    "--affected-path", "src/control-plane",
    "--ui-mode", "not-applicable",
    "--json"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const workItemId = JSON.parse(created.stdout).item.id;
  const registered = run([
    "task", "register", target,
    "--work-item", workItemId,
    "--position", "developer",
    "--thread-id", "thread-slow-001",
    "--revision", "a".repeat(40),
    "--json"
  ]);
  assert.equal(registered.status, 0, registered.stderr || registered.stdout);
  const fakeServer = path.join(temporaryRoot, "slow-app-server.mjs");
  await fs.writeFile(fakeServer, `
    import readline from "node:readline";
    const input=readline.createInterface({input:process.stdin});
    const send=(value)=>process.stdout.write(JSON.stringify(value)+"\\n");
    input.on("line",line=>{const message=JSON.parse(line);if(message.method==="initialize")send({jsonrpc:"2.0",id:message.id,result:{serverInfo:{version:"slow-fixture"}}});});
  `);
  const startedAt = Date.now();
  const controlPlane = await startControlPlaneServer(target, {
    stateDirectory,
    port: 0,
    repositoryIntervalMs: 50,
    enableCodex: true,
    codexCommand: process.execPath,
    codexCommandArgs: [fakeServer],
    resumeCodexThreads: false
  });
  context.after(() => controlPlane.close());
  assert.ok(Date.now() - startedAt < 1000, "server startup waited for Codex history reconciliation");
  assert.ok(controlPlane.codexStartup instanceof Promise);
  const health = await fetch(`${controlPlane.url}/healthz`);
  const snapshot = await fetch(`${controlPlane.url}/api/v1/snapshot`);
  assert.equal(health.status, 200);
  assert.equal(snapshot.status, 200);
  assert.equal((await snapshot.json()).schema_version, "temple.control-plane-snapshot/v1");
  await controlPlane.close();
});

test("Codex history bounds are validated and the Dashboard exposes terminal work", () => {
  const config = defaultControlPlaneConfig();
  config.providers.push({
    id: "codex-local",
    kind: "codex-app-server",
    enabled: true,
    options: {
      resume_threads: false,
      history_turn_limit: 20,
      history_item_limit: 200
    }
  });
  assert.deepEqual(validateControlPlaneConfig(config), { valid: true, errors: [] });
  config.providers[1].options.history_item_limit = 1001;
  config.providers[1].options.unknown_option = true;
  const invalid = validateControlPlaneConfig(config);
  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.join("\n"), /history_item_limit/);
  assert.match(invalid.errors.join("\n"), /unsupported fields/);
  const html = renderControlPlaneDashboard("Fixture Project");
  assert.match(html, /Terminal/);
  assert.match(html, /History only/);
  assert.match(html, /badge\.terminal/);
  assert.match(html, /badge\.history-only/);
  assert.match(html, /data-nav-target="now"/);
  assert.match(html, /data-nav-target="execution"/);
  assert.match(html, /data-nav-target="usage"/);
  assert.match(html, /data-nav-target="system"/);
  assert.match(html, /data-nav-target="history"/);
  assert.match(html, /Who is doing what\?/);
  assert.match(html, /Responsibility map/);
  assert.match(html, /filter\(hasLiveExecution\)/);
  assert.match(html, /No claimed, blocked, or live-attached execution is currently observed/);
  assert.match(html, /Queued and waiting \(/);
  assert.match(html, /governanceDecisions/);
  assert.match(html, /No detailed Token observations yet/);
  assert.match(html, /formatUsageNumber/);
  assert.match(html, /automatic model switching remain unavailable/);
  assert.match(html, /createRefreshCoordinator/);
  assert.match(html, /events\.onmessage=scheduleLoad/);
  assert.doesNotMatch(html, /events\.onmessage=load/);
});

test("rebuild preserves the previous journal and reconstructs canonical repository events", async (context) => {
  const { target, stateDirectory } = await fixture(context);
  const created = run([
    "work-item", "create", target,
    "--title", "Rebuild telemetry",
    "--scope", "Create one canonical event",
    "--acceptance", "Event is recoverable",
    "--affected-path", "src/control-plane",
    "--ui-mode", "not-applicable"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const fixturePath = path.join(path.dirname(stateDirectory), "one-event.json");
  await writeJson(fixturePath, {
    schema_version: "temple.provider-fixture/v1",
    provider_id: "fixture-rebuild",
    events: [event("transient-only", { status: "active" })]
  });
  await ingestControlPlaneFixture(target, fixturePath, { stateDirectory });
  const rebuilt = await rebuildControlPlane(target, { stateDirectory });
  assert.ok(rebuilt.archivePath);
  assert.equal(await fs.readFile(rebuilt.archivePath, "utf8").then((value) => value.includes("transient-only")), true);
  assert.ok(rebuilt.repository.source_events >= 1);
  assert.ok(rebuilt.snapshot.recent_events.some((entry) => entry.source.startsWith("urn:temple:repository:")));
  assert.ok(!rebuilt.snapshot.recent_events.some((entry) => entry.id === "transient-only"));
});
