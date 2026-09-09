// Coordinator-only synthetic controls. Never copy this module into subject roots.
const header = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n";

const smallSeed = {
  'src/page.mjs': `export function page(records, options = {}) {
  const limit = options.limit ?? 2;
  return {items: records.slice(0, limit), nextCursor: null};
}
`,
  'src/index.mjs': "export {page} from './page.mjs';\n",
};
const smallReference = {...smallSeed, 'src/page.mjs': `export function page(records, options = {}) {
  const limit = options.limit === undefined ? 2 : options.limit;
  if (!Number.isInteger(limit) || limit < 1 || limit > 5) throw new RangeError('limit');
  const sorted = records.filter(r => options.status === undefined || r.status === options.status)
    .slice().sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  let start = 0;
  if (options.cursor !== undefined) {
    const index = sorted.findIndex(r => r.id === options.cursor);
    if (index === -1) throw new RangeError('cursor');
    start = index + 1;
  }
  const items = sorted.slice(start, start + limit).map(r => ({...r}));
  return {items, nextCursor: start + items.length < sorted.length ? items.at(-1).id : null};
}
`};
const smallHidden = header + `import {page} from './src/index.mjs';
const row = (id, status = 'open') => ({id, status, label: id});
test('default orders before selecting', () => assert.deepEqual(page(['d','b','a','c'].map(x => row(x))), {items:[row('a'),row('b')],nextCursor:'b'}));
test('explicit limit', () => assert.equal(page(['a','b','c'].map(x => row(x)), {limit:1}).nextCursor, 'a'));
test('maximum limit', () => assert.equal(page(['a','b','c','d','e','f'].map(x => row(x)), {limit:5}).items.length, 5));
test('filter before pagination', () => assert.deepEqual(page([row('c'),row('a','closed'),row('b')],{status:'open',limit:1}),{items:[row('b')],nextCursor:'b'}));
test('cursor exclusive', () => assert.deepEqual(page([row('c'),row('a'),row('b')], {cursor:'a',limit:1}),{items:[row('b')],nextCursor:'b'}));
test('last page cursor null', () => assert.equal(page([row('a'),row('b')], {cursor:'a'}).nextCursor,null));
test('cursor at end produces empty', () => assert.deepEqual(page([row('a')],{cursor:'a'}),{items:[],nextCursor:null}));
test('unknown cursor rejected', () => assert.throws(() => page([row('a')],{cursor:'z'}),RangeError));
test('filtered out cursor rejected', () => assert.throws(() => page([row('a','closed'),row('b')],{status:'open',cursor:'a'}),RangeError));
test('empty input', () => assert.deepEqual(page([]),{items:[],nextCursor:null}));
test('empty filter', () => assert.deepEqual(page([row('a')],{status:'missing'}),{items:[],nextCursor:null}));
test('code unit id order', () => assert.deepEqual(page(['a','B','A','10','2'].map(x => row(x)),{limit:5}).items.map(r=>r.id),['10','2','A','B','a']));
test('invalid limits rejected', () => {for(const limit of [0,-1,6,1.5,'2',null,NaN,Infinity]) assert.throws(() => page([],{limit}),RangeError);});
test('does not mutate source array or row', () => {const input=[row('b'),row('a')]; const saved=structuredClone(input); const result=page(input); result.items[0].label='changed';assert.deepEqual(input,saved);});
test('pages cover each matching item once', () => {const input=['e','b','d','a','c'].map(x=>row(x));let cursor;const ids=[];for(let i=0;i<4;i++){const result=page(input,{limit:2,...(cursor===undefined?{}:{cursor})});ids.push(...result.items.map(r=>r.id));cursor=result.nextCursor;if(cursor===null)break;}assert.deepEqual(ids,['a','b','c','d','e']);});
`;

