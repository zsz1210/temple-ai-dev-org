import test from 'node:test';
import {bufferedBudget,bufferedMeasurement,validateBufferedBudget,reservePhase,budgetWarning,cleanCellBudgetStop,bufferedFaults} from '../scripts/lean-interruption-budget.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {interruptionLimits,treatments,productEditable,compactContract,contextParity,executionPrompt,applyCompactContract,assertAccountingLaunch,behaviorMeasurement,assertBehaviorInterruption,validateBehaviorManifest,runBehaviorCell,digest,gradeCheckpoint,opaqueReviewRoot} from '../scripts/lean-interruption-experiment.mjs';
import {seed,tree} from '../scripts/autonomy-experiment.mjs';
import {installLean} from '../scripts/delivery-matrix-experiment.mjs';

test('three fixed treatments preserve the actor goal, boundaries and distinct verification',()=>{
  assert.deepEqual(treatments,['autonomous','lean-current','lean-compact']);assert.equal(interruptionLimits.model,'gpt-5.6-terra');assert.equal(interruptionLimits.effort,'medium');
  for(const name of treatments){const prompt=executionPrompt(name);assert.match(prompt,/current SPEC.md/);assert.match(prompt,/own design choices/);assert.match(prompt,/meaningful regression/);assert.match(prompt,/distinct blind product Verifier/);}
  assert.match(executionPrompt('lean-current'),/Read TEMPLE.md/);assert.doesNotMatch(executionPrompt('lean-compact'),/Read TEMPLE.md/);assert.throws(()=>executionPrompt('all-high'),/unknown-treatment/);
  const parity=contextParity();assert.equal(parity.formal_general_equivalence,false);assert.equal(parity.coordinator_retains_full_framework,true);assert.deepEqual(Object.keys(parity.obligations),['authority','identity','scope','boundary','ownership','recovery','delivery','stop']);assert.match(compactContract(),/old claims and conversation/);assert.match(compactContract(),/recorded revision and scope/);
});
test('scope permits independent module design while protecting the accepted helper and other files',()=>{
  for(const p of ['src/doc-links.mjs','src/doc-options.mjs','test/additional.test.mjs'])assert.equal(productEditable(p),true);
  for(const p of ['src/files.mjs','src/doc-nested/x.mjs','src/doc-.json','AGENTS.md','SPEC.md','test/public.test.mjs','../src/doc-escape.mjs'])assert.equal(productEditable(p),false);
});
test('unknown interrupted accounting cannot authorize the exact-cost comparison',()=>{
  for(const support of [{},{complete_accounting:false},{complete_accounting:'true'}])assert.throws(()=>assertAccountingLaunch(support),/interrupted-accounting-unqualified/);
});
test('compact context changes only project-owned native text and preserves actual Lean organization',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'lean-context-candidate-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  const root=path.join(lab,'project'),f={title:'Local instruction parity control',spec:'Approved bounded local scope and tests; no external effects.\n',seed:{'src/accepted.mjs':'export const accepted = true;\n'},publicTests:{}};
  await seed(root,f);await installLean(root,lab,f);const before=await tree(root),result=await applyCompactContract(root),after=await tree(root);
  assert.deepEqual(Object.keys({...before,...after}).filter(p=>before[p]!==after[p]),['AGENTS.md']);
  assert.equal(result.managed_files_unchanged,true);assert.equal(result.doctor.fail,0);
  const wi=JSON.parse(await fs.readFile(path.join(root,'.ai-org/work-items/WI-0001.json'),'utf8'));assert.equal(wi.workflow_profile,'lean');assert.equal(wi.state,'build');
  assert.ok(result.candidate_native_bytes>result.original_native_bytes,'additive override removes required procedural reads, not native bytes');
});
test('a framework-managed native entrypoint cannot be rewritten by the candidate',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'lean-managed-native-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.writeFile(path.join(root,'temple.lock'),JSON.stringify({managed_files:{'AGENTS.md':'managed'}}));await assert.rejects(applyCompactContract(root),/native-instructions-framework-managed/);
});

