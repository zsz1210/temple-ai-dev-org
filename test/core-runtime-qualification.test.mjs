import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {validateReservations,phaseReservation} from '../scripts/core-runtime-qualification.mjs';
import {selectionReservation,coreGradeVerdict} from '../scripts/core-comparison-fixture.mjs';
import {gradeProduct,classifyMatrixCheck} from '../scripts/delivery-matrix-experiment.mjs';
import {docFixture} from '../scripts/real-doc-check-fixture-v4.mjs';
import {write} from '../scripts/autonomy-experiment.mjs';
import {planEvaluation} from '../scripts/evaluation-plan.mjs';
const settings=JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/core-runtime.settings.json',import.meta.url)));
test('complete path reserves recovery, repair, reverification and explicit outer buffers',()=>{
  assert.deepEqual(validateReservations(settings),{cell:{tokens:640000,time_ms:2820000,calls:5},aggregate:{tokens:2760000,time_ms:11880000,calls:20}});
  const p=phaseReservation(settings,'recovery',{tokens:190000,time_ms:590000,calls:1});assert.equal(p.stop_tokens,120000);
  assert.throws(()=>phaseReservation(settings,'recovery',{tokens:200001,time_ms:590000,calls:1}),/downstream/);
  assert.throws(()=>phaseReservation(settings,'recovery',{tokens:0,time_ms:600001,calls:1}),/downstream/);
  for(const mutate of [s=>s.phases.verify.stop_tokens=s.phases.verify.reserve_tokens,s=>s.phases.build.reserve_ms=s.phases.build.stop_ms,s=>s.ceilings.calls=19,s=>s.batch_overhead.tokens=0,s=>s.model_generation_authorized=true,s=>s.retry=true]){const s=structuredClone(settings);mutate(s);assert.throws(()=>validateReservations(s));}
});
test('runtime and reusable planner agree on every aggregate reservation',async()=>{
  const catalog=JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/catalog.json',import.meta.url))),selection=JSON.parse(await fs.readFile(new URL('../scripts/evaluation-catalog/core-comparison.template.json',import.meta.url)));
  selection.budget={per_scenario:{'interruption-recovery':selectionReservation(settings)},batch_overhead:settings.batch_overhead,ceilings:settings.ceilings};
  const p=planEvaluation(selection,catalog);assert.equal(p.cells.length,4);assert.deepEqual(p.reservation.total,settings.ceilings);assert.equal(p.launch_ready,false);
});
test('real product grading rejects vacuous tests and accepts a qualified regression',async t=>{
 const lab=await fs.mkdtemp(path.join(os.tmpdir(),'core-grade-'));t.after(()=>fs.rm(lab,{recursive:true,force:true}));const root=path.join(lab,'product');
 for(const [p,s]of Object.entries({...docFixture.seed,...docFixture.reference,...docFixture.publicTests}))await write(root,p,s);
 const localCheck=async(files,f,_base,_lab,label,tests)=>{const dir=await fs.mkdtemp(path.join(lab,label+'-'));for(const [p,s]of Object.entries({...files,...f.publicTests,'oracle.test.mjs':f.hiddenTests}))await write(dir,p,s);const env={...process.env};delete env.NODE_TEST_CONTEXT;env.TMPDIR=dir;const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...tests],{cwd:dir,env,encoding:'utf8',timeout:10000});return classifyMatrixCheck({stdout:r.stdout??'',stderr:r.stderr??'',exit_code:r.status,timed_out:!!r.error});};
 await write(root,'test/additional.test.mjs',"import test from 'node:test';import assert from 'node:assert/strict';test('vacuous',()=>assert.ok(true));");
 const empty=await gradeProduct(root,docFixture,{},lab,{check:localCheck});assert.equal(empty.accepted,true);assert.equal(empty.mutations.length,5);assert.ok(empty.mutations.every(m=>!m.detected));assert.equal(coreGradeVerdict(empty,{decision:'pass'}).instrument_valid,true);assert.equal(coreGradeVerdict(empty,{decision:'pass'}).accepted,false);
 await write(root,'test/additional.test.mjs',"import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {findBrokenLinks} from '../src/doc-links.mjs';test('empty selection ignores unrelated dangling link',async()=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'regression-'));try{await fs.writeFile(path.join(root,'a.md'),'[bad](missing)');assert.deepEqual(await findBrokenLinks(root,{files:[]}),[]);}finally{await fs.rm(root,{recursive:true,force:true});}});");
 const meaningful=await gradeProduct(root,docFixture,{},lab,{check:localCheck});assert.equal(coreGradeVerdict(meaningful,{decision:'pass'}).accepted,true);
 for(const mutate of [g=>g.mutations.pop(),g=>g.mutations[0].timed_out=true,g=>g.mutations[0].cancelled=1,g=>g.reference_baseline.exit_code=1,g=>g.regression.invalid_execution=true]){const g=structuredClone(meaningful);mutate(g);assert.equal(coreGradeVerdict(g,{decision:'pass'}).instrument_valid,false);}
});
