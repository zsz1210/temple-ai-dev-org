import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { durableAtomicWrite, durableAtomicCreate, formatJson, sha256 } from "./files.mjs";
import { isWorkItemId } from "./ids.mjs";
import { loadProjectContext, uniqueStrings } from "./project.mjs";
import { agentIsEligible, readCollaborationState, sponsoredPrincipal } from "./collaboration.mjs";
import { assertLocalActorBinding } from "./local-identity.mjs";
import { assessWorkflowProfile, workflowProfileForItem } from "./workflow.mjs";
import { resolveGitRevision, validateEvidenceArtifacts, validateEvidenceRegistry } from "./evidence.mjs";
import { activeExecutionRequirements, readWorkItem, prepareHandoff, prepareClaimRelease, prepareWorkItemTransition } from "./work-items.mjs";
import { leanDeliveryStateDirectory, readPendingLeanDelivery } from "./lean-delivery-state.mjs";
import { OperationError } from "./operation-errors.mjs";

const OPERATION = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;
const JOURNAL_SCHEMA = "temple.lean-delivery-journal/v1";
const RECEIPT_SCHEMA = "temple.lean-delivery-receipt/v1";
const EVENTS = ".ai-org/events/events.jsonl";

function safeRelative(value) {
  return typeof value === "string" && value.length > 0 && value !== "." && value !== ".." &&
    !path.isAbsolute(value) && !path.win32.isAbsolute(value) && !value.includes("\\") &&
    !value.includes("\0") && !value.startsWith("../") && path.posix.normalize(value) === value;
}

async function fileBytes(target, relative, allowMissing = false) {
  if (!safeRelative(relative)) throw new Error(`Unsafe Lean delivery path: ${relative}`);
  let current = target;
  const parts = relative.split("/");
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    let stat;
    try { stat = await fs.lstat(current); } catch (error) {
      if (allowMissing && error.code === "ENOENT") return null;
      if (error.code === "ENOENT") throw new Error(`Lean delivery input is missing: ${relative}`);
      throw error;
    }
    if (stat.isSymbolicLink() || (index < parts.length - 1 ? !stat.isDirectory() : !stat.isFile())) {
      throw new Error(`Lean delivery requires regular repository files: ${relative}`);
    }
  }
  return fs.readFile(current);
}

const hashBytes = (bytes) => bytes === null ? null : sha256(bytes);

function normalizedRequest(target, options) {
  if (!isWorkItemId(options.workItemId)) throw new OperationError("INVALID_INPUT", "Lean delivery requires a valid --work-item");
  if (!OPERATION.test(options.operationId ?? "")) throw new OperationError("INVALID_INPUT", "--operation-id must be 1-64 letters, digits, underscores, or hyphens");
  if (options.expectedPlan !== undefined && !/^[a-f0-9]{64}$/.test(options.expectedPlan)) throw new OperationError("INVALID_INPUT", "--expected-plan must be a SHA-256 digest");
  for (const key of ["claimId", "agentId", "principalId", "revision"]) {
    if (typeof options[key] !== "string" || !options[key].trim()) throw new OperationError("INVALID_INPUT", `Lean delivery requires ${key}`);
  }
  const request = {
    schema_version: "temple.lean-delivery-request/v1",
    operation_id: options.operationId,
    work_item_id: options.workItemId,
    claim_id: options.claimId.trim(),
    agent_id: options.agentId.trim(),
    principal_id: options.principalId.trim(),
    candidate_revision: resolveGitRevision(target, options.revision),
    completed: uniqueStrings(options.completed),
    evidence: uniqueStrings(options.evidence),
    unresolved: uniqueStrings(options.unresolved)
  };
  if (!request.completed.length || !request.evidence.length) throw new OperationError("INVALID_INPUT", "Lean delivery requires --completed and --evidence");
  return request;
}

function git(target, args) {
  const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (result.status !== 0) throw new Error(result.stderr.trim() || "Git inspection failed");
  return result.stdout;
}

function assertCandidate(target, request, affectedPaths) {
  if (resolveGitRevision(target, "HEAD") !== request.candidate_revision) throw new Error("Lean delivery candidate must match current HEAD");
  const productPaths = affectedPaths.filter((entry) => !entry.startsWith(".ai-org/"));
  if (!productPaths.length) throw new Error("Lean delivery requires a declared affected product scope");
  if (git(target, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...productPaths])) {
    throw new Error("Lean delivery affected product scope has uncommitted changes");
  }
}

