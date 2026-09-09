import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {settings,validateSettings,admitPhase,accounting,copyProduct,completeBuild,assessCandidate,retainGrade,fixture,checkDiagnosticFiles,stopDiagnostic,releaseStoppedClaim} from '../scripts/autonomous-delivery-experiment.mjs';
import {fixture as deliveryFixture,itemState} from './helpers/lean-delivery-fixture.mjs';
import {gradeProduct} from '../scripts/delivery-matrix-experiment.mjs';
import {write} from '../scripts/autonomy-experiment.mjs';
import {subprocessEnvironment} from '../scripts/delivery-control-pair.mjs';
const localExecutor=async(_base,root,binary,args,options)=>{
  try{return {...await promisify(execFile)(binary,args,{...options,cwd:root,env:subprocessEnvironment()}),exit_code:0};}
  catch(e){return {...e,exit_code:e.code};}
};
const localCheck=(...args)=>checkDiagnosticFiles(...args,{executor:localExecutor});
test('diagnostic admission reserves the complete remaining path and next cell before dispatch',()=>{
  assert.equal(validateSettings(settings),true);
  const first=admitPhase(settings,0,'build',0,1000);assert.equal(first.reserved_tokens,settings.ceilings.tokens);
  assert.throws(()=>admitPhase(settings,0,'verify',settings.phases.build.reserve_tokens+1,1000),/downstream-token/);
  assert.throws(()=>admitPhase(settings,1,'reverify',settings.ceilings.tokens-settings.phases.reverify.reserve_tokens,1000),/downstream-token/);
  assert.throws(()=>admitPhase(settings,0,'build',0,settings.setup.time_ms+1),/downstream-time/);
  assert.throws(()=>admitPhase(settings,0,'build',null,0),/downstream-token/);
});
test('diagnostic accounting retains unknown calls and separates operational units from money',()=>{
  const good={result:{usage_status:'observed-completed-turn',usage:{input_tokens:100,cached_input_tokens:80,output_tokens:10,operational_tokens:30},elapsed_ms:50}};
  assert.equal(accounting([good]).operational_tokens,30);assert.equal(accounting([good]).monetary_cost,null);
  const unknown={result:{usage_status:'incomplete-observation',usage:null,elapsed_ms:20}};
  const incomplete=accounting([good,unknown]);assert.equal(incomplete.calls,2);assert.equal(incomplete.operational_tokens,null);assert.equal(incomplete.model_wrapper_ms,70);
  const pending=accounting([good,{result:null}]);assert.equal(pending.calls,2);assert.equal(pending.operational_tokens,null);assert.equal(pending.operational_tokens_known_lower_bound,30);assert.equal(pending.model_wrapper_ms,null);assert.equal(pending.model_wrapper_ms_known_lower_bound,50);
});
test('incomplete Developer never enters grading, publication or canonical handoff',async()=>{
  const effects=[];
  for(const decision of ['fail','blocked',undefined])await assert.rejects(completeBuild({completion:{decision}},async()=>effects.push('handoff')),/before-handoff/);
  assert.deepEqual(effects,[]);
  await completeBuild({completion:{decision:'pass'}},async()=>effects.push('handoff'));
  assert.deepEqual(effects,['handoff']);
});
test('repair synchronizes allowed deletions while preserving control authority and supplied tests',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'diagnostic-sync-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const root=path.join(dir,'product'),control=path.join(dir,'control');
  for(const[p,body]of Object.entries({'src/keep.mjs':'first','src/deleted.mjs':'old','test/additional.test.mjs':'old'}))await write(root,p,body);
  await write(control,'SPEC.md','control authority');await write(control,'test/public.test.mjs','supplied');
  await copyProduct(root,control);await fs.rm(path.join(root,'src/deleted.mjs'));await fs.rm(path.join(root,'test/additional.test.mjs'));await write(root,'src/keep.mjs','repaired');
  const synced=await copyProduct(root,control);assert.equal(synced.product_sha256,synced.control_sha256);
  await assert.rejects(fs.stat(path.join(control,'src/deleted.mjs')),/ENOENT/);await assert.rejects(fs.stat(path.join(control,'test/additional.test.mjs')),/ENOENT/);
  assert.equal(await fs.readFile(path.join(control,'src/keep.mjs'),'utf8'),'repaired');assert.equal(await fs.readFile(path.join(control,'SPEC.md'),'utf8'),'control authority');assert.equal(await fs.readFile(path.join(control,'test/public.test.mjs'),'utf8'),'supplied');
});
test('actual passing reference with vacuous tests is rejected by frozen meaningful coverage controls',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'diagnostic-grade-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  for(const[p,body]of Object.entries({...fixture.reference,'test/additional.test.mjs':"import test from 'node:test'; test('vacuous',()=>{});"}))await write(dir,p,body);
  const grade=await gradeProduct(dir,fixture,{},dir,{check:localCheck});
  assert.equal(grade.accepted,true);assert.equal(grade.reference_baseline.exit_code,0);assert.equal(grade.mutations.length,3);assert(grade.mutations.every(m=>!m.detected));
  const entry={build:{completion:{decision:'pass'}},review:{completion:{decision:'pass'}},grade};
  assert.equal(assessCandidate(entry).accepted,false);assert.deepEqual(assessCandidate(entry).missing_mutation_behaviors,settings.required_mutations);
  entry.grade={...grade,mutations:grade.mutations.map(m=>({...m,detected:true}))};assert.equal(assessCandidate(entry).accepted,true);
  entry.grade.mutations=[];assert.equal(assessCandidate(entry).accepted,false);
  entry.grade.mutations=Array(3).fill({name:settings.required_mutations[0],detected:true});assert.equal(assessCandidate(entry).accepted,false);
});
test('registration reporter excludes empty-file fallback and skips but accepts executed cases',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'diagnostic-registration-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  for(const[body,expected]of [["",0],["import test from 'node:test'; test('skip',{skip:true},()=>{});",0],["import test from 'node:test'; test('actual',()=>{});",1]]){
    const result=await localCheck({'test/additional.test.mjs':body},fixture,{},dir,'registration',['test/additional.test.mjs']);
    assert.equal(result.exit_code,0);assert.equal(result.tests,1);assert.equal(result.registered_executed_cases,expected);
  }
});
test('conditional suite with real mutant detection cannot qualify an empty reference',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'diagnostic-conditional-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const added=fixture.hiddenTests.replaceAll("'./src/","'../src/").replace("import test from 'node:test';","import nodeTest from 'node:test'; import * as module from '../src/catalog.mjs'; const test=(...args)=>module.additionalCoverage ? nodeTest(...args):undefined;");
  for(const[p,body]of Object.entries({...fixture.reference,'src/catalog.mjs':fixture.reference['src/catalog.mjs']+'\nexport const additionalCoverage = true;\n','test/additional.test.mjs':added}))await write(dir,p,body);
  const grade=await gradeProduct(dir,fixture,{},dir,{check:localCheck});
  assert.equal(grade.accepted,true);assert.equal(grade.reference_baseline.tests,1);assert.equal(grade.reference_baseline.registered_executed_cases,0);assert(grade.mutations.every(m=>m.detected));
  const result=assessCandidate({build:{completion:{decision:'pass'}},review:{completion:{decision:'pass'}},grade});
  assert.equal(result.accepted,false);assert.equal(result.registered_regression_and_reference_cases,false);
});
test('instrument failure persists partial grading and preserves the original stop',async()=>{
  const entry={},snapshots=[],failure=Object.assign(Error('oracle transport lost'),{partialGrade:{status:'instrument-failure',behavior:{tests:21,exit_code:0},mutations:[{name:'naive-csv',detected:true}]}});
  await assert.rejects(retainGrade(entry,async()=>snapshots.push(structuredClone(entry)),async progress=>{await progress({status:'running',behavior:{tests:21,exit_code:0}});throw failure;}),e=>e===failure);
  assert.equal(snapshots[0].grade.behavior.tests,21);assert.deepEqual(snapshots.at(-1).grade,failure.partialGrade);
});
test('outer stop persists terminal cell before cleanup while preserving accepted and unrun coverage',async()=>{
  const accepted={mode:'old',status:'completed',accepted:true},attempt={status:'running',phase:'build'};
  const active={mode:'new',status:'running',accepted:false,calls:[0],attempts:[attempt],started_at_ms:10};
  const result={generation_requested:true,first_stop:'protocol-error',protocol_diagnostic:{reason:'invalid-json'},terminals_empty:true,server_exit_confirmed:true};
  const state={cells:[accepted,active],calls:[{result}],unrun:['later']},snapshots=[];
  await stopDiagnostic(state,Error('actor-or-isolation-failure'),{now:()=>50,save:async()=>snapshots.push(structuredClone(state)),cleanup:async()=>{assert.equal(snapshots[0].cells[1].status,'stopped');throw Error('PRIVATE-CLEANUP-DETAIL');}});
  assert.equal(state.failure,'protocol-error');assert.equal(active.status,'stopped');assert.equal(attempt.status,'stopped');assert.equal(active.elapsed_ms,40);
  assert.equal(active.cleanup.status,'failed');assert.equal(snapshots.at(-1).cells[1].cleanup.status,'failed');
  assert.deepEqual(accepted,{mode:'old',status:'completed',accepted:true});assert.deepEqual(state.unrun,['later']);
  assert.doesNotMatch(JSON.stringify(state),/PRIVATE-CLEANUP/);
});
test('unknown or unconfirmed actor cleanup retains claim and never invents successful cleanup',async()=>{
  for(const result of [null,{generation_requested:true,terminals_empty:false,server_exit_confirmed:true},{generation_requested:false},{generation_requested:false,server_exit_confirmed:true,cleanup_failure:'terminal-cleanup-unconfirmed'}]){
    const active={status:'running',calls:[0],attempts:[{status:'running'}],started_at_ms:0},state={cells:[active],calls:[{result}]};let releases=0;
    await stopDiagnostic(state,Error('actor-or-isolation-failure'),{cleanup:async()=>{releases++;return {status:'released'};}});
    assert.equal(releases,0);assert.equal(active.cleanup.status,'blocked');assert.equal(active.status,'stopped');
  }
});
test('no actor call and confirmed pre-generation exit permit stopped claim cleanup',async()=>{
  for(const calls of [[],[{result:{generation_requested:false,server_exit_confirmed:true}}]]){
    const active={status:'running',calls:calls.map((_,i)=>i),attempts:[],started_at_ms:0},state={cells:[active],calls};let releases=0;
    await stopDiagnostic(state,Error('protocol-error'),{cleanup:async()=>{releases++;return {status:'released'};}});
    assert.equal(releases,1);assert.equal(active.cleanup.status,'released');
  }
});
test('stopped diagnostic retires its actual claim without advancing lifecycle, then is idempotent',async t=>{
  const f=await deliveryFixture();t.after(f.cleanup);
  const assignments=JSON.parse(await fs.readFile(path.join(f.target,'.ai-org/project/assignments.json'),'utf8')).assignments;
  const cell={control:f.target,runtime:path.resolve(import.meta.dirname,'..'),id:f.item.id,assignments};
  assert.equal((await itemState(f)).claim.status,'active');
  const result=await releaseStoppedClaim(cell);assert.equal(result.status,'released');
  assert.equal((await itemState(f)).claim.status,'released');assert.equal((await itemState(f)).state,'build');
  assert.equal((await releaseStoppedClaim(cell)).status,'not-needed');
});
