// Coordinator-only fixture definitions. Never copy references, hidden tests or
// mutants into actor roots. Checkpoint verification is recorded by the caller.
const header = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n";
const discount = `export function discount(subtotal, amount) {
  if (![subtotal, amount].every(x => Number.isInteger(x) && x >= 0 && x <= 1000000000) || amount > subtotal) throw new TypeError('amount');
  return subtotal - amount;
}
`;
const quote = threshold => `import { discount } from './discount.mjs';
export function quote(subtotalCents, discountCents) {
  const discountedCents = discount(subtotalCents, discountCents);
  const shippingCents = discountedCents === 0 || discountedCents >= ${threshold} ? 0 : 500;
  return { subtotalCents, discountedCents, shippingCents, totalCents: discountedCents + shippingCents };
}
`;
const unfinished = `import { discount } from './discount.mjs';
export function quote(subtotalCents, discountCents) {
  discount(subtotalCents, discountCents);
  throw new Error('shipping integration unfinished');
}
`;
const editablePaths = ['src/quote.mjs', 'test/additional.test.mjs'];
function specification(threshold, revision) {
  return `# Current approved quote specification ${revision}

Implement the synchronous named export quote(subtotalCents, discountCents) in src/quote.mjs.
Both arguments must be integers from 0 to 1000000000 inclusive; discountCents must not exceed subtotalCents. Invalid arguments throw TypeError without coercion or modifying caller inputs. Missing arguments, non-numbers, non-finite values, fractions and out-of-range numbers are invalid.
Preserve the already accepted synchronous named export discount(subtotal, amount) in src/discount.mjs. It validates the same numeric constraints and returns subtotal minus amount. Apply discount BEFORE calculating shipping. Discounted zero ships free. Otherwise shipping is 500 cents unless discountedCents >= ${threshold} (inclusive), when shipping is zero.
Return exactly {subtotalCents, discountedCents, shippingCents, totalCents}, where totalCents is discountedCents plus shippingCents. Return an ordinary result object synchronously. No external dependencies or services.
Edit only src/quote.mjs and test/additional.test.mjs. Add meaningful durable regression tests in test/additional.test.mjs and run current tests before delivery. Preserve src/discount.mjs, supplied tests, package metadata and all documents/history. Historical evidence applies only to its recorded revision and test scope; it is not current candidate acceptance.
Read HANDOFF.md and CURRENT.json to understand the checkpoint. This is a small repository-only continuation fixture, with no previous actor conversation or arbitrary process interruption claim.
`;
}
const discountTests = header + `import { discount } from '../src/discount.mjs';
test('accepted discount subtracts and permits inclusive boundaries', () => {
  assert.equal(discount(3100, 200), 2900);
  assert.equal(discount(0, 0), 0);
  assert.equal(discount(1000000000, 0), 1000000000);
  assert.equal(discount(1000000000, 1000000000), 0);
});
test('accepted discount rejects invalid amounts without coercion', () => {
  for (const args of [[1,2],[-1,0],[1,-1],[1.1,0],[1,0.1],[1000000001,0],[1,'0'],['1',0],[null,0],[1,null],[],[1],[NaN,0],[Infinity,0]]) assert.throws(() => discount(...args), TypeError);
});
`;
const publicQuoteTests = threshold => header + `import { quote } from '../src/quote.mjs';
test('current inclusive shipping threshold', () => {
  assert.deepEqual(quote(${threshold}, 0), {subtotalCents:${threshold}, discountedCents:${threshold}, shippingCents:0, totalCents:${threshold}});
  assert.equal(quote(${threshold}, 1).shippingCents, 500);
});
`;
const hidden = threshold => header + `import { quote } from './src/quote.mjs';
const expected = (subtotalCents, discountCents) => {
  const discountedCents = subtotalCents - discountCents;
  const shippingCents = discountedCents === 0 || discountedCents >= ${threshold} ? 0 : 500;
  return {subtotalCents, discountedCents, shippingCents, totalCents: discountedCents + shippingCents};
};
test('threshold is inclusive and based on the discounted amount', () => {
  for (const args of [[${threshold}-1,0],[${threshold},0],[${threshold}+1,0],[${threshold},1],[${threshold}+200,200],[${threshold}+200,201],[3000,0],[5000,1]]) assert.deepEqual(quote(...args), expected(...args));
});
test('zero subtotal and fully discounted nonzero subtotal ship free', () => {
  for (const args of [[0,0],[1,1],[100,100],[1000000000,1000000000]]) assert.deepEqual(quote(...args), expected(...args));
});
test('valid inclusive maximum and positive low amounts retain exact totals', () => {
  for (const args of [[1,0],[499,1],[1000000000,0],[1000000000,1],[1000000000,999999999]]) assert.deepEqual(quote(...args), expected(...args));
});
test('deterministic interior vectors preserve discount then shipping', () => {
  for (let i=1; i<=24; i++) {
    const args=[${threshold}+i*17,i*29];
    assert.deepEqual(quote(...args), expected(...args));
  }
});
test('both amount positions reject invalid primitives and missing arguments', () => {
  for (const bad of [-1,1.1,1000000001,NaN,Infinity,-Infinity,'0',null,undefined,true,false,0n,Symbol('amount')]) {
    assert.throws(() => quote(bad,0), TypeError);
    assert.throws(() => quote(1000000000,bad), TypeError);
  }
  assert.throws(() => quote(), TypeError);
  assert.throws(() => quote(1), TypeError);
  assert.throws(() => quote(1,2), TypeError);
});
test('invalid objects reject without coercion or caller mutation', () => {
  let coercions=0;
  const value=Object.freeze({valueOf() { coercions++; return 0; }});
  for (const bad of [value,Object.freeze([]),Object.freeze({amount:0})]) {
    assert.throws(() => quote(bad,0), TypeError);
    assert.throws(() => quote(1,bad), TypeError);
  }
  assert.equal(coercions,0);
});
test('each result is synchronous, has the exact fields and does not affect later calls', () => {
  const first=quote(100,0);
  assert.equal(Object.getPrototypeOf(first),Object.prototype);
  assert.equal(first.then,undefined);
  assert.deepEqual(Reflect.ownKeys(first).sort(),['subtotalCents','discountedCents','shippingCents','totalCents'].sort());
  first.shippingCents=999;
  assert.deepEqual(quote(100,0),expected(100,0));
});
`;

