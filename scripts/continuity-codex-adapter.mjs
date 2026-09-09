// Repository-only, generation-free compatibility instrument. No live executor.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import Ajv from 'ajv';
import { createJsonRpcProcess } from '../src/codex-app-server-provider.mjs';
import { digest, subprocessEnvironment } from './delivery-control-pair.mjs';

const exec = promisify(execFile);
const check = (ok, reason) => { if (!ok) throw Error(reason); };
const schemaNames = ['ThreadStartParams','TurnStartParams','CommandExecParams','CommandExecResponse'];
const serverArgs = ['app-server','--listen','stdio://','--strict-config',
  '-c','memories.use_memories=false','-c','memories.generate_memories=false','--disable','memories'];
export const continuityCompletion = {
  type:'object',additionalProperties:false,
  required:['candidate_revision','test_command','test_exit_code','completed','unresolved'],
  properties:{candidate_revision:{type:'string',pattern:'^[a-f0-9]{40}$'},test_command:{type:'string'},
    test_exit_code:{type:'integer'},completed:{type:'string'},unresolved:{type:'array',items:{type:'string'}}}
};
export function continuityRequests({root,arm,model,effort,itemId,agentId,threadId='preview-only'}) {
  check(typeof root==='string' && path.isAbsolute(root) && path.normalize(root)===root && root!==path.parse(root).root,'invalid-root');
  check(['ordinary','temple'].includes(arm),'invalid-arm');
  check(typeof model==='string' && /^[a-zA-Z0-9._-]+$/.test(model) && typeof effort==='string' && /^[a-z]+$/.test(effort),'explicit-model-and-effort-required');
  check(typeof threadId==='string' && threadId.length>0,'invalid-thread');
  if(arm==='temple') check(/^WI-\d{4,}$/.test(itemId??'') && /^agent-[a-z0-9-]+$/.test(agentId??''),'explicit-fixture-identity-required');
  const common = 'Resume one approved change. Read SPEC.md and HANDOFF.md for the current requirements, predecessor revision and historical test scope. Preserve completed behavior and every protected file. Edit only quote.mjs and optionally test/additional.test.mjs. Run node --test test/*.test.mjs on the final product and commit the product/test changes. Return the exact full candidate SHA, actual test command/exit code, completed work and unresolved issues. Historical passing results are not current candidate verification. Do not start another task or claim whole delivery accepted.';
  const governance = arm==='temple' ? `First read AGENTS.md, TEMPLE.md and the applicable temple-work Skill. You are ${agentId}, Developer for ${itemId}, Principal human. Resolve required context and claim before editing. Follow the effective Lean Build procedure. Put your current candidate/test evidence under .ai-org/artifacts/${itemId}/, finish only Developer Build into Test and inspect current diagnostics. Do not perform Verifier acceptance, Independent QA or Release Gate.` : 'Use ordinary repository reading, Git, testing and a structured handoff. Do not add a framework or other dependencies.';
  const sandboxPolicy={type:'workspaceWrite',writableRoots:[root,path.join(root,'.git')],
    readOnlyAccess:{type:'restricted',includePlatformDefaults:true,readableRoots:[root]},
    networkAccess:false,excludeSlashTmp:true,excludeTmpdirEnvVar:true};
  const developer='One fresh local takeover. Use only the assigned repository and local tools. No network, external tools, installations, subagents, user questions, later responsibilities, model fallback or extra actor turns. Use apply_patch for edits. A structured reply is a handoff claim, not independent acceptance.';
  return {schema_version:'continuity-request-preview/v1',live_ready:false,
    common_instructions:common,governance_instructions:governance,
    thread:{cwd:root,model,approvalPolicy:'never',sandbox:'workspace-write',ephemeral:true,
      allowProviderModelFallback:false,developerInstructions:developer},
    turn:{threadId,cwd:root,model,effort,approvalPolicy:'never',sandboxPolicy,
      input:[{type:'text',text:common+'\n\n'+governance}],outputSchema:structuredClone(continuityCompletion)}};
}

