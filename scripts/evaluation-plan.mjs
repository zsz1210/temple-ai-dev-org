import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha = value => createHash('sha256').update(value).digest('hex');
const canonical = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
const phases = ['setup', 'build', 'verify', 'repair', 'reverify', 'variability', 'usage_lag', 'cleanup'];
const dimensions = ['tokens', 'time_ms', 'calls'];
const idPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
const commitPattern = /^[a-f0-9]{40}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const matches = (pattern, value) => typeof value === 'string' && pattern.test(value);
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const integer = (v, min = 0) => Number.isSafeInteger(v) && v >= min;
const sum = (values, key) => {
  const result = values.reduce((n, v) => n + v[key], 0);
  requireThat(integer(result), `Unsafe aggregate ${key}`);
  return result;
};
const totals = values => Object.fromEntries(dimensions.map(key => [key, sum(values, key)]));
function index(items, label) {
  requireThat(Array.isArray(items) && items.length > 0 && items.length <= 1000, `${label}: expected 1..1000 entries`);
  const result = new Map();
  for (const item of items) {
    requireThat(item && matches(idPattern, item.id) && !result.has(item.id), `${label}: invalid or duplicate id`);
    result.set(item.id, item);
  }
  return result;
}
function select(ids, entries, label) {
  requireThat(Array.isArray(ids) && ids.length > 0 && ids.every(id => matches(idPattern, id)) && new Set(ids).size === ids.length, `${label}: empty, invalid or duplicate selection`);
  return ids.map(id => { requireThat(entries.has(id), `${label}: unknown id ${id}`); return entries.get(id); });
}
function reservation(value, label) {
  requireThat(value && dimensions.every(d => integer(value[d])), `${label}: tokens, time_ms and calls must be nonnegative safe integers`);
  requireThat(value.calls === 0 || (value.tokens > 0 && value.time_ms > 0), `${label}: every generation call needs positive token and time capacity`);
  return Object.fromEntries(dimensions.map(d => [d, value[d]]));
}
function budgetFor(value, scenario) {
  if (value == null) return null;
  requireThat(typeof value.basis === 'string' && value.basis.trim(), `${scenario}: missing budget basis`);
  const entries = Object.fromEntries(phases.map(p => [p, reservation(value[p], `${scenario}.${p}`)]));
  for (const p of ['build', 'verify', 'variability', 'usage_lag', 'cleanup']) {
    requireThat(entries[p].tokens > 0 && entries[p].time_ms > 0, `${scenario}.${p}: positive token and time reservation required`);
  }
  requireThat(entries.build.calls >= 1 && entries.verify.calls >= 1, `${scenario}: reserve implementation and distinct verification calls`);
  requireThat(entries.repair.calls === 0 ? entries.reverify.calls === 0 : entries.reverify.calls >= entries.repair.calls,
    `${scenario}: reserve reverification for every allowed repair`);
  for (const p of ['repair', 'reverify']) {
    requireThat(entries[p].calls === 0 || (entries[p].tokens > 0 && entries[p].time_ms > 0), `${scenario}.${p}: missing repair capacity`);
  }
  for (const p of ['variability', 'usage_lag', 'cleanup']) requireThat(entries[p].calls === 0, `${scenario}.${p}: buffer cannot authorize another call`);
  return { basis: value.basis, phases: entries, total: totals(Object.values(entries)) };
}

