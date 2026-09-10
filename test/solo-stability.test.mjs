import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {scenarios,summarize,runSoloActor,qualifySoloRuntime,prepare,run,hash} from '../scripts/solo-stability.mjs';
import {disabledFeatures} from '../scripts/continuity-live-runner.mjs';
import {tree} from '../scripts/autonomy-experiment.mjs';

const reference={
 'src/quantity.mjs':`export function parseQuantity(v){if(typeof v!=='string'||!/^\\d+$/.test(v)||!Number.isSafeInteger(Number(v)))throw new TypeError('quantity');return Number(v)}`,
 'src/invoice.mjs':`import {parseQuantity} from './quantity.mjs';export function invoiceTotal(lines){if(!Array.isArray(lines))throw new TypeError('lines');let sum=0;for(const l of lines){if(!l||typeof l!=='object'||!Number.isSafeInteger(l.unitCents)||l.unitCents<0)throw new TypeError('line');const n=parseQuantity(l.qty)*l.unitCents;if(!Number.isSafeInteger(n)||!Number.isSafeInteger(sum+n))throw new TypeError('overflow');sum+=n}return sum}`,
 'src/report.mjs':`import {invoiceTotal} from './invoice.mjs';export function buildReport(lines){if(!Array.isArray(lines))throw new TypeError('lines');const groups=new Map();for(const l of lines){if(!l||typeof l!=='object'||typeof l.sku!=='string'||!l.sku.length)throw new TypeError('sku');if(!groups.has(l.sku))groups.set(l.sku,[]);groups.get(l.sku).push(l)}return {totalCents:invoiceTotal(lines),items:[...groups.keys()].sort().map(sku=>({sku,totalCents:invoiceTotal(groups.get(sku))}))}}`
};
test('frozen independent oracles reject each seed and accept the reference chain',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'solo-oracles-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.mkdir(path.join(root,'src'));
 for(const s of scenarios){for(const [p,v]of Object.entries(s.seed))await fs.writeFile(path.join(root,p),v);await fs.writeFile(path.join(root,'oracle.mjs'),s.oracle);assert.throws(()=>execFileSync(process.execPath,['oracle.mjs'],{cwd:root,stdio:'pipe'}));for(const p of Object.keys(s.seed))await fs.writeFile(path.join(root,p),reference[p]);execFileSync(process.execPath,['oracle.mjs'],{cwd:root,stdio:'pipe'});}
});
test('metrics retain cached input and unknown outer cost separately',()=>{
 const r=summarize([{usage:{input_tokens:100,cached_input_tokens:60,output_tokens:20},usage_status:'observed-completed-turn'},{usage:null,usage_status:'unknown-or-partial'}]);
 assert.equal(r.known_operational_tokens,60);assert.equal(r.input_tokens,100);assert.equal(r.coverage,'partial-or-unavailable');assert.equal(r.whole_task_tokens,null);assert.equal(r.monetary_cost,null);assert.equal(summarize([]).coverage,'partial-or-unavailable');
});
async function actorFixture(t,{badCleanup=false,complete=true}={}){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'solo-actor-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const runtime={root,readRoots:['/usr/bin'],disabledTools:{mcp_servers:[],plugins:[],apps:[]},environment:{PATH:'/usr/bin',OPENSSL_CONF:'/dev/null'}};
 const config={features:{...Object.fromEntries(disabledFeatures.map(k=>[k,false])),code_mode_host:true,shell_tool:true,unified_exec:true},memories:{use_memories:false,generate_memories:false},web_search:'disabled',shell_environment_policy:{inherit:'none',experimental_use_profile:false,set:runtime.environment},mcp_servers:{},plugins:{},apps:{},default_permissions:'temple-continuity-probe',permissions:{'temple-continuity-probe':{network:{enabled:false},filesystem:{':minimal':'read',[root]:'write',[path.join(root,'.git')]:'write','/usr/bin':'read'}}}};
 const methods=[];
 const result=await runSoloActor(runtime,'Synthetic test, no model',{ms:complete?2000:100,providerFactory:(_b,_a,o)=>({
   notify:()=>{},close:async()=>{},request:async(method,p)=>{methods.push(method);
    if(method==='initialize')return {};
    if(method==='config/read')return {config};
    if(method==='thread/start')return {thread:{id:'thread-solo',turns:[]},model:p.model,reasoningEffort:p.config.model_reasoning_effort,cwd:root,approvalPolicy:'never',activePermissionProfile:{id:'temple-continuity-probe'},instructionSources:[root+'/AGENTS.md']};
    if(method==='turn/start'){
      queueMicrotask(()=>{o.onNotification({method:'thread/tokenUsage/updated',params:{threadId:'thread-solo',tokenUsage:{total:{inputTokens:100,cachedInputTokens:50,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}}});if(complete){o.onNotification({method:'item/completed',params:{threadId:'thread-solo',item:{type:'agentMessage',text:JSON.stringify({decision:'pass',summary:'fixture',findings:[]})}}});o.onNotification({method:'turn/completed',params:{threadId:'thread-solo',turn:{id:'turn-solo',status:'completed'}}});}});return {turn:{id:'turn-solo'}};
    }
    if(method==='turn/interrupt'||method==='thread/backgroundTerminals/clean')return {};
    if(method==='thread/backgroundTerminals/list'){if(badCleanup)throw Error('cleanup');return {data:[]};}
    throw Error('unexpected method '+method);
   }
 })});return {result,methods};
}
test('fresh actor records own usage without any account RPC',async t=>{
 const {result,methods}=await actorFixture(t);assert.equal(result.status,'completed');assert.equal(result.usage.operational_tokens,70);assert.equal(result.terminals_empty,true);assert.equal(methods.some(m=>m.startsWith('account/')),false);
});
test('unknown cleanup never becomes completed acceptance',async t=>{
 const {result}=await actorFixture(t,{badCleanup:true});assert.equal(result.status,'stopped');assert.equal(result.failure,'cleanup-unconfirmed');assert.equal(result.usage_status,'unknown-or-partial');
});
test('timeout interrupts the exact turn and retains partial usage',async t=>{
 const {result,methods}=await actorFixture(t,{complete:false});assert.equal(result.status,'stopped');assert.equal(result.failure,'time-limit');assert(methods.includes('turn/interrupt'));assert.equal(result.usage.operational_tokens,70);
});
test('runtime preflight retains primary and cleanup failures without a model call',async()=>{
 const r=await qualifySoloRuntime({root:'/tmp/solo-unit',readRoots:['/usr/bin'],disabledTools:{mcp_servers:[],plugins:[],apps:[]},environment:{PATH:'/usr/bin',OPENSSL_CONF:'/dev/null'}},{providerFactory:()=>({request:async()=>{throw Error('initialization-failed');},close:async()=>{throw Error('close-unconfirmed');}})});
 assert.equal(r.status,'failed');assert.equal(r.failure,'initialization-failed');assert.equal(r.cleanup_failure,'close-unconfirmed');assert.equal(r.server_exit_confirmed,false);assert.equal(r.model_calls,0);
});
test('real installed CLI rehearsal closes all profiles and Learning without model generation',async t=>{
 const p=await prepare();t.after(()=>fs.rm(p.lab,{recursive:true,force:true}));
 // Explicit test double qualification; never represented as independent agent acceptance.
 await fs.writeFile(path.join(p.lab,'offline.json'),JSON.stringify({status:'passed',kind:'test-double-setup'}));
 let blockedOnce=false;
 const options={discover:async()=>({}),actorImpl:async(runtime,prompt)=>{
  if(!prompt.startsWith('You are agent-riley')){const current=await fs.readFile(path.join(runtime.root,'CURRENT.md'),'utf8');for(const file of Object.keys(reference))if(current.includes(file))await fs.writeFile(path.join(runtime.root,file),reference[file]);}
  if(!blockedOnce){blockedOnce=true;return {stage:'build',status:'completed',generation_requested:false,usage:null,usage_status:'synthetic-no-model',server_exit_confirmed:true,terminals_empty:true,elapsed_ms:0,completion:{decision:'blocked',summary:'Synthetic Node runtime failure after implementation',findings:['dyld test control']}};}
  return {status:'completed',generation_requested:false,usage:null,usage_status:'synthetic-no-model',server_exit_confirmed:true,terminals_empty:true,elapsed_ms:0,completion:{decision:'pass',summary:'Synthetic reference implementation only; LESSON-0001 quantity rule reused.',findings:[]}};
 }};
 const stopped=await run(p.lab,p.protocol_sha256,options);assert.equal(stopped.status,'stopped');assert.equal(stopped.calls.length,1);
 const original=await fs.readFile(path.join(p.lab,'result.json'),'utf8');
 await assert.rejects(run(p.lab,p.protocol_sha256,{...options,recoveryResultHash:'wrong'}),/recovery-result-drift/);
 const root=path.join(p.lab,'project'),recoveryRepositoryHash=hash({tree:await tree(root),head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()});
 const quantity=await fs.readFile(path.join(root,'src/quantity.mjs'),'utf8');await fs.writeFile(path.join(root,'src/quantity.mjs'),quantity+'\n// intervening edit\n');
 await assert.rejects(run(p.lab,p.protocol_sha256,{...options,recoveryResultHash:hash(stopped),recoveryRepositoryHash}),/recovery-repository-drift/);await fs.writeFile(path.join(root,'src/quantity.mjs'),quantity);
 const result=await run(p.lab,p.protocol_sha256,{...options,recoveryResultHash:hash(stopped),recoveryRepositoryHash});
 assert.equal(await fs.readFile(path.join(p.lab,'result.json'),'utf8'),original);assert.equal(result.calls[0].completion.decision,'blocked');assert.equal(result.tasks[0].attempts[0].reused_implementation,true);
 const completedHash=hash({tree:await tree(root),head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()});
 await assert.rejects(run(p.lab,p.protocol_sha256,{...options,recoveryResultHash:hash(stopped),recoveryRepositoryHash:completedHash}),/EEXIST/);
 assert.equal(result.kind,'synthetic-lifecycle-rehearsal');assert.equal(result.status,'completed',result.failure);assert.equal(result.tasks.length,3);assert(result.tasks.every(x=>x.report.lifecycle_state==='done'));assert.equal(result.calls.length,6);assert.deepEqual(result.learning.contradicted,[]);assert.equal(result.doctor.summary.fail,0);
});
