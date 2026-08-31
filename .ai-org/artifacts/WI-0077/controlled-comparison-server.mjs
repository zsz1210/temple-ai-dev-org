#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { renderControlPlaneDashboard } from "../../../src/control-plane-dashboard.mjs";

const artifactDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(artifactDirectory, "controlled-usability-fixture.json");
const proposalPath = path.join(artifactDirectory, "management-console-preview.html");
const testSheetPath = path.join(artifactDirectory, "human-usability-test.md");

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid --port value: ${value}`);
  }
  return port;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Controlled fixture invariant failed: ${message}`);
}

function validateFixture(fixture, proposalSource) {
  invariant(fixture.schema_version === "temple.controlled-usability-fixture/v1", "unsupported schema version");
  invariant(fixture.tasks?.length === 7, "exactly seven comprehension tasks are required");

  const items = fixture.snapshot?.live_observer?.work?.items ?? [];
  const ids = items.map((item) => item.id);
  invariant(ids.length === new Set(ids).size, "Work Item IDs must be unique");
  for (const requiredId of ["WI-0077", "WI-0056", "WI-0029", "WI-0069", "WI-0067", "WI-0064"]) {
    invariant(ids.includes(requiredId), `${requiredId} is missing`);
  }

  const openItems = items.filter((item) => item.category !== "terminal");
  invariant(openItems.length === 8, "the mixed-state dataset must contain eight open Work Items");
  const blocker = items.find((item) => item.id === fixture.semantic_cases.true_local_blocker.work_item_id);
  invariant(blocker?.category === "blocked", "the local blocker must remain canonically blocked");
  invariant(fixture.semantic_cases.true_local_blocker.blocks_current_objective === false, "the local blocker must not block WI-0077");

  const currentCondition = fixture.snapshot.conditions.conditions.find(
    (item) => item.id === fixture.semantic_cases.current_provider_condition.condition_id
  );
  invariant(currentCondition?.lifecycle === "pending", "the current Provider limitation must be pending rather than a firing failure");
  invariant(
    fixture.snapshot.live_observer.timeline.some(
      (item) => item.name === fixture.semantic_cases.historical_provider_failure.event_name
    ),
    "the recovered Provider failure must be retained in history"
  );

  const coverage = fixture.snapshot.usage.source.longitudinal_coverage;
  invariant(coverage.qualification.status === "not-qualified", "one observation must remain statistically unqualified");
  invariant(coverage.detailed_token_observation_coverage.observations === 1, "the fixture must contain exactly one detailed Token observation");

  const positions = fixture.snapshot.observer.organization.positions;
  const developer = positions.find((item) => item.id === "developer")?.assignment?.agent_id;
  const independentQa = positions.find((item) => item.id === "independent_qa")?.assignment?.agent_id;
  invariant(developer && independentQa && developer !== independentQa, "Developer and Independent QA must use different Agent Identities");

  const missingMarkers = fixture.proposal_contract.required_markers.filter((marker) => !proposalSource.includes(marker));
  invariant(missingMarkers.length === 0, `proposal contract markers are missing: ${missingMarkers.join(", ")}`);
}

function materializeSnapshot(fixture) {
  const snapshot = structuredClone(fixture.snapshot);
  snapshot.generated_at = new Date().toISOString();
  return snapshot;
}

function materializeProposal(fixture, proposalSource) {
  const historicalEvent = escapeHtml(fixture.semantic_cases.historical_provider_failure.event_name);
  const historyRow = `<article class="history-row" data-controlled-fixture="historical-provider-failure"><time>Aug 31 · 09:30</time><div class="history-copy"><strong>${historicalEvent}</strong><p>Historical Provider failure · resolved · no current action</p></div><span class="chip">Resolved</span></article>`;
  return proposalSource
    .replaceAll("WI-0077 design preview · not production", "Controlled comparison · proposal · not production")
    .replaceAll("Preview scenario · historical activity replay", "Controlled fixture · active Worker")
    .replaceAll(
      "This simulates how WI-0056 would look while Rikku is running it. It is not current project state.",
      "WI-0056 is actively claimed by Rikku in this controlled dataset."
    )
    .replaceAll("Running replay", "Running")
    .replaceAll("Historical replay · not current state", "Controlled fixture · current execution")
    .replaceAll("Simulated for review", "Controlled fixture")
    .replace('id="scenario" aria-label="Preview scenario"', 'id="scenario" aria-label="Controlled fixture scenario" disabled')
    .replace('<div class="pagination"><span>Showing 1–4 of 68</span>', `${historyRow}<div class="pagination"><span>Showing 1–5 of ${fixture.snapshot.live_observer.timeline.length}</span>`);
}

