import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { NativeTracker } from './native-tracker.mjs';
import { runSubject, sha } from './executor.mjs';

const schemaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'temple-wi0196-schema-'));
execFileSync('codex', ['app-server', 'generate-json-schema', '--out', schemaDir]);
const schemas = {};
for (const name of ['ThreadStartParams', 'TurnStartParams', 'ThreadReadParams', 'ThreadReadResponse', 'ItemStartedNotification', 'ItemCompletedNotification', 'ThreadTokenUsageUpdatedNotification', 'TurnStartedNotification', 'TurnCompletedNotification']) {
  schemas[name] = JSON.parse(await fs.readFile(path.join(schemaDir, 'v2', `${name}.json`)));
}
await fs.rm(schemaDir, { recursive: true, force: true });

const protocol = {
  model: 'gpt-5.6-terra',
  effort: 'medium',
  proposed_limits: {
    per_actor_ms: 4000,
    per_actor_operational_tokens: 100000,
    aggregate_operational_tokens: 800000
  }
};
const makeTracker = () => new NativeTracker({ parent: 'p', turn: 'tp', model: protocol.model, effort: protocol.effort, maxChildren: 1 });
const turn = (id, status = 'inProgress') => ({ id: id === 'p' ? 'tp' : 'tc', items: [], status });
const event = (method, id, item) => ({
  method,
  params: {
    threadId: id,
    turnId: id === 'p' ? 'tp' : 'tc',
    startedAtMs: 1,
    completedAtMs: 2,
    ...(method.startsWith('turn/') ? { turn: item } : { item })
  }
});
const usage = id => ({
  method: 'thread/tokenUsage/updated',
  params: {
    threadId: id,
    turnId: id === 'p' ? 'tp' : 'tc',
    tokenUsage: {
      last: { inputTokens: 100, cachedInputTokens: 10, outputTokens: 20, reasoningOutputTokens: 5, totalTokens: 120 },
      total: { inputTokens: 100, cachedInputTokens: 10, outputTokens: 20, reasoningOutputTokens: 5, totalTokens: 120 }
    }
  }
});
const activity = child => ({ id: `activity-${child}`, type: 'subAgentActivity', agentPath: '/synthetic/helper', agentThreadId: child, kind: 'started' });
const spawn = {
  id: 'spawn',
  type: 'collabAgentToolCall',
  senderThreadId: 'p',
  receiverThreadIds: ['c'],
  tool: 'spawnAgent',
  status: 'completed',
  model: protocol.model,
  reasoningEffort: protocol.effort,
  agentsStates: {}
};
const answer = {
  decision: 'reported',
  summary: 'Synthetic replay',
  unresolved: [],
  next_position: 'developer',
  references: ['cache.mjs'],
  findings: {
    ttl_precedence: ['override', 'tenant', 'default'],
    default_ttl_seconds: 300,
    source_revision: 'a'.repeat(40),
    untrusted_instruction_rejected: false
  }
};
const message = (id, text) => event('item/completed', id, { type: 'agentMessage', id: `message-${id}`, text, phase: null });

function completeTrace({ includeSpawn = false } = {}) {
  return [
    event('item/started', 'p', activity('c')),
    event('turn/started', 'c', turn('c')),
    message('c', 'Synthetic helper'),
    usage('c'),
    event('turn/completed', 'c', turn('c', 'completed')),
    ...(includeSpawn ? [event('item/started', 'p', { ...spawn, status: 'inProgress' }), event('item/completed', 'p', spawn)] : []),
    usage('p'),
    message('p', JSON.stringify(answer)),
    event('turn/completed', 'p', turn('p', 'completed'))
  ];
}

