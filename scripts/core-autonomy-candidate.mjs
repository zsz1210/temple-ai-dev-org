// Repository-only offline prototype. The trusted coordinator supplies canonical
// snapshots; this module never turns participant-supplied snapshots into authority.
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { realpath } from 'node:fs/promises';
import path from 'node:path';
import { assessWorkflowProfile } from '../src/workflow.mjs';
import { planEvaluation } from './evaluation-plan.mjs';

const exec = promisify(execFile);
const check = (value, message) => { if (!value) throw new Error(message); };
export const coreDigest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const revision = v => typeof v === 'string' && /^[a-f0-9]{40}$/.test(v);
const nonblank = v => typeof v === 'string' && v.trim().length > 0;
const strings = value => Array.isArray(value) && value.length > 0 && value.every(nonblank);
const ref = v => nonblank(v) && !path.posix.isAbsolute(v) && !v.includes('\\') && !v.includes('\0') && !v.split('/').some(p => ['..', '.', ''].includes(p));
const gates = ['work_order', 'approved_scope', 'acceptance_criteria', 'technical_design', 'risk_review', 'profile_eligibility'];

export function compileCoreTask({ item, workflow, workers, context, authority_digest, control_revision, evaluation, cell_id }) {
  check(item && typeof item.id === 'string' && /^WI-[0-9]+$/.test(item.id), 'A canonical Work Item snapshot is required');
  const assessment = assessWorkflowProfile(workflow, { requestedProfile: item.workflow_profile, riskTier: item.risk_tier,
    scopeClass: item.profile_assessment?.scope_class, escalationTriggers: item.profile_assessment?.escalation_triggers });
  check(assessment.effective_profile === 'lean' && item.workflow_profile === 'lean' && item.risk_tier === 'low' && item.profile_assessment?.scope_class === 'bounded', 'Core candidate only supports eligible low-risk bounded Lean');
  check(item.ui_delivery_mode === 'not-applicable' && item.profile_assessment.escalation_triggers.length === 0 && item.unresolved.length === 0, 'UI, escalation and unresolved work retain their existing route');
  check(['build', 'test'].includes(item.state), 'Only Build or Test can compile a core task');
  const position = item.state === 'build' ? 'developer' : 'quality_evaluator';
  check(item.owner_position === position && item.claim?.status === 'active' && item.claim.agent_id === item.assigned_agent_id && nonblank(item.claim.principal_id), 'Current assigned Identity and active claim are required');
  check(Array.isArray(workers) && !workers.some(w => w.work_item_id === item.id && !['completed', 'failed', 'cancelled'].includes(w.status)), 'Active workers retain governed runtime coordination');
  const developer = item.handoffs?.findLast(h => h.from_position === 'developer')?.actor;
  if (position === 'quality_evaluator') check(developer && developer !== item.claim.agent_id && item.developer_candidate_revision === control_revision, 'Verifier must differ from Developer and inspect the exact candidate');
  check(hash(authority_digest) && revision(control_revision), 'Exact authority digest and control revision are required');
  check(strings(item.scope) && strings(item.acceptance_criteria) && strings(item.affected_paths) && item.affected_paths.every(ref), 'Explicit scope, acceptance and relative edit paths are required');
  check(gates.every(g => strings(item.gate_evidence?.[g])), 'All current Lean prebuild evidence remains required');
  const required = [...new Set(gates.flatMap(g => item.gate_evidence[g]))];
  check(Array.isArray(context), 'Context bodies must come from trusted control reads');
  const byRef = new Map();
  for (const source of context) {
    check(ref(source.path) && !byRef.has(source.path) && nonblank(source.body) && hash(source.sha256) && coreDigest(source.body) === source.sha256, 'Context is missing, duplicate or changed');
    byRef.set(source.path, source);
  }
  check(required.every(r => byRef.has(r)), 'Every named prebuild source must be present; hashes do not replace bodies');
  // Keep each necessary body once, retaining every source identity.
  const grouped = new Map();
  for (const source of context) {
    if (!grouped.has(source.sha256)) grouped.set(source.sha256, { paths: [], sha256: source.sha256, body: source.body });
    grouped.get(source.sha256).paths.push(source.path);
  }
  const preview = planEvaluation(evaluation.selection, evaluation.catalog);
  const cell = preview.cells.find(c => c.id === cell_id);
  check(cell?.mode === 'temple-core-candidate' && cell.eligible && cell.risk === 'low', 'Select an eligible low-risk core candidate cell');
  check(cell.budget && preview.reservation.complete && preview.reservation.ceilings && !preview.qualification_issues.some(i => i.startsWith('exceeded:')), 'Full cohort budgets and buffers must be reserved before preparing the candidate');
  check(revision(cell.pins.product_revision) && hash(cell.pins.fixture_digest) && hash(cell.pins.acceptance_digest), 'Exact product seed and acceptance pins are required');
  const order = {
    schema_version: 'temple.core-task-contract/v1', authority: 'derived-from-control-state',
    work_item_id: item.id, position, actor: item.claim.agent_id, principal: item.claim.principal_id, claim_id: item.claim.id,
    control_revision, authority_digest, work_item_digest: coreDigest(item),
    goal: [...item.scope], acceptance: [...item.acceptance_criteria], allowed_edit_paths: [...item.affected_paths],
    external_actions: [], context: [...grouped.values()], budget: cell.budget,
    evaluation: { selection_sha256: preview.selection_sha256, catalog_sha256: preview.catalog_sha256, cell_id, product_seed: cell.pins,
      implementation_model: cell.model, reasoning_effort: cell.reasoning_effort, common_verifier: preview.controls.verifier },
    methods: 'Choose investigation, design, decomposition, implementation and self-tests within this contract. Do not stop after a plan or duplicate coordinator administration.',
    completion: 'Provide actual candidate and evidence; a distinct Verifier judges acceptance. A participant completion claim is not lifecycle authority.',
    coordinator: 'Retains native instructions, canonical lifecycle, permissions and budget enforcement. Resolve missing authority or scope before further work.',
    isolation: { separate_product_checkout_required: true, live_runtime_verified: false },
    model_generation_authorized: false
  };
  return { order, order_sha256: coreDigest(order) };
}

