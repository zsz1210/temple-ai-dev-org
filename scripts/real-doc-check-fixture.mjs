// Coordinator-only: never copy reference, hidden acceptance or mutants into actor roots.
import {createHash} from 'node:crypto';
const baselineDoc = "import fs from \"node:fs/promises\";\nimport path from \"node:path\";\nimport process from \"node:process\";\nimport { fileURLToPath } from \"node:url\";\nimport { walkFiles } from \"../src/files.mjs\";\n\nconst root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), \"..\");\nconst EXTERNAL_LINK = /^(?:[a-z][a-z0-9+.-]*:|#)/i;\n\nexport function extractLocalLinks(markdown) {\n  const withoutCode = markdown\n    .replace(/```[\\s\\S]*?```/g, \"\")\n    .replace(/`[^`\\n]*`/g, \"\");\n  const targets = [];\n  for (const match of withoutCode.matchAll(/!?\\[[^\\]]*\\]\\((<[^>]+>|[^)\\s]+)(?:\\s+[\"'][^\"']*[\"'])?\\)/g)) {\n    const raw = match[1].startsWith(\"<\") ? match[1].slice(1, -1) : match[1];\n    if (!EXTERNAL_LINK.test(raw)) targets.push(raw);\n  }\n  return targets;\n}\n\nexport function resolveLocalLink(sourceFile, target) {\n  const withoutFragment = target.split(\"#\", 1)[0].split(\"?\", 1)[0];\n  if (!withoutFragment) return null;\n  return path.resolve(path.dirname(sourceFile), decodeURIComponent(withoutFragment));\n}\n\nexport async function findBrokenLinks(markdownRoot = root) {\n  const failures = [];\n  const markdownFiles = (await walkFiles(markdownRoot)).filter(\n    (candidate) =>\n      candidate.endsWith(\".md\") &&\n      !candidate.startsWith(\".git/\") &&\n      !candidate.startsWith(\"node_modules/\")\n  );\n\n  for (const relativeFile of markdownFiles) {\n    const sourceFile = path.join(markdownRoot, relativeFile);\n    const content = await fs.readFile(sourceFile, \"utf8\");\n    for (const target of extractLocalLinks(content)) {\n      const resolved = resolveLocalLink(sourceFile, target);\n      if (!resolved) continue;\n      try {\n        await fs.access(resolved);\n      } catch {\n        failures.push(`${relativeFile} -> ${target}`);\n      }\n    }\n  }\n\n  return failures;\n}\n\nasync function main() {\n  const failures = await findBrokenLinks();\n  if (failures.length > 0) {\n    console.error(`Documentation link checks failed:\\n- ${failures.join(\"\\n- \")}`);\n    process.exitCode = 1;\n    return;\n  }\n  console.log(\"Documentation link checks passed.\");\n}\n\nif (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {\n  await main();\n}\n";
const baselineFiles = "import crypto from \"node:crypto\";\nimport fs from \"node:fs/promises\";\nimport os from \"node:os\";\nimport path from \"node:path\";\n\nexport async function pathExists(targetPath) {\n  try {\n    await fs.access(targetPath);\n    return true;\n  } catch {\n    return false;\n  }\n}\n\nexport async function readJson(targetPath) {\n  const content = await fs.readFile(targetPath, \"utf8\");\n  try {\n    return JSON.parse(content);\n  } catch (error) {\n    throw new Error(`Invalid JSON in ${targetPath}: ${error.message}`);\n  }\n}\n\nexport function formatJson(value) {\n  return `${JSON.stringify(value, null, 2)}\\n`;\n}\n\nexport async function atomicWrite(targetPath, content) {\n  await fs.mkdir(path.dirname(targetPath), { recursive: true });\n  const temporaryPath = path.join(\n    path.dirname(targetPath),\n    `.temple-tmp-${process.pid}-${crypto.randomBytes(5).toString(\"hex\")}`\n  );\n  await fs.writeFile(temporaryPath, content, \"utf8\");\n  await fs.rename(temporaryPath, targetPath);\n}\n\nexport async function atomicCreate(targetPath, content) {\n  await fs.mkdir(path.dirname(targetPath), { recursive: true });\n  const temporaryPath = path.join(\n    path.dirname(targetPath),\n    `.temple-tmp-${process.pid}-${crypto.randomBytes(5).toString(\"hex\")}`\n  );\n  await fs.writeFile(temporaryPath, content);\n  try {\n    await fs.link(temporaryPath, targetPath);\n  } finally {\n    await fs.unlink(temporaryPath).catch((error) => {\n      if (error.code !== \"ENOENT\") throw error;\n    });\n  }\n}\n\nasync function syncDirectory(directoryPath) {\n  let handle;\n  try {\n    handle = await fs.open(directoryPath, \"r\");\n    await handle.sync();\n  } catch (error) {\n    if (![\"EINVAL\", \"ENOTSUP\", \"EPERM\", \"EISDIR\", \"EBADF\"].includes(error.code)) throw error;\n  } finally {\n    await handle?.close();\n  }\n}\n\nasync function writeAndSync(targetPath, content) {\n  const handle = await fs.open(targetPath, \"wx\", 0o600);\n  try {\n    await handle.writeFile(content);\n    await handle.sync();\n  } finally {\n    await handle.close();\n  }\n}\n\nexport async function durableAtomicWrite(targetPath, content) {\n  const directoryPath = path.dirname(targetPath);\n  await fs.mkdir(directoryPath, { recursive: true });\n  const temporaryPath = path.join(\n    directoryPath,\n    `.temple-durable-${process.pid}-${crypto.randomBytes(8).toString(\"hex\")}`\n  );\n  try {\n    await writeAndSync(temporaryPath, content);\n    await fs.rename(temporaryPath, targetPath);\n    await syncDirectory(directoryPath);\n  } finally {\n    await fs.unlink(temporaryPath).catch((error) => {\n      if (error.code !== \"ENOENT\") throw error;\n    });\n  }\n}\n\nexport async function durableAtomicCreate(targetPath, content) {\n  const directoryPath = path.dirname(targetPath);\n  await fs.mkdir(directoryPath, { recursive: true });\n  const temporaryPath = path.join(\n    directoryPath,\n    `.temple-durable-${process.pid}-${crypto.randomBytes(8).toString(\"hex\")}`\n  );\n  try {\n    await writeAndSync(temporaryPath, content);\n    await fs.link(temporaryPath, targetPath);\n    await syncDirectory(directoryPath);\n  } finally {\n    await fs.unlink(temporaryPath).catch((error) => {\n      if (error.code !== \"ENOENT\") throw error;\n    });\n  }\n}\n\nexport async function durableChmod(targetPath, mode) {\n  const handle = await fs.open(targetPath, \"r\");\n  try {\n    await handle.chmod(mode);\n    await handle.sync();\n  } finally {\n    await handle.close();\n  }\n}\n\nexport async function durableUnlink(targetPath) {\n  await fs.unlink(targetPath);\n  await syncDirectory(path.dirname(targetPath));\n}\n\nexport async function durableRename(sourcePath, targetPath) {\n  await fs.rename(sourcePath, targetPath);\n  await syncDirectory(path.dirname(targetPath));\n  if (path.dirname(sourcePath) !== path.dirname(targetPath)) await syncDirectory(path.dirname(sourcePath));\n}\n\nexport async function rollbackFileChanges(changes) {\n  const failures = [];\n  for (const change of [...changes].reverse()) {\n    try {\n      const exists = await pathExists(change.path);\n      if (change.afterHash === null) {\n        if (!exists) await atomicCreate(change.path, change.before);\n        else failures.push(`${change.path}: a new file blocks restoration`);\n        continue;\n      }\n      if (!exists) {\n        if (change.before !== null) await atomicCreate(change.path, change.before);\n        continue;\n      }\n      if ((await sha256File(change.path)) !== change.afterHash) {\n        failures.push(`${change.path}: content changed again after this operation wrote it`);\n        continue;\n      }\n      if (change.before === null) await fs.unlink(change.path);\n      else await atomicWrite(change.path, change.before);\n    } catch (error) {\n      failures.push(`${change.path}: ${error.message}`);\n    }\n  }\n  if (failures.length > 0) throw new Error(`Rollback could not safely restore every file:\\n- ${failures.join(\"\\n- \")}`);\n}\n\nexport async function walkFiles(root) {\n  const output = [];\n\n  async function visit(current) {\n    const entries = await fs.readdir(current, { withFileTypes: true });\n    entries.sort((left, right) => left.name.localeCompare(right.name));\n    for (const entry of entries) {\n      const absolute = path.join(current, entry.name);\n      if (entry.isDirectory()) {\n        await visit(absolute);\n      } else if (entry.isFile()) {\n        output.push(path.relative(root, absolute).split(path.sep).join(\"/\"));\n      }\n    }\n  }\n\n  await visit(root);\n  return output;\n}\n\nexport function sha256(content) {\n  return crypto.createHash(\"sha256\").update(content).digest(\"hex\");\n}\n\nexport async function sha256File(targetPath) {\n  return sha256(await fs.readFile(targetPath));\n}\n\nexport async function assertSafeTarget(inputPath) {\n  const target = path.resolve(inputPath);\n  const filesystemRoot = path.parse(target).root;\n  if (target === filesystemRoot || target === os.homedir()) {\n    throw new Error(`Refusing to initialize a broad target: ${target}`);\n  }\n\n  if (await pathExists(target)) {\n    const stat = await fs.stat(target);\n    if (!stat.isDirectory()) {\n      throw new Error(`Target is not a directory: ${target}`);\n    }\n  }\n\n  return target;\n}\n\nexport function toPosix(relativePath) {\n  return relativePath.split(path.sep).join(\"/\");\n}\n";

