import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {docFixture as v3} from '../scripts/real-doc-check-fixture-v3.mjs';
import {docFixture,referenceBoundaryMutations} from '../scripts/real-doc-check-fixture-v4.mjs';
import {gradeProduct,classifyMatrixCheck} from '../scripts/delivery-matrix-experiment.mjs';
import {coreGradeVerdict,validateCorePregrade} from '../scripts/core-comparison-fixture.mjs';

async function files(root,values){for(const [n,s]of Object.entries(values)){await fs.mkdir(path.dirname(path.join(root,n)),{recursive:true});await fs.writeFile(path.join(root,n),s);}}
async function lab(t){const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'doc-v4-')));t.after(()=>fs.rm(root,{recursive:true,force:true}));return root;}
async function localCheck(values,f,_base,area,label,tests){
  const root=await fs.mkdtemp(path.join(area,label+'-'));await files(root,{...values,...f.publicTests,'package.json':JSON.stringify({type:'module'}),'oracle.test.mjs':f.hiddenTests});
  const env={...process.env,TMPDIR:root,OPENSSL_CONF:'/dev/null'};delete env.NODE_TEST_CONTEXT;
  const r=spawnSync(process.execPath,['--test','--test-timeout=3000','--test-reporter=tap',...tests],{cwd:root,env,encoding:'utf8',timeout:15000,maxBuffer:512*1024});
  assert.equal(r.error,undefined);assert.equal(r.signal,null);
  return classifyMatrixCheck({stdout:r.stdout,stderr:r.stderr,exit_code:r.status});
}
test('v4 preserves seeds and original five faults, and root-state matrix rejects faulty controls',async t=>{
  assert.deepEqual(docFixture.seed,v3.seed);assert.deepEqual(docFixture.publicTests,v3.publicTests);assert.deepEqual(docFixture.mutations.map(x=>x.name),v3.mutations.map(x=>x.name));
  const root=await lab(t),tests=['oracle.test.mjs',...Object.keys(docFixture.publicTests)];
  for(const [name,values,pass]of [['reference',docFixture.reference,true],['v3-root-codes-are-also-conforming',v3.reference,true],['seed',docFixture.seed,false],...docFixture.mutations.map(x=>[x.name,{...docFixture.reference,...x.files},false]),...referenceBoundaryMutations.map(x=>[x.name,{...docFixture.reference,...x.files},false])])await t.test(name,async()=>{
    const r=await localCheck(values,docFixture,{},root,'control',tests);assert.equal(r.invalid_execution,false);assert.equal(r.timed_out,false);assert.equal(r.cancelled,0);assert.equal(r.tests,27);assert.equal(r.exit_code,pass?0:1,JSON.stringify(r));
  });
});
const prefix="import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {findBrokenLinks} from '../src/doc-links.mjs';";
const rootTest=expected=>`test('root error rejection',async t=>{const area=await fs.mkdtemp(path.join(os.tmpdir(),'added-root-'));t.after(()=>fs.rm(area,{recursive:true,force:true}));const root=path.join(area,'file');await fs.writeFile(root,'');await assert.rejects(findBrokenLinks(root,{files:['a.md']}),${expected});});`;
const meaningful="test('empty selection ignores dangling source',async t=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'added-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.writeFile(path.join(root,'a.md'),'[bad](missing)');assert.deepEqual(await findBrokenLinks(root,{files:[]}),[]);});";
test('overspecified generated test is rejected for repair, and only qualified corrected tests can pass',async t=>{
  const area=await lab(t),root=path.join(area,'product');await files(root,{...docFixture.reference,...docFixture.publicTests,'src/doc-links.mjs':docFixture.reference['src/doc-links.mjs'].replace('throw new Error("Markdown root is not a directory")','throw Object.assign(new Error("Root invalid"),{code:"ROOT_INVALID"})'),'test/additional.test.mjs':prefix+rootTest('{code:"ROOT_INVALID"}')+meaningful});
  const grade=await gradeProduct(root,docFixture,{},area,{check:localCheck});assert.equal(grade.behavior.exit_code,0);assert.equal(grade.regression.exit_code,0);assert.equal(grade.reference_baseline.exit_code,1);
  const review={decision:'fail',summary:'The root test imposes an unspecified error code; assert rejection instead.',findings:['reference_baseline=tests-exceed-contract','reference_test=root error rejection','contract_basis=Root I/O failures have no constrained code value']};
  const verdict=coreGradeVerdict(grade,review);assert.equal(verdict.instrument_valid,true);assert.equal(verdict.accepted,false);assert.equal(verdict.meaningful_regression,false);
  for(const mutate of [r=>r.decision='pass',r=>r.findings.pop(),r=>r.findings[2]='contract_basis=invented requirement not in the specification',r=>r.findings[1]='reference_test=another test',r=>r.findings.push('reference_baseline=unresolved-reference-defect')]){const copy=structuredClone(review);mutate(copy);assert.equal(coreGradeVerdict(grade,copy).instrument_valid,false);}
  for(const mutate of [g=>g.reference_baseline.timed_out=true,g=>g.reference_baseline.invalid_execution=true,g=>g.reference_baseline.cancelled=1,g=>g.status='instrument-failure',g=>g.behavior.exit_code=null,g=>g.behavior.tests=0,g=>g.reference_baseline.failed_cases.push('not ok 2 - another failing test')]){const copy=structuredClone(grade);mutate(copy);assert.equal(coreGradeVerdict(copy,review).instrument_valid,false);}
  await files(root,{'test/additional.test.mjs':prefix+rootTest('Error')+meaningful});
  const fixed=await gradeProduct(root,docFixture,{},area,{check:localCheck});assert.equal(fixed.reference_baseline.exit_code,0);assert.ok(fixed.mutations.some(m=>m.detected));assert.equal(coreGradeVerdict(fixed,{decision:'pass'}).accepted,true);
  for(const tests of [0,-1,0.5,undefined])for(const target of ['reference','mutant']){const copy=structuredClone(fixed);(target==='reference'?copy.reference_baseline:copy.mutations[1]).tests=tests;assert.equal(coreGradeVerdict(copy,{decision:'pass'}).instrument_valid,false);}
});
test('qualified controls must execute tests, while an ordinary empty added suite remains repairable',async t=>{
  const area=await lab(t),root=path.join(area,'product');
  const conditional=prefix+"import {describe,after} from 'node:test';const root=await fs.mkdtemp(path.join(os.tmpdir(),'conditional-'));after(()=>fs.rm(root,{recursive:true,force:true}));await fs.writeFile(path.join(root,'a.md'),'[bad](missing)');const result=await findBrokenLinks(root,{files:['a.md','./a.md']});if(result.length===1)test('empty selection',async()=>assert.deepEqual(await findBrokenLinks(root,{files:[]}),[]));else describe('no cases',()=>{});";
  await files(root,{...docFixture.reference,...docFixture.publicTests,'test/additional.test.mjs':conditional});
  const grade=await gradeProduct(root,docFixture,{},area,{check:localCheck});
  assert.equal(grade.behavior.exit_code,0);assert.equal(grade.reference_baseline.tests,1);assert.equal(grade.mutation_status,'qualified');
  const empty=grade.mutations.find(m=>m.name==='normalized-duplicates-retained');assert.equal(empty.exit_code,0);assert.equal(empty.tests,0);assert.ok(grade.mutations.some(m=>m.detected));
  assert.equal(coreGradeVerdict(grade,{decision:'pass'}).instrument_valid,false);assert.equal(coreGradeVerdict(grade,{decision:'pass'}).accepted,false);
  await files(root,{'test/additional.test.mjs':"import {describe} from 'node:test';describe('no cases',()=>{});"});
  const noTests=await gradeProduct(root,docFixture,{},area,{check:localCheck});assert.equal(noTests.regression.tests,0);assert.equal(noTests.mutation_status,'not-run');
  assert.equal(coreGradeVerdict(noTests,{decision:'fail'}).instrument_valid,true);assert.equal(coreGradeVerdict(noTests,{decision:'fail'}).accepted,false);
});
test('pregrade cannot move between candidate, product, stage or protocol',()=>{
  const expected={stage:'verify',protocol_sha256:'a'.repeat(64),candidate_revision:'b'.repeat(40),product_sha256:'c'.repeat(64)},p={...expected,grade:{status:'completed'}};
  assert.equal(validateCorePregrade(p,expected),p.grade);assert.throws(()=>validateCorePregrade(null,expected),/pregrade-candidate-drift/);
  for(const key of Object.keys(expected))assert.throws(()=>validateCorePregrade(p,{...expected,[key]:'changed'}),/pregrade-candidate-drift/);
});
