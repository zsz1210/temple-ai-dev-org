import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createDeliveryObserver, observationLimits } from "../scripts/delivery-observations.mjs";
import { classifyCommandItem, wholeReadTargets } from "../scripts/delivery-command-policy.mjs";
import { runStage } from "../scripts/delivery-control-pair.mjs";

const secret = "SECRET_person@example.invalid_/Users/fixture/credential";
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),"observations-"));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(path.join(root,"test"));
  for (const p of ["order.mjs","test/public.test.mjs","test/added.test.mjs","package.json"]) await fs.writeFile(path.join(root,p), secret);
  const context = { root, arm: "ordinary", stage: "build" };
  const make = (command, output = secret, exitCode = 0) => ({ type:"commandExecution", id:"cmd-1",status:"completed",cwd:root,command,commandActions:[],aggregatedOutput:output,exitCode });
  const observer = createDeliveryObserver({root,key:Buffer.alloc(32,7)});
  const observe = (item, method="item/completed")=>observer.observe(method,item,classifyCommandItem(item,context),context);
  return {root,context,make,observer,observe};
}
const tap = `TAP version 13\nnot ok 1 - ${secret}\n  ---\n  name: 'AssertionError'\n  error: '${secret}'\n  expected: '${secret}'\n  actual: '${secret}'\n  stack: '${secret}'\n  ...\n1..1\n# fail 1\n`;

test("actual Node TAP output is parsed without retaining test names or errors",async t=>{
  const f=await fixture(t);
  await fs.writeFile(path.join(f.root,"test/added.test.mjs"),`import test from 'node:test';import assert from 'node:assert/strict';test(${JSON.stringify(secret)},()=>assert.equal(1,2));`);
  const env={...process.env};delete env.NODE_TEST_CONTEXT;delete env.NODE_OPTIONS;
  for(const reporter of ["tap","spec"]){
    const run=spawnSync(process.execPath,["--test",`--test-reporter=${reporter}`,"test/added.test.mjs"],{cwd:f.root,env,encoding:"utf8",timeout:10000,maxBuffer:262144});
    assert.equal(run.status,1);
    const out=f.observe(f.make("node --test test/added.test.mjs",run.stdout,1));
    assert.equal(out.test.status,"recognized",run.stdout);
    assert.equal(out.test.failures.length,1);
    assert.equal(JSON.stringify(out).includes(secret),false);
  }
});

test("test diagnostics retain hashed identity and allowlisted class, not payloads",async t=>{
  const f=await fixture(t), item=f.make("node --test test/*.test.mjs",tap,1);
  f.observe({...item,status:"inProgress"},"item/started");
  const out=f.observe(item);
  assert.equal(out.test.status,"recognized");
  assert.equal(out.test.boundary_inputs,"same-at-boundaries");
  assert.equal(out.test.failures[0].error_type,"AssertionError");
  assert.match(out.test.failures[0].test_id,/^hmac-sha256:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(out).includes(secret),false);
  assert.equal(JSON.stringify(out).includes(f.root),false);
  assert.equal(JSON.stringify(out).includes("order.mjs"),false);
});

test("changed and missing inputs cannot be called unchanged",async t=>{
  const f=await fixture(t), item=f.make("node --test test/*.test.mjs",tap,1);
  f.observe({...item,status:"inProgress"},"item/started");
  await fs.writeFile(path.join(f.root,"order.mjs"),"changed");
  assert.equal(f.observe(item).test.boundary_inputs,"changed-at-boundaries");
  await fs.unlink(path.join(f.root,"package.json"));
  f.observe({...item,status:"inProgress"},"item/started");
  assert.equal(f.observe(item).test.boundary_inputs,"unknown");
  assert.equal(f.observe(item).test.inputs_before,null);
});

test("reporter absence, truncation, size and failure count bounds remain explicit",async t=>{
  const f=await fixture(t), get=s=>f.observe(f.make("node --test test/*.test.mjs",s,1)).test;
  assert.equal(get("✖ "+secret).status,"unsupported");
  assert.equal(get("TAP version 13\nnot ok 1 - broken").status,"partial");
  assert.equal(get("x".repeat(observationLimits.bytes+1)).status,"over-limit");
  const many=get("TAP version 13\n"+Array.from({length:30},(_,i)=>`not ok ${i+1} - ${secret}${i}`).join("\n"));
  assert.equal(many.status,"over-limit");assert.equal(many.failures.length,16);
  assert.equal(get(tap.replace("AssertionError",secret)).failures[0].error_type,"unknown");
});

