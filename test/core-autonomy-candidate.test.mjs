import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { compileCoreTask, coreDigest, coreRecoveryPacket, coreCompletionArguments, executeCoreCompletion, coreCompletionOutcome } from '../scripts/core-autonomy-candidate.mjs';
import { fixture, cli, git, itemState } from './helpers/lean-delivery-fixture.mjs';

const catalog = JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/catalog.json', import.meta.url)));
const template = JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/selection.template.json', import.meta.url)));
const workflow = JSON.parse(await fs.readFile(new URL('../.ai-org/core/workflow.json', import.meta.url)));
const source = 'a'.repeat(40), authority = 'b'.repeat(64), body = 'Approved local goal, acceptance and constraints. Design method is delegated.';
const gates = ['work_order', 'approved_scope', 'acceptance_criteria', 'technical_design', 'risk_review', 'profile_eligibility'];
function input() {
  const selection = structuredClone(template);
  selection.decision.factor = 'descriptive'; selection.selection = { scenarios: ['small-bug'], models: ['terra-medium'], variants: ['core-proposed'] };
  selection.controls.scenario_pins['small-bug'] = { product_revision: source, fixture_digest: authority, acceptance_digest: authority };
  const b = { basis: 'Synthetic test arithmetic only' };
  for (const phase of ['setup','build','verify','repair','reverify','variability','usage_lag','cleanup']) b[phase] = { tokens: 100, time_ms: 1000, calls: ['build','verify','repair','reverify'].includes(phase) ? 1 : 0 };
  selection.budget = { per_scenario: { 'small-bug': b }, batch_overhead: { tokens: 0, time_ms: 0, calls: 0 }, ceilings: { tokens: 1000, time_ms: 10000, calls: 4 } };
  return { item: { id: 'WI-0001', workflow_profile: 'lean', risk_tier: 'low', profile_assessment: { scope_class: 'bounded', escalation_triggers: [] },
    ui_delivery_mode: 'not-applicable', unresolved: [], state: 'build', owner_position: 'developer', assigned_agent_id: 'agent-builder',
    claim: { status: 'active', id: 'claim-test', agent_id: 'agent-builder', principal_id: 'human' },
    scope: ['Fix parser'], acceptance_criteria: ['Valid input parses; invalid input rejected'], affected_paths: ['app.mjs'],
    gate_evidence: Object.fromEntries(gates.map(g => [g, ['docs/brief.md']])) }, workflow, workers: [],
    context: [{ path: 'docs/brief.md', sha256: coreDigest(body), body }], authority_digest: authority, control_revision: source,
    evaluation: { catalog, selection }, cell_id: 'small-bug__terra-medium__core-proposed__r1' };
}

test('one compiled contract preserves all named gates while deduplicating context and reserving the entire path', () => {
  const data = input(); data.context.push({ ...data.context[0], path: 'docs/design.md' }); data.item.gate_evidence.technical_design = ['docs/design.md'];
  const before = structuredClone(data), bundle = compileCoreTask(data);
  assert.equal(bundle.order.context.length, 1); assert.deepEqual(bundle.order.context[0].paths, ['docs/brief.md', 'docs/design.md']);
  assert.equal(bundle.order.budget.total.tokens, 800); assert.equal(bundle.order.budget.total.calls, 4);
  assert.equal(bundle.order.model_generation_authorized, false); assert.equal(bundle.order.isolation.live_runtime_verified, false);
  assert.deepEqual(data, before); assert.deepEqual(compileCoreTask(data), bundle);
});

test('ineligible, escalated, unresolved, inactive and unbudgeted inputs fail before any execution', () => {
  for (const change of [d => d.item.risk_tier = 'high', d => d.item.workflow_profile = 'standard', d => d.item.profile_assessment.scope_class = 'ordinary',
    d => d.item.profile_assessment.escalation_triggers.push('external-write'), d => d.item.unresolved.push('Unclear acceptance'),
    d => d.item.claim.status = 'released', d => d.item.assigned_agent_id = 'someone-else', d => d.item.ui_delivery_mode = 'code-first',
    d => d.workers.push({ work_item_id: d.item.id, status: 'active' }), d => d.item.gate_evidence.technical_design = [],
    d => d.evaluation.selection.budget.per_scenario = {}, d => d.evaluation.selection.budget.ceilings.tokens = 799,
    d => d.context[0].body += 'changed', d => d.context = [], d => d.context.push({ ...d.context[0] })]) {
    const data = input(); change(data); assert.throws(() => compileCoreTask(data));
  }
  const data = input(); data.workflow = structuredClone(workflow); data.workflow.profile_assessment.risk_tier_floors.low = 'standard';
  assert.throws(() => compileCoreTask(data), /eligible/);
});

