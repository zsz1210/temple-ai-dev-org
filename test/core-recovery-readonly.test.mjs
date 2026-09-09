import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {installRecoveryReadOnly,recoveryReadOnlyArguments} from '../scripts/core-recovery-readonly.mjs';import {tree} from '../scripts/autonomy-experiment.mjs';
const source=path.resolve(import.meta.dirname,'..'),cli=path.join(source,'bin/temple.mjs');
test('recovery gateway makes real CLI diagnostics read-only and denies mutation',async t=>{
 const area=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'recovery-cli-')));t.after(()=>fs.rm(area,{recursive:true,force:true}));const root=path.join(area,'project');
 const env={...process.env,TEMPLE_CLI_PATH:cli,OPENSSL_CONF:'/dev/null'};delete env.NODE_TEST_CONTEXT;
 const run=(file,args,cwd=source)=>spawnSync(process.execPath,[file,...args],{cwd,env,encoding:'utf8',timeout:30000});
 const init=run(cli,['init',root,'--config',path.join(source,'docs/getting-started/temple-init.example.json'),'--json']);assert.equal(init.status,0,init.stderr);
 const created=run(cli,['work-item','create',root,'--title','Read-only fixture','--scope','Inspect fixture']);assert.equal(created.status,0,created.stderr);
 const launcher=path.join(root,'templew.mjs');const initial=await tree(root);
 assert.equal(run(launcher,['status','.','--json'],root).status,0);assert.notDeepEqual(await tree(root),initial,'negative control proves normal Status writes');
 env.TEMPLE_CLI_PATH=await installRecoveryReadOnly(root,cli);const before=await tree(root);
 for(const args of [['doctor','.','--compact'],['status','.','--json'],['context','resolve','.','--work-item','WI-0001','--position','engineering_manager','--compact','--json'],['capability','list','.','--json'],['observe','.','--json']]){const r=run(launcher,args,root);assert.equal(r.status,0,args.join(' ')+'\n'+r.stdout+r.stderr);assert.deepEqual(await tree(root),before,args.join(' '));}
 for(const args of [['work-item','create','.','--title','Forbidden'],['status','..','--json'],['status','.','--output','elsewhere'],['context','resolve','.','--unknown']]){const r=run(launcher,args,root);assert.equal(r.status,2);assert.match(r.stderr,/recovery-read-only/);assert.deepEqual(await tree(root),before);}
});
test('read-only argument routing preserves supported flags without accepting an escape',()=>{
 assert.deepEqual(recoveryReadOnlyArguments(['status','--compact','--json'],'/tmp/root'),['status','.','--compact','--json','--no-write']);
 assert.deepEqual(recoveryReadOnlyArguments(['doctor','.','--json'],'/tmp/root'),['doctor','.','--json']);
 for(const a of [[],['work-item','finish'],['status','/other'],['context','resolve','.','--work-item']])assert.throws(()=>recoveryReadOnlyArguments(a,'/tmp/root'));
});