function interrupted(){return {status:'stopped',generation_requested:true,first_stop:'interrupted-final-usage-unobservable',complete_accounting:false,thread_id:'initial',usage:{operational_tokens:20},usage_status:'observed-lower-bound',elapsed_ms:10,actor_ms:8,terminals_empty:true,server_exit_confirmed:true,interruption:{intentional:true,requested:true,acknowledged:true,terminal_confirmed:true,terminal_status:'interrupted',trigger:{files:[{path:'src/doc-links.mjs',sha256:'retained'}]}}};}
function completed(thread='fresh'){return {status:'completed',generation_requested:true,thread_id:thread,usage:{operational_tokens:30},usage_status:'observed-completed-turn',elapsed_ms:20,actor_ms:18,terminals_empty:true,server_exit_confirmed:true,completion:{decision:'pass',findings:[]}};}
function fakeOps(overrides={}){const saved=[],order=[];return {saved,order,ops:{save:async r=>saved.push(structuredClone(r)),initial:async()=>{order.push('initial');return interrupted();},checkpoint:async()=>{order.push('checkpoint');return {accepted:false};},continue:async(b,f)=>{order.push(f?'repair':'continue');return completed();},capture:async()=>order.push('capture'),review:async()=>{order.push('review');return completed('reviewer');},grade:async()=>{order.push('grade');return {accepted:true};},...overrides}};}
const testCell={id:'autonomous',treatment:'autonomous',model:'gpt-5.6-terra'};
test('only the explicit behavior amendment can accept expected lower-bound interruption',()=>{
  const valid=interrupted();assert.doesNotThrow(()=>assertBehaviorInterruption(valid));
  for(const patch of [{first_stop:'event-correlation'},{cleanup_failure:'failed'},{terminals_empty:false},{server_exit_confirmed:false},{usage_status:'observed-completed-turn'},{interruption:{...valid.interruption,acknowledged:false}}])assert.throws(()=>assertBehaviorInterruption({...valid,...patch}));
  const m={schema_version:'lean-interruption/v2',measurement:behaviorMeasurement,limits:interruptionLimits,cells:treatments.map(t=>({...testCell,id:t,treatment:t,effort:'medium',prompt_sha256:digest(executionPrompt(t))}))};
  assert.doesNotThrow(()=>validateBehaviorManifest(m));
  assert.throws(()=>validateBehaviorManifest({...m,measurement:{id:'exact-cost'}}));
  assert.throws(()=>validateBehaviorManifest({...m,cells:[...m.cells].reverse()}));
  assert.throws(()=>validateBehaviorManifest({...m,limits:{...interruptionLimits,cell_tokens:999999}}));
});
test('behavior run retains initial observation before fresh recovery and distinct acceptance',async()=>{
  const {ops,saved,order}=fakeOps();const r=await runBehaviorCell(testCell,ops);
  assert.deepEqual(order,['initial','checkpoint','continue','capture','review','grade']);
  assert.equal(r.accepted,true);assert.equal(r.recovery,'succeeded');assert.equal(r.model_calls,3);assert.equal(r.observed_tokens_lower_bound,80);assert.equal(r.exact_total_cost,false);
  assert.ok(saved.some(s=>s.turns.length===1&&!s.checkpoint));
});
test('missing initial usage remains visible and censorship does not invent a recovery call',async()=>{
  const {ops,order}=fakeOps({initial:async()=>({...interrupted(),usage:null,usage_status:'unknown'}),checkpoint:async()=>({accepted:true})});
  const r=await runBehaviorCell(testCell,ops);assert.equal(r.missing_usage_calls,1);assert.equal(r.observed_tokens_lower_bound,30);assert.equal(r.recovery,'censored-already-accepted');assert.equal(r.model_calls,2);assert.equal(r.accepted,true);assert.ok(!order.includes('continue'));
});
test('scope/checkpoint failure retains paid initial observation and prevents dependent calls',async()=>{
  const {ops,order}=fakeOps({checkpoint:async()=>{throw Error('product-scope-drift');}});const r=await runBehaviorCell(testCell,ops);
  assert.equal(r.status,'stopped');assert.equal(r.first_stop,'product-scope-drift');assert.equal(r.observed_tokens_lower_bound,20);assert.deepEqual(order,['initial']);
});
test('same-thread recovery and unqualified ordinary usage stop before review',async()=>{
  for(const value of [completed('initial'),{...completed(),usage:null,usage_status:'unknown'}]){
    const {ops,order}=fakeOps({continue:async()=>value});const r=await runBehaviorCell(testCell,ops);assert.equal(r.status,'stopped');assert.ok(!order.includes('review'));assert.equal(r.turns.length,2);
  }
});
test('one repair and at most five calls are retained on ordinary rejection',async()=>{
  const {ops,order}=fakeOps({grade:async()=>({accepted:false,behavior:{failed_cases:['public requirement']}})});const r=await runBehaviorCell(testCell,ops);
  assert.equal(r.status,'rejected');assert.equal(r.recovery,'failed');assert.equal(r.repair_used,true);assert.equal(r.model_calls,5);assert.equal(order.filter(s=>s==='repair').length,1);
});
test('time budget exhaustion does not dispatch another call',async()=>{
  const {ops,order}=fakeOps({initial:async()=>({...interrupted(),elapsed_ms:interruptionLimits.cell_ms})});const r=await runBehaviorCell(testCell,ops);
  assert.equal(r.status,'stopped');assert.equal(r.first_stop,'cell-budget-exhausted');assert.ok(!order.includes('continue'));assert.equal(r.model_calls,1);
});
test('fixed behavior censors complete functionality despite absent or broken added tests',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'checkpoint-censor-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.mkdir(path.join(root,'src'));await fs.mkdir(path.join(root,'test'));await fs.writeFile(path.join(root,'src/doc-links.mjs'),'export const completeBehavior = true;');
  for(const added of [false,true]){
    if(added)await fs.writeFile(path.join(root,'test/additional.test.mjs'),'unfinished invalid added test');
    const result=await gradeCheckpoint(root,{},root,{check:async(files,f,b,l,label,tests)=>{
      assert.deepEqual(tests,['oracle.test.mjs',...Object.keys(f.publicTests)]);
      return {exit_code:tests.includes('test/additional.test.mjs')?1:0,tests:17,cancelled:0,timed_out:false,invalid_execution:false};
    }});
    assert.equal(result.accepted,true);assert.equal(result.has_added_tests,added);
    const {ops,order}=fakeOps({checkpoint:async()=>result});const r=await runBehaviorCell(testCell,ops);
    assert.equal(r.recovery,'censored-already-accepted');assert.ok(!order.includes('continue'));
  }
});
test('review roots are unique opaque identifiers and cannot encode treatment labels',()=>{
  const roots=treatments.map(()=>opaqueReviewRoot('/frozen-lab'));
  assert.equal(new Set(roots).size,3);
  for(const root of roots){assert.match(path.basename(root),/^[0-9a-f-]{36}$/);for(const treatment of treatments)assert.ok(!root.includes(treatment));}
});

