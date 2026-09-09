import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {recoveryFixtures} from '../scripts/recovery-matrix-fixtures.mjs';
import {recoveryCells,recoveryPrompt,recoveryHash as hash,validateRecovery,evidenceMatches,prepareCheckpoint,executeRecovery} from '../scripts/recovery-matrix-experiment.mjs';
import {matrixLimits,fixtureEditable} from '../scripts/delivery-matrix-experiment.mjs';
import {scopeChanges,git,write,tree} from '../scripts/autonomy-experiment.mjs';

function manifest(){const cells=recoveryCells().map(c=>({...c,checkpoint_revision:'same-'+c.task,checkpoint_facts_digest:hash(c.task)}));return {schema_version:'recovery-matrix/v1',limits:matrixLimits,fixtures_digest:hash(recoveryFixtures),cells,prompts:cells.map(c=>({id:c.id,execution:hash(recoveryPrompt(c.workflow,'execute')),review:hash(recoveryPrompt(null,'review'))}))};}
test('continuation freezes all eight treatments and equal facts, never silently changes prompts/models/budgets',()=>{
  const m=manifest();validateRecovery(m);
  for(const f of recoveryFixtures)assert.equal(new Set(m.cells.filter(c=>c.task===f.id).map(c=>c.workflow+c.model)).size,4);
  for(const mutate of [m=>m.cells.pop(),m=>m.cells.reverse(),m=>m.cells[0].model='fallback',m=>m.cells[0].effort='high',m=>m.cells[0].checkpoint_revision='different',m=>m.cells[0].checkpoint_facts_digest='different',m=>m.prompts[0].execution='drift',m=>m.prompts[0].review='drift',m=>m.fixtures_digest='drift',m=>m.limits.cell_tokens++,m=>m.schema_version='other']){const copy=structuredClone(m);mutate(copy);assert.throws(()=>validateRecovery(copy));}
});
test('fresh actors receive current handoff instruction, blind verifier gets no treatment/history feedback',()=>{
  for(const w of ['temple','autonomous']){const p=recoveryPrompt(w,'execute');assert.match(p,/HANDOFF.md and CURRENT.json/);assert.match(p,/src\/quote.mjs and test\/additional.test.mjs/);assert.match(p,/No previous conversation/);assert.match(p,/Historical passing evidence/);assert.doesNotMatch(p,/src\/\*\*/);assert.match(recoveryPrompt(w,'repair',{issue:'boundary'}),/boundary/);}
  assert.equal(recoveryPrompt('temple','review',{secret:'old-pass'}),recoveryPrompt('autonomous','review'));
  assert.doesNotMatch(recoveryPrompt(null,'review'),/HANDOFF|CURRENT|old-pass|Temple|autonomous/);
});
test('accepted discount and every supplied checkpoint/test stay protected even when current behavior passes',()=>{
  for(const f of recoveryFixtures){
    const before={'src/quote.mjs':'old','src/discount.mjs':'accepted','test/public.test.mjs':'given','SPEC.md':'current','history/verification-v1.json':'old-pass'};
    const after={...before,'src/quote.mjs':'fixed','src/discount.mjs':'rewritten','test/additional.test.mjs':'new','history/verification-v1.json':'claimed-current'};
    assert.deepEqual(scopeChanges(before,after,p=>fixtureEditable(f,p)),['src/discount.mjs','history/verification-v1.json']);
    assert.equal(fixtureEditable(f,'src/unrequested.mjs'),false);assert.equal(fixtureEditable(f,'test/public.test.mjs'),false);
  }
  assert.equal(fixtureEditable({},'src/ordinary.mjs'),true,'older matrix default unchanged');
});
test('passing old evidence cannot match a changed revision, spec or larger required test scope',()=>{
  const r={revision:'v1',spec_sha256:hash('old'),tests:['discount.test.mjs'],result:{exit_code:0,tests:5}};
  const accepted={revision:'v1',spec:'old',requiredTests:['discount.test.mjs']};assert.equal(evidenceMatches(r,accepted),true);
  for(const change of [{revision:'v2'},{spec:'new'},{requiredTests:['discount.test.mjs','quote.test.mjs']}])assert.equal(evidenceMatches(r,{...accepted,...change}),false);
  assert.equal(evidenceMatches({...r,result:{exit_code:1,tests:5}},accepted),false);
});
test('checkpoint commits real observed historical scope then current state; refuses failed historical check',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'recovery-checkpoint-test-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));
  for(const f of recoveryFixtures){
    let observed;
    const c=await prepareCheckpoint(lab,f,{}, {check:async(files,old,base,root,label,tests)=>{observed={files,old,tests};return {exit_code:0,tests:tests.length,passed:tests.length,cancelled:0,timed_out:false,invalid_execution:false};}});
    assert.deepEqual(observed.tests,Object.keys(f.historicalTests));assert.deepEqual(observed.files,f.historicalFiles);
    const record=JSON.parse(await fs.readFile(path.join(c.root,'history/verification-v1.json'),'utf8'));
    assert.equal(await git(c.root,'show',record.revision+':SPEC.md'),f.historicalFiles['SPEC.md'].trim());
    assert.notEqual(record.revision,c.revision);assert.equal(c.facts_digest,hash(await tree(c.root)));
    assert.equal(await fs.readFile(path.join(c.root,'src/discount.mjs'),'utf8'),f.seed['src/discount.mjs']);
    assert.equal(await fs.readFile(path.join(c.root,'SPEC.md'),'utf8'),f.spec);
    assert.equal(evidenceMatches(record,{revision:c.revision,spec:f.spec,requiredTests:Object.keys(f.publicTests)}),false);
  }
  const bad=await fs.mkdtemp(path.join(lab,'bad-'));await assert.rejects(prepareCheckpoint(bad,recoveryFixtures[0],{}, {check:async()=>({exit_code:1,tests:1})}),/historical-control-failed/);
});
test('wrong frozen digest prevents acquisition and generation',async t=>{
  const lab=await fs.mkdtemp(path.join(os.tmpdir(),'recovery-guard-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));await write(lab,'manifest.json',manifest());await write(lab,'state.json',{status:'prepared',cells:[],events:[]});
  await assert.rejects(executeRecovery(lab,'wrong'),/recovery-manifest-drift/);await assert.rejects(fs.stat(path.join(lab,'STARTED')),e=>e.code==='ENOENT');
});
