import test from 'node:test';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

test('measure fresh and pooled helper setup with real command counts', async () => {
  const original = childProcess.spawnSync;
  let calls = [];
  childProcess.spawnSync = function(command, args, options) {
    calls.push({ command, args });
    return original.call(this, command, args, options);
  };
  syncBuiltinESMExports();
  const { fixture, createFixturePool } = await import('../../../test/helpers/lean-delivery-fixture.mjs');
  const pool = createFixturePool(), records = [];
  try {
    for (let sample = 0; sample < 4; sample++) {
      for (const mode of sample % 2 ? ['pool', 'fresh'] : ['fresh', 'pool']) {
        calls = [];
        const start = performance.now();
        const f = await (mode === 'fresh' ? fixture() : pool.fixture());
        records.push({mode, sample, elapsed_ms: performance.now() - start, helper_spawn_sync_count: calls.length,
          cli_count: calls.filter(c => c.args?.[0]?.endsWith('/bin/temple.mjs')).length,
          git_count: calls.filter(c => c.command === 'git').length,
          copy_receipt: f.setup[0].kind === 'copied-initial-fixture' ? f.setup[0] : null});
        await f.cleanup();
      }
    }
  } finally {
    await pool.cleanup();
    childProcess.spawnSync = original;
    syncBuiltinESMExports();
  }
  await fs.writeFile('/tmp/wi0239-bench.json', JSON.stringify({scope: 'helper-level direct synchronous child processes; nested CLI subprocesses excluded', records}, null, 2));
});
