import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {docFixture} from '../scripts/real-doc-check-fixture.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
async function materialize(t, files, tests) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'real-doc-control-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  for (const [relative,body] of Object.entries({...files,...docFixture.publicTests,...tests})) {
    const target=path.join(root,relative);
    await fs.mkdir(path.dirname(target),{recursive:true});
    await fs.writeFile(target,body);
  }
  return root;
}
function run(root,tests) {
  const env={...process.env,TMPDIR:root};
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath,['--test','--test-timeout=1000','--test-reporter=tap',...tests],{
    cwd:root,encoding:'utf8',timeout:4000,maxBuffer:256*1024,env
  });
  assert.equal(result.error,undefined,result.stdout+result.stderr);
  assert.equal(result.signal,null,result.stdout+result.stderr);
  const count = name => Number(result.stdout.match(new RegExp('^# '+name+' (\\d+)','m'))?.[1] ?? 0);
  return {...result,tests:count('tests'),failures:count('fail'),cancelled:count('cancelled'),
    timed_out:/testTimeoutFailure|test timed out/.test(result.stdout),
    invalid_execution:/SyntaxError|ERR_MODULE_NOT_FOUND|Library not loaded/.test(result.stdout+result.stderr)};
}
test('real fixture retains exact attributed source and only adapts the checker import',()=>{
  const doc = docFixture.seed['src/doc-links.mjs'].replace('from "./files.mjs"','from "../src/files.mjs"');
  const helper = docFixture.seed['src/files.mjs'];
  assert.equal(docFixture.provenance.revision,'613990dff640cbe30ed4e52460b832271c1f108d');
  assert.equal(hash(doc),'9c901ddbbbee35843b04f9d1f761840e875f80311468d55a4f46d37b3ee0a16d');
  assert.equal(hash(helper),'624d66c0921818e73979e1dcbbcaf7fb6df3245ed49365e3f53041f2bee5cc3e');
  assert.equal(hash(doc),docFixture.provenance.sources[0].sha256);
  assert.equal(hash(helper),docFixture.provenance.sources[1].sha256);
  assert.equal(docFixture.seed['src/doc-links.mjs'],doc.replace('from "../src/files.mjs"','from "./files.mjs"'));
  assert.equal(docFixture.seed['src/files.mjs'],helper);
  assert.equal(docFixture.reference['src/files.mjs'],helper);
  assert.deepEqual(Object.keys(docFixture.seed),['src/doc-links.mjs','src/files.mjs']);
  assert.equal(Object.keys(docFixture.publicTests).length,1);
  assert.deepEqual(Object.keys(docFixture.treatmentFiles),['README.md']);
  assert.doesNotMatch(docFixture.treatmentFiles['README.md'],/selectedMarkdownFiles|new Set|referenceDoc|symlink-escape-accepted/);
});
test('seed passes historical behavior and fails new acceptance with ordinary assertions',async t=>{
  const root = await materialize(t,docFixture.seed,{'oracle.test.mjs':docFixture.hiddenTests});
  const old = run(root,Object.keys(docFixture.publicTests));
  assert.equal(old.status,0,old.stdout+old.stderr); assert.equal(old.tests,5);
  const current = run(root,['oracle.test.mjs']);
  assert.equal(current.status,1,current.stdout+current.stderr);
  assert.ok(current.failures>=4); assert.equal(current.invalid_execution,false);
  assert.equal(current.cancelled,0); assert.equal(current.timed_out,false);
  assert.match(current.stdout,/ERR_ASSERTION/);
});
test('reference passes unchanged historical tests and complete selected-file acceptance',async t=>{
  const root = await materialize(t,docFixture.reference,{'oracle.test.mjs':docFixture.hiddenTests});
  const result=run(root,['oracle.test.mjs',...Object.keys(docFixture.publicTests)]);
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.equal(result.tests,17); assert.equal(result.failures,0);
  assert.equal(result.invalid_execution,false); assert.equal(result.cancelled,0); assert.equal(result.timed_out,false);
});
test('all semantic faults preserve historical behavior but fail the selected-file contract cleanly',async t=>{
  assert.ok(docFixture.mutations.length>=4);
  for (const mutation of docFixture.mutations) {
    await t.test(mutation.name,async t=>{
      assert.notEqual(mutation.files['src/doc-links.mjs'],docFixture.reference['src/doc-links.mjs']);
      const root=await materialize(t,{...docFixture.reference,...mutation.files},{'oracle.test.mjs':docFixture.hiddenTests});
      const old=run(root,Object.keys(docFixture.publicTests));
      assert.equal(old.status,0,mutation.name+'\n'+old.stdout+old.stderr);
      const result=run(root,['oracle.test.mjs']);
      assert.equal(result.status,1,mutation.name+'\n'+result.stdout+result.stderr);
      assert.ok(result.failures>0); assert.equal(result.invalid_execution,false);
      assert.equal(result.cancelled,0); assert.equal(result.timed_out,false);
      assert.match(result.stdout,/ERR_ASSERTION/);
    });
  }
});
test('hidden checks also work as standalone added tests under the native oracle cwd boundary',async t=>{
  const additional=docFixture.hiddenTests.replaceAll("'./src/","'../src/");
  const root=await materialize(t,docFixture.reference,{'test/additional.test.mjs':additional});
  const result=run(root,['test/additional.test.mjs']);
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.ok(result.tests>0);
});

test('concurrent CLI default checks isolate their product trees and retain helper modules',async t=>{
  const copies=Object.fromEntries(Array.from({length:6},(_,i)=>['test/public-copy-'+i+'.test.mjs',docFixture.publicTests['test/public.test.mjs']]));
  const files={...docFixture.reference,
    'src/doc-links.mjs':docFixture.reference['src/doc-links.mjs']+"\nimport './doc-helper.mjs';\n",
    'src/doc-helper.mjs':'export const copiedHelper = true;\n'};
  const root=await materialize(t,files,{'oracle.test.mjs':docFixture.hiddenTests,...copies});
  const result=run(root,['oracle.test.mjs',...Object.keys(docFixture.publicTests),...Object.keys(copies)]);
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.equal(result.tests,47); assert.equal(result.cancelled,0); assert.equal(result.timed_out,false);
});
