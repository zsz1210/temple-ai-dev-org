import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {matrixCells,matrixLimits,matrixPrompt,validateMatrix,productAccepted,runCell,gradeProduct,classifyMatrixCheck} from '../scripts/delivery-matrix-experiment.mjs';

test('matrix pairs each task with both models and workflows and freezes order and budget',()=>{
  const cells=matrixCells(),m={schema_version:'delivery-matrix/v1',limits:matrixLimits,cells};
  validateMatrix(m);assert.equal(cells.length,8);
  for(const task of ['batch','retry'])assert.deepEqual(new Set(cells.filter(c=>c.task===task).map(c=>[c.workflow,c.model].join(':'))),new Set(['autonomous:gpt-5.6-terra','temple:gpt-5.6-terra','autonomous:gpt-6-astra','temple:gpt-6-astra']));
  for(const mutate of [m=>m.cells.pop(),m=>m.cells.reverse(),m=>m.cells[0].model='fallback',m=>m.cells[0].effort='high',m=>m.limits.qa_tokens++,m=>m.limits.cell_tokens++,m=>m.schema_version='other']){const copy=structuredClone(m);mutate(copy);assert.throws(()=>validateMatrix(copy));}
});

test('both arms require regression delivery while blind review cannot see workflow or repair feedback',()=>{
  for(const workflow of ['temple','autonomous']){
    const p=matrixPrompt(workflow,'execute');assert.match(p,/add meaningful regression tests in test\/additional.test.mjs/);assert.match(p,/Choose your own implementation/);
    assert.equal(matrixPrompt(workflow,'review',{secret:'HIDDEN'}),matrixPrompt(null,'review'));
  }
  assert.match(matrixPrompt('temple','execute'),/eligible Temple Lean/);
  assert.doesNotMatch(matrixPrompt('autonomous','execute'),/TEMPLE.md|context resolve/);
  assert.doesNotMatch(matrixPrompt(null,'review'),/Temple|autonomous|HIDDEN|\.ai-org/);
  assert.match(matrixPrompt('autonomous','repair',{reason:'correct-boundary'}),/correct-boundary/);
});

const turn=(overrides={})=>({status:'completed',generation_requested:true,completion:{decision:'pass',summary:'verified',findings:[]},usage:{operational_tokens:100},usage_status:'observed-completed-turn',elapsed_ms:10,terminals_empty:true,server_exit_confirmed:true,protected_drift:[],candidate_revision:'candidate',...overrides});
const grade=(accepted=true)=>({accepted,behavior:{exit_code:accepted?0:1,failed_cases:accepted?[]:['not ok - boundary']},regression:{exit_code:0,tests:3},mutations:[]});
function ops({exec=[],review=[],grades=[]}={}){
  const calls={execute:[],review:[],grade:[],saves:[]};
  return {calls,save:async r=>calls.saves.push(structuredClone(r)),execute:async(...args)=>{calls.execute.push(args);return exec.shift()??turn();},review:async(...args)=>{calls.review.push(args);return review.shift()??turn();},grade:async(...args)=>{calls.grade.push(args);return grades.shift()??grade();}};
}
test('first acceptance stops after one executor and review; independent evidence overrides self-claim',async()=>{
  const io=ops(),r=await runCell(matrixCells()[0],io);
  assert.equal(io.calls.saves[0].turns.length,0,'record running cell before generation');
  assert.equal(r.accepted,true);assert.equal(r.first_pass,true);assert.equal(r.repair_used,false);assert.equal(r.operational_tokens_observed,200);assert.equal(r.actor_ms,20);assert.equal(io.calls.execute.length,1);assert.equal(io.calls.review.length,1);
  assert.equal(productAccepted(turn(),turn(),grade(false)),false);
  assert.equal(productAccepted(turn(),turn({completion:{decision:'fail'}}),grade()),false);
  assert.equal(productAccepted(turn({protected_drift:['SPEC.md']}),turn(),grade()),false);
  assert.equal(productAccepted(turn(),turn({protected_drift:['src/a.mjs']}),grade()),false);
});
test('failed first check allows exactly one repair, includes all cost and bounded feedback',async()=>{
  const io=ops({grades:[grade(false),grade(true)]}),r=await runCell(matrixCells()[1],io);
  assert.equal(r.first_pass,false);assert.equal(r.accepted,true);assert.equal(r.repair_used,true);assert.equal(r.turns.length,2);assert.equal(r.qa.length,2);assert.equal(r.operational_tokens_observed,400);
  assert.equal(io.calls.execute[1][0],1);assert.equal(io.calls.execute[1][1].tokens,matrixLimits.cell_tokens-200);assert.deepEqual(io.calls.execute[1][2].behavior_failures,['not ok - boundary']);assert.equal('mutations' in io.calls.execute[1][2],false,'do not leak hidden mutation suite');
  const twice=await runCell(matrixCells()[0],ops({grades:[grade(false),grade(false)]}));assert.equal(twice.status,'rejected');assert.equal(twice.turns.length,2);
});
test('known protected drift is rejected without an attempt that could hide the violation',async()=>{
  const io=ops({exec:[turn({protected_drift:['SPEC.md']})]}),r=await runCell(matrixCells()[0],io);
  assert.equal(r.status,'rejected');assert.equal(r.repair_used,false);assert.equal(io.calls.execute.length,1);
});
test('budget exhaustion never launches a reviewer or repair and remains a recorded outcome',async()=>{
  const io=ops({exec:[turn({usage:{operational_tokens:matrixLimits.cell_tokens}})]}),r=await runCell(matrixCells()[0],io);
  assert.equal(r.status,'budget-exhausted');assert.equal(io.calls.review.length,0);assert.equal(r.operational_tokens_observed,matrixLimits.cell_tokens);
});
test('usage loss, incomplete turns, cleanup and postprocessing failures retain evidence before shared stop',async()=>{
  for(const broken of [turn({usage:null,usage_status:'unknown',first_stop:'usage-missing'}),turn({usage_status:'incomplete-observation',first_stop:'token-limit'}),turn({terminals_empty:false,first_stop:'cleanup-unconfirmed'}),turn({postprocess_failure:'unsafe-symlink',first_stop:'candidate-inspection'})]){
    const io=ops({exec:[broken]});await assert.rejects(runCell(matrixCells()[0],io),/shared-stop/);const last=io.calls.saves.at(-1);assert.equal(last.status,'stopped');assert.equal(last.turns.length,1);assert.equal(last.operational_tokens_observed,broken.usage?.operational_tokens??0);assert.equal(io.calls.review.length,0);
  }
  const io=ops({review:[turn({usage_status:'incomplete-observation',first_stop:'token-limit'})]});await assert.rejects(runCell(matrixCells()[0],io),/shared-stop/);assert.equal(io.calls.saves.at(-1).qa.length,1);assert.equal(io.calls.grade.length,0);
});
test('deterministic grader exception preserves already generated executor and reviewer costs',async()=>{
  const io=ops();io.grade=async()=>{throw Error('grader failed');};await assert.rejects(runCell(matrixCells()[0],io),/grader failed/);
  const last=io.calls.saves.at(-1);assert.equal(last.operational_tokens_observed,200);assert.equal(last.accounting_complete,true);assert.equal(last.first_stop,'grader failed');
});

