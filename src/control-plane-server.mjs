import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";
import { TEMPLATE_VERSION } from "./constants.mjs";
import { readControlPlaneConfig } from "./control-plane-config.mjs";
import {
  createProviderRegistry,
  ingestProviderFixture,
  ingestRepositoryEvents,
  persistProviderRegistry,
  readProviderFixture,
  repositoryProviderContract,
  startRepositoryProvider
} from "./control-plane-providers.mjs";
import { buildObserverProjection } from "./observer.mjs";
import {
  acquireControlPlaneLease,
  openTelemetryJournal,
  readDaemonMetadata,
  resolveControlPlaneStateDirectory,
  writeDaemonMetadata
} from "./telemetry.mjs";
import { pathExists, readJson } from "./files.mjs";

export const CONTROL_PLANE_SNAPSHOT_SCHEMA = "temple.control-plane-snapshot/v1";

function jsonResponse(response, status, value) {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(body);
}

function htmlResponse(response, body) {
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    "content-security-policy": "default-src 'self'; connect-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY"
  });
  response.end(body);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readOnlyHtml(projectName) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(projectName)} Control Plane</title>
<style>:root{color-scheme:dark;font-family:ui-sans-serif,system-ui,sans-serif;background:#0d1117;color:#e6edf3}body{max-width:1000px;margin:auto;padding:2rem}pre{white-space:pre-wrap;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:1rem;overflow:auto}.status{color:#7ee787}</style></head>
<body><p class="status">Read-only live connection</p><h1>${escapeHtml(projectName)} Control Plane</h1><p>Phase 3A exposes canonical projection and replay-safe telemetry. Mutation controls are intentionally unavailable.</p><pre id="snapshot">Loading…</pre>
<script>const output=document.getElementById("snapshot");async function load(){const response=await fetch("/api/v1/snapshot");output.textContent=JSON.stringify(await response.json(),null,2)}load();const events=new EventSource("/api/v1/events");events.onmessage=load;events.addEventListener("temple.snapshot",load);</script></body></html>\n`;
}

function sendSseRecord(response, record) {
  response.write(`id: ${record.templecursor}\n`);
  response.write(`data: ${JSON.stringify(record)}\n\n`);
}

function numericCursor(value) {
  if (value === null || value === undefined || value === "") return 0;
  const cursor = Number(value);
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error("Last-Event-ID must be a non-negative integer");
  return cursor;
}

export async function buildControlPlaneSnapshot(target, journal, registry, options = {}) {
  const [observer, daemon] = await Promise.all([
    buildObserverProjection(target),
    options.stateDirectory ? readDaemonMetadata(options.stateDirectory) : null
  ]);
  const journalSnapshot = journal.snapshot();
  const eventWindow = journal.readAfter(Math.max(0, journalSnapshot.last_cursor - (options.eventLimit ?? 100)));
  return {
    schema_version: CONTROL_PLANE_SNAPSHOT_SCHEMA,
    generated_at: new Date().toISOString(),
    project: observer.project,
    authority: {
      canonical: ".ai-org/",
      telemetry: "local-generated",
      views: "disposable",
      telemetry_satisfies_gates: false
    },
    daemon,
    journal: journalSnapshot,
    providers: registry.document(),
    observer,
    recent_events: eventWindow.records,
    canonical_state_changed: false,
    external_action_performed: false
  };
}

async function listen(server, host, port) {
  await new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once("error", onError);
    server.listen(port, host, () => {
      server.off("error", onError);
      resolve();
    });
  });
}

async function closeHttpServer(server) {
  if (!server.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections?.();
  });
}

export async function startControlPlaneServer(target, options = {}) {
  const projectRoot = path.resolve(target);
  const config = await readControlPlaneConfig(projectRoot);
  const host = options.host ?? config.server.host;
  const port = options.port ?? config.server.port;
  if (host !== "127.0.0.1") throw new Error("Phase 3 control plane may bind only to 127.0.0.1");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Control-plane port must be 0 to 65535");
  const stateDirectory = resolveControlPlaneStateDirectory(
    projectRoot,
    options.stateDirectory ?? config.state_directory
  );
  const lease = await acquireControlPlaneLease(stateDirectory);
  let journal = null;
  let repositoryProvider = null;
  let server = null;
  const clients = new Set();
  const startedAt = new Date().toISOString();

  try {
    journal = await openTelemetryJournal(stateDirectory, {
      maxEvents: config.retention.max_events,
      privacy: config.privacy
    });
    const registry = createProviderRegistry([repositoryProviderContract()]);
    repositoryProvider = startRepositoryProvider(projectRoot, journal, registry, {
      intervalMs: options.repositoryIntervalMs
    });
    await repositoryProvider.start();
    if (options.fixturePath) {
      const fixture = await readProviderFixture(options.fixturePath);
      await ingestProviderFixture(fixture, journal, registry);
    }
    await persistProviderRegistry(stateDirectory, registry);

    const project = await readJson(path.join(projectRoot, ".ai-org/project/project.json"));

    server = http.createServer(async (request, response) => {
      try {
        const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        if (request.method === "GET" && requestUrl.pathname === "/healthz") {
          jsonResponse(response, 200, {
            status: "ok",
            schema_version: "temple.control-plane-health/v1",
            project_id: project.id,
            journal: journal.snapshot()
          });
          return;
        }
        if (request.method === "GET" && requestUrl.pathname === "/api/v1/snapshot") {
          await persistProviderRegistry(stateDirectory, registry);
          jsonResponse(response, 200, await buildControlPlaneSnapshot(projectRoot, journal, registry, { stateDirectory }));
          return;
        }
        if (request.method === "GET" && requestUrl.pathname === "/api/v1/events") {
          const cursor = numericCursor(request.headers["last-event-id"] ?? requestUrl.searchParams.get("after"));
          const replay = journal.readAfter(cursor);
          response.writeHead(200, {
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
            "content-type": "text/event-stream; charset=utf-8",
            "x-accel-buffering": "no",
            "x-content-type-options": "nosniff"
          });
          response.write("retry: 1000\n\n");
          if (replay.reset_required) {
            response.write("event: temple.snapshot\n");
            response.write(`data: ${JSON.stringify(await buildControlPlaneSnapshot(projectRoot, journal, registry, { stateDirectory }))}\n\n`);
          }
          for (const record of replay.records) sendSseRecord(response, record);
          const unsubscribe = journal.subscribe((record) => sendSseRecord(response, record));
          const heartbeat = setInterval(() => response.write(": keepalive\n\n"), 15000);
          const close = () => {
            clearInterval(heartbeat);
            unsubscribe();
            clients.delete(close);
          };
          clients.add(close);
          request.on("close", close);
          return;
        }
        if (request.method === "GET" && requestUrl.pathname === "/") {
          htmlResponse(response, readOnlyHtml(project.name));
          return;
        }
        if (request.method !== "GET") {
          jsonResponse(response, 405, { error: "Phase 3A control plane is read-only" });
          return;
        }
        jsonResponse(response, 404, { error: "Not found" });
      } catch (error) {
        if (!response.headersSent) jsonResponse(response, 400, { error: error.message });
        else response.destroy(error);
      }
    });

    await listen(server, host, port);
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    const url = `http://${host}:${actualPort}`;
    await writeDaemonMetadata(stateDirectory, {
      host,
      port: actualPort,
      url,
      projectRoot,
      startedAt,
      version: TEMPLATE_VERSION
    });

    let closed = false;
    return {
      url,
      host,
      port: actualPort,
      stateDirectory,
      journal,
      registry,
      async close() {
        if (closed) return;
        closed = true;
        for (const close of [...clients]) close();
        await repositoryProvider.stop();
        await closeHttpServer(server);
        await journal.close();
        await fs.unlink(path.join(stateDirectory, "daemon.json")).catch((error) => {
          if (error.code !== "ENOENT") throw error;
        });
        await lease.release();
      }
    };
  } catch (error) {
    if (repositoryProvider) await repositoryProvider.stop().catch(() => {});
    if (server) await closeHttpServer(server).catch(() => {});
    if (journal) await journal.close().catch(() => {});
    await lease.release().catch(() => {});
    throw error;
  }
}

