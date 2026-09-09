import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fixtures} from '../scripts/autonomy-fixtures.mjs';
import {usageUpdate,nextAction,scopeChanges,promptFor,fatal,acquireRun,limits,experimentCells,actorSettings,validateExperiment,assertActorBoundary} from '../scripts/autonomy-experiment.mjs';

test('model-specific actor boundary keeps permissions, fresh context and native instruction isolation enforced',()=>{
  const expected={model:'gpt-6-astra',effort:'medium'},root='/synthetic/task';
  const reply={model:expected.model,reasoningEffort:expected.effort,cwd:root,thread:{turns:[]},approvalPolicy:'never',activePermissionProfile:{id:'temple-continuity-probe'},instructionSources:[root+'/AGENTS.md']};
  assert.doesNotThrow(()=>assertActorBoundary(reply,root,expected));
  assert.throws(()=>assertActorBoundary(reply,root,{model:'gpt-5.6-terra',effort:'medium'}),/model-mismatch/);
  for(const change of [{model:'gpt-5.6-terra'},{reasoningEffort:'high'},{approvalPolicy:'on-request'},{activePermissionProfile:{id:'temple-continuity-probe',extends:'broad'}},{activePermissionProfile:{id:'other'}},{cwd:'/other'},{thread:{turns:[{}]}},{instructionSources:[root+'/AGENTS.md','/outside/AGENTS.md']},{instructionSources:[]}])assert.throws(()=>assertActorBoundary({...reply,...change},root,expected));
});

test('GPT-6 extension selects only matched tasks and preserves executor on repair while QA stays Terra',()=>{
  const cells=experimentCells('gpt6-autonomous-v1');
  assert.deepEqual(cells.map(c=>[c.id,c.task,c.arm]),[['small-C','small','B'],['feature-C','feature','B']]);
  for(const cell of cells){
    for(const stage of ['autonomous','repair'])assert.deepEqual(actorSettings(cell,stage),{model:'gpt-6-astra',effort:'medium'});
    assert.deepEqual(actorSettings(cell,'qa'),{model:'gpt-5.6-terra',effort:'medium'});
    assert.equal(promptFor(cell.arm,'autonomous'),promptFor('B','autonomous'));
  }
  assert.deepEqual(experimentCells().map(c=>c.id),['small-A','small-B','feature-B','feature-A','bug-A','bug-B']);
  assert.ok(experimentCells().every(c=>c.executor_model==='gpt-5.6-terra'));
  assert.throws(()=>experimentCells('gpt6-unbounded'),/unknown-experiment/);
});

test('frozen extension rejects added/reordered cells, fallback models and altered ceilings before generation',()=>{
  const manifest={experiment:'gpt6-autonomous-v1',limits:{...limits,cells:2},cells:experimentCells('gpt6-autonomous-v1')};
  assert.doesNotThrow(()=>validateExperiment(manifest));
  const mutations=[m=>m.cells.push({...m.cells[0]}),m=>m.cells.reverse(),m=>m.cells[0].executor_model='gpt-5.6-terra',m=>m.cells[0].executor_effort='high',m=>m.cells[0].arm='A',m=>m.limits.qa_tokens=50000,m=>m.limits.cell_ms=1800000,m=>m.experiment='unknown'];
  for(const mutate of mutations){const changed=structuredClone(manifest);mutate(changed);assert.throws(()=>validateExperiment(changed));}
});

async function execute(t, fixture, product, hidden) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'temple-autonomy-control-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const files={...product,...fixture.publicTests,'package.json':JSON.stringify({type:'module'}),
    ...(hidden?{'oracle.test.mjs':fixture.hiddenTests}:{})};
  for(const [name,body] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root,name)),{recursive:true});
    await fs.writeFile(path.join(root,name),body);
  }
  const args=['--test','--test-reporter=tap',...(hidden?['oracle.test.mjs']:Object.keys(fixture.publicTests))];
  const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:10000,
    env:{PATH:path.dirname(process.execPath),HOME:root,NODE_OPTIONS:''},maxBuffer:1024*1024});
  assert.equal(result.error,undefined,result.error?.message);
  return result;
}