// Planning only. Syntactically valid pins are not verified provenance or launch authority.
export function planEvaluation(plan, catalog) {
  requireThat(plan?.schema_version === 'temple.offline-evaluation-selection/v1', 'Unsupported selection schema');
  requireThat(catalog?.schema_version === 'temple.offline-evaluation-catalog/v1', 'Unsupported catalog schema');
  requireThat(plan.model_generation_authorized === false, 'Offline selection must explicitly disable model generation');
  requireThat(typeof plan.decision?.question === 'string' && plan.decision.question.trim(), 'Missing decision question');
  const factor = plan.decision.factor;
  requireThat(['process', 'model', 'framework-version', 'factorial', 'descriptive'].includes(factor), 'Unknown comparison factor');
  const scenarioIndex = index(catalog.scenarios, 'scenarios');
  const modelIndex = index(catalog.models, 'models');
  const modeIndex = index(catalog.modes, 'modes');
  const variants = [...index(plan.variants, 'variants').values()];
  const scenarios = select(plan.selection?.scenarios, scenarioIndex, 'scenarios');
  const models = select(plan.selection?.models, modelIndex, 'models');
  const selectedVariants = select(plan.selection?.variants, new Map(variants.map(v => [v.id, v])), 'variants');
  requireThat(integer(plan.repetitions, 1) && plan.repetitions <= 100, 'Repetitions must be 1..100');
  requireThat(integer(plan.order_seed), 'An explicit nonnegative order_seed is required');
  const count = scenarios.length * models.length * selectedVariants.length * plan.repetitions;
  requireThat(count <= 1000, 'Preview exceeds 1000 cells; narrow the decision');
  for (const s of scenarios) {
    requireThat(['simple', 'complex'].includes(s.complexity) && ['low', 'standard', 'high', 'critical'].includes(s.risk), `${s.id}: invalid complexity or risk`);
    requireThat(Array.isArray(s.allowed_modes) && s.allowed_modes.every(id => modeIndex.has(id)), `${s.id}: unknown allowed mode`);
  }
  for (const model of models) requireThat(typeof model.model === 'string' && model.model.trim() && typeof model.reasoning_effort === 'string' && model.reasoning_effort.trim(), `${model.id}: missing model or effort`);
  requireThat(new Set(models.map(m => `${m.model}:${m.reasoning_effort}`)).size === models.length, 'Duplicate effective model/effort selection');
  const pairs = new Set();
  for (const v of selectedVariants) {
    const mode = modeIndex.get(v.mode);
    requireThat(mode && ['general', 'temple', 'candidate'].includes(mode.family), `${v.id}: unknown mode or family`);
    requireThat(v.framework_revision == null || matches(commitPattern, v.framework_revision), `${v.id}: framework_revision must be a full Git SHA or null`);
    requireThat(v.mode_prompt_digest == null || matches(digestPattern, v.mode_prompt_digest), `${v.id}: mode_prompt_digest must be SHA-256 or null`);
    if (mode.family === 'general') requireThat(v.framework_revision == null, `${v.id}: general mode cannot have a Temple revision`);
    if (mode.family === 'general' || v.framework_revision != null) {
      const pair = `${v.mode}:${v.framework_revision}`;
      requireThat(!pairs.has(pair), `Duplicate mode/version variant: ${pair}`);
      pairs.add(pair);
    }
  }
  const modes = new Set(selectedVariants.map(v => v.mode));
  const revisions = new Set(selectedVariants.filter(v => v.framework_revision).map(v => v.framework_revision));
  if (factor === 'process') requireThat(models.length === 1 && modes.size === selectedVariants.length && modes.size >= 2 && revisions.size <= 1, 'Process comparison holds model and Temple version constant');
  if (factor === 'model') requireThat(models.length >= 2 && selectedVariants.length === 1, 'Model comparison holds one mode/version constant');
  if (factor === 'framework-version') requireThat(models.length === 1 && modes.size === 1 && selectedVariants.length >= 2 && modeIndex.get(selectedVariants[0].mode).family !== 'general', 'Version comparison holds one Temple mode and model constant');
  if (factor === 'factorial') {
    requireThat(models.length >= 2 && selectedVariants.length >= 2, 'Factorial requires multiple models and process/version variants');
    // Full mode × revision coverage for Temple modes; general has no framework factor.
    if (revisions.size > 1 && modes.size > 1) for (const mode of modes) {
      if (modeIndex.get(mode).family === 'general') continue;
      for (const revision of revisions) requireThat(selectedVariants.some(v => v.mode === mode && v.framework_revision === revision), `Missing factorial variant: ${mode}@${revision}`);
    }
  }
  const controls = plan.controls ?? {};
  const globalIssues = [];
  for (const key of ['runtime_digest', 'tools_digest', 'measurement_digest', 'common_prompt_digest']) {
    requireThat(controls[key] == null || matches(digestPattern, controls[key]), `${key}: expected SHA-256 or null`);
    if (!controls[key]) globalIssues.push(`missing:${key}`);
  }
  for (const key of ['model', 'reasoning_effort']) {
    const value = controls.verifier?.[key];
    requireThat(value == null || (typeof value === 'string' && value.trim()), `verifier.${key}: expected a nonblank string or null`);
  }
  if (!controls.verifier?.model || !controls.verifier?.reasoning_effort) globalIssues.push('missing:fixed-verifier');
  const cache = controls.cache_control;
  requireThat(['provider-cache-disabled', 'matched-cache-share', 'randomized-blocks', 'uncontrolled-descriptive-only'].includes(cache), 'Select an explicit cache-control method');
  if (cache === 'uncontrolled-descriptive-only') globalIssues.push('cache:descriptive-only');
  globalIssues.push('required:exact-source-and-transitive-dependency-verification', 'required:positive-and-negative-oracle-rehearsal', 'required:adapter-model-effort-usage-abort-qualification', 'required:frozen-protocol-and-separate-launch-authorization');
  const budgets = new Map(scenarios.map(s => [s.id, budgetFor(plan.budget?.per_scenario?.[s.id], s.id)]));
  const overhead = plan.budget?.batch_overhead == null ? null : reservation(plan.budget.batch_overhead, 'batch_overhead');
  if (!overhead) globalIssues.push('missing:batch-overhead-reservation');
  const cells = [];
  for (const scenario of scenarios) for (let repetition = 1; repetition <= plan.repetitions; repetition++) for (const model of models) for (const variant of selectedVariants) {
    const mode = modeIndex.get(variant.mode);
    const issues = [];
    const pins = controls.scenario_pins?.[scenario.id] ?? {};
    for (const key of ['product_revision', 'fixture_digest', 'acceptance_digest']) {
      const pattern = key === 'product_revision' ? commitPattern : digestPattern;
      requireThat(pins[key] == null || matches(pattern, pins[key]), `${scenario.id}.${key}: invalid immutable pin`);
      if (!pins[key]) issues.push(`missing:${key}`);
    }
    const eligible = scenario.allowed_modes.includes(mode.id) && !(['high', 'critical'].includes(scenario.risk) && mode.family === 'temple' && mode.workflow_profile !== 'high-assurance');
    if (!eligible) issues.push('ineligible:scenario-mode-risk-contract');
    if (mode.family !== 'general' && !variant.framework_revision) issues.push('missing:framework-revision');
    if (!variant.mode_prompt_digest) issues.push('missing:assembled-mode-prompt-digest');
    if (mode.family === 'candidate') issues.push('unimplemented:candidate-mode');
    if (scenario.readiness !== 'fixture-exists') issues.push('unimplemented:scenario-adapter');
    const budget = budgets.get(scenario.id);
    if (!budget) issues.push('missing:full-budget-and-buffers');
    cells.push({ id: `${scenario.id}__${model.id}__${variant.id}__r${repetition}`, scenario: scenario.id,
      complexity: scenario.complexity, risk: scenario.risk, model: model.model, reasoning_effort: model.reasoning_effort,
      variant: variant.id, mode: mode.id, family: mode.family, workflow_profile: mode.workflow_profile,
      framework_revision: variant.framework_revision ?? null, mode_prompt_digest: variant.mode_prompt_digest ?? null, repetition, pins, eligible,
      common_safety_contract: ['high', 'critical'].includes(scenario.risk) ? 'synthetic-only; same external-action prohibition and declared assurance invariants in every arm' : 'same authorized scope, tool and acceptance boundary',
      budget, qualification_issues: issues, status: 'not-run' });
  }
  cells.sort((a, b) => {
    const blockA = `${a.scenario}:${a.repetition}`, blockB = `${b.scenario}:${b.repetition}`;
    return blockA.localeCompare(blockB) || sha(`${plan.order_seed}:${a.id}`).localeCompare(sha(`${plan.order_seed}:${b.id}`));
  });
  const known = cells.filter(c => c.budget).map(c => c.budget.total);
  if (overhead) known.push(overhead);
  const knownSubtotal = totals(known);
  const complete = !!overhead && cells.every(c => c.budget);
  const total = complete ? knownSubtotal : Object.fromEntries(dimensions.map(d => [d, null]));
  const ceilings = plan.budget?.ceilings == null ? null : reservation(plan.budget.ceilings, 'ceilings');
  if (!ceilings) globalIssues.push('missing:aggregate-ceilings');
  for (const d of dimensions) if (ceilings && knownSubtotal[d] > ceilings[d]) globalIssues.push(`exceeded:aggregate-${d}`);
  return { schema_version: 'temple.offline-evaluation-plan/v1', authority: 'planning-only', model_generation_authorized: false,
    selection_sha256: sha(canonical(plan)), catalog_sha256: sha(canonical(catalog)),
    decision: plan.decision, cache_control: cache, controls, order_seed: plan.order_seed,
    ordering: 'seeded-order-within-scenario-repetition-blocks; freeze before launch',
    cell_count: count, eligible_cell_count: cells.filter(c => c.eligible).length,
    unrun_cell_count: count, reservation: { complete, total, known_subtotal: knownSubtotal, batch_overhead: overhead, ceilings,
      time_basis: 'sum of sequential reservations; not an elapsed-time prediction', financial_cost: 'unknown' },
    qualification_issues: globalIssues, cells, launch_ready: false,
    claims: { statistical_winner: false, causal_efficiency: false, automatic_routing: false } };
}