test('buffered protocol schedules only missing arms and refuses a silently altered reserve',()=>{
  assert.equal(validateBufferedBudget(bufferedBudget),bufferedBudget);
  const m={schema_version:'lean-interruption/v2',measurement:bufferedMeasurement,limits:interruptionLimits,cells:bufferedMeasurement.selected_treatments.map(t=>({...testCell,id:t,treatment:t,effort:'medium',prompt_sha256:digest(executionPrompt(t))}))};
  assert.doesNotThrow(()=>validateBehaviorManifest(m));
  assert.throws(()=>validateBehaviorManifest({...m,cells:[{...testCell,effort:'medium',prompt_sha256:digest(executionPrompt('autonomous'))},...m.cells]}),/treatment-drift/);
  assert.throws(()=>validateBufferedBudget({...bufferedBudget,cohort_tokens:1}),/buffered-budget-drift/);
  assert.equal(budgetWarning(bufferedBudget,'initial',119999),null);
  assert.equal(budgetWarning(bufferedBudget,'initial',120001).action,'continue-within-buffer');
  assert.throws(()=>reservePhase(bufferedBudget,'recovery',200001,0),/downstream-reserve-unavailable/);
  assert.throws(()=>reservePhase(bufferedBudget,'recovery',0,600001),/downstream-reserve-unavailable/);
});
test('near-reserved maximum initial and recovery work still leave full review repair and re-review capacity',async()=>{
  const calls=[];let continued=0,reviewed=0,graded=0;
  const {ops}=fakeOps({
    initial:async b=>{calls.push(b);return {...interrupted(),usage:{operational_tokens:199000},elapsed_ms:599000};},
    continue:async b=>{calls.push(b);return {...completed('fresh-'+(++continued)),usage:{operational_tokens:139000},elapsed_ms:599000};},
    review:async b=>{calls.push(b);return {...completed('review-'+(++reviewed)),usage:{operational_tokens:69000},elapsed_ms:419000};},
    grade:async()=>({accepted:++graded===2})
  });
  const r=await runBehaviorCell(testCell,ops,{budgetPlan:bufferedBudget});
  assert.equal(r.status,'accepted');assert.equal(r.model_calls,5);assert.equal(r.observed_tokens_lower_bound,615000);
  assert.deepEqual(calls.map(b=>b.stage),['initial','recovery','review','repair','rereview']);
  assert.deepEqual(calls.map(b=>b.tokens),[180000,120000,60000,120000,60000]);
  assert.deepEqual(calls.map(b=>b.ms),[580000,580000,400000,580000,400000]);
});
test('an unexpectedly oversized observation refuses dependent generation and preserves underlying reason',async()=>{
  const {ops,order}=fakeOps({initial:async()=>({...interrupted(),usage:{operational_tokens:200001}})});
  const r=await runBehaviorCell(testCell,ops,{budgetPlan:bufferedBudget});
  assert.equal(r.first_stop,'downstream-reserve-unavailable');assert.equal(r.underlying_stop,r.first_stop);
  assert.equal(r.model_calls,1);assert.ok(!order.includes('continue'));
});
test('only confirmed clean local budget stops may continue the next independently funded arm',async()=>{
  const budgetStop={...interrupted(),first_stop:'token-limit',budget:{stage:'initial',...bufferedBudget.phases.initial},interruption:{...interrupted().interruption,intentional:false,trigger:null}};
  const {ops}=fakeOps({initial:async()=>budgetStop});
  const r=await runBehaviorCell(testCell,ops,{budgetPlan:bufferedBudget});
  assert.equal(r.underlying_stop,'token-limit');assert.equal(cleanCellBudgetStop(r),true);
  for(const patch of [{underlying_stop:'event-correlation'},{claim_cleanup_error:'error'},{protected_drift:['SPEC.md']},{final_doctor:{fail:1}},{turns:[{...budgetStop,cleanup_failure:'error'}]},{turns:[{...budgetStop,interruption:{...budgetStop.interruption,terminal_confirmed:false}}]},{turns:[{...completed(),status:'stopped',first_stop:'token-limit',usage_status:'incomplete-observation'}]}])assert.equal(cleanCellBudgetStop({...r,...patch}),false);
});
test('notification and cleanup reserves absorb bounded overshoot but never fund overruns from the next arm',()=>{
  const c={...interrupted(),budget:{stage:'initial',...bufferedBudget.phases.initial},first_stop:'token-limit',stop_reasons:['token-limit'],usage:{operational_tokens:200000},elapsed_ms:600000};
  const r={status:'stopped',underlying_stop:'token-limit',turns:[c],qa:[]};
  assert.equal(cleanCellBudgetStop(r),true);
  for(const patch of [{usage:{operational_tokens:200001}},{elapsed_ms:600001}])for(const reason of ['token-limit','downstream-reserve-unavailable']){
    const exceeded={...r,underlying_stop:reason,turns:[{...c,...patch}]};
    assert.deepEqual(bufferedFaults(exceeded),['phase-reserve-overrun']);assert.equal(cleanCellBudgetStop(exceeded),false);
  }
});
