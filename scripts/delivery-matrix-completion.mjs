// Authorized, exclusive continuation of WI-0251. Original evidence is immutable.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {fixtures} from './delivery-matrix-fixtures.mjs';
import {matrixCells,matrixLimits,matrixPrompt,validateMatrix,gradeProduct,modelPreflight,executeMatrixCells} from './delivery-matrix-experiment.mjs';
import {write,read,tree,git,qualifyIsolation,acquireRun} from './autonomy-experiment.mjs';

const source=path.resolve(import.meta.dirname,'..');
const hash=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const assert=(condition,reason)=>{if(!condition)throw Error(reason);};
export const originalManifestDigest='98f4102f339340e93a7e86cfd56b22485324f962da2904e4a96a53ba37dd4626';
export const remainingIds=Object.freeze(['retry-temple-gpt6','retry-autonomous-terra']);

export function validatePriorState(manifest,state){
  validateMatrix(manifest);
  assert(state.status==='stopped'&&state.cells?.length===6,'unexpected-prior-state');
  assert(state.events?.length===12,'unexpected-prior-generation-count');
  for(const [i,c] of state.cells.entries()){
    assert(c.id===matrixCells()[i].id&&c.turns?.length===1&&c.qa?.length===1&&!c.repair_used,'prior-cell-shape');
    assert(c.accounting_complete&&c.final_revision,'prior-accounting-or-revision');
    assert(i<5?c.status==='accepted':c.status==='stopped','prior-outcome');
    for(const [t,expected] of [[c.turns[0],matrixCells()[i].model],[c.qa[0],matrixLimits.qa_model]])
      assert(t.status==='completed'&&t.generation_requested&&t.usage_status==='observed-completed-turn'&&t.model===expected&&t.effort==='medium'&&t.terminals_empty&&t.server_exit_confirmed&&!t.protected_drift?.length,'prior-turn-unqualified');
  }
  assert(remainingIds.every(id=>!state.events.some(e=>e.cell===id)),'remaining-cell-already-generated');
}

export function validateCompletion(m){
  assert(m.schema_version==='delivery-matrix-completion/v1','completion-schema');
  assert(m.original_manifest_digest===originalManifestDigest,'wrong-original-manifest');
  assert(hash(m.limits)===hash(matrixLimits),'completion-budget-drift');
  assert(m.cells?.length===2&&m.cells.every((c,i)=>c.id===remainingIds[i]),'completion-selection-drift');
  for(const c of m.cells){const expected=matrixCells().find(x=>x.id===c.id);assert(Object.entries(expected).every(([k,v])=>c[k]===v),'completion-cell-drift');}
  assert(m.prompts?.length===2&&m.prompts.every((p,i)=>p.id===remainingIds[i]&&p.execution===hash(matrixPrompt(m.cells[i].workflow,'execute'))&&p.review===hash(matrixPrompt(null,'review'))),'completion-prompt-drift');
}

async function completionSourceDigest(){
  const names=['scripts/delivery-matrix-completion.mjs','scripts/delivery-matrix-experiment.mjs','scripts/delivery-matrix-fixtures.mjs','scripts/autonomy-experiment.mjs','scripts/autonomy-fixtures.mjs','scripts/continuity-live-runner.mjs','scripts/continuity-named-permissions.mjs','scripts/delivery-control-pair.mjs','src/codex-app-server-provider.mjs','src/app-server-protocol-replay.mjs','.ai-org/artifacts/WI-0253/design.md'];
  return hash(await Promise.all(names.map(async name=>[name,hash(await fs.readFile(path.join(source,name)))])));
}

