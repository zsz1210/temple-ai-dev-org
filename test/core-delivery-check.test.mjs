import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {checkDeliveryFiles} from '../scripts/core-delivery-grader.mjs';
import {runDeliveryCheck,inventory} from '../scripts/core-delivery-check.mjs';
import {docFixture,deliveryCheckerSource} from '../scripts/real-doc-check-fixture-v5.mjs';
import {docFixture as previous} from '../scripts/real-doc-check-fixture-v4.mjs';
import {coreGradeVerdict} from '../scripts/core-comparison-fixture.mjs';

async function setup(t,body){const root=await fs.mkdtemp(path.join(os.tmpdir(),'delivery-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.mkdir(path.join(root,'test'));await fs.writeFile(path.join(root,'test/check.test.mjs'),"import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';\n"+body);return root;}
test('public check preserves clean workspace and cleans only its owned temporary area',async t=>{
  const root=await setup(t,"test('clean',async()=>{const d=await fs.mkdtemp(path.join(os.tmpdir(),'fixture-'));try{await fs.writeFile(path.join(d,'a'),'data');}finally{await fs.rm(d,{recursive:true,force:true});}});");
  await fs.writeFile(path.join(root,'keep'),'unrelated');const before=await inventory(root);
  const result=await runDeliveryCheck(root);assert.equal(result.accepted,true);assert.equal(result.owned_area_removed,true);assert.deepEqual(await inventory(root),before);
});
test('detects leaked files, empty directories and symlinks without following or erasing evidence',async t=>{
  const root=await setup(t,"test('leaks',async()=>{await fs.writeFile(path.join(os.tmpdir(),'outside.md'),'leak');await fs.mkdir(path.join(os.tmpdir(),'empty'));await fs.symlink('/does-not-exist',path.join(os.tmpdir(),'link'));});");
  const result=await runDeliveryCheck(root);assert.equal(result.exit_code,0);assert.equal(result.accepted,false);assert.equal(result.owned_area_removed,true);assert.deepEqual(result.temporary_residue.map(x=>[x.path,x.type]),[['empty','directory'],['link','symlink'],['outside.md','file']]);assert.deepEqual(await fs.readdir(root),['test']);
});
test('records cleanup defects even when tests fail and reports persistent cwd changes',async t=>{
  const root=await setup(t,"test('failed',async()=>{await fs.writeFile(path.join(os.tmpdir(),'left'),'left');await fs.writeFile('cwd-left','cwd');assert.fail('real test failure');});");
  const result=await runDeliveryCheck(root);assert.equal(result.exit_code,1);assert.equal(result.accepted,false);assert.equal(result.temporary_residue[0].path,'left');assert.deepEqual(result.workspace_changes,['cwd-left']);assert.equal(await fs.readFile(path.join(root,'cwd-left'),'utf8'),'cwd');assert.equal(result.owned_area_removed,true);
});
test('timeout cannot pass and invalid test selections do not execute',async t=>{
  const root=await setup(t,"test('timeout',async()=>{await new Promise(()=>{});});");
  const result=await runDeliveryCheck(root,{testTimeoutMs:25,timeoutMs:2000});assert.equal(result.accepted,false);assert.equal(result.owned_area_removed,true);
  for(const tests of [[],['../outside.test.mjs'],['/tmp/outside.test.mjs'],['-option.test.mjs']])await assert.rejects(runDeliveryCheck(root,{tests}),/invalid-test-selection/);
});
test('test-created .git residue is a cwd cleanup violation',async t=>{
  const root=await setup(t,"test('git residue',async()=>{await fs.mkdir('.git',{recursive:true});await fs.writeFile('.git/forgotten.txt','left');});");
  const result=await runDeliveryCheck(root);assert.equal(result.exit_code,0);assert.equal(result.accepted,false);assert.ok(result.workspace_changes.includes('.git/forgotten.txt'));assert.equal(await fs.readFile(path.join(root,'.git/forgotten.txt'),'utf8'),'left');
});
test('outer deadline terminates the actual Node test child before removing its area',async t=>{
  const root=await setup(t,"test('blocked child',async()=>{await fs.writeFile('child.pid',String(process.pid));while(true){}});");
  const result=await runDeliveryCheck(root,{timeoutMs:800,testTimeoutMs:5000});
  const pid=Number(await fs.readFile(path.join(root,'child.pid'),'utf8'));
  assert.equal(result.accepted,false);assert.equal(result.timed_out,true);assert.equal(result.process_group_exit_confirmed,true,JSON.stringify(result));assert.equal(result.owned_area_removed,true);assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});
});
test('final observed group exit is separate from earlier termination signal errors',async t=>{
  const root=await setup(t,"test('blocked child',async()=>{await fs.writeFile('child.pid',String(process.pid));while(true){}});");
  const kill=process.kill.bind(process);let terminated=false;
  t.mock.method(process,'kill',(pid,signal)=>{
    if(pid<0&&signal==='SIGKILL'){
      if(terminated)throw Object.assign(Error('injected signal race'),{code:'EPERM'});
      const result=kill(pid,signal);terminated=true;return result;
    }
    return kill(pid,signal);
  });
  const result=await runDeliveryCheck(root,{timeoutMs:800,testTimeoutMs:5000});
  assert.equal(result.accepted,false);assert.equal(result.timed_out,true);
  assert.deepEqual(result.termination_signal_errors,['EPERM']);assert.equal(result.process_group_exit_confirmed,true,JSON.stringify(result));assert.equal(result.owned_area_removed,true);
  const pid=Number(await fs.readFile(path.join(root,'child.pid'),'utf8'));assert.throws(()=>kill(pid,0),{code:'ESRCH'});
});
test('public and regression feedback cannot reflect hidden oracle through dynamic test names',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'delivery-isolation-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  const files={'test/additional.test.mjs':"import test from 'node:test';import fs from 'node:fs/promises';test(await fs.readFile('oracle.test.mjs','utf8').catch(()=> 'NO_HIDDEN'),()=>{throw Error('deliberate product rejection');});"};
  const fixture={publicTests:{},hiddenTests:'PRIVATE_ORACLE_MARKER_DO_NOT_SEND'};
  const executor=async(_base,cwd,binary,args,opts)=>{try{const r=await promisify(execFile)(binary,args,{cwd,...opts});return {exit_code:0,...r};}catch(e){return {exit_code:e.code,stdout:e.stdout,stderr:e.stderr};}};
  for(const label of ['public-delivery','regression','reference-baseline','mutation']){
    const result=await checkDeliveryFiles(files,fixture,{},lab,label,['test/additional.test.mjs'],{executor});
    assert.deepEqual(result.failed_cases,['not ok 1 - NO_HIDDEN']);assert.equal(JSON.stringify(result).includes(fixture.hiddenTests),false);
  }
});
test('V5 public helper preserves product/oracle inputs and carries no hidden acceptance',()=>{
  assert.equal(docFixture.hiddenTests,previous.hiddenTests);assert.deepEqual(docFixture.reference,previous.reference);assert.deepEqual(docFixture.mutations,previous.mutations);assert.deepEqual(docFixture.publicTests,previous.publicTests);for(const[k,v]of Object.entries(previous.seed))assert.equal(docFixture.seed[k],v);assert.equal(docFixture.seed['check-delivery.mjs'],deliveryCheckerSource);
  assert.equal(deliveryCheckerSource.includes('findBrokenLinks'),false);assert.equal(deliveryCheckerSource.includes('real-doc-check'),false);
});
test('mechanical rejection and semantic findings are both retained as repair feedback',()=>{
  const check={exit_code:0,tests:1,cancelled:0};const grade={status:'completed',behavior:check,regression:check,reference_baseline:check,mutation_status:'qualified',mutations:previous.mutations.map(m=>({name:m.name,...check,detected:true})),accepted:false,public_delivery:{...check,delivery:{accepted:false,temporary_residue:[{path:'outside.md'}]}}};
  const verdict=coreGradeVerdict(grade,{decision:'fail',summary:'absolute path violation',findings:['semantic defect']});assert.equal(verdict.instrument_valid,true);assert.equal(verdict.accepted,false);assert.equal(verdict.feedback.public_delivery.delivery.temporary_residue[0].path,'outside.md');assert.deepEqual(verdict.feedback.review.findings,['semantic defect']);
});
