import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {runActor} from '../scripts/autonomy-experiment.mjs';
import {disabledFeatures} from '../scripts/continuity-live-runner.mjs';
import {createJsonRpcProcess} from '../src/codex-app-server-provider.mjs';
import {stopDiagnostic} from '../scripts/autonomous-delivery-experiment.mjs';

test('initialize protocol failure with unconfirmed provider shutdown retains stopped ownership',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'temple-initialize-stop-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const runtime={root,readRoots:['/usr/bin'],disabledTools:{mcp_servers:[],plugins:[],apps:[]},environment:{PATH:'/usr/bin',OPENSSL_CONF:'/dev/null'}};
  const error=Object.assign(Error('synthetic-protocol-error'),{protocolDiagnostic:{schema_version:'temple.protocol-diagnostic/v1',reason:'invalid-json',raw_content_retained:false}});
  const result=await runActor(runtime,'No generation',{tokens:1000,ms:1000,providerFactory:(_binary,_args,options)=>({
    request:async()=>{options.onProtocolError(error);throw error;},
    close:async()=>{throw Error('PRIVATE-UNKNOWN-EXIT');}
  })});
  assert.equal(result.generation_requested,false);assert.equal(result.first_stop,'protocol-error');
  assert.equal(result.cleanup_failure,'server-exit-unconfirmed');assert.notEqual(result.server_exit_confirmed,true);
  const active={status:'running',calls:[0],attempts:[{status:'running'}],started_at_ms:0},state={cells:[active],calls:[{result}]};let releases=0;
  await stopDiagnostic(state,Error('actor-or-isolation-failure'),{cleanup:async()=>{releases++;return {status:'released'};}});
  assert.equal(releases,0);assert.equal(active.cleanup.status,'blocked');assert.equal(active.status,'stopped');
  assert.equal(active.attempts[0].status,'stopped');assert.equal(state.failure,'protocol-error');
  assert.doesNotMatch(JSON.stringify(state),/PRIVATE-UNKNOWN-EXIT/);
});

const server=`const readline=require('node:readline'), setup=JSON.parse(process.argv[1]);
const send=m=>process.stdout.write(JSON.stringify(m)+'\\n');
readline.createInterface({input:process.stdin}).on('line',line=>{
 const m=JSON.parse(line),reply=result=>send({id:m.id,result});
 if(m.method==='initialize')return reply({userAgent:'synthetic-replay'});
 if(m.method==='initialized')return;
 if(m.method==='config/read')return reply({config:setup.config});
 if(m.method==='account/read')return reply({account:{type:'chatgpt'}});
 if(m.method==='account/rateLimits/read')return reply({rateLimits:{primary:{usedPercent:0}}});
 if(m.method==='thread/start')return reply({thread:{id:'thread-fixture',turns:[]},model:m.params.model,reasoningEffort:m.params.config.model_reasoning_effort,cwd:setup.root,approvalPolicy:'never',activePermissionProfile:{id:'temple-continuity-probe'},instructionSources:[setup.root+'/AGENTS.md']});
 if(m.method==='turn/start'){
   reply({turn:{id:'turn-fixture'}});
   send({method:'thread/tokenUsage/updated',params:{threadId:'thread-fixture',turnId:'turn-fixture',tokenUsage:{total:{inputTokens:100,cachedInputTokens:50,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}}});
   process.stdout.write('{"private":"SECRET-SENTINEL"\\n');return;
 }
 if(m.method==='turn/interrupt')return reply({});
 if(m.method==='thread/backgroundTerminals/clean')return reply({});
 if(m.method==='thread/backgroundTerminals/list'){
   if(setup.failCleanup)return send({id:m.id,error:{code:-32000,message:'PRIVATE-CLEANUP'}});
   return reply({data:[]});
 }
 throw Error('Unexpected request');
});`;
for(const failCleanup of [false,true])test('actor retains safe parse failure, partial usage and cleanup result: '+failCleanup,async t=>{
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'temple-protocol-actor-')));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const runtime={root,readRoots:['/usr/bin'],disabledTools:{mcp_servers:[],plugins:[],apps:[]},environment:{PATH:'/usr/bin',OPENSSL_CONF:'/dev/null'}};
  const config={features:{...Object.fromEntries(disabledFeatures.map(k=>[k,false])),code_mode_host:true,shell_tool:true,unified_exec:true},
    memories:{use_memories:false,generate_memories:false},web_search:'disabled',shell_environment_policy:{inherit:'none',experimental_use_profile:false,set:runtime.environment},
    mcp_servers:{},plugins:{},apps:{},default_permissions:'temple-continuity-probe',permissions:{'temple-continuity-probe':{network:{enabled:false},filesystem:{':minimal':'read',[root]:'write',[path.join(root,'.git')]:'write','/usr/bin':'read'}}}};
  let child;
  const result=await runActor(runtime,'Synthetic protocol replay only',{tokens:1000,ms:5000,providerFactory:(_binary,_args,options)=>{
    const c=createJsonRpcProcess(process.execPath,['-e',server,JSON.stringify({config,root,failCleanup})],options);child=c.child;return c;
  }});
  assert.equal(result.status,'stopped');assert.equal(result.first_stop,'protocol-error');
  assert.equal(result.protocol_diagnostic.reason,'invalid-json');assert.equal(result.protocol_diagnostic.raw_content_retained,false);
  assert.equal(result.usage.operational_tokens,70);assert.equal(result.usage_status,'incomplete-observation');
  assert.equal(result.server_exit_confirmed,true);assert(child.exitCode!==null||child.signalCode!==null);
  assert.equal(result.terminals_empty,!failCleanup?true:undefined);
  if(failCleanup)assert.equal(result.cleanup_failure,'terminal-cleanup-unconfirmed');
  assert.doesNotMatch(JSON.stringify(result),/SECRET-SENTINEL|PRIVATE-CLEANUP/);
});
