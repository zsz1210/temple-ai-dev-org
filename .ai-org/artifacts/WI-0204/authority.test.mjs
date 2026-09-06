import test from 'node:test';
import assert from 'node:assert/strict';
import { requests, runSubject } from './executor.mjs';
import { NativeTracker } from './native-tracker.mjs';

test('root imperative lives in root input, inherited instructions define leaf prohibition',()=>{
 const r=requests({id:'support-read',target:'/tmp',prompt:'fixture question'},{model:'gpt-5.6-terra',effort:'medium'});
 assert.match(r.turn.input[0].text,/ROOT PARENT ONLY: request exactly one native helper/);
 assert.match(r.thread.developerInstructions,/leaf and must do that brief directly, never invoke collaboration tools/);
 assert.doesNotMatch(r.thread.developerInstructions,/Use exactly one native helper/);
 assert.equal(r.thread.ephemeral,true);
});
test('real generation is disabled, not implicitly authorized by a request fix',async()=>{
 await assert.rejects(runSubject({fixture:{},protocol:{},contract:{}}),/generation-disabled-pending-native-guard-validation/);
});
for(const status of['interrupted','failed','completed']){
 test(`${status} terminal retains the correct unfinished-item semantics`,()=>{
  const t=new NativeTracker({parent:'p',turn:'tp',model:'gpt-5.6-terra',effort:'medium'});
  t.event({method:'item/started',params:{threadId:'p',turnId:'tp',item:{id:'cmd',type:'commandExecution',command:'test',cwd:'/tmp'}}});
  const finish=()=>t.event({method:'turn/completed',params:{threadId:'p',turn:{id:'tp',status}}});
  if(status==='completed')assert.throws(finish,/unfinished-item/);
  else {finish();assert.equal(t.report().actors[0].terminal,status);assert.equal(t.report().actors[0].unfinished_items,1);assert.deepEqual(t.active(),[]);assert.notEqual(t.report().status,'observed-complete');}
 });
}
