import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { planEvaluation } from '../scripts/evaluation-plan.mjs';

const catalog = JSON.parse(await readFile(new URL('../scripts/evaluation-catalog/catalog.json', import.meta.url)));
const template = JSON.parse(await readFile(new URL('../scripts/evaluation-catalog/selection.template.json', import.meta.url)));
const fresh = () => structuredClone(template);
const commit = 'a'.repeat(40), later = 'b'.repeat(40), digest = 'c'.repeat(64);
const budget = () => ({ basis: 'synthetic arithmetic test, never a live recommendation',
  setup: { tokens: 0, time_ms: 10, calls: 0 },
  build: { tokens: 100, time_ms: 100, calls: 1 }, verify: { tokens: 40, time_ms: 40, calls: 1 },
  repair: { tokens: 60, time_ms: 60, calls: 1 }, reverify: { tokens: 40, time_ms: 40, calls: 1 },
  variability: { tokens: 20, time_ms: 20, calls: 0 }, usage_lag: { tokens: 10, time_ms: 10, calls: 0 },
  cleanup: { tokens: 10, time_ms: 10, calls: 0 } });

test('shipped selection previews eight unrun cells without launch authority or invented budget', () => {
  const plan = fresh(), before = JSON.stringify(plan);
  const result = planEvaluation(plan, catalog);
  assert.equal(result.cell_count, 8); assert.equal(result.eligible_cell_count, 8);
  assert.equal(result.unrun_cell_count, 8); assert.equal(result.launch_ready, false);
  assert.equal(result.model_generation_authorized, false);
  assert.deepEqual(result.reservation.total, { tokens: null, time_ms: null, calls: null });
  assert.equal(result.reservation.complete, false);
  assert.ok(result.cells.every(c => c.status === 'not-run'));
  assert.equal(JSON.stringify(plan), before);
  assert.deepEqual(planEvaluation(plan, catalog), result);
});

test('complexity does not imply risk and ineligible combinations are retained', () => {
  const plan = fresh(); plan.decision.factor = 'descriptive';
  plan.selection.scenarios = ['interruption-recovery', 'authority-boundary'];
  plan.selection.variants = ['general', 'lean-current', 'assurance-current', 'core-proposed'];
  const result = planEvaluation(plan, catalog);
  assert.equal(result.cell_count, 16);
  const highLean = result.cells.filter(c => c.risk === 'high' && c.mode === 'temple-lean');
  assert.equal(highLean.length, 2); assert.ok(highLean.every(c => !c.eligible));
  assert.ok(result.cells.some(c => c.complexity === 'complex' && c.risk === 'low'));
  assert.ok(result.cells.filter(c => c.family === 'candidate').every(c => c.qualification_issues.includes('unimplemented:candidate-mode')));
  const altered = structuredClone(catalog);
  altered.scenarios.find(s => s.id === 'authority-boundary').allowed_modes.push('temple-lean');
  assert.ok(planEvaluation(plan, altered).cells.filter(c => c.risk === 'high' && c.mode === 'temple-lean').every(c => !c.eligible));
});

test('before/after changes framework pins while holding product and grader pins constant', () => {
  const plan = fresh(); plan.decision.factor = 'framework-version';
  plan.selection.models = ['gpt6-medium']; plan.selection.variants = ['lean-before', 'lean-after'];
  plan.variants.find(v => v.id === 'lean-before').framework_revision = commit;
  plan.variants.find(v => v.id === 'lean-after').framework_revision = later;
  for (const id of plan.selection.scenarios) plan.controls.scenario_pins[id] = { product_revision: commit, fixture_digest: digest, acceptance_digest: digest };
  const result = planEvaluation(plan, catalog);
  assert.equal(result.cell_count, 4);
  assert.deepEqual(new Set(result.cells.map(c => c.framework_revision)), new Set([commit, later]));
  assert.ok(result.cells.every(c => c.pins.product_revision === commit && c.pins.acceptance_digest === digest));
  plan.variants.find(v => v.id === 'lean-after').framework_revision = commit;
  assert.throws(() => planEvaluation(plan, catalog), /Duplicate mode\/version/);
});

test('single factor claims and incomplete multi-factor coverage fail explicitly', () => {
  const plan = fresh(); plan.decision.factor = 'process';
  assert.throws(() => planEvaluation(plan, catalog), /holds model/);
  plan.decision.factor = 'model'; assert.throws(() => planEvaluation(plan, catalog), /one mode/);
  plan.decision.factor = 'factorial';
  plan.selection.variants = ['lean-before', 'lean-after', 'standard-current'];
  for (const v of plan.variants) v.framework_revision = v.id === 'lean-after' ? later : v.mode === 'general' ? null : commit;
  assert.throws(() => planEvaluation(plan, catalog), /Missing factorial variant/);
});

test('full reservations include repairs, reverification, all buffers, every cell and batch overhead', () => {
  const plan = fresh(); for (const s of plan.selection.scenarios) plan.budget.per_scenario[s] = budget();
  plan.budget.batch_overhead = { tokens: 15, time_ms: 30, calls: 0 };
  plan.budget.ceilings = { tokens: 2255, time_ms: 2350, calls: 32 };
  const result = planEvaluation(plan, catalog);
  assert.deepEqual(result.cells[0].budget.total, { tokens: 280, time_ms: 290, calls: 4 });
  assert.deepEqual(result.reservation.total, { tokens: 2255, time_ms: 2350, calls: 32 });
  assert.equal(result.reservation.complete, true);
  assert.equal(result.launch_ready, false); // a populated budget cannot authorize generation
  plan.budget.ceilings.tokens--;
  assert.ok(planEvaluation(plan, catalog).qualification_issues.includes('exceeded:aggregate-tokens'));
  delete plan.budget.per_scenario['async-feature'];
  const incomplete = planEvaluation(plan, catalog);
  assert.equal(incomplete.reservation.total.tokens, null);
  assert.equal(incomplete.reservation.known_subtotal.tokens, 1135);
});