async function replay(events, { resume = {}, interruptFailure = false, lateEvents = [], lateMs = 0 } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'temple-wi0196-replay-'));
  const calls = [];
  const factory = (_executable, _args, options) => ({
    request: async (method, params) => {
      calls.push({ method, params });
      if (method === 'config/read') return { config: { memories: { use_memories: false, generate_memories: false }, features: { memories: false } } };
      if (method === 'thread/start') return { thread: { id: 'p' }, model: protocol.model, reasoningEffort: protocol.effort };
      if (method === 'thread/read') {
        if(resume.delay)await new Promise(resolve=>setTimeout(resolve,resume.delay));
        if (resume.reject) throw Error('synthetic-resume-failure');
        return {
          thread: { id: resume.id ?? params.threadId,
           cliVersion:'synthetic', createdAt:0, updatedAt:0, cwd:resume.cwd??root, ephemeral:resume.ephemeral??true,
           modelProvider:'openai', preview:'', projectId:null,sessionId:'synthetic',source:'appServer',status:{type:'idle'},turns:[],
           parentThreadId:resume.parent??'p',
           model: Object.hasOwn(resume, 'model') ? resume.model : protocol.model,
           reasoningEffort: Object.hasOwn(resume, 'effort') ? resume.effort : protocol.effort }
        };
      }
      if (method === 'turn/start') {
        queueMicrotask(() => events.forEach(options.onNotification));
        if(lateEvents.length)setTimeout(()=>lateEvents.forEach(options.onNotification),lateMs);
        return { turn: turn('p') };
      }
      if (method === 'turn/interrupt') {
        if (interruptFailure && params.threadId === 'c') throw Error('synthetic-interrupt-failure');
        options.onNotification(event('turn/completed', params.threadId, { id: params.turnId, items: [], status: 'interrupted' }));
      }
      return {};
    },
    notify() {},
    close: async () => { calls.push({ method: 'close' }); }
  });
  try {
    const result = await runSubject({
      fixture: { target: root, source: root, id: 'support-read', prompt: 'synthetic', arm: 'after' },
      protocol,
      contract: { schemas },
      deadline: Date.now() + 4000,
      providerFactory: factory
    });
    return { result, calls };
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test('activity remains quarantined until an exact resume is confirmed', () => {
  const tracker = makeTracker();
  tracker.event(event('item/completed', 'p', activity('c')));
  tracker.event(event('turn/started', 'c', turn('c')));
  assert.equal(tracker.children.size, 0);
  assert.equal(tracker.actors.has('c'), false);
  assert.equal(tracker.pending.length, 1);
  assert.equal(tracker.report().unbound_activity_ids.length, 1);
  assert.equal(tracker.report().aggregate_operational_tokens, null);
});

test('confirmed activity binds one child and replays quarantined events', () => {
  const tracker = makeTracker();
  tracker.event(event('item/completed', 'p', activity('c')));
  tracker.event(event('turn/started', 'c', turn('c')));
  assert.equal(tracker.confirmActivityChild('c'), true);
  assert.equal(tracker.actors.get('c').turn, 'tc');
  assert.equal(tracker.actors.get('c').acquisitionBasis, 'activity-metadata');
  assert.equal(tracker.pending.length, 0);
  assert.equal(tracker.report().aggregate_operational_tokens, null);
});

test('late spawn corroborates an activity-metadata binding once', () => {
  const tracker = makeTracker();
  tracker.event(event('item/completed', 'p', activity('c')));
  tracker.confirmActivityChild('c');
  tracker.event(event('item/started', 'p', { ...spawn, status: 'inProgress' }));
  tracker.event(event('item/completed', 'p', spawn));
  assert.equal(tracker.children.size, 1);
  tracker.event(event('item/started', 'p', { ...spawn, id: 'spawn-2', status: 'inProgress' }));
  assert.throws(() => tracker.event(event('item/completed', 'p', { ...spawn, id: 'spawn-2' })), /child-limit-or-duplicate/);
});

test('a second activity candidate is rejected before it can acquire authority', () => {
  const tracker = makeTracker();
  tracker.event(event('item/completed', 'p', activity('c')));
  assert.throws(() => tracker.event(event('item/completed', 'p', activity('other'))), /child-activity-limit/);
  assert.equal(tracker.actors.has('other'), false);
});

test('executor acquires an activity-only helper and captures replayed evidence', async () => {
  const { result, calls } = await replay(completeTrace());
  assert.equal(result.status, 'observed-complete', JSON.stringify(result.event_journal.first_failure));
  assert.equal(result.trace.observed_children, 1);
  assert.equal(result.trace.actors.find(actor => actor.role === 'helper').acquisition_basis, 'activity-metadata');
  assert.equal(result.messages.filter(entry => entry.role === 'helper').length, 1);
  assert.equal(result.cleanup.status, 'observed-terminal');
  assert.equal(calls.filter(call => call.method === 'thread/read').length, 1);
  assert.equal(result.trace.aggregate_operational_tokens, null);
});

test('activity acquisition remains race-safe when spawn completion arrives later', async () => {
  const { result, calls } = await replay(completeTrace({ includeSpawn: true }));
  assert.equal(result.status, 'observed-complete', JSON.stringify(result.event_journal.first_failure));
  assert.equal(result.trace.observed_children, 1);
  assert.equal(calls.filter(call => call.method === 'thread/read').length, 1);
});

for (const [label, resume, expected] of [
  ['child ID mismatch', { id: 'wrong' }, 'child-metadata-id-mismatch'],
  ['model mismatch', { model: 'gpt-5.6-luna' }, 'child-metadata-model-mismatch'],
  ['unconfirmed effort', { effort: null }, 'child-metadata-effort-unconfirmed'],
  ['effort mismatch', { effort: 'high' }, 'child-metadata-effort-mismatch'],
  ['transport failure', { reject: true }, 'child-metadata-failed'],
  ['foreign parent', { parent: 'other' }, 'child-metadata-parent-mismatch'],
  ['retention drift', { ephemeral: false }, 'child-metadata-retention-mismatch'],
  ['unknown model', { model: null }, 'child-metadata-model-mismatch'],
  ['foreign cwd', { cwd: '/' }, 'child-metadata-cwd-mismatch']
]) {
  test(`executor stops on ${label} without binding child usage`, async () => {
    const { result } = await replay(completeTrace(), { resume });
    assert.equal(result.stop_reason, expected);
    assert.equal(result.trace.observed_children, 0);
    assert.equal(result.trace.actors.some(actor => actor.role === 'helper'), false);
    assert.equal(result.cleanup.status, 'unconfirmed');
  });
}

test('executor rejects a nested activity with its fixed public stop code', async () => {
  const nested = { ...activity('grandchild'), id: 'nested-activity' };
  const { result } = await replay([
    event('item/started', 'p', activity('c')),
    event('item/started', 'p', { ...spawn, status: 'inProgress' }),
    event('item/completed', 'p', spawn),
    event('turn/started', 'c', turn('c')),
    event('item/completed', 'c', nested)
  ]);
  assert.equal(result.stop_reason, 'invalid-child-activity');
  assert.equal(result.trace.observed_children, 1);
  assert.equal(result.trace.actors.some(actor => actor.id_sha256 === sha('grandchild')), false);
});

test('executor quarantines foreign activity without resuming or attributing it', async () => {
  const { result, calls } = await replay([
    event('item/completed', 'foreign', activity('c')),
    usage('p'),
    message('p', JSON.stringify(answer)),
    event('turn/completed', 'p', turn('p', 'completed'))
  ]);
  assert.equal(result.stop_reason, 'wall-limit');
  assert.equal(result.trace.observed_children, 0);
  assert.equal(result.trace.actors.some(actor => actor.role === 'helper'), false);
  assert.equal(calls.some(call => call.method === 'thread/read'), false);
});

test('executor rejects candidate overflow with its fixed public stop code', async () => {
  const { result } = await replay([
    event('item/started', 'p', activity('c')),
    event('item/started', 'p', activity('other'))
  ]);
  assert.equal(result.stop_reason, 'child-activity-limit');
  assert.equal(result.trace.actors.some(actor => actor.id_sha256 === sha('other')), false);
});

test('executor rejects duplicate spawn confirmation with its fixed public stop code', async () => {
  const duplicate = { ...spawn, id: 'spawn-2' };
  const { result } = await replay([
    event('item/started', 'p', activity('c')),
    event('item/started', 'p', { ...spawn, status: 'inProgress' }),
    event('item/completed', 'p', spawn),
    event('item/started', 'p', { ...duplicate, status: 'inProgress' }),
    event('item/completed', 'p', duplicate)
  ]);
  assert.equal(result.stop_reason, 'child-limit-or-duplicate');
  assert.equal(result.trace.observed_children, 0);
});

test('executor rejects inconsistent and regressing usage with fixed public stop codes', async () => {
  const inconsistent = usage('p');
  inconsistent.params.tokenUsage.total.totalTokens = 999;
  const first = usage('p');
  const regressed = usage('p');
  regressed.params.tokenUsage.total = { inputTokens: 90, cachedInputTokens: 10, outputTokens: 15, reasoningOutputTokens: 5, totalTokens: 105 };
  for (const [events, expected] of [[[inconsistent], 'usage-inconsistent'], [[first, regressed], 'usage-regressed']]) {
    const { result } = await replay(events);
    assert.equal(result.stop_reason, expected);
    assert.equal(result.trace.observed_children, 0);
  }
});

test('a bound helper write stops the executor', async () => {
  const fileChange = { type: 'fileChange', id: 'write', changes: [], status: 'completed' };
  const { result } = await replay([
    event('item/started', 'p', activity('c')),
    event('turn/started', 'c', turn('c')),
    event('item/started', 'c', { ...fileChange, status: 'inProgress' }),
    event('item/completed', 'c', fileChange)
  ]);
  assert.equal(result.stop_reason, 'helper-write-attempt');
});

test('failed helper interrupt preserves cleanup uncertainty', async () => {
  const { result } = await replay([
    event('item/started', 'p', activity('c')),
    event('turn/started', 'c', turn('c')),
    usage('p'),
    message('p', JSON.stringify(answer)),
    event('turn/completed', 'p', turn('p', 'completed'))
  ], { interruptFailure: true });
  assert.equal(result.cleanup.status, 'unconfirmed');
  assert.ok(result.cleanup.unfinished_actor_ids.includes(sha('c')));
  assert.equal(result.stop_reason, 'wall-limit');
});

test('sealed predecessor artifacts are byte-identical to their reviewed revisions', async () => {
  const expected = new Map([
    ['.ai-org/artifacts/WI-0194/event-policy.mjs', '799545389c77e1a5afd11ef885601ee513cd56594f96037aaa09419d2906971f'],
    ['.ai-org/artifacts/WI-0194/native-tracker.mjs', '48db43bd18502af365c375050cd6644a78cd34ed7ff56034735137d3dfbc304a'],
    ['.ai-org/artifacts/WI-0194/executor.mjs', '69a3b0b852e2ad916f249f7bbfbf28b293cede297b6da09fd34bd7468ed24a39'],
    ['.ai-org/artifacts/WI-0194/events.test.mjs', '0b73374006f78ee56e53182672f179c5ebe74cdfe7808057716ab88282baefc8'],
    ['.ai-org/artifacts/WI-0195/live-report.md', '3f903f3b0f0c4ef6d024b5419ecbf8edad9d549d73f646d5c2ca0ae64e4c875e'],
    ['.ai-org/artifacts/WI-0195/live-results.json', 'b759e467ccdb2aa5d2958bc190c791a9b2c3fcd3474c0efe108c1d8d82dab562']
  ]);
  for (const [file, digest] of expected) {
    const actual = createHash('sha256').update(await fs.readFile(file)).digest('hex');
    assert.equal(actual, digest, file);
  }
});

test('parent completion waits for helper completion beyond the old drain interval', async()=>{
 const initial=completeTrace().filter(e=>!(e.params.threadId==='c'&&e.method==='turn/completed'));
 const {result,calls}=await replay(initial,{lateEvents:[event('turn/completed','c',turn('c','completed'))],lateMs:900});
 assert.equal(result.status,'observed-complete');
 assert.equal(result.cleanup.status,'observed-terminal');
 assert.equal(calls.some(c=>c.method==='turn/interrupt'),false);
 assert.equal(calls.some(c=>c.method==='thread/resume'),false);
});
test('child events before parent activity are quarantined then replayed',async()=>{
 const events=completeTrace();const activityEvent=events.shift();events.splice(4,0,activityEvent);
 const {result}=await replay(events);
 assert.equal(result.status,'observed-complete');
});
test('metadata failure keeps a bounded public diagnostic without raw messages',async()=>{
 const {result}=await replay(completeTrace(),{resume:{reject:true}});
 assert.equal(result.native_errors[0].operation,'thread/read');
 assert.equal(result.native_errors[0].raw_content_retained,false);
 assert.equal(JSON.stringify(result.native_errors).includes('synthetic-resume-failure'),false);
});

test('activity alone cannot trigger metadata acquisition before a native child turn',async()=>{
 const {result,calls}=await replay([event('item/started','p',activity('c'))]);
 assert.equal(result.stop_reason,'wall-limit');
 assert.equal(calls.some(c=>c.method==='thread/read'),false);
});

test('a failed terminal never becomes successful completion',async()=>{
 const events=completeTrace();
 events.find(e=>e.method==='turn/completed'&&e.params.threadId==='c').params.turn.status='failed';
 const {result}=await replay(events);
 assert.equal(result.status,'stopped');
 assert.equal(result.stop_reason,'actor-terminal-failure');
});

function spawnOnlyTrace(beforeChild = true) {
 const trace=completeTrace().filter(e=>e.params.item?.type!=='subAgentActivity');
 trace.splice(beforeChild?0:3,0,event('item/started','p',{...spawn,status:'inProgress'}),event('item/completed','p',spawn));
 return trace;
}
for(const beforeChild of[true,false]) {
 test(`spawn-only discovery ${beforeChild?'before':'after'} child-start requires metadata`,async()=>{
  const {result,calls}=await replay(spawnOnlyTrace(beforeChild),{resume:{delay:700}});
  assert.equal(result.status,'observed-complete');
  assert.equal(calls.filter(c=>c.method==='thread/read').length,1);
  assert.equal(result.trace.actors[1].acquisition_basis,'spawn-metadata');
 });
 for(const resume of[{parent:'foreign'},{ephemeral:false},{cwd:'/'},{reject:true}]) {
  test(`spawn-only metadata ${JSON.stringify(resume)} cannot attribute a child (${beforeChild})`,async()=>{
   const {result}=await replay(spawnOnlyTrace(beforeChild),{resume:{...resume,delay:50}});
   assert.equal(result.status,'stopped');
   assert.equal(result.trace.observed_children,0);
   assert.equal(result.messages.some(m=>m.role==='helper'),false);
   assert.equal(result.cleanup.status,'unconfirmed');
  });
 }
}

test('spawn completion only proposes identity and cannot attribute early child events',()=>{
 const tracker=makeTracker();
 tracker.event(event('item/started','p',{...spawn,status:'inProgress'}));
 tracker.event(event('item/completed','p',spawn));
 tracker.event(event('turn/started','c',turn('c')));
 tracker.event(usage('c'));
 assert.equal(tracker.children.size,0);
 assert.equal(tracker.report().actors.length,1);
 tracker.confirmActivityChild('c');
 assert.equal(tracker.report().actors[1].acquisition_basis,'spawn-metadata');
});
