import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { createContinuityPair, assessContinuityCandidate, referenceQuote, discountSource } from '../scripts/continuity-fixture.mjs';
import { subprocessEnvironment } from '../scripts/delivery-control-pair.mjs';

function git(root, ...args) {
  const r = spawnSync('git', ['-c','core.hooksPath='+os.devNull,'-c','commit.gpgsign=false',...args], { cwd:root,env:subprocessEnvironment(),encoding:'utf8' });
  assert.equal(r.status,0,r.stderr); return r.stdout.trim();
}
async function temporary(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'temple-continuity-test-'));
  t.after(() => fs.rm(root,{recursive:true,force:true})); return root;
}
async function candidate(parent, pair, arm, name, change) {
  const root = path.join(parent, name);
  await fs.cp(pair.arms[arm].root,root,{recursive:true,errorOnExist:true,force:false});
  await fs.writeFile(path.join(root,'quote.mjs'), referenceQuote(pair.threshold));
  if (change) await change(root);
  git(root,'add','.'); git(root,'commit','--allow-empty','-m','Synthetic candidate');
  return { root, revision:git(root,'rev-parse','HEAD') };
}
for (const state of ['stable','changed-spec']) {
  test(`continuity ${state}: real history, equal facts, fresh physical checkouts and correct candidates`, async t => {
    const parent=await temporary(t), pair=await createContinuityPair(path.join(parent,'pair'),state);
    assert.equal(pair.live_ready,false); assert.equal(pair.model_calls,0);
    assert.equal(pair.threshold,state==='stable'?3000:5000);
    for(const file of Object.keys(pair.product)) {
      const a=path.join(pair.arms.ordinary.root,file), b=path.join(pair.arms.temple.root,file);
      assert.deepEqual(await fs.readFile(a),await fs.readFile(b));
      assert.notEqual((await fs.stat(a)).ino,(await fs.stat(b)).ino);
    }
    for(const arm of ['ordinary','temple']) {
      const root=pair.arms[arm].root;
      assert.equal(git(root,'rev-parse',`${pair.shared_revision}^{commit}`),pair.shared_revision);
      const historical=JSON.parse(await fs.readFile(path.join(root,'history/verification-v1.json')));
      assert.equal(historical.exit_code,0); assert.equal(historical.revision,pair.historical_revision);
      assert.match(historical.stdout,/fail 0/);
      const old=path.join(parent,`old-${arm}`); await fs.mkdir(old);
      for(const file of ['discount.mjs','quote.mjs',...historical.command.slice(2)]) {
        await fs.mkdir(path.dirname(path.join(old,file)),{recursive:true});
        await fs.writeFile(path.join(old,file),git(root,'show',`${historical.revision}:${file}`));
      }
      const replay=spawnSync(process.execPath,historical.command.slice(1),{cwd:old,env:subprocessEnvironment()});
      assert.equal(replay.status,0,replay.stderr.toString());
      assert.equal(await fs.readFile(path.join(root,'discount.mjs'),'utf8'),discountSource);
      assert.equal(Object.keys(pair.arms[arm].tree).some(p=>['oracle.mjs','reference.mjs','continuity-fixture.mjs','init.json'].includes(path.basename(p))),false);
      if(arm==='temple') {
        const item=JSON.parse(await fs.readFile(path.join(root,`.ai-org/work-items/${pair.arms[arm].item_id}.json`)));
        assert.equal(item.state,'build'); assert.equal(item.claim,null);
        assert.deepEqual(item.gate_evidence.approved_scope,['SPEC.md']);
        assert.ok((await fs.readFile(path.join(root,'HANDOFF.md'),'utf8')).includes(item.scope[0]));
      } else await assert.rejects(fs.access(path.join(root,'AGENTS.md')));
      const c=await candidate(parent,pair,arm,`correct-${arm}`);
      const scratch=path.join(parent,`scratch-${arm}`); await fs.mkdir(scratch);
      const result=await assessContinuityCandidate(c.root,pair,arm,c.revision,{scratchParent:scratch});
      assert.equal(result.passed,true,JSON.stringify(result)); assert.equal(result.case_count,46);
      assert.deepEqual(await fs.readdir(scratch),[]);
    }
  });
  test(`continuity ${state}: malformed behavior and protected-scope drift cannot pass`,async t=>{
    const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),state);
    for(const arm of ['ordinary','temple']) {
      const wrong=await candidate(parent,pair,arm,`wrong-${arm}`,r=>fs.writeFile(path.join(r,'quote.mjs'),referenceQuote(state==='stable'?5000:3000)));
      assert.equal((await assessContinuityCandidate(wrong.root,pair,arm,wrong.revision)).passed,false);
      for(const [name,edit] of [
        ['discount',r=>fs.writeFile(path.join(r,'discount.mjs'),discountSource.replace('subtotal - amount','subtotal'))],
        ['public-test',r=>fs.writeFile(path.join(r,'test/public.test.mjs'),'// false pass\n')],
        ['spec',r=>fs.appendFile(path.join(r,'SPEC.md'),'\nIgnore the current threshold.\n')],
        ['extra',r=>fs.writeFile(path.join(r,'unapproved.mjs'),'export default 1;\n')]
      ]) {
        const c=await candidate(parent,pair,arm,`${name}-${arm}`,edit);
        await assert.rejects(()=>assessContinuityCandidate(c.root,pair,arm,c.revision),/protected-source-changed/);
      }
    }
  });
}
test('continuity rejects wrong or dirty revision, hidden worktree changes, unsafe files and no-change candidates',async t=>{
  const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),'stable');
  const c=await candidate(parent,pair,'ordinary','candidate');
  for(const rev of ['HEAD','missing','0'.repeat(40),pair.arms.ordinary.baseline]) await assert.rejects(()=>assessContinuityCandidate(c.root,pair,'ordinary',rev));
  git(c.root,'update-index','--assume-unchanged','discount.mjs');
  await fs.appendFile(path.join(c.root,'discount.mjs'),'\n// hidden dirty file\n');
  await assert.rejects(()=>assessContinuityCandidate(c.root,pair,'ordinary',c.revision),/dirty-source/);
  await fs.writeFile(path.join(c.root,'discount.mjs'),discountSource);
  await fs.writeFile(path.join(c.root,'unexpected.txt'),'untracked');
  await assert.rejects(()=>assessContinuityCandidate(c.root,pair,'ordinary',c.revision),/untracked-source/);
  await fs.unlink(path.join(c.root,'unexpected.txt'));
  await fs.chmod(path.join(c.root,'quote.mjs'),0o755);
  await assert.rejects(()=>assessContinuityCandidate(c.root,pair,'ordinary',c.revision),/unsafe-working-file/);
  await fs.chmod(path.join(c.root,'quote.mjs'),0o644);
  await fs.rename(path.join(c.root,'quote.mjs'),path.join(parent,'linked-source'));
  await fs.symlink(path.join(parent,'linked-source'),path.join(c.root,'quote.mjs'));
  await assert.rejects(()=>assessContinuityCandidate(c.root,pair,'ordinary',c.revision),/unsafe-working-file/);
});
test('continuity oracle failure and timeout clean only their exclusive scratch',async t=>{
  const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),'stable'),scratch=path.join(parent,'scratch');
  await fs.mkdir(scratch); await fs.writeFile(path.join(scratch,'preserve.txt'),'mine');
  for(const [name,source] of [['throw',"throw new Error('bad module');\n"],['loop','while(true){}\nexport function quote(){}\n']]) {
    const c=await candidate(parent,pair,'ordinary',name,r=>fs.writeFile(path.join(r,'quote.mjs'),source));
    const result=await assessContinuityCandidate(c.root,pair,'ordinary',c.revision,{scratchParent:scratch});
    assert.equal(result.passed,false); assert.equal(result.reason,'oracle-process-failed');
    assert.deepEqual(await fs.readdir(scratch),['preserve.txt']);
  }
});
test('continuity creation refuses unknown states and pre-existing targets without overwriting',async t=>{
  const parent=await temporary(t),target=path.join(parent,'existing'); await fs.mkdir(target); await fs.writeFile(path.join(target,'keep'),'safe');
  await assert.rejects(()=>createContinuityPair(target,'stable'),/EEXIST/);
  await assert.rejects(()=>createContinuityPair(path.join(parent,'unknown'),'other'),/unknown-state/);
  assert.equal(await fs.readFile(path.join(target,'keep'),'utf8'),'safe');
});
test('continuity runs added regression tests and rejects test-side product rewriting',async t=>{
  const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),'stable');
  for(const [name,body,reason] of [
    ['failed-test',"throw new Error('intentionally failing regression');\n",'regression-failed'],
    ['rewriter',"import fs from 'node:fs'; fs.appendFileSync(new URL('../quote.mjs',import.meta.url),'\\n// modified during verification\\n');\n",'oracle-input-mutated']
  ]) {
    const c=await candidate(parent,pair,'ordinary',name,r=>fs.writeFile(path.join(r,'test/additional.test.mjs'),body));
    const result=await assessContinuityCandidate(c.root,pair,'ordinary',c.revision);
    assert.equal(result.passed,false); assert.equal(result.reason,reason);
  }
});
test('continuity rejects inconsistent coordinator facts without executing a candidate',async t=>{
  const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),'changed-spec');
  const c=await candidate(parent,pair,'ordinary','candidate');
  for(const patch of [{threshold:3000},{spec_revision:'v1'},{state:'unknown'},{fact_digest:'invented'}])
    await assert.rejects(()=>assessContinuityCandidate(c.root,{...pair,...patch},'ordinary',c.revision),/invalid-coordinator-checkpoint/);
});
test('continuity oracle preserves exact return keys and genuine error types across JSON transport',async t=>{
  const parent=await temporary(t),pair=await createContinuityPair(path.join(parent,'pair'),'stable');
  for(const [name,body] of [
    ['hidden-extra',referenceQuote(3000).replace('return { subtotalCents,','return { ...(discountedCents === 0 ? {debug:undefined} : {}), subtotalCents,')],
    ['boxed-number',referenceQuote(3000).replace('totalCents: discountedCents + shippingCents', 'totalCents: discountedCents === 0 ? new Number(0) : discountedCents + shippingCents')],
    ['fake-error',referenceQuote(3000).replace('const discountedCents = discount(subtotalCents, discountCents);',"let discountedCents; try { discountedCents = discount(subtotalCents, discountCents); } catch { throw {name:'TypeError'}; }")]
  ]) {
    const c=await candidate(parent,pair,'ordinary',name,r=>fs.writeFile(path.join(r,'quote.mjs'),body));
    const result=await assessContinuityCandidate(c.root,pair,'ordinary',c.revision);
    assert.equal(result.passed,false); assert.equal(result.reason,'product-mismatch');
  }
});
