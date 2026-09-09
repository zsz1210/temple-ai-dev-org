// Coordinator-only controls. Never copy references, hidden tests or mutants into actor roots.
const header = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n";
const store = `export function createInventory(initial = []) {
  let rows = [];
  const replace = next => {
    if (!Array.isArray(next)) throw new TypeError('rows');
    const seen = new Set();
    const copy = Array.from(next, row => {
      if (!row || !/^[A-Z][A-Z0-9-]{0,15}$/.test(row.id) || typeof row.id !== 'string' || seen.has(row.id) || !Number.isSafeInteger(row.quantity) || row.quantity < 0) throw new TypeError('row');
      seen.add(row.id); return {id:row.id, quantity:row.quantity};
    });
    rows = copy;
  };
  replace(initial);
  return {list: () => rows.map(row => ({...row})), replace};
}
`;
const validation = `export function validateMove(move) {
  if (!move || typeof move !== 'object' || Array.isArray(move) || typeof move.from !== 'string' || typeof move.to !== 'string' || !/^[A-Z][A-Z0-9-]{0,15}$/.test(move.from) || !/^[A-Z][A-Z0-9-]{0,15}$/.test(move.to) || move.from === move.to || !Number.isSafeInteger(move.quantity) || move.quantity < 1) throw new TypeError('move');
  return {from:move.from, to:move.to, quantity:move.quantity};
}
`;
const batchReference = {
  'src/inventory.mjs': store,
  'src/validation.mjs': validation,
  'src/batch.mjs': `import {validateMove} from './validation.mjs';
export function transferBatch(inventory, moves) {
  if (!Array.isArray(moves)) throw new TypeError('moves');
  const rows = inventory.list(); const byId = new Map(rows.map(row => [row.id,row]));
  let totalMoved = 0;
  for (const raw of moves) {
    const move = validateMove(raw); const from = byId.get(move.from), to = byId.get(move.to);
    if (!from || !to || from.quantity < move.quantity || !Number.isSafeInteger(to.quantity + move.quantity) || !Number.isSafeInteger(totalMoved + move.quantity)) throw new RangeError('balance');
    from.quantity -= move.quantity; to.quantity += move.quantity; totalMoved += move.quantity;
  }
  inventory.replace(rows);
  return {applied:moves.length, totalMoved, balances:inventory.list()};
}
`,
};
const batchSeed = {...batchReference, 'src/batch.mjs': `import {validateMove} from './validation.mjs';
export function transferBatch(inventory, moves) {
  let totalMoved = 0;
  for (const raw of moves) {
    const move = validateMove(raw); const rows = inventory.list();
    const from = rows.find(row => row.id === move.from), to = rows.find(row => row.id === move.to);
    if (!from || !to || from.quantity < move.quantity) throw new RangeError('balance');
    from.quantity -= move.quantity; to.quantity += move.quantity; totalMoved += move.quantity;
    inventory.replace(rows);
  }
  return {applied:moves.length,totalMoved,balances:inventory.list()};
}
`};
const batchImports = `import {createInventory} from './src/inventory.mjs';
import {validateMove} from './src/validation.mjs';
import {transferBatch} from './src/batch.mjs';
const initial = () => [{id:'A',quantity:10},{id:'B',quantity:0},{id:'C',quantity:1}];
const move = (from='A',to='B',quantity=2) => ({from,to,quantity});
`;
const batchHidden = header + batchImports + `
test('ordered chain can spend just received stock', () => {const inv=createInventory(initial()); assert.deepEqual(transferBatch(inv,[move('A','B',5),move('B','C',4)]),{applied:2,totalMoved:9,balances:[{id:'A',quantity:5},{id:'B',quantity:1},{id:'C',quantity:5}]});});
test('late insufficient balance rolls whole batch back', () => {const inv=createInventory(initial());assert.throws(()=>transferBatch(inv,[move(),move('A','C',99)]),RangeError);assert.deepEqual(inv.list(),initial());});
test('late invalid move rolls whole batch back', () => {const inv=createInventory(initial());assert.throws(()=>transferBatch(inv,[move(),move('A','B',0)]),TypeError);assert.deepEqual(inv.list(),initial());});
test('late missing endpoint rolls back', () => {const inv=createInventory(initial());assert.throws(()=>transferBatch(inv,[move(),move('B','MISSING',1)]),RangeError);assert.deepEqual(inv.list(),initial());});
test('order is significant and future receipts cannot fund earlier moves', () => {const inv=createInventory(initial());assert.throws(()=>transferBatch(inv,[move('B','C',1),move('A','B',2)]),RangeError);assert.deepEqual(inv.list(),initial());});
test('cumulative debits cannot overspend', () => {const inv=createInventory(initial());assert.throws(()=>transferBatch(inv,[move('A','B',6),move('A','C',5)]),RangeError);assert.deepEqual(inv.list(),initial());});
test('destination overflow is range error and atomic', () => {const rows=[{id:'A',quantity:3},{id:'B',quantity:Number.MAX_SAFE_INTEGER}];const inv=createInventory(rows);assert.throws(()=>transferBatch(inv,[move('A','B',1)]),RangeError);assert.deepEqual(inv.list(),rows);});
test('total moved overflow rejects even when balances fit', () => {const rows=[{id:'A',quantity:Number.MAX_SAFE_INTEGER},{id:'B',quantity:0}];const inv=createInventory(rows);assert.throws(()=>transferBatch(inv,[move('A','B',Number.MAX_SAFE_INTEGER),move('B','A',1)]),RangeError);assert.deepEqual(inv.list(),rows);});
test('empty batch succeeds without changing balances', () => {const inv=createInventory(initial());assert.deepEqual(transferBatch(inv,[]),{applied:0,totalMoved:0,balances:initial()});});
test('invalid batch containers are TypeError', () => {for(const bad of [null,undefined,{},'A',42]) assert.throws(()=>transferBatch(createInventory(initial()),bad),TypeError);});
test('quantity validation rejects coercion and unsafe values', () => {for(const quantity of [0,-1,1.1,'1',null,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>validateMove(move('A','B',quantity)),TypeError);});
test('endpoint validation rejects malformed and self moves', () => {for(const bad of [null,[],{},move('A','A'),move('a','B'),move(' A','B'),move('A',4),move('A','TOO-LONG-ID-1234567')])assert.throws(()=>validateMove(bad),TypeError);});
test('validateMove returns detached normalized object', () => {const raw={...move(),note:'ignore'};const result=validateMove(raw);assert.deepEqual(result,move());result.quantity=9;assert.equal(raw.quantity,2);});
test('batch leaves frozen move input and detached snapshots intact', () => {const rows=initial();const inv=createInventory(rows);const old=inv.list();const moves=Object.freeze([Object.freeze(move())]);const result=transferBatch(inv,moves);result.balances[0].quantity=99;rows[0].quantity=99;assert.equal(inv.list()[0].quantity,8);assert.deepEqual(old,initial());});
test('inventory replace invalid candidate is atomic', () => {const inv=createInventory(initial());assert.throws(()=>inv.replace([{id:'A',quantity:2},{id:'A',quantity:3}]),TypeError);assert.deepEqual(inv.list(),initial());});
test('sparse initial and replacement arrays are invalid and replacement stays atomic', () => {const sparse=Array(2);sparse[0]={id:'A',quantity:1};assert.throws(()=>createInventory(sparse),TypeError);const inv=createInventory(initial());assert.throws(()=>inv.replace(sparse),TypeError);assert.deepEqual(inv.list(),initial());});
test('inventory validates identifiers and quantities', () => {for(const row of [{id:'bad',quantity:1},{id:'A',quantity:-1},{id:'A',quantity:'2'},{id:'A',quantity:Infinity}])assert.throws(()=>createInventory([row]),TypeError);});
test('repeat moves and exact exhaustion retain row order', () => {const inv=createInventory(initial());assert.deepEqual(transferBatch(inv,[move('A','B',5),move('A','B',5)]),{applied:2,totalMoved:10,balances:[{id:'A',quantity:0},{id:'B',quantity:10},{id:'C',quantity:1}]});});
`;

