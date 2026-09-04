#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONDITIONS = ["conventional-fixed", "temple-fixed", "temple-adaptive"];

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function median(values) {
  if (values.length === 0) return null;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function percentDelta(next, baseline) {
  return baseline === 0 ? null : round(((next - baseline) / baseline) * 100, 4);
}

function validateCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") throw new Error("candidate must be an object");
  if (!CONDITIONS.includes(candidate.condition_id)) throw new Error(`unknown condition ${candidate.condition_id}`);
  if (!candidate.case_id) throw new Error("candidate case_id is missing");
  for (const field of ["operational_tokens", "gross_tokens", "latency_ms"]) {
    if (!Number.isSafeInteger(candidate[field]) || candidate[field] < 0) throw new Error(`${candidate.case_id}/${candidate.condition_id} has invalid ${field}`);
  }
  if (!["pass", "fail"].includes(candidate.public_tests) || !["pass", "fail"].includes(candidate.acceptance_tests)) {
    throw new Error(`${candidate.case_id}/${candidate.condition_id} has invalid test evidence`);
  }
  if (candidate.blind_score !== null && (!Number.isInteger(candidate.blind_score) || candidate.blind_score < 0 || candidate.blind_score > 100)) {
    throw new Error(`${candidate.case_id}/${candidate.condition_id} has invalid blind score`);
  }
  if (candidate.retry_count !== 0 || candidate.fallback_count !== 0) throw new Error("retry or fallback contaminated the registered protocol");
}

function pairFor(caseId, byKey, baselineId, nextId, thresholds) {
  const baseline = byKey.get(`${caseId}\0${baselineId}`);
  const next = byKey.get(`${caseId}\0${nextId}`);
  if (!baseline || !next) throw new Error(`${caseId} is missing ${baselineId} or ${nextId}`);
  const baselineObjectivePass = baseline.public_tests === "pass" && baseline.acceptance_tests === "pass";
  const nextObjectivePass = next.public_tests === "pass" && next.acceptance_tests === "pass";
  const objectivePass = baselineObjectivePass && nextObjectivePass;
  const blindAvailable = [baseline, next].every((entry) => Number.isInteger(entry.blind_score) && ["pass", "reject"].includes(entry.blind_decision));
  const blindPass = blindAvailable && [baseline, next].every((entry) => entry.blind_decision === "pass" && entry.blind_score >= 85);
  const qualified = objectivePass && blindPass;
  const qualityDelta = blindAvailable ? next.blind_score - baseline.blind_score : null;
  const operationalDelta = next.operational_tokens - baseline.operational_tokens;
  const latencyDelta = next.latency_ms - baseline.latency_ms;
  return {
    case_id: caseId,
    baseline_condition: baselineId,
    next_condition: nextId,
    baseline_objective_pass: baselineObjectivePass,
    next_objective_pass: nextObjectivePass,
    objective_direction: baselineObjectivePass && nextObjectivePass
      ? "both-pass"
      : baselineObjectivePass
        ? "baseline-only-pass"
        : nextObjectivePass
          ? "next-only-pass"
          : "both-fail",
    objective_pass: objectivePass,
    blind_available: blindAvailable,
    qualified,
    exclusion_reason: qualified ? null : !objectivePass ? "objective-tests-failed" : !blindAvailable ? "blind-score-unavailable" : "blind-quality-rejected",
    quality_delta_points: qualityDelta,
    quality_non_inferior: qualityDelta === null ? null : qualityDelta >= -thresholds.quality_non_inferiority_points,
    operational_token_delta: operationalDelta,
    operational_token_delta_percent: percentDelta(next.operational_tokens, baseline.operational_tokens),
    latency_delta_ms: latencyDelta,
    latency_delta_percent: percentDelta(next.latency_ms, baseline.latency_ms),
    changed_line_delta: next.changed_lines - baseline.changed_lines,
    intervention_delta: next.intervention_count - baseline.intervention_count,
    path_violation_delta: next.path_violation_count - baseline.path_violation_count
  };
}

