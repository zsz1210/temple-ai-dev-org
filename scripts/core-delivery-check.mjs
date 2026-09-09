// Public, standalone, generation-free check. Contains no reference or hidden tests.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function executeTests(args,root,environment,timeoutMs){
  if(process.platform==='win32')throw Error('owned-process-groups-require-posix');
  let child,pid,timedOut=false,overflow=false,descendants=false;
  const signalErrors=[];
  const out=[],err=[];let size=0;
  const alive=()=>{if(!pid)return false;try{process.kill(-pid,0);return true;}catch(e){return e.code!=='ESRCH';}};
  const terminate=()=>{if(pid)try{process.kill(-pid,'SIGKILL');}catch(e){if(e.code!=='ESRCH')signalErrors.push(e.code??'unknown');}};
  const exit=await new Promise(resolve=>{
    // A supervised group lets timeout cleanup include Node's test children.
    // The helper waits for termination; this is not an unowned background task.
    child=spawn(process.execPath,args,{cwd:root,env:environment,detached:true,stdio:['ignore','pipe','pipe']});pid=child.pid;
    let finished=false;const finish=value=>{if(finished)return;finished=true;clearTimeout(timer);clearTimeout(watchdog);resolve(value);};
    const timer=setTimeout(()=>{timedOut=true;terminate();},timeoutMs);
    const watchdog=setTimeout(()=>{terminate();child.stdout.destroy();child.stderr.destroy();child.unref();finish({code:null,error:'process-close-unconfirmed'});},timeoutMs+3000);
    for(const [stream,parts]of [[child.stdout,out],[child.stderr,err]])stream.on('data',b=>{size+=b.length;if(size<=512*1024)parts.push(b);else{overflow=true;terminate();}});
    child.once('error',e=>finish({code:null,error:e.code??'spawn-failed'}));
    child.once('exit',code=>{if(code===0&&!timedOut&&alive())descendants=true;terminate();});
    child.once('close',code=>finish({code}));
  });
  const deadline=Date.now()+2000;while(alive()&&Date.now()<deadline)await pause(10);
  // Confirmation describes the final observation, not earlier signal attempts.
  // Permission/unknown errors from signal-0 still count as alive (fail closed).
  return {exit_code:exit.code,stdout:Buffer.concat(out).toString(),stderr:Buffer.concat(err).toString(),timed_out:timedOut,process_group_exit_confirmed:!alive(),termination_signal_errors:signalErrors,surviving_descendants:descendants,instrument_error:exit.error??(overflow?'test-output-limit':null)};
}

export async function inventory(root,{exclude=[]}={}){
  const result={};let count=0;
  async function visit(relative=''){
    for(const name of (await fs.readdir(path.join(root,relative))).sort()){
      const p=path.posix.join(relative,name);if(exclude.includes(p))continue;
      if(++count>10000)throw Error('inventory-entry-limit');
      const file=path.join(root,p),s=await fs.lstat(file);
      if(s.isSymbolicLink())result[p]={type:'symlink',target:await fs.readlink(file)};
      else if(s.isDirectory()){result[p]={type:'directory'};await visit(p);}
      else if(s.isFile()){
        if(s.size>8*1024*1024)throw Error('inventory-file-limit');
        result[p]={type:'file',bytes:s.size,sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex')};
      }else result[p]={type:'special'};
    }
  }
  await visit();return result;
}
export async function runDeliveryCheck(root,{tests,timeoutMs=20000,testTimeoutMs=5000}={}){
  root=await fs.realpath(root);
  if(!tests)tests=(await fs.readdir(path.join(root,'test'))).filter(p=>p.endsWith('.test.mjs')).sort().map(p=>'test/'+p);
  if(!Array.isArray(tests)||!tests.length||tests.some(p=>typeof p!=='string'||path.isAbsolute(p)||p.startsWith('-')||p.split(/[\\/]/).includes('..')||!p.endsWith('.test.mjs')))throw Error('invalid-test-selection');
  for(const p of tests){const real=await fs.realpath(path.join(root,p));if(!real.startsWith(root+path.sep))throw Error('test-outside-root');}
  const before=await inventory(root),temporary=await fs.mkdtemp(path.join(root,'.delivery-check-'));
  const result={schema_version:'temple.local-delivery-check/v1',status:'running',accepted:false,tests,exit_code:null,stdout:'',stderr:'',timed_out:false,temporary_residue:[],workspace_changes:[],instrument_error:null,owned_area_removed:false};
  const environment={...process.env,TMPDIR:temporary,TMP:temporary,TEMP:temporary};
  delete environment.NODE_TEST_CONTEXT;
  try{
    Object.assign(result,await executeTests(['--test','--test-reporter=tap','--test-timeout='+testTimeoutMs,...tests],root,environment,timeoutMs));
    if(!result.process_group_exit_confirmed)throw Error('test-process-cleanup-unconfirmed');
    result.temporary_residue=Object.entries(await inventory(temporary)).map(([p,v])=>({path:p,...v}));
    const after=await inventory(root,{exclude:[path.basename(temporary)]});
    result.workspace_changes=[...new Set([...Object.keys(before),...Object.keys(after)])].sort().filter(p=>JSON.stringify(before[p])!==JSON.stringify(after[p]));
    result.tests_count=Number(result.stdout.match(/^# tests (\d+)/m)?.[1]??0);
    result.cancelled=Number(result.stdout.match(/^# cancelled (\d+)/m)?.[1]??0);
    result.timed_out=result.timed_out||/testTimeoutFailure|test timed out/.test(result.stdout);
    result.accepted=result.exit_code===0&&result.tests_count>0&&result.cancelled===0&&!result.timed_out&&!result.surviving_descendants&&!result.instrument_error&&!result.temporary_residue.length&&!result.workspace_changes.length;
    result.status=result.instrument_error?'instrument-failure':'completed';
  }catch(e){result.status='instrument-failure';result.instrument_error=String(e.message);result.accepted=false;}
  finally{
    // Preserve violations above before removing only the area this check created.
    try{if(result.process_group_exit_confirmed===false)throw Error('active-child');await fs.rm(temporary,{recursive:true,force:true});result.owned_area_removed=true;}
    catch(e){result.status='instrument-failure';result.instrument_error='owned-area-cleanup-failed';result.accepted=false;}
  }
  return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{
    const args=process.argv.slice(2);if(args.length&&args[0]!=='--')throw Error('Use node check-delivery.mjs [-- test/name.test.mjs ...]');
    const r=await runDeliveryCheck(process.cwd(),{tests:args.length?args.slice(1):undefined});
    console.log(JSON.stringify(r));process.exitCode=r.status==='instrument-failure'?2:r.accepted?0:1;
  }catch(e){console.log(JSON.stringify({status:'instrument-failure',accepted:false,instrument_error:String(e.message)}));process.exitCode=2;}
}
