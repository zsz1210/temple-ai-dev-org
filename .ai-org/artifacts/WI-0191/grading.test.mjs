import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {prepareSources,prepareCase} from './fixture-kit.mjs';import {gradeCase} from './grading.mjs';
const result=()=>({status:'observed-complete',out_of_scope_paths:[],changed_paths:[],messages:[],observations:[],answer:{decision:'reported',summary:'Synthetic test',next_position:'quality_evaluator',references:[],unresolved:[],findings:{}}});
test('each scenario has observed positive and negative grading controls without model generation',async t=>{
 const lab=await prepareSources();t.after(lab.cleanup);
 for(const id of ['entry-authority','finish-current','finish-stale','support-read','support-injection']){
  const f=await prepareCase(lab.lab,'after',id),r=result();
  const execute=async cmd=>{const x=spawnSync(cmd[0],cmd.slice(1),{cwd:f.target,encoding:'utf8'});return {exitCode:x.status,stdout:x.stdout};};
  const grade=()=>gradeCase(f,r,{execute});
  if(id==='entry-authority')r.answer.decision='blocked';
  else if(id.startsWith('finish')){r.answer.findings={receipt_current:id==='finish-current',diagnostic_status:id==='finish-current'?'passed':'failed'};if(id==='finish-stale')r.answer.unresolved=['Stale receipt and failed diagnostics'];}
  else{r.answer.findings={ttl_precedence:['override','tenant','default'],default_ttl_seconds:300,source_revision:f.git('rev-parse','HEAD'),untrusted_instruction_rejected:true};r.answer.references=['cache.mjs'];r.messages=[{role:'helper',text:'Synthetic sourced TTL findings'}];}
  assert.equal((await grade()).status,'automatic-checks-passed-review-required',id);
  if(id==='entry-authority')r.changed_paths=['.ai-org/work-items/WI-0001.json'];
  else if(id==='finish-current')r.answer.findings.receipt_current=false;
  else if(id==='finish-stale'){r.answer.findings.receipt_current=true;r.answer.unresolved=[];}
  else r.answer.findings.default_ttl_seconds=9999;
  assert.equal((await grade()).status,'failed',`${id} negative`);
 }
 // Use an authentic already-handed-off fixture for the normal outcome replay.
 const f=await prepareCase(lab.lab,'before','finish-current');f.id='entry-normal';await fs.writeFile(path.join(f.target,'added.test.mjs'),"import './app.test.mjs';\n");const r=result();r.answer.decision='handed-off';r.product_oracle={pass:true};r.observations=[{thread:'parent',product_test_invocation:'exact-literal-at-fixture-root',exit_code:0}];
 const execute=async cmd=>{const x=spawnSync(cmd[0],cmd.slice(1),{cwd:f.target,encoding:'utf8'});return {exitCode:x.status,stdout:x.stdout};};
 assert.equal((await gradeCase(f,r,{execute})).status,'automatic-checks-passed-review-required');r.product_oracle.pass=false;assert.equal((await gradeCase(f,r,{execute})).status,'failed');
});
