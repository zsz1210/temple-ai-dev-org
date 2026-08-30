import path from "node:path";
import { atomicWrite, formatJson, pathExists, readJson } from "./files.mjs";
import { readControlPlaneConfig } from "./control-plane-config.mjs";
import { openTelemetryJournal, resolveControlPlaneStateDirectory } from "./telemetry.mjs";
import { classifyCodexTasks, createJsonRpcProcess } from "./codex-app-server-provider.mjs";
import { listWorkItemDocuments } from "./work-items.mjs";

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

function usageRecordsFrom(records) {
  return records.filter((record) => record.type === "org.temple.codex.usage.updated.v1" && record.data?.usage);
}

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

function finalizeTokens(tokens, samples, expectedSamples) {
  return Object.fromEntries(TOKEN_FIELDS.map((field) => [
    field,
    samples[field] > 0 && samples[field] === expectedSamples ? tokens[field] : null
  ]));
}

function dimensionsFor(record) {
  const attribution = record.data?.attribution ?? {};
  return Object.fromEntries(USAGE_DIMENSIONS.map((field) => [field, attribution[field] ?? record.data?.[field] ?? null]));
}

function sortedUnique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))].sort((left, right) => left.localeCompare(right));
}

function tokenFieldCoverage(usageRecords, correlatedRecords) {
  return Object.fromEntries(TOKEN_FIELDS.map((field) => {
    const observed = usageRecords.filter((record) => Number.isFinite(record.data?.usage?.last?.[field]) && record.data.usage.last[field] >= 0);
    const correlated = correlatedRecords.filter(({ record }) => Number.isFinite(record.data?.usage?.last?.[field]) && record.data.usage.last[field] >= 0);
    return [field, {
      support_status: observed.length === 0 ? "unknown" : observed.length === usageRecords.length ? "observed" : "partial",
      observations_with_value: observed.length,
      correlated_observations_with_value: correlated.length,
      correlated_work_items_with_value: sortedUnique(correlated.map(({ workItemId }) => workItemId)).length
    }];
  }));
}

