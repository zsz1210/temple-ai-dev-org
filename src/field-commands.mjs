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

function output(parsed, result) {
  if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`${parsed.command} ${parsed.action}: ${result.status ?? result.cache_status ?? (result.valid === false ? "needs attention" : "complete")}`);
    if (result.reason) console.log(`Reason: ${result.reason}`);
    if (result.next_action) console.log(`Next action: ${result.next_action}`);
    console.log(JSON.stringify(result, null, 2));
  }
  return result.valid === false || result.applicable === false || result.ready === false ||
    result.successful === false || result.result?.successful === false || result.status === "conflict" || result.result?.outcome === "fail" ? 1 : 0;
}

/** CLI entrypoints for field remediation; no command infers hosting authority. */
export async function runFieldCommand(parsed) {
  const allowedByAction = {
    "measurement capabilities": [], "measurement inspect": ["--config"], "measurement run": ["--config"],
    "collaboration readiness": ["--principal-id", "--agent-id", "--work-item", "--position"],
    "collaboration preview-profile": ["--profile", "--actor-policy"],
    "collaboration apply-profile": ["--profile", "--actor-policy", "--fingerprint"],
    "collaboration setup-contributor": ["--config"],
    "evidence durability": ["--work-item", "--revision"], "evidence export-bundle": ["--evidence", "--output"],
    "evidence verify-bundle": ["--bundle"], "evidence import-bundle": ["--bundle"],
    "reconcile preview": ["--config"], "reconcile apply": ["--config", "--fingerprint"], "reconcile recover": ["--transaction-id"]
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
    else throw new OperationError("INVALID_INPUT", "Use measurement capabilities, inspect or run");
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
        if (applied.views_rebuild_required) {
          const { writeStatus } = await import("./status.mjs");
          const { writeCapabilityRegistry } = await import("./context.mjs");
          await writeCapabilityRegistry(target);
          await writeStatus(target);
        }
        return applied;
      });
    } else if (action === "recover") result = await withProjectMutationLock(target, () =>
      recoverReconciliation(target, { transactionId: required(parsed, "--transaction-id"), action: "rollback" }), { reconciliationRecovery: true });
    else throw new OperationError("INVALID_INPUT", "Use reconcile preview, apply or recover");
  }
  if (!result) throw new OperationError("INVALID_INPUT", "Unsupported field operation");
  return output(parsed, result);
}