const retryEngine = `export async function executeWithRetry(run, job, maxAttempts) {
  for (let attempt=1; attempt<=maxAttempts; attempt++) {
    try { return await run({key:job.key,value:job.value,attempt}); }
    catch (error) { if (error?.retryable !== true || attempt === maxAttempts) throw error; }
  }
}
`;
const runner = `import {executeWithRetry} from './retry.mjs';
export function createJobRunner({run, maxAttempts=3} = {}) {
  if (typeof run !== 'function') throw new TypeError('run');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) throw new RangeError('maxAttempts');
  const entries = new Map();
  return {
    submit(key,value) {
      if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(key) || typeof value !== 'string') return Promise.reject(new TypeError('job'));
      const previous=entries.get(key);
      if (previous) return previous.value === value ? previous.promise : Promise.reject(new Error('key conflict'));
      const entry={value,pending:true};
      entry.promise=Promise.resolve().then(()=>executeWithRetry(run,{key,value},maxAttempts)).then(result=>{entry.pending=false;return result;},error=>{entries.delete(key);throw error;});
      entries.set(key,entry); return entry.promise;
    },
    forget(key) {const entry=entries.get(key);if(!entry || entry.pending)return false;return entries.delete(key);},
  };
}
`;
const retryReference = {'src/retry.mjs':retryEngine,'src/runner.mjs':runner};
const retrySeed = {
  'src/retry.mjs': retryEngine.replace("error?.retryable !== true || ",''),
  'src/runner.mjs': `import {executeWithRetry} from './retry.mjs';
export function createJobRunner({run,maxAttempts=3} = {}) {
  if(typeof run !== 'function')throw new TypeError('run');
  if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>5)throw new RangeError('maxAttempts');
  const entries=new Map();
  return {
    async submit(key,value) {
      if(typeof key !== 'string'||!/^[A-Za-z0-9_-]{1,32}$/.test(key)||typeof value !== 'string')throw new TypeError('job');
      if(entries.has(key))return entries.get(key);
      const result=await executeWithRetry(run,{key,value},maxAttempts);
      entries.set(key,result);return result;
    },
    forget(key){return entries.delete(key);},
  };
}
`,
};
const retryImports = `import {createJobRunner} from './src/runner.mjs';
import {executeWithRetry} from './src/retry.mjs';
const transient = () => Object.assign(new Error('transient'),{retryable:true});
const deferred = () => {let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
`;
const retryHidden = header + retryImports + `
test('same in-flight key/value shares one execution', async () => {const gate=deferred();let calls=0;const r=createJobRunner({run:()=>{calls++;return gate.promise;}});const a=r.submit('job','v'),b=r.submit('job','v');gate.resolve('ok');assert.deepEqual(await Promise.all([a,b]),['ok','ok']);assert.equal(calls,1);});
test('different keys execute independently', async () => {const gates={a:deferred(),b:deferred()};let calls=0;const r=createJobRunner({run:({key})=>{calls++;return gates[key].promise;}});const a=r.submit('a','x'),b=r.submit('b','y');gates.b.resolve(2);assert.equal(await b,2);gates.a.resolve(1);assert.equal(await a,1);assert.equal(calls,2);});
test('success cached without additional callback', async () => {let calls=0;const r=createJobRunner({run:()=>++calls});assert.equal(await r.submit('a','x'),1);assert.equal(await r.submit('a','x'),1);assert.equal(calls,1);});
test('undefined success is cached', async () => {let calls=0;const r=createJobRunner({run:()=>{calls++;}});await r.submit('a','x');assert.equal(await r.submit('a','x'),undefined);assert.equal(calls,1);});
test('pending conflicting value rejects without affecting original', async () => {const gate=deferred();let calls=0;const r=createJobRunner({run:()=>{calls++;return gate.promise;}});const a=r.submit('a','x');const conflict=r.submit('a','y');gate.resolve(7);await assert.rejects(conflict,/key conflict/);assert.equal(await a,7);assert.equal(calls,1);});
test('fulfilled conflicting value rejects', async () => {const r=createJobRunner({run:()=>8});await r.submit('a','x');await assert.rejects(r.submit('a','y'),/key conflict/);});
test('retryable errors use numbered attempts and eventually succeed', async () => {const seen=[];const r=createJobRunner({run:job=>{seen.push(job);if(job.attempt<3)throw transient();return 'done';}});assert.equal(await r.submit('a','x'),'done');assert.deepEqual(seen,[1,2,3].map(attempt=>({key:'a',value:'x',attempt})));});
test('permanent failure is not retried and preserves error identity', async () => {let calls=0;const error=new Error('permanent');const r=createJobRunner({run:()=>{calls++;throw error;}});await assert.rejects(r.submit('a','x'),e=>e===error);assert.equal(calls,1);});
test('only boolean true opts in to retry', async () => {for(const retryable of [false,1,'true',undefined]){let calls=0;const error={retryable};const r=createJobRunner({run:()=>{calls++;return Promise.reject(error);}});await assert.rejects(r.submit('a','x'),e=>e===error);assert.equal(calls,1);}});
test('exhaustion stops at exact cap and preserves last error', async () => {let calls=0,last;const r=createJobRunner({maxAttempts:2,run:()=>{calls++;last=transient();throw last;}});await assert.rejects(r.submit('a','x'),e=>e===last);assert.equal(calls,2);});
test('failed entry is evicted and later submit starts fresh', async () => {let calls=0;const r=createJobRunner({maxAttempts:1,run:()=>{if(++calls===1)throw transient();return 9;}});await assert.rejects(r.submit('a','x'));assert.equal(await r.submit('a','new'),9);assert.equal(calls,2);});
test('coalesced callers share one retry sequence', async () => {const gate=deferred();let calls=0;const r=createJobRunner({run:async({attempt})=>{calls++;if(attempt===1){await gate.promise;throw transient();}return 'yes';}});const a=r.submit('a','x'),b=r.submit('a','x');gate.resolve();assert.deepEqual(await Promise.all([a,b]),['yes','yes']);assert.equal(calls,2);});
test('forget refuses pending entries and accepts fulfilled entries', async () => {const gate=deferred();let calls=0;const r=createJobRunner({run:()=>{calls++;return gate.promise;}});assert.equal(r.forget('none'),false);const first=r.submit('a','x');assert.equal(r.forget('a'),false);gate.resolve(2);await first;assert.equal(r.forget('a'),true);assert.equal(r.forget('a'),false);await r.submit('a','y');assert.equal(calls,2);});
test('invalid submit is asynchronous and causes no callback', async () => {let calls=0;const r=createJobRunner({run:()=>calls++});for(const [key,value] of [['','x'],['bad key','x'],['a'.repeat(33),'x'],[null,'x'],['a',4]]){let promise;assert.doesNotThrow(()=>{promise=r.submit(key,value);});await assert.rejects(promise,TypeError);}assert.equal(calls,0);});
test('constructor validates run and attempt bounds', () => {assert.throws(()=>createJobRunner(),TypeError);for(const maxAttempts of [0,6,1.5,'2',null,NaN])assert.throws(()=>createJobRunner({run:()=>1,maxAttempts}),RangeError);});
test('retry helper isolates each attempt and caller job', async () => {const job=Object.freeze({key:'a',value:'x'});let calls=0;const value=await executeWithRetry(arg=>{calls++;assert.deepEqual(arg,{key:'a',value:'x',attempt:calls});arg.value='changed';if(calls===1)throw transient();return calls;},job,2);assert.equal(value,2);assert.deepEqual(job,{key:'a',value:'x'});});
test('maxAttempts one and five are inclusive', async () => {for(const cap of [1,5]){let calls=0;await assert.rejects(executeWithRetry(()=>{calls++;throw transient();},{key:'a',value:''},cap));assert.equal(calls,cap);}});
test('prototype-shaped keys behave as ordinary keys', async () => {const r=createJobRunner({run:({value})=>value});assert.equal(await r.submit('__proto__','one'),'one');assert.equal(await r.submit('constructor','two'),'two');});
test('coalesced rejection evicts before rejection handlers resubmit', async () => {const gate=deferred();let calls=0;const error=new Error('failed');const r=createJobRunner({run:()=>++calls===1?gate.promise:'recovered'});const a=r.submit('a','x'),b=r.submit('a','x');const settled=Promise.allSettled([a,b]);gate.reject(error);const result=await settled;assert.ok(result.every(x=>x.status==='rejected'&&x.reason===error));assert.equal(await r.submit('a','y'),'recovered');assert.equal(calls,2);});
`;

