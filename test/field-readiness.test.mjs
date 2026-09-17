import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { contributorReadiness, buildCollaborationState } from "../src/collaboration.mjs";
import { createWorkItem } from "../src/work-items.mjs";
import { operationErrorResult } from "../src/operation-errors.mjs";

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "temple-readiness-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const write = async (name, value) => { await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true }); await fs.writeFile(path.join(root, name), JSON.stringify(value)); };
  const agents = ["build", "other", "review"].map(name => ({ id: `agent-${name}`, display_name: name, active: true }));
  const assignments = { assignments: [{ position_id: "developer", agent_id: "agent-build", active: true }, { position_id: "quality_evaluator", agent_id: "agent-review", active: true }] };
  const collaboration = buildCollaborationState(assignments);
  collaboration.memberships.push({ ...structuredClone(collaboration.memberships[0]), agent_id: "agent-other", default: false });
  await write(".ai-org/project/project.json", { id: "readiness-fixture" });
  await write(".ai-org/project/agents.json", { agents }); await write(".ai-org/project/assignments.json", assignments);
  await write(".ai-org/project/collaboration.json", collaboration);
  await write(".ai-org/core/positions.json", { positions: [{ id: "developer" }, { id: "quality_evaluator" }] });
  const item = { id: "WI-0001", state: "build", owner_position: "developer", assigned_agent_id: "agent-build", planned_agent_id: "agent-other", claim: null };
  await write(".ai-org/work-items/WI-0001.json", item);
  return { root, write, item, options: { workItemId: item.id, principalId: "human", agentId: "agent-build", positionId: "developer" } };
}

test("qualified member sees planned-owner blocker and actionable CLI failure without state writes", async t => {
  const { root, options } = await fixture(t);
  const before = await fs.readFile(path.join(root, ".ai-org/work-items/WI-0001.json"));
  const result = await contributorReadiness(root, options);
  assert.equal(result.ready, true); assert.equal(result.task_ready, false);
  assert.equal(result.task.blockers[0].code, "TEMPLE_ACTOR_PLAN_MISMATCH");
  assert.equal(result.task.responsible_actor, "agent-other");
  assert.equal(result.task.recorded_agent_id, "agent-build");
  const cli = spawnSync(process.execPath, [new URL("../bin/temple.mjs", import.meta.url).pathname, "collaboration", "readiness", root,
    "--work-item", options.workItemId, "--principal-id", "human", "--agent-id", "agent-build", "--position", "developer", "--json"], { encoding: "utf8" });
  assert.equal(cli.status, 1, cli.stderr); assert.equal(JSON.parse(cli.stdout).task_ready, false);
  assert.deepEqual(await fs.readFile(path.join(root, ".ai-org/work-items/WI-0001.json")), before);
});

test("claim continuation and conflicts name actual owner, while wrong stage and terminal work cannot start", async t => {
  const { root, options, item, write } = await fixture(t);
  item.planned_agent_id = null; item.claim = { id: "claim-one", status: "active", agent_id: "agent-build", principal_id: "human", position_id: "developer" };
  await write(".ai-org/work-items/WI-0001.json", item);
  let result = await contributorReadiness(root, options);
  assert.equal(result.task_ready, true); assert.equal(result.task.next_operation, "context resolve");
  assert.equal(result.task.active_claim.id, "claim-one");
  result = await contributorReadiness(root, { ...options, agentId: "agent-other" });
  assert.equal(result.task_ready, false); assert.equal(result.task.responsible_actor, "agent-build");
  result = await contributorReadiness(root, { ...options, agentId: "agent-review", positionId: "quality_evaluator" });
  assert.equal(result.ready, true); assert.equal(result.task_ready, false);
  assert.equal(result.task.blockers[0].code, "TEMPLE_TASK_WRONG_POSITION");
  item.claim = null; item.state = "done"; await write(".ai-org/work-items/WI-0001.json", item);
  result = await contributorReadiness(root, options);
  assert.equal(result.task_ready, false); assert.equal(result.task.blockers[0].code, "TEMPLE_TASK_TERMINAL");
});

test("unknown route is a concrete no-write input error, not uncertain execution", async t => {
  const { root, write } = await fixture(t);
  await write("temple.lock", {});
  await write(".ai-org/core/workflow.json", { states: [] });
  await write(".ai-org/core/policies.json", {});
  await write(".ai-org/project/context-map.json", { routes: [{ id: "known-route" }] });
  const before = await fs.readdir(path.join(root, ".ai-org/work-items"));
  await assert.rejects(createWorkItem(root, { title: "No write", contextRefs: ["docs/not-a-route.md"] }), error => {
    const result = operationErrorResult(error);
    assert.equal(result.code, "INVALID_INPUT"); assert.equal(result.mutation_status, "not_started");
    assert.deepEqual(result.details.available_context_refs, ["known-route"]);
    assert.match(result.next_action, /route ID/); return true;
  });
  assert.deepEqual(await fs.readdir(path.join(root, ".ai-org/work-items")), before);
});
