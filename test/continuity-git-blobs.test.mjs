import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import cp from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import { readContinuityBlobs } from '../scripts/continuity-git-blobs.mjs';
import { createContinuityPair, assessContinuityCandidate, referenceQuote } from '../scripts/continuity-fixture.mjs';
import { subprocessEnvironment } from '../scripts/delivery-control-pair.mjs';

const env = subprocessEnvironment();
function git(root, args, input) {
  const r = cp.spawnSync('git', args, {cwd:root, env, input});
  assert.equal(r.status,0,r.stderr?.toString()); return r.stdout.toString().trim();
}
async function temporary(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'continuity-batch-test-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true})); return root;
}

test('bounded Git batches preserve real binary, empty and duplicate blobs and per-blob size limits',async t=>{
  const root=await temporary(t); git(root,['init','-b','main']);
  const bodies=[Buffer.alloc(0),Buffer.from([0,255,10,13,128,0]),Buffer.alloc(65536,0x81)];
  const ids=bodies.map(body=>git(root,['hash-object','-w','--stdin'],body));
  assert.deepEqual(readContinuityBlobs(root,ids,{env,maxBlobBytes:65536}),bodies);
  assert.deepEqual(readContinuityBlobs(root,Array(16).fill(ids[1]),{env}),Array(16).fill(bodies[1]));
  const large=git(root,['hash-object','-w','--stdin'],Buffer.alloc(65537));
  assert.throws(()=>readContinuityBlobs(root,[large],{env,maxBlobBytes:65536}),/unreadable-candidate/);
  assert.throws(()=>readContinuityBlobs(root,['0'.repeat(40)],{env}),/unreadable-candidate/);
  assert.throws(()=>readContinuityBlobs(root,Array(17).fill(ids[0]),{env}),/unreadable-candidate/);
});

test('batch failures and malformed frames cannot return partial, reordered or unbounded content',t=>{
  const a='a'.repeat(40),b='b'.repeat(40);
  const frame=(id,body)=>Buffer.concat([Buffer.from(`${id} blob ${body.length}\n`),body,Buffer.from('\n')]);
  const first=frame(a,Buffer.from([0,255,10])),second=frame(b,Buffer.alloc(0));
  let response, calls=0;
  const mock=t.mock.method(cp,'spawnSync',(_binary,args,options)=>{
    calls++;assert.deepEqual(args,['cat-file','--batch']);
    assert.equal(options.input,`${a}\n${b}\n`);
    assert.ok(options.maxBuffer<=2*(1024*1024+128));
    assert.equal(options.timeout,15000);
    return response;
  });
  syncBuiltinESMExports();
  try {
    response={status:0,stdout:Buffer.concat([first,second])};
    assert.deepEqual(readContinuityBlobs('.', [a,b]),[Buffer.from([0,255,10]),Buffer.alloc(0)]);
    const highBit=Buffer.from(first);highBit[0]|=128;
    const invalid=[
      {status:1,stdout:response.stdout}, {status:null,signal:'SIGTERM',stdout:response.stdout},
      {...response,error:new Error('process buffer limit')}, {...response,stdout:response.stdout.toString()},
      {status:0,stdout:Buffer.concat([first,Buffer.from(`${b} missing\n`)])},
      {status:0,stdout:Buffer.concat([second,first])},
      {status:0,stdout:Buffer.concat([first,second.subarray(0,-1)])},
      {status:0,stdout:Buffer.concat([first,second,Buffer.from('extra')])},
      {status:0,stdout:Buffer.from(`${a} tree 0\n\n`)},
      {status:0,stdout:Buffer.from(`${a} blob 1048577\n`)},
      {status:0,stdout:Buffer.from(`${a} blob 9007199254740992\n`)},
      {status:0,stdout:Buffer.from(`${a} blob 03\nabc\n`)},
      {status:0,stdout:Buffer.from(`${a} blob 3\nab`)},
      {status:0,stdout:Buffer.concat([highBit,second])},
      {status:0,stdout:Buffer.alloc(2*(1024*1024+128)+1)}
    ];
    for(const bad of invalid) {response=bad;assert.throws(()=>readContinuityBlobs('.',[a,b],{failure:'dirty-source'}),/^Error: dirty-source$/);}
    const before=calls;
    assert.deepEqual(readContinuityBlobs('.',[]),[]);
    for(const ids of [[`${a}\n${b}`],['--help'],[undefined],Array(17).fill(a)])
      assert.throws(()=>readContinuityBlobs('.',ids),/unreadable-candidate/);
    for(const maxBlobBytes of [0,-1,1.5,1048577,Infinity])
      assert.throws(()=>readContinuityBlobs('.',[a,b],{maxBlobBytes}),/unreadable-candidate/);
    assert.equal(calls,before,'invalid input must not start a process');
  } finally {mock.mock.restore();syncBuiltinESMExports();}
});

test('candidate validation crosses batch boundaries and rereads hidden binary changes and unsafe links',async t=>{
  const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),'stable');
  const base=pair.arms.ordinary,root=base.root;
  const body=Buffer.from([0,128,255,10]);
  await fs.mkdir(path.join(root,'protected'));
  for(let i=0;i<20;i++)await fs.writeFile(path.join(root,`protected/${i}.bin`),i===0?Buffer.alloc(0):body);
  git(root,['add','.']);git(root,['commit','-m','Freeze binary protected inputs']);
  base.baseline=git(root,['rev-parse','HEAD']);base.tree={};
  for(const row of git(root,['ls-tree','-r','-z','HEAD']).split('\0').filter(Boolean)) {
    const [meta,file]=row.split('\t'),[mode,,oid]=meta.split(' ');base.tree[file]={mode,oid};
  }
  await fs.writeFile(path.join(root,'quote.mjs'),referenceQuote(pair.threshold));
  git(root,['add','quote.mjs']);git(root,['commit','-m','Candidate product']);
  const revision=git(root,['rev-parse','HEAD']);
  assert.equal((await assessContinuityCandidate(root,pair,'ordinary',revision)).passed,true);
  let executions=0;const options={candidateExecutor:()=>{executions++;throw Error('must not execute');}};
  const file=path.join(root,'protected/9.bin');
  git(root,['update-index','--assume-unchanged','protected/9.bin']);
  await fs.writeFile(file,Buffer.from([0,128,254,10]));
  await assert.rejects(()=>assessContinuityCandidate(root,pair,'ordinary',revision,options),/dirty-source/);
  await fs.writeFile(file,body);await fs.chmod(file,0o755);
  await assert.rejects(()=>assessContinuityCandidate(root,pair,'ordinary',revision,options),/unsafe-working-file/);
  await fs.unlink(file);await fs.link(path.join(root,'protected/8.bin'),file);
  await assert.rejects(()=>assessContinuityCandidate(root,pair,'ordinary',revision,options),/unsafe-working-file/);
  await fs.unlink(file);await fs.symlink(path.join(root,'protected/8.bin'),file);
  await assert.rejects(()=>assessContinuityCandidate(root,pair,'ordinary',revision,options),/unsafe-working-file/);
  assert.equal(executions,0);
});
