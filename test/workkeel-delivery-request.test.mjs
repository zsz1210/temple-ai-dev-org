import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {initializeTaskProject} from '../src/workkeel-project.mjs';
import {previewTaskIntake,applyTaskIntake} from '../src/workkeel-intake.mjs';
import {readNativeTask,mutateNativeTask} from '../src/workkeel-tasks.mjs';
import {prepareDeliveryRequest} from '../scripts/workkeel-delivery-request.mjs';
import {readDeliveryGuide} from '../scripts/workkeel-delivery.mjs';

const actor={agent_id:'builder',principal_id:'owner'},reviewer={agent_id:'reviewer',principal_id:'owner'};
async function fixture(t) {
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'delivery-request-')));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
  await initializeTaskProject(root,{schema_version:'workkeel.task-policy/v1',principals:['owner'],agents:[actor,reviewer],approvers:['owner'],review_separation:'distinct-agent'});
  await fs.mkdir(root+'/docs');await fs.mkdir(root+'/src');
  await fs.writeFile(root+'/docs/approval.md','Approved fixture');await fs.writeFile(root+'/src/a.txt','baseline');
  git('add','.');git('commit','-qm','Baseline');
  const brief={schema_version:'workkeel.task-brief/v1',id:'WK-entry',goal:'Delivery request fixture',actor,acceptance:['Preserve native guards'],
    environment:{cwd:'.',read_paths:['.'],write_paths:['src'],tools:['node'],resources:[],network:{mode:'none',hosts:[]},external_actions:[],data:{classification:'internal',model_access:'none',policy_refs:['docs/approval.md']}},
    authorization:{approved_by:'owner',approval_ref:'docs/approval.md',operations:['read','write','execute'],expires_at:null}};
  const preview=await previewTaskIntake(root,brief);await applyTaskIntake(root,brief,preview.fingerprint);
  const input=(action,fields={})=>({task_id:brief.id,action,actor:action==='review'?reviewer:actor,operation_id:action,...fields});
  const prepare=(action,fields)=>prepareDeliveryRequest(root,input(action,fields));
  const apply=p=>mutateNativeTask(root,brief.id,p.action,p.request);
  const read=()=>readNativeTask(root,brief.id);
  const deliver=async(evidence=['docs/approval.md'])=>apply(await prepare('handoff',{summary:'Actual fixture result',evidence,unresolved:[]}));
  return {root,git,input,prepare,apply,read,deliver};
}

test('generated requests complete the unchanged lifecycle with explicit decisions and identical replay',async t=>{
  const f=await fixture(t),before=await f.read(),guide=await readDeliveryGuide(f.root,'WK-entry');
  assert.equal(guide.operation.action,'claim');assert.deepEqual(guide.context.acceptance_criteria,before.contract.acceptance.criteria);
  assert.equal(guide.context.timeline,undefined);assert.equal(guide.execution_authorized,false);
  const claim=await f.prepare('claim');assert.equal(claim.request.base_revision,f.git('rev-parse','HEAD'));
  assert.equal(claim.mutation_status,'no-write');assert.equal(claim.validation_status,'native-apply-required');assert.deepEqual(await f.read(),before);
  await f.apply(claim);assert.equal((await f.apply(claim)).replayed,true);
  await assert.rejects(f.prepare('claim'),/already recorded/);
  await fs.writeFile(f.root+'/src/a.txt','fixed');f.git('add','src/a.txt');f.git('commit','-qm','Fix');
  const handoff=await f.prepare('handoff',{summary:'Verified fixture',evidence:['docs/approval.md'],unresolved:[]});
  assert.equal(handoff.request.claim_id,(await f.read()).claim.id);assert.equal(handoff.request.expected_version,2);await f.apply(handoff);
  const review=await f.prepare('review',{judgment:'pass',summary:'Actual fixture review',evidence:['docs/approval.md']});
  assert.equal(review.request.revision,handoff.request.revision);await f.apply(review);
  const close=await f.prepare('close',{summary:'Accepted fixture',rollback:'Revert fixture commit',evidence:['docs/approval.md']});await f.apply(close);
  assert.equal((await f.read()).state,'done');assert.equal((await readDeliveryGuide(f.root,'WK-entry')).operation.action,null);
});

test('preparation rejects overrides, missing decisions and false resolution without writing',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));const before=await f.read();
  for(const fields of [{},{summary:'x',evidence:['docs/approval.md']},{summary:'x',evidence:[],unresolved:[]},{summary:'x',evidence:['docs/approval.md'],unresolved:['bug']},
    {summary:'x',evidence:['docs/approval.md'],unresolved:[],expected_version:1}])await assert.rejects(f.prepare('handoff',fields));
  await assert.rejects(f.prepare('handoff',{summary:'x',evidence:['docs/approval.md'],unresolved:[],actor:reviewer}),/matching implementation claim/);
  await assert.rejects(prepareDeliveryRequest(f.root,f.input('cancel',{summary:'x',evidence:['docs/approval.md']})),/unsupported/);
  assert.deepEqual(await f.read(),before);
});

