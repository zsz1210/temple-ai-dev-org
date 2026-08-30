import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startControlPlaneServer } from "../../../src/control-plane-server.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const cli = path.join(repositoryRoot, "bin/temple.mjs");
const stage = process.argv[2] ?? "quality";
const mode = process.argv[3] ?? "enabled";
assert.match(stage, /^(quality|independent-qa)$/);
assert.match(mode, /^(disabled|enabled)$/);

function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

function git(target, args) {
  const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

async function writeJson(targetPath, value) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), `temple-wi0029-${stage}-${mode}-`));
const target = path.join(temporaryRoot, "fixture-project");
const stateDirectory = path.join(temporaryRoot, "state");
const initConfig = path.join(temporaryRoot, "init.json");
const callsPath = path.join(temporaryRoot, "provider-calls.jsonl");
const fakeServer = path.join(temporaryRoot, "fake-codex-app-server.mjs");

await writeJson(initConfig, {
  schema_version: "temple.init/v1",
  project: { id: `wi0029-${stage}-${mode}`, name: `WI-0029 ${stage} ${mode} fixture` },
  naming_mode: "manual",
  agents: [
    { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
    { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
    { display_name: "Fixture Ellis", positions: ["tech_lead"] },
    { display_name: "Fixture Devon", positions: ["developer"] },
    { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
  ]
});
run(["init", target, "--config", initConfig]);
git(target, ["init", "-q"]);
git(target, ["config", "user.email", "wi0029-qa@example.invalid"]);
git(target, ["config", "user.name", "WI-0029 QA Fixture"]);
git(target, ["add", "."]);
git(target, ["commit", "-qm", "initial fixture"]);
const created = JSON.parse(run([
  "work-item", "create", target,
  "--title", "Deterministic Agent Command fixture",
  "--scope", "Exercise only a fake registered provider thread",
  "--acceptance", "No real Codex task receives a command",
  "--affected-path", "src/fixture",
  "--ui-mode", "not-applicable",
  "--json"
]));
const workItemId = created.item.id;
run([
  "task", "register", target,
  "--work-item", workItemId,
  "--position", "product_manager",
  "--thread-id", "thread-qa-fixture-001",
  "--host-id", "local",
  "--revision", "0123456789abcdef0123456789abcdef01234567",
  "--json"
]);

await fs.writeFile(fakeServer, `
import fs from "node:fs";
import readline from "node:readline";
const callsPath = ${JSON.stringify(callsPath)};
const input = readline.createInterface({ input: process.stdin });
const send = value => process.stdout.write(JSON.stringify(value) + "\\n");
let sequence = 0;
const thread = { id: "thread-qa-fixture-001", status: { type: "idle" }, turns: [] };
input.on("line", line => {
  const message = JSON.parse(line);
  fs.appendFileSync(callsPath, JSON.stringify({ method: message.method, params: message.params ?? null }) + "\\n");
  if (message.method === "initialize") send({ jsonrpc: "2.0", id: message.id, result: { serverInfo: { version: "wi0029-qa-fixture" } } });
  else if (message.method === "thread/read" || message.method === "thread/resume") send({ jsonrpc: "2.0", id: message.id, result: { thread } });
  else if (message.method === "turn/start") {
    const turn = { id: "turn-fixture-" + (++sequence), status: "inProgress", items: [] };
    thread.status = { type: "active" };
    thread.turns = [turn];
    send({ jsonrpc: "2.0", id: message.id, result: { turn } });
    send({ jsonrpc: "2.0", method: "turn/started", params: { threadId: thread.id, turn } });
  } else if (message.method === "turn/steer") {
    const text = message.params.input?.[0]?.text ?? "";
    if (text.includes("reject")) send({ jsonrpc: "2.0", id: message.id, error: { code: -32602, message: "fixture rejection with private detail" } });
    else if (text.includes("timeout")) {}
    else {
      send({ jsonrpc: "2.0", id: message.id, result: { turnId: message.params.expectedTurnId } });
      if (text.includes("complete")) {
        const turn = { id: message.params.expectedTurnId, status: "completed", items: [] };
        thread.status = { type: "idle" };
        thread.turns = [turn];
        send({ jsonrpc: "2.0", method: "turn/completed", params: { threadId: thread.id, turn } });
      }
    }
  } else if (message.method === "turn/interrupt") {
    send({ jsonrpc: "2.0", id: message.id, result: {} });
    const turn = { id: message.params.turnId, status: "interrupted", items: [] };
    thread.status = { type: "idle" };
    thread.turns = [turn];
    send({ jsonrpc: "2.0", method: "turn/completed", params: { threadId: thread.id, turn } });
  }
});
`);

const controlPlanePath = path.join(target, ".ai-org/project/control-plane.json");
const controlPlaneConfig = JSON.parse(await fs.readFile(controlPlanePath, "utf8"));
controlPlaneConfig.agent_commands = {
  enabled: mode === "enabled",
  max_instruction_chars: 200
};
controlPlaneConfig.providers = [
  { id: "repository", kind: "repository", enabled: true },
  {
    id: "codex-local",
    kind: "codex-app-server",
    enabled: true,
    options: {
      command: process.execPath,
      command_args: [fakeServer],
      resume_threads: true,
      history_turn_limit: 20,
      history_item_limit: 200
    }
  }
];
await writeJson(controlPlanePath, controlPlaneConfig);

const server = await startControlPlaneServer(target, {
  stateDirectory,
  port: 0,
  repositoryIntervalMs: 50
});
await server.codexStartup;
await new Promise(resolve => setTimeout(resolve, 100));
const snapshot = await (await fetch(`${server.url}/api/v1/snapshot`)).json();
assert.equal(snapshot.inbox.agent_commands.enabled, mode === "enabled");
if (mode === "enabled") {
  assert.equal(snapshot.inbox.agent_commands.provider_status, "ready");
  assert.equal(snapshot.inbox.agent_commands.eligible_targets.length, 1);
}
process.stdout.write(`${JSON.stringify({
  ready: true,
  stage,
  mode,
  url: server.url,
  temporary_root: temporaryRoot,
  fixture_project: target,
  state_directory: stateDirectory,
  calls_path: callsPath,
  real_codex_task_mutated: false
})}\n`);

let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await server.close();
  process.exit(0);
}
process.once("SIGINT", () => void close());
process.once("SIGTERM", () => void close());
await new Promise(() => {});
