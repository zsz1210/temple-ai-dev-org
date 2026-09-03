#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_ARMS = ["minimal-responsible", "temple"];
const REQUIRED_REPOSITORIES = ["gateway", "catalog", "orders", "notifications"];
const REQUIRED_METRICS = [
  "cold-recovery",
  "boundary-quality",
  "contract-convergence",
  "correctness",
  "rework",
  "human-intervention",
  "usage",
  "latency",
  "footprint"
];
const DIGEST = /^[a-f0-9]{64}$/;
const REVISION = /^[a-f0-9]{40}$/;

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function equal(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

export function validateRepresentativeMicroserviceProtocol(document) {
  const failures = [];
  if (document?.schema_version !== "temple.representative-microservice-comparison/v1") failures.push("unsupported schema");
  if (document?.status !== "local-rehearsal-only") failures.push("status must remain local-rehearsal-only");
  if (document?.model_generation_performed !== false) failures.push("local rehearsal must perform no model generation");

  const arms = Array.isArray(document?.arms) ? document.arms : [];
  const armIds = arms.map((arm) => arm.id).sort();
  if (!equal(armIds, REQUIRED_ARMS)) failures.push("arms must contain minimal-responsible and temple exactly once");
  const reference = arms[0];
  for (const arm of arms) {
    for (const key of ["task_input_sha256", "public_tests_sha256", "hidden_tests_sha256", "tool_policy_sha256"]) {
      if (!DIGEST.test(arm?.[key] ?? "")) failures.push(`${arm?.id ?? "unknown arm"}.${key} must be a SHA-256 digest`);
      if (reference && arm?.[key] !== reference[key]) failures.push(`${key} must match across arms`);
    }
    const repositories = arm?.repositories ?? {};
    if (!equal(Object.keys(repositories).sort(), [...REQUIRED_REPOSITORIES].sort())) failures.push(`${arm?.id ?? "unknown arm"} must pin four required repositories`);
    if (Object.values(repositories).some((revision) => !REVISION.test(revision))) failures.push(`${arm?.id ?? "unknown arm"} repository revisions must be 40-character Git hashes`);
    if (reference && !equal(repositories, reference.repositories)) failures.push("repository revisions must match across arms");
    if (!Array.isArray(arm?.model_route) || arm.model_route.length === 0) failures.push(`${arm?.id ?? "unknown arm"} must freeze a model route`);
    if (reference && !equal(arm?.model_route, reference.model_route)) failures.push("model routes must match across arms");
  }

  const scenario = document?.scenario ?? {};
  for (const key of ["task_input_sha256", "public_tests_sha256", "hidden_tests_sha256", "tool_policy_sha256"]) {
    if (!DIGEST.test(scenario[key] ?? "")) failures.push(`scenario.${key} must be a SHA-256 digest`);
    if (reference && scenario[key] !== reference[key]) failures.push(`scenario.${key} must match the frozen arms`);
  }
  if (reference && !equal(scenario.repositories, reference.repositories)) failures.push("scenario repository revisions must match the frozen arms");
  if (!String(scenario.seeded_defect?.detection_command ?? "").trim()) failures.push("seeded defect detection command is required");
  if (scenario.seeded_defect?.expected_exit_code_before_fix !== 1 || scenario.seeded_defect?.expected_exit_code_after_fix !== 0) {
    failures.push("seeded defect must fail before the fix and pass after it");
  }

  if (document?.evaluator?.score_minimum !== 0 || document?.evaluator?.score_maximum !== 1) failures.push("evaluator score range must be 0 through 1");
  if (document?.evaluator?.freeze_before_mapping_unseal !== true) failures.push("score must freeze before mapping unseal");
  if (document?.evaluator?.fresh_context_required !== true) failures.push("fresh evaluator context is required");
  if (document?.limits?.automatic_retries !== 0) failures.push("automatic retries must be zero");
  if (document?.limits?.fallback_models !== 0) failures.push("fallback models must be zero");
  if (document?.limits?.stop_on_protocol_mismatch !== true) failures.push("protocol mismatch must stop the run");

  const metrics = [...new Set(document?.required_metrics ?? [])].sort();
  if (!equal(metrics, [...REQUIRED_METRICS].sort())) failures.push("required metrics are incomplete or duplicated");

  return {
    schema_version: "temple.representative-microservice-protocol-check/v1",
    status: failures.length ? "rejected" : "qualified-for-local-fixture-execution",
    failures,
    model_generation_performed: false,
    live_execution_authorized: false
  };
}

function parseArgs(argv) {
  const index = argv.indexOf("--input");
  if (index < 0 || !argv[index + 1]) throw new Error("--input is required");
  if (argv.length !== 2) throw new Error("Only --input is supported");
  return path.resolve(argv[index + 1]);
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  try {
    const input = parseArgs(process.argv.slice(2));
    const result = validateRepresentativeMicroserviceProtocol(JSON.parse(await fs.readFile(input, "utf8")));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.status !== "qualified-for-local-fixture-execution") process.exitCode = 2;
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
