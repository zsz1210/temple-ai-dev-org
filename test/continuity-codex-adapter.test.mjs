import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {continuityRequests,inspectContinuitySchemas,probeContinuitySandbox} from '../scripts/continuity-codex-adapter.mjs';

const input={root:'/synthetic/actor',model:'test-model',effort:'medium',arm:'ordinary'};
function schemas(requests) {
  const object=v=>({type:'object',properties:Object.fromEntries(Object.keys(v).map(k=>[k,{}]))});
  const policy=object(requests.turn.sandboxPolicy);policy.properties.type={enum:['workspaceWrite']};
  policy.properties.readOnlyAccess=object(requests.turn.sandboxPolicy.readOnlyAccess);
  policy.properties.readOnlyAccess.properties.type={enum:['restricted']};
  return {ThreadStartParams:object(requests.thread),TurnStartParams:{...object(requests.turn),definitions:{SandboxPolicy:{oneOf:[policy]}}}};
}
test('continuity preview shares product instructions, uses explicit identities and never grants launch',()=>{
  const a=continuityRequests(input),b=continuityRequests({...input,arm:'temple',itemId:'WI-0042',agentId:'agent-fixture'});
  assert.equal(a.common_instructions,b.common_instructions);
  assert.equal(a.thread.developerInstructions,b.thread.developerInstructions);
  assert.deepEqual(a.turn.outputSchema,b.turn.outputSchema);
  assert.match(b.governance_instructions,/WI-0042/);assert.match(b.governance_instructions,/agent-fixture/);
  assert.doesNotMatch(b.governance_instructions,/agent-builder|WI-0001/);
  assert.match(b.governance_instructions,/only Developer Build into Test/);
  assert.equal(a.live_ready,false);assert.equal(b.live_ready,false);
  assert.deepEqual(a.turn.sandboxPolicy.readOnlyAccess.readableRoots,[input.root]);
  assert.equal(a.turn.sandboxPolicy.networkAccess,false);assert.equal(a.thread.allowProviderModelFallback,false);
  a.turn.outputSchema.required.push('mutable');assert.equal(b.turn.outputSchema.required.includes('mutable'),false);
});
test('continuity preview rejects ambiguous paths, arms, identities and missing model inputs',()=>{
  for(const patch of [{root:'/'},{root:'relative'},{root:'/a/../b'},{model:null},{effort:null},{arm:'unknown'},{arm:'temple'},{arm:'temple',itemId:'WI-0001',agentId:'a;command'},{threadId:''}])
    assert.throws(()=>continuityRequests({...input,...patch}));
});
test('schema inspection catches undeclared fields even when generic schema accepts extras',()=>{
  const r=continuityRequests(input),s=schemas(r);
  delete s.ThreadStartParams.properties.allowProviderModelFallback;
  delete s.TurnStartParams.definitions.SandboxPolicy.oneOf[0].properties.readOnlyAccess;
  const result=inspectContinuitySchemas(s,r);
  assert.equal(result.request_schema_valid,false);assert.equal(result.live_ready,false);
  assert.deepEqual(result.issues,['undeclared-field:ThreadStartParams.allowProviderModelFallback','undeclared-sandbox-field:readOnlyAccess','experimental-opt-in-required:allowProviderModelFallback']);
});
test('schema-valid desired requests remain non-executable and unknown availability stays unknown',()=>{
  const r=continuityRequests(input),s=schemas(r),before=JSON.stringify(s);
  const result=inspectContinuitySchemas(s,r,{experimentalApi:true});
  assert.equal(result.request_schema_valid,true);assert.deepEqual(result.issues,[]);
  assert.equal(result.live_ready,false);assert.equal(result.model_available,'not-checked');
  assert.equal(JSON.stringify(s),before);
  s.ThreadStartParams.properties.sandbox={enum:['workspaceWrite']};
  assert.ok(inspectContinuitySchemas(s,r,{experimentalApi:true}).issues.includes('invalid-request:ThreadStartParams'));
});
test('nested read safeguards need declared restricted variants and fields, including references',()=>{
  const r=continuityRequests(input),s=schemas(r),policy=s.TurnStartParams.definitions.SandboxPolicy.oneOf[0];
  const access=policy.properties.readOnlyAccess;
  s.TurnStartParams.definitions.ReadAccess={oneOf:[access]};
  policy.properties.readOnlyAccess={anyOf:[{$ref:'#/definitions/ReadAccess'},{type:'null'}]};
  assert.equal(inspectContinuitySchemas(s,r,{experimentalApi:true}).request_schema_valid,true);
  delete access.properties.readableRoots;
  assert.ok(inspectContinuitySchemas(s,r,{experimentalApi:true}).issues.includes('undeclared-read-access-field:readableRoots'));
  s.TurnStartParams.definitions.ReadAccess={};
  assert.ok(inspectContinuitySchemas(s,r,{experimentalApi:true}).issues.includes('undeclared-read-access:restricted'));
});
async function scratch(t){const root=await fs.mkdtemp(path.join(os.tmpdir(),'continuity-adapter-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));await fs.writeFile(path.join(root,'keep'),'keep');return root;}
function fake({siblingRead=true,failAt=null,closeFails=false,notifyAtClose=false,invalidResponse=false}={}) {
  const calls=[];let closed=false;
  const factory=(_binary,_args,options)=>({
    async request(method,p){
      calls.push(method);assert.ok(['initialize','command/exec'].includes(method));
      if(failAt===calls.length)throw Error('private-provider-detail /private/path');
      if(method==='initialize')return {};
      assert.equal(p.sandboxPolicy.networkAccess,false);assert.ok(p.timeoutMs>0&&p.timeoutMs<=3000);assert.equal(p.outputBytesCap,2048);
      if(invalidResponse)return {exitCode:'0',stdout:'',stderr:''};
      const target=p.command.at(-1),other=path.basename(path.dirname(target))==='sibling';
      if(other&&(path.basename(target)==='written'||!siblingRead))return {exitCode:1,stdout:'',stderr:'denied'};
      const r=spawnSync(p.command[0],p.command.slice(1),{cwd:p.cwd,encoding:'utf8',timeout:3000});
      return {exitCode:r.status,stdout:r.stdout,stderr:r.stderr};
    },
    notify(method){calls.push(method);assert.equal(method,'initialized');},
    async close(){closed=true;if(notifyAtClose){options.onNotification({method:'turn/started'});options.onProtocolError(Error('late-invalid'));}if(closeFails)throw Error('private-close-detail');}
  });
  return {factory,calls,get closed(){return closed}};
}
test('legacy sandbox probe detects sibling reads without starting any model thread',async t=>{
  const root=await scratch(t),f=fake(),result=await probeContinuitySandbox({scratchParent:root,providerFactory:f.factory});
  assert.equal(result.status,'isolation-gap-observed');assert.equal(result.checks.sibling_read.marker_observed,true);
  assert.equal(result.checks.sibling_write.file_created,false);assert.equal(result.transport,'simulated');
  assert.equal(result.model_generation_performed,false);assert.equal(result.live_ready,false);
  assert.equal(f.closed,true);assert.equal(result.server_exit_confirmed,true);
  assert.deepEqual(f.calls,['initialize','initialized',...Array(4).fill('command/exec')]);
  assert.deepEqual(await fs.readdir(root),['keep']);
  assert.doesNotMatch(JSON.stringify(result),/synthetic-marker|private-provider-detail|continuity-adapter-test-/);
});
test('passing synthetic controls are not a live sandbox certification',async t=>{
  const root=await scratch(t),f=fake({siblingRead:false}),r=await probeContinuitySandbox({scratchParent:root,providerFactory:f.factory});
  assert.equal(r.status,'bounded-controls-passed');assert.equal(r.live_ready,false);
  assert.equal(r.network_isolation,'not-qualified');assert.equal(r.descendant_cleanup,'not-qualified');
});
test('provider initialization and command failures stop without retries and redact raw errors',async t=>{
  for(const failAt of [1,3]){
    const root=await scratch(t),f=fake({failAt}),r=await probeContinuitySandbox({scratchParent:root,providerFactory:f.factory});
    assert.equal(r.status,'failed');assert.equal(r.failure,'provider-or-local-operation-failed');
    assert.equal(f.calls.length,failAt);assert.equal(f.closed,true);assert.equal(r.scratch_removed,true);
    assert.doesNotMatch(JSON.stringify(r),/private-provider-detail|private\/path/);assert.deepEqual(await fs.readdir(root),['keep']);
  }
});
test('cleanup failure retains scratch and unexpected generation event never reports no generation',async t=>{
  const root=await scratch(t),f=fake({closeFails:true,notifyAtClose:true}),r=await probeContinuitySandbox({scratchParent:root,providerFactory:f.factory});
  assert.equal(r.status,'failed');assert.equal(r.cleanup_failure,'server-close-failed');
  assert.equal(r.scratch_removed,false);assert.equal(r.server_exit_confirmed,false);
  assert.equal(r.failure,'unexpected-generation-event');assert.equal(r.model_generation_performed,'unknown');
  assert.equal((await fs.readdir(root)).length,2);
});
test('malformed command results cannot become sandbox evidence',async t=>{
  const root=await scratch(t),f=fake({invalidResponse:true}),r=await probeContinuitySandbox({scratchParent:root,providerFactory:f.factory});
  assert.equal(r.status,'failed');assert.equal(r.failure,'invalid-command-response');assert.equal(r.scratch_removed,true);
});
