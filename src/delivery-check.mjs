import fs from "node:fs/promises";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { sha256 } from "./files.mjs";
import { ensure, safeFile, recordPath } from "./delivery-ledger.mjs";
import { confinedCheckCommand } from "./confined-check.mjs";
const exec = promisify(execFile);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Git-visible content, including untracked nonignored files. Git internals and
// ignored files are outside this snapshot; test-owned TMPDIR is checked separately.
export async function workspaceSnapshot(root, id, temporary = null) {
  const { stdout } = await exec("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root, maxBuffer: 2 * 1024 * 1024 });
  const names = [...new Set(stdout.split("\0").filter(Boolean))].sort();
  ensure(names.length <= 20000, "Workspace inventory file limit");
  const records = {};
  for (const name of names) {
    if (name === recordPath(id) || temporary && (name === temporary || name.startsWith(temporary + "/"))) continue;
    const file = path.join(root, name), stat = await fs.lstat(file).catch(e => { if (e.code === "ENOENT") return null; throw e; });
    if (!stat) records[name] = { missing: true };
    else if (stat.isSymbolicLink()) records[name] = { symlink: await fs.readlink(file) };
    else if (stat.isFile()) {
      ensure(stat.size <= 8 * 1024 * 1024, "Workspace inventory size limit");
      records[name] = { sha256: sha256(await fs.readFile(file)), mode: stat.mode & 0o777 };
    } else records[name] = { type: "non-file" };
  }
  return { records, digest: sha256(JSON.stringify(records)) };
}
async function residue(root) {
  const result = []; let count = 0;
  async function visit(relative) {
    for (const name of (await fs.readdir(path.join(root, relative))).sort()) {
      ensure(++count <= 10000, "Temporary inventory limit");
      const p = path.posix.join(relative, name), stat = await fs.lstat(path.join(root, p));
      result.push({ path: p, type: stat.isSymbolicLink() ? "symlink" : stat.isDirectory() ? "directory" : "file" });
      if (stat.isDirectory()) await visit(p);
    }
  }
  await visit(""); return result;
}
export async function runLocalChecks(root, id, plan, hooks = {}) {
  const started = Date.now(); let temporary;
  try {
    ensure(process.platform !== "win32", "Local check supervision currently requires POSIX");
    for (const test of plan.tests) await safeFile(root, test);
    temporary = await fs.mkdtemp(path.join(root, ".temple-check-"));
  } catch (error) {
    return { accepted: false, status: "instrument-failure", instrument_error: error.message, execution_started: false, process_exit_confirmed: true, temporary: null, temporary_removed: true, elapsed_ms: Date.now() - started };
  }
  const name = path.basename(temporary), result = { accepted: false, status: "running", temporary: name, temporary_removed: false, process_exit_confirmed: false };
  let child, pid, timedOut = false, overflow = false;
  const signalErrors = [], chunks = [], errors = []; let bytes = 0;
  const alive = () => { if (!pid) return false; try { process.kill(-pid, 0); return true; } catch (e) { return e.code !== "ESRCH"; } };
  const kill = () => { if (pid) try { process.kill(-pid, "SIGKILL"); } catch (e) { if (e.code !== "ESRCH") signalErrors.push(e.code); } };
  try {
    const before = await workspaceSnapshot(root, id, name);
    ensure(plan.tests.every(p => before.records[p]?.sha256), "Selected tests must be Git-visible regular files in the candidate snapshot");
    const env = { ...process.env, TMPDIR: temporary, TMP: temporary, TEMP: temporary }; delete env.NODE_TEST_CONTEXT;
    const confined = plan.check_policy === "confined-node" ? await confinedCheckCommand(root, temporary, plan.tests, plan.test_timeout_ms) : null;
    result.execution_boundary = confined?.boundary ?? { adapter: "trusted-local", parent_agent_confined: false };
    const exit = await new Promise(resolve => {
      child = spawn(process.execPath, [fileURLToPath(new URL("./delivery-check-worker.mjs", import.meta.url)), "--supervise", String(plan.test_timeout_ms), ...plan.tests], { cwd: root, env, detached: true, stdio: ["ignore", "pipe", "pipe", "ipc"] }); pid = child.pid;
      let settled = false;
      const finish = value => { if (settled) return; settled = true; clearTimeout(timer); clearTimeout(watchdog); resolve(value); };
      const timer = setTimeout(() => { timedOut = true; kill(); }, plan.test_timeout_ms);
      const watchdog = setTimeout(() => { kill(); child.stdout.destroy(); child.stderr.destroy(); child.unref(); finish({ code: null, error: "unconfirmed-process-close" }); }, plan.test_timeout_ms + 3000);
      for (const [stream, output] of [[child.stdout, chunks], [child.stderr, errors]]) stream.on("data", chunk => { bytes += chunk.length; if (bytes <= 128 * 1024) output.push(chunk); else { overflow = true; kill(); } });
      child.once("error", e => finish({ code: null, error: e.code ?? "spawn-failed" }));
      child.once("exit", code => { result.surviving_descendants = code === 0 && !timedOut && alive(); kill(); });
      child.once("close", code => finish({ code }));
      Promise.resolve().then(() => hooks.started?.({ process_group_id: pid, temporary: name })).then(() => {
        if (!settled && child.connected) child.send({ action: "start", ...(confined ? { confined } : {}) }, error => { if (error) { kill(); finish({ code: null, error: error.message }); } });
      }).catch(error => { kill(); finish({ code: null, error: error.message }); });
    });
    const deadline = Date.now() + 2000; while (alive() && Date.now() < deadline) await sleep(10);
    result.process_exit_confirmed = !alive(); result.process_group_id = pid ?? null;
    ensure(result.process_exit_confirmed, "Test process exit unconfirmed; preserve temporary area");
    const stdout = Buffer.concat(chunks).toString(), stderr = Buffer.concat(errors).toString();
    const after = await workspaceSnapshot(root, id, name);
    Object.assign(result, { exit_code: exit.code, stdout, stderr, timed_out: timedOut || /testTimeoutFailure|test timed out/.test(stdout),
      tests: Number(stdout.match(/^# tests (\d+)/m)?.[1] ?? 0), cancelled: Number(stdout.match(/^# cancelled (\d+)/m)?.[1] ?? 0),
      residue: await residue(temporary), workspace_changes: [...new Set([...Object.keys(before.records), ...Object.keys(after.records)])].filter(p => JSON.stringify(before.records[p]) !== JSON.stringify(after.records[p])),
      snapshot_digest: after.digest, instrument_error: exit.error ?? (overflow ? "output-limit" : null), termination_signal_errors: signalErrors });
    if (confined && result.tests === 0) result.instrument_error ??= "confined-runtime-did-not-report-tests";
    result.status = result.instrument_error ? "instrument-failure" : "completed";
    result.accepted = result.status === "completed" && result.exit_code === 0 && result.tests > 0 && !result.cancelled && !result.timed_out && !result.surviving_descendants && !result.residue.length && !result.workspace_changes.length;
  } catch (e) { result.status = "instrument-failure"; result.instrument_error = e.message; }
  finally {
    if (!pid) result.process_exit_confirmed = true;
    if (!pid || result.process_exit_confirmed) {
      try { await fs.rm(temporary, { recursive: true, force: true }); result.temporary_removed = true; }
      catch (e) { result.accepted = false; result.status = "instrument-failure"; result.instrument_error = e.message; }
    }
    result.elapsed_ms = Date.now() - started;
  }
  return result;
}
