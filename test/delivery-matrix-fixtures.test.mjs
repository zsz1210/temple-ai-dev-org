import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fixtures} from '../scripts/delivery-matrix-fixtures.mjs';

async function execute(t, fixture, product, hidden) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'temple-matrix-fixture-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const files={...product,...fixture.publicTests,...(hidden?{'oracle.test.mjs':fixture.hiddenTests}:{})};
  for(const [name,body] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root,name)),{recursive:true});
    await fs.writeFile(path.join(root,name),body);
  }
  const args=['--test','--test-reporter=tap',...(hidden?['oracle.test.mjs']:Object.keys(fixture.publicTests))];
  const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:10000,
    env:{PATH:path.dirname(process.execPath),HOME:root,NODE_OPTIONS:''},maxBuffer:1024*1024});
  assert.equal(result.error,undefined,result.error?.message);
  return result;
}

test('matrix fixtures expose two bounded scenarios and public API semantic controls',()=>{
  assert.deepEqual(fixtures.map(f=>f.id),['batch','retry']);
  for(const f of fixtures) {
    assert.ok(f.spec.includes('test/additional.test.mjs'));
    assert.ok(f.spec.includes('node --test test/*.test.mjs'));
    assert.deepEqual(Object.keys(f.seed).sort(),Object.keys(f.reference).sort());
    assert.ok(Object.keys(f.seed).length>=2 && Object.keys(f.seed).length<=4);
    assert.ok(Object.keys(f.seed).every(p=>/^src\/[a-z]+\.mjs$/.test(p)));
    assert.ok((f.hiddenTests.match(/test\('/g)||[]).length>=12);
    assert.ok(f.mutations.length>=3);
    assert.equal(new Set(f.mutations.map(m=>m.name)).size,f.mutations.length);
    for(const m of f.mutations) {
      assert.ok(Object.keys(m.files).every(p=>Object.hasOwn(f.reference,p)));
      assert.ok(Object.entries(m.files).some(([p,b])=>b!==f.reference[p]));
    }
  }
});

for(const fixture of fixtures) {
  test(`matrix ${fixture.id}: unfinished seed passes existing public checks`,async t=>{
    const r=await execute(t,fixture,fixture.seed,false);assert.equal(r.status,0,r.stdout+r.stderr);
  });
  test(`matrix ${fixture.id}: reference passes public and hidden behavior`,async t=>{
    for(const hidden of [false,true]) {const r=await execute(t,fixture,fixture.reference,hidden);assert.equal(r.status,0,r.stdout+r.stderr);}
  });
  test(`matrix ${fixture.id}: hidden behavior rejects unfinished seed`,async t=>{
    const r=await execute(t,fixture,fixture.seed,true);assert.notEqual(r.status,0);assert.match(r.stdout,/not ok/);
    assert.doesNotMatch(r.stderr,/SyntaxError|ERR_MODULE_NOT_FOUND/);
  });
  for(const mutation of fixture.mutations) {
    test(`matrix ${fixture.id}: semantic mutant ${mutation.name} is detected`,async t=>{
      const r=await execute(t,fixture,{...fixture.reference,...mutation.files},true);
      assert.notEqual(r.status,0,'mutant passed acceptance');assert.match(r.stdout,/not ok/);
      assert.doesNotMatch(r.stderr,/SyntaxError|ERR_MODULE_NOT_FOUND/,'semantic rather than import/syntax failure required');
      assert.doesNotMatch(r.stdout,/cancelledByParent|Promise resolution is still pending/,'tests must settle rather than fail by hanging');
    });
  }
}
