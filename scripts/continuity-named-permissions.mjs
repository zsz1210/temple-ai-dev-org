// Repository-only qualification. Never starts a model thread or turn.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import { createJsonRpcProcess } from '../src/codex-app-server-provider.mjs';
import { subprocessEnvironment } from './delivery-control-pair.mjs';

const profile = 'temple-continuity-probe';
const exec = promisify(execFile);
const check = (ok, code) => { if (!ok) throw Error(code); };
const validRoot = p => typeof p === 'string' && path.isAbsolute(p) && path.normalize(p) === p && p !== path.parse(p).root;

export function namedPermissionArguments(root, runtimeFiles) {
  check(validRoot(root) && Array.isArray(runtimeFiles) && runtimeFiles.length > 0 && runtimeFiles.length <= 256 && runtimeFiles.every(validRoot), 'invalid-root');
  check(!runtimeFiles.some(p=>p===root || root.startsWith(p+'/')), 'invalid-root');
  const reads = [...new Set(runtimeFiles)].map(p=>`${JSON.stringify(p)} = "read"`).join(', ');
  const settings = [
    `default_permissions=${JSON.stringify(profile)}`,
    `permissions.${profile}.filesystem= { ":minimal" = "read", ${JSON.stringify(root)} = "write", ${JSON.stringify(path.join(root,'.git'))} = "write", ${reads} }`,
    `permissions.${profile}.network.enabled=false`,
    'memories.use_memories=false', 'memories.generate_memories=false',
  ];
  return ['app-server', '--listen', 'stdio://', '--strict-config',
    ...settings.flatMap(s => ['-c', s]), '--disable', 'memories'];
}

export function inspectNamedPermissionSchemas(schemas) {
  const fields = { ThreadStartParams: 'permissions', TurnStartParams: 'permissions', CommandExecParams: 'permissionProfile' };
  const missing = Object.entries(fields).filter(([name, field]) => !schemas[name]?.properties?.[field]).map(([name, field]) => `${name}.${field}`);
  return { declared: missing.length === 0, missing, live_ready: false, effective_permissions: 'not-checked' };
}

async function installedRuntime() {
  check(process.platform==='darwin','unsupported-platform');
  const node=await fs.realpath(process.execPath);
  const {stdout}=await exec('/usr/bin/otool',['-L',node],{env:subprocessEnvironment(),timeout:2000,maxBuffer:65536});
  const libraries=stdout.split('\n').slice(1).map(s=>s.trim().split(' (compatibility version')[0]).filter(Boolean);
  // Qualification is intentionally narrow. Never expand permissions to make an
  // arbitrary package-manager runtime work, or silently choose another Node.
  check(libraries.length>0&&libraries.every(p=>p.startsWith('/usr/lib/')||p.startsWith('/System/')),'unsupported-runtime');
  const git=(await exec('/usr/bin/xcrun',['--find','git'],{env:subprocessEnvironment(),timeout:3000,maxBuffer:4096})).stdout.trim();
  check(validRoot(git)&&(await fs.stat(git)).isFile(),'invalid-runtime-file');
  return {node,git,readRoots:[path.dirname(node),path.dirname(git)]};
}

const readScript = "try{const s=require('node:fs').readFileSync(process.argv[1],'utf8');process.stdout.write(s==='synthetic-marker'?'allowed':'mismatch')}catch(e){if(!['EACCES','EPERM'].includes(e.code))process.exit(3);process.stdout.write('denied')}";
const writeScript = "try{require('node:fs').writeFileSync(process.argv[1],'written');process.stdout.write('allowed')}catch(e){if(!['EACCES','EPERM'].includes(e.code))process.exit(3);process.stdout.write('denied')}";
const networkScript = "const s=require('node:net').connect({host:'127.0.0.1',port:Number(process.argv[1])});s.setTimeout(1500,()=>{s.destroy();process.exitCode=3});s.on('connect',()=>{process.stdout.write('allowed');s.destroy()});s.on('error',e=>{if(['EACCES','EPERM'].includes(e.code))process.stdout.write('denied');else process.exitCode=3})";
const gitScript = "const {execFileSync:e}=require('node:child_process');const x=a=>e(process.argv[1],a,{stdio:['ignore','pipe','pipe'],timeout:2000});x(['init','-q','--template=']);x(['add','marker']);x(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','-c','commit.gpgsign=false','-c','core.hooksPath=/dev/null','commit','-qm','synthetic']);process.stdout.write(x(['rev-parse','HEAD']))";

async function connectControl(port) {
  return new Promise(resolve => {
    const socket = net.connect({host:'127.0.0.1',port});
    socket.setTimeout(1500);
    const done = value => { socket.destroy(); resolve(value); };
    socket.once('connect',()=>done(true));socket.once('error',()=>done(false));socket.once('timeout',()=>done(false));
  });
}

