import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { buildPublicationAudit } from "../src/publication-audit.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const REQUIRED_PACKAGE_PATHS = [
  "LICENSE",
  "README.md",
  "README.ja.md",
  "README.zh-TW.md",
  "package.json",
  "bin/temple.mjs",
  "src/cli.mjs",
  "project-overlay/TEMPLE.md",
  "project-overlay/templew.mjs",
  "project-overlay/.ai-org/core/policies.json",
  "project-overlay/.agents/skills/temple-work/SKILL.md",
  "packs/build-quality/manifest.json",
  "docs/getting-started/testing.md"
];

export const FORBIDDEN_PACKAGE_PREFIXES = [
  ".ai-org/",
  ".agents/",
  ".codex/",
  ".github/",
  ".playwright-cli/",
  "examples/",
  "integrations/",
  "node_modules/",
  "output/",
  "scripts/",
  "test/"
];

const ALLOWED_TOP_LEVEL_FILES = new Set([
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "GOVERNANCE.md",
  "LICENSE",
  "README.ja.md",
  "README.md",
  "README.zh-TW.md",
  "SECURITY.md",
  "THIRD_PARTY_NOTICES.md",
  "package.json"
]);
const ALLOWED_TOP_LEVEL_DIRECTORIES = ["bin/", "docs/", "packs/", "project-overlay/", "src/"];
const MAX_FILE_COUNT = 400;
const MAX_UNPACKED_SIZE = 8 * 1024 * 1024;

export function validatePackageDryRun(pack) {
  const failures = [];
  if (!pack || typeof pack !== "object" || !Array.isArray(pack.files)) {
    return ["npm pack dry run did not return a package manifest"];
  }

  const paths = pack.files.map((entry) => String(entry.path ?? "")).filter(Boolean);
  const pathSet = new Set(paths);
  for (const requiredPath of REQUIRED_PACKAGE_PATHS) {
    if (!pathSet.has(requiredPath)) failures.push(`required package path is missing: ${requiredPath}`);
  }

  for (const pathname of paths) {
    const forbidden = FORBIDDEN_PACKAGE_PREFIXES.find((prefix) => pathname.startsWith(prefix));
    if (forbidden) failures.push(`forbidden package path is present: ${pathname}`);
    if (
      !ALLOWED_TOP_LEVEL_FILES.has(pathname) &&
      !ALLOWED_TOP_LEVEL_DIRECTORIES.some((prefix) => pathname.startsWith(prefix))
    ) {
      failures.push(`undeclared top-level package path is present: ${pathname}`);
    }
  }

  if (paths.length > MAX_FILE_COUNT) {
    failures.push(`package file count ${paths.length} exceeds the reviewed limit ${MAX_FILE_COUNT}`);
  }
  if (!Number.isFinite(pack.unpackedSize) || pack.unpackedSize > MAX_UNPACKED_SIZE) {
    failures.push(`package unpacked size ${pack.unpackedSize ?? "unknown"} exceeds the reviewed limit ${MAX_UNPACKED_SIZE}`);
  }
  return [...new Set(failures)];
}

export async function inspectPackageDryRun(packageRoot = root) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const { stdout } = await execFileAsync(
    npmCommand,
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { cwd: packageRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }
  );
  const result = JSON.parse(stdout);
  if (!Array.isArray(result) || result.length !== 1) throw new Error("npm pack dry run must describe exactly one package");
  return result[0];
}

export async function checkPackageBoundary(packageRoot = root) {
  const pack = await inspectPackageDryRun(packageRoot);
  const failures = validatePackageDryRun(pack);
  const publication = await buildPublicationAudit(packageRoot, {
    profileId: "public",
    surface: "package",
    filesBySurface: { package: pack.files.map((entry) => entry.path) }
  });
  if (publication.status === "blocked") {
    for (const finding of publication.surfaces[0].findings.filter((entry) => entry.classification === "blocked")) {
      failures.push(`public package evidence is blocked by ${finding.rule_id}: ${finding.path}:${finding.line}`);
    }
  }
  if (failures.length > 0) throw new Error(`Package boundary check failed:\n- ${failures.join("\n- ")}`);
  return pack;
}

async function main() {
  try {
    const pack = await checkPackageBoundary();
    console.log(
      `Package boundary verified: ${pack.files.length} files, ${pack.size} bytes packed, ${pack.unpackedSize} bytes unpacked.`
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
