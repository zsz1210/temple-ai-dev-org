import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fixture, cli, git, deliveryArgs, itemState, canonicalBytes } from "./helpers/lean-delivery-fixture.mjs";
import { finishLeanWorkItem } from "../src/lean-finish.mjs";
import { withProjectMutationLock } from "../src/project.mjs";
import { leanDeliveryStateDirectory } from "../src/lean-delivery-state.mjs";
import { validateRuntimeWorkerRegistry } from "../src/workers.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const procedure = ".agents/skills/temple-work/references/lean-execution.md";
function installed(f, args, allowFailure = false) {
  const result = spawnSync(process.execPath, [path.join(f.target, "templew.mjs"), ...args], { cwd: f.target, encoding: "utf8", env: { ...process.env, TEMPLE_CLI_PATH: path.join(root, "bin/temple.mjs") } });
  if (!allowFailure) assert.equal(result.status, 0, result.stderr || result.stdout);
  return result;
}
function entryArgs(f, extra = [], actor = f.request.agentId, position = "developer") {
  return ["context", "enter", ".", "--work-item", f.item.id, "--position", position, "--agent-id", actor, "--principal-id", "human", "--no-write", "--json", ...extra];
}
async function setup(t) {
  const f = await fixture(); t.after(f.cleanup);
  const filename = path.join(f.target, ".ai-org/project/repository-integration.json");
  const document = JSON.parse(await fs.readFile(filename));
  await fs.writeFile(filename, JSON.stringify({ ...document, status: "confirmed", source: "human-confirmed", summary: "Local fixture only", change_isolation: "not-required", review_gate: "not-required", recorded_at: "2026-09-01T00:00:00.000Z", recorded_by: "human" }));
  return f;
}
async function mutateItem(f, values) {
  await fs.writeFile(path.join(f.target, `.ai-org/work-items/${f.item.id}.json`), JSON.stringify({ ...await itemState(f), ...values }));
}
async function assertReadOnly(f, args, status) {
  const before = await canonicalBytes(f);
  const result = installed(f, args, true);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, status, JSON.stringify(output.reasons));
  assert.equal(result.status, status === "eligible" ? 0 : 1);
  assert.deepEqual(await canonicalBytes(f), before);
  if (status === "fallback") assert.equal(output.packet, null);
  return output;
}