function buildLongitudinalCoverage(workItems = [], tasks = [], usageRecords = [], options = {}) {
  const canonicalItems = [...workItems]
    .filter((item) => typeof item?.id === "string" && item.id.trim())
    .sort((left, right) => left.id.localeCompare(right.id));
  const canonicalItemIds = new Set(canonicalItems.map((item) => item.id));
  const completedItemIds = sortedUnique(canonicalItems.filter((item) => item.state === "done").map((item) => item.id));
  const completedItemIdSet = new Set(completedItemIds);
  const topology = classifyCodexTasks(tasks, { workItems: canonicalItems });
  const registeredTasks = [...topology.registered].sort((left, right) => String(left.id).localeCompare(String(right.id)));
  const registeredTaskById = new Map(registeredTasks.map((task) => [task.id, task]));
  const registeredWorkItemIds = sortedUnique(registeredTasks.map((task) => task.work_item_id).filter((id) => canonicalItemIds.has(id)));
  const completedWithRegisteredTaskIds = registeredWorkItemIds.filter((id) => completedItemIdSet.has(id));
  const liveTaskIds = new Set(topology.live_resumable.map((task) => task.id));
  const historicalOnlyTasks = topology.history_reconcilable.filter((task) => !liveTaskIds.has(task.id));
  const correlatedRecords = [];
  for (const record of usageRecords) {
    const dimensions = dimensionsFor(record);
    const task = registeredTaskById.get(dimensions.task_id);
    if (!task || task.work_item_id !== dimensions.work_item_id || !canonicalItemIds.has(dimensions.work_item_id)) continue;
    correlatedRecords.push({ record, workItemId: dimensions.work_item_id });
  }
  const correlatedWorkItemIds = sortedUnique(correlatedRecords.map(({ workItemId }) => workItemId));
  const correlatedCompletedWorkItemIds = correlatedWorkItemIds.filter((id) => completedItemIdSet.has(id));
  const requiredWorkItems = Number.isInteger(options.longitudinalWorkItemsRequired) && options.longitudinalWorkItemsRequired > 0
    ? options.longitudinalWorkItemsRequired
    : 10;
  const remainingObserved = Math.max(0, requiredWorkItems - correlatedWorkItemIds.length);
  const remainingCompletedObserved = Math.max(0, requiredWorkItems - correlatedCompletedWorkItemIds.length);
  return {
    schema_version: "temple.usage-longitudinal-coverage/v1",
    canonical_work_items: {
      total: canonicalItems.length,
      completed: completedItemIds.length,
      completed_ids: completedItemIds
    },
    registered_task_coverage: {
      registered_tasks: registeredTasks.length,
      registered_work_items: registeredWorkItemIds.length,
      registered_work_item_ids: registeredWorkItemIds,
      completed_work_items_with_registered_task: completedWithRegisteredTaskIds.length,
      completed_work_item_ids_with_registered_task: completedWithRegisteredTaskIds,
      completed_work_item_coverage_ratio: completedItemIds.length > 0
        ? completedWithRegisteredTaskIds.length / completedItemIds.length
        : null
    },
    task_eligibility: {
      live_resumable: topology.live_resumable.length,
      live_resumable_task_ids: sortedUnique(topology.live_resumable.map((task) => task.id)),
      history_reconcilable: topology.history_reconcilable.length,
      history_reconcilable_task_ids: sortedUnique(topology.history_reconcilable.map((task) => task.id)),
      historical_only: historicalOnlyTasks.length,
      historical_only_task_ids: sortedUnique(historicalOnlyTasks.map((task) => task.id)),
      terminal: topology.terminal.length,
      detached_archived: topology.registered.length - topology.history_reconcilable.length
    },
    detailed_token_observation_coverage: {
      observations: usageRecords.length,
      correlated_observations: correlatedRecords.length,
      uncorrelated_observations: usageRecords.length - correlatedRecords.length,
      correlated_work_items: correlatedWorkItemIds.length,
      correlated_work_item_ids: correlatedWorkItemIds,
      correlated_completed_work_items: correlatedCompletedWorkItemIds.length,
      correlated_completed_work_item_ids: correlatedCompletedWorkItemIds,
      token_fields: tokenFieldCoverage(usageRecords, correlatedRecords)
    },
    qualification: {
      status: "not-qualified",
      required_correlated_work_items: requiredWorkItems,
      remaining_correlated_work_items: remainingObserved,
      remaining_correlated_completed_work_items: remainingCompletedObserved,
      completed_coverage_threshold_met: remainingCompletedObserved === 0,
      varied_task_shapes: "not-evaluated",
      longitudinal_comparison: "not-evaluated",
      savings_claim_allowed: false,
      cost_claim_allowed: false,
      model_quality_claim_allowed: false,
      routing_claim_allowed: false
    }
  };
}

