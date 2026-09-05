import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { sha256 } from "./files.mjs";
import { OperationError } from "./operation-errors.mjs";

// Per-checkout recovery data, never lifecycle authority or distributed locking.
export async function leanDeliveryStateDirectory(target, required = false) {
  const git = spawnSync("git", ["-C", target, "rev-parse", "--absolute-git-dir"], { encoding: "utf8" });
  if (git.status !== 0) {
    if (required) throw new Error("Lean delivery requires a Git repository");
    return null;
  }
  const root = await fs.realpath(target);
  let directory = await fs.realpath(git.stdout.trim());
  for (const part of ["temple", "lean-delivery", sha256(root).slice(0, 20)]) {
    directory = path.join(directory, part);
    const stat = await fs.lstat(directory).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) throw new Error("Unsafe Lean delivery state directory");
  }
  return directory;
}

export async function readPendingLeanDelivery(target) {
  const directory = await leanDeliveryStateDirectory(target);
  if (!directory) return null;
  const pendingPath = path.join(directory, "pending.json");
  try {
    const stat = await fs.lstat(pendingPath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Unsafe Lean delivery journal");
    return { directory, journal: JSON.parse(await fs.readFile(pendingPath, "utf8")) };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function assertNoPendingLeanDelivery(target, allowedOperation = null) {
  const pending = await readPendingLeanDelivery(target);
  if (!pending) return;
  if (allowedOperation && pending.journal.operation_key === allowedOperation) return;
  throw new OperationError("PENDING_RECOVERY", `Lean delivery recovery is pending (${pending.journal.operation_key ?? "invalid journal"}); retry the identical work-item deliver request before other mutations`, "pending_recovery");
}
