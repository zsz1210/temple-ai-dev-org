import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createContinuityPair,assessContinuityCandidate,referenceQuote} from '../scripts/continuity-fixture.mjs';
import {subprocessEnvironment} from '../scripts/delivery-control-pair.mjs';
import { envelope,matrixConditions,assertContinuityMatrix,disabledFeatures,liveArguments,assertLiveConfiguration,liveRequests,
  assertThreadBoundary,createSubjectLedger,runContinuitySubject,isolatedOracleExecutor,runApprovedContinuity,continuityAssessmentDecision } from '../scripts/continuity-live-runner.mjs';
const subject={root:'/fixture/actor',arm:'temple',itemId:'WI-0001',agentId:'agent-builder'};
const runtime={root:subject.root,binary:'/provider/codex',readRoots:['/runtime/node','/runtime/git','/runtime/temple'],
  environment:{PATH:'/runtime/node:/runtime/git:/usr/bin:/bin',OPENSSL_CONF:'/dev/null'},
  disabledTools:{mcp_servers:[],plugins:[],apps:[]},disabledSkills:[]};
const config=()=>({config:{features:{...Object.fromEntries(disabledFeatures.map(k=>[k,false])),code_mode_host:true,shell_tool:true,unified_exec:true},web_search:'disabled',
  memories:{use_memories:false,generate_memories:false},shell_environment_policy:{inherit:'none',experimental_use_profile:false,set:runtime.environment},
  mcp_servers:{},plugins:{},apps:{_default:{enabled:false}},default_permissions:'temple-continuity-probe',
  permissions:{'temple-continuity-probe':{filesystem:{':minimal':'read',[subject.root]:'write',[subject.root+'/.git']:'write',
    ...Object.fromEntries(runtime.readRoots.map(p=>[p,'read'])),glob_scan_max_depth:null},network:{enabled:false}}}}});
const reply=()=>({thread:{id:'thread',turns:[]},model:envelope.model,reasoningEffort:envelope.effort,cwd:subject.root,
  approvalPolicy:'never',activePermissionProfile:{id:'temple-continuity-probe',extends:null},instructionSources:[subject.root+'/AGENTS.md']});
