// Coordinator-owned sequencing for future bounded comparisons. No provider,
// filesystem, approval consumption, retry, model choice or historical-run resume.
// Callers must bind their frozen protocol and qualify runOne/assessOne separately.
import { commandPolicyContract } from "./delivery-command-policy.mjs";
import { safeFailureCode } from "./delivery-control-pair.mjs";
const safeCount = value => Number.isSafeInteger(value) && value >= 0;
const identifier = value => typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const typedCause = value => commandPolicyContract.rules.includes(value) && !value.startsWith("allow-") ? value : safeFailureCode(value);
function stopDiagnostics(observation) {
  const first = observation?.first_stop;
  const index = safeCount(first?.event_index) && first.event_index < 2000 ? first.event_index : null;
  const event = index === null ? null : observation.events?.[index];
  const classification = event?.classification;
  return { stop_reason: observation?.stop_reason ? typedCause(observation.stop_reason) : null,
    // A caller may provide an immutable artifact digest. No arbitrary paths or
    // raw observation are copied; absence is explicit, never invented provenance.
    observation_sha256: /^sha256:[a-f0-9]{64}$/.test(observation?.observation_sha256 ?? "") ? observation.observation_sha256 : null,
    first_stop: first ? { reason: typedCause(first.reason), stage: ["build", "verify"].includes(first.stage) ? first.stage : null,
      event_index: index, item_id: /^hmac-sha256:[a-f0-9]{64}$/.test(first.item_id ?? "") ? first.item_id : null,
      argument_index: safeCount(classification?.argument_index) && classification.argument_index < commandPolicyContract.limits.arguments ? classification.argument_index : null,
      revision_category: commandPolicyContract.revision_categories.includes(classification?.revision_category) ? classification.revision_category : null
    } : null };
}

export async function runEvaluationSequence({ subjects, limits, continuation,
  beforeStage, runOne, assessOne, persist, now = Date.now }) {
  if (!Array.isArray(subjects) || !subjects.length || subjects.length > 100 ||
      subjects.some(s => !identifier(s.id)) || new Set(subjects.map(s => s.id)).size !== subjects.length ||
      !safeCount(limits?.operational_tokens) || !limits.operational_tokens || !safeCount(limits?.elapsed_ms) || !limits.elapsed_ms ||
      !continuation || typeof continuation.product_failure !== "boolean" || typeof continuation.local_invalid !== "boolean" ||
      ![beforeStage, runOne, assessOne, persist, now].every(fn => typeof fn === "function")) throw Error("invalid-sequence-contract");
  const schedule = structuredClone(subjects), budget = { ...limits }, policy = { ...continuation };
  const start = now();
  const result = { schema_version: "temple.evaluation-sequence/v1", status: "running", stages: [],
    attempted_stages: 0, operational_tokens: 0, usage_complete: true,
    usage_basis: "known-observation-subtotal-not-account-final", stop_reason: null };
  const stop = reason => { result.status = "stopped"; result.stop_reason ??= reason; };
  const save = async () => {
    result.elapsed_ms = now() - start;
    if (!Number.isFinite(result.elapsed_ms) || result.elapsed_ms < 0) stop("clock-invalid");
    // Never continue after persistence failure. The caller must preserve the
    // thrown failure; no later callback may dispatch a stage.
    await persist(structuredClone(result));
  };
  const atLimit = () => {
    const elapsed = now() - start;
    return !Number.isFinite(elapsed) || elapsed < 0 || elapsed >= budget.elapsed_ms || result.operational_tokens >= budget.operational_tokens;
  };
  const overLimit = () => {
    const elapsed = now() - start;
    return !Number.isFinite(elapsed) || elapsed < 0 || elapsed >= budget.elapsed_ms || result.operational_tokens > budget.operational_tokens;
  };
  for (const subject of schedule) {
    let build = null;
    for (const stage of ["build", "verify"]) {
      if (result.status === "stopped") break;
      if (atLimit()) { stop("aggregate-limit"); break; }
      let ready;
      try { ready = await beforeStage(structuredClone(subject), stage); }
      catch { stop("precondition-unavailable"); break; }
      if (ready?.source_unchanged !== true || ready?.isolation_confirmed !== true) { stop("shared-validity-unconfirmed"); break; }
      if (atLimit()) { stop("aggregate-limit"); break; }
      const row = { subject: subject.id, stage, status: "attempting", operational_tokens: null };
      result.stages.push(row); result.attempted_stages++;
      await save();
      if (result.status === "stopped" || atLimit()) { stop("aggregate-limit"); row.status = "not-dispatched"; result.attempted_stages--; break; }
      let observation;
      try { observation = await runOne(structuredClone(subject), stage, result.operational_tokens); }
      catch { row.status = "invalid"; result.usage_complete = false; stop("runtime-unavailable"); await save(); break; }
      row.diagnostics = stopDiagnostics(observation);
      const tokens = observation?.usage?.operational_tokens;
      if (!safeCount(tokens) || !safeCount(result.operational_tokens + tokens)) {
        row.status = "invalid"; result.usage_complete = false; stop("usage-unavailable"); await save(); break;
      }
      row.operational_tokens = tokens; result.operational_tokens += tokens;
      row.status = "observed"; await save();
      if (observation.provider_exit_confirmed !== true) { result.usage_complete = false; stop("cleanup-unconfirmed"); break; }
      if (result.status === "stopped" || overLimit()) { stop("aggregate-limit"); break; }
      // A command-policy violation, malformed wire event or unknown runtime stop
      // is not a local product failure. Never let an assessment override it.
      if (observation.status !== "completed") { row.status = "invalid"; result.usage_complete = false; stop("runtime-stopped"); break; }
      let assessment;
      try { assessment = await assessOne(structuredClone(subject), stage, ready, build, observation); }
      catch { row.status = "invalid"; stop("assessment-unavailable"); break; }
      if (assessment?.isolation_confirmed !== true || assessment?.cleanup_confirmed !== true ||
          !["passed", "product-failure", "local-invalid"].includes(assessment?.outcome) ||
          (assessment.outcome !== "local-invalid" && assessment.validity_confirmed !== true) ||
          (assessment.outcome === "local-invalid" && (assessment.failure_scope !== "subject" || assessment.shared_validity_confirmed !== true))) {
        row.status = "invalid"; stop("shared-validity-unconfirmed"); break;
      }
      row.status = assessment.outcome;
      await save();
      if (result.status === "stopped" || overLimit()) { stop("aggregate-limit"); break; }
      if (row.status !== "passed") {
        if (stage === "build") result.stages.push({ subject: subject.id, stage: "verify", status: "skipped-dependency", operational_tokens: null });
        const allowed = row.status === "product-failure" ? policy.product_failure : policy.local_invalid;
        if (!allowed) stop("continuation-not-authorized");
        // No retry or replacement. The failed sample and its cost remain.
        break;
      }
      if (stage === "build") build = structuredClone(assessment);
    }
    if (result.status === "stopped") break;
  }
  if (result.status !== "stopped") result.status = result.stages.every(row => row.status === "passed") ? "completed" : "completed-with-failures";
  await save();
  return result;
}
