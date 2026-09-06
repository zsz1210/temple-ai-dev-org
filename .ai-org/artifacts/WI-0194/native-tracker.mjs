import { ITEM_POLICY, classifyItem } from './event-policy.mjs';
// Observation only: never grants write authority or launches a child.
import { createHash } from 'node:crypto';
const hash=x=>createHash('sha256').update(String(x)).digest('hex');
const demand=(v,m)=>{if(!v)throw Error(m);};
const valid=x=>typeof x==='string'&&x.length>0&&x.length<=256;
export function usageValue(p){
 const u=p?.tokenUsage?.total;demand(u,'usage-missing');
 for(const k of ['inputTokens','cachedInputTokens','outputTokens','reasoningOutputTokens','totalTokens'])demand(Number.isSafeInteger(u[k])&&u[k]>=0,'usage-invalid');
 demand(u.cachedInputTokens<=u.inputTokens&&u.reasoningOutputTokens<=u.outputTokens&&u.totalTokens===u.inputTokens+u.outputTokens,'usage-inconsistent');
 return {...u,operationalTokens:u.inputTokens-u.cachedInputTokens+u.outputTokens};
}
export class NativeTracker {
 constructor({parent,turn,model,effort,maxChildren=0,maxEvents=4000}){
  demand(valid(parent)&&valid(turn),'parent-identity');this.parent=parent;this.model=model;this.effort=effort;this.maxChildren=maxChildren;this.maxEvents=maxEvents;
  this.actors=new Map([[parent,{turn,terminal:null,usage:null,items:new Map(),calls:0,bytes:0}]]);this.pending=[];this.count=0;this.children=new Set();this.stop=null;this.activityHints=new Set();
 }
 event(event){try{return this.accept(event);}catch(e){this.stop??=e.message;throw e;}}
 accept({method,params:p}={}){
  demand(typeof method==='string'&&p&&typeof p==='object','event-shape');
  demand(!/rerout|requestApproval|requestUserInput/i.test(method),'route-or-authority-change');
  const relevant=['turn/started','turn/completed','item/started','item/completed','thread/tokenUsage/updated'].includes(method);
  if(!relevant)return;
  demand(++this.count<=this.maxEvents,'event-cap');
  demand(valid(p.threadId),'event-thread');
  if(!this.actors.has(p.threadId)){
   // Child events may precede the parent's spawn-completed event. Buffer, never
   // attribute their counters until an observed parent spawn binds that ID.
   demand(this.pending.length<64,'unbound-event-cap');this.pending.push({method,params:p});return;
  }
  const a=this.actors.get(p.threadId);const tid=method.startsWith('turn/')?p.turn?.id:p.turnId;
  demand(valid(tid),'event-turn');
  if(a.turn===null){demand(method==='turn/started','child-turn-unbound');a.turn=tid;}
  demand(a.turn===tid,'wrong-turn');
  if(method==='thread/tokenUsage/updated'){
   const u=usageValue(p);if(a.usage)for(const k of ['inputTokens','cachedInputTokens','outputTokens','reasoningOutputTokens','totalTokens'])demand(u[k]>=a.usage[k],'usage-regressed');
   a.usage=u;return;
  }
  if(method==='turn/started'){demand(!a.terminal,'turn-after-terminal');return;}
  if(method==='turn/completed'){
   demand(!a.terminal,'duplicate-terminal');demand(['completed','interrupted','failed'].includes(p.turn.status),'terminal-status');
   demand([...a.items.values()].every(x=>x.done),'unfinished-item');a.terminal=p.turn.status;return;
  }
  const i=p.item;demand(i&&valid(i.id),'item-id');
  const policy=classifyItem(i.type);demand(policy!=='unknown','unknown-item');demand(policy!=='forbidden','forbidden-item');
  if(policy==='activity'){demand(p.threadId===this.parent&&valid(i.agentThreadId),'invalid-child-activity');demand(this.maxChildren>0,'unexpected-child-activity');demand(['started','interacted','interrupted','completed'].includes(i.kind),'invalid-child-activity');this.activityHints.add(i.agentThreadId);demand(this.activityHints.size<=this.maxChildren,'child-activity-limit');return;}
  const tool=policy==='tracked';
  if(!tool)return;
  demand(!a.terminal,'tool-after-terminal');
  if(method==='item/started'){
   demand(!a.items.has(i.id),'duplicate-start');
   a.items.set(i.id,{type:i.type,done:false,fingerprint:i.type==='commandExecution'?hash(JSON.stringify([i.command,i.cwd])):null});a.calls++;return;
  }
  const start=a.items.get(i.id);demand(start&&!start.done&&start.type===i.type,'unmatched-completion');
  if(i.type==='commandExecution'){
   demand(start.fingerprint===hash(JSON.stringify([i.command,i.cwd])),'command-drift');demand(Number.isInteger(i.exitCode),'command-outcome');
   a.bytes+=Buffer.byteLength(i.aggregatedOutput??'');
  }
  if(i.type==='collabAgentToolCall'){
   demand(p.threadId===this.parent&&i.senderThreadId===this.parent,'nested-or-foreign-spawn');
   if(i.tool==='spawnAgent'){
    if(['failed','interrupted'].includes(i.status)){start.done=true;this.stop??=i.status==='failed'?'native-spawn-failed':'native-spawn-interrupted';return;}
    demand(i.status==='completed'&&Array.isArray(i.receiverThreadIds)&&i.receiverThreadIds.length===1,'spawn-outcome');
    demand(i.model===this.model&&i.reasoningEffort===this.effort,'child-route-unconfirmed');
    const child=i.receiverThreadIds[0];demand(valid(child)&&!this.actors.has(child)&&this.children.size<this.maxChildren,'child-limit-or-duplicate');
    this.children.add(child);this.actors.set(child,{turn:null,terminal:null,usage:null,items:new Map(),calls:0,bytes:0});
    const replay=this.pending.filter(x=>x.params.threadId===child);this.pending=this.pending.filter(x=>x.params.threadId!==child);
    for(const e of replay)this.accept(e);
   }else demand(['wait','listAgents','closeAgent'].includes(i.tool),'extra-child-turn');
  }
  start.done=true;
 }
 active(){return [...this.actors].filter(([,a])=>a.turn&&!a.terminal).map(([threadId,a])=>({threadId,turnId:a.turn}));}
 report(){
  const actors=[...this.actors].map(([id,a])=>({id_sha256:hash(id),role:id===this.parent?'parent':'helper',terminal:a.terminal,usage:a.usage,tool_calls:a.calls,output_bytes:a.bytes}));
  return {actors,unknown_event_count:this.pending.length,unbound_activity_ids:[...this.activityHints].filter(id=>!this.children.has(id)).map(hash),expected_children:this.maxChildren,observed_children:this.children.size,
   status:this.stop?'stopped':[...this.activityHints].some(id=>!this.children.has(id))||this.pending.length||this.children.size!==this.maxChildren||actors.some(a=>a.terminal!=='completed'||!a.usage)?'incomplete':'observed-complete',
   stop_reason:this.stop,usage_scope:'per-thread-last-observed-not-account-final',aggregate_operational_tokens:this.children.size?null:actors[0].usage?.operationalTokens??null,
   aggregate_reason:this.children.size?'parent-child-nonduplication-not-established':null};
 }
}