export async function main(args) {
  if (args.includes('--help')) return 'Usage: node scripts/evaluation-plan.mjs --catalog file.json --plan file.json [--scenarios id,id] [--models id,id] [--variants id,id]\nReads JSON and prints an offline preview. Never launches models or writes files.';
  const allowed = new Set(['--catalog', '--plan', '--scenarios', '--models', '--variants']);
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    requireThat(allowed.has(args[i]) && !options.has(args[i]) && args[i + 1] && !args[i + 1].startsWith('--'), `Invalid or repeated option ${args[i]}`);
    options.set(args[i], args[i + 1]);
  }
  requireThat(options.has('--catalog') && options.has('--plan'), '--catalog and --plan are required');
  async function json(file) {
    const content = await readFile(file, 'utf8');
    requireThat(Buffer.byteLength(content) <= 2 * 1024 * 1024, 'JSON input exceeds 2 MiB');
    return JSON.parse(content);
  }
  const [catalog, plan] = await Promise.all([json(options.get('--catalog')), json(options.get('--plan'))]);
  for (const key of ['scenarios', 'models', 'variants']) if (options.has(`--${key}`)) {
    requireThat(plan.selection, 'Missing selection');
    plan.selection[key] = options.get(`--${key}`).split(',');
  }
  return JSON.stringify(planEvaluation(plan, catalog), null, 2);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(result => process.stdout.write(`${result}\n`)).catch(error => {
    process.stderr.write(`Evaluation plan error: ${error.message}\n`); process.exitCode = 2;
  });
}