export async function probeNamedPermissions({binary='codex',scratchParent=os.tmpdir(),providerFactory=createJsonRpcProcess,resolveRuntime=installedRuntime}={}) {
  const result = {schema_version:'continuity-named-probe/v1',transport:providerFactory===createJsonRpcProcess&&resolveRuntime===installedRuntime?'installed-codex':'simulated',
    status:'failed',live_ready:false,model_generation_performed:false,server_exit_confirmed:false,scratch_removed:false,
    listener_closed:false,checks:{},failure:null,cleanup_failure:null,
    native_tools:'not-qualified',descendant_cleanup:'not-qualified',external_network:'not-qualified'};
  const directory = await fs.mkdtemp(path.join(scratchParent,'continuity-named-'));
  let connection, listener, violation, generated=false;
  try {
    const root=path.join(directory,'actor'),other=path.join(directory,'sibling');
    await fs.mkdir(root);await fs.mkdir(other);await fs.mkdir(path.join(root,'tmp'));
    await fs.writeFile(path.join(root,'marker'),'synthetic-marker');await fs.writeFile(path.join(other,'marker'),'synthetic-marker');
    await fs.symlink(path.join(other,'marker'),path.join(root,'link'));
    listener=net.createServer(socket=>socket.destroy());
    await new Promise((resolve,reject)=>{listener.once('error',reject);listener.listen(0,'127.0.0.1',resolve)});
    const port=listener.address().port;
    result.checks.network_positive=await connectControl(port);
    check(result.checks.network_positive,'network-positive-control-failed');
    // Require an explicitly selected self-contained runtime; platform libraries
    // retain :minimal policy and no broad package-manager/home root is granted.
    const {node,git,readRoots:runtimeFiles}=await resolveRuntime();
    check(validRoot(node)&&validRoot(git),'invalid-runtime-file');
    result.runtime_read_root_count=runtimeFiles.length;
    connection=providerFactory(binary,namedPermissionArguments(root,runtimeFiles),{
      cwd:root,env:subprocessEnvironment(),
      onProtocolError:()=>{violation??='invalid-protocol'},
      onRequest:()=>{violation??='unexpected-server-request'},
      onNotification:message=>{if(message.method?.startsWith('turn/')||message.method==='thread/tokenUsage/updated'){generated=true;violation??='unexpected-generation-event'}},
    });
    const request=async(method,params)=>{
      check(!violation,violation);
      check(['initialize','command/exec'].includes(method),'generation-forbidden');
      const response=await connection.request(method,params,10000);
      check(!violation,violation);return response;
    };
    await request('initialize',{clientInfo:{name:'temple-named-permissions-probe',version:'1'},capabilities:{experimentalApi:true}});
    connection.notify('initialized',{});
    for (const [name,script,arg] of [
      ['own_read',readScript,path.join(root,'marker')],['own_write',writeScript,path.join(root,'written')],
      ['sibling_read',readScript,path.join(other,'marker')],['sibling_write',writeScript,path.join(other,'written')],
      ['symlink_read',readScript,path.join(root,'link')],['git_commit',gitScript,git],['network',networkScript,String(port)],
    ]) {
      result.last_control=name;
      const r=await request('command/exec',{command:[node,'-e',script,arg],cwd:root,permissionProfile:profile,
        env:{OPENSSL_CONF:os.devNull,TMPDIR:path.join(root,'tmp')},timeoutMs:8000,outputBytesCap:2048});
      check(Number.isInteger(r?.exitCode)&&typeof r.stdout==='string'&&typeof r.stderr==='string','invalid-command-response');
      const output=r.stdout.trim();
      if(name==='git_commit') result.checks[name]=r.exitCode===0&&/^[a-f0-9]{40}$/.test(output);
      else {check(r.exitCode===0&&['allowed','denied'].includes(output),'control-inconclusive');result.checks[name]=output;}
      if(name.endsWith('write')) result.checks[name+'_observed']=await fs.readFile(arg,'utf8').then(v=>v==='written').catch(()=>false);
    }
    check(result.checks.own_read==='allowed'&&result.checks.own_write==='allowed'&&result.checks.own_write_observed,'positive-control-failed');
    result.status=result.checks.sibling_read==='denied'&&result.checks.sibling_write==='denied'&&!result.checks.sibling_write_observed&&result.checks.symlink_read==='denied'&&result.checks.network==='denied'&&result.checks.git_commit?'bounded-controls-passed':'route-incomplete';
  } catch(error) {
    const known=['invalid-root','invalid-runtime-file','unsupported-platform','unsupported-runtime','network-positive-control-failed','invalid-protocol','unexpected-server-request','unexpected-generation-event','generation-forbidden','invalid-command-response','control-inconclusive','positive-control-failed'];
    result.failure=known.includes(error.message)?error.message:'provider-or-local-operation-failed';
  } finally {
    try {if(connection){await connection.close();result.server_exit_confirmed=true}}catch{result.cleanup_failure='server-close-failed'}
    try {if(listener?.listening)await new Promise((resolve,reject)=>listener.close(e=>e?reject(e):resolve()));result.listener_closed=true}catch{result.cleanup_failure??='listener-close-failed'}
    if(!result.cleanup_failure)try{await fs.rm(directory,{recursive:true,force:true});result.scratch_removed=true}catch{result.cleanup_failure='scratch-remove-failed'}
  }
  if(violation)result.failure=violation;
  if(generated)result.model_generation_performed='unknown';
  if(result.failure||result.cleanup_failure)result.status='failed';
  return result;
}
