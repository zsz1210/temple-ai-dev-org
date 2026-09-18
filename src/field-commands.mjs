import path from "node:path";
import { assertSafeTarget, readJson } from "./files.mjs";
import { withProjectMutationLock } from "./project.mjs";
import { OperationError } from "./operation-errors.mjs";

function required(parsed, name) {
  const value = parsed.options[name];
  if (!value || Array.isArray(value)) throw new OperationError("INVALID_INPUT", `${name} is required exactly once`);
  return value;
}

async function input(parsed, name = "--config") {
  return readJson(path.resolve(required(parsed, name)));
}

async function rebuildReconciliationViews(target, result) {
  if (!result.views_rebuild_required) return result;
  try {
    const { inspectParallelPlan, buildParallelPlan, writeParallelPlan } = await import("./orchestration.mjs");
    const existing = await inspectParallelPlan(target);
    if (!existing.valid) throw new Error(`Existing parallel plan is invalid: ${existing.errors.join("; ")}`);
    if (existing.installed) await writeParallelPlan(target, await buildParallelPlan(target, {
      parentWorkItemId: existing.plan.scope.parent_work_item_id ?? undefined, maxWorkers: existing.plan.max_workers
    }));
    const { buildStatus, writeStatus } = await import("./status.mjs");
    const { buildCapabilityRegistry, writeCapabilityRegistry } = await import("./context.mjs");
    const registry = await buildCapabilityRegistry(target);
    const status = await buildStatus(target, { capabilityRegistry: registry });
    await writeCapabilityRegistry(target, registry);
    await writeStatus(target, status);
    return { ...result, views_rebuilt: true, views_rebuild_required: false,
      next_action: "Run Doctor and assess candidate acceptance separately; no work was dispatched." };
  } catch (error) {
    return { ...result, valid: false, code: "RECONCILIATION_VIEWS_FAILED", views_rebuilt: false,
      errors: [...(result.errors ?? []), error.message],
      next_action: "Canonical mutation status is reported separately. Repair the named generated-view condition, then run reconcile refresh-views; do not repeat the original apply or discard canonical records." };
  }
}

function output(parsed, result) {
  if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`${parsed.command} ${parsed.action}: ${result.status ?? result.cache_status ?? (result.valid === false ? "needs attention" : "complete")}`);
    if (result.reason) console.log(`Reason: ${result.reason}`);
    if (result.next_action) console.log(`Next action: ${result.next_action}`);
    console.log(JSON.stringify(result, null, 2));
  }
  return result.valid === false || result.applicable === false || result.ready === false || result.task_ready === false ||
    result.successful === false || result.result?.successful === false || result.status === "conflict" || result.result?.outcome === "fail" ? 1 : 0;
}

