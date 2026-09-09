// Repository-only experiment coordinator. Never imported into model product roots.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {fixtures} from './paired-entry-fixtures.mjs';
import {matrixEnvironment,modelPreflight,gradeProduct} from './delivery-matrix-experiment.mjs';
import {write,read,tree,seed,git,runActor,runtimeFor,scopeChanges,fatal} from './autonomy-experiment.mjs';
import {digest,executionSourcePin} from './core-runtime-qualification.mjs';
import {command,installControl,copyProduct,completeBuild,assessCandidate,retainGrade,accounting,checkDiagnosticFiles,stopDiagnostic,releaseStoppedClaim} from './autonomous-delivery-experiment.mjs';
import {runLocalChecks} from '../src/delivery-check.mjs';

const source=path.resolve(import.meta.dirname,'..');
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const editable=p=>p.startsWith('src/')||p==='test/additional.test.mjs';
const modes=['temple-individual-cli','temple-autonomous-entry'];
const stages=['build','verify','repair','reverify'];
const identifier=v=>typeof v==='string'&&/^[a-z][a-z0-9-]{0,39}$/.test(v);
const nonnegative=v=>Number.isSafeInteger(v)&&v>=0;
export const buildPrompt='Read SPEC.md and implement its complete approved behavior. You own design, investigation, decomposition, implementation and self-tests. Preserve supplied files; edit only src/** and test/additional.test.mjs. Add meaningful regression tests covering the requirements. Register executable node:test cases against the public contract; do not suppress the suite based on implementation-specific details. Run node --test test/*.test.mjs after final changes. The Temple coordinator owns Git, claims, lifecycle and evidence records; do not duplicate those writes. Continue to the completed candidate or a real blocker. Return decision, summary and findings; a distinct reviewer accepts the result.';
export const verifyPrompt='You are the independent reviewer, a different Agent Identity from Developer. Read SPEC.md and independently inspect src/** and tests. Run node --test test/*.test.mjs and challenge boundary cases, atomicity, regression coverage and input validation. Do not edit any supplied file. Report every actionable defect with reproduction details. One substantive review covers eligible Test, Eval and Independent QA responsibilities; do not create administrative artifacts. Return pass only when behavior and meaningful tests satisfy the complete specification.';

