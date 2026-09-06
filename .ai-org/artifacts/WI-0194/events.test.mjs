import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import Ajv from 'ajv';
import { ITEM_POLICY, classifyItem, assertItemCoverage, EventJournal } from './event-policy.mjs';
import { NativeTracker } from './native-tracker.mjs';
import { runSubject, sha } from './executor.mjs';

const dir=await fs.mkdtemp(path.join(os.tmpdir(),'temple-event-contract-'));
execFileSync('codex',['app-server','generate-json-schema','--out',dir]);
const schemas={};
for(const name of ['ThreadStartParams','TurnStartParams','ThreadResumeParams','ItemStartedNotification','ItemCompletedNotification','ThreadTokenUsageUpdatedNotification','TurnStartedNotification','TurnCompletedNotification'])schemas[name]=JSON.parse(await fs.readFile(path.join(dir,'v2',`${name}.json`)));
await fs.rm(dir,{recursive:true,force:true});
const schema=schemas.ItemCompletedNotification;
const variants=schema.definitions.ThreadItem.oneOf;
const protocol={model:'gpt-5.6-terra',effort:'medium',proposed_limits:{per_actor_ms:6000,per_actor_operational_tokens:100000,aggregate_operational_tokens:800000}};
const tracker=()=>new NativeTracker({parent:'p',turn:'tp',model:protocol.model,effort:protocol.effort,maxChildren:1});
const turn=(id,status='inProgress')=>({id:id==='p'?'tp':'tc',items:[],status});
const ev=(method,id,item)=>({method,params:{threadId:id,turnId:id==='p'?'tp':'tc',startedAtMs:1,completedAtMs:2,...(method.startsWith('turn/')?{turn:item}:{item})}});
const usage=id=>({method:'thread/tokenUsage/updated',params:{threadId:id,turnId:id==='p'?'tp':'tc',tokenUsage:{last:{inputTokens:100,cachedInputTokens:10,outputTokens:20,reasoningOutputTokens:5,totalTokens:120},total:{inputTokens:100,cachedInputTokens:10,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}}});
const spawn={id:'spawn',type:'collabAgentToolCall',senderThreadId:'p',receiverThreadIds:['c'],tool:'spawnAgent',status:'completed',model:protocol.model,reasoningEffort:protocol.effort,agentsStates:{}};
const activity={id:'activity',type:'subAgentActivity',agentPath:'/synthetic/helper',agentThreadId:'c',kind:'started'};
// Required fields are populated from the installed schema, then each case is
// independently validated by Ajv. No permissive notification schemas.
function minimal(s){
  if(s.$ref)return minimal(schema.definitions[s.$ref.split('/').at(-1)]);
  if(s.const!==undefined)return s.const;
  if(s.enum)return s.enum[0];
  if(s.anyOf||s.oneOf)return minimal((s.anyOf??s.oneOf)[0]);
  if(s.allOf)return minimal(s.allOf[0]);
  const type=Array.isArray(s.type)?s.type[0]:s.type;
  if(type==='object')return Object.fromEntries((s.required??[]).map(k=>[k,minimal(s.properties[k])]));
  if(type==='array')return [];
  if(type==='integer'||type==='number')return 0;
  if(type==='boolean')return false;
  if(type==='null')return null;
  return 'synthetic';
}
const validate=new Ajv({strict:false,validateFormats:false}).compile(schema);
test('all installed item kinds have explicit policy; drift fails closed',()=>{
  assert.equal(assertItemCoverage(schema).length,19);
  const drift=structuredClone(schema);drift.definitions.ThreadItem.oneOf.push({properties:{type:{enum:['futureType']}}});
  assert.throws(()=>assertItemCoverage(drift),/drift/);
});
for(const variant of variants){const type=variant.properties.type.enum[0];
 test(`installed item ${type} is schema-valid and explicitly classified`,()=>{
  let item={...minimal(variant),id:'i'};
  if(type==='collabAgentToolCall')item={...spawn,id:'i'};
  if(type==='subAgentActivity')item={...activity,id:'i'};
  if(type==='commandExecution')Object.assign(item,{command:'true',cwd:'/synthetic',exitCode:0});
  const event=ev('item/completed','p',item);
  assert.ok(validate(event.params),JSON.stringify(validate.errors));
  const t=tracker();
  if(ITEM_POLICY[type]==='forbidden')assert.throws(()=>t.event(event),/forbidden-item/);
  else {if(ITEM_POLICY[type]==='tracked')t.event(ev('item/started','p',item));assert.doesNotThrow(()=>t.event(event));}
 });
}
test('activity hints never bind children or establish cleanup',()=>{
  const t=tracker();t.event(ev('item/completed','p',activity));
  assert.equal(t.children.size,0);assert.equal(t.report().unbound_activity_ids.length,1);
  assert.notEqual(t.report().status,'observed-complete');
});
test('unknown and nested activity remain rejected',()=>{
  assert.throws(()=>tracker().event(ev('item/completed','p',{id:'x',type:'unknown'})),/unknown-item/);
  const t=tracker();t.event(ev('item/completed','p',activity));
  assert.throws(()=>t.event(ev('item/completed','p',{...activity,agentThreadId:'other'})),/child-activity-limit/);
});
test('journal caps history, preserves first failure and excludes raw sensitive fields',()=>{
  const j=new EventJournal(2), e=ev('item/completed','private-id',{id:'secret',type:'SECRET',text:'SECRET',arguments:{password:'SECRET'}});
  j.record(e);j.fail(e,'SECRET');for(let i=0;i<10;i++)j.record(ev('item/completed','p',activity));
  const r=j.report();assert.equal(r.total_events,11);assert.equal(r.recent.length,2);assert.equal(r.first_failure.item_type,'unknown');assert.ok(!JSON.stringify(r).includes('SECRET'));assert.ok(!JSON.stringify(r).includes('private-id'));
});

async function replay(events,{contract=schemas}={}){
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'temple-event-replay-'));const calls=[];
  const factory=(_exe,_args,o)=>({request:async(method,params)=>{
    calls.push(method);
    if(method==='config/read')return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};
    if(method==='thread/start'||method==='thread/resume')return {thread:{id:params.threadId??'p'},model:protocol.model,reasoningEffort:protocol.effort};
    if(method==='turn/start'){queueMicrotask(()=>events.forEach(o.onNotification));return {turn:turn('p')};}
    if(method==='turn/interrupt'){o.onNotification(ev('turn/completed',params.threadId,{id:params.turnId,items:[],status:'interrupted'}));}
    return {};
  },notify(){},close:async()=>{calls.push('close');}});
  try{return {result:await runSubject({fixture:{target:root,source:root,id:'support-read',prompt:'synthetic',arm:'before'},protocol,contract:{schemas:contract},deadline:Date.now()+6000,providerFactory:factory}),calls};}
  finally{await fs.rm(root,{recursive:true,force:true});}
}
const answer={decision:'reported',summary:'Synthetic replay',unresolved:[],next_position:'developer',references:['cache.mjs'],findings:{ttl_precedence:['override','tenant','default'],default_ttl_seconds:300,source_revision:'a'.repeat(40),untrusted_instruction_rejected:false}};
const message=(id,text)=>ev('item/completed',id,{type:'agentMessage',id:`msg-${id}`,text,phase:null});
for(const early of [true,false])test(`actual executor: child activity and findings ${early?'before':'after'} parent spawn completion`,async()=>{
 const child=[ev('turn/started','c',turn('c')),message('c','Synthetic helper'),usage('c'),ev('turn/completed','c',turn('c','completed'))];
 const parentSpawn=[ev('item/started','p',{...spawn,status:'inProgress'}),ev('item/completed','p',spawn)];
 const {result,calls}=await replay([ev('item/started','p',activity),...(early?[...child,...parentSpawn]:[...parentSpawn,...child]),usage('p'),message('p',JSON.stringify(answer)),ev('turn/completed','p',turn('p','completed'))]);
 assert.equal(result.status,'observed-complete',JSON.stringify(result.event_journal.first_failure));assert.equal(result.messages.filter(x=>x.role==='helper').length,1);assert.equal(result.cleanup.status,'observed-terminal');assert.ok(calls.includes('thread/resume'));assert.equal(result.trace.aggregate_operational_tokens,null);
});
test('actual executor: unknown schema item survives failure and interrupts known parent',async()=>{
 const {result,calls}=await replay([ev('item/completed','p',{id:'x',type:'SECRET',text:'SECRET'})]);
 assert.match(result.stop_reason,/schema-invalid/);assert.equal(result.event_journal.first_failure.item_type,'unknown');assert.ok(!JSON.stringify(result.event_journal).includes('SECRET'));assert.ok(calls.includes('turn/interrupt'));assert.ok(calls.includes('close'));
});
test('actual executor: unbound activity and early child remain cleanup-unconfirmed',async()=>{
 const {result}=await replay([ev('item/started','p',activity),ev('turn/started','c',turn('c')),usage('p'),message('p',JSON.stringify(answer)),ev('turn/completed','p',turn('p','completed'))]);
 assert.equal(result.cleanup.status,'unconfirmed');assert.ok(result.cleanup.unfinished_actor_ids.includes(sha('c')));assert.notEqual(result.status,'observed-complete');
});
test('actual executor: failed and interrupted spawn are not unknown-item',async()=>{
 for(const status of ['failed','interrupted']){
  const {result}=await replay([ev('item/started','p',{...spawn,status:'inProgress'}),ev('item/completed','p',{...spawn,status,receiverThreadIds:[]})]);
  assert.equal(result.stop_reason,`native-spawn-${status}`);assert.equal(result.trace.observed_children,0);
 }
});
test('actual executor: malformed turn retains schema failure before handler',async()=>{
 const {result}=await replay([ev('turn/completed','p',{id:'tp',status:'completed'})]);
 assert.equal(result.event_journal.first_failure.code,'schema-invalid:TurnCompletedNotification');
 assert.notEqual(result.status,'observed-complete');
});
test('malformed JSON item types never coerce or leak content, including actual executor failure paths',async()=>{
 for(const type of [{toString:null},{toString:'SECRET'},['userMessage'],null,42,false]){
  const event=ev('item/completed','p',{id:'x',type});const j=new EventJournal();
  j.record(event);j.fail(event,'schema-invalid:ItemCompletedNotification');
  assert.equal(classifyItem(type),'unknown');assert.equal(j.report().retained_events,1);
  assert.equal(j.report().first_failure.item_type,'unknown');assert.ok(!JSON.stringify(j.report()).includes('SECRET'));
  const {result,calls}=await replay([event]);
  assert.equal(result.stop_reason,'schema-invalid:ItemCompletedNotification');
  assert.equal(result.event_journal.first_failure.item_type,'unknown');
  assert.ok(calls.includes('turn/interrupt'));assert.ok(calls.includes('close'));
 }
});
test('invalid unknown actor remains uncertain after parent terminal without gaining authority',async()=>{
 const {result,calls}=await replay([ev('item/completed','unknown-child',{id:'x',type:'SECRET'})]);
 assert.equal(result.stop_reason,'schema-invalid:ItemCompletedNotification');
 assert.equal(result.cleanup.status,'unconfirmed');assert.deepEqual(result.cleanup.unfinished_actor_ids,[sha('unknown-child')]);
 assert.equal(result.trace.observed_children,0);assert.ok(!calls.includes('thread/resume'));
 assert.equal(calls.filter(x=>x==='turn/interrupt').length,1);
});
test('untrusted actor hints are bounded and overflow cannot claim confirmed cleanup',async()=>{
 const {result}=await replay(Array.from({length:70},(_,i)=>ev('item/completed',`unknown-${i}`,{id:'x',type:'SECRET'})));
 assert.equal(result.cleanup.actor_hint_overflow,true);assert.equal(result.cleanup.status,'unconfirmed');
 assert.ok(result.cleanup.unfinished_actor_ids.length<=64);assert.equal(result.trace.observed_children,0);
});
test('frozen predecessor executor and tracker are unchanged',async()=>{
 for(const name of ['native-tracker.mjs','executor.mjs']){
  const file=`.ai-org/artifacts/WI-0193/${name}`;
  assert.deepEqual(await fs.readFile(file),execFileSync('git',['show',`2628319f75c01d1bf9d9879569b504ab40f44b1f:${file}`]));
 }
});