test("Installed cold Builder and fresh distinct Verifier enter, claim and explicitly finish exact candidate", async t => {
  const f = await setup(t);
  installed(f, ["work-item", "release", ".", "--work-item", f.item.id, "--agent-id", f.request.agentId, "--principal-id", "human"]);
  const cold = await assertReadOnly(f, entryArgs(f), "eligible");
  assert.equal(cold.navigation.operation, "work-item claim");
  assert.equal(cold.coverage.bootstrap_waived, false);
  const sources = new Map(cold.packet.sources.map(source => [source.path, source]));
  for (const relative of ["AGENTS.md", "TEMPLE.md", ".agents/skills/temple-work/SKILL.md", procedure, ".ai-org/core/policies.json", ".ai-org/core/workflow.json", "docs/brief.md"]) {
    assert.equal(sources.get(relative)?.representation, "whole-source", relative);
    assert.equal(sources.get(relative)?.body, await fs.readFile(path.join(f.target, relative), "utf8"));
  }
  assert.ok((await fs.readFile(path.join(f.target, "AGENTS.md"), "utf8")).includes("context enter"));
  assert.equal((await fs.readFile(path.join(f.target, "CLAUDE.md"), "utf8")).trim(), "@AGENTS.md");
  const claim = JSON.parse(installed(f, ["work-item", "claim", ".", "--work-item", f.item.id, "--agent-id", f.request.agentId, "--principal-id", "human", "--base-revision", f.request.revision, "--branch", "main", "--json"]).stdout).item.claim;
  const builder = await assertReadOnly(f, entryArgs(f), "eligible");
  assert.equal(builder.navigation.operation, "work-item finish");
  assert.match(builder.navigation.packet_next_step_role, /existing-route-alternative/);
  assert.notEqual(builder.entry_digest, cold.entry_digest);
  const finishArgs = deliveryArgs(f); finishArgs[1] = "finish"; finishArgs[2] = "."; finishArgs[finishArgs.indexOf("--claim-id") + 1] = claim.id; finishArgs.push("--position", "developer");
  const beforeFinish = await canonicalBytes(f);
  const finishPreview = JSON.parse(installed(f, [...finishArgs, "--dry-run"]).stdout);
  assert.notEqual(finishPreview.mutation.plan_digest, builder.entry_digest);
  assert.notEqual(installed(f, [...finishArgs, "--dry-run", "--expected-plan", builder.entry_digest], true).status, 0);
  assert.deepEqual(await canonicalBytes(f), beforeFinish);
  assert.equal(JSON.parse(installed(f, finishArgs).stdout).success, true);
  const verifier = await assertReadOnly(f, entryArgs(f, [], f.qualityAgent, "quality_evaluator"), "eligible");
  assert.equal(verifier.navigation.operation, "work-item claim");
  assert.equal(verifier.navigation.candidate_revision, f.request.revision);
  assert.notEqual(f.qualityAgent, f.request.agentId);
  for (const relative of [verifier.packet.entry.candidate.handoff.artifact, "docs/developer-test.md", procedure]) assert.equal(verifier.packet.sources.find(source => source.path === relative)?.body, await fs.readFile(path.join(f.target, relative), "utf8"));
  const qualityClaim = JSON.parse(installed(f, ["work-item", "claim", ".", "--work-item", f.item.id, "--agent-id", f.qualityAgent, "--principal-id", "human", "--base-revision", f.request.revision, "--branch", "main", "--json"]).stdout).item.claim;
  const claimedVerifier = await assertReadOnly(f, entryArgs(f, [], f.qualityAgent, "quality_evaluator"), "eligible");
  assert.equal(claimedVerifier.navigation.claim_id, qualityClaim.id);
  assert.equal(claimedVerifier.navigation.operation, "work-item finish");
  assert.match(claimedVerifier.navigation.packet_next_step_role, /existing-route-alternative/);
  const verification = spawnSync(process.execPath, ["--test", "app.test.mjs"], { cwd: f.target, encoding: "utf8" });
  assert.equal(verification.status, 0, verification.stderr);
  await fs.writeFile(path.join(f.target, "docs/verification.md"), `# Verifier evidence\nExact candidate ${f.request.revision}; decimal parses and non-digit rejected.\n`);
  await fs.writeFile(path.join(f.target, "docs/closeout.md"), "# Lean acceptance\nCriteria pass, no unresolved work. No Independent QA claimed.\n");
  const accepted = JSON.parse(installed(f, ["work-item", "finish", ".", "--work-item", f.item.id, "--position", "quality_evaluator", "--operation-id", "accept-parser", "--claim-id", qualityClaim.id, "--agent-id", f.qualityAgent, "--principal-id", "human", "--revision", f.request.revision, "--judgment", "pass", "--test-evidence", "docs/verification.md", "--lean-closeout", "docs/closeout.md", "--json"]).stdout);
  assert.equal(accepted.success, true); assert.equal((await itemState(f)).state, "done");
});

test("Entry rejects profile, contract, ownership and actor exceptions without material or writes", async t => {
  const f = await setup(t); const original = await itemState(f);
  for (const values of [{ workflow_profile: "standard" }, { risk_tier: "high" }, { ui_delivery_mode: "code-first" }, { scope: [] }, { scope: [" "] }, { acceptance_criteria: [] }, { affected_paths: [] }, { unresolved: ["Criterion open"] }, { claim: { ...original.claim, agent_id: f.qualityAgent } }, { claim: { ...original.claim, base_revision: "not-a-revision" } }, { profile_assessment: { ...original.profile_assessment, scope_class: "cross-system" } }]) {
    await mutateItem(f, { ...original, ...values }); await assertReadOnly(f, entryArgs(f), "fallback");
  }
  await mutateItem(f, original);
  await assertReadOnly(f, entryArgs(f, ["--purpose", "recovery"]), "fallback");
  await assertReadOnly(f, entryArgs(f, [], f.qualityAgent), "fallback");
  const args = entryArgs(f); args[args.indexOf("--principal-id") + 1] = "stranger";
  await assertReadOnly(f, args, "fallback");
});