const csvReference = `export function parseCsv(text) {
  const rows = []; let row = [], value = '', quoted = false, closed = false, start = true;
  const field = () => {row.push(value);value='';closed=false;start=true;};
  const record = () => {field();rows.push(row);row=[];};
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (quoted) {
      if (c === '"') {if(text[i+1] === '"'){value+='"';i++;}else{quoted=false;closed=true;}}
      else value+=c;
      continue;
    }
    if (c === ',') {field();continue;}
    if (c === '\\n' || c === '\\r') {if(c==='\\r' && text[++i]!=='\\n')throw new Error('invalid csv');record();continue;}
    if (closed) throw new Error('invalid csv');
    if (c === '"') {if(!start)throw new Error('invalid csv');quoted=true;start=false;continue;}
    value+=c;start=false;
  }
  if(quoted)throw new Error('invalid csv');
  if(value!=='' || row.length || closed || !start)record();
  return rows;
}
`;
const featureSeed = {
  'src/csv.mjs': "export function parseCsv(text) { return text.trimEnd().split(/\\r?\\n/).map(line => line.split(',')); }\n",
  'src/catalog.mjs': `export function createCatalog(initial = []) {
  const rows = initial.map(row => ({...row}));
  return {list: () => rows.map(row => ({...row})), add: row => rows.push({...row})};
}
`,
  'src/import.mjs': `import {parseCsv} from './csv.mjs';
export function importInventory(catalog, text) {
  const rows=parseCsv(text).slice(1);
  for(const [sku,name,quantity] of rows) catalog.add({sku,name,quantity:Number(quantity)});
  return {imported: rows.length};
}
`,
};
const featureReference = {...featureSeed, 'src/csv.mjs': csvReference, 'src/import.mjs': `import {parseCsv} from './csv.mjs';
export function importInventory(catalog, text) {
  const rows=parseCsv(text);
  if(!rows.length || JSON.stringify(rows[0]) !== JSON.stringify(['sku','name','quantity']))throw new Error('invalid header');
  const seen=new Set(catalog.list().map(row=>row.sku));const pending=[];
  for(const fields of rows.slice(1)) {
    if(fields.length!==3)throw new Error('invalid fields');
    const [sku,name,raw]=fields;
    if(!/^[A-Z][A-Z0-9-]{0,15}$/.test(sku) || name.trim()==='' || !/^(0|[1-9][0-9]*)$/.test(raw))throw new Error('invalid row');
    const quantity=Number(raw);
    if(!Number.isSafeInteger(quantity) || quantity>1000000 || seen.has(sku))throw new Error('invalid row');
    seen.add(sku);pending.push({sku,name,quantity});
  }
  for(const row of pending)catalog.add(row);
  return {imported:pending.length};
}
`};
const featureHidden = header + `import {createCatalog} from './src/catalog.mjs';
import {importInventory} from './src/import.mjs';
const header='sku,name,quantity';
function imported(text) {const c=createCatalog();const r=importInventory(c,text);return {r,rows:c.list()};}
test('ordinary rows',()=>assert.deepEqual(imported(header+'\\nA,Apple,2\\nB,Berry,0'),{r:{imported:2},rows:[{sku:'A',name:'Apple',quantity:2},{sku:'B',name:'Berry',quantity:0}]}));
test('quoted comma',()=>assert.equal(imported(header+'\\nA,"Apple, red",2').rows[0].name,'Apple, red'));
test('escaped quote',()=>assert.equal(imported(header+'\\nA,"The ""Best""",2').rows[0].name,'The "Best"'));
test('quoted newline preserved',()=>assert.equal(imported(header+'\\nA,"two\\nlines",2').rows[0].name,'two\\nlines'));
test('CRLF records and final terminator',()=>assert.equal(imported(header+'\\r\\nA,Apple,2\\r\\n').rows.length,1));
test('header only empty import',()=>assert.deepEqual(imported(header+'\\n'),{r:{imported:0},rows:[]}));
test('preserve name whitespace',()=>assert.equal(imported(header+'\\nA,  Apple  ,2').rows[0].name,'  Apple  '));
test('quantity upper boundary',()=>assert.equal(imported(header+'\\nA,Apple,1000000').rows[0].quantity,1000000));
test('wrong headers',()=>{for(const value of ['', 'name,sku,quantity','sku,name,qty',' sku,name,quantity'])assert.throws(()=>imported(value));});
test('invalid quantities',()=>{for(const value of ['-1','1.2','01','+1','1e2','Infinity','1000001','',' 1'])assert.throws(()=>imported(header+'\\nA,Apple,'+value));});
test('invalid sku',()=>{for(const sku of ['','a','1A','A B','ABCDEFGHIJKLMNOPQ'])assert.throws(()=>imported(header+'\\n'+sku+',Apple,1'));});
test('empty names',()=>{for(const name of ['', '   ','""'])assert.throws(()=>imported(header+'\\nA,'+name+',1'));});
test('wrong field count and blank record',()=>{for(const row of ['A,Apple','A,Apple,1,extra',''])assert.throws(()=>imported(header+'\\n'+row+'\\n'));});
test('malformed quote placement',()=>{for(const row of ['A,"unfinished,1','A,App"le,1','A,"Apple"x,1'])assert.throws(()=>imported(header+'\\n'+row));});
test('lone CR separator rejected',()=>assert.throws(()=>imported(header+'\\rA,Apple,1')));
test('batch duplicate rolls back earlier valid row',()=>{const c=createCatalog();assert.throws(()=>importInventory(c,header+'\\nA,Apple,1\\nA,Another,2'));assert.deepEqual(c.list(),[]);});
test('existing duplicate is rejected atomically',()=>{const before=[{sku:'A',name:'Original',quantity:7}];const c=createCatalog(before);assert.throws(()=>importInventory(c,header+'\\nB,Berry,1\\nA,Replacement,2'));assert.deepEqual(c.list(),before);});
test('later invalid row rolls back',()=>{const c=createCatalog([{sku:'Z',name:'Old',quantity:3}]);const before=c.list();assert.throws(()=>importInventory(c,header+'\\nA,Apple,1\\nB,Berry,-1'));assert.deepEqual(c.list(),before);});
test('catalog defensive snapshots',()=>{const initial=[{sku:'A',name:'Apple',quantity:1}];const c=createCatalog(initial);initial[0].name='bad';const listed=c.list();listed[0].quantity=99;listed.push({});assert.deepEqual(c.list(),[{sku:'A',name:'Apple',quantity:1}]);});
`;