export async function prepareCompletion(priorLab){
  priorLab=await fs.realpath(priorLab);
  const original=await read(priorLab,'manifest.json'),previous=await read(priorLab,'state.json');
  assert(hash(original)===originalManifestDigest,'original-manifest-drift');validatePriorState(original,previous);
  assert(hash(previous)===hash(await read(source,'.ai-org/artifacts/WI-0251/observations.json')),'original-evidence-drift');
  const lab=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'temple-matrix-completion-')));
  const bundle=path.join(lab,'runtime');await fs.cp(original.base.readRoots[2],bundle,{recursive:true});
  assert(hash(await tree(bundle))===original.bundle_digest,'copied-runtime-drift');
  const base={...original.base,readRoots:[...original.base.readRoots.slice(0,2),bundle],environment:{...original.base.environment,TEMPLE_CLI_PATH:path.join(bundle,'bin/temple.mjs')}};
  const isolation=await qualifyIsolation(base,lab),cells=[];
  for(const id of remainingIds){
    const old=original.cells.find(c=>c.id===id),started=Date.now(),root=path.join(lab,id);
    assert(hash(await tree(old.root))===hash(old.seed_manifest),'original-unrun-seed-drift');
    await fs.cp(old.root,root,{recursive:true});assert(hash(await tree(root))===hash(old.seed_manifest),'copied-seed-drift');
    assert(await git(root,'rev-parse','HEAD')===old.base_revision,'copied-seed-revision-drift');
    const f=fixtures.find(f=>f.id===old.task);assert(await fs.readFile(path.join(root,'SPEC.md'),'utf8')===f.spec,'product-contract-drift');
    for(const [p,body] of Object.entries(f.publicTests))assert(hash(body)===old.seed_manifest[p],'public-test-drift');
    const prompt=original.prompts.find(p=>p.id===id);assert(prompt.execution===hash(matrixPrompt(old.workflow,'execute'))&&prompt.review===hash(matrixPrompt(null,'review')),'original-prompt-drift');
    cells.push({...old,root,setup_ms:old.setup_ms,continuation_copy_ms:Date.now()-started});
  }
  const preflight=await modelPreflight(base,cells[0]);
  const archive=await read(source,'.ai-org/artifacts/WI-0251/product-archive.json');
  const requalification={status:'running',generation_requested:false,source_digest:await completionSourceDigest(),cells:[]};
  await write(lab,'requalification.json',requalification);
  for(const old of previous.cells){
    const candidate=archive.cells.find(c=>c.id===old.id);assert(candidate?.revision===old.final_revision,'archived-candidate-revision');
    const originalRoot=original.cells.find(c=>c.id===old.id).root;
    assert(await git(originalRoot,'rev-parse','HEAD')===old.final_revision,'original-product-revision-drift');
    const root=path.join(lab,'requalification',old.id);
    for(const [p,file] of Object.entries(candidate.files)){
      assert(hash(file.body)===file.sha256&&file.sha256===old.final_manifest[p],'archive-hash-drift');
      assert(hash(await fs.readFile(path.join(originalRoot,p)))===file.sha256,'original-product-drift');
      await write(root,p,file.body);
    }
    const result={id:old.id,candidate_revision:old.final_revision,original_status:old.status,grade:null};requalification.cells.push(result);
    result.grade=await gradeProduct(root,fixtures.find(f=>f.id===old.task),base,lab,{onProgress:async grade=>{result.grade=grade;await write(lab,'requalification.json',requalification);}});
    assert(result.grade.accepted,'retained-product-requalification-failed');
  }
  requalification.status='completed';await write(lab,'requalification.json',requalification);
  const m={schema_version:'delivery-matrix-completion/v1',created_at:new Date().toISOString(),original_lab:priorLab,original_manifest_digest:originalManifestDigest,original_state_digest:hash(previous),original_state_bytes:hash(await fs.readFile(path.join(priorLab,'state.json'))),limits:matrixLimits,source_digest:await completionSourceDigest(),runtime_digest:hash(await tree(bundle)),requalification_digest:hash(requalification),isolation,preflight,base,cells,prompts:cells.map(c=>({id:c.id,execution:hash(matrixPrompt(c.workflow,'execute')),review:hash(matrixPrompt(null,'review'))}))};
  validateCompletion(m);await write(lab,'manifest.json',m,true);await write(lab,'state.json',{status:'prepared',cells:[],events:[]},true);
  return {lab,digest:hash(m),source_digest:m.source_digest,preflight,isolation,requalification:requalification.cells.map(c=>({id:c.id,accepted:c.grade.accepted,mutation_status:c.grade.mutation_status,mutations:c.grade.mutations.map(x=>({name:x.name,detected:x.detected,timed_out:x.timed_out,cancelled:x.cancelled}))}))};
}

export async function executeCompletion(lab,digest){
  const m=await read(lab,'manifest.json'),state=await read(lab,'state.json');assert(hash(m)===digest,'completion-manifest-drift');validateCompletion(m);
  assert(m.source_digest===await completionSourceDigest(),'completion-source-drift');
  assert(m.runtime_digest===hash(await tree(m.base.readRoots[2])),'completion-runtime-drift');
  assert(m.requalification_digest===hash(await read(lab,'requalification.json')),'requalification-drift');
  assert(m.original_state_bytes===hash(await fs.readFile(path.join(m.original_lab,'state.json'))),'original-state-drift');
  assert(state.status==='prepared'&&!state.cells.length&&!state.events.length,'completion-already-started');
  for(const c of m.cells)assert(hash(await tree(c.root))===hash(c.seed_manifest),'completion-seed-drift');
  await acquireRun(lab);return executeMatrixCells(m,state,lab);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [command,lab,digest]=process.argv.slice(2);
  try{if(command==='prepare')console.log(JSON.stringify(await prepareCompletion(lab),null,2));else if(command==='run')console.log(JSON.stringify(await executeCompletion(lab,digest),null,2));else throw Error('Use prepare <original-lab> or run <continuation-lab> <digest>');}
  catch(e){console.error(e.message);process.exitCode=1;}
}