function comparisonIndex(fixture) {
  const taskRows = fixture.tasks.map((task) => `<li><strong>${escapeHtml(task.id)}</strong> · ${escapeHtml(task.prompt)}</li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>WI-0077 controlled comparison</title>
  <style>
    :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#080b11;color:#edf2f8}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 18% -10%,#172844 0,transparent 34rem),#080b11}.shell{width:min(1080px,calc(100% - 32px));margin:auto;padding:48px 0 72px}.kicker{color:#4ed7c0;font:750 11px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}h1{max-width:760px;margin:10px 0 12px;font-size:clamp(34px,6vw,62px);letter-spacing:-.05em;line-height:1}p{max-width:760px;color:#9aa9bd;line-height:1.65}.warning{margin:24px 0;padding:14px 16px;border:1px solid #705c31;border-radius:12px;background:#211b10;color:#ffc567}.views{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:26px 0}.card{display:grid;gap:12px;min-height:220px;padding:22px;border:1px solid #293446;border-radius:18px;background:linear-gradient(145deg,#141d2a,#0d131d)}.card h2{margin:0;font-size:20px}.card p{margin:0;font-size:13px}.card a{align-self:end;justify-self:start;padding:10px 14px;border:1px solid #285b54;border-radius:10px;background:#102923;color:#ddfff8;font-weight:700;text-decoration:none}.tasks{padding:20px;border:1px solid #293446;border-radius:16px;background:#0d131d}.tasks h2{margin:0 0 14px;font-size:16px}.tasks ol{display:grid;gap:9px;margin:0;padding-left:22px;color:#b8c4d4;font-size:13px;line-height:1.5}.links{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px}.links a{color:#78a9ff}@media(max-width:720px){.views{grid-template-columns:1fr}.shell{padding-top:28px}}
  </style>
</head>
<body><main class="shell">
  <div class="kicker">WI-0077 · design validation</div>
  <h1>One dataset, two Console directions</h1>
  <p>This local harness renders the current production Console and the accepted design proposal against the same mixed-state facts. It is test evidence only.</p>
  <div class="warning"><strong>No Build or release authority.</strong> Nothing on this page changes canonical project state, sends a command, deploys, or publishes Temple.</div>
  <section class="views">
    <article class="card"><h2>Current Console renderer</h2><p>The actual production HTML renderer receives the controlled snapshot. Existing semantic behavior is preserved, including any usability defects.</p><a href="/baseline/#overview">Open baseline</a></article>
    <article class="card"><h2>Design proposal</h2><p>The WI-0077 preview is contract-checked against the same facts. Its intentionally illustrative controls remain non-production.</p><a href="/proposal/#overview">Open proposal</a></article>
  </section>
  <section class="tasks"><h2>Seven participant tasks</h2><ol>${taskRows}</ol></section>
  <div class="links"><a href="/fixture.json">Inspect fixture</a><a href="/test-sheet">Open facilitator sheet</a></div>
</main></body></html>`;
}

function send(response, status, contentType, body, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders
  });
  response.end(body);
}

const host = option("--host", "127.0.0.1");
const port = parsePort(option("--port", "0"));
const [fixtureSource, proposalSource] = await Promise.all([
  fs.readFile(fixturePath, "utf8"),
  fs.readFile(proposalPath, "utf8")
]);
const fixture = JSON.parse(fixtureSource);
validateFixture(fixture, proposalSource);
const proposal = materializeProposal(fixture, proposalSource);
const eventStreams = new Set();

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (request.method !== "GET") {
    send(response, 405, "application/json; charset=utf-8", JSON.stringify({ error: "read-only harness" }), { allow: "GET" });
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    send(response, 200, "text/html; charset=utf-8", comparisonIndex(fixture));
    return;
  }
  if (url.pathname === "/favicon.ico") {
    response.writeHead(204, { "cache-control": "public, max-age=86400" });
    response.end();
    return;
  }
  if (url.pathname === "/baseline" || url.pathname === "/baseline/") {
    send(response, 200, "text/html; charset=utf-8", renderControlPlaneDashboard("Temple controlled comparison", { viewMode: "private-read-only" }));
    return;
  }
  if (url.pathname === "/proposal" || url.pathname === "/proposal/") {
    send(response, 200, "text/html; charset=utf-8", proposal);
    return;
  }
  if (url.pathname === "/fixture.json") {
    send(response, 200, "application/json; charset=utf-8", `${JSON.stringify(fixture, null, 2)}\n`);
    return;
  }
  if (url.pathname === "/test-sheet") {
    try {
      send(response, 200, "text/markdown; charset=utf-8", await fs.readFile(testSheetPath, "utf8"));
    } catch {
      send(response, 404, "text/plain; charset=utf-8", "Facilitator sheet has not been generated yet.\n");
    }
    return;
  }
  if (url.pathname === "/api/v1/snapshot") {
    send(response, 200, "application/json; charset=utf-8", JSON.stringify(materializeSnapshot(fixture)));
    return;
  }
  if (url.pathname === "/api/v1/events") {
    response.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      connection: "keep-alive",
      "x-accel-buffering": "no"
    });
    response.write("retry: 60000\n\n");
    eventStreams.add(response);
    request.on("close", () => eventStreams.delete(response));
    return;
  }
  if (url.pathname === "/api/v1/health") {
    send(response, 200, "application/json; charset=utf-8", JSON.stringify({ status: "controlled-test", fixture_id: fixture.fixture_id }));
    return;
  }
  send(response, 404, "text/plain; charset=utf-8", "Not found\n");
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, host, resolve);
});

const address = server.address();
const actualPort = typeof address === "object" && address ? address.port : port;
const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
const baseUrl = `http://${displayHost}:${actualPort}`;
process.stdout.write([
  "WI-0077 controlled comparison is ready.",
  `Index:    ${baseUrl}/`,
  `Baseline: ${baseUrl}/baseline/#overview`,
  `Proposal: ${baseUrl}/proposal/#overview`,
  "Press Ctrl-C to stop."
].join("\n") + "\n");

const heartbeat = setInterval(() => {
  for (const stream of eventStreams) stream.write(": heartbeat\n\n");
}, 15000);

async function close() {
  clearInterval(heartbeat);
  for (const stream of eventStreams) stream.end();
  await new Promise((resolve) => server.close(resolve));
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void close().then(() => process.exit(0));
  });
}
