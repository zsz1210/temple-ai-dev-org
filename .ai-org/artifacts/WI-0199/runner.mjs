import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { root, protocol, protocolCheck, sourceCheck } from './preflight.mjs';
import { prepareSources, prepareCase } from '../WI-0193/fixture-kit.mjs';
import { snapshot, sandboxCheck, sandboxCommand, changedOutsideScope, providerContract as predecessorProviderContract } from '../WI-0193/runner.mjs';
import { requests, runSubject, sha } from './executor.mjs';
import { gradeCase } from '../WI-0193/grading.mjs';
import { stopReasonFor } from '../WI-0193/measurement.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const demand = (value, message) => { if (!value) throw Error(message); };
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const write = (file, value) => fs.writeFile(file, JSON.stringify(value, null, 2), { flag: 'wx' });
const executionProtocol = () => ({ model: protocol.model, effort: protocol.effort, proposed_limits: protocol.limits });

export async function bindings() {
  const result = {};
  for (const name of ['design.md', 'protocol.json', 'preflight.mjs', 'runner.mjs', 'executor.mjs']) {
    result[`.ai-org/artifacts/WI-0199/${name}`] = sha(await fs.readFile(path.join(here, name)));
  }
  for (const name of ['event-policy.mjs', 'native-tracker.mjs']) {
    result[`.ai-org/artifacts/WI-0196/${name}`] = sha(await fs.readFile(path.join(here, '../WI-0196', name)));
  }
  for (const name of ['fixture-kit.mjs', 'grading.mjs', 'measurement.mjs']) {
    result[`.ai-org/artifacts/WI-0193/${name}`] = sha(await fs.readFile(path.join(here, '../WI-0193', name)));
  }
  for (const name of ['src/codex-app-server-provider.mjs', 'scripts/delivery-control-pair.mjs', 'scripts/run-representative-microservice-comparison.mjs', 'src/app-server-protocol-replay.mjs', 'package-lock.json']) {
    result[name] = sha(await fs.readFile(path.join(root, name)));
  }
  return result;
}

export async function providerContract() {
  const contract = await predecessorProviderContract();
  const schemaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'native-child-probe-schema-'));
  try {
    execFileSync('codex', ['app-server', 'generate-json-schema', '--out', schemaDir]);
    for (const name of ['TurnStartedNotification', 'TurnCompletedNotification', 'ThreadStartResponse', 'ThreadResumeResponse', 'TurnStartResponse']) {
      contract.schemas[name] = JSON.parse(await fs.readFile(path.join(schemaDir, 'v2', `${name}.json`), 'utf8'));
    }
    return contract;
  } finally {
    await fs.rm(schemaDir, { recursive: true, force: true });
  }
}

export function assertProviderContract(contract) {
  const required = ['ThreadStartParams', 'ThreadStartResponse', 'ThreadResumeParams', 'ThreadResumeResponse', 'TurnStartParams', 'TurnStartResponse', 'ItemStartedNotification', 'ItemCompletedNotification', 'ThreadTokenUsageUpdatedNotification', 'TurnStartedNotification', 'TurnCompletedNotification'];
  for (const name of required) demand(contract?.schemas?.[name]?.type === 'object', `schema-missing:${name}`);
  return true;
}

export function approvalCheck(approval, seal, now = Date.now()) {
  demand(approval?.schema_version === 'temple.native-child-probe-approval/v1' && approval.approved === true, 'approval-required');
  demand(approval.protocol_sha256 === sha(seal) && approval.model === protocol.model && approval.effort === protocol.effort, 'approval-binding');
  demand(JSON.stringify(approval.limits) === JSON.stringify(protocol.limits), 'approval-limits');
  demand(approval.included_quota_only === true && approval.purchase_credits === false && approval.auto_topup === false && approval.reset === false, 'approval-funding');
  demand(approval.approved_by === 'human' && approval.authorization_source === 'explicit-user-message', 'approval-provenance');
  demand(Date.parse(approval.expires_at) > now, 'approval-expired');
  demand(typeof approval.evidence_ref === 'string' && /^[a-f0-9]{64}$/.test(approval.evidence_sha256 ?? ''), 'approval-evidence');
  return true;
}

export function reviewCheck(review, seal) {
  demand(review?.schema_version === 'temple.native-child-probe-review/v1' && review.status === 'passed', 'independent-review-required');
  demand(review.protocol_sha256 === sha(seal) && review.developer_agent_id === 'agent-rikku' && review.reviewer_agent_id === 'agent-lulu', 'review-binding');
  demand(review.review_kind === 'independent-readiness' && /^[a-f0-9]{40}$/.test(review.candidate_revision ?? ''), 'review-provenance-required');
  demand(typeof review.reviewer_runtime_id === 'string' && review.reviewer_runtime_id.length > 0, 'review-provenance-required');
  demand(typeof review.evidence_ref === 'string' && /^[a-f0-9]{64}$/.test(review.evidence_sha256 ?? ''), 'review-evidence');
  return true;
}

