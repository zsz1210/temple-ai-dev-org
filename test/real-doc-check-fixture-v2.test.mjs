import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {docFixture as legacy} from '../scripts/real-doc-check-fixture.mjs';
import {docFixture,referenceBoundaryMutations} from '../scripts/real-doc-check-fixture-v2.mjs';
import {classifyMatrixCheck} from '../scripts/delivery-matrix-experiment.mjs';

async function run(t,files){
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'doc-v2-control-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  for(const [relative,body] of Object.entries({...files,...docFixture.publicTests,'oracle.test.mjs':docFixture.hiddenTests})){
    const target=path.join(root,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,body);
  }
  const env={...process.env,TMPDIR:root};delete env.NODE_TEST_CONTEXT;
  const r=spawnSync(process.execPath,['--test','--test-timeout=1000','--test-reporter=tap','oracle.test.mjs',...Object.keys(docFixture.publicTests)],{cwd:root,env,encoding:'utf8',timeout:10000,maxBuffer:512*1024});
  assert.equal(r.error,undefined);assert.equal(r.signal,null);
  const result=classifyMatrixCheck({stdout:r.stdout,stderr:r.stderr,exit_code:r.status});
  assert.equal(result.invalid_execution,false);assert.equal(result.timed_out,false);assert.equal(result.cancelled,0);assert.equal(result.tests,20);
  return result;
}
test('versioned correction preserves the unsolved product, brief and five mutant intents',()=>{
  assert.deepEqual(docFixture.seed,legacy.seed);assert.equal(docFixture.spec,legacy.spec);assert.deepEqual(docFixture.publicTests,legacy.publicTests);
  assert.deepEqual(docFixture.mutations.map(m=>m.name),legacy.mutations.map(m=>m.name));
  assert.notEqual(docFixture.reference['src/doc-links.mjs'],legacy.reference['src/doc-links.mjs']);
});
test('corrected reference passes expanded acceptance while seed and historical reference fail',async t=>{
  const corrected=await run(t,docFixture.reference);assert.equal(corrected.exit_code,0);assert.equal(corrected.passed,20);
  const old=await run(t,legacy.reference);assert.equal(old.exit_code,1);assert.equal(old.failures,3);
  const seed=await run(t,docFixture.seed);assert.equal(seed.exit_code,1);assert.ok(seed.failures>=6);
});
test('all five product mutants and both reference-fault controls fail through assertions',async t=>{
  for(const mutation of [...docFixture.mutations,...referenceBoundaryMutations])await t.test(mutation.name,async t=>{
    const result=await run(t,{...docFixture.reference,...mutation.files});assert.equal(result.exit_code,1);assert.ok(result.failures>0);
    if(mutation.name==='empty-selection-reads-root')assert.ok(result.failed_cases.some(s=>s.includes('empty selection performs no root')));
    if(mutation.name==='enumerable-symbol-option-ignored')assert.ok(result.failed_cases.some(s=>s.includes('enumerable own keys')));
  });
});
