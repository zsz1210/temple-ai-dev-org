import test from 'node:test';
import assert from 'node:assert/strict';
import {protocol,sourceCheck,operational,aggregate,readiness} from './preflight.mjs';
test('paired arms use all six unique cases and balance order within topics',()=>{
 assert.equal(protocol.cases.length,6);assert.equal(new Set(protocol.cases.map(x=>x.id)).size,6);
 for(const topic of ['entry','completion','support'])assert.deepEqual(protocol.cases.filter(x=>x.topic===topic).map(x=>x.order),[['before','after'],['after','before']]);
});
test('turn and aggregate limits include helpers, not just parents',()=>{
 const turns=protocol.cases.reduce((n,x)=>n+2*(1+x.helpers_per_arm),0);
 assert.equal(turns,16);assert.equal(turns,protocol.proposed_limits.subject_turns);
 assert.equal(turns*protocol.proposed_limits.per_actor_operational_tokens,protocol.proposed_limits.aggregate_operational_tokens);
});
test('runtime and sealed prior experiment are identical between source arms',()=>{
 const s=sourceCheck();assert.equal(s.protected_equal,true,s.protected_diff);
 assert(s.changed_instruction_files.some(x=>x.path.endsWith('read-only-support.md')&&x.before===null&&x.after.bytes>0));
});
test('operational accounting does not double count cached or reasoning output',()=>assert.equal(operational({input:100,cached:60,output:20,reasoning:15}),60));
test('missing, inconsistent or overflowing usage remains unknown',()=>{
 for(const u of [null,{input:2,cached:3,output:1},{input:1,cached:0},{input:Number.MAX_SAFE_INTEGER,cached:0,output:1}])assert.equal(operational(u),null);
});
test('parent and helper require exclusive complete accounting',()=>{
 const rows=[{id:'p',settled:true,usage:{input:100,cached:60,output:20}},{id:'h',settled:true,usage:{input:50,cached:0,output:10}}];
 assert.equal(aggregate(rows,true),120);assert.equal(aggregate(rows,false),null);
 assert.equal(aggregate([rows[0],rows[0]],true),null);assert.equal(aggregate([rows[0],{...rows[1],settled:false}],true),null);
});
test('design cannot launch live generation by satisfying placeholder flags',()=>{
 assert.equal(readiness(protocol).ready,false);
 const fake={...protocol,live_approval:'not-real',live_readiness:{all:true}};
 assert.equal(readiness(fake).ready,false);assert(readiness(fake).blockers.includes('exact-seal-and-independent-review-required'));
});