function validateBundle(bundle, expected) {
  check(hash(expected) && bundle?.order?.schema_version === 'temple.core-task-contract/v1' && bundle.order_sha256 === expected && coreDigest(bundle.order) === expected, 'Core task contract changed; recover from trusted control state');
}

export function coreRecoveryPacket(bundle, checkpoint, { expected_order_sha256, current_candidate_revision }) {
  validateBundle(bundle, expected_order_sha256);
  check(checkpoint?.schema_version === 'temple.core-checkpoint/v1' && checkpoint.order_sha256 === expected_order_sha256, 'Checkpoint belongs to another contract');
  check(revision(current_candidate_revision) && checkpoint.candidate_revision === current_candidate_revision, 'Checkpoint candidate is stale or unknown');
  check(['implementing', 'verification-pending', 'needs-repair', 'blocked'].includes(checkpoint.reported_state), 'Checkpoint cannot claim acceptance');
  check(Array.isArray(checkpoint.evidence_refs) && checkpoint.evidence_refs.every(ref) && Array.isArray(checkpoint.unresolved) && checkpoint.unresolved.every(nonblank) && nonblank(checkpoint.next_action), 'Checkpoint requires explicit evidence, unresolved list and next action');
  return { schema_version: 'temple.core-recovery-packet/v1', authority: 'navigation-only',
    work_item_id: bundle.order.work_item_id, goal: bundle.order.goal, acceptance: bundle.order.acceptance,
    candidate_revision: current_candidate_revision, reported_state: checkpoint.reported_state,
    evidence_refs: [...checkpoint.evidence_refs], unresolved: [...checkpoint.unresolved], next_action: checkpoint.next_action,
    order_sha256: expected_order_sha256, context_refs: bundle.order.context.map(c => ({ paths: c.paths, sha256: c.sha256 })),
    verification_performed: false, acceptance_granted: false, model_generation_authorized: false };
}

export function coreCompletionArguments(bundle, evidence, expectedOrderDigest) {
  validateBundle(bundle, expectedOrderDigest);
  const order = bundle.order;
  check(nonblank(evidence?.operation_id) && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(evidence.operation_id) && revision(evidence.control_revision), 'Exact completion operation and revision are required');
  if (order.position === 'quality_evaluator') check(evidence.control_revision === order.control_revision, 'Verifier candidate changed');
  const args = ['work-item', 'finish', '.', '--work-item', order.work_item_id, '--position', order.position,
    '--operation-id', evidence.operation_id, '--claim-id', order.claim_id, '--agent-id', order.actor,
    '--principal-id', order.principal, '--revision', evidence.control_revision, '--json'];
  if (order.position === 'developer') {
    check(strings(evidence.completed) && strings(evidence.evidence_refs) && evidence.evidence_refs.every(ref), 'Developer must provide actual completion evidence');
    args.push(...evidence.completed.flatMap(v => ['--completed', v]), ...evidence.evidence_refs.flatMap(v => ['--evidence', v]));
  } else {
    check(evidence.judgment === 'pass' && strings(evidence.test_evidence) && strings(evidence.lean_closeout) && [...evidence.test_evidence, ...evidence.lean_closeout].every(ref), 'Distinct Verifier passing evidence is required');
    args.push('--judgment', 'pass', ...evidence.test_evidence.flatMap(v => ['--test-evidence', v]), ...evidence.lean_closeout.flatMap(v => ['--lean-closeout', v]));
  }
  return args;
}

export function coreCompletionOutcome(result, exitCode) {
  const recognized = result?.schema_version === 'temple.lean-finish-result/v1';
  return { result, exit_code: exitCode, automatic_retry: false, authority_granted: false,
    next_stage_ready: recognized && exitCode === 0 && result.success === true && result.diagnostics?.status === 'passed' && result.diagnostics.historical === false && result.next_stage_ready === true,
    next_action: recognized && nonblank(result.next_action) ? result.next_action : 'Inspect current receipt, journal and control state; do not infer successful completion or retry automatically.' };
}

export async function executeCoreCompletion(controlRoot, bundle, evidence, { expected_order_sha256 }) {
  const args = coreCompletionArguments(bundle, evidence, expected_order_sha256);
  const target = await realpath(controlRoot);
  // The repository launcher still performs its pinned bootstrap and all existing
  // authority/evidence/candidate checks. Never substitute a global CLI or shell.
  let stdout, code;
  try {
    const result = await exec(process.execPath, [path.join(target, 'templew.mjs'), ...args], { cwd: target, timeout: 120000, maxBuffer: 2 * 1024 * 1024 });
    stdout = result.stdout; code = 0;
  } catch (error) { stdout = error.stdout; code = Number.isInteger(error.code) ? error.code : null; }
  let result; try { result = JSON.parse(stdout); } catch { result = { status: 'unknown', mutation_status: 'unknown' }; }
  return coreCompletionOutcome(result, code);
}