test('zero buffers, negative numbers, overflow and unreserved reverification fail', () => {
  for (const field of ['variability', 'usage_lag', 'cleanup']) {
    const plan = fresh(); const b = budget(); b[field].tokens = 0; plan.budget.per_scenario['small-bug'] = b;
    assert.throws(() => planEvaluation(plan, catalog), /positive token/);
  }
  const plan = fresh(), b = budget(); plan.budget.per_scenario['small-bug'] = b;
  b.reverify.calls = 0; assert.throws(() => planEvaluation(plan, catalog), /reverification/);
  b.reverify.calls = 1; b.build.tokens = -1; assert.throws(() => planEvaluation(plan, catalog), /nonnegative/);
  b.build.tokens = Number.MAX_SAFE_INTEGER; assert.throws(() => planEvaluation(plan, catalog), /Unsafe aggregate/);
});

test('selection rejects duplicate, unknown, oversized and mutable revision inputs', () => {
  const plan = fresh(); plan.selection.models.push('gpt6-medium');
  assert.throws(() => planEvaluation(plan, catalog), /duplicate selection/);
  plan.selection.models = ['unknown']; assert.throws(() => planEvaluation(plan, catalog), /unknown id/);
  plan.selection.models = ['terra-medium', 'gpt6-medium']; plan.repetitions = 101;
  assert.throws(() => planEvaluation(plan, catalog), /Repetitions/);
  plan.repetitions = 100; plan.selection.variants.push('standard-current');
  assert.throws(() => planEvaluation(plan, catalog), /1000 cells/);
  plan.repetitions = 1; plan.variants.find(v => v.id === 'lean-current').framework_revision = 'main';
  assert.throws(() => planEvaluation(plan, catalog), /full Git SHA/);
  const duplicated = structuredClone(catalog);
  Object.assign(duplicated.models[1], { model: duplicated.models[0].model, reasoning_effort: duplicated.models[0].reasoning_effort });
  assert.throws(() => planEvaluation(fresh(), duplicated), /Duplicate effective model/);
});

test('CLI uses supplied JSON only, supports filters, preserves files, rejects launch flags', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'temple-evaluation-plan-'));
  const script = new URL('../scripts/evaluation-plan.mjs', import.meta.url).pathname;
  const planPath = join(dir, 'plan.json'), catalogPath = join(dir, 'catalog.json');
  try {
    await writeFile(planPath, JSON.stringify(fresh())); await writeFile(catalogPath, JSON.stringify(catalog));
    const result = JSON.parse(execFileSync(process.execPath, [script, '--catalog', catalogPath, '--plan', planPath, '--scenarios', 'small-bug'], { cwd: dir, encoding: 'utf8', env: { PATH: '' } }));
    assert.equal(result.cell_count, 4); assert.equal(result.launch_ready, false);
    assert.deepEqual((await readdir(dir)).sort(), ['catalog.json', 'plan.json']);
    assert.deepEqual(JSON.parse(await readFile(planPath)), fresh());
    assert.throws(() => execFileSync(process.execPath, [script, '--catalog', catalogPath, '--plan', planPath, '--run', 'yes'], { cwd: dir, stdio: 'pipe' }), e => e.status === 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('every generation call has funded token and time capacity, including outer work', () => {
  const plan = fresh(); plan.budget.per_scenario['small-bug'] = budget();
  plan.budget.per_scenario['small-bug'].setup = { tokens: 0, time_ms: 0, calls: 1 };
  assert.throws(() => planEvaluation(plan, catalog), /every generation call/);
  plan.budget.per_scenario['small-bug'].setup = { tokens: 0, time_ms: 10, calls: 0 };
  plan.budget.batch_overhead = { tokens: 0, time_ms: 0, calls: 1 };
  assert.throws(() => planEvaluation(plan, catalog), /every generation call/);
});

test('IDs and hashes reject JSON coercion that could collide observation identities', () => {
  const plan = fresh(), altered = structuredClone(catalog);
  altered.scenarios[0].id = null;
  altered.scenarios[1].id = 'null';
  plan.selection.scenarios = [null, 'null'];
  assert.throws(() => planEvaluation(plan, altered), /invalid or duplicate id/);
  const malformed = fresh(); malformed.controls.runtime_digest = [digest];
  assert.throws(() => planEvaluation(malformed, catalog), /expected SHA-256/);
  malformed.controls.runtime_digest = null;
  malformed.variants.find(v => v.id === 'lean-current').framework_revision = [commit];
  assert.throws(() => planEvaluation(malformed, catalog), /full Git SHA/);
});

test('Verifier metadata rejects malformed fields and preserves explicitly unknown qualification', () => {
  for (const key of ['model', 'reasoning_effort']) for (const value of [[], {}, 42, true, '', '  ']) {
    const plan = fresh(); plan.controls.verifier[key] = value;
    assert.throws(() => planEvaluation(plan, catalog), /expected a nonblank string or null/);
  }
  const plan = fresh(); plan.controls.verifier.model = null;
  assert.ok(planEvaluation(plan, catalog).qualification_issues.includes('missing:fixed-verifier'));
});
