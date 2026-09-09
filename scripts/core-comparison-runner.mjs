// Durable, stage-at-a-time coordinator. Side effects are supplied by the qualified
// local adapter; a restart never repeats a record found in running state.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {digest,validateReservations,phaseReservation} from './core-runtime-qualification.mjs';

const check=(ok,message)=>{if(!ok)throw Error(message);};
const sha=v=>typeof v==='string'&&/^[a-f0-9]{40}$/.test(v);
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const stages=['build','recovery','verify','repair','reverify'];
const states={build:'prepared',recovery:'handoff-paused',verify:'verification-ready',repair:'repair-required',reverify:'reverification-ready'};

export function validateCoreProtocol(p){
  check(p?.schema_version==='temple.core-comparison-protocol/v1'&&hex(p.source_sha256)&&hex(p.runtime_sha256)&&hex(p.fixture_sha256)&&hex(p.acceptance_sha256),'protocol-pins');
  validateReservations(p.settings);
  check(p.cells?.length===4&&new Set(p.cells.map(c=>c.id)).size===4,'four-unique-cells');
  const pairs=new Set();
  for(const c of p.cells){check(typeof c.id==='string'&&/^[a-z0-9_-]+$/.test(c.id)&&['temple-lean','temple-core-candidate'].includes(c.mode)&&['gpt-5.6-terra','gpt-6-astra'].includes(c.model)&&c.effort==='medium'&&sha(c.product_seed_revision)&&hex(c.contract_sha256),'cell-contract');pairs.add(c.mode+':'+c.model);}
  check(pairs.size===4&&p.verifier?.model==='gpt-5.6-terra'&&p.verifier.effort==='medium'&&p.repetitions===1,'fixed-factorial');
  check(p.interruption==='after-normal-build-and-developer-finish-before-verification'&&p.cache_control==='uncontrolled-descriptive-only','measurement-contract');
  return p;
}
export function requireCoreApproval(protocol,approval,expected){
  validateCoreProtocol(protocol);
  check(hex(expected)&&digest(protocol)===expected,'protocol-drift');
  check(approval?.schema_version==='temple.core-comparison-approval/v1'&&approval.status==='approved'&&approval.protocol_sha256===expected&&approval.principal==='human'&&typeof approval.authorization_ref==='string'&&approval.authorization_ref.trim(),'exact-launch-approval-required');
  check(digest(approval.ceilings)===digest(protocol.settings.ceilings)&&approval.external_spend_jpy===0&&approval.api_keys===false&&approval.resets===false&&approval.extra_subjects===false,'approval-boundary');
}
export function checkedActor(result,budget){
  check(!result?.protected_drift?.length,'participant-protected-file-drift');
  check(!result?.cleanup_failure&&!result?.interrupt_unconfirmed&&result?.server_exit_confirmed===true&&result?.terminals_empty===true,'actor-cleanup-incomplete');
  check(!result?.postprocess_failure,'actor-postprocess-failure');
  check(result?.usage_status==='observed-completed-turn','actor-usage-incomplete');
  check(result?.status==='completed'&&!result?.first_stop,'actor-not-completed');
  check(result?.generation_requested===true&&result.status==='completed'&&result.usage_status==='observed-completed-turn'&&result.server_exit_confirmed===true&&result.terminals_empty===true&&!result.cleanup_failure&&!result.interrupt_unconfirmed&&!result.postprocess_failure&&!result.protected_drift?.length&&!result.first_stop,'actor-or-accounting-incomplete');
  const u=result.usage;
  check(u&&['input_tokens','cached_input_tokens','output_tokens','operational_tokens'].every(k=>Number.isSafeInteger(u[k])&&u[k]>=0)&&u.cached_input_tokens<=u.input_tokens&&u.operational_tokens===u.input_tokens-u.cached_input_tokens+u.output_tokens,'actor-usage-invalid');
  check(u.operational_tokens<=budget.reserve_tokens&&Number.isSafeInteger(result.elapsed_ms)&&result.elapsed_ms>=0&&result.elapsed_ms<=budget.reserve_ms&&typeof result.thread_id==='string'&&result.thread_id.trim(),'phase-reserve-overrun');
  return {tokens:u.operational_tokens,time_ms:result.elapsed_ms,calls:1};
}
export function observedAccounting(calls){
  const valid=c=>{const u=c?.usage;return u&&['input_tokens','cached_input_tokens','output_tokens','operational_tokens'].every(k=>Number.isSafeInteger(u[k])&&u[k]>=0)&&u.cached_input_tokens<=u.input_tokens&&u.operational_tokens===u.input_tokens-u.cached_input_tokens+u.output_tokens;};
  return {known_operational_tokens_lower_bound:calls.filter(valid).reduce((n,c)=>n+c.usage.operational_tokens,0),usage_complete:calls.length>0&&calls.every(c=>valid(c)&&c.usage_status==='observed-completed-turn'),returned_calls:calls.length};
}
export function checkContinuationCapacity(protocol,state){
  const c=protocol.continuation;if(!c)return;
  const calls=state.cells.flatMap(r=>r.calls).filter(a=>!c.prior_thread_ids.includes(a.thread_id));
  const remaining=state.cells.filter(r=>!['accepted','rejected'].includes(r.status)).flatMap(r=>stages.slice(stages.indexOf(r.next_stage)).map(n=>protocol.settings.phases[n]));
  const tokens=observedAccounting(calls).known_operational_tokens_lower_bound;
  const cleanup=state.cells.filter(r=>!['accepted','rejected'].includes(r.status)).length*protocol.settings.cell_extra_reserve.tokens;
  check(c.authorization.prior_calls+calls.length+remaining.length<=c.authorization.max_calls,'successor-downstream-call-reserve');
  check(c.authorization.prior_tokens+tokens+remaining.reduce((n,p)=>n+p.reserve_tokens,0)+cleanup+protocol.settings.batch_overhead.tokens<=c.authorization.max_tokens,'successor-downstream-token-reserve');
}
export async function writeState(lab,state){
  const file=path.join(lab,'state.json'),temporary=path.join(lab,`.state-${randomUUID()}`);
  const handle=await fs.open(temporary,'wx',0o600);try{await handle.writeFile(JSON.stringify(state,null,2)+'\n');await handle.sync();}finally{await handle.close();}
  await fs.rename(temporary,file);
  const directory=await fs.open(lab,'r');try{await directory.sync();}finally{await directory.close();}
}
export async function initializeCoreRun(lab,protocol){
  validateCoreProtocol(protocol);
  const state={schema_version:'temple.core-comparison-state/v1',protocol_sha256:digest(protocol),status:'prepared',active_cell:0,cells:protocol.cells.map(c=>({id:c.id,status:'prepared',next_stage:'build',calls:[],observed:{tokens:0,time_ms:0,calls:0},candidate_revision:null,accepted:false})),unrun:protocol.cells.map(c=>c.id)};
  const handle=await fs.open(path.join(lab,'state.json'),'wx',0o600);try{await handle.writeFile(JSON.stringify(state,null,2)+'\n');await handle.sync();}finally{await handle.close();}
  return state;
}
export function checkpointFor(protocol,cell,record){
  check(sha(record.candidate_revision)&&record.status==='handoff-paused'&&hex(record.evidence_sha256),'candidate-not-ready-for-handoff');
  return {schema_version:'temple.core-handoff-checkpoint/v1',protocol_sha256:digest(protocol),cell_id:cell.id,contract_sha256:cell.contract_sha256,candidate_revision:record.candidate_revision,evidence_sha256:record.evidence_sha256,reported_state:'verification-pending',accepted:false,build_thread_id:record.calls[0].thread_id,coordinator_pid:record.coordinator_pid};
}
export function checkRecovery(checkpoint,protocol,cell,currentCandidate,evidenceDigest){
  check(checkpoint?.schema_version==='temple.core-handoff-checkpoint/v1'&&checkpoint.protocol_sha256===digest(protocol)&&checkpoint.cell_id===cell.id&&checkpoint.contract_sha256===cell.contract_sha256&&checkpoint.candidate_revision===currentCandidate&&checkpoint.evidence_sha256===evidenceDigest&&checkpoint.reported_state==='verification-pending'&&checkpoint.accepted===false,'stale-recovery-checkpoint');
}

