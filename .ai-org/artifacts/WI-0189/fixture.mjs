// Coordinator-only fixture and objective oracle. Never mounted in actor context.
export const modules = ["validate", "summarize", "render"];
export const entry = 'import {validateSales} from "./validate.mjs";\nimport {summarizeSales} from "./summarize.mjs";\nimport {renderReport} from "./render.mjs";\nexport function generateReport(input){return renderReport(summarizeSales(validateSales(input)));}\n';
export const publicTests = `import test from "node:test";
import assert from "node:assert/strict";
import {generateReport} from "../report.mjs";
test("empty report",()=>assert.equal(generateReport([]),"# Sales report\\n\\nRows: 0\\nUnits: 0\\nRevenue: $0.00\\n\\n| Category | Units | Revenue |\\n| --- | ---: | ---: |\\n"));
test("example",()=>assert.equal(generateReport([{id:"b",category:"Books",unitCents:500,quantity:2},{id:"g",category:"Games",unitCents:205,quantity:1}]),"# Sales report\\n\\nRows: 2\\nUnits: 3\\nRevenue: $12.05\\n\\n| Category | Units | Revenue |\\n| --- | ---: | ---: |\\n| Books | 2 | $10.00 |\\n| Games | 1 | $2.05 |\\n"));
test("reject malformed input",()=>assert.throws(()=>generateReport(null),TypeError));
`;
export function seed(contract){
  return {
    "BRIEF.md":contract,"README.md":"# Sales report POC\nRead BRIEF.md and WORK.md. No dependencies or network.\n",
    "WORK.md":"Implement the fixed contract. Preserve supplied files. Your stage prompt defines owned implementation and test paths. Use apply_patch, one literal shell command per call, node --test, and Git. Commit implementation and tests before recording candidate_revision in DELIVERY.json and HANDOFF.md. A fresh verifier writes only VERIFICATION.json.\n",
    "package.json":'{"private":true,"type":"module"}\n',"report.mjs":entry,
    "validate.mjs":'export function validateSales(){throw new Error("Not implemented");}\n',
    "summarize.mjs":'export function summarizeSales(){throw new Error("Not implemented");}\n',
    "render.mjs":'export function renderReport(){throw new Error("Not implemented");}\n',
    "test/public.test.mjs":publicTests,
    ...Object.fromEntries(modules.map(n=>["test/"+n+"-added.test.mjs","// Add focused tests for "+n+".\n"]))
  };
}
export const reference = {
 "validate.mjs":`export function validateSales(input){
 if(!Array.isArray(input))throw new TypeError("array");
 const seen=new Set();
 return Array.from(input,row=>{
 if(!row||typeof row!=="object"||![Object.prototype,null].includes(Object.getPrototypeOf(row)))throw new TypeError("row");
 const {id,category,unitCents,quantity}=row;
 if(typeof id!=="string"||!/^[A-Za-z0-9_-]{1,32}$/.test(id)||seen.has(id)||typeof category!=="string"||!/^[A-Za-z][A-Za-z0-9 _-]{0,31}$/.test(category)||category.trim()!==category||!Number.isSafeInteger(unitCents)||unitCents<0||!Number.isSafeInteger(quantity)||quantity<1)throw new TypeError("fields");
 if(!Number.isSafeInteger(unitCents*quantity))throw new RangeError("overflow");
 seen.add(id);return {id,category,unitCents,quantity};
 });}`,
 "summarize.mjs":`const add=(a,b)=>{const n=a+b;if(!Number.isSafeInteger(n))throw new RangeError("overflow");return n;};
 export function summarizeSales(rows){let totalUnits=0,revenueCents=0;const groups=new Map();
 for(const r of rows){const revenue=r.unitCents*r.quantity;if(!Number.isSafeInteger(revenue))throw new RangeError("overflow");totalUnits=add(totalUnits,r.quantity);revenueCents=add(revenueCents,revenue);const g=groups.get(r.category)||{category:r.category,totalUnits:0,revenueCents:0};g.totalUnits=add(g.totalUnits,r.quantity);g.revenueCents=add(g.revenueCents,revenue);groups.set(r.category,g);}
 return {rowCount:rows.length,totalUnits,revenueCents,categories:[...groups.values()].sort((a,b)=>a.category<b.category?-1:a.category>b.category?1:0)};}`,
 "render.mjs":`const money=n=>"$"+Math.floor(n/100)+"."+String(n%100).padStart(2,"0");
 export function renderReport(s){return ["# Sales report","","Rows: "+s.rowCount,"Units: "+s.totalUnits,"Revenue: "+money(s.revenueCents),"","| Category | Units | Revenue |","| --- | ---: | ---: |",...s.categories.map(g=>"| "+g.category+" | "+g.totalUnits+" | "+money(g.revenueCents)+" |")].join("\\n")+"\\n";}`
};
export const oracle = `import test from "node:test";import assert from "node:assert/strict";
import {validateSales as v} from "./validate.mjs";
import {summarizeSales as s} from "./summarize.mjs";
import {renderReport as r} from "./render.mjs";
import {generateReport as g} from "./report.mjs";
const row=(extra={})=>({id:"a",category:"Books",unitCents:1,quantity:1,...extra});
const max=Number.MAX_SAFE_INTEGER;
test("validation, fresh objects, immutability, null prototype",()=>{
 const input=Object.freeze([Object.freeze({...row(),extra:9})]);const out=v(input);
 assert.deepEqual(out,[row()]);assert.notEqual(out,input);assert.notEqual(out[0],input[0]);
 assert.deepEqual(v([Object.assign(Object.create(null),row())]),[row()]);
 assert.deepEqual(v([]),[]);
 for(const x of [null,undefined,{},1,"",true])assert.throws(()=>v(x),TypeError);
 for(const x of [null,undefined,[],1,"",new Date(),Object.create({id:"a"}),{}])assert.throws(()=>v([x]),TypeError);
 for(const id of ["","a b","a".repeat(33),1,null,undefined])assert.throws(()=>v([row({id})]),TypeError);
 for(const category of [""," A","A ","1A","A|B","A".repeat(33),null,undefined,1])assert.throws(()=>v([row({category})]),TypeError);
 for(const unitCents of [-1,0.5,"1",null,undefined,NaN,Infinity,max+1])assert.throws(()=>v([row({unitCents})]),TypeError);
 for(const quantity of [0,-1,0.5,"1",null,undefined,NaN,Infinity,max+1])assert.throws(()=>v([row({quantity})]),TypeError);
 assert.throws(()=>v([row(),row()]),TypeError);
 assert.throws(()=>v([row({unitCents:max,quantity:2})]),RangeError);
 assert.equal(v([row({id:"_-A0",category:"A_b-C 0",unitCents:0})])[0].unitCents,0);
});
test("summary grouping, ASCII order and immutability",()=>{
 const rows=Object.freeze([Object.freeze(row({id:"1",category:"a",quantity:2})),Object.freeze(row({id:"2",category:"Z",unitCents:0})),Object.freeze(row({id:"3",category:"a",unitCents:3}))]);
 assert.deepEqual(s(rows),{rowCount:3,totalUnits:4,revenueCents:5,categories:[{category:"Z",totalUnits:1,revenueCents:0},{category:"a",totalUnits:3,revenueCents:5}]});
 assert.deepEqual(s([]),{rowCount:0,totalUnits:0,revenueCents:0,categories:[]});
 for(const rows of [[row({unitCents:max,quantity:2})],[row({unitCents:max}),row({id:"b"})],[row({unitCents:0,quantity:max}),row({id:"b",unitCents:0})],[row({unitCents:max}),row({id:"b",category:"Other"})]])assert.throws(()=>s(rows),RangeError);
});
test("render exact money, order, final newline, pure",()=>{
 for(const [n,m] of [[0,"0.00"],[1,"0.01"],[99,"0.99"],[100,"1.00"],[101,"1.01"],[max,"90071992547409.91"]]){
 const value=Object.freeze({rowCount:1,totalUnits:1,revenueCents:n,categories:Object.freeze([Object.freeze({category:"Z",totalUnits:1,revenueCents:n})])});
 assert.equal(r(value),"# Sales report\\n\\nRows: 1\\nUnits: 1\\nRevenue: $"+m+"\\n\\n| Category | Units | Revenue |\\n| --- | ---: | ---: |\\n| Z | 1 | $"+m+" |\\n");
 }
 const val={rowCount:2,totalUnits:2,revenueCents:0,categories:[{category:"z",totalUnits:1,revenueCents:0},{category:"A",totalUnits:1,revenueCents:0}]};assert.ok(r(val).indexOf("| z |")<r(val).indexOf("| A |"));
});
test("end-to-end frozen input",()=>{const a=Object.freeze([Object.freeze(row({quantity:2,unitCents:500})),Object.freeze(row({id:"b",category:"Games",unitCents:205}))]);assert.match(g(a),/Revenue: \\$12\\.05/);});
`;
