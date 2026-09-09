import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {matrixCells,matrixLimits,matrixPrompt} from '../scripts/delivery-matrix-experiment.mjs';
import {validatePriorState,validateCompletion,originalManifestDigest} from '../scripts/delivery-matrix-completion.mjs';

const hash=x=>createHash('sha256').update(x).digest('hex');
function prior(){
  const manifest={schema_version:'delivery-matrix/v1',cells:matrixCells(),limits:matrixLimits};
  const turn=model=>({status:'completed',generation_requested:true,usage_status:'observed-completed-turn',model,effort:'medium',terminals_empty:true,server_exit_confirmed:true,protected_drift:[]});
  const state={status:'stopped',events:matrixCells().slice(0,6).flatMap(c=>[{cell:c.id},{cell:c.id}]),cells:matrixCells().slice(0,6).map((c,i)=>({...c,status:i<5?'accepted':'stopped',turns:[turn(c.model)],qa:[turn(matrixLimits.qa_model)],accounting_complete:true,final_revision:'exact',repair_used:false}))};
  return {manifest,state};
}
test('completion requires the exact six started pairs and rejects generated remaining cells or uncertain history',()=>{
  const {manifest,state}=prior();validatePriorState(manifest,state);
  for(const mutate of [s=>s.status='completed',s=>s.cells.pop(),s=>s.events[11].cell='retry-temple-gpt6',s=>s.cells[0].accounting_complete=false,s=>s.cells[1].turns[0].effort='high',s=>s.cells[5].qa[0].terminals_empty=false,s=>s.cells[0].repair_used=true,s=>s.cells.reverse()]){
    const copy=structuredClone(state);mutate(copy);assert.throws(()=>validatePriorState(manifest,copy));
  }
});
test('amended continuation cannot silently change subjects, model, prompt or reviewer budget',()=>{
  const cells=matrixCells().slice(6),m={schema_version:'delivery-matrix-completion/v1',original_manifest_digest:originalManifestDigest,limits:matrixLimits,cells,prompts:cells.map(c=>({id:c.id,execution:hash(matrixPrompt(c.workflow,'execute')),review:hash(matrixPrompt(null,'review'))}))};
  validateCompletion(m);
  for(const mutate of [m=>m.original_manifest_digest='other',m=>m.cells.reverse(),m=>m.cells.push(matrixCells()[0]),m=>m.cells[0].model='gpt-5.6-terra',m=>m.limits.qa_tokens++,m=>m.prompts[0].review='different']){
    const copy=structuredClone(m);mutate(copy);assert.throws(()=>validateCompletion(copy));
  }
});