test('matrix check distinguishes assertion failures, test cancellation and runtime errors',()=>{
  const result=(stdout,stderr='')=>classifyMatrixCheck({exit_code:1,stdout,stderr});
  assert.deepEqual([result('not ok 1 - error\n# tests 2\n# pass 1\n# fail 1\n# cancelled 0').failures,result('# cancelled 1').cancelled],[1,1]);
  assert.equal(result('failureType: testTimeoutFailure').timed_out,true);
  assert.equal(result('','Library not loaded: missing dylib').invalid_execution,true);
});

test('grader checkpoints components on failure and rejects unqualified mutation interpretation',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'matrix-grade-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.mkdir(path.join(root,'test'));await fs.writeFile(path.join(root,'test/additional.test.mjs'),'// inert mocked product');
  const f={reference:{},mutations:[{name:'fault',files:{}}]},ok={exit_code:0,tests:1,failures:0,cancelled:0,timed_out:false,invalid_execution:false,failed_cases:[]};
  const snapshots=[];let calls=0;
  await assert.rejects(gradeProduct(root,f,{},root,{onProgress:r=>snapshots.push(r),check:async()=>{if(++calls===4)throw Error('provider-lost');return ok;}}),/provider-lost/);
  const last=snapshots.at(-1);assert.equal(last.status,'instrument-failure');assert.deepEqual(last.behavior,ok);assert.deepEqual(last.regression,ok);assert.deepEqual(last.reference_baseline,ok);assert.equal(last.mutations.length,0);assert.ok(last.elapsed_ms>=0);
  calls=0;const unqualified=await gradeProduct(root,f,{},root,{check:async()=>++calls===3?{...ok,exit_code:1,failures:1}:ok});
  assert.equal(unqualified.accepted,true,'reference qualification is a diagnostic boundary, not an invented product gate');assert.equal(unqualified.mutation_status,'unqualified-reference-baseline');assert.equal(calls,3);assert.equal(unqualified.mutations.length,0);
  calls=0;const cancelled=await gradeProduct(root,f,{},root,{check:async()=>++calls===4?{...ok,exit_code:1,failures:2,cancelled:1,timed_out:true}:ok});assert.equal(cancelled.mutations[0].detected,false,'a mixed assertion/timeout is not a clean kill');
});

test('cell preserves streamed partial grade and costs when later grading fails',async()=>{
  const io=ops();io.grade=async(e,progress)=>{await progress({status:'running',behavior:{exit_code:0},candidate_revision:e.candidate_revision});throw Error('late grader failure');};
  await assert.rejects(runCell(matrixCells()[0],io),/late grader failure/);const final=io.calls.saves.at(-1);assert.equal(final.grades[0].behavior.exit_code,0);assert.equal(final.operational_tokens_observed,200);assert.equal(final.accounting_complete,true);
});
