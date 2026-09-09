import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runInterruptedActor, interruptionAccountingSupport} from '../scripts/interruption-actor.mjs';
import {disabledFeatures} from '../scripts/continuity-live-runner.mjs';
import {bufferedBudget,bufferedFaults,cleanCellBudgetStop} from '../scripts/lean-interruption-budget.mjs';

const privateBody='PRIVATE REASONING OR TOOL BODY MUST NOT BE RETAINED';
const usage = (input=100, output=20) => ({tokenUsage:{total:{inputTokens:input,cachedInputTokens:10,outputTokens:output,reasoningOutputTokens:5,totalTokens:input+output}}});
const terminal = status => ({turn:{id:'turn-1',status,items:[{type:'reasoning',text:privateBody}]}});

async function fixture(t, behavior={}) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'temple-interrupt-test-'));
  t.after(() => fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(path.join(root,'src'));
  await fs.writeFile(path.join(root,'src/product.mjs'),'export const partial = true;\n');
  const runtime={root,binary:'offline-only',readRoots:['/usr/bin'],disabledTools:{mcp_servers:[],plugins:[],apps:[]},environment:{PATH:'/usr/bin:/bin',OPENSSL_CONF:'/dev/null'}};
  const profile='temple-continuity-probe';
  const config={
    features:{...Object.fromEntries(disabledFeatures.map(key => [key,false])),code_mode_host:true,shell_tool:true,unified_exec:true},
    web_search:'disabled',memories:{use_memories:false,generate_memories:false},
    shell_environment_policy:{inherit:'none',experimental_use_profile:false,set:runtime.environment},
    mcp_servers:{},plugins:{},apps:{},default_permissions:profile,
    permissions:{[profile]:{network:{enabled:false},filesystem:{':minimal':'read',[root]:'write',[path.join(root,'.git')]:'write','/usr/bin':'read'}}}
  };
  const calls=[];
  let hooks, closeCount=0, factoryCount=0;
  const emit=(method, params={}) => hooks.onNotification({method,params:{threadId:'thread-1',turnId:'turn-1',...params}});
  const patch=(id='patch-1', status='completed', file='src/product.mjs') => {
    const item={id,type:'fileChange',status,changes:[{path:file,kind:{type:'update'},diff:privateBody}]};
    emit('item/started',{item:{...item,status:'inProgress'}});
    emit('item/completed',{item});
  };
  const providerFactory=(_binary,_args, options) => {
    factoryCount++; hooks=options;
    return {
      notify(method) { calls.push(method); },
      async request(method,params) {
        calls.push(method);
        if (behavior.failMethod === method) throw Error(privateBody);
        switch (method) {
          case 'initialize': return {};
          case 'config/read': return {config};
          case 'account/read': return {account:{type:'chatgpt'}};
          case 'account/rateLimits/read': return {rateLimits:{primary:{usedPercent:behavior.capacity ?? 30}}};
          case 'thread/start': return {thread:{id:'thread-1',turns:[]},model:behavior.model ?? params.model,reasoningEffort:params.config.model_reasoning_effort,cwd:root,approvalPolicy:'never',activePermissionProfile:{id:profile},instructionSources:[path.join(root,'AGENTS.md')]};
          case 'turn/start':
            queueMicrotask(() => {
              emit('turn/started',{turn:{id:'turn-1',status:'inProgress'}});
              if (behavior.start) behavior.start({emit,patch,hooks});
              else { emit('thread/tokenUsage/updated',usage()); patch(); }
            });
            return {turn:{id:'turn-1',status:'inProgress'}};
          case 'turn/interrupt':
            assert.deepEqual(params,{threadId:'thread-1',turnId:'turn-1'});
            if (behavior.interrupt) await behavior.interrupt({emit,patch});
            else emit('turn/completed',terminal('interrupted'));
            return {};
          case 'thread/backgroundTerminals/clean':
            if (behavior.clean) behavior.clean({emit});
            return {};
          case 'thread/backgroundTerminals/list': return {data:behavior.terminals ?? [],nextCursor:null};
          default: throw Error('unexpected method '+method);
        }
      },
      async close() { closeCount++; if (behavior.closeFailure) throw Error(privateBody); }
    };
  };
  return {runtime,calls,emit,patch,providerFactory,factoryCount:() => factoryCount,closeCount:() => closeCount,
    run:options => runInterruptedActor(runtime,'Public bounded prompt',{tokens:20000,ms:1000,qualificationProbe:true,providerFactory,...options})};
}

