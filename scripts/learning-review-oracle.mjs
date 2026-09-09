import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { planInit, executeInit } from '../src/install.mjs';
import { validateInitConfig } from '../src/model.mjs';
import { loadProjectContext } from '../src/project.mjs';

export const REVIEW_CASE_IDS = Array.from({ length: 20 }, (_, i) => `S1-${String(i + 1).padStart(2, '0')}`);
export const COVERAGES = ['pending', 'reviewed', 'follow-up', 'stale', 'ineligible', 'unknown'];
const R1 = '1'.repeat(40), R2 = '2'.repeat(40);
const E1 = 'docs/outcome.md', E2 = 'docs/second.md';
const REVIEW_DIR = '.ai-org/artifacts/learning-reviews';
const wiId = (n) => `WI-${String(n).padStart(4, '0')}`;
const hash = (x) => createHash('sha256').update(x).digest('hex');
const json = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const write = async (p, value) => { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`); };
function instrumentError(code, message, details = {}) {
  return Object.assign(new Error(message), { instrumentFailure: true, code, ...details });
}
const isInstrumentError = (error) => Boolean(error?.instrumentFailure || error?.instrument_failure || error?.cleanup_failure);
const fileEntries = (snapshot) => Object.fromEntries(Object.entries(snapshot).filter(([, value]) => value !== 'directory'));
async function requireInstrumentFile(file, validate, code) {
  let body;
  try { body = await fs.readFile(file, 'utf8'); } catch (error) { throw instrumentError(code, `Instrumentation output unavailable: ${file}: ${error.message}`); }
  if (!validate(body)) throw instrumentError(code, `Instrumentation output invalid: ${file}`);
  return body;
}

export function defaultReviewExec(args, options = {}) {
  return new Promise((resolve) => execFile(process.execPath, args, { encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024, ...options }, (error, stdout, stderr) => resolve({ exit_code: error ? (Number.isInteger(error.code) ? error.code : 1) : 0, stdout, stderr, timed_out: Boolean(error?.killed), ...(typeof error?.code === 'string' ? { instrument_failure: { code: error.code, message: error.message } } : {}) })));
}

// Includes directory creation and symlinks, not only JSON bodies. Does not follow links.
export async function snapshotTree(root) {
  const result = {};
  async function visit(relative) {
    const absolute = path.join(root, relative);
    let stat;
    try { stat = await fs.lstat(absolute); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (stat.isSymbolicLink()) result[relative] = `link:${await fs.readlink(absolute)}`;
    else if (stat.isDirectory()) { result[relative] = 'directory'; for (const name of (await fs.readdir(absolute)).sort()) await visit(path.join(relative, name)); }
    else result[relative] = `${stat.mode}:${hash(await fs.readFile(absolute))}`;
  }
  await visit('');
  return result;
}

export function assertStatus(report, expectedIds) {
  assert.ok(report && Array.isArray(report.items), 'status requires items array');
  assert.ok(Array.isArray(report.diagnostics), 'status requires global diagnostics');
  assert.deepEqual(report.items.map((r) => r.work_item_id), [...expectedIds].sort(), 'exact sorted Work Item rows');
  assert.equal(report.summary?.total, report.items.length, 'summary total reconciles');
  for (const row of report.items) {
    assert.ok(COVERAGES.includes(row.coverage), 'known coverage');
    assert.ok(row.outcome_revision === null || typeof row.outcome_revision === 'string', 'explicit outcome revision');
    assert.ok(row.receipt_id === null || typeof row.receipt_id === 'string', 'explicit receipt ID');
    assert.ok(row.disposition === null || typeof row.disposition === 'string', 'explicit disposition');
    for (const field of ['prior_receipt_ids', 'learning_ids', 'diagnostics']) assert.ok(Array.isArray(row[field]), `${field} is an array`);
    for (const id of [...row.prior_receipt_ids, ...row.learning_ids]) assert.equal(typeof id, 'string');
    assert.equal(new Set(row.prior_receipt_ids).size, row.prior_receipt_ids.length, 'history has no duplicate IDs');
  }
  for (const coverage of COVERAGES) assert.equal(report.summary?.[coverage], report.items.filter((r) => r.coverage === coverage).length, `${coverage} count reconciles`);
  return report;
}

export function assertFaultOutcome(row, oldReceiptId, commandResult, globalDiagnostics = [], recoveryProof = null) {
  const ids = new Set([row.receipt_id, ...row.prior_receipt_ids].filter(Boolean));
  assert.ok(['follow-up', 'reviewed', 'unknown'].includes(row.coverage), 'crash did not preserve complete old/new or explicit recoverable state');
  if (row.coverage === 'follow-up') { assert.equal(row.receipt_id, oldReceiptId); assert.equal(row.disposition, 'deferred'); }
  else if (row.coverage === 'reviewed') { assert.ok(ids.has(oldReceiptId)); assert.notEqual(row.receipt_id, oldReceiptId); assert.equal(row.disposition, 'no-new-learning'); assert.equal(ids.size, 2); }
  else {
    assert.ok(row.diagnostics.length > 0 || globalDiagnostics.length > 0);
    assert.ok(recoveryProof?.source === 'retained-post-fault-bytes' && recoveryProof.complete === true && recoveryProof.receipt_id === oldReceiptId, 'unknown diagnostics are not recovery evidence');
  }
  if (commandResult.exit_code === 0) {
    assert.equal(row.coverage, 'reviewed', 'CLI claimed partial success');
    let output; try { output = JSON.parse(commandResult.stdout); } catch { assert.fail('successful faulted command returned invalid JSON'); }
    assert.equal(output.receipt_id, row.receipt_id);
  }
}

// Prove one layout-neutral recovery route using bytes still present AFTER failure.
// The fixture's separate original backup is never a source for this proof.
export async function proveRetainedRecovery({target,recoveredTarget,priorStorage,oldReceiptId,query}) {
  const reviewRoot=path.join(target,REVIEW_DIR),current=await snapshotTree(reviewRoot);
  const files=Object.entries(priorStorage).filter(([,v])=>v!=='directory'&&!v.startsWith('link:'));
  if(!files.length)throw instrumentError('recovery-not-qualified','No prior physical history to validate');
  const retained=[];
  for(const [relative,signature] of files){
    const match=Object.entries(current).find(([,v])=>v!=='directory'&&!v.startsWith('link:')&&v.split(':').at(-1)===signature.split(':').at(-1));
    if(!match)throw instrumentError('recovery-not-qualified','Unknown state has no qualified retained-byte recovery route; do not score it as recoverable');
    retained.push({relative,body:await fs.readFile(path.join(reviewRoot,match[0])),mode:Number(signature.split(':')[0])});
  }
  await fs.cp(target,recoveredTarget,{recursive:true,errorOnExist:true,force:false});
  const recoveredStorage=path.join(recoveredTarget,REVIEW_DIR);await fs.rm(recoveredStorage,{recursive:true,force:true});
  for(const f of retained){await fs.mkdir(path.dirname(path.join(recoveredStorage,f.relative)),{recursive:true});await fs.writeFile(path.join(recoveredStorage,f.relative),f.body,{mode:f.mode});}
  const before=await snapshotTree(recoveredTarget),report=await query(recoveredTarget);
  assert.deepEqual(await snapshotTree(recoveredTarget),before,'recovered status mutated data');
  const row=assertStatus(report,['WI-0001']).items[0];
  assert.equal(row.coverage,'follow-up','retained bytes did not recover complete prior state');
  assert.equal(row.receipt_id,oldReceiptId);assert.equal(row.disposition,'deferred');
  return{source:'retained-post-fault-bytes',complete:true,receipt_id:oldReceiptId,retained_file_count:retained.length};
}

export async function seedReviewFixture({ productRoot, target, count = 1, learningCount = 3 }) {
  // An overlay is distribution data, not an installed project. Use the pinned
  // coordinator installer so existing CLI installation checks remain meaningful.
  try {
    const config = await json(path.resolve(import.meta.dirname, '../docs/getting-started/temple-init.example.json'));
    config.project = { id: 'review-acceptance-fixture', name: 'Review acceptance fixture' };
    config.repository_integration = { schema_version: 'temple.repository-integration/v1', status: 'confirmed', authority: 'project', source: 'human-confirmed', policy_refs: [], summary: 'Authorized local synthetic experiment; no external integration', integration_target: 'main', change_isolation: 'not-required', review_gate: 'not-required', recorded_at: '2026-09-08T00:00:00Z', recorded_by: 'human' };
    const plan = await planInit(target, await validateInitConfig(config));
    if (plan.conflicts.length) throw new Error(plan.conflicts.join('; '));
    await executeInit(plan);
    await loadProjectContext(target);
  } catch (error) { throw instrumentError('fixture-initialization-failed', error.message); }
  const template = await json(path.join(productRoot, 'project-overlay/.ai-org/templates/work-item.json'));
  for (let i = 1; i <= count; i++) {
    await write(path.join(target, `.ai-org/work-items/${wiId(i)}.json`), { ...template, id: wiId(i), title: `Synthetic outcome ${i}`, state: 'done', base_revision: R1, developer_candidate_revision: R1, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', evidence: [E1] });
  }
  await write(path.join(target, E1), 'Synthetic acceptance evidence version one.\n');
  await write(path.join(target, E2), 'Synthetic second evidence.\n');
  const entries = [];
  for (let i = 1; i <= learningCount; i++) {
    const kind = i === 3 ? 'practice' : 'lesson';
    const id = `${kind.toUpperCase()}-${String(i === 3 ? 1 : i).padStart(4, '0')}`;
    const relative = `.ai-org/learning/${kind === 'lesson' ? 'lessons' : 'practices'}/${id}.md`;
    entries.push({ id, kind, title: `Synthetic ${id}`, summary: 'Synthetic bounded finding', status: i === 2 ? 'candidate' : (kind === 'lesson' ? 'validated' : 'active'), confidence: 'medium', tags: [], applies_to: [], source_work_items: ['WI-0001'], path: relative, updated_at: '2026-09-01T00:00:00Z', last_validated_at: null, promotion: { target: 'none', status: 'none', reference: null }, derived_from: [], owner_position: null, revalidation: { last_result: null, review_after: null, evidence_refs: [], history: [] } });
    await write(path.join(target, relative), `# ${id}\n\nSynthetic finding; not project learning.\n`);
  }
  await write(path.join(target, '.ai-org/learning/index.json'), { schema_version: 'ai-org.learning-index/v2', entries });
  return target;
}

