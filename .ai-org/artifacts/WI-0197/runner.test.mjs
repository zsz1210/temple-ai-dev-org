import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { protocol, protocolCheck, readiness, sourceCheck } from './preflight.mjs';
import { approvalCheck, assertProviderContract, bindings, compatibilityCheck, providerContract, reviewCheck, reviewedBindingsCheck, sanitizeResult } from './runner.mjs';
import { sha } from '../WI-0196/executor.mjs';

test('protocol is one generation-disabled support arm with no retry or funding expansion', () => {
  assert.equal(protocolCheck(), true);
  assert.deepEqual(protocol.case, { id: 'support-read', arm: 'after', helpers: 1 });
  assert.deepEqual({ arms: protocol.limits.subject_arms, turns: protocol.limits.subject_turns, children: protocol.limits.max_children }, { arms: 1, turns: 2, children: 1 });
  assert.deepEqual({ retries: protocol.limits.retries, fallback: protocol.limits.fallback, reset: protocol.limits.reset, credits: protocol.limits.purchase_credits, topup: protocol.limits.auto_topup }, { retries: 0, fallback: false, reset: false, credits: false, topup: false });
  assert.equal(sourceCheck().protected_equal, true);
  assert.deepEqual(readiness().blockers, ['exact-seal', 'independent-readiness', 'fresh-live-approval']);
});

test('protocol drift cannot broaden route, arms, resources, retry, fallback, reset, or funding', () => {
  const mutations = [
    candidate => { candidate.model = 'gpt-5.6-sol'; },
    candidate => { candidate.case.arm = 'before'; },
    candidate => { candidate.limits.subject_arms = 2; },
    candidate => { candidate.limits.aggregate_operational_tokens++; },
    candidate => { candidate.limits.aggregate_ms++; },
    candidate => { candidate.limits.retries = 1; },
    candidate => { candidate.limits.fallback = true; },
    candidate => { candidate.limits.reset = true; },
    candidate => { candidate.limits.purchase_credits = true; },
    candidate => { candidate.live_approval = { approved: true }; }
  ];
  for (const mutate of mutations) {
    const candidate = structuredClone(protocol);
    mutate(candidate);
    assert.throws(() => protocolCheck(candidate));
  }
});

function approval(seal) {
  return {
    schema_version: 'temple.native-child-probe-approval/v1',
    approved: true,
    approved_by: 'human',
    authorization_source: 'explicit-user-message',
    evidence_ref: '.ai-org/artifacts/WI-0197/approval-source.json',
    evidence_sha256: 'a'.repeat(64),
    protocol_sha256: sha(seal),
    model: protocol.model,
    effort: protocol.effort,
    limits: protocol.limits,
    included_quota_only: true,
    purchase_credits: false,
    auto_topup: false,
    reset: false,
    expires_at: new Date(Date.now() + 60000).toISOString()
  };
}

test('approval is exact, expiring, evidence-bound, and cannot authorize reset or retry', () => {
  const seal = { protocol, bindings: {} };
  const valid = approval(seal);
  assert.equal(approvalCheck(valid, seal), true);
  assert.throws(() => approvalCheck({ ...valid, protocol_sha256: 'b'.repeat(64) }, seal), /approval-binding/);
  assert.throws(() => approvalCheck({ ...valid, limits: { ...valid.limits, retries: 1 } }, seal), /approval-limits/);
  assert.throws(() => approvalCheck({ ...valid, reset: true }, seal), /approval-funding/);
  assert.throws(() => approvalCheck({ ...valid, expires_at: new Date(Date.now() - 1).toISOString() }, seal), /approval-expired/);
});

test('independent review binds exact seal, candidate, identity, runtime, and evidence', () => {
  const seal = { protocol, bindings: {} };
  const valid = {
    schema_version: 'temple.native-child-probe-review/v1',
    status: 'passed',
    review_kind: 'independent-readiness',
    protocol_sha256: sha(seal),
    candidate_revision: 'a'.repeat(40),
    developer_agent_id: 'agent-rikku',
    reviewer_agent_id: 'agent-lulu',
    reviewer_runtime_id: '/root/reviewer',
    evidence_ref: '.ai-org/artifacts/WI-0197/readiness.md',
    evidence_sha256: 'b'.repeat(64)
  };
  assert.equal(reviewCheck(valid, seal), true);
  assert.throws(() => reviewCheck({ ...valid, reviewer_agent_id: 'agent-rikku' }, seal), /review-binding/);
  assert.throws(() => reviewCheck({ ...valid, candidate_revision: 'short' }, seal), /review-provenance/);
  assert.throws(() => reviewCheck({ ...valid, reviewer_runtime_id: null }, seal), /review-provenance/);
});