export function reviewedBindingsCheck(seal, revision, show = name => execFileSync('git', ['show', `${revision}:${name}`], { cwd: root })) {
  demand(/^[a-f0-9]{40}$/.test(revision ?? ''), 'reviewed-candidate-invalid');
  for (const [name, digest] of Object.entries(seal.bindings ?? {})) {
    demand(sha(show(name)) === digest, 'reviewed-candidate-drift');
  }
  return true;
}

function boundedResult(result) {
  const serialized = JSON.stringify(result);
  if (Buffer.byteLength(serialized) <= 1048576) return result;
  return {
    case: result.case,
    arm: result.arm,
    status: 'stopped',
    stop_reason: 'persistence-cap',
    elapsed_ms: result.elapsed_ms,
    requested_model: result.requested_model,
    requested_effort: result.requested_effort,
    messages: [],
    observations: [],
    native_errors: [],
    answer: null,
    answer_retention: 'rejected-over-limit',
    cleanup: result.cleanup ?? null,
    trace: result.trace ?? null,
    raw_tool_output_retained: false,
    reasoning_retained: false
  };
}

export function sanitizeResult(result, fixture) {
  const raw = JSON.stringify(result).replaceAll(fixture.target, '<fixture>').replaceAll(fixture.source, '<source>');
  const safe = JSON.parse(raw);
  safe.messages = (safe.messages ?? []).slice(-64).map(message => ({ ...message, text: String(message.text ?? '').slice(0, 16384) }));
  safe.observations = (safe.observations ?? []).slice(-256);
  safe.native_errors = (safe.native_errors ?? []).slice(-64);
  if (safe.answer && typeof safe.answer === 'object') {
    if (Buffer.byteLength(JSON.stringify(safe.answer)) > 32768) {
      safe.answer = null;
      safe.status = 'stopped';
      safe.stop_reason ??= 'answer-metadata-cap';
      safe.answer_retention = 'rejected-over-limit';
    } else {
      safe.answer_retention = 'bounded-redacted';
    }
  } else {
    safe.answer = null;
    safe.answer_retention = 'none';
  }
  const bounded = boundedResult(safe);
  const persisted = JSON.stringify(bounded);
  demand(!persisted.includes(fixture.target) && !persisted.includes(fixture.source), 'persistence-redaction-failed');
  return bounded;
}

export function compatibilityCheck(result) {
  const actors = result.trace?.actors ?? [];
  const parent = actors.find(actor => actor.role === 'parent');
  const helper = actors.find(actor => actor.role === 'helper');
  return result.status === protocol.success_contract.trace_status
    && result.trace?.observed_children === protocol.success_contract.observed_children
    && parent?.terminal === protocol.success_contract.parent_terminal
    && helper?.terminal === protocol.success_contract.helper_terminal
    && parent?.usage != null
    && helper?.usage != null
    && result.cleanup?.status === protocol.success_contract.cleanup_status
    && (result.out_of_scope_paths ?? []).length === protocol.success_contract.out_of_scope_paths
    && result.answer != null;
}

export async function prepare() {
  protocolCheck();
  sourceCheck();
  const fixture = await prepareSources();
  const contract = await providerContract();
  assertProviderContract(contract);
  const item = await prepareCase(fixture.lab, protocol.case.arm, protocol.case.id);
  const subject = {
    id: protocol.case.id,
    arm: protocol.case.arm,
    prompt: item.prompt,
    actor: item.actor,
    initial: await snapshot(item.target),
    request_sha256: sha(requests(item, executionProtocol()))
  };
  const sourceSnapshot = await snapshot(path.join(fixture.lab, protocol.case.arm), { source: true });
  const sandbox = await sandboxCheck({ target: item.target, source: item.source, id: item.id, arm: item.arm });
  const seal = {
    schema_version: 'temple.native-child-probe-seal/v1',
    protocol,
    bindings: await bindings(),
    source_snapshot: sourceSnapshot,
    contract,
    subject,
    sandbox,
    persistence: { max_result_bytes: 1048576, max_messages: 64, max_message_bytes: 16384, max_observations: 256, max_native_errors: 64, max_answer_bytes: 32768, path_redaction: true },
    native_child_observation: 'required',
    child_aggregate_metric: 'unknown-until-nonduplication-established',
    live_gate: 'independent-readiness-and-fresh-human-approval'
  };
  await write(path.join(fixture.lab, 'seal.json'), seal);
  await write(path.join(fixture.lab, 'approval.template.json'), {
    schema_version: 'temple.native-child-probe-approval/v1',
    approved: false,
    approved_by: null,
    authorization_source: null,
    evidence_ref: null,
    evidence_sha256: null,
    protocol_sha256: sha(seal),
    model: protocol.model,
    effort: protocol.effort,
    limits: protocol.limits,
    included_quota_only: true,
    purchase_credits: false,
    auto_topup: false,
    reset: false,
    expires_at: null
  });
  await write(path.join(fixture.lab, 'review.template.json'), {
    schema_version: 'temple.native-child-probe-review/v1',
    status: 'pending',
    review_kind: 'independent-readiness',
    protocol_sha256: sha(seal),
    candidate_revision: null,
    developer_agent_id: 'agent-rikku',
    reviewer_agent_id: 'agent-lulu',
    reviewer_runtime_id: null,
    evidence_ref: null,
    evidence_sha256: null
  });
  return { lab: fixture.lab, protocol_sha256: sha(seal), subject_arms: 1, subject_turn_cap: 2, sandbox, model_calls: 0 };
}

