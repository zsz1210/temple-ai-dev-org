#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templeCli = path.join(repositoryRoot, "bin/temple.mjs");
const outputPath = parseOutputPath(process.argv.slice(2));
const commands = [];
const temporaryPaths = new Set();

const focusedTests = [
  "test/collaboration-governance.test.mjs",
  "test/tracker.test.mjs",
  "test/workflow.test.mjs",
  "test/high-assurance.test.mjs",
  "test/evidence-observer.test.mjs",
  "test/audit-export.test.mjs",
  "test/recovery.test.mjs",
  "test/control-plane-private-viewer.test.mjs",
  "test/control-plane-inbox.test.mjs",
  "test/ci-scope.test.mjs",
  "test/release-package.test.mjs"
];

function parseOutputPath(arguments_) {
  const outputIndex = arguments_.indexOf("--output");
  if (outputIndex === -1 || !arguments_[outputIndex + 1]) {
    throw new Error("Usage: validate-wave-4-operating-boundaries.mjs --output <path>");
  }
  return path.resolve(arguments_[outputIndex + 1]);
}

function elapsedSince(started) {
  return Number((performance.now() - started).toFixed(3));
}

function quoteArgument(value) {
  return /^[A-Za-z0-9_./:@=-]+$/.test(value) ? value : JSON.stringify(value);
}

function commandLabel(command, arguments_) {
  const raw = [command, ...arguments_].map(quoteArgument).join(" ");
  return sanitize(raw);
}

function sanitize(value) {
  let result = String(value ?? "");
  const replacements = [
    [repositoryRoot, "<repository>"],
    [os.homedir(), "<home>"],
    ...[...temporaryPaths].map((entry) => [entry, "<temporary>"])
  ].sort((left, right) => right[0].length - left[0].length);
  for (const [needle, replacement] of replacements) {
    if (!needle) continue;
    result = result.split(needle).join(replacement);
  }
  return result;
}

function boundedSummary(value, maximum = 2400) {
  const clean = sanitize(value).trim();
  if (clean.length <= maximum) return clean;
  return `${clean.slice(0, maximum)}\n<output truncated>`;
}