// Provider schemas may allow unknown keys. A successful generic JSON validator
// alone must never certify that the server understands a requested safeguard.
export function inspectContinuitySchemas(schemas, requests, {experimentalApi=false}={}) {
  const issues=[];
  for(const [name,value] of [['ThreadStartParams',requests.thread],['TurnStartParams',requests.turn]]) {
    const schema=schemas[name];
    if(!schema?.properties) { issues.push('missing-schema:'+name); continue; }
    for(const key of Object.keys(value)) if(!Object.hasOwn(schema.properties,key)) issues.push('undeclared-field:'+name+'.'+key);
    const validate=new Ajv({strict:false,validateFormats:false}).compile(schema);
    if(!validate(value)) issues.push('invalid-request:'+name);
  }
  const variants=schemas.TurnStartParams?.definitions?.SandboxPolicy?.oneOf??[];
  const policy=variants.find(v=>v.properties?.type?.enum?.includes('workspaceWrite'));
  for(const key of Object.keys(requests.turn.sandboxPolicy)) if(!policy?.properties || !Object.hasOwn(policy.properties,key)) issues.push('undeclared-sandbox-field:'+key);
  if(policy?.properties?.readOnlyAccess) {
    const access=declaredVariants(schemas.TurnStartParams,policy.properties.readOnlyAccess)
      .find(v=>v.properties?.type?.enum?.includes('restricted')||v.properties?.type?.const==='restricted');
    if(!access) issues.push('undeclared-read-access:restricted');
    else for(const key of Object.keys(requests.turn.sandboxPolicy.readOnlyAccess))
      if(!Object.hasOwn(access.properties,key)) issues.push('undeclared-read-access-field:'+key);
  }
  if(!experimentalApi) issues.push('experimental-opt-in-required:allowProviderModelFallback');
  return {schema_version:'continuity-schema-check/v1',request_schema_valid:issues.length===0,
    issues,schemas_sha256:digest(schemas),requests_sha256:digest(requests),experimental_api:experimentalApi,
    live_ready:false,model_available:'not-checked',effective_permissions:'not-checked'};
}

function declaredVariants(schema,node,depth=0) {
  if(!node||typeof node!=='object'||depth>8)return [];
  if(node.$ref) {
    if(!node.$ref.startsWith('#/'))return [];
    const target=node.$ref.slice(2).split('/').reduce((v,k)=>v?.[k.replaceAll('~1','/').replaceAll('~0','~')],schema);
    return declaredVariants(schema,target,depth+1);
  }
  const alternatives=node.oneOf??node.anyOf??node.allOf;
  return alternatives?alternatives.flatMap(v=>declaredVariants(schema,v,depth+1)):[node];
}

export async function readInstalledContinuitySchemas({binary='codex',scratchParent=os.tmpdir()}={}) {
  const directory=await fs.mkdtemp(path.join(scratchParent,'continuity-schema-'));
  const options={env:subprocessEnvironment(),timeout:15000,killSignal:'SIGKILL',maxBuffer:1024*1024};
  try {
    const version=(await exec(binary,['--version'],options)).stdout.trim();
    const groups={};
    for(const experimental of [false,true]) {
      const output=path.join(directory,experimental?'experimental':'stable');
      await exec(binary,['app-server','generate-json-schema',...(experimental?['--experimental']:[]),'--out',output],options);
      groups[experimental?'experimental':'stable']=Object.fromEntries(await Promise.all(schemaNames.map(async name=>
        [name,JSON.parse(await fs.readFile(path.join(output,'v2',name+'.json'),'utf8'))])));
    }
    return {cli_version:version,...groups,model_generation_performed:false};
  } finally { await fs.rm(directory,{recursive:true,force:true}); }
}

