#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function fail(message) {
  process.stderr.write(`Organization CLI bootstrap error: ${message}\n`);
  process.exitCode = 1;
}

function readBootstrap() {
  const lockPath = path.join(projectRoot, "temple.lock");
  let lock;
  try {
    lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  } catch (error) {
    throw new Error(`cannot read ${lockPath}: ${error.message}`);
  }
  const bootstrap = lock?.template?.bootstrap;
  if (bootstrap?.schema_version !== "temple.cli-bootstrap/v1") {
    throw new Error("temple.lock has no supported CLI bootstrap contract; upgrade the project installation");
  }
  if (!bootstrap.version || bootstrap.version !== lock.template.version) {
    throw new Error("CLI bootstrap version does not match temple.lock");
  }
  if (!bootstrap.package_spec || !bootstrap.package_spec.endsWith(`@${bootstrap.version}`)) {
    throw new Error("CLI bootstrap package source is not version-pinned");
  }
  return bootstrap;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function output(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || `${command} failed`);
  return result.stdout.trim();
}

try {
  const bootstrap = readBootstrap();
  if (process.argv[2] === "--bootstrap-info") {
    process.stdout.write(`${JSON.stringify(bootstrap, null, 2)}\n`);
  } else {
    const argumentsToTemple = process.argv.slice(2);
    const explicitCli = String(process.env.TEMPLE_CLI_PATH ?? "").trim();
    if (explicitCli) {
      const actualVersion = output(process.execPath, [explicitCli, "--version"]);
      if (actualVersion !== bootstrap.version) {
        throw new Error(`TEMPLE_CLI_PATH version ${actualVersion || "unknown"} does not match pinned version ${bootstrap.version}`);
      }
      process.exitCode = run(process.execPath, [explicitCli, ...argumentsToTemple]);
    } else {
      const packageSpec = bootstrap.repository_spec ?? bootstrap.package_spec;
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      process.exitCode = run(npm, ["exec", "--yes", `--package=${packageSpec}`, "--", "temple", ...argumentsToTemple]);
    }
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