export async function execute(lab, approvalPath, reviewPath) {
  protocolCheck();
  const seal = await read(path.join(lab, 'seal.json'));
  approvalCheck(await read(approvalPath), seal);
  const review = await read(reviewPath);
  reviewCheck(review, seal);
  const approval = await read(approvalPath);
  const approvalEvidence = await fs.realpath(path.resolve(root, approval.evidence_ref));
  const reviewEvidence = await fs.realpath(path.resolve(root, review.evidence_ref));
  const artifactRoot = await fs.realpath(here);
  demand(approvalEvidence.startsWith(`${artifactRoot}${path.sep}`) && reviewEvidence.startsWith(`${artifactRoot}${path.sep}`), 'evidence-scope');
  demand(sha(await fs.readFile(approvalEvidence)) === approval.evidence_sha256, 'approval-evidence-drift');
  demand(sha(await fs.readFile(reviewEvidence)) === review.evidence_sha256, 'review-evidence-drift');
  reviewedBindingsCheck(seal, review.candidate_revision);
  demand(sha(await bindings()) === sha(seal.bindings), 'binding-drift');
  demand(sha(await providerContract()) === sha(seal.contract), 'provider-drift');
  assertProviderContract(seal.contract);
  await write(path.join(lab, 'run-once.json'), { protocol_sha256: sha(seal), started_at: new Date().toISOString() });

  const startedAt = Date.now();
  const deadline = startedAt + protocol.limits.aggregate_ms;
  const subject = seal.subject;
  const fixture = { ...subject, target: path.join(lab, `${subject.id}-${subject.arm}`), source: path.join(lab, subject.arm) };
  demand(sha(await snapshot(fixture.source, { source: true })) === sha(seal.source_snapshot), 'archived-source-drift');
  demand(sha(await snapshot(fixture.target)) === sha(subject.initial), 'initial-fixture-drift');
  demand(sha(requests(fixture, executionProtocol())) === subject.request_sha256, 'request-drift');

  let raw;
  try {
    raw = await runSubject({ fixture, protocol: executionProtocol(), contract: seal.contract, deadline, aggregateBefore: 0 });
    const current = await snapshot(fixture.target);
    raw.changed_paths = [...new Set([...Object.keys(subject.initial), ...Object.keys(current)])].filter(file => subject.initial[file] !== current[file]).slice(0, 512);
    raw.out_of_scope_paths = changedOutsideScope(subject.id, raw.changed_paths).slice(0, 512);
    raw.case_grade = await gradeCase(fixture, raw, { execute: command => sandboxCommand(fixture, command, { readonly: true }) });
    raw.quality_status = raw.case_grade.status === 'unmeasurable' ? 'unmeasurable' : raw.case_grade.status === 'failed' ? 'failed-automatic-check' : 'human-trace-review-required';
  } catch (error) {
    raw = { case: subject.id, arm: subject.arm, status: 'stopped', stop_reason: /^[a-z-]+$/.test(error.message) ? error.message : 'execution-error', elapsed_ms: Date.now() - startedAt, requested_model: protocol.model, requested_effort: protocol.effort, messages: [], observations: [], native_errors: [], cleanup: null, trace: null, answer: null, raw_tool_output_retained: false, reasoning_retained: false };
  }
  const result = sanitizeResult(raw, fixture);
  const compatible = compatibilityCheck(result);
  const stopReason = compatible ? null : stopReasonFor(result) ?? 'compatibility-contract-not-met';
  await write(path.join(lab, 'result-1.json'), result);
  const conservativeTokens = (result.trace?.actors ?? []).reduce((sum, actor) => sum + (actor.usage?.operationalTokens ?? 0), 0);
  const report = {
    protocol_sha256: sha(seal),
    recorded: 1,
    planned: 1,
    compatible,
    stop_reason: stopReason,
    elapsed_ms: Date.now() - startedAt,
    conservative_operational_counter: conservativeTokens,
    counter_is_cost: false,
    result,
    conclusion: compatible ? 'native-child-observation-compatible' : 'stopped-no-retry-no-compatibility-claim'
  };
  await write(path.join(lab, 'results.json'), report);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [action, ...args] = process.argv.slice(2);
  if (action === 'prepare' && args.length === 0) console.log(JSON.stringify(await prepare(), null, 2));
  else if (action === 'run' && args.length === 3) console.log(JSON.stringify(await execute(...args), null, 2));
  else throw Error('Usage: runner.mjs prepare | run LAB APPROVAL_JSON REVIEW_JSON');
}