test('unsupported accounting blocks before provider creation without explicit qualification', async t => {
  const f=await fixture(t);
  const result=await f.run({qualificationProbe:false});
  assert.equal(f.factoryCount(),0);
  assert.equal(result.generation_requested,false);
  assert.equal(result.first_stop,'interrupted-final-usage-unobservable');
  assert.equal(interruptionAccountingSupport().complete_accounting,false);
});

test('qualification ceiling is enforced before any provider activity', async t => {
  const f=await fixture(t);
  for (const options of [{tokens:20001},{tokens:0},{ms:120001},{ms:0}]) {
    assert.equal((await f.run(options)).first_stop,'qualification-budget-invalid');
  }
  assert.equal(f.factoryCount(),0);
});

test('explicit buffered experiment survives both old diagnostic and soft thresholds until a durable edit',async t=>{
  const f=await fixture(t,{start:({emit,patch})=>{emit('thread/tokenUsage/updated',usage(160000,20));patch();}});
  const observations=[];
  const result=await f.run({qualificationProbe:false,experimentBudget:bufferedBudget,tokens:180000,ms:580000,onProgress:u=>observations.push(u)});
  assert.equal(result.first_stop,'interrupted-final-usage-unobservable');
  assert.equal(result.interruption.intentional,true);assert.equal(result.interruption.terminal_confirmed,true);
  assert.ok(observations.at(-1).operational_tokens>bufferedBudget.phases.initial.expected_tokens);
  assert.equal(result.budget_mode,bufferedBudget.id);assert.equal(f.calls.filter(c=>c==='turn/interrupt').length,1);
});
test('buffered experiment enforces its stop threshold and reserves cannot expand a diagnostic',async t=>{
  const f=await fixture(t,{start:({emit})=>emit('thread/tokenUsage/updated',usage(180000,20))});
  const result=await f.run({qualificationProbe:false,experimentBudget:bufferedBudget,tokens:180000,ms:580000});
  assert.equal(result.first_stop,'token-limit');assert.equal(result.interruption.intentional,false);assert.equal(result.interruption.terminal_confirmed,true);
  const invalid=await fixture(t);
  for(const options of [
    {qualificationProbe:true,experimentBudget:bufferedBudget,tokens:180000,ms:580000},
    {qualificationProbe:false,experimentBudget:bufferedBudget,tokens:200000,ms:580000},
    {qualificationProbe:false,experimentBudget:bufferedBudget,tokens:180000,ms:600000},
    {qualificationProbe:false,experimentBudget:{...bufferedBudget,cell_tokens:999999},tokens:180000,ms:580000},
    {qualificationProbe:false,experimentBudget:{...bufferedBudget,phases:{...bufferedBudget.phases,initial:{...bufferedBudget.phases.initial,notification_tokens:0}}},tokens:180000,ms:580000}
  ])assert.equal((await invalid.run(options)).first_stop,'experiment-budget-invalid');
  assert.equal(invalid.factoryCount(),0);
});

