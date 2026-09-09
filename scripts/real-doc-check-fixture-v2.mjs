// Versioned benchmark correction. Historical runners keep the unchanged v1 import.
import {docFixture as legacy} from './real-doc-check-fixture.mjs';

const oldKeys='Object.keys(options).some(key => key !== "files")';
const ownKeys='Reflect.ownKeys(options).some(key => Object.prototype.propertyIsEnumerable.call(options, key) && key !== "files")';
const oldArray='  if (!Array.isArray(options.files)) throw new TypeError("files must be an array");';
const elementCheck=String.raw`    if (typeof value !== "string" || value.length === 0 || value.includes("\0") || value.includes("\\")) throw new TypeError("Invalid file path");`;
function correct(source){
  for(const token of [oldKeys,oldArray,elementCheck])if(source.split(token).length!==2)throw Error('legacy-reference-shape-drift');
  return source.replace(oldKeys,ownKeys).replace(elementCheck,'').replace(oldArray,oldArray+'\n  for (const value of options.files) {\n'+elementCheck+'\n  }\n  if (options.files.length === 0) return [];');
}
const referenceDoc=correct(legacy.reference['src/doc-links.mjs']);
const boundaryTests=String.raw`
test('v2 empty selection performs no root filesystem validation', async t => {
  const {root} = await fixture(t);
  for (const selectedRoot of [root,path.join(root,'absent'),path.join(root,'a.md')]) {
    assert.deepEqual(await findBrokenLinks(selectedRoot,{files:[]}),[]);
  }
});
test('v2 enumerable own keys include Symbols but exclude non-enumerable metadata', async t => {
  const {root} = await fixture(t);
  for (const files of [undefined,[]]) {
    await assert.rejects(findBrokenLinks(root,{files,[Symbol('extra')]:true}),TypeError);
    await assert.rejects(findBrokenLinks(root,{files,extra:undefined}),TypeError);
  }
  const options={files:[]};
  Object.defineProperty(options,'metadata',{value:true,enumerable:false});
  Object.defineProperty(options,Symbol('metadata'),{value:true,enumerable:false});
  assert.deepEqual(await findBrokenLinks(root,options),[]);
});
test('v2 invalid array elements reject before any root lookup', async t => {
  const {root} = await fixture(t);
  for (const files of [[null],[''],['a\0.md'],['a\\b.md'],new Array(1)]) {
    await assert.rejects(findBrokenLinks(path.join(root,'absent'),{files}),TypeError);
  }
});
`;

export const referenceBoundaryMutations=[
  {name:'empty-selection-reads-root',files:{'src/doc-links.mjs':referenceDoc.replace('  if (options.files.length === 0) return [];','')}},
  {name:'enumerable-symbol-option-ignored',files:{'src/doc-links.mjs':referenceDoc.replace(ownKeys,oldKeys)}}
];
export const docFixture={
  ...legacy,
  fixture_version:2,
  correction_basis:'WI-0270 independently reproduced reference faults; seed, public requirements and historical fixture remain unchanged.',
  reference:{...legacy.reference,'src/doc-links.mjs':referenceDoc},
  hiddenTests:legacy.hiddenTests+boundaryTests,
  mutations:legacy.mutations.map(m=>({name:m.name,files:{...m.files,'src/doc-links.mjs':m.name==='empty-selection-falls-back-to-tree'?referenceDoc.replace('  if (options.files.length === 0) return [];','  if (options.files.length === 0) return null;'):correct(m.files['src/doc-links.mjs'])}}))
};
