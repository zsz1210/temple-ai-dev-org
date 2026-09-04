#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CANDIDATE_REVISION = "a6849519c6067b2f73ca1a44d556faf7a5168b1d";
const ALPHA29_REVISION = "a3a28e7216652b04cfdc690e68bcb64b08fd5046";
const EXPECTED_VERSION = "0.1.0-alpha.30";

function parseArguments(argv) {
  const options = { output: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--output") options.output = path.resolve(argv[++index]);
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!options.output) throw new Error("--output is required");
  return options;
}

function run(command, args, options = {}) {
  const started = performance.now();
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  const elapsedMs = Math.round(performance.now() - started);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${options.label ?? command} failed with ${result.status}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`);
  }
  return { stdout: result.stdout, stderr: result.stderr, elapsed_ms: elapsedMs };
}

function json(step, label) {
  try {
    return JSON.parse(step.stdout);
  } catch (error) {
    throw new Error(`${label} did not return one JSON document: ${error.message}`);
  }
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

async function digestFiles(root, relativePaths) {
  const records = [];
  for (const relativePath of relativePaths) {
    records.push({ path: relativePath, sha256: sha256(await fs.readFile(path.join(root, relativePath))) });
  }
  return records;
}

function initConfig(projectId, projectName) {
  return {
    schema_version: "temple.init/v1",
    project: { id: projectId, name: projectName },
    naming_mode: "manual",
    agents: [
      { display_name: "Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Mira", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Theo", positions: ["tech_lead"] },
      { display_name: "Devon", positions: ["developer"] },
      { display_name: "Quinn", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

function testSummary(output) {
  const read = (label) => Number(output.match(new RegExp(`ℹ ${label} (\\d+)`))?.[1] ?? NaN);
  const summary = { tests: read("tests"), pass: read("pass"), fail: read("fail"), skipped: read("skipped") };
  assert.equal(Number.isFinite(summary.tests), true, "test count missing");
  assert.equal(summary.tests, summary.pass);
  assert.equal(summary.fail, 0);
  return summary;
}

function auditSummary(document) {
  const vulnerabilities = document.metadata?.vulnerabilities ?? {};
  return {
    vulnerabilities,
    dependencies: document.metadata?.dependencies ?? null
  };
}

async function addDetachedWorktree(root, revision) {
  run("git", ["worktree", "add", "--detach", root, revision], { cwd: REPOSITORY_ROOT, label: "git worktree add" });
  const actual = run("git", ["rev-parse", "HEAD"], { cwd: root }).stdout.trim();
  assert.equal(actual, revision);
  assert.equal(run("git", ["status", "--porcelain"], { cwd: root }).stdout, "");
}

function removeWorktree(root) {
  spawnSync("git", ["worktree", "remove", "--force", root], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8"
  });
}

async function qualify() {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-alpha30-package-"));
  const candidateRoot = path.join(temporaryRoot, "candidate");
  const alpha29Root = path.join(temporaryRoot, "alpha29");
  const packageDirectory = path.join(temporaryRoot, "packages");
  const consumerRoot = path.join(temporaryRoot, "consumer");
  const upgradeRoot = path.join(temporaryRoot, "upgrade-consumer");
  const timeline = [];

  try {
    await fs.mkdir(packageDirectory, { recursive: true });
    await addDetachedWorktree(candidateRoot, CANDIDATE_REVISION);

    const install = run("npm", ["ci", "--ignore-scripts"], { cwd: candidateRoot, label: "candidate npm ci" });
    timeline.push({ step: "candidate-install", status: "passed", elapsed_ms: install.elapsed_ms });

    const verify = run("npm", ["run", "verify"], { cwd: candidateRoot, label: "candidate verify" });
    const verifySummary = testSummary(`${verify.stdout}\n${verify.stderr}`);
    timeline.push({ step: "candidate-verify", status: "passed", elapsed_ms: verify.elapsed_ms });

    const browser = run("npm", ["run", "test:browser"], { cwd: candidateRoot, label: "candidate browser gate" });
    timeline.push({ step: "candidate-browser", status: "passed", elapsed_ms: browser.elapsed_ms });

    const schema = json(run(process.execPath, ["./templew.mjs", "schema", "validate", ".", "--json"], {
      cwd: candidateRoot,
      label: "candidate schema"
    }), "schema validation");
    assert.equal(schema.valid, true);

    const doctor = json(run(process.execPath, ["./templew.mjs", "doctor", ".", "--json"], {
      cwd: candidateRoot,
      label: "candidate Doctor"
    }), "candidate Doctor");
    assert.equal(doctor.summary.fail, 0);

    const productionAudit = json(run("npm", ["audit", "--omit=dev", "--json"], {
      cwd: candidateRoot,
      label: "production dependency audit"
    }), "production dependency audit");
    const completeAudit = json(run("npm", ["audit", "--json"], {
      cwd: candidateRoot,
      label: "complete dependency audit"
    }), "complete dependency audit");
    assert.equal(productionAudit.metadata.vulnerabilities.total, 0);
    assert.equal(completeAudit.metadata.vulnerabilities.total, 0);

    const publication = json(run(process.execPath, [
      "./templew.mjs", "publication", "audit", ".", "--profile", "public", "--surface", "both", "--json"
    ], { cwd: candidateRoot, label: "candidate publication audit" }), "candidate publication audit");
    assert.equal(publication.summary.blocked, 0);

    const packed = json(run("npm", [
      "pack", "--ignore-scripts", "--json", "--pack-destination", packageDirectory
    ], { cwd: candidateRoot, label: "candidate npm pack" }), "candidate npm pack");
    assert.equal(packed.length, 1);
    const pack = packed[0];
    assert.equal(pack.name, "@zsz1210/temple-ai-dev-org");
    assert.equal(pack.version, EXPECTED_VERSION);
    assert.equal(pack.files.some((entry) => entry.path === "LICENSE"), true);
    const packageJson = JSON.parse(await fs.readFile(path.join(candidateRoot, "package.json"), "utf8"));
    assert.equal(packageJson.private, true);
    assert.equal(packageJson.license, "MIT");
    const tarballPath = path.join(packageDirectory, pack.filename);
    const tarballBytes = await fs.readFile(tarballPath);
    const tarballSha256 = sha256(tarballBytes);

    await fs.mkdir(consumerRoot, { recursive: true });
    await fs.writeFile(path.join(consumerRoot, "package.json"), `${JSON.stringify({
      name: "temple-alpha30-clean-consumer",
      version: "0.0.0",
      private: true
    }, null, 2)}\n`);
    const consumerConfig = path.join(temporaryRoot, "consumer-init.json");
    await fs.writeFile(consumerConfig, `${JSON.stringify(initConfig("alpha30-consumer", "Alpha.30 Consumer"), null, 2)}\n`);

    const consumerInstall = run("npm", [
      "install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", tarballPath
    ], { cwd: consumerRoot, label: "clean consumer install" });
    timeline.push({ step: "consumer-install", status: "passed", elapsed_ms: consumerInstall.elapsed_ms });
    const installedCli = path.join(consumerRoot, "node_modules", "@zsz1210", "temple-ai-dev-org", "bin", "temple.mjs");
    const versionStep = run(process.execPath, [installedCli, "--version"], { cwd: consumerRoot, label: "consumer version" });
    assert.equal(versionStep.stdout.trim(), EXPECTED_VERSION);
    const firstInitStep = run(process.execPath, [installedCli, "init", ".", "--config", consumerConfig, "--json"], {
      cwd: consumerRoot,
      label: "consumer first init"
    });
    const firstInit = json(firstInitStep, "consumer first init");
    assert.equal(firstInit.status, "initialized");
    const secondInitStep = run(process.execPath, [installedCli, "init", ".", "--config", consumerConfig, "--json"], {
      cwd: consumerRoot,
      label: "consumer second init"
    });
    const secondInit = json(secondInitStep, "consumer second init");
    assert.equal(secondInit.status, "initialized");
    const consumerEnvironment = { TEMPLE_CLI_PATH: installedCli };
    const launcherVersion = run(process.execPath, ["./templew.mjs", "--version"], {
      cwd: consumerRoot,
      env: consumerEnvironment,
      label: "consumer launcher"
    });
    assert.equal(launcherVersion.stdout.trim(), EXPECTED_VERSION);
    const consumerStatus = json(run(process.execPath, ["./templew.mjs", "status", ".", "--no-write", "--json"], {
      cwd: consumerRoot,
      env: consumerEnvironment,
      label: "consumer status"
    }), "consumer status");
    assert.equal(consumerStatus.project.id, "alpha30-consumer");
    const consumerDoctor = json(run(process.execPath, ["./templew.mjs", "doctor", ".", "--json"], {
      cwd: consumerRoot,
      env: consumerEnvironment,
      label: "consumer Doctor"
    }), "consumer Doctor");
    assert.equal(consumerDoctor.summary.fail, 0);

    await addDetachedWorktree(alpha29Root, ALPHA29_REVISION);
    const packed29 = json(run("npm", [
      "pack", "--ignore-scripts", "--json", "--pack-destination", packageDirectory
    ], { cwd: alpha29Root, label: "Alpha.29 comparison pack" }), "Alpha.29 comparison pack")[0];
    const tarball29 = path.join(packageDirectory, packed29.filename);
    await fs.mkdir(upgradeRoot, { recursive: true });
    await fs.writeFile(path.join(upgradeRoot, "package.json"), `${JSON.stringify({
      name: "temple-alpha29-upgrade-consumer",
      version: "0.0.0",
      private: true
    }, null, 2)}\n`);
    const upgradeConfig = path.join(temporaryRoot, "upgrade-init.json");
    await fs.writeFile(upgradeConfig, `${JSON.stringify(initConfig("alpha29-upgrade", "Alpha.29 Upgrade Fixture"), null, 2)}\n`);
    run("npm", [
      "install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", tarball29
    ], { cwd: upgradeRoot, label: "Alpha.29 comparison install" });
    const alpha29Cli = path.join(upgradeRoot, "node_modules", "@zsz1210", "temple-ai-dev-org", "bin", "temple.mjs");
    run(process.execPath, [alpha29Cli, "init", ".", "--config", upgradeConfig, "--json"], {
      cwd: upgradeRoot,
      label: "Alpha.29 comparison init"
    });
    await fs.mkdir(path.join(upgradeRoot, "notes"), { recursive: true });
    await fs.writeFile(path.join(upgradeRoot, "notes", "project-sentinel.txt"), "project-owned-alpha29-sentinel\n");
    const projectOwnedPaths = [
      ".ai-org/project/project.json",
      ".ai-org/project/agents.json",
      ".ai-org/project/assignments.json",
      ".ai-org/project/collaboration.json",
      ".ai-org/project/context-map.json",
      ".ai-org/project/evidence-profiles.json",
      ".ai-org/project/execution-policy.json",
      ".ai-org/project/federation.json",
      ".ai-org/project/retrieval.json",
      ".ai-org/project/spec-index.json",
      ".ai-org/project/tracker.json",
      ".ai-org/project/usage-policy.json",
      ".ai-org/learning/index.json",
      "AGENTS.md",
      "notes/project-sentinel.txt"
    ];
    const beforeDigests = await digestFiles(upgradeRoot, projectOwnedPaths);
    const alpha30Cli = path.join(candidateRoot, "bin", "temple.mjs");
    const upgradeDryRun = run(process.execPath, [alpha30Cli, "upgrade", upgradeRoot, "--dry-run"], {
      cwd: candidateRoot,
      label: "Alpha.29 to Alpha.30 upgrade dry run"
    });
    assert.match(upgradeDryRun.stdout, /0\.1\.0-alpha\.29 -> 0\.1\.0-alpha\.30/);
    assert.match(upgradeDryRun.stdout, /update-lock: 1/);
    assert.doesNotMatch(upgradeDryRun.stdout, /(?:update-managed|remove-managed|create-[a-z-]+): [1-9]/);
    run(process.execPath, [alpha30Cli, "upgrade", upgradeRoot], {
      cwd: candidateRoot,
      label: "Alpha.29 to Alpha.30 upgrade"
    });
    const afterDigests = await digestFiles(upgradeRoot, projectOwnedPaths);
    assert.deepEqual(afterDigests, beforeDigests);
    const upgradedLock = JSON.parse(await fs.readFile(path.join(upgradeRoot, "temple.lock"), "utf8"));
    assert.equal(upgradedLock.template.version, EXPECTED_VERSION);
    assert.equal(upgradedLock.template.bootstrap.package_spec, `@zsz1210/temple-ai-dev-org@${EXPECTED_VERSION}`);
    const upgradedDoctor = json(run(process.execPath, ["./templew.mjs", "doctor", ".", "--json"], {
      cwd: upgradeRoot,
      env: { TEMPLE_CLI_PATH: alpha30Cli },
      label: "upgraded consumer Doctor"
    }), "upgraded consumer Doctor");
    assert.equal(upgradedDoctor.summary.fail, 0);

    return {
      schema_version: "temple.alpha30-package-qualification/v1",
      generated_at: new Date().toISOString(),
      status: "pass",
      candidate: {
        revision: CANDIDATE_REVISION,
        version: EXPECTED_VERSION,
        source_clean: true
      },
      package: {
        name: pack.name,
        version: pack.version,
        filename: pack.filename,
        sha256: tarballSha256,
        shasum: pack.shasum,
        integrity: pack.integrity,
        file_count: pack.entryCount,
        packed_size_bytes: pack.size,
        unpacked_size_bytes: pack.unpackedSize,
        license: packageJson.license,
        private: packageJson.private,
        files: pack.files
      },
      candidate_checks: {
        verify: verifySummary,
        browser: { status: "pass", elapsed_ms: browser.elapsed_ms },
        schema: { valid: schema.valid, documents_checked: schema.documents_checked, schemas_checked: schema.schemas_checked },
        doctor: doctor.summary,
        production_dependency_audit: auditSummary(productionAudit),
        complete_dependency_audit: auditSummary(completeAudit),
        publication_audit: publication.summary
      },
      clean_consumer: {
        node: process.version,
        installed_offline_from_exact_tarball: true,
        version: versionStep.stdout.trim(),
        first_init_status: firstInit.status,
        second_init_status: secondInit.status,
        launcher_version: launcherVersion.stdout.trim(),
        status_project_id: consumerStatus.project.id,
        doctor: consumerDoctor.summary
      },
      alpha29_upgrade: {
        source_revision: ALPHA29_REVISION,
        source_version: packed29.version,
        target_version: upgradedLock.template.version,
        plan: "lock-only; no managed-file replacement or project-data creation",
        project_owned_files_compared: beforeDigests.length,
        project_owned_digests_unchanged: true,
        doctor: upgradedDoctor.summary
      },
      timeline,
      authority: {
        candidate_source_changed: false,
        repository_visibility_changed: false,
        tag_created: false,
        github_release_created: false,
        npm_published: false,
        deployed: false,
        announced: false
      },
      retained_limits: [
        "The clean consumer uses an exact local tarball because the package is private and absent from the public npm registry.",
        "Browser success covers the installed-Chrome Management Console gate at the candidate revision; it is not a universal device or accessibility study.",
        "Package correctness and deterministic setup do not establish universal efficiency, automatic routing safety, or enterprise qualification.",
        "Publication remains a separate Human decision."
      ]
    };
  } finally {
    removeWorktree(candidateRoot);
    removeWorktree(alpha29Root);
    await fs.rm(temporaryRoot, { recursive: true, force: true });
    spawnSync("git", ["worktree", "prune"], { cwd: REPOSITORY_ROOT });
  }
}

const options = parseArguments(process.argv.slice(2));
try {
  const result = await qualify();
  await fs.mkdir(path.dirname(options.output), { recursive: true });
  const handle = await fs.open(options.output, "wx");
  try {
    await handle.writeFile(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    await handle.close();
  }
  process.stdout.write(`${JSON.stringify({
    status: result.status,
    revision: result.candidate.revision,
    package_sha256: result.package.sha256,
    file_count: result.package.file_count,
    tests: result.candidate_checks.verify.tests,
    browser: result.candidate_checks.browser.status,
    consumer_doctor: result.clean_consumer.doctor,
    upgrade_doctor: result.alpha29_upgrade.doctor
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exitCode = 1;
}
