#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const forbiddenKey = /condition|usage|token|latency|candidate_revision|repository_path|sealed_mapping|arm_mapping/i;
const forbiddenPath = /(^|\/)(sealed|mapping|coordinator)(\/|$)|experiment-result/i;

export function manifestDigest(files) {
  const normalized = files
    .map(({ path: filePath, sha256: digest, kind }) => ({ path: filePath, sha256: digest, kind }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return sha256(JSON.stringify(normalized));
}

function scanForbidden(value, trail = "root") {
  if (Array.isArray(value)) return value.flatMap((entry, index) => scanForbidden(entry, `${trail}[${index}]`));
  if (!value || typeof value !== "object") return [];
  const failures = [];
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKey.test(key)) failures.push(`${trail}.${key}`);
    failures.push(...scanForbidden(child, `${trail}.${key}`));
  }
  return failures;
}

export function validateWave5BProtocol(observation) {
  const failures = [];
  if (observation?.schema_version !== "temple.wave-5b-evaluator-protocol/v1") failures.push("unsupported schema");
  const context = observation?.evaluator_context ?? {};
  const manifest = observation?.input_manifest ?? {};
  const freeze = observation?.score_freeze ?? {};
  const unseal = observation?.mapping_unseal ?? {};
  const files = manifest.files ?? [];

  if (!context.fresh) failures.push("evaluator context is not fresh");
  if (context.coordinator_inputs_available !== false) failures.push("coordinator inputs were available to evaluator");
  if (context.arm_mapping_available !== false) failures.push("arm mapping was available to evaluator");
  if (!context.provider_context_evidence_ref) failures.push("fresh evaluator context evidence is absent");
  if (!files.length) failures.push("evaluator input manifest is empty");
  for (const file of files) {
    if (!file.path || !/^[a-f0-9]{64}$/.test(file.sha256 ?? "") || !file.kind) failures.push("input manifest entry is incomplete");
    if (forbiddenPath.test(file.path ?? "")) failures.push(`forbidden evaluator input path: ${file.path}`);
  }
  const calculatedDigest = manifestDigest(files);
  if (manifest.digest !== calculatedDigest) failures.push("input manifest digest mismatch");
  if (scanForbidden(observation.evaluator_visible_metadata ?? {}).length) failures.push("evaluator-visible metadata contains mapping or usage fields");
  if (freeze.evaluator_context_id !== context.context_id) failures.push("score freeze context does not match evaluator context");
  if (freeze.input_manifest_digest !== manifest.digest) failures.push("score freeze does not bind the input manifest");
  if (!/^[a-f0-9]{64}$/.test(freeze.artifact_sha256 ?? "")) failures.push("frozen score digest is absent");
  if (!freeze.signed_by) failures.push("frozen score is unsigned");
  if (unseal.score_artifact_sha256 !== freeze.artifact_sha256) failures.push("mapping unseal does not bind the frozen score");
  const frozenAt = Date.parse(freeze.frozen_at ?? "");
  const unsealedAt = Date.parse(unseal.unsealed_at ?? "");
  if (!Number.isFinite(frozenAt) || !Number.isFinite(unsealedAt) || frozenAt >= unsealedAt) {
    failures.push("score was not frozen before mapping unseal");
  }

  return {
    schema_version: "temple.wave-5b-protocol-check/v1",
    status: failures.length ? "rejected" : "qualified",
    failures,
    input_manifest_digest: calculatedDigest,
    score_frozen_before_mapping_unseal: Number.isFinite(frozenAt) && Number.isFinite(unsealedAt) && frozenAt < unsealedAt,
    separation_class: "fresh-provider-context-with-arm-neutral-manifest",
    os_security_sandbox_claimed: false,
    model_generation_performed: false
  };
}

function parseArgs(argv) {
  const options = { input: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--input") options.input = argv[++index];
    else if (argv[index] === "--output") options.output = argv[++index];
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!options.input || !options.output) throw new Error("--input and --output are required");
  return options;
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = validateWave5BProtocol(JSON.parse(await fs.readFile(path.resolve(options.input), "utf8")));
    const handle = await fs.open(path.resolve(options.output), "wx");
    try { await handle.writeFile(`${JSON.stringify(result, null, 2)}\n`); }
    finally { await handle.close(); }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.status !== "qualified") process.exitCode = 2;
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
