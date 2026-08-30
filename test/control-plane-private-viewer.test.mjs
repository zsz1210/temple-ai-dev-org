import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { startControlPlaneServer } from "../src/control-plane-server.mjs";
import {
  assertPrivateTailscaleServeConfig,
  assertUnusedTailscaleServeConfig,
  normalizePrivateViewerHost,
  parseTailscaleStatus,
  prepareTailscalePrivateViewer,
  tailscaleServeArguments,
  TAILSCALE_VALIDATED_VERSION
} from "../src/private-network-viewer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");
const privateHost = "fixture-mini.tailnet-fixture.ts.net";

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
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-private-viewer-test-"));
  const target = path.join(temporaryRoot, "private-viewer-product");
  const configPath = path.join(temporaryRoot, "init.json");
  const stateDirectory = path.join(temporaryRoot, "runtime-state");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await writeJson(configPath, {
    schema_version: "temple.init/v1",
    project: { id: "private-viewer-product", name: "Private Viewer Product" },
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

function privateRequest(controlPlane, pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: "127.0.0.1",
      port: controlPlane.port,
      path: pathname,
      method: options.method ?? "GET",
      headers: {
        host: options.host ?? privateHost,
        ...(options.identity === false ? {} : { "tailscale-user-login": "owner@example.test" }),
        ...(options.headers ?? {})
      }
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString("utf8")
      }));
    });
    request.on("error", reject);
    if (options.body) request.write(options.body);
    request.end();
  });
}

function privateSse(controlPlane, pathname) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: "127.0.0.1",
      port: controlPlane.port,
      path: pathname,
      headers: { host: privateHost, "tailscale-user-login": "owner@example.test" }
    }, (response) => {
      let body = "";
      const timeout = setTimeout(() => {
        request.destroy();
        reject(new Error("Private viewer SSE timed out"));
      }, 2000);
      response.on("data", (chunk) => {
        body += chunk.toString("utf8");
        if (body.includes("event: temple.refresh") && body.includes('data: {"cursor":')) {
          clearTimeout(timeout);
          response.destroy();
          request.destroy();
          resolve({ status: response.statusCode, body });
        }
      });
    });
    request.on("error", (error) => {
      if (error.code !== "ECONNRESET") reject(error);
    });
    request.end();
  });
}

test("private viewer host and pinned Tailscale adapter fail closed", async () => {
  assert.equal(normalizePrivateViewerHost("Fixture-Mini.Tailnet-Fixture.ts.net."), privateHost);
  assert.throws(() => normalizePrivateViewerHost("*.ts.net"), /exact Tailscale/);
  assert.throws(() => normalizePrivateViewerHost("https://fixture.ts.net"), /exact Tailscale/);
  assert.deepEqual(parseTailscaleStatus({
    BackendState: "Running",
    Self: { Online: true, DNSName: `${privateHost}.` }
  }).host, privateHost);
  assert.throws(() => parseTailscaleStatus({ BackendState: "Stopped" }), /running and online/);
  assert.deepEqual(assertUnusedTailscaleServeConfig("{}"), {});
  assert.throws(() => assertUnusedTailscaleServeConfig('{"Web":{}}'), /already has configuration/);
  assert.deepEqual(tailscaleServeArguments(43123), ["serve", "--bg", "--yes", "http://127.0.0.1:43123"]);
  assert.throws(() => assertPrivateTailscaleServeConfig({
    Web: { [`${privateHost}:443`]: { Handlers: { "/": { Proxy: "http://127.0.0.1:43123" } } } },
    AllowFunnel: { [`${privateHost}:443`]: true }
  }, { host: privateHost, target: "http://127.0.0.1:43123" }), /Funnel/);
  assert.doesNotThrow(() => assertPrivateTailscaleServeConfig({
    Web: { [`${privateHost}:443`]: { Handlers: { "/": { Proxy: "http://127.0.0.1:43123" } } } },
    AllowFunnel: { [`${privateHost}:443`]: false }
  }, { host: privateHost, target: "http://127.0.0.1:43123" }));

  const calls = [];
  let serveEnabled = false;
  const runMock = async (_command, args) => {
    calls.push(args);
    if (args[0] === "version") return { stdout: `${TAILSCALE_VALIDATED_VERSION}\n` };
    if (args[0] === "status") return {
      stdout: JSON.stringify({ BackendState: "Running", Self: { Online: true, DNSName: `${privateHost}.` } })
    };
    if (args.join(" ") === "serve status --json") return {
      stdout: serveEnabled
        ? JSON.stringify({ Web: { [`${privateHost}:443`]: { Handlers: { "/": { Proxy: "http://127.0.0.1:43123" } } } } })
        : "{}"
    };
    if (args[0] === "serve" && args.includes("--bg")) {
      serveEnabled = true;
      return { stdout: "configured\n" };
    }
    if (args.join(" ") === "serve reset") {
      serveEnabled = false;
      return { stdout: "" };
    }
    throw new Error(`Unexpected mock call: ${args.join(" ")}`);
  };
  const prepared = await prepareTailscalePrivateViewer({ command: "/mock/tailscale", run: runMock });
  const share = await prepared.enable(43123);
  assert.equal(share.url, `https://${privateHost}`);
  assert.equal(serveEnabled, true);
  await share.close();
  assert.equal(serveEnabled, false);
  assert.ok(calls.some((args) => args.join(" ") === "serve --bg --yes http://127.0.0.1:43123"));
  assert.ok(calls.some((args) => args.join(" ") === "serve reset"));
});

