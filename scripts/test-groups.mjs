import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const optional = new Set([
  "console-browser-contract", "control-plane-foundation", "control-plane-inbox", "control-plane-live",
  "control-plane-private-viewer", "github-control-plane", "local-observer-service", "optional-console-collector"
].map((name) => `test/${name}.test.mjs`));
const experiments = new Set([
  "context-capsule-ablation", "effectiveness-pilot", "effectiveness-pilot-v2", "representative-microservice-comparison",
  "representative-microservice-protocol", "validation-program", "wave-5b-analysis", "wave-5b-live-protocol"
].map((name) => `test/${name}.test.mjs`));
export const fastFiles = [
  "ci-scope", "doc-links", "evidence-git", "model", "npm-release-workflow", "publication-audit",
  "release-package", "skill-policy", "specifications", "test-groups"
].map((name) => `test/${name}.test.mjs`);

export function groupFor(file) {
  return optional.has(file) ? "optional" : experiments.has(file) ? "experiments" : "core";
}

export async function testInventory(target = root) {
  const entries = await fs.readdir(path.join(target, "test"), { recursive: true, withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && /\.test\.[cm]?js$/.test(entry.name))
    .map((entry) => path.relative(target, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"))
    .sort();
}

export function selectChangedTests(paths, inventory) {
  if (!paths?.length) return { mode: "full", reason: "No trustworthy change scope; run all tests.", files: inventory };
  const selected = new Set(fastFiles);
  for (const file of paths) {
    if (inventory.includes(file)) {
      for (const candidate of inventory) if (groupFor(candidate) === groupFor(file)) selected.add(candidate);
    } else if (/^(?:README(?:\.[\w-]+)?\.md|CONTRIBUTING\.md|CHANGELOG\.md|docs\/[^\r\n]+\.md)$/.test(file) && !file.split("/").includes("..")) {
      // Prose-only edits still run repository/package/link checks via verify:changed.
    } else {
      return { mode: "full", reason: `Shared, executable, state, deleted-test, or unclassified change: ${file}`, files: inventory };
    }
  }
  return { mode: "selected", reason: "Local editing selection; not behavioral-candidate or Release evidence.", files: [...selected].sort() };
}

export function changedPaths(target, base) {
  if (!base || base.startsWith("-")) throw new Error("An explicit Git comparison base is required.");
  const git = (args) => {
    const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
    if (result.status !== 0 || result.error) throw new Error("Git comparison failed; use the full suite.");
    return result.stdout;
  };
  const ancestor = git(["merge-base", base, "HEAD"]).trim();
  const tracked = git(["diff", "--name-only", "--no-renames", "-z", ancestor, "--"]);
  const untracked = git(["ls-files", "--others", "--exclude-standard", "-z"]);
  return [...new Set((tracked + untracked).split("\0").filter(Boolean))];
}

async function main(args) {
  const [group = "full", ...options] = args;
  const inventory = await testInventory();
  let selection;
  if (group === "changed") {
    const index = options.indexOf("--base");
    try { selection = selectChangedTests(changedPaths(root, index < 0 ? null : options[index + 1]), inventory); }
    catch (error) { selection = { mode: "full", reason: error.message, files: inventory }; }
  } else if (["core", "optional", "experiments", "fast", "full"].includes(group)) {
    selection = { mode: group, files: group === "fast" ? fastFiles : inventory.filter((file) => group === "full" || groupFor(file) === group) };
  } else throw new Error(`Unknown test group: ${group}`);
  if (!selection.files.length) throw new Error("Empty test selection is not verification.");
  if (options.includes("--list")) { console.log(JSON.stringify(selection, null, 2)); return; }
  console.log(`${selection.mode}: ${selection.files.length} test files. ${selection.reason ?? ""}`);
  // Preserve Node's full discovery semantics for the fallback and release suite.
  const result = spawnSync(process.execPath, ["--test", ...(selection.mode === "full" ? [] : selection.files)], { cwd: root, stdio: "inherit" });
  process.exitCode = result.error || result.signal ? 1 : result.status ?? 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
