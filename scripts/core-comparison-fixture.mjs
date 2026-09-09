// Local adapter for the four-cell experiment. Hidden oracle material stays here,
// outside all participant readable roots. No installed Temple defaults change.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
import {docFixture,reviewRubric,deliveryCheckerSource} from './real-doc-check-fixture-v5.mjs';
import {gradeDeliveryProduct} from './core-delivery-grader.mjs';
import {matrixPrompt} from './delivery-matrix-experiment.mjs';
import {seed,write,read,tree,git,cli,runActor,runtimeFor,scopeChanges} from './autonomy-experiment.mjs';
import {subprocessEnvironment} from './delivery-control-pair.mjs';
import {compileCoreTask,coreCompletionArguments,coreCompletionOutcome,coreRecoveryPacket} from './core-autonomy-candidate.mjs';
import {planEvaluation} from './evaluation-plan.mjs';
import {qualifyCoreRuntime,installCoreControl,digest,executionSourcePin,fileDigest,validateReservations} from './core-runtime-qualification.mjs';
import {initializeCoreRun,advanceCoreRun,validateCoreProtocol} from './core-comparison-runner.mjs';
import {installRecoveryReadOnly} from './core-recovery-readonly.mjs';

const source=path.resolve(import.meta.dirname,'..'),exec=promisify(execFile);
const check=(ok,message)=>{if(!ok)throw Error(message);};
const editable=p=>/^src\/doc-[^/]+\.mjs$/.test(p)||p==='test/additional.test.mjs';
const productFile=p=>p.startsWith('src/')||p.startsWith('test/');
const native='# Core product assignment\nRead TASK.json; its context contains the complete approved SPEC.md, which remains available as the original source. No duplicate read is required. Preserve scope, constraints and acceptance. Choose investigation, design, implementation and self-tests. The separate coordinator owns all Temple state and Git writes. A distinct blind Verifier judges product correctness. Do not stop merely to return a plan. The compiler output grants no model-generation authority; this dispatched assignment relies on the coordinator separate execution approval and permits no additional model calls.\n';
export function selectionReservation(settings){
  validateReservations(settings);
  const phases=Object.values(settings.phases),p=settings.phases,expected=s=>({tokens:s.expected_tokens,time_ms:s.expected_ms,calls:1});
  return {basis:settings.basis,setup:settings.setup_reserve,build:{tokens:p.build.expected_tokens+p.recovery.expected_tokens,time_ms:p.build.expected_ms+p.recovery.expected_ms,calls:2},verify:expected(p.verify),repair:expected(p.repair),reverify:expected(p.reverify),variability:{tokens:phases.reduce((n,s)=>n+s.stop_tokens-s.expected_tokens,0),time_ms:phases.reduce((n,s)=>n+s.stop_ms-s.expected_ms,0),calls:0},usage_lag:{tokens:phases.reduce((n,s)=>n+s.reserve_tokens-s.stop_tokens,0),time_ms:phases.reduce((n,s)=>n+s.reserve_ms-s.stop_ms,0),calls:0},cleanup:settings.cell_extra_reserve};
}
async function product(root){const out={};for(const p of Object.keys(await tree(root)).filter(productFile))out[p]=await fs.readFile(path.join(root,p),'utf8');return out;}
export function coreReferenceQualification(grade,review){
  const failed=grade.reference_baseline?.exit_code!==0&&grade.reference_baseline?.failures>0;
  if(!failed)return {status:'not-needed'};
  const findings=Array.isArray(review?.findings)?review.findings:[],markers=findings.filter(s=>typeof s==='string'&&s.startsWith('reference_baseline='));
  const tests=(grade.reference_baseline.failed_cases??[]).map(s=>s.replace(/^not ok \d+ - /u,''));
  const named=findings.filter(s=>typeof s==='string'&&s.startsWith('reference_test=')).map(s=>s.slice('reference_test='.length));
  const basis=findings.filter(s=>typeof s==='string'&&s.startsWith('contract_basis=')).map(s=>s.slice('contract_basis='.length));
  const qualified=review?.decision==='fail'&&typeof review.summary==='string'&&review.summary.trim().length>0&&markers.length===1&&markers[0]==='reference_baseline=tests-exceed-contract'&&tests.length>0&&new Set(named).size===tests.length&&named.length===tests.length&&tests.every(s=>named.includes(s))&&basis.length>0&&basis.every(s=>s.length>=12&&docFixture.spec.includes(s));
  return {status:qualified?'tests-exceed-contract':'unresolved-reference-defect',tests,basis};
}
export function validateCorePregrade(pregrade,expected){
  check(pregrade&&['stage','protocol_sha256','candidate_revision','product_sha256'].every(k=>typeof expected[k]==='string'&&pregrade[k]===expected[k]),'pregrade-candidate-drift');
  return pregrade.grade;
}
export function coreGradeControlsValid(grade){
  const controls=[grade.behavior,grade.regression,grade.reference_baseline,grade.public_delivery,...(grade.mutations??[])].filter(Boolean);
  const expected=docFixture.mutations.map(m=>m.name),actual=(grade.mutations??[]).map(m=>m.name);
  const positiveTests=c=>Number.isInteger(c?.tests)&&c.tests>0;
  return grade.status==='completed'&&positiveTests(grade.behavior)&&controls.every(c=>Number.isInteger(c.exit_code)&&c.exit_code>=0&&!c.invalid_execution&&!c.timed_out&&c.cancelled===0)&&(grade.mutation_status!=='qualified'||(positiveTests(grade.reference_baseline)&&actual.length===expected.length&&new Set(actual).size===expected.length&&expected.every(n=>actual.includes(n))&&grade.mutations.every(positiveTests)));
}
export function coreGradeVerdict(grade,review){
  const qualified=grade.mutation_status==='qualified';
  const reference_qualification=coreReferenceQualification(grade,review);
  const instrument_valid=coreGradeControlsValid(grade)&&(!grade.reference_baseline||grade.reference_baseline.exit_code===0||reference_qualification.status==='tests-exceed-contract');
  const meaningful_regression=qualified&&grade.reference_baseline?.tests>0&&(grade.mutations??[]).some(m=>m.detected===true);
  return {instrument_valid,meaningful_regression,accepted:instrument_valid&&review?.decision==='pass'&&grade.accepted===true&&meaningful_regression,grade,feedback:{review,reference_qualification,reference_baseline:grade.reference_baseline,failed_cases:grade.behavior?.failed_cases,regression:grade.regression,meaningful_regression,mutations:grade.mutations,public_delivery:grade.public_delivery}};
}
async function commit(root,label){await git(root,'add','src','test');if(await git(root,'diff','--cached','--name-only'))await git(root,'commit','-m',label);return git(root,'rev-parse','HEAD');}
async function claim(root,actor){return cli(root,'work-item','claim','--work-item','WI-0001','--agent-id',actor,'--principal-id','human','--base-revision',await git(root,'rev-parse','HEAD'),'--branch','main');}
async function compile(control,cell,evaluation){
  const item=await read(control,'.ai-org/work-items/WI-0001.json'),workflow=await read(control,'.ai-org/core/workflow.json'),manifest=await tree(control);
  const refs=[...new Set(Object.values(item.gate_evidence).flat())].filter(p=>['work_order','approved_scope','acceptance_criteria','technical_design','risk_review','profile_eligibility'].some(g=>item.gate_evidence[g]?.includes(p)));
  const context=await Promise.all(refs.map(async p=>{const body=await fs.readFile(path.join(control,p),'utf8');return {path:p,body,sha256:digest(body)};}));
  // The native Lean arm uses the same control-side contract for administration;
  // only the core participant receives the compiled body.
  const candidateCell=cell.id.replace('__lean-current__','__core-proposed__');
  return compileCoreTask({item,workflow,workers:[],context,authority_digest:digest(Object.fromEntries(Object.entries(manifest).filter(([p])=>p.startsWith('.ai-org/core/')||p.startsWith('.ai-org/project/')||['AGENTS.md','TEMPLE.md','temple.lock'].includes(p)))),control_revision:await git(control,'rev-parse','HEAD'),evaluation,cell_id:candidateCell});
}
async function finish(control,bundle,evidence,base){
  const args=coreCompletionArguments(bundle,evidence,bundle.order_sha256);let stdout,code;
  try{const r=await exec(process.execPath,[path.join(control,'templew.mjs'),...args],{cwd:control,env:subprocessEnvironment(base.environment),timeout:120000,maxBuffer:2*1024*1024});stdout=r.stdout;code=0;}catch(e){stdout=e.stdout;code=Number.isInteger(e.code)?e.code:null;}
  let parsed;try{parsed=JSON.parse(stdout);}catch{parsed=null;}
  const outcome=coreCompletionOutcome(parsed,code);
  if(!outcome.next_stage_ready)throw Object.assign(Error('finish-diagnostics-incomplete'),{finishDiagnostic:{code:parsed?.code??null,mutation_status:parsed?.mutation_status??null,message:String(parsed?.message??'').slice(0,2000),next_action:outcome.next_action}});
  return outcome;
}
export async function prepareCoreComparison({executionKind='live-screen'}={}){
  check(['live-screen','offline-rehearsal'].includes(executionKind),'execution-kind');
  const qualification=await qualifyCoreRuntime();check(qualification.result.status==='bounded-runtime-controls-passed','runtime-unqualified');
  const lab=qualification.lab,base=JSON.parse(await fs.readFile(path.join(lab,'adapter-base.json')).catch(()=> 'null'));
  // Qualification writes its exact private runtime separately from public evidence.
  check(base,'runtime-base-missing');
  const settings=await read(source,'scripts/evaluation-catalog/core-runtime.settings.json');
  const evaluation={catalog:await read(source,'scripts/evaluation-catalog/catalog.json'),selection:await read(source,'scripts/evaluation-catalog/core-comparison.template.json')};
  const common=path.join(lab,'common-product-seed');await seed(common,docFixture);const seedRevision=await git(common,'rev-parse','HEAD'),frameworkRevision=await git(source,'rev-parse','HEAD');
  const s=evaluation.selection;s.controls.scenario_pins['interruption-recovery']={product_revision:seedRevision,fixture_digest:digest(docFixture),acceptance_digest:digest(docFixture.hiddenTests)};
  for(const v of s.variants)v.framework_revision=frameworkRevision;
  s.budget={per_scenario:{'interruption-recovery':selectionReservation(settings)},batch_overhead:settings.batch_overhead,ceilings:settings.ceilings};
  const preview=planEvaluation(s,evaluation.catalog);check(preview.reservation.complete,'incomplete-evaluation-reserve');
  const cells=[];
  for(const c of preview.cells){
    const control=path.join(lab,c.id+'-control');await fs.cp(common,control,{recursive:true});await installCoreControl(control,lab);await claim(control,'agent-casey');
    const cell={id:c.id,mode:c.mode,model:c.model,effort:c.reasoning_effort,product_seed_revision:seedRevision,control_root:control,product_root:control};
    const bundle=await compile(control,cell,evaluation);
    if(c.mode==='temple-core-candidate'){
      cell.product_root=path.join(lab,c.id+'-product');await fs.cp(common,cell.product_root,{recursive:true});await write(cell.product_root,'AGENTS.md',native);await write(cell.product_root,'TASK.json',bundle.order);
    }
    cell.contract_sha256=bundle.order_sha256;cell.initial_bundle=bundle;cell.seed_manifest=await tree(cell.product_root);cell.control_seed_manifest=await tree(control);cell.product_base_revision=await git(cell.product_root,'rev-parse','HEAD');cells.push(cell);
  }
  const protocol={schema_version:'temple.core-comparison-protocol/v1',execution_kind:executionKind,source_revision:frameworkRevision,source_sha256:(await executionSourcePin()).sha256,runtime_sha256:qualification.result.bundle_sha256,base_sha256:digest(base),fixture_sha256:digest(docFixture),acceptance_sha256:digest(docFixture.hiddenTests),settings,cells,verifier:{model:'gpt-5.6-terra',effort:'medium'},repetitions:1,interruption:settings.interruption,cache_control:settings.cache_control,qualification:qualification.result,native:qualification.result.native,evaluation};
  validateCoreProtocol(protocol);await write(lab,'protocol.json',protocol,true);await initializeCoreRun(lab,protocol);
  const approval={schema_version:'temple.core-comparison-approval/v1',status:'pending',protocol_sha256:digest(protocol),principal:'human',authorization_ref:null,ceilings:settings.ceilings,external_spend_jpy:0,api_keys:false,resets:false,extra_subjects:false};
  await write(lab,'approval.pending.json',approval,true);return {lab,protocol_sha256:digest(protocol),cells:cells.map(c=>({id:c.id,mode:c.mode,model:c.model})),reservation:validateReservations(settings),status:'prepared-awaiting-exact-approval',model_generation_performed:false};
}

