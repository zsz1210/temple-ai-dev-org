// Coordinator-only fixed-checkpoint probes. Never expose this module to subjects.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {recoveryFixtures} from './recovery-matrix-fixtures.mjs';
import {matrixCells,matrixLimits,matrixPrompt,matrixEnvironment,checkFiles,installLean,closeLean,modelPreflight,executeMatrixCells} from './delivery-matrix-experiment.mjs';
import {write,read,tree,git,cli,seed,acquireRun} from './autonomy-experiment.mjs';

const source=path.resolve(import.meta.dirname,'..');
export const recoveryHash=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const hash=recoveryHash,assert=(ok,why)=>{if(!ok)throw Error(why);};
export function recoveryCells(){return matrixCells().map(c=>{const task=c.task==='batch'?'changed-spec':'cold-recovery';return {...c,id:c.id.replace(c.task,task),task};});}
export function recoveryPrompt(workflow,stage,feedback=null){
  if(stage==='review')return matrixPrompt(null,'review');
  return matrixPrompt(workflow,stage,feedback).replace('src/** and test/additional.test.mjs','src/quote.mjs and test/additional.test.mjs')+'\nThis is a fresh repository-only continuation. Read HANDOFF.md and CURRENT.json, then inspect current SPEC.md and the remaining implementation. Historical passing evidence describes only its named old revision and scope; verify the current candidate yourself. Preserve accepted src/discount.mjs and all supplied tests/history/requirements. Finish the current goal with meaningful new regression tests. No previous conversation is available.';
}
export function evidenceMatches(record,{revision,spec,requiredTests}){
  return record.revision===revision&&record.spec_sha256===hash(spec)&&record.result?.exit_code===0&&record.result?.tests>0&&requiredTests.every(t=>record.tests?.includes(t));
}
export function validateRecovery(m){
  assert(m.schema_version==='recovery-matrix/v1','recovery-schema');
  assert(hash(m.limits)===hash(matrixLimits),'recovery-budget-drift');
  const expected=recoveryCells();assert(m.cells?.length===expected.length,'recovery-cell-count');
  expected.forEach((e,i)=>assert(Object.entries(e).every(([k,v])=>m.cells[i][k]===v),'recovery-cell-drift'));
  assert(m.prompts?.length===expected.length&&m.prompts.every((p,i)=>p.id===expected[i].id&&p.execution===hash(recoveryPrompt(expected[i].workflow,'execute'))&&p.review===hash(recoveryPrompt(null,'review'))),'recovery-prompt-drift');
  assert(m.fixtures_digest===hash(recoveryFixtures),'recovery-fixture-drift');
  for(const f of recoveryFixtures){
    const cells=m.cells.filter(c=>c.task===f.id);
    assert(cells.every(c=>c.checkpoint_revision===cells[0].checkpoint_revision&&c.checkpoint_facts_digest===cells[0].checkpoint_facts_digest),'unequal-checkpoint-facts');
  }
}
async function sourceDigest(){
  const names=['scripts/recovery-matrix-experiment.mjs','scripts/recovery-matrix-fixtures.mjs','scripts/delivery-matrix-experiment.mjs','scripts/delivery-matrix-fixtures.mjs','scripts/autonomy-experiment.mjs','scripts/autonomy-fixtures.mjs','scripts/continuity-live-runner.mjs','scripts/continuity-named-permissions.mjs','scripts/delivery-control-pair.mjs','src/codex-app-server-provider.mjs','src/app-server-protocol-replay.mjs','.ai-org/artifacts/WI-0255/design.md'];
  return hash(await Promise.all(names.map(async p=>[p,hash(await fs.readFile(path.join(source,p)))])));
}
export async function prepareCheckpoint(lab,f,base,{check=checkFiles}={}){
  const root=path.join(lab,'checkpoint-'+f.id),started=Date.now();
  const oldSpec=f.historicalFiles['SPEC.md'];assert(typeof oldSpec==='string','historical-spec-missing');
  await seed(root,{seed:f.historicalFiles,publicTests:f.historicalTests,spec:oldSpec});
  const revision=await git(root,'rev-parse','HEAD'),tests=Object.keys(f.historicalTests);
  const result=await check(f.historicalFiles,{publicTests:f.historicalTests,hiddenTests:''},base,lab,'historical-'+f.id,tests);
  assert(result.exit_code===0&&result.tests>0&&!result.timed_out&&!result.invalid_execution,'historical-control-failed');
  const record={schema_version:'recovery-historical-evidence/v1',revision,spec_sha256:hash(oldSpec),command:[process.execPath,'--test','--test-timeout=1000','--test-reporter=tap',...tests],tests,scope:'Historical predecessor tests only; not acceptance of the current candidate',result};
  assert(evidenceMatches(record,{revision,spec:oldSpec,requiredTests:tests}),'historical-self-check');
  // Old tests survive in Git history; the current supplied suite is authoritative.
  for(const p of tests)await fs.rm(path.join(root,p));
  for(const[p,body]of Object.entries({...f.seed,...f.publicTests,...f.checkpointFiles,'SPEC.md':f.spec,'history/verification-v1.json':record}))await write(root,p,body);
  await git(root,'add','.');await git(root,'commit','-m','Freeze current requirements and handoff checkpoint');
  const currentRevision=await git(root,'rev-parse','HEAD');
  assert(!evidenceMatches(record,{revision:currentRevision,spec:f.spec,requiredTests:Object.keys(f.publicTests)}),'stale-evidence-accepted');
  return {root,revision:currentRevision,facts_digest:hash(await tree(root)),historical:record,preparation_ms:Date.now()-started};
}
export async function prepareRecovery(){
  const {lab,bundle,base,isolation}=await matrixEnvironment('temple-recovery-matrix-'),checkpoints=[],controls=[],cells=[];
  for(const f of recoveryFixtures){
    checkpoints.push({task:f.id,...await prepareCheckpoint(lab,f,base)});
    const tests=['oracle.test.mjs',...Object.keys(f.publicTests)];
    for(const [kind,files,name]of [['seed',f.seed],['reference',f.reference],...f.mutations.map(m=>['mutation',{...f.reference,...m.files},m.name])])
      controls.push({task:f.id,kind,...(name?{name}:{}),...await checkFiles(files,f,base,lab,'control-'+f.id,tests)});
  }
  assert(controls.every(c=>!c.invalid_execution&&!c.timed_out&&c.cancelled===0&&(c.kind==='reference'?c.exit_code===0&&c.tests>0:c.exit_code!==0&&c.failures>0)),'recovery-control-failure');
  for(const f of recoveryFixtures)assert(controls.filter(c=>c.task===f.id&&c.kind==='mutation').length>=3,'insufficient-mutation-controls');
  for(const selected of recoveryCells()){
    const f=recoveryFixtures.find(f=>f.id===selected.task),checkpoint=checkpoints.find(c=>c.task===f.id),root=path.join(lab,selected.id),started=Date.now();
    await fs.cp(checkpoint.root,root,{recursive:true});assert(hash(await tree(root))===checkpoint.facts_digest,'checkpoint-copy-drift');
    if(selected.workflow==='temple')await installLean(root,lab,f);
    else{await write(root,'AGENTS.md','# Autonomous continuation\nCurrent SPEC.md defines the authorized goal. Read HANDOFF.md and CURRENT.json. Developer owns design, implementation and self-verification. Product writes are only src/quote.mjs and test/additional.test.mjs. Preserve all other supplied files. The coordinator performs fixed Git and evidence bookkeeping; a distinct blind product Verifier assesses current acceptance.\n');await git(root,'add','.');await git(root,'commit','-m','Prepare autonomous continuation');}
    // Both treatments retain the same product/checkpoint facts after setup.
    const after=await tree(root),facts=await tree(checkpoint.root);assert(Object.entries(facts).every(([p,h])=>after[p]===h),'workflow-changed-checkpoint-facts');
    cells.push({...selected,root,setup_ms:Date.now()-started,checkpoint_revision:checkpoint.revision,checkpoint_facts_digest:checkpoint.facts_digest,seed_manifest:after,base_revision:await git(root,'rev-parse','HEAD')});
  }
  const preflight=await modelPreflight(base,cells[0]);
  const smokeRoot=path.join(lab,'lean-smoke'),f=recoveryFixtures[0];await fs.cp(checkpoints[0].root,smokeRoot,{recursive:true});await installLean(smokeRoot,lab,f);
  for(const[p,s]of Object.entries(f.reference))await write(smokeRoot,p,s);await git(smokeRoot,'add','src');await git(smokeRoot,'commit','-m','Control reference candidate');const revision=await git(smokeRoot,'rev-parse','HEAD');
  await cli(smokeRoot,'work-item','claim','--work-item','WI-0001','--agent-id','agent-casey','--principal-id','human','--base-revision',revision,'--branch','main');
  const lifecycleSmoke=await closeLean(smokeRoot,{accepted:true,final_revision:revision,note:'Generation-free reference plumbing check only, not subject evidence'});
  const m={schema_version:'recovery-matrix/v1',created_at:new Date().toISOString(),limits:matrixLimits,source_digest:await sourceDigest(),fixtures_digest:hash(recoveryFixtures),bundle_digest:hash(await tree(bundle)),prompts:cells.map(c=>({id:c.id,execution:hash(recoveryPrompt(c.workflow,'execute')),review:hash(recoveryPrompt(null,'review'))})),isolation,preflight,lifecycleSmoke,checkpoints,controls,base,cells};
  validateRecovery(m);await write(lab,'manifest.json',m,true);await write(lab,'state.json',{status:'prepared',cells:[],events:[]},true);
  return {lab,digest:hash(m),isolation,preflight,lifecycleSmoke,controls,checkpoints:checkpoints.map(({root,...c})=>c)};
}
export async function executeRecovery(lab,digest){
  const m=await read(lab,'manifest.json'),state=await read(lab,'state.json');assert(hash(m)===digest,'recovery-manifest-drift');validateRecovery(m);
  assert(m.source_digest===await sourceDigest(),'recovery-source-drift');assert(m.bundle_digest===hash(await tree(m.base.readRoots[2])),'recovery-runtime-drift');
  assert(state.status==='prepared'&&!state.cells.length&&!state.events.length,'recovery-already-started');
  for(const c of m.cells)assert(hash(await tree(c.root))===hash(c.seed_manifest),'recovery-seed-drift');
  await acquireRun(lab);return executeMatrixCells(m,state,lab,{taskFixtures:recoveryFixtures,promptFor:recoveryPrompt});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const[command,lab,digest]=process.argv.slice(2);
  try{if(command==='prepare')console.log(JSON.stringify(await prepareRecovery(),null,2));else if(command==='run')console.log(JSON.stringify(await executeRecovery(lab,digest),null,2));else throw Error('Use prepare or run <lab> <digest>');}
  catch(e){console.error(e.message);process.exitCode=1;}
}