export function buildUsageBaselineFromRecords(project, records, options = {}) {
  const usageRecords = usageRecordsFrom(records);
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
  const finalTotals = finalizeTokens(totals, totalSamples, usageRecords.length);
  const driverGroups = [...groups.values()]
    .map(({ tokenSamples, tokens, ...group }) => ({ ...group, tokens: finalizeTokens(tokens, tokenSamples, group.observations) }))
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
      aggregation_basis: "provider-last-usage-delta",
      longitudinal_coverage: buildLongitudinalCoverage(options.workItems, options.tasks, usageRecords, options)
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

function unavailableAccountProbe(requested = false, reason = null) {
  return {
    requested,
    availability: requested ? "unavailable" : "not-probed",
    scope: "account-wide",
    allocation: "unallocated",
    summary_fields: [],
    non_null_summary_fields: [],
    daily_buckets_available: null,
    daily_bucket_count: null,
    latency_ms: null,
    model_generation_requested: false,
    raw_values_retained: false,
    reason
  };
}

function probeFailureReason(error) {
  const message = String(error?.message ?? "").toLowerCase();
  if (message.includes("timed out")) return "request-timed-out";
  if (message.includes("initialize")) return "initialization-failed";
  if (message.includes("account/usage/read")) return "account-usage-read-failed";
  return "provider-unavailable";
}

export async function probeCodexAccountUsage(target, options = {}) {
  const startedAt = Date.now();
  let connection = null;
  try {
    const factory = options.connectionFactory ?? ((command, args, connectionOptions) =>
      createJsonRpcProcess(command, args, connectionOptions));
    connection = await factory(
      options.command ?? "codex",
      options.commandArgs ?? ["app-server", "--stdio"],
      { cwd: target }
    );
    const initialized = await connection.request("initialize", {
      clientInfo: {
        name: "temple-usage-preflight",
        title: "Temple Usage Preflight",
        version: options.version ?? "unknown"
      },
      capabilities: { experimentalApi: false }
    });
    connection.notify?.("initialized", {});
    const result = await connection.request("account/usage/read", {});
    const summary = result?.summary && typeof result.summary === "object" ? result.summary : null;
    const dailyBuckets = Array.isArray(result?.dailyUsageBuckets) ? result.dailyUsageBuckets : null;
    return {
      requested: true,
      availability: "available",
      scope: "account-wide",
      allocation: "unallocated",
      server_version_present: Boolean(initialized?.serverInfo?.version ?? initialized?.userAgent),
      summary_fields: summary ? Object.keys(summary).sort() : [],
      non_null_summary_fields: summary
        ? Object.entries(summary).filter(([, value]) => value !== null).map(([field]) => field).sort()
        : [],
      daily_buckets_available: dailyBuckets !== null,
      daily_bucket_count: dailyBuckets?.length ?? null,
      latency_ms: Math.max(0, Date.now() - startedAt),
      model_generation_requested: false,
      raw_values_retained: false,
      reason: null
    };
  } catch (error) {
    return {
      ...unavailableAccountProbe(true, probeFailureReason(error)),
      latency_ms: Math.max(0, Date.now() - startedAt)
    };
  } finally {
    await connection?.close?.().catch(() => {});
  }
}

export function buildUsagePreflightFromRecords(project, tasks, records, providers = [], accountProbe = null, options = {}) {
  const topology = classifyCodexTasks(tasks, { workItems: options.workItems });
  const usageRecords = usageRecordsFrom(records);
  const codexProvider = providers.find((provider) => provider.kind === "codex-app-server" || provider.id === "codex-local") ?? null;
  const tokenCapability = codexProvider?.capabilities?.token_usage ?? "unknown";
  const providerOperational = codexProvider && !["offline", "disabled"].includes(codexProvider.status);
  const correlated = usageRecords.filter((record) => {
    const attribution = record.data?.attribution ?? {};
    return Boolean(attribution.work_item_id ?? record.data?.work_item_id) && Boolean(attribution.task_id ?? record.data?.task_id);
  });
  let detailedStatus = "no-live-registered-task";
  if (usageRecords.length > 0) detailedStatus = "observed";
  else if (topology.live_resumable.length === 0) detailedStatus = "no-live-registered-task";
  else if (!providerOperational || tokenCapability !== "supported") detailedStatus = "provider-unavailable";
  else if (topology.live_resumable.length > 0) detailedStatus = "awaiting-observation";
  const probe = accountProbe ?? unavailableAccountProbe(false);
  const qualified = correlated.length > 0;
  const nextAction = detailedStatus === "observed"
    ? "Accumulate varied real Work Items before comparing usage or recommending a model."
    : detailedStatus === "awaiting-observation"
      ? "Run a real turn on the provider-owned active task and check for a detailed usage notification."
      : detailedStatus === "no-live-registered-task"
        ? "Use a provider-owned active task or a future Codex host event bridge; registration alone does not create a live subscription."
        : "Restore the configured Codex Provider before attempting a detailed usage baseline.";
  return {
    schema_version: "temple.usage-preflight/v1",
    generated_at: new Date().toISOString(),
    project: { id: project.id, name: project.name },
    protocol: {
      official_documentation: "https://developers.openai.com/codex/app-server/",
      detailed_notification: "thread/tokenUsage/updated",
      account_method: "account/usage/read"
    },
    provider: codexProvider
      ? {
          id: codexProvider.id,
          status: codexProvider.status,
          token_usage_capability: tokenCapability,
          detected_cli_version: codexProvider.protocol?.detected_cli_version ?? null,
          degraded_reason: codexProvider.degraded_reason ?? null
        }
      : {
          id: "codex-local",
          status: "unobserved",
          token_usage_capability: "unknown",
          detected_cli_version: null,
          degraded_reason: "provider-registry-unavailable"
        },
    task_topology: {
      registered: topology.registered.length,
      history_reconcilable: topology.history_reconcilable.length,
      live_resumable: topology.live_resumable.length,
      terminal: topology.terminal.length,
      non_live: topology.non_live.length,
      live_task_ids: topology.live_resumable.map((task) => task.id),
      terminal_task_ids: topology.terminal.map((task) => task.id),
      terminal_tasks_are_live_resumable: false
    },
    detailed_thread_usage: {
      status: detailedStatus,
      scope: "registered-provider-active-thread",
      allocation: "work-item-capable",
      observations: usageRecords.length,
      correlated_observations: correlated.length,
      uncorrelated_observations: usageRecords.length - correlated.length,
      aggregation_basis: "provider-last-usage-delta"
    },
    account_usage: probe,
    baseline_qualification: {
      status: qualified ? "first-observation-qualified" : "not-qualified",
      requires_detailed_thread_usage: true,
      account_usage_can_qualify: false,
      longitudinal_work_items_required: options.longitudinalWorkItemsRequired ?? 10,
      savings_claim_allowed: false
    },
    measurement_overhead: {
      account_probe_latency_ms: probe.latency_ms,
      model_generation_requested: false,
      token_counting_model_call_performed: false
    },
    routing: {
      recommendation_status: "not-implemented",
      automatic_routing: false,
      model_switch_performed: false,
      budget_can_skip_gates: false
    },
    privacy: {
      raw_account_values_retained: false,
      raw_prompts_retained: false,
      hidden_reasoning_retained: false,
      credentials_retained: false
    },
    recommended_next_action: nextAction,
    canonical_state_changed: false,
    external_read_performed: probe.requested === true,
    external_action_performed: false
  };
}

export async function buildUsagePreflight(target, options = {}) {
  const project = await readJson(path.join(target, ".ai-org/project/project.json"));
  const taskRegistry = await readJson(path.join(target, ".ai-org/project/tasks.json"));
  const workItems = await listWorkItemDocuments(target);
  const config = await readControlPlaneConfig(target);
  const stateDirectory = resolveControlPlaneStateDirectory(target, options.stateDirectory ?? config.state_directory);
  const journalPath = path.join(stateDirectory, "journal/events.jsonl");
  const providerPath = path.join(stateDirectory, "providers.json");
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
  const providers = await pathExists(providerPath)
    ? (await readJson(providerPath)).providers ?? []
    : [];
  const configuredCodex = config.providers.find((provider) => provider.kind === "codex-app-server" && provider.enabled !== false);
  const accountProbe = options.probeCodexAccount === true
    ? await probeCodexAccountUsage(target, {
        command: options.command ?? configuredCodex?.options?.command,
        commandArgs: options.commandArgs ?? configuredCodex?.options?.command_args,
        connectionFactory: options.connectionFactory,
        version: options.version
      })
    : unavailableAccountProbe(false);
  return buildUsagePreflightFromRecords(project, taskRegistry.tasks ?? [], records, providers, accountProbe, { workItems });
}

export async function buildUsageBaseline(target, options = {}) {
  const [project, taskRegistry, workItems] = await Promise.all([
    readJson(path.join(target, ".ai-org/project/project.json")),
    readJson(path.join(target, ".ai-org/project/tasks.json")),
    listWorkItemDocuments(target)
  ]);
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
  const report = buildUsageBaselineFromRecords(project, records, {
    stateDirectory,
    workItems,
    tasks: taskRegistry.tasks ?? [],
    longitudinalWorkItemsRequired: options.longitudinalWorkItemsRequired
  });
  if (options.write !== false) await atomicWrite(path.join(target, USAGE_BASELINE_VIEW), formatJson(report));
  return report;
}