test('fault after a budget stop is retained and vetoes the next arm despite confirmed cleanup',async t=>{
  for(const later of ['event-correlation','model-changed','protocol-error']){
    const f=await fixture(t,{start:({emit,hooks})=>{
      emit('thread/tokenUsage/updated',usage(180000,20));
      if(later==='event-correlation')emit('thread/tokenUsage/updated',{...usage(180001,20),threadId:'wrong-thread'});
      else if(later==='model-changed')emit('model/rerouted',{});
      else hooks.onProtocolError();
    }});
    const c=await f.run({qualificationProbe:false,experimentBudget:bufferedBudget,tokens:180000,ms:580000});
    c.budget={stage:'initial',...bufferedBudget.phases.initial};
    assert.equal(c.first_stop,'token-limit');assert.deepEqual(c.stop_reasons,['token-limit',later]);
    assert.equal(c.terminals_empty,true);assert.equal(c.interruption.terminal_confirmed,true);
    const r={status:'stopped',underlying_stop:'token-limit',turns:[c],qa:[]};
    assert.deepEqual(bufferedFaults(r),[later]);assert.equal(cleanCellBudgetStop(r),false);
  }
});

test('non-Boolean qualification values never create a provider or request generation', async t => {
  const f=await fixture(t);
  for(const qualificationProbe of ['false','true',1,{},[],null]) {
    const result=await f.run({qualificationProbe});
    assert.equal(result.generation_requested,false);
    assert.equal(result.first_stop,'interrupted-final-usage-unobservable');
  }
  assert.equal(f.factoryCount(),0);
});

test('contradictory or missing canonical terminal IDs cannot confirm interruption', async t => {
  for(const turn of [{id:'other-turn',status:'interrupted'},{status:'interrupted'}]) {
    const f=await fixture(t,{interrupt:({emit})=>emit('turn/completed',{turnId:'turn-1',turn})});
    const result=await f.run();
    assert.equal(result.first_stop,'event-correlation');
    assert.equal(result.interruption.terminal_confirmed,false);
    assert.equal(result.complete_accounting,false);
    assert.equal(result.server_exit_confirmed,true);
  }
});

test('ordered durable trigger interrupts once, retains lower bound, and confirms exact cleanup', async t => {
  const f=await fixture(t);
  const progress=[],generation=[];
  const result=await f.run({beforeGeneration:metadata => generation.push(metadata),onProgress:metadata => progress.push(metadata)});
  assert.equal(result.status,'stopped');
  assert.equal(result.first_stop,'interrupted-final-usage-unobservable');
  assert.equal(result.interruption.intentional,true);
  assert.equal(result.interruption.acknowledged,true);
  assert.equal(result.interruption.terminal_confirmed,true);
  assert.equal(result.interruption.trigger.files[0].sha256.length,64);
  assert.equal(result.usage_status,'observed-lower-bound');
  assert.equal(result.usage.operational_tokens,110);
  assert.equal(result.complete_accounting,false);
  assert.equal(result.terminals_empty,true);
  assert.equal(result.server_exit_confirmed,true);
  assert.equal(f.closeCount(),1);
  assert.equal(f.calls.filter(value => value === 'turn/interrupt').length,1);
  assert.ok(f.calls.indexOf('thread/backgroundTerminals/clean') > f.calls.indexOf('turn/interrupt'));
  assert.equal(generation.length,1);
  assert.equal(progress[0].complete_accounting,false);
  assert.ok(!JSON.stringify(result).includes(privateBody));
  assert.ok(!JSON.stringify(generation).includes('Public bounded prompt'));
  assert.equal(await fs.readFile(path.join(f.runtime.root,'src/product.mjs'),'utf8'),'export const partial = true;\n');
});

test('late counter during terminal cleanup remains a lower bound', async t => {
  const f=await fixture(t,{clean:({emit}) => emit('thread/tokenUsage/updated',usage(150,40))});
  const result=await f.run();
  assert.equal(result.usage.operational_tokens,180);
  assert.equal(result.events.findLast(event => event.kind === 'usage-observed').after_terminal,true);
  assert.equal(result.complete_accounting,false);
  assert.equal(result.usage_status,'observed-lower-bound');
});