const usage=(input=100,cached=25,output=20)=>({method:'thread/tokenUsage/updated',params:{threadId:'thread',turnId:'turn',tokenUsage:{total:{inputTokens:input,cachedInputTokens:cached,outputTokens:output,reasoningOutputTokens:0,totalTokens:input+output}}}});
const terminal={method:'turn/completed',params:{threadId:'thread',turn:{id:'turn',status:'completed'}}};
test('continuity live requests use named permissions and explicit fixed resource authority',()=>{
  const r=liveRequests(subject);assert.equal(r.thread.permissions,r.turn.permissions);assert.equal(r.thread.sandbox,undefined);assert.equal(r.turn.sandboxPolicy,undefined);
  assert.equal(r.thread.allowProviderModelFallback,false);assert.equal(r.thread.ephemeral,true);assert.equal(r.turn.model,'gpt-5.6-terra');
  assert.equal(r.turn.effort,'medium');assert.equal(envelope.subjects,4);assert.equal(envelope.total_tokens,400000);
  assert.equal(envelope.total_ms,2400000);assert.equal(envelope.retries,0);assert.equal(envelope.reset,false);
  const a=liveArguments(runtime);assert.ok(a.includes('web_search="disabled"'));assert.ok(a.includes('shell_environment_policy.inherit="none"'));
  assert.throws(()=>liveArguments({...runtime,disabledTools:{...runtime.disabledTools,mcp_servers:['bad.key']}}),/unsupported-inherited/);
});
test('minimum matrix binds both conditions, counterbalanced arms and exact fixture roots',()=>{
  assert.deepEqual(matrixConditions,['stable','changed-spec']);
  const pairs=matrixConditions.map((state,i)=>({arms:{ordinary:{root:`/fixture/p${i}/ordinary`},temple:{root:`/fixture/p${i}/temple`}}}));
  const subjects=matrixConditions.flatMap((state,i)=>(i%2?['temple','ordinary']:['ordinary','temple']).map(arm=>({state,arm,pair:i+1,root:pairs[i].arms[arm].root})));
  const protocol={pairs,subjects};assert.doesNotThrow(()=>assertContinuityMatrix(protocol));
  for(const mutate of [p=>p.subjects.push(p.subjects[0]),p=>p.pairs.pop(),p=>p.subjects[0].arm='temple',
    p=>p.subjects[2].state='stable',p=>p.subjects[0].pair=2,p=>p.subjects[0].root='/other']) {
    const p=structuredClone(protocol);mutate(p);assert.throws(()=>assertContinuityMatrix(p),/matrix-(size|layout)/);
  }
});
test('continuity checks the full effective permission map without treating null metadata as a grant',()=>{
  assert.equal(assertLiveConfiguration(config(),runtime),true);
  for(const change of [c=>{c.config.permissions['temple-continuity-probe'].filesystem['/secret']='read'},c=>{c.config.features.code_mode_host=false},c=>{c.config.features.browser_use=true},c=>{c.config.mcp_servers.x={enabled:true}},c=>{c.config.shell_environment_policy.inherit='all'}]) {
    const c=config();change(c);assert.throws(()=>assertLiveConfiguration(c,runtime));
  }
  assertThreadBoundary(reply(),subject);const r=reply();r.instructionSources.push('/other/AGENTS.md');assert.throws(()=>assertThreadBoundary(r,subject),/external-native/);
});
test('continuity first stop persists while trailing usage is retained',()=>{
  const l=createSubjectLedger({threadId:'thread',turnId:'turn',remainingTokens:50,deadline:100,now:()=>0});
  l.accept(usage());assert.equal(l.state.first_stop,'token-limit');l.accept(terminal);l.accept(usage(120,25,25));
  assert.equal(l.state.usage.operational_tokens,120);assert.equal(l.state.first_stop,'token-limit');assert.equal(l.state.status,'stopped');
});
test('continuity rejects inconsistent, regressing, unrelated and missing observation contracts',()=>{
  for(const event of [usage(1,2,1),{...usage(),params:{...usage().params,threadId:'other'}},
    {method:'item/started',params:{threadId:'thread',turnId:'turn',item:{type:'mcpToolCall'}}}]) {
    const l=createSubjectLedger({threadId:'thread',turnId:'turn',remainingTokens:1000,deadline:100,now:()=>0});l.accept(event);assert.ok(l.state.first_stop);
  }
  const l=createSubjectLedger({threadId:'thread',turnId:'turn',remainingTokens:1000,deadline:100,now:()=>0});l.accept(usage());l.accept(usage(90));assert.equal(l.state.first_stop,'usage-regression');
});
function factory({withUsage=true,cleanupFails=false,reroute=false,lateUsage=false,invalidLateUsage=false,native=true,blocked=false,cancel=null,deferredStart=false,overBudget=false}={}) {
  const calls=[];let closed=false;
  return {calls,get closed(){return closed},provider:(binary,args,options)=>({notify(){},async close(){closed=true},async request(method){
    calls.push(method);
    if(method==='initialize')return {};
    if(method==='config/read')return config();
    if(method==='account/read')return {account:{type:'chatgpt'}};
    if(method==='account/rateLimits/read')return {rateLimits:{primary:{usedPercent:10}}};
    if(method==='thread/start')return reply();
    if(method==='turn/interrupt'){options.onNotification({...terminal,params:{...terminal.params,turn:{id:'turn',status:'interrupted'}}});return {};}
    if(method==='thread/backgroundTerminals/list')return {data:[],nextCursor:null};
    if(method==='thread/backgroundTerminals/clean'){
      if(lateUsage)options.onNotification(usage());if(invalidLateUsage)options.onNotification(usage(1,2,1));
      if(cleanupFails)throw Error('uncertain');return {}};
    if(method==='turn/start') {
      queueMicrotask(()=>{
        if(cancel)cancel();
        if(reroute)options.onNotification({method:'model/rerouted',params:{}});
        if(withUsage)options.onNotification(overBudget?usage(2000):usage());
        if(deferredStart)return;
        if(native)for(const method of ['item/started','item/completed'])options.onNotification({method,params:{threadId:'thread',turnId:'turn',item:{id:'command-1',type:'commandExecution',command:'node --test test/*.test.mjs',cwd:subject.root,exitCode:method==='item/completed'?0:null}}});
        options.onNotification({method:'item/completed',params:{threadId:'thread',turnId:'turn',item:{type:'agentMessage',text:JSON.stringify({candidate_revision:blocked?null:'a'.repeat(40),test_command:blocked?'':'node --test test/*.test.mjs',test_exit_code:blocked?null:0,completed:'Synthetic result',blockers:blocked?['Tools unavailable']:[],next_owner:'quality_evaluator',not_performed:['Independent QA and Release Gate']})}}});
        options.onNotification(terminal);
      });return deferredStart?new Promise(()=>{}):{turn:{id:'turn'}};
    }
    throw Error('unexpected mock method');
  }})};
}
const options=f=>({remainingTokens:1000,deadline:Date.now()+10000,schemas:{ThreadStartParams:{},TurnStartParams:{}},providerFactory:f.provider});
test('direct native dispatch is closed and cancelled batches cannot consume approval',async()=>{
  const c=new AbortController();c.abort();
  await assert.rejects(()=>runApprovedContinuity('/does-not-exist','not-an-approval',{signal:c.signal}),/operator-cancelled/);
  await assert.rejects(()=>runContinuitySubject(subject,runtime,{remainingTokens:1000,deadline:Date.now()+10000,schemas:{}}),/native-tool-route-unqualified/);
});
test('retired protocols cannot consume approval under the new delivery contract',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'continuity-retired-test-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  for(const version of ['continuity-approved/v1','continuity-approved/v2','continuity-approved/v3']) {
    await fs.writeFile(path.join(lab,'protocol.json'),JSON.stringify({version}));
    await assert.rejects(()=>runApprovedContinuity(lab,'retired'),/frozen-protocol-mismatch/);
  }
  assert.deepEqual(await fs.readdir(lab),['protocol.json']);
});

