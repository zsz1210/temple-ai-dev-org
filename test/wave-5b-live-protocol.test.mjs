import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { sanitizeBlindPackage, validateFrozenScores } from "../scripts/run-wave-5b-evaluator.mjs";

const blind = {
  package_id: "pkg-001",
  evidence_id: "evd-001",
  case_id: "case-a",
  product_patch: "patch",
  tests: { public: "pass", acceptance: "pass" },
  completion: { remaining_risks: [] },
  usage: { total_tokens: null },
  candidate_revision: "secret",
  condition: "temple"
};

test("evaluator package sanitizer removes condition, usage, Token, and revision fields", () => {
  const result = sanitizeBlindPackage(blind);
  assert.equal(result.package_id, "pkg-001");
  assert.equal(result.usage, undefined);
  assert.equal(result.candidate_revision, undefined);
  assert.equal(result.condition, undefined);
  assert.doesNotMatch(JSON.stringify(result), /token/i);
});

test("Wave 5B setup accepts a pinned protocol path and emits Luna Medium candidate limits", async (testContext) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wave5b-setup-test-"));
  const lab = path.join(root, "lab");
  testContext.after(() => fs.rm(root, { recursive: true, force: true }));
  const run = spawnSync(process.execPath, [
    new URL("../.ai-org/artifacts/WI-0107/setup-wave-5a.mjs", import.meta.url).pathname,
    "--protocol-path", new URL("../.ai-org/artifacts/WI-0117/wave-5b-protocol.json", import.meta.url).pathname,
    "--lab-root", lab
  ], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const manifest = JSON.parse(await fs.readFile(path.join(lab, "coordinator", "validation-program.json"), "utf8"));
  assert.equal(manifest.id, "wave-5b-lean-process-comparison");
  assert.equal(manifest.limits.aggregate_hard_tokens, 240000);
  assert.equal(manifest.waves.length, 4);
  for (const wave of manifest.waves) {
    assert.equal(wave.turns[0].requested_model, "gpt-5.6-luna");
    assert.equal(wave.turns[0].requested_reasoning_effort, "medium");
  }
});

test("frozen scores require one bounded score for every exact package identity", () => {
  const packages = [sanitizeBlindPackage(blind)];
  const result = validateFrozenScores({
    packages: [{
      package_id: "pkg-001",
      case_id: "case-a",
      weighted_score: 1,
      decision: "pass",
      critical_failure: null,
      rationale: "All acceptance evidence passes."
    }],
    summary: "Qualified"
  }, packages);
  assert.equal(result.packages[0].decision, "pass");
});

test("frozen scores reject missing, duplicate, unknown, or unbounded package results", () => {
  const packages = [sanitizeBlindPackage(blind)];
  assert.throws(() => validateFrozenScores({ packages: [], summary: "" }, packages), /count/);
  assert.throws(() => validateFrozenScores({ packages: [{ package_id: "other", case_id: "case-a", weighted_score: 1, decision: "pass" }] }, packages), /identity/);
  assert.throws(() => validateFrozenScores({ packages: [{ package_id: "pkg-001", case_id: "case-a", weighted_score: 2, decision: "pass" }] }, packages), /outside/);
});