export const fixtures = [
  {
    id:'batch', title:'Atomic ordered inventory transfer batches',
    spec:`# Goal
Implement atomic ordered transfer batches without dependencies, network or persistence. Existing public tests are only regressions; complete this contract and add meaningful durable tests in test/additional.test.mjs. Run node --test test/*.test.mjs and report evidence.

## Protected public API and technical brief
Keep these modules and exports. You may redesign internals, not signatures. src/inventory.mjs exports createInventory(initial = []), returning synchronous list() and replace(rows). Each row is {id,quantity}; id matches /^[A-Z][A-Z0-9-]{0,15}$/, unique; quantity is a nonnegative safe integer. Initial input and replacements must be arrays, validated completely before changing state; invalid data throws TypeError. Preserve row order. Store detached normalized rows (extra fields ignored); list always returns detached rows.
src/validation.mjs exports validateMove(move), returning a new normalized {from,to,quantity}. Endpoint IDs follow the same string syntax, must differ, quantity is a positive safe integer. Invalid move throws TypeError; do not coerce values or mutate input. Extra fields are ignored.
src/batch.mjs exports synchronous transferBatch(inventory,moves), accepting an inventory created above and an array of moves. Non-array throws TypeError. Process in input order: earlier receipts can fund later transfers, future receipts cannot. Repeated endpoints/moves are allowed. Missing endpoints, insufficient current source balance, destination safe-integer overflow or cumulative totalMoved overflow throw RangeError. Malformed moves throw TypeError. Any error leaves the ENTIRE inventory unchanged, including earlier valid moves. Never mutate moves or old snapshots. On success return {applied:moves.length,totalMoved:sum of all quantities,balances:detached final rows in original order}. Empty batch succeeds with zero counts. Preserve total stock and nonnegative balances. Exception message text is unspecified. Inventory owns storage, validation owns move shape and batch coordinates atomic behavior; choose the transaction algorithm yourself.
`,
    seed:batchSeed, reference:batchReference,
    publicTests:{'test/public.test.mjs':header+batchImports.replaceAll("'./src/","'../src/")+`test('existing single transfer',()=>{const inv=createInventory(initial());assert.equal(transferBatch(inv,[move()]).totalMoved,2);assert.equal(inv.list()[0].quantity,8);});\ntest('existing snapshot detachment',()=>{const inv=createInventory(initial());inv.list()[0].quantity=99;assert.equal(inv.list()[0].quantity,10);});\n`},
    hiddenTests:batchHidden,
    mutations:[
      {name:'partial-commit-before-late-error',files:{'src/batch.mjs':batchSeed['src/batch.mjs']}},
      {name:'zero-quantity-is-accepted',files:{'src/validation.mjs':validation.replace('move.quantity < 1','move.quantity < 0')}},
      {name:'cumulative-total-overflow-ignored',files:{'src/batch.mjs':batchReference['src/batch.mjs'].replace(' || !Number.isSafeInteger(totalMoved + move.quantity)','')}},
      {name:'returned-snapshots-alias-storage',files:{'src/inventory.mjs':store.replace('list: () => rows.map(row => ({...row}))','list: () => rows')}},
    ],
  },
  {
    id:'retry', title:'Coalesced asynchronous jobs with bounded retry and cache eviction',
    spec:`# Goal
Investigate and repair an asynchronous job runner: concurrent duplicate submissions currently repeat work and failures have incorrect retry/cache behavior. No dependencies, network, persistence or time-based backoff. Complete the API contract and add meaningful durable test/additional.test.mjs tests, including deterministic concurrency checks. Run node --test test/*.test.mjs and report evidence.

## Protected public API and technical brief
src/retry.mjs exports async executeWithRetry(run,job,maxAttempts). Inputs to this helper are valid: function run, {key,value} with strings, integer maxAttempts 1..5. Invoke run with a fresh {key,value,attempt} object each attempt; attempt starts at 1, cap is inclusive. Await values/promises and catch synchronous throws. Retry only when the thrown/rejected value has retryable === true. On non-retryable failure or exhaustion reject with that exact error value; success returns the exact result (undefined is valid). Do not mutate caller job. Callback mutation of an attempt object must not affect subsequent attempts. No delays or timers are necessary.
src/runner.mjs exports createJobRunner({run,maxAttempts=3} = {}), returning submit(key,value) and forget(key). Invalid run throws TypeError; maxAttempts outside integer 1..5 throws RangeError. submit ALWAYS returns a Promise: key must be a string matching /^[A-Za-z0-9_-]{1,32}$/, value any string; invalid args reject TypeError without invoking run. Same key AND same value submitted while pending coalesces into one execution/retry sequence (Promise object identity is not required). Different keys progress independently. Cache fulfilled outcomes, including undefined, so later same-key/same-value calls reuse result. Pending or fulfilled same-key/different-value calls reject Error('key conflict') without disturbing existing execution. Failed executions must be evicted before observing rejection so a subsequent submission, including a different value, starts a fresh attempt 1. forget(key) synchronously returns true only when deleting a fulfilled cached entry, false when missing or pending; it never cancels work. Special keys such as __proto__ are ordinary valid keys. Helper owns retry policy, runner owns identity/coalescing/cache lifecycle; choose internals yourself. Result objects need not be cloned. Cross-process durability, timeout and cancellation are out of scope.
`,
    seed:retrySeed, reference:retryReference,
    publicTests:{'test/public.test.mjs':header+retryImports.replaceAll("'./src/","'../src/")+`test('existing single success cached',async()=>{let calls=0;const r=createJobRunner({run:()=>++calls});assert.equal(await r.submit('a','x'),1);assert.equal(await r.submit('a','x'),1);assert.equal(calls,1);});\ntest('existing transient retry',async()=>{let calls=0;const r=createJobRunner({run:()=>{if(++calls===1)throw transient();return 8;}});assert.equal(await r.submit('a','x'),8);assert.equal(calls,2);});\n`},
    hiddenTests:retryHidden,
    mutations:[
      {name:'permanent-errors-retried',files:{'src/retry.mjs':retryEngine.replace('error?.retryable !== true || ','')}},
      {name:'one-extra-retry-attempt',files:{'src/retry.mjs':retryEngine.replace('attempt<=maxAttempts','attempt<=maxAttempts+1').replace('attempt === maxAttempts','attempt === maxAttempts+1')}},
      {name:'failed-promise-remains-cached',files:{'src/runner.mjs':runner.replace('entries.delete(key);throw error;','entry.pending=false;throw error;')}},
      {name:'in-flight-duplicate-is-not-coalesced',files:{'src/runner.mjs':runner.replace('if (previous) return','if (previous && !previous.pending) return')}},
    ],
  },
];