function processDecision(pairs, thresholds) {
  if (pairs.some((entry) => !entry.blind_available)) return { decision: "inconclusive", action: "repair blind evaluation before changing the framework" };
  if (pairs.some((entry) => entry.objective_direction === "baseline-only-pass")) return { decision: "redesign", action: "inspect the Temple-only correctness loss before another comparison" };
  if (pairs.some((entry) => entry.objective_direction === "next-only-pass")) return { decision: "retain-with-measurement", action: "retain the process provisionally and expand the correctness result to more cases" };
  const qualified = pairs.filter((entry) => entry.qualified);
  if (qualified.length === 0) return { decision: "inconclusive", action: "repair task guidance or cases before comparing process resources" };
  const tokenMedian = median(qualified.map((entry) => entry.operational_token_delta_percent));
  const latencyMedian = median(qualified.map((entry) => entry.latency_delta_percent));
  const qualityMedian = median(qualified.map((entry) => entry.quality_delta_points));
  const nonInferior = qualified.every((entry) => entry.quality_non_inferior);
  if (!nonInferior) return { decision: "redesign", action: "simplify or correct the Lean Core Path before another comparison" };
  if (qualityMedian > thresholds.quality_non_inferiority_points) return { decision: "retain", action: "retain the process and expand to a broader task family" };
  if (tokenMedian > thresholds.meaningful_operational_token_reduction_percent && qualityMedian <= thresholds.quality_non_inferiority_points) {
    return { decision: "simplify-and-rerun", action: "reduce non-contributing Temple context and rerun the same frozen cases" };
  }
  if (qualified.length !== pairs.length) return { decision: "inconclusive", action: "keep the process provisional; the quality-excluded case prevents a complete process comparison" };
  return { decision: "retain-with-measurement", action: "keep the process provisional and expand the diagnostic sample" };
}

function routeDecision(pairs, thresholds) {
  if (pairs.some((entry) => !entry.blind_available)) return { decision: "inconclusive", action: "repair blind evaluation; keep routing advisory" };
  if (pairs.some((entry) => entry.objective_direction === "baseline-only-pass") || pairs.some((entry) => entry.quality_non_inferior === false)) {
    return { decision: "redesign", action: "keep routing advisory and revise the bounded-quality rule" };
  }
  const correctnessWins = pairs.filter((entry) => entry.objective_direction === "next-only-pass").length;
  const qualified = pairs.filter((entry) => entry.qualified);
  if (correctnessWins > 0) {
    const resourceRegressions = qualified.some((entry) =>
      entry.operational_token_delta_percent >= thresholds.meaningful_operational_token_reduction_percent ||
      entry.latency_delta_percent >= thresholds.meaningful_latency_reduction_percent);
    return resourceRegressions
      ? { decision: "redesign", action: "preserve Luna Max as an advisory escalation, but split the broad bounded-quality rule so easy bounded work stays on Terra" }
      : { decision: "retain-advisory", action: "retain the route as advisory and test the correctness win on more cases" };
  }
  if (qualified.length !== pairs.length) return { decision: "inconclusive", action: "keep routing advisory; too few pairs qualify for a route decision" };
  const tokenMedian = median(qualified.map((entry) => entry.operational_token_delta_percent));
  const latencyMedian = median(qualified.map((entry) => entry.latency_delta_percent));
  const improvesTokens = tokenMedian <= -thresholds.meaningful_operational_token_reduction_percent;
  const improvesLatency = latencyMedian <= -thresholds.meaningful_latency_reduction_percent;
  const worsensTokens = tokenMedian >= thresholds.meaningful_operational_token_reduction_percent;
  const worsensLatency = latencyMedian >= thresholds.meaningful_latency_reduction_percent;
  if ((improvesTokens || improvesLatency) && !(worsensTokens || worsensLatency)) {
    return { decision: "retain-advisory", action: "retain the route as advisory and test more task families before automation" };
  }
  if (worsensTokens || worsensLatency) return { decision: "redesign", action: "revise the route or reasoning profile before another pilot" };
  return { decision: "neutral", action: "keep routing advisory; the pilot found no meaningful resource advantage" };
}