function run(command, arguments_, options = {}) {
  const started = performance.now();
  const result = spawnSync(command, arguments_, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 32 * 1024 * 1024
  });
  const record = {
    command: commandLabel(command, arguments_),
    expected_exit_codes: options.expectedExitCodes ?? [0],
    exit_code: result.status,
    elapsed_ms: elapsedSince(started),
    stdout_summary: boundedSummary(result.stdout),
    stderr_summary: boundedSummary(result.stderr)
  };
  commands.push(record);
  if (!record.expected_exit_codes.includes(result.status)) {
    throw new Error(
      [
        `Unexpected exit ${result.status}: ${record.command}`,
        record.stdout_summary,
        record.stderr_summary
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
  return { ...result, record };
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(repositoryRoot, relativePath), "utf8"));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryOutput = `${filePath}.tmp-${process.pid}`;
  await fs.writeFile(temporaryOutput, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await fs.rename(temporaryOutput, filePath);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function parseTapSummary(output) {
  const read = (name) => {
    const match = output.match(new RegExp(`^(?:#|ℹ) ${name} (\\d+)$`, "m"));
    if (!match) throw new Error(`Could not parse TAP ${name} count`);
    return Number(match[1]);
  };
  return {
    tests: read("tests"),
    pass: read("pass"),
    fail: read("fail"),
    cancelled: read("cancelled"),
    skipped: read("skipped"),
    todo: read("todo")
  };
}

function evidenceRow({ id, boundary, claim, status, evidenceClass, facts, refs, limitations, applicability = "exact" }) {
  return {
    id,
    boundary,
    claim,
    status,
    evidence_class: evidenceClass,
    current_revision_applicability: applicability,
    verified_facts: facts,
    evidence_refs: refs,
    limitations
  };
}

function summarizeMatrix(matrix) {
  const empty = () => ({ rows: 0, pass: 0, gap: 0, "not-applicable": 0 });
  const byBoundary = {};
  const byEvidenceClass = {};
  for (const row of matrix) {
    byBoundary[row.boundary] ??= empty();
    byBoundary[row.boundary].rows += 1;
    byBoundary[row.boundary][row.status] += 1;
    byEvidenceClass[row.evidence_class] = (byEvidenceClass[row.evidence_class] ?? 0) + 1;
  }
  return { rows: matrix.length, by_boundary: byBoundary, by_evidence_class: byEvidenceClass };
}

function assertArrayEqual(actual, expected, label) {
  assert.deepEqual(actual, expected, label);
  return actual;
}

async function runTrackerRehearsal() {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wave4-tracker-"));
  temporaryPaths.add(temporaryRoot);
  const target = path.join(temporaryRoot, "tracker-fixture");
  const configPath = path.join(temporaryRoot, "init.json");
  const observationPath = path.join(temporaryRoot, "observation.json");
  const initConfig = {
    schema_version: "temple.init/v1",
    project: { id: "wave4-tracker-fixture", name: "Wave 4 Tracker Fixture" },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
  const observation = {
    schema_version: "temple.tracker-observation/v1",
    provider_id: "github-main",
    provider_kind: "github",
    item_id: "381",
    url: "https://github.com/example/product/issues/381",
    observed_at: "2026-09-02T00:00:00.000Z",
    external_updated_at: "2026-09-01T23:59:00.000Z",
    revision: "fixture:381:done",
    title: "Qualify a synthetic company outcome",
    status: "done",
    fields: {
      priority: "high",
      iteration: "Fixture Sprint",
      estimate: "5",
      due_date: null,
      business_assignee: "fixture-user",
      labels: ["team-visible"]
    },
    source: { kind: "file", adapter: "wave-4-fixture" }
  };
  await fs.writeFile(configPath, `${JSON.stringify(initConfig, null, 2)}\n`);
  await fs.writeFile(observationPath, `${JSON.stringify(observation, null, 2)}\n`);

  try {
    run(process.execPath, [templeCli, "init", target, "--config", configPath], { cwd: temporaryRoot });
    run(process.execPath, [templeCli, "work-item", "create", target, "--title", observation.title, "--scope", "Synthetic team-visible outcome", "--acceptance", "Temple remains lifecycle authority", "--ui-mode", "not-applicable"], { cwd: target });
    run(process.execPath, [templeCli, "work-item", "create", target, "--title", "Synthetic internal implementation", "--parent", "WI-0001", "--ui-mode", "not-applicable"], { cwd: target });
    run(process.execPath, [templeCli, "tracker", "configure", target, "--tracker-profile", "linked-tracker", "--provider-id", "github-main", "--provider-kind", "github", "--project", "example/product", "--write-policy", "plan-only"], { cwd: target });
    run(process.execPath, [templeCli, "tracker", "link", target, "--work-item", "WI-0001", "--provider-id", "github-main", "--item-id", "381", "--url", observation.url], { cwd: target });
    const rejectedChild = run(process.execPath, [templeCli, "tracker", "link", target, "--work-item", "WI-0002", "--provider-id", "github-main", "--item-id", "382", "--url", "https://github.com/example/product/issues/382"], { cwd: target, expectedExitCodes: [1] });
    assert.match(rejectedChild.stderr, /is internal/);

    const parentPath = path.join(target, ".ai-org/work-items/WI-0001.json");
    const childPath = path.join(target, ".ai-org/work-items/WI-0002.json");
    const trackerPath = path.join(target, ".ai-org/project/tracker.json");
    const before = {
      parent: sha256(await fs.readFile(parentPath)),
      child: sha256(await fs.readFile(childPath)),
      tracker: sha256(await fs.readFile(trackerPath))
    };
    const trackerViewPath = path.join(target, ".ai-org/views/tracker.json");
    await fs.rm(trackerViewPath, { force: true });

    const inspected = run(process.execPath, [templeCli, "tracker", "inspect", target, "--work-item", "WI-0001", "--observation", observationPath, "--no-write", "--json"], { cwd: target });
    const inspectedJson = JSON.parse(inspected.stdout);
    const inspectedObservation = inspectedJson.observation ?? inspectedJson;
    assert.equal(inspectedObservation.schema_version, "temple.tracker-observation/v1");
    assert.equal(inspectedObservation.status, "done");
    await assert.rejects(() => fs.access(trackerViewPath));

    const planned = run(process.execPath, [templeCli, "tracker", "plan", target, "--work-item", "WI-0001", "--observation", observationPath, "--no-write", "--json"], { cwd: target });
    const plannedJson = JSON.parse(planned.stdout);
    assert.equal(plannedJson.external_write_performed, false);
    assert.equal(plannedJson.conflict_count, 1);
    assert.equal(plannedJson.actions[0].id, "external-completion-cannot-advance-temple");
    await assert.rejects(() => fs.access(trackerViewPath));

    const after = {
      parent: sha256(await fs.readFile(parentPath)),
      child: sha256(await fs.readFile(childPath)),
      tracker: sha256(await fs.readFile(trackerPath))
    };
    assert.deepEqual(after, before);
    const parent = JSON.parse(await fs.readFile(parentPath, "utf8"));
    const child = JSON.parse(await fs.readFile(childPath, "utf8"));
    assert.equal(parent.state, "intake");
    assert.equal(parent.tracker_visibility, "team-visible");
    assert.equal(child.tracker_visibility, "internal");

    return {
      classification: "simulated",
      synthetic_provider: true,
      synthetic_identities: true,
      parent_visibility: parent.tracker_visibility,
      child_visibility: child.tracker_visibility,
      internal_child_link_rejected: true,
      inspect_no_write: true,
      plan_no_write: true,
      lifecycle_state_after_external_done: parent.state,
      conflict_count: plannedJson.conflict_count,
      external_write_performed: false,
      source_digests_unchanged: true,
      generated_tracker_view_created: false,
      external_contact_performed: false
    };
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  const totalStarted = performance.now();
  const revision = run("git", ["rev-parse", "HEAD"]).stdout.trim();
  assert.match(revision, /^[0-9a-f]{40}$/);
  const statusOutput = run("git", ["status", "--porcelain", "--untracked-files=all"]).stdout;
  const outputRelativePath = path.relative(repositoryRoot, outputPath).split(path.sep).join("/");
  const dirtyPaths = statusOutput
    .split("\n")
    .map((entry) => entry.slice(3).trim())
    .filter((entry) => entry && entry !== "node_modules" && entry !== outputRelativePath);

  const [positions, assignments, collaboration, tracker, controlPlane, uiDesign, highAssurance] = await Promise.all([
    readJson(".ai-org/core/positions.json"),
    readJson(".ai-org/project/assignments.json"),
    readJson(".ai-org/project/collaboration.json"),
    readJson(".ai-org/project/tracker.json"),
    readJson(".ai-org/project/control-plane.json"),
    readJson(".ai-org/core/ui-design.json"),
    readJson(".ai-org/core/high-assurance.json")
  ]);

  const positionIds = positions.positions.map((entry) => entry.id);
  assert.equal(positionIds.includes("observer"), true);
  assert.equal(positionIds.includes("sre"), false);
  assert.equal(positionIds.includes("security"), false);
  const observer = positions.positions.find((entry) => entry.id === "observer");
  assertArrayEqual(observer.cannot_approve, ["product_decision", "technical_decision", "qa_result", "release"], "Observer authority boundary drifted");
  const assignmentByPosition = Object.fromEntries(assignments.assignments.filter((entry) => entry.active).map((entry) => [entry.position_id, entry.agent_id]));
  assert.notEqual(assignmentByPosition.developer, assignmentByPosition.independent_qa);
  assert.notEqual(assignmentByPosition.developer, assignmentByPosition.release_manager);

  assert.equal(collaboration.profile, "solo");
  assert.equal(collaboration.recovery.status, "not_configured");
  assert.equal(collaboration.validation.real_collaborative.status, "not_run");
  assert.equal(collaboration.validation.representative_pilot.status, "not_run");
  assert.equal(collaboration.validation.high_assurance_drill.status, "not_run");
  assert.equal(tracker.profile, "repository-only");
  assert.equal(tracker.providers.length, 0);
  assert.equal(tracker.default_provider_id, null);
  assert.equal(controlPlane.server.host, "127.0.0.1");
  assert.equal(controlPlane.privacy.capture_raw_payloads, false);
  for (const key of ["authorization", "cookie", "password", "secret", "token"]) {
    assert.equal(controlPlane.privacy.redact_keys.includes(key), true, `Missing privacy redaction key: ${key}`);
  }
  assert.deepEqual(controlPlane.providers.map((entry) => entry.id), ["repository"]);
  assert.equal(controlPlane.agent_commands?.enabled === true, false);

  const uiModes = Object.fromEntries(uiDesign.delivery_modes.map((entry) => [entry.id, entry]));
  assertArrayEqual(Object.keys(uiModes), ["not-applicable", "code-first", "preview-first", "design-led"], "UI modes drifted");
  assert.equal(uiDesign.tool_policy.required_tool, null);
  assert.equal(uiModes["preview-first"].preimplementation_visual_artifact_required, true);
  assert.equal(uiModes["design-led"].preimplementation_visual_artifact_required, true);
  for (const mode of ["code-first", "preview-first", "design-led"]) {
    assert.equal(uiModes[mode].minimum_evidence.includes("runtime_visual_review"), true, `${mode} must retain runtime visual review`);
  }

  assert.equal(highAssurance.human_accountability.minimum_active_principals, 2);
  assert.equal(highAssurance.human_accountability.all_active_agents_require_sponsors, true);
  assert.equal(highAssurance.human_accountability.developer_independent_qa_separation, true);
  assert.equal(highAssurance.human_accountability.developer_release_manager_separation, true);
  assert.equal(highAssurance.risk_tiers.critical.minimum_approvals, 2);
  assert.equal(highAssurance.risk_tiers.critical.rollback_status, "verified");
  assertArrayEqual(highAssurance.risk_tiers.critical.allowed_ui_modes, ["not-applicable", "design-led"], "Critical UI policy drifted");

  const tests = run(process.execPath, ["--test", ...focusedTests]);
  const testSummary = parseTapSummary(tests.stdout);
  assert.equal(testSummary.fail, 0);
  assert.equal(testSummary.pass, testSummary.tests - testSummary.skipped - testSummary.todo);
  const trackerRehearsal = await runTrackerRehearsal();

  const matrix = [
    evidenceRow({
      id: "collaboration-current-profile",
      boundary: "collaborative-governance",
      claim: "Current project governance is inspectable",
      status: "pass",
      evidenceClass: "verified-local",
      facts: [`profile=${collaboration.profile}`, `principals=${collaboration.principals.length}`, `sponsorships=${collaboration.sponsorships.length}`, `active_memberships=${collaboration.memberships.filter((entry) => entry.active).length}`, `recovery=${collaboration.recovery.status}`],
      refs: [".ai-org/project/collaboration.json", ".ai-org/project/assignments.json"],
      limitations: "Solo configuration does not exercise sponsorship or recovery with real Human Principals."
    }),
    evidenceRow({
      id: "collaboration-local-enforcement",
      boundary: "collaborative-governance",
      claim: "Membership, identity, claims, authority, and recovery rules fail closed in local fixtures",
      status: "pass",
      evidenceClass: "simulated",
      facts: ["focused executable tests passed", "Developer and Independent QA identities are distinct"],
      refs: ["test/collaboration-governance.test.mjs", "test/workflow.test.mjs"],
      limitations: "Actors, approvals, clones, and environments in the executable tests are synthetic."
    }),
    evidenceRow({
      id: "collaboration-real-operation",
      boundary: "collaborative-governance",
      claim: "Different humans collaborate from independently administered environments",
      status: "gap",
      evidenceClass: "not-run",
      facts: [`real_collaborative=${collaboration.validation.real_collaborative.status}`, `representative_pilot=${collaboration.validation.representative_pilot.status}`],
      refs: ["docs/validation/collaborative-large-scale-test-plan.md"],
      limitations: "Requires real participants, machines, branches, pull requests, CI, review, integration, and exact-revision QA."
    }),
    evidenceRow({
      id: "tracker-current-profile",
      boundary: "tracker-coordination",
      claim: "The current project is repository-only and has no external mapping",
      status: "pass",
      evidenceClass: "verified-local",
      facts: [`profile=${tracker.profile}`, `providers=${tracker.providers.length}`, "external_write_performed=false"],
      refs: [".ai-org/project/tracker.json", "docs/operations/task-and-tracker-coordination.md"],
      limitations: "This proves the local source-of-truth boundary, not external interoperability."
    }),
    evidenceRow({
      id: "tracker-local-rehearsal",
      boundary: "tracker-coordination",
      claim: "Team-visible parent and internal child coordination remains read-only and lifecycle-safe",
      status: "pass",
      evidenceClass: "simulated",
      facts: ["internal child link rejected", "inspect --no-write created no view", "plan --no-write created no view", "external completion left lifecycle at intake"],
      refs: ["test/tracker.test.mjs", "test/workflow.test.mjs", "scripts/validate-wave-4-operating-boundaries.mjs"],
      limitations: "The provider observation and all identities are local fixtures; no GitHub or Jira request occurred."
    }),
    evidenceRow({
      id: "tracker-real-provider",
      boundary: "tracker-coordination",
      claim: "A company Jira or GitHub Issues workflow operates with real permissions and concurrent users",
      status: "gap",
      evidenceClass: "not-run",
      facts: ["external_contact_performed=false", "external_write_performed=false"],
      refs: ["docs/adr/0020-external-tracker-coordination.md"],
      limitations: "Authentication, rate limits, company fields, permission boundaries, and concurrent edits were not exercised."
    }),
    evidenceRow({
      id: "ui-code-and-preview",
      boundary: "ui-delivery",
      claim: "Code-first and preview-first require named prebuild and runtime evidence",
      status: "pass",
      evidenceClass: "verified-local",
      facts: ["four delivery modes present", "runtime_visual_review required for every interface mode", "preview-first requires a visual artifact"],
      refs: [".ai-org/core/ui-design.json", "test/workflow.test.mjs"],
      limitations: "Current exact tests enforce the contract; retained browser reviews are historical evidence on their recorded revisions."
    }),
    evidenceRow({
      id: "ui-design-led",
      boundary: "ui-delivery",
      claim: "Design-led delivery is defined",
      status: "gap",
      evidenceClass: "documented-policy",
      facts: [`prebuild=${uiModes["design-led"].prebuild_evidence.join(",")}`, `closeout=${uiModes["design-led"].minimum_evidence.join(",")}`],
      refs: [".ai-org/core/ui-design.json", "docs/concepts/ui-design.md"],
      limitations: "No direct lifecycle fixture, completed design-led Work Item, or implementation-mapping rehearsal qualifies this mode."
    }),
    evidenceRow({
      id: "ui-vendor-neutrality",
      boundary: "ui-delivery",
      claim: "No design vendor is required by the framework",
      status: "pass",
      evidenceClass: "verified-local",
      facts: ["required_tool=null", `allowed_examples=${uiDesign.tool_policy.allowed_examples.length}`],
      refs: [".ai-org/core/ui-design.json", "scripts/check-repo.mjs"],
      limitations: "Vendor neutrality does not prove a real Figma or multi-party design handoff."
    }),
    evidenceRow({
      id: "ui-real-figma-and-team",
      boundary: "ui-delivery",
      claim: "Figma synchronization and a real designer-to-developer delivery operate end to end",
      status: "gap",
      evidenceClass: "not-run",
      facts: ["figma_contact_performed=false", "multi_party_design_trial=false"],
      refs: ["docs/concepts/ui-design.md"],
      limitations: "Connector authentication, design revision drift, mapping, review, and team handoff were not exercised."
    }),
    evidenceRow({
      id: "sre-security-local-safeguards",
      boundary: "sre-security",
      claim: "Local observability, audit, recovery, privacy, command, evidence, and release safeguards fail closed",
      status: "pass",
      evidenceClass: "simulated",
      facts: ["focused executable tests passed", "Control Plane is loopback", "raw payload capture is disabled", "Agent Commands are disabled by current configuration"],
      refs: ["test/evidence-observer.test.mjs", "test/audit-export.test.mjs", "test/recovery.test.mjs", "test/control-plane-private-viewer.test.mjs", "test/control-plane-inbox.test.mjs"],
      limitations: "The tests use temporary repositories, synthetic providers, and synthetic failure conditions."
    }),
    evidenceRow({
      id: "sre-security-position-coverage",
      boundary: "sre-security",
      claim: "The organization has explicit SRE and Security Positions",
      status: "gap",
      evidenceClass: "verified-local",
      facts: ["observer_position=true", "sre_position=false", "security_position=false"],
      refs: [".ai-org/core/positions.json"],
      limitations: "Security duties are distributed across existing roles; Observer is not a production SRE or approval role."
    }),
    evidenceRow({
      id: "sre-security-real-operation",
      boundary: "sre-security",
      claim: "Production SRE, incident response, vulnerability management, disaster recovery, and security assessment are qualified",
      status: "gap",
      evidenceClass: "not-run",
      facts: ["production_action_performed=false", "security_certification=false"],
      refs: ["SECURITY.md", "docs/operations/control-plane.md"],
      limitations: "No on-call, SLO/error budget, incident drill, real outage, machine-loss recovery, threat model, SAST/DAST, penetration test, or certification was run."
    }),
    evidenceRow({
      id: "high-assurance-contract",
      boundary: "high-assurance",
      claim: "High-Assurance encodes human accountability, separation, exact evidence, risk-scaled approvals, and rollback",
      status: "pass",
      evidenceClass: "simulated",
      facts: ["minimum_active_principals=2", "critical_minimum_approvals=2", "critical_rollback_status=verified", "Developer separation rules enabled"],
      refs: [".ai-org/core/high-assurance.json", "test/high-assurance.test.mjs"],
      limitations: "Executable actors and approvals are synthetic; critical full closeout does not yet have a dedicated end-to-end fixture."
    }),
    evidenceRow({
      id: "high-assurance-real-drill",
      boundary: "high-assurance",
      claim: "A real High-Assurance project has completed its named drill",
      status: "gap",
      evidenceClass: "not-run",
      facts: [`high_assurance_drill=${collaboration.validation.high_assurance_drill.status}`],
      refs: [".ai-org/project/collaboration.json", ".ai-org/core/high-assurance.json"],
      limitations: "Requires distinct active humans, real sponsorship, independently controlled approval evidence, verified rollback, and exact-revision QA."
    })
  ];

  for (const row of matrix) {
    assert.ok(["pass", "gap", "not-applicable"].includes(row.status));
    assert.ok(["verified-local", "simulated", "documented-policy", "not-run", "not-applicable"].includes(row.evidence_class));
    if (row.evidence_class === "not-run") assert.equal(row.status, "gap");
    if (row.evidence_class === "simulated") assert.match(row.limitations, /synthetic|fixture|temporary/i);
  }

  const finishedAt = new Date().toISOString();
  const observation = {
    schema_version: "temple.wave-4-operating-boundaries-observation/v1",
    generator: {
      script: "scripts/validate-wave-4-operating-boundaries.mjs",
      temple_version: (await readJson("package.json")).version,
      node_version: process.version
    },
    status: "pass",
    started_at: startedAt,
    finished_at: finishedAt,
    elapsed_ms: elapsedSince(totalStarted),
    candidate: {
      revision,
      exact_revision_observed: true,
      clean_before_run: dirtyPaths.length === 0,
      dirty_paths_before_run: dirtyPaths
    },
    commands,
    focused_tests: { files: focusedTests, ...testSummary },
    canonical_snapshot: {
      collaboration: {
        profile: collaboration.profile,
        principals: collaboration.principals.length,
        sponsorships: collaboration.sponsorships.length,
        active_memberships: collaboration.memberships.filter((entry) => entry.active).length,
        recovery_status: collaboration.recovery.status,
        validation: Object.fromEntries(Object.entries(collaboration.validation).map(([key, value]) => [key, { status: value.status, tested_revision: value.tested_revision }]))
      },
      tracker: {
        profile: tracker.profile,
        providers: tracker.providers.length,
        default_provider_id: tracker.default_provider_id,
        sync_granularity: tracker.sync_granularity,
        field_ownership: tracker.field_ownership
      },
      ui_delivery: {
        modes: uiDesign.delivery_modes,
        required_tool: uiDesign.tool_policy.required_tool,
        allowed_examples: uiDesign.tool_policy.allowed_examples
      },
      organization: {
        position_ids: positionIds,
        observer_cannot_approve: observer.cannot_approve,
        sre_position_present: false,
        security_position_present: false,
        developer_agent_id: assignmentByPosition.developer,
        independent_qa_agent_id: assignmentByPosition.independent_qa,
        release_manager_agent_id: assignmentByPosition.release_manager
      },
      control_plane: {
        host: controlPlane.server.host,
        capture_raw_payloads: controlPlane.privacy.capture_raw_payloads,
        redact_keys: controlPlane.privacy.redact_keys,
        providers: controlPlane.providers.map((entry) => entry.id),
        token_budget: controlPlane.alerts.token_budget,
        agent_commands_enabled: controlPlane.agent_commands?.enabled === true
      },
      high_assurance: highAssurance
    },
    tracker_rehearsal: trackerRehearsal,
    matrix,
    summary: summarizeMatrix(matrix),
    external_actions: {
      network_contact_performed: false,
      external_write_performed: false,
      production_action_performed: false,
      service_started: false,
      model_generation_performed: false,
      console_or_observer_started: false,
      container_runtime_started: false
    },
    usage: {
      model: "not_applicable",
      reasoning_effort: "not_applicable",
      input_tokens: "not_applicable",
      cached_input_tokens: "not_applicable",
      output_tokens: "not_applicable",
      credits: "not_applicable",
      reason: "This deterministic validation uses repository files and local executables only."
    },
    limitations: [
      "Local executable tests and temporary fixtures are not real multi-human or independently administered environments.",
      "No external tracker, Figma, production system, second machine, model, usage collector, Console, Observer daemon, or container runtime was contacted or started.",
      "Historical retained evidence remains applicable only to its own recorded revision.",
      "No enterprise-readiness, security-certification, production-SRE, financial-saving, or Token-saving conclusion is supported."
    ]
  };

  assert.equal(observation.external_actions.network_contact_performed, false);
  assert.equal(observation.external_actions.external_write_performed, false);
  assert.equal(observation.tracker_rehearsal.external_write_performed, false);
  assert.equal(observation.summary.rows, 15);
  await writeJson(outputPath, observation);
  process.stdout.write(`${JSON.stringify({ status: observation.status, revision, elapsed_ms: observation.elapsed_ms, tests: observation.focused_tests, matrix: observation.summary }, null, 2)}\n`);
}

main().catch(async (error) => {
  await fs.rm(`${outputPath}.tmp-${process.pid}`, { force: true }).catch(() => {});
  process.stderr.write(`${sanitize(error.stack ?? error.message)}\n`);
  process.exitCode = 1;
});