export function pairedCells(s){
  return s.scenarios.flatMap(scenario=>s.pair_orders.flatMap((order,pair)=>order.map((mode,position)=>({
    cell_id:`${scenario.id}-p${pair+1}-${mode}`,scenario_id:scenario.id,fixture_id:scenario.fixture,
    complexity:scenario.complexity,risk:scenario.risk,recovery:scenario.recovery,pair:pair+1,position,mode
  }))));
}
export function validatePairedSettings(s){
  ensure(s?.schema_version==='temple.paired-entry-settings/v1'&&typeof s.question==='string'&&s.question.trim(),'settings-schema');
  ensure(typeof s.authority_ref==='string'&&/^\.ai-org\/artifacts\/WI-\d+\/[a-z0-9-]+\.md$/.test(s.authority_ref),'authority-path');
  ensure(s.models?.build==='gpt-6-astra'&&s.models?.verify==='gpt-5.6-terra'&&s.effort==='medium','unqualified-model-settings');
  ensure(JSON.stringify(s.modes)===JSON.stringify(modes)&&s.workflow_profile==='standard'&&s.cache==='uncontrolled-descriptive-counterbalanced','mode-contract');
  ensure(s.concurrency===1&&s.repairs_per_cell===1&&['retry','fallback','resets','external_actions'].every(k=>s[k]===false),'execution-boundary');
  ensure(s.candidate_failure==='record-and-continue','candidate-failure-policy');
  ensure(Array.isArray(s.pair_orders)&&s.pair_orders.length===2&&s.pair_orders.every(o=>Array.isArray(o)&&o.length===2&&new Set(o).size===2&&o.every(m=>modes.includes(m)))&&s.pair_orders[0][0]!==s.pair_orders[1][0],'counterbalanced-order');
  ensure(Array.isArray(s.scenarios)&&s.scenarios.length>0&&s.scenarios.length<=3&&new Set(s.scenarios.map(x=>x.id)).size===s.scenarios.length,'scenario-count');
  ensure(s.scenarios.every(x=>identifier(x.id)&&fixtures.some(f=>f.id===x.fixture)&&['simple','multi-module'].includes(x.complexity)&&['low','standard'].includes(x.risk)&&typeof x.recovery==='boolean'),'scenario-contract');
  ensure(JSON.stringify(Object.keys(s.phases??{}))===JSON.stringify(stages),'phase-order');
  for(const p of Object.values(s.phases))ensure(['stop_tokens','reserve_tokens','stop_ms','reserve_ms'].every(k=>nonnegative(p[k])&&p[k]>0)&&p.stop_tokens<p.reserve_tokens&&p.stop_ms+20000<=p.reserve_ms,'phase-buffer');
  for(const p of [s.cleanup,s.outer,s.setup])ensure(p&&nonnegative(p.tokens)&&nonnegative(p.time_ms)&&p.time_ms>0,'downstream-buffer');
  ensure(s.cleanup.tokens>0&&s.outer.tokens>0&&s.setup.tokens===0,'outer-buffer');
  const cells=pairedCells(s),cellTokens=Object.values(s.phases).reduce((n,p)=>n+p.reserve_tokens,0)+s.cleanup.tokens;
  const cellMs=Object.values(s.phases).reduce((n,p)=>n+p.reserve_ms,0)+s.cleanup.time_ms;
  ensure(s.ceilings?.tokens===cells.length*cellTokens+s.outer.tokens&&s.ceilings?.time_ms===cells.length*cellMs+s.outer.time_ms+s.setup.time_ms&&s.ceilings?.calls===cells.length*stages.length,'aggregate-buffer');
  return {cells:cells.length,cell_tokens:cellTokens,cell_ms:cellMs,...s.ceilings};
}
export function pairedAdmission(s,index,phase,calls,elapsed,startIndex=0){
  validatePairedSettings(s);const cells=pairedCells(s),phaseIndex=stages.indexOf(phase);
  ensure(nonnegative(startIndex)&&startIndex<=index&&nonnegative(index)&&index<cells.length&&phaseIndex>=0&&nonnegative(elapsed),'admission-position');
  const limits=segmentLimits(s,startIndex);
  const observed=accounting(calls),future=cells.length-index-1,remaining=stages.slice(phaseIndex).map(k=>s.phases[k]);
  const tokens=remaining.reduce((n,p)=>n+p.reserve_tokens,0)+s.cleanup.tokens+future*(Object.values(s.phases).reduce((n,p)=>n+p.reserve_tokens,0)+s.cleanup.tokens)+s.outer.tokens;
  const ms=remaining.reduce((n,p)=>n+p.reserve_ms,0)+s.cleanup.time_ms+future*(Object.values(s.phases).reduce((n,p)=>n+p.reserve_ms,0)+s.cleanup.time_ms)+s.outer.time_ms;
  ensure(observed.operational_tokens!==null&&observed.operational_tokens+tokens<=limits.tokens,'downstream-token-reserve');
  ensure(elapsed+ms<=limits.time_ms&&calls.length+remaining.length+future*stages.length<=limits.calls,'downstream-time-or-call-reserve');
  return {reserved_tokens:tokens,reserved_ms:ms,observed};
}
export function segmentLimits(s,startIndex=0){
  const q=validatePairedSettings(s);ensure(nonnegative(startIndex)&&startIndex<q.cells,'segment-start');
  return {cells:q.cells-startIndex,tokens:s.ceilings.tokens-startIndex*q.cell_tokens,time_ms:s.ceilings.time_ms-startIndex*q.cell_ms,calls:(q.cells-startIndex)*stages.length};
}
export function validateContinuation(manifest,priorProtocol,priorResult,s,successorKind='offline-rehearsal'){
  ensure(manifest?.schema_version==='temple.paired-continuation/v1'&&manifest.replay_interrupted===false,'continuation-contract');
  const {checksum,...state}=priorResult;
  ensure(checksum===digest(state)&&digest(priorResult)===manifest.result_sha256&&digest(priorProtocol)===manifest.protocol_sha256&&state.protocol_sha256===manifest.protocol_sha256,'predecessor-digest');
  ensure(digest(priorProtocol.settings)===digest(s)&&['live-diagnostic','offline-rehearsal'].includes(state.execution_kind)&&state.execution_kind===priorProtocol.execution_kind,'predecessor-settings');
  ensure(['live-diagnostic','offline-rehearsal'].includes(successorKind)&&(successorKind!=='live-diagnostic'||state.execution_kind==='live-diagnostic'),'continuation-generation-provenance');
  const cells=pairedCells(s),n=state.cells.length,last=state.cells.at(-1);
  ensure(state.status==='stopped'&&state.failure==='protocol-error'&&n>0&&n<cells.length,'predecessor-stop');
  ensure(state.cells.every((c,i)=>c.cell_id===cells[i].cell_id&&(i===n-1?c.status==='stopped'&&c.failure==='protocol-error'&&c.cleanup?.status==='released':c.status==='completed'&&c.accepted===true)),'predecessor-prefix');
  ensure(digest(state.unrun)===digest(cells.slice(n).map(c=>c.cell_id))&&digest(manifest.selected_cell_ids)===digest(state.unrun),'continuation-selection');
  ensure(state.calls.length>0&&state.calls.every((c,i)=>c.result?.server_exit_confirmed===true&&c.result.terminals_empty===true&&!c.result.cleanup_failure&&!c.result.protected_drift?.length&&(i===state.calls.length-1?c.cell_id===last.cell_id&&c.result.status==='stopped'&&c.result.first_stop==='protocol-error':c.result.status==='completed'&&!fatal(c.result))),'predecessor-unsettled-call');
  let cursor=0;
  for(const [index,observation]of state.cells.entries()){
    const interrupted=index===n-1,attempts=observation.attempts;
    ensure(Array.isArray(attempts)&&attempts.length>0&&attempts.length<=s.repairs_per_cell+1&&Array.isArray(observation.calls),'predecessor-call-linkage');
    if(interrupted)ensure(attempts.length===1&&attempts[0].phase==='verify'&&!attempts[0].review,'unsupported-interruption-phase');
    const expected=[];
    for(const [a,attempt]of attempts.entries())for(const [phase,field]of [[a?'repair':'build','build'],[a?'reverify':'verify','review']]){
      const call=state.calls[cursor],failed=interrupted&&phase==='verify';
      ensure(call&&call.index===cursor&&call.cell_id===observation.cell_id&&call.mode===cells[index].mode&&call.stage===phase&&attempt.attempt===a,'predecessor-call-linkage');
      ensure(failed||attempt[field]&&digest(attempt[field])===digest(call.result),'predecessor-attempt-linkage');
      ensure(state.execution_kind!=='live-diagnostic'||call.result.generation_requested===true,'predecessor-generation-linkage');
      expected.push(cursor++);
    }
    ensure(digest(observation.calls)===digest(expected)&&(!interrupted?attempts.at(-1).acceptance?.accepted===true:true),'predecessor-call-linkage');
  }
  ensure(cursor===state.calls.length,'predecessor-call-linkage');
  ensure(digest(manifest.segment_limits)===digest(segmentLimits(s,n)),'continuation-buffer');
  return n;
}
async function loadContinuation(manifest,s,successorKind){
  const priorProtocol=JSON.parse(await fs.readFile(manifest.protocol_path,'utf8')),priorResult=JSON.parse(await fs.readFile(manifest.result_path,'utf8'));
  const startIndex=validateContinuation(manifest,priorProtocol,priorResult,s,successorKind);
  ensure(digest(priorProtocol.fixture_sha256)===digest(Object.fromEntries([...new Set(s.scenarios.map(x=>x.fixture))].map(id=>[id,digest(fixtures.find(f=>f.id===id))])))&&digest(priorProtocol.prompt_sha256)===digest({build:digest(buildPrompt),verify:digest(verifyPrompt)}),'continuation-fixture-or-prompt');
  for(const cell of priorProtocol.cells.slice(startIndex))ensure(digest(await tree(cell.root))===digest(cell.seed)&&digest(await tree(cell.control))===digest(cell.control_seed),'predecessor-unrun-drift');
  return {startIndex,priorProtocol};
}
export function checkpointToken(state){return digest(state);}
export function validateCheckpoint(state,token,protocol,processId=process.pid){
  ensure(state?.status==='checkpoint'&&state.protocol_sha256===protocol&&checkpointToken(state)===token,'checkpoint-mismatch');
  const active=state.cells.find(c=>c.status==='running'),checkpoint=state.checkpoint;
  ensure(active&&checkpoint?.cell_id===active.cell_id&&Number.isSafeInteger(checkpoint.producer_pid)&&checkpoint.producer_pid>0&&checkpoint.producer_pid!==processId&&checkpoint.next_phase==='verify','checkpoint-process-or-phase');
  ensure(active.attempts.length===1&&active.attempts[0].build?.completion?.decision==='pass'&&!active.attempts[0].review&&state.calls.length>0&&state.calls.every(c=>c.result?.status==='completed'&&c.result.server_exit_confirmed&&!fatal(c.result)&&!(c.result.protected_drift?.length)),'checkpoint-unsettled-call');
  return active;
}
export async function validateCheckpointRoots(state,active,cell){
  const attempt=active.attempts[0];
  ensure(await git(cell.root,'rev-parse','HEAD')===attempt.product_revision&&await git(cell.control,'rev-parse','HEAD')===attempt.control_revision,'checkpoint-revision-drift');
  ensure(digest(await tree(cell.root))===state.checkpoint.product_sha256&&digest(await tree(cell.control))===state.checkpoint.control_sha256,'checkpoint-tree-drift');
  ensure((await read(cell.control,`.ai-org/work-items/${cell.id}.json`)).state==='test','checkpoint-canonical-stage');
  if(cell.mode==='temple-autonomous-entry')ensure(!(await read(cell.control,`.ai-org/artifacts/${cell.id}/daily-delivery.json`)).pending,'checkpoint-pending-recovery');
}
async function saveState(lab,state){await write(lab,'result.json',{...state,checksum:digest(state)});}
async function readState(lab){const {checksum,...state}=await read(lab,'result.json');ensure(checksum===digest(state),'state-checksum');return state;}
export function assertReferenceQualified(grade){
  const reference=grade.reference_baseline;
  ensure(reference,'regression-qualification-unavailable');
  ensure(reference.exit_code===0&&Number.isSafeInteger(reference.registered_executed_cases)&&reference.registered_executed_cases>0&&reference.invalid_execution===false&&reference.timed_out===false&&reference.cancelled===0,'reference-qualification-failure');
}
export async function finishRejectedCell(observation,calls,cleanup,now=Date.now){
  ensure(observation.attempts.at(-1)?.acceptance?.accepted===false&&calls.length>0&&calls.every(c=>c.result?.status==='completed'&&c.result.server_exit_confirmed&&!fatal(c.result)&&!c.result.protected_drift?.length),'rejection-unsettled-call');
  const result=await cleanup();ensure(['released','not-needed'].includes(result.status),'rejection-cleanup-unconfirmed');
  Object.assign(observation,{status:'rejected',accepted:false,cleanup:result,failure:'candidate-rejected-after-repair',elapsed_ms:now()-observation.started_at_ms});
}

