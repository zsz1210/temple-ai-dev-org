import fs from "node:fs/promises";
import fsSync, { constants } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const HEADROOM_CONTRACT = Object.freeze({
  version: "0.37.0", tokenizerVersion: "0.14.0", license: "Apache-2.0",
  minimumBytes: 16 * 1024, maximumBytes: 1024 * 1024, timeoutMs: 15000,
  minimumPayloadSavingRatio: 0.1, minimumPayloadSavedTokens: 256
});
const workerFile = fileURLToPath(new URL("./headroom-worker.py", import.meta.url));
const adapterFile = fileURLToPath(import.meta.url);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const byteLength = (value) => Buffer.byteLength(value, "utf8");
const envelopeBytes = (value) => byteLength(JSON.stringify(value));
const modelText = (content, readback) => JSON.stringify({ content, readback });
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
export async function runHeadroomWorker({ content, query, python, modelReadback }) {
  if (process.platform !== "darwin") return { failure: "unsupported-platform" };
  if (typeof python !== "string" || !path.isAbsolute(python)) return { failure: "runtime-unconfigured" };
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "temple-headroom-"));
  try {
    const realScratch = await fs.realpath(scratch);
    const profile = `(version 1)(allow default)(deny network*)(deny process-fork)(deny file-write*)(allow file-write* (subpath ${JSON.stringify(realScratch)}) (literal "/dev/null"))`;
    const result = spawnSync("/usr/bin/sandbox-exec", ["-p", profile, python, "-I", "-B", workerFile], {
      input: JSON.stringify({ content, query, model_readback: modelReadback }), encoding: "utf8", cwd: realScratch,
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
  return !path.resolve(filename).split(path.sep).some((part) => [".git", ".ai-org", ".agents", ".codex"].includes(part.toLowerCase()));
}

function writeSnapshot({ parent, device, inode, name, content }) {
  const snapshot = path.join(parent, name);
  const args = [adapterFile, "--snapshot-writer"];
  let command = process.execPath;
  if (process.platform === "darwin") {
    const profile = `(version 1)(allow default)(deny network*)(deny process-fork)(deny file-write*)(allow file-write* (literal ${JSON.stringify(snapshot)}) (literal "/dev/null"))`;
    args.unshift("-p", profile, process.execPath); command = "/usr/bin/sandbox-exec";
  }
  const result = spawnSync(command, args, {
    cwd: parent, env: { PATH: "/usr/bin:/bin" }, encoding: "utf8",
    input: JSON.stringify({ parent, device, inode, name, content }),
    timeout: HEADROOM_CONTRACT.timeoutMs, killSignal: "SIGKILL", maxBuffer: 16384
  });
  try {
    const value = JSON.parse(result.stdout);
    if (result.error || result.status !== 0) return { written: false, partial_possible: value.partial_possible === true };
    return value;
  } catch { return { written: false, partial_possible: true }; }
}

export async function createHeadroomView(options, dependencies) {
  return buildHeadroomView(options, dependencies, false);
}

// Keep operator diagnostics out of the exact text supplied as a tool response.
export async function createHeadroomPayload(options, dependencies) {
  const diagnostics = await buildHeadroomView(options, dependencies, true);
  const text = diagnostics.status === "compressed"
    ? modelText(diagnostics.content, diagnostics.readback) : diagnostics.content;
  return { text, diagnostics };
}

async function buildHeadroomView({ input, kind, enabled = false, python, snapshot, query = "" }, { runWorker = runHeadroomWorker } = {}, payload = false) {
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
  if (!safeSnapshot(physicalInput) || ["AGENTS.MD", "TEMPLE.MD", "CLAUDE.MD"].includes(path.basename(physicalInput).toUpperCase())) {
    output.reason = "protected-source"; return finish();
  }
  if (!["log", "json"].includes(kind)) { output.reason = "unsupported-kind"; return finish(); }
  if (kind === "json") {
    try { JSON.parse(content); } catch { output.reason = "invalid-json"; return finish(); }
  }
  if (bytes.length < HEADROOM_CONTRACT.minimumBytes) { output.reason = "below-threshold"; return finish(); }
  if (typeof query !== "string" || byteLength(query) > 4096) throw new Error("Query must be UTF-8 text no larger than 4 KiB");
  if (!safeSnapshot(snapshot)) { output.reason = "snapshot-unconfigured"; return finish(); }
  let snapshotParent;
  // Reject a symlinked parent resolving into canonical organization state as well.
  try {
    const parent = await fs.realpath(path.dirname(snapshot));
    if (!safeSnapshot(path.join(parent, path.basename(snapshot)))) throw new Error("protected parent");
    const stat = await fs.stat(parent, { bigint: true });
    snapshotParent = { parent, device: stat.dev.toString(), inode: stat.ino.toString(), name: path.basename(snapshot) };
    try { await fs.lstat(snapshot); output.reason = "snapshot-exists"; return finish(); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  } catch { output.reason = "snapshot-unavailable"; return finish(); }
  output.metrics.worker_attempts = 1;
  const readback = { snapshot: path.join(snapshotParent.parent, snapshotParent.name), sha256: originalHash };
  const workerStarted = performance.now();
  let result;
  try { result = await runWorker({ content, query, python, ...(payload ? { modelReadback: readback } : {}) }); }
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
    readback,
    metrics: { ...output.metrics, output_bytes: byteLength(result.content), snapshot_bytes: bytes.length,
      local_token_estimate: { ...output.metrics.local_token_estimate, returned_output: result.output_tokens } }
  };
  if (payload) {
    const text = modelText(result.content, readback);
    const measured = result.model_payload;
    if (!measured || measured.text !== text || measured.sha256 !== digest(text) ||
        !Number.isSafeInteger(measured.tokens) || measured.tokens < 0) {
      output.reason = "invalid-payload-measurement"; return finish();
    }
    const minimum = Math.max(HEADROOM_CONTRACT.minimumPayloadSavedTokens,
      Math.ceil(result.input_tokens * HEADROOM_CONTRACT.minimumPayloadSavingRatio));
    output.metrics.model_text_token_estimate = {
      tokenizer: "o200k_base", tokenizer_version: result.tokenizer_version,
      input: result.input_tokens, candidate_output: measured.tokens, returned_output: result.input_tokens,
      candidate_saved_tokens: result.input_tokens - measured.tokens, minimum_saved_tokens: minimum,
      scope: "exact model text including compressed readback metadata; excludes tool transport, history, model output and later readback"
    };
    if (byteLength(text) >= bytes.length || result.input_tokens - measured.tokens < minimum) {
      output.reason = "insufficient-payload-savings"; return finish();
    }
    candidate.metrics.model_text_token_estimate = {
      ...output.metrics.model_text_token_estimate, returned_output: measured.tokens
    };
    candidate.reason = "payload-savings-qualified";
  } else if (envelopeBytes(candidate) >= envelopeBytes(output) || result.output_tokens >= result.input_tokens) {
    output.reason = "no-net-reduction"; return finish();
  }
  const receipt = writeSnapshot({ ...snapshotParent, content });
  if (receipt.written !== true || receipt.sha256 !== originalHash || receipt.bytes !== bytes.length) {
    if (receipt.partial_possible) output.metrics.snapshot_bytes = null;
    output.reason = "snapshot-write-failed";
    return finish();
  }
  try {
    const reread = await readBoundedFile(candidate.readback.snapshot);
    if (digest(reread) !== originalHash) throw new Error("snapshot drift");
  } catch {
    output.metrics.snapshot_bytes = null; output.reason = "snapshot-readback-failed"; return finish();
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

// Internal one-shot writer. CWD anchors the directory; never reopen a full
// caller pathname after compression. The parent supplies its pre-worker identity.
function writeSnapshotInAnchoredDirectory() {
  let handle;
  let created = false;
  try {
    const request = JSON.parse(fsSync.readFileSync(0, "utf8"));
    const cwd = process.cwd();
    const stat = fsSync.statSync(".", { bigint: true });
    if (cwd !== request.parent || stat.dev.toString() !== request.device || stat.ino.toString() !== request.inode ||
        !safeSnapshot(cwd) || typeof request.name !== "string" || !request.name ||
        [".", ".."].includes(request.name) || path.basename(request.name) !== request.name ||
        typeof request.content !== "string") throw new Error("snapshot parent or leaf mismatch");
    const bytes = Buffer.from(request.content, "utf8");
    if (bytes.length > HEADROOM_CONTRACT.maximumBytes) throw new Error("snapshot size limit");
    handle = fsSync.openSync(request.name, "wx", 0o600); created = true;
    fsSync.writeFileSync(handle, bytes); fsSync.fsyncSync(handle);
    const written = fsSync.fstatSync(handle, { bigint: true });
    const current = fsSync.lstatSync(request.name, { bigint: true });
    if (process.cwd() !== request.parent || !current.isFile() || written.dev !== current.dev || written.ino !== current.ino) {
      throw new Error("snapshot moved during write");
    }
    fsSync.closeSync(handle); handle = undefined;
    console.log(JSON.stringify({ written: true, bytes: bytes.length, sha256: digest(bytes) }));
  } catch {
    if (handle !== undefined) { try { fsSync.closeSync(handle); } catch {} }
    console.log(JSON.stringify({ written: false, partial_possible: created }));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === adapterFile && process.argv[2] === "--snapshot-writer") {
  writeSnapshotInAnchoredDirectory();
}
