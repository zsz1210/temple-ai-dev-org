// Repository-only experiment coordinator. No framework default is changed.
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {matrixEnvironment,installLean,checkFiles,modelPreflight,gradeProduct,closeLean,matrixPrompt} from './delivery-matrix-experiment.mjs';
import {write,read,tree,git,run,seed,cli,runActor,runtimeFor,scopeChanges,fatal,acquireRun} from './autonomy-experiment.mjs';
import {docFixture} from './real-doc-check-fixture.mjs';
import {interruptionAccountingSupport,runInterruptedActor} from './interruption-actor.mjs';
import {bufferedBudget,bufferedMeasurement,validateBufferedBudget,reservePhase,budgetWarning,cleanCellBudgetStop,bufferedFaults} from './lean-interruption-budget.mjs';

const source=path.resolve(import.meta.dirname,'..');
export const digest=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const assert=(ok,reason)=>{if(!ok)throw Error(reason);};
export const interruptionLimits=Object.freeze({model:'gpt-5.6-terra',effort:'medium',cells:3,cell_tokens:180000,cell_ms:900000,qa_tokens:40000,qa_ms:240000,qualification_tokens:20000,qualification_ms:120000});
export const treatments=Object.freeze(['autonomous','lean-current','lean-compact']);
export const behaviorMeasurement=Object.freeze({id:'authorized-behavior-lower-bound/v1',initial_tokens:20000,initial_ms:120000,max_calls_per_cell:5,max_calls_total:15,exact_total_cost:false,extra_qualification:false});
export const productEditable=p=>/^src\/doc-[^/]+\.mjs$/u.test(p)||p==='test/additional.test.mjs';
const obligations=Object.freeze({authority:'SPEC.md is current approved scope and acceptance; repository facts outrank old claims and conversation.',identity:'Developer agent-casey under human authorization; a distinct agent-riley Verifier judges the exact candidate.',scope:'Only src/doc-*.mjs and test/additional.test.mjs are writable. Preserve accepted src/files.mjs and every supplied test, requirement, instruction and history file.',boundary:'Local reversible utility work only. No network, external writes, secrets, installations, permission changes, subagents, publishing or deployment. No symlinked product or instruction files; disposable symlink test fixtures inside owned temporary space are allowed.',ownership:'The coordinator owns the active claim, Git, evidence, handoff, transitions and closeout. Do not perform those administrative writes.',recovery:'On fresh takeover inspect SPEC.md, RECOVERY.json if present and actual files. Previous verification applies only to its recorded revision and scope; verify the current candidate.',delivery:'Choose your own implementation process, add meaningful regression tests and run node --test test/*.test.mjs after final changes.',stop:'If authority, scope, ownership or safety is unclear, report the specific blocker. Do not expand scope or declare acceptance from your own completion claim.'});
export function compactContract(){return '# Experimental coordinator-owned Lean execution contract\n\n'+Object.values(obligations).map(s=>s+'\n').join('\n');}
export function executionPrompt(treatment){
  assert(treatments.includes(treatment),'unknown-treatment');
  const common='Implement the current SPEC.md goal in this isolated repository, preserving supplied behavior and files. You own design choices, investigation, implementation and self-tests. Edits are only src/doc-*.mjs and test/additional.test.mjs. Add meaningful regression tests and verify current behavior. The coordinator owns routine Git and lifecycle writes; a distinct blind product Verifier judges the candidate. Do not stop merely to report a plan.';
  if(treatment==='autonomous')return common;
  if(treatment==='lean-current')return common+' This is eligible Temple Lean Build, Developer agent-casey. Read TEMPLE.md and applicable instructions. Preview node ./templew.mjs context resolve . --work-item WI-0001 --position developer --compact --no-write --json, then read required routed bodies. Do not duplicate coordinator-owned administrative writes.';
  return common+' This is the explicitly scoped compact-context Lean candidate. Follow the native experimental contract and SPEC.md; coordinator owns framework administration. No framework default or higher-risk gate is changed.';
}
export function contextParity(){return {scope:'Only this fixed low-risk coordinator-owned fixture',obligations,compact_contract_sha256:digest(compactContract()),compact_contract_bytes:Buffer.byteLength(compactContract()),formal_general_equivalence:false,coordinator_retains_full_framework:true};}
export async function applyCompactContract(root){
  const lock=await read(root,'temple.lock');
  assert(!Object.hasOwn(lock.managed_files,'AGENTS.md'),'native-instructions-framework-managed');
  const before=await tree(root),original=await fs.readFile(path.join(root,'AGENTS.md'),'utf8');
  const override='\n# Explicit instruction candidate for this experiment only\nThe following narrower project contract delegates all framework administration to the coordinator. For this approved local product assignment it replaces the actor requirement to read TEMPLE.md, discover administrative Skills or resolve lifecycle context. Those full sources remain unchanged and govern the coordinator. Current SPEC.md and the contract below retain the actor obligations. Any work outside this bounded contract stops for the coordinator; this is not a general Temple policy change.\n\n'+compactContract();
  await fs.appendFile(path.join(root,'AGENTS.md'),override);
  const after=await tree(root);
  for(const p of Object.keys(lock.managed_files))assert(before[p]===after[p],'managed-file-drift');
  const doctor=await cli(root,'doctor');assert(doctor.summary.fail===0,'compact-doctor');
  return {original_native_bytes:Buffer.byteLength(original),candidate_native_bytes:Buffer.byteLength(original+override),original_native_sha256:digest(original),candidate_native_sha256:digest(original+override),managed_files_unchanged:true,doctor:doctor.summary,...contextParity()};
}
async function binaryDigest(file){const h=createHash('sha256');for await(const chunk of createReadStream(file))h.update(chunk);return h.digest('hex');}
const sourceFiles=['scripts/lean-interruption-experiment.mjs','scripts/interruption-actor.mjs','scripts/real-doc-check-fixture.mjs','scripts/delivery-matrix-experiment.mjs','scripts/autonomy-experiment.mjs','scripts/continuity-live-runner.mjs','scripts/continuity-named-permissions.mjs','scripts/delivery-control-pair.mjs','src/codex-app-server-provider.mjs','src/app-server-protocol-replay.mjs','.ai-org/artifacts/WI-0257/design.md','.ai-org/artifacts/WI-0257/measurement-amendment.md'];
async function sourceDigest(){return digest(await Promise.all([...sourceFiles,'scripts/lean-interruption-budget.mjs','.ai-org/artifacts/WI-0260/plan.md'].map(async p=>[p,digest(await fs.readFile(path.join(source,p)))])));}
export async function prepareInterruption({measurement='exact-cost'}={}){
  assert(['exact-cost',behaviorMeasurement.id,bufferedMeasurement.id].includes(measurement),'unknown-measurement');
  const buffered=measurement===bufferedMeasurement.id,selected=buffered?bufferedMeasurement.selected_treatments:treatments;
  if(buffered)validateBufferedBudget(bufferedBudget);
  const {lab,bundle,base,isolation}=await matrixEnvironment('temple-lean-interruption-');
  const native={node:{path:process.execPath,version:process.version,sha256:await binaryDigest(process.execPath)},codex:{path:base.binary,version:await run(source,base.binary,['--version']),sha256:await binaryDigest(base.binary)}};
  const controls=[],tests=['oracle.test.mjs',...Object.keys(docFixture.publicTests)];
  for(const[kind,files,name]of [['seed',docFixture.seed],['reference',docFixture.reference],...docFixture.mutations.map(m=>['mutation',{...docFixture.reference,...m.files},m.name])])controls.push({kind,...(name?{name}:{}),...await checkFiles(files,docFixture,base,lab,'doc-control',tests)});
  assert(controls.every(c=>!c.invalid_execution&&!c.timed_out&&c.cancelled===0&&(c.kind==='reference'?c.exit_code===0&&c.tests>0:c.exit_code!==0&&c.failures>0)),'doc-controls-unqualified');
  const cells=[];
  for(const treatment of selected){
    const root=path.join(lab,treatment);await seed(root,docFixture);
    for(const[p,body]of Object.entries(docFixture.treatmentFiles??{}))await write(root,p,body);
    let context=null;
    if(treatment!=='autonomous'){
      await installLean(root,lab,{...docFixture,editablePaths:['src/doc-*.mjs','test/additional.test.mjs']});
      if(treatment==='lean-compact')context=await applyCompactContract(root);
    }else await write(root,'AGENTS.md','# Autonomous bounded utility delivery\n'+Object.values(obligations).join('\n')+'\n');
    await git(root,'add','.');await git(root,'commit','--allow-empty','-m','Freeze '+treatment+' instruction treatment');
    cells.push({id:treatment,treatment,model:interruptionLimits.model,effort:'medium',root,context,prompt_sha256:digest(executionPrompt(treatment)),prompt_bytes:Buffer.byteLength(executionPrompt(treatment)),seed_manifest:await tree(root),base_revision:await git(root,'rev-parse','HEAD')});
  }
  const preflight=await modelPreflight(base,cells[0]),support=interruptionAccountingSupport();
  assert(native.codex.version.trim()===support.inspected_provider,'accounting-provider-version-drift');
  const commonFiles=['SPEC.md','README.md',...Object.keys(docFixture.seed),...Object.keys(docFixture.publicTests)];
  const commonManifest=cells[0].seed_manifest;
  for(const cell of cells)for(const p of commonFiles)assert(commonManifest[p]&&cell.seed_manifest[p]===commonManifest[p],'treatment-product-or-facts-drift:'+p);
  let historical=null;
  if(buffered){
    const prior=await read(source,'.ai-org/artifacts/WI-0257/behavior-final-manifest.json'),results=await read(source,'.ai-org/artifacts/WI-0257/behavior-results.json');
    assert(prior.fixture_digest===digest(docFixture),'historical-fixture-drift');
    for(const cell of cells)for(const p of commonFiles)assert(cell.seed_manifest[p]===prior.cells.find(c=>c.id===cell.id)?.seed_manifest[p],'historical-product-drift:'+p);
    historical={work_item:'WI-0257',manifest_sha256:digest(prior),results_sha256:digest(results),reused_treatment:'autonomous',relationship:'historical-reference-different-budget',observed_tokens_lower_bound:results.cells.reduce((n,c)=>n+behaviorTotals(c).observed_tokens_lower_bound,0),batch_wall_ms:Date.parse(results.finished_at)-Date.parse(results.started_at),exact_total_cost:false,outer_tokens:'unknown'};
  }
  const manifest={schema_version:'lean-interruption/v2',created_at:new Date().toISOString(),limits:interruptionLimits,measurement:buffered?bufferedMeasurement:measurement===behaviorMeasurement.id?behaviorMeasurement:{id:'exact-cost'},historical,fixture_digest:digest(docFixture),source_digest:await sourceDigest(),bundle_digest:digest(await tree(bundle)),native,isolation,preflight,accounting_support:support,context_parity:contextParity(),controls,base,cells};
  const allowed=buffered||measurement===behaviorMeasurement.id||support.complete_accounting;
  const state={status:allowed?'prepared':'blocked-before-generation',reason:allowed?null:'Native protocol cannot establish complete interrupted-turn usage',generation_requested:false,cells:[],events:[]};
  await write(lab,'manifest.json',manifest,true);await write(lab,'state.json',state,true);
  return {lab,digest:digest(manifest),state,native,isolation,preflight,accounting_support:support,controls,context:cells.find(c=>c.context)?.context};
}
export function assertAccountingLaunch(support){assert(support.complete_accounting===true,'interrupted-accounting-unqualified');}
export function assertBehaviorInterruption(r){
  assert(r.first_stop==='interrupted-final-usage-unobservable'&&r.generation_requested===true&&r.complete_accounting===false,'unexpected-interruption-stop');
  assert(r.interruption?.intentional===true&&r.interruption.requested===true&&r.interruption.acknowledged===true&&r.interruption.terminal_confirmed===true&&r.interruption.terminal_status==='interrupted'&&r.interruption.trigger?.files?.length>0,'unconfirmed-intentional-interruption');
  assert(r.terminals_empty===true&&r.server_exit_confirmed===true&&!r.cleanup_failure&&!r.interrupt_unconfirmed&&!r.interruption.terminal_unconfirmed,'interruption-cleanup-unconfirmed');
  assert(['unknown','observed-lower-bound'].includes(r.usage_status),'invalid-interrupted-accounting-label');
}
export function validateBehaviorManifest(m){
  const buffered=m.measurement?.id===bufferedMeasurement.id,contract=buffered?bufferedMeasurement:behaviorMeasurement,selected=buffered?bufferedMeasurement.selected_treatments:treatments;
  assert(m.schema_version==='lean-interruption/v2'&&digest(m.measurement)===digest(contract),'measurement-contract-drift');
  if(buffered)validateBufferedBudget(m.measurement.budget);
  assert(digest(m.limits)===digest(interruptionLimits),'limits-drift');
  assert(m.cells?.length===selected.length&&m.cells.every((c,i)=>c.id===selected[i]&&c.treatment===selected[i]&&c.model===interruptionLimits.model&&c.effort==='medium'&&c.prompt_sha256===digest(executionPrompt(c.treatment))),'treatment-drift');
}
export function behaviorTotals(r){
  const calls=[...r.turns,...r.qa];
  return {model_calls:calls.filter(c=>c.generation_requested).length,observed_tokens_lower_bound:calls.reduce((n,c)=>n+(c.usage?.operational_tokens??0),0),missing_usage_calls:calls.filter(c=>c.generation_requested&&!c.usage).length,exact_total_cost:false,actor_ms:calls.reduce((n,c)=>n+(c.actor_ms??c.elapsed_ms??0),0),call_elapsed_ms:calls.reduce((n,c)=>n+(c.elapsed_ms??0),0)};
}
// Effects are injected so bounded ordering, retention and refusal can be tested offline.
export async function runBehaviorCell(cell,ops,{budgetPlan=null}={}){
  if(budgetPlan)validateBufferedBudget(budgetPlan);
  const r={id:cell.id,treatment:cell.treatment,model:cell.model,status:'running',turns:[],qa:[],grades:[],accepted:false,repair_used:false,human_interventions:0,recovery:'not-observed'};
  const save=async()=>{Object.assign(r,behaviorTotals(r));await ops.save(r);};
  const budget=()=>{const b=behaviorTotals(r);return {tokens:interruptionLimits.cell_tokens-b.observed_tokens_lower_bound,ms:interruptionLimits.cell_ms-b.call_elapsed_ms};};
  const available=stage=>{const total=behaviorTotals(r);if(budgetPlan)return reservePhase(budgetPlan,stage,total.observed_tokens_lower_bound,total.call_elapsed_ms);const b=budget();assert(b.tokens>0&&b.ms>0&&total.model_calls<behaviorMeasurement.max_calls_per_cell,'cell-budget-exhausted');return b;};
  let lastCall=null;
  try{
    await save();const initial=await ops.initial(budgetPlan?available('initial'):null);lastCall=initial;r.turns.push(initial);await save();assertBehaviorInterruption(initial);
    r.checkpoint=await ops.checkpoint(initial);await save();
    r.recovery=r.checkpoint.accepted?'censored-already-accepted':'pending';
    let execution=initial;
    if(r.recovery==='pending'){
      execution=await ops.continue(available('recovery'),null);lastCall=execution;r.turns.push(execution);await save();
      assert(execution.thread_id!==initial.thread_id,'recovery-thread-reused');
      assert(!fatal(execution)&&execution.status==='completed','continuation-stop:'+execution.first_stop);
      await ops.capture(execution);await save();
    }
    for(let attempt=0;attempt<2;attempt++){
      const review=await ops.review(available(attempt?'rereview':'review'),execution);lastCall=review;r.qa.push(review);await save();
      assert(!fatal(review)&&review.status==='completed'&&!review.postprocess_failure&&!review.protected_drift?.length,'review-stop:'+review.first_stop);
      const gradeIndex=r.grades.length,g=await ops.grade(async partial=>{r.grades[gradeIndex]=partial;await save();});r.grades[gradeIndex]=g;
      const accepted=review.completion?.decision==='pass'&&g.accepted===true;
      if(attempt===0)r.first_pass=accepted;
      if(accepted){r.accepted=true;r.status='accepted';if(r.recovery==='pending')r.recovery='succeeded';break;}
      if(attempt===1){r.status='rejected';if(r.recovery==='pending')r.recovery='failed';break;}
      const feedback={review:review.completion,failed_cases:g.behavior?.failed_cases??[],added_test_requirement:g.regression?.exit_code===0};
      execution=await ops.continue(available('repair'),feedback);lastCall=execution;r.repair_used=true;r.turns.push(execution);await save();
      assert(!fatal(execution)&&execution.status==='completed','repair-stop:'+execution.first_stop);await ops.capture(execution);await save();
    }
  }catch(e){r.status='stopped';r.first_stop=e.message;r.underlying_stop=e.message==='downstream-reserve-unavailable'?e.message:lastCall?.first_stop??e.message;if(r.recovery==='pending')r.recovery='unresolved';}
  finally{await save();}
  return r;
}
const productFile=p=>p.startsWith('src/')||p.startsWith('test/');
async function product(root){const out={};for(const p of Object.keys(await tree(root)).filter(productFile))out[p]=await fs.readFile(path.join(root,p),'utf8');return out;}
export function opaqueReviewRoot(lab){return path.join(lab,'reviews',randomUUID());}
export async function gradeCheckpoint(root,base,lab,{check=checkFiles}={}){
  const files=await product(root);
  const behavior=await check(files,docFixture,base,lab,'checkpoint-behavior',['oracle.test.mjs',...Object.keys(docFixture.publicTests)]);
  return {accepted:behavior.exit_code===0&&behavior.tests>0&&behavior.cancelled===0&&!behavior.timed_out&&!behavior.invalid_execution,behavior,has_added_tests:Object.hasOwn(files,'test/additional.test.mjs'),criterion:'fixed-product-behavior-only'};
}
async function commit(root,message){await git(root,'add','.');await git(root,'commit','--allow-empty','-m',message);return git(root,'rev-parse','HEAD');}
async function releaseFixtureClaim(root){const item=await read(root,'.ai-org/work-items/WI-0001.json');if(item.claim?.status==='active')await cli(root,'work-item','release','--work-item','WI-0001','--agent-id',item.claim.agent_id,'--reason','Bounded subject stopped or completed');}
export async function executeInterruption(lab,expectedDigest){
  const m=await read(lab,'manifest.json'),state=await read(lab,'state.json');
  assert(digest(m)===expectedDigest,'manifest-drift');validateBehaviorManifest(m);
  const buffered=m.measurement.id===bufferedMeasurement.id,budgetPlan=buffered?m.measurement.budget:null;
  if(buffered)assert(m.historical?.results_sha256===digest(await read(source,'.ai-org/artifacts/WI-0257/behavior-results.json'))&&m.historical.manifest_sha256===digest(await read(source,'.ai-org/artifacts/WI-0257/behavior-final-manifest.json')),'historical-evidence-drift');
  assert(m.source_digest===await sourceDigest()&&m.fixture_digest===digest(docFixture),'source-drift');
  assert(m.bundle_digest===digest(await tree(m.base.readRoots[2])),'bundle-drift');
  assert(process.execPath===m.native.node.path&&await binaryDigest(process.execPath)===m.native.node.sha256&&await binaryDigest(m.base.binary)===m.native.codex.sha256,'native-runtime-drift');
  assert(state.status==='prepared'&&!state.cells.length&&!state.events.length,'already-started');
  for(const c of m.cells)assert(digest(await tree(c.root))===digest(c.seed_manifest)&&await git(c.root,'rev-parse','HEAD')===c.base_revision,'seed-drift');
  await acquireRun(lab);state.status='running';state.started_at=new Date().toISOString();
  const save=()=>{if(buffered){const current=state.cells.reduce((n,c)=>n+behaviorTotals(c).observed_tokens_lower_bound,0);state.cumulative={previous_subject_tokens_lower_bound:m.historical.observed_tokens_lower_bound,new_subject_tokens_lower_bound:current,subject_tokens_lower_bound:m.historical.observed_tokens_lower_bound+current,previous_batch_wall_ms:m.historical.batch_wall_ms,new_batch_wall_ms:Date.parse(state.finished_at??new Date().toISOString())-Date.parse(state.started_at),exact_total_cost:false,outer_tokens:'unknown'};}return write(lab,'state.json',state);};await save();
  try{for(const cell of m.cells){
    assert(digest(await tree(cell.root))===digest(cell.seed_manifest)&&await git(cell.root,'rev-parse','HEAD')===cell.base_revision,'seed-drift');
    const started=Date.now();let activeRoot=cell.root,before,partialTree,expectedHead,administrativeMs=0,gradingMs=0;
    const persist=async r=>{const i=state.cells.findIndex(c=>c.id===r.id);if(i<0)state.cells.push(r);else state.cells[i]=r;await save();};
    const start=stage=>async info=>{assert(state.events.length<(budgetPlan?.max_calls_total??behaviorMeasurement.max_calls_total),'cohort-call-limit');state.generation_requested=true;state.events.push({cell:cell.id,stage,at:new Date().toISOString(),...info});await save();console.log(JSON.stringify({event:'generation',cell:cell.id,stage}));};
    const budgetedCall=async(stage,budget,invoke)=>{
      const warnings=[];let timer;
      const warn=value=>{warnings.push(value);console.log(JSON.stringify({event:'budget-warning',cell:cell.id,...value}));};
      if(buffered)timer=setTimeout(()=>warn({stage,dimension:'time',action:'continue-within-buffer'}),budgetPlan.phases[stage].expected_ms);
      try{const r=await invoke(usage=>{if(buffered&&!warnings.some(w=>w.dimension==='tokens')){const warning=budgetWarning(budgetPlan,stage,usage.operational_tokens);if(warning)warn({...warning,dimension:'tokens'});}});if(buffered){r.budget={stage,...budgetPlan.phases[stage]};r.budget_warnings=warnings;}return r;}
      finally{clearTimeout(timer);}
    };
    if(cell.treatment!=='autonomous')await cli(activeRoot,'work-item','claim','--work-item','WI-0001','--agent-id','agent-casey','--principal-id','human','--base-revision',cell.base_revision,'--branch','main');
    administrativeMs+=Date.now()-started;before=await tree(activeRoot);expectedHead=await git(activeRoot,'rev-parse','HEAD');
    const capture=async r=>{assert(await git(activeRoot,'rev-parse','HEAD')===expectedHead,'actor-git-history-drift');r.protected_drift=scopeChanges(before,await tree(activeRoot),productEditable);assert(!r.protected_drift.length,'product-scope-drift');r.candidate_revision=await commit(activeRoot,'Capture exact bounded product candidate');expectedHead=r.candidate_revision;};
    const grade=async onProgress=>{const t=Date.now();try{return await gradeProduct(activeRoot,docFixture,m.base,lab,{onProgress});}finally{gradingMs+=Date.now()-t;}};
    const result=await runBehaviorCell(cell,{
      save:persist,
      initial:async budget=>budgetedCall('initial',budget,async onProgress=>runInterruptedActor(await runtimeFor(activeRoot,m.base),executionPrompt(cell.treatment),{tokens:budget?.tokens??behaviorMeasurement.initial_tokens,ms:budget?.ms??behaviorMeasurement.initial_ms,model:cell.model,effort:'medium',qualificationProbe:!buffered,experimentBudget:budgetPlan,onProgress,shouldInterrupt:metadata=>metadata.changes.some(c=>productEditable(c.path)),beforeGeneration:start('initial-interruption')})),
      checkpoint:async initial=>{
        await capture(initial);partialTree=await tree(activeRoot);
        await write(lab,'retained/'+cell.id+'/partial.json',{revision:initial.candidate_revision,files:partialTree,interruption:initial.interruption});
        await write(lab,'retained/'+cell.id+'/partial-product.json',await product(activeRoot));
        const checkpointStart=Date.now(),g=await gradeCheckpoint(activeRoot,m.base,lab);gradingMs+=Date.now()-checkpointStart;
        await write(activeRoot,'RECOVERY.json',{schema_version:'interruption-checkpoint/v1',approved_scope:'SPEC.md',checkpoint_revision:initial.candidate_revision,product_manifest:Object.fromEntries(Object.entries(partialTree).filter(([p])=>productFile(p))),trigger:initial.interruption.trigger,previous_verification:null});
        expectedHead=await commit(activeRoot,'Record machine-generated interruption checkpoint');
        const fresh=path.join(lab,'recovery',cell.id);await fs.mkdir(path.dirname(fresh),{recursive:true});
        const excluded=path.join(activeRoot,'.git','runtime-tmp');await fs.cp(activeRoot,fresh,{recursive:true,filter:p=>p!==excluded&&!p.startsWith(excluded+path.sep)});
        assert(digest(await tree(fresh))===digest(await tree(activeRoot)),'fresh-checkout-drift');
        const original=activeRoot;activeRoot=fresh;before=await tree(activeRoot);
        return {...g,partial_revision:initial.candidate_revision,original_root:original,recovery_root:fresh,equal_repository_facts:true};
      },
      continue:async(budget,feedback)=>budgetedCall(feedback?'repair':'recovery',budget,async onProgress=>runActor(await runtimeFor(activeRoot,m.base),executionPrompt(cell.treatment)+'\nFresh isolated session: inspect current SPEC.md, RECOVERY.json and actual files, then finish the same approved goal.'+(feedback?' This is the sole allowed repair. Address: '+JSON.stringify(feedback):''),{...budget,onProgress,model:cell.model,effort:'medium',beforeGeneration:start(feedback?'repair':'recovery')})),
      capture,
      review:async(budget,execution)=>{
        const target=opaqueReviewRoot(lab);await fs.mkdir(target,{recursive:true});
        for(const[p,body]of Object.entries({...await product(activeRoot),'SPEC.md':docFixture.spec,'package.json':JSON.stringify({type:'module'}),'AGENTS.md':'# Blind verification\nSPEC.md is acceptance. Verify without editing supplied files or reading execution history.\n'}))await write(target,p,body);
        const snapshot=await tree(target),r=await budgetedCall(budget.stage??'review',budget,async onProgress=>runActor(await runtimeFor(target,m.base),matrixPrompt(null,'review'),{tokens:buffered?budget.tokens:Math.min(budget.tokens,interruptionLimits.qa_tokens),ms:buffered?budget.ms:Math.min(budget.ms,interruptionLimits.qa_ms),onProgress,model:cell.model,effort:'medium',beforeGeneration:start(budget.stage??'review')}));
        r.candidate_revision=execution.candidate_revision;r.review_root=target;r.review_manifest_sha256=digest(snapshot);
        try{r.protected_drift=scopeChanges(snapshot,await tree(target),()=>false);}catch(e){r.postprocess_failure=e.message;}
        return r;
      },grade
    },{budgetPlan});
    if(buffered){result.shared_stop_reasons=bufferedFaults(result);if(result.shared_stop_reasons.length){result.status='stopped';result.first_stop??=result.shared_stop_reasons[0];}}
    try{assert(await git(activeRoot,'rev-parse','HEAD')===expectedHead,'actor-git-history-drift');result.protected_drift=scopeChanges(before,await tree(activeRoot),productEditable);assert(!result.protected_drift.length,'product-scope-drift');}
    catch(e){result.status='stopped';result.first_stop=e.message;result.underlying_stop=e.message;}
    result.final_revision=await git(activeRoot,'rev-parse','HEAD');result.final_root=activeRoot;
    const adminStart=Date.now();
    if(cell.treatment!=='autonomous'){
      try{result.lifecycle=await closeLean(activeRoot,result);}catch(e){result.lifecycle={closed:false,error:e.message};result.status='stopped';result.first_stop??='lifecycle-cleanup';}
      for(const root of new Set([activeRoot,cell.root]))try{await releaseFixtureClaim(root);}catch(e){result.claim_cleanup_error=e.message;result.status='stopped';result.first_stop??='claim-cleanup';}
      try{result.final_doctor=(await cli(activeRoot,'doctor')).summary;assert(result.final_doctor.fail===0,'final-fixture-doctor');}catch(e){result.status='stopped';result.first_stop??=e.message;}
    }
    administrativeMs+=Date.now()-adminStart;result.administrative_ms=administrativeMs;result.grading_ms=gradingMs;result.wall_ms=Date.now()-started;
    result.final_manifest=await tree(activeRoot);await write(lab,'retained/'+cell.id+'/product.json',await product(activeRoot));await persist(result);
    console.log(JSON.stringify({event:'cell-complete',cell:cell.id,status:result.status,recovery:result.recovery,observed_tokens_lower_bound:result.observed_tokens_lower_bound,actor_ms:result.actor_ms}));
    if(result.status==='stopped'&&!(buffered&&cleanCellBudgetStop(result)))throw Error(result.shared_stop_reasons?.[0]??result.first_stop);
  }state.status=state.cells.some(c=>c.status==='stopped')?'completed-with-cell-stops':'completed';}catch(e){state.status='stopped';state.first_stop=e.message;}finally{state.finished_at=new Date().toISOString();state.unrun=m.cells.map(c=>c.id).filter(id=>!state.cells.some(c=>c.id===id));await save();}
  return state;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{const [command,lab,expected]=process.argv.slice(2);let r;if(command==='prepare')r=await prepareInterruption();else if(command==='prepare-behavior')r=await prepareInterruption({measurement:behaviorMeasurement.id});else if(command==='prepare-buffered')r=await prepareInterruption({measurement:bufferedMeasurement.id});else if(command==='run')r=await executeInterruption(lab,expected);else throw Error('Use prepare, prepare-behavior, prepare-buffered or run <lab> <digest>');console.log(JSON.stringify(r,null,2));if(r.status==='stopped')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
}
