import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

// Repository-local evidence harness. Both tarballs are explicit inputs; no publish.
const [candidateArg, baselineArg, outputArg] = process.argv.slice(2);
assert(candidateArg && baselineArg && outputArg, 'candidate.tgz baseline.tgz output.json required');
const candidate = path.resolve(candidateArg);
const baseline = path.resolve(baselineArg);
const output = path.resolve(outputArg);
const root = process.cwd();
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'temple-alpha33-'));
const timeline = [];
const checks = [];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const report = { schema_version: 'temple.alpha33-qualification-observation/v1',
  status: 'running', observed_at: new Date().toISOString(), runtime: process.version,
  platform: process.platform, checks, timeline, package_published: false,
  downstream_projects_modified: false, model_calls: 0, tokens: null };
function run(label, command, args, cwd = temporary, env = {}, expect = 0) {
  const start = performance.now();
  const r = spawnSync(command, args, { cwd, env: { ...process.env, ...env },
    encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  timeline.push({ label, exit_code: r.status, elapsed_ms: Math.round(performance.now() - start) });
  if (r.error) throw r.error;
  assert.equal(r.status, expect, `${label}: ${(r.stderr || r.stdout).slice(-3000)}`);
  return r.stdout;
}
const check = (name, detail = {}) => checks.push({ name, status: 'passed', ...detail });
const json = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
async function writeJson(file, value) { await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`); }
async function snapshot(dir, ignored = new Set()) {
  const result = {};
  async function visit(relative = '') {
    for (const entry of await fs.readdir(path.join(dir, relative), { withFileTypes: true })) {
      const rel = path.posix.join(relative, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git' || ignored.has(rel)) continue;
      if (entry.isDirectory()) await visit(rel);
      else if (entry.isFile()) result[rel] = digest(await fs.readFile(path.join(dir, rel)));
      else assert.fail(`unexpected non-regular fixture entry: ${rel}`);
    }
  }
  await visit();
  return result;
}
async function install(archive, label, expectedVersion) {
  const project = path.join(temporary, label);
  await fs.mkdir(project);
  const pkg = JSON.parse(run(`${label}: inspect archive`, 'tar', ['-xOf', archive, 'package/package.json']));
  assert.equal(pkg.version, expectedVersion);
  assert.deepEqual(pkg.dependencies, (await json(path.join(root, 'package.json'))).dependencies);
  const bytes = await fs.readFile(archive);
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  const sourceLock = await json(path.join(root, 'package-lock.json'));
  assert.equal(sourceLock.lockfileVersion, 3);
  const manifest = { name: `alpha33-${label}-fixture`, version: '0.0.0', private: true,
    dependencies: { [pkg.name]: `file:${archive}` } };
  await writeJson(path.join(project, 'package.json'), manifest);
  await writeJson(path.join(project, 'package-lock.json'), {
    name: manifest.name, version: manifest.version, lockfileVersion: 3, requires: true,
    packages: { '': manifest,
      ...Object.fromEntries(Object.entries(sourceLock.packages).filter(([key, value]) => key && !value.dev)),
      [`node_modules/${pkg.name}`]: { version: pkg.version, resolved: `file:${archive}`, integrity,
        dependencies: pkg.dependencies, bin: pkg.bin, engines: pkg.engines, license: pkg.license } }
  });
  run(`${label}: locked offline install`, 'npm', ['ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund'], project);
  const cli = path.join(project, 'node_modules', pkg.name, 'bin/temple.mjs');
  assert.equal(run(`${label}: version`, process.execPath, [cli, '--version'], project).trim(), expectedVersion);
  report[label] = { version: pkg.version, archive: path.basename(archive), sha256: digest(bytes), integrity, bytes: bytes.length };
  return { project, cli };
}
const config = { schema_version: 'temple.init/v1', project: { id: 'alpha33-fixture', name: 'Alpha.33 Fixture' },
  naming_mode: 'manual', agents: [
    { display_name: 'Rowan', positions: ['engineering_manager', 'release_manager', 'observer'] },
    { display_name: 'Mira', positions: ['product_manager', 'ux_designer', 'ui_designer'] },
    { display_name: 'Theo', positions: ['tech_lead'] },
    { display_name: 'Devon', positions: ['developer'] },
    { display_name: 'Quinn', positions: ['quality_evaluator', 'independent_qa'] }
  ] };
async function initialize(fixture, label, customized = false) {
  const { project, cli } = fixture;
  if (customized) {
    await fs.writeFile(path.join(project, 'AGENTS.md'), '# Application instructions\n\nRetain the fixture convention.\n');
    await fs.writeFile(path.join(project, 'CLAUDE.md'), '@AGENTS.md\n\nKeep the application convention.\n');
    await fs.writeFile(path.join(project, 'app.mjs'), 'export const applicationValue = 42;\n');
  }
  const flags = customized ? ['--integrate-agents'] : [];
  const before = await snapshot(project);
  run(`${label}: dry init`, process.execPath, [cli, 'init', '.', '--config', configPath, ...flags, '--dry-run'], project);
  assert.deepEqual(await snapshot(project), before);
  run(`${label}: init`, process.execPath, [cli, 'init', '.', '--config', configPath, ...flags], project);
  const initialized = await snapshot(project);
  run(`${label}: repeat init`, process.execPath, [cli, 'init', '.', '--config', configPath, ...flags], project);
  assert.deepEqual(await snapshot(project), initialized);
  check(`${label}: dry init is read-only and repeated init preserves bytes`);
}
function launcher(fixture, label, cli = fixture.cli) {
  const env = { TEMPLE_CLI_PATH: cli };
  const doctor = JSON.parse(run(`${label}: pinned doctor`, process.execPath, ['./templew.mjs', 'doctor', '.', '--json'], fixture.project, env));
  assert.equal(doctor.summary.fail, 0);
  const status = JSON.parse(run(`${label}: pinned status`, process.execPath, ['./templew.mjs', 'status', '.', '--no-write', '--json'], fixture.project, env));
  assert.equal(status.project.id, config.project.id);
  check(`${label}: installed pinned launcher, doctor and status`, { doctor: doctor.summary });
}
const configPath = path.join(temporary, 'init.json');
try {
  report.candidate_revision = run('candidate Git identity', 'git', ['rev-parse', 'HEAD'], root).trim();
  await writeJson(configPath, config);
  const fresh = await install(candidate, 'candidate', '0.1.0-alpha.33');
  await initialize(fresh, 'fresh');
  launcher(fresh, 'fresh');
  const legacy = await install(baseline, 'baseline', '0.1.0-alpha.32');
  await initialize(legacy, 'legacy', true);
  run('legacy: work history', process.execPath, [legacy.cli, 'work-item', 'create', '.', '--title', 'Preserve existing work history', '--scope', 'Synthetic fixture only', '--acceptance', 'Keep this record through upgrade', '--ui-mode', 'not-applicable'], legacy.project);
  launcher(legacy, 'legacy');
  const oldLock = await json(path.join(legacy.project, 'temple.lock'));
  const ignored = new Set(['temple.lock', '.ai-org/views/status.md', '.ai-org/views/capabilities.json', ...oldLock.managed_files.map(entry => entry.path)]);
  const owned = await snapshot(legacy.project, ignored);
  const allBefore = await snapshot(legacy.project);
  run('upgrade: dry run', process.execPath, [fresh.cli, 'upgrade', '.', '--dry-run'], legacy.project);
  assert.deepEqual(await snapshot(legacy.project), allBefore);
  run('upgrade: apply', process.execPath, [fresh.cli, 'upgrade', '.'], legacy.project);
  assert.deepEqual(await snapshot(legacy.project, ignored), owned);
  const upgradedLock = await json(path.join(legacy.project, 'temple.lock'));
  assert.equal(upgradedLock.template.version, '0.1.0-alpha.33');
  assert.equal(upgradedLock.template.bootstrap.version, '0.1.0-alpha.33');
  check('upgrade: preserves every existing project-owned file and policy', { files: Object.keys(owned).sort(), count: Object.keys(owned).length });
  launcher(legacy, 'upgraded', fresh.cli);
  const conflict = oldLock.managed_files.find(entry => entry.path === 'TEMPLE.md')?.path;
  assert(conflict);
  const conflictPath = path.join(legacy.project, conflict);
  await fs.appendFile(conflictPath, '\nLocal managed-file change for conflict negative control.\n');
  const conflictBefore = await snapshot(legacy.project);
  const result = spawnSync(process.execPath, [fresh.cli, 'upgrade', '.'], { cwd: legacy.project,
    env: process.env, encoding: 'utf8', timeout: 120000 });
  if (result.error) throw result.error;
  assert.notEqual(result.status, 0, 'managed conflict must refuse clean completion');
  assert.match(`${result.stdout}\n${result.stderr}`, /conflict|changed since/i);
  assert.deepEqual(await snapshot(legacy.project), conflictBefore);
  check('upgrade: managed conflict refuses and preserves all bytes', { path: conflict, exit_code: result.status });
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = String(error.stack ?? error).replaceAll(temporary, '<temporary-root>').replaceAll(root, '<repository-root>');
  process.exitCode = 1;
} finally {
  await fs.rm(temporary, { recursive: true, force: true });
  report.temporary_resources_removed = true;
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify({ status: report.status, checks: checks.length, elapsed_ms: timeline.reduce((sum, step) => sum + step.elapsed_ms, 0), failure: report.failure ?? null }));
}