test('reviewed binding verification rejects a stale exact candidate', () => {
  const expected = Buffer.from('expected');
  const seal = { bindings: { 'runner.mjs': sha(expected) } };
  assert.equal(reviewedBindingsCheck(seal, 'a'.repeat(40), () => expected), true);
  assert.throws(() => reviewedBindingsCheck(seal, 'a'.repeat(40), () => Buffer.from('changed')), /reviewed-candidate-drift/);
  assert.throws(() => reviewedBindingsCheck(seal, 'not-a-revision', () => expected), /reviewed-candidate-invalid/);
});

test('current Provider contract seals all request, response, event, and usage schemas', async () => {
  const contract = await providerContract();
  assert.equal(assertProviderContract(contract), true);
  for (const name of ['ThreadStartResponse', 'ThreadResumeResponse', 'TurnStartResponse']) assert.equal(contract.schemas[name].type, 'object');
  const missing = structuredClone(contract);
  delete missing.schemas.ThreadResumeResponse;
  assert.throws(() => assertProviderContract(missing), /schema-missing:ThreadResumeResponse/);
});

test('bindings select WI-0196 acquisition and exclude the sealed WI-0194 executor', async () => {
  const selected = await bindings();
  assert.ok(selected['.ai-org/artifacts/WI-0196/executor.mjs']);
  assert.ok(selected['.ai-org/artifacts/WI-0196/native-tracker.mjs']);
  assert.equal(selected['.ai-org/artifacts/WI-0194/executor.mjs'], undefined);
  for (const [name, digest] of Object.entries(selected)) {
    assert.match(digest, /^[a-f0-9]{64}$/, name);
    assert.ok((await fs.readFile(name)).length > 0, name);
  }
});

test('sanitizer redacts paths, caps retained arrays, and rejects oversized answers and results', () => {
  const fixture = { target: '/private/fixture', source: '/private/source' };
  const base = {
    case: 'support-read', arm: 'after', status: 'observed-complete', stop_reason: null,
    messages: Array.from({ length: 80 }, (_, index) => ({ text: `/private/fixture/${index}-${'x'.repeat(100)}` })),
    observations: Array.from({ length: 300 }, (_, index) => ({ index, path: '/private/source' })),
    native_errors: Array.from({ length: 80 }, (_, index) => ({ index })),
    answer: { summary: '/private/fixture/cache.mjs', references: ['/private/source/cache.mjs'] }
  };
  const safe = sanitizeResult(base, fixture);
  assert.equal(safe.messages.length, 64);
  assert.ok(safe.messages.every(message => Buffer.byteLength(message.text) <= 16384));
  assert.equal(safe.observations.length, 256);
  assert.equal(safe.native_errors.length, 64);
  assert.equal(safe.answer.summary, '<fixture>/cache.mjs');
  assert.ok(!JSON.stringify(safe).includes('/private/'));
  const longMessage = sanitizeResult({ ...base, messages: [{ text: 'x'.repeat(20000) }], observations: [], native_errors: [] }, fixture);
  assert.equal(Buffer.byteLength(longMessage.messages[0].text), 16384);
  const oversizedAnswer = sanitizeResult({ ...base, messages: [], observations: [], native_errors: [], answer: { summary: 'x'.repeat(40000) } }, fixture);
  assert.equal(oversizedAnswer.status, 'stopped');
  assert.equal(oversizedAnswer.stop_reason, 'answer-metadata-cap');
  assert.equal(oversizedAnswer.answer, null);
  const oversizedResult = sanitizeResult({ ...base, messages: [], observations: [], native_errors: [], answer: null, extra: 'x'.repeat(1100000) }, fixture);
  assert.equal(oversizedResult.stop_reason, 'persistence-cap');
  assert.ok(Buffer.byteLength(JSON.stringify(oversizedResult)) < 1048576);
});

test('compatibility requires both completed actors, usage, cleanup, answer, and zero out-of-scope writes', () => {
  const result = {
    status: 'observed-complete',
    trace: { observed_children: 1, actors: [
      { role: 'parent', terminal: 'completed', usage: { operationalTokens: 10 } },
      { role: 'helper', terminal: 'completed', usage: { operationalTokens: 5 } }
    ] },
    cleanup: { status: 'observed-terminal' },
    out_of_scope_paths: [],
    answer: { decision: 'reported' }
  };
  assert.equal(compatibilityCheck(result), true);
  assert.equal(compatibilityCheck({ ...result, answer: null }), false);
  assert.equal(compatibilityCheck({ ...result, out_of_scope_paths: ['product.js'] }), false);
  const missingUsage = structuredClone(result);
  missingUsage.trace.actors[1].usage = null;
  assert.equal(compatibilityCheck(missingUsage), false);
});