export async function nativeOperations(lab,protocol,{actor=runActor,grader=gradeDeliveryProduct}={}){
  check(actor!==runActor||protocol.execution_kind==='live-screen','rehearsal-cannot-generate');
  const base=await read(lab,'adapter-base.json');
  let pregrade=null;
  const current=async(cell,record)=>{check(digest(await product(cell.product_root))===digest(await product(cell.control_root)),'product-control-drift');return {revision:await git(cell.control_root,'rev-parse','HEAD'),evidence_sha256:await fileDigest(path.join(cell.control_root,record?.evidence_ref??'.ai-org/artifacts/WI-0001/submission-build.json'))};};
  return {
    pinsMatch:async()=>{
      if(!(protocol.source_sha256===(await executionSourcePin()).sha256&&protocol.base_sha256===digest(base)&&protocol.runtime_sha256===digest(await tree(base.readRoots[2]))&&protocol.native.node.sha256===await fileDigest(process.execPath)&&protocol.native.codex.sha256===await fileDigest(base.binary)))return false;
      const mutable=p=>editable(p)||/^\.ai-org\/(work-items|artifacts|events|views)\//.test(p);
      for(const c of protocol.cells){
        if(scopeChanges(c.control_seed_manifest,await tree(c.control_root),mutable).length)return false;
        if(c.product_root!==c.control_root&&scopeChanges(c.seed_manifest,await tree(c.product_root),editable).length)return false;
      }
      return true;
    },
    currentCandidate:current,
    actor:async(cell,stage,budget,record)=>{
      let root=cell.product_root,prompt,actorBase=base;
      if(stage==='build'||stage==='repair'){
        if(stage==='build')check(await git(root,'rev-parse','HEAD')===cell.product_base_revision,'product-seed-revision-drift');
        else check((await current(cell,record)).revision===record.candidate_revision,'repair-candidate-drift');
        if(stage==='build')check(digest(await tree(root))===digest(cell.seed_manifest),'product-seed-drift');
        prompt='Implement all of SPEC.md, preserving supplied behavior. Only direct src/doc-*.mjs files and test/additional.test.mjs may change. Add meaningful regression tests and run node --test test/*.test.mjs, then node check-delivery.mjs. Fix all public test and cleanup findings before submission. You choose the intermediate method; continue through implementation. The coordinator owns Git and all Temple state. Return actual completed behavior and unresolved defects.';
        if(cell.mode==='temple-core-candidate')prompt+=' Read TASK.json for the compiled contract.';
        else prompt+=' This is current coordinator-owned Temple Lean, Developer agent-casey. Read TEMPLE.md and the applicable Skill; preview node ./templew.mjs context resolve . --work-item WI-0001 --position developer --compact --no-write --json and read required routed sources. Do not duplicate coordinator writes.';
        if(stage==='repair')prompt+=' This is the sole permitted same-scope repair. Feedback: '+JSON.stringify(record.verdicts?.at(-1)?.feedback);
      }else{
        root=path.join(lab,cell.id+'-'+stage);await fs.mkdir(root);for(const [p,body]of Object.entries({...await product(cell.product_root),'check-delivery.mjs':deliveryCheckerSource,'SPEC.md':docFixture.spec,'package.json':JSON.stringify({type:'module'})}))await write(root,p,body);
        if(stage==='recovery'){
          if(cell.mode==='temple-lean'){
            await fs.rm(root,{recursive:true});await fs.cp(cell.control_root,root,{recursive:true});
            const gateway=await installRecoveryReadOnly(root,base.environment.TEMPLE_CLI_PATH);
            actorBase={...base,environment:{...base.environment,TEMPLE_CLI_PATH:gateway}};
            prompt='Recover this completed Build handoff using current Temple instructions, SPEC.md and actual Work Item/evidence. Do not edit files or repeat implementation, claims or lifecycle writes. Identify the exact Developer candidate and unfinished next responsibility. Return decision pass only if the evidence establishes readiness for a distinct Verifier. In findings include candidate_revision=<full SHA> and next_stage=verify.';
            prompt+=' Use node ./templew.mjs for Temple diagnostics: its recovery-only CLI override makes Status/Context/Observe read-only and rejects mutations. Do not bypass it using direct CLI paths or environment overrides.';
          }else{
            const bundle=cell.initial_bundle,packet=coreRecoveryPacket(bundle,{schema_version:'temple.core-checkpoint/v1',order_sha256:bundle.order_sha256,candidate_revision:record.candidate_revision,reported_state:'verification-pending',evidence_refs:[record.evidence_ref],unresolved:[],next_action:'Distinct Verifier must test the candidate'},{expected_order_sha256:bundle.order_sha256,current_candidate_revision:record.candidate_revision});
            await write(root,'AGENTS.md','# Core handoff recovery\nRead RECOVERY.json and SPEC.md, then inspect actual product state as needed. TASK.json retains the full original task contract if needed. Do not edit, implement or advance lifecycle. Coordinator retains authority and evidence; a distinct Verifier must still judge the candidate.\n');await write(root,'TASK.json',bundle.order);await write(root,'RECOVERY.json',packet);
            prompt='Recover using RECOVERY.json, SPEC.md and the actual supplied product files; TASK.json is available for additional original context. Do not edit files or repeat implementation. Identify the exact control candidate and unfinished next responsibility; the separate control checkout owns cited evidence. Return decision pass only if ready for a distinct Verifier. In findings include candidate_revision=<full SHA> and next_stage=verify.';
          }
        }else{
          await claim(cell.control_root,'agent-riley');await write(root,'AGENTS.md','# Blind product Verifier\nRead SPEC.md and product files; independently test them without edits. Do not seek execution history.\n');prompt=matrixPrompt(null,'review')+reviewRubric;
          const product_sha256=digest(await product(root));
          check(product_sha256===digest(await product(cell.product_root)),'pregrade-snapshot-drift');
          pregrade={stage,protocol_sha256:digest(protocol),candidate_revision:record.candidate_revision,product_sha256,grade:await grader(root,docFixture,base,lab)};
          check(product_sha256===digest(await product(root)),'pregrade-snapshot-drift');
          await write(lab,cell.id+'-'+stage+'-pregrade.json',pregrade,true);
          check(coreGradeControlsValid(pregrade.grade),'oracle-instrument-failure-before-verifier');
          if(pregrade.grade.public_delivery){
            const p=pregrade.grade.public_delivery;
            await write(root,'DELIVERY_CHECK.json',{kind:'public-test-and-cleanup-check',exit_code:p.exit_code,failed_cases:p.failed_cases,...p.delivery});
            prompt+=' Read DELIVERY_CHECK.json and include every known public test/cleanup defect alongside your independent semantic findings.';
          }
          if(pregrade.grade.reference_baseline?.exit_code!==0&&pregrade.grade.reference_baseline?.failures>0){
            await write(root,'REFERENCE_CHECK.json',{kind:'added-test-contract-qualification',failed_tests:pregrade.grade.reference_baseline.failed_cases.map(s=>s.replace(/^not ok \d+ - /u,''))});
            prompt+=' Read REFERENCE_CHECK.json and qualify every listed assertion against SPEC before the final judgment.';
          }
        }
      }
      const before=await tree(root),head=await git(cell.product_root,'rev-parse','HEAD');
      const result=await actor(await runtimeFor(root,actorBase),prompt,{tokens:budget.stop_tokens,ms:budget.stop_ms,model:['verify','reverify'].includes(stage)?protocol.verifier.model:cell.model,effort:'medium'});
      delete result.failure_detail;
      result.prompt_bytes=Buffer.byteLength(prompt);result.prompt_sha256=digest(prompt);
      try{
        // Preserve returned counters before any fallible product/Git inspection.
        await write(lab,cell.id+'-'+stage+'-provider-observation.json',result,true);
        result.protected_drift=scopeChanges(before,await tree(root),['build','repair'].includes(stage)?editable:()=>false);
        if(result.protected_drift.length||await git(cell.product_root,'rev-parse','HEAD')!==head){result.status='stopped';result.first_stop='participant-source-or-history-drift';}
        await write(lab,cell.id+'-'+stage+'-observation.json',result,true);
      }catch(e){result.status='stopped';result.postprocess_failure=String(e.message).slice(0,2000);result.first_stop??='participant-postprocess-failure';}
      return result;
    },
    submit:async(cell,stage,observation)=>{
      const evidencePath='.ai-org/artifacts/WI-0001/submission-'+stage+'.json';
      if(cell.product_root!==cell.control_root){
        const files=await product(cell.product_root),existing=await product(cell.control_root);
        for(const p of Object.keys(existing).filter(editable))if(!(p in files))await fs.unlink(path.join(cell.control_root,p));
        for(const[p,body]of Object.entries(files).filter(([p])=>editable(p)))await write(cell.control_root,p,body);
        await commit(cell.product_root,'Capture product candidate');
      }
      const revision=await commit(cell.control_root,'Capture exact submitted product');
      await write(cell.control_root,evidencePath,{stage,revision,observation});
      const bundle=await compile(cell.control_root,cell,protocol.evaluation);
      const outcome=await finish(cell.control_root,bundle,{operation_id:stage+'-submit',control_revision:revision,completed:[observation.completion?.summary??'Submitted actual candidate'],evidence_refs:[evidencePath]},base);
      return {revision,evidence_ref:evidencePath,evidence_sha256:await fileDigest(path.join(cell.control_root,evidencePath)),diagnostics_passed:outcome.next_stage_ready};
    },
    recoveryAccepted:async(cell,observation,record)=>observation.completion?.decision==='pass'&&observation.completion.findings.includes('candidate_revision='+record.candidate_revision)&&observation.completion.findings.includes('next_stage=verify'),
    grade:async(cell,observation,record)=>{
      const grade=validateCorePregrade(pregrade,{stage:record.next_stage,protocol_sha256:digest(protocol),candidate_revision:(await current(cell,record)).revision,product_sha256:digest(await product(cell.product_root))});
      return coreGradeVerdict(grade,observation.completion);
    },
    rework:async(cell,observation,record)=>{
      const ref='.ai-org/artifacts/WI-0001/rejection.json';await write(cell.control_root,ref,{observation,verdict:record.verdicts.at(-1)});
      await cli(cell.control_root,'work-item','rework','--work-item','WI-0001','--same-scope','--input-revision',record.candidate_revision,'--reason','Distinct product verification requires the single reserved same-scope repair','--evidence',ref,'--actor','agent-riley');await claim(cell.control_root,'agent-casey');
    },
    finalizeRejected:async cell=>cli(cell.control_root,'work-item','release','--work-item','WI-0001','--agent-id','agent-riley','--principal-id','human','--reason','Both permitted product-verification attempts rejected; preserve Test without acceptance'),
    closeout:async(cell,observation,record)=>{
      const ref='.ai-org/artifacts/WI-0001/verification.json';await write(cell.control_root,ref,{observation,verdict:record.verdicts.at(-1),revision:record.candidate_revision});
      const bundle=await compile(cell.control_root,cell,protocol.evaluation);
      return (await finish(cell.control_root,bundle,{operation_id:'verified-closeout',control_revision:record.candidate_revision,judgment:'pass',test_evidence:[ref],lean_closeout:[ref]},base)).next_stage_ready;
    }
  };
}
// Explicitly synthetic adapter rehearsal. It cannot use the live actor and its
// approval exists only in memory under an offline-rehearsal protocol.
export async function rehearseCoreStep(lab){
  const protocol=await read(lab,'protocol.json');check(protocol.execution_kind==='offline-rehearsal','not-an-offline-rehearsal');
  const approval={schema_version:'temple.core-comparison-approval/v1',protocol_sha256:digest(protocol),principal:'human',ceilings:protocol.settings.ceilings,external_spend_jpy:0,api_keys:false,resets:false,extra_subjects:false,status:'approved',authorization_ref:'Offline test data only; no human launch or model generation'};
  const standIn=async(runtime,prompt,options)=>{
    const state=await read(lab,'state.json'),record=state.cells[state.active_cell],stage=record.next_stage;
    if(stage==='recovery'&&protocol.cells[state.active_cell].mode==='temple-lean'){
      await exec(process.execPath,[path.join(runtime.root,'templew.mjs'),'status','.','--compact','--json','--work-item','WI-0001'],{cwd:runtime.root,env:subprocessEnvironment(runtime.environment),timeout:30000});
    }
    if(stage==='build'||stage==='repair'){
      let files=stage==='build'&&state.active_cell<2?{...docFixture.reference,...docFixture.mutations[0].files}:docFixture.reference;
      if(stage==='build'&&state.active_cell===2)files={...files,'src/doc-links.mjs':files['src/doc-links.mjs'].replace('throw new Error("Markdown root is not a directory")','throw Object.assign(new Error("Root invalid"),{code:"ROOT_INVALID"})')};
      for(const[p,body]of Object.entries(files))await write(runtime.root,p,body);
      await write(runtime.root,'test/additional.test.mjs',"import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {findBrokenLinks} from '../src/doc-links.mjs';test('explicit empty selection ignores a dangling link',async()=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'added-'));try{await fs.writeFile(path.join(root,'a.md'),'[bad](missing)');assert.deepEqual(await findBrokenLinks(root,{files:[]}),[]);}finally{await fs.rm(root,{recursive:true,force:true});}});\n");
      if(state.active_cell===2)await fs.appendFile(path.join(runtime.root,'test/additional.test.mjs'),"test('root error rejection',async t=>{const area=await fs.mkdtemp(path.join(os.tmpdir(),'added-root-'));t.after(()=>fs.rm(area,{recursive:true,force:true}));const root=path.join(area,'file');await fs.writeFile(root,'');await assert.rejects(findBrokenLinks(root,{files:['a.md']}),"+(stage==='build'?'{code:"ROOT_INVALID"}':'Error')+");});\n");
    }
    const qualify=state.active_cell===2&&stage==='verify';
    return {status:'completed',transport:'offline-test-double',generation_requested:true,model:options.model,effort:options.effort,thread_id:'simulated-'+process.pid,completion:{decision:qualify?'fail':'pass',summary:'Synthetic reference or deliberate negative control; no model judgment',findings:qualify?['reference_baseline=tests-exceed-contract','reference_test=root error rejection','contract_basis=Root I/O failures have no constrained code value']:stage==='recovery'?['candidate_revision='+record.candidate_revision,'next_stage=verify']:[]},usage_status:'observed-completed-turn',usage:{input_tokens:10,cached_input_tokens:2,output_tokens:4,operational_tokens:12},elapsed_ms:20,terminals_empty:true,server_exit_confirmed:true};
  };
  const state=await advanceCoreRun(lab,protocol,approval,digest(protocol),await nativeOperations(lab,protocol,{actor:standIn}));
  return {kind:'offline-real-adapter-rehearsal',model_generation_performed:false,pid:process.pid,status:state.status,active_cell:state.active_cell,cells:state.cells.map(c=>({id:c.id,status:c.status,first_stop:c.first_stop,recorded_calls:c.calls.length,carried_calls:c.calls.filter(a=>protocol.continuation?.prior_thread_ids.includes(a.thread_id)).length,simulated_calls:c.calls.filter(a=>a.thread_id?.startsWith('simulated-')).length}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [command,lab,approvalFile,expected]=process.argv.slice(2);
  if(command==='prepare'||command==='prepare-rehearsal'){console.log(JSON.stringify(await prepareCoreComparison({executionKind:command==='prepare'?'live-screen':'offline-rehearsal'}),null,2));}
  else if(command==='rehearse-step'){const r=await rehearseCoreStep(lab);console.log(JSON.stringify(r));if(r.status==='stopped')process.exitCode=1;}
  else if(command==='step'){
    const protocol=await read(lab,'protocol.json'),approval=JSON.parse(await fs.readFile(approvalFile,'utf8'));
    const result=await advanceCoreRun(lab,protocol,approval,expected,await nativeOperations(lab,protocol));console.log(JSON.stringify({status:result.status,active_cell:result.active_cell,unrun:result.unrun}));if(result.status==='stopped')process.exitCode=1;
  }else throw Error('Use prepare or step <lab> <exact-approval-file> <protocol-sha256>; each step starts at most one turn');
}