test('missing counters stay unknown even with acknowledged interrupted terminal', async t => {
  const f=await fixture(t,{start:({patch}) => patch()});
  const result=await f.run();
  assert.equal(result.interruption.terminal_confirmed,true);
  assert.equal(result.usage,null);
  assert.equal(result.observed_lower_bound,null);
  assert.equal(result.usage_status,'unknown');
  assert.equal(result.complete_accounting,false);
});

test('failed patches are skipped and first selected successful patch alone triggers', async t => {
  const f=await fixture(t,{start:({patch,emit}) => { emit('thread/tokenUsage/updated',usage()); patch('failed','failed'); patch('one'); patch('two'); }});
  const seen=[];
  const result=await f.run({shouldInterrupt:async metadata => { seen.push(metadata); return true; }});
  assert.deepEqual(seen.map(value => value.item_id),['one']);
  assert.equal(result.interruption.trigger.item_id,'one');
  assert.ok(!JSON.stringify(seen).includes(privateBody));
  assert.equal(f.calls.filter(value => value === 'turn/interrupt').length,1);
});

test('completion before an asynchronous trigger is not an intentional interruption', async t => {
  let release;
  const pending=new Promise(resolve => { release=resolve; });
  const f=await fixture(t);
  const result=await f.run({shouldInterrupt:async () => { f.emit('turn/completed',terminal('completed')); await pending; return true; }});
  release(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(result.first_stop,'completed-before-interrupt');
  assert.equal(result.interruption.requested,false);
  assert.equal(result.interruption.trigger,null);
  assert.ok(!f.calls.includes('turn/interrupt'));
  assert.equal(result.complete_accounting,false);
});

test('completed terminal racing interrupt acknowledgement cannot qualify', async t => {
  const f=await fixture(t,{interrupt:({emit}) => emit('turn/completed',terminal('completed'))});
  const result=await f.run();
  assert.equal(result.interruption.acknowledged,true);
  assert.equal(result.interruption.terminal_confirmed,false);
  assert.equal(result.first_stop,'interrupt-race-completed');
  assert.equal(result.complete_accounting,false);
});

test('correlation, invalid and regressing counters stop with cleanup and retained valid lower bound', async t => {
  for (const [failure,params] of [['event-correlation',{...usage(),turnId:'other-turn'}],['usage-regression',usage(90,20)],['invalid-usage',{tokenUsage:{total:{inputTokens:1}}}]]) {
    const f=await fixture(t,{start:({emit}) => { emit('thread/tokenUsage/updated',usage()); emit('thread/tokenUsage/updated',params); }});
    const result=await f.run();
    assert.equal(result.first_stop,failure);
    assert.equal(result.usage.operational_tokens,110);
    assert.equal(result.terminals_empty,true);
    assert.equal(result.server_exit_confirmed,true);
    assert.equal(result.interruption.intentional,false);
  }
});

test('unstarted file-change completion is refused', async t => {
  const f=await fixture(t,{start:({emit}) => emit('item/completed',{item:{id:'orphan',type:'fileChange',status:'completed',changes:[]}})});
  const result=await f.run();
  assert.equal(result.first_stop,'item-correlation');
  assert.equal(result.interruption.trigger,null);
});

test('missing durable file refuses trigger and performs safety interruption', async t => {
  const f=await fixture(t,{start:({patch}) => patch('missing','completed','src/missing.mjs')});
  const result=await f.run();
  assert.equal(result.first_stop,'interruption-trigger-failed');
  assert.equal(result.interruption.trigger,null);
  assert.equal(result.interruption.intentional,false);
});

test('capacity and model boundaries reject before generation', async t => {
  for (const [behavior,failure] of [[{capacity:100},'subscription-capacity-unavailable'],[{model:'unexpected'},'effective-model-mismatch']]) {
    const f=await fixture(t,behavior);
    const result=await f.run();
    assert.equal(result.first_stop,failure);
    assert.equal(result.generation_requested,false);
    assert.ok(!f.calls.includes('turn/start'));
    assert.equal(f.closeCount(),1);
  }
});

test('beforeGeneration failure cannot request a model turn or retain exception bodies', async t => {
  const f=await fixture(t);
  const result=await f.run({beforeGeneration:() => { throw Error(privateBody); }});
  assert.equal(result.generation_requested,false);
  assert.ok(!f.calls.includes('turn/start'));
  assert.ok(!JSON.stringify(result).includes(privateBody));
  assert.equal(f.closeCount(),1);
});

test('terminal-cleanup and server-close failures stay explicit', async t => {
  for (const [behavior,failure] of [[{terminals:[{id:'leftover'}]},'terminal-cleanup-unconfirmed'],[{failMethod:'thread/backgroundTerminals/clean'},'terminal-cleanup-unconfirmed'],[{closeFailure:true},'server-exit-unconfirmed']]) {
    const f=await fixture(t,behavior);
    const result=await f.run();
    assert.equal(result.cleanup_failure,failure);
    assert.equal(result.first_stop,'cleanup-unconfirmed');
    assert.equal(result.complete_accounting,false);
    assert.equal(f.closeCount(),1);
    assert.ok(!JSON.stringify(result).includes(privateBody));
  }
});

test('rejected interrupt with independently observed terminal is still unconfirmed', async t => {
  const f=await fixture(t,{interrupt:({emit}) => { emit('turn/completed',terminal('interrupted')); throw Error(privateBody); }});
  const result=await f.run();
  assert.equal(result.interruption.terminal_confirmed,true);
  assert.equal(result.interruption.acknowledged,false);
  assert.equal(result.interrupt_unconfirmed,true);
  assert.equal(result.first_stop,'interrupt-unconfirmed');
  assert.equal(f.closeCount(),1);
});

test('acknowledgement before delayed interrupted terminal waits before cleaning', async t => {
  const f=await fixture(t,{interrupt:({emit}) => { setImmediate(() => emit('turn/completed',terminal('interrupted'))); }});
  const result=await f.run();
  const kinds=result.events.map(event => event.kind);
  assert.ok(kinds.indexOf('interrupt-acknowledged') < kinds.indexOf('turn-terminal'));
  assert.ok(kinds.indexOf('turn-terminal') < kinds.indexOf('terminals-empty'));
  assert.equal(result.interruption.terminal_confirmed,true);
  assert.equal(result.complete_accounting,false);
});

test('acknowledgement alone never proves interruption and missing terminal is explicit', async t => {
  const f=await fixture(t,{interrupt:() => {}});
  const result=await f.run({ms:10});
  assert.equal(result.interruption.acknowledged,true);
  assert.equal(result.interruption.terminal_confirmed,false);
  assert.equal(result.interruption.terminal_unconfirmed,true);
  assert.equal(result.first_stop,'time-limit');
  assert.equal(result.terminals_empty,true);
  assert.equal(result.server_exit_confirmed,true);
  assert.equal(result.complete_accounting,false);
});

test('out-of-root and symlink changes never become durable product triggers', async t => {
  const outside=await fixture(t,{start:({patch}) => patch('outside','completed','../outside.mjs')});
  assert.equal((await outside.run()).first_stop,'file-change-outside-root');
  const symlink=await fixture(t);
  await fs.unlink(path.join(symlink.runtime.root,'src/product.mjs'));
  await fs.symlink('/etc/hosts',path.join(symlink.runtime.root,'src/product.mjs'));
  const result=await symlink.run();
  assert.equal(result.first_stop,'interruption-trigger-failed');
  assert.equal(result.interruption.trigger,null);
  assert.equal(result.interruption.intentional,false);
});

test('usage budget stops safely without selecting a product trigger', async t => {
  const f=await fixture(t);
  const result=await f.run({tokens:110});
  assert.equal(result.first_stop,'token-limit');
  assert.equal(result.interruption.intentional,false);
  assert.equal(result.interruption.trigger,null);
  assert.equal(result.observed_lower_bound.operational_tokens,110);
});