async function inputSnapshot(target, item, request) {
  const paths = new Set([
    "temple.lock", ".ai-org/project/project.json", ".ai-org/project/agents.json",
    ".ai-org/project/assignments.json", ".ai-org/project/collaboration.json",
    ".ai-org/project/spec-index.json", ".ai-org/project/evidence.json",
    ".ai-org/project/runtime-workers.json", ".ai-org/project/resources.json",
    ".ai-org/core/positions.json", ".ai-org/core/workflow.json", ".ai-org/core/policies.json",
    `.ai-org/work-items/${item.id}.json`, EVENTS
  ]);
  for (const relative of await currentEvidencePaths(target, item, request)) paths.add(relative);
  const specs = JSON.parse(await fileBytes(target, ".ai-org/project/spec-index.json"));
  const ids = new Set([...(item.spec_refs ?? []), ...(item.ux_refs ?? []), ...(item.ui_refs ?? []), ...(item.contract_refs ?? [])].map((entry) => entry.id));
  for (const entry of specs.entries ?? []) {
    if (!ids.has(entry.id)) continue;
    if (entry.source?.kind === "repository") paths.add(entry.source.location);
    if (entry.approval_ref && safeRelative(entry.approval_ref)) paths.add(entry.approval_ref);
  }
  const inputs = [];
  for (const relative of [...paths].sort()) {
    const optional = relative.endsWith("runtime-workers.json") || relative.endsWith("resources.json");
    inputs.push({ path: relative, sha256: hashBytes(await fileBytes(target, relative, optional)) });
  }
  return inputs;
}

async function currentEvidencePaths(target, item, request) {
  const paths = new Set();
  const registry = JSON.parse(await fileBytes(target, ".ai-org/project/evidence.json"));
  const refs = uniqueStrings([...request.evidence, ...Object.values(item.gate_evidence ?? {}).flat()]);
  for (const reference of refs) {
    if (reference.startsWith("EVID-")) {
      const entry = registry.entries?.find((value) => value.id === reference);
      if (!entry || entry.work_item_id !== item.id || entry.invalidated_at || (entry.expires_at && Date.parse(entry.expires_at) <= Date.now())) {
        throw new Error(`Lean delivery evidence is unavailable or not current: ${reference}`);
      }
      const structure = validateEvidenceRegistry({ schema_version: registry.schema_version, entries: [entry] });
      if (!structure.valid) throw new Error(`Invalid Lean delivery evidence: ${structure.errors.join("; ")}`);
      if (request.evidence.includes(reference) && entry.scope_revision && entry.scope_revision !== request.candidate_revision) {
        throw new Error(`Lean delivery evidence revision does not match candidate: ${reference}`);
      }
      const validation = await validateEvidenceArtifacts(target, { entries: [entry] });
      if (!validation.valid) throw new Error(validation.errors.join("; "));
      for (const artifact of entry.artifacts ?? []) paths.add(artifact.path);
    } else if (safeRelative(reference) && !/^[a-z][a-z0-9+.-]*:/i.test(reference)) paths.add(reference);
    else throw new Error(`Lean delivery requires local or normalized evidence: ${reference}`);
  }
  return paths;
}

async function assertInputs(target, inputs, writes = []) {
  const outputs = new Map(writes.map((entry) => [entry.path, entry]));
  for (const input of inputs) {
    if (outputs.has(input.path)) continue;
    if (hashBytes(await fileBytes(target, input.path, input.sha256 === null)) !== input.sha256) {
      throw new Error(`Lean delivery input changed: ${input.path}`);
    }
  }
  for (const write of writes) {
    const actual = hashBytes(await fileBytes(target, write.path, true));
    if (actual !== write.before_sha256 && actual !== write.after_sha256) {
      throw new Error(`Lean delivery output changed unexpectedly: ${write.path}`);
    }
  }
}

