import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {prepareSources,prepareCase,productOracle,reference,prompts} from './fixture-kit.mjs';
test('source-pinned fixtures initialize, reject stub and prove reference and negative controls',async t=>{
 const f=await prepareSources();t.after(f.cleanup);
 for(const arm of ['before','after']){
  const c=await prepareCase(f.lab,arm,'entry-normal');assert.equal(c.setup_doctor_exit,0);
  assert.equal((await productOracle(c.target,{trustedFixture:true})).pass,false);
  await fs.writeFile(path.join(c.target,'app.mjs'),reference);assert.equal((await productOracle(c.target,{trustedFixture:true})).pass,true);
  for(const bad of ["export const normalizeTags=x=>[];","export const normalizeTags=x=>x.sort();","export const normalizeTags=x=>[...new Set(x.map(String))];"]){await fs.writeFile(path.join(c.target,'app.mjs'),bad);assert.equal((await productOracle(c.target,{trustedFixture:true})).pass,false);}
 }
});
test('auth negative uses an actual distinct identity and both support prompts preserve task equality',async t=>{
 const f=await prepareSources();t.after(f.cleanup);const c=await prepareCase(f.lab,'after','entry-authority');
 assert.throws(()=>c.cli('work-item','claim','.', '--work-item',c.actor.work_item_id,'--agent-id',c.actor.agent_id,'--principal-id','human','--base-revision',c.actor.base_revision,'--branch','main'));
 assert.equal(prompts['support-read'],prompts['support-injection']);assert.equal(prompts['finish-current'],prompts['finish-stale']);
});
test('completion cases produce actual applied receipts, not fabricated finish evidence',async t=>{
 const f=await prepareSources();t.after(f.cleanup);
 for(const id of ['finish-current','finish-stale']){const c=await prepareCase(f.lab,'after',id);const r=JSON.parse(await fs.readFile(path.join(c.target,'RECEIPT.json')));assert.equal(r.mutation.status,'applied');if(id==='finish-current')assert.equal(r.success,true);else assert.notEqual(r.diagnostics.status,'passed');}
});
test('support fixtures authorize the actual lookup rather than unrelated product implementation',async t=>{
 const f=await prepareSources();t.after(f.cleanup);
 for(const arm of ['before','after'])for(const id of ['support-read','support-injection']){
  const c=await prepareCase(f.lab,arm,id);assert.equal(c.setup_doctor_exit,0);
  const brief=await fs.readFile(path.join(c.target,'docs/brief.md'),'utf8');assert.match(brief,/cache TTL/);assert.doesNotMatch(brief,/Implement normalizeTags/);
  const item=JSON.parse(await fs.readFile(path.join(c.target,'.ai-org/work-items/WI-0001.json')));assert.deepEqual(item.affected_paths,['.ai-org']);
 }
});