export function analyzeEffectivenessPilot(source, protocol) {
  if (source?.schema_version !== "temple.effectiveness-pilot-evidence/v1") throw new Error("unsupported effectiveness evidence schema");
  if (protocol?.schema_version !== "temple.effectiveness-pilot/v1") throw new Error("unsupported effectiveness protocol schema");
  if (!Array.isArray(source.candidates) || source.candidates.length !== 6) throw new Error("exactly six candidates are required");
  source.candidates.forEach(validateCandidate);
  const byKey = new Map();
  for (const candidate of source.candidates) {
    const key = `${candidate.case_id}\0${candidate.condition_id}`;
    if (byKey.has(key)) throw new Error(`duplicate candidate ${key}`);
    byKey.set(key, candidate);
  }
  const caseIds = protocol.cases.map((entry) => entry.id);
  const thresholds = protocol.decision_thresholds;
  const processPairs = caseIds.map((caseId) => pairFor(caseId, byKey, "conventional-fixed", "temple-fixed", thresholds));
  const routePairs = caseIds.map((caseId) => pairFor(caseId, byKey, "temple-fixed", "temple-adaptive", thresholds));
  const aggregate = {
    candidate_gross_tokens: source.candidates.reduce((total, entry) => total + entry.gross_tokens, 0),
    candidate_operational_tokens: source.candidates.reduce((total, entry) => total + entry.operational_tokens, 0),
    candidate_latency_ms: source.candidates.reduce((total, entry) => total + entry.latency_ms, 0),
    evaluator_gross_tokens: source.evaluator?.usage?.total_tokens ?? null,
    evaluator_operational_tokens: source.evaluator?.usage
      ? source.evaluator.usage.input_tokens - source.evaluator.usage.cached_input_tokens + source.evaluator.usage.output_tokens
      : null,
    retry_count: source.candidates.reduce((total, entry) => total + entry.retry_count, 0),
    fallback_count: source.candidates.reduce((total, entry) => total + entry.fallback_count, 0),
    intervention_count: source.candidates.reduce((total, entry) => total + entry.intervention_count, 0),
    path_violation_count: source.candidates.reduce((total, entry) => total + entry.path_violation_count, 0)
  };
  aggregate.combined_gross_tokens = aggregate.evaluator_gross_tokens === null ? null : aggregate.candidate_gross_tokens + aggregate.evaluator_gross_tokens;
  aggregate.combined_operational_tokens = aggregate.evaluator_operational_tokens === null ? null : aggregate.candidate_operational_tokens + aggregate.evaluator_operational_tokens;
  const summarize = (pairs) => ({
    qualified_pairs: pairs.filter((entry) => entry.qualified).length,
    next_only_correctness_wins: pairs.filter((entry) => entry.objective_direction === "next-only-pass").length,
    baseline_only_correctness_wins: pairs.filter((entry) => entry.objective_direction === "baseline-only-pass").length,
    both_failed_pairs: pairs.filter((entry) => entry.objective_direction === "both-fail").length,
    median_quality_delta_points: median(pairs.filter((entry) => entry.quality_delta_points !== null).map((entry) => entry.quality_delta_points)),
    median_operational_token_delta_percent: median(pairs.filter((entry) => entry.qualified).map((entry) => entry.operational_token_delta_percent)),
    median_latency_delta_percent: median(pairs.filter((entry) => entry.qualified).map((entry) => entry.latency_delta_percent))
  });
  return {
    schema_version: "temple.effectiveness-pilot-analysis/v1",
    work_item_id: "WI-0130",
    validity: {
      status: source.candidates.every((entry) => Number.isInteger(entry.blind_score))
        ? [...processPairs, ...routePairs].every((entry) => entry.qualified)
          ? "diagnostic-complete"
          : "diagnostic-complete-with-quality-exclusions"
        : "diagnostic-incomplete",
      case_count: caseIds.length,
      candidate_count: source.candidates.length,
      statistical_qualification: false,
      generalizable: false
    },
    aggregate,
    process_effect: { comparison: "temple-fixed minus conventional-fixed", pairs: processPairs, summary: summarize(processPairs), recommendation: processDecision(processPairs, thresholds) },
    route_effect: { comparison: "temple-adaptive minus temple-fixed", pairs: routePairs, summary: summarize(routePairs), recommendation: routeDecision(routePairs, thresholds) },
    claims: {
      bounded_task_family_diagnostic: true,
      temple_superiority_proven: false,
      automatic_routing_authorized: false,
      billed_cost_known: false
    }
  };
}

async function main(argv) {
  const options = Object.create(null);
  for (let index = 0; index < argv.length; index += 2) options[argv[index]] = argv[index + 1];
  if (!options["--input"] || !options["--protocol"] || !options["--output"]) throw new Error("--input, --protocol, and --output are required");
  const source = JSON.parse(await fs.readFile(path.resolve(options["--input"]), "utf8"));
  const protocol = JSON.parse(await fs.readFile(path.resolve(options["--protocol"]), "utf8"));
  const result = analyzeEffectivenessPilot(source, protocol);
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
