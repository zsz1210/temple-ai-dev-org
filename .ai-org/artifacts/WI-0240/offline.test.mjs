// Project evidence checks only. No provider, lab mutation or new runner policy.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {learningDocuments, createRepositoryRetrievalProvider} from '../../../src/context.mjs';
import {assessmentDecision} from '../../../scripts/evaluation-sequence.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const inventory=read('.ai-org/artifacts/WI-0240/inventory.json');

test('inventory binds unchanged exports and every original row, without new samples',()=>{
  let rows=0,missing=0,censored=0;
  for(const item of inventory.items){
    const bytes=fs.readFileSync(path.join(root,item.source));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
    const source=JSON.parse(bytes);
    assert.deepEqual(item.original_seal,source.seal);
    assert.equal(item.rows.length,source.rows.length);
    for(const row of item.rows){
      const original=source.rows.find(x=>x.index===row.index);
      assert.ok(original);
      assert.equal(row.new_execution,false);
      assert.equal(row.condition,original.state);
      assert.equal(row.treatment,original.treatment??original.arm);
      assert.equal(row.usage_complete,original.usage_status==='observed-completed-turn');
      if(row.reuse==='missing-observation'){assert.equal(original.usage??null,null);missing++;}
      if(row.reuse==='censored-diagnostic-only'){assert.ok(original.usage);assert.equal(row.usage_complete,false);censored++;}
      rows++;
    }
  }
  assert.equal(rows,18);assert.equal(missing,5);assert.equal(censored,1);
});

test('only the two validated Lessons and scoped active Practice enter learning corpus',()=>{
  const index=read('.ai-org/learning/index.json');
  assert.deepEqual(learningDocuments(index).map(x=>x.id).sort(),['LESSON-0005','LESSON-0006','PRACTICE-0002']);
  for(const id of ['LESSON-0005','LESSON-0006','PRACTICE-0002']){
    const entry=index.entries.find(x=>x.id===id);
    assert.equal(entry.revalidation.last_result,'confirmed');
    assert.ok(entry.revalidation.evidence_refs.length);
    for(const ref of entry.revalidation.evidence_refs)assert.ok(fs.existsSync(path.join(root,ref)),ref);
  }
});

test('real Learning CLI returns retained-evidence and coverage guidance',()=>{
  const result=JSON.parse(execFileSync(process.execPath,['./templew.mjs','learning','evaluate','.',
    '--fixture','.ai-org/artifacts/WI-0240/retrieval-cases.json','--no-write','--json'],{cwd:root,encoding:'utf8'}));
  assert.equal(result.summary.cases,2);assert.equal(result.summary.passed,2);
  assert.equal(result.external_action_performed,false);
});

test('unrelated query and unvalidated existing candidates are not injected',async()=>{
  const provider=createRepositoryRetrievalProvider();
  const docs=learningDocuments(read('.ai-org/learning/index.json'));
  const results=await provider.search({query:'SwiftUI typography alignment',documents:docs,pinned_ids:[],limit:3});
  assert.deepEqual(results,[]);
});

test('actual work Context routes the active Practice for an experiment query',()=>{
  const result=JSON.parse(execFileSync(process.execPath,['./templew.mjs','context','resolve','.',
    '--work-item','WI-0240','--position','tech_lead','--query','experiment evidence-reuse baseline',
    '--compact','--no-write','--json'],{cwd:root,encoding:'utf8'}));
  assert.ok(result.references.learning.some(x=>x.id==='PRACTICE-0002'));
  assert.equal(result.mutation_performed,false);
});

test('current shared-stop boundaries are preserved, not replaced by design prose',()=>{
  const policy={product_failure:true,local_invalid:false};
  const safe={outcome:'passed',isolation_confirmed:true,cleanup_confirmed:true,validity_confirmed:true};
  assert.equal(assessmentDecision(safe,policy).stop,null);
  assert.equal(assessmentDecision({...safe,outcome:'product-failure'},policy).stop,null);
  assert.equal(assessmentDecision({...safe,cleanup_confirmed:false},policy).stop,'shared-validity-unconfirmed');
  assert.equal(assessmentDecision({...safe,validity_confirmed:false},policy).stop,'shared-validity-unconfirmed');
  assert.equal(assessmentDecision({...safe,outcome:'token-limit'},policy).stop,'shared-validity-unconfirmed');
  assert.equal(assessmentDecision({...safe,outcome:'local-invalid',failure_scope:'subject',shared_validity_confirmed:true},policy).stop,'continuation-not-authorized');
});
