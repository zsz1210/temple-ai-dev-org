import fs from "node:fs/promises";
import path from "node:path";
import { atomicWrite, formatJson, pathExists, readJson } from "./files.mjs";
import { readEvidenceRegistry, resolveGitRevision } from "./evidence.mjs";
import { listWorkItemDocuments } from "./work-items.mjs";
import { readRuntimeWorkerRegistry } from "./workers.mjs";
import { listLearningEntries } from "./learning.mjs";

export const OBSERVER_SCHEMA = "temple.observer/v1";
export const OBSERVER_JSON_RELATIVE_PATH = ".ai-org/views/observer.json";
export const OBSERVER_HTML_RELATIVE_PATH = ".ai-org/views/overview.html";

async function readEvents(target) {
  const eventPath = path.join(target, ".ai-org/events/events.jsonl");
  if (!(await pathExists(eventPath))) return [];
  return (await fs.readFile(eventPath, "utf8"))
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function currentRevisionReference(item) {
  return item.release_record?.tested_revision ?? item.independent_qa_revision ?? item.developer_candidate_revision ?? item.base_revision ?? null;
}

function resolveCurrentRevision(target, item) {
  const reference = currentRevisionReference(item);
  if (!reference) return { reference: null, revision: null, resolved: false };
  try {
    return { reference, revision: resolveGitRevision(target, reference), resolved: true };
  } catch {
    return { reference, revision: /^[0-9a-f]{40}$/.test(reference) ? reference : null, resolved: /^[0-9a-f]{40}$/.test(reference) };
  }
}

function categoryFor(item, workers) {
  if (["done", "cancelled"].includes(item.state)) return "terminal";
  if (item.state === "blocked") return "blocked";
  if (item.state === "release_gate") return "approval_pending";
  if (["test", "eval", "independent_qa"].includes(item.state)) return "qa_pending";
  if (item.claim?.status === "active" || workers.some((worker) => ["reserved", "active", "waiting", "attention"].includes(worker.status))) {
    return "active";
  }
  return "queued";
}

function attentionForEvidence(entry, stale) {
  const output = [];
  const base = { work_item_id: entry.work_item_id, evidence_id: entry.id };
  if (stale) output.push({ ...base, type: "stale_evidence", message: `${entry.id} targets an older revision` });
  if (entry.invalidated_at) output.push({ ...base, type: "invalidated_evidence", message: `${entry.id} was invalidated` });
  if (entry.expires_at && Date.parse(entry.expires_at) <= Date.now()) output.push({ ...base, type: "expired_evidence", message: `${entry.id} expired` });
  if (entry.kind === "unverified-claim") output.push({ ...base, type: "unverified_claim", message: `${entry.id} is explicitly unverified` });
  if (["test", "runtime"].includes(entry.kind) && entry.outcome === "fail") {
    output.push({ ...base, type: "failed_evidence", message: `${entry.id} records a failed ${entry.kind} observation` });
  }
  if (entry.kind === "risk" && ["high", "critical"].includes(entry.details?.severity) && entry.outcome === "open") {
    output.push({ ...base, type: "open_high_risk", message: `${entry.id} is an open ${entry.details.severity} risk` });
  }
  return output;
}

export async function buildObserverProjection(target) {
  const [project, workItems, workersDocument, evidenceRegistry, events, learning] = await Promise.all([
    readJson(path.join(target, ".ai-org/project/project.json")),
    listWorkItemDocuments(target),
    readRuntimeWorkerRegistry(target),
    readEvidenceRegistry(target),
    readEvents(target),
    listLearningEntries(target)
  ]);
  const revisions = new Map(workItems.map((item) => [item.id, resolveCurrentRevision(target, item)]));
  const evidence = evidenceRegistry.entries.map((entry) => {
    const current = revisions.get(entry.work_item_id) ?? { reference: null, revision: null, resolved: false };
    const stale = Boolean(entry.scope_revision && current.resolved && current.revision !== entry.scope_revision);
    return { ...entry, stale, current_scope_reference: current.reference, current_scope_revision: current.revision };
  });
  const work = workItems.map((item) => {
    const itemWorkers = workersDocument.workers.filter((worker) => worker.work_item_id === item.id);
    const category = categoryFor(item, itemWorkers);
    return {
      id: item.id,
      title: item.title,
      state: item.state,
      owner_position: item.owner_position,
      category,
      current_revision: revisions.get(item.id),
      active_claim: item.claim?.status === "active" ? item.claim.id : null,
      runtime_workers: itemWorkers.map((worker) => ({ id: worker.id, status: worker.status, runtime_kind: worker.runtime_kind })),
      evidence_count: evidence.filter((entry) => entry.work_item_id === item.id).length,
      unresolved_count: (item.unresolved ?? []).length
    };
  });
  const attention = [
    ...work.filter((item) => item.category === "blocked").map((item) => ({ type: "blocked_work_item", work_item_id: item.id, message: `${item.id} is blocked` })),
    ...work.filter((item) => item.category === "approval_pending").map((item) => ({ type: "approval_pending", work_item_id: item.id, message: `${item.id} awaits release approval` })),
    ...workersDocument.workers.filter((worker) => ["attention", "failed"].includes(worker.status)).map((worker) => ({ type: "runtime_recovery", work_item_id: worker.work_item_id, worker_id: worker.id, message: `${worker.id} needs recovery (${worker.status})` })),
    ...evidence.flatMap((entry) => attentionForEvidence(entry, entry.stale)),
    ...learning.entries
      .filter((entry) => entry.revalidation.signal === "overdue")
      .map((entry) => ({ type: "learning_revalidation_overdue", learning_id: entry.id, message: `${entry.id} is overdue for revalidation` })),
    ...learning.entries
      .filter((entry) => entry.revalidation.signal === "contradicted")
      .map((entry) => ({ type: "learning_contradicted", learning_id: entry.id, message: `${entry.id} has contradictory revalidation evidence` }))
  ];
  const timeline = [
    ...events.map((event) => ({ timestamp: event.timestamp, type: "event", name: event.event_type, work_item_id: event.work_item_id ?? null, actor: event.actor ?? null, reference: null })),
    ...evidence.map((entry) => ({ timestamp: entry.observed_at, type: "evidence", name: entry.kind, work_item_id: entry.work_item_id, actor: entry.recorded_by, reference: entry.id, outcome: entry.outcome }))
  ].sort((left, right) => String(right.timestamp).localeCompare(String(left.timestamp))).slice(0, 100);
  const categories = Object.fromEntries(["active", "blocked", "qa_pending", "approval_pending", "queued", "terminal"].map((category) => [category, work.filter((item) => item.category === category).length]));
  return {
    schema_version: OBSERVER_SCHEMA,
    generated_at: new Date().toISOString(),
    project: { id: project.id, name: project.name },
    work: { total: work.length, categories, items: work },
    evidence: {
      total: evidence.length,
      stale: evidence.filter((entry) => entry.stale).length,
      unverified: evidence.filter((entry) => entry.kind === "unverified-claim").length,
      failed: evidence.filter((entry) => ["test", "runtime"].includes(entry.kind) && entry.outcome === "fail").length,
      items: evidence
    },
    learning: {
      total: learning.entries.length,
      revalidation_due: learning.entries.filter((entry) => ["due", "overdue"].includes(entry.revalidation.signal)).length,
      contradicted: learning.entries.filter((entry) => entry.revalidation.signal === "contradicted").length
    },
    attention,
    timeline,
    canonical_state_changed: false,
    external_action_performed: false
  };
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function renderObserverHtml(projection) {
  const cards = Object.entries(projection.work.categories).map(([name, count]) => `<section class="card"><strong>${count}</strong><span>${escapeHtml(name.replaceAll("_", " "))}</span></section>`).join("");
  const workRows = projection.work.items.length
    ? projection.work.items.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.state)}</td><td>${escapeHtml(item.category.replaceAll("_", " "))}</td><td>${item.evidence_count}</td></tr>`).join("")
    : '<tr><td colspan="5">No Work Items</td></tr>';
  const attention = projection.attention.length
    ? projection.attention.map((item) => `<li><strong>${escapeHtml(item.type)}</strong> ${escapeHtml(item.message)}</li>`).join("")
    : "<li>No attention signals.</li>";
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(projection.project.name)} Observer</title><style>:root{color-scheme:light dark;font-family:ui-sans-serif,system-ui,sans-serif}body{max-width:1100px;margin:auto;padding:2rem;line-height:1.5}header{display:flex;justify-content:space-between;gap:2rem;align-items:end}.muted{opacity:.7}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.75rem;margin:1.5rem 0}.card{border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:12px;padding:1rem;display:flex;flex-direction:column}.card strong{font-size:2rem}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.65rem;border-bottom:1px solid color-mix(in srgb,currentColor 18%,transparent)}code{font-size:.9em}</style></head><body><header><div><p class="muted">Read-only Observer overview</p><h1>${escapeHtml(projection.project.name)}</h1></div><p class="muted">Generated ${escapeHtml(projection.generated_at)}</p></header><div class="cards">${cards}</div><h2>Work</h2><table><thead><tr><th>ID</th><th>Title</th><th>State</th><th>Category</th><th>Evidence</th></tr></thead><tbody>${workRows}</tbody></table><h2>Attention</h2><ul>${attention}</ul><p class="muted">This generated view cannot approve gates, mutate canonical state, or perform external actions.</p></body></html>\n`;
}

export async function writeObserverProjection(target, projection) {
  const jsonPath = path.join(target, OBSERVER_JSON_RELATIVE_PATH);
  const htmlPath = path.join(target, OBSERVER_HTML_RELATIVE_PATH);
  await atomicWrite(jsonPath, formatJson(projection));
  await atomicWrite(htmlPath, renderObserverHtml(projection));
  return { jsonPath, htmlPath };
}