test('stale saved requests are refused by native apply instead of silently refreshing',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));
  const old=await f.prepare('handoff',{summary:'x',evidence:['docs/approval.md'],unresolved:[]});
  await mutateNativeTask(f.root,'WK-entry','release',{operation_id:'release',expected_version:2,actor,claim_id:old.request.claim_id,summary:'Yield'});
  await f.apply(await f.prepare('claim',{operation_id:'claim-again'}));
  await assert.rejects(f.apply(old),/Stale/);assert.equal((await f.read()).state,'build');
});

test('native apply rejects HEAD changes after request preparation',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));
  const handoff=await f.prepare('handoff',{summary:'x',evidence:['docs/approval.md'],unresolved:[]});
  await fs.writeFile(f.root+'/src/a.txt','later');f.git('add','src/a.txt');f.git('commit','-qm','Later');
  await assert.rejects(f.apply(handoff),/current commit/);assert.equal((await f.read()).state,'build');
});

test('native apply rejects out-of-scope candidates and missing evidence',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));
  await assert.rejects(f.deliver(['docs/missing.md']));assert.equal((await f.read()).state,'build');
  await fs.writeFile(f.root+'/outside.txt','not approved');f.git('add','outside.txt');f.git('commit','-qm','Outside scope');
  await assert.rejects(f.deliver(),/outside approved write roots/);assert.equal((await f.read()).state,'build');
});

test('native apply refuses product drift and changed pinned authority',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));
  const handoff=await f.prepare('handoff',{summary:'x',evidence:['docs/approval.md'],unresolved:[]});
  await fs.writeFile(f.root+'/src/a.txt','uncommitted');await assert.rejects(f.apply(handoff),/clean product tree/i);
  await fs.writeFile(f.root+'/src/a.txt','baseline');await fs.writeFile(f.root+'/docs/approval.md','Changed approval');
  await assert.rejects(f.apply(handoff),/evidence|approval|changed/i);assert.equal((await f.read()).state,'build');
});

test('review requires a distinct actual actor and explicit verdict; fail cannot become close',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));await f.deliver();
  const fields={judgment:'pass',summary:'Reviewed',evidence:['docs/approval.md']};
  await assert.rejects(f.prepare('review',{...fields,actor}),/separation/);
  await assert.rejects(f.prepare('review',{summary:'Reviewed',evidence:['docs/approval.md']}));
  const pass=await f.prepare('review',fields);
  await assert.rejects(f.apply({...pass,request:{...pass.request,actor}}),/separation/);
  await f.apply(await f.prepare('review',{...fields,judgment:'fail'}));
  await assert.rejects(f.prepare('close',{summary:'Accept',rollback:'Revert',evidence:['docs/approval.md']}),/stage/);
  assert.equal((await readDeliveryGuide(f.root,'WK-entry')).operation.action,null);
});

test('close rechecks review evidence after preparation',async t=>{
  const f=await fixture(t);await f.apply(await f.prepare('claim'));await f.deliver();
  await fs.mkdir(f.root+'/.ai-org/artifacts/WK-entry',{recursive:true});
  const ref='.ai-org/artifacts/WK-entry/review.md';await fs.writeFile(f.root+'/'+ref,'Actual fixture review');
  await f.apply(await f.prepare('review',{judgment:'pass',summary:'Reviewed',evidence:[ref]}));
  const close=await f.prepare('close',{summary:'Accept',rollback:'Revert',evidence:['docs/approval.md']});
  await fs.writeFile(f.root+'/'+ref,'Changed judgment');await assert.rejects(f.apply(close),/changed|evidence/i);
  assert.equal((await f.read()).state,'release_gate');
});

test('guide retains authority warnings and full scope after authority changes',async t=>{
  const f=await fixture(t);await fs.writeFile(f.root+'/docs/approval.md','Changed');
  const guide=await readDeliveryGuide(f.root,'WK-entry');
  assert.ok(guide.context.attention_reasons.includes('evidence-unavailable'));
  assert.deepEqual(guide.context.execution_scope.write_paths,['src']);assert.equal(guide.execution_authorized,false);
});

test('CLI preparation is read-only, emits usable JSON and preserves bounded file admission',async t=>{
  const f=await fixture(t),privateDir=await fs.mkdtemp(path.join(os.tmpdir(),'delivery-input-'));
  t.after(()=>fs.rm(privateDir,{recursive:true,force:true}));
  const input=privateDir+'/request.json',script=new URL('../scripts/workkeel-delivery.mjs',import.meta.url).pathname;
  await fs.writeFile(input,JSON.stringify(f.input('claim')));
  const run=(command,file)=>spawnSync(process.execPath,[script,command,f.root,file],{encoding:'utf8'});
  const before=await f.read(),prepared=run('prepare',input);assert.equal(prepared.status,0,prepared.stderr);
  assert.equal(JSON.parse(prepared.stdout).request.expected_version,1);assert.deepEqual(await f.read(),before);
  assert.equal(JSON.parse(run('guide','WK-entry').stdout).operation.action,'claim');
  await fs.symlink(input,privateDir+'/link.json');assert.equal(run('prepare',privateDir+'/link.json').status,1);
  await fs.writeFile(input,' '.repeat(65537));const large=run('prepare',input);assert.equal(large.status,1);assert.ok(!large.stderr.includes(privateDir));
});
