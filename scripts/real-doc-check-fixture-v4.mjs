// V4 makes generated-test qualification explicit; v1/v2/v3 stay frozen.
import {docFixture as v3,referenceBoundaryMutations as priorFaults,reviewRubric as priorRubric} from './real-doc-check-fixture-v3.mjs';

const rootLine='  const realRoot = await fs.realpath(rootPath);';
const rootCheck='\n  if (!(await fs.stat(realRoot)).isDirectory()) throw new Error("Markdown root is not a directory");';
function correct(source){
  if(source.split(rootLine).length!==2)throw Error('v3-reference-shape-drift');
  return source.replace(rootLine,rootLine+rootCheck);
}
const clarification=String.raw`

## V4 root errors and generated tests

A nonempty selection requires an existing directory root (including a symlink to
a directory). Validate option/container and element types first, then the root,
then lexical/source selections, then parse sources. Empty selection skips root
validation. Root I/O failures have no constrained code value: tests must assert
rejection, not require or exclude a particular error code. DOC_SELECTION remains
required for invalid selected paths after a valid root. This preserves the V3
unspecified-root-code contract; the reference's chosen code is not an API promise.

Added tests may challenge the reference but do not amend this specification. A
failed reference run requires contract qualification: an assertion exceeding an
explicit boundary is a product-test defect to repair; an unresolved disagreement
or a reference defect stops the instrument. There is no automatic acceptance or
waiver of failed tests, and normal reference/mutation qualification must pass on
the repaired submission before final acceptance.
`;

const rootMatrix=String.raw`
test('v4 root states cross option validation, empty selection and selection precedence', async t => {
  const {area,root,put}=await fixture(t);
  await put('ok.md','');
  await fs.writeFile(path.join(area,'root-file'),'');
  await fs.symlink(root,path.join(area,'root-dir-link'));
  await fs.symlink(path.join(area,'root-file'),path.join(area,'root-file-link'));
  await fs.symlink(path.join(area,'absent-root'),path.join(area,'root-dangling'));
  await fs.symlink('root-loop',path.join(area,'root-loop'));
  const roots=[[root,true],['root-file',false],['absent-root',false],['root-dir-link',true],['root-file-link',false],['root-dangling',false],['root-loop',false],['root-file/child',false]];
  for(const [name,valid]of roots){
    const selectedRoot=path.isAbsolute(name)?name:path.join(area,name);
    assert.deepEqual(await findBrokenLinks(selectedRoot,{files:[]}),[]);
    await assert.rejects(findBrokenLinks(selectedRoot,null),TypeError);
    await assert.rejects(findBrokenLinks(selectedRoot,{files:['missing.md',null]}),TypeError);
    if(valid){
      assert.deepEqual(await findBrokenLinks(selectedRoot,{files:['ok.md']}),[]);
      await assert.rejects(findBrokenLinks(selectedRoot,{files:['../out.md']}),e=>e.code==='DOC_SELECTION');
      assert.deepEqual(await findBrokenLinks(selectedRoot,{}),await findBrokenLinks(root));
    }else{
      // Deliberately do not assert a root error code, including absence of one.
      for(const options of [{files:['ok.md']},{files:['../out.md']},{}])await assert.rejects(findBrokenLinks(selectedRoot,options),Error);
    }
  }
});
`;

export const reviewRubric=priorRubric+' V4 makes root error codes explicitly unconstrained. A REFERENCE_CHECK.json, when supplied, contains only failures from the candidate own added tests on the reference, not hidden acceptance or execution history. For a reference failure, decide whether ALL listed failing tests impose behavior beyond an explicit SPEC boundary. Only if so, return decision fail and findings reference_baseline=tests-exceed-contract, one reference_test=<exact test name> per listed test, and contract_basis=<verbatim SPEC substring of at least 12 characters> identifying the unsupported requirement; explain the reproduction and repair in the summary. If unresolved or a plausible in-scope reference defect, return blocked and reference_baseline=unresolved-reference-defect. Never return pass or waive an unqualified reference. No extra model calls are authorized.';
export const docFixture={...v3,fixture_version:4,spec:v3.spec+clarification,correction_basis:'WI-0274 generated-test/root-code disagreement; preserve historical outcomes; qualify assertions within existing blind review.',reference:{...v3.reference,'src/doc-links.mjs':correct(v3.reference['src/doc-links.mjs'])},hiddenTests:v3.hiddenTests+rootMatrix,mutations:v3.mutations.map(m=>({...m,files:{...m.files,'src/doc-links.mjs':correct(m.files['src/doc-links.mjs'])}}))};
export const referenceBoundaryMutations=[...priorFaults.map(m=>({...m,files:{...m.files,'src/doc-links.mjs':correct(m.files['src/doc-links.mjs'])}})),{name:'invalid-root-silently-accepted',files:{'src/doc-links.mjs':docFixture.reference['src/doc-links.mjs'].replace('throw new Error("Markdown root is not a directory")','return []')}}];