export async function preparePaired(settingsFile,{rehearsal=false,continuationFile=null}={}){
  const s=JSON.parse(await fs.readFile(settingsFile,'utf8'));validatePairedSettings(s);
  const continuation=continuationFile?JSON.parse(await fs.readFile(continuationFile,'utf8')):null;
  if(continuation)await loadContinuation(continuation,s,rehearsal?'offline-rehearsal':'live-diagnostic');
  const {lab,base,bundle,isolation}=await matrixEnvironment('temple-paired-entry-'),cells=[],controls=[];
  const selectedFixtures=[...new Set(s.scenarios.map(x=>x.fixture))].map(id=>fixtures.find(f=>f.id===id));
  for(const f of selectedFixtures){
    for(const [kind,files,name]of [['seed',f.seed],['reference',f.reference],...f.mutations.map(m=>['mutant',{...f.reference,...m.files},m.name])]){
      controls.push({fixture_id:f.id,kind,name,...await checkDiagnosticFiles(files,f,base,lab,'qualification',['oracle.test.mjs',...Object.keys(f.publicTests)])});
    }
  }
  ensure(controls.every(c=>!c.invalid_execution&&!c.timed_out&&c.registered_executed_cases>0&&(c.kind==='reference'?c.exit_code===0:c.exit_code!==0&&c.failures>0)),'oracle-qualification');
  for(const [index,selected]of pairedCells(s).entries()){
    const f=fixtures.find(f=>f.id===selected.fixture_id),root=path.join(lab,`product-${index}`),control=path.join(lab,`control-${index}`);
    await seed(root,f);await write(root,'AGENTS.md','# Temple delegated product work\nSPEC.md is approved. Choose implementation methods freely within scope. The separate Temple coordinator owns authority, bookkeeping and independent acceptance. No external actions.\n');
    await git(root,'add','.');await git(root,'commit','-m','Freeze equal product instructions');
    const installed=await installControl(control,lab,bundle,f,{risk:selected.risk,scopeClass:selected.complexity==='simple'?'bounded':'ordinary'});
    const preflight=await modelPreflight(base,{root});
    cells.push({...selected,root,control,runtime:bundle,...installed,preflight,seed:await tree(root),control_seed:await tree(control)});
  }
  const protocol={schema_version:'temple.paired-entry-protocol/v1',execution_kind:rehearsal?'offline-rehearsal':'live-diagnostic',settings:s,
    source_pin:await executionSourcePin(),runtime_sha256:digest(await tree(bundle)),candidate_revision:await git(source,'rev-parse','HEAD'),base,base_sha256:digest(base),isolation,
    fixture_sha256:Object.fromEntries(selectedFixtures.map(f=>[f.id,digest(f)])),prompt_sha256:{build:digest(buildPrompt),verify:digest(verifyPrompt)},
    authority_sha256:digest(await fs.readFile(path.join(source,s.authority_ref))),cells,controls,created_at:new Date().toISOString(),...(continuation?{continuation}: {})};
  await write(lab,'protocol.json',protocol,true);return {lab,protocol_sha256:digest(protocol),cells:cells.length,controls:controls.length,model_generation_performed:false};
}

