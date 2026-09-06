// Local experiment telemetry only: no authority, raw text retention or providers.
import crypto from "node:crypto";
import path from "node:path";
import { constants, openSync, closeSync, fstatSync, readSync, lstatSync, realpathSync } from "node:fs";
import { wholeReadTargets } from "./delivery-command-policy.mjs";

export const observationLimits = Object.freeze({ bytes: 262144, sources: 16, failures: 16, events: 256 });
const fixturePaths = ["order.mjs", "test/public.test.mjs", "test/added.test.mjs", "package.json"];
const errorTypes = new Set(["AssertionError", "TypeError", "RangeError", "SyntaxError", "ReferenceError", "Error"]);

function readBounded(root, relative) {
  let fd;
  try {
    if (typeof relative !== "string" || !relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes("..")) return null;
    root = realpathSync(root);
    let file = root;
    for (const part of relative.split("/")) {
      file = path.join(file, part);
      if (lstatSync(file).isSymbolicLink()) return null;
    }
    if (!realpathSync(file).startsWith(root + path.sep)) return null;
    fd = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const before = fstatSync(fd);
    if (!before.isFile() || before.size > observationLimits.bytes) return null;
    const buffer = Buffer.alloc(before.size + 1);
    let n = 0, got;
    while (n < buffer.length && (got = readSync(fd, buffer, n, buffer.length - n, null)) > 0) n += got;
    const after = fstatSync(fd);
    if (n !== before.size || after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) return null;
    return buffer.subarray(0, n);
  } catch { return null; } finally { if (fd !== undefined) closeSync(fd); }
}

