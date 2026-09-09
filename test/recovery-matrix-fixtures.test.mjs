import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {recoveryFixtures} from '../scripts/recovery-matrix-fixtures.mjs';

async function check(files, tests) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'recovery-fixture-test-'));
  try {
    for (const [file,body] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});
      await fs.writeFile(path.join(root,file),body);
    }
    const r=spawnSync(process.execPath,['--test','--test-reporter=tap','--test-timeout=1000',...tests],{cwd:root,encoding:'utf8',timeout:5000,
      env:{PATH:path.dirname(process.execPath),HOME:root,NODE_OPTIONS:''},maxBuffer:1024*1024});
    assert.equal(r.error,undefined);
    assert.equal(r.signal,null);
    assert.match(r.stdout,/# cancelled 0\b/);
    return r;
  } finally { await fs.rm(root,{recursive:true,force:true}); }
}

test('checkpoint history and edit contract preserve the accepted discount scope', () => {
  assert.deepEqual(recoveryFixtures.map(f=>f.id),['changed-spec','cold-recovery']);
  for (const f of recoveryFixtures) {
    assert.deepEqual(f.editablePaths,['src/quote.mjs','test/additional.test.mjs']);
    assert.equal(f.seed['src/discount.mjs'],f.reference['src/discount.mjs']);
    assert.equal(f.seed['src/discount.mjs'],f.historicalFiles['src/discount.mjs']);
    assert.equal(f.publicTests['test/discount.test.mjs'],f.historicalTests['test/discount.test.mjs']);
    const current=JSON.parse(f.checkpointFiles['CURRENT.json']);
    assert.equal(current.authority,'SPEC.md');
    assert.equal(current.requires_new_candidate_verification,true);
    assert.equal(current.prior_actor_conversation,false);
    assert.deepEqual(current.historical_scope,Object.keys(f.historicalTests));
    assert.equal(Object.hasOwn(f.checkpointFiles,'history/verification-v1.json'),false);
    assert.match(f.checkpointFiles['HANDOFF.md'],/historical only/);
    assert.ok(f.mutations.length>=3);
    for (const m of f.mutations) assert.deepEqual(Object.keys(m.files),['src/quote.mjs']);
  }
  assert.equal(recoveryFixtures[0].historicalFiles['src/quote.mjs'],recoveryFixtures[0].seed['src/quote.mjs']);
  assert.deepEqual(Object.keys(recoveryFixtures[1].historicalTests),['test/discount.test.mjs']);
});

for (const f of recoveryFixtures) {
  test(`${f.id}: actual historical scope passes, current seed fails, reference passes`, async () => {
    const historical=await check({...f.historicalFiles,...f.historicalTests},Object.keys(f.historicalTests));
    assert.equal(historical.status,0,historical.stdout+historical.stderr);
    const seed=await check({...f.seed,...f.publicTests,'oracle.test.mjs':f.hiddenTests},['oracle.test.mjs']);
    assert.equal(seed.status,1,seed.stdout+seed.stderr);
    assert.match(seed.stdout,/# fail [1-9]\d*\b/);
    const reference=await check({...f.reference,...f.publicTests,'oracle.test.mjs':f.hiddenTests},[...Object.keys(f.publicTests),'oracle.test.mjs']);
    assert.equal(reference.status,0,reference.stdout+reference.stderr);
  });
  test(`${f.id}: all semantic mutants fail clean assertions`, async () => {
    for (const mutant of f.mutations) {
      const result=await check({...f.reference,...mutant.files,'oracle.test.mjs':f.hiddenTests},['oracle.test.mjs']);
      assert.equal(result.status,1,mutant.name+'\n'+result.stdout+result.stderr);
      assert.match(result.stdout,/# fail [1-9]\d*\b/);
      assert.match(result.stdout,/ERR_ASSERTION/);
      assert.doesNotMatch(result.stdout+result.stderr,/SyntaxError|ERR_MODULE_NOT_FOUND|test timed out/);
    }
  });
}