async function syntheticActor(runtime,prompt,options){
  const f=fixtures.find(f=>f.id===options.cell.fixture_id),reviewing=['verify','reverify'].includes(options.stage);
  if(!reviewing){for(const[p,body]of Object.entries(f.reference))await write(runtime.root,p,body);await write(runtime.root,'test/additional.test.mjs',f.hiddenTests.replaceAll("'./src/","'../src/"));}
  await options.beforeGeneration({thread_id:'synthetic-no-generation',prompt_sha256:digest(prompt),prompt_bytes:Buffer.byteLength(prompt),developer_bytes:0});
  return {status:'completed',generation_requested:false,transport:'synthetic-rehearsal',completion:{decision:reviewing&&(options.cell_index<2||options.cell_index<4&&options.stage==='verify')?'fail':'pass',summary:'Synthetic rehearsal only',findings:reviewing?['Synthetic reviewer control']:[]},usage_status:'observed-completed-turn',usage:{input_tokens:0,cached_input_tokens:0,output_tokens:0,operational_tokens:0},elapsed_ms:0,terminals_empty:true,server_exit_confirmed:true};
}

export async function runPaired(lab,expected,{resumeToken=null}={}){
  const p=await read(lab,'protocol.json'),s=p.settings;validatePairedSettings(s);
  ensure(digest(p)===expected&&(await executionSourcePin()).sha256===p.source_pin.sha256,'frozen-source-drift');
  ensure(digest(p.base)===p.base_sha256&&digest(await tree(p.cells[0].runtime))===p.runtime_sha256,'runtime-drift');
  ensure(p.cells.every(c=>c.runtime===p.cells[0].runtime)&&digest(p.cells.map(c=>Object.fromEntries(Object.keys(pairedCells(s)[0]).map(k=>[k,c[k]]))))===digest(pairedCells(s)),'cell-order-drift');
  ensure(Object.entries(p.fixture_sha256).every(([id,hash])=>digest(fixtures.find(f=>f.id===id))===hash)&&digest(await fs.readFile(path.join(source,s.authority_ref)))===p.authority_sha256,'fixture-or-authority-drift');
  ensure(['offline-rehearsal','live-diagnostic'].includes(p.execution_kind),'execution-kind');
  const startIndex=p.continuation?(await loadContinuation(p.continuation,s,p.execution_kind)).startIndex:0;
  const limits=segmentLimits(s,startIndex);
  if(p.execution_kind==='live-diagnostic'){
    const a=await read(lab,'launch-authorization.json');
    ensure(a.model_generation_authorized===true&&a.protocol_sha256===expected&&a.source_sha256===p.source_pin.sha256&&a.maximum_actor_calls===s.ceilings.calls&&a.maximum_cells===p.cells.length&&a.authority_sha256===p.authority_sha256,'launch-not-authorized');
    if(p.continuation)ensure(digest(a.continuation)===digest(p.continuation)&&digest(a.segment_limits)===digest(limits),'continuation-not-authorized');
  }
  let state;
  if(resumeToken){
    state=await readState(lab);const active=validateCheckpoint(state,resumeToken,expected),cell=p.cells.find(c=>c.cell_id===active.cell_id);
    await validateCheckpointRoots(state,active,cell);
  }else{
    state={schema_version:'temple.paired-entry-result/v1',execution_kind:p.execution_kind,protocol_sha256:expected,status:'running',started_at_ms:Date.now(),cells:[],unrun:p.cells.slice(startIndex).map(c=>c.cell_id),calls:[],...(p.continuation?{continuation:p.continuation,segment_limits:limits}: {})};
  }
  const lock=await fs.open(path.join(lab,'invocation.lock'),'wx');
  let admitted=false;
  try{
    if(resumeToken){
      await write(lab,`resume-${resumeToken}.used`,{consumer_pid:process.pid},true);
      const active=state.cells.find(c=>c.status==='running');active.recovery={status:'resumed',producer_pid:state.checkpoint.producer_pid,consumer_pid:process.pid,checkpoint_token:resumeToken,elapsed_ms:Date.now()-state.checkpoint.at_ms};
      state.status='running';delete state.checkpoint;
    }else await write(lab,'run.started',{protocol_sha256:expected},true);
    admitted=true;
    await saveState(lab,state);
    const actor=p.execution_kind==='offline-rehearsal'?syntheticActor:runActor;
    for(const [index,cell]of p.cells.entries()){
      if(index<startIndex)continue;
      let observation=state.cells.find(c=>c.cell_id===cell.cell_id);
      if(['completed','rejected'].includes(observation?.status))continue;
      const f=fixtures.find(f=>f.id===cell.fixture_id);
      if(!observation){
        ensure(digest(await tree(cell.root))===digest(cell.seed)&&digest(await tree(cell.control))===digest(cell.control_seed),'prepared-input-drift');
        observation={cell_id:cell.cell_id,scenario_id:cell.scenario_id,pair:cell.pair,position:cell.position,mode:cell.mode,status:'running',commands:[],calls:[],attempts:[],accepted:false,started_at_ms:Date.now(),recovery:null};
        state.cells.push(observation);state.unrun=state.unrun.filter(x=>x!==cell.cell_id);
      }
      const save=()=>saveState(lab,state),actorId=position=>cell.assignments.find(a=>a.position_id===position&&a.active!==false).agent_id;
      const c=(...args)=>command(cell.control,cell.runtime,args,observation.commands);
      const d=(action,position,request)=>c('delivery',action,'--work-item',cell.id,'--agent-id',actorId(position),'--principal-id','human',...(request?['--request',request]:[]));
      const claim=position=>git(cell.control,'rev-parse','HEAD').then(revision=>c('work-item','claim','--work-item',cell.id,'--agent-id',actorId(position),'--principal-id','human','--base-revision',revision,'--branch','main'));
      const settle=async(stage,request,attempt,revision)=>{
        const position=request.position,ref=`.ai-org/artifacts/${cell.id}/${stage}-request-${attempt}.json`;
        await write(cell.control,ref,{...request,stage,revision,operation_id:`paired-${stage}-${attempt}`});
        if(cell.mode==='temple-autonomous-entry'){
          if(stage!=='build')await d('open',position,'delivery-plan.json');
          if(['build','test','release_gate'].includes(stage))ensure((await d('check',position)).check.accepted,'fixed-check-rejected');
          ensure((await d('finish',position,ref)).finish.success,'completion-diagnostics-failed');
        }else{
          if((await read(cell.control,`.ai-org/work-items/${cell.id}.json`)).claim?.status!=='active')await claim(position);
          if(['build','test','release_gate'].includes(stage)){const result=await runLocalChecks(cell.control,cell.id,await read(cell.control,'delivery-plan.json'));observation.commands.push({command:['external-fixed-check'],elapsed_ms:result.elapsed_ms,exit_code:result.exit_code});ensure(result.accepted,'fixed-check-rejected');}
          if(stage==='build')await c('handoff','--work-item',cell.id,'--to','quality_evaluator','--actor',actorId(position),'--input-revision',revision,'--completed',request.completed[0],'--evidence',request.evidence[0]);
          if(stage==='release_gate')await c('close','--work-item',cell.id,'--actor',actorId(position),'--decision','go','--tested-revision',revision,'--approval','SPEC.md','--rollback','Discard isolated fixture; no external effects',...Object.entries(request.satisfied).flatMap(([k,values])=>values.flatMap(v=>['--satisfy',`${k}=${v}`])));
          else{await c('work-item','release','--work-item',cell.id,'--agent-id',actorId(position),'--principal-id','human','--reason','Stage evidence recorded');await c('transition','--work-item',cell.id,'--actor',actorId(position),'--to',{build:'test',test:'eval',eval:'independent_qa',independent_qa:'release_gate'}[stage],...Object.entries(request.satisfied).flatMap(([k,values])=>values.flatMap(v=>['--satisfy',`${k}=${v}`])));}
          await c('status','--compact','--work-item',cell.id);const doctor=await c('doctor','--compact');ensure(doctor.healthy&&doctor.summary.warn===0,'individual-diagnostics-failed');
        }
      };
      if(!observation.attempts.length){if(cell.mode==='temple-autonomous-entry')await d('open','developer','delivery-plan.json');else await claim('developer');}
      for(let attempt=observation.attempts.length?observation.attempts.length-1:0;attempt<=s.repairs_per_cell;attempt++){
        let entry=observation.attempts[attempt];if(!entry){entry={attempt,status:'running',build:null,review:null,grade:null};observation.attempts.push(entry);}
        for(const stage of [attempt?'repair':'build',attempt?'reverify':'verify']){
          const reviewing=['verify','reverify'].includes(stage);if(!reviewing&&entry.build)continue;
          const phase=s.phases[stage],reservation=pairedAdmission(s,index,stage,state.calls,Date.now()-state.started_at_ms,startIndex);entry.phase=stage;
          let target=cell.root;
          if(reviewing){target=path.join(lab,`review-${state.calls.length}`);await fs.mkdir(target);for(const name of Object.keys(await tree(cell.root)).filter(n=>editable(n)||Object.hasOwn(f.publicTests,n)||['SPEC.md','package.json'].includes(n)))await write(target,name,await fs.readFile(path.join(cell.root,name),'utf8'));await write(target,'AGENTS.md','# Blind Temple verification\nVerify SPEC.md without editing supplied files or seeking other repositories.\n');}
          const before=await tree(target),runtime=await runtimeFor(target,p.base),prompt=reviewing?verifyPrompt:buildPrompt+(observation.feedback?'\nThis is the one permitted same-scope repair. Findings: '+JSON.stringify(observation.feedback):'');
          const call={cell_id:cell.cell_id,mode:cell.mode,stage,index:state.calls.length,result:null};state.calls.push(call);observation.calls.push(call.index);await save();
          call.result=await actor(runtime,prompt,{tokens:phase.stop_tokens,ms:phase.stop_ms,model:reviewing?s.models.verify:s.models.build,effort:s.effort,cell,cell_index:index,stage,
            beforeGeneration:async event=>{call.admission={...event,phase,reservation};await save();},onProgress:u=>process.stdout.write(JSON.stringify({cell_id:cell.cell_id,stage,...u})+'\n')});
          call.result.protected_drift=scopeChanges(before,await tree(target),reviewing?()=>false:editable);await save();
          ensure(!fatal(call.result)&&call.result.status==='completed'&&!call.result.protected_drift.length,'actor-or-isolation-failure');
          if(reviewing){entry.review=call.result;continue;}
          entry.build=call.result;
          await completeBuild(entry.build,async()=>{
            await git(cell.root,'add','src','test');await git(cell.root,'commit','--allow-empty','-m',`Candidate attempt ${attempt}`);entry.product_revision=await git(cell.root,'rev-parse','HEAD');
            await retainGrade(entry,save,progress=>gradeProduct(cell.root,f,p.base,lab,{onProgress:progress,check:checkDiagnosticFiles}));
            assertReferenceQualified(entry.grade);
            entry.product_control=await copyProduct(cell.root,cell.control);await git(cell.control,'add','src','test');await git(cell.control,'commit','--allow-empty','-m',`Product attempt ${attempt}`);entry.control_revision=await git(cell.control,'rev-parse','HEAD');
            const ref=`.ai-org/artifacts/${cell.id}/observed-build-${attempt}.json`;await write(cell.control,ref,{revision:entry.control_revision,observation:entry.build,product_revision:entry.product_revision});
            await settle('build',{position:'developer',completed:[entry.build.completion.summary],evidence:[ref],satisfied:{}},attempt,entry.control_revision);
            if(cell.mode==='temple-autonomous-entry')await d('open','quality_evaluator','delivery-plan.json');else await claim('quality_evaluator');
          });
          if(cell.recovery&&attempt===0&&!observation.recovery){
            state.status='checkpoint';state.checkpoint={cell_id:cell.cell_id,next_phase:'verify',producer_pid:process.pid,at_ms:Date.now(),product_sha256:digest(await tree(cell.root)),control_sha256:digest(await tree(cell.control))};
            await save();return {...state,resume_token:checkpointToken(state)};
          }
        }
        entry.acceptance=assessCandidate(entry,f.mutations.map(m=>m.name));entry.status=entry.acceptance.accepted?'accepted':'rejected';await save();
        if(entry.acceptance.accepted)break;
        if(attempt===s.repairs_per_cell)break;
        observation.feedback={review:entry.review.completion,objective:entry.grade.behavior.failed_cases,regression:entry.grade.regression,acceptance:entry.acceptance};
        const findings=`.ai-org/artifacts/${cell.id}/findings-${attempt}.json`,request=`.ai-org/artifacts/${cell.id}/rework-${attempt}.json`;await write(cell.control,findings,{revision:entry.control_revision,feedback:observation.feedback});
        if(cell.mode==='temple-autonomous-entry'){await write(cell.control,request,{revision:entry.control_revision,reason:['Candidate failed frozen independent acceptance'],evidence:[findings]});await d('rework','quality_evaluator',request);await d('open','developer','delivery-plan.json');}
        else{await c('work-item','rework','--work-item',cell.id,'--same-scope','--actor',actorId('quality_evaluator'),'--input-revision',entry.control_revision,'--reason','Candidate failed frozen independent acceptance','--evidence',findings);await claim('developer');}
      }
      if(!observation.attempts.at(-1).acceptance.accepted){
        await finishRejectedCell(observation,observation.calls.map(i=>state.calls[i]),()=>releaseStoppedClaim(cell));await save();
        process.stdout.write(JSON.stringify({cell_id:cell.cell_id,status:'rejected',calls:observation.calls.length})+'\n');continue;
      }
      const revision=await git(cell.control,'rev-parse','HEAD'),last=observation.attempts.at(-1),ref=`.ai-org/artifacts/${cell.id}/observed-review.json`;
      await write(cell.control,ref,{revision,judgment:last.review.completion,grade:last.grade,synthetic_local_only:true});
      const requests={test:{position:'quality_evaluator',judgment:'pass',satisfied:{test_evidence:[ref]}},eval:{position:'quality_evaluator',judgment:'pass',satisfied:{evaluation_report:[ref]}},independent_qa:{position:'independent_qa',judgment:'pass',satisfied:{independent_qa_pass:[ref]}},release_gate:{position:'release_manager',judgment:'pass',approval:'SPEC.md',rollback:['Discard isolated fixture; no external effects'],satisfied:{accepted_scope:['SPEC.md'],independent_qa_report:[ref]}}};
      for(const[stage,request]of Object.entries(requests))await write(cell.control,`.ai-org/artifacts/${cell.id}/${stage}-request-${last.attempt}.json`,{...request,stage,revision,operation_id:`paired-${stage}-${last.attempt}`});
      for(const[stage,request]of Object.entries(requests))await settle(stage,request,last.attempt,revision);
      const final=await read(cell.control,`.ai-org/work-items/${cell.id}.json`);ensure(final.state==='done'&&final.lifecycle_outcome==='accepted'&&final.claim?.status==='released','lifecycle-not-accepted');
      observation.session_completed=cell.mode==='temple-autonomous-entry'?(await read(cell.control,`.ai-org/artifacts/${cell.id}/daily-delivery.json`)).completed_at_ms!==null:null;
      ensure(cell.mode!=='temple-autonomous-entry'||observation.session_completed,'common-session-incomplete');
      observation.accepted=true;observation.status='completed';observation.candidate_revision=revision;observation.elapsed_ms=Date.now()-observation.started_at_ms;await save();
      process.stdout.write(JSON.stringify({cell_id:cell.cell_id,status:'completed',calls:observation.calls.length})+'\n');
    }
    state.status='completed';
  }catch(error){if(!admitted)throw error;await stopDiagnostic(state,error,{save:()=>saveState(lab,state),cleanup:active=>releaseStoppedClaim(p.cells.find(c=>c.cell_id===active.cell_id))});}
  finally{
    if(admitted&&state.status!=='checkpoint'){state.elapsed_ms=Date.now()-state.started_at_ms;state.accounting=accounting(state.calls);await saveState(lab,state);}
    await lock.close();await fs.unlink(path.join(lab,'invocation.lock'));
  }
  return state;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const action=process.argv[2];
  if(action==='prepare')console.log(JSON.stringify(await preparePaired(process.argv[3],{rehearsal:process.argv.includes('--rehearsal'),continuationFile:process.argv.includes('--continue-from')?process.argv[process.argv.indexOf('--continue-from')+1]:null})));
  else if(action==='run'||action==='resume'){
    const result=await runPaired(process.argv[3],process.argv[4],{resumeToken:action==='resume'?process.argv[5]:null});
    console.log(JSON.stringify({status:result.status,failure:result.failure,cells:result.cells.length,unrun:result.unrun,calls:result.calls.length,resume_token:result.resume_token}));
    if(!['completed','checkpoint'].includes(result.status))process.exitCode=1;
  }else throw Error('Use prepare SETTINGS [--rehearsal], run LAB DIGEST, or resume LAB DIGEST TOKEN');
}