function recordArgs(target, options = {}) {
  const args = ['learning', 'record-review', target, '--work-item', options.id ?? 'WI-0001', '--outcome-revision', options.revision ?? R1, '--disposition', options.disposition ?? 'no-new-learning', '--reason', options.reason ?? 'No reusable finding', '--actor', 'human'];
  for (const evidence of options.evidence ?? [E1]) args.push('--evidence', evidence);
  for (const id of options.learning ?? []) args.push('--learning-id', id);
  if (options.expected) args.push('--expected-review-id', options.expected);
  return [...args, '--json'];
}

// Faults instrument generic Node filesystem boundaries, never candidate-private APIs.
// A reached marker is mandatory: an unsupported I/O mechanism is inconclusive/fail.
export async function createReviewFaultHook(target, scratch, mode) {
  const marker = path.join(scratch, `fault-${mode}.hit`), hook = path.join(scratch, `fault-${mode}.mjs`);
  assert.ok(['throw', 'exit'].includes(mode));
  await write(hook, `import fs from 'node:fs'; import fsp from 'node:fs/promises'; import {syncBuiltinESMExports} from 'node:module';\nconst marker=${JSON.stringify(marker)},root=${JSON.stringify(path.join(target, REVIEW_DIR))};\nconst original=fs.writeFileSync; function hit(p,data,name){ if(String(p).startsWith(root+'/')){original(marker,'reached'); ${mode === 'exit' ? "if(name.includes('writeFile')&&(typeof data==='string'||Buffer.isBuffer(data))){const bytes=Buffer.from(data);original(p,bytes.subarray(0,Math.max(1,Math.floor(bytes.length/2))));}process.exit(86);" : "throw new Error('ORACLE_INJECTED_PRECOMMIT_FAILURE');"} }}\nfor(const name of ['writeFile','appendFile','rename']){const fn=fsp[name].bind(fsp);fsp[name]=async(...args)=>{hit(name==='rename'?args[1]:args[0],args[1],name);return fn(...args);};}\nfor(const name of ['writeFileSync','appendFileSync','renameSync']){const fn=fs[name].bind(fs);fs[name]=(...args)=>{hit(name==='renameSync'?args[1]:args[0],args[1],name);return fn(...args);};}\nsyncBuiltinESMExports();\n`);
  // Durable repository writes use FileHandle.writeFile after fs.open, rather
  // than the convenience functions above. Instrument that public API too.
  await fs.appendFile(hook, `const open=fsp.open.bind(fsp);fsp.open=async(p,...args)=>{const handle=await open(p,...args);for(const name of ['writeFile','write','writev']){const original=handle[name].bind(handle);handle[name]=async(...values)=>{hit(p,name==='writev'?Buffer.concat(values[0]):values[0],name);return original(...values);};}return handle;};syncBuiltinESMExports();\n`);
  return { hook, marker };
}

