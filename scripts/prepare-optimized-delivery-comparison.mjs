import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { digest, preparePair, createProtocol, validateProtocol, inspectProvider, inspectReadiness, runPair, sourceDigest } from "./delivery-control-pair.mjs";

const schema = "temple.optimized-delivery-matrix/v1";
const need = (condition, code) => { if (!condition) throw new Error(code); };
const read = async file => JSON.parse(await fs.readFile(file, "utf8"));
const write = (file, data, exclusive = false) => fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", exclusive ? { flag: "wx" } : {});
const within = (root, file) => { const relative = path.relative(root, file); return !path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(".." + path.sep); };

export function matrixPlan(selection = "both") {
  need(["both", "terra"].includes(selection), "matrix-selection");
  const all = [
    { id: "terra-ordinary-first", model: "gpt-5.6-terra", order: ["ordinary", "temple"] },
    { id: "gpt6-temple-first", model: "gpt-6-astra", order: ["temple", "ordinary"] },
    { id: "terra-temple-first", model: "gpt-5.6-terra", order: ["temple", "ordinary"] },
    { id: "gpt6-ordinary-first", model: "gpt-6-astra", order: ["ordinary", "temple"] }
  ];
  const pairs = all.filter(p => selection === "both" || p.model === "gpt-5.6-terra").map(p => ({ ...p, reasoning_effort: "medium" }));
  return {
    schema_version: schema, work_item_id: "WI-0179", selection, pairs,
    pair_limits: { stages: 4, per_stage_ms: 360000, aggregate_ms: 1440000, per_stage_operational_tokens: 80000, aggregate_operational_tokens: 320000 },
    maximum_stage_turns: pairs.length * 4, maximum_operational_tokens: pairs.length * 320000, maximum_ms: pairs.length * 1440000,
    policy: { account: "existing-included-allowance-only", purchase: false, refill: false, reset: false, retries: 0, fallback: false,
      cache: "uncontrolled-descriptive-only", stop_on_pair_not_comparable: true, historical_results: "context-only-not-a-causal-control" }
  };
}

export function validateMatrix(matrix) {
  need(matrix?.schema_version === schema, "matrix-schema");
  need(digest(matrix.plan) === digest(matrixPlan(matrix.plan?.selection)), "matrix-plan-drift");
  need(/^sha256:[a-f0-9]{64}$/.test(matrix.source_sha256), "matrix-source");
  need(Array.isArray(matrix.pairs) && matrix.pairs.length === matrix.plan.pairs.length, "matrix-pair-count");
  for (let index = 0; index < matrix.pairs.length; index++) {
    const pair = matrix.pairs[index], expected = matrix.plan.pairs[index];
    need(pair.id === expected.id && /^sha256:[a-f0-9]{64}$/.test(pair.protocol_sha256) && /^sha256:[a-f0-9]{64}$/.test(pair.provider_sha256), "matrix-pair-binding");
  }
  return true;
}

export function validateMatrixApproval(approval, matrix) {
  validateMatrix(matrix);
  need(approval?.schema_version === "temple.optimized-delivery-matrix-approval/v1" && approval.status === "approved" &&
    approval.work_item_id === "WI-0179" && approval.matrix_sha256 === digest(matrix), "matrix-approval-binding");
  for (const key of ["maximum_stage_turns", "maximum_operational_tokens", "maximum_ms"])
    need(approval[key] === matrix.plan[key], "matrix-approval-limits");
  for (const key of ["account", "purchase", "refill", "reset", "retries", "fallback"])
    need(approval[key] === matrix.plan.policy[key], "matrix-approval-policy");
  need(typeof approval.approved_by === "string" && approval.approved_by.trim().length > 0 &&
    typeof approval.evidence_ref === "string" && approval.evidence_ref.trim().length > 0 &&
    Number.isFinite(Date.parse(approval.approved_at)) && Date.parse(approval.approved_at) <= Date.now(), "matrix-approval-authority");
  return true;
}

