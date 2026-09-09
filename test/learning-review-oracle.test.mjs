import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertFaultOutcome, assertStatus, COVERAGES, createReviewFaultHook, defaultReviewExec, proveRetainedRecovery, REVIEW_CASE_IDS, runReviewAcceptance, seedReviewFixture, snapshotTree } from '../scripts/learning-review-oracle.mjs';
import { validateLearningIndex } from '../src/learning.mjs';
import { loadProjectContext } from '../src/project.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R1 = '1'.repeat(40);
function report(items) {
  return { items, summary: { total: items.length, ...Object.fromEntries(COVERAGES.map((value) => [value, items.filter((r) => r.coverage === value).length])) }, diagnostics: [] };
}
function row(patch = {}) {
  return { work_item_id: 'WI-0001', outcome_revision: R1, coverage: 'pending', receipt_id: null, disposition: null, prior_receipt_ids: [], learning_ids: ['LESSON-0001', 'LESSON-0002', 'PRACTICE-0001'], diagnostics: [], ...patch };
}
async function fixture(t) {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'temple-review-oracle-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  await fs.mkdir(path.join(temporary, 'project-overlay'), { recursive: true });
  await fs.cp(path.join(root, 'project-overlay/.ai-org'), path.join(temporary, 'project-overlay/.ai-org'), { recursive: true });
  return temporary;
}

// A deliberately narrow scripted adapter, not a reference feature implementation.
// Only the stated scenarios are qualified by these transcripts. Writes are actual
// synthetic files so read-only, persistence and canonical-mutation assertions run.
function scriptedAdapter({ wrongCoverage = false, mutateCanonical = false, duplicateReplay = false, mutateQuery = false } = {}) {
  const receipts = new Map();
  return async (args) => {
    const action = args[2], target = args[3];
    const wi = JSON.parse(await fs.readFile(path.join(target, '.ai-org/work-items/WI-0001.json'), 'utf8'));
    const previous = receipts.get(target);
    let value;
    if (action === 'record-review') {
      const disposition = args[args.indexOf('--disposition') + 1];
      const revision = args[args.indexOf('--outcome-revision') + 1];
      const history = previous?.history ?? [];
      const id = previous && previous.revision === revision && !duplicateReplay ? previous.id : `receipt-${history.length + 1}`;
      if (!history.includes(id)) history.push(id);
      receipts.set(target, { id, revision, disposition, history });
      const stored = path.join(target, '.ai-org/artifacts/learning-reviews/receipts.json');
      await fs.mkdir(path.dirname(stored), { recursive: true });
      await fs.writeFile(stored, JSON.stringify(receipts.get(target)));
      if (mutateCanonical) await fs.writeFile(path.join(target, '.ai-org/learning/index.json'), '{}');
      value = { receipt_id: id };
    } else {
      if (mutateQuery) await fs.mkdir(path.join(target, '.ai-org/artifacts/learning-reviews'), { recursive: true });
      value = report([row({ outcome_revision: wi.developer_candidate_revision, coverage: wrongCoverage ? 'reviewed' : !previous ? 'pending' : previous.revision === wi.developer_candidate_revision ? 'reviewed' : 'stale', receipt_id: previous?.id ?? null, disposition: previous?.disposition ?? null, prior_receipt_ids: previous?.history.filter((id) => id !== previous.id) ?? [] })]);
    }
    return { exit_code: 0, stdout: JSON.stringify(value), stderr: '', timed_out: false };
  };
}

test('twenty executable case IDs match the declared scenario without omission', async () => {
  const scenario = JSON.parse(await fs.readFile(path.join(root, 'test/fixtures/learning-review/scenario-cases.json'), 'utf8'));
  assert.deepEqual(REVIEW_CASE_IDS, scenario.cases.map((c) => c.id));
});

test('seeded targets satisfy real installation and existing public CLI prerequisites', async t => {
  const productRoot = await fixture(t), target = path.join(productRoot, '.git/acceptance/installed-control');
  await seedReviewFixture({ productRoot, target });
  const context = await loadProjectContext(target);
  assert.equal(context.project.id, 'review-acceptance-fixture');
  assert.ok(context.lock.managed_files.length > 0);
  const before = await snapshotTree(target);
  const result = await defaultReviewExec([path.join(root, 'bin/temple.mjs'), 'learning', 'list', target, '--json']);
  assert.equal(result.exit_code, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).entries.length, 3);
  assert.deepEqual(await snapshotTree(target), before);
  await fs.rm(path.join(target, 'temple.lock'));
  await assert.rejects(loadProjectContext(target), /Temple is not installed/);
});

