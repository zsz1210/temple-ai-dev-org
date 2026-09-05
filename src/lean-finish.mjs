import fs from "node:fs/promises";
import { executeLeanCompletion, validateLeanCompletionSnapshot, validateLeanCompletionReceipt } from "./lean-delivery.mjs";
import { readLeanFinishDiagnostics, writeLeanFinishDiagnostics } from "./lean-delivery-state.mjs";
import { buildStatus, compactStatus, writeStatus } from "./status.mjs";
import { runDoctor, compactDoctor } from "./doctor.mjs";
import { OperationError } from "./operation-errors.mjs";

// The caller holds the project mutation lock. Hooks inject failures in tests only;
// there is no shell, CLI flag or provider setting for overriding diagnostics.
export async function finishLeanWorkItem(target, options, hooks = {}) {
  target = await fs.realpath(target);
  let lifecycle;
  try {
    // Inspect all records before mutation: malformed local recovery data is not a
    // reason to invent a clean completion or overwrite another operation.
    await readLeanFinishDiagnostics(target);
    lifecycle = await executeLeanCompletion(target, options, {
      checkpoint: hooks.checkpoint,
      lifecycleApplied: async journal => {
        const records = await readLeanFinishDiagnostics(target);
        const existing = records.find(record => record.operation_key === journal.operation_key);
        if (existing && existing.journal.request_digest !== journal.request_digest) throw new Error("Lean finish diagnostic request conflicts");
        if (!existing) await writeLeanFinishDiagnostics(target, { schema_version: "temple.lean-finish-diagnostics/v1", operation_key: journal.operation_key, status: "pending", journal });
        await hooks.checkpoint?.("diagnostics-pending");
      }
    });
    if (lifecycle.dry_run) return { schema_version: "temple.lean-finish-result/v1", status: lifecycle.status, mutation: lifecycle, diagnostics: { status: "not_run" }, success: false };
    const operationKey = `${lifecycle.work_item_id}/${lifecycle.operation_id}`;
    const record = (await readLeanFinishDiagnostics(target)).find(entry => entry.operation_key === operationKey);
    if (!record || record.journal.request_digest === undefined || record.journal.result.plan_digest !== lifecycle.plan_digest) throw new Error("Lean finish diagnostic binding is missing or conflicts");
    await validateLeanCompletionReceipt(target, record.journal);
    if (record.status === "passed") return { schema_version: "temple.lean-finish-result/v1", status: "already_applied", mutation: lifecycle, diagnostics: { ...record.diagnostics, historical: true }, success: true };
    await validateLeanCompletionSnapshot(target, record.journal, { applied: true });
    const diagnostics = { status: "pending", historical: false, status_rebuild: null, doctor: null, errors: [] };
    try {
      await hooks.checkpoint?.("before-status");
      const status = await buildStatus(target, { settlingLeanFinish: operationKey });
      await writeStatus(target, status);
      diagnostics.status_rebuild = { status: "passed", result: compactStatus(status, lifecycle.work_item_id) };
      await hooks.checkpoint?.("after-status");
    } catch (error) {
      diagnostics.status_rebuild = { status: "failed" };
      diagnostics.errors.push(`Status: ${error.message}`);
    }
    try {
      await hooks.checkpoint?.("before-doctor");
      const doctor = await runDoctor(target, { settlingLeanFinish: operationKey });
      diagnostics.doctor = compactDoctor(doctor);
      if (doctor.summary.fail || doctor.summary.warn) diagnostics.errors.push("Doctor has non-passing checks");
      await hooks.checkpoint?.("after-doctor");
    } catch (error) { diagnostics.errors.push(`Doctor: ${error.message}`); }
    diagnostics.status = diagnostics.errors.length ? "failed" : "passed";
    // Recheck after diagnostics too: they are observations, never permission to
    // repair an operation whose resulting lifecycle or evidence changed.
    await validateLeanCompletionSnapshot(target, record.journal, { applied: true });
    await hooks.checkpoint?.("before-diagnostics-result");
    await writeLeanFinishDiagnostics(target, { ...record, status: diagnostics.status, diagnostics });
    await hooks.checkpoint?.("diagnostics-result");
    return { schema_version: "temple.lean-finish-result/v1", status: diagnostics.status === "passed" ? lifecycle.status : "diagnostics_failed", mutation: lifecycle, diagnostics, success: diagnostics.status === "passed" };
  } catch (error) {
    if (error instanceof OperationError) throw error;
    throw new OperationError(lifecycle ? "GUARD_REJECTED" : "EXECUTION_UNCERTAIN", error.message, lifecycle ? "applied" : "not_started", error);
  }
}
