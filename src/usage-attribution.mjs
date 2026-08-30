import path from "node:path";
import { atomicWrite, formatJson, pathExists, readJson } from "./files.mjs";
import { readControlPlaneConfig } from "./control-plane-config.mjs";
import { openTelemetryJournal, resolveControlPlaneStateDirectory } from "./telemetry.mjs";

export const USAGE_BASELINE_VIEW = ".ai-org/views/usage-baseline.json";
export const USAGE_DIMENSIONS = [
  "project_id",
  "work_item_id",
  "position_id",
  "lifecycle_stage",
  "task_id",
  "attempt_id",
  "provider_id",
  "model",
  "model_version",
  "reasoning_effort",
  "service_tier",
  "context_capsule_digest",
  "capability_set_digest",
  "outcome"
];

const TOKEN_FIELDS = ["input_tokens", "cached_input_tokens", "output_tokens", "reasoning_output_tokens", "total_tokens"];

function zeroTokens() {
  return Object.fromEntries(TOKEN_FIELDS.map((field) => [field, 0]));
}

function zeroTokenSamples() {
  return Object.fromEntries(TOKEN_FIELDS.map((field) => [field, 0]));
}

function addTokens(target, samples, source) {
  for (const field of TOKEN_FIELDS) {
    if (!Number.isFinite(source?.[field]) || source[field] < 0) continue;
    target[field] += source[field];
    samples[field] += 1;
  }
}

function finalizeTokens(tokens, samples) {
  return Object.fromEntries(TOKEN_FIELDS.map((field) => [field, samples[field] > 0 ? tokens[field] : null]));
}

function dimensionsFor(record) {
  const attribution = record.data?.attribution ?? {};
  return Object.fromEntries(USAGE_DIMENSIONS.map((field) => [field, attribution[field] ?? record.data?.[field] ?? null]));
}

export function buildUsageBaselineFromRecords(project, records, options = {}) {
  const usageRecords = records.filter((record) => record.type === "org.temple.codex.usage.updated.v1" && record.data?.usage);
  const groups = new Map();
  const unknownDimensions = Object.fromEntries(USAGE_DIMENSIONS.map((field) => [field, 0]));
  const totals = zeroTokens();
  const totalSamples = zeroTokenSamples();
  for (const record of usageRecords) {
    const dimensions = dimensionsFor(record);
    for (const field of USAGE_DIMENSIONS) if (dimensions[field] === null || dimensions[field] === "unknown") unknownDimensions[field] += 1;
    const delta = record.data.usage.last ?? {};
    addTokens(totals, totalSamples, delta);
    const key = JSON.stringify(dimensions);
    const group = groups.get(key) ?? {
      dimensions,
      observations: 0,
      tokens: zeroTokens(),
      tokenSamples: zeroTokenSamples(),
      first_observed_at: record.templeobservedat,
      last_observed_at: record.templeobservedat
    };
    group.observations += 1;
    addTokens(group.tokens, group.tokenSamples, delta);
    group.first_observed_at = String(group.first_observed_at).localeCompare(String(record.templeobservedat)) <= 0 ? group.first_observed_at : record.templeobservedat;
    group.last_observed_at = String(group.last_observed_at).localeCompare(String(record.templeobservedat)) >= 0 ? group.last_observed_at : record.templeobservedat;
    groups.set(key, group);
  }
  const finalTotals = finalizeTokens(totals, totalSamples);
  const driverGroups = [...groups.values()]
    .map(({ tokenSamples, tokens, ...group }) => ({ ...group, tokens: finalizeTokens(tokens, tokenSamples) }))
    .sort((left, right) => (right.tokens.total_tokens ?? -1) - (left.tokens.total_tokens ?? -1) || JSON.stringify(left.dimensions).localeCompare(JSON.stringify(right.dimensions)));
  const cachedDenominator = finalTotals.input_tokens !== null && finalTotals.cached_input_tokens !== null
    ? finalTotals.input_tokens + finalTotals.cached_input_tokens
    : null;
  return {
    schema_version: "temple.usage-baseline/v1",
    generated_at: new Date().toISOString(),
    project: { id: project.id, name: project.name },
    baseline_status: usageRecords.length > 0 ? "observed" : "insufficient-data",
    source: {
      kind: "provider-reported",
      state_directory: options.stateDirectory ?? null,
      first_cursor: records[0]?.templecursor ?? null,
      last_cursor: records.at(-1)?.templecursor ?? 0,
      observations: usageRecords.length,
      aggregation_basis: "provider-last-usage-delta"
    },
    totals: {
      ...finalTotals,
      cached_input_ratio: cachedDenominator !== null && cachedDenominator > 0 ? finalTotals.cached_input_tokens / cachedDenominator : null,
      monetary_cost: null,
      price_source: null,
      cost_status: "unknown"
    },
    unknown_dimensions: unknownDimensions,
    driver_groups: driverGroups,
    routing: {
      recommendation_status: "not-implemented",
      automatic_routing: false,
      budget_can_skip_gates: false,
      model_switch_performed: false
    },
    privacy: {
      raw_prompts_retained: false,
      hidden_reasoning_retained: false,
      source_bodies_retained: false,
      tool_payloads_retained: false,
      credentials_retained: false
    },
    canonical_state_changed: false,
    external_action_performed: false
  };
}

export async function buildUsageBaseline(target, options = {}) {
  const project = await readJson(path.join(target, ".ai-org/project/project.json"));
  const config = await readControlPlaneConfig(target);
  const stateDirectory = resolveControlPlaneStateDirectory(target, options.stateDirectory ?? config.state_directory);
  const journalPath = path.join(stateDirectory, "journal/events.jsonl");
  let records = [];
  if (await pathExists(journalPath)) {
    const journal = await openTelemetryJournal(stateDirectory, {
      maxEvents: config.retention.max_events,
      privacy: config.privacy,
      readOnly: true
    });
    try {
      records = journal.readAfter(0).records;
    } finally {
      await journal.close();
    }
  }
  const report = buildUsageBaselineFromRecords(project, records, { stateDirectory });
  if (options.write !== false) await atomicWrite(path.join(target, USAGE_BASELINE_VIEW), formatJson(report));
  return report;
}