test('live continuation uses shared typed decisions and never overrides runtime validity',()=>{
  const good={status:'completed',usage_status:'observed-completed-turn',server_exit_confirmed:true,terminals_empty:true,
    usage:{operational_tokens:10},oracle:{reason:'accepted'},accepted:true};
  const policy={product_failure:true,local_invalid:false};
  assert.deepEqual(continuityAssessmentDecision(good,policy),{outcome:'passed',stop:null});
  for(const reason of ['product-mismatch','regression-failed','oracle-process-failed','accepted']) {
    const failed={...good,accepted:false,oracle:{reason}};
    assert.deepEqual(continuityAssessmentDecision(failed,policy),{outcome:'product-failure',stop:null});
    assert.equal(continuityAssessmentDecision(failed,{product_failure:false}).stop,'continuation-not-authorized');
  }
  for(const patch of [{status:'stopped'},{usage_status:'unknown'},{server_exit_confirmed:false},{terminals_empty:false},
    {usage:null},{usage:{operational_tokens:NaN}},...['oracle-input-mutated','candidate-not-current','delivery-source-drift',
      'delivery-record-invalid','oracle-instrument-failure'].map(reason=>({oracle:{reason}}))])
    assert.equal(continuityAssessmentDecision({...good,...patch},policy).stop,'shared-validity-unconfirmed');
});
test('cancellation interrupts an observed turn even when turn/start response never arrives',async()=>{
  const c=new AbortController(),f=factory({cancel:()=>c.abort(),deferredStart:true});
  const start=Date.now(),r=await runContinuitySubject(subject,runtime,{...options(f),signal:c.signal});
  assert.equal(r.first_stop,'operator-cancelled');assert.equal(r.usage.operational_tokens,95);
  assert.equal(r.interrupt_requested,true);assert.equal(r.terminals_empty,true);assert.equal(f.closed,true);
  assert.equal(f.calls.filter(x=>x==='turn/interrupt').length,1);assert.ok(Date.now()-start<7000);
});
test('native guards remain active before a delayed turn/start reply without operator intervention',async()=>{
  for(const [params,reason] of [[{overBudget:true},'token-limit'],[{reroute:true},'model-rerouted']]) {
    const f=factory({...params,deferredStart:true}),r=await runContinuitySubject(subject,runtime,options(f));
    assert.equal(r.first_stop,reason);assert.equal(r.interrupt_requested,true);assert.ok(r.usage);
    assert.equal(r.terminals_empty,true);assert.equal(f.calls.filter(x=>x==='turn/start').length,1);
  }
});
test('native dispatch absence and honest blocked results stop after exactly one turn',async()=>{
  for(const [params,reason] of [[{native:false},'native-execution-unobserved'],[{blocked:true},'actor-blocked']]) {
    const f=factory(params),r=await runContinuitySubject(subject,runtime,options(f));
    assert.equal(r.status,'stopped');assert.equal(r.first_stop,reason);assert.ok(r.completion);
    assert.equal(f.calls.filter(x=>x==='turn/start').length,1);assert.equal(r.terminals_empty,true);
  }
});
test('operator cancellation handles pre-launch and turn-start response races without another turn',async()=>{
  const c=new AbortController();c.abort();const f=factory();
  const r=await runContinuitySubject(subject,runtime,{...options(f),signal:c.signal});
  assert.equal(r.first_stop,'operator-cancelled');assert.equal(f.calls.length,0);
  const d=new AbortController(),g=factory({cancel:()=>d.abort()});
  const s=await runContinuitySubject(subject,runtime,{...options(g),signal:d.signal});
  assert.equal(s.first_stop,'operator-cancelled');assert.equal(g.calls.filter(x=>x==='turn/start').length,1);
  assert.equal(s.usage.operational_tokens,95);assert.equal(s.terminals_empty,true);
});
test('continuity subject correlates queued events and cleans its own terminals and provider',async()=>{
  const f=factory();const r=await runContinuitySubject(subject,runtime,options(f));
  assert.equal(r.status,'completed');assert.equal(r.usage.operational_tokens,95);assert.equal(r.terminals_empty,true);assert.equal(f.closed,true);
  assert.equal(f.calls.filter(x=>x==='turn/start').length,1);
  assert.equal(r.command_observations.completed_items,1);assert.equal(r.command_observations.categories.testing,1);
  assert.equal(r.command_observations.output_unavailable,1);assert.equal(r.request_bytes.native_context_bytes,null);
});
test('continuity missing usage, reroute and cleanup uncertainty stop without another model request',async()=>{
  for(const params of [{withUsage:false},{cleanupFails:true},{reroute:true}]) {
    const f=factory(params);const r=await runContinuitySubject(subject,runtime,options(f));
    assert.equal(r.status,'stopped');assert.ok(r.first_stop);assert.equal(f.closed,true);assert.equal(f.calls.filter(x=>x==='turn/start').length,1);
  }
});
test('continuity accepts completion-before-usage and labels invalid trailing usage incomplete',async()=>{
  const f=factory({withUsage:false,lateUsage:true});const complete=await runContinuitySubject(subject,runtime,options(f));
  assert.equal(complete.status,'completed');assert.equal(complete.usage_status,'observed-completed-turn');
  const g=factory({invalidLateUsage:true});const partial=await runContinuitySubject(subject,runtime,options(g));
  assert.equal(partial.first_stop,'invalid-usage');assert.equal(partial.usage.operational_tokens,95);assert.equal(partial.usage_status,'incomplete-observation');
  const h=factory({invalidLateUsage:true,cleanupFails:true});const compound=await runContinuitySubject(subject,runtime,options(h));
  assert.equal(compound.first_stop,'invalid-usage');assert.equal(compound.cleanup_failure,'terminal-cleanup-unconfirmed');
});
test('continuity oracle marks infrastructure errors and preserves first failure on uncertain cleanup',async()=>{
  const providerFactory=()=>({notify(){},async request(method){return method==='config/read'?{config:{}}:{}},async close(){throw Error('failed')}});
  await assert.rejects(()=>isolatedOracleExecutor(runtime,subject.root,'/node',[],{timeout:10,maxBuffer:100},{providerFactory}),e=>{
    assert.equal(e.instrumentFailure,true);assert.equal(e.retainScratch,true);assert.equal(e.message,'effective-feature-isolation');
    assert.equal(e.cleanupFailure,'oracle-cleanup-unconfirmed');return true;
  });
});
test('continuity fixture retains only owned oracle scratch after executor shutdown uncertainty',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'continuity-executor-test-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  const checkpoint=await createContinuityPair(path.join(lab,'pair'),'stable'),root=checkpoint.arms.ordinary.root;
  await fs.writeFile(path.join(root,'quote.mjs'),referenceQuote(3000));
  const git=args=>{const r=spawnSync('git',args,{cwd:root,env:subprocessEnvironment(),encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim()};
  git(['add','quote.mjs']);git(['-c','core.hooksPath=/dev/null','-c','commit.gpgsign=false','commit','-qm','synthetic candidate']);
  const candidateExecutor=async()=>{const e=Error('oracle-cleanup-unconfirmed');e.retainScratch=true;e.instrumentFailure=true;throw e};
  await assert.rejects(()=>assessContinuityCandidate(root,checkpoint,'ordinary',git(['rev-parse','HEAD']),{scratchParent:lab,candidateExecutor}),/oracle-cleanup/);
  const remaining=(await fs.readdir(lab)).filter(n=>n.startsWith('continuity-oracle-'));
  assert.equal(remaining.length,1);assert.ok((await fs.stat(path.join(lab,remaining[0],'quote.mjs'))).isFile());
});
