// Explicit, audited continuation. Never mutates the sealed predecessor.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {nativeOperations} from './core-comparison-fixture.mjs';
import {tree,scopeChanges,git} from './autonomy-experiment.mjs';
import {digest,fileDigest,executionSourcePin} from './core-runtime-qualification.mjs';
import {writeState,checkpointFor,observedAccounting,checkContinuationCapacity} from './core-comparison-runner.mjs';
const check=(v,m)=>{if(!v)throw Error(m);};
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));

export function successorRecords(p,s,authorization){
  check(authorization?.ref?.trim()&&authorization.prior_calls===8&&authorization.prior_tokens===238001&&authorization.max_calls===23&&authorization.max_tokens===2837509,'successor-explicit-capacity');
  check(s.status==='stopped'&&s.active_cell===1&&s.cells[0].accepted===true&&s.cells[0].calls.length===3&&s.cells[1].next_stage==='recovery'&&s.cells[1].calls.length===2&&s.cells.slice(2).every(c=>c.status==='prepared'&&c.calls.length===0),'successor-known-stage-required');
  const failed=s.cells[1].calls[1],build=s.cells[1].calls[0];
  check(failed.status==='stopped'&&failed.first_stop==='participant-source-or-history-drift'&&JSON.stringify(failed.protected_drift)===JSON.stringify(['.ai-org/views/capabilities.json']),'successor-known-drift-required');
  check(s.cells.flatMap(c=>c.calls).every(a=>a.usage_status==='observed-completed-turn'&&a.terminals_empty&&a.server_exit_confirmed&&!a.cleanup_failure&&!a.postprocess_failure&&!a.interrupt_unconfirmed),'successor-complete-accounting-cleanup');
  const accounting=observedAccounting(s.cells.flatMap(c=>c.calls));
  check(accounting.usage_complete&&accounting.known_operational_tokens_lower_bound===160492&&build.status==='completed','successor-usage-drift');
  const next=structuredClone(s),c=next.cells[1];
  next.status='handoff-paused';next.cells[0].carried_acceptance=true;
  c.prior_failed_calls=[failed];c.calls=[build];c.accounting=observedAccounting(c.calls);
  c.observed={tokens:build.usage.operational_tokens,time_ms:build.elapsed_ms,calls:1};
  c.status='handoff-paused';delete c.first_stop;
  return {state:next,continuation:{kind:'explicit-repair-successor/v1',authorization,prior_thread_ids:s.cells.flatMap(c=>c.calls.map(a=>a.thread_id)),carried_accepted_cell:s.cells[0].id,carried_build_cell:c.id,intervention:'recovery-only read-only diagnostic gateway; original fixture/oracle/runtime retained',source_protocol_sha256:digest(p),source_state_sha256:digest(s)}};
}

export async function prepareSuccessor(oldLab,expectedProtocol,expectedRawState,authorization,{executionKind='live-screen'}={}){
  check(['live-screen','offline-rehearsal'].includes(executionKind),'successor-execution-kind');
  const p=await read(path.join(oldLab,'protocol.json')),s=await read(path.join(oldLab,'state.json'));
  check(digest(p)===expectedProtocol&&await fileDigest(path.join(oldLab,'state.json'))===expectedRawState,'successor-source-evidence-drift');
  const selected=successorRecords(p,s,authorization),pin=await executionSourcePin();
  check(await(await nativeOperations(oldLab,{...p,source_sha256:pin.sha256})).pinsMatch(),'successor-native-or-protected-drift');
  const oldCell=p.cells[1],before=await tree(oldCell.control_root),recoveryRoot=path.join(oldLab,oldCell.id+'-recovery'),after=await tree(recoveryRoot);
  check(JSON.stringify(scopeChanges(before,after,()=>false))===JSON.stringify(['.ai-org/views/capabilities.json']),'successor-snapshot-drift');
  const a=await read(path.join(oldCell.control_root,'.ai-org/views/capabilities.json')),b=await read(path.join(recoveryRoot,'.ai-org/views/capabilities.json'));delete a.generated_at;delete b.generated_at;check(digest(a)===digest(b),'successor-not-timestamp-only');
  check(await git(oldCell.control_root,'rev-parse','HEAD')===s.cells[1].candidate_revision&&await fileDigest(path.join(oldCell.control_root,s.cells[1].evidence_ref))===s.cells[1].evidence_sha256,'successor-candidate-drift');
  for(let i=0;i<2;i++){
    const cell=p.cells[i],record=s.cells[i],current=await(await nativeOperations(oldLab,{...p,source_sha256:pin.sha256})).currentCandidate(cell,record);
    check(current.revision===record.candidate_revision&&current.evidence_sha256===record.evidence_sha256,'successor-carried-evidence-drift');
    check(!(await git(cell.control_root,'diff','HEAD','--','src','test'))&&!(await git(cell.product_root,'diff','HEAD','--','src','test')),'successor-uncommitted-product-drift');
  }
  const lab=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'temple-core-successor-')));
  const next=structuredClone(p);next.execution_kind=executionKind;next.source_sha256=pin.sha256;next.source_revision=await git(path.resolve(import.meta.dirname,'..'),'rev-parse','HEAD');next.continuation={...selected.continuation,source_lab:oldLab,source_raw_state_sha256:expectedRawState};
  for(let i=0;i<next.cells.length;i++){
    const c=next.cells[i],old=p.cells[i];c.control_root=path.join(lab,c.id+'-control');await fs.cp(old.control_root,c.control_root,{recursive:true});
    c.product_root=old.product_root===old.control_root?c.control_root:path.join(lab,c.id+'-product');if(c.product_root!==c.control_root)await fs.cp(old.product_root,c.product_root,{recursive:true});
  }
  await fs.copyFile(path.join(oldLab,'adapter-base.json'),path.join(lab,'adapter-base.json'));
  await fs.copyFile(path.join(oldLab,'state.json'),path.join(lab,'predecessor-state.json'));
  await fs.copyFile(path.join(oldLab,'protocol.json'),path.join(lab,'predecessor-protocol.json'));
  await fs.writeFile(path.join(lab,'protocol.json'),JSON.stringify(next,null,2)+'\n',{flag:'wx'});
  const state=selected.state;state.protocol_sha256=digest(next);checkContinuationCapacity(next,state);
  await writeState(lab,state);
  await fs.writeFile(path.join(lab,'checkpoint-'+next.cells[1].id+'.json'),JSON.stringify(checkpointFor(next,next.cells[1],state.cells[1]),null,2)+'\n',{flag:'wx'});
  check(await(await nativeOperations(lab,next,{actor:async()=>{throw Error('preparation-cannot-generate');}})).pinsMatch(),'successor-copy-pins');
  return {lab,protocol_sha256:digest(next),source_revision:next.source_revision,status:state.status,model_generation_performed:false,new_calls:0,maximum_new_calls:14,remaining_round_calls:15,remaining_round_tokens:2599508};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [oldLab,protocol,rawState,authorizationFile,kind='live-screen']=process.argv.slice(2);
  console.log(JSON.stringify(await prepareSuccessor(oldLab,protocol,rawState,await read(authorizationFile),{executionKind:kind}),null,2));
}
