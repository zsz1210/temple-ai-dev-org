// Repository-only frozen diagnostic comparison. Never imported into a product worker.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {fixtures} from './autonomy-fixtures.mjs';
import {matrixEnvironment,modelPreflight,classifyMatrixCheck,gradeProduct} from './delivery-matrix-experiment.mjs';
import {isolatedOracleExecutor} from './continuity-live-runner.mjs';
import {write,read,tree,seed,git,runActor,runtimeFor,scopeChanges,acquireRun,fatal} from './autonomy-experiment.mjs';
import {digest,executionSourcePin} from './core-runtime-qualification.mjs';
import {runLocalChecks} from '../src/delivery-check.mjs';
import {subprocessEnvironment} from './delivery-control-pair.mjs';

const source=path.resolve(import.meta.dirname,'..'), exec=promisify(execFile);
const check=(ok,message)=>{if(!ok)throw Error(message);};
export const fixture=fixtures.find(f=>f.id==='feature');
export const settings=Object.freeze({schema_version:'temple.autonomous-diagnostic-settings/v1',
  question:'Does the common autonomous entry preserve accepted Standard delivery and reduce coordinator administration compared with the original individual CLI operations?',
  models:{build:'gpt-6-astra',verify:'gpt-5.6-terra'},effort:'medium',repetitions:1,
  modes:['temple-individual-cli','temple-autonomous-entry'],complexity:'multi-module',risk:'standard',workflow_profile:'standard',
  phases:{build:{stop_tokens:180000,reserve_tokens:220000,stop_ms:600000,reserve_ms:660000},verify:{stop_tokens:70000,reserve_tokens:90000,stop_ms:420000,reserve_ms:480000},
    repair:{stop_tokens:180000,reserve_tokens:220000,stop_ms:600000,reserve_ms:660000},reverify:{stop_tokens:70000,reserve_tokens:90000,stop_ms:420000,reserve_ms:480000}},
  setup:{tokens:0,time_ms:120000},cleanup:{tokens:40000,time_ms:120000},outer:{tokens:200000,time_ms:600000},ceilings:{tokens:1520000,time_ms:5520000,calls:8},
  repairs_per_cell:1,cache:'uncontrolled-descriptive-only',retry:false,fallback:false,resets:false,external_actions:false,
  required_mutations:['naive-csv','partial-import-before-validation','forget-existing-skus'],
  regression_qualification:'executed-registered-node-test-cases',
  baseline_revision:'1870f5d1',authority_ref:'.ai-org/artifacts/WI-0282/brief.md'});
