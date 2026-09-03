#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function round(value, digits = 4) {
  return Number(value.toFixed(digits));
}

function median(values) {
  if (!values.length) return null;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function percentDelta(next, baseline) {
  return baseline === 0 ? null : round(((next - baseline) / baseline) * 100);
}

function objectivePass(candidate) {
  return candidate.public_tests === "pass" && candidate.acceptance_tests === "pass";
}

function validateCandidate(candidate, conditionIds) {
  if (!conditionIds.has(candidate?.condition_id)) throw new Error(`unknown condition ${candidate?.condition_id}`);
  if (typeof candidate?.case_id !== "string" || !candidate.case_id) throw new Error("candidate case_id is missing");
  for (const field of ["operational_tokens", "gross_tokens", "latency_ms", "context_utf8_bytes"]) {
    if (!Number.isSafeInteger(candidate?.[field]) || candidate[field] < 0) throw new Error(`${candidate.case_id}/${candidate.condition_id} has invalid ${field}`);
  }
  if (typeof candidate.context_profile_digest !== "string" || !candidate.context_profile_digest.startsWith("sha256:")) throw new Error("candidate context_profile_digest is invalid");
  if (!["pass", "fail"].includes(candidate.public_tests) || !["pass", "fail"].includes(candidate.acceptance_tests)) throw new Error("candidate test evidence is invalid");
  if (candidate.blind_score !== null && (!Number.isInteger(candidate.blind_score) || candidate.blind_score < 0 || candidate.blind_score > 100)) throw new Error("candidate blind score is invalid");
  if (candidate.retry_count !== 0 || candidate.fallback_count !== 0) throw new Error("retry or fallback contaminated the protocol");
}

function buildPair(caseId, comparison, byKey, thresholds) {
  const baseline = byKey.get(`${caseId}\0${comparison.baseline}`);
  const next = byKey.get(`${caseId}\0${comparison.next}`);
  if (!baseline || !next) throw new Error(`${caseId} is missing ${comparison.baseline} or ${comparison.next}`);
  const baselinePass = objectivePass(baseline);
  const nextPass = objectivePass(next);
  const blindAvailable = [baseline, next].every((entry) => Number.isInteger(entry.blind_score) && ["pass", "reject"].includes(entry.blind_decision));
  const qualityDelta = blindAvailable ? next.blind_score - baseline.blind_score : null;
  return {
    case_id: caseId,
    comparison_id: comparison.id,
    attribution: comparison.attribution,
    baseline_condition: comparison.baseline,
    next_condition: comparison.next,
    objective_direction: baselinePass && nextPass ? "both-pass" : baselinePass ? "baseline-only-pass" : nextPass ? "next-only-pass" : "both-fail",
    blind_available: blindAvailable,
    quality_delta_points: qualityDelta,
    quality_non_inferior: qualityDelta === null ? null : qualityDelta >= -thresholds.quality_non_inferiority_points,
    operational_token_delta: next.operational_tokens - baseline.operational_tokens,
    operational_token_delta_percent: percentDelta(next.operational_tokens, baseline.operational_tokens),
    latency_delta_ms: next.latency_ms - baseline.latency_ms,
    latency_delta_percent: percentDelta(next.latency_ms, baseline.latency_ms),
    context_byte_delta: next.context_utf8_bytes - baseline.context_utf8_bytes,
    qualified: blindAvailable && baseline.blind_decision === "pass" && next.blind_decision === "pass" && baselinePass && nextPass
  };
}

function summarize(pairs) {
  const qualified = pairs.filter((entry) => entry.qualified);
  return {
    pairs: pairs.length,
    qualified_pairs: qualified.length,
    next_only_correctness_wins: pairs.filter((entry) => entry.objective_direction === "next-only-pass").length,
    baseline_only_correctness_wins: pairs.filter((entry) => entry.objective_direction === "baseline-only-pass").length,
    both_pass_pairs: pairs.filter((entry) => entry.objective_direction === "both-pass").length,
    median_quality_delta_points: median(pairs.filter((entry) => entry.quality_delta_points !== null).map((entry) => entry.quality_delta_points)),
    median_operational_token_delta_percent: median(qualified.map((entry) => entry.operational_token_delta_percent)),
    median_latency_delta_percent: median(qualified.map((entry) => entry.latency_delta_percent)),
    median_context_byte_delta: median(pairs.map((entry) => entry.context_byte_delta))
  };
}

function recommendation(comparison, pairs, summary, thresholds) {
  if (pairs.some((entry) => !entry.blind_available)) return { decision: "inconclusive", action: "complete arm-neutral blind review before changing routing" };
  if (pairs.some((entry) => entry.objective_direction === "baseline-only-pass" || entry.quality_non_inferior === false)) {
    return { decision: "reject-escalation", action: "keep the baseline route and inspect the regression" };
  }
  if (comparison.id === "process-effect") {
    if (summary.next_only_correctness_wins > 0) return { decision: "retain-provisionally", action: "expand the native Lean process comparison to more task families" };
    if (summary.qualified_pairs !== pairs.length) return { decision: "inconclusive", action: "repair excluded cases before judging the Lean process" };
    if (summary.median_operational_token_delta_percent >= thresholds.meaningful_operational_token_reduction_percent) {
      return { decision: "simplify-and-rerun", action: "reduce non-contributing Temple context while preserving the acceptance contract" };
    }
    return { decision: "retain-with-measurement", action: "retain native Lean provisionally and expand the sample" };
  }
  if (comparison.id === "efficient-escalation") {
    if (summary.next_only_correctness_wins > 0) return { decision: "retain-targeted-escalation", action: "use Luna max only when ambiguity or invariant risk is explicitly present" };
    if (summary.qualified_pairs !== pairs.length) return { decision: "inconclusive", action: "keep Terra as the bounded default and collect more matched cases" };
    if (summary.median_operational_token_delta_percent >= thresholds.meaningful_operational_token_reduction_percent || summary.median_latency_delta_percent >= thresholds.meaningful_latency_reduction_percent) {
      return { decision: "keep-terra-default", action: "do not escalate explicit bounded work without measured quality benefit" };
    }
    return { decision: "neutral", action: "keep routing advisory until a representative sample shows a benefit" };
  }
  if (summary.next_only_correctness_wins > 0) return { decision: "retain-as-capability-ceiling", action: "reserve Sol xhigh for consequential or failed lower-route work" };
  if (summary.qualified_pairs !== pairs.length) return { decision: "inconclusive", action: "keep Sol optional and collect more objective cases" };
  if (summary.median_operational_token_delta_percent >= thresholds.meaningful_operational_token_reduction_percent || summary.median_latency_delta_percent >= thresholds.meaningful_latency_reduction_percent) {
    return { decision: "reserve-only", action: "Sol adds no measured quality here; keep it as a high-risk escalation, not a default" };
  }
  return { decision: "no-observed-advantage", action: "retain the capability ceiling without expanding its routing scope" };
}

export function analyzeEffectivenessPilotV2(source, protocol) {
  if (source?.schema_version !== "temple.effectiveness-pilot-evidence/v2") throw new Error("unsupported evidence schema");
  if (protocol?.schema_version !== "temple.effectiveness-pilot/v2") throw new Error("unsupported protocol schema");
  const conditionIds = new Set(protocol.conditions.map((entry) => entry.id));
  const expected = conditionIds.size * protocol.cases.length;
  if (!Array.isArray(source.candidates) || source.candidates.length !== expected) throw new Error(`exactly ${expected} candidates are required`);
  source.candidates.forEach((entry) => validateCandidate(entry, conditionIds));
  const byKey = new Map();
  for (const candidate of source.candidates) {
    const key = `${candidate.case_id}\0${candidate.condition_id}`;
    if (byKey.has(key)) throw new Error(`duplicate candidate ${key}`);
    byKey.set(key, candidate);
  }
  const comparisons = {};
  for (const comparison of protocol.comparisons) {
    const pairs = protocol.cases.map((entry) => buildPair(entry.id, comparison, byKey, protocol.decision_thresholds));
    const summary = summarize(pairs);
    comparisons[comparison.id] = { ...comparison, pairs, summary, recommendation: recommendation(comparison, pairs, summary, protocol.decision_thresholds) };
  }
  const candidateOperational = source.candidates.reduce((total, entry) => total + entry.operational_tokens, 0);
  const evaluatorOperational = source.evaluator?.usage
    ? source.evaluator.usage.input_tokens - source.evaluator.usage.cached_input_tokens + source.evaluator.usage.output_tokens
    : null;
  return {
    schema_version: "temple.effectiveness-pilot-analysis/v2",
    work_item_id: protocol.work_item_id,
    validity: {
      status: source.candidates.every((entry) => Number.isInteger(entry.blind_score)) ? "diagnostic-complete" : "diagnostic-incomplete",
      case_count: protocol.cases.length,
      candidate_count: source.candidates.length,
      statistical_qualification: false,
      generalizable: false
    },
    aggregate: {
      candidate_operational_tokens: candidateOperational,
      evaluator_operational_tokens: evaluatorOperational,
      combined_operational_tokens: evaluatorOperational === null ? null : candidateOperational + evaluatorOperational,
      retry_count: source.candidates.reduce((total, entry) => total + entry.retry_count, 0),
      fallback_count: source.candidates.reduce((total, entry) => total + entry.fallback_count, 0)
    },
    comparisons,
    claims: {
      native_lean_diagnostic: true,
      route_bundle_comparison_only: true,
      pure_model_effect_proven: false,
      temple_superiority_proven: false,
      automatic_routing_authorized: false,
      billed_cost_known: false
    }
  };
}

async function main(argv) {
  const options = Object.fromEntries(Array.from({ length: Math.floor(argv.length / 2) }, (_, index) => [argv[index * 2], argv[index * 2 + 1]]));
  if (!options["--input"] || !options["--protocol"] || !options["--output"]) throw new Error("--input, --protocol, and --output are required");
  const source = JSON.parse(await fs.readFile(path.resolve(options["--input"]), "utf8"));
  const protocol = JSON.parse(await fs.readFile(path.resolve(options["--protocol"]), "utf8"));
  const result = analyzeEffectivenessPilotV2(source, protocol);
  const output = path.resolve(options["--output"]);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
