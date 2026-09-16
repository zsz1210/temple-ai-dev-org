import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Execute only after the authorized Release workflow succeeds. Read registry;
// all installation/organization mutations stay inside our disposable fixture.
const output = process.argv[2];
assert(output, 'result path required');
const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'alpha33-registry-smoke-'));
const packageName = '@zsz1210/temple-ai-dev-org';
const version = '0.1.0-alpha.33';
const expected = '03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2';
const report = { version, status: 'running', observed_at: new Date().toISOString(), runtime: process.version, steps: [] };
function run(label, command, args, env = {}) {
  const started = performance.now();
  const result = spawnSync(command, args, { cwd: scratch, env: { ...process.env, ...env },
    encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024 });
  report.steps.push({ label, exit_code: result.status, elapsed_ms: Math.round(performance.now() - started) });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${label} failed: ${result.stderr.slice(-1000)}`);
  return result.stdout;
}
try {
  const cache = path.join(scratch, 'npm-cache');
  const registry = JSON.parse(run('registry metadata', 'npm', ['view', `${packageName}@${version}`, 'version', 'dist', 'dist-tags', '--json', '--cache', cache]));
  assert.equal(registry.version, version);
  assert.equal(registry['dist-tags'].next, version);
  assert.equal(registry['dist-tags'].latest, '0.1.0-alpha.30');
  const pack = JSON.parse(run('fresh-cache registry download', 'npm', ['pack', `${packageName}@${version}`, '--ignore-scripts', '--json', '--cache', cache]))[0];
  const data = await fs.readFile(path.join(scratch, pack.filename));
  const sha256 = createHash('sha256').update(data).digest('hex');
  assert.equal(sha256, expected);
  assert.equal(pack.integrity, registry.dist.integrity);
  report.registry = { version, dist_tags: registry['dist-tags'], integrity: pack.integrity,
    sha256, bytes: data.length, attestations: registry.dist.attestations ?? null };
  await fs.writeFile(path.join(scratch, 'package.json'), JSON.stringify({ name: 'alpha33-registry-fixture', version: '0.0.0', private: true }));
  run('registry installation', 'npm', ['install', `${packageName}@${version}`, '--ignore-scripts', '--no-audit', '--no-fund', '--cache', cache]);
  const cli = path.join(scratch, 'node_modules', packageName, 'bin/temple.mjs');
  assert.equal(run('installed CLI version', process.execPath, [cli, '--version']).trim(), version);
  const config = { schema_version: 'temple.init/v1', project: { id: 'registry-smoke', name: 'Registry Smoke Fixture' }, naming_mode: 'manual', agents: [
    { display_name: 'Rowan', positions: ['engineering_manager', 'release_manager', 'observer'] },
    { display_name: 'Mira', positions: ['product_manager', 'ux_designer', 'ui_designer'] },
    { display_name: 'Theo', positions: ['tech_lead'] },
    { display_name: 'Devon', positions: ['developer'] },
    { display_name: 'Quinn', positions: ['quality_evaluator', 'independent_qa'] }
  ] };
  const configPath = path.join(scratch, 'synthetic-init.json');
  await fs.writeFile(configPath, JSON.stringify(config));
  run('dry initialization', process.execPath, [cli, 'init', '.', '--config', configPath, '--dry-run']);
  run('initialization', process.execPath, [cli, 'init', '.', '--config', configPath]);
  const doctor = JSON.parse(run('pinned installed launcher Doctor', process.execPath, ['./templew.mjs', 'doctor', '.', '--json'], { TEMPLE_CLI_PATH: cli }));
  assert.equal(doctor.summary.fail, 0);
  report.doctor = doctor.summary;
  const status = JSON.parse(run('pinned installed launcher Status', process.execPath, ['./templew.mjs', 'status', '.', '--no-write', '--json'], { TEMPLE_CLI_PATH: cli }));
  assert.equal(status.project.id, 'registry-smoke');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = String(error.message).replaceAll(scratch, '<owned-fixture>');
  process.exitCode = 1;
} finally {
  await fs.rm(scratch, { recursive: true, force: true });
  report.owned_fixture_removed = true;
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ status: report.status, steps: report.steps.length, failure: report.failure ?? null }));
}