// One invocation performs at most one model turn. The caller must close this
// process after handoff-paused; the subsequent invocation rereads disk authority.
export async function advanceCoreRun(lab,protocol,approval,expected,ops){
  requireCoreApproval(protocol,approval,expected);
  check(await ops.pinsMatch(protocol),'source-or-runtime-drift');
  const state=JSON.parse(await fs.readFile(path.join(lab,'state.json'),'utf8'));
  check(state.protocol_sha256===expected&&state.schema_version==='temple.core-comparison-state/v1','state-protocol-drift');
  check(!['running','stopped','completed'].includes(state.status),'ambiguous-or-terminal-run');
  const index=state.active_cell,cell=protocol.cells[index],record=state.cells[index],stage=record?.next_stage;
  check(cell&&record.id===cell.id&&stages.includes(stage)&&record.status===states[stage],'state-stage-drift');
  const budget=phaseReservation(protocol.settings,stage,record.observed);
  checkContinuationCapacity(protocol,state);
  // Permanent exclusive attempt receipt: an uncertain invocation is never retried.
  const marker=await fs.open(path.join(lab,`attempt-${cell.id}-${stage}`),'wx',0o600);
  await marker.close();
  state.status='running';record.status='running';state.unrun=state.unrun.filter(id=>id!==cell.id);
  await writeState(lab,state);
  try{
    if(stage==='recovery'){
      const checkpoint=JSON.parse(await fs.readFile(path.join(lab,`checkpoint-${cell.id}.json`),'utf8'));
      check(Number.isInteger(checkpoint.coordinator_pid)&&checkpoint.coordinator_pid!==(ops.processId?.()??process.pid),'coordinator-process-reused');
      const current=await ops.currentCandidate(cell,record);
      checkRecovery(checkpoint,protocol,cell,current.revision,current.evidence_sha256);
    }
    const actor=await ops.actor(cell,stage,budget,record);
    record.calls.push(actor);record.accounting=observedAccounting(record.calls);await writeState(lab,state); // preserve failed/unknown usage too
    const usage=checkedActor(actor,budget);
    check(actor.model===(stage==='verify'||stage==='reverify'?protocol.verifier.model:cell.model)&&actor.effort==='medium','effective-model-drift');
    check(!record.calls.slice(0,-1).some(c=>c.thread_id===actor.thread_id),'fresh-session-reused');
    for(const k of ['tokens','time_ms','calls'])record.observed[k]+=usage[k];
    if(stage==='build'||stage==='repair'){
      check(actor.completion?.decision==='pass','developer-reported-incomplete');
      const submitted=await ops.submit(cell,stage,actor);
      check(sha(submitted.revision)&&hex(submitted.evidence_sha256)&&submitted.diagnostics_passed===true,'developer-handoff-incomplete');
      record.candidate_revision=submitted.revision;record.evidence_sha256=submitted.evidence_sha256;record.evidence_ref=submitted.evidence_ref??null;
      record.coordinator_pid=ops.processId?.()??process.pid;
      record.status=stage==='build'?'handoff-paused':'reverification-ready';record.next_stage=stage==='build'?'recovery':'reverify';
      if(stage==='build')await fs.writeFile(path.join(lab,`checkpoint-${cell.id}.json`),JSON.stringify(checkpointFor(protocol,cell,record),null,2)+'\n',{flag:'wx',mode:0o600});
    }else if(stage==='recovery'){
      check(await ops.recoveryAccepted(cell,actor,record),'recovery-not-established');
      record.status='verification-ready';record.next_stage='verify';record.recovery='succeeded';
    }else{
      const verdict=await ops.grade(cell,actor,record);record.verdicts??=[];record.verdicts.push(verdict);
      check(verdict.instrument_valid===true,'oracle-instrument-failure');
      if(verdict.accepted===true){check(await ops.closeout(cell,actor,record),'closeout-incomplete');record.status='accepted';record.accepted=true;record.next_stage=null;}
      else if(stage==='verify'){await ops.rework(cell,actor,record);record.status='repair-required';record.next_stage='repair';}
      else{await ops.finalizeRejected?.(cell,record);record.status='rejected';record.next_stage=null;}
    }
    state.status=record.status==='handoff-paused'?'handoff-paused':'ready';
    if(['accepted','rejected'].includes(record.status)){state.active_cell++;if(state.active_cell===protocol.cells.length)state.status='completed';}
  }catch(e){state.status='stopped';record.status='stopped';record.first_stop=String(e.message);if(e.finishDiagnostic)record.finish_diagnostic=e.finishDiagnostic;}
  await writeState(lab,state);return state;
}
