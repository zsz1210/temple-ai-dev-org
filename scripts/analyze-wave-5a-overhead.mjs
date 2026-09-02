#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const round = (value, digits = 4) => Number(value.toFixed(digits));
const sum = (items, field) => items.reduce((total, item) => total + item[field], 0);
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function parseArgs(argv) {
  const options = { input: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") options.input = argv[++index];
    else if (value === "--output") options.output = argv[++index];
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!options.input || !options.output) throw new Error("--input and --output are required");
  return options;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} drifted: recomputed ${actual}, retained ${expected}`);
}

export function analyzeWave5A(source, inputDigest = null) {
  if (source?.schema_version !== "temple.wave-5a-experiment-result/v1") {
    throw new Error("Unsupported Wave 5A experiment schema");
  }
  const candidates = source.candidates ?? [];
  if (candidates.length !== 4) throw new Error(`Expected four candidates, received ${candidates.length}`);

  const aggregate = {
    gross_total_tokens: sum(candidates, "gross_total_tokens"),
    operational_budget_tokens: sum(candidates, "operational_budget_tokens"),
    candidate_latency_ms: sum(candidates, "latency_ms"),
    program_elapsed_ms: source.aggregate.elapsed_ms
  };
  assertEqual(aggregate.gross_total_tokens, source.aggregate.gross_total_tokens, "gross Token total");
  assertEqual(aggregate.operational_budget_tokens, source.aggregate.operational_budget_tokens, "operational Token total");

  const cacheRatio = source.aggregate.input_tokens === 0
    ? null
    : source.aggregate.cached_input_tokens / source.aggregate.input_tokens;
  if (round(cacheRatio, 10) !== round(source.aggregate.input_cache_ratio, 10)) {
    throw new Error("input cache ratio drifted");
  }

  const byCase = new Map();
  for (const candidate of candidates) {
    if (!byCase.has(candidate.case_id)) byCase.set(candidate.case_id, []);
    byCase.get(candidate.case_id).push(candidate);
  }

  const pairs = [];
  for (const [caseId, pair] of byCase) {
    const temple = pair.find((entry) => entry.condition === "temple");
    const minimal = pair.find((entry) => entry.condition === "minimal");
    if (!temple || !minimal) throw new Error(`Case ${caseId} does not contain both conditions`);
    const bothPass = temple.quality_decision === "pass" && minimal.quality_decision === "pass";
    pairs.push({
      case_id: caseId,
      qualified_for_resource_comparison: bothPass,
      exclusion_reason: bothPass ? null : "At least one condition failed objective quality.",
      temple_minus_minimal: {
        operational_budget_tokens: temple.operational_budget_tokens - minimal.operational_budget_tokens,
        operational_budget_percent: round(((temple.operational_budget_tokens - minimal.operational_budget_tokens) / minimal.operational_budget_tokens) * 100),
        latency_ms: temple.latency_ms - minimal.latency_ms,
        latency_percent: round(((temple.latency_ms - minimal.latency_ms) / minimal.latency_ms) * 100)
      }
    });
  }

  const recordedPairs = new Map((source.paired_interpretation ?? []).map((entry) => [entry.case_id, entry]));
  for (const pair of pairs) {
    const retained = recordedPairs.get(pair.case_id);
    if (!retained) throw new Error(`Missing retained pair ${pair.case_id}`);
    assertEqual(pair.qualified_for_resource_comparison, retained.qualified_for_resource_comparison, `${pair.case_id} qualification`);
    const retainedDelta = retained.temple_budget_token_delta ?? retained.descriptive_only?.temple_budget_token_delta;
    assertEqual(pair.temple_minus_minimal.operational_budget_tokens, retainedDelta, `${pair.case_id} Token delta`);
  }

  const candidateBreakdown = candidates.map((candidate) => ({
    case_id: candidate.case_id,
    condition: candidate.condition,
    quality_decision: candidate.quality_decision,
    gross_total_tokens: candidate.gross_total_tokens,
    operational_budget_tokens: candidate.operational_budget_tokens,
    operational_share_percent: round((candidate.operational_budget_tokens / aggregate.operational_budget_tokens) * 100, 2),
    latency_ms: candidate.latency_ms,
    latency_share_percent: round((candidate.latency_ms / aggregate.program_elapsed_ms) * 100, 2)
  }));
  const largestOperational = [...candidateBreakdown].sort((a, b) => b.operational_budget_tokens - a.operational_budget_tokens)[0];
  const largestLatency = [...candidateBreakdown].sort((a, b) => b.latency_ms - a.latency_ms)[0];

  return {
    schema_version: "temple.wave-5a-overhead-analysis/v1",
    work_item_id: "WI-0116",
    source: {
      work_item_id: source.work_item_id,
      schema_version: source.schema_version,
      sha256: inputDigest
    },
    recomputed: {
      ...aggregate,
      coordinator_overhead_ms: aggregate.program_elapsed_ms - aggregate.candidate_latency_ms,
      coordinator_overhead_percent: round(((aggregate.program_elapsed_ms - aggregate.candidate_latency_ms) / aggregate.program_elapsed_ms) * 100, 4),
      input_tokens: source.aggregate.input_tokens,
      cached_input_tokens: source.aggregate.cached_input_tokens,
      output_tokens: source.aggregate.output_tokens,
      input_cache_ratio: round(cacheRatio, 10),
      gross_to_operational_ratio: round(aggregate.gross_total_tokens / aggregate.operational_budget_tokens, 4)
    },
    candidates: candidateBreakdown,
    pairs,
    observations: {
      largest_operational_candidate: { case_id: largestOperational.case_id, condition: largestOperational.condition, share_percent: largestOperational.operational_share_percent },
      largest_latency_candidate: { case_id: largestLatency.case_id, condition: largestLatency.condition, share_percent: largestLatency.latency_share_percent },
      qualifying_pair_count: pairs.filter((pair) => pair.qualified_for_resource_comparison).length,
      quality_excluded_pair_count: pairs.filter((pair) => !pair.qualified_for_resource_comparison).length,
      model_profile: "gpt-5.6-luna/max",
      human_intervention_between_candidates: 0,
      retries: source.retry_count,
      fallbacks: source.fallback_count
    },
    interpretation: {
      supported: [
        "Wave 5A completed four bounded candidates with correlated usage and quality evidence.",
        "The only quality-qualified pair used more operational Tokens and more elapsed time in the Temple condition.",
        "High cached-input volume explains why gross throughput is much larger than the operational budget metric."
      ],
      hypotheses_requiring_new_instrumentation: [
        "Temple instruction volume or completion protocol caused the qualified-pair overhead.",
        "Max reasoning effort was the dominant overhead driver.",
        "Observation cadence changed model behavior or completion time."
      ],
      prohibited_claims: [
        "The retained data establish billed cost.",
        "One qualifying pair establishes a causal Temple penalty or benefit.",
        "The pilot statistically qualifies automatic model or workflow routing.",
        "Gross Provider Tokens equal non-cached operational Tokens."
      ]
    }
  };
}

async function writeExclusive(file, document) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const handle = await fs.open(file, "wx");
  try { await handle.writeFile(`${JSON.stringify(document, null, 2)}\n`); }
  finally { await handle.close(); }
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const raw = await fs.readFile(path.resolve(options.input), "utf8");
    const result = analyzeWave5A(JSON.parse(raw), sha256(raw));
    await writeExclusive(path.resolve(options.output), result);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