export function createDeliveryObserver({ root, key }) {
  if (!(typeof key === "string" || Buffer.isBuffer(key)) || !key.length) throw new Error("observation-key-required");
  const hash = value => "hmac-sha256:" + crypto.createHmac("sha256", key).update(value).digest("hex");
  const pending = new Map(), seen = new Map();
  let events = 0;
  const snapshot = () => fixturePaths.map(p => {
    const bytes = readBounded(root, p);
    return { source_id: hash(p), content_id: bytes === null ? null : hash(bytes), status: bytes === null ? "unavailable" : "observed" };
  });
  function exposure(relative, bytes) {
    const source_id = hash(relative), content_id = hash(bytes);
    const prior = seen.get(source_id);
    if (seen.size < observationLimits.events * observationLimits.sources) seen.set(source_id, content_id);
    return { source_id, content_id, bytes: bytes.length, range: "whole",
      relation: prior === undefined ? "first-observed" : prior === content_id ? "same-content-again" : "changed-since-last-read" };
  }
  function failures(output) {
    if (typeof output !== "string") return { status: "unavailable", failures: [] };
    if (Buffer.byteLength(output) > observationLimits.bytes) return { status: "over-limit", failures: [] };
    // Bounded Node spec footer and TAP subsets; arbitrary text stays unknown.
    // IDs/classes are observations from reporter text, not trusted judgments.
    output = output.replace(/\x1b\[[0-9;]*m/g, "");
    if (!/^TAP version 13\r?$/m.test(output)) {
      const count = output.match(/^ℹ fail (\d+)\r?$/m)?.[1];
      if (count === undefined || !/^ℹ tests \d+\r?$/m.test(output)) return { status: "unsupported", failures: [] };
      const footer = output.split(/\n✖ failing tests:\r?\n/)[1];
      const rows = []; let current = null, capped = false;
      for (const line of (footer ?? "").split(/\r?\n/)) {
        const failed = line.match(/^\s*✖ (.+) \([0-9.]+ms\)$/);
        if (failed) {
          if (rows.length >= observationLimits.failures) { capped = true; current = null; continue; }
          current = { test_id: hash(failed[1]), error_type: "unknown" }; rows.push(current);
        } else if (current) {
          const type = line.match(/^  ([A-Za-z]+)(?: \[[A-Z_0-9]+\])?:/)?.[1];
          if (errorTypes.has(type)) { current.error_type = type; current = null; }
        }
      }
      return { status: capped ? "over-limit" : rows.length === Number(count) ? "recognized" : "partial", reporter: "node-spec", failures: rows };
    }
    const rows = [], lines = output.split(/\r?\n/);
    let current = null, diagnostic = false, capped = false;
    for (const line of lines) {
      const failed = line.match(/^\s*not ok (\d+) - (.+)$/);
      if (failed) {
        if (rows.length >= observationLimits.failures) { capped = true; current = null; continue; }
        current = { test_id: hash(failed[2]), error_type: "unknown" }; rows.push(current); diagnostic = false;
      } else if (/^\s*ok \d+/.test(line)) { current = null; diagnostic = false; }
      else if (current && /^\s+---$/.test(line)) diagnostic = true;
      else if (/^\s+\.\.\.$/.test(line)) diagnostic = false;
      else if (current && diagnostic) {
        const type = line.match(/^\s+name: ['"]?([A-Za-z]+)['"]?$/)?.[1];
        if (errorTypes.has(type)) current.error_type = type;
      }
    }
    const complete = /^1\.\.\d+\r?$/m.test(output) && /^# fail \d+\r?$/m.test(output);
    return { status: capped ? "over-limit" : complete ? "recognized" : "partial", reporter: "tap", failures: rows };
  }
  return {
    observe(method, item, decision, context) {
      if (!decision?.allowed || item?.type !== "commandExecution") return null;
      if (!["item/started", "item/completed"].includes(method)) return null;
      if (++events > observationLimits.events) return { status: "observation-limit" };
      const isTest = decision.operation?.startsWith("product-tests-");
      try {
        if (method === "item/started") {
          if (isTest) pending.set(item.id, snapshot());
          return null;
        }
        if (isTest) {
          const before = pending.get(item.id) ?? null; pending.delete(item.id);
          const after = snapshot();
          const complete = before && [...before, ...after].every(r => r.status === "observed");
          return { schema_version: "temple.command-observation/v1", test: {
            ...failures(item.aggregatedOutput), inputs_before: before, inputs_after: after,
            boundary_inputs: !complete ? "unknown" : JSON.stringify(before) === JSON.stringify(after) ? "same-at-boundaries" : "changed-at-boundaries"
          } };
        }
        if (item.exitCode !== 0) return null;
        if (decision.operation === "cat") {
          const targets = wholeReadTargets(item, context);
          if (!targets || typeof item.aggregatedOutput !== "string" || Buffer.byteLength(item.aggregatedOutput) > observationLimits.bytes) return { read_status: "unknown", sources: [] };
          const bodies = targets.map(p => readBounded(root, p));
          if (bodies.some(b => b === null) || bodies.reduce((n,b) => n+b.length,0) > observationLimits.bytes || !Buffer.concat(bodies).equals(Buffer.from(item.aggregatedOutput))) return { read_status: "unknown", sources: [] };
          return { read_status: "output-matched", sources: targets.map((p,i) => exposure(p,bodies[i])) };
        }
        if (decision.operation === "temple-context-enter") {
          if (typeof item.aggregatedOutput !== "string" || Buffer.byteLength(item.aggregatedOutput) > observationLimits.bytes) return { read_status: "unknown", sources: [] };
          const body = JSON.parse(item.aggregatedOutput), sources = body?.packet?.sources;
          if (!["temple.context-enter/v1", "temple.context-model-view/v1"].includes(body.schema_version) || !Array.isArray(sources) || sources.length > observationLimits.sources) return { read_status: "unknown", sources: [] };
          const rows = [];
          for (const s of sources) {
            if (s.body === null) continue; // References/reuse are not exposure.
            const bytes = readBounded(root, s.path);
            if (typeof s.body !== "string" || bytes === null || !bytes.equals(Buffer.from(s.body))) return { read_status: "unknown", sources: [] };
            rows.push([s.path,bytes]);
          }
          return { read_status: "output-matched", sources: rows.map(([p,b])=>exposure(p,b)) };
        }
        return null;
      } catch { return { status: "observation-unavailable" }; }
    }
  };
}
