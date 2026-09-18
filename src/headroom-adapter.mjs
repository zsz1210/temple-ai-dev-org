import fs from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const HEADROOM_CONTRACT = Object.freeze({
  version: "0.37.0", tokenizerVersion: "0.14.0", license: "Apache-2.0",
  minimumBytes: 16 * 1024, maximumBytes: 1024 * 1024, timeoutMs: 15000
});
const workerFile = fileURLToPath(new URL("./headroom-worker.py", import.meta.url));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const byteLength = (value) => Buffer.byteLength(value, "utf8");
const envelopeBytes = (value) => byteLength(JSON.stringify(value));
const hasCcr = (text) => /<<ccr:|\[\s*(?:HEADROOM|CCR)|\bhash=[A-Za-z0-9_-]+/i.test(text);

async function readBoundedFile(filename) {
  const file = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > HEADROOM_CONTRACT.maximumBytes) throw new Error("Input must be a regular UTF-8 file no larger than 1 MiB");
    const bytes = Buffer.alloc(HEADROOM_CONTRACT.maximumBytes + 1);
    let size = 0;
    while (size < bytes.length) {
      const read = await file.read(bytes, size, bytes.length - size, null);
      if (!read.bytesRead) break;
      size += read.bytesRead;
    }
    if (size > HEADROOM_CONTRACT.maximumBytes) throw new Error("Input exceeds 1 MiB");
    const data = bytes.subarray(0, size);
    new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(data);
    return data;
  } finally { await file.close(); }
}

// Only explicitly selected, operator-trusted Python environments are executed.
export async function runHeadroomWorker({ content, query, python }) {
  if (process.platform !== "darwin") return { failure: "unsupported-platform" };
  if (typeof python !== "string" || !path.isAbsolute(python)) return { failure: "runtime-unconfigured" };
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "temple-headroom-"));
  try {
    const realScratch = await fs.realpath(scratch);
    const profile = `(version 1)(allow default)(deny network*)(deny process-fork)(deny file-write*)(allow file-write* (subpath ${JSON.stringify(realScratch)}) (literal "/dev/null"))`;
    const result = spawnSync("/usr/bin/sandbox-exec", ["-p", profile, python, "-I", "-B", workerFile], {
      input: JSON.stringify({ content, query }), encoding: "utf8", cwd: realScratch,
      timeout: HEADROOM_CONTRACT.timeoutMs, killSignal: "SIGKILL", maxBuffer: 8 * 1024 * 1024,
      env: {
        PATH: "/usr/bin:/bin", HOME: realScratch, TMPDIR: realScratch,
        HEADROOM_WORKSPACE_DIR: realScratch, HEADROOM_CONFIG_DIR: path.join(realScratch, "config"),
        HEADROOM_CCR_BACKEND: "memory", HF_HUB_OFFLINE: "1", TRANSFORMERS_OFFLINE: "1",
        TIKTOKEN_CACHE_DIR: process.env.TIKTOKEN_CACHE_DIR || path.join(os.tmpdir(), "data-gym-cache"),
        LITELLM_LOCAL_MODEL_COST_MAP: "True", TOKENIZERS_PARALLELISM: "false",
        OTEL_SDK_DISABLED: "true", DO_NOT_TRACK: "1"
      }
    });
    if (result.error?.code === "ETIMEDOUT") return { failure: "worker-timeout" };
    if (result.error || result.status !== 0) return { failure: "worker-unavailable" };
    try { return JSON.parse(result.stdout); } catch { return { failure: "invalid-worker-response" }; }
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
}

function validWorker(result, originalHash) {
  return result && result.version === HEADROOM_CONTRACT.version &&
    result.tokenizer_version === HEADROOM_CONTRACT.tokenizerVersion &&
    result.original_sha256 === originalHash && typeof result.content === "string" &&
    result.content.length > 0 && Array.isArray(result.transforms) && result.transforms.length <= 100 &&
    result.transforms.every((x) => typeof x === "string" && x.length <= 200) &&
    [result.input_tokens, result.output_tokens].every((x) => Number.isSafeInteger(x) && x >= 0);
}

function safeSnapshot(filename) {
  if (typeof filename !== "string" || !path.isAbsolute(filename)) return false;
  return !path.resolve(filename).split(path.sep).some((part) => [".git", ".ai-org", ".agents", ".codex"].includes(part));
}

