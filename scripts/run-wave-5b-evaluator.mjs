#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildCodexRuntimeRequestResponse, createJsonRpcProcess } from "../src/codex-app-server-provider.mjs";
import { isolateWave5CodexEnvironment, normalizeTokenUsage, terminalFailure } from "../src/app-server-protocol-replay.mjs";
import { manifestDigest, validateWave5BProtocol } from "./validate-wave-5b-protocol.mjs";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const forbiddenKeys = /condition|usage|token|latency|candidate_revision|repository_path|sealed_mapping|arm_mapping/i;

const scoreSchema = {
  type: "object",
  additionalProperties: false,
  required: ["packages", "summary"],
  properties: {
    packages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["package_id", "case_id", "weighted_score", "decision", "critical_failure", "rationale"],
        properties: {
          package_id: { type: "string" },
          case_id: { type: "string" },
          weighted_score: { type: "number" },
          decision: { type: "string", enum: ["pass", "reject"] },
          critical_failure: { type: ["string", "null"] },
          rationale: { type: "string" }
        }
      }
    },
    summary: { type: "string" }
  }
};

export function sanitizeBlindPackage(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("blind package must be an object");
  function sanitize(value) {
    if (Array.isArray(value)) return value.map(sanitize);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !forbiddenKeys.test(key))
      .map(([key, child]) => [key, sanitize(child)]));
  }
  const output = sanitize(input);
  if (!output.package_id || !output.case_id || !output.evidence_id) throw new Error("blind package identity is incomplete");
  return output;
}

export function validateFrozenScores(scores, packages) {
  if (!scores || !Array.isArray(scores.packages)) throw new Error("evaluator scores are missing");
  const expected = new Map(packages.map((entry) => [entry.package_id, entry.case_id]));
  if (scores.packages.length !== expected.size) throw new Error("evaluator score count does not match package count");
  const seen = new Set();
  for (const score of scores.packages) {
    if (!expected.has(score.package_id) || expected.get(score.package_id) !== score.case_id) throw new Error("evaluator score identity does not match manifest");
    if (seen.has(score.package_id)) throw new Error("duplicate evaluator package score");
    if (!Number.isFinite(score.weighted_score) || score.weighted_score < 0 || score.weighted_score > 1) throw new Error("weighted score is outside 0..1");
    if (!['pass', 'reject'].includes(score.decision)) throw new Error("evaluator decision is invalid");
    seen.add(score.package_id);
  }
  return scores;
}

