// New contract version. Historical v1/v2 fixtures and outcomes remain immutable.
import {docFixture as v2} from './real-doc-check-fixture-v2.mjs';

const ownKeys='Reflect.ownKeys(options).some(key => Object.prototype.propertyIsEnumerable.call(options, key) && key !== "files")';
const chainKeys=`hasForbiddenOptionKey(options)`;
const helper=String.raw`
function hasForbiddenOptionKey(options) {
  for (let current = options; current !== null; current = Object.getPrototypeOf(current)) {
    for (const key of Reflect.ownKeys(current)) {
      if (key !== "files" && Object.prototype.propertyIsEnumerable.call(current, key)) return true;
    }
  }
  return false;
}
`;
function correct(source) {
  if (source.split(ownKeys).length !== 2) throw Error('v2-reference-shape-drift');
  return source.replace('async function selectedMarkdownFiles',helper+'\nasync function selectedMarkdownFiles').replace(ownKeys,chainKeys);
}

// This contract is supplied identically to every participant and blind reviewer.
export const acceptanceContract=String.raw`

## V3 acceptance boundaries (authoritative clarification)

This section resolves ambiguous terms above for this benchmark version. Test and
review against this contract, not additional hardening requirements.

- Options are ordinary, stable JavaScript data objects, possibly frozen or with a
  finite prototype chain (including null prototypes). A forbidden option key is
  any enumerable own property at ANY level of that chain whose key is not the
  string "files". This includes string and Symbol keys, even if shadowed by a
  nearer non-enumerable property. Reject with TypeError without reading forbidden
  property values. Non-enumerable metadata at any level is allowed. Resolve files
  by normal property lookup: inherited and non-enumerable files are supported;
  nearest files wins, including undefined (whole-tree mode).
- Invalid option containers (null, arrays, primitives and functions) reject with
  TypeError. After key validation, files must be undefined or a normal Array using
  standard element/iteration behavior. Validate ALL element types before root or
  selection filesystem access. A hole reads as undefined and rejects TypeError;
  boxed strings, empty strings, NUL and backslashes reject without coercion. Extra
  array metadata is ignored. Inputs must remain unchanged. A valid empty files
  array returns [] without resolving or reading the root.
- Supplied roots are ordinary string paths on the host POSIX filesystem; omitted
  root keeps the accepted module-relative default. For nonempty selection, failure
  to resolve/read a missing or invalid root is an I/O rejection (no required error
  code). After valid root resolution, invalid selected paths reject DOC_SELECTION.
  With several invalid selections, the choice/message of the failing path is not
  constrained. All selected path validation precedes parsing any selected source.
  No exact wording is required for module errors beyond specified type/code.
- Root .git/ and node_modules/ exclusions are applied to the normalized lexical
  root-relative selected source path, not to the realpath target. Nested folders
  with those names are allowed. A permitted in-root alias can target an excluded
  folder; it is still checked under the alias path. Realpath containment separately
  prevents leaving the root. Multiple lexical aliases to one inode remain distinct.
  Normalize . and .. lexically before lookup; no filesystem existence requirement
  applies to path segments eliminated by normalization. Normalized output and
  deduplication use case-sensitive strings even on a case-insensitive host.
- Preserve the supplied link extraction and target-resolution semantics, including
  repeated targets, percent decoding and malformed percent escapes rejecting.
  A linked directory or outside-root target is allowed; never recurse into it.
  Whole-tree behavior retains the helper's traversal/exclusions and symlink rules.
- CLI validation happens before running checks; options are separate tokens only.
  Both --file/--root orderings use the final root. Error output is one line: flatten
  CR/LF embedded in path/error text; do not expose stacks. Success and broken-link
  output retain the exact format above. No exact explanatory error wording beyond
  the specified prefix is required. CLI --file does not provide empty-array mode.
- Proxies, accessor side effects, custom iterators, exotic host objects, concurrent
  input mutation, filesystem races and resource exhaustion are outside this task.
  Do not invent acceptance tests for them. This exclusion is not a production
  security claim. Tests of in-scope inputs must pass both compliant implementations
  and the contract; a test is not authoritative merely because an AI wrote it.
`;

export const reviewRubric=' Read the V3 acceptance boundaries in SPEC.md before judging. Report each failing in-scope requirement with a concrete reproduction and the exact contract clause. Do not impose behavior for excluded exotic inputs, a preferred implementation style, exact module error wording, or unspecified precedence. Meaningful tests must assert contract behavior, not undocumented implementation details. Preserve an explicit fail when an in-scope defect exists; do not waive failures to finish the experiment.';