function fixture(id) {
  const changed = id === 'changed-spec';
  const threshold = changed ? 5000 : 3000;
  const revision = changed ? 'v2' : 'v1';
  const remaining = changed
    ? 'Update the completed v1 quote implementation from threshold 3000 to the current v2 threshold 5000.'
    : 'Complete the unfinished quote shipping integration under the current v1 threshold 3000.';
  const referenceQuote = quote(threshold);
  const seed = {'src/discount.mjs':discount, 'src/quote.mjs':changed ? quote(3000) : unfinished};
  const historicalScope = changed ? ['test/discount.test.mjs','test/public.test.mjs'] : ['test/discount.test.mjs'];
  return {
    id,
    title:changed ? 'Continue after an approved shipping requirement change' : 'Cold takeover from a fixed partial-work checkpoint',
    spec:specification(threshold,revision),
    seed,
    reference:{'src/discount.mjs':discount,'src/quote.mjs':referenceQuote},
    publicTests:{'test/discount.test.mjs':discountTests,'test/public.test.mjs':publicQuoteTests(threshold)},
    hiddenTests:hidden(threshold),
    mutations:[
      {name:'threshold-is-exclusive',files:{'src/quote.mjs':referenceQuote.replace(`>= ${threshold}`,`> ${threshold}`)}},
      {name:'shipping-before-discount',files:{'src/quote.mjs':referenceQuote.replace(`discountedCents >= ${threshold}`,`subtotalCents >= ${threshold}`)}},
      {name:'zero-charged-shipping',files:{'src/quote.mjs':referenceQuote.replace('discountedCents === 0 || ','')}},
      {name:'quote-bypasses-accepted-validation',files:{'src/quote.mjs':referenceQuote.replace('discount(subtotalCents, discountCents)','subtotalCents - discountCents')}},
      ...(changed ? [{name:'historical-threshold-retained',files:{'src/quote.mjs':quote(3000)}}] : []),
    ],
    checkpointFiles:{
      'HANDOFF.md':`# Repository checkpoint handoff\n\n${remaining}\nCurrent authority: SPEC.md ${revision}. ${changed ? 'v2 explicitly supersedes historical v1.' : 'v1 remains current; quote is unfinished.'}\nCompleted and protected: src/discount.mjs and its supplied tests.${changed ? ' Historical v1 quote also passed its recorded old tests, but needs the authorized v2 change.' : ' No completed quote acceptance is claimed.'}\nHistorical revision, exact command and actual result are in history/verification-v1.json. Its scope is historical only (${historicalScope.join(', ')}); verify the new exact candidate against current requirements.\nRemaining: ${remaining} Add durable regression tests in test/additional.test.mjs and run current tests.\nEditable paths: src/quote.mjs and test/additional.test.mjs only. Preserve accepted discount, all supplied tests and documents/history. No active predecessor claim or unresolved business decision. There is no prior actor conversation to retrieve.\n`,
      'CURRENT.json':JSON.stringify({schema_version:'recovery-checkpoint/v1',scenario:id,authority:'SPEC.md',spec_revision:revision,shipping_threshold_cents:threshold,historical_authority:'history/SPEC-v1.md',historical_verification:'history/verification-v1.json',historical_scope:historicalScope,completed_protected:['src/discount.mjs','test/discount.test.mjs'],remaining,editable_paths:editablePaths,requires_new_candidate_verification:true,prior_actor_conversation:false},null,2)+'\n',
      'history/SPEC-v1.md':specification(3000,'v1'),
    },
    historicalFiles:{...seed,'SPEC.md':specification(3000,'v1')},
    historicalTests:{'test/discount.test.mjs':discountTests,...(changed ? {'test/public.test.mjs':publicQuoteTests(3000)} : {})},
    editablePaths:[...editablePaths],
  };
}

export const recoveryFixtures = [fixture('changed-spec'), fixture('cold-recovery')];