const bugSeed = {
  'src/stock.mjs': `export function createStock(initial) {
  const remaining=new Map(Object.entries(initial));
  return {
    available: sku => remaining.get(sku) ?? 0,
    take(sku, quantity) {const old=remaining.get(sku) ?? 0;if(old<quantity)throw new Error('insufficient stock');remaining.set(sku,old-quantity);},
    restore(sku, quantity) {remaining.set(sku,(remaining.get(sku) ?? 0)+quantity);},
  };
}
`,
  'src/reserve.mjs': `export function createReservations(stock, persist) {
  const completed=new Map();
  return {async reserve(request) {
    if(completed.has(request.key))return {...completed.get(request.key)};
    stock.take(request.sku,request.quantity);
    const result={key:request.key,sku:request.sku,quantity:request.quantity};
    await persist({...result});
    completed.set(request.key,result);
    return {...result};
  }};
}
`,
};
const bugReference = {...bugSeed, 'src/reserve.mjs': `export function createReservations(stock, persist) {
  const entries=new Map();
  return {async reserve(request) {
    const {key,sku,quantity}=request;
    if(typeof key!=='string' || !key.length || typeof sku!=='string' || !sku.length || !Number.isInteger(quantity) || quantity<1)throw new Error('invalid request');
    const prior=entries.get(key);
    if(prior) {
      if(prior.sku!==sku || prior.quantity!==quantity)throw new Error('key conflict');
      return {...await prior.promise};
    }
    let resolve,reject;
    const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
    entries.set(key,{sku,quantity,promise});
    let taken=false;
    try {
      stock.take(sku,quantity);taken=true;
      const result={key,sku,quantity};
      await persist({...result});
      resolve(result);
    } catch(error) {
      if(taken)stock.restore(sku,quantity);
      entries.delete(key);reject(error);
    }
    return {...await promise};
  }};
}
`};
const bugHidden = "import nodeTest from 'node:test';\nimport assert from 'node:assert/strict';\nconst test=(name,fn)=>nodeTest(name,{timeout:1000},fn);\n" + `import {createStock} from './src/stock.mjs';
import {createReservations} from './src/reserve.mjs';
const req=(key='one',sku='A',quantity=2)=>({key,sku,quantity});
function setup(persist=async()=>{}) {const stock=createStock({A:10,B:5});return {stock,service:createReservations(stock,persist)};}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
test('ordinary reservation',async()=>{const {stock,service}=setup();assert.deepEqual(await service.reserve(req()),req());assert.equal(stock.available('A'),8);});
test('sequential retry has one side effect',async()=>{let calls=0;const {stock,service}=setup(async()=>{calls++;});await service.reserve(req());await service.reserve(req());assert.equal(calls,1);assert.equal(stock.available('A'),8);});
test('concurrent same request shares persistence',async()=>{const gate=deferred();let calls=0;const {stock,service}=setup(async()=>{calls++;await gate.promise;});const first=service.reserve(req());const second=service.reserve(req());gate.resolve();assert.deepEqual(await Promise.all([first,second]),[req(),req()]);assert.equal(calls,1);assert.equal(stock.available('A'),8);});
test('completed key conflicts on quantity',async()=>{const {stock,service}=setup();await service.reserve(req());await assert.rejects(service.reserve(req('one','A',3)));assert.equal(stock.available('A'),8);});
test('completed key conflicts on sku',async()=>{const {stock,service}=setup();await service.reserve(req());await assert.rejects(service.reserve(req('one','B',2)));assert.equal(stock.available('B'),5);});
test('pending key conflict rejected before completion',async()=>{const gate=deferred();const {stock,service}=setup(()=>gate.promise);const first=service.reserve(req());await assert.rejects(service.reserve(req('one','A',3)));gate.resolve();await first;assert.equal(stock.available('A'),8);});
test('persistence rejection restores and permits retry',async()=>{let calls=0;const {stock,service}=setup(async()=>{if(++calls===1)throw new Error('offline');});await assert.rejects(service.reserve(req()),/offline/);assert.equal(stock.available('A'),10);await service.reserve(req());assert.equal(calls,2);assert.equal(stock.available('A'),8);});
test('synchronous persistence throw restores',async()=>{const {stock,service}=setup(()=>{throw new Error('sync');});await assert.rejects(service.reserve(req()),/sync/);assert.equal(stock.available('A'),10);});
test('coalesced rejection restores once and all reject',async()=>{const gate=deferred();const {stock,service}=setup(()=>gate.promise);const first=service.reserve(req());const second=service.reserve(req());const settled=Promise.allSettled([first,second]);gate.reject(new Error('offline'));assert.deepEqual((await settled).map(r=>r.status),['rejected','rejected']);assert.equal(stock.available('A'),10);});
test('insufficient stock never persists or restores extra',async()=>{let calls=0;const {stock,service}=setup(async()=>{calls++;});await assert.rejects(service.reserve(req('one','A',11)));assert.equal(stock.available('A'),10);assert.equal(calls,0);});
test('failure does not permanently consume key',async()=>{const {stock,service}=setup();await assert.rejects(service.reserve(req('one','A',11)));assert.deepEqual(await service.reserve(req()),req());});
test('distinct requests proceed while one waits',async()=>{const gate=deferred();const {stock,service}=setup(r=>r.key==='one'?gate.promise:Promise.resolve());const first=service.reserve(req());assert.deepEqual(await service.reserve(req('two','B',1)),req('two','B',1));gate.resolve();await first;assert.equal(stock.available('B'),4);});
test('competing keys cannot oversell',async()=>{const gate=deferred();const {stock,service}=setup(()=>gate.promise);const first=service.reserve(req('one','A',8));await assert.rejects(service.reserve(req('two','A',3)));gate.resolve();await first;assert.equal(stock.available('A'),2);});
test('invalid quantities have no side effects',async()=>{let calls=0;const {stock,service}=setup(async()=>{calls++;});for(const q of [0,-1,1.5,'2',null,NaN,Infinity])await assert.rejects(service.reserve(req('key'+String(q),'A',q)));assert.equal(stock.available('A'),10);assert.equal(calls,0);});
test('invalid identifiers have no side effects',async()=>{const {stock,service}=setup();for(const r of [req(''),req(7),req('one',''),req('one',8)])await assert.rejects(service.reserve(r));assert.equal(stock.available('A'),10);});
test('caller mutation cannot poison remembered result',async()=>{const {service}=setup();const input=req();const first=await service.reserve(input);first.quantity=99;input.quantity=88;assert.deepEqual(await service.reserve(req()),req());});
test('persist mutation cannot poison result',async()=>{const {service}=setup(async r=>{r.quantity=99;});assert.deepEqual(await service.reserve(req()),req());});
`;

