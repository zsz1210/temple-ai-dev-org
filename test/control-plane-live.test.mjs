import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildCodexRuntimeRequestResponse,
  classifyCodexAttachFailure,
  classifyCodexTasks,
  normalizeCodexMessage,
  normalizeCodexThreadSnapshot,
  startCodexAppServerProvider,
  summarizeUnifiedDiff
} from "../src/codex-app-server-provider.mjs";
import {
  createProviderRegistry,
  repositoryProviderContract
} from "../src/control-plane-providers.mjs";
import { codexAppServerProviderContract } from "../src/codex-app-server-provider.mjs";
import { buildObserverProjection } from "../src/observer.mjs";
import { buildLiveObserverProjection } from "../src/live-observer.mjs";
import { buildConditionProjection } from "../src/control-plane-conditions.mjs";
import { defaultControlPlaneConfig } from "../src/control-plane-config.mjs";
import { openTelemetryJournal } from "../src/telemetry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

async function writeJson(targetPath, value) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

async function fixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-live-test-"));
  const target = path.join(temporaryRoot, "live-product");
  const configPath = path.join(temporaryRoot, "init.json");
  const stateDirectory = path.join(temporaryRoot, "state");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await writeJson(configPath, {
    schema_version: "temple.init/v1",
    project: { id: "live-product", name: "Live Product" },
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
  const created = run([
    "work-item", "create", target,
    "--title", "Observe live implementation",
    "--scope", "Expose bounded runtime state",
    "--acceptance", "Terminal observations win",
    "--affected-path", "src/live",
    "--ui-mode", "not-applicable",
    "--json"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const workItemId = JSON.parse(created.stdout).item.id;
  const registered = run([
    "task", "register", target,
    "--work-item", workItemId,
    "--position", "product_manager",
    "--thread-id", "thread-live-001",
    "--host-id", "local",
    "--revision", "0123456789abcdef0123456789abcdef01234567",
    "--json"
  ]);
  assert.equal(registered.status, 0, registered.stderr || registered.stdout);
  return { temporaryRoot, target, stateDirectory, workItemId, task: JSON.parse(registered.stdout) };
}

test("Codex normalization retains bounded summaries and excludes raw prompts, commands, diffs, and tool payloads", () => {
  const tasks = [{ id: "task-0001", work_item_id: "WI-0001", thread_id: "thread-1", current_revision: "a".repeat(40) }];
  const plan = normalizeCodexMessage("project", tasks, {
    method: "turn/plan/updated",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      explanation: "private prompt fragment",
      plan: [{ step: "Implement the safe projection", status: "inProgress" }]
    }
  }, { observedAt: "2026-08-30T00:00:00.000Z" });
  assert.deepEqual(plan.data.plan, [{ step: "Implement the safe projection", status: "inProgress" }]);
  assert.equal(plan.data.explanation_retained, false);
  assert.doesNotMatch(JSON.stringify(plan), /private prompt fragment/);

  const diff = normalizeCodexMessage("project", tasks, {
    method: "turn/diff/updated",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      diff: "--- a/src/a.mjs\n+++ b/src/a.mjs\n@@ -1 +1,2 @@\n-secret-value\n+safe\n+line"
    }
  }, { observedAt: "2026-08-30T00:00:01.000Z" });
  assert.deepEqual(diff.data.diff_summary, {
    files: ["src/a.mjs"], file_count: 1, additions: 2, deletions: 1, hunks: 1, raw_diff_retained: false
  });
  assert.doesNotMatch(JSON.stringify(diff), /secret-value/);
  assert.deepEqual(summarizeUnifiedDiff("+++ b/a\n+x"), {
    files: ["a"], file_count: 1, additions: 1, deletions: 0, hunks: 0, raw_diff_retained: false
  });

  const request = normalizeCodexMessage("project", tasks, {
    id: "approval-1",
    method: "item/commandExecution/requestApproval",
    params: { threadId: "thread-1", turnId: "turn-1", itemId: "item-1", command: "print-super-secret", reason: "network access" }
  }, { observedAt: "2026-08-30T00:00:02.000Z" });
  assert.equal(request.data.request_class, "runtime-permission");
  assert.equal(request.data.command_present, true);
  assert.equal(request.data.raw_request_retained, false);
  assert.doesNotMatch(JSON.stringify(request), /print-super-secret/);
});

test("Codex runtime-request responses match the pinned App Server response shapes", () => {
  assert.deepEqual(
    buildCodexRuntimeRequestResponse(
      "item/commandExecution/requestApproval",
      { availableDecisions: ["accept", "acceptForSession", "decline"] },
      { decision: "acceptForSession" }
    ),
    { decision: "acceptForSession" }
  );
  assert.deepEqual(
    buildCodexRuntimeRequestResponse(
      "item/permissions/requestApproval",
      { permissions: { network: { enabled: true } } },
      { decision: "accept" }
    ),
    { permissions: { network: { enabled: true } }, scope: "turn" }
  );
  assert.deepEqual(
    buildCodexRuntimeRequestResponse(
      "item/permissions/requestApproval",
      { permissions: { network: { enabled: true } } },
      { decision: "decline" }
    ),
    { permissions: {}, scope: "turn" }
  );
  assert.deepEqual(
    buildCodexRuntimeRequestResponse(
      "item/tool/requestUserInput",
      { questions: [{ id: "region" }] },
      { answers: { region: ["Japan"] } }
    ),
    { answers: { region: { answers: ["Japan"] } } }
  );
  assert.throws(
    () => buildCodexRuntimeRequestResponse(
      "item/tool/requestUserInput",
      { questions: [{ id: "region" }] },
      { answers: {} }
    ),
    /answer every current question/
  );
});

test("Codex snapshot reconciliation retains a bounded window and deduplicates equivalent observations", async (context) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-reconciliation-test-"));
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const tasks = [{
    id: "task-0001",
    work_item_id: "WI-0001",
    thread_id: "thread-1",
    current_revision: "a".repeat(40),
    created_at: "2026-08-29T23:59:00.000Z"
  }];
  const thread = {
    id: "thread-1",
    status: { type: "idle" },
    turns: Array.from({ length: 4 }, (_, turnIndex) => ({
      id: `turn-${turnIndex + 1}`,
      status: "completed",
      items: Array.from({ length: 4 }, (_, itemIndex) => ({
        id: `item-${turnIndex + 1}-${itemIndex + 1}`,
        type: "agentMessage"
      }))
    }))
  };
  const events = normalizeCodexThreadSnapshot("project", tasks, thread, {
    observedAt: "2026-08-30T00:00:00.000Z",
    historyTurnLimit: 2,
    historyItemLimit: 3
  });
  assert.equal(events.length, 6);
  assert.deepEqual(
    [...new Set(events.map((entry) => entry.data.provider_turn_id).filter(Boolean))],
    ["turn-3", "turn-4"]
  );
  assert.deepEqual(
    events.map((entry) => entry.data.provider_item_id).filter(Boolean),
    ["item-4-2", "item-4-3", "item-4-4"]
  );
  assert.deepEqual(events[0].data.reconciliation_window, {
    turn_limit: 2,
    item_limit: 3,
    available_turns: 4,
    retained_turns: 2,
    available_items: 16,
    retained_items: 3,
    truncated: true
  });
  assert.deepEqual(events[0].data.reconciliation_bounds, { turn_limit: 2, item_limit: 3 });
  assert.ok(events.slice(1).every((entry) => entry.data.reconciliation_window === undefined));
  assert.ok(events.every((entry) => entry.data.reconciliation_bounds.turn_limit === 2));
  assert.doesNotMatch(JSON.stringify(events), /item-1-|item-2-|item-3-/);

  const repeated = normalizeCodexThreadSnapshot("project", tasks, thread, {
    observedAt: "2026-08-30T00:30:00.000Z",
    historyTurnLimit: 2,
    historyItemLimit: 3
  });
  assert.deepEqual(repeated.map((entry) => entry.id), events.map((entry) => entry.id));
  assert.deepEqual(repeated.map((entry) => entry.time), events.map((entry) => entry.time));

  const journal = await openTelemetryJournal(temporaryRoot, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  for (const entry of events) assert.equal((await journal.append(entry)).duplicate, false);
  for (const entry of repeated) assert.equal((await journal.append(entry)).duplicate, true);
  assert.equal(journal.snapshot().retained_events, events.length);

  const expandedThread = {
    ...thread,
    turns: [...thread.turns, { id: "turn-5", status: "completed", items: [] }]
  };
  const expanded = normalizeCodexThreadSnapshot("project", tasks, expandedThread, {
    observedAt: "2026-08-30T00:45:00.000Z",
    historyTurnLimit: 2,
    historyItemLimit: 3
  });
  assert.notEqual(expanded[0].id, events[0].id, "the changing snapshot summary must remain observable");
  const retainedTurn = events.find((entry) => entry.data.provider_turn_id === "turn-4" && !entry.data.provider_item_id);
  const expandedRetainedTurn = expanded.find((entry) => entry.data.provider_turn_id === "turn-4" && !entry.data.provider_item_id);
  assert.equal(expandedRetainedTurn.id, retainedTurn.id, "an unchanged historical turn must retain its identity");
});

test("repository observer classifies completed and cancelled work as terminal", async (context) => {
  const { target, workItemId } = await fixture(context);
  const firstPath = path.join(target, `.ai-org/work-items/${workItemId}.json`);
  const first = JSON.parse(await fs.readFile(firstPath, "utf8"));
  first.state = "done";
  await writeJson(firstPath, first);
  const created = run([
    "work-item", "create", target,
    "--title", "Cancelled fixture",
    "--scope", "Exercise terminal categorization",
    "--acceptance", "Cancellation is terminal",
    "--affected-path", "src/cancelled",
    "--ui-mode", "not-applicable",
    "--json"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const cancelledId = JSON.parse(created.stdout).item.id;
  const cancelledPath = path.join(target, `.ai-org/work-items/${cancelledId}.json`);
  const cancelled = JSON.parse(await fs.readFile(cancelledPath, "utf8"));
  cancelled.state = "cancelled";
  await writeJson(cancelledPath, cancelled);

  const observer = await buildObserverProjection(target);
  assert.equal(observer.work.categories.terminal, 2);
  assert.equal(observer.work.categories.queued, 0);
  assert.ok(observer.work.items.every((entry) => entry.category === "terminal"));
});

test("live projection forwards current attention and does not replay canonical repository events as fresh timeline rows", async (context) => {
  const { target, stateDirectory, workItemId } = await fixture(context);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  await journal.append({
    id: "canonical-replay-1",
    source: "urn:temple:repository:live-product",
    type: "org.temple.repository.work.item.created.v1",
    subject: `project/live-product/work-item/${workItemId}`,
    time: "2026-08-30T00:00:00.000Z",
    data: {
      canonical: true,
      event_type: "work_item_created",
      work_item_id: workItemId
    }
  });
  const observer = await buildObserverProjection(target);
  observer.attention.push({
    type: "approval_pending",
    work_item_id: workItemId,
    message: `${workItemId} needs a current decision`
  });
  const live = await buildLiveObserverProjection(
    target,
    observer,
    journal,
    createProviderRegistry([repositoryProviderContract()]),
    { now: "2026-08-30T00:01:00.000Z" }
  );
  assert.ok(live.attention.some((entry) => entry.type === "approval_pending" && entry.work_item_id === workItemId));
  assert.equal(
    live.timeline.some((entry) => entry.name === "org.temple.repository.work.item.created.v1"),
    false,
    "repository telemetry must not duplicate the canonical occurrence"
  );
  assert.ok(live.timeline.some((entry) => entry.provenance === "canonical" && entry.work_item_id === workItemId));
  assert.deepEqual(
    [...live.timeline].sort((left, right) => String(right.timestamp ?? right.observed_at).localeCompare(String(left.timestamp ?? left.observed_at))),
    live.timeline
  );
});

test("condition engine alerts on nonterminal stale evidence but keeps terminal evidence as history", async (context) => {
  const { target, stateDirectory, workItemId } = await fixture(context);
  const itemPath = path.join(target, `.ai-org/work-items/${workItemId}.json`);
  const item = JSON.parse(await fs.readFile(itemPath, "utf8"));
  item.state = "done";
  await writeJson(itemPath, item);

  const observer = await buildObserverProjection(target);
  observer.evidence.items = [{
    id: "EVID-HISTORICAL",
    work_item_id: workItemId,
    stale: true,
    scope_revision: "a".repeat(40),
    current_scope_revision: "b".repeat(40)
  }];
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const terminal = await buildConditionProjection(target, observer, journal, registry, defaultControlPlaneConfig(), {
    stateDirectory,
    persist: false,
    now: "2026-08-30T00:00:04.000Z"
  });
  const terminalStale = terminal.conditions.filter((entry) => entry.type === "stale-evidence");
  assert.deepEqual(terminalStale.map((entry) => [entry.entity, entry.status]), [["project", "false"]]);

  item.state = "build";
  await writeJson(itemPath, item);
  const nonterminal = await buildConditionProjection(target, observer, journal, registry, defaultControlPlaneConfig(), {
    stateDirectory,
    persist: false,
    now: "2026-08-30T00:00:05.000Z"
  });
  assert.ok(nonterminal.conditions.some((entry) =>
    entry.type === "stale-evidence" && entry.entity === "EVID-HISTORICAL" && entry.status === "true"
  ));
});

test("live projection labels unobserved tasks honestly and terminal item state wins over later transient deltas", async (context) => {
  const { target, stateDirectory, task } = await fixture(context);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([
    repositoryProviderContract(),
    codexAppServerProviderContract({ status: "ready" })
  ]);
  const completed = normalizeCodexMessage("live-product", [task], {
    method: "item/completed",
    params: {
      threadId: task.thread_id,
      turnId: "turn-1",
      item: { id: "item-1", type: "commandExecution", status: "completed", command: "never-store" },
      completedAtMs: Date.parse("2026-08-30T00:00:02.000Z")
    }
  }, { observedAt: "2026-08-30T00:00:02.000Z" });
  const started = normalizeCodexMessage("live-product", [task], {
    method: "item/started",
    params: {
      threadId: task.thread_id,
      turnId: "turn-1",
      item: { id: "item-1", type: "commandExecution", status: "inProgress", command: "never-store" },
      startedAtMs: Date.parse("2026-08-30T00:00:01.000Z")
    }
  }, { observedAt: "2026-08-30T00:00:03.000Z" });
  await journal.append(completed);
  await journal.append(started);
  const observer = await buildObserverProjection(target);
  const live = await buildLiveObserverProjection(target, observer, journal, registry, { now: "2026-08-30T00:00:04.000Z" });
  assert.equal(live.tasks.items[0].visibility, "live");
  assert.equal(live.tasks.items[0].items[0].terminal, true);
  assert.equal(live.tasks.items[0].items[0].status, "completed");
  assert.equal(live.privacy.raw_diffs_retained, false);

  registry.update("codex-local", { status: "offline", degraded_reason: "fixture disconnect" });
  const disconnected = await buildLiveObserverProjection(target, observer, journal, registry, { now: "2026-08-30T00:00:05.000Z" });
  assert.equal(disconnected.tasks.items[0].visibility, "unknown");
  assert.equal(disconnected.tasks.items[0].observed_status, "unknown");
});

test("condition engine keeps provider outages unknown and detects scope conflict, orphaning, and explicit usage budgets", async (context) => {
  const { target, stateDirectory, workItemId, task } = await fixture(context);
  const second = run([
    "work-item", "create", target,
    "--title", "Conflicting implementation",
    "--scope", "Touch the same boundary",
    "--acceptance", "Conflict is visible",
    "--affected-path", "src/live/child",
    "--ui-mode", "not-applicable",
    "--json"
  ]);
  assert.equal(second.status, 0, second.stderr || second.stdout);
  const secondId = JSON.parse(second.stdout).item.id;
  for (const id of [workItemId, secondId]) {
    const itemPath = path.join(target, `.ai-org/work-items/${id}.json`);
    const item = JSON.parse(await fs.readFile(itemPath, "utf8"));
    item.claim = { id: `claim-${id}`, status: "active", agent_id: item.assigned_agent_id, principal_id: "human", base_revision: "b".repeat(40) };
    item.claims = [item.claim];
    await writeJson(itemPath, item);
  }
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  await journal.append(normalizeCodexMessage("live-product", [task], {
    method: "thread/tokenUsage/updated",
    params: {
      threadId: task.thread_id,
      turnId: "turn-1",
      tokenUsage: {
        total: { inputTokens: 900, cachedInputTokens: 0, outputTokens: 200, reasoningOutputTokens: 0, totalTokens: 1100 },
        last: { inputTokens: 900, cachedInputTokens: 0, outputTokens: 200, reasoningOutputTokens: 0, totalTokens: 1100 },
        modelContextWindow: 10000
      }
    }
  }, { observedAt: "2026-08-30T00:00:00.000Z" }));
  const registry = createProviderRegistry([
    repositoryProviderContract(),
    codexAppServerProviderContract({ status: "offline", degradedReason: "fixture disconnect" })
  ]);
  const observer = await buildObserverProjection(target);
  const config = defaultControlPlaneConfig();
  config.alerts.pending_for_ms = 0;
  config.alerts.token_budget = 1000;
  const conditions = await buildConditionProjection(target, observer, journal, registry, config, {
    stateDirectory,
    now: "2026-08-30T00:10:00.000Z"
  });
  assert.equal(conditions.conditions.find((entry) => entry.id === `stalled-work:${task.id}`).status, "unknown");
  assert.ok(conditions.conditions.some((entry) => entry.type === "scope-conflict" && entry.status === "true"));
  assert.ok(conditions.conditions.some((entry) => entry.type === "usage-anomaly" && entry.status === "true"));
  assert.ok(conditions.conditions.some((entry) => entry.type === "orphaned-work"));
  assert.equal(conditions.summary.firing >= 2, true);

  const secondPath = path.join(target, `.ai-org/work-items/${secondId}.json`);
  const secondItem = JSON.parse(await fs.readFile(secondPath, "utf8"));
  const activeClaim = secondItem.claim;
  secondItem.claim = null;
  await writeJson(secondPath, secondItem);
  const recovered = await buildConditionProjection(target, observer, journal, registry, config, {
    stateDirectory,
    now: "2026-08-30T00:10:01.000Z"
  });
  const recoveredConflict = recovered.conditions.find((entry) => entry.type === "scope-conflict" && entry.entity !== "project");
  assert.equal(recoveredConflict.status, "false");
  assert.equal(recoveredConflict.lifecycle, "resolved");

  secondItem.claim = activeClaim;
  await writeJson(secondPath, secondItem);
  const cooled = await buildConditionProjection(target, observer, journal, registry, config, {
    stateDirectory,
    now: "2026-08-30T00:10:02.000Z"
  });
  const suppressedConflict = cooled.conditions.find((entry) => entry.id === recoveredConflict.id);
  assert.equal(suppressedConflict.status, "true");
  assert.equal(suppressedConflict.lifecycle, "suppressed");
});

test("Codex App Server provider handshakes, reconciles registered threads, and retains live requests only in memory", async (context) => {
  const { temporaryRoot, target, stateDirectory } = await fixture(context);
  const fakeServer = path.join(temporaryRoot, "fake-app-server.mjs");
  await fs.writeFile(fakeServer, `
    import readline from "node:readline";
    const input=readline.createInterface({input:process.stdin});
    const send=(value)=>process.stdout.write(JSON.stringify(value)+"\\n");
    const thread={id:"thread-live-001",status:{type:"idle"},turns:[{id:"turn-old",status:"completed",items:[{id:"item-old",type:"agentMessage"}]}]};
    input.on("line",line=>{const message=JSON.parse(line);if(message.method==="initialize")send({jsonrpc:"2.0",id:message.id,result:{serverInfo:{version:"fixture-1"}}});else if(message.method==="thread/read")send({jsonrpc:"2.0",id:message.id,result:{thread}});else if(message.method==="thread/resume"){send({jsonrpc:"2.0",id:message.id,result:{thread}});send({jsonrpc:"2.0",method:"turn/plan/updated",params:{threadId:thread.id,turnId:"turn-live",plan:[{step:"Live safe step",status:"inProgress"}],explanation:"do-not-store-explanation"}});send({jsonrpc:"2.0",method:"turn/diff/updated",params:{threadId:thread.id,turnId:"turn-live",diff:"+++ b/src/live.mjs\\n+do-not-store-diff"}});send({jsonrpc:"2.0",id:"approval-live",method:"item/commandExecution/requestApproval",params:{threadId:thread.id,turnId:"turn-live",itemId:"item-live",command:"do-not-store-command",reason:"fixture"}})}});
  `);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const provider = await startCodexAppServerProvider(target, journal, registry, {
    command: process.execPath,
    commandArgs: [fakeServer],
    reconnectMs: 60000
  });
  await provider.start();
  context.after(() => provider.stop());
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(registry.get("codex-local").status, "ready");
  assert.equal(registry.get("codex-local").protocol.detected_cli_version, "fixture-1");
  assert.equal(provider.pendingRequests()[0].request_id, "approval-live");
  const durable = JSON.stringify(journal.readAfter(0).records);
  assert.match(durable, /Live safe step/);
  assert.match(durable, /src\/live\.mjs/);
  assert.doesNotMatch(durable, /do-not-store-(?:explanation|diff|command)/);
  assert.ok(journal.readAfter(0).records.some((record) => record.data?.reconciled));
  await provider.stop();
});

test("Codex App Server Agent commands enforce registered state, exact active turns, and no retry after unknown delivery", async (context) => {
  const { temporaryRoot, target, stateDirectory, workItemId } = await fixture(context);
  const callsPath = path.join(temporaryRoot, "agent-command-calls.jsonl");
  const fakeServer = path.join(temporaryRoot, "fake-agent-command-app-server.mjs");
  await fs.writeFile(fakeServer, `
    import fs from "node:fs";
    import readline from "node:readline";
    const input=readline.createInterface({input:process.stdin});
    const send=(value)=>process.stdout.write(JSON.stringify(value)+"\\n");
    const thread={id:"thread-live-001",status:{type:"idle"},turns:[]};
    input.on("line",line=>{const message=JSON.parse(line);fs.appendFileSync(${JSON.stringify(callsPath)},JSON.stringify(message)+"\\n");if(message.method==="initialize")send({jsonrpc:"2.0",id:message.id,result:{serverInfo:{version:"fixture-agent-command"}}});else if(message.method==="thread/read")send({jsonrpc:"2.0",id:message.id,result:{thread}});else if(message.method==="thread/resume")send({jsonrpc:"2.0",id:message.id,result:{thread}});else if(message.method==="turn/start"){const turn={id:"turn-created-1",status:"inProgress",items:[]};thread.status={type:"active"};thread.turns=[turn];send({jsonrpc:"2.0",id:message.id,result:{turn}});send({jsonrpc:"2.0",method:"turn/started",params:{threadId:thread.id,turn}})}else if(message.method==="turn/steer"){const text=message.params.input?.[0]?.text||"";if(text.includes("reject"))send({jsonrpc:"2.0",id:message.id,error:{code:-32602,message:"fixture rejection secret-marker"}});else if(text.includes("timeout")){}else send({jsonrpc:"2.0",id:message.id,result:{turnId:"turn-created-1"}})}else if(message.method==="turn/interrupt"){send({jsonrpc:"2.0",id:message.id,result:{}});const turn={id:"turn-created-1",status:"interrupted",items:[]};thread.status={type:"idle"};thread.turns=[turn];send({jsonrpc:"2.0",method:"turn/completed",params:{threadId:thread.id,turn}})}});
  `);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const provider = await startCodexAppServerProvider(target, journal, registry, {
    command: process.execPath,
    commandArgs: [fakeServer],
    commandTimeoutMs: 30,
    reconnectMs: 60000
  });
  await provider.start();
  context.after(() => provider.stop());
  const idle = (await provider.agentCommandTargets())[0];
  assert.equal(idle.available, true);
  assert.deepEqual(idle.operations, ["new-turn"]);
  assert.equal(idle.active_turn_id, null);
  const base = {
    idempotency_key: "provider-command-0001",
    task_id: idle.task_id,
    work_item_id: workItemId,
    expected_task_status: idle.task_status,
    expected_work_item_state: idle.work_item_state,
    expected_provider_thread_id: idle.provider_thread_id,
    expected_active_turn_id: null
  };
  const started = await provider.dispatchAgentCommand({
    ...base,
    operation: "new-turn",
    instruction: "Start the deterministic fixture turn"
  });
  assert.equal(started.status, "turn-started");
  assert.equal(started.provider_turn_id, "turn-created-1");
  const active = (await provider.agentCommandTargets())[0];
  assert.deepEqual(active.operations, ["steer", "interrupt"]);
  assert.equal(active.active_turn_id, "turn-created-1");
  await assert.rejects(
    () => provider.dispatchAgentCommand({
      ...base,
      operation: "steer",
      instruction: "This must stop before dispatch",
      expected_active_turn_id: "turn-stale"
    }),
    /Active turn changed before dispatch/
  );
  await assert.rejects(
    () => provider.dispatchAgentCommand({
      ...base,
      task_id: "task-unregistered",
      operation: "steer",
      instruction: "This target is not registered",
      expected_active_turn_id: "turn-created-1"
    }),
    /not currently eligible/
  );
  const rejected = await provider.dispatchAgentCommand({
    ...base,
    idempotency_key: "provider-command-0002",
    operation: "steer",
    instruction: "reject this deterministic fixture",
    expected_active_turn_id: "turn-created-1"
  });
  assert.equal(rejected.status, "provider-rejected");
  assert.equal(rejected.automatic_retry, false);
  assert.doesNotMatch(JSON.stringify(rejected), /secret-marker/);
  const unknown = await provider.dispatchAgentCommand({
    ...base,
    idempotency_key: "provider-command-0003",
    operation: "steer",
    instruction: "timeout after the provider boundary",
    expected_active_turn_id: "turn-created-1"
  });
  assert.equal(unknown.status, "delivery-unknown");
  assert.equal(unknown.automatic_retry, false);
  const interrupted = await provider.dispatchAgentCommand({
    ...base,
    idempotency_key: "provider-command-0004",
    operation: "interrupt",
    instruction: "",
    expected_active_turn_id: "turn-created-1"
  });
  assert.equal(interrupted.status, "provider-accepted");
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.deepEqual((await provider.agentCommandTargets())[0].operations, ["new-turn"]);
  assert.ok(journal.readAfter(0).records.some((record) =>
    record.type === "org.temple.codex.turn.completed.v1" && record.data.status === "interrupted"
  ));

  const taskPath = path.join(target, ".ai-org/project/tasks.json");
  const taskRegistry = JSON.parse(await fs.readFile(taskPath, "utf8"));
  taskRegistry.tasks[0].host_id = "remote-host";
  await writeJson(taskPath, taskRegistry);
  assert.equal((await provider.agentCommandTargets())[0].unavailable_reason, "target-host-not-local");
  taskRegistry.tasks[0].host_id = "local";
  taskRegistry.tasks[0].status = "completed";
  await writeJson(taskPath, taskRegistry);
  assert.equal((await provider.agentCommandTargets())[0].unavailable_reason, "task-not-live");
  taskRegistry.tasks[0].status = "active";
  await writeJson(taskPath, taskRegistry);
  const itemPath = path.join(target, ".ai-org/work-items", `${workItemId}.json`);
  const item = JSON.parse(await fs.readFile(itemPath, "utf8"));
  item.state = "cancelled";
  await writeJson(itemPath, item);
  assert.equal((await provider.agentCommandTargets())[0].unavailable_reason, "work-item-terminal");

  const calls = (await fs.readFile(callsPath, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
  const turnStarts = calls.filter((entry) => entry.method === "turn/start");
  const turnSteers = calls.filter((entry) => entry.method === "turn/steer");
  assert.equal(turnStarts.length, 1);
  assert.equal(turnSteers.length, 2);
  assert.deepEqual(Object.keys(turnStarts[0].params).sort(), ["clientUserMessageId", "input", "threadId", "turnTrigger"]);
  assert.equal(turnStarts[0].params.input[0].text, "Start the deterministic fixture turn");
  assert.deepEqual(Object.keys(turnSteers[0].params).sort(), ["clientUserMessageId", "expectedTurnId", "input", "threadId"]);
  assert.equal(calls.filter((entry) => entry.method === "turn/interrupt").length, 1);
});

test("Codex App Server provider reconciles terminal task history without attempting a live resume", async (context) => {
  const { temporaryRoot, target, stateDirectory, workItemId, task } = await fixture(context);
  const cancelled = run([
    "transition", target,
    "--work-item", workItemId,
    "--to", "cancelled",
    "--satisfy", "cancellation_reason=fixture cancellation",
    "--actor", "human",
    "--json"
  ]);
  assert.equal(cancelled.status, 0, cancelled.stderr || cancelled.stdout);

  const callsPath = path.join(temporaryRoot, "app-server-calls.log");
  const fakeServer = path.join(temporaryRoot, "fake-terminal-app-server.mjs");
  await fs.writeFile(fakeServer, `
    import fs from "node:fs";
    import readline from "node:readline";
    const input=readline.createInterface({input:process.stdin});
    const send=(value)=>process.stdout.write(JSON.stringify(value)+"\\n");
    const thread={id:"thread-live-001",status:{type:"idle"},turns:[{id:"turn-old",status:"completed",items:[]}]};
    input.on("line",line=>{const message=JSON.parse(line);fs.appendFileSync(${JSON.stringify(callsPath)},message.method+"\\n");if(message.method==="initialize")send({jsonrpc:"2.0",id:message.id,result:{serverInfo:{version:"fixture-terminal"}}});else if(message.method==="thread/read")send({jsonrpc:"2.0",id:message.id,result:{thread}});else if(message.method==="thread/resume")send({jsonrpc:"2.0",id:message.id,error:{code:-32600,message:"terminal task must not be resumed"}})});
  `);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const provider = await startCodexAppServerProvider(target, journal, registry, {
    command: process.execPath,
    commandArgs: [fakeServer],
    reconnectMs: 60000
  });
  await provider.start();
  context.after(() => provider.stop());

  assert.deepEqual(
    Object.fromEntries(Object.entries(provider.taskTopology).map(([key, value]) => [key, value.length])),
    { registered: 1, history_reconcilable: 1, live_resumable: 0, terminal: 1, non_live: 0 }
  );
  assert.deepEqual(classifyCodexTasks([task], { workItems: [{ id: workItemId, state: "cancelled" }] }).live_resumable, []);
  assert.equal(registry.get("codex-local").status, "ready");
  const calls = (await fs.readFile(callsPath, "utf8")).trim().split("\n");
  assert.deepEqual(calls, ["initialize", "initialized", "thread/read"]);
  assert.ok(journal.readAfter(0).records.some((record) => record.data?.reconciled));
  const observer = await buildObserverProjection(target);
  const live = await buildLiveObserverProjection(target, observer, journal, registry, {
    now: "2026-08-30T00:00:10.000Z"
  });
  const projectedTask = live.tasks.items.find((entry) => entry.id === task.id);
  assert.equal(projectedTask.visibility, "history-only");
  assert.equal(projectedTask.provenance.runtime, "historical");
  assert.equal(projectedTask.provenance.capability_quality, "supported");
  assert.equal(projectedTask.attention, null);
  assert.equal(live.tasks.live, 0);
  assert.equal(live.tasks.history_only, 1);
  assert.ok(live.timeline.some((entry) => entry.provenance === "historical"));
  await provider.stop();
});

test("unsupported history read does not block a supported live resume", async (context) => {
  const { temporaryRoot, target, stateDirectory } = await fixture(context);
  const callsPath = path.join(temporaryRoot, "unsupported-read-calls.log");
  const fakeServer = path.join(temporaryRoot, "fake-unsupported-read-app-server.mjs");
  await fs.writeFile(fakeServer, `
    import fs from "node:fs";
    import readline from "node:readline";
    const input=readline.createInterface({input:process.stdin});
    const send=(value)=>process.stdout.write(JSON.stringify(value)+"\\n");
    const thread={id:"thread-live-001",status:{type:"active"},turns:[]};
    input.on("line",line=>{const message=JSON.parse(line);fs.appendFileSync(${JSON.stringify(callsPath)},message.method+"\\n");if(message.method==="initialize")send({jsonrpc:"2.0",id:message.id,result:{serverInfo:{version:"fixture-read-boundary"}}});else if(message.method==="thread/read")send({jsonrpc:"2.0",id:message.id,error:{code:-32601,message:"Method not found"}});else if(message.method==="thread/resume")send({jsonrpc:"2.0",id:message.id,result:{thread}})});
  `);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const provider = await startCodexAppServerProvider(target, journal, registry, {
    command: process.execPath,
    commandArgs: [fakeServer],
    reconnectMs: 60000
  });
  await provider.start();
  context.after(() => provider.stop());

  const calls = (await fs.readFile(callsPath, "utf8")).trim().split("\n");
  assert.deepEqual(calls, ["initialize", "initialized", "thread/read", "thread/resume"]);
  assert.deepEqual(provider.attachmentOutcomes()[0], {
    task_id: "task-0001",
    work_item_id: "WI-0001",
    provider_thread_id: "thread-live-001",
    history_read: "failed",
    live_resume: "succeeded",
    attach_outcome: "live-attached",
    reason_code: "thread-read-unsupported",
    retry_suppressed: true
  });
  assert.equal(registry.get("codex-local").status, "degraded");
  assert.equal(registry.get("codex-local").degraded_reason, "thread-read-unsupported");
  assert.equal(registry.get("codex-local").attachment.outcomes["live-attached"], 1);
  assert.equal(registry.get("codex-local").attachment.retry_suppressed_tasks, 1);
});

test("host-owned unresumable tasks degrade once without resume retry churn", async (context) => {
  const { temporaryRoot, target, stateDirectory } = await fixture(context);
  assert.deepEqual(
    classifyCodexAttachFailure({ rpcCode: -32602, providerReason: "invalid params secret-marker" }),
    { reason_code: "thread-resume-invalid", retryable: false, provider_wide: false }
  );
  const callsPath = path.join(temporaryRoot, "host-owned-calls.log");
  const fakeServer = path.join(temporaryRoot, "fake-host-owned-app-server.mjs");
  await fs.writeFile(fakeServer, `
    import fs from "node:fs";
    import readline from "node:readline";
    const input=readline.createInterface({input:process.stdin});
    const send=(value)=>process.stdout.write(JSON.stringify(value)+"\\n");
    const thread={id:"thread-live-001",status:{type:"idle"},turns:[]};
    input.on("line",line=>{const message=JSON.parse(line);fs.appendFileSync(${JSON.stringify(callsPath)},message.method+"\\n");if(message.method==="initialize")send({jsonrpc:"2.0",id:message.id,result:{serverInfo:{version:"fixture-host-boundary"}}});else if(message.method==="thread/read")send({jsonrpc:"2.0",id:message.id,result:{thread}});else if(message.method==="thread/resume")send({jsonrpc:"2.0",id:message.id,error:{code:-32004,message:"thread not found in Desktop session store secret-marker"}})});
  `);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: 100,
    privacy: defaultControlPlaneConfig().privacy
  });
  context.after(() => journal.close());
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const provider = await startCodexAppServerProvider(target, journal, registry, {
    command: process.execPath,
    commandArgs: [fakeServer],
    reconnectMs: 60000
  });
  await provider.start();
  context.after(() => provider.stop());
  assert.equal(provider.attachmentOutcomes()[0].reason_code, "thread-not-in-app-server-store");
  assert.equal(provider.attachmentOutcomes()[0].retry_suppressed, true);
  await provider.reconnect();

  const calls = (await fs.readFile(callsPath, "utf8")).trim().split("\n");
  assert.equal(calls.filter((method) => method === "thread/read").length, 2);
  assert.equal(calls.filter((method) => method === "thread/resume").length, 1);
  assert.equal(provider.attachmentOutcomes()[0].history_read, "succeeded");
  assert.equal(provider.attachmentOutcomes()[0].live_resume, "suppressed");
  assert.equal(provider.attachmentOutcomes()[0].attach_outcome, "degraded");
  assert.equal(registry.get("codex-local").degraded_reason, "thread-not-in-app-server-store");
  assert.equal(registry.get("codex-local").attachment.outcomes.degraded, 1);
  assert.equal(registry.get("codex-local").attachment.retry_suppressed_tasks, 1);
  await provider.start();
  const callsAfterRepeatedStart = (await fs.readFile(callsPath, "utf8")).trim().split("\n");
  assert.deepEqual(callsAfterRepeatedStart, calls);
  assert.doesNotMatch(JSON.stringify(journal.readAfter(0).records), /secret-marker/);
  assert.doesNotMatch(JSON.stringify(registry.get("codex-local")), /secret-marker/);
});