/** CLI entrypoints for field remediation; no command infers hosting authority. */
export async function runFieldCommand(parsed) {
  const allowedByAction = {
    "measurement capabilities": [], "measurement inspect": ["--config"], "measurement run": ["--config"],
    "measurement report": ["--config", "--work-item", "--revision", "--output"],
    "collaboration readiness": ["--principal-id", "--agent-id", "--work-item", "--position"],
    "collaboration preview-profile": ["--profile", "--actor-policy"],
    "collaboration apply-profile": ["--profile", "--actor-policy", "--fingerprint"],
    "collaboration setup-contributor": ["--config"],
    "evidence durability": ["--work-item", "--revision"], "evidence export-bundle": ["--evidence", "--output"],
    "evidence verify-bundle": ["--bundle"], "evidence import-bundle": ["--bundle"],
    "reconcile preview": ["--config"], "reconcile apply": ["--config", "--fingerprint"], "reconcile recover": ["--transaction-id"],
    "reconcile refresh-views": []
  };
  const allowed = new Set(["--json", ...(allowedByAction[`${parsed.command} ${parsed.action}`] ?? [])]);
  for (const flag of [...Object.keys(parsed.options), ...parsed.flags]) {
    if (!allowed.has(flag)) throw new OperationError("INVALID_INPUT", `Unsupported ${parsed.command} ${parsed.action} option: ${flag}`);
  }
  const target = await assertSafeTarget(parsed.target);
  const action = parsed.action;
  let result;
  if (parsed.command === "measurement") {
    const { measurementCapabilities, inspectMeasurement, runMeasurement } = await import("./verification.mjs");
    if (action === "capabilities") result = measurementCapabilities();
    else if (action === "inspect") result = await inspectMeasurement(target, await input(parsed));
    else if (action === "run") result = await runMeasurement(target, await input(parsed));
    else if (action === "report") {
      const { measurementReport } = await import("./measurement-report.mjs");
      result = await measurementReport(target, await input(parsed), { workItemId: required(parsed, "--work-item"),
        revision: required(parsed, "--revision"), output: parsed.options["--output"] });
    } else throw new OperationError("INVALID_INPUT", "Use measurement capabilities, inspect, run or report");
  } else if (parsed.command === "collaboration") {
    const { contributorReadiness, previewCollaborationTransition, applyCollaborationTransition, setupContributor } = await import("./collaboration.mjs");
    const options = { profile: parsed.options["--profile"], actorPolicy: parsed.options["--actor-policy"],
      principalId: parsed.options["--principal-id"], agentId: parsed.options["--agent-id"],
      workItemId: parsed.options["--work-item"], positionId: parsed.options["--position"] };
    if (action === "readiness") result = await contributorReadiness(target, options);
    else if (action === "preview-profile") result = await previewCollaborationTransition(target, options);
    else if (action === "apply-profile") result = await withProjectMutationLock(target, () =>
      applyCollaborationTransition(target, { ...options, fingerprint: required(parsed, "--fingerprint") }));
    else if (action === "setup-contributor") {
      const config = await input(parsed);
      result = await withProjectMutationLock(target, () => setupContributor(target, config));
    }
  } else if (parsed.command === "evidence") {
    const { inspectEvidenceDurability, exportEvidenceBundle, verifyEvidenceBundle, importEvidenceBundle } = await import("./evidence-bundle.mjs");
    if (action === "durability") result = await inspectEvidenceDurability(target, {
      workItemIds: parsed.options["--work-item"] ? [parsed.options["--work-item"]] : undefined,
      candidateRevision: parsed.options["--revision"] });
    else if (action === "export-bundle") {
      const value = parsed.options["--evidence"];
      const evidenceIds = value ? (Array.isArray(value) ? value : [value]) : [];
      result = await exportEvidenceBundle(target, { evidenceIds, outputPath: parsed.options["--output"] });
    } else if (action === "verify-bundle") result = await verifyEvidenceBundle(await input(parsed, "--bundle"), { target });
    else if (action === "import-bundle") {
      const bundle = await input(parsed, "--bundle");
      result = await withProjectMutationLock(target, () => importEvidenceBundle(target, bundle));
    }
  } else if (parsed.command === "reconcile") {
    const { previewReconciliation, applyReconciliation, recoverReconciliation } = await import("./reconciliation.mjs");
    if (action === "preview") result = await previewReconciliation(target, await input(parsed));
    else if (action === "apply") {
      const preview = await input(parsed);
      result = await withProjectMutationLock(target, async () => {
        const applied = await applyReconciliation(target, preview, { expectedFingerprint: required(parsed, "--fingerprint") });
        return applied.valid ? rebuildReconciliationViews(target, applied) : applied;
      });
    } else if (action === "recover") result = await withProjectMutationLock(target, async () => {
      const recovered = await recoverReconciliation(target, { transactionId: required(parsed, "--transaction-id"), action: "rollback" });
      return recovered.valid ? rebuildReconciliationViews(target, recovered) : recovered;
    }, { reconciliationRecovery: true });
    else if (action === "refresh-views") result = await withProjectMutationLock(target, () => rebuildReconciliationViews(target, {
      valid: true, errors: [], mutation_performed: false, canonical_mutation_performed: false,
      mutation_status: "unchanged", views_rebuild_required: true, acceptance_granted: false
    }));
    else throw new OperationError("INVALID_INPUT", "Use reconcile preview, apply, recover or refresh-views");
  }
  if (!result) throw new OperationError("INVALID_INPUT", "Unsupported field operation");
  return output(parsed, result);
}