export function validateSettings(s){
  check(digest(s)===digest(settings),'settings-drift');
  const phases=Object.values(s.phases);
  check(phases.every(p=>p.stop_tokens<p.reserve_tokens&&p.stop_ms+20000<=p.reserve_ms),'missing-phase-buffer');
  check(s.ceilings.tokens===2*(phases.reduce((n,p)=>n+p.reserve_tokens,0)+s.cleanup.tokens)+s.outer.tokens,'aggregate-token-buffer');
  check(s.ceilings.time_ms===2*(phases.reduce((n,p)=>n+p.reserve_ms,0)+s.cleanup.time_ms)+s.outer.time_ms+s.setup.time_ms,'aggregate-time-buffer');
  return true;
}
const editable=p=>p.startsWith('src/')||p==='test/additional.test.mjs';
const buildPrompt='Read SPEC.md and implement its complete approved behavior. You own design, investigation, decomposition, implementation and self-tests. Preserve supplied files; edit only src/** and test/additional.test.mjs. Add meaningful regression tests covering the requirements. Register executable node:test cases against the public contract; do not suppress the suite based on implementation-specific details. Run node --test test/*.test.mjs after final changes. The Temple coordinator owns Git, claims, lifecycle and evidence records; do not duplicate those writes. Continue to the completed candidate or a real blocker. Return decision, summary and findings; a distinct reviewer accepts the result.';
const verifyPrompt='You are the independent reviewer, a different Agent Identity from Developer. Read SPEC.md and independently inspect src/** and tests. Run node --test test/*.test.mjs and challenge boundary cases, atomicity, regression coverage and input validation. Do not edit any supplied file. Report every actionable defect with reproduction details. One substantive review covers eligible Test, Eval and Independent QA responsibilities; do not create administrative artifacts. Return pass only when behavior and meaningful tests satisfy the complete specification.';
// Per-file summaries count registered cases on both pinned Node runtimes. The
// successful empty-file fallback has only a global summary. Do not depend on
// entryFile, which was added after the bundled runtime's Node version.
const registrationReporter=`import {tap} from 'node:test/reporters';
export default async function*(events){
  const files=new Map();
  async function* tracked(){for await(const event of events){
    const d=event.data;
    if(event.type==='test:summary'&&d.file&&d.counts)files.set(d.file,d.counts.tests-d.counts.skipped-d.counts.todo-d.counts.cancelled);
    yield event;
  }}
  yield* tap(tracked());
  const executed=[...files.values()].reduce((n,count)=>n+count,0);
  yield '# temple_registered_executed '+executed+'\\n';
}`;
export async function checkDiagnosticFiles(files,f,base,lab,label,tests,{executor=isolatedOracleExecutor}={}){
  const root=path.join(lab,'checks',label+'-'+randomUUID());await fs.mkdir(root,{recursive:true});
  const material={...files,...f.publicTests,'package.json':JSON.stringify({type:'module'}),'registration-reporter.mjs':registrationReporter};
  if(tests.includes('oracle.test.mjs'))material['oracle.test.mjs']=f.hiddenTests;
  for(const[p,body]of Object.entries(material))await write(root,p,body);
  const result=await executor(base,root,process.execPath,['--test','--test-timeout=1000','--test-reporter=./registration-reporter.mjs',...tests],{timeout:4000,maxBuffer:256*1024});
  const count=[...result.stdout.matchAll(/^# temple_registered_executed (\d+)$/gm)].at(-1)?.[1];
  check(count!==undefined,'registered-test-observation-missing');
  return {...classifyMatrixCheck(result),registered_executed_cases:Number(count)};
}
export async function command(root,runtime,args,observations){
  const start=Date.now();let result;
  const split=['work-item','delivery'].includes(args[0])?2:1;
  try{result=await exec(process.execPath,[path.join(runtime,'bin/temple.mjs'),...args.slice(0,split),root,...args.slice(split),'--json'],{cwd:source,env:subprocessEnvironment(),timeout:120000,maxBuffer:3*1024*1024});}
  catch(e){observations?.push({command:args.slice(0,2),elapsed_ms:Date.now()-start,exit_code:e.code??null});throw e;}
  observations?.push({command:args.slice(0,2),elapsed_ms:Date.now()-start,exit_code:0});return JSON.parse(result.stdout);
}
async function baselineRuntime(lab){
  const target=path.join(lab,'baseline-runtime');await fs.mkdir(target);
  const archive=path.join(lab,'baseline.tar');
  await exec('git',['archive','--format=tar','--output',archive,settings.baseline_revision,'bin','src','project-overlay','packs','package.json'],{cwd:source});
  await exec('/usr/bin/tar',['-xf',archive,'-C',target]);await fs.rm(archive);
  for(const p of ['ajv','ajv-formats','fast-deep-equal','fast-uri','json-schema-traverse','require-from-string'])await fs.cp(path.join(source,'node_modules',p),path.join(target,'node_modules',p),{recursive:true});
  return target;
}
export async function installControl(root,lab,runtime,selectedFixture=fixture,options={}){
  const fixture=selectedFixture;
  await seed(root,fixture);
  const config=await read(source,'docs/getting-started/temple-init.example.json');
  config.project={id:'autonomous-diagnostic',name:'Synthetic autonomous delivery diagnostic'};
  config.repository_integration={schema_version:'temple.repository-integration/v1',status:'confirmed',authority:'project',source:'human-confirmed',policy_refs:[],summary:'Approved local diagnostic; coordinator owns fixed administration',integration_target:'main',change_isolation:'not-required',review_gate:'not-required',recorded_at:new Date().toISOString(),recorded_by:'human'};
  const configRef=path.join(lab,path.basename(root)+'-init.json');await fs.writeFile(configRef,JSON.stringify(config));
  await exec(process.execPath,[path.join(runtime,'bin/temple.mjs'),'init',root,'--config',configRef],{cwd:source,env:subprocessEnvironment(),timeout:30000});
  const c=(...args)=>command(root,runtime,args);
  const created=await c('work-item','create','--title',fixture.title,'--scope','Implement SPEC.md in the isolated local inventory fixture','--acceptance','Specification, objective oracle, preserved public tests and meaningful regression tests pass','--affected-path','src','--affected-path','test/additional.test.mjs','--ui-mode','not-applicable','--workflow-profile','standard','--risk-tier',options.risk??'standard','--scope-class',options.scopeClass??'ordinary');
  const id=created.item.id;
  for(const [to,gates]of [['spec',['work_order']],['design',['approved_scope','acceptance_criteria']],['build',['technical_design','risk_review']]])await c('transition','--work-item',id,'--to',to,...gates.flatMap(g=>['--satisfy',`${g}=SPEC.md`]));
  const plan={schema_version:'temple.delivery-plan/v2',execution_mode:'autonomous',check_policy:'confined-node',authorization_ref:'SPEC.md',tests:[...Object.keys(fixture.publicTests),'test/additional.test.mjs'],test_timeout_ms:30000,
    budget:{elapsed_limit_ms:3600000,max_repairs:1,verification_reserve_ms:480000,repair_reserve_ms:660000,cleanup_reserve_ms:120000,token_limit:null,token_reserve:0}};
  await write(root,'delivery-plan.json',plan);await git(root,'add','.');await git(root,'commit','-m','Freeze approved Standard fixture');
  return {id,assignments:(await read(root,'.ai-org/project/assignments.json')).assignments};
}
export async function prepareDiagnostic({rehearsal=false}={}){
  validateSettings(settings);
  const env=await matrixEnvironment('temple-unified-diagnostic-'),{lab,base,bundle}=env;
  const previous=await baselineRuntime(lab),cells=[];
  for(const [index,mode]of settings.modes.entries()){
    const root=path.join(lab,`product-${index}`),control=path.join(lab,`control-${index}`),runtime=index===0?previous:bundle;
    await seed(root,fixture);await write(root,'AGENTS.md','# Temple delegated product work\nSPEC.md is approved. Choose implementation methods freely within scope. The separate Temple coordinator owns authority, bookkeeping and independent acceptance. No external actions.\n');
    await git(root,'add','.');await git(root,'commit','-m','Freeze equal product instructions');
    const installed=await installControl(control,lab,runtime);
    const preflight=await modelPreflight(base,{root});
    cells.push({mode,root,control,runtime,...installed,preflight,seed:await tree(root),control_seed:await tree(control)});
  }
  const controls=[];
  for(const [kind,files]of [['seed',fixture.seed],['reference',fixture.reference]])controls.push({kind,...await checkDiagnosticFiles(files,fixture,base,lab,'qualification',['oracle.test.mjs',...Object.keys(fixture.publicTests)])});
  check(controls.every(c=>!c.invalid_execution&&!c.timed_out&&c.tests>0&&c.registered_executed_cases>0&&(c.kind==='reference'?c.exit_code===0:c.exit_code!==0&&c.failures>0)),'oracle-qualification-failed');
  const protocol={schema_version:'temple.autonomous-diagnostic/v1',execution_kind:rehearsal?'offline-rehearsal':'live-diagnostic',settings,source_pin:await executionSourcePin(),fixture_sha256:digest(fixture),base,base_sha256:digest(base),
    runtimes:{baseline:digest(await tree(previous)),candidate:digest(await tree(bundle))},cells,controls,baseline_revision:(await exec('git',['rev-parse',settings.baseline_revision],{cwd:source})).stdout.trim(),candidate_revision:(await exec('git',['rev-parse','HEAD'],{cwd:source})).stdout.trim(),
    prompt_sha256:{build:digest(buildPrompt),verify:digest(verifyPrompt)},authorization_sha256:digest(await fs.readFile(path.join(source,settings.authority_ref))),created_at:new Date().toISOString()};
  await write(lab,'protocol.json',protocol,true);
  return {lab,protocol_sha256:digest(protocol),controls,model_generation_performed:false};
}
export async function copyProduct(root,control){
  const subset=files=>Object.fromEntries(Object.entries(files).filter(([p])=>editable(p)));
  const product=subset(await tree(root)),previous=subset(await tree(control));
  for(const p of Object.keys(previous).filter(p=>!Object.hasOwn(product,p)))await fs.rm(path.join(control,p));
  for(const p of Object.keys(product)){await fs.mkdir(path.dirname(path.join(control,p)),{recursive:true});await fs.copyFile(path.join(root,p),path.join(control,p));}
  const expected=digest(product),actual=digest(subset(await tree(control)));
  check(expected===actual,'product-control-tree-mismatch');
  return {product_sha256:expected,control_sha256:actual};
}
export async function completeBuild(build,deliver){
  check(build?.completion?.decision==='pass','developer-incomplete-before-handoff');
  return deliver();
}
export function assessCandidate(entry,requiredMutations=settings.required_mutations){
  const grade=entry.grade,mutations=grade?.mutations??[];
  const missing=requiredMutations.filter(name=>!mutations.some(m=>m.name===name&&m.detected===true&&m.registered_executed_cases>0));
  const registered=grade?.reference_baseline?.registered_executed_cases>0&&grade?.regression?.registered_executed_cases>0;
  const qualified=registered&&grade?.mutation_status==='qualified'&&mutations.length===requiredMutations.length&&missing.length===0;
  return {accepted:entry.build?.completion?.decision==='pass'&&entry.review?.completion?.decision==='pass'&&grade?.accepted===true&&grade?.reference_baseline?.exit_code===0&&qualified,
    missing_mutation_behaviors:missing,mutation_controls_qualified:qualified,registered_regression_and_reference_cases:registered};
}
export async function retainGrade(entry,save,grade){
  try{entry.grade=await grade(async partial=>{entry.grade=partial;await save();});}
  catch(e){if(e.partialGrade)entry.grade=e.partialGrade;throw e;}
  finally{await save();}
}
export function accounting(calls){
  const known=calls.filter(c=>c.result?.usage_status==='observed-completed-turn'&&c.result.usage);
  const complete=known.length===calls.length;
  return {calls:calls.length,coverage:complete?'complete-for-recorded-calls':'incomplete',operational_tokens:complete?calls.reduce((n,c)=>n+c.result.usage.operational_tokens,0):null,
    gross_input:complete?calls.reduce((n,c)=>n+c.result.usage.input_tokens,0):null,cached_input:complete?calls.reduce((n,c)=>n+c.result.usage.cached_input_tokens,0):null,output:complete?calls.reduce((n,c)=>n+c.result.usage.output_tokens,0):null,
    operational_tokens_known_lower_bound:known.reduce((n,c)=>n+c.result.usage.operational_tokens,0),
    model_wrapper_ms:calls.every(c=>Number.isFinite(c.result?.elapsed_ms))?calls.reduce((n,c)=>n+c.result.elapsed_ms,0):null,
    model_wrapper_ms_known_lower_bound:calls.reduce((n,c)=>n+(c.result?.elapsed_ms??0),0),monetary_cost:null,outer_conversation_tokens:null};
}
export function admitPhase(s,cellIndex,phase,used,elapsed){
  const phases=Object.keys(s.phases),remaining=phases.slice(phases.indexOf(phase)).map(k=>s.phases[k]);
  check(phases.includes(phase)&&Number.isInteger(cellIndex)&&cellIndex>=0&&cellIndex<2,'invalid-admission');
  const future=1-cellIndex;
  const tokens=remaining.reduce((n,p)=>n+p.reserve_tokens,0)+s.cleanup.tokens+future*(Object.values(s.phases).reduce((n,p)=>n+p.reserve_tokens,0)+s.cleanup.tokens)+s.outer.tokens;
  const time=remaining.reduce((n,p)=>n+p.reserve_ms,0)+s.cleanup.time_ms+future*(Object.values(s.phases).reduce((n,p)=>n+p.reserve_ms,0)+s.cleanup.time_ms)+s.outer.time_ms;
  check(used!==null&&Number.isSafeInteger(used)&&used>=0&&used+tokens<=s.ceilings.tokens,'complete-downstream-token-reserve');
  check(Number.isSafeInteger(elapsed)&&elapsed>=0&&elapsed+time<=s.ceilings.time_ms,'complete-downstream-time-reserve');
  return {reserved_tokens:tokens,reserved_ms:time};
}
export async function stopDiagnostic(state,error,{cleanup,save=async()=>{},now=Date.now}={}){
  const active=state.cells.find(c=>c.status==='running');
  const call=active&&state.calls[active.calls.at(-1)],last=call?.result;
  state.status='stopped';
  state.failure=last?.first_stop??(/^[a-z0-9-]{1,100}$/.test(error.message)?error.message:'coordinator-failure');
  state.protocol_diagnostic=last?.protocol_diagnostic??null;
  if(!active)return;
  active.status='stopped';active.failure=state.failure;active.accepted=false;
  active.elapsed_ms=now()-active.started_at_ms;
  const attempt=active.attempts.at(-1);
  if(attempt?.status==='running'){attempt.status='stopped';attempt.failure=state.failure;}
  await save();
  // Cleanup is separate evidence, never acceptance or a replacement stop cause.
  const safeToRelease=!call||(last?.server_exit_confirmed===true&&!last?.cleanup_failure&&(last?.generation_requested===false||last?.terminals_empty===true));
  try{active.cleanup=!safeToRelease?{status:'blocked',reason:'actor-cleanup-unconfirmed'}:cleanup?await cleanup(active):{status:'not-attempted'};}
  catch{active.cleanup={status:'failed',reason:'claim-cleanup-unconfirmed'};}
  await save();
}
export async function releaseStoppedClaim(cell){
  const item=await read(cell.control,`.ai-org/work-items/${cell.id}.json`);
  if(item.claim?.status!=='active')return {status:'not-needed',stage:item.state};
  check(cell.assignments.some(a=>a.agent_id===item.claim.agent_id),'cleanup-owner-mismatch');
  await command(cell.control,cell.runtime,['work-item','release','--work-item',cell.id,'--agent-id',item.claim.agent_id,'--principal-id','human','--reason','Frozen diagnostic stopped; release ownership without acceptance']);
  const after=await read(cell.control,`.ai-org/work-items/${cell.id}.json`);
  check(after.state===item.state&&after.claim?.status==='released','claim-cleanup-unconfirmed');
  return {status:'released',stage:after.state,claim_id:after.claim.id};
}
export async function runDiagnostic(lab,expected,{actor=runActor}={}){
  const p=await read(lab,'protocol.json');validateSettings(p.settings);
  check(p.execution_kind==='offline-rehearsal'?actor!==runActor:p.execution_kind==='live-diagnostic'&&actor===runActor,'rehearsal-generation-boundary');
  check(digest(p)===expected&&(await executionSourcePin()).sha256===p.source_pin.sha256&&digest(fixture)===p.fixture_sha256,'frozen-input-drift');
  check(p.authorization_sha256===digest(await fs.readFile(path.join(source,settings.authority_ref))),'authorization-drift');
  check(digest(await tree(p.cells[0].runtime))===p.runtimes.baseline&&digest(await tree(p.cells[1].runtime))===p.runtimes.candidate,'runtime-drift');
  await acquireRun(lab);
  const state={schema_version:'temple.autonomous-diagnostic-result/v1',execution_kind:p.execution_kind,protocol_sha256:expected,status:'running',started_at:new Date().toISOString(),cells:[],unrun:p.cells.map(c=>c.mode),calls:[],external_actions:false};
  const save=()=>write(lab,'result.json',state);
  const start=Date.now();
  try{
    for(const cell of p.cells){
      check(digest(await tree(cell.root))===digest(cell.seed)&&digest(await tree(cell.control))===digest(cell.control_seed),'prepared-input-drift');
      const observation={mode:cell.mode,status:'running',commands:[],calls:[],attempts:[],accepted:false,started_at_ms:Date.now()};state.cells.push(observation);state.unrun=state.unrun.filter(x=>x!==cell.mode);await save();
      const actorId=position=>cell.assignments.find(a=>a.position_id===position&&a.active!==false).agent_id;
      const c=(...args)=>command(cell.control,cell.runtime,args,observation.commands);
      const d=(action,position,request)=>c('delivery',action,'--work-item',cell.id,'--agent-id',actorId(position),'--principal-id','human',...(request?['--request',request]:[]));
      const claim=async position=>c('work-item','claim','--work-item',cell.id,'--agent-id',actorId(position),'--principal-id','human','--base-revision',await git(cell.control,'rev-parse','HEAD'),'--branch','main');
      const settle=async(stage,request,attempt,revision)=>{
        const position=request.position,requestRef=`.ai-org/artifacts/${cell.id}/${stage}-request-${attempt}.json`;
        await write(cell.control,requestRef,{...request,stage,revision,operation_id:`experiment-${stage}-${attempt}`});
        if(cell.mode==='temple-autonomous-entry'){
          if(stage!=='build')await d('open',position,'delivery-plan.json');
          if(['build','test','release_gate'].includes(stage))check((await d('check',position)).check.accepted,'fixed-check-rejected');
          check((await d('finish',position,requestRef)).finish.success,'completion-diagnostics-failed');
        }else{
          if((await read(cell.control,`.ai-org/work-items/${cell.id}.json`)).claim?.status!=='active')await claim(position);
          if(['build','test','release_gate'].includes(stage)){const checked=await runLocalChecks(cell.control,cell.id,await read(cell.control,'delivery-plan.json'));observation.commands.push({command:['external-fixed-check'],elapsed_ms:checked.elapsed_ms,exit_code:checked.exit_code});check(checked.accepted,'fixed-check-rejected');}
          if(stage==='build')await c('handoff','--work-item',cell.id,'--to','quality_evaluator','--actor',actorId(position),'--input-revision',revision,'--completed',request.completed[0],'--evidence',request.evidence[0]);
          if(stage==='release_gate')await c('close','--work-item',cell.id,'--actor',actorId(position),'--decision','go','--tested-revision',revision,'--approval','SPEC.md','--rollback','Discard isolated fixture; no external effects',...Object.entries(request.satisfied).flatMap(([k,values])=>values.flatMap(v=>['--satisfy',`${k}=${v}`])));
          else{await c('work-item','release','--work-item',cell.id,'--agent-id',actorId(position),'--principal-id','human','--reason','Stage evidence recorded');const to={build:'test',test:'eval',eval:'independent_qa',independent_qa:'release_gate'}[stage];await c('transition','--work-item',cell.id,'--actor',actorId(position),'--to',to,...Object.entries(request.satisfied).flatMap(([k,values])=>values.flatMap(v=>['--satisfy',`${k}=${v}`])));}
          await c('status','--compact','--work-item',cell.id);const doctor=await c('doctor','--compact');check(doctor.healthy&&doctor.summary.warn===0,'legacy-diagnostics-failed');
        }
      };
      if(cell.mode==='temple-autonomous-entry')await d('open','developer','delivery-plan.json');else await claim('developer');
      let feedback=null;
      for(let attempt=0;attempt<=settings.repairs_per_cell;attempt++){
        const entry={attempt,status:'running',grade:null,review:null};observation.attempts.push(entry);
        for(const stage of [attempt?'repair':'build',attempt?'reverify':'verify']){
          const phase=settings.phases[stage],reviewing=['verify','reverify'].includes(stage);
          entry.phase=stage;
          const reservation=admitPhase(settings,p.cells.indexOf(cell),stage,accounting(state.calls).operational_tokens,Date.now()-start);
          let target=cell.root;
          if(reviewing){target=path.join(lab,`review-${state.calls.length}`);await fs.mkdir(target);for(const name of Object.keys(await tree(cell.root)).filter(n=>editable(n)||Object.hasOwn(fixture.publicTests,n)||['SPEC.md','package.json'].includes(n)))await write(target,name,await fs.readFile(path.join(cell.root,name),'utf8'));await write(target,'AGENTS.md','# Blind Temple verification\nVerify SPEC.md without editing supplied files or seeking other repositories.\n');}
          const before=await tree(target),runtime=await runtimeFor(target,p.base);
          const prompt=reviewing?verifyPrompt:buildPrompt+(feedback?'\nThis is the one permitted same-scope repair. Findings: '+JSON.stringify(feedback):'');
          const call={mode:cell.mode,stage,index:state.calls.length,result:null};state.calls.push(call);observation.calls.push(call.index);await save();
          call.result=await actor(runtime,prompt,{tokens:phase.stop_tokens,ms:phase.stop_ms,model:reviewing?settings.models.verify:settings.models.build,effort:settings.effort,
            beforeGeneration:async event=>{call.admission={...event,phase,reservation};await save();},onProgress:u=>process.stdout.write(JSON.stringify({mode:cell.mode,stage,...u})+'\n')});
          call.result.protected_drift=scopeChanges(before,await tree(target),reviewing?()=>false:editable);await save();
          check(!fatal(call.result)&&call.result.status==='completed'&&!call.result.protected_drift.length,'actor-or-isolation-failure');
          if(!reviewing){
            entry.build=call.result;
            await completeBuild(entry.build,async()=>{
            await git(cell.root,'add','src','test');await git(cell.root,'commit','--allow-empty','-m',`Candidate attempt ${attempt}`);entry.product_revision=await git(cell.root,'rev-parse','HEAD');
            await retainGrade(entry,save,onProgress=>gradeProduct(cell.root,fixture,p.base,lab,{onProgress,check:checkDiagnosticFiles}));
            entry.product_control=await copyProduct(cell.root,cell.control);await git(cell.control,'add','src','test');await git(cell.control,'commit','--allow-empty','-m',`Product attempt ${attempt}`);entry.control_revision=await git(cell.control,'rev-parse','HEAD');
            const devRef=`.ai-org/artifacts/${cell.id}/observed-build-${attempt}.json`;await write(cell.control,devRef,{revision:entry.control_revision,observation:entry.build,product_revision:entry.product_revision});
            await settle('build',{position:'developer',completed:[entry.build.completion.summary],evidence:[devRef],satisfied:{}},attempt,entry.control_revision);
            if(cell.mode==='temple-autonomous-entry')await d('open','quality_evaluator','delivery-plan.json');else await claim('quality_evaluator');
            await save();
            });
          }
          else entry.review=call.result;
        }
        entry.acceptance=assessCandidate(entry);entry.status=entry.acceptance.accepted?'accepted':'rejected';await save();
        if(entry.acceptance.accepted)break;
        if(attempt===settings.repairs_per_cell)throw Error('candidate-rejected-after-repair');
        feedback={review:entry.review.completion,objective:entry.grade.behavior.failed_cases,regression:entry.grade.regression,mutation_controls_qualified:entry.acceptance.mutation_controls_qualified,registered_regression_and_reference_cases:entry.acceptance.registered_regression_and_reference_cases,missing_mutation_behaviors:entry.acceptance.missing_mutation_behaviors};
        const findingsRef=`.ai-org/artifacts/${cell.id}/findings-${attempt}.json`,reworkRef=`.ai-org/artifacts/${cell.id}/rework-${attempt}.json`;
        await write(cell.control,findingsRef,{revision:entry.control_revision,feedback});
        if(cell.mode==='temple-autonomous-entry'){
          await write(cell.control,reworkRef,{revision:entry.control_revision,reason:['Candidate failed frozen independent acceptance'],evidence:[findingsRef]});await d('rework','quality_evaluator',reworkRef);await d('open','developer','delivery-plan.json');
        }else{await c('work-item','rework','--work-item',cell.id,'--same-scope','--actor',actorId('quality_evaluator'),'--input-revision',entry.control_revision,'--reason','Candidate failed frozen independent acceptance','--evidence',findingsRef);await claim('developer');}
      }
      const revision=await git(cell.control,'rev-parse','HEAD'),last=observation.attempts.at(-1),ref=`.ai-org/artifacts/${cell.id}/observed-review.json`;
      await write(cell.control,ref,{revision,judgment:last.review.completion,grade:last.grade,synthetic_local_only:true});
      const requests={test:{position:'quality_evaluator',judgment:'pass',satisfied:{test_evidence:[ref]}},eval:{position:'quality_evaluator',judgment:'pass',satisfied:{evaluation_report:[ref]}},independent_qa:{position:'independent_qa',judgment:'pass',satisfied:{independent_qa_pass:[ref]}},release_gate:{position:'release_manager',judgment:'pass',approval:'SPEC.md',rollback:['Discard isolated fixture; no external effects'],satisfied:{accepted_scope:['SPEC.md'],independent_qa_report:[ref]}}};
      for(const[stage,request]of Object.entries(requests))await write(cell.control,`.ai-org/artifacts/${cell.id}/${stage}-request-${last.attempt}.json`,{...request,stage,revision,operation_id:`experiment-${stage}-${last.attempt}`});
      for(const[stage,request]of Object.entries(requests)){
        await settle(stage,request,last.attempt,revision);
      }
      const final=await read(cell.control,`.ai-org/work-items/${cell.id}.json`);check(final.state==='done'&&final.lifecycle_outcome==='accepted','lifecycle-not-accepted');
      observation.accepted=true;observation.status='completed';observation.candidate_revision=revision;observation.elapsed_ms=Date.now()-observation.started_at_ms;await save();
    }
    state.status='completed';
  }catch(e){await stopDiagnostic(state,e,{save,cleanup:active=>releaseStoppedClaim(p.cells.find(c=>c.mode===active.mode))});}
  finally{state.elapsed_ms=Date.now()-start;state.accounting=accounting(state.calls);await save();}
  return state;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const action=process.argv[2];if(action==='prepare')console.log(JSON.stringify(await prepareDiagnostic(),null,2));
  else if(action==='run')console.log(JSON.stringify(await runDiagnostic(process.argv[3],process.argv[4]),null,2));
  else if(action==='rehearse'){
    const prepared=await prepareDiagnostic({rehearsal:true});let reviews=0;
    console.log(JSON.stringify(prepared));
    const result=await runDiagnostic(prepared.lab,prepared.protocol_sha256,{actor:async(runtime,prompt,options)=>{
      const reviewing=prompt===verifyPrompt;
      if(!reviewing){for(const[p,body]of Object.entries(fixture.reference))await write(runtime.root,p,body);await write(runtime.root,'test/additional.test.mjs',fixture.hiddenTests.replaceAll("'./src/","'../src/"));}
      await options.beforeGeneration({thread_id:'synthetic-no-generation',prompt_sha256:digest(prompt),prompt_bytes:Buffer.byteLength(prompt),developer_bytes:0});
      return {status:'completed',generation_requested:false,transport:'synthetic-rehearsal',completion:{decision:reviewing&&reviews++%2===0?'fail':'pass',summary:'Synthetic rehearsal only',findings:reviewing?['Synthetic reviewer control']:[]},usage_status:'observed-completed-turn',usage:{input_tokens:0,cached_input_tokens:0,output_tokens:0,operational_tokens:0},elapsed_ms:0,terminals_empty:true,server_exit_confirmed:true};
    }});console.log(JSON.stringify({lab:prepared.lab,status:result.status,failure:result.failure,model_generation_performed:false}));if(result.status!=='completed')process.exitCode=1;
  }
  else throw Error('Use prepare or run LAB DIGEST');
}