test('uninstalled target diagnostics are instrument faults and stop later product cases', async t => {
  const productRoot = await fixture(t);
  let calls = 0;
  const result = await runReviewAcceptance({ productRoot, caseIds: ['S1-01', 'S1-02'], exec: async () => {
    calls++;
    return { exit_code: 1, stdout: '', stderr: 'Temple error: Temple is not installed in fixture; run temple init first', timed_out: false };
  } });
  assert.equal(calls, 1);
  assert.equal(result.instrument_failure.code, 'fixture-not-installed');
  assert.equal(result.cases[0].failure_kind, 'instrument_failure');
});

test('public report control accepts complete rows and rejects sorted/count/enum omissions', () => {
  assertStatus(report([row()]), ['WI-0001']);
  const examples = [report([row({ coverage: 'completed' })]), report([row({ diagnostics: null })]), report([row({ prior_receipt_ids: ['old', 'old'] })])];
  const badCount = report([row()]); badCount.summary.reviewed = 1; examples.push(badCount);
  const missingRevision = report([row()]); delete missingRevision.items[0].outcome_revision; examples.push(missingRevision);
  for (const candidate of examples) assert.throws(() => assertStatus(candidate, ['WI-0001']));
  assert.throws(() => assertStatus(report([row({ work_item_id: 'WI-0002' }), row()]), ['WI-0001', 'WI-0002']));
});

test('fault interpretation permits complete old or new and explicit recovery but rejects partial success', () => {
  const failed = { exit_code: 86, stdout: '' };
  const success = { exit_code: 0, stdout: '{"receipt_id":"new"}' };
  const prior = row({ coverage: 'follow-up', receipt_id: 'old', disposition: 'deferred' });
  const complete = row({ coverage: 'reviewed', receipt_id: 'new', disposition: 'no-new-learning', prior_receipt_ids: ['old'] });
  const recoverable = row({ coverage: 'unknown', diagnostics: ['incomplete publication; inspect recovery instructions'] });
  assertFaultOutcome(prior, 'old', failed);
  assertFaultOutcome(complete, 'old', failed);
  assertFaultOutcome(complete, 'old', success);
  assert.throws(()=>assertFaultOutcome(recoverable, 'old', failed),/recovery evidence/);
  assertFaultOutcome(recoverable, 'old', failed,[],{source:'retained-post-fault-bytes',complete:true,receipt_id:'old'});
  assert.throws(() => assertFaultOutcome(prior, 'old', success));
  assert.throws(() => assertFaultOutcome(recoverable, 'old', success));
  assert.throws(() => assertFaultOutcome({ ...complete, prior_receipt_ids: [] }, 'old', failed));
  assert.throws(() => assertFaultOutcome({ ...recoverable, diagnostics: [] }, 'old', failed));
});

test('recovery proof uses only retained post-fault bytes and rejects permanent history loss',async t=>{
  const temp=await fixture(t),target=path.join(temp,'case'),storage=path.join(target,'.ai-org/artifacts/learning-reviews');
  await fs.mkdir(storage,{recursive:true});await fs.writeFile(path.join(storage,'opaque'),'old-history');
  const priorStorage=await snapshotTree(storage);await fs.rename(path.join(storage,'opaque'),path.join(storage,'backup'));await fs.writeFile(path.join(storage,'opaque'),'partial-new');
  const query=async recovered=>{assert.equal(await fs.readFile(path.join(recovered,'.ai-org/artifacts/learning-reviews/opaque'),'utf8'),'old-history');return report([row({coverage:'follow-up',receipt_id:'old',disposition:'deferred'})]);};
  const proof=await proveRetainedRecovery({target,recoveredTarget:path.join(temp,'recovered'),priorStorage,oldReceiptId:'old',query});
  assert.equal(proof.complete,true);await fs.rm(path.join(storage,'backup'));
  await assert.rejects(proveRetainedRecovery({target,recoveredTarget:path.join(temp,'lost'),priorStorage,oldReceiptId:'old',query}),e=>e.instrumentFailure===true&&e.code==='recovery-not-qualified');
  assert.throws(()=>assertFaultOutcome(row({coverage:'unknown',diagnostics:['All receipt history permanently lost; recovery unavailable']}),'old',{exit_code:86,stdout:''}),/recovery evidence/);
});