async function prepareDelivery(target, request) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, request.work_item_id);
  if (item.state !== "build" || item.owner_position !== "developer" || workflowProfileForItem(context.workflow, item) !== "lean") {
    throw new Error("Lean delivery requires a Lean Work Item at Developer Build");
  }
  const assessment = assessWorkflowProfile(context.workflow, {
    requestedProfile: "lean", riskTier: item.risk_tier,
    scopeClass: item.profile_assessment?.scope_class,
    escalationTriggers: item.profile_assessment?.escalation_triggers,
    collaborationProfile: (await readCollaborationState(target)).profile
  });
  if (assessment.effective_profile !== "lean" || item.risk_tier !== "low" || item.profile_assessment?.scope_class !== "bounded" || item.ui_delivery_mode !== "not-applicable") {
    throw new Error("Lean delivery requires low-risk bounded work with no interface delivery");
  }
  if (item.claim?.status !== "active" || item.claim.id !== request.claim_id || item.claim.agent_id !== request.agent_id || item.claim.principal_id !== request.principal_id) {
    throw new Error("Lean delivery actor or active claim does not match request");
  }
  const collaboration = await readCollaborationState(target);
  if (!context.agents.has(request.agent_id) || context.agents.get(request.agent_id).active === false || !agentIsEligible(collaboration, request.agent_id, "developer", activeExecutionRequirements(item, "build").disciplines)) {
    throw new Error("Lean delivery Agent is not eligible for Developer");
  }
  if (collaboration.profile !== "solo") {
    if (sponsoredPrincipal(collaboration, request.agent_id) !== request.principal_id) throw new Error("Lean delivery Principal does not sponsor Agent");
    await assertLocalActorBinding(target, request.principal_id);
  }
  const workers = await fileBytes(target, ".ai-org/project/runtime-workers.json", true);
  if (workers && (JSON.parse(workers).workers ?? []).some((worker) => worker.work_item_id === item.id && !["completed", "failed", "cancelled"].includes(worker.status))) {
    throw new Error("Complete the runtime worker before Lean delivery");
  }
  assertCandidate(target, request, item.affected_paths ?? []);
  const inputs = await inputSnapshot(target, item, request);
  const handoff = await prepareHandoff(target, {
    workItemId: item.id, toPosition: "quality_evaluator", inputRevision: request.candidate_revision,
    completed: request.completed, evidence: request.evidence, unresolved: request.unresolved, actor: request.agent_id
  });
  const released = await prepareClaimRelease(target, {
    workItemId: item.id, agentId: request.agent_id, principalId: request.principal_id, reason: "developer_delivery"
  }, handoff.item);
  const transition = await prepareWorkItemTransition(target, {
    workItemId: item.id, toState: "test", actor: request.agent_id,
    satisfied: { developer_handoff: [handoff.artifact], developer_evidence: request.evidence }
  }, handoff.item, new Map([[handoff.artifact, handoff.content]]));
  // Validate transition while the originating actor still owns its active claim,
  // then retain the separately validated release fact in the final state.
  transition.item.claim = released.item.claim;
  transition.item.claims = released.item.claims;
  const receiptPath = `.ai-org/artifacts/${item.id}/delivery-${request.operation_id}.json`;
  const outputPaths = [handoff.artifact, `.ai-org/work-items/${item.id}.json`, EVENTS, receiptPath];
  const requestDigest = sha256(formatJson(request));
  const planDigest = sha256(formatJson({ request, inputs, output_paths: outputPaths, affected_paths: item.affected_paths }));
  const result = {
    schema_version: "temple.lean-delivery-result/v1", operation_id: request.operation_id,
    work_item_id: item.id, candidate_revision: request.candidate_revision,
    plan_digest: planDigest, handoff: handoff.artifact, receipt: receiptPath,
    resulting_state: "test", next_action: "The assigned Quality Evaluator must claim Test and verify acceptance.",
    testing_performed: false, external_action_performed: false
  };
  const receipt = { schema_version: RECEIPT_SCHEMA, request_digest: requestDigest, request, result, applied_at: transition.item.updated_at };
  const beforeEvents = (await fileBytes(target, EVENTS)).toString("utf8");
  const events = [...handoff.events, ...released.events, ...transition.events];
  const contents = [handoff.content, formatJson(transition.item), `${beforeEvents}${beforeEvents && !beforeEvents.endsWith("\n") ? "\n" : ""}${events.map((event) => JSON.stringify(event)).join("\n")}\n`, formatJson(receipt)];
  const writes = [];
  for (let index = 0; index < outputPaths.length; index++) {
    const before = await fileBytes(target, outputPaths[index], true);
    if ((index === 0 || index === 3) && before !== null) throw new Error(`Lean delivery output already exists: ${outputPaths[index]}`);
    writes.push({ path: outputPaths[index], before_sha256: hashBytes(before), after_sha256: sha256(contents[index]), content: contents[index] });
  }
  // Ensure all preparation reads still describe the original snapshot.
  await assertInputs(target, inputs);
  return { request, request_digest: requestDigest, plan_digest: planDigest, inputs, writes, result, affected_paths: item.affected_paths };
}

function validateJournal(journal, target, request) {
  if (journal.schema_version !== JOURNAL_SCHEMA || journal.target !== target || journal.request_digest !== sha256(formatJson(request)) || journal.operation_key !== `${request.work_item_id}/${request.operation_id}`) {
    throw new Error("Lean delivery pending request conflicts with this operation");
  }
  const allowed = [journal.result?.handoff, `.ai-org/work-items/${request.work_item_id}.json`, EVENTS, `.ai-org/artifacts/${request.work_item_id}/delivery-${request.operation_id}.json`];
  if (!new RegExp(`^\\.ai-org/artifacts/${request.work_item_id}/handoff-[0-9]+-developer-to-quality_evaluator\\.md$`).test(allowed[0] ?? "") || !Array.isArray(journal.writes) || journal.writes.length !== 4) throw new Error("Invalid Lean delivery journal outputs");
  for (let index = 0; index < allowed.length; index++) {
    const entry = journal.writes[index];
    if (entry.path !== allowed[index] || typeof entry.content !== "string" || sha256(entry.content) !== entry.after_sha256) throw new Error("Invalid Lean delivery journal digest or path");
  }
  if (!Array.isArray(journal.inputs) || !Array.isArray(journal.affected_paths)) throw new Error("Invalid Lean delivery journal inputs");
}