// Preparation probes the installed contract but never starts a model thread or turn.
// This entry deliberately has no approval-generation option.
export async function prepareMatrix({ matrixRoot, sourceRoot, selection = "both", readinessReview }) {
  const plan = matrixPlan(selection);
  need(readinessReview?.status === "passed" && readinessReview.test_only !== true, "matrix-independent-readiness-required");
  sourceRoot = await fs.realpath(sourceRoot);
  const parent = await fs.realpath(path.dirname(path.resolve(matrixRoot)));
  matrixRoot = path.join(parent, path.basename(matrixRoot));
  need(!within(sourceRoot, matrixRoot) && !within(matrixRoot, sourceRoot), "matrix-root-boundary");
  const contracts = new Map();
  for (const pair of plan.pairs) if (!contracts.has(pair.model))
    contracts.set(pair.model, await inspectProvider({ sourceRoot, model: pair.model, effort: pair.reasoning_effort }));
  await fs.mkdir(matrixRoot);
  const matrix = { schema_version: schema, plan, source_sha256: await sourceDigest(sourceRoot), pairs: [], model_generation_performed: false };
  for (const pair of plan.pairs) {
    const labRoot = path.join(matrixRoot, pair.id), provider = contracts.get(pair.model);
    const manifest = await preparePair({ labRoot, sourceRoot, order: pair.order });
    need(manifest.source_sha256 === matrix.source_sha256, "matrix-source-drift");
    const protocol = createProtocol(manifest, {
      work_item_id: "WI-0179", model: pair.model, reasoning_effort: pair.reasoning_effort,
      limits: plan.pair_limits, provider_contract_sha256: digest(provider), readiness_review: readinessReview
    });
    validateProtocol(protocol);
    await inspectReadiness({ labRoot, protocol, providerContract: provider });
    await write(path.join(labRoot, "provider.frozen.json"), provider, true);
    await write(path.join(labRoot, "protocol.frozen.json"), protocol, true);
    matrix.pairs.push({ id: pair.id, protocol_sha256: digest(protocol), provider_sha256: digest(provider) });
  }
  validateMatrix(matrix);
  await write(path.join(matrixRoot, "matrix.frozen.json"), matrix, true);
  return { matrix_root: matrixRoot, matrix_sha256: digest(matrix), plan, model_generation_performed: false };
}

async function inspectMatrixPairs(matrixRoot, matrix) {
  const pairs = [];
  for (let index = 0; index < matrix.pairs.length; index++) {
    const binding = matrix.pairs[index], expected = matrix.plan.pairs[index];
    const labRoot = path.join(matrixRoot, binding.id);
    need(await fs.realpath(labRoot) === labRoot, "matrix-lab-symlink");
    const protocol = await read(path.join(labRoot, "protocol.frozen.json")), provider = await read(path.join(labRoot, "provider.frozen.json"));
    validateProtocol(protocol);
    need(digest(protocol) === binding.protocol_sha256 && digest(provider) === binding.provider_sha256, "matrix-frozen-drift");
    need(protocol.work_item_id === "WI-0179" && protocol.source_sha256 === matrix.source_sha256 &&
      protocol.model === expected.model && protocol.reasoning_effort === expected.reasoning_effort &&
      digest(protocol.order) === digest(expected.order) && digest(protocol.limits) === digest(matrix.plan.pair_limits), "matrix-route-or-budget-drift");
    await inspectReadiness({ labRoot, protocol, providerContract: provider });
    // A consumed pair or even a pre-existing result blocks the entire fresh matrix.
    for (const name of ["run-once.lock", "run.json", "seal.json"]) {
      let exists = false;
      try { await fs.lstat(path.join(labRoot, name)); exists = true; } catch (error) { if (error.code !== "ENOENT") throw error; }
      need(!exists, "matrix-pair-already-consumed");
    }
    pairs.push({ labRoot, protocol, provider });
  }
  return pairs;
}