export async function inspectControlPlane(target, options = {}) {
  const projectRoot = path.resolve(target);
  const config = await readControlPlaneConfig(projectRoot);
  const stateDirectory = resolveControlPlaneStateDirectory(projectRoot, options.stateDirectory ?? config.state_directory);
  const journal = await openTelemetryJournal(stateDirectory, {
    maxEvents: config.retention.max_events,
    privacy: config.privacy,
    readOnly: true
  });
  const registry = createProviderRegistry([repositoryProviderContract()]);
  const providerPath = path.join(stateDirectory, "providers.json");
  if (await pathExists(providerPath)) {
    const persisted = await readJson(providerPath);
    for (const provider of persisted.providers ?? []) registry.set(provider);
  }
  const snapshot = await buildControlPlaneSnapshot(projectRoot, journal, registry, { stateDirectory });
  await journal.close();
  return { stateDirectory, snapshot };
}

export async function ingestControlPlaneFixture(target, fixturePath, options = {}) {
  const projectRoot = path.resolve(target);
  const config = await readControlPlaneConfig(projectRoot);
  const stateDirectory = resolveControlPlaneStateDirectory(projectRoot, options.stateDirectory ?? config.state_directory);
  const lease = await acquireControlPlaneLease(stateDirectory);
  try {
    const journal = await openTelemetryJournal(stateDirectory, {
      maxEvents: config.retention.max_events,
      privacy: config.privacy
    });
    const registry = createProviderRegistry([repositoryProviderContract()]);
    const providerPath = path.join(stateDirectory, "providers.json");
    if (await pathExists(providerPath)) {
      const persisted = await readJson(providerPath);
      for (const provider of persisted.providers ?? []) registry.set(provider);
    }
    await ingestRepositoryEvents(projectRoot, journal, registry);
    const result = await ingestProviderFixture(await readProviderFixture(fixturePath), journal, registry);
    await persistProviderRegistry(stateDirectory, registry);
    const snapshot = await buildControlPlaneSnapshot(projectRoot, journal, registry, { stateDirectory });
    await journal.close();
    return { stateDirectory, result, snapshot };
  } finally {
    await lease.release();
  }
}

