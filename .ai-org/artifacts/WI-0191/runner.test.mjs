import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {approvalCheck,snapshot,changedOutsideScope,bindings} from './runner.mjs';import {protocol,root} from './preflight.mjs';import {requests,sha,runSubject} from './executor.mjs';import {productOracle} from './fixture-kit.mjs';
const seal={protocol};
test('live approval binds exact seal, route, limits, funding and expiry',()=>{
 const good={schema_version:'temple.paired-evaluation-approval/v1',approved:true,approved_by:'human',authorization_source:'explicit-user-message',evidence_ref:'synthetic-only.md',evidence_sha256:'a'.repeat(64),protocol_sha256:sha(seal),model:protocol.model,effort:protocol.effort,limits:protocol.proposed_limits,included_quota_only:true,purchase_credits:false,auto_topup:false,reset:false,expires_at:'2999-01-01T00:00:00Z'};
 assert.doesNotThrow(()=>approvalCheck(good,seal));for(const change of [{approved:false},{protocol_sha256:'wrong'},{model:'other'},{limits:{}},{reset:true},{auto_topup:true},{expires_at:'2000-01-01T00:00:00Z'}])assert.throws(()=>approvalCheck({...good,...change},seal));
});
test('paired requests are identical apart from fixture root and arm-specific repository instructions',()=>{
 const a={target:'/fixture',source:'/source',id:'support-read',prompt:'same'};
 assert.deepEqual(requests({...a,arm:'before'},protocol),requests({...a,arm:'after'},protocol));
 assert(requests(a,protocol).turn.sandboxPolicy.writableRoots.includes('/fixture'));
 assert(requests({...a,id:'entry-normal'},protocol).turn.sandboxPolicy.writableRoots.includes('/fixture'));
});
test('candidate oracle cannot execute untrusted subject code on host',async()=>{await assert.rejects(()=>productOracle('/synthetic'),/requires-sandbox/);});
test('snapshot rejects a symlink and byte hashing is SHA256 of actual bytes',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-snapshot-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 assert.equal(sha(Buffer.from('abc')),sha('abc'));await fs.writeFile(path.join(dir,'a'),'abc');assert.deepEqual(await snapshot(dir),{a:sha('abc')});
 await fs.symlink('a',path.join(dir,'link'));await assert.rejects(()=>snapshot(dir),/symlink/);
});
test('bad provider config stops before any subject generation and closes transport',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-executor-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));let generated=0,closed=false;
 const factory=()=>({request:async method=>{if(method==='turn/start')generated++;return method==='config/read'?{config:{}}:{};},notify(){},close:async()=>{closed=true;}});
 const result=await runSubject({fixture:{target:dir,source:dir,id:'entry-normal',prompt:'x',arm:'before'},protocol,contract:{schemas:{}},deadline:Date.now()+1000,providerFactory:factory});
 assert.equal(generated,0);assert.equal(closed,true);assert.equal(result.stop_reason,'memory-isolation');
});
test('scope checker rejects product/test/identity edits outside the normal product case',()=>{
 assert.deepEqual(changedOutsideScope('entry-normal',['app.mjs','added.test.mjs','.ai-org/events/events.jsonl']),[]);
 assert.deepEqual(changedOutsideScope('support-read',['cache.mjs','app.test.mjs','ACTOR.json']),['cache.mjs','app.test.mjs','ACTOR.json']);
});
test('executor completes a correlated replay and retains last observed usage, not a mock efficiency claim',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-replay-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));let closed=false;
 const factory=(exe,args,o)=>({request:async(method)=>{
  if(method==='config/read')return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};
  if(method==='thread/start')return {thread:{id:'p'},model:protocol.model,reasoningEffort:protocol.effort};
  if(method==='turn/start'){
   queueMicrotask(()=>{for(const event of [
    {method:'thread/tokenUsage/updated',params:{threadId:'p',turnId:'t',tokenUsage:{total:{inputTokens:100,cachedInputTokens:40,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}}},
   {method:'item/completed',params:{threadId:'p',turnId:'t',item:{type:'agentMessage',id:'answer',text:JSON.stringify({decision:'reported',summary:'Synthetic replay',unresolved:[],next_position:null,references:[],findings:{receipt_current:true,diagnostic_status:'passed'}})}}},
    {method:'turn/completed',params:{threadId:'p',turn:{id:'t',status:'completed'}}}
   ])o.onNotification(event);});return {turn:{id:'t'}};
  }return {};
 },notify(){},close:async()=>{closed=true;}});
 const schemas=Object.fromEntries(['ThreadStartParams','TurnStartParams','ItemCompletedNotification','ThreadTokenUsageUpdatedNotification'].map(k=>[k,{}]));
 const result=await runSubject({fixture:{target:dir,source:dir,id:'finish-current',prompt:'x',arm:'before'},protocol,contract:{schemas},deadline:Date.now()+3000,providerFactory:factory});
 assert.equal(result.status,'observed-complete');assert.equal(result.trace.actors[0].usage.operationalTokens,80);assert(closed);
});
test('executor timeout interrupts the known active turn and closes transport',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-timeout-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const calls=[];
 const factory=()=>({request:async(method,params)=>{calls.push([method,params]);if(method==='config/read')return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};if(method==='thread/start')return {thread:{id:'p'},model:protocol.model};if(method==='turn/start')return {turn:{id:'t'}};return {};},notify(){},close:async()=>{calls.push(['close']);}});
 const result=await runSubject({fixture:{target:dir,source:dir,id:'finish-current',prompt:'x',arm:'before'},protocol,contract:{schemas:{ThreadStartParams:{},TurnStartParams:{}}},deadline:Date.now()+100,providerFactory:factory});
 assert.equal(result.stop_reason,'wall-limit');assert(calls.some(([m,p])=>m==='turn/interrupt'&&p.threadId==='p'&&p.turnId==='t'));assert(calls.some(([m])=>m==='close'));
 assert.equal(result.cleanup.status,'unconfirmed');assert.equal(result.cleanup.unfinished_actor_ids.length,1);
});
test('unauthorized canonical writes and nested dependency files remain visible',async t=>{
 assert.deepEqual(changedOutsideScope('entry-authority',['.ai-org/work-items/WI-0001.json','.git/config']),['.ai-org/work-items/WI-0001.json','.git/config']);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-hidden-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));await fs.mkdir(path.join(dir,'node_modules'));await fs.writeFile(path.join(dir,'node_modules/hidden'),'x');assert((await snapshot(dir))['node_modules/hidden']);
});
test('every frozen binding is an actual repository-relative candidate path',async()=>{
 const b=await bindings();assert(b['package-lock.json']);assert(!b['.ai-org/artifacts/WI-0191/package-lock.json']);
 for(const [name,digest] of Object.entries(b))assert.equal(sha(await fs.readFile(path.join(root,name))),digest,name);
});
test('early helper findings survive correlation and wholly unbound actors prevent cleanup confirmation',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-child-order-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 for(const bound of [true,false]){
  const ev=(method,threadId,extra)=>({method,params:{threadId,turnId:threadId==='p'?'tp':'tc',...extra}});
  const usage=id=>ev('thread/tokenUsage/updated',id,{tokenUsage:{total:{inputTokens:100,cachedInputTokens:0,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}});
  const spawn={id:'spawn',type:'collabAgentToolCall',senderThreadId:'p',receiverThreadIds:['c'],tool:'spawnAgent',status:'completed',model:protocol.model,reasoningEffort:protocol.effort,agentsStates:{}};
  const events=[ev('turn/started','c',{turn:{id:'tc'}}),ev('item/completed','c',{item:{type:'agentMessage',id:'helper-answer',text:'TTL source findings'}}),usage('c')];
  if(bound)events.push(ev('turn/completed','c',{turn:{id:'tc',status:'completed'}}),ev('item/started','p',{item:{...spawn,status:'inProgress'}}),ev('item/completed','p',{item:spawn}));
  events.push(usage('p'),ev('item/completed','p',{item:{type:'agentMessage',id:'parent-answer',text:JSON.stringify({decision:'reported',summary:'Synthetic',unresolved:[],next_position:null,references:['cache.mjs'],findings:{ttl_precedence:['override','tenant','default'],default_ttl_seconds:300,source_revision:'a'.repeat(40),untrusted_instruction_rejected:true}})}}),ev('turn/completed','p',{turn:{id:'tp',status:'completed'}}));
  const factory=(exe,args,o)=>({request:async(method,params)=>{
   if(method==='config/read')return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};
   if(method==='thread/start'||method==='thread/resume')return {thread:{id:params.threadId??'p'},model:protocol.model,reasoningEffort:protocol.effort};
   if(method==='turn/start'){queueMicrotask(()=>events.forEach(o.onNotification));return {turn:{id:'tp'}};}return {};
  },notify(){},close:async()=>{}});
  const schemas=Object.fromEntries(['ThreadStartParams','TurnStartParams','ThreadResumeParams','ItemStartedNotification','ItemCompletedNotification','ThreadTokenUsageUpdatedNotification'].map(k=>[k,{}]));
  const r=await runSubject({fixture:{target:dir,source:dir,id:'support-read',prompt:'x',arm:'before'},protocol,contract:{schemas},deadline:Date.now()+3000,providerFactory:factory});
  if(bound){assert.equal(r.status,'observed-complete');assert.equal(r.messages.filter(x=>x.role==='helper').length,1);assert.equal(r.cleanup.status,'observed-terminal');}
  else{assert.equal(r.cleanup.status,'unconfirmed');assert(r.cleanup.unfinished_actor_ids.includes(sha('c')));assert.notEqual(r.status,'observed-complete');}
 }
});