test("private Dashboard is redacted, refresh-only, and cannot reach Inbox or mutations", async (context) => {
  const { target, stateDirectory } = await fixture(context);
  const controlPlane = await startControlPlaneServer(target, {
    stateDirectory,
    port: 0,
    repositoryIntervalMs: 50,
    privateViewerHost: privateHost
  });
  context.after(() => controlPlane.close());

  const missingIdentity = await privateRequest(controlPlane, "/", { identity: false });
  assert.equal(missingIdentity.status, 403);
  const wrongHost = await privateRequest(controlPlane, "/", { host: "other.tailnet-fixture.ts.net" });
  assert.equal(wrongHost.status, 403);

  const page = await privateRequest(controlPlane, "/");
  assert.equal(page.status, 200);
  assert.match(page.body, /Private network · Read only/);
  assert.doesNotMatch(page.body, /<h2>Human Inbox<\/h2>/);
  assert.doesNotMatch(page.body, /<h2>Agent Commands/);
  assert.doesNotMatch(page.body, new RegExp(controlPlane.sessionSecret));

  const snapshotResponse = await privateRequest(controlPlane, "/api/v1/snapshot");
  assert.equal(snapshotResponse.status, 200);
  const snapshot = JSON.parse(snapshotResponse.body);
  assert.equal(snapshot.private_viewer.read_only, true);
  assert.equal(snapshot.authority.mutations_available, false);
  assert.equal(Object.hasOwn(snapshot, "daemon"), false);
  assert.equal(Object.hasOwn(snapshot, "inbox"), false);
  assert.equal(Object.hasOwn(snapshot, "recent_events"), false);
  assert.doesNotMatch(snapshotResponse.body, new RegExp(controlPlane.sessionSecret));

  const inbox = await privateRequest(controlPlane, "/api/v1/inbox");
  assert.equal(inbox.status, 403);
  const mutation = await privateRequest(controlPlane, "/api/v1/inbox/agent-command", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  assert.equal(mutation.status, 405);
  assert.match(JSON.parse(mutation.body).error, /read-only/);

  const cursor = snapshot.journal.last_cursor;
  await controlPlane.journal.append({
    id: "private-refresh-fixture",
    source: "urn:temple:provider:fixture:private-viewer",
    type: "org.temple.fixture.updated.v1",
    time: "2026-08-30T00:00:00.000Z",
    data: { raw_marker: "must-not-cross-private-sse" }
  });
  const stream = await privateSse(controlPlane, `/api/v1/events?after=${cursor}`);
  assert.equal(stream.status, 200);
  assert.match(stream.body, /event: temple\.refresh/);
  assert.match(stream.body, /"cursor":\d+/);
  assert.doesNotMatch(stream.body, /private-refresh-fixture|must-not-cross-private-sse|org\.temple/);

  const localSnapshot = await (await fetch(`${controlPlane.url}/api/v1/snapshot`)).json();
  assert.ok(localSnapshot.inbox);
  assert.ok(localSnapshot.recent_events.some((entry) => entry.id === "private-refresh-fixture"));
});