async function readCountHook(target, scratch) {
  const output = path.join(scratch, 'reads.json'), hook = path.join(scratch, 'read-count.mjs');
  await write(hook, `import fs from 'node:fs';import fsp from 'node:fs/promises';import {syncBuiltinESMExports} from 'node:module';const root=${JSON.stringify(target + path.sep)},output=${JSON.stringify(output)};const counts={readFile:0,readFileSync:0};for(const [api,name]of [[fsp,'readFile'],[fs,'readFileSync']]){const original=api[name].bind(api);api[name]=(...args)=>{if(String(args[0]).startsWith(root))counts[name]++;return original(...args);};}syncBuiltinESMExports();process.on('exit',()=>fs.writeFileSync(output,JSON.stringify(counts)));`);
  return { hook, output };
}

export async function runReviewAcceptance({ productRoot, scratchRoot = path.join(productRoot, '.git/acceptance'), exec = defaultReviewExec, caseIds = REVIEW_CASE_IDS }) {
  const relativeScratch = path.relative(path.join(productRoot, '.git/acceptance'), scratchRoot);
  if (!(relativeScratch === '' || (!relativeScratch.startsWith('..') && !path.isAbsolute(relativeScratch)))) throw instrumentError('invalid-scratch-root', 'scratch must stay inside productRoot/.git/acceptance');
  if (!(caseIds.every((id) => REVIEW_CASE_IDS.includes(id)) && new Set(caseIds).size === caseIds.length)) throw instrumentError('invalid-case-selection', 'known unique case IDs required');
  try { await fs.mkdir(scratchRoot, { recursive: true }); } catch (error) { throw instrumentError('scratch-unavailable', error.message); }
  const results = [], observations = {};
  let instrumentFailure = null;
  let commandCount = 0;
  for (const caseId of caseIds) {
    const started = Date.now();
    const target = path.join(scratchRoot, caseId);
    try {
      // Reuse would mask first-use and replay semantics; a run gets fresh case roots.
      if (await fs.access(target).then(() => true, () => false)) throw instrumentError('fixture-already-exists', 'fixture path already exists; use a fresh run scratch');
      await seedReviewFixture({ productRoot, target, count: caseId === 'S1-18' ? 1000 : 1, learningCount: caseId === 'S1-18' ? 200 : 3 });
      const cli = path.join(productRoot, 'bin/temple.mjs');
      const call = async (args, prefix = []) => {
        commandCount++;
        let result;
        try { result = await exec([...prefix, cli, ...args], { cwd: productRoot, timeout: 30000, maxBuffer: 8 * 1024 * 1024 }); }
        catch (error) { throw instrumentError(error?.code ?? 'executor-threw', error.message ?? String(error), { cleanup_failure: error?.cleanup_failure ?? null }); }
        if (isInstrumentError(result)) throw instrumentError(result.instrument_failure?.code ?? 'executor-instrument-failure', result.instrument_failure?.message ?? result.error ?? 'Executor reported instrument/cleanup failure', { cleanup_failure: result.cleanup_failure ?? null });
        if (result?.timed_out) throw instrumentError('command-timeout', 'CLI timed out; execution and cleanup require qualification');
        if (!result || !Number.isInteger(result.exit_code) || typeof result.stdout !== 'string' || typeof result.stderr !== 'string') throw instrumentError('invalid-executor-result', 'Executor returned an invalid result envelope');
        if (/Temple is not installed in .*run temple init first/su.test(result.stderr)) throw instrumentError('fixture-not-installed', 'The acceptance target did not reach product behavior because installation is missing');
        return result;
      };
      const concurrentCalls = async (requests) => {
        // Join every subprocess and its adapter cleanup even if one throws early.
        const settled = await Promise.allSettled(requests.map((args) => call(args)));
        const failures = settled.filter((r) => r.status === 'rejected');
        if (failures.length) throw instrumentError(failures[0].reason.code ?? 'concurrent-executor-failure', failures.map((r) => r.reason.message).join('; '), { cleanup_failure: failures.map((r) => r.reason.cleanup_failure).filter(Boolean) });
        return settled.map((r) => r.value);
      };
      const parse = (result) => { assert.equal(result.exit_code, 0, `${result.stderr}\n${result.stdout}`); try { return JSON.parse(result.stdout); } catch { assert.fail('CLI success did not return JSON'); } };
      const status = async (ids = ['WI-0001'], prefix = []) => {
        const before = await snapshotTree(target);
        const begin = Date.now();
        const result = await call(['learning', 'review-status', target, ...(ids.length === 1 ? ['--work-item', ids[0]] : []), '--json'], prefix);
        if (caseId === 'S1-18') observations.dataset_query_ms = Date.now() - begin;
        assert.deepEqual(await snapshotTree(target), before, 'status mutated project');
        return assertStatus(parse(result), ids);
      };
      const row = async () => (await status()).items[0];
      const coverage = async (value) => { const r = await row(); assert.equal(r.coverage, value); return r; };
      const canonical = async () => {
        const tree = await snapshotTree(target);
        return Object.fromEntries(Object.entries(tree).filter(([p]) => !p.startsWith(REVIEW_DIR) && p !== '.ai-org/artifacts'));
      };
      const record = async (options = {}, expectSuccess = true, prefix = []) => {
        const before = await canonical();
        const result = await call(recordArgs(target, options), prefix);
        assert.deepEqual(await canonical(), before, 'record changed unrelated/project canonical data');
        if (!expectSuccess) { assert.notEqual(result.exit_code, 0, 'invalid write succeeded'); return result; }
        const output = parse(result); assert.ok(typeof output.receipt_id === 'string' && output.receipt_id.length > 0, 'stable receipt_id required'); return output.receipt_id;
      };
      const mutateWI = async (patch) => { const p = path.join(target, '.ai-org/work-items/WI-0001.json'); await write(p, { ...await json(p), ...patch }); };
      const history = (r) => new Set([r.receipt_id, ...r.prior_receipt_ids].filter(Boolean));
      const invalid = async (options) => { const before = fileEntries(await snapshotTree(path.join(target, REVIEW_DIR))); await record(options, false); assert.deepEqual(fileEntries(await snapshotTree(path.join(target, REVIEW_DIR))), before, 'invalid request left review file writes'); };
      const corrupt = async () => {
        const files = Object.entries(await snapshotTree(path.join(target, REVIEW_DIR))).filter(([, value]) => value !== 'directory' && !value.startsWith('link:')).map(([p]) => p);
        assert.ok(files.length > 0, 'no stored receipt artifact found for corruption probe');
        for (const p of files) await write(path.join(target, REVIEW_DIR, p), '{malformed');
        const r = await coverage('unknown'); assert.ok(r.diagnostics.length > 0 || (await status()).diagnostics.length > 0, 'corruption diagnostics absent');
      };

      switch (caseId) {
        case 'S1-01': { const r = await coverage('pending'); assert.equal(r.outcome_revision, R1); assert.equal(r.receipt_id, null); break; }
        case 'S1-02': {
          const sentinel = 'ORACLE_PRIVATE_EVIDENCE_BODY_MUST_NOT_BE_STORED';
          await write(path.join(target, E1), `${sentinel}\n${'Synthetic evidence body. '.repeat(5000)}`);
          const id = await record(); const r = await coverage('reviewed'); assert.equal(r.receipt_id, id); assert.equal(r.disposition, 'no-new-learning');
          const files = await snapshotTree(path.join(target, REVIEW_DIR));
          for (const [relative, info] of Object.entries(files)) if (info !== 'directory' && !info.startsWith('link:')) assert.equal((await fs.readFile(path.join(target, REVIEW_DIR, relative), 'utf8')).includes(sentinel), false, 'receipt leaked evidence body');
          break;
        }
        case 'S1-03': { const r = await coverage('pending'); assert.ok(r.learning_ids.includes('LESSON-0001'), 'related indexed learning not exposed'); break; }
        case 'S1-04': { await record({ disposition: 'linked-existing', learning: ['LESSON-0001'] }); assert.ok((await coverage('reviewed')).learning_ids.includes('LESSON-0001')); break; }
        case 'S1-05': { await record({ disposition: 'candidate-captured', learning: ['LESSON-0002'] }); await coverage('reviewed'); break; }
        case 'S1-06': { const old = await record(); await mutateWI({ developer_candidate_revision: R2 }); assert.ok(history(await coverage('stale')).has(old)); const current = await record({ revision: R2 }); const r = await coverage('reviewed'); assert.notEqual(current, old); assert.ok(history(r).has(old)); assert.equal(r.outcome_revision, R2); break; }
        case 'S1-07': { const old = await record(); await write(path.join(target, E1), 'Changed evidence content\n'); assert.ok(history(await coverage('stale')).has(old)); break; }
        case 'S1-08': { await record(); await mutateWI({ evidence: [E1, E2] }); await coverage('stale'); await record({ evidence: [E1, E2] }); await mutateWI({ evidence: [E1] }); await coverage('stale'); break; }
        case 'S1-09': { await mutateWI({ evidence: [E1, E2] }); const id = await record({ evidence: [E1, E2], disposition: 'linked-existing', learning: ['LESSON-0001', 'LESSON-0002'] }); const before = await snapshotTree(path.join(target, REVIEW_DIR)); assert.equal(await record({ evidence: [E2, E1], disposition: 'linked-existing', learning: ['LESSON-0002', 'LESSON-0001'] }), id); assert.deepEqual(await snapshotTree(path.join(target, REVIEW_DIR)), before); assert.equal(history(await coverage('reviewed')).size, 1); break; }
        case 'S1-10': { const old = await record({ disposition: 'deferred' }); await coverage('follow-up'); await invalid({}); const next = await record({ expected: old }); const r = await coverage('reviewed'); assert.notEqual(next, old); assert.equal(history(r).size, 2); assert.ok(history(r).has(old)); break; }
        case 'S1-11': { const old = await record({ disposition: 'deferred' }); const before = await canonical(); const outputs = await concurrentCalls([recordArgs(target, { expected: old }), recordArgs(target, { expected: old, disposition: 'linked-existing', learning: ['LESSON-0001'] })]); assert.deepEqual(await canonical(), before); assert.equal(outputs.filter((o) => o.exit_code === 0).length, 1, 'exactly one conflicting replacement wins'); const r = await coverage('reviewed'); assert.equal(history(r).size, 2); assert.ok(history(r).has(old)); break; }
        case 'S1-12': { const before = await canonical(); const outputs = await concurrentCalls([recordArgs(target), recordArgs(target)]); const ids = outputs.map((o) => parse(o).receipt_id); assert.deepEqual(await canonical(), before); assert.ok(ids[0]); assert.equal(ids[0], ids[1]); const r = await coverage('reviewed'); assert.equal(r.receipt_id, ids[0]); assert.equal(history(r).size, 1); break; }
        case 'S1-13': { for (const options of [{ disposition: 'linked-existing', learning: ['LESSON-9999'] }, { disposition: 'candidate-captured', learning: ['PRACTICE-0001'] }, { disposition: 'candidate-captured', learning: ['LESSON-0001'] }, { learning: ['LESSON-0001'] }, { disposition: 'linked-existing' }, { disposition: 'deferred', reason: '' }]) await invalid(options); break; }
        case 'S1-14': {
          for (const options of [{ id: 'WI-9999' }, { revision: R2 }, { evidence: [E2] }, { reason: '' }]) await invalid(options);
          const outside = path.join(scratchRoot, 'outside.md'); await write(outside, 'outside evidence');
          await fs.symlink(outside, path.join(target, 'docs/escape.md'));
          for (const ref of ['../../outside.md', outside, 'docs/escape.md', 'docs/missing.md', 'https://example.invalid/evidence']) { await mutateWI({ evidence: [ref] }); await invalid({ evidence: [ref] }); }
          await mutateWI({ evidence: [E1, E2] }); await invalid({ evidence: [E1] }); break;
        }
        case 'S1-15': { const indexPath = path.join(target, '.ai-org/learning/index.json'); const index = await json(indexPath); index.schema_version = 'ai-org.learning-index/v1'; for (const e of index.entries) { delete e.derived_from; delete e.owner_position; delete e.revalidation; } await write(indexPath, index); await coverage('pending'); await coverage('pending'); await record(); await corrupt(); break; }
        case 'S1-16': {
          const old = await record({ disposition: 'deferred' });
          const backup = path.join(scratchRoot, `${caseId}-prior`); await fs.cp(path.join(target, REVIEW_DIR), backup, { recursive: true });
          for (const mode of ['throw', 'exit']) {
            // Independent fault fixtures start from the same complete prior state.
            await fs.rm(path.join(target, REVIEW_DIR), { recursive: true, force: true }); await fs.cp(backup, path.join(target, REVIEW_DIR), { recursive: true });
            const fault = await createReviewFaultHook(target, path.join(scratchRoot, `${caseId}-hooks`), mode);
            const before = await canonical(), priorStorage = await snapshotTree(path.join(target, REVIEW_DIR));
            const outcome = await call(recordArgs(target, { expected: old }), ['--import', fault.hook]);
            await requireInstrumentFile(fault.marker, (body) => body === 'reached', 'fault-not-exercised');
            assert.deepEqual(await canonical(), before, 'faulted record changed unrelated canonical data');
            const after = await status();
            const proof=after.items[0].coverage==='unknown'?await proveRetainedRecovery({target,recoveredTarget:path.join(scratchRoot,`${caseId}-recovery-${mode}`),priorStorage,oldReceiptId:old,query:async recovered=>parse(await call(['learning','review-status',recovered,'--work-item','WI-0001','--json']))}):null;
            assertFaultOutcome(after.items[0], old, outcome, after.diagnostics,proof);
          }
          await corrupt(); break;
        }
        case 'S1-17': {
          for (const state of ['done', 'concluded', 'cancelled']) { await mutateWI({ state }); await record(); await coverage('reviewed'); }
          await mutateWI({ updated_at: '2026-09-02T00:00:00Z' }); await coverage('reviewed');
          await mutateWI({ state: 'build' }); const r = await coverage('ineligible'); assert.ok(history(r).size >= 1); await invalid({});
          await mutateWI({ state: 'cancelled', developer_candidate_revision: R2 }); await coverage('stale'); break;
        }
        case 'S1-18': {
          const setup = Date.now();
          // Public record calls avoid private receipt schemas and unsupported bulk seeding.
          // Sequential writes support implementations with a global lock without contention bias.
          const canonicalBefore = await canonical();
          for (let i = 1; i <= 600; i++) { const output = parse(await call(recordArgs(target, { id: wiId(i) }))); assert.ok(typeof output.receipt_id === 'string' && output.receipt_id.length > 0); }
          assert.deepEqual(await canonical(), canonicalBefore, 'scale record calls changed canonical data');
          observations.dataset_setup_ms = Date.now() - setup;
          const counter = await readCountHook(target, path.join(scratchRoot, 'S1-18-hooks'));
          const report = await status(Array.from({ length: 1000 }, (_, i) => wiId(i + 1)), ['--import', counter.hook]);
          assert.equal(report.summary.reviewed, 600); assert.equal(report.summary.pending, 400);
          assert.equal(new Set(report.items.map((r) => r.receipt_id).filter(Boolean)).size, 600);
          observations.dataset = { work_items: 1000, receipts: 600, learning_entries: 200 };
          const counts = JSON.parse(await requireInstrumentFile(counter.output, (body) => { try { const value = JSON.parse(body); return ['readFile', 'readFileSync'].every((key) => Number.isInteger(value[key]) && value[key] >= 0); } catch { return false; } }, 'read-counter-unavailable'));
          observations.file_read_counts = { ...counts, coverage: 'Node fs.readFileSync and fs/promises.readFile calls within target; other APIs not counted' }; break;
        }
        case 'S1-19': { await mutateWI({ base_revision: null, developer_candidate_revision: null }); await coverage('unknown'); await invalid({}); await mutateWI({ base_revision: R1, developer_candidate_revision: null }); assert.equal((await coverage('pending')).outcome_revision, R1); await record(); await fs.unlink(path.join(target, E1)); await coverage('unknown'); break; }
        case 'S1-20': {
          const old = await record({ disposition: 'revalidation-needed', learning: ['LESSON-0001'] }); await coverage('follow-up');
          const id = await record({ expected: old, disposition: 'candidate-captured', learning: ['LESSON-0002'] });
          const before = await snapshotTree(path.join(target, REVIEW_DIR));
          const result = await call(['learning', 'revalidate', target, '--learning-id', 'LESSON-0002', '--result', 'confirmed', '--evidence', E1, '--actor', 'human']); assert.equal(result.exit_code, 0, result.stderr || result.stdout);
          assert.equal((await json(path.join(target, '.ai-org/learning/index.json'))).entries.find((e) => e.id === 'LESSON-0002').status, 'validated');
          assert.deepEqual(await snapshotTree(path.join(target, REVIEW_DIR)), before); const r = await coverage('reviewed'); assert.equal(r.receipt_id, id); assert.ok(history(r).has(old)); break;
        }
      }
      results.push({ id: caseId, passed: true, elapsed_ms: Date.now() - started });
    } catch (error) {
      // Assertions are candidate observations. Fixture/adapter/instrumentation
      // exceptions cannot establish a product defect and stop the whole oracle.
      const infrastructure = isInstrumentError(error) || error?.code !== 'ERR_ASSERTION';
      results.push({ id: caseId, passed: false, elapsed_ms: Date.now() - started, failure_kind: infrastructure ? 'instrument_failure' : 'candidate_failure', error: String(error.message) });
      if (infrastructure) { instrumentFailure = { code: error.code ?? 'oracle-infrastructure-error', message: String(error.message), case_id: caseId, cleanup_failure: error.cleanup_failure ?? null }; break; }
    }
  }
  return { schema_version: 'temple.learning-review-acceptance/v1', passed: !instrumentFailure && results.length === 20 && results.every((r) => r.passed), selected_cases_passed: !instrumentFailure && results.every((r) => r.passed), instrument_failure: instrumentFailure, cases: results, command_count: commandCount, observations };
}