test("Entry reassesses current policy and collaborative sponsorship", async t => {
  const f = await setup(t);
  const workflowPath = path.join(f.target, ".ai-org/core/workflow.json"); const original = await fs.readFile(workflowPath, "utf8");
  const workflow = JSON.parse(original); workflow.profile_assessment.risk_tier_floors.low = "standard";
  await fs.writeFile(workflowPath, JSON.stringify(workflow));
  assert.ok((await assertReadOnly(f, entryArgs(f), "fallback")).reasons.some(reason => reason.code === "current-policy-requires-stronger-profile"));
  await fs.writeFile(workflowPath, original);
  const collaborationPath = path.join(f.target, ".ai-org/project/collaboration.json"); const collaboration = JSON.parse(await fs.readFile(collaborationPath)); collaboration.profile = "collaborative";
  await fs.writeFile(collaborationPath, JSON.stringify(collaboration));
  assert.ok((await assertReadOnly(f, entryArgs(f), "fallback")).reasons.some(reason => reason.code === "invalid-principal-or-sponsor"));
});

test("Overlaps and active workers use existing body-free route", async t => {
  const f = await setup(t);
  const workerPath = path.join(f.target, ".ai-org/project/runtime-workers.json");
  const prior = await fs.readFile(workerPath, "utf8").catch(() => null);
  const worker = { id: "worker-active", runtime_kind: "internal-subagent", status: "active", work_item_id: f.item.id, position_id: "developer", agent_id: f.request.agentId, principal_id: "human", claim_id: f.request.claimId, base_revision: f.request.revision, branch: "main", worktree: null, plan_fingerprint: "a".repeat(64), plan_digest: "b".repeat(64), preparation_fingerprint: "c".repeat(64), wave_id: "wave-001", runtime_id: "fixture-runtime", task_id: null, resource_reservation_ids: [], current_revision: null, evidence: [], reserved_at: "2026-09-01T00:00:00.000Z", attached_at: "2026-09-01T00:00:00.000Z", completed_at: null, updated_at: "2026-09-01T00:00:00.000Z" };
  const workers = { schema_version: "temple.runtime-workers/v1", workers: [worker] }; assert.equal(validateRuntimeWorkerRegistry(workers).valid, true);
  await fs.writeFile(workerPath, JSON.stringify(workers));
  await assertReadOnly(f, entryArgs(f), "fallback");
  await fs.writeFile(workerPath, JSON.stringify({ schema_version: "unknown", workers: [] }));
  await assertReadOnly(f, entryArgs(f), "fallback");
  if (prior === null) await fs.rm(workerPath); else await fs.writeFile(workerPath, prior);
  cli(["work-item", "create", f.target, "--title", "Overlap", "--scope", "Same parser", "--acceptance", "Parser passes", "--affected-path", "app.mjs", "--json"]);
  const output = await assertReadOnly(f, entryArgs(f), "fallback");
  assert.ok(output.reasons.some(reason => reason.code === "affected-path-overlap"));
});

test("Missing or unsafe required sources fail closed without partial bodies", async t => {
  const f = await setup(t);
  for (const relative of [procedure, "docs/brief.md"]) {
    const filename = path.join(f.target, relative); const body = await fs.readFile(filename);
    await fs.rm(filename); await assertReadOnly(f, entryArgs(f), "fallback");
    const external = path.join(f.temporary, "external.md"); await fs.writeFile(external, body); await fs.symlink(external, filename);
    await assertReadOnly(f, entryArgs(f), "fallback"); await fs.rm(filename); await fs.writeFile(filename, body);
  }
});

test("Entry digest binds actor, purpose, claim, runtime state and full projected-away authority", async t => {
  const f = await setup(t); const preview = await assertReadOnly(f, entryArgs(f), "eligible");
  await assertReadOnly(f, entryArgs(f, ["--expected-plan", preview.entry_digest]), "eligible");
  const filename = path.join(f.target, ".ai-org/core/positions.json"); const original = await fs.readFile(filename, "utf8"); const positions = JSON.parse(original);
  positions.positions.find(row => row.id === "product_manager").purpose += " changed"; await fs.writeFile(filename, JSON.stringify(positions));
  const before = await canonicalBytes(f); const stale = installed(f, entryArgs(f, ["--expected-plan", preview.entry_digest]), true);
  assert.notEqual(stale.status, 0); assert.match(stale.stderr, /Entry inputs changed/); assert.deepEqual(await canonicalBytes(f), before);
  await fs.writeFile(filename, original);
  const workerPath = path.join(f.target, ".ai-org/project/runtime-workers.json"); const workers = await fs.readFile(workerPath, "utf8");
  await fs.writeFile(workerPath, workers + "\n");
  assert.match(installed(f, entryArgs(f, ["--expected-plan", preview.entry_digest]), true).stderr, /Entry inputs changed/);
  await fs.writeFile(workerPath, workers);
  for (const args of [entryArgs(f, ["--expected-plan", preview.entry_digest, "--purpose", "integration"]), entryArgs(f, ["--expected-plan", preview.entry_digest], f.qualityAgent)]) {
    const result = installed(f, args, true); assert.notEqual(result.status, 0); assert.match(result.stderr, /Entry inputs changed/);
  }
  await mutateItem(f, { claim: { ...(await itemState(f)).claim, branch: "changed-binding" } });
  assert.match(installed(f, entryArgs(f, ["--expected-plan", preview.entry_digest]), true).stderr, /Entry inputs changed/);
});

