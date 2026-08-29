import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  normalizeCodexMessage,
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