const sourceRevision = '613990dff640cbe30ed4e52460b832271c1f108d';
const hash = value => createHash('sha256').update(value).digest('hex');
const seedDoc = baselineDoc.replace('from "../src/files.mjs"', 'from "./files.mjs"');
const selection = String.raw`
async function selectedMarkdownFiles(markdownRoot, options) {
  if (!options || typeof options !== "object" || Array.isArray(options) ||
      Object.keys(options).some(key => key !== "files")) throw new TypeError("Invalid options");
  if (options.files === undefined) return null;
  if (!Array.isArray(options.files)) throw new TypeError("files must be an array");
  const rootPath = path.resolve(markdownRoot);
  const realRoot = await fs.realpath(rootPath);
  const selected = [];
  const invalid = value => Object.assign(new Error("Invalid selected Markdown file: " + value), {code: "DOC_SELECTION"});
  const inside = relative => relative !== "" && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
  for (const value of options.files) {
    if (typeof value !== "string" || value.length === 0 || value.includes("\0") || value.includes("\\")) throw new TypeError("Invalid file path");
    if (path.isAbsolute(value)) throw invalid(value);
    const absolute = path.resolve(rootPath, value);
    const relative = path.relative(rootPath, absolute);
    const normalized = relative.split(path.sep).join("/");
    if (!inside(relative) || !normalized.endsWith(".md") ||
        normalized.startsWith(".git/") || normalized.startsWith("node_modules/")) throw invalid(value);
    let realFile, stat;
    try { realFile = await fs.realpath(absolute); stat = await fs.stat(absolute); }
    catch { throw invalid(value); }
    if (!stat.isFile() || !inside(path.relative(realRoot, realFile))) throw invalid(value);
    selected.push(normalized);
  }
  return [...new Set(selected)].sort();
}
`;
const oldList = seedDoc.slice(seedDoc.indexOf('  const markdownFiles ='),seedDoc.indexOf('\n\n  for (const relativeFile'));
const newList = oldList.replace('  const markdownFiles = ', '  const selected = await selectedMarkdownFiles(markdownRoot, options);\n  const markdownFiles = selected ?? ');
let referenceDoc = seedDoc
  .replace('export async function findBrokenLinks(markdownRoot = root) {', selection + '\nexport async function findBrokenLinks(markdownRoot = root, options = {}) {')
  .replace(oldList,newList);
