import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {successorRecords} from '../scripts/core-comparison-successor.mjs';import {checkContinuationCapacity,checkedActor} from '../scripts/core-comparison-runner.mjs';
const settings=JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/core-runtime.settings.json',import.meta.url)));
const auth={ref:'Explicit unit-test authorization',prior_calls:8,prior_tokens:238001,max_calls:23,max_tokens:2837509};
function fixture(){let i=0;const call=n=>({thread_id:'prior-'+i++,status:'completed',usage_status:'observed-completed-turn',terminals_empty:true,server_exit_confirmed:true,usage:{input_tokens:n,cached_input_tokens:0,output_tokens:0,operational_tokens:n},elapsed_ms:100});const failed={...call(42325),status:'stopped',first_stop:'participant-source-or-history-drift',protected_drift:['.ai-org/views/capabilities.json']};return {p:{settings},s:{status:'stopped',active_cell:1,cells:[{id:'core',status:'accepted',accepted:true,calls:[call(29823),call(22741),call(28087)],next_stage:null},{id:'lean',status:'stopped',next_stage:'recovery',calls:[call(37516),failed],first_stop:'actor-or-accounting-incomplete'},...['terra-lean','terra-core'].map(id=>({id,status:'prepared',next_stage:'build',calls:[]}))]}};}
test('successor preserves old acceptance/build and failed cost without mutating history',()=>{
 const {p,s}=fixture(),before=structuredClone(s),r=successorRecords(p,s,auth);assert.deepEqual(s,before);assert.equal(r.state.cells[0].carried_acceptance,true);assert.equal(r.state.cells[1].calls.length,1);assert.equal(r.state.cells[1].prior_failed_calls[0].usage.operational_tokens,42325);assert.equal(r.state.cells[1].observed.calls,1);assert.equal(r.continuation.prior_thread_ids.length,5);checkContinuationCapacity({...p,continuation:r.continuation},r.state);
 assert.throws(()=>checkContinuationCapacity({...p,continuation:{...r.continuation,authorization:{...auth,max_calls:21}}},r.state),/call-reserve/);
 assert.throws(()=>checkContinuationCapacity({...p,continuation:{...r.continuation,authorization:{...auth,max_tokens:1000000}}},r.state),/token-reserve/);
});
test('unknown, edited or incomplete predecessor cannot be carried as a safe successor',()=>{
 for(const mutate of [s=>s.status='running',s=>s.cells[0].accepted=false,s=>s.cells[1].calls[1].usage_status='unknown',s=>s.cells[1].calls[1].protected_drift.push('src/doc-links.mjs'),s=>s.cells[1].calls[1].terminals_empty=false,s=>s.cells[1].calls[1].usage.operational_tokens++,s=>s.cells[2].calls.push({})]){const{p,s}=fixture();mutate(s);assert.throws(()=>successorRecords(p,s,auth));}
 assert.throws(()=>successorRecords(fixture().p,fixture().s,{...auth,ref:''}));
});
test('drift, cleanup and usage failures remain distinct',()=>{
 assert.throws(()=>checkedActor({protected_drift:['file']},settings.phases.recovery),/participant-protected-file-drift/);
 assert.throws(()=>checkedActor({terminals_empty:false},settings.phases.recovery),/actor-cleanup-incomplete/);
 assert.throws(()=>checkedActor({terminals_empty:true,server_exit_confirmed:true,usage_status:'unknown'},settings.phases.recovery),/actor-usage-incomplete/);
});