test('positive replay and revision transcripts execute filesystem assertions without generation', async (t) => {
  const productRoot = await fixture(t);
  const result = await runReviewAcceptance({ productRoot, exec: scriptedAdapter(), caseIds: ['S1-01', 'S1-02', 'S1-03', 'S1-06', 'S1-09', 'S1-12'] });
  assert.equal(result.selected_cases_passed, true, JSON.stringify(result));
  assert.equal(result.passed, false, 'partial controls cannot claim full twenty-case product acceptance');
  assert.ok(result.command_count > 10);
});

for (const [title, defect, cases] of [
  ['fabricated reviewed status', { wrongCoverage: true }, ['S1-01', 'S1-03']],
  ['write query', { mutateQuery: true }, ['S1-01']],
  ['Learning mutation', { mutateCanonical: true }, ['S1-02']],
  ['duplicate replay', { duplicateReplay: true }, ['S1-09', 'S1-12']]
]) test(`negative behavioral control rejects ${title}`, async (t) => {
  const productRoot = await fixture(t);
  const result = await runReviewAcceptance({ productRoot, exec: scriptedAdapter(defect), caseIds: cases });
  assert.equal(result.selected_cases_passed, false);
  assert.ok(result.cases.every((c) => !c.passed), JSON.stringify(result));
});

test('missing feature is a candidate failure while timeouts are instrument failures', async (t) => {
  const productRoot = await fixture(t);
  let result = await runReviewAcceptance({ productRoot, exec: async () => ({ exit_code: 1, stdout: '', stderr: 'Unknown command', timed_out: false }), caseIds: ['S1-01'] });
  assert.equal(result.cases[0].passed, false);
  assert.equal(result.cases[0].failure_kind, 'candidate_failure');
  assert.equal(result.instrument_failure, null);
  result = await runReviewAcceptance({ productRoot, scratchRoot: path.join(productRoot, '.git/acceptance/timeout'), exec: async () => ({ exit_code: 1, stdout: '', stderr: '', timed_out: true }), caseIds: ['S1-01'] });
  assert.match(result.cases[0].error, /timed out/);
  assert.equal(result.instrument_failure.code, 'command-timeout');
});

for (const [name, failure] of [
  ['tagged throw', async () => { throw Object.assign(new Error('isolation failed'), { instrumentFailure: true, code: 'isolation-failed' }); }],
  ['cleanup throw', async () => { throw Object.assign(new Error('cleanup pending'), { cleanup_failure: { pid: 123 } }); }],
  ['result cleanup failure', async () => ({ exit_code: 0, stdout: '{}', stderr: '', timed_out: false, cleanup_failure: 'unconfirmed' })],
  ['result instrument failure', async () => ({ exit_code: 1, stdout: '', stderr: '', timed_out: false, instrument_failure: { code: 'sandbox-denied', message: 'sandbox unavailable' } })],
  ['unrecognized envelope', async () => ({ status: 'success' })]
]) test(`infrastructure ${name} stops oracle before later cases or repair classification`, async (t) => {
  const productRoot = await fixture(t);
  let calls = 0;
  const result = await runReviewAcceptance({ productRoot, exec: async (...args) => { calls++; return failure(...args); }, caseIds: ['S1-01', 'S1-02'] });
  assert.equal(calls, 1);
  assert.equal(result.cases.length, 1);
  assert.equal(result.cases[0].failure_kind, 'instrument_failure');
  assert.ok(result.instrument_failure);
  assert.equal(result.passed, false);
});

test('fault without a reached marker is an instrument failure even if command succeeds', async (t) => {
  const productRoot = await fixture(t), scripted = scriptedAdapter();
  const result = await runReviewAcceptance({ productRoot, exec: (args) => scripted(args[0] === '--import' ? args.slice(2) : args), caseIds: ['S1-16', 'S1-01'] });
  assert.equal(result.instrument_failure?.code, 'fault-not-exercised', JSON.stringify(result));
  assert.equal(result.cases.length, 1);
});

test('concurrent executor failure waits for the other command cleanup before returning', async (t) => {
  const productRoot = await fixture(t);
  let calls = 0, otherFinished = false;
  const result = await runReviewAcceptance({ productRoot, caseIds: ['S1-12', 'S1-01'], exec: async () => {
    calls++;
    if (calls === 1) throw Object.assign(new Error('failed first subprocess'), { instrumentFailure: true });
    await new Promise((resolve) => setTimeout(resolve, 30));
    otherFinished = true;
    return { exit_code: 0, stdout: '{"receipt_id":"second"}', stderr: '', timed_out: false };
  } });
  assert.equal(otherFinished, true);
  assert.equal(calls, 2);
  assert.equal(result.cases.length, 1);
  assert.ok(result.instrument_failure);
});

