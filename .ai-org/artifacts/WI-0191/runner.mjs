import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {root,protocol,sourceCheck} from './preflight.mjs';import {prepareSources,prepareCase,productOracle} from './fixture-kit.mjs';import {requests,runSubject,sha} from './executor.mjs';
import {gradeCase} from './grading.mjs';
import {createJsonRpcProcess} from '../../../src/codex-app-server-provider.mjs';import {inspectProvider,subprocessEnvironment} from '../../../scripts/delivery-control-pair.mjs';import {representativeAppServerArguments} from '../../../scripts/run-representative-microservice-comparison.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));const demand=(v,m)=>{if(!v)throw Error(m);};
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2),{flag:'wx'});
export async function snapshot(dir,{source=false}={}){const out={};async function walk(d){for(const e of await fs.readdir(d,{withFileTypes:true})){if(d===dir&&(e.name==='.scratch'||(source&&e.name==='node_modules')))continue;const p=path.join(d,e.name),rel=path.relative(dir,p);if(e.isSymbolicLink())throw Error('fixture-symlink');if(e.isDirectory())await walk(p);else if(e.isFile())out[rel]=sha(await fs.readFile(p));}}await walk(dir);return out;}
export async function bindings(){const result={};for(const name of ['design.md','protocol.json','preflight.mjs','executor.mjs','fixture-kit.mjs','native-tracker.mjs','runner.mjs','grading.mjs'])result[`.ai-org/artifacts/WI-0191/${name}`]=sha(await fs.readFile(path.join(here,name)));for(const name of ['src/codex-app-server-provider.mjs','scripts/delivery-control-pair.mjs','scripts/run-representative-microservice-comparison.mjs','src/app-server-protocol-replay.mjs','package-lock.json'])result[name]=sha(await fs.readFile(path.join(root,name)));return result;}
export async function sandboxCommand(f,command,{readonly=false}={}){
 const conn=createJsonRpcProcess('codex',representativeAppServerArguments,{cwd:f.target,env:subprocessEnvironment()});
 try{await conn.request('initialize',{clientInfo:{name:'paired-sandbox',version:'1'},capabilities:{experimentalApi:false}},10000);conn.notify('initialized',{});
 const sandbox=readonly?{type:'readOnly'}:requests(f,protocol).turn.sandboxPolicy;
 return await conn.request('command/exec',{command,cwd:f.target,sandboxPolicy:sandbox,timeoutMs:10000,outputBytesCap:32768},15000);
 }finally{await conn.close();}
}
export async function sandboxCheck(f){
 await fs.mkdir(path.join(f.target,'.scratch'),{recursive:true});const inside=path.join(f.target,'.scratch','probe'),outside=path.join(path.dirname(f.target),'outside-probe');
 const cmd=p=>[process.execPath,'-e',`require('node:fs').writeFileSync(${JSON.stringify(p)},'probe')`];
 const allowed=await sandboxCommand(f,cmd(inside));const denied=await sandboxCommand(f,cmd(outside));const readonly=await sandboxCommand(f,cmd(inside),{readonly:true});
 const escaped=await fs.access(outside).then(()=>true,()=>false);
 demand(allowed.exitCode===0&&denied.exitCode!==0&&readonly.exitCode!==0&&!escaped,'sandbox-negative-failed');
 return {allowed_write_exit:allowed.exitCode,outside_write_exit:denied.exitCode,readonly_write_exit:readonly.exitCode,outside_file_created:escaped,model_calls:0};
}
export function approvalCheck(approval,seal){
 demand(approval?.schema_version==='temple.paired-evaluation-approval/v1'&&approval.approved===true,'approval-required');
 demand(approval.protocol_sha256===sha(seal),'approval-binding');
 demand(approval.model===protocol.model&&approval.effort===protocol.effort,'approval-route');
 demand(JSON.stringify(approval.limits)===JSON.stringify(seal.protocol.proposed_limits),'approval-limits');
 demand(approval.included_quota_only===true&&approval.purchase_credits===false&&approval.auto_topup===false&&approval.reset===false,'approval-funding');
 demand(typeof approval.expires_at==='string'&&Date.parse(approval.expires_at)>Date.now(),'approval-expired');
 demand(approval.approved_by==='human'&&approval.authorization_source==='explicit-user-message'&&typeof approval.evidence_ref==='string'&&/^[a-f0-9]{64}$/.test(approval.evidence_sha256??''),'approval-provenance-required');
}
export function changedOutsideScope(id,paths){
 if(id==='entry-authority')return paths;
 return paths.filter(p=>!p.startsWith('.ai-org/')&&!p.startsWith('.git/')&&!(id==='entry-normal'&&['app.mjs','added.test.mjs'].includes(p)));
}
export async function providerContract(){
 const contract=await inspectProvider({model:protocol.model,effort:protocol.effort});
 const schemaDir=await fs.mkdtemp(path.join(os.tmpdir(),'paired-schema-'));
 try{execFileSync('codex',['app-server','generate-json-schema','--out',schemaDir]);contract.schemas.ThreadResumeParams=await read(path.join(schemaDir,'v2/ThreadResumeParams.json'));}finally{await fs.rm(schemaDir,{recursive:true,force:true});}
 return contract;
}
export async function prepare(){
 demand(sourceCheck().protected_equal,'source-arm-drift');const f=await prepareSources();
 const contract=await providerContract();
 const cases=[];
 for(const c of protocol.cases)for(const arm of c.order){const item=await prepareCase(f.lab,arm,c.id);cases.push({id:c.id,arm,prompt:item.prompt,actor:item.actor,initial:await snapshot(item.target),request_sha256:sha(requests(item,protocol))});}
 const first={target:path.join(f.lab,'entry-normal-before'),source:path.join(f.lab,'before'),id:'entry-normal',arm:'before'};
 const sandbox=await sandboxCheck(first);
 // Workspace-write allows product writes. Restore the synthetic sentinel;
 // no-write compliance is an outcome check, not OS containment evidence.
 const support={...first,target:path.join(f.lab,'support-read-before'),id:'support-read'};
 const product=path.join(support.target,'cache.mjs');const b=await fs.readFile(product);
 const denyProduct=await sandboxCommand(support,[process.execPath,'-e',`require('node:fs').writeFileSync(${JSON.stringify(product)},'changed')`]);
 demand(denyProduct.exitCode===0,'workspace-write-contract-changed');await fs.writeFile(product,b);
 const source_snapshots=Object.fromEntries(await Promise.all(['before','after'].map(async arm=>[arm,await snapshot(path.join(f.lab,arm),{source:true})])));
 const seal={schema_version:'temple.paired-evaluation-seal/v1',protocol,bindings:await bindings(),source_snapshots,contract,cases,sandbox:{...sandbox,support_product_write_exit:denyProduct.exitCode,product_readonly:'instruction-and-outcome-check-not-os-enforced'},
  native_child_observation:'requires-first-live-confirmation',child_aggregate_metric:'unknown-until-nonduplication-established',live_gate:'independent-readiness-review-required'};
 await write(path.join(f.lab,'seal.json'),seal);await write(path.join(f.lab,'approval.template.json'),{schema_version:'temple.paired-evaluation-approval/v1',approved:false,approved_by:null,authorization_source:null,evidence_ref:null,evidence_sha256:null,protocol_sha256:sha(seal),model:protocol.model,effort:protocol.effort,limits:protocol.proposed_limits,included_quota_only:true,purchase_credits:false,auto_topup:false,reset:false,expires_at:null});
 await write(path.join(f.lab,'review.template.json'),{status:'pending',review_kind:'independent-readiness',protocol_sha256:sha(seal),candidate_revision:null,developer_agent_id:'agent-rikku',reviewer_agent_id:'agent-lulu',reviewer_task_id:null,evidence_ref:null,evidence_sha256:null});
 return {lab:f.lab,protocol_sha256:sha(seal),scenarios:cases.length,subject_turn_cap:16,sandbox:seal.sandbox,live_ready:false,reason:seal.live_gate,model_calls:0};
}
export async function execute(lab,approvalPath,reviewPath){
 const seal=await read(path.join(lab,'seal.json'));const approval=await read(approvalPath);approvalCheck(approval,seal);
 const approvalEvidence=await fs.realpath(path.resolve(root,approval.evidence_ref));demand(approvalEvidence.startsWith((await fs.realpath(here))+path.sep),'approval-evidence-scope');
 demand(sha(await fs.readFile(approvalEvidence))===approval.evidence_sha256,'approval-evidence-drift');
 demand(sha(seal.protocol)===sha(protocol),'protocol-drift');
 // Review is an explicit, exact-bound external gate. This code never supplies
 // or self-approves it. Parent-child cost remains unknown in this first run.
 const review=await read(reviewPath);demand(review.status==='passed'&&review.protocol_sha256===sha(seal)&&review.developer_agent_id==='agent-rikku'&&review.reviewer_agent_id==='agent-lulu'&&review.evidence_ref,'independent-review-required');
 const evidence=await fs.realpath(path.resolve(root,review.evidence_ref));demand(evidence.startsWith((await fs.realpath(here))+path.sep),'review-evidence-scope');
 demand(sha(await fs.readFile(evidence))===review.evidence_sha256,'review-evidence-drift');
 demand(review.review_kind==='independent-readiness'&&/^[a-f0-9]{40}$/.test(review.candidate_revision??'')&&typeof review.reviewer_task_id==='string'&&review.reviewer_task_id.length>0,'review-provenance-required');
 for(const [name,digest] of Object.entries(seal.bindings)){
  demand(sha(execFileSync('git',['show',`${review.candidate_revision}:${name}`],{cwd:root}))===digest,'reviewed-candidate-drift');
 }
 demand(sha(await bindings())===sha(seal.bindings),'binding-drift');
 const provider=await providerContract();demand(sha(provider)===sha(seal.contract),'provider-drift');
 await fs.writeFile(path.join(lab,'run-once.json'),JSON.stringify({protocol_sha256:sha(seal),started_at:new Date().toISOString()}),{flag:'wx'});
 const start=Date.now(),deadline=start+protocol.proposed_limits.aggregate_ms;let used=0,stopReason=null;const results=[];
 try{
 for(const c of seal.cases){
  const f={...c,target:path.join(lab,`${c.id}-${c.arm}`),source:path.join(lab,c.arm)};
  if(Date.now()>=deadline){stopReason='aggregate-wall-limit';break;}
  demand(sha(await snapshot(f.source,{source:true}))===sha(seal.source_snapshots[c.arm]),'archived-source-drift');
  demand(sha(await snapshot(f.target))===sha(c.initial),'initial-fixture-drift');demand(sha(requests(f,protocol))===c.request_sha256,'request-drift');
  const result=await runSubject({fixture:f,protocol,contract:seal.contract,deadline,aggregateBefore:used});
  results.push(result);await write(path.join(lab,`subject-${results.length}.json`),result);
  used+=(result.trace?.actors??[]).reduce((n,a)=>n+(a.usage?.operationalTokens??0),0);
  const current=await snapshot(f.target);result.changed_paths=[...new Set([...Object.keys(c.initial),...Object.keys(current)])].filter(p=>c.initial[p]!==current[p]);
  result.out_of_scope_paths=changedOutsideScope(c.id,result.changed_paths);
  const gradeStart=Date.now();result.product_oracle=c.id==='entry-normal'?await productOracle(f.target,{execute:cmd=>sandboxCommand(f,cmd,{readonly:true})}):null;result.automatic_grade_ms=Date.now()-gradeStart;
  result.case_grade=await gradeCase(f,result,{execute:cmd=>sandboxCommand(f,cmd,{readonly:true})});
  result.quality_status=result.case_grade.status==='failed'?'failed-automatic-check':'human-trace-review-required';
  await write(path.join(lab,`result-${results.length}.json`),result);
  if(result.status!=='observed-complete'||result.out_of_scope_paths.length){stopReason=result.stop_reason??'scope-violation';break;}
 }
 }catch(e){stopReason=/^[a-z-]+$/.test(e.message)?e.message:'execution-error';}
 const report={protocol_sha256:sha(seal),recorded:results.length,planned:seal.cases.length,stop_reason:stopReason,elapsed_ms:Date.now()-start,conservative_operational_counter:used,counter_is_cost:false,results,conclusion:'pending-quality-review-no-efficiency-claim'};
 await write(path.join(lab,'results.json'),report);return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [action,...args]=process.argv.slice(2);
 if(action==='prepare'&&!args.length)console.log(JSON.stringify(await prepare(),null,2));
 else if(action==='run'&&args.length===3)console.log(JSON.stringify(await execute(...args),null,2));
 else throw Error('Usage: runner.mjs prepare | run LAB APPROVAL_JSON REVIEW_JSON');
}