test("TAP count, result and diagnostic completeness cannot be inferred from footer alone",async t=>{
  const f=await fixture(t), get=s=>f.observe(f.make("node --test test/*.test.mjs",s,1)).test;
  for(const text of ["TAP version 13\n1..2\n# fail 2\n",tap.replace("# fail 1","# fail 2"),tap.replace("  ...\n",""),tap+"# fail 1\n",tap.replace("1..1","1..2"),tap.replace("not ok 1","not ok 2")])assert.equal(get(text).status,"partial");
  for(const text of [tap.replace("not ok 1 - "+secret,"not ok 1 - "+secret+" # TODO planned"),tap+"# cancelled 1\n",tap.replace("not ok 1","  not ok 1"),tap.replace("not ok 1 - "+secret,"ok 1 - "+secret+" # SKIP")]){
    const result=get(text);assert.equal(result.status,"unsupported");assert.deepEqual(result.failures,[]);
  }
});

test("actual Node TODO, cancellation and nested TAP are explicit unsupported outcomes",async t=>{
  const f=await fixture(t), env={...process.env};delete env.NODE_TEST_CONTEXT;delete env.NODE_OPTIONS;
  const cases=[
    "test('skip',{skip:true},()=>{});test('todo',{todo:true},()=>assert.equal(1,2));",
    "test('cancel',{timeout:20},async()=>await new Promise(()=>{}));",
    "test('parent',async t=>{await t.test('child',()=>assert.equal(1,2));});"
  ];
  for(const body of cases){
    await fs.writeFile(path.join(f.root,"test/added.test.mjs"),"import test from 'node:test';import assert from 'node:assert/strict';"+body);
    const r=spawnSync(process.execPath,["--test","--test-reporter=tap","test/added.test.mjs"],{cwd:f.root,env,encoding:"utf8",timeout:10000,maxBuffer:262144});
    assert.ok([0,1].includes(r.status));
    const out=f.observe(f.make("node --test test/added.test.mjs",r.stdout,r.status)).test;
    assert.equal(out.status,"unsupported");assert.deepEqual(out.failures,[]);
  }
});

test("literal multi-file reads expose overlap without claiming redundancy",async t=>{
  const f=await fixture(t);
  const first=f.observe(f.make("cat order.mjs test/public.test.mjs",secret+secret));
  assert.equal(first.sources.length,2);
  assert.equal(first.sources[0].relation,"first-observed");
  const second=f.observe(f.make("/bin/zsh -lc 'cat -- order.mjs'"));
  assert.equal(second.sources[0].relation,"same-content-again");
  await fs.writeFile(path.join(f.root,"order.mjs"),"new");
  assert.equal(f.observe(f.make("cat order.mjs","new")).sources[0].relation,"changed-since-last-read");
  const fresh=createDeliveryObserver({root:f.root,key:"a".repeat(64)});
  const item=f.make("cat order.mjs","new");
  assert.equal(fresh.observe("item/completed",item,classifyCommandItem(item,f.context),f.context).sources[0].relation,"first-observed");
});

test("unsupported reads and mismatched output never create exposure evidence",async t=>{
  const f=await fixture(t);
  for (const command of ["cat -n order.mjs","cat test/*.test.mjs"]) {
    assert.equal(classifyCommandItem(f.make(command),f.context).allowed,true);
    assert.equal(f.observe(f.make(command)).read_status,"unknown");
  }
  assert.equal(f.observe(f.make("cat order.mjs","truncated")).read_status,"unknown");
  assert.equal(f.observe(f.make("cat order.mjs")).sources[0].relation,"first-observed");
  assert.equal(wholeReadTargets(f.make("cat ../outside"),f.context),null);
  assert.equal(f.observe(f.make("cat order.mjs; pwd")),null);
});