async function applyJournal(target, directory, journal, { checkpoint } = {}) {
  const collaboration = await readCollaborationState(target);
  if (collaboration.profile !== "solo") await assertLocalActorBinding(target, journal.request.principal_id);
  // Time-dependent expiry must be checked again even when input bytes match.
  const resultingItem = JSON.parse(journal.writes[1].content);
  if (!agentIsEligible(collaboration, journal.request.agent_id, "developer", activeExecutionRequirements(resultingItem, "build").disciplines)) {
    throw new Error("Lean delivery Agent is no longer eligible for Developer");
  }
  await currentEvidencePaths(target, resultingItem, journal.request);
  assertCandidate(target, journal.request, journal.affected_paths);
  await assertInputs(target, journal.inputs, journal.writes);
  for (let index = 0; index < journal.writes.length; index++) {
    const write = journal.writes[index];
    const actual = hashBytes(await fileBytes(target, write.path, true));
    if (actual === write.after_sha256) continue;
    if (actual !== write.before_sha256) throw new Error(`Lean delivery output changed: ${write.path}`);
    if (actual === null) await durableAtomicCreate(path.join(target, write.path), write.content);
    else await durableAtomicWrite(path.join(target, write.path), write.content);
    await checkpoint?.(`write-${index + 1}`);
  }
  await fs.unlink(path.join(directory, "pending.json"));
}

// Call while holding the project mutation lock. Checkpoints are test-only injection,
// never CLI/environment options and never authority to bypass validation.
async function executeDelivery(target, options, hooks, state) {
  target = await fs.realpath(target);
  const request = normalizedRequest(target, options);
  const operationKey = `${request.work_item_id}/${request.operation_id}`;
  const pending = await readPendingLeanDelivery(target);
  if (pending) {
    state.phase = "pending_recovery";
    validateJournal(pending.journal, target, request);
    if (options.expectedPlan && options.expectedPlan !== pending.journal.plan_digest) throw new OperationError("STALE_PREVIEW", "Stale Lean delivery preview");
    if (options.dryRun) return { ...pending.journal.result, status: "recovery_required", dry_run: true };
    await applyJournal(target, pending.directory, pending.journal, hooks);
    return { ...pending.journal.result, status: "resumed", dry_run: false };
  }
  const receiptPath = `.ai-org/artifacts/${request.work_item_id}/delivery-${request.operation_id}.json`;
  const existing = await fileBytes(target, receiptPath, true);
  if (existing) {
    const receipt = JSON.parse(existing);
    if (receipt.schema_version !== RECEIPT_SCHEMA || receipt.request_digest !== sha256(formatJson(request)) || receipt.request_digest !== sha256(formatJson(receipt.request))) throw new Error("Lean delivery operation ID conflicts with an existing receipt");
    if (options.expectedPlan && options.expectedPlan !== receipt.result?.plan_digest) throw new OperationError("STALE_PREVIEW", "Stale Lean delivery preview");
    return { ...receipt.result, status: "already_applied", dry_run: Boolean(options.dryRun) };
  }
  const plan = await prepareDelivery(target, request);
  if (options.expectedPlan && options.expectedPlan !== plan.plan_digest) throw new OperationError("STALE_PREVIEW", "Stale Lean delivery preview");
  if (options.dryRun) return { ...plan.result, status: "ready", dry_run: true };
  const directory = await leanDeliveryStateDirectory(target, true);
  const journal = { schema_version: JOURNAL_SCHEMA, target, operation_key: operationKey, ...plan };
  state.phase = "unknown";
  await fs.mkdir(directory, { recursive: true });
  await durableAtomicCreate(path.join(directory, "pending.json"), formatJson(journal));
  state.phase = "pending_recovery";
  await hooks.checkpoint?.("journal");
  await applyJournal(target, directory, journal, hooks);
  return { ...plan.result, status: "applied", dry_run: false };
}

export async function deliverLeanWorkItem(target, options, hooks = {}) {
  const state = { phase: "not_started" };
  try {
    return await executeDelivery(target, options, hooks, state);
  } catch (error) {
    if (error instanceof OperationError) {
      error.mutationStatus = state.phase;
      throw error;
    }
    throw new OperationError(state.phase === "not_started" ? "GUARD_REJECTED" : "EXECUTION_UNCERTAIN", error.message, state.phase, error);
  }
}
