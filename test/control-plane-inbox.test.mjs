import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildHumanInbox,
  createHumanInboxGateway,
  readInboxSubmissions
} from "../src/control-plane-inbox.mjs";
import { defaultControlPlaneConfig } from "../src/control-plane-config.mjs";
import { startControlPlaneServer } from "../src/control-plane-server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function git(target, args) {
  return spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
}

async function writeJson(targetPath, value) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

async function fixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-inbox-test-"));
  const target = path.join(temporaryRoot, "inbox-product");
  const configPath = path.join(temporaryRoot, "init.json");
  const stateDirectory = path.join(temporaryRoot, "state");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await writeJson(configPath, {
    schema_version: "temple.init/v1",
    project: { id: "inbox-product", name: "Inbox Product" },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  });
  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  assert.equal(git(target, ["init", "-q"]).status, 0);
  assert.equal(git(target, ["config", "user.email", "temple-tests@example.invalid"]).status, 0);
  assert.equal(git(target, ["config", "user.name", "Temple Tests"]).status, 0);
  assert.equal(git(target, ["add", "."]).status, 0);
  assert.equal(git(target, ["commit", "-qm", "initial state"]).status, 0);
  const created = run([
    "work-item", "create", target,
    "--title", "Bounded Inbox decision",
    "--scope", "Keep each authority class separate",
    "--acceptance", "One submission creates at most one canonical mutation",
    "--affected-path", "src/inbox",
    "--base-revision", "HEAD",
    "--ui-mode", "not-applicable",
    "--json"
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const workItemId = JSON.parse(created.stdout).item.id;
  return {
    temporaryRoot,
    target,
    stateDirectory,
    workItemId,
    itemPath: path.join(target, ".ai-org/work-items", `${workItemId}.json`),
    revision: git(target, ["rev-parse", "HEAD"]).stdout.trim()
  };
}

function fakeProvider(requests) {
  const pending = new Map(requests.map((request) => [request.request_id, { ...request }]));
  const answers = [];
  return {
    answers,
    pendingRequests() {
      return [...pending.values()].filter((request) => request.answerable !== false).map((request) => structuredClone(request));
    },
    answerRuntimeRequest(requestId, action) {
      const request = pending.get(String(requestId));
      if (!request || request.answerable === false) throw new Error("Runtime request is no longer live or answerable");
      answers.push({ request_id: String(requestId), action: structuredClone(action) });
      request.answerable = false;
      pending.delete(String(requestId));
      return {
        request_id: String(requestId),
        method: request.request_method,
        request_class: request.request_class,
        answered: true
      };
    }
  };
}

test("Human Inbox keeps runtime permission and business-fact authority separate and idempotent", async (context) => {
  const { target, stateDirectory, workItemId, itemPath, revision } = await fixture(context);
  const provider = fakeProvider([
    {
      request_id: "runtime-1",
      request_method: "item/commandExecution/requestApproval",
      request_class: "runtime-permission",
      observed_at: "2026-08-30T01:00:00.000Z",
      answerable: true,
      available_decisions: ["accept", "decline"],
      reason: "Run the bounded verification",
      command_present: true,
      work_item_id: workItemId,
      task_id: "task-runtime"
    },
    {
      request_id: "business-1",
      request_method: "item/tool/requestUserInput",
      request_class: "business-fact",
      observed_at: "2026-08-30T01:01:00.000Z",
      answerable: true,
      work_item_id: workItemId,
      task_id: "task-business",
      questions: [
        { id: "region", question: "Which region?", is_secret: false, options: [] },
        { id: "credential", question: "Temporary credential?", is_secret: true, options: [] }
      ]
    }
  ]);
  const gateway = createHumanInboxGateway({
    target,
    stateDirectory,
    codexProvider: provider,
    privacy: defaultControlPlaneConfig().privacy
  });

  const runtimePayload = {
    idempotency_key: "runtime-command-0001",
    request_id: "runtime-1",
    expected_method: "item/commandExecution/requestApproval",
    expected_observed_at: "2026-08-30T01:00:00.000Z",
    decision: "accept"
  };
  const runtime = await gateway.submit("runtime-permission", runtimePayload);
  assert.equal(runtime.request_class, "runtime-permission");
  assert.equal(runtime.canonical_state_changed, false);
  assert.equal(provider.answers.length, 1);
  const replay = await gateway.submit("runtime-permission", runtimePayload);
  assert.equal(replay.idempotent_replay, true);
  assert.equal(provider.answers.length, 1);
  await assert.rejects(
    () => gateway.submit("runtime-permission", { ...runtimePayload, decision: "decline" }),
    /different request/
  );
  await assert.rejects(
    () => gateway.submit("business-fact", {
      idempotency_key: "wrong-class-0001",
      request_id: "runtime-1",
      expected_method: runtimePayload.expected_method,
      expected_observed_at: runtimePayload.expected_observed_at,
      answers: {}
    }),
    /no longer live|business-fact/
  );

  const before = JSON.parse(await fs.readFile(itemPath, "utf8"));
  const businessPayload = {
    idempotency_key: "business-command-0001",
    request_id: "business-1",
    expected_method: "item/tool/requestUserInput",
    expected_observed_at: "2026-08-30T01:01:00.000Z",
    answers: {
      region: ["Japan"],
      credential: ["do-not-persist-this-secret"]
    }
  };
  const business = await gateway.submit("business-fact", businessPayload);
  assert.equal(business.status, "proposed");
  assert.equal(provider.answers.length, 2);
  const afterProposal = JSON.parse(await fs.readFile(itemPath, "utf8"));
  assert.deepEqual(afterProposal.scope, before.scope);
  assert.deepEqual(afterProposal.context_refs, before.context_refs);
  const submissions = await readInboxSubmissions(stateDirectory);
  const proposal = submissions.entries.find((entry) => entry.id === business.submission_id);
  assert.deepEqual(proposal.answers.region, ["Japan"]);
  assert.deepEqual(proposal.answers.credential, ["[SECRET ANSWER OMITTED]"]);
  assert.doesNotMatch(JSON.stringify(submissions), /do-not-persist-this-secret/);

  await assert.rejects(
    () => gateway.submit("business-incorporation", {
      idempotency_key: "incorporate-wrong-0001",
      submission_id: business.submission_id,
      work_item_id: workItemId,
      actor: "human",
      expected_state: before.state,
      expected_revision: "f".repeat(40)
    }),
    /state or exact revision changed/
  );
  const incorporationPayload = {
    idempotency_key: "incorporate-command-0001",
    submission_id: business.submission_id,
    work_item_id: workItemId,
    actor: "human",
    expected_state: before.state,
    expected_revision: revision
  };
  const incorporated = await gateway.submit("business-incorporation", incorporationPayload);
  assert.equal(incorporated.canonical_state_changed, true);
  const incorporatedReplay = await gateway.submit("business-incorporation", incorporationPayload);
  assert.equal(incorporatedReplay.idempotent_replay, true);
  const finalItem = JSON.parse(await fs.readFile(itemPath, "utf8"));
  assert.deepEqual(finalItem.scope, before.scope);
  assert.equal(finalItem.context_refs.includes(incorporated.context_ref), true);
  assert.equal(finalItem.context_refs.includes(incorporated.artifact), false);
  const contextMap = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/context-map.json"), "utf8"));
  const route = contextMap.routes.find((entry) => entry.id === incorporated.context_ref);
  assert.deepEqual(route.paths, [incorporated.artifact]);
  assert.deepEqual(route.work_items, [workItemId]);
  assert.match(await fs.readFile(path.join(target, incorporated.artifact), "utf8"), /does not independently change scope/);
  assert.doesNotMatch(await fs.readFile(path.join(target, incorporated.artifact), "utf8"), /do-not-persist-this-secret/);
  const events = await fs.readFile(path.join(target, ".ai-org/events/events.jsonl"), "utf8");
  assert.equal((events.match(/business_fact_incorporated/g) ?? []).length, 1);
  const doctor = run(["doctor", target, "--json"]);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  assert.equal(JSON.parse(doctor.stdout).summary.fail, 0);
});

test("governance approval enforces current state, exact revision, active principals, and High-Assurance independence", async (context) => {
  const { target, stateDirectory, workItemId, itemPath, revision } = await fixture(context);
  for (const [principalId, name] of [["principal-owner", "Morgan Hale"], ["principal-reviewer", "Casey Quinn"]]) {
    const added = run(["collaboration", "add-principal", target, "--principal-id", principalId, "--name", name]);
    assert.equal(added.status, 0, added.stderr || added.stdout);
  }
  const agents = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/agents.json"), "utf8")).agents;
  const assignments = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/assignments.json"), "utf8")).assignments;
  const developerId = assignments.find((entry) => entry.position_id === "developer").agent_id;
  for (const agent of agents) {
    const principalId = agent.id === developerId ? "principal-owner" : "principal-reviewer";
    const sponsored = run(["collaboration", "sponsor", target, "--principal-id", principalId, "--agent-id", agent.id]);
    assert.equal(sponsored.status, 0, sponsored.stderr || sponsored.stdout);
  }
  const profile = run(["collaboration", "set-profile", target, "--profile", "high-assurance"]);
  assert.equal(profile.status, 0, profile.stderr || profile.stdout);
  const item = JSON.parse(await fs.readFile(itemPath, "utf8"));
  item.state = "release_gate";
  item.owner_position = "release_manager";
  item.tested_revision = revision;
  item.risk_tier = "high";
  item.assurance = {
    profile: "high-assurance",
    policy_schema: "temple.high-assurance/v1",
    artifact_depth: "controlled",
    minimum_approvals: 1,
    rollback_status: "planned",
    external_action_performed: false
  };
  await writeJson(itemPath, item);
  const gateway = createHumanInboxGateway({
    target,
    stateDirectory,
    codexProvider: null,
    privacy: defaultControlPlaneConfig().privacy
  });
  const inbox = await buildHumanInbox(target, stateDirectory, null);
  const candidate = inbox.governance_approvals.find((entry) => entry.work_item_id === workItemId);
  assert.equal(candidate.exact_revision, revision);
  assert.equal(candidate.action_available, true);

  const base = {
    work_item_id: workItemId,
    decision: "go",
    expected_state: "release_gate",
    expected_revision: revision,
    scope_revision: revision
  };
  await assert.rejects(
    () => gateway.submit("governance-approval", {
      ...base,
      idempotency_key: "governance-owner-0001",
      principal_ids: ["principal-owner"]
    }),
    /independent of the Developer sponsor/
  );
  await assert.rejects(
    () => gateway.submit("governance-approval", {
      ...base,
      idempotency_key: "governance-unknown-0001",
      principal_ids: ["principal-missing"]
    }),
    /unknown, or inactive Human Principal/
  );
  await assert.rejects(
    () => gateway.submit("governance-approval", {
      ...base,
      idempotency_key: "governance-revision-0001",
      expected_revision: "a".repeat(40),
      principal_ids: ["principal-reviewer"]
    }),
    /exact candidate revision/
  );
  await assert.rejects(
    () => gateway.submit("governance-approval", {
      ...base,
      idempotency_key: "governance-state-0001",
      expected_state: "test",
      principal_ids: ["principal-reviewer"]
    }),
    /current release_gate state/
  );

  const approvedPayload = {
    ...base,
    idempotency_key: "governance-command-0001",
    principal_ids: ["principal-reviewer"]
  };
  const approved = await gateway.submit("governance-approval", approvedPayload);
  assert.equal(approved.canonical_state_changed, true);
  assert.equal(approved.scope_revision, revision);
  assert.equal((await gateway.submit("governance-approval", approvedPayload)).idempotent_replay, true);
  const approval = JSON.parse(await fs.readFile(path.join(target, approved.approval_ref), "utf8"));
  assert.deepEqual(approval.approvals.map((entry) => entry.principal_id), ["principal-reviewer"]);
  assert.equal(JSON.parse(await fs.readFile(itemPath, "utf8")).state, "release_gate");
  const events = await fs.readFile(path.join(target, ".ai-org/events/events.jsonl"), "utf8");
  assert.equal((events.match(/governance_approval_recorded/g) ?? []).length, 1);
});

test("loopback command gateway rejects cross-origin, unauthenticated, and arbitrary mutations", async (context) => {
  const { target, stateDirectory } = await fixture(context);
  const controlPlane = await startControlPlaneServer(target, {
    stateDirectory,
    port: 0,
    repositoryIntervalMs: 50
  });
  context.after(() => controlPlane.close());
  const snapshotResponse = await fetch(`${controlPlane.url}/api/v1/snapshot`);
  const snapshotText = await snapshotResponse.text();
  assert.equal(snapshotResponse.status, 200);
  assert.doesNotMatch(snapshotText, new RegExp(controlPlane.sessionSecret));
  assert.doesNotMatch(snapshotText, /GH_TOKEN|authorization/i);

  const body = {
    idempotency_key: "server-command-0001",
    request_id: "missing",
    expected_method: "item/commandExecution/requestApproval",
    expected_observed_at: "2026-08-30T00:00:00.000Z",
    decision: "decline"
  };
  const unauthenticated = await fetch(`${controlPlane.url}/api/v1/inbox/runtime-permission`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: controlPlane.url, "x-idempotency-key": body.idempotency_key },
    body: JSON.stringify(body)
  });
  assert.equal(unauthenticated.status, 403);
  const crossOrigin = await fetch(`${controlPlane.url}/api/v1/inbox/runtime-permission`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.invalid",
      "x-temple-session": controlPlane.sessionSecret,
      "x-idempotency-key": body.idempotency_key
    },
    body: JSON.stringify(body)
  });
  assert.equal(crossOrigin.status, 403);
  const stale = await fetch(`${controlPlane.url}/api/v1/inbox/runtime-permission`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: controlPlane.url,
      "x-temple-session": controlPlane.sessionSecret,
      "x-idempotency-key": body.idempotency_key
    },
    body: JSON.stringify(body)
  });
  assert.equal(stale.status, 409);
  assert.match((await stale.json()).error, /no longer live or answerable/);
  const arbitrary = await fetch(`${controlPlane.url}/api/v1/files`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  assert.equal(arbitrary.status, 405);
  assert.match((await arbitrary.json()).error, /bounded Human Inbox routes/);
  await controlPlane.close();
});