test('fixture reuse is an instrument failure and preserves the prior observation', async (t) => {
  const productRoot = await fixture(t);
  const first = await runReviewAcceptance({ productRoot, exec: scriptedAdapter(), caseIds: ['S1-01'] });
  assert.equal(first.selected_cases_passed, true);
  const again = await runReviewAcceptance({ productRoot, exec: () => assert.fail('must not execute'), caseIds: ['S1-01', 'S1-02'] });
  assert.equal(again.instrument_failure.code, 'fixture-already-exists');
  assert.equal(again.command_count, 0);
});

test('synthetic dataset has declared sizes, legitimate references, and snapshot detects structural writes', async (t) => {
  const productRoot = await fixture(t), target = path.join(productRoot, '.git/acceptance/fixture-control');
  await seedReviewFixture({ productRoot, target, count: 1000, learningCount: 200 });
  const items = await fs.readdir(path.join(target, '.ai-org/work-items'));
  assert.equal(items.filter((p) => /^WI-\d+\.json$/.test(p)).length, 1000);
  const index = JSON.parse(await fs.readFile(path.join(target, '.ai-org/learning/index.json'), 'utf8'));
  assert.equal(index.entries.length, 200);
  assert.deepEqual(validateLearningIndex(index), { valid: true, errors: [] });
  assert.equal(new Set(index.entries.map((e) => e.id)).size, 200);
  for (const entry of index.entries) await fs.access(path.join(target, entry.path));
  const before = await snapshotTree(target);
  await fs.mkdir(path.join(target, '.ai-org/artifacts/learning-reviews'), { recursive: true });
  assert.notDeepEqual(await snapshotTree(target), before);
});

test('exec adapter runs Node without shell interpolation and enforces timeout', async () => {
  assert.deepEqual(await defaultReviewExec(['-e', 'process.stdout.write("ok")']), { exit_code: 0, stdout: 'ok', stderr: '', timed_out: false });
  const result = await defaultReviewExec(['-e', 'setInterval(()=>{},1000)'], { timeout: 50 });
  assert.equal(result.timed_out, true);
  assert.notEqual(result.exit_code, 0);
});

test('actual Node fault probes qualify before-write failure and interrupted partial publication', async (t) => {
  const productRoot = await fixture(t), target = path.join(productRoot, '.git/acceptance/faults');
  const storage = path.join(target, '.ai-org/artifacts/learning-reviews/receipt.json');
  await fs.mkdir(path.dirname(storage), { recursive: true });
  for (const mode of ['throw', 'exit']) {
    await fs.writeFile(storage, '{"old":true}');
    const { hook, marker } = await createReviewFaultHook(target, path.join(productRoot, '.git/acceptance/hooks'), mode);
    const result = await defaultReviewExec(['--import', hook, '--input-type=module', '-e', `import fs from 'node:fs/promises';await fs.writeFile(${JSON.stringify(storage)},'{"complete":true}');`]);
    assert.notEqual(result.exit_code, 0);
    assert.equal(await fs.readFile(marker, 'utf8'), 'reached');
    const body = await fs.readFile(storage, 'utf8');
    if (mode === 'throw') assert.equal(body, '{"old":true}');
    else { assert.equal(result.exit_code, 86); assert.throws(() => JSON.parse(body)); }
  }
});

test('fault probes reach existing durable FileHandle writes and preserve the published prior record', async t => {
  const productRoot = await fixture(t), target = path.join(productRoot, '.git/acceptance/durable-faults');
  const storage = path.join(target, '.ai-org/artifacts/learning-reviews');
  await fs.mkdir(storage, { recursive: true });
  const old = path.join(storage, 'old.json'), next = path.join(storage, 'next.json');
  await fs.writeFile(old, '{"old":true}');
  for (const mode of ['throw', 'exit']) {
    const {hook, marker} = await createReviewFaultHook(target, path.join(productRoot, '.git/acceptance/durable-hooks'), mode);
    const result = await defaultReviewExec(['--import', hook, '--input-type=module', '-e', `import {durableAtomicCreate} from ${JSON.stringify(path.join(root, 'src/files.mjs'))};await durableAtomicCreate(${JSON.stringify(next)},'{"complete":true}');`]);
    assert.notEqual(result.exit_code, 0);
    assert.equal(await fs.readFile(marker, 'utf8'), 'reached');
    assert.equal(await fs.readFile(old, 'utf8'), '{"old":true}');
    await assert.rejects(fs.access(next), {code: 'ENOENT'});
    if (mode === 'exit') assert.equal(result.exit_code, 86);
  }
});
