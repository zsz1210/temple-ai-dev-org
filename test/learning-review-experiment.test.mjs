import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateBudget,reserve,remainingBatchReserve,runLearningCell,callSafe,manifestTree,editable,actorPrompt,repositoryCheck,finalizeActorObservation} from '../scripts/learning-review-experiment.mjs';

const protocol=JSON.parse(await fs.readFile(new URL('./fixtures/learning-review/budget-contract.json',import.meta.url)));
const proposed=JSON.parse(await fs.readFile(new URL('./fixtures/learning-review/expanded-check-budget.json',import.meta.url)));
const valid=(phase='build',overrides={})=>({phase,status:'completed',generation_requested:true,usage_status:'observed-completed-turn',usage:{operational_tokens:1000},elapsed_ms:100,terminals_empty:true,server_exit_confirmed:true,completion:{decision:'pass',summary:'contract checked'},...overrides});
function scenario({calls=[],grades=[],actorError=null}={}){
  const observed=[],saved=[];let ci=0,gi=0;
  const ops={save:async r=>saved.push(structuredClone(r)),capture:async()=>{observed.push('capture');return 'candidate-'+ci;},actor:async(phase,budget,feedback)=>{observed.push(phase);if(actorError)throw actorError;const r=calls[ci++]??valid(phase);if(phase==='repair')assert.ok(feedback);return r;},grade:async()=>{observed.push('grade');return grades[gi++]??{accepted:true,acceptance:{passed:true},full:{accepted:true}};}};
  return {ops,observed,saved};
}
test('full envelope reserves both verification passes, one repair and nonzero buffers',()=>{
  assert.equal(validateBudget(protocol),true);
  assert.equal(reserve(protocol,'build',[],960000).tokens,375000);
  for(const field of ['observation_tokens','variability_tokens','cleanup_ms']){const p=structuredClone(protocol);p.planning_budget.phases[0][field]=0;assert.throws(()=>validateBudget(p));}
});
test('reserve rejects phase overrun rather than stealing downstream or other-arm budget',()=>{
  assert.throws(()=>reserve(protocol,'verify',[valid('build',{usage:{operational_tokens:400001}})]),/downstream/);
  assert.throws(()=>reserve(protocol,'verify',[valid('build',{elapsed_ms:1860001})]),/downstream/);
  const state={cells:[{calls:[]}],shared_check_ms:0};
  assert.throws(()=>remainingBatchReserve(protocol,state,0,'build',100),/downstream-check/);
  assert.equal(remainingBatchReserve(proposed,state,0,'build',100).remainingTokens,1920000);
  assert.throws(()=>remainingBatchReserve(protocol,{...state,shared_check_ms:1200001},0,'build',1200001),/shared-check/);
  assert.throws(()=>remainingBatchReserve(protocol,state,0,'build',599000),/seal-buffer/);
});
test('check reserve prevents generation when the next arm cannot finish its complete check path',()=>{
  const state={cells:[{calls:[valid(),valid('verify')]},{calls:[]}],shared_check_ms:1199000};
  assert.throws(()=>remainingBatchReserve(protocol,state,1,'build',1199200),/downstream-check/);
  const enough={...state,shared_check_ms:800000};
  assert.equal(remainingBatchReserve(proposed,enough,1,'build',800200).checkLeft,2800000);
});
test('completed first pass does not consume optional repair or any extra generation',async()=>{
  const s=scenario(),r=await runLearningCell({id:'A-autonomous'},protocol,s.ops);
  assert.deepEqual(s.observed,['build','capture','verify','grade']);assert.equal(r.accepted,true);assert.equal(r.first_pass,true);assert.equal(r.repair_used,false);assert.equal(r.observed_tokens,2000);
});
test('quality failure receives exactly one fresh repair and retains original rejection',async()=>{
  const s=scenario({grades:[{accepted:false,acceptance:{passed:false},full:{accepted:true}},{accepted:true}]}),r=await runLearningCell({id:'A-autonomous'},protocol,s.ops);
  assert.deepEqual(s.observed,['build','capture','verify','grade','repair','capture','reverify','grade']);assert.equal(r.grades[0].accepted,false);assert.equal(r.first_pass,false);assert.equal(r.accepted,true);assert.equal(r.calls.length,4);
});
test('second product rejection ends arm without a third attempt',async()=>{
  const s=scenario({grades:[{accepted:false},{accepted:false}]}),r=await runLearningCell({id:'B-current-lean'},protocol,s.ops);
  assert.equal(r.status,'rejected');assert.equal(r.calls.length,4);assert.equal(r.cohort_stop,undefined);
});
test('a passing oracle does not override a distinct verifier failure',async()=>{
  const s=scenario({calls:[valid(),valid('verify',{completion:{decision:'fail'}}),valid('repair'),valid('reverify',{completion:{decision:'fail'}})]});
  assert.equal((await runLearningCell({id:'A'},protocol,s.ops)).accepted,false);
});
for(const [name,override] of Object.entries({unknown_usage:{usage_status:'unknown',usage:null},late_cleanup:{cleanup_failure:true},missing_exit:{server_exit_confirmed:false},first_stop:{first_stop:'transport-failed'},protected_edit:{protected_drift:['SPEC.md']},token_overrun:{usage:{operational_tokens:400001}},invalid_usage:{usage:{operational_tokens:NaN}}})){
  test(name+' stops entire cohort before verification or repair',async()=>{
    const s=scenario({calls:[valid('build',override)]}),r=await runLearningCell({id:'A'},protocol,s.ops);
    assert.equal(r.cohort_stop,true);assert.deepEqual(s.observed,['build']);assert.equal(r.calls.length,1);assert.equal(r.accepted,false);
  });
}
test('shared harness failure keeps acceptance evidence and never consumes repair',async()=>{
  const s=scenario({grades:[{accepted:false,instrument_failure:{code:'fault-not-exercised'},acceptance:{passed:false}}]}),r=await runLearningCell({id:'A'},protocol,s.ops);
  assert.equal(r.cohort_stop,true);assert.equal(r.repair_used,false);assert.equal(r.grades.length,1);assert.equal(r.calls.length,2);
});
test('unreturned actor call is unknown cost, never reported as zero complete',async()=>{
  const s=scenario({actorError:Error('connection lost')}),r=await runLearningCell({id:'A'},protocol,s.ops);
  assert.equal(r.accounting_complete,false);assert.equal(r.unreturned_call,true);assert.equal(r.cohort_stop,true);
});
test('verifier cleanup failure preserves both observed calls before cohort stop',async()=>{
  const s=scenario({calls:[valid(),valid('verify',{cleanup_failure:true})]}),r=await runLearningCell({id:'A'},protocol,s.ops);
  assert.equal(r.calls.length,2);assert.equal(r.grades.length,0);assert.equal(r.cohort_stop,true);
});
test('protected manifest detects new and changed files, rejects links, excludes only git',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'review-tree-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(path.join(root,'.git'));await fs.writeFile(path.join(root,'.git','scratch'),'temporary');await fs.writeFile(path.join(root,'SPEC.md'),'one');
  const before=await manifestTree(root);await fs.writeFile(path.join(root,'SPEC.md'),'two');assert.notDeepEqual(await manifestTree(root),before);assert.equal(Object.keys(before).length,1);
  await fs.symlink('/tmp',path.join(root,'outside'));await assert.rejects(manifestTree(root),/symlink/);
});
test('only product source and new named tests editable; review prompt remains arm blind',()=>{
  assert.equal(editable('product/src/learning-operations.mjs'),true);assert.equal(editable('product/test/learning-review-behavior.test.mjs'),true);
  for(const p of ['SPEC.md','product/package.json','product/test/learning-operations.test.mjs','.ai-org/work-items/WI-0001.json'])assert.equal(editable(p),false);
  assert.equal(actorPrompt('A-autonomous','verify'),actorPrompt('B-current-lean','verify'));
  assert.equal(callSafe(valid(),protocol.planning_budget.phases[0]),true);
});
test('local full-gate process retains nonzero product rejection without cleanup ambiguity',async()=>{
  const r=await repositoryCheck(process.execPath,['-e','process.exit(2)'],{cwd:process.cwd(),env:{PATH:process.env.PATH},timeout:5000});
  assert.equal(r.exit_code,2);assert.equal(r.timed_out,false);assert.equal(r.process_group_empty,true);assert.equal(r.cleanup_failure,false);
});
test('local full-gate timeout kills its owned descendant group and stays an instrument failure',async()=>{
  const r=await repositoryCheck(process.execPath,['-e','require("node:child_process").spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:"inherit"});setInterval(()=>{},1000)'],{cwd:process.cwd(),env:{PATH:process.env.PATH},timeout:200});
  assert.equal(r.timed_out,true);assert.equal(r.group_formed,true);assert.equal(r.process_group_empty,true);assert.equal(r.cleanup_failure,true);
});
test('normal parent exit with a sleeping grandchild is a retained cleanup fault, not acceptance',async()=>{
  const r=await repositoryCheck(process.execPath,['-e','const c=require("node:child_process").spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:"ignore"});console.log(c.pid);c.unref()'],{cwd:process.cwd(),env:{PATH:process.env.PATH},timeout:3000});
  const pid=Number(r.stdout.trim());assert.ok(pid>0);
  assert.equal(r.exit_code,0);assert.equal(r.group_formed,true);assert.equal(r.process_group_empty,true);assert.equal(r.cleanup_failure,true);assert.ok(r.detected_faults.includes('surviving-descendant'));
  assert.throws(()=>process.kill(pid,0),e=>e.code==='ESRCH');
});
test('post-call scope scan error retains already observed usage and stops before more generation',async()=>{
  const call=await finalizeActorObservation(valid(),{},async()=>{throw Error('export-symlink');},false);
  const s=scenario({calls:[call]}),r=await runLearningCell({id:'A'},protocol,s.ops);
  assert.equal(r.calls[0].post_call_fault,'export-symlink');assert.equal(r.observed_tokens,1000);assert.equal(r.accounting_complete,true);assert.equal(r.cohort_stop,true);
});