function argument(argv, name) {
  const index = argv.indexOf(name);
  if (index < 0) return null;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

async function writeExclusive(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const handle = await fs.open(file, "wx");
  try { await handle.writeFile(value.endsWith("\n") ? value : `${value}\n`); }
  finally { await handle.close(); }
}

async function regularJsonFiles(root) {
  return (await fs.readdir(root)).filter((entry) => entry.endsWith(".json")).sort();
}

async function readApproval(file, workItemId) {
  try {
    const approval = JSON.parse(await fs.readFile(file, "utf8"));
    const accepted = approval.schema_version === "temple.wave-5b-account-approval/v1" &&
      approval.work_item_id === workItemId && approval.approved_by === "repository-owner" &&
      approval.automatic_credit_reload_disabled === true && approval.included_pro_allowance_accepted === true &&
      approval.purchased_credits_authorized === false && approval.usage_reset_authorized === false &&
      approval.approved_candidate_turns === 4 && approval.approved_evaluator_turns === 1 &&
      approval.approved_combined_operational_tokens === 260000 && typeof approval.approved_at === "string";
    return { accepted, approval: accepted ? approval : null };
  } catch (error) {
    if (error.code === "ENOENT") return { accepted: false, approval: null };
    throw error;
  }
}

async function prepareEvaluatorInputs(labRoot, fixtureRoot) {
  const sourceRoot = path.join(labRoot, "coordinator", "blind");
  const packageFiles = await regularJsonFiles(sourceRoot);
  if (packageFiles.length !== 4) throw new Error(`expected four blind packages, received ${packageFiles.length}`);
  const evaluatorRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wave-5b-evaluator-"));
  const files = [];
  const packages = [];
  try {
    await fs.mkdir(path.join(evaluatorRoot, "blind"));
    await fs.mkdir(path.join(evaluatorRoot, "rubric"));
    for (const filename of packageFiles) {
      const sanitized = sanitizeBlindPackage(JSON.parse(await fs.readFile(path.join(sourceRoot, filename), "utf8")));
      const relative = path.posix.join("blind", filename);
      const text = `${JSON.stringify(sanitized, null, 2)}\n`;
      await writeExclusive(path.join(evaluatorRoot, relative), text);
      files.push({ path: relative, sha256: sha256(text), kind: "arm-neutral-package" });
      packages.push(sanitized);
    }
    const caseIds = [...new Set(packages.map((entry) => entry.case_id))].sort();
    for (const caseId of caseIds) {
      const relative = path.posix.join("rubric", `${caseId}.json`);
      const text = await fs.readFile(path.join(fixtureRoot, caseId, "evaluator", "rubric.json"), "utf8");
      await writeExclusive(path.join(evaluatorRoot, relative), text);
      files.push({ path: relative, sha256: sha256(text), kind: "frozen-rubric" });
    }
    return { evaluatorRoot, files, packages };
  } catch (error) {
    await fs.rm(evaluatorRoot, { recursive: true, force: true });
    throw error;
  }
}

async function launchEvaluator({ evaluatorRoot, files, packages, protocol }) {
  const inputFiles = await Promise.all(files.map(async (entry) => ({
    ...entry,
    contents: JSON.parse(await fs.readFile(path.join(evaluatorRoot, entry.path), "utf8"))
  })));
  const prompt = [
    "Score each arm-neutral package against the matching frozen rubric.",
    "Use only the JSON inputs below. Do not use tools, infer condition labels, or compare resource use.",
    "A failed hidden acceptance test is a critical failure. Return one score per package.",
    JSON.stringify({ inputs: inputFiles })
  ].join("\n\n");
  let connection;
  let threadId = null;
  let turnId = null;
  let completionText = null;
  let terminal = null;
  let usage = null;
  let violation = null;
  let resolveTerminal;
  const terminalPromise = new Promise((resolve) => { resolveTerminal = resolve; });
  const hardTokens = protocol.evaluator_limits.evaluator_hard_tokens;
  const hardMs = protocol.evaluator_limits.evaluator_hard_ms;

  async function interrupt(reason) {
    if (!violation) violation = reason;
    if (connection && threadId && turnId) await connection.request("turn/interrupt", { threadId, turnId }, 15000).catch(() => {});
  }

  connection = createJsonRpcProcess("codex", ["app-server", "--stdio"], {
    cwd: evaluatorRoot,
    env: isolateWave5CodexEnvironment(process.env),
    onNotification(message) {
      const params = message.params ?? {};
      if (message.method === "thread/tokenUsage/updated" && (!turnId || params.turnId === turnId)) {
        usage = normalizeTokenUsage(params);
        const operationalTokens = usage ? usage.input_tokens - usage.cached_input_tokens + usage.output_tokens : null;
        if (operationalTokens !== null && operationalTokens > hardTokens) void interrupt("evaluator-operational-token-limit");
      }
      if (message.method === "item/started" && ["commandExecution", "fileChange", "mcpToolCall"].includes(params.item?.type)) {
        void interrupt("evaluator-tool-use-forbidden");
      }
      if (message.method === "item/completed" && params.item?.type === "agentMessage") completionText = params.item.text;
      if (message.method === "turn/completed" && (!turnId || params.turn?.id === turnId)) {
        terminal = params.turn;
        resolveTerminal();
      }
      if (message.method === "model/rerouted") void interrupt("evaluator-model-rerouted");
    },
    onRequest(message, responder) {
      if (["item/commandExecution/requestApproval", "item/fileChange/requestApproval", "item/permissions/requestApproval"].includes(message.method)) {
        try { responder.respond(buildCodexRuntimeRequestResponse(message.method, message.params, { decision: "decline" })); } catch {}
      }
      void interrupt("evaluator-request-forbidden");
    }
  });
  const timer = setTimeout(() => { void interrupt("evaluator-wall-clock-limit"); }, hardMs);
  try {
    await connection.request("initialize", { clientInfo: { name: "temple-wave-5b-evaluator", title: "Temple Wave 5B Evaluator", version: "1" }, capabilities: { experimentalApi: false } });
    connection.notify("initialized", {});
    const thread = await connection.request("thread/start", {
      model: protocol.blind_evaluation.model,
      cwd: evaluatorRoot,
      approvalPolicy: "never",
      sandbox: "read-only",
      serviceName: "temple-wave-5b-independent-evaluator",
      developerInstructions: "You are an independent blind quality evaluator. Use only the supplied arm-neutral JSON. Do not use tools. Return exactly the requested structured score document.",
      baseInstructions: "Evaluate only the supplied evidence and frozen rubric. Never infer workflow condition or resource use.",
      allowProviderModelFallback: false,
      ephemeral: true
    });
    threadId = thread?.thread?.id;
    if (!threadId || thread.model !== protocol.blind_evaluation.model) throw new Error("evaluator thread did not acknowledge the pinned model");
    const turn = await connection.request("turn/start", {
      threadId,
      clientUserMessageId: "wave5b-independent-evaluation",
      input: [{ type: "text", text: prompt }],
      turnTrigger: "user",
      cwd: evaluatorRoot,
      approvalPolicy: "never",
      sandboxPolicy: { type: "readOnly", networkAccess: false },
      model: protocol.blind_evaluation.model,
      effort: protocol.blind_evaluation.reasoning_effort,
      outputSchema: scoreSchema
    });
    turnId = turn?.turn?.id;
    if (!turnId) throw new Error("evaluator turn did not start");
    await terminalPromise;
    if (violation) throw new Error(violation);
    const failure = terminalFailure(terminal);
    if (failure) throw new Error(`${failure.code}: ${failure.message}`);
    if (!usage) throw new Error("evaluator detailed Token usage is missing");
    return { threadId, turnId, usage, scores: validateFrozenScores(JSON.parse(completionText), packages) };
  } finally {
    clearTimeout(timer);
    await connection?.close().catch(() => {});
  }
}

export async function preflightWave5BEvaluator({ labRoot, fixtureRoot, protocol, approval }) {
  const blindRoot = path.join(labRoot, "coordinator", "blind");
  let packageCount = 0;
  try { packageCount = (await regularJsonFiles(blindRoot)).length; } catch (error) { if (error.code !== "ENOENT") throw error; }
  return {
    schema_version: "temple.wave-5b-evaluator-preflight/v1",
    pass_without_generation: protocol?.schema_version === "temple.wave-5b-protocol/v1" && protocol?.model?.requested_model === "gpt-5.6-luna" && protocol?.model?.requested_reasoning_effort === "medium",
    owner_approval_present: approval.accepted,
    blind_packages_ready: packageCount === 4,
    blind_package_count: packageCount,
    fixture_root: fixtureRoot,
    model_generation_performed: false
  };
}

async function main(argv) {
  const repositoryRoot = path.resolve(import.meta.dirname, "..");
  const workItemId = argument(argv, "--work-item-id") ?? "WI-0117";
  const labRoot = path.resolve(argument(argv, "--lab-root") ?? "/Users/zsz1210/Documents/ChatGPT/temple-wave-5b-lab");
  const protocolPath = path.resolve(argument(argv, "--protocol-path") ?? path.join(repositoryRoot, ".ai-org/artifacts/WI-0117/wave-5b-protocol.json"));
  const approvalPath = path.resolve(argument(argv, "--approval-path") ?? path.join(repositoryRoot, ".ai-org/artifacts/WI-0117/account-approval.json"));
  const preflightPath = path.resolve(argument(argv, "--preflight-output") ?? path.join(repositoryRoot, ".ai-org/artifacts/WI-0117/evaluator-preflight.json"));
  const resultPath = path.resolve(argument(argv, "--result-output") ?? path.join(repositoryRoot, ".ai-org/artifacts/WI-0117/evaluator-result.json"));
  const protocol = JSON.parse(await fs.readFile(protocolPath, "utf8"));
  const fixtureRoot = path.resolve(repositoryRoot, protocol.fixture_root);
  const approval = await readApproval(approvalPath, workItemId);
  const preflight = await preflightWave5BEvaluator({ labRoot, fixtureRoot, protocol, approval });
  await writeExclusive(preflightPath, `${JSON.stringify(preflight, null, 2)}\n`);
  if (argv.includes("--preflight-only")) {
    process.stdout.write(`${JSON.stringify(preflight, null, 2)}\n`);
    return;
  }
  if (!preflight.pass_without_generation || !preflight.owner_approval_present || !preflight.blind_packages_ready) {
    throw new Error("Wave 5B evaluator generation is blocked by preflight");
  }

  const prepared = await prepareEvaluatorInputs(labRoot, fixtureRoot);
  try {
    const inputDigest = manifestDigest(prepared.files);
    const result = await launchEvaluator({ ...prepared, protocol });
    const frozenAt = new Date().toISOString();
    const frozenDocument = {
      schema_version: "temple.wave-5b-quality-score/v1",
      work_item_id: workItemId,
      evaluator_thread_id: result.threadId,
      input_manifest_digest: inputDigest,
      frozen_at: frozenAt,
      packages: result.scores.packages,
      summary: result.scores.summary,
      signature: { type: "provider-context-attestation", signed_by: result.threadId }
    };
    const frozenText = `${JSON.stringify(frozenDocument, null, 2)}\n`;
    const frozenPath = path.join(path.dirname(resultPath), "quality-scores-frozen.json");
    await writeExclusive(frozenPath, frozenText);
    const frozenDigest = sha256(frozenText);
    const protocolObservation = {
      schema_version: "temple.wave-5b-evaluator-protocol/v1",
      evaluator_context: {
        context_id: result.threadId,
        fresh: true,
        coordinator_inputs_available: false,
        arm_mapping_available: false,
        provider_context_evidence_ref: `codex-thread:${result.threadId}`
      },
      input_manifest: { files: prepared.files, digest: inputDigest },
      evaluator_visible_metadata: { study_id: protocol.protocol_id, package_count: prepared.packages.length, rubric_version: "WI-0106-frozen" },
      score_freeze: {
        frozen_at: frozenAt,
        artifact_sha256: frozenDigest,
        evaluator_context_id: result.threadId,
        input_manifest_digest: inputDigest,
        signed_by: result.threadId
      },
      mapping_unseal: {
        unsealed_at: new Date(Date.now() + 1).toISOString(),
        score_artifact_sha256: frozenDigest,
        joined_by: "wave-5b-coordinator"
      }
    };
    const protocolCheck = validateWave5BProtocol(protocolObservation);
    if (protocolCheck.status !== "qualified") throw new Error(`evaluator protocol rejected: ${protocolCheck.failures.join(", ")}`);
    const sealedRoot = path.join(labRoot, "coordinator", "sealed");
    const mappings = await Promise.all((await regularJsonFiles(sealedRoot)).map(async (file) => JSON.parse(await fs.readFile(path.join(sealedRoot, file), "utf8"))));
    const output = {
      schema_version: "temple.wave-5b-evaluator-result/v1",
      work_item_id: workItemId,
      status: "completed",
      evaluator: { thread_id: result.threadId, turn_id: result.turnId, usage: result.usage },
      protocol: protocolCheck,
      scores: frozenDocument,
      joined: result.scores.packages.map((score) => ({ ...score, mapping: mappings.find((entry) => entry.package_id === score.package_id) ?? null })),
      raw_prompt_retained: false,
      hidden_reasoning_retained: false,
      automatic_retry: false,
      fallback_used: false
    };
    await writeExclusive(resultPath, `${JSON.stringify(output, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  } finally {
    await fs.rm(prepared.evaluatorRoot, { recursive: true, force: true });
  }
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
