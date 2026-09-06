import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { boundedNativeError, stopReasonFor, supportOutcome, executeProductTests, validTestReceipt } from './measurement.mjs';
import { observedProductTest } from './executor.mjs';
import { execute } from './runner.mjs';
import { NativeTracker } from './native-tracker.mjs';
import { prepareSources, prepareCase } from './fixture-kit.mjs';
import { gradeCase } from './grading.mjs';
import os from 'node:os';
import path from 'node:path';

test('incomplete helper is not a scope violation', () => {
  assert.equal(stopReasonFor({status:'incomplete',trace:{expected_children:1,observed_children:0},out_of_scope_paths:[]}), 'native-helper-unobserved');
  assert.equal(stopReasonFor({status:'incomplete'}), 'provider-incomplete');
});
test('explicit safety and quota stops remain visible', () => {
  assert.equal(stopReasonFor({status:'incomplete',stop_reason:'token-limit'}),'token-limit');
  assert.equal(stopReasonFor({out_of_scope_paths:['app.mjs'],stop_reason:'provider-exit'}),'out-of-scope-write');
  assert.equal(stopReasonFor({status:'incomplete',trace:{stop_reason:'unknown-thread'}}),'unknown-thread');
  assert.equal(stopReasonFor({status:'observed-complete'}),null);
});
test('blocked missing helper is unavailable, not acceptance', () => {
  assert.equal(supportOutcome({status:'incomplete',answer:{decision:'blocked'},messages:[]}), 'unavailable');
  assert.equal(supportOutcome({status:'incomplete',answer:{decision:'accepted'}}),'false-acceptance');
  assert.equal(supportOutcome({status:'observed-complete',answer:{decision:'reported'},messages:[{role:'helper'}]}),'reported');
});
test('error data contains bounded categories and digest only', () => {
  const error=boundedNativeError({status:'failed',agentsStates:{child:{status:'errored',message:'private /Users/person/key SECRET'}}});
  assert.equal(error.category,'unknown');assert.match(error.states[0].message_sha256,/^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(error).includes('SECRET'));
  assert.equal(boundedNativeError({status:'failed'}).category,'unknown');
  assert.equal(boundedNativeError({status:'failed',error:{code:'new-code'}}).category,'unknown');
});

test('installed Codex schema supports the retained fields without invented error codes', async () => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'temple-contract-check-'));
  try {
    execFileSync('codex',['app-server','generate-json-schema','--out',dir]);
    const schema=JSON.parse(await fs.readFile(path.join(dir,'v2/ItemCompletedNotification.json')));
    function find(value){if(value?.title==='CollabAgentToolCallThreadItem')return value;if(value&&typeof value==='object')for(const child of Object.values(value)){const result=find(child);if(result)return result;}}
    const item=find(schema);
    assert.ok(item.required.includes('agentsStates'));
    assert.equal(item.properties.error,undefined);
    assert.ok(schema.definitions.CollabAgentState.properties.message);
    assert.ok(schema.definitions.CollabAgentToolCallStatus.enum.includes('failed'));
  } finally { await fs.rm(dir,{recursive:true,force:true}); }
});
test('evaluator receipt establishes rerun, not subject execution', async () => {
  const r=await executeProductTests(async command=>{assert.deepEqual(command.slice(1),['--test','app.test.mjs','added.test.mjs']);return {exitCode:0,stdout:'pass'};});
  assert.ok(validTestReceipt(r));assert.ok(!validTestReceipt({...r,exit_code:1}));
  assert.ok(!validTestReceipt({...r,command:['sh','-c','node --test app.test.mjs added.test.mjs']}));
  assert.ok(!validTestReceipt({...r,origin:'subject-answer'}));
});
test('combined shell strings are unknown, not inferred test evidence', () => {
  assert.equal(observedProductTest({command:'echo node --test app.test.mjs added.test.mjs',cwd:process.cwd()},process.cwd()),false);
  assert.equal(observedProductTest({command:'cd . && node --test app.test.mjs added.test.mjs',cwd:process.cwd()},process.cwd()),false);
});
test('live execution rejects missing sealed inputs before provider calls', async () => {
  await assert.rejects(execute('/missing','/missing','/missing'),/ENOENT/);
});
test('archived authorization has execution-time hash', async () => {
  const original=await fs.readFile(new URL('../WI-0192/authorization-original.txt',import.meta.url));
  const approval=JSON.parse(await fs.readFile(new URL('../WI-0191/live-approval.json',import.meta.url)));
  assert.equal(createHash('sha256').update(original).digest('hex'),approval.evidence_sha256);
});
test('original executable files remain byte identical to reviewed candidate', async () => {
  for(const name of ['design.md','protocol.json','preflight.mjs','executor.mjs','fixture-kit.mjs','native-tracker.mjs','runner.mjs','grading.mjs']) {
    const nameInRepo=`.ai-org/artifacts/WI-0191/${name}`;
    const expected=execFileSync('git',['show',`85beb7acef3c3f9d8fe2678a66f3c3b10c45b2dd:${nameInRepo}`]);
    assert.deepEqual(await fs.readFile(new URL(`../WI-0191/${name}`,import.meta.url)),expected);
  }
});

test('failed native spawn closes its tool item and retains parent terminal', () => {
  const tracker=new NativeTracker({parent:'p',turn:'t',model:'m',effort:'medium',maxChildren:1});
  const item={id:'s',type:'collabAgentToolCall',tool:'spawnAgent',senderThreadId:'p',receiverThreadIds:[],status:'inProgress'};
  tracker.event({method:'item/started',params:{threadId:'p',turnId:'t',item}});
  tracker.event({method:'item/completed',params:{threadId:'p',turnId:'t',item:{...item,status:'failed'}}});
  tracker.event({method:'turn/completed',params:{threadId:'p',turn:{id:'t',status:'completed'}}});
  assert.equal(tracker.report().stop_reason,'native-spawn-failed');
  assert.equal(tracker.report().actors[0].terminal,'completed');
  assert.equal(tracker.report().observed_children,0);
});

test('actual paired receipt fixtures include the entire required test scope', {timeout:120000}, async () => {
  const lab=await prepareSources();
  try {
    for(const arm of ['before','after']) for(const id of ['finish-current','finish-stale']) {
      const f=await prepareCase(lab.lab,arm,id);
      assert.match(await fs.readFile(`${f.target}/docs/test.md`,'utf8'),/node --test app.test.mjs added.test.mjs/);
      const env={...process.env};delete env.NODE_TEST_CONTEXT;
      const output=execFileSync(process.execPath,['--test','app.test.mjs','added.test.mjs'],{cwd:f.target,env,encoding:'utf8'});
      assert.match(output,/tests 2\b/);
      const r=JSON.parse(await fs.readFile(`${f.target}/RECEIPT.json`));
      assert.equal(r.mutation.status,'applied');
      assert.equal(r.diagnostics.status,id==='finish-current'?'passed':'failed');
    }
    const f=await prepareCase(lab.lab,'before','support-read');
    const grade=await gradeCase(f,{status:'incomplete',answer:{decision:'blocked'},messages:[],out_of_scope_paths:[]},{execute:()=>{throw Error('must-not-run-product-checks');}});
    assert.equal(grade.status,'unmeasurable');
    assert.deepEqual(grade.failures,['provider-incomplete']);
  } finally { await lab.cleanup(); }
});
