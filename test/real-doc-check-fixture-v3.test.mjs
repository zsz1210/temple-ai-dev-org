import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {docFixture as v2} from '../scripts/real-doc-check-fixture-v2.mjs';
import {docFixture,referenceBoundaryMutations,reviewRubric} from '../scripts/real-doc-check-fixture-v3.mjs';
import {classifyMatrixCheck} from '../scripts/delivery-matrix-experiment.mjs';

async function run(t,files){
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'doc-v3-control-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  for(const [relative,body] of Object.entries({...files,...docFixture.publicTests,'oracle.test.mjs':docFixture.hiddenTests})){
    const target=path.join(root,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,body);
  }
  const env={...process.env,TMPDIR:root};delete env.NODE_TEST_CONTEXT;
  const r=spawnSync(process.execPath,['--test','--test-timeout=3000','--test-reporter=tap','oracle.test.mjs',...Object.keys(docFixture.publicTests)],{cwd:root,env,encoding:'utf8',timeout:15000,maxBuffer:512*1024});
  assert.equal(r.error,undefined);assert.equal(r.signal,null);
  const result=classifyMatrixCheck({stdout:r.stdout,stderr:r.stderr,exit_code:r.status});
  assert.equal(result.invalid_execution,false,JSON.stringify(result));assert.equal(result.timed_out,false);assert.equal(result.cancelled,0);assert.equal(result.tests,26);
  return result;
}
test('v3 preserves seed and five faults while explicitly versioning the acceptance contract',()=>{
  assert.deepEqual(docFixture.seed,v2.seed);assert.deepEqual(docFixture.publicTests,v2.publicTests);
  assert.deepEqual(docFixture.mutations.map(m=>m.name),v2.mutations.map(m=>m.name));
  assert.equal(docFixture.fixture_version,3);assert.notEqual(docFixture.spec,v2.spec);
  assert.match(reviewRubric,/V3 acceptance boundaries/);
});
test('complete v3 reference passes and old own-key reference exposes the inheritance disagreement',async t=>{
  const reference=await run(t,docFixture.reference);assert.equal(reference.exit_code,0,JSON.stringify(reference));assert.equal(reference.passed,26);
  const old=await run(t,v2.reference);assert.equal(old.exit_code,1);assert.ok(old.failed_cases.some(s=>s.includes('all prototype levels')));
  const seed=await run(t,docFixture.seed);assert.equal(seed.exit_code,1);assert.ok(seed.failures>=6);
});
test('five product faults and five contract faults are rejected by valid assertion executions',async t=>{
  for(const mutation of [...docFixture.mutations,...referenceBoundaryMutations])await t.test(mutation.name,async t=>{
    const result=await run(t,{...docFixture.reference,...mutation.files});assert.equal(result.exit_code,1);assert.ok(result.failures>0);
  });
});