export async function runMatrix({ matrixRoot, approval, onProgress = () => {} }) {
  matrixRoot = await fs.realpath(matrixRoot);
  const matrix = await read(path.join(matrixRoot, "matrix.frozen.json"));
  validateMatrixApproval(approval, matrix);
  const pairs = await inspectMatrixPairs(matrixRoot, matrix);
  const once = await fs.open(path.join(matrixRoot, "matrix-run-once.lock"), "wx"); await once.close();
  const started = Date.now();
  const result = { schema_version: "temple.optimized-delivery-matrix-run/v1", matrix_sha256: digest(matrix),
    approval_sha256: digest(approval), status: "running", started_at: new Date().toISOString(), pairs: [],
    observed_operational_tokens: 0, subject_turn_requests: 0, elapsed_ms: 0, usage_finality: "last-observed-not-account-final" };
  const save = async () => { result.elapsed_ms = Date.now() - started; await write(path.join(matrixRoot, "matrix-run.json"), result); };
  await save();
  try {
    for (let index = 0; index < pairs.length; index++) {
      need(Date.now() - started < matrix.plan.maximum_ms, "matrix-wall-clock-limit");
      need(result.observed_operational_tokens + matrix.plan.pair_limits.aggregate_operational_tokens <= matrix.plan.maximum_operational_tokens, "matrix-operational-token-limit");
      const { labRoot, protocol, provider } = pairs[index];
      const pairApproval = {
        schema_version: "temple.delivery-pair-approval/v2", status: "approved", work_item_id: "WI-0179",
        protocol_sha256: digest(protocol), approved_by: approval.approved_by, approved_at: approval.approved_at,
        evidence_ref: approval.evidence_ref, account: approval.account, maximum_stage_turns: 4,
        purchase: false, refill: false, reset: false, retries: 0, fallback: false
      };
      await onProgress({ pair: matrix.pairs[index].id, status: "starting" });
      const run = await runPair({ labRoot, protocol, approval: pairApproval, providerContract: provider, deadline: started + matrix.plan.maximum_ms });
      result.pairs.push({ id: matrix.pairs[index].id, run_sha256: digest(run), status: run.status,
        efficiency_comparable: run.efficiency_comparable, observed_operational_tokens: run.operational_tokens,
        usage_complete: run.usage_complete, subject_turn_requests: run.subject_turn_requests, elapsed_ms: run.elapsed_ms });
      result.observed_operational_tokens += run.operational_tokens;
      result.subject_turn_requests += run.subject_turn_requests;
      await save();
      await onProgress(result.pairs.at(-1));
      need(run.status === "completed" && run.efficiency_comparable === true && run.usage_complete === true, "matrix-pair-not-comparable");
      need(result.observed_operational_tokens <= matrix.plan.maximum_operational_tokens &&
        result.subject_turn_requests <= matrix.plan.maximum_stage_turns, "matrix-aggregate-limit");
    }
    result.status = "completed";
  } catch (error) {
    result.status = "stopped";
    result.stop_reason = /^matrix-[a-z-]+$/.test(error.message) ? error.message : "matrix-pair-or-provider-failure";
  } finally { await save(); }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [operation, ...values] = process.argv.slice(2);
  if (operation === "plan" && values.length <= 1) console.log(JSON.stringify(matrixPlan(values[0]), null, 2));
  else if (operation === "prepare" && values.length === 4) console.log(JSON.stringify(await prepareMatrix({
    sourceRoot: values[0], matrixRoot: values[1], selection: values[2], readinessReview: await read(values[3])
  }), null, 2));
  else if (operation === "run" && values.length === 2) console.log(JSON.stringify(await runMatrix({
    matrixRoot: values[0], approval: await read(values[1]), onProgress: row => console.log(JSON.stringify(row))
  }), null, 2));
  else throw new Error("Usage: plan [both|terra]; prepare SOURCE NEW_MATRIX_ROOT both|terra READINESS_JSON; run MATRIX_ROOT APPROVAL_JSON");
}