export const fixtures = [
  {
    id:'small', title:'Stable filtered cursor pagination',
    spec:`Implement page(records, options={}) exported from src/index.mjs. Records have unique nonempty string id plus flat scalar fields including status. Return {items, nextCursor}. Filter by exact options.status when supplied, sort by ascending JavaScript string/code-unit id, then select strictly after options.cursor when supplied. Cursor must identify a record in the filtered set or throw RangeError. Limit defaults to 2 only when undefined, and must be an integer from 1 to 5 inclusive; invalid limits throw RangeError even for empty records. nextCursor is the last returned id only when further matching records exist, otherwise null. Empty results use [] and null. Do not mutate inputs; returned rows must be shallow copies. Preserve the export and existing ordinary behavior. No persistence, dependencies, network, or UI is needed.`,
    seed:smallSeed,
    publicTests:{'test/page.test.mjs':header+`import {page} from '../src/index.mjs';
test('ordinary page',()=>assert.deepEqual(page([{id:'a',status:'open'}]),{items:[{id:'a',status:'open'}],nextCursor:null}));
test('empty page',()=>assert.deepEqual(page([]),{items:[],nextCursor:null}));
`},
    reference:smallReference, hiddenTests:smallHidden,
    mutations:[
      {name:'inclusive-cursor',files:{'src/page.mjs':smallReference['src/page.mjs'].replace('start = index + 1;', 'start = index;')}},
      {name:'alias-returned-rows',files:{'src/page.mjs':smallReference['src/page.mjs'].replace('.map(r => ({...r}))','')}},
      {name:'filter-after-pagination',files:{'src/page.mjs':smallReference['src/page.mjs'].replace('records.filter(r => options.status === undefined || r.status === options.status)','records').replace('sorted.slice(start, start + limit)','sorted.slice(start, start + limit).filter(r => options.status === undefined || r.status === options.status)')}},
    ],
  },
  {
    id:'feature', title:'Atomic CSV inventory import',
    spec:`Extend the existing createCatalog(initial=[]), parseCsv(text), and importInventory(catalog,text) modules to support atomic inventory imports. The header must be exactly sku,name,quantity in that order, without trimming. CSV uses commas, LF or CRLF record separators, optionally one final separator; quoted fields may contain commas, newlines and doubled quotes. Reject unterminated quotes, quotes inside unquoted fields, characters after a closing quote before a delimiter, and lone CR outside quotes. Every data record must contain exactly three fields; blank records are invalid. SKU must match /^[A-Z][A-Z0-9-]{0,15}$/ and be unique against existing catalog rows and within the batch. Name must be nonblank after trim but must be stored unchanged. Quantity is a canonical unsigned decimal integer (0 or nonzero digit followed by digits), at most 1000000; no whitespace, signs, leading zeroes or exponent notation. Any invalid input must throw and leave the complete catalog unchanged, including valid earlier rows in that batch. A valid header with no data is allowed. Success appends rows in input order and returns {imported: count}, with quantities as numbers. Catalog list() and initial rows remain defensively copied. Preserve existing named exports and simple valid imports. Tests use the supplied catalog and valid initial rows; distributed transactions and external storage are out of scope.`,
    seed:featureSeed,
    publicTests:{'test/import.test.mjs':header+`import {createCatalog} from '../src/catalog.mjs';
import {importInventory} from '../src/import.mjs';
test('simple import',()=>{const c=createCatalog();assert.deepEqual(importInventory(c,'sku,name,quantity\\nA,Apple,2'),{imported:1});assert.deepEqual(c.list(),[{sku:'A',name:'Apple',quantity:2}]);});
test('catalog snapshot',()=>{const c=createCatalog([{sku:'Z',name:'Old',quantity:3}]);c.list()[0].quantity=99;assert.equal(c.list()[0].quantity,3);});
`},
    reference:featureReference, hiddenTests:featureHidden,
    mutations:[
      {name:'naive-csv',files:{'src/csv.mjs':featureSeed['src/csv.mjs']}},
      {name:'partial-import-before-validation',files:{'src/import.mjs':featureReference['src/import.mjs'].replace('seen.add(sku);pending.push({sku,name,quantity});','seen.add(sku);pending.push({sku,name,quantity});catalog.add({sku,name,quantity});').replace('for(const row of pending)catalog.add(row);','')}},
      {name:'forget-existing-skus',files:{'src/import.mjs':featureReference['src/import.mjs'].replace('new Set(catalog.list().map(row=>row.sku))','new Set()')}},
    ],
  },
  {
    id:'bug', title:'Reservation retries lose stock or double charge inventory',
    spec:`Investigate and fix createReservations(stock,persist).reserve(request) in the existing in-memory modules. Users report missing stock after persistence outages and duplicate deductions when the same request is retried. Request is {key,sku,quantity}; key and sku must be nonempty strings and quantity a positive integer. Invalid requests reject without effects. A successful call returns exactly {key,sku,quantity}, deducts once and persists once. Repeated identical keys with identical sku/quantity, including concurrent calls while persistence is pending, share the same successful operation; all callers get independent result objects. Reusing an in-flight or successful key with different sku or quantity must reject without effects. If stock.take or persist fails (including a synchronous persist throw), all coalesced callers reject; restore stock only if it was deducted, exactly once, and allow a subsequent retry of that key, even with changed fields. Stock must be reserved before awaiting persistence so different keys cannot oversell; unrelated keys must still progress while one persist is pending. Caller mutation of requests/results, and persist mutating its argument, must not poison stored results. Preserve createStock(initial), its available/take/restore methods, and existing module exports. Initial stock uses valid nonnegative integer quantities; persist is a supplied function returning a value or promise. No external storage, process restarts, persistent deduplication, timeout policy or API/UI is needed.`,
    seed:bugSeed,
    publicTests:{'test/reserve.test.mjs':header+`import {createStock} from '../src/stock.mjs';
import {createReservations} from '../src/reserve.mjs';
test('ordinary reservation',async()=>{const stock=createStock({A:5});const s=createReservations(stock,async()=>{});assert.deepEqual(await s.reserve({key:'one',sku:'A',quantity:2}),{key:'one',sku:'A',quantity:2});assert.equal(stock.available('A'),3);});
test('ordinary duplicate',async()=>{let calls=0;const stock=createStock({A:5});const s=createReservations(stock,async()=>{calls++;});await s.reserve({key:'one',sku:'A',quantity:2});await s.reserve({key:'one',sku:'A',quantity:2});assert.equal(calls,1);assert.equal(stock.available('A'),3);});
`},
    reference:bugReference, hiddenTests:bugHidden,
    mutations:[
      {name:'no-stock-rollback',files:{'src/reserve.mjs':bugReference['src/reserve.mjs'].replace('if(taken)stock.restore(sku,quantity);','')}},
      {name:'ignore-key-conflict',files:{'src/reserve.mjs':bugReference['src/reserve.mjs'].replace("if(prior.sku!==sku || prior.quantity!==quantity)throw new Error('key conflict');",'')}},
      {name:'deduct-after-persist',files:{'src/reserve.mjs':bugReference['src/reserve.mjs'].replace('stock.take(sku,quantity);taken=true;','').replace('await persist({...result});','await persist({...result});stock.take(sku,quantity);taken=true;')}},
    ],
  },
];