export async function rebuildControlPlane(target, options = {}) {
  const projectRoot = path.resolve(target);
  const config = await readControlPlaneConfig(projectRoot);
  const stateDirectory = resolveControlPlaneStateDirectory(projectRoot, options.stateDirectory ?? config.state_directory);
  const lease = await acquireControlPlaneLease(stateDirectory);
  try {
    const journalPath = path.join(stateDirectory, "journal", "events.jsonl");
    let archivePath = null;
    if (await pathExists(journalPath)) {
      const archiveDirectory = path.join(stateDirectory, "archive");
      await fs.mkdir(archiveDirectory, { recursive: true });
      archivePath = path.join(archiveDirectory, `events-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.jsonl`);
      await fs.rename(journalPath, archivePath);
    }
    const journal = await openTelemetryJournal(stateDirectory, {
      maxEvents: config.retention.max_events,
      privacy: config.privacy
    });
    const registry = createProviderRegistry([repositoryProviderContract()]);
    const repository = await ingestRepositoryEvents(projectRoot, journal, registry);
    await persistProviderRegistry(stateDirectory, registry);
    const snapshot = await buildControlPlaneSnapshot(projectRoot, journal, registry, { stateDirectory });
    await journal.close();
    return { stateDirectory, archivePath, repository, snapshot };
  } finally {
    await lease.release();
  }
}