test('minimal recovery rejects another goal, stale candidate and an unverified done claim', () => {
  const bundle = compileCoreTask(input());
  const checkpoint = { schema_version: 'temple.core-checkpoint/v1', order_sha256: bundle.order_sha256, candidate_revision: source,
    reported_state: 'verification-pending', evidence_refs: ['docs/test.json'], unresolved: [], next_action: 'Independent verification' };
  const options = { expected_order_sha256: bundle.order_sha256, current_candidate_revision: source };
  const recovered = coreRecoveryPacket(bundle, checkpoint, options);
  assert.equal(recovered.acceptance_granted, false); assert.equal(recovered.verification_performed, false);
  assert.deepEqual(recovered.context_refs[0].paths, ['docs/brief.md']); assert.equal(recovered.context_refs[0].body, undefined);
  assert.throws(() => coreRecoveryPacket(bundle, { ...checkpoint, reported_state: 'done' }, options), /cannot claim acceptance/);
  assert.throws(() => coreRecoveryPacket(bundle, checkpoint, { ...options, current_candidate_revision: 'c'.repeat(40) }), /stale/);
  const altered = structuredClone(bundle); altered.order.goal = ['Different goal'];
  assert.throws(() => coreRecoveryPacket(altered, checkpoint, options), /contract changed/);
});

test('Verifier identity/candidate and structured completion facts remain explicit', () => {
  const data = input(); data.item.state = 'test'; data.item.owner_position = 'quality_evaluator';
  data.item.handoffs = [{ from_position: 'developer', actor: 'agent-builder' }]; data.item.developer_candidate_revision = source;
  assert.throws(() => compileCoreTask(data), /Verifier must differ/);
  data.item.assigned_agent_id = data.item.claim.agent_id = 'agent-verifier';
  const bundle = compileCoreTask(data), evidence = { operation_id: 'verify-one', control_revision: source, judgment: 'pass', test_evidence: ['docs/test.md'], lean_closeout: ['docs/close.md'] };
  const args = coreCompletionArguments(bundle, evidence, bundle.order_sha256);
  assert.ok(args.includes('agent-verifier')); assert.ok(args.includes('--test-evidence'));
  assert.throws(() => coreCompletionArguments(bundle, { ...evidence, judgment: 'fail' }, bundle.order_sha256), /passing evidence/);
  assert.throws(() => coreCompletionArguments(bundle, { ...evidence, control_revision: 'c'.repeat(40) }, bundle.order_sha256), /candidate changed/);
  assert.throws(() => coreCompletionArguments(bundle, { ...evidence, test_evidence: ['../escape'] }, bundle.order_sha256));
});

test('completion outcomes fail closed on missing, failed or historical diagnostics', () => {
  const passed = { schema_version: 'temple.lean-finish-result/v1', success: true, next_stage_ready: true, next_action: 'Next claim', diagnostics: { status: 'passed', historical: false } };
  assert.equal(coreCompletionOutcome(passed, 0).next_stage_ready, true);
  for (const result of [null, {}, { ...passed, diagnostics: { status: 'failed', historical: false } }, { ...passed, diagnostics: { status: 'passed', historical: true } }]) {
    const outcome = coreCompletionOutcome(result, 0); assert.equal(outcome.next_stage_ready, false); assert.equal(outcome.automatic_retry, false);
  }
  assert.equal(coreCompletionOutcome(passed, 1).next_stage_ready, false);
});

