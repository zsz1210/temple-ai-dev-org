// Revised contracts for this paired cohort only; historical fixtures stay intact.
import {fixtures as legacy} from './autonomy-fixtures.mjs';

const smallBoundary = `import test from 'node:test';
import assert from 'node:assert/strict';
import {page} from '../src/index.mjs';
const rows=[{id:'c',status:null},{id:'b',status:''},{id:'a',status:false},{id:'d',status:0}];
test('undefined options are omitted even when present',()=>{
  assert.deepEqual(page(rows,{status:undefined}),page(rows));
  assert.deepEqual(page(rows,{cursor:undefined}),page(rows));
  assert.deepEqual(page(rows,{limit:undefined}),page(rows));
});
test('defined falsy status values filter exactly',()=>{
  for(const value of [null,'',false,0])assert.deepEqual(page(rows,{status:value}).items,rows.filter(r=>r.status===value));
});
test('defined invalid cursors reject including empty filtered data',()=>{
  for(const cursor of [null,'',false,0,'missing']){
    assert.throws(()=>page(rows,{cursor}),RangeError);
    assert.throws(()=>page(rows,{cursor,status:'absent'}),RangeError);
  }
});
test('defined invalid limits never default',()=>{
  for(const limit of [null,'',false,0,-1,6,1.5,'2',NaN,Infinity])assert.throws(()=>page([],{limit}),RangeError);
});
`;
const featureBoundary = `import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv} from '../src/csv.mjs';
import {createCatalog} from '../src/catalog.mjs';
import {importInventory} from '../src/import.mjs';
test('CSV lexical boundaries preserve quoted CR and empty quoted fields',()=>{
  assert.deepEqual(parseCsv(''),[]);
  assert.deepEqual(parseCsv('""'),[['']]);
  assert.deepEqual(parseCsv('A,"x\\ry",0\\r\\n'),[['A','x\\ry','0']]);
  assert.throws(()=>parseCsv('A,x,0\\r'));
});
test('one final separator is allowed but an extra blank record rejects atomically',()=>{
  for(const end of ['','\\n','\\r\\n']){
    const c=createCatalog();assert.deepEqual(importInventory(c,'sku,name,quantity'+end),{imported:0});
  }
  const c=createCatalog([{sku:'OLD',name:'Old',quantity:1}]),before=c.list();
  assert.throws(()=>importInventory(c,'sku,name,quantity\\nA,New,2\\n\\n'));assert.deepEqual(c.list(),before);
});
`;
export const fixtures=legacy.filter(f=>['small','feature'].includes(f.id)).map(f=>({
  ...f,
  contract_revision:'paired-explicit-boundaries-v2',
  spec:f.spec+(f.id==='small'
    ? '\nExplicit option contract: status and cursor are omitted if and only if their value is undefined, including an own property explicitly set to undefined. Do not use property presence to distinguish these cases. Every defined status value, including null, empty string, false and zero, filters by ===. Every defined cursor value must equal a matching string id; null, empty string, false, zero and missing ids throw RangeError, including on empty filtered data. A null/empty/falsy limit is invalid, except undefined which defaults. Input domain: records is an ordinary array of ordinary flat records with unique nonempty string ids and scalar status values; options is an ordinary object with own optional status/cursor/limit properties, or undefined. Tests may use null, booleans, numbers and strings as option values. Prototype/accessor/proxy behavior and malformed record arrays are outside the contract; no validation or behavior for those inputs is required.'
    : '\nExplicit input contract: text is a string and catalog is the supplied createCatalog instance with valid ordinary initial rows. parseCsv returns an array of arrays of strings; empty text returns [], a quoted empty field produces an empty string field, and quoted CR or LF bytes are preserved. Quote and delimiter syntax is validated by parseCsv; header, row shape and inventory semantics are validated by importInventory. Empty text is an invalid import. Header-only input with zero or one final LF/CRLF is a valid zero-row import; an additional separator creates an invalid blank data record. Catalog list() returns fresh arrays and fresh shallow row copies. Arbitrary custom catalogs, malformed initial records, non-string text, prototypes, accessors and proxies are outside the contract. Do not invent requirements for out-of-domain inputs.'),
  publicTests:{...f.publicTests,'test/boundary.test.mjs':f.id==='small'?smallBoundary:featureBoundary}
}));
