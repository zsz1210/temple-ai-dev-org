import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {root,protocol,sourceCheck} from './preflight.mjs';
import {prepareSources,prepareCase} from '../WI-0193/fixture-kit.mjs';
import {snapshot,sandboxCheck,sandboxCommand,changedOutsideScope,providerContract as predecessorProviderContract} from '../WI-0193/runner.mjs';
import {requests,runSubject,sha} from '../WI-0194/executor.mjs';
import {gradeCase} from '../WI-0193/grading.mjs';import {stopReasonFor} from '../WI-0193/measurement.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),demand=(v,m)=>{if(!v)throw Error(m);};
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),write=(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2),{flag:'wx'});
export async function bindings(){
 const names=['design.md','protocol.json','preflight.mjs','runner.mjs'];const out={};
 for(const name of names)out[`.ai-org/artifacts/WI-0195/${name}`]=sha(await fs.readFile(path.join(here,name)));
 for(const name of ['event-policy.mjs','executor.mjs','native-tracker.mjs'])out[`.ai-org/artifacts/WI-0194/${name}`]=sha(await fs.readFile(path.join(here,'../WI-0194',name)));
 for(const name of ['fixture-kit.mjs','grading.mjs','measurement.mjs'])out[`.ai-org/artifacts/WI-0193/${name}`]=sha(await fs.readFile(path.join(here,'../WI-0193',name)));
 for(const name of ['src/codex-app-server-provider.mjs','scripts/delivery-control-pair.mjs','scripts/run-representative-microservice-comparison.mjs','src/app-server-protocol-replay.mjs','package-lock.json'])out[name]=sha(await fs.readFile(path.join(root,name)));
 return out;
}
export async function providerContract(){
 const contract=await predecessorProviderContract(),schemaDir=await fs.mkdtemp(path.join(os.tmpdir(),'successor-schema-'));
 try{
  execFileSync('codex',['app-server','generate-json-schema','--out',schemaDir]);
  for(const name of ['TurnStartedNotification','TurnCompletedNotification'])contract.schemas[name]=JSON.parse(await fs.readFile(path.join(schemaDir,'v2',`${name}.json`),'utf8'));
  return contract;
 }finally{await fs.rm(schemaDir,{recursive:true,force:true});}
}
export function approvalCheck(a,seal){
 demand(a?.schema_version==='temple.paired-evaluation-approval/v1'&&a.approved===true,'approval-required');
 demand(a.protocol_sha256===sha(seal)&&a.model===protocol.model&&a.effort===protocol.effort,'approval-binding');
 demand(JSON.stringify(a.limits)===JSON.stringify(protocol.proposed_limits),'approval-limits');
 demand(a.included_quota_only===true&&a.purchase_credits===false&&a.auto_topup===false&&a.reset===false,'approval-funding');
 demand(a.approved_by==='human'&&a.authorization_source==='explicit-user-message'&&Date.parse(a.expires_at)>Date.now(),'approval-provenance');
 demand(typeof a.evidence_ref==='string'&&/^[a-f0-9]{64}$/.test(a.evidence_sha256??''),'approval-evidence');
}
export function sanitizeResult(result,fixture){
 const redact=value=>String(value).replaceAll(fixture.target,'<fixture>').replaceAll(fixture.source,'<source>');
 const safe={...result,messages:(result.messages??[]).slice(-64).map(message=>({...message,text:redact(message.text).slice(0,16384)}))};
 if(result.answer&&typeof result.answer==='object'){
  const serialized=redact(JSON.stringify(result.answer));
  if(Buffer.byteLength(serialized)>32768){safe.answer=null;safe.status='stopped';safe.stop_reason??='answer-metadata-cap';safe.answer_retention='rejected-over-limit';}
  else {safe.answer=JSON.parse(serialized);safe.answer_retention='bounded-redacted';}
 }else safe.answer=null;
 return safe;
}
export async function prepare(){
 demand(sourceCheck().protected_equal,'source-arm-drift');const fixture=await prepareSources(),contract=await providerContract(),cases=[];
 for(const c of protocol.cases)for(const arm of c.order){const item=await prepareCase(fixture.lab,arm,c.id);cases.push({id:c.id,arm,prompt:item.prompt,actor:item.actor,initial:await snapshot(item.target),request_sha256:sha(requests(item,protocol))});}
 const sandbox=await sandboxCheck({target:path.join(fixture.lab,'support-read-before'),source:path.join(fixture.lab,'before'),id:'support-read',arm:'before'});
 const source_snapshots=Object.fromEntries(await Promise.all(['before','after'].map(async arm=>[arm,await snapshot(path.join(fixture.lab,arm),{source:true})])));
 const seal={schema_version:'temple.paired-evaluation-seal/v1',protocol,bindings:await bindings(),source_snapshots,contract,cases,sandbox,native_child_observation:'required',child_aggregate_metric:'unknown-until-nonduplication-established',live_gate:'independent-readiness-and-fresh-human-approval'};
 await write(path.join(fixture.lab,'seal.json'),seal);
 await write(path.join(fixture.lab,'approval.template.json'),{schema_version:'temple.paired-evaluation-approval/v1',approved:false,approved_by:null,authorization_source:null,evidence_ref:null,evidence_sha256:null,protocol_sha256:sha(seal),model:protocol.model,effort:protocol.effort,limits:protocol.proposed_limits,included_quota_only:true,purchase_credits:false,auto_topup:false,reset:false,expires_at:null});
 await write(path.join(fixture.lab,'review.template.json'),{status:'pending',review_kind:'independent-readiness',protocol_sha256:sha(seal),candidate_revision:null,developer_agent_id:'agent-rikku',reviewer_agent_id:'agent-lulu',reviewer_task_id:null,evidence_ref:null,evidence_sha256:null});
 return {lab:fixture.lab,protocol_sha256:sha(seal),scenarios:cases.length,subject_turn_cap:8,sandbox,model_calls:0};
}
export async function execute(lab,approvalPath,reviewPath){
 const seal=await read(path.join(lab,'seal.json')),approval=await read(approvalPath);approvalCheck(approval,seal);
 const approvalEvidence=await fs.realpath(path.resolve(root,approval.evidence_ref)),artifactRoot=await fs.realpath(here);demand(approvalEvidence.startsWith(artifactRoot+path.sep),'approval-evidence-scope');demand(sha(await fs.readFile(approvalEvidence))===approval.evidence_sha256,'approval-evidence-drift');
 const review=await read(reviewPath);demand(review.status==='passed'&&review.protocol_sha256===sha(seal)&&review.developer_agent_id==='agent-rikku'&&review.reviewer_agent_id==='agent-lulu','independent-review-required');
 const reviewEvidence=await fs.realpath(path.resolve(root,review.evidence_ref));demand(reviewEvidence.startsWith(artifactRoot+path.sep)&&sha(await fs.readFile(reviewEvidence))===review.evidence_sha256,'review-evidence-drift');
 demand(review.review_kind==='independent-readiness'&&/^[a-f0-9]{40}$/.test(review.candidate_revision??'')&&review.reviewer_task_id,'review-provenance-required');
 for(const [name,digest] of Object.entries(seal.bindings))demand(sha(execFileSync('git',['show',`${review.candidate_revision}:${name}`],{cwd:root}))===digest,'reviewed-candidate-drift');
 demand(sha(await bindings())===sha(seal.bindings),'binding-drift');demand(sha(await providerContract())===sha(seal.contract),'provider-drift');
 await fs.writeFile(path.join(lab,'run-once.json'),JSON.stringify({protocol_sha256:sha(seal),started_at:new Date().toISOString()}),{flag:'wx'});
 const start=Date.now(),deadline=start+protocol.proposed_limits.aggregate_ms;let used=0,stopReason=null;const results=[];
 try{for(const c of seal.cases){
  const f={...c,target:path.join(lab,`${c.id}-${c.arm}`),source:path.join(lab,c.arm)};if(Date.now()>=deadline){stopReason='aggregate-wall-limit';break;}
  demand(sha(await snapshot(f.source,{source:true}))===sha(seal.source_snapshots[c.arm]),'archived-source-drift');demand(sha(await snapshot(f.target))===sha(c.initial),'initial-fixture-drift');demand(sha(requests(f,protocol))===c.request_sha256,'request-drift');
  const result=sanitizeResult(await runSubject({fixture:f,protocol,contract:seal.contract,deadline,aggregateBefore:used}),f);results.push(result);await write(path.join(lab,`subject-${results.length}.json`),result);
  used+=(result.trace?.actors??[]).reduce((n,a)=>n+(a.usage?.operationalTokens??0),0);const current=await snapshot(f.target);result.changed_paths=[...new Set([...Object.keys(c.initial),...Object.keys(current)])].filter(p=>c.initial[p]!==current[p]);result.out_of_scope_paths=changedOutsideScope(c.id,result.changed_paths);
  result.case_grade=await gradeCase(f,result,{execute:cmd=>sandboxCommand(f,cmd,{readonly:true})});result.quality_status=result.case_grade.status==='unmeasurable'?'unmeasurable':result.case_grade.status==='failed'?'failed-automatic-check':'human-trace-review-required';await write(path.join(lab,`result-${results.length}.json`),result);
  const reason=stopReasonFor(result);if(reason){stopReason=reason;break;}
 }}catch(error){stopReason=/^[a-z-]+$/.test(error.message)?error.message:'execution-error';}
 const report={protocol_sha256:sha(seal),recorded:results.length,planned:seal.cases.length,stop_reason:stopReason,elapsed_ms:Date.now()-start,conservative_operational_counter:used,counter_is_cost:false,results,conclusion:'pending-quality-review-no-efficiency-claim'};await write(path.join(lab,'results.json'),report);return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [action,...args]=process.argv.slice(2);if(action==='prepare'&&!args.length)console.log(JSON.stringify(await prepare(),null,2));else if(action==='run'&&args.length===3)console.log(JSON.stringify(await execute(...args),null,2));else throw Error('Usage: runner.mjs prepare | run LAB APPROVAL_JSON REVIEW_JSON');}
