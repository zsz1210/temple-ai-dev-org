import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {namedPermissionArguments,inspectNamedPermissionSchemas,probeNamedPermissions} from '../scripts/continuity-named-permissions.mjs';

test('named permissions stay explicit and do not mix with legacy sandbox settings',()=>{
  const args=namedPermissionArguments('/synthetic/actor',['/synthetic/tools/bin']);
  assert.ok(args.includes('--strict-config'));
  assert.ok(args.some(s=>s.includes('"/synthetic/actor/.git" = "write"')));
  assert.ok(args.some(s=>s.includes('network.enabled=false')));
  assert.ok(args.some(s=>s.includes('":minimal" = "read"')));
  assert.ok(args.every(s=>!s.includes('sandbox_mode')&&!s.includes('sandboxPolicy')));
  for(const root of ['/','relative','/a/../b'])assert.throws(()=>namedPermissionArguments(root,['/tools']));
  for(const roots of [[],['/'],['relative'],['/synthetic'],null])assert.throws(()=>namedPermissionArguments('/synthetic/actor',roots));
});
test('schema declarations do not imply runtime permission or live readiness',()=>{
  const s={ThreadStartParams:{properties:{permissions:{type:'string'}}},TurnStartParams:{properties:{permissions:{type:'string'}}},CommandExecParams:{properties:{permissionProfile:{type:'string'}}}};
  assert.equal(inspectNamedPermissionSchemas(s).declared,true);
  assert.equal(inspectNamedPermissionSchemas(s).live_ready,false);
  delete s.CommandExecParams.properties.permissionProfile;
  assert.deepEqual(inspectNamedPermissionSchemas(s).missing,['CommandExecParams.permissionProfile']);
});
const runtime=async()=>({node:process.execPath,git:'/synthetic/git',readRoots:['/synthetic/tools']});
async function scratch(t){const p=await fs.mkdtemp(path.join(os.tmpdir(),'named-probe-test-'));await fs.writeFile(path.join(p,'keep'),'keep');t.after(()=>fs.rm(p,{recursive:true,force:true}));return p;}
function fake({leak=false,closeFails=false,generation=false,failAt=0,invalid=false,ownDenied=false}={}) {
  let count=0,closed=false;const methods=[];
  const factory=(binary,args,options)=>({
    async request(method,p){
      methods.push(method);assert.ok(['initialize','command/exec'].includes(method));
      if(method==='initialize')return {};
      assert.equal(p.permissionProfile,'temple-continuity-probe');assert.equal(p.sandboxPolicy,undefined);
      assert.ok(p.timeoutMs<=8000);assert.equal(p.env.OPENSSL_CONF,os.devNull);assert.equal(p.env.TMPDIR,path.join(p.cwd,'tmp'));
      count++;if(count===failAt)throw Error('private failure details');
      if(invalid)return {exitCode:'0',stdout:'allowed',stderr:''};
      const values=[ownDenied?'denied':'allowed','allowed','denied','denied',leak?'allowed':'denied','a'.repeat(40),'denied'];
      if(count===2)await fs.writeFile(p.command.at(-1),'written');
      return {exitCode:0,stdout:values[count-1],stderr:''};
    },
    notify(m){methods.push(m);assert.equal(m,'initialized');},
    async close(){closed=true;if(generation){options.onNotification({method:'turn/started'});options.onProtocolError(Error('later error'))}if(closeFails)throw Error('private close details');},
  });
  return {factory,methods,get closed(){return closed}};
}
test('all simulated controls pass without a thread or turn and owned resources are removed',async t=>{
  const root=await scratch(t),f=fake(),r=await probeNamedPermissions({scratchParent:root,providerFactory:f.factory,resolveRuntime:runtime});
  assert.equal(r.status,'bounded-controls-passed');assert.equal(r.transport,'simulated');assert.equal(r.live_ready,false);
  assert.equal(r.model_generation_performed,false);assert.equal(r.server_exit_confirmed,true);assert.equal(r.listener_closed,true);assert.equal(r.scratch_removed,true);
  assert.deepEqual(f.methods,['initialize','initialized',...Array(7).fill('command/exec')]);
  assert.deepEqual(await fs.readdir(root),['keep']);assert.doesNotMatch(JSON.stringify(r),/synthetic-marker|named-probe-test|private failure/);
});
test('symlink escape prevents a passing route despite passing direct-read checks',async t=>{
  const f=fake({leak:true}),r=await probeNamedPermissions({scratchParent:await scratch(t),providerFactory:f.factory,resolveRuntime:runtime});
  assert.equal(r.status,'route-incomplete');assert.equal(r.checks.sibling_read,'denied');assert.equal(r.checks.symlink_read,'allowed');
});
test('unusable positive controls and malformed responses cannot certify isolation',async t=>{
  for(const options of [{ownDenied:true},{invalid:true}]){
    const f=fake(options),r=await probeNamedPermissions({scratchParent:await scratch(t),providerFactory:f.factory,resolveRuntime:runtime});
    assert.equal(r.status,'failed');assert.equal(r.scratch_removed,true);
  }
});
test('first provider failure stops dispatch, redacts raw errors and cleans only owned scratch',async t=>{
  const root=await scratch(t),f=fake({failAt:2}),r=await probeNamedPermissions({scratchParent:root,providerFactory:f.factory,resolveRuntime:runtime});
  assert.equal(r.failure,'provider-or-local-operation-failed');assert.equal(r.last_control,'own_write');
  assert.equal(f.methods.filter(m=>m==='command/exec').length,2);assert.equal(f.closed,true);
  assert.deepEqual(await fs.readdir(root),['keep']);
});
test('uncertain shutdown retains scratch and a late generation signal stays sticky',async t=>{
  const root=await scratch(t),f=fake({closeFails:true,generation:true}),r=await probeNamedPermissions({scratchParent:root,providerFactory:f.factory,resolveRuntime:runtime});
  assert.equal(r.status,'failed');assert.equal(r.model_generation_performed,'unknown');assert.equal(r.failure,'unexpected-generation-event');
  assert.equal(r.cleanup_failure,'server-close-failed');assert.equal(r.server_exit_confirmed,false);assert.equal(r.scratch_removed,false);
  assert.equal(r.listener_closed,true);assert.equal((await fs.readdir(root)).length,2);
});
