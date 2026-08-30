import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DOCUMENT_ASSET = /^docs\/assets\/.*\.(?:gif|jpe?g|png|svg|webp)$/i;
const ROOT_DOCUMENT = /^(?:CODE_OF_CONDUCT|CONTRIBUTING|LICENSE|NOTICE)(?:\..+)?$/i;
const SHA = /^[0-9a-f]{40}$/i;

export function isDocumentationOnlyPath(candidate) {
  const normalized = candidate.replaceAll("\\", "/");
  return normalized.endsWith(".md") || ROOT_DOCUMENT.test(normalized) || DOCUMENT_ASSET.test(normalized);
}

export function classifyChangedPaths(paths) {
  const changed = [...new Set(paths.map((candidate) => candidate.trim()).filter(Boolean))];
  const nonDocumentationPaths = changed.filter((candidate) => !isDocumentationOnlyPath(candidate));
  return {
    changed,
    nonDocumentationPaths,
    scope: changed.length > 0 && nonDocumentationPaths.length === 0 ? "documentation-only" : "full"
  };
}

async function writeOutput(result) {
  if (!process.env.GITHUB_OUTPUT) return;
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `scope=${result.scope}\nrun_full_tests=${result.scope === "full"}\n`,
    "utf8"
  );
}

async function main() {
  if (process.env.CI_EVENT_NAME === "workflow_dispatch") {
    const result = classifyChangedPaths([]);
    console.log("CI scope: full (manual runs always execute the complete suite)");
    await writeOutput(result);
    return;
  }

  const base = process.env.CI_BASE_SHA ?? "";
  const head = process.env.CI_HEAD_SHA ?? "";
  if (!SHA.test(base) || !SHA.test(head) || /^0+$/.test(base)) {
    const result = classifyChangedPaths([]);
    console.log("CI scope: full (a safe comparison range was unavailable)");
    await writeOutput(result);
    return;
  }

  try {
    const { stdout } = await execFileAsync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACDMRTUXB", base, head],
      { cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), maxBuffer: 1024 * 1024 }
    );
    const result = classifyChangedPaths(stdout.split("\n"));
    console.log(`CI scope: ${result.scope} (${result.changed.length} changed path(s))`);
    if (result.nonDocumentationPaths.length > 0) {
      console.log(`Behavioral paths: ${result.nonDocumentationPaths.join(", ")}`);
    }
    await writeOutput(result);
  } catch (error) {
    const result = classifyChangedPaths([]);
    console.warn(`CI scope: full (change detection failed: ${error.message})`);
    await writeOutput(result);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
