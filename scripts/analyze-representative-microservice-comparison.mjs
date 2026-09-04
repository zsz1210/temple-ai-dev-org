function percentDelta(next, baseline) {
  if (!Number.isFinite(next) || !Number.isFinite(baseline) || baseline === 0) return null;
  return Number((((next - baseline) / baseline) * 100).toFixed(2));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function armSummary(arm, scores) {
  const turns = [arm.design, ...arm.builds, arm.integration];
  const packageScore = scores.packages.find((entry) => entry.package_id === arm.sealed.package_id);
  if (!packageScore) throw new Error(`missing frozen score for ${arm.sealed.package_id}`);
  const dimensionScore = sum(packageScore.dimensions.map((entry) => entry.score));
  return {
    arm_id: arm.arm_id,
    objective_correctness: arm.integration.objective_tests.pass,
    blind_dimension_score: dimensionScore,
    blind_dimension_total: packageScore.dimensions.length,
    critical_failure: packageScore.critical_failure,
    recovery_exact_revisions: arm.integration.recovery.exact_revision_count,
    recovery_exact_revision_total: arm.integration.recovery.exact_revision_total,
    recovery_completed_slices: arm.integration.recovery.completed_slice_count,
    recovery_completed_slice_total: arm.integration.recovery.completed_slice_total,
    boundary_violation_count: arm.sealed.boundary_violations.length,
    operational_tokens: sum(turns.map((entry) => entry.operational_tokens)),
    gross_tokens: sum(turns.map((entry) => entry.usage.total_tokens)),
    model_latency_ms: sum(turns.map((entry) => entry.elapsed_ms)),
    integration_operational_tokens: arm.integration.operational_tokens,
    integration_latency_ms: arm.integration.elapsed_ms,
    changed_lines: sum(arm.builds.flatMap((entry) => Object.values(entry.repositories).map((repository) => repository.changed_lines))),
    failed_public_slice_tests: arm.builds.flatMap((entry) => Object.values(entry.repositories)).filter((repository) => repository.public_test_exit_code !== 0).length,
    rework_actions: arm.rework_actions ?? 0,
    human_workflow_interventions: arm.human_workflow_interventions ?? 0,
    artifact_bytes: arm.sealed.artifact_bytes
  };
}

export function analyzeRepresentativeComparison({ protocol, run, evaluator, generatedAt = new Date().toISOString() }) {
  if (run?.protocol_sha256 !== protocol?.protocol_sha256 || evaluator?.protocol_sha256 !== protocol?.protocol_sha256) {
    throw new Error("analysis evidence does not match the frozen protocol");
  }
  if (run?.status !== "candidate-arms-completed" || evaluator?.status !== "completed") {
    throw new Error("analysis requires completed candidate and evaluator records");
  }
  const summaries = run.arms.map((arm) => armSummary(arm, evaluator.frozen_scores));
  const minimal = summaries.find((entry) => entry.arm_id === "minimal-responsible");
  const temple = summaries.find((entry) => entry.arm_id === "temple");
  if (!minimal || !temple || summaries.length !== 2) throw new Error("analysis requires the two registered arms exactly once");
  return {
    schema_version: "temple.representative-microservice-analysis/v1",
    work_item_id: protocol.work_item_id,
    protocol_sha256: protocol.protocol_sha256,
    generated_at: generatedAt,
    arms: summaries,
    comparison: {
      objective_correctness_delta: Number(temple.objective_correctness) - Number(minimal.objective_correctness),
      blind_dimension_score_delta: temple.blind_dimension_score - minimal.blind_dimension_score,
      recovery_exact_revision_delta: temple.recovery_exact_revisions - minimal.recovery_exact_revisions,
      boundary_violation_delta: temple.boundary_violation_count - minimal.boundary_violation_count,
      operational_token_delta_percent: percentDelta(temple.operational_tokens, minimal.operational_tokens),
      model_latency_delta_percent: percentDelta(temple.model_latency_ms, minimal.model_latency_ms),
      integration_token_delta_percent: percentDelta(temple.integration_operational_tokens, minimal.integration_operational_tokens),
      integration_latency_delta_percent: percentDelta(temple.integration_latency_ms, minimal.integration_latency_ms),
      artifact_byte_delta_percent: percentDelta(temple.artifact_bytes, minimal.artifact_bytes)
    },
    interpretation: {
      correctness_primary: true,
      statistical_generalization: false,
      automatic_routing_authority: false,
      monetary_cost_known: false,
      account_approval_count: evaluator.continuation_protocol_sha256 ? 2 : 1,
      retry_count: 0,
      fallback_count: 0
    },
    evaluator: {
      operational_tokens: evaluator.evaluator.operational_tokens,
      gross_tokens: evaluator.evaluator.usage.total_tokens,
      model: evaluator.evaluator.requested_model,
      reasoning_effort: evaluator.evaluator.requested_reasoning_effort,
      continuation_protocol_sha256: evaluator.continuation_protocol_sha256 ?? null,
      source_candidate_run_sha256: evaluator.source_candidate_run_sha256 ?? null
    }
  };
}
