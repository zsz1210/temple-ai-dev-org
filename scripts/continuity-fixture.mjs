// Coordinator-only offline fixture/oracle. Never copy this file into actor roots.
// This module does not dispatch providers or qualify a hostile-code sandbox.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { digest, subprocessEnvironment } from './delivery-control-pair.mjs';

const source = path.resolve(import.meta.dirname, '..');
const check = (condition, reason) => { if (!condition) throw Error(reason); };
const env = () => subprocessEnvironment({ GIT_AUTHOR_DATE: '2026-09-07T00:00:00Z', GIT_COMMITTER_DATE: '2026-09-07T00:00:00Z' });
function run(cwd, binary, args, options = {}) {
  const started = performance.now();
  const r = spawnSync(binary, args, { cwd, env: env(), encoding: 'utf8', timeout: 15000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024, ...options });
  return { exit_code: r.status, signal: r.signal, stdout: r.stdout ?? '', stderr: r.stderr ?? '', elapsed_ms: performance.now() - started };
}
function command(cwd, binary, args, options) {
  const r = run(cwd, binary, args, options);
  check(r.exit_code === 0, `fixture-command-failed:${binary}:${r.stderr.slice(0, 400)}`);
  return r.stdout.trim();
}
const git = (root, ...args) => command(root, 'git', ['-c', 'core.hooksPath=' + os.devNull, '-c', 'commit.gpgsign=false', ...args]);
const cli = (root, ...args) => JSON.parse(command(source, process.execPath, [path.join(source, 'templew.mjs'), ...args, root, '--json']));
async function write(root, file, value) {
  await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await fs.writeFile(path.join(root, file), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
}
export const discountSource = `export function discount(subtotal, amount) {
  if (![subtotal, amount].every(x => Number.isInteger(x) && x >= 0 && x <= 1000000000) || amount > subtotal) throw new TypeError('amount');
  return subtotal - amount;
}
`;
export function referenceQuote(threshold) {
  check([3000, 5000].includes(threshold), 'unknown-threshold');
  return `import { discount } from './discount.mjs';
export function quote(subtotalCents, discountCents) {
  const discountedCents = discount(subtotalCents, discountCents);
  const shippingCents = discountedCents === 0 || discountedCents >= ${threshold} ? 0 : 500;
  return { subtotalCents, discountedCents, shippingCents, totalCents: discountedCents + shippingCents };
}
`;
}
const unfinished = `import { discount } from './discount.mjs';
export function quote(subtotalCents, discountCents) {
  discount(subtotalCents, discountCents);
  throw new Error('shipping integration unfinished');
}
`;
const discountTest = `import assert from 'node:assert/strict';
import { discount } from '../discount.mjs';
assert.equal(discount(3100, 200), 2900);
assert.equal(discount(0, 0), 0);
assert.throws(() => discount(1, 2), TypeError);
`;
const quoteTest = threshold => `import assert from 'node:assert/strict';
import { quote } from '../quote.mjs';
assert.deepEqual(quote(${threshold}, 0), { subtotalCents:${threshold}, discountedCents:${threshold}, shippingCents:0, totalCents:${threshold} });
assert.equal(quote(${threshold}, 1).shippingCents, 500);
`;
function specification(threshold, revision) {
  return `# Current approved quote specification ${revision}\n\n` +
    `quote(subtotalCents, discountCents) accepts integer amounts from 0 to 1000000000 inclusive, discount <= subtotal. Invalid inputs throw TypeError.\n` +
    `Preserve discount.mjs. Apply discount BEFORE shipping. Discounted zero ships free. Otherwise charge 500 unless discountedCents >= ${threshold} (inclusive), then zero.\n` +
    `Return exactly subtotalCents, discountedCents, shippingCents, totalCents; total is discounted plus shipping. Preserve caller input and synchronous export shape.\n` +
    `Edit quote.mjs and optionally test/additional.test.mjs only. Preserve public tests and all existing documents. Low-risk offline fixture; no UI, services, dependencies or external actions.\n`;
}
async function snapshot(root, revision = 'HEAD') {
  const result = {};
  for (const row of git(root, 'ls-tree', '-r', '-z', revision).split('\0').filter(Boolean)) {
    const [meta, file] = row.split('\t'); const [mode, type, oid] = meta.split(' ');
    check(mode === '100644' && type === 'blob' && file && !file.includes('..') && !file.includes('\n'), 'unsafe-fixture-tree');
    result[file] = { mode, oid };
  }
  return result;
}
export async function createContinuityPair(directory, state) {
  check(['stable', 'changed-spec'].includes(state), 'unknown-state');
  // Exclusive target: never adopt or clean a pre-existing directory.
  await fs.mkdir(directory);
  const seed = path.join(directory, 'seed'); await fs.mkdir(seed);
  git(seed, 'init', '-b', 'main');
  await write(seed, 'discount.mjs', discountSource);
  await write(seed, 'quote.mjs', state === 'stable' ? unfinished : referenceQuote(3000));
  await write(seed, 'test/discount.test.mjs', discountTest);
  await write(seed, 'SPEC.md', specification(3000, 'v1'));
  if (state === 'changed-spec') await write(seed, 'test/public.test.mjs', quoteTest(3000));
  git(seed, 'add', '.'); git(seed, 'commit', '-m', 'Record completed predecessor scope');
  const historicalRevision = git(seed, 'rev-parse', 'HEAD');
  const tests = state === 'stable' ? ['test/discount.test.mjs'] : ['test/discount.test.mjs', 'test/public.test.mjs'];
  const observation = run(seed, process.execPath, ['--test', ...tests]);
  check(observation.exit_code === 0, 'invalid-historical-checkpoint');
  await write(seed, 'history/verification-v1.json', { revision: historicalRevision, command: ['node', '--test', ...tests], ...observation, authority: 'historical-scope-only' });
  const threshold = state === 'stable' ? 3000 : 5000, specRevision = state === 'stable' ? 'v1' : 'v2';
  if (state === 'changed-spec') await write(seed, 'history/SPEC-v1.md', specification(3000, 'v1'));
  await write(seed, 'SPEC.md', specification(threshold, specRevision));
  await write(seed, 'test/public.test.mjs', quoteTest(threshold));
  const task = state === 'stable' ? 'Complete shipping integration while preserving accepted discount behavior.' : 'Update old shipping threshold 3000 to current 5000 while preserving accepted discount behavior.';
  await write(seed, 'HANDOFF.md', `# Takeover\n\n${task}\nCurrent authority: SPEC.md ${specRevision}. ${state === 'changed-spec' ? 'v2 supersedes historical v1 explicitly.' : 'v1 is current.'}\n` +
    `Predecessor revision: ${historicalRevision}. Historical command and actual pass: history/verification-v1.json; its scope is not current candidate verification.\n` +
    `Completed: discount.mjs and its tests. Remaining: ${task}\nEditable: quote.mjs, optional test/additional.test.mjs. No active predecessor claim or unresolved business decision. Read current requirements and test the new exact candidate before handing it off.\n`);
  git(seed, 'add', '.'); git(seed, 'commit', '-m', 'Freeze current takeover facts');
  const sharedRevision = git(seed, 'rev-parse', 'HEAD'), product = await snapshot(seed), arms = {};
  const config = JSON.parse(await fs.readFile(path.join(source, 'docs/getting-started/temple-init.example.json')));
  config.project = { id: 'continuity-fixture', name: 'Synthetic continuity fixture' };
  config.repository_integration = { schema_version: 'temple.repository-integration/v1', status: 'confirmed', authority: 'project', source: 'human-confirmed', policy_refs: [], summary: 'Synthetic local fixture, no external integration', integration_target: 'main', change_isolation: 'not-required', review_gate: 'not-required', recorded_at: '2026-09-07T00:00:00Z', recorded_by: 'human' };
  const configPath = path.join(directory, 'init.json'); await fs.writeFile(configPath, JSON.stringify(config));
  for (const arm of ['ordinary', 'temple']) {
    const root = path.join(directory, arm), started = performance.now();
    await fs.cp(seed, root, { recursive: true, errorOnExist: true, force: false });
    let itemId = null;
    if (arm === 'temple') {
      cli(root, 'init', '--config', configPath);
      itemId = cli(root, 'work-item', 'create', '--title', 'Resume approved quote change', '--scope', task, '--acceptance', 'Current SPEC.md governs; preserve completed discount behavior and protected files.', '--affected-path', 'quote.mjs', '--affected-path', 'test/additional.test.mjs', '--workflow-profile', 'lean', '--risk-tier', 'low', '--scope-class', 'bounded', '--profile-rationale', 'Synthetic bounded offline quote', '--ui-mode', 'not-applicable').item.id;
      cli(root, 'transition', '--work-item', itemId, '--to', 'build', ...['work_order', 'approved_scope', 'acceptance_criteria', 'technical_design', 'risk_review', 'profile_eligibility'].flatMap(g => ['--satisfy', `${g}=${g === 'work_order' ? 'HANDOFF.md' : 'SPEC.md'}`]));
      cli(root, 'doctor'); cli(root, 'status');
      git(root, 'add', '.'); git(root, 'commit', '-m', 'Record Temple representation of shared facts');
    }
    const baseline = git(root, 'rev-parse', 'HEAD'), tree = await snapshot(root);
    for (const [file, entry] of Object.entries(product)) check(isDeepStrictEqual(tree[file], entry), 'unequal-product-facts');
    arms[arm] = { root, baseline, tree, item_id: itemId, preparation_ms: performance.now() - started };
  }
  return { version: 'continuity-offline/v1', state, threshold, spec_revision: specRevision, historical_revision: historicalRevision, shared_revision: sharedRevision,
    product, arms, source_revision: git(source, 'rev-parse', 'HEAD'), fact_digest: digest(product), live_ready: false, model_calls: 0 };
}

function vectors(threshold) {
  const cases = [[0,0], [1,0], [100,100], [threshold-1,0], [threshold,0], [threshold+1,0], [threshold,1], [threshold+200,200], [1000000000,0], [1000000000,1000000000], [3000,0], [5000,1]];
  for (let i = 1; i <= 24; i++) cases.push([threshold + i * 17, i * 29]);
  return cases.concat([[-1,0], [1,2], [1.1,0], [null,0], ['3',0], [1,null], [1000000001,0], [1,-1], [], [1]]);
}
function expected(args, threshold) {
  const [a,b] = args;
  if (![a,b].every(x => Number.isInteger(x) && x >= 0 && x <= 1e9) || b > a) return { error: 'TypeError' };
  const discountedCents = a-b, shippingCents = discountedCents === 0 || discountedCents >= threshold ? 0 : 500;
  return { value: { subtotalCents:a, discountedCents, shippingCents, totalCents:discountedCents+shippingCents } };
}
function bookkeeping(file, item) {
  return item && (file === `.ai-org/work-items/${item}.json` || file === '.ai-org/events/events.jsonl' || file.startsWith('.ai-org/views/') || file.startsWith(`.ai-org/artifacts/${item}/`));
}
export async function assessContinuityCandidate(root, checkpoint, arm, revision, { scratchParent = os.tmpdir() } = {}) {
  checkpoint = structuredClone(checkpoint);
  check(checkpoint?.version === 'continuity-offline/v1' && ['ordinary','temple'].includes(arm) && ['stable','changed-spec'].includes(checkpoint.state) &&
    checkpoint.threshold === (checkpoint.state === 'stable' ? 3000 : 5000) && checkpoint.spec_revision === (checkpoint.state === 'stable' ? 'v1' : 'v2') &&
    checkpoint.fact_digest === digest(checkpoint.product), 'invalid-coordinator-checkpoint');
  const base = checkpoint.arms[arm];
  check(/^[a-f0-9]{40}$/.test(revision ?? '') && revision !== base.baseline, 'exact-new-candidate-required');
  check(git(root, 'rev-parse', 'HEAD') === revision, 'candidate-not-current');
  git(root, 'merge-base', '--is-ancestor', base.baseline, revision);
  const tree = await snapshot(root, revision), editable = new Set(['quote.mjs','test/additional.test.mjs']);
  for (const file of new Set([...Object.keys(base.tree), ...Object.keys(tree)])) {
    if (!editable.has(file) && !bookkeeping(file, base.item_id)) check(isDeepStrictEqual(tree[file], base.tree[file]), 'protected-source-changed');
  }
  // Check every tracked non-bookkeeping byte and mode plus untracked files; Git's
  // status alone can hide assume-unchanged files or ignore-listed additions.
  const disk = {};
  async function walk(relative = '') {
    for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
      const file = path.posix.join(relative, entry.name); if (file === '.git' || bookkeeping(file, base.item_id)) continue;
      if (entry.isDirectory()) { await walk(file); continue; }
      const stat = await fs.lstat(path.join(root,file));
      check(stat.isFile() && stat.nlink === 1 && !(stat.mode & 0o111) && stat.size <= 1024*1024, 'unsafe-working-file');
      disk[file] = true;
      check(tree[file], 'untracked-source');
      // Binary-safe object comparison, independent of trim/UTF-8 decoding.
      const bytes = spawnSync('git', ['show', `${revision}:${file}`], { cwd:root, env:env(), timeout:15000, maxBuffer:1024*1024 });
      check(bytes.status === 0 && (await fs.readFile(path.join(root,file))).equals(bytes.stdout), 'dirty-source');
    }
  }
  await walk();
  for (const file of Object.keys(tree)) if (!bookkeeping(file,base.item_id)) check(disk[file], 'missing-source');
  const scratch = await fs.mkdtemp(path.join(scratchParent, 'continuity-oracle-'));
  try {
    const testPaths = ['test/discount.test.mjs','test/public.test.mjs', ...(tree['test/additional.test.mjs'] ? ['test/additional.test.mjs'] : [])];
    const extracted = {};
    for (const file of ['discount.mjs','quote.mjs', ...testPaths]) {
      const b = spawnSync('git', ['show', `${revision}:${file}`], { cwd:root, env:env(), timeout:15000,maxBuffer:65536 });
      check(b.status === 0, 'unreadable-candidate');
      await fs.mkdir(path.dirname(path.join(scratch,file)),{recursive:true});
      await fs.writeFile(path.join(scratch,file), b.stdout); extracted[file] = b.stdout;
    }
    const inputs = vectors(checkpoint.threshold);
    // Preserve properties JSON would erase, and distinguish real error types
    // from objects that merely claim a name. Expected answers stay in the parent.
    const script = `import {types} from 'node:util';
const NativeTypeError=TypeError, nativeError=types.isNativeError;
const keys=['discountedCents','shippingCents','subtotalCents','totalCents'];
const inputs=JSON.parse(process.argv[1]); const {quote}=await import('./quote.mjs');
console.log(JSON.stringify(inputs.map(args=>{try{
  const value=quote(...args);
  if(value===null || typeof value!=='object') return {invalid:'return-shape'};
  const actual=Reflect.ownKeys(value);
  if(actual.length!==4 || actual.some(k=>typeof k!=='string') || actual.sort().some((k,i)=>k!==keys[i])) return {invalid:'return-shape'};
  const fields={subtotalCents:value.subtotalCents,discountedCents:value.discountedCents,shippingCents:value.shippingCents,totalCents:value.totalCents};
  if(Object.values(fields).some(v=>typeof v!=='number'||!Number.isSafeInteger(v))) return {invalid:'return-value-type'};
  return {value:fields};
}catch(e){return {error:nativeError(e)&&e instanceof NativeTypeError?'TypeError':'other'}}})));`;
    const result = run(scratch, process.execPath, ['--input-type=module','-e',script,JSON.stringify(inputs)], { timeout:2000,maxBuffer:65536 });
    let observed = null; try { observed = JSON.parse(result.stdout); } catch {}
    const answers = inputs.map(args => expected(args, checkpoint.threshold));
    let reason = result.exit_code !== 0 ? 'oracle-process-failed' : isDeepStrictEqual(observed, answers) ? 'accepted' : 'product-mismatch';
    if (reason === 'accepted') {
      const tests = run(scratch,process.execPath,['--test',...testPaths],{timeout:3000,maxBuffer:65536});
      if (tests.exit_code !== 0) reason = 'regression-failed';
    }
    for(const [file,bytes] of Object.entries(extracted)) {
      const actual=await fs.readFile(path.join(scratch,file)).catch(()=>null);
      if(!actual?.equals(bytes)) reason='oracle-input-mutated';
    }
    return { passed: reason === 'accepted', revision, state:checkpoint.state,
      case_count:inputs.length, exit_code:result.exit_code, reason,
      product_scope_only:true, live_sandbox_qualified:false };
  } finally { await fs.rm(scratch, { recursive:true,force:true }); }
}