// Fixed diagnostic commands against our own synthetic files only. Deliberately
// measures the legacy policy, never uses it as a fallback for a live request.
export async function probeContinuitySandbox({binary='codex',scratchParent=os.tmpdir(),providerFactory=createJsonRpcProcess}={}) {
  const directory=await fs.mkdtemp(path.join(scratchParent,'continuity-probe-'));
  let connection,primary=null,cleanup=null,violation=null,generationObserved=false;
  const result={schema_version:'continuity-sandbox-probe/v1',status:'failed',
    transport:providerFactory===createJsonRpcProcess?'installed-codex':'simulated',
    model_generation_performed:false,live_ready:false,network_isolation:'not-qualified',
    descendant_cleanup:'not-qualified',server_exit_confirmed:false,scratch_removed:false,checks:{}};
  try {
    const root=path.join(directory,'actor'),other=path.join(directory,'sibling');
    await fs.mkdir(root);await fs.mkdir(other);
    await fs.writeFile(path.join(root,'marker'),'synthetic-marker');
    await fs.writeFile(path.join(other,'marker'),'synthetic-marker');
    connection=providerFactory(binary,serverArgs,{cwd:root,env:subprocessEnvironment(),
      onProtocolError:()=>{violation??='invalid-protocol'},onRequest:()=>{violation??='unexpected-server-request'},
      onNotification:m=>{if(m.method?.startsWith('turn/')||m.method==='thread/tokenUsage/updated'){generationObserved=true;violation??='unexpected-generation-event'}}});
    const request=async(method,params)=>{
      check(['initialize','command/exec'].includes(method),'generation-forbidden');
      const response=await connection.request(method,params,10000);check(!violation,violation);return response;
    };
    await request('initialize',{clientInfo:{name:'temple-continuity-offline',version:'1'},capabilities:{experimentalApi:false}});
    connection.notify('initialized',{});
    const policy={type:'workspaceWrite',writableRoots:[root],networkAccess:false,excludeSlashTmp:true,excludeTmpdirEnvVar:true};
    const commands=[
      ['own_read',"process.stdout.write(require('node:fs').readFileSync(process.argv[1],'utf8'))",path.join(root,'marker')],
      ['own_write',"require('node:fs').writeFileSync(process.argv[1],'written')",path.join(root,'written')],
      ['sibling_read',"process.stdout.write(require('node:fs').readFileSync(process.argv[1],'utf8'))",path.join(other,'marker')],
      ['sibling_write',"require('node:fs').writeFileSync(process.argv[1],'written')",path.join(other,'written')]
    ];
    for(const [name,script,file] of commands) {
      const observed=await request('command/exec',{command:[process.execPath,'-e',script,file],cwd:root,
        sandboxPolicy:policy,timeoutMs:3000,outputBytesCap:2048});
      check(Number.isInteger(observed?.exitCode)&&typeof observed.stdout==='string'&&typeof observed.stderr==='string','invalid-command-response');
      const allowed=observed.exitCode===0;
      if(name.endsWith('read')) result.checks[name]={allowed,marker_observed:observed.stdout==='synthetic-marker'};
      else result.checks[name]={allowed,file_created:await fs.readFile(file,'utf8').then(x=>x==='written').catch(()=>false)};
    }
    check(result.checks.own_read.allowed&&result.checks.own_read.marker_observed&&result.checks.own_write.allowed&&result.checks.own_write.file_created,'positive-control-failed');
    result.status=result.checks.sibling_read.allowed||result.checks.sibling_read.marker_observed||result.checks.sibling_write.allowed||result.checks.sibling_write.file_created?'isolation-gap-observed':'bounded-controls-passed';
  } catch(error) { primary=error.message;result.status='failed'; }
  finally {
    try {if(connection){await connection.close();result.server_exit_confirmed=true;}} catch {cleanup='server-close-failed';}
    // Do not remove storage while an owned server may still be using it.
    if(!cleanup) try {await fs.rm(directory,{recursive:true,force:true});result.scratch_removed=true;} catch {cleanup='scratch-remove-failed';}
  }
  // Never retain arbitrary provider error strings, paths, stderr or credentials.
  const known=new Set(['invalid-protocol','unexpected-server-request','unexpected-generation-event','generation-forbidden','invalid-command-response','positive-control-failed']);
  if(violation){primary=violation;result.status='failed';}
  if(generationObserved)result.model_generation_performed='unknown';
  result.failure=primary?(known.has(primary)?primary:'provider-or-local-operation-failed'):null;
  result.cleanup_failure=cleanup;if(cleanup)result.status='failed';
  return result;
}
