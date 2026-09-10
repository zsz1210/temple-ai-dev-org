// Maintainer qualification tool. Never installed into a participant repository.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createJsonRpcProcess} from '../src/codex-app-server-provider.mjs';
import {liveArguments, assertLiveConfiguration, discoverRuntime} from './continuity-live-runner.mjs';
import {subprocessEnvironment} from './delivery-control-pair.mjs';
import {assertActorBoundary, usageUpdate, bundleRuntime, runtimeFor, tree, scopeChanges} from './autonomy-experiment.mjs';
import {buildRetrievalCorpus, createRepositoryRetrievalProvider} from '../src/context.mjs';
import {readSession} from '../src/delivery-ledger.mjs';

const source=path.resolve(import.meta.dirname,'..'), execute=promisify(execFile);
export const hash=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const save=async(p,v,exclusive=false)=>{await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:exclusive?'wx':'w'});};
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const ensure=(v,m)=>{if(!v)throw Error(m);};
const roles={developer:'agent-casey',quality_evaluator:'agent-riley',independent_qa:'agent-riley',release_manager:'agent-alex'};
export const scenarios=[
  {id:'quantity-bug',profile:'lean',files:['src/quantity.mjs','test/additional-1.test.mjs'],
    title:'Repair strict quantity parsing',
    spec:'Export parseQuantity(value) from src/quantity.mjs. Accept only primitive strings containing one or more ASCII digits, including leading zeros. Return the nonnegative safe integer. Reject every other type, whitespace, signs, fractions, exponents, non-ASCII digits and values beyond Number.MAX_SAFE_INTEGER with TypeError. Do not coerce objects or numbers.',
    seed:{'src/quantity.mjs':'export function parseQuantity(value) { return Number(value); }\n'},
    publicTest:"import test from 'node:test';import assert from 'node:assert/strict';import {parseQuantity} from '../src/quantity.mjs';test('quantity valid',()=>{assert.equal(parseQuantity('12'),12);assert.equal(parseQuantity('000'),0)});test('quantity rejects whitespace',()=>assert.throws(()=>parseQuantity(' 1'),TypeError));\n",
    oracle:"import assert from 'node:assert/strict';import {parseQuantity as q} from './src/quantity.mjs';for(const v of ['',null,undefined,0,1,{},[],true,'+1','-1','1.0','1e2','１','1\\n',' 1','9007199254740992'])assert.throws(()=>q(v),TypeError);for(const [s,n] of [['0',0],['001',1],['9007199254740991',Number.MAX_SAFE_INTEGER]])assert.equal(q(s),n);let touched=false;assert.throws(()=>q({toString(){touched=true;return '1'}}),TypeError);assert.equal(touched,false);"
  },
  {id:'invoice-feature',profile:'lean',files:['src/invoice.mjs','test/additional-2.test.mjs'],
    title:'Add exact invoice totals using quantity rules',
    spec:'Export invoiceTotal(lines) from src/invoice.mjs and reuse parseQuantity from src/quantity.mjs. lines must be an array of non-null objects with qty following the existing strict ASCII quantity contract and unitCents a primitive nonnegative safe integer number. Return the safe integer sum of qty * unitCents, empty array returns 0. Reject invalid input and unsafe products/sums with TypeError. Do not mutate inputs. Read the relevant validated Learning record before implementing this task; cite the ID and how it applies in your final summary.',
    seed:{'src/invoice.mjs':'export function invoiceTotal(lines) { throw new Error("not implemented"); }\n'},
    publicTest:"import test from 'node:test';import assert from 'node:assert/strict';import {invoiceTotal} from '../src/invoice.mjs';test('invoice totals',()=>assert.equal(invoiceTotal([{qty:'2',unitCents:123},{qty:'3',unitCents:1}]),249));test('empty invoice',()=>assert.equal(invoiceTotal([]),0));\n",
    oracle:"import assert from 'node:assert/strict';import {invoiceTotal as f} from './src/invoice.mjs';for(const v of [null,{},[null],[{qty:2,unitCents:1}],[{qty:' 1',unitCents:1}],[{qty:'1',unitCents:'1'}],[{qty:'1',unitCents:-1}],[{qty:'1',unitCents:0.1}],[{qty:'2',unitCents:Number.MAX_SAFE_INTEGER}],[{qty:'1',unitCents:Number.MAX_SAFE_INTEGER},{qty:'1',unitCents:1}]])assert.throws(()=>f(v),TypeError);assert.equal(f([{qty:'1',unitCents:Number.MAX_SAFE_INTEGER}]),Number.MAX_SAFE_INTEGER);const a=Object.freeze([Object.freeze({qty:'002',unitCents:17})]);assert.equal(f(a),34);assert.equal(f([]),0);"
  },
  {id:'report-continuation',profile:'standard',files:['src/report.mjs','test/additional-3.test.mjs'],
    title:'Complete invoice report integration from repository checkpoint',
    spec:'Export buildReport(lines) from src/report.mjs. Each line is a non-null object with sku a nonempty primitive string, qty and unitCents following the existing invoice contract. Group by exact SKU bytes (never trim or normalize), sorted ascending by JavaScript string code-unit order. Return {totalCents,items:[{sku,totalCents}]}; empty input returns {totalCents:0,items:[]}. Reuse invoiceTotal for monetary validation/calculation. Reject invalid input or unsafe totals with TypeError, never mutate input. HANDOFF.md describes completed foundations and unfinished integration; historical tests do not satisfy current acceptance. In your final summary name what was already complete and what you completed.',
    seed:{'src/report.mjs':'import {invoiceTotal} from "./invoice.mjs";\nexport function buildReport(lines) { return {totalCents:invoiceTotal(lines),items:[]}; }\n'},
    publicTest:"import test from 'node:test';import assert from 'node:assert/strict';import {buildReport} from '../src/report.mjs';test('report groups',()=>assert.deepEqual(buildReport([{sku:'b',qty:'2',unitCents:3},{sku:'a',qty:'1',unitCents:4},{sku:'b',qty:'1',unitCents:1}]),{totalCents:11,items:[{sku:'a',totalCents:4},{sku:'b',totalCents:7}]}));\n",
    oracle:"import assert from 'node:assert/strict';import {buildReport as f} from './src/report.mjs';assert.deepEqual(f([]),{totalCents:0,items:[]});for(const x of [null,{},[null],[{sku:'',qty:'1',unitCents:1}],[{sku:1,qty:'1',unitCents:1}],[{sku:'x',qty:'1e2',unitCents:1}],[{sku:'x',qty:'1',unitCents:Number.MAX_SAFE_INTEGER},{sku:'y',qty:'1',unitCents:1}]])assert.throws(()=>f(x),TypeError);const a=Object.freeze([Object.freeze({sku:' x',qty:'01',unitCents:2}),Object.freeze({sku:'x',qty:'2',unitCents:3}),Object.freeze({sku:'__proto__',qty:'1',unitCents:4})]);assert.deepEqual(f(a),{totalCents:12,items:[{sku:' x',totalCents:2},{sku:'__proto__',totalCents:4},{sku:'x',totalCents:6}]});"
  }
];
export function summarize(calls){
  const known=calls.filter(c=>c.usage),complete=calls.length>0&&calls.every(c=>c.usage_status==='observed-completed-turn');
  const sum=k=>known.reduce((n,c)=>n+c.usage[k],0);
  return {calls:calls.length,known_calls:known.length,coverage:complete?'recorded-calls-only':'partial-or-unavailable',input_tokens:sum('input_tokens'),cached_input_tokens:sum('cached_input_tokens'),output_tokens:sum('output_tokens'),known_operational_tokens:sum('input_tokens')-sum('cached_input_tokens')+sum('output_tokens'),whole_task_tokens:null,monetary_cost:null};
}
const completionSchema={type:'object',additionalProperties:false,required:['decision','summary','findings'],properties:{decision:{type:'string',enum:['pass','fail','blocked']},summary:{type:'string'},findings:{type:'array',items:{type:'string'}}}};
// No account usage query. Usage comes exclusively from this fresh thread's events.
export async function runSoloActor(runtime,prompt,{ms=900000,providerFactory=createJsonRpcProcess,onStart=async()=>{},onUsage=()=>{}}={}){
  const started=Date.now(),result={status:'running',account_polling:false,generation_requested:false,usage:null};
  let client,threadId,turnId,terminal,answer,closing=false,failure,wake;
  const done=new Promise(resolve=>{wake=resolve;});
  const stop=message=>{failure??=message;wake();};
  const consume=m=>{try{
    const p=m.params??{};if(threadId&&p.threadId&&p.threadId!==threadId)return;
    if(m.method==='turn/started')turnId=p.turn?.id??turnId;
    if(m.method==='thread/tokenUsage/updated'){ensure(p.threadId===threadId,'usage-thread-mismatch');result.usage=usageUpdate(result.usage,p);onUsage(result.usage);}
    if(m.method==='item/completed'&&p.item?.type==='agentMessage')answer=p.item.text;
    if(m.method==='turn/completed'){ensure(!turnId||p.turn?.id===turnId,'terminal-turn-mismatch');terminal=p.turn;wake();}
  }catch(e){stop(e.message);}};
  const timer=setTimeout(()=>stop('time-limit'),ms);
  try{
    client=providerFactory(runtime.binary,liveArguments(runtime),{cwd:runtime.root,env:subprocessEnvironment(runtime.environment),onNotification:consume,onProtocolError:()=>stop('protocol-error'),onRequest:()=>stop('unexpected-approval-request'),onExit:()=>{if(!closing&&!terminal)stop('provider-exit');}});
    const request=(method,params)=>client.request(method,params,Math.max(1,ms-(Date.now()-started)));
    await request('initialize',{clientInfo:{name:'temple-solo-qualification',version:'1'},capabilities:{experimentalApi:true}});client.notify('initialized',{});
    assertLiveConfiguration(await request('config/read',{cwd:runtime.root,includeLayers:false}),runtime);
    const model='gpt-5.6-terra',effort='medium';
    const t=await request('thread/start',{model,cwd:runtime.root,approvalPolicy:'never',permissions:'temple-continuity-probe',ephemeral:true,allowProviderModelFallback:false,config:{model_reasoning_effort:effort},developerInstructions:'Bounded local qualification. Use only the current repository, no network, other repositories, memories, subagents, account queries, installs or external actions. Use apply_patch for edits and non-login shells. Coordinator owns Git, claims and lifecycle. Preserve protected supplied files. A completion claim is not acceptance.'});
    assertActorBoundary(t,runtime.root,{model,effort});threadId=t.thread.id;result.thread_id=threadId;result.model=t.model;result.effort=t.reasoningEffort;
    ensure(!failure,failure??'prelaunch-failure');
    await onStart({thread_id:threadId,prompt_bytes:Buffer.byteLength(prompt),prompt_sha256:hash(prompt)});
    result.generation_requested=true;
    const turn=await request('turn/start',{threadId,cwd:runtime.root,model,effort,approvalPolicy:'never',permissions:'temple-continuity-probe',input:[{type:'text',text:prompt}],outputSchema:completionSchema});
    ensure(!turnId||turnId===turn.turn?.id,'turn-correlation');turnId=turn.turn?.id;
    await done;ensure(!failure&&terminal?.status==='completed',failure??'turn-not-completed');
    const parsed=JSON.parse(answer);ensure(['pass','fail','blocked'].includes(parsed.decision)&&typeof parsed.summary==='string'&&Array.isArray(parsed.findings)&&parsed.findings.every(x=>typeof x==='string'),'completion-invalid');
    result.completion=parsed;result.status='completed';
  }catch(e){failure??=e.message;result.status='stopped';}
  finally{
    clearTimeout(timer);
    if(client&&threadId&&turnId&&!terminal)try{await client.request('turn/interrupt',{threadId,turnId},5000);}catch{failure??='interrupt-unconfirmed';}
    if(client&&threadId)try{await client.request('thread/backgroundTerminals/clean',{threadId},5000);const x=await client.request('thread/backgroundTerminals/list',{threadId},5000);ensure(Array.isArray(x.data)&&x.data.length===0&&!x.nextCursor,'cleanup-unconfirmed');result.terminals_empty=true;}catch{failure??='cleanup-unconfirmed';}
    if(result.generation_requested)await new Promise(r=>setTimeout(r,250));closing=true;
    try{if(client)await client.close();result.server_exit_confirmed=true;}catch{failure??='provider-exit-unconfirmed';}
    result.failure=failure??null;if(failure)result.status='stopped';
    result.usage_status=result.usage&&result.status==='completed'?'observed-completed-turn':'unknown-or-partial';result.elapsed_ms=Date.now()-started;
  }
  return result;
}
async function command(cwd,args,records,{binary=process.execPath,timeout=120000,allowFailure=false,environment={}}={}){
  const start=Date.now();let r;try{r=await execute(binary,args,{cwd,timeout,maxBuffer:8*1024*1024,env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_TERMINAL_PROMPT:'0',...environment}});r.code=0;}catch(e){r=e;}
  const entry={binary:path.basename(binary),arguments:args,elapsed_ms:Date.now()-start,exit_code:Number.isInteger(r.code)?r.code:null,output_bytes:Buffer.byteLength(r.stdout??'')+Buffer.byteLength(r.stderr??''),timed_out:Boolean(r.killed)};records?.push(entry);
  if(!allowFailure)ensure(entry.exit_code===0,(r.stderr||r.stdout||String(r)).slice(-3000));
  return {...entry,stdout:r.stdout??'',stderr:r.stderr??''};
}
const git=async(root,args,records)=>(await command(root,['-c','core.hooksPath=/dev/null','-c','commit.gpgsign=false',...args],records,{binary:'git'})).stdout.trim();
async function temple(root,args,records){const n=args[0]==='work-item'||args[0]==='delivery'||args[0]==='learning'?2:1;const r=await command(root,['templew.mjs',...args.slice(0,n),'.',...args.slice(n),'--json'],records,{environment:{TEMPLE_CLI_PATH:path.join(path.dirname(root),'runtime/bin/temple.mjs')}});return JSON.parse(r.stdout);}
export async function prepare(parent=os.tmpdir()){
  const lab=await fs.realpath(await fs.mkdtemp(path.join(parent,'temple-solo-'))),root=path.join(lab,'project'),records=[];
  await fs.mkdir(root);await save(path.join(root,'README.md'),'# Existing project\nThis project-owned file must survive Temple initialization.\n');
  const before=await fs.readFile(path.join(root,'README.md'));const runtime=await bundleRuntime(lab);
  const config=await read(path.join(source,'docs/getting-started/temple-init.example.json'));
  config.project={id:'solo-qualification',name:'Solo qualification fixture'};
  config.repository_integration={schema_version:'temple.repository-integration/v1',status:'confirmed',authority:'project',source:'human-confirmed',policy_refs:[],summary:'Authorized disposable solo fixture; local commits only, no remote or deployment',integration_target:'main',change_isolation:'not-required',review_gate:'not-required',recorded_at:new Date().toISOString(),recorded_by:'human'};
  await save(path.join(lab,'init.json'),config);
  for(const extra of [['--dry-run'],[]])await command(source,[path.join(runtime,'bin/temple.mjs'),'init',root,'--config',path.join(lab,'init.json'),...extra,'--json'],records);
  assert.deepEqual(await fs.readFile(path.join(root,'README.md')),before);
  // Explicit synthetic assignment, not a framework-managed default.
  await fs.appendFile(path.join(root,'AGENTS.md'),'\n# Authorized qualification assignment\nThe coordinator holds the current claim and performs Git, checks, handoffs and lifecycle operations. Participant agents supply only substantive implementation or independent review. Do not repeat administrative mutations. Read CURRENT.md for the active goal and repository sources.\n');
  await save(path.join(root,'package.json'),{type:'module',scripts:{test:'node --test test/*.test.mjs'}});
  await git(root,['init','-b','main'],records);await git(root,['config','user.name','Solo Fixture'],records);await git(root,['config','user.email','solo@example.invalid'],records);
  const doctor=await temple(root,['doctor','--compact'],records);ensure(doctor.summary.fail===0,'initial-doctor');await temple(root,['status','--compact','--no-write'],records);
  await git(root,['add','.'],records);await git(root,['commit','-m','Initialize disposable solo repository'],records);
  const protocol={schema_version:'temple.solo-qualification/v1',created_at:new Date().toISOString(),framework_revision:await git(source,['rev-parse','HEAD']),runtime_tree:hash(await tree(runtime)),scenarios_sha256:hash(scenarios),runner_sha256:hash(await fs.readFile(new URL(import.meta.url))),root,runtime,account_polling:false,model:'gpt-5.6-terra',effort:'medium',repairs_per_task:1,actor_timeout_ms:900000,max_calls:12,cache:'uncontrolled',adoption:{readme_preserved:true,doctor:doctor.summary},setup:records};
  await save(path.join(lab,'protocol.json'),protocol,true);return {lab,protocol_sha256:hash(protocol),adoption:protocol.adoption};
}
export async function offline(lab){
  const records=[],start=Date.now(),files=['test/daily-delivery.test.mjs','test/autonomous-delivery.test.mjs','test/learning-review-coverage.test.mjs','test/learning-operations.test.mjs','test/core-recovery-readonly.test.mjs','test/solo-stability.test.mjs','test/solo-learning-revalidation.test.mjs'];
  const r=await command(source,['--test','--test-reporter=tap',...files],records,{timeout:600000,allowFailure:true});
  await save(path.join(lab,'offline.tap'),r.stdout+r.stderr);
  const count=name=>Number(r.stdout.match(new RegExp('^# '+name+' (\\d+)','m'))?.[1]??NaN);
  const result={kind:'offline-mechanism-qualification',status:r.exit_code===0&&count('tests')>0&&count('fail')===0?'passed':'failed',tests:count('tests'),passed:count('pass'),failed:count('fail'),wall_ms:Date.now()-start,model_calls:0,records};
  await save(path.join(lab,'offline.json'),result);return result;
}
async function objective(root,scenario,lab,label){
  const checkRoot=path.join(lab,'checks',label);await fs.mkdir(checkRoot,{recursive:true});await fs.cp(path.join(root,'src'),path.join(checkRoot,'src'),{recursive:true});
  await save(path.join(checkRoot,'oracle.mjs'),scenario.oracle);const r=await command(checkRoot,['oracle.mjs'],null,{allowFailure:true});return {passed:r.exit_code===0,exit_code:r.exit_code,elapsed_ms:r.elapsed_ms,diagnostic:r.stderr.slice(-4000)};
}
async function learningProbe(root,query){const documents=await buildRetrievalCorpus(root,'learning');return (await createRepositoryRetrievalProvider().search({documents,query,position:'developer',limit:5})).map(x=>x.id);}
export async function run(lab,expected,{actorImpl=runSoloActor,discover=discoverRuntime}={}){
  const p=await read(path.join(lab,'protocol.json'));ensure(hash(p)===expected&&p.runner_sha256===hash(await fs.readFile(new URL(import.meta.url)))&&p.scenarios_sha256===hash(scenarios),'frozen-protocol-drift');
  ensure(hash(await tree(p.runtime))===p.runtime_tree,'runtime-drift');ensure((await read(path.join(lab,'offline.json'))).status==='passed','offline-not-qualified');
  await save(path.join(lab,'run.started'),{at:new Date().toISOString(),protocol_sha256:expected},true);
  const root=p.root,state={schema_version:'temple.solo-result/v1',kind:actorImpl===runSoloActor?'live-agent-qualification':'synthetic-lifecycle-rehearsal',status:'running',started_ms:Date.now(),protocol_sha256:expected,calls:[],tasks:[],commands:[],unrun:scenarios.map(s=>s.id),human_interventions:0,account_polling:false};
  const persist=async()=>{state.metrics=summarize(state.calls);state.wall_ms=Date.now()-state.started_ms;await save(path.join(lab,'result.json'),state);};
  const c=(...args)=>temple(root,args,state.commands);
  let activeId;
  try{
    const binary='/Applications/ChatGPT.app/Contents/Resources/codex',discovery=await discover({binary,root});
    const base={binary,...discovery,readRoots:[path.dirname(process.execPath),'/Applications/Xcode.app/Contents/Developer/usr/bin',p.runtime],environment:{PATH:`${path.dirname(process.execPath)}:/Applications/Xcode.app/Contents/Developer/usr/bin:/usr/bin:/bin`,OPENSSL_CONF:'/dev/null',TEMPLE_CLI_PATH:path.join(p.runtime,'bin/temple.mjs'),GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_TERMINAL_PROMPT:'0'}};
    const runtime=await runtimeFor(root,base);
    for(const [index,s] of scenarios.entries()){
      const task={id:s.id,status:'running',attempts:[],started_ms:Date.now(),profile:s.profile};state.tasks.push(task);state.unrun=state.unrun.filter(x=>x!==s.id);await persist();
      for(const [file,content] of Object.entries(s.seed))await save(path.join(root,file),content);
      const testFile=`test/scenario-${index+1}.test.mjs`;await save(path.join(root,testFile),s.publicTest);await save(path.join(root,'SPEC.md'),`# ${s.title}\n\n${s.spec}\n`);
      await save(path.join(root,'HANDOFF.md'),`# Repository checkpoint\nCompleted and independently accepted tasks: ${state.tasks.filter(t=>t.status==='accepted').map(t=>`${t.id} at ${t.revision}`).join(', ')||'none'}.\nCurrent work is ${s.id}; its supplied implementation is incomplete. Read SPEC.md and current Work Item; preserve previous modules and tests.\n`);
      const wi=(await c('work-item','create','--title',s.title,'--scope',s.spec,'--acceptance','Current SPEC.md, preserved regressions and independent review',...s.files.flatMap(f=>['--affected-path',f]),'--workflow-profile',s.profile,'--risk-tier',s.profile==='lean'?'low':'standard','--scope-class','bounded','--profile-rationale','Bounded reversible synthetic Node task with distinct reviewer and no external effects','--ui-mode','not-applicable')).item;
      task.work_item_id=activeId=wi.id;
      const briefRef=`.ai-org/artifacts/${wi.id}/approved-brief.md`;
      await save(path.join(root,briefRef),`# Approved task contract\n\n${s.spec}\n\nLocal fixture authorization: implement this scope, independently verify and close the organizational Work Item. No external actions.\n`);
      await save(path.join(root,'CURRENT.md'),`# Active assignment\nWork Item ${wi.id}, Developer agent-casey, Principal human.\nRead TEMPLE.md, SPEC.md, HANDOFF.md and the compact context for this Work Item. Edit only ${s.files.join(', ')}. Coordinator owns current claim and bookkeeping.\n`);
      const gates=s.profile==='lean'?[['build',['work_order','approved_scope','acceptance_criteria','technical_design','risk_review','profile_eligibility']]]:[['spec',['work_order']],['design',['approved_scope','acceptance_criteria']],['build',['technical_design','risk_review']]];
      for(const [stage,requirements] of gates)await c('transition','--work-item',wi.id,'--to',stage,...requirements.flatMap(g=>['--satisfy',`${g}=${briefRef}`]));
      const tests=(await fs.readdir(path.join(root,'test'))).filter(f=>f.endsWith('.test.mjs')).map(f=>'test/'+f);
      const planRef=`.ai-org/artifacts/${wi.id}/plan.json`;
      await save(path.join(root,planRef),{schema_version:'temple.delivery-plan/v2',execution_mode:'autonomous',check_policy:'trusted-local',authorization_ref:briefRef,tests,test_timeout_ms:30000,budget:{elapsed_limit_ms:7200000,max_repairs:2,verification_reserve_ms:1200000,repair_reserve_ms:1200000,cleanup_reserve_ms:300000,token_limit:null,token_reserve:0}});
      await git(root,['add','.'],state.commands);await git(root,['commit','-m',`Freeze ${s.id} scope and seed`],state.commands);
      const d=(action,position,ref)=>c('delivery',action,'--work-item',wi.id,'--agent-id',roles[position],'--principal-id','human',...(ref?['--request',ref]:[]));
      await d('open','developer',planRef);
      const actor=async(stage,prompt)=>{
        ensure(state.calls.length<p.max_calls,'call-budget');const before=await tree(root),beforeHead=await git(root,['rev-parse','HEAD']);
        const r=await actorImpl(runtime,prompt,{ms:p.actor_timeout_ms,onStart:async info=>{task.active_call={stage,...info};await persist();console.log(JSON.stringify({event:'actor-start',task:s.id,stage}));}});
        r.stage=stage;r.task=s.id;state.calls.push(r);delete task.active_call;await persist();
        try{r.protected_drift=scopeChanges(before,await tree(root),file=>stage==='build'||stage==='repair'?s.files.includes(file):false);ensure(await git(root,['rev-parse','HEAD'])===beforeHead,'actor-git-head-drift');}catch(e){r.inventory_failure=e.message;r.protected_drift??=['unreadable-or-unsafe-inventory'];r.status='stopped';}await persist();
        ensure(r.status==='completed'&&r.server_exit_confirmed&&r.terminals_empty&&!r.protected_drift.length,'actor-incomplete-or-scope-drift');return r;
      };
      for(let attempt=0;attempt<=p.repairs_per_task;attempt++){
        const a={number:attempt};task.attempts.push(a);
        a.build=state.calls.length;
        const b=await actor(attempt?'repair':'build',`Read CURRENT.md and its repository sources, then complete the current task. ${attempt?'Repair the retained findings: '+JSON.stringify(task.attempts.at(-2).findings):''} Run node --test test/*.test.mjs. Return decision, summary and findings. Do not change scope or ask for routine permission.`);
        if(b.completion.decision!=='pass'){a.findings=[b.completion.summary,...b.completion.findings];await persist();ensure(b.completion.decision==='fail'&&attempt<p.repairs_per_task,'developer-reported-blocker-or-repair-exhausted');continue;}
        await git(root,['add','.'],state.commands);await git(root,['commit','--allow-empty','-m',`Capture ${s.id} candidate ${attempt}`],state.commands);const revision=await git(root,['rev-parse','HEAD']);a.revision=revision;
        const evidence=`.ai-org/artifacts/${wi.id}/build-${attempt}.json`,request=`.ai-org/artifacts/${wi.id}/build-finish-${attempt}.json`;
        await save(path.join(root,evidence),b);await save(path.join(root,request),{operation_id:`build-${attempt}`,stage:'build',position:'developer',revision,completed:[b.completion.summary],evidence:[evidence],satisfied:{}});
        const check=await d('check','developer');a.fixed_check=check.check;
        if(!check.check.accepted){a.findings=['Fixed check failed',check.check];await persist();ensure(attempt<p.repairs_per_task,'fixed-check-rejected');continue;}
        ensure((await d('finish','developer',request)).finish.success,'build-finish');
        await d('open','quality_evaluator',planRef);
        a.review=state.calls.length;const q=await actor('verify',`You are agent-riley, an independent reviewer distinct from agent-casey. Read CURRENT.md, SPEC.md, HANDOFF.md and actual source/tests. Judge all required behavior, edge cases and earlier regressions. Run tests. Do not edit files or perform lifecycle writes. Return pass/fail/blocked with actionable findings; a previous test pass is not proof of this candidate. ${index===1?'Also verify reuse of the validated Lesson and quantity parser.':''}`);
        a.objective=await objective(root,s,lab,`${s.id}-${attempt}`);a.findings=[...q.completion.findings,...(a.objective.passed?[]:[a.objective.diagnostic])];a.accepted=q.completion.decision==='pass'&&a.objective.passed;
        await persist();
        if(!a.accepted){
          ensure(attempt<p.repairs_per_task,'review-rejected-after-repair');const ref=`.ai-org/artifacts/${wi.id}/rework-${attempt}.json`,note=`.ai-org/artifacts/${wi.id}/findings-${attempt}.json`;
          await save(path.join(root,note),a.findings);await save(path.join(root,ref),{revision,reason:a.findings.length?a.findings:['Independent reviewer rejected'],evidence:[note]});await d('rework','quality_evaluator',ref);await d('open','developer',planRef);continue;
        }
        const reviewRef=`.ai-org/artifacts/${wi.id}/review-${attempt}.json`;await save(path.join(root,reviewRef),{reviewer:'agent-riley',candidate:revision,result:q,objective:a.objective});
        const stages=s.profile==='lean'?[['test','quality_evaluator',{test_evidence:[reviewRef],lean_closeout:[reviewRef]}]]:[['test','quality_evaluator',{test_evidence:[reviewRef]}],['eval','quality_evaluator',{evaluation_report:[reviewRef]}],['independent_qa','independent_qa',{independent_qa_pass:[reviewRef]}],['release_gate','release_manager',{accepted_scope:[briefRef],test_evidence:[reviewRef],evaluation_report:[reviewRef],independent_qa_report:[reviewRef]}]];
        // Prepare requests before checking to keep the exact visible snapshot stable.
        for(const [stage,position,satisfied] of stages)await save(path.join(root,`.ai-org/artifacts/${wi.id}/${stage}-${attempt}.json`),{operation_id:`${stage}-${attempt}`,stage,position,revision,judgment:'pass',satisfied,...(stage==='release_gate'?{approval:briefRef,rollback:['Discard this local synthetic candidate; no remote or deployment exists.']}: {})});
        for(const [stage,position] of stages){await d('open',position,planRef);if(stage==='test'||stage==='release_gate')ensure((await d('check',position)).check.accepted,'review-fixed-check');const ref=`.ai-org/artifacts/${wi.id}/${stage}-${attempt}.json`;const finished=await d('finish',position,ref);ensure(finished.finish.success,`finish-${stage}`);}
        task.status='accepted';task.revision=revision;task.elapsed_ms=Date.now()-task.started_ms;task.report=await c('delivery','report','--work-item',wi.id);ensure(task.report.lifecycle_state==='done','not-done');break;
      }
      if(index===0){
        const acceptedReview=`.ai-org/artifacts/${wi.id}/review-${task.attempts.at(-1).number}.json`;
        await c('learning','add-lesson','--title','Strict ASCII quantity strings without coercion','--summary','Quantity inputs must be primitive ASCII digit strings and safe integers. Reject whitespace, exponent notation, numbers and objects before conversion. Reuse parseQuantity in dependent invoice calculations.','--confidence','medium','--tag','quantity','--applies-to','invoice','--source-work-item',wi.id,'--evidence',acceptedReview,'--actor','agent-riley');
        const idx=await read(path.join(root,'.ai-org/learning/index.json'));state.lesson_id=idx.entries.find(x=>x.kind==='lesson').id;
        await c('learning','revalidate','--learning-id',state.lesson_id,'--result','confirmed','--evidence',acceptedReview,'--actor','agent-riley');
        const note=`.ai-org/artifacts/${wi.id}/learning-review.md`;await save(path.join(root,note),'# Reviewed outcome\nStrict quantity boundary reproduced by public tests, independent review and frozen edge checks. Applicable to dependent invoice inputs only.\n');
        await c('learning','record-review','--work-item',wi.id,'--revision',task.revision,'--result','linked-lessons','--actor','agent-riley','--evidence',note,'--learning-id',state.lesson_id);
        state.learning={relevant:await learningProbe(root,'strict ASCII quantity invoice'),unrelated:await learningProbe(root,'zebrafish astronomy')};ensure(state.learning.relevant.includes(state.lesson_id)&&state.learning.unrelated.length===0,'learning-route');
      }
      if(index===1){state.learning.agent_application=state.calls[task.attempts.at(-1).build].completion.summary;ensure(state.learning.agent_application.includes(state.lesson_id),'lesson-application-not-reported');}
      await git(root,['add','.'],state.commands);await git(root,['commit','-m',`Archive ${s.id} evidence and checkpoint`],state.commands);await persist();console.log(JSON.stringify({event:'task-complete',task:s.id,status:task.status}));
    }
    const controlRef='learning-negative-control.md';await save(path.join(root,controlRef),'# Synthetic invalidation control\nAfter all live tasks, deliberately mark this fixture Lesson contradicted to test retrieval exclusion. This is an injected control, not a discovered contradiction of the quantity contract.\n');
    state.learning.invalidation_kind='synthetic-control';await c('learning','revalidate','--learning-id',state.lesson_id,'--result','contradicted','--evidence',controlRef,'--actor','agent-riley');state.learning.contradicted=await learningProbe(root,'strict ASCII quantity invoice');ensure(!state.learning.contradicted.includes(state.lesson_id),'contradicted-learning-routed');
    state.doctor=await c('doctor','--compact');ensure(state.doctor.summary.fail===0,'final-doctor');state.status='completed';
  }catch(e){state.status='stopped';state.failure=e.message;const task=state.tasks.at(-1);if(task?.status==='running')task.status='stopped';
    // Preserve claims when any actual execution cleanup is uncertain.
    const last=state.calls.at(-1);if(activeId&&!task?.active_call&&(!last||last.server_exit_confirmed&&last.terminals_empty))try{const wi=await read(path.join(root,`.ai-org/work-items/${activeId}.json`));const session=await readSession(root,activeId).catch(e=>{if(e.code==='ENOENT')return null;throw e;});ensure(!session?.pending,'pending-delivery-needs-reconciliation');if(wi.claim?.status==='active')await c('work-item','release','--work-item',activeId,'--agent-id',wi.claim.agent_id,'--reason','Retained stopped qualification; actor cleanup confirmed');state.cleanup='claim-released';}catch{state.cleanup='reconciliation-required';}
  }finally{await persist();}
  return state;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [action,lab,digest]=process.argv.slice(2);try{const r=action==='prepare'?await prepare(lab):action==='offline'?await offline(lab):action==='run'?await run(lab,digest):null;ensure(r,'Use prepare [parent], offline <lab>, run <lab> <digest>');console.log(JSON.stringify(r,null,2));if(['failed','stopped'].includes(r.status))process.exitCode=1;}catch(e){console.error(e.stack);process.exitCode=1;}
}