test('real pinned CLI completes Build then distinct Verifier and replays without a second lifecycle mutation', async t => {
  // Supported launcher override: still checks the installed version pin. Keep
  // this offline fixture on the candidate source instead of fetching a package.
  const previousCli = process.env.TEMPLE_CLI_PATH;
  const previousTestContext = process.env.NODE_TEST_CONTEXT;
  delete process.env.NODE_TEST_CONTEXT;
  process.env.TEMPLE_CLI_PATH = fileURLToPath(new URL('../bin/temple.mjs', import.meta.url));
  t.after(() => { if (previousCli === undefined) delete process.env.TEMPLE_CLI_PATH; else process.env.TEMPLE_CLI_PATH = previousCli; });
  t.after(() => { if (previousTestContext !== undefined) process.env.NODE_TEST_CONTEXT = previousTestContext; });
  const f = await fixture(); t.after(f.cleanup);
  const policyPath = path.join(f.target, '.ai-org/project/repository-integration.json');
  const policy = JSON.parse(await fs.readFile(policyPath));
  await fs.writeFile(policyPath, JSON.stringify({ ...policy, status: 'confirmed', source: 'human-confirmed', summary: 'Synthetic local rehearsal', change_isolation: 'not-required', review_gate: 'not-required', recorded_at: '2026-09-08T00:00:00Z', recorded_by: 'human' }));
  git(f.target, ['add', '.']); git(f.target, ['commit', '-m', 'Freeze authorized offline control']);
  const candidate = git(f.target, ['rev-parse', 'HEAD']);
  const data = input(); data.item = await itemState(f); data.control_revision = candidate;
  data.context = [{ path: 'docs/brief.md', body: await fs.readFile(path.join(f.target, 'docs/brief.md'), 'utf8') }]; data.context[0].sha256 = coreDigest(data.context[0].body);
  const bundle = compileCoreTask(data);
  const facts = { operation_id: 'core-build', control_revision: candidate, completed: ['Actual parser fixture tests pass'], evidence_refs: ['docs/developer-test.md'] };
  const result = await executeCoreCompletion(f.target, bundle, facts, { expected_order_sha256: bundle.order_sha256 });
  assert.equal(result.next_stage_ready, true, JSON.stringify(result)); assert.equal((await itemState(f)).state, 'test');
  const before = await fs.readFile(path.join(f.target, '.ai-org/events/events.jsonl'), 'utf8');
  const replay = await executeCoreCompletion(f.target, bundle, facts, { expected_order_sha256: bundle.order_sha256 });
  assert.equal(replay.next_stage_ready, false); assert.equal(replay.result.diagnostics.historical, true);
  assert.equal(await fs.readFile(path.join(f.target, '.ai-org/events/events.jsonl'), 'utf8'), before);
  const failed = await executeCoreCompletion(f.target, bundle, { ...facts, evidence_refs: ['docs/missing.md'] }, { expected_order_sha256: bundle.order_sha256 });
  assert.equal(failed.next_stage_ready, false); assert.equal(failed.automatic_retry, false);
  cli(['work-item', 'claim', f.target, '--work-item', f.item.id, '--agent-id', f.qualityAgent, '--principal-id', 'human', '--base-revision', candidate, '--branch', 'main']);
  const verificationOutput = execFileSync(process.execPath, ['--test', 'app.test.mjs'], { cwd: f.target, encoding: 'utf8' });
  assert.match(verificationOutput, /(?:#|ℹ) pass 1/);
  await fs.writeFile(path.join(f.target, 'docs/verification.md'), `# Independent synthetic verification\nCandidate: ${candidate}\nCommand: node --test app.test.mjs\n${verificationOutput}`);
  data.item = await itemState(f); const verifyBundle = compileCoreTask(data);
  const verified = await executeCoreCompletion(f.target, verifyBundle, { operation_id: 'core-verify', control_revision: candidate, judgment: 'pass', test_evidence: ['docs/verification.md'], lean_closeout: ['docs/brief.md'] }, { expected_order_sha256: verifyBundle.order_sha256 });
  assert.equal(verified.next_stage_ready, true, JSON.stringify(verified)); assert.equal((await itemState(f)).state, 'done');
  assert.equal(verified.result.mutation.testing_performed, false); // semantic judgment was supplied, never generated
});