test("Fresh Verifier cannot accept same Identity, changed candidate, or dirty product", async t => {
  const f = await setup(t); cli(deliveryArgs(f)); const original = await itemState(f);
  const verifierArgs = entryArgs(f, [], f.qualityAgent, "quality_evaluator");
  await mutateItem(f, { handoffs: original.handoffs.map(row => ({ ...row, actor: f.qualityAgent })) });
  assert.ok((await assertReadOnly(f, verifierArgs, "fallback")).reasons.some(reason => reason.code === "verifier-must-be-distinct"));
  await mutateItem(f, original); await fs.appendFile(path.join(f.target, "app.mjs"), "\n// dirty\n");
  await assertReadOnly(f, verifierArgs, "fallback"); git(f.target, ["add", "app.mjs"]); git(f.target, ["commit", "-m", "Changed candidate"]);
  assert.ok((await assertReadOnly(f, verifierArgs, "fallback")).reasons.some(reason => reason.code === "candidate-binding-mismatch"));
});

for (const checkpoint of ["journal", "diagnostics-pending"]) test(`Pending ${checkpoint} falls back without recovery writes`, async t => {
  const f = await setup(t); f.request.position = "developer";
  await assert.rejects(withProjectMutationLock(f.target, () => finishLeanWorkItem(f.target, f.request, { checkpoint: point => { if (point === checkpoint) throw new Error("injected interruption"); } }), { leanDeliveryOperation: `${f.item.id}/${f.request.operationId}` }));
  const directory = await leanDeliveryStateDirectory(f.target); const names = await fs.readdir(directory); const before = await Promise.all(names.map(async name => [name, await fs.readFile(path.join(directory, name), "utf8")]));
  const item = await itemState(f); const position = item.state === "test" ? "quality_evaluator" : "developer";
  await assertReadOnly(f, entryArgs(f, [], position === "developer" ? f.request.agentId : f.qualityAgent, position), "fallback");
  assert.deepEqual(await Promise.all(names.map(async name => [name, await fs.readFile(path.join(directory, name), "utf8")])), before);
});

test("Entry requires explicit actor and read-only machine contract; ordinary packet stays compatible", async t => {
  const f = await setup(t);
  for (const flag of ["--agent-id", "--principal-id", "--position", "--work-item", "--no-write", "--json"]) {
    const args = entryArgs(f); const index = args.indexOf(flag); args.splice(index, ["--no-write", "--json"].includes(flag) ? 1 : 2);
    assert.notEqual(installed(f, args, true).status, 0);
  }
  for (const extra of [["--material", "stage"], ["--agent-id", f.request.agentId], ["--expected-plan", "invalid"]]) assert.notEqual(installed(f, entryArgs(f, extra), true).status, 0);
  const packet = JSON.parse(installed(f, ["context", "packet", ".", "--work-item", f.item.id, "--position", "developer", "--no-write", "--json"]).stdout);
  assert.equal(packet.schema_version, "temple.context-packet/v1");
  assert.ok(packet.sources.some(source => source.path.endsWith("references/lean-delivery.md")));
  assert.ok(!packet.sources.some(source => source.path === procedure));
  const item = await itemState(f); const ordinaryProcedure = ".agents/skills/temple-work/references/lean-delivery.md";
  await mutateItem(f, { gate_evidence: { ...item.gate_evidence, approved_scope: [...item.gate_evidence.approved_scope, ordinaryProcedure] } });
  const scoped = await assertReadOnly(f, entryArgs(f), "eligible");
  for (const relative of [procedure, ordinaryProcedure]) assert.equal(scoped.packet.sources.find(source => source.path === relative)?.body, await fs.readFile(path.join(f.target, relative), "utf8"));
});