test("oversized and symlink inputs stay unavailable without reading their bodies",async t=>{
  const f=await fixture(t);
  await fs.unlink(path.join(f.root,"order.mjs"));
  await fs.symlink("test/public.test.mjs",path.join(f.root,"order.mjs"));
  assert.equal(f.observe(f.make("cat order.mjs")),null);
  await fs.writeFile(path.join(f.root,"test/added.test.mjs"),"x".repeat(observationLimits.bytes+1));
  assert.equal(f.observe(f.make("cat test/added.test.mjs")).read_status,"unknown");
  const out=f.observe(f.make("node --test test/*.test.mjs",tap,1));
  assert.equal(out.test.inputs_after.filter(x=>x.status==="unavailable").length,2);
});

test("context material counts emitted whole bodies, not reused references",async t=>{
  const f=await fixture(t), decision={allowed:true,operation:"temple-context-enter"};
  const body={schema_version:"temple.context-model-view/v1",packet:{sources:[{path:"order.mjs",body:secret},{path:"test/public.test.mjs",body:null}]}};
  const out=f.observer.observe("item/completed",f.make("unused",JSON.stringify(body)),decision,f.context);
  assert.equal(out.sources.length,1);
  assert.equal(f.observe(f.make("cat order.mjs")).sources[0].relation,"same-content-again");
  assert.equal(f.observe(f.make("cat test/public.test.mjs")).sources[0].relation,"first-observed");
  assert.equal(JSON.stringify(out).includes(secret),false);
});

test("observation is bounded and never mutates command decisions",async t=>{
  const f=await fixture(t), item=f.make("cat order.mjs"), decision=classifyCommandItem(item,f.context);
  const before=JSON.stringify(decision);
  let result;
  for(let i=0;i<260;i++)result=f.observer.observe("item/completed",item,decision,f.context);
  assert.equal(result.status,"observation-limit");
  assert.equal(JSON.stringify(decision),before);
  assert.deepEqual(classifyCommandItem(item,f.context),decision);
});

test("runtime retains bounded test observations without changing outcome or usage",async t=>{
  const f=await fixture(t);
  const contract={schemas:Object.fromEntries(["ItemStartedNotification","ItemCompletedNotification","ThreadTokenUsageUpdatedNotification","ThreadStartParams","TurnStartParams"].map(k=>[k,{}]))};
  const providerFactory=(_p,_a,o)=>({notify(){},async close(){},async request(method){
    if(method==="config/read")return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};
    if(method==="thread/start")return {thread:{id:"thread"},model:"gpt-5.6-terra",reasoningEffort:"medium"};
    if(method==="turn/start"){
      setTimeout(()=>{
        const emit=(method,params)=>o.onNotification({method,params:{threadId:"thread",turnId:"turn",...params}});
        const command=f.make("node --test test/*.test.mjs",tap,1);
        emit("item/started",{item:{...command,status:"inProgress"}});
        emit("item/completed",{item:command});
        emit("thread/tokenUsage/updated",{tokenUsage:{total:{inputTokens:100,cachedInputTokens:40,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}});
        emit("item/completed",{item:{type:"agentMessage",id:"message",text:JSON.stringify({candidate_revision:"a".repeat(40),test_command:"node --test test/*.test.mjs",test_exit_code:1,decision:"delivered",summary:"fixture",unresolved:[]})}});
        emit("turn/completed",{turn:{id:"turn",status:"completed"}});
      },0);return {turn:{id:"turn"}};
    }
    return {};
  }});
  const out=await runStage({root:f.root,arm:"ordinary",stage:"build",sourceRoot:f.root,contract,providerFactory,protocol:{model:"gpt-5.6-terra",reasoning_effort:"medium",limits:{per_stage_ms:5000,per_stage_operational_tokens:1000,aggregate_operational_tokens:2000}},deadline:Date.now()+5000,aggregateBefore:0,diagnosticKey:"fixture",runtimePolicy:{arguments:[],beforeStart(){},checkConfig(){}}});
  assert.equal(out.status,"completed"); // Runtime completion is not quality acceptance.
  assert.equal(out.usage.operational_tokens,80);
  const observed=out.events.find(e=>e.local_observation?.test)?.local_observation.test;
  assert.equal(observed.status,"recognized");
  assert.equal(observed.boundary_inputs,"same-at-boundaries");
  assert.equal(JSON.stringify(out).includes(secret),false);
});
