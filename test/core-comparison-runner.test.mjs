import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {digest} from '../scripts/core-runtime-qualification.mjs';
import {nativeOperations} from '../scripts/core-comparison-fixture.mjs';
import {seed,tree,git} from '../scripts/autonomy-experiment.mjs';
import {docFixture} from '../scripts/real-doc-check-fixture-v2.mjs';
import {validateCoreProtocol,requireCoreApproval,checkedActor,initializeCoreRun,advanceCoreRun} from '../scripts/core-comparison-runner.mjs';
const settings=JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/core-runtime.settings.json',import.meta.url)));
const sha='a'.repeat(40),hash='b'.repeat(64);
function fixture(){
 const protocol={schema_version:'temple.core-comparison-protocol/v1',source_sha256:hash,runtime_sha256:hash,fixture_sha256:hash,acceptance_sha256:hash,settings,verifier:{model:'gpt-5.6-terra',effort:'medium'},repetitions:1,interruption:settings.interruption,cache_control:settings.cache_control,cells:['temple-lean','temple-core-candidate'].flatMap((mode,i)=>['gpt-5.6-terra','gpt-6-astra'].map((model,j)=>({id:`cell-${i}-${j}`,mode,model,effort:'medium',product_seed_revision:sha,contract_sha256:hash})))};
 const approval={schema_version:'temple.core-comparison-approval/v1',status:'approved',protocol_sha256:digest(protocol),principal:'human',authorization_ref:'Synthetic offline unit test only',ceilings:settings.ceilings,external_spend_jpy:0,api_keys:false,resets:false,extra_subjects:false};return {protocol,approval,expected:digest(protocol)};
}
function observation(model='gpt-5.6-terra',thread='fresh') {return {generation_requested:true,status:'completed',model,effort:'medium',thread_id:thread,completion:{decision:'pass'},usage_status:'observed-completed-turn',server_exit_confirmed:true,terminals_empty:true,usage:{input_tokens:10,cached_input_tokens:2,output_tokens:4,operational_tokens:12},elapsed_ms:20};}
let syntheticPid=1000000;
function ops(){return {processId:()=>++syntheticPid,pinsMatch:async()=>true,currentCandidate:async()=>({revision:sha,evidence_sha256:hash}),actor:async(c,s)=>observation(['verify','reverify'].includes(s)?'gpt-5.6-terra':c.model,c.id+'-'+s),submit:async()=>({revision:sha,evidence_sha256:hash,diagnostics_passed:true}),recoveryAccepted:async()=>true,grade:async()=>({instrument_valid:true,accepted:true}),closeout:async()=>true,rework:async()=>{}};}
async function lab(t){const p=await fs.mkdtemp(path.join(os.tmpdir(),'core-state-test-'));t.after(()=>fs.rm(p,{recursive:true,force:true}));return p;}
test('only exact four-cell protocol and account-impact approval may start',()=>{
 const {protocol,approval,expected}=fixture();assert.equal(validateCoreProtocol(protocol),protocol);requireCoreApproval(protocol,approval,expected);
 for(const a of [null,{...approval,status:'pending'},{...approval,protocol_sha256:hash},{...approval,ceilings:{...settings.ceilings,tokens:1}},{...approval,resets:true}])assert.throws(()=>requireCoreApproval(protocol,a,expected));
 for(const mutate of [p=>p.cells[1].id=p.cells[0].id,p=>p.cells[1].model=p.cells[0].model,p=>p.cells.pop(),p=>p.cells[0].effort='high',p=>p.repetitions=2]){const p=structuredClone(protocol);mutate(p);assert.throws(()=>validateCoreProtocol(p));}
});
test('unknown, cancelled, excess, cached-input and cleanup faults never become complete usage',()=>{
 const budget=settings.phases.build;assert.deepEqual(checkedActor(observation(),budget),{tokens:12,time_ms:20,calls:1});
 for(const mutate of [o=>o.usage_status='incomplete-observation',o=>o.server_exit_confirmed=false,o=>o.terminals_empty=false,o=>o.status='stopped',o=>o.usage.operational_tokens=13,o=>o.usage.cached_input_tokens=20,o=>o.elapsed_ms=budget.reserve_ms+1,o=>o.thread_id=null]){const o=observation();mutate(o);assert.throws(()=>checkedActor(o,budget));}
});
test('one stage per invocation preserves all four outcomes and exactly twelve successful turns',async t=>{
 const root=await lab(t),f=fixture();await initializeCoreRun(root,f.protocol);let result;
 for(let n=0;n<12;n++)result=await advanceCoreRun(root,f.protocol,f.approval,f.expected,ops());
 assert.equal(result.status,'completed');assert.deepEqual(result.unrun,[]);assert.ok(result.cells.every(c=>c.accepted&&c.recovery==='succeeded'&&c.calls.length===3));
 await assert.rejects(()=>advanceCoreRun(root,f.protocol,f.approval,f.expected,ops()),/terminal/);
});
test('single reserved repair and reverification; a second rejection stays rejected',async t=>{
 const root=await lab(t),f=fixture();await initializeCoreRun(root,f.protocol);const o=ops();o.grade=async()=>({instrument_valid:true,accepted:false});let s;
 for(let n=0;n<5;n++)s=await advanceCoreRun(root,f.protocol,f.approval,f.expected,o);
 assert.equal(s.cells[0].status,'rejected');assert.equal(s.cells[0].calls.length,5);assert.equal(s.active_cell,1);assert.equal(s.cells[0].accepted,false);
});
test('failed diagnostics and changed recovery candidate stop without downstream generation',async t=>{
 for(const changed of [false,true]){
  const root=await lab(t),f=fixture();await initializeCoreRun(root,f.protocol);const o=ops();let calls=0;const actor=o.actor;o.actor=async(...a)=>{calls++;return actor(...a);};
  if(!changed)o.submit=async()=>({revision:sha,evidence_sha256:hash,diagnostics_passed:false});
  let s=await advanceCoreRun(root,f.protocol,f.approval,f.expected,o);
  if(changed){o.currentCandidate=async()=>({revision:'c'.repeat(40),evidence_sha256:hash});s=await advanceCoreRun(root,f.protocol,f.approval,f.expected,o);}
  assert.equal(s.status,'stopped');assert.equal(calls,1);assert.equal(s.unrun.length,3);await assert.rejects(()=>advanceCoreRun(root,f.protocol,f.approval,f.expected,o));
 }
});
test('concurrent start and abandoned running state never double dispatch',async t=>{
 const root=await lab(t),f=fixture();await initializeCoreRun(root,f.protocol);let calls=0;const o=ops();o.actor=async(c,s)=>{calls++;await new Promise(r=>setTimeout(r,25));return observation(c.model,c.id+s);};
 const results=await Promise.allSettled([advanceCoreRun(root,f.protocol,f.approval,f.expected,o),advanceCoreRun(root,f.protocol,f.approval,f.expected,o)]);
 assert.equal(calls,1);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const state=JSON.parse(await fs.readFile(path.join(root,'state.json')));state.status='running';await fs.writeFile(path.join(root,'state.json'),JSON.stringify(state));
 await assert.rejects(()=>advanceCoreRun(root,f.protocol,f.approval,f.expected,o),/ambiguous/);assert.equal(calls,1);
});
test('fresh Node processes resume only the durable handoff checkpoint',async t=>{
 const root=await lab(t),f=fixture();await initializeCoreRun(root,f.protocol);await fs.writeFile(path.join(root,'input.json'),JSON.stringify(f));
 const module=new URL('../scripts/core-comparison-runner.mjs',import.meta.url).href;
 const code=`import fs from 'node:fs/promises';import {advanceCoreRun} from ${JSON.stringify(module)};const root=process.argv[1];const f=JSON.parse(await fs.readFile(root+'/input.json'));const sha='a'.repeat(40),hash='b'.repeat(64);const ops={pinsMatch:async()=>true,currentCandidate:async()=>({revision:sha,evidence_sha256:hash}),actor:async(c,s)=>({generation_requested:true,status:'completed',model:c.model,effort:'medium',thread_id:'process-'+process.pid,completion:{decision:'pass'},usage_status:'observed-completed-turn',server_exit_confirmed:true,terminals_empty:true,usage:{input_tokens:10,cached_input_tokens:2,output_tokens:4,operational_tokens:12},elapsed_ms:20}),submit:async()=>({revision:sha,evidence_sha256:hash,diagnostics_passed:true}),recoveryAccepted:async()=>true};console.log(JSON.stringify(await advanceCoreRun(root,f.protocol,f.approval,f.expected,ops)));`;
 const call=()=>JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code,root],{encoding:'utf8'}));
 const first=call(),second=call();assert.equal(first.status,'handoff-paused');assert.equal(second.cells[0].status,'verification-ready');assert.notEqual(first.cells[0].calls[0].thread_id,second.cells[0].calls[1].thread_id);
});
test('native post-call inspection failure retains returned usage before stopping',async t=>{
 const root=await lab(t),product=path.join(root,'product'),f=fixture();await seed(product,docFixture);
 Object.assign(f.protocol.cells[0],{product_root:product,control_root:product,product_base_revision:await git(product,'rev-parse','HEAD'),seed_manifest:await tree(product)});
 f.expected=digest(f.protocol);f.approval.protocol_sha256=f.expected;
 await fs.writeFile(path.join(root,'adapter-base.json'),JSON.stringify({environment:{}}));await initializeCoreRun(root,f.protocol);
 const actual=await nativeOperations(root,f.protocol,{actor:async()=>{await fs.symlink('/unreadable-external-target',path.join(product,'unsafe-link'));const o=observation();o.usage={input_tokens:4321,cached_input_tokens:0,output_tokens:0,operational_tokens:4321};return o;}});
 actual.pinsMatch=async()=>true; // isolate post-call behavior; separate tests qualify pins
 const state=await advanceCoreRun(root,f.protocol,f.approval,f.expected,actual),cell=state.cells[0];
 assert.equal(state.status,'stopped');assert.equal(cell.calls.length,1);assert.match(cell.calls[0].postprocess_failure,/unsafe-symlink/);
 assert.equal(cell.calls[0].usage.operational_tokens,4321);assert.equal(cell.accounting.known_operational_tokens_lower_bound,4321);assert.equal(cell.accounting.usage_complete,true);assert.equal(cell.accepted,false);
 const raw=JSON.parse(await fs.readFile(path.join(root,cell.id+'-build-provider-observation.json')));assert.equal(raw.usage.operational_tokens,4321);
 await assert.rejects(()=>advanceCoreRun(root,f.protocol,f.approval,f.expected,actual),/terminal/);
});