const tests=String.raw`
test('v3 all prototype levels reject enumerable string and Symbol keys including shadowing', async t => {
  const {root}=await fixture(t);
  for (const key of ['extra',Symbol('extra')]) {
    for (const depth of [0,1,3]) {
      let options={files:[],[key]:true};
      for (let i=0;i<depth;i++) options=Object.create(options);
      await assert.rejects(findBrokenLinks(root,options),TypeError);
      if (depth) {
        Object.defineProperty(options,key,{value:false,enumerable:false});
        await assert.rejects(findBrokenLinks(root,options),TypeError);
      }
    }
  }
});
test('v3 hidden metadata and inherited files use normal nearest-property lookup', async t => {
  const {root}=await fixture(t);
  const parent=Object.create(null);
  Object.defineProperty(parent,'files',{value:[],enumerable:false});
  Object.defineProperty(parent,'metadata',{value:true,enumerable:false});
  Object.defineProperty(parent,Symbol('metadata'),{value:true,enumerable:false});
  const options=Object.freeze(Object.create(parent));
  assert.deepEqual(await findBrokenLinks(root,options),[]);
  const shadow=Object.create(parent);
  Object.defineProperty(shadow,'files',{value:undefined,enumerable:false});
  assert.deepEqual(await findBrokenLinks(root,shadow),await findBrokenLinks(root));
  const enumerable=Object.create({files:Object.freeze(['a.md'])});
  assert.deepEqual(await findBrokenLinks(root,enumerable),['a.md -> absent-a','a.md -> absent-a']);
});
test('v3 malformed containers and all elements reject before root access', async t => {
  const {root}=await fixture(t),missing=path.join(root,'missing-root');
  for (const options of [null,[],false,0,1n,Symbol('options'),()=>{},'x']) {
    await assert.rejects(findBrokenLinks(missing,options),TypeError);
  }
  for (const bad of [null,undefined,false,1,1n,{},new String('a.md'),'','x\0.md','x\\y.md']) {
    await assert.rejects(findBrokenLinks(missing,{files:['absent.md',bad]}),TypeError);
  }
  await assert.rejects(findBrokenLinks(missing,{files:new Array(2)}),TypeError);
  const files=[];files.metadata=true;
  assert.deepEqual(await findBrokenLinks(missing,Object.freeze({files:Object.freeze(files)})),[]);
  await assert.rejects(findBrokenLinks(missing,{files:['a.md']}),Error);
});
test('v3 lexical aliases retain identity and exclusions are not realpath exclusions', async t => {
  const {root,put}=await fixture(t);
  await put('.git/inner.md','[bad](absent)');
  await put('nested/.git/inner.md','[bad](absent)');
  await fs.symlink(path.join(root,'.git/inner.md'),path.join(root,'alias.md'));
  await fs.symlink(path.join(root,'a.md'),path.join(root,'other.md'));
  assert.deepEqual(await findBrokenLinks(root,{files:['alias.md','nested/.git/inner.md']}),['alias.md -> absent','nested/.git/inner.md -> absent']);
  assert.deepEqual(await findBrokenLinks(root,{files:['other.md','no-such-dir/../a.md','./a.md']}),['a.md -> absent-a','a.md -> absent-a','other.md -> absent-a','other.md -> absent-a']);
});
test('v3 all source validation precedes malformed-link parsing', async t => {
  const {root,put}=await fixture(t);
  await put('malformed.md','[bad](%zz)');
  await assert.rejects(findBrokenLinks(root,{files:['malformed.md','missing.md']}),e=>e.code==='DOC_SELECTION');
  await assert.rejects(findBrokenLinks(root,{files:['malformed.md']}),URIError);
});
test('v3 CLI failures with embedded newline remain one line and validate usage first', async t => {
  const {root,run}=await fixture(t);
  for (const args of [['--root',root,'--file','absent\nname.md'],['--bad\r\nflag'],['--root','missing','--invalid']]) {
    const r=run(args);assert.equal(r.error,undefined);assert.equal(r.status,2);assert.equal(r.stdout,'');
    assert.match(r.stderr,/^Documentation link check error: [^\r\n]+\n$/);
  }
});
`;

const referenceDoc=correct(v2.reference['src/doc-links.mjs']);
export const referenceBoundaryMutations=[
  {name:'empty-selection-reads-root',files:{'src/doc-links.mjs':referenceDoc.replace('  if (options.files.length === 0) return [];','')}},
  {name:'inherited-enumerable-key-ignored',files:{'src/doc-links.mjs':referenceDoc.replace('      '+chainKeys,'      '+ownKeys)}},
  {name:'symbol-keys-ignored',files:{'src/doc-links.mjs':referenceDoc.replace('Reflect.ownKeys(current)','Object.keys(current)')}},
  {name:'hidden-metadata-rejected',files:{'src/doc-links.mjs':referenceDoc.replace('key !== "files" && Object.prototype.propertyIsEnumerable.call(current, key)','key !== "files"')}},
  {name:'inherited-files-ignored',files:{'src/doc-links.mjs':referenceDoc.replace('if (options.files === undefined)','if (!Object.hasOwn(options, "files") || options.files === undefined)')}}
];
export const docFixture={
  ...v2,
  fixture_version:3,
  correction_basis:'WI-0272 contract disagreement; WI-0273 explicit whole-contract qualification. Historical v1/v2 remain unchanged.',
  spec:v2.spec+acceptanceContract,
  reference:{...v2.reference,'src/doc-links.mjs':referenceDoc},
  hiddenTests:v2.hiddenTests+tests,
  mutations:v2.mutations.map(m=>({name:m.name,files:{...m.files,'src/doc-links.mjs':correct(m.files['src/doc-links.mjs'])}}))
};