const cli = String.raw`async function main() {
  try {
    let markdownRoot = root;
    let rootSeen = false;
    let files;
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index++) {
      const flag = args[index];
      if (flag !== "--root" && flag !== "--file") throw new Error("Unknown argument: " + flag);
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("Missing value for " + flag);
      if (flag === "--root") {
        if (rootSeen) throw new Error("Duplicate --root");
        rootSeen = true;
        markdownRoot = path.resolve(value);
      } else {
        (files ??= []).push(value);
      }
    }
    const failures = await findBrokenLinks(markdownRoot, {files});
    if (failures.length > 0) {
      console.error("Documentation link checks failed:\n- " + failures.join("\n- "));
      process.exitCode = 1;
      return;
    }
    console.log("Documentation link checks passed.");
  } catch (error) {
    console.error("Documentation link check error: " + error.message.replace(/[\r\n]+/g, " "));
    process.exitCode = 2;
  }
}`;
referenceDoc = referenceDoc.slice(0,referenceDoc.indexOf('async function main()')) + cli +
  seedDoc.slice(seedDoc.indexOf('\n\nif (process.argv[1]'));
const spec = `# Selected Markdown checks for an existing documentation utility

The accepted local utility currently checks the whole documentation tree.
Extend it so a caller can check only explicitly selected Markdown source files,
useful when checking a small changed-file list. Choose your own implementation
and internal organization. This is an isolated adaptation of real Temple source;
it is not permission to modify Temple's installed production command.

Public module: src/doc-links.mjs. Preserve named exports extractLocalLinks(markdown)
and resolveLocalLink(sourceFile, target) and all existing parsing/resolution behavior.
Extend async findBrokenLinks(markdownRoot = projectRoot, options = {}) to accept
options.files. It still returns an array of strings "relative/source.md -> target".

With files omitted or undefined, preserve existing whole-tree behavior: use the
accepted walkFiles helper, check lowercase .md files, exclude root .git/ and
node_modules/, retain helper traversal order and source link order. Preserve
default project-root resolution relative to the module, not process.cwd().
A selected empty array checks nothing and returns [].

With files provided:
- Require an array of nonempty strings; reject other types, empty strings, NUL
  and backslashes with TypeError. Options must be a non-null non-array object
  with no enumerable keys except files; malformed options reject with TypeError.
- Paths are relative to markdownRoot (never process.cwd()); reject absolute paths.
  Resolve . and .. segments, then reject paths outside that root. Require a
  normalized lowercase .md extension, an existing regular file, and no root
  .git/ or node_modules/ prefix. Directories, missing files and invalid selection
  paths reject the entire promise with Error code DOC_SELECTION.
- Follow symlinks only when the final real file remains inside the real root;
  reject escapes through either file symlinks or directory symlinks. In-root file
  symlinks are valid. Root itself may be reached via a symlink. Deduplicate by
  normalized root-relative path (not by inode or realpath); do not mutate inputs.
- Check only selected sources, including their links to unselected files.
  Do not recursively check link targets. A linked target may be any existing
  file or directory; retain existing link resolution, including outside targets.
- Sort normalized selected source paths by JavaScript string ordering (.sort()),
  report forward-slash relative paths, and preserve source link order and duplicate
  broken links. A bad selection must reject rather than return partial findings.

CLI: node src/doc-links.mjs [--root DIR] [--file PATH ...].
--root appears at most once and accepts an absolute or cwd-relative root directory;
its default is the existing module-relative project root. Each --file adds one
selected path, resolved against the final root regardless of argument order.
No --file means whole-tree mode. Only these separate-token options are supported.
Reject unknown/positional arguments, repeated --root, missing or empty option
values, and a value beginning with --. No new dependencies or network calls.
Exit 0 prints exactly "Documentation link checks passed." plus newline to stdout,
with empty stderr. Broken links exit 1, empty stdout, and stderr exactly
"Documentation link checks failed:" followed by newline then "- " per finding
and a final newline. Usage, invalid selection or I/O errors exit 2, empty stdout,
and one explanatory stderr line beginning "Documentation link check error:".
CLI failure must not print a stack trace.

Edit only direct children matching src/doc-*.mjs (including new helpers or CLI
modules) and test/additional.test.mjs. Preserve src/files.mjs, supplied tests,
requirements, provenance and package metadata. Add meaningful durable regression
tests in test/additional.test.mjs. Tests may create temporary files only under
their owned cwd or TMPDIR, must clean them up, and may invoke Node only through
process.execPath with a bounded timeout. Run node --test test/*.test.mjs.
`;
const testHeader = String.raw`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {extractLocalLinks,resolveLocalLink,findBrokenLinks} from './src/doc-links.mjs';
const cli = fileURLToPath(new URL('./src/doc-links.mjs',import.meta.url));
async function fixture(t) {
  const area = await fs.mkdtemp(path.join(process.env.TMPDIR || os.tmpdir(), 'doc-selection-'));
  t.after(() => fs.rm(area,{recursive:true,force:true}));
  const root = path.join(area,'project');
  await fs.mkdir(root,{recursive:true});
  const put = async (name,body) => {
    const target = path.join(root,name);
    await fs.mkdir(path.dirname(target),{recursive:true});
    await fs.writeFile(target,body);
  };
  await put('a.md','[first](absent-a) [repeat](absent-a)\n');
  await put('nested/b.md','[second](missing-b)\n');
  await put('clean.md','[existing](nested/b.md#section) [dir](nested) [outside](../outside.md)\n');
  await put('ignored.MD','[ignored](absent)\n');
  await put('.git/hidden.md','[ignored](absent)\n');
  await put('node_modules/hidden.md','[ignored](absent)\n');
  await fs.writeFile(path.join(area,'outside.md'),'[outside](missing-outside)\n');
  return {area,root,put,run:args => spawnSync(process.execPath,[cli,...args],{cwd:area,encoding:'utf8',timeout:1500})};
}
`;
const historicalTests = String.raw`
test('accepted extraction skips code, schemes and fragments and retains local targets', () => {
  const md = '[one](a.md#x) ![image](<some image.png>) [web](https://example.com) [anchor](#x) [mail](mailto:x) ' +
    String.fromCharCode(96) + '[inline](skip.md)' + String.fromCharCode(96) + '\n' +
    String.fromCharCode(96).repeat(3) + '\n[code](skip.md)\n' + String.fromCharCode(96).repeat(3);
  assert.deepEqual(extractLocalLinks(md),['a.md#x','some image.png']);
});
test('accepted target resolution keeps decoding and source-relative semantics', () => {
  assert.equal(resolveLocalLink('/sample/docs/a.md','../space%20name.md?x=1#part'),path.resolve('/sample/space name.md'));
  assert.equal(resolveLocalLink('/sample/docs/a.md','#part'),null);
});
test('accepted whole tree preserves findings, order, exclusions and target semantics', async t => {
  const {root} = await fixture(t);
  assert.deepEqual(await findBrokenLinks(root),['a.md -> absent-a','a.md -> absent-a','nested/b.md -> missing-b']);
});
test('accepted whole tree does not traverse symbolic source entries', async t => {
  const {root,area} = await fixture(t);
  await fs.symlink(path.join(area,'outside.md'),path.join(root,'alias.md'));
  await fs.symlink(area,path.join(root,'directory-alias'));
  assert.deepEqual(await findBrokenLinks(root),['a.md -> absent-a','a.md -> absent-a','nested/b.md -> missing-b']);
});
test('accepted CLI default uses module-relative project root from a different cwd', async t => {
  const area = await fs.realpath(await fs.mkdtemp(path.join(process.env.TMPDIR || os.tmpdir(),'default-check-')));
  t.after(() => fs.rm(area,{recursive:true,force:true}));
  const projectRoot = path.join(area,'project'), directory = path.join(area,'cwd');
  await fs.mkdir(projectRoot); await fs.mkdir(directory);
  // Copy the entire product module tree so independently designed helpers work.
  // Each process scans only its own tree, never concurrently changing fixtures.
  await fs.cp(path.dirname(cli),path.join(projectRoot,'src'),{recursive:true});
  await fs.writeFile(path.join(projectRoot,'marker.md'),'[missing](unique-default-absent)');
  const result = spawnSync(process.execPath,[path.join(projectRoot,'src/doc-links.mjs')],{cwd:directory,encoding:'utf8',timeout:1500});
  assert.equal(result.error,undefined); assert.equal(result.status,1); assert.equal(result.stdout,'');
  assert.ok(result.stderr.includes('marker.md -> unique-default-absent'));
});
`;
const selectedTests = String.raw`
test('selected sources avoid unrelated failures and do not recurse into linked targets', async t => {
  const {root} = await fixture(t);
  assert.deepEqual(await findBrokenLinks(root,{files:['clean.md']}),[]);
  assert.deepEqual(await findBrokenLinks(root,{files:[]}),[]);
  assert.deepEqual(await findBrokenLinks(root,{}),await findBrokenLinks(root));
  assert.deepEqual(await findBrokenLinks(root,{files:undefined}),await findBrokenLinks(root));
});
test('selection normalizes, deduplicates, sorts source paths and preserves repeated links without mutation', async t => {
  const {root} = await fixture(t);
  const files = Object.freeze(['nested/./b.md','./a.md','nested/../a.md','nested/b.md']);
  const options = Object.freeze({files});
  assert.deepEqual(await findBrokenLinks(root,options),['a.md -> absent-a','a.md -> absent-a','nested/b.md -> missing-b']);
  assert.deepEqual(files,['nested/./b.md','./a.md','nested/../a.md','nested/b.md']);
});
test('selection rejects malformed options and file element types without coercion', async t => {
  const {root} = await fixture(t);
  for (const options of [null,[],1,'files',{extra:true},{files:'a.md'},{files:null}]) {
    await assert.rejects(findBrokenLinks(root,options),TypeError);
  }
  for (const value of ['',null,undefined,3,{},'a\\b.md','a\0.md']) {
    await assert.rejects(findBrokenLinks(root,{files:[value]}),TypeError);
  }
});
test('selection rejects missing, non-Markdown, directory, excluded and lexical outside paths', async t => {
  const {root,area,put} = await fixture(t);
  await put('plain.txt','text');
  await fs.mkdir(path.join(root,'folder.md'));
  await fs.writeFile(path.join(area,'project-adjacent.md'),'outside');
  for (const value of ['missing.md','plain.txt','ignored.MD','folder.md','.git/hidden.md',
    'nested/../node_modules/hidden.md','../outside.md',path.join(root,'a.md'),
    '../project-adjacent.md']) {
    await assert.rejects(findBrokenLinks(root,{files:['a.md',value]}),{code:'DOC_SELECTION'});
  }
});
test('selection rejects symlink escapes, accepts internal aliases and canonicalizes a symlinked root', async t => {
  const {root,area} = await fixture(t);
  await fs.symlink(path.join(area,'outside.md'),path.join(root,'escape.md'));
  await fs.symlink(area,path.join(root,'escape-dir'));
  await fs.symlink(path.join(root,'a.md'),path.join(root,'internal.md'));
  await fs.symlink(root,path.join(area,'root-alias'));
  for (const value of ['escape.md','escape-dir/outside.md']) {
    await assert.rejects(findBrokenLinks(root,{files:[value]}),{code:'DOC_SELECTION'});
  }
  assert.deepEqual(await findBrokenLinks(root,{files:['internal.md','a.md']}),[
    'a.md -> absent-a','a.md -> absent-a','internal.md -> absent-a','internal.md -> absent-a']);
  assert.deepEqual(await findBrokenLinks(path.join(area,'root-alias'),{files:['clean.md']}),[]);
});
test('CLI root selection, repeated files and option order produce exact status and streams', async t => {
  const {root,run} = await fixture(t);
  const good = run(['--file','clean.md','--root','project']);
  assert.equal(good.error,undefined); assert.equal(good.status,0);
  assert.equal(good.stdout,'Documentation link checks passed.\n'); assert.equal(good.stderr,'');
  const broken = run(['--file','nested/b.md','--root',root,'--file','./a.md','--file','a.md']);
  assert.equal(broken.error,undefined); assert.equal(broken.status,1); assert.equal(broken.stdout,'');
  assert.equal(broken.stderr,'Documentation link checks failed:\n- a.md -> absent-a\n- a.md -> absent-a\n- nested/b.md -> missing-b\n');
  const whole = run(['--root',root]);
  assert.equal(whole.status,1); assert.equal(whole.stderr,broken.stderr);
});
test('CLI invalid usage, selections and I/O produce explanatory errors without stacks', async t => {
  const {root,run} = await fixture(t);
  for (const args of [['--unknown'],['positional.md'],['--root'],['--file'],
    ['--root',''],['--file','--root',root],['--root',root,'--root',root],
    ['--root',root,'--file','missing.md'],['--root',root,'--file','../outside.md'],
    ['--root',root,'--file','.git/hidden.md'],['--root','missing-directory']]) {
    const result = run(args);
    assert.equal(result.error,undefined); assert.equal(result.status,2,JSON.stringify(args));
    assert.equal(result.stdout,''); assert.match(result.stderr,/^Documentation link check error: [^\n]+\n$/);
    assert.doesNotMatch(result.stderr,/\n\s+at /);
  }
});
`;
const hiddenTests = testHeader + historicalTests + selectedTests;
const publicTests = {'test/public.test.mjs':(testHeader+historicalTests).replaceAll("'./src/","'../src/")};
const provenance = {
  repository:'Temple AI Development Organization Framework',
  revision:sourceRevision,
  sources:[
    {path:'scripts/check-doc-links.mjs',sha256:hash(baselineDoc),adapted_path:'src/doc-links.mjs',adaptation:'Only change ../src/files.mjs import to ./files.mjs; retain module-relative project root.'},
    {path:'src/files.mjs',sha256:hash(baselineFiles),adapted_path:'src/files.mjs',adaptation:'None; accepted byte-for-byte source.'}
  ],
  claim:'Isolated attributed adaptation; not a deployed Temple command change or full project integration test.'
};
const docFixture = {
  id:'real-doc-check',
  title:'Continue a real documentation checker extension after interruption',
  spec,
  seed:{'src/doc-links.mjs':seedDoc,'src/files.mjs':baselineFiles},
  reference:{'src/doc-links.mjs':referenceDoc,'src/files.mjs':baselineFiles},
  publicTests,
  hiddenTests,
  mutations:[
    {name:'selected-files-ignored',files:{'src/doc-links.mjs':referenceDoc.replace('const markdownFiles = selected ?? ','const markdownFiles = ')}},
    {name:'normalized-duplicates-retained',files:{'src/doc-links.mjs':referenceDoc.replace('[...new Set(selected)].sort()','selected.sort()')}},
    {name:'selected-source-order-unsorted',files:{'src/doc-links.mjs':referenceDoc.replace('[...new Set(selected)].sort()','[...new Set(selected)]')}},
    {name:'empty-selection-falls-back-to-tree',files:{'src/doc-links.mjs':referenceDoc.replace('return [...new Set(selected)].sort();','return selected.length ? [...new Set(selected)].sort() : null;')}},
    {name:'symlink-escape-accepted',files:{'src/doc-links.mjs':referenceDoc.replace('!stat.isFile() || !inside(path.relative(realRoot, realFile))','!stat.isFile()')}}
  ],
  provenance,
  editablePrefixes:['src/doc-'],
  editableSuffix:'.mjs',
  editablePaths:['src/doc-links.mjs','test/additional.test.mjs'],
  editableContract:'Direct src/doc-*.mjs files and test/additional.test.mjs only; src/files.mjs and supplied files are protected.',
  treatmentFiles:{'README.md':'# Documentation checker specimen\n\nOriginal accepted source: Temple AI Development Organization Framework, revision '+sourceRevision+'.\n\n'+provenance.sources.map(s=>'- '+s.path+' -> '+s.adapted_path+'; SHA-256 '+s.sha256+'. '+s.adaptation).join('\n')+'\n\nRead SPEC.md for the approved extension. '+provenance.claim+'\n'},
};

export {docFixture};