export async function createHeadroomView({ input, kind, enabled = false, python, snapshot, query = "" }, { runWorker = runHeadroomWorker } = {}) {
  const started = performance.now();
  const bytes = await readBoundedFile(input);
  const content = bytes.toString("utf8");
  const originalHash = digest(bytes);
  const output = {
    schema_version: "temple.tool-output-view/v1", status: "original", reason: "disabled",
    content, source_sha256: originalHash, readback: null,
    metrics: { input_bytes: bytes.length, output_bytes: bytes.length, worker_attempts: 0,
      worker_ms: 0, total_ms: 0, snapshot_bytes: 0, local_token_estimate: null,
      model_usage: null, provider_calls_by_adapter: 0 }
  };
  const finish = () => {
    output.metrics.total_ms = performance.now() - started;
    return output;
  };
  if (enabled !== true) return finish();
  const physicalInput = await fs.realpath(input);
  if (!safeSnapshot(physicalInput) || ["AGENTS.md", "TEMPLE.md", "CLAUDE.md"].includes(path.basename(physicalInput))) {
    output.reason = "protected-source"; return finish();
  }
  if (!["log", "json"].includes(kind)) { output.reason = "unsupported-kind"; return finish(); }
  if (kind === "json") {
    try { JSON.parse(content); } catch { output.reason = "invalid-json"; return finish(); }
  }
  if (bytes.length < HEADROOM_CONTRACT.minimumBytes) { output.reason = "below-threshold"; return finish(); }
  if (typeof query !== "string" || byteLength(query) > 4096) throw new Error("Query must be UTF-8 text no larger than 4 KiB");
  if (!safeSnapshot(snapshot)) { output.reason = "snapshot-unconfigured"; return finish(); }
  // Reject a symlinked parent resolving into canonical organization state as well.
  try {
    const parent = await fs.realpath(path.dirname(snapshot));
    if (!safeSnapshot(path.join(parent, path.basename(snapshot)))) throw new Error("protected parent");
    try { await fs.lstat(snapshot); output.reason = "snapshot-exists"; return finish(); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  } catch { output.reason = "snapshot-unavailable"; return finish(); }
  output.metrics.worker_attempts = 1;
  const workerStarted = performance.now();
  let result;
  try { result = await runWorker({ content, query, python }); }
  catch { result = { failure: "worker-unavailable" }; }
  output.metrics.worker_ms = performance.now() - workerStarted;
  if (!validWorker(result, originalHash)) {
    const reasons = ["unsupported-platform", "runtime-unconfigured", "worker-timeout", "worker-unavailable", "invalid-worker-response"];
    output.reason = reasons.includes(result?.failure) ? result.failure : "invalid-worker-response";
    return finish();
  }
  output.metrics.local_token_estimate = {
    tokenizer: "o200k_base", tokenizer_version: result.tokenizer_version,
    input: result.input_tokens, candidate_output: result.output_tokens, returned_output: result.input_tokens,
    scope: "content-only; excludes envelope, history, model output and readback"
  };
  if (hasCcr(result.content)) { output.reason = "ephemeral-ccr-unsupported"; return finish(); }
  const candidate = { ...output, status: "compressed", reason: "smaller-view",
    content: result.content, headroom_version: result.version, transforms: result.transforms,
    readback: { snapshot: path.resolve(snapshot), sha256: originalHash },
    metrics: { ...output.metrics, output_bytes: byteLength(result.content), snapshot_bytes: bytes.length,
      local_token_estimate: { ...output.metrics.local_token_estimate, returned_output: result.output_tokens } }
  };
  if (envelopeBytes(candidate) >= envelopeBytes(output) || result.output_tokens >= result.input_tokens) {
    output.reason = "no-net-reduction"; return finish();
  }
  let handle;
  try {
    handle = await fs.open(snapshot, "wx", 0o600);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close(); handle = null;
  } catch {
    if (handle) {
      output.metrics.snapshot_bytes = null;
      await handle.close().catch(() => {});
      // Do not delete an uncertain path; an incomplete snapshot is never returned.
    }
    output.reason = "snapshot-write-failed";
    return finish();
  }
  candidate.metrics.total_ms = performance.now() - started;
  return candidate;
}

export async function readHeadroomOriginal({ input, sha256 }) {
  if (!/^[a-f0-9]{64}$/.test(sha256 ?? "")) throw new Error("Readback requires the exact lowercase SHA256");
  const started = performance.now();
  const bytes = await readBoundedFile(input);
  if (digest(bytes) !== sha256) throw new Error("Original snapshot changed; refusing mismatched readback");
  return { schema_version: "temple.tool-output-readback/v1", content: bytes.toString("utf8"),
    source_sha256: sha256, metrics: { output_bytes: bytes.length, total_ms: performance.now() - started,
      model_usage: null, provider_calls_by_adapter: 0 } };
}
