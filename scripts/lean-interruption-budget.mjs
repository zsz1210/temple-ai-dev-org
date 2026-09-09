// Repository experiment policy, separate from the small accounting diagnostic.
const phase=(expected,variability,notification,expectedMs,bufferMs)=>Object.freeze({expected_tokens:expected,variability_tokens:variability,notification_tokens:notification,stop_tokens:expected+variability,reserved_tokens:expected+variability+notification,expected_ms:expectedMs,buffer_ms:bufferMs,ms:expectedMs+bufferMs,stop_ms:expectedMs+bufferMs-20000,cleanup_ms:20000});
export const bufferedBudget=Object.freeze({
  id:'wi-0260-buffered/v1',
  phases:Object.freeze({initial:phase(120000,60000,20000,300000,300000),recovery:phase(80000,40000,20000,300000,300000),review:phase(40000,20000,10000,240000,180000),repair:phase(80000,40000,20000,300000,300000),rereview:phase(40000,20000,10000,240000,180000)}),
  cell_tokens:620000,cell_ms:2640000,cells:2,cohort_tokens:1240000,cohort_ms:5280000,max_calls_per_cell:5,max_calls_total:10
});
export const bufferedMeasurement=Object.freeze({id:'authorized-buffered-behavior/v1',budget:bufferedBudget,exact_total_cost:false,extra_qualification:false,selected_treatments:Object.freeze(['lean-current','lean-compact']),historical_work_item:'WI-0257'});
const phases=['initial','recovery','review','repair','rereview'];
const check=(ok,reason)=>{if(!ok)throw Error(reason);};
export function validateBufferedBudget(plan){
  check(plan?.id===bufferedBudget.id&&JSON.stringify(plan)===JSON.stringify(bufferedBudget),'buffered-budget-drift');
  let tokens=0,ms=0;
  for(const name of phases){const p=plan.phases[name];
    check(Object.values(p).every(v=>Number.isSafeInteger(v)&&v>0),'invalid-buffered-budget');
    check(p.stop_tokens===p.expected_tokens+p.variability_tokens&&p.reserved_tokens===p.stop_tokens+p.notification_tokens&&p.ms===p.expected_ms+p.buffer_ms&&p.stop_ms+p.cleanup_ms===p.ms,'missing-budget-buffer');
    tokens+=p.reserved_tokens;ms+=p.ms;
  }
  check(tokens===plan.cell_tokens&&ms===plan.cell_ms&&plan.cohort_tokens===tokens*plan.cells&&plan.cohort_ms===ms*plan.cells,'incomplete-path-reservation');
  return plan;
}
export function reservePhase(plan,stage,observedTokens,elapsedMs){
  validateBufferedBudget(plan);const i=phases.indexOf(stage);check(i>=0,'unknown-budget-phase');
  const remaining=phases.slice(i).map(name=>plan.phases[name]);
  check(Number.isFinite(observedTokens)&&observedTokens>=0&&Number.isFinite(elapsedMs)&&elapsedMs>=0,'invalid-budget-observation');
  check(observedTokens+remaining.reduce((n,p)=>n+p.reserved_tokens,0)<=plan.cell_tokens&&elapsedMs+remaining.reduce((n,p)=>n+p.ms,0)<=plan.cell_ms,'downstream-reserve-unavailable');
  const p=plan.phases[stage];return {tokens:p.stop_tokens,ms:p.stop_ms,expected_tokens:p.expected_tokens,reserved_tokens:p.reserved_tokens,stage};
}
export function budgetWarning(plan,stage,usage){const p=plan.phases[stage];return usage>=p.expected_tokens?{stage,observed_tokens:usage,expected_tokens:p.expected_tokens,stop_tokens:p.stop_tokens,reserved_tokens:p.reserved_tokens,action:'continue-within-buffer'}:null;}
export function bufferedFaults(r){
  const reasons=[];
  for(const c of [...r.turns,...r.qa].filter(c=>c.generation_requested)){
    const p=bufferedBudget.phases[c.budget?.stage];
    if(!p)reasons.push('missing-phase-budget');
    else if((c.usage?.operational_tokens??0)>p.reserved_tokens||c.elapsed_ms>p.ms)reasons.push('phase-reserve-overrun');
    reasons.push(...(c.stop_reasons??[]).filter(reason=>!['token-limit','time-limit'].includes(reason)));
  }
  return [...new Set(reasons)];
}
// Only a clean local limit may leave the next separately reserved arm runnable.
export function cleanCellBudgetStop(r){
  const calls=[...r.turns,...r.qa],last=calls.at(-1);
  const reason=r.underlying_stop??last?.first_stop??r.first_stop;
  if(bufferedFaults(r).length)return false;
  return r.status==='stopped'&&['token-limit','time-limit','downstream-reserve-unavailable'].includes(reason)&&!r.protected_drift?.length&&!r.claim_cleanup_error&&!r.lifecycle?.error&&(!r.final_doctor||r.final_doctor.fail===0)&&calls.every(c=>!c.generation_requested||(c.terminals_empty===true&&c.server_exit_confirmed===true&&!c.cleanup_failure&&!c.interrupt_unconfirmed&&!c.interruption?.terminal_unconfirmed&&!c.protected_drift?.length&&!c.postprocess_failure&&(!c.interruption||c.interruption.terminal_confirmed===true)&&((c.usage_status==='observed-completed-turn'&&c.usage)||c.interruption)));
}
