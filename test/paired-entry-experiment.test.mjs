import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fixtures} from '../scripts/paired-entry-fixtures.mjs';
import {gradeProduct} from '../scripts/delivery-matrix-experiment.mjs';
import {checkDiagnosticFiles} from '../scripts/autonomous-delivery-experiment.mjs';
import {git,tree,write} from '../scripts/autonomy-experiment.mjs';
import {digest} from '../scripts/core-runtime-qualification.mjs';
import {pairedCells,validatePairedSettings,pairedAdmission,validateCheckpoint,validateCheckpointRoots,checkpointToken,assertReferenceQualified,finishRejectedCell,segmentLimits,validateContinuation} from '../scripts/paired-entry-experiment.mjs';
const settings=JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/paired-entry.settings.json',import.meta.url)));
const copy=()=>structuredClone(settings);
function stoppedPredecessor(){
  const p={settings:copy(),execution_kind:'live-diagnostic'},ids=pairedCells(settings).map(c=>c.cell_id);
  const r={protocol_sha256:digest(p),execution_kind:'live-diagnostic',status:'stopped',failure:'protocol-error',cells:ids.slice(0,7).map((id,i)=>({cell_id:id,status:i===6?'stopped':'completed',accepted:i!==6,...(i===6?{failure:'protocol-error',cleanup:{status:'released'}}:{})})),unrun:ids.slice(7),calls:[{cell_id:ids[6],result:{status:'stopped',first_stop:'protocol-error',server_exit_confirmed:true,terminals_empty:true,protected_drift:[]}}]};
  r.calls=[];
  for(const [i,o]of r.cells.entries()){
    const good={status:'completed',generation_requested:true,server_exit_confirmed:true,terminals_empty:true,usage_status:'observed-completed-turn',usage:{operational_tokens:1},protected_drift:[]};
    const review=i===6?{...good,status:'stopped',first_stop:'protocol-error',usage_status:'incomplete-observation'}:structuredClone(good);
    o.calls=[r.calls.length,r.calls.length+1];o.attempts=[{attempt:0,phase:'verify',build:good,review:i===6?null:review,acceptance:i===6?null:{accepted:true}}];
    for(const[stage,result]of [['build',good],['verify',review]])r.calls.push({index:r.calls.length,cell_id:o.cell_id,mode:pairedCells(settings)[i].mode,stage,result});
  }
  const result={...r,checksum:digest(r)},m={schema_version:'temple.paired-continuation/v1',replay_interrupted:false,protocol_sha256:digest(p),result_sha256:digest(result),selected_cell_ids:ids.slice(7),segment_limits:segmentLimits(settings,7)};
  return {p,result,m};
}
test('settled protocol predecessor selects only untouched suffix with complete independent reserves',()=>{
  const{p,result,m}=stoppedPredecessor();assert.equal(validateContinuation(m,p,result,settings),7);
  assert.deepEqual(segmentLimits(settings,7),{cells:5,tokens:3500000,time_ms:13200000,calls:20});
  const a=pairedAdmission(settings,7,'build',[],0,7);assert.equal(a.reserved_tokens,3500000);
  assert.throws(()=>pairedAdmission(settings,6,'build',[],0,7),/admission-position/);
});
test('continuation rejects replay, drift, partial cleanup, candidate rejection and wrong reserves',()=>{
  for(const mutate of [x=>x.m.replay_interrupted=true,x=>x.m.selected_cell_ids.unshift(x.result.cells.at(-1).cell_id),x=>x.result.cells[0].status='rejected',x=>x.result.failure='candidate-rejected-after-repair',x=>x.result.calls[0].result.server_exit_confirmed=false,x=>x.result.calls[0].result.terminals_empty=false,x=>x.result.calls[0].result.protected_drift=['SPEC.md'],x=>x.result.cells.at(-1).cleanup.status='unknown',x=>x.m.segment_limits.tokens--,x=>x.result.unrun.pop(),x=>x.result.calls[0].cell_id=x.result.unrun[0],x=>x.result.calls.splice(0,13),x=>x.result.cells[0].calls=[0,2],x=>x.result.calls[0].stage='verify',x=>x.result.cells[0].attempts[0].review={status:'invented'}]){
    const x=stoppedPredecessor();mutate(x);const{checksum,...body}=x.result;x.result.checksum=digest(body);x.m.result_sha256=digest(x.result);
    assert.throws(()=>validateContinuation(x.m,x.p,x.result,settings));
  }
  const x=stoppedPredecessor();x.result.extra=true;assert.throws(()=>validateContinuation(x.m,x.p,x.result,settings),/predecessor-digest/);
});
test('synthetic predecessor cannot skip cells in a live successor',()=>{
  const x=stoppedPredecessor();x.p.execution_kind='offline-rehearsal';x.result.execution_kind='offline-rehearsal';
  x.m.protocol_sha256=digest(x.p);x.result.protocol_sha256=digest(x.p);
  const{checksum,...body}=x.result;x.result.checksum=digest(body);x.m.result_sha256=digest(x.result);
  assert.throws(()=>validateContinuation(x.m,x.p,x.result,settings,'live-diagnostic'),/continuation-generation-provenance/);
  assert.equal(validateContinuation(x.m,x.p,x.result,settings,'offline-rehearsal'),7);
});
test('same-mode counterbalanced blocks have unique scenario identities and separate risk axes',()=>{
  const s=copy(),cells=pairedCells(s);assert.equal(validatePairedSettings(s).cells,12);
  assert.equal(new Set(cells.map(c=>c.cell_id)).size,12);
  for(const id of s.scenarios.map(x=>x.id)){
    const group=cells.filter(c=>c.scenario_id===id);assert.equal(group.length,4);
    assert.deepEqual(group.map(c=>c.mode),['temple-individual-cli','temple-autonomous-entry','temple-autonomous-entry','temple-individual-cli']);
    assert.equal(group.filter(c=>c.recovery).length,id==='handoff-recovery'?4:0);
  }
  assert.equal(cells[0].risk,'low');assert.equal(cells[0].complexity,'simple');
});
test('invalid/coerced IDs, repeated modes, unqualified models and missing buffers reject before preparation',()=>{
  for(const mutate of [s=>s.scenarios[0].id=null,s=>s.scenarios[1].id=s.scenarios[0].id,
    s=>s.pair_orders[1]=s.pair_orders[0],s=>s.pair_orders[0]=['temple-individual-cli','temple-individual-cli'],
    s=>s.models.build='other',s=>s.effort='high',s=>s.phases.build.reserve_tokens=s.phases.build.stop_tokens,
    s=>s.phases.verify.reserve_ms=s.phases.verify.stop_ms,s=>s.ceilings.calls=24,s=>s.cleanup.tokens=0,
    s=>s.authority_ref='../outside',s=>s.retry=true,s=>s.scenarios[0].recovery='false',s=>s.candidate_failure='stop']){
    const s=copy();mutate(s);assert.throws(()=>validatePairedSettings(s));
  }
});
test('paired public boundary contracts agree with references and reject the observed presence interpretation',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'paired-boundaries-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  for(const f of fixtures){
    const variants=[['reference',f.reference],['seed',f.seed],...f.mutations.map(m=>[m.name,{...f.reference,...m.files}])];
    if(f.id==='small')variants.push(['presence-interpretation',{...f.reference,'src/page.mjs':f.reference['src/page.mjs'].replace('options.status === undefined','!Object.hasOwn(options, "status")').replace('options.cursor !== undefined','Object.hasOwn(options, "cursor")')}]);
    for(const [name,files]of variants){
      const root=path.join(lab,f.id,name);for(const [p,body]of Object.entries({...files,...f.publicTests,'oracle.test.mjs':f.hiddenTests}))await write(root,p,body);
      const env={...process.env};delete env.NODE_TEST_CONTEXT;
      const result=spawnSync(process.execPath,['--test','oracle.test.mjs',...Object.keys(f.publicTests)],{cwd:root,env,encoding:'utf8',timeout:10000});
      assert.equal(result.error,undefined);assert.equal(result.status===0,name==='reference',`${f.id}/${name}: ${result.stdout} ${result.stderr}`);
    }
  }
});
test('reference disagreement is classified before another verifier call',()=>{
  const valid={exit_code:0,registered_executed_cases:3,invalid_execution:false,timed_out:false,cancelled:0};
  assert.doesNotThrow(()=>assertReferenceQualified({reference_baseline:valid}));
  for(const bad of [{exit_code:1},{registered_executed_cases:0},{registered_executed_cases:1.5},{registered_executed_cases:undefined},{invalid_execution:true},{invalid_execution:undefined},{timed_out:true},{cancelled:1}])
    assert.throws(()=>assertReferenceQualified({reference_baseline:{...valid,...bad}}),/reference-qualification-failure/);
  assert.throws(()=>assertReferenceQualified({reference_baseline:null}),/regression-qualification-unavailable/);
  assert.throws(()=>assertReferenceQualified({}),/regression-qualification-unavailable/);
});
test('actual conditional reference with exit zero and no registered cases is blocked before review',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'paired-empty-reference-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const f=fixtures.find(f=>f.id==='feature');
  const tests=f.hiddenTests.replaceAll("'./src/","'../src/").replace("import test from 'node:test';","import nodeTest from 'node:test'; import * as module from '../src/catalog.mjs'; const test=(...args)=>module.additionalCoverage ? nodeTest(...args):undefined;");
  for(const[p,body]of Object.entries({...f.reference,'src/catalog.mjs':f.reference['src/catalog.mjs']+'\nexport const additionalCoverage=true;\n','test/additional.test.mjs':tests}))await write(root,p,body);
  const executor=async(_base,cwd,binary,args,options)=>{
    const env={...process.env};delete env.NODE_TEST_CONTEXT;
    const r=spawnSync(binary,args,{cwd,env,encoding:'utf8',timeout:options.timeout,maxBuffer:options.maxBuffer});if(r.error)throw r.error;
    return {stdout:r.stdout,stderr:r.stderr,exit_code:r.status};
  };
  const grade=await gradeProduct(root,f,{},root,{check:(...args)=>checkDiagnosticFiles(...args,{executor})});
  assert.equal(grade.regression.exit_code,0);assert(grade.regression.registered_executed_cases>0);
  assert.equal(grade.reference_baseline.exit_code,0);assert.equal(grade.reference_baseline.registered_executed_cases,0);
  assert.throws(()=>assertReferenceQualified(grade),/reference-qualification-failure/);
});
test('terminal candidate rejection requires confirmed cleanup and remains rejected rather than accepted',async()=>{
  const make=()=>({status:'running',started_at_ms:10,attempts:[{acceptance:{accepted:false}}]});
  const calls=[{result:{status:'completed',generation_requested:false,server_exit_confirmed:true,protected_drift:[]}}];
  const o=make();await finishRejectedCell(o,calls,async()=>({status:'released'}),()=>20);
  assert.equal(o.status,'rejected');assert.equal(o.accepted,false);assert.equal(o.elapsed_ms,10);
  const bad=make();await assert.rejects(finishRejectedCell(bad,calls,async()=>({status:'blocked'})),/cleanup/);assert.equal(bad.status,'running');
  let cleaned=false;await assert.rejects(finishRejectedCell(make(),[{result:{status:'stopped'}}],async()=>{cleaned=true;}),/unsettled/);assert.equal(cleaned,false);
});
test('every phase reserves remaining verification repair future cells and cleanup in execution order',()=>{
  const s=copy();const first=pairedAdmission(s,0,'build',[],0);assert.equal(first.reserved_tokens,s.ceilings.tokens);
  assert.equal(first.reserved_ms+s.setup.time_ms,s.ceilings.time_ms);
  assert.throws(()=>pairedAdmission(s,0,'build',[],s.setup.time_ms+1),/reserve/);
  assert.throws(()=>pairedAdmission(s,0,'build',[{result:null}],0),/token-reserve/);
  const known=n=>({result:{usage_status:'observed-completed-turn',usage:{input_tokens:n,cached_input_tokens:0,output_tokens:0,operational_tokens:n},elapsed_ms:1}});
  const last=pairedAdmission(s,11,'reverify',[],0);
  assert.equal(last.reserved_tokens,s.phases.reverify.reserve_tokens+s.cleanup.tokens+s.outer.tokens);
  assert.throws(()=>pairedAdmission(s,11,'reverify',[known(s.ceilings.tokens-last.reserved_tokens+1)],0),/token-reserve/);
  assert.throws(()=>pairedAdmission(s,12,'build',[],0),/position/);
  assert.throws(()=>pairedAdmission(s,0,'recovery',[],0),/position/);
});
function checkpoint(){return {status:'checkpoint',protocol_sha256:'p',checkpoint:{cell_id:'c',producer_pid:10,next_phase:'verify'},cells:[{cell_id:'c',status:'running',attempts:[{build:{completion:{decision:'pass'}},review:null}]}],calls:[{result:{status:'completed',generation_requested:false,server_exit_confirmed:true}}]};}
test('checkpoint resumes only exact settled state in another process, never a failed or pending call',()=>{
  const s=checkpoint();assert.equal(validateCheckpoint(s,checkpointToken(s),'p',11).cell_id,'c');
  assert.throws(()=>validateCheckpoint(s,checkpointToken(s),'p',10),/process/);
  assert.throws(()=>validateCheckpoint(s,'wrong','p',11),/mismatch/);
  assert.throws(()=>validateCheckpoint(s,checkpointToken(s),'other',11),/mismatch/);
  for(const mutate of [s=>s.status='stopped',s=>s.checkpoint.next_phase='build',s=>s.cells[0].attempts[0].review={},
    s=>s.checkpoint.producer_pid=null,s=>s.checkpoint.producer_pid=-1,
    s=>s.calls[0].result=null,s=>s.calls[0].result.server_exit_confirmed=false,
    s=>s.calls[0].result.status='budget-stop',s=>s.calls[0].result.protected_drift=['SPEC.md'],
    s=>s.calls[0].result={generation_requested:true,server_exit_confirmed:true,terminals_empty:false}]){
    const s=checkpoint();mutate(s);assert.throws(()=>validateCheckpoint(s,checkpointToken(s),'p',11));
  }
});
test('resume preflight rejects same-content Git commits in either root without consuming checkpoint state',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'paired-checkpoint-'));
  t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  const cell={root:path.join(lab,'product'),control:path.join(lab,'control'),id:'WI-0001',mode:'temple-autonomous-entry'};
  await write(cell.root,'src/value.mjs','export default 1;\n');
  await write(cell.control,`.ai-org/work-items/${cell.id}.json`,{state:'test'});
  await write(cell.control,`.ai-org/artifacts/${cell.id}/daily-delivery.json`,{pending:null});
  for(const root of [cell.root,cell.control]){
    await git(root,'init');await git(root,'config','user.name','Checkpoint test');await git(root,'config','user.email','checkpoint@example.invalid');
    await git(root,'add','.');await git(root,'commit','-m','Candidate');
  }
  const state=checkpoint(),active=state.cells[0],attempt=active.attempts[0];
  attempt.product_revision=await git(cell.root,'rev-parse','HEAD');attempt.control_revision=await git(cell.control,'rev-parse','HEAD');
  state.checkpoint.product_sha256=digest(await tree(cell.root));state.checkpoint.control_sha256=digest(await tree(cell.control));
  await write(lab,'result.json',state);const before=await fs.readFile(path.join(lab,'result.json'));
  await validateCheckpointRoots(state,active,cell);
  for(const [root,revision] of [[cell.root,attempt.product_revision],[cell.control,attempt.control_revision]]){
    await git(root,'commit','--allow-empty','-m','Same content different revision');
    assert.equal(digest(await tree(cell.root)),state.checkpoint.product_sha256);
    assert.equal(digest(await tree(cell.control)),state.checkpoint.control_sha256);
    await assert.rejects(validateCheckpointRoots(state,active,cell),/checkpoint-revision-drift/);
    assert.deepEqual(await fs.readFile(path.join(lab,'result.json')),before);
    assert.deepEqual((await fs.readdir(lab)).sort(),['control','product','result.json']);
    await git(root,'reset','--soft',revision);
  }
  await validateCheckpointRoots(state,active,cell);
});