test('autonomy fixture contract has three distinct tasks and only bounded product paths',()=>{
  assert.deepEqual(fixtures.map(f=>f.id),['small','feature','bug']);
  for(const fixture of fixtures) {
    assert.ok(fixture.spec.length>300);
    assert.deepEqual(Object.keys(fixture.reference).sort(),Object.keys(fixture.seed).sort());
    assert.ok(Object.keys(fixture.seed).every(p=>/^src\/[a-z]+\.mjs$/.test(p)));
    assert.ok(Object.keys(fixture.publicTests).every(p=>/^test\/[a-z]+\.test\.mjs$/.test(p)));
    assert.ok((fixture.hiddenTests.match(/test\('/g)||[]).length>=12);
    assert.ok(fixture.mutations.length>=2);
    assert.equal(new Set(fixture.mutations.map(m=>m.name)).size,fixture.mutations.length);
    for(const mutation of fixture.mutations) {
      assert.ok(Object.keys(mutation.files).every(p=>Object.hasOwn(fixture.seed,p)));
      assert.ok(Object.entries(mutation.files).some(([p,body])=>body!==fixture.reference[p]));
    }
  }
});

for(const fixture of fixtures) {
  test(`autonomy ${fixture.id}: seed preserves public regression checks`,async t=>{
    const result=await execute(t,fixture,fixture.seed,false);
    assert.equal(result.status,0,result.stdout+result.stderr);
  });
  test(`autonomy ${fixture.id}: reference passes public and held-out acceptance`,async t=>{
    for(const hidden of [false,true]) {
      const result=await execute(t,fixture,fixture.reference,hidden);
      assert.equal(result.status,0,result.stdout+result.stderr);
    }
  });
  test(`autonomy ${fixture.id}: held-out acceptance rejects unfinished seed`,async t=>{
    const result=await execute(t,fixture,fixture.seed,true);
    assert.notEqual(result.status,0,'unfinished seed unexpectedly satisfies acceptance');
    assert.match(result.stdout,/not ok/);
  });
  for(const mutation of fixture.mutations) {
    test(`autonomy ${fixture.id}: held-out acceptance detects ${mutation.name}`,async t=>{
      const result=await execute(t,fixture,{...fixture.reference,...mutation.files},true);
      assert.notEqual(result.status,0,'mutation unexpectedly satisfies acceptance');
      assert.match(result.stdout,/not ok/);
      assert.doesNotMatch(result.stderr,/SyntaxError|ERR_MODULE_NOT_FOUND/,'mutation must fail behavior, not syntax or imports');
    });
  }
}

const usage=(overrides={})=>({tokenUsage:{total:{inputTokens:100,cachedInputTokens:25,outputTokens:40,
  reasoningOutputTokens:30,totalTokens:140,...overrides}}});

test('autonomy accounting excludes cached input and never double counts reasoning',()=>{
  assert.deepEqual(usageUpdate(null,usage()),{input_tokens:100,cached_input_tokens:25,output_tokens:40,
    reasoning_output_tokens:30,total_tokens:140,operational_tokens:115});
  const previous=usageUpdate(null,usage());
  const current=usageUpdate(previous,usage({inputTokens:200,cachedInputTokens:100,outputTokens:60,
    reasoningOutputTokens:40,totalTokens:260}));
  assert.equal(current.operational_tokens,160);
  assert.equal(current.total_tokens,260,'cumulative snapshots must not be summed as fresh increments');
  assert.deepEqual(usageUpdate(current,usage({inputTokens:200,cachedInputTokens:100,outputTokens:60,
    reasoningOutputTokens:40,totalTokens:260})),current,'duplicate cumulative event is idempotent');
});

test('autonomy accounting rejects missing, impossible, or regressed counters',()=>{
  for(const value of [undefined,null,{}, {tokenUsage:{}}, {tokenUsage:{total:{totalTokens:0}}}])
    assert.throws(()=>usageUpdate(null,value),/invalid-usage/);
  for(const overrides of [{cachedInputTokens:101},{totalTokens:141},{reasoningOutputTokens:41},
    {outputTokens:-1},{inputTokens:1.5},{cachedInputTokens:null},{totalTokens:NaN},
    {reasoningOutputTokens:undefined}])assert.throws(()=>usageUpdate(null,usage(overrides)),/invalid-usage/);
  const previous=usageUpdate(null,usage());
  for(const overrides of [{inputTokens:99,totalTokens:139},{cachedInputTokens:24},
    {outputTokens:39,totalTokens:139},{reasoningOutputTokens:29}])
    assert.throws(()=>usageUpdate(previous,usage(overrides)),/usage-regression/);
});

test('autonomy repair policy has exactly one repair and respects both ceilings',()=>{
  const remaining={remainingTokens:100,remainingMs:100};
  assert.equal(nextAction({...remaining,initialAccepted:true,repairUsed:false}),'accepted');
  assert.equal(nextAction({...remaining,initialAccepted:false,repairUsed:false}),'repair');
  assert.equal(nextAction({...remaining,initialAccepted:false,repairUsed:true}),'rejected');
  assert.equal(nextAction({...remaining,initialAccepted:true,repairUsed:true}),'accepted');
  for(const exhausted of [{remainingTokens:0},{remainingTokens:-1},{remainingMs:0},{remainingMs:-1}])
    assert.equal(nextAction({...remaining,...exhausted,initialAccepted:false,repairUsed:false}),'rejected');
  assert.equal(nextAction({initialAccepted:true,repairUsed:false,remainingTokens:0,remainingMs:0}),'accepted',
    'a completed accepted candidate remains accepted when it used its final permitted budget');
});

test('autonomy file scope catches protected deletion, additions and edits independently of product changes',()=>{
  const before={'src/a.mjs':'old','SPEC.md':'spec','test/public.test.mjs':'public','package.json':'package'};
  const after={'src/a.mjs':'new','src/b.mjs':'new','SPEC.md':'changed','package.json':'package',
    'test/additional.test.mjs':'allowed','AGENTS.md':'injected'};
  const editable=p=>p.startsWith('src/')||p==='test/additional.test.mjs';
  assert.deepEqual(scopeChanges(before,after,editable).sort(),['AGENTS.md','SPEC.md','test/public.test.mjs']);
  assert.deepEqual(scopeChanges(before,{...before},editable),[]);
  assert.deepEqual(scopeChanges(before,after,()=>false).sort(),
    ['AGENTS.md','SPEC.md','src/a.mjs','src/b.mjs','test/additional.test.mjs','test/public.test.mjs']);
});

test('autonomy QA prompt is identical for both arms and cannot inherit handoff or repair text',()=>{
  const sentinel='SECRET_PREVIOUS_STAGE_HANDOFF_248';
  const a=promptFor('A','qa',{handoff:sentinel});
  const b=promptFor('B','qa',{handoff:'different report'});
  assert.equal(a,b);
  assert.equal(a,promptFor(null,'qa'));
  assert.ok(!a.includes(sentinel));
  assert.doesNotMatch(a,/\.ai-org|TEMPLE\.md|temple-work|Spec →|staged|autonomous/i);
  assert.match(a,/SPEC\.md/);
  assert.match(a,/Do not edit/);
  assert.match(a,/agent-lulu/);
  assert.match(promptFor('B','repair',{findings:[sentinel]}),new RegExp(sentinel));
  assert.ok(!promptFor('B','autonomous').includes(sentinel));
});

test('autonomy shared stop cannot hide missing usage or failed cleanup behind a budget stop',()=>{
  const complete={generation_requested:true,usage:usageUpdate(null,usage()),usage_status:'observed-completed-turn',terminals_empty:true,server_exit_confirmed:true,first_stop:null};
  assert.equal(fatal(complete),false);
  assert.equal(fatal({...complete,completion:{decision:'fail'}}),false,'a product rejection alone preserves paired coverage');
  for(const first_stop of ['time-limit','token-limit','actor-not-completed']){
    assert.equal(fatal({...complete,first_stop,usage:null,usage_status:'unknown'}),true);
    assert.equal(fatal({...complete,first_stop,usage_status:'incomplete-observation'}),true);
    assert.equal(fatal({...complete,first_stop,cleanup_failure:'terminal-cleanup-unconfirmed'}),true);
    assert.equal(fatal({...complete,first_stop,terminals_empty:false}),true);
    assert.equal(fatal({...complete,first_stop,server_exit_confirmed:false}),true);
  }
});

test('autonomy exclusive start admits one concurrent runner and never reopens after restart',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'temple-autonomy-once-'));
  t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  const results=await Promise.allSettled([acquireRun(lab),acquireRun(lab)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  const rejected=results.find(r=>r.status==='rejected');assert.equal(rejected.reason.code,'EEXIST');
  assert.match(await fs.readFile(path.join(lab,'STARTED'),'utf8'),/^202\d-/);
  await assert.rejects(acquireRun(lab),{code:'EEXIST'});
});
