#!/usr/bin/env node

import crypto from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

import Ajv from "ajv";

import {
  buildCodexRuntimeRequestResponse,
  createJsonRpcProcess
} from "../src/codex-app-server-provider.mjs";
import {
  isolateWave5CodexEnvironment,
  normalizeTokenUsage,
  terminalFailure,
  wave5ThreadIsolation
} from "../src/app-server-protocol-replay.mjs";
import {
  buildContextSourceManifest,
  resolveWorkItemContext
} from "../src/context.mjs";
import {
  modelTurnItemPolicyViolation,
  modelTurnStopReason,
  normalizeProviderCommandText,
  representativeAppServerArguments,
  representativeProtocolViolationForMessage,
  representativeTurnSandboxPolicy,
  validateProviderOutputSchema
} from "./run-representative-microservice-comparison.mjs";

const execFile = promisify(execFileCallback);
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const artifactRoot = path.join(repositoryRoot, ".ai-org/artifacts/WI-0141");
const defaultLabRoot = path.join(os.tmpdir(), "temple-wi0141-context-capsule-ablation");
const defaultProtocolPath = path.join(artifactRoot, "live-protocol.json");
const defaultApprovalTemplatePath = path.join(artifactRoot, "account-approval.template.json");
const defaultApprovalPath = path.join(artifactRoot, "account-approval.json");
const defaultReadinessPath = path.join(artifactRoot, "harness-readiness.json");
const defaultPreflightPath = path.join(artifactRoot, "preapproval-preflight.json");
const defaultObservationPath = path.join(artifactRoot, "live-observation.json");
const defaultStoppedObservationPath = path.join(artifactRoot, "stopped-observation.json");
const defaultAnalysisPath = path.join(artifactRoot, "effectiveness-analysis.json");
const defaultReportPath = path.join(artifactRoot, "effectiveness-report.md");
const harnessPath = path.join(repositoryRoot, "scripts/run-context-capsule-ablation.mjs");
const retainedFalseNegativeObservationPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0138/live-observation.json");
const retainedDiagnosticObservationPath = path.join(repositoryRoot, ".ai-org/artifacts/WI-0139/live-observation.json");
const retainedRouteAdherenceRoot = path.join(repositoryRoot, ".ai-org/artifacts/WI-0140");
const retainedRouteAdherenceProtocolPath = path.join(retainedRouteAdherenceRoot, "live-protocol.json");
const routeAdherenceBaselineRevision = "25b846d";

const fixedGitEnvironment = Object.freeze({
  GIT_AUTHOR_NAME: "Temple Fixture",
  GIT_AUTHOR_EMAIL: "fixture@invalid.example",
  GIT_COMMITTER_NAME: "Temple Fixture",
  GIT_COMMITTER_EMAIL: "fixture@invalid.example",
  GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z",
  GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z",
  GIT_CONFIG_NOSYSTEM: "1"
});

export const CONTEXT_ABLATION_SCHEMA = "temple.context-capsule-ablation/v4";
export const CONTEXT_ABLATION_APPROVAL_SCHEMA = "temple.context-capsule-ablation-approval/v4";
export const CONTEXT_PACKAGE_SCHEMA = "temple.context-treatment-package/v1";
export const CONTEXT_ABLATION_OBSERVATION_SCHEMA = "temple.context-capsule-ablation-observation/v4";
export const CONTEXT_ABLATION_ANALYSIS_SCHEMA = "temple.context-capsule-ablation-analysis/v5";

export const acquisitionLimits = Object.freeze({
  maximum_entries: 64,
  maximum_path_bytes: 240
});

export const successorLimitBasis = Object.freeze({
  observed_single_repository_lower_bound: 40460,
  headroom_band: 10000,
  rounding_band: 1000,
  single_repository_limit: 51000,
  coordinator_multi_repository_limit: 80000
});

export const conditionDefinitions = Object.freeze([
  Object.freeze({
    id: "single-stage-aware-a",
    shape: "single-repository",
    strategy: "stage-aware",
    repetition: "a",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.single_repository_limit
  }),
  Object.freeze({
    id: "multi-legacy-expanded-a",
    shape: "coordinator-multi-repository",
    strategy: "legacy-expanded",
    repetition: "a",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.coordinator_multi_repository_limit
  }),
  Object.freeze({
    id: "single-legacy-expanded-a",
    shape: "single-repository",
    strategy: "legacy-expanded",
    repetition: "a",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.single_repository_limit
  }),
  Object.freeze({
    id: "multi-stage-aware-a",
    shape: "coordinator-multi-repository",
    strategy: "stage-aware",
    repetition: "a",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.coordinator_multi_repository_limit
  }),
  Object.freeze({
    id: "single-legacy-expanded-b",
    shape: "single-repository",
    strategy: "legacy-expanded",
    repetition: "b",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.single_repository_limit
  }),
  Object.freeze({
    id: "multi-stage-aware-b",
    shape: "coordinator-multi-repository",
    strategy: "stage-aware",
    repetition: "b",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.coordinator_multi_repository_limit
  }),
  Object.freeze({
    id: "single-stage-aware-b",
    shape: "single-repository",
    strategy: "stage-aware",
    repetition: "b",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.single_repository_limit
  }),
  Object.freeze({
    id: "multi-legacy-expanded-b",
    shape: "coordinator-multi-repository",
    strategy: "legacy-expanded",
    repetition: "b",
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    operational_token_limit: successorLimitBasis.coordinator_multi_repository_limit
  })
]);

const conditionIds = Object.freeze(conditionDefinitions.map((entry) => entry.id));
const aggregateOperationalTokenLimit = conditionDefinitions.reduce((sum, entry) => sum + entry.operational_token_limit, 0);
const programWallClockLimitMs = 4800000;
const componentRepositoryIds = Object.freeze(["gateway", "catalog", "orders", "notifications"]);

const baseInstructions = "You are a bounded cold-handoff recovery worker. Use only the supplied local repository evidence and return the requested structured completion record.";
const developerInstructions = [
  "This is one read-only controlled-comparison turn. Do not create subagents or ask questions.",
  "Use one read-only command per shell call. Use only sed -n, rg, and git -C <exact-repository-id> rev-parse HEAD or status --short.",
  "Do not use parent-directory segments, absolute paths, pipes, redirects, shell control operators, package installation, network access, external services, deployment, publication, or lifecycle mutation.",
  "Begin with CONTEXT_PACKAGE.json. Open only canonical sources named by that package and needed for the requested fields.",
  "Do not modify files. Return only the requested structured JSON object."
].join("\n");

export const singleOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: [
    "requirement_id",
    "duplicate_request_effect",
    "decision_id",
    "repository_revision",
    "public_tests_passed",
    "public_tests_failed",
    "unresolved_risk_id",
    "safe_next_action_id",
    "authority_source"
  ],
  properties: {
    requirement_id: { type: "string" },
    duplicate_request_effect: { type: "string" },
    decision_id: { type: "string" },
    repository_revision: { type: "string" },
    public_tests_passed: { type: "integer" },
    public_tests_failed: { type: "integer" },
    unresolved_risk_id: { type: "string" },
    safe_next_action_id: { type: "string" },
    authority_source: { type: "string" }
  }
});

export const multiOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: [
    "contract_id",
    "compatibility_policy_id",
    "component_revisions",
    "completed_slice_ids",
    "unresolved_risk_id",
    "authority_owner_id",
    "safe_next_action_id"
  ],
  properties: {
    contract_id: { type: "string" },
    compatibility_policy_id: { type: "string" },
    component_revisions: {
      type: "object",
      additionalProperties: false,
      required: [...componentRepositoryIds],
      properties: Object.fromEntries(componentRepositoryIds.map((id) => [id, { type: "string" }]))
    },
    completed_slice_ids: { type: "array", items: { type: "string" } },
    unresolved_risk_id: { type: "string" },
    authority_owner_id: { type: "string" },
    safe_next_action_id: { type: "string" }
  }
});

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function stableText(value) {
  return JSON.stringify(stable(value));
}

export function validateAnswerFreeOutputSchema(schema) {
  const forbidden = new Set(["const", "enum", "default", "examples"]);
  const findings = [];
  const visit = (value, location) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${location}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, entry] of Object.entries(value)) {
      const next = `${location}.${key}`;
      if (forbidden.has(key)) findings.push(next);
      visit(entry, next);
    }
  };
  visit(schema, "$");
  return { pass: findings.length === 0, forbidden_keywords: findings };
}

export function contextAblationProtocolDigest(protocol) {
  const candidate = structuredClone(protocol);
  candidate.protocol_sha256 = null;
  return sha256(stableText(candidate));
}

function textMetrics(value) {
  return {
    utf8_bytes: Buffer.byteLength(value, "utf8"),
    sha256: sha256(value)
  };
}

function outputSchemaForShape(shape) {
  if (shape === "single-repository") return singleOutputSchema;
  if (shape === "coordinator-multi-repository") return multiOutputSchema;
  throw new Error(`Unknown project shape: ${shape}`);
}

function conditionDefinition(id) {
  const definition = conditionDefinitions.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Unknown condition: ${id}`);
  return definition;
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readJson(target) {
  return JSON.parse(await fs.readFile(target, "utf8"));
}

async function writeJson(target, value, options = {}) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, options.exclusive ? { flag: "wx" } : undefined);
}

async function writeText(target, value) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value);
}

async function command(executable, args, options = {}) {
  try {
    const result = await execFile(executable, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      maxBuffer: 16 * 1024 * 1024,
      timeout: options.timeout ?? 120000
    });
    return { status: 0, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  } catch (error) {
    return {
      status: Number.isInteger(error.code) ? error.code : 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? error.message ?? ""
    };
  }
}

async function checked(executable, args, options = {}) {
  const result = await command(executable, args, options);
  if (result.status !== 0) {
    throw new Error(`${executable} ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

async function git(root, args) {
  return checked("git", ["-C", root, ...args], {
    env: { ...process.env, ...fixedGitEnvironment, GIT_TERMINAL_PROMPT: "0" }
  });
}

async function temple(root, args) {
  return checked(process.execPath, [path.join(root, "templew.mjs"), ...args], {
    cwd: root,
    env: { ...process.env, TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs") }
  });
}

function assertSafeLabRoot(value) {
  const resolved = path.resolve(value);
  const temporaryRoot = path.resolve(os.tmpdir());
  const relative = path.relative(temporaryRoot, resolved);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative) ||
    !path.basename(resolved).startsWith("temple-wi0141-")
  ) {
    throw new Error("Lab root must be a specific temple-wi0141-* directory below the system temporary directory");
  }
  return resolved;
}

function initConfig(projectId, projectName) {
  return {
    schema_version: "temple.init/v1",
    project: { id: projectId, name: projectName },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Mog", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Yuna", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Tidus", positions: ["tech_lead"] },
      { display_name: "Fixture Rikku", positions: ["developer"] },
      { display_name: "Fixture Lulu", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

async function initializeGitRepository(root, name) {
  await fs.mkdir(root, { recursive: true });
  await writeText(path.join(root, "README.md"), `# ${name}\n\nSynthetic local WI-0141 fixture. No production or external authority.\n`);
  await checked("git", ["init", "-b", "main", root], { env: { ...process.env, ...fixedGitEnvironment } });
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", `Create ${name} fixture`]);
}

async function installTemple(root, configPath, projectId, projectName) {
  await writeJson(configPath, initConfig(projectId, projectName));
  await checked(process.execPath, [path.join(repositoryRoot, "bin/temple.mjs"), "init", root, "--config", configPath], {
    cwd: root,
    env: { ...process.env, TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs") }
  });
}

function route({ id, kind, title, summary, paths, tags, positions, stages, purposes, ownerPosition }) {
  return {
    id,
    kind,
    title,
    summary,
    paths,
    tags,
    positions,
    work_items: ["WI-0001"],
    read_when: [`Recovering ${title.toLowerCase()} for WI-0001`],
    owner_position: ownerPosition,
    status: "active",
    stages,
    purposes
  };
}

function singleRoutes() {
  return [
    route({
      id: "product-requirement", kind: "product-spec", title: "Idempotency requirement",
      summary: "Exact behavior and authority for duplicate request handling.", paths: ["docs/product/idempotency.md"],
      tags: ["idempotency", "request-id"], positions: ["product_manager", "developer", "quality_evaluator", "independent_qa"],
      stages: ["spec", "design", "build", "test", "eval", "independent_qa"], purposes: ["primary", "recovery"], ownerPosition: "product_manager"
    }),
    route({
      id: "architecture-decision", kind: "adr", title: "Receipt reuse decision",
      summary: "Accepted technical decision governing stored receipt reuse.", paths: ["docs/adr/0042-reuse-original-receipt.md"],
      tags: ["idempotency", "receipt"], positions: ["tech_lead", "developer", "quality_evaluator", "independent_qa"],
      stages: ["design", "build", "test", "eval", "independent_qa"], purposes: ["primary", "recovery"], ownerPosition: "tech_lead"
    }),
    route({
      id: "developer-handoff", kind: "test", title: "Developer verification handoff",
      summary: "Candidate status, public tests, residual risk, and next action.", paths: ["docs/handoffs/developer.md"],
      tags: ["verification", "handoff"], positions: ["quality_evaluator", "independent_qa"],
      stages: ["test", "eval", "independent_qa"], purposes: ["primary", "recovery"], ownerPosition: "developer"
    }),
    route({
      id: "product-discovery", kind: "product-spec", title: "Future subscription discovery",
      summary: "Unapproved discovery notes unrelated to the current candidate.", paths: ["docs/discovery/subscriptions.md"],
      tags: ["future", "subscriptions"], positions: ["product_manager"],
      stages: ["intake", "spec"], purposes: ["primary"], ownerPosition: "product_manager"
    }),
    route({
      id: "ui-exploration", kind: "documentation", title: "Dashboard UI exploration",
      summary: "Historical visual exploration unrelated to idempotency verification.", paths: ["docs/ui/dashboard.md"],
      tags: ["ui", "dashboard"], positions: ["ui_designer", "developer"],
      stages: ["design", "build"], purposes: ["primary"], ownerPosition: "ui_designer"
    }),
    route({
      id: "deployment-runbook", kind: "runbook", title: "Production deployment runbook",
      summary: "Release operations intentionally outside the current test stage.", paths: ["docs/operations/deploy.md"],
      tags: ["deployment", "release"], positions: ["release_manager"],
      stages: ["release_gate"], purposes: ["primary", "recovery"], ownerPosition: "release_manager"
    }),
    route({
      id: "historical-incident", kind: "documentation", title: "Archived incident narrative",
      summary: "Historical incident material with no authority over the candidate.", paths: ["docs/history/incident-2024.md"],
      tags: ["history", "incident"], positions: ["observer"],
      stages: ["done"], purposes: ["recovery"], ownerPosition: "observer"
    })
  ];
}

function multiRoutes() {
  return [
    route({
      id: "event-contract", kind: "technical-spec", title: "OrderPlaced v2 contract",
      summary: "Governing event contract and compatibility rule.", paths: ["docs/contracts/order-placed-v2.md"],
      tags: ["orderplaced", "contract"], positions: ["tech_lead", "developer", "quality_evaluator", "independent_qa"],
      stages: ["design", "build", "test", "eval", "independent_qa"], purposes: ["primary", "integration", "recovery"], ownerPosition: "tech_lead"
    }),
    route({
      id: "component-portfolio", kind: "module", title: "Component revision portfolio",
      summary: "Exact component revisions and coordinator authority.", paths: ["docs/integration/portfolio.md"],
      tags: ["integration", "revisions"], positions: ["developer", "quality_evaluator", "independent_qa"],
      stages: ["build", "test", "eval", "independent_qa"], purposes: ["integration", "recovery"], ownerPosition: "developer"
    }),
    route({
      id: "slice-handoffs", kind: "test", title: "Completed component handoffs",
      summary: "Completed slices, current risk, and bounded integration next action.", paths: ["docs/handoffs/components.md"],
      tags: ["handoff", "integration"], positions: ["developer", "quality_evaluator", "independent_qa"],
      stages: ["build", "test", "eval", "independent_qa"], purposes: ["integration", "recovery"], ownerPosition: "developer"
    }),
    route({
      id: "future-discovery", kind: "product-spec", title: "Future marketplace discovery",
      summary: "Unapproved future scope unrelated to the event integration.", paths: ["docs/discovery/marketplace.md"],
      tags: ["future", "marketplace"], positions: ["product_manager"],
      stages: ["intake", "spec"], purposes: ["primary"], ownerPosition: "product_manager"
    }),
    route({
      id: "release-plan", kind: "runbook", title: "Production release plan",
      summary: "Deployment instructions excluded from local integration recovery.", paths: ["docs/operations/release.md"],
      tags: ["release", "deployment"], positions: ["release_manager"],
      stages: ["release_gate"], purposes: ["primary", "recovery"], ownerPosition: "release_manager"
    }),
    route({
      id: "incident-archive", kind: "documentation", title: "Archived queue incident",
      summary: "Historical incident evidence unrelated to the frozen handoff.", paths: ["docs/history/queue-incident.md"],
      tags: ["incident", "history"], positions: ["observer"],
      stages: ["done"], purposes: ["recovery"], ownerPosition: "observer"
    })
  ];
}

async function createTempleWorkItem(root, { title, scope, acceptance, affectedPath, routes, targetState }) {
  await writeJson(path.join(root, ".ai-org/project/context-map.json"), {
    schema_version: "temple.context-map/v2",
    routes
  });
  const create = [
    "work-item", "create", ".", "--title", title,
    "--scope", scope,
    "--acceptance", acceptance,
    "--affected-path", affectedPath,
    "--spec-mode", "gate-evidence",
    "--ui-mode", "not-applicable",
    "--workflow-profile", "standard",
    "--risk-tier", "standard",
    "--scope-class", "bounded",
    "--profile-rationale", "Synthetic local cold-handoff fixture with no external action.",
    "--tracker-visibility", "internal"
  ];
  for (const entry of routes) create.push("--context-ref", entry.id);
  await temple(root, create);
  const artifacts = path.join(root, ".ai-org/artifacts/WI-0001");
  await writeText(path.join(artifacts, "work-order.md"), "# Work order\n\nRecover the frozen local handoff without changing repository state.\n");
  await writeText(path.join(artifacts, "approved-scope.md"), "# Approved scope\n\nRead-only recovery of exact repository-backed facts.\n");
  await writeText(path.join(artifacts, "technical-design.md"), "# Technical design\n\nUse repository files as authority and keep external actions disabled.\n");
  await writeText(path.join(artifacts, "developer-handoff.md"), "# Developer handoff\n\nCandidate and public-test evidence are ready for independent verification.\n");
  await temple(root, ["transition", ".", "--work-item", "WI-0001", "--to", "spec", "--satisfy", "work_order=.ai-org/artifacts/WI-0001/work-order.md"]);
  await temple(root, [
    "transition", ".", "--work-item", "WI-0001", "--to", "design",
    "--satisfy", "approved_scope=.ai-org/artifacts/WI-0001/approved-scope.md",
    "--satisfy", "acceptance_criteria=.ai-org/artifacts/WI-0001/approved-scope.md"
  ]);
  await temple(root, [
    "transition", ".", "--work-item", "WI-0001", "--to", "build",
    "--satisfy", "technical_design=.ai-org/artifacts/WI-0001/technical-design.md",
    "--satisfy", "risk_review=.ai-org/artifacts/WI-0001/technical-design.md"
  ]);
  if (targetState === "test") {
    await temple(root, [
      "transition", ".", "--work-item", "WI-0001", "--to", "test",
      "--satisfy", "developer_handoff=.ai-org/artifacts/WI-0001/developer-handoff.md",
      "--satisfy", "developer_evidence=.ai-org/artifacts/WI-0001/developer-handoff.md"
    ]);
  }
}

async function createSingleSource(labRoot) {
  const root = path.join(labRoot, "sources/single-repository/coordinator");
  await initializeGitRepository(root, "single-repository");
  await writeText(path.join(root, "docs/product/idempotency.md"), [
    "# Idempotency requirement", "",
    "Authority: approved product requirement.",
    "Requirement ID: REQ-IDEMPOTENCY-001.",
    "Duplicate request effect: return-original-receipt.",
    "Entries with the same request_id return the original receipt without duplicate ledger records.", ""
  ].join("\n"));
  await writeText(path.join(root, "docs/adr/0042-reuse-original-receipt.md"), [
    "# ADR-0042: Reuse the original receipt", "", "Status: Accepted", "",
    "Duplicate requests return the first committed receipt and never append a second ledger entry.", ""
  ].join("\n"));
  await writeText(path.join(root, "docs/handoffs/developer.md"), [
    "# Developer handoff", "", "Public tests passed: 18.",
    "Public tests failed: 0.",
    "Unresolved risk ID: RISK-CRASH-RECOVERY.",
    "Unresolved risk: Crash recovery after fsync remains unverified.",
    "Safe next action ID: ACTION-INDEPENDENT-CRASH-QA.",
    "Safe next action: Run independent crash-recovery QA without changing the candidate.", ""
  ].join("\n"));
  await writeText(path.join(root, "docs/discovery/subscriptions.md"), "# Subscription discovery\n\nFuture billing tiers remain unapproved.\n".repeat(40));
  await writeText(path.join(root, "docs/ui/dashboard.md"), "# Dashboard exploration\n\nArchived layout variants are not part of WI-0001.\n".repeat(36));
  await writeText(path.join(root, "docs/operations/deploy.md"), "# Deployment runbook\n\nProduction steps are outside this local verification.\n".repeat(44));
  await writeText(path.join(root, "docs/history/incident-2024.md"), "# Archived incident\n\nHistorical narrative has no authority over the candidate.\n".repeat(48));
  await installTemple(root, path.join(labRoot, "configs/single.json"), "wi0141-single", "WI-0141 Single Fixture");
  await createTempleWorkItem(root, {
    title: "Recover the idempotent receipt candidate",
    scope: "Recover the exact requirement, accepted decision, revision, tests, residual risk, and next action.",
    acceptance: "Every frozen recovery field is exact and no repository state changes.",
    affectedPath: "src/ledger.mjs",
    routes: singleRoutes(),
    targetState: "test"
  });
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Freeze single-repository cold handoff"]);
  const revision = await git(root, ["rev-parse", "HEAD"]);
  const tree = await git(root, ["rev-parse", "HEAD^{tree}"]);
  return {
    root,
    stage: "test",
    purpose: "primary",
    position: "quality_evaluator",
    repositories: { coordinator: { revision, tree } },
    expected: {
      requirement_id: "REQ-IDEMPOTENCY-001",
      duplicate_request_effect: "return-original-receipt",
      decision_id: "ADR-0042",
      repository_revision: revision,
      public_tests_passed: 18,
      public_tests_failed: 0,
      unresolved_risk_id: "RISK-CRASH-RECOVERY",
      safe_next_action_id: "ACTION-INDEPENDENT-CRASH-QA",
      authority_source: "docs/product/idempotency.md"
    }
  };
}

async function createComponentSource(root, repositoryId, sliceId) {
  await initializeGitRepository(root, repositoryId);
  await writeText(path.join(root, "src/service.mjs"), `export const service = ${JSON.stringify(repositoryId)};\nexport const contract = "OrderPlaced/v2";\n`);
  await writeText(path.join(root, "HANDOFF.md"), `# ${repositoryId} handoff\n\nCompleted slice: ${sliceId}.\nContract: OrderPlaced/v2 with v1 compatibility.\n`);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", `Complete ${repositoryId} slice`]);
  return {
    revision: await git(root, ["rev-parse", "HEAD"]),
    tree: await git(root, ["rev-parse", "HEAD^{tree}"])
  };
}

async function createMultiSource(labRoot) {
  const shapeRoot = path.join(labRoot, "sources/coordinator-multi-repository");
  const sliceByRepository = {
    orders: "orders-catalog",
    catalog: "orders-catalog",
    notifications: "notifications",
    gateway: "gateway"
  };
  const repositories = {};
  for (const repositoryId of componentRepositoryIds) {
    const root = path.join(shapeRoot, repositoryId);
    repositories[repositoryId] = await createComponentSource(root, repositoryId, sliceByRepository[repositoryId]);
  }
  const root = path.join(shapeRoot, "coordinator");
  await initializeGitRepository(root, "coordinator");
  await writeText(path.join(root, "docs/contracts/order-placed-v2.md"), [
    "# OrderPlaced/v2", "", "Contract ID: OrderPlaced/v2.",
    "Compatibility policy ID: COMPAT-V1-CONSUMERS.",
    "Authority owner ID: coordinator.",
    "Authority: coordinator-owned contract.",
    "Consumers accept the legacy flat v1 event while producers add the v2 envelope.", ""
  ].join("\n"));
  await writeText(path.join(root, "docs/integration/portfolio.md"), [
    "# Component portfolio", "", "Lifecycle authority: coordinator.", "",
    ...componentRepositoryIds.map((id) => `- ${id}: ${repositories[id].revision}`), ""
  ].join("\n"));
  await writeText(path.join(root, "docs/handoffs/components.md"), [
    "# Completed component handoffs", "",
    "Completed slice IDs: orders-catalog, notifications, gateway.",
    "Unresolved risk ID: RISK-COORDINATOR-PERSISTENCE.",
    "Unresolved risk: Coordinator persistence coverage remains unverified.",
    "Safe next action ID: ACTION-BOUNDED-INTEGRATION-TEST.",
    "Safe next action: Run the bounded coordinator integration test.", ""
  ].join("\n"));
  await writeText(path.join(root, "docs/discovery/marketplace.md"), "# Marketplace discovery\n\nFuture scope remains unapproved.\n".repeat(42));
  await writeText(path.join(root, "docs/operations/release.md"), "# Release plan\n\nProduction rollout is excluded from WI-0001.\n".repeat(46));
  await writeText(path.join(root, "docs/history/queue-incident.md"), "# Queue incident archive\n\nHistorical details do not govern the current contract.\n".repeat(50));
  await installTemple(root, path.join(labRoot, "configs/multi.json"), "wi0141-multi", "WI-0141 Multi Fixture");
  await createTempleWorkItem(root, {
    title: "Recover the OrderPlaced v2 integration handoff",
    scope: "Recover the exact contract, component revisions, completed slices, residual risk, authority, and next action.",
    acceptance: "Every frozen integration recovery field is exact and no repository state changes.",
    affectedPath: "docs/integration/**",
    routes: multiRoutes(),
    targetState: "build"
  });
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Freeze coordinator cold integration handoff"]);
  repositories.coordinator = {
    revision: await git(root, ["rev-parse", "HEAD"]),
    tree: await git(root, ["rev-parse", "HEAD^{tree}"])
  };
  return {
    root,
    shapeRoot,
    stage: "build",
    purpose: "integration",
    position: "developer",
    repositories,
    expected: {
      contract_id: "OrderPlaced/v2",
      compatibility_policy_id: "COMPAT-V1-CONSUMERS",
      component_revisions: Object.fromEntries(componentRepositoryIds.map((id) => [id, repositories[id].revision])),
      completed_slice_ids: ["orders-catalog", "notifications", "gateway"],
      unresolved_risk_id: "RISK-COORDINATOR-PERSISTENCE",
      authority_owner_id: "coordinator",
      safe_next_action_id: "ACTION-BOUNDED-INTEGRATION-TEST"
    }
  };
}

function legacyContextMap(v2) {
  return {
    schema_version: "temple.context-map/v1",
    routes: v2.routes.map(({ stages: _stages, purposes: _purposes, ...entry }) => entry)
  };
}

function packageSources(manifest) {
  return manifest.sources.map((entry) => ({
    ...entry,
    path: `coordinator/${entry.path}`
  }));
}

function treatmentPackage({ conditionId, shape, strategy, capsule, manifest }) {
  const sources = packageSources(manifest);
  return {
    schema_version: CONTEXT_PACKAGE_SCHEMA,
    condition_id: conditionId,
    project_shape: shape,
    strategy,
    route: capsule.route,
    selected_source_count: sources.length,
    measured_source_count: sources.filter((entry) => entry.status === "measured").length,
    measured_source_bytes: sources.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0),
    selection_digest: `sha256:${sha256(stableText(sources))}`,
    resolver_selection_digest: manifest.selection_digest,
    source_bodies_retained: false,
    sources,
    warnings: capsule.warnings
  };
}

async function generateTreatments(source, shape) {
  const mapPath = path.join(source.root, ".ai-org/project/context-map.json");
  const originalText = await fs.readFile(mapPath, "utf8");
  const original = JSON.parse(originalText);
  let stageAware;
  let legacy;
  try {
    stageAware = await resolveWorkItemContext(source.root, {
      workItemId: "WI-0001",
      position: source.position,
      stage: source.stage,
      purpose: source.purpose,
      limit: 50
    });
    await writeJson(mapPath, legacyContextMap(original));
    legacy = await resolveWorkItemContext(source.root, {
      workItemId: "WI-0001",
      position: source.position,
      stage: source.stage,
      purpose: source.purpose,
      limit: 50
    });
  } finally {
    await fs.writeFile(mapPath, originalText);
  }
  const legacyReferences = legacy.source_manifest.sources.flatMap((entry) =>
    entry.categories.map((category) => ({ path: entry.path, category }))
  );
  legacyReferences.push({ path: "TEMPLE.md", category: "operating-contract" });
  const legacyManifest = await buildContextSourceManifest(source.root, legacyReferences);
  const packages = {};
  for (const definition of conditionDefinitions.filter((entry) => entry.shape === shape)) {
    packages[definition.id] = definition.strategy === "stage-aware"
      ? treatmentPackage({ conditionId: definition.id, shape, strategy: definition.strategy, capsule: stageAware, manifest: stageAware.source_manifest })
      : treatmentPackage({ conditionId: definition.id, shape, strategy: definition.strategy, capsule: legacy, manifest: legacyManifest });
  }
  const status = await git(source.root, ["status", "--porcelain"]);
  if (status !== "") throw new Error(`${shape} source fixture became dirty while generating treatments: ${status}`);
  const stagePackage = Object.values(packages).find((entry) => entry.strategy === "stage-aware");
  const legacyPackage = Object.values(packages).find((entry) => entry.strategy === "legacy-expanded");
  if (!stagePackage || !legacyPackage) throw new Error(`${shape} treatment pair is incomplete`);
  if (legacyPackage.measured_source_bytes <= stagePackage.measured_source_bytes) {
    throw new Error(`${shape} legacy treatment is not larger than stage-aware treatment`);
  }
  if (legacyPackage.selection_digest === stagePackage.selection_digest) {
    throw new Error(`${shape} treatment selection digests unexpectedly match`);
  }
  return packages;
}

async function cloneShape(source, conditionRoot) {
  const repositories = Object.keys(source.repositories);
  for (const repositoryId of repositories) {
    const sourceRoot = repositoryId === "coordinator"
      ? source.root
      : path.join(source.shapeRoot, repositoryId);
    await checked("git", ["clone", "--quiet", "--no-hardlinks", sourceRoot, path.join(conditionRoot, repositoryId)], {
      env: { ...process.env, ...fixedGitEnvironment, GIT_TERMINAL_PROMPT: "0" }
    });
  }
}

export function candidateInstruction(shape) {
  const common = [
    "You are a fresh owner with no prior conversation. Recover the exact current state of known Work Item WI-0001 from repository files only.",
    "First read `CONTEXT_PACKAGE.json` with `sed -n '1,260p' CONTEXT_PACKAGE.json`. Then open only the selected canonical sources needed for the requested fields.",
    "Use `git -C coordinator rev-parse HEAD` for the current single-repository revision. For component revisions, use the exact component repository IDs listed in the task.",
    "Do not modify files, infer from chat or memory, deploy, publish, release, or continue product work."
  ];
  if (shape === "single-repository") {
    return [...common,
      "Return the governing requirement ID, duplicate-request effect token, governing ADR ID, current coordinator revision, passed and failed public-test integer totals, unresolved risk ID, safe next action ID, and repository-relative authority source."
    ].join("\n\n");
  }
  return [...common,
    "The exact component repository IDs are gateway, catalog, orders, and notifications.",
    "Return the governing contract ID, compatibility policy ID, exact component revisions, completed slice IDs, unresolved risk ID, lifecycle authority owner ID, and safe next action ID."
  ].join("\n\n");
}

function promptContract(shape) {
  const instruction = candidateInstruction(shape);
  const schema = outputSchemaForShape(shape);
  const components = {
    base_instructions: textMetrics(baseInstructions),
    developer_instructions: textMetrics(developerInstructions),
    user_input: textMetrics(instruction),
    output_schema: textMetrics(JSON.stringify(schema))
  };
  return {
    components,
    explicit_prompt_bytes: Object.values(components).reduce((sum, entry) => sum + entry.utf8_bytes, 0),
    raw_prompt_retained: false
  };
}

async function repositoryManifest(root) {
  return {
    revision: await git(root, ["rev-parse", "HEAD"]),
    tree: await git(root, ["rev-parse", "HEAD^{tree}"]),
    clean: (await git(root, ["status", "--porcelain"])) === ""
  };
}

async function conditionRepositoryManifest(conditionRoot) {
  const result = {};
  for (const repositoryId of ["coordinator", ...componentRepositoryIds]) {
    const root = path.join(conditionRoot, repositoryId);
    if (await pathExists(root)) result[repositoryId] = await repositoryManifest(root);
  }
  return result;
}

function threadStartParams({ id, cwd, route }) {
  return {
    model: route.model,
    config: { model_reasoning_effort: route.reasoning_effort },
    cwd,
    approvalPolicy: "never",
    sandbox: "read-only",
    ephemeral: true,
    serviceName: `temple-wi0141-${id}`,
    developerInstructions,
    ...wave5ThreadIsolation(cwd),
    baseInstructions
  };
}

function turnStartParams({ id, threadId, cwd, route, instruction, outputSchema }) {
  return {
    threadId,
    clientUserMessageId: `wi0141-${id}`,
    input: [{ type: "text", text: instruction }],
    turnTrigger: "user",
    cwd,
    approvalPolicy: "never",
    sandboxPolicy: representativeTurnSandboxPolicy(cwd, "read-only"),
    model: route.model,
    effort: route.reasoning_effort,
    outputSchema
  };
}

function modelEntries(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.models)) return response.models;
  return Array.isArray(response) ? response : [];
}

function modelId(model) {
  return model?.model ?? model?.id ?? model?.slug ?? null;
}

function modelEfforts(model) {
  const values = model?.supportedReasoningEfforts ?? model?.supported_reasoning_efforts ?? model?.reasoningEfforts ?? [];
  return values.map((entry) => typeof entry === "string" ? entry : entry?.reasoningEffort ?? entry?.effort ?? entry?.value ?? null).filter(Boolean);
}

function validateGeneratedWireRequest(schemaText, params) {
  const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const validate = ajv.compile(JSON.parse(schemaText));
  const pass = validate(params);
  return {
    pass,
    request_sha256: sha256(stableText(params)),
    errors: pass ? [] : (validate.errors ?? []).map((entry) => `${entry.instancePath || "#"}: ${entry.message}`)
  };
}

export async function contextAblationProviderHandshake() {
  const cliVersion = await checked("codex", ["--version"]);
  const schemaRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-wi0141-schema-"));
  const schemaNames = [
    "ThreadStartParams.json",
    "TurnStartParams.json",
    "ItemStartedNotification.json",
    "ItemCompletedNotification.json",
    "TurnCompletedNotification.json",
    "ThreadTokenUsageUpdatedNotification.json",
    "ModelReroutedNotification.json"
  ];
  let connection;
  try {
    await checked("codex", ["app-server", "generate-json-schema", "--out", schemaRoot]);
    const schemaTexts = {};
    const schemaDigests = {};
    for (const name of schemaNames) {
      schemaTexts[name] = await fs.readFile(path.join(schemaRoot, "v2", name), "utf8");
      schemaDigests[name] = sha256(schemaTexts[name]);
    }
    connection = createJsonRpcProcess("codex", representativeAppServerArguments, {
      cwd: repositoryRoot,
      env: isolateWave5CodexEnvironment(process.env)
    });
    await connection.request("initialize", {
      clientInfo: { name: "temple-wi0141-preflight", title: "Temple WI-0141 Preflight", version: "4" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const effectiveConfig = await connection.request("config/read", { cwd: repositoryRoot, includeLayers: false });
    const memory = effectiveConfig?.config?.memories ?? {};
    const memoryIsolation = {
      use_memories: memory.use_memories ?? null,
      generate_memories: memory.generate_memories ?? null,
      feature_enabled: effectiveConfig?.config?.features?.memories ?? null,
      arguments_sha256: sha256(JSON.stringify(representativeAppServerArguments)),
      pass: memory.use_memories === false && memory.generate_memories === false && effectiveConfig?.config?.features?.memories === false
    };
    const models = modelEntries(await connection.request("model/list", {}));
    const terra = models.find((entry) => modelId(entry) === "gpt-5.6-terra");
    const efforts = modelEfforts(terra);
    const routeAvailable = Boolean(terra) && efforts.includes("medium");
    const sampleRoot = path.join(os.tmpdir(), "temple-wi0141-wire-sample");
    const sampleRoute = { model: "gpt-5.6-terra", reasoning_effort: "medium" };
    const wireRequests = {
      thread_start: validateGeneratedWireRequest(schemaTexts["ThreadStartParams.json"], threadStartParams({ id: "wire-sample", cwd: sampleRoot, route: sampleRoute })),
      turn_start: validateGeneratedWireRequest(schemaTexts["TurnStartParams.json"], turnStartParams({
        id: "wire-sample", threadId: "wi0141-wire-sample", cwd: sampleRoot, route: sampleRoute,
        instruction: candidateInstruction("single-repository"), outputSchema: singleOutputSchema
      }))
    };
    const schemaChecks = [singleOutputSchema, multiOutputSchema].map((schema) => ({
      ...validateProviderOutputSchema(schema, { portable: true }),
      answer_free: validateAnswerFreeOutputSchema(schema)
    }));
    const acknowledgementResponse = await connection.request("thread/start", threadStartParams({
      id: "configuration-acknowledgement",
      cwd: repositoryRoot,
      route: sampleRoute
    }));
    const configurationAcknowledgement = {
      requested_model: sampleRoute.model,
      acknowledged_model: acknowledgementResponse?.model ?? null,
      requested_reasoning_effort: sampleRoute.reasoning_effort,
      acknowledged_configured_reasoning_effort: acknowledgementResponse?.reasoningEffort ?? null,
      evidence_kind: "thread-configured-state-not-per-turn-execution-telemetry",
      pass: acknowledgementResponse?.model === sampleRoute.model && acknowledgementResponse?.reasoningEffort === sampleRoute.reasoning_effort
    };
    return {
      pass: routeAvailable && memoryIsolation.pass && wireRequests.thread_start.pass && wireRequests.turn_start.pass &&
        schemaChecks.every((entry) => entry.supported && entry.answer_free.pass) && configurationAcknowledgement.pass,
      codex_cli_version: cliVersion,
      schema_digests: schemaDigests,
      model_route: { model: "gpt-5.6-terra", reasoning_effort: "medium", available: routeAvailable, observed_efforts: efforts },
      memory_isolation: memoryIsolation,
      configuration_acknowledgement: configurationAcknowledgement,
      wire_requests: wireRequests,
      structured_output_schemas: schemaChecks.map((entry) => ({
        profile: entry.profile,
        schema_sha256: entry.schema_sha256,
        supported: entry.supported,
        answer_free: entry.answer_free.pass,
        forbidden_keywords: entry.answer_free.forbidden_keywords
      })),
      model_generation_performed: false
    };
  } finally {
    await connection?.close().catch(() => {});
    await fs.rm(schemaRoot, { recursive: true, force: true });
  }
}

export function contextAblationTestProviderContract() {
  return {
    pass: true,
    codex_cli_version: "codex-test-fixture",
    schema_digests: { fixture: "0".repeat(64) },
    model_route: { model: "gpt-5.6-terra", reasoning_effort: "medium", available: true, observed_efforts: ["medium"] },
    memory_isolation: { use_memories: false, generate_memories: false, feature_enabled: false, arguments_sha256: sha256(JSON.stringify(representativeAppServerArguments)), pass: true },
    configuration_acknowledgement: {
      requested_model: "gpt-5.6-terra",
      acknowledged_model: "gpt-5.6-terra",
      requested_reasoning_effort: "medium",
      acknowledged_configured_reasoning_effort: "medium",
      evidence_kind: "thread-configured-state-not-per-turn-execution-telemetry",
      pass: true
    },
    wire_requests: { thread_start: { pass: true, request_sha256: "1".repeat(64), errors: [] }, turn_start: { pass: true, request_sha256: "2".repeat(64), errors: [] } },
    structured_output_schemas: [singleOutputSchema, multiOutputSchema].map((schema) => {
      const result = validateProviderOutputSchema(schema, { portable: true });
      const answerFree = validateAnswerFreeOutputSchema(schema);
      return {
        profile: result.profile,
        schema_sha256: result.schema_sha256,
        supported: result.supported,
        answer_free: answerFree.pass,
        forbidden_keywords: answerFree.forbidden_keywords
      };
    }),
    model_generation_performed: false
  };
}

export function contextAblationApprovalTemplate(protocol) {
  return {
    schema_version: CONTEXT_ABLATION_APPROVAL_SCHEMA,
    work_item_id: "WI-0141",
    protocol_sha256: protocol.protocol_sha256,
    approved: false,
    authorization_source: null,
    approved_conditions: [...conditionIds],
    approved_candidate_turns: conditionDefinitions.length,
    approved_model: "gpt-5.6-terra",
    approved_reasoning_effort: "medium",
    approved_condition_operational_token_limits: Object.fromEntries(conditionDefinitions.map((entry) => [entry.id, entry.operational_token_limit])),
    approved_aggregate_operational_tokens: aggregateOperationalTokenLimit,
    approved_program_wall_clock_ms: programWallClockLimitMs,
    pro_included_allowance_only: true,
    credits_purchase_authorized: false,
    automatic_refill_authorized: false,
    usage_reset_authorized: false,
    retry_count: 0,
    fallback_count: 0,
    approved_at: null
  };
}

export function validateContextAblationApproval(approval, protocol) {
  const expected = contextAblationApprovalTemplate(protocol);
  const errors = [];
  for (const key of [
    "schema_version", "work_item_id", "protocol_sha256", "approved_candidate_turns", "approved_model",
    "approved_reasoning_effort", "approved_aggregate_operational_tokens", "approved_program_wall_clock_ms",
    "pro_included_allowance_only", "credits_purchase_authorized", "automatic_refill_authorized",
    "usage_reset_authorized", "retry_count", "fallback_count"
  ]) {
    if (approval?.[key] !== expected[key]) errors.push(`${key} does not match the frozen protocol`);
  }
  for (const key of ["approved_conditions", "approved_condition_operational_token_limits"]) {
    if (stableText(approval?.[key]) !== stableText(expected[key])) errors.push(`${key} does not match the frozen protocol`);
  }
  if (approval?.approved !== true || typeof approval?.authorization_source !== "string" || approval.authorization_source.trim() === "" || !approval?.approved_at) {
    errors.push("affirmative approval record is incomplete");
  }
  return { accepted: errors.length === 0, errors };
}

function protocolFromLab({
  labManifest,
  packages,
  providerContract,
  sourceRevision,
  harnessSha256,
  historicalRegression,
  diagnosticRegression,
  predecessorIntegrity,
  limitBasis
}) {
  const conditions = conditionDefinitions.map((definition) => {
    const package_ = packages[definition.id];
    const conditionRoot = path.join(labManifest.lab_root, "conditions", definition.id);
    return {
      ...definition,
      repository_manifest: labManifest.conditions[definition.id].repositories,
      treatment: {
        package_sha256: sha256(stableText(package_)),
        selection_digest: package_.selection_digest,
        resolver_selection_digest: package_.resolver_selection_digest,
        selected_source_count: package_.selected_source_count,
        measured_source_bytes: package_.measured_source_bytes
      },
      prompt_contract: promptContract(definition.shape),
      output_schema_sha256: sha256(JSON.stringify(outputSchemaForShape(definition.shape))),
      condition_root_id: path.basename(conditionRoot)
    };
  });
  const protocol = {
    schema_version: CONTEXT_ABLATION_SCHEMA,
    work_item_id: "WI-0141",
    status: "generation-disabled",
    protocol_sha256: null,
    source_revision: sourceRevision,
    harness_sha256: harnessSha256,
    lab_manifest_sha256: labManifest.lab_manifest_sha256,
    conditions,
    execution: {
      condition_order: [...conditionIds],
      candidate_turns: conditionDefinitions.length,
      evaluator_turns: 0,
      retry_count: 0,
      fallback_count: 0,
      network_access: false,
      external_writes: false,
      generation_ready: false,
      exact_approval_required: true,
      condition_operational_token_limits: Object.fromEntries(conditionDefinitions.map((entry) => [entry.id, entry.operational_token_limit])),
      aggregate_operational_token_limit: aggregateOperationalTokenLimit,
      program_wall_clock_limit_ms: programWallClockLimitMs
    },
    provider_contract: providerContract,
    historical_regression: historicalRegression,
    diagnostic_regression: diagnosticRegression,
    predecessor_integrity: predecessorIntegrity,
    privacy: {
      raw_prompts_retained: false,
      raw_responses_retained: false,
      hidden_reasoning_retained: false,
      normalized_structured_completion_retained: true,
      temporary_repositories_retained_in_git: false,
      raw_commands_retained: false,
      raw_command_outputs_retained: false,
      acquisition_manifest: "bounded-path-only",
      acquisition_limits: acquisitionLimits
    },
    interpretation: {
      primary_metric: "objective-correctness",
      per_shape_reporting_required: true,
      sample_per_condition: 2,
      counterbalanced_order: true,
      acquisition_is_primary_diagnostic: true,
      reasoning_effort_claim: "requested-and-thread-configured",
      effective_turn_reasoning_effort_observable: false,
      statistical_claim_authorized: false,
      monetary_claim_authorized: false,
      routing_authority_granted: false
    },
    predecessors: [
      { work_item_id: "WI-0135", evidence: ".ai-org/artifacts/WI-0135/live-experiment-observation.json" },
      { work_item_id: "WI-0136", evidence: ".ai-org/artifacts/WI-0136/representative-main-v16-findings.md" },
      { work_item_id: "WI-0137", evidence: ".ai-org/artifacts/WI-0137/independent-qa.md" },
      { work_item_id: "WI-0138", evidence: ".ai-org/artifacts/WI-0138/evidence-backed-findings.md" },
      { work_item_id: "WI-0139", evidence: ".ai-org/artifacts/WI-0139/live-evaluation.md" },
      { work_item_id: "WI-0140", evidence: ".ai-org/artifacts/WI-0140/release-record.md" }
    ],
    limit_basis: limitBasis
  };
  protocol.protocol_sha256 = contextAblationProtocolDigest(protocol);
  return protocol;
}

export function validateContextAblationProtocol(protocol) {
  const errors = [];
  if (protocol?.schema_version !== CONTEXT_ABLATION_SCHEMA) errors.push("unsupported protocol schema");
  if (protocol?.work_item_id !== "WI-0141" || protocol?.status !== "generation-disabled") errors.push("protocol identity or status mismatch");
  if (protocol?.protocol_sha256 !== contextAblationProtocolDigest(protocol)) errors.push("protocol digest mismatch");
  if (!/^[a-f0-9]{40}$/.test(protocol?.source_revision ?? "")) errors.push("exact source revision missing");
  if (!/^[a-f0-9]{64}$/.test(protocol?.harness_sha256 ?? "")) errors.push("harness digest missing");
  const conditions = protocol?.conditions ?? [];
  if (stableText(conditions.map((entry) => entry.id)) !== stableText(conditionIds)) errors.push("condition order mismatch");
  for (const definition of conditionDefinitions) {
    const condition = conditions.find((entry) => entry.id === definition.id);
    for (const key of ["shape", "strategy", "repetition", "model", "reasoning_effort", "operational_token_limit"]) {
      if (condition?.[key] !== definition[key]) errors.push(`${definition.id}.${key} mismatch`);
    }
    if (!/^[a-f0-9]{64}$/.test(condition?.treatment?.package_sha256 ?? "")) errors.push(`${definition.id} treatment digest missing`);
    if (!Number.isSafeInteger(condition?.treatment?.measured_source_bytes) || condition.treatment.measured_source_bytes <= 0) errors.push(`${definition.id} treatment bytes invalid`);
    if (condition?.prompt_contract?.raw_prompt_retained !== false) errors.push(`${definition.id} prompt retention mismatch`);
  }
  const execution = protocol?.execution ?? {};
  if (execution.candidate_turns !== conditionDefinitions.length || execution.evaluator_turns !== 0 || execution.retry_count !== 0 || execution.fallback_count !== 0 ||
      execution.network_access !== false || execution.external_writes !== false || execution.generation_ready !== false ||
      execution.exact_approval_required !== true || execution.aggregate_operational_token_limit !== aggregateOperationalTokenLimit ||
      execution.program_wall_clock_limit_ms !== programWallClockLimitMs) errors.push("execution boundary mismatch");
  if (stableText(execution.condition_order) !== stableText(conditionIds)) errors.push("execution order mismatch");
  const expectedLimits = Object.fromEntries(conditionDefinitions.map((entry) => [entry.id, entry.operational_token_limit]));
  if (stableText(execution.condition_operational_token_limits) !== stableText(expectedLimits)) errors.push("condition token limits mismatch");
  const position = (id) => execution.condition_order?.indexOf(id) ?? -1;
  const counterbalanced =
    position("single-stage-aware-a") < position("single-legacy-expanded-a") &&
    position("single-legacy-expanded-b") < position("single-stage-aware-b") &&
    position("multi-legacy-expanded-a") < position("multi-stage-aware-a") &&
    position("multi-stage-aware-b") < position("multi-legacy-expanded-b");
  if (!counterbalanced) errors.push("condition order is not counterbalanced");
  for (const shape of ["single-repository", "coordinator-multi-repository"]) {
    for (const strategy of ["legacy-expanded", "stage-aware"]) {
      const repetitions = conditions.filter((entry) => entry.shape === shape && entry.strategy === strategy);
      const matched = repetitions.length === 2 &&
        repetitions[0].treatment?.selection_digest === repetitions[1].treatment?.selection_digest &&
        repetitions[0].treatment?.resolver_selection_digest === repetitions[1].treatment?.resolver_selection_digest &&
        repetitions[0].treatment?.selected_source_count === repetitions[1].treatment?.selected_source_count &&
        repetitions[0].treatment?.measured_source_bytes === repetitions[1].treatment?.measured_source_bytes &&
        stableText(repetitions[0].repository_manifest) === stableText(repetitions[1].repository_manifest);
      if (!matched) errors.push(`${shape}.${strategy} repetitions do not match`);
    }
  }
  if (protocol?.provider_contract?.pass !== true || protocol?.provider_contract?.model_route?.model !== "gpt-5.6-terra" ||
      protocol?.provider_contract?.model_route?.reasoning_effort !== "medium" ||
      protocol?.provider_contract?.configuration_acknowledgement?.acknowledged_model !== "gpt-5.6-terra" ||
      protocol?.provider_contract?.configuration_acknowledgement?.acknowledged_configured_reasoning_effort !== "medium" ||
      protocol?.provider_contract?.configuration_acknowledgement?.pass !== true ||
      protocol?.provider_contract?.structured_output_schemas?.some((entry) => entry.answer_free !== true) ||
      protocol?.provider_contract?.model_generation_performed !== false) {
    errors.push("Provider contract mismatch");
  }
  if (protocol?.privacy?.raw_prompts_retained !== false || protocol?.privacy?.raw_responses_retained !== false ||
      protocol?.privacy?.hidden_reasoning_retained !== false || protocol?.privacy?.raw_commands_retained !== false ||
      protocol?.privacy?.raw_command_outputs_retained !== false || protocol?.privacy?.acquisition_manifest !== "bounded-path-only" ||
      stableText(protocol?.privacy?.acquisition_limits) !== stableText(acquisitionLimits)) errors.push("privacy boundary mismatch");
  if (protocol?.historical_regression?.source_path !== ".ai-org/artifacts/WI-0138/live-observation.json" ||
      !/^[a-f0-9]{64}$/.test(protocol?.historical_regression?.source_sha256 ?? "") ||
      protocol?.historical_regression?.result?.pass !== true ||
      protocol?.historical_regression?.result?.historical_result_changed !== false ||
      protocol?.historical_regression?.model_generation_performed !== false) {
    errors.push("historical regression boundary mismatch");
  }
  if (protocol?.diagnostic_regression?.source_path !== ".ai-org/artifacts/WI-0139/live-observation.json" ||
      !/^[a-f0-9]{64}$/.test(protocol?.diagnostic_regression?.source_sha256 ?? "") ||
      protocol?.diagnostic_regression?.result?.pass !== true ||
      protocol?.diagnostic_regression?.result?.historical_result_changed !== false ||
      protocol?.diagnostic_regression?.model_generation_performed !== false) {
    errors.push("diagnostic regression boundary mismatch");
  }
  if (protocol?.predecessor_integrity?.work_item_id !== "WI-0140" ||
      !/^[a-f0-9]{40}$/.test(protocol?.predecessor_integrity?.baseline_revision ?? "") ||
      protocol?.predecessor_integrity?.artifact_root !== ".ai-org/artifacts/WI-0140" ||
      protocol?.predecessor_integrity?.source_path !== ".ai-org/artifacts/WI-0140/live-protocol.json" ||
      !/^[a-f0-9]{64}$/.test(protocol?.predecessor_integrity?.source_sha256 ?? "") ||
      protocol?.predecessor_integrity?.tracked_diff !== false || protocol?.predecessor_integrity?.working_tree_diff !== false ||
      protocol?.predecessor_integrity?.pass !== true || protocol?.predecessor_integrity?.model_generation_performed !== false) {
    errors.push("predecessor integrity mismatch");
  }
  if (protocol?.limit_basis?.pass !== true ||
      protocol?.limit_basis?.observed_single_repository_lower_bound !== successorLimitBasis.observed_single_repository_lower_bound ||
      protocol?.limit_basis?.derived_single_repository_limit !== successorLimitBasis.single_repository_limit ||
      protocol?.limit_basis?.coordinator_multi_repository_limit !== successorLimitBasis.coordinator_multi_repository_limit) {
    errors.push("limit derivation mismatch");
  }
  if (protocol?.interpretation?.reasoning_effort_claim !== "requested-and-thread-configured" ||
      protocol?.interpretation?.effective_turn_reasoning_effort_observable !== false ||
      protocol?.interpretation?.sample_per_condition !== 2 || protocol?.interpretation?.counterbalanced_order !== true ||
      protocol?.interpretation?.acquisition_is_primary_diagnostic !== true ||
      protocol?.interpretation?.statistical_claim_authorized !== false || protocol?.interpretation?.monetary_claim_authorized !== false ||
      protocol?.interpretation?.routing_authority_granted !== false) errors.push("interpretation boundary mismatch");
  return { valid: errors.length === 0, errors };
}

export async function prepareContextAblationLab(labRoot = defaultLabRoot, options = {}) {
  if (options.writeArtifacts !== false && (await pathExists(defaultObservationPath) || await pathExists(defaultStoppedObservationPath))) {
    throw new Error("The retained WI-0141 run is sealed; preparation cannot replace its frozen protocol or readiness evidence");
  }
  const resolvedLab = assertSafeLabRoot(labRoot);
  await fs.rm(resolvedLab, { recursive: true, force: true });
  await fs.mkdir(resolvedLab, { recursive: true });
  const single = await createSingleSource(resolvedLab);
  const multi = await createMultiSource(resolvedLab);
  const sources = {
    "single-repository": single,
    "coordinator-multi-repository": multi
  };
  const packages = {
    ...await generateTreatments(single, "single-repository"),
    ...await generateTreatments(multi, "coordinator-multi-repository")
  };
  for (const definition of conditionDefinitions) {
    const conditionRoot = path.join(resolvedLab, "conditions", definition.id);
    await fs.mkdir(conditionRoot, { recursive: true });
    await cloneShape(sources[definition.shape], conditionRoot);
    await writeJson(path.join(conditionRoot, "CONTEXT_PACKAGE.json"), packages[definition.id]);
  }
  const labManifest = {
    schema_version: "temple.context-capsule-ablation-lab/v1",
    work_item_id: "WI-0141",
    lab_root: resolvedLab,
    shapes: Object.fromEntries(Object.entries(sources).map(([shape, source]) => [shape, {
      stage: source.stage,
      purpose: source.purpose,
      position: source.position,
      repositories: source.repositories,
      expected: source.expected
    }])),
    conditions: Object.fromEntries(await Promise.all(conditionDefinitions.map(async (definition) => {
      const conditionRoot = path.join(resolvedLab, "conditions", definition.id);
      return [definition.id, {
        repositories: await conditionRepositoryManifest(conditionRoot),
        context_package_sha256: sha256(await fs.readFile(path.join(conditionRoot, "CONTEXT_PACKAGE.json"), "utf8"))
      }];
    }))),
    model_generation_performed: false,
    lab_manifest_sha256: null
  };
  labManifest.lab_manifest_sha256 = sha256(stableText({ ...labManifest, lab_root: "<temporary-lab>", lab_manifest_sha256: null }));
  await writeJson(path.join(resolvedLab, "lab-manifest.json"), labManifest);
  const providerContract = options.providerContract ?? await contextAblationProviderHandshake();
  if (!providerContract.pass) throw new Error("Provider compatibility handshake failed before protocol freeze");
  const sourceRevision = options.sourceRevision ?? await git(repositoryRoot, ["rev-parse", "HEAD"]);
  const harnessSha256 = sha256(await fs.readFile(harnessPath, "utf8"));
  const falseNegativeObservationText = await fs.readFile(retainedFalseNegativeObservationPath, "utf8");
  const historicalResult = evaluateRetainedFalseNegativeRegression(JSON.parse(falseNegativeObservationText));
  if (!historicalResult.pass) throw new Error("Retained WI-0138 false-negative regression failed before protocol freeze");
  const historicalRegression = {
    source_path: path.relative(repositoryRoot, retainedFalseNegativeObservationPath),
    source_sha256: sha256(falseNegativeObservationText),
    result: historicalResult,
    model_generation_performed: false
  };
  const diagnosticObservationText = await fs.readFile(retainedDiagnosticObservationPath, "utf8");
  const diagnosticObservation = JSON.parse(diagnosticObservationText);
  const diagnosticResult = evaluateRetainedDiagnosticRegression(diagnosticObservation);
  if (!diagnosticResult.pass) throw new Error("Retained WI-0139 diagnostic regression failed before protocol freeze");
  const limitBasis = deriveSuccessorLimitBasis(diagnosticObservation);
  if (!limitBasis.pass) throw new Error("WI-0139 evidence cannot derive the successor single-repository limit");
  const predecessorIntegrity = await retainedRouteAdherenceIntegrity();
  if (!predecessorIntegrity.pass) throw new Error("WI-0140 artifacts changed before live protocol freeze");
  const diagnosticRegression = {
    source_path: path.relative(repositoryRoot, retainedDiagnosticObservationPath),
    source_sha256: sha256(diagnosticObservationText),
    result: diagnosticResult,
    model_generation_performed: false
  };
  const protocol = protocolFromLab({
    labManifest,
    packages,
    providerContract,
    sourceRevision,
    harnessSha256,
    historicalRegression,
    diagnosticRegression,
    predecessorIntegrity,
    limitBasis
  });
  const validation = validateContextAblationProtocol(protocol);
  if (!validation.valid) throw new Error(`Prepared protocol is invalid: ${validation.errors.join(", ")}`);
  if (options.writeArtifacts !== false) {
    await writeJson(defaultProtocolPath, protocol);
    await writeJson(defaultApprovalTemplatePath, contextAblationApprovalTemplate(protocol));
  }
  await writeJson(path.join(resolvedLab, "live-protocol.json"), protocol);
  await writeJson(path.join(resolvedLab, "account-approval.template.json"), contextAblationApprovalTemplate(protocol));
  return { labRoot: resolvedLab, labManifest, packages, protocol };
}

function valuesEqual(actual, expected) {
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return stableText([...actual].sort()) === stableText([...expected].sort());
  }
  return stableText(actual) === stableText(expected);
}

function validateStructuredOutput(output, schema) {
  const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const validate = ajv.compile(schema);
  const pass = validate(output);
  return {
    pass,
    errors: pass ? [] : (validate.errors ?? []).map((entry) => `${entry.instancePath || "#"}: ${entry.message}`)
  };
}

function typedFactFieldErrors(shape, output) {
  const stableId = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
  const kebab = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const revision = /^[0-9a-f]{40}$/;
  const errors = {};
  const require = (field, pass, message) => {
    if (!pass) errors[field] = message;
  };
  if (shape === "single-repository") {
    require("requirement_id", stableId.test(output?.requirement_id ?? ""), "must be a stable uppercase requirement ID");
    require("duplicate_request_effect", kebab.test(output?.duplicate_request_effect ?? ""), "must be a kebab-case behavior token");
    require("decision_id", /^ADR-\d{4}$/.test(output?.decision_id ?? ""), "must be an ADR ID");
    require("repository_revision", revision.test(output?.repository_revision ?? ""), "must be an exact 40-character Git revision");
    require("public_tests_passed", Number.isSafeInteger(output?.public_tests_passed) && output.public_tests_passed >= 0, "must be a non-negative integer");
    require("public_tests_failed", Number.isSafeInteger(output?.public_tests_failed) && output.public_tests_failed >= 0, "must be a non-negative integer");
    require("unresolved_risk_id", /^RISK-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(output?.unresolved_risk_id ?? ""), "must be a stable risk ID");
    require("safe_next_action_id", /^ACTION-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(output?.safe_next_action_id ?? ""), "must be a stable action ID");
    const authority = output?.authority_source ?? "";
    require("authority_source", typeof authority === "string" && authority.length > 0 && !path.isAbsolute(authority) && !authority.split("/").includes(".."), "must be a repository-relative path");
    return errors;
  }
  if (shape === "coordinator-multi-repository") {
    require("contract_id", /^[A-Za-z][A-Za-z0-9-]*\/v\d+$/.test(output?.contract_id ?? ""), "must be a versioned contract ID");
    require("compatibility_policy_id", /^COMPAT-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(output?.compatibility_policy_id ?? ""), "must be a stable compatibility policy ID");
    const componentRevisions = output?.component_revisions;
    require("component_revisions", componentRevisions && typeof componentRevisions === "object" &&
      componentRepositoryIds.every((id) => revision.test(componentRevisions[id] ?? "")), "must contain exact revisions for every component");
    const slices = output?.completed_slice_ids;
    require("completed_slice_ids", Array.isArray(slices) && slices.length > 0 && new Set(slices).size === slices.length && slices.every((entry) => kebab.test(entry)), "must be a non-empty unique list of slice IDs");
    require("unresolved_risk_id", /^RISK-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(output?.unresolved_risk_id ?? ""), "must be a stable risk ID");
    require("authority_owner_id", kebab.test(output?.authority_owner_id ?? ""), "must be a stable authority owner ID");
    require("safe_next_action_id", /^ACTION-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(output?.safe_next_action_id ?? ""), "must be a stable action ID");
    return errors;
  }
  throw new Error(`Unknown project shape: ${shape}`);
}

export function validateTypedFactSemantics(shape, output) {
  const fieldErrors = typedFactFieldErrors(shape, output);
  return {
    pass: Object.keys(fieldErrors).length === 0,
    field_errors: fieldErrors
  };
}

export function evaluateContextAblationOutput(shape, output, expected) {
  const schema = outputSchemaForShape(shape);
  const schemaResult = validateStructuredOutput(output, schema);
  const typedFacts = validateTypedFactSemantics(shape, output);
  const fields = Object.keys(schema.properties).map((id) => ({
    id,
    pass: schemaResult.pass && typedFacts.field_errors[id] === undefined && valuesEqual(output?.[id], expected?.[id])
  }));
  return {
    pass: schemaResult.pass && typedFacts.pass && fields.every((entry) => entry.pass),
    schema_pass: schemaResult.pass,
    schema_errors: schemaResult.errors,
    typed_fact_pass: typedFacts.pass,
    typed_fact_errors: typedFacts.field_errors,
    fields,
    passed_fields: fields.filter((entry) => entry.pass).length,
    total_fields: fields.length
  };
}

export function projectLegacyFalseNegativeFacts(shape, completion) {
  if (shape === "single-repository") {
    const match = /^\s*(\d+)\s+passed\.?\s*$/i.exec(completion?.public_test_status ?? "");
    if (!match) return null;
    return {
      public_tests_passed: Number(match[1]),
      public_tests_failed: 0
    };
  }
  if (shape === "coordinator-multi-repository") {
    const match = /^\s*([A-Za-z][A-Za-z0-9-]*\/v\d+)(?=\s|:|—|-|$)/.exec(completion?.governing_contract ?? "");
    if (!match) return null;
    return { contract_id: match[1] };
  }
  throw new Error(`Unknown project shape: ${shape}`);
}

export function evaluateRetainedFalseNegativeRegression(observation) {
  const conditions = observation?.conditions ?? [];
  const single = conditions
    .filter((entry) => entry.shape === "single-repository")
    .map((entry) => ({ id: entry.id, facts: projectLegacyFalseNegativeFacts(entry.shape, entry.completion) }));
  const multi = conditions
    .filter((entry) => entry.shape === "coordinator-multi-repository")
    .map((entry) => ({ id: entry.id, facts: projectLegacyFalseNegativeFacts(entry.shape, entry.completion) }));
  const expectedSingle = { public_tests_passed: 18, public_tests_failed: 0 };
  const expectedMulti = { contract_id: "OrderPlaced/v2" };
  const pass = single.length === 2 && multi.length === 2 &&
    single.every((entry) => stableText(entry.facts) === stableText(expectedSingle)) &&
    multi.every((entry) => stableText(entry.facts) === stableText(expectedMulti));
  return {
    pass,
    source_work_item_id: "WI-0138",
    scope: "known-display-false-negatives-only",
    historical_result_changed: false,
    single,
    multi
  };
}

export function deriveSuccessorLimitBasis(observation) {
  const singleCensored = (observation?.conditions ?? []).filter((entry) =>
    entry.shape === "single-repository" &&
    entry.status === "censored" &&
    entry.stop_reason === "condition-operational-token-limit" &&
    Number.isSafeInteger(entry.operational_tokens)
  );
  const observed = singleCensored.length === 0
    ? null
    : Math.max(...singleCensored.map((entry) => entry.operational_tokens));
  const derived = observed === null
    ? null
    : Math.ceil((observed + successorLimitBasis.headroom_band) / successorLimitBasis.rounding_band) * successorLimitBasis.rounding_band;
  return {
    pass: singleCensored.length === 2 &&
      observed === successorLimitBasis.observed_single_repository_lower_bound &&
      derived === successorLimitBasis.single_repository_limit,
    source_work_item_id: "WI-0139",
    observed_single_repository_lower_bound: observed,
    headroom_band: successorLimitBasis.headroom_band,
    rounding_band: successorLimitBasis.rounding_band,
    derived_single_repository_limit: derived,
    coordinator_multi_repository_limit: successorLimitBasis.coordinator_multi_repository_limit,
    meaning: "A fixed safety ceiling derived from retained censoring evidence; not expected use, price, or an optimal budget."
  };
}

export function evaluateRetainedDiagnosticRegression(observation) {
  const conditions = observation?.conditions ?? [];
  const single = conditions.filter((entry) => entry.shape === "single-repository");
  const multiLegacy = conditions.find((entry) => entry.id === "multi-legacy-expanded");
  const multiStage = conditions.find((entry) => entry.id === "multi-stage-aware");
  const total = conditions.reduce((sum, entry) => sum + (Number.isSafeInteger(entry.operational_tokens) ? entry.operational_tokens : 0), 0);
  const tokenDelta = multiLegacy && multiStage
    ? round(((multiStage.operational_tokens - multiLegacy.operational_tokens) / multiLegacy.operational_tokens) * 100)
    : null;
  const latencyDelta = multiLegacy && multiStage
    ? round(((multiStage.turn_elapsed_ms - multiLegacy.turn_elapsed_ms) / multiLegacy.turn_elapsed_ms) * 100)
    : null;
  const pass = conditions.length === 4 &&
    single.length === 2 &&
    single.every((entry) => entry.status === "censored" && entry.stop_reason === "condition-operational-token-limit") &&
    multiLegacy?.status === "completed" && multiLegacy?.objective?.pass === true &&
    multiStage?.status === "completed" && multiStage?.objective?.pass === true &&
    total === 136851 && tokenDelta === 6.38 && latencyDelta === 8.01;
  return {
    pass,
    source_work_item_id: "WI-0139",
    single_repository_censored_conditions: single.map((entry) => entry.id),
    coordinator_multi_repository: {
      legacy_correct: multiLegacy?.objective?.pass ?? null,
      stage_aware_correct: multiStage?.objective?.pass ?? null,
      operational_tokens_delta_percent: tokenDelta,
      latency_delta_percent: latencyDelta
    },
    total_operational_tokens: total,
    historical_result_changed: false
  };
}

async function retainedRouteAdherenceIntegrity() {
  const sourceText = await fs.readFile(retainedRouteAdherenceProtocolPath, "utf8");
  const exactRouteAdherenceRevision = await git(repositoryRoot, ["rev-parse", routeAdherenceBaselineRevision]);
  const artifactRootPath = path.relative(repositoryRoot, retainedRouteAdherenceRoot);
  const changedArtifactPaths = await git(repositoryRoot, ["status", "--porcelain", "--", artifactRootPath]);
  const artifactDiff = await command("git", ["-C", repositoryRoot, "diff", "--quiet", exactRouteAdherenceRevision, "--", artifactRootPath]);
  return {
    work_item_id: "WI-0140",
    baseline_revision: exactRouteAdherenceRevision,
    artifact_root: artifactRootPath,
    source_path: path.relative(repositoryRoot, retainedRouteAdherenceProtocolPath),
    source_sha256: sha256(sourceText),
    tracked_diff: artifactDiff.status !== 0,
    working_tree_diff: changedArtifactPaths !== "",
    pass: artifactDiff.status === 0 && changedArtifactPaths === "",
    model_generation_performed: false
  };
}

async function inspectLab(labRoot, protocolPath = defaultProtocolPath) {
  const resolvedLab = assertSafeLabRoot(labRoot);
  const errors = [];
  if (!await pathExists(path.join(resolvedLab, "lab-manifest.json"))) errors.push("lab manifest missing");
  if (!await pathExists(protocolPath)) errors.push("protocol missing");
  if (errors.length > 0) return { valid: false, errors, checks: [] };
  const labManifest = await readJson(path.join(resolvedLab, "lab-manifest.json"));
  const protocol = await readJson(protocolPath);
  const protocolValidation = validateContextAblationProtocol(protocol);
  const checks = [{ id: "protocol-valid", pass: protocolValidation.valid }];
  errors.push(...protocolValidation.errors);
  const stableManifest = { ...labManifest, lab_root: "<temporary-lab>", lab_manifest_sha256: null };
  const manifestDigestMatches = labManifest.lab_manifest_sha256 === sha256(stableText(stableManifest));
  checks.push({ id: "lab-manifest-digest", pass: manifestDigestMatches });
  if (!manifestDigestMatches) errors.push("lab manifest digest mismatch");
  for (const definition of conditionDefinitions) {
    const conditionRoot = path.join(resolvedLab, "conditions", definition.id);
    const packagePath = path.join(conditionRoot, "CONTEXT_PACKAGE.json");
    const packagePresent = await pathExists(packagePath);
    checks.push({ id: `${definition.id}-package-present`, pass: packagePresent });
    if (!packagePresent) {
      errors.push(`${definition.id} context package missing`);
      continue;
    }
    const package_ = await readJson(packagePath);
    const protocolCondition = protocol.conditions.find((entry) => entry.id === definition.id);
    const packageDigestMatches = sha256(stableText(package_)) === protocolCondition?.treatment?.package_sha256;
    checks.push({ id: `${definition.id}-package-digest`, pass: packageDigestMatches });
    if (!packageDigestMatches) errors.push(`${definition.id} context package digest mismatch`);
    const repositoryManifest_ = await conditionRepositoryManifest(conditionRoot);
    const repositoriesMatch = stableText(repositoryManifest_) === stableText(protocolCondition?.repository_manifest);
    checks.push({ id: `${definition.id}-repository-parity`, pass: repositoriesMatch });
    if (!repositoriesMatch) errors.push(`${definition.id} repository identity or cleanliness mismatch`);
  }
  for (const shape of ["single-repository", "coordinator-multi-repository"]) {
    const stage = protocol.conditions.filter((entry) => entry.shape === shape && entry.strategy === "stage-aware");
    const legacy = protocol.conditions.filter((entry) => entry.shape === shape && entry.strategy === "legacy-expanded");
    const comparableTreatment = (entry) => ({
      selection_digest: entry?.treatment?.selection_digest,
      resolver_selection_digest: entry?.treatment?.resolver_selection_digest,
      selected_source_count: entry?.treatment?.selected_source_count,
      measured_source_bytes: entry?.treatment?.measured_source_bytes
    });
    const stageMatched = stage.length === 2 && stableText(comparableTreatment(stage[0])) === stableText(comparableTreatment(stage[1])) &&
      stableText(stage[0].repository_manifest) === stableText(stage[1].repository_manifest);
    const legacyMatched = legacy.length === 2 && stableText(comparableTreatment(legacy[0])) === stableText(comparableTreatment(legacy[1])) &&
      stableText(legacy[0].repository_manifest) === stableText(legacy[1].repository_manifest);
    const different = stageMatched && legacyMatched &&
      stage[0].treatment.selection_digest !== legacy[0].treatment.selection_digest &&
      stage[0].treatment.measured_source_bytes < legacy[0].treatment.measured_source_bytes &&
      stage[0].treatment.selected_source_count < legacy[0].treatment.selected_source_count;
    checks.push({ id: `${shape}-repetition-parity`, pass: stageMatched && legacyMatched });
    checks.push({ id: `${shape}-treatment-difference`, pass: different });
    if (!stageMatched || !legacyMatched) errors.push(`${shape} repetitions do not retain matched treatments and repositories`);
    if (!different) errors.push(`${shape} does not retain a smaller stage-aware treatment`);
  }
  return { valid: errors.length === 0, errors, checks, protocol, labManifest };
}

function simulatedTurn(definition, completion) {
  return {
    id: definition.id,
    shape: definition.shape,
    strategy: definition.strategy,
    repetition: definition.repetition,
    status: "completed",
    stop_scope: null,
    stop_reason: null,
    requested_model: definition.model,
    acknowledged_model: definition.model,
    requested_reasoning_effort: definition.reasoning_effort,
    acknowledged_configured_reasoning_effort: definition.reasoning_effort,
    effective_turn_reasoning_effort: null,
    reasoning_effort_evidence_kind: "requested-and-thread-configured-not-per-turn-execution-telemetry",
    usage: null,
    operational_tokens: null,
    elapsed_ms: 0,
    turn_elapsed_ms: 0,
    time_to_first_activity_ms: 0,
    tool_activity: {
      command_items: 0,
      command_actions: 0,
      temple_md_reads: 0,
      context_package_reads: 0,
      reported_output_bytes: 0,
      item_types: {}
    },
    context_acquisition: {
      schema_version: "temple.context-acquisition/v1",
      limits: acquisitionLimits,
      entries: [],
      entry_count: 0,
      unique_path_count: 0,
      overflow_count: 0,
      failed_command_items: 0,
      counts: {
        control: 0,
        "required-evidence": 0,
        routed: 1,
        "permitted-fallback": 0,
        "off-route": 0,
        unknown: 0
      },
      reported_output_bytes_by_classification: {
        control: 0,
        "required-evidence": 0,
        routed: 0,
        "permitted-fallback": 0,
        "off-route": 0,
        unknown: 0
      },
      classifiable_context_reads: 1,
      policy_adherent_reads: 1,
      known_policy_adherence_percent: 100,
      routed_share_percent: 100,
      coverage_complete: true,
      adherence_pass: true,
      raw_commands_retained: false,
      raw_output_retained: false
    },
    completion,
    retry_count: 0,
    fallback_count: 0,
    raw_prompt_retained: false,
    raw_response_retained: false,
    hidden_reasoning_retained: false,
    model_generation_performed: false
  };
}

export async function rehearseContextAblation(labRoot = defaultLabRoot, protocolPath = defaultProtocolPath, options = {}) {
  if (options.writeArtifacts !== false && (await pathExists(defaultObservationPath) || await pathExists(defaultStoppedObservationPath))) {
    throw new Error("The retained WI-0141 run is sealed; rehearsal cannot replace its readiness evidence");
  }
  const inspection = await inspectLab(labRoot, protocolPath);
  if (!inspection.valid) throw new Error(`Lab inspection failed: ${inspection.errors.join(", ")}`);
  const { protocol, labManifest } = inspection;
  const conditions = conditionDefinitions.map((definition) => {
    const expected = structuredClone(labManifest.shapes[definition.shape].expected);
    const turn = simulatedTurn(definition, expected);
    return {
      ...turn,
      objective: evaluateContextAblationOutput(definition.shape, turn.completion, expected)
    };
  });
  const malformedSingle = evaluateContextAblationOutput("single-repository", { requirement_id: "partial" }, labManifest.shapes["single-repository"].expected);
  const safeRoot = path.join(assertSafeLabRoot(labRoot), "conditions", "single-stage-aware-a");
  const safePackage = await readJson(path.join(safeRoot, "CONTEXT_PACKAGE.json"));
  const routedPath = safePackage.sources[0].path;
  const acquisitionRehearsal = await buildAcquisitionObservation({
    conditionRoot: safeRoot,
    treatmentPackage: safePackage,
    items: [
      {
        item: {
          type: "commandExecution", cwd: safeRoot, exitCode: 0, aggregatedOutput: "package",
          commandActions: [{ type: "read", command: "sed -n '1,260p' CONTEXT_PACKAGE.json", path: "CONTEXT_PACKAGE.json" }]
        }
      },
      {
        item: {
          type: "commandExecution", cwd: safeRoot, exitCode: 0, aggregatedOutput: "routed",
          commandActions: [{ type: "read", command: `sed -n '1,40p' ${routedPath}`, path: routedPath }]
        }
      },
      {
        item: {
          type: "commandExecution", cwd: safeRoot, exitCode: 0, aggregatedOutput: "off-route",
          commandActions: [{ type: "read", command: "sed -n '1,40p' coordinator/docs/discovery/subscriptions.md", path: "coordinator/docs/discovery/subscriptions.md" }]
        }
      },
      {
        item: {
          type: "commandExecution", cwd: safeRoot, exitCode: 0, aggregatedOutput: "never-retain",
          commandActions: [{ type: "read", command: "sed -n '1,20p' /tmp/outside-secret", path: "/tmp/outside-secret" }]
        }
      },
      {
        item: {
          type: "commandExecution", cwd: safeRoot, exitCode: 1, aggregatedOutput: "failed",
          commandActions: [{ type: "read", command: `sed -n '1,40p' ${routedPath}`, path: routedPath }]
        }
      }
    ]
  });
  const safeCommand = representativeProtocolViolationForMessage({
    method: "item/started",
    params: {
      turnId: "rehearsal-turn",
      item: {
        id: "read-package",
        type: "commandExecution",
        cwd: safeRoot,
        command: "sed -n '1,260p' CONTEXT_PACKAGE.json",
        commandActions: [{ type: "read", command: "sed -n '1,260p' CONTEXT_PACKAGE.json", path: "CONTEXT_PACKAGE.json" }]
      }
    }
  }, { turnId: "rehearsal-turn", armRoot: safeRoot });
  const escapedCommand = representativeProtocolViolationForMessage({
    method: "item/started",
    params: {
      turnId: "rehearsal-turn",
      item: {
        id: "escape",
        type: "commandExecution",
        cwd: safeRoot,
        command: "sed -n '1,20p' /tmp/outside-secret",
        commandActions: [{ type: "read", command: "sed -n '1,20p' /tmp/outside-secret", path: "/tmp/outside-secret" }]
      }
    }
  }, { turnId: "rehearsal-turn", armRoot: safeRoot });
  const reroute = representativeProtocolViolationForMessage({
    method: "model/rerouted",
    params: { turnId: "rehearsal-turn", fromModel: "gpt-5.6-terra", toModel: "gpt-5.6-sol" }
  }, { turnId: "rehearsal-turn", armRoot: safeRoot });
  const outputSchemasPortable = [singleOutputSchema, multiOutputSchema]
    .map((schema) => validateProviderOutputSchema(schema, { portable: true }))
    .every((entry) => entry.supported);
  const outputSchemasAnswerFree = [singleOutputSchema, multiOutputSchema]
    .every((schema) => validateAnswerFreeOutputSchema(schema).pass);
  const historicalRegression = protocol.historical_regression?.result;
  const checks = [
    ...inspection.checks,
    { id: "all-injected-candidates-objectively-pass", pass: conditions.every((entry) => entry.objective.pass) },
    { id: "malformed-output-fails-closed", pass: malformedSingle.pass === false },
    { id: "output-schemas-portable", pass: outputSchemasPortable },
    { id: "output-schemas-answer-free", pass: outputSchemasAnswerFree },
    { id: "retained-false-negatives-project-to-typed-facts", pass: historicalRegression?.pass === true && historicalRegression?.historical_result_changed === false },
    { id: "retained-diagnostic-regression-reproduced", pass: protocol.diagnostic_regression?.result?.pass === true },
    { id: "predecessor-artifacts-unchanged", pass: protocol.predecessor_integrity?.pass === true },
    { id: "data-derived-limit-valid", pass: protocol.limit_basis?.pass === true && protocol.limit_basis.derived_single_repository_limit === successorLimitBasis.single_repository_limit },
    { id: "condition-order-counterbalanced", pass: protocol.interpretation?.counterbalanced_order === true },
    { id: "acquisition-routed-read-classified", pass: acquisitionRehearsal.counts.routed === 1 },
    { id: "acquisition-off-route-read-visible", pass: acquisitionRehearsal.counts["off-route"] === 1 && acquisitionRehearsal.adherence_pass === false },
    { id: "acquisition-unknown-reduces-coverage", pass: acquisitionRehearsal.counts.unknown === 1 && acquisitionRehearsal.coverage_complete === false },
    { id: "acquisition-failed-read-excluded", pass: acquisitionRehearsal.failed_command_items === 1 && acquisitionRehearsal.entry_count === 4 },
    { id: "acquisition-retains-no-raw-command-or-output", pass: !JSON.stringify(acquisitionRehearsal).includes("sed -n") && !JSON.stringify(acquisitionRehearsal).includes("never-retain") },
    { id: "configured-route-acknowledged-before-generation", pass: protocol.provider_contract?.configuration_acknowledgement?.pass === true },
    { id: "safe-package-read-accepted", pass: safeCommand === null },
    { id: "path-escape-rejected", pass: escapedCommand?.code === "command-policy-violation" },
    { id: "model-reroute-rejected", pass: reroute !== null },
    { id: "zero-retry", pass: conditions.every((entry) => entry.retry_count === 0) },
    { id: "zero-fallback", pass: conditions.every((entry) => entry.fallback_count === 0) },
    { id: "zero-provider-generation", pass: conditions.every((entry) => entry.model_generation_performed === false) }
  ];
  const rehearsalObservation = {
    schema_version: CONTEXT_ABLATION_OBSERVATION_SCHEMA,
    work_item_id: "WI-0141",
    protocol_sha256: protocol.protocol_sha256,
    kind: "generation-free-rehearsal",
    status: checks.every((entry) => entry.pass) ? "completed" : "failed",
    conditions,
    total_operational_tokens: 0,
    retry_count: 0,
    fallback_count: 0,
    model_generation_performed: false
  };
  const analysis = analyzeContextAblation({ protocol, observation: rehearsalObservation, generatedAt: "generation-free-rehearsal" });
  checks.push({ id: "analysis-path-completed", pass: analysis.schema_version === CONTEXT_ABLATION_ANALYSIS_SCHEMA });
  const readiness = {
    schema_version: "temple.context-capsule-ablation-readiness/v1",
    work_item_id: "WI-0141",
    protocol_sha256: protocol.protocol_sha256,
    completed_at: options.completedAt ?? new Date().toISOString(),
    pass: checks.every((entry) => entry.pass),
    lab_root_id: path.basename(assertSafeLabRoot(labRoot)),
    checks,
    candidate_turn_count: 0,
    simulated_condition_count: conditionDefinitions.length,
    evaluator_turn_count: 0,
    retry_count: 0,
    fallback_count: 0,
    operational_tokens: 0,
    model_generation_performed: false
  };
  if (!readiness.pass) throw new Error(`Generation-free readiness failed: ${checks.filter((entry) => !entry.pass).map((entry) => entry.id).join(", ")}`);
  await writeJson(path.join(assertSafeLabRoot(labRoot), "harness-readiness.json"), readiness);
  if (options.writeArtifacts !== false) await writeJson(defaultReadinessPath, readiness);
  return readiness;
}

function providerContractMatches(frozen, observed) {
  const keys = [
    "codex_cli_version",
    "schema_digests",
    "model_route",
    "memory_isolation",
    "configuration_acknowledgement",
    "wire_requests",
    "structured_output_schemas"
  ];
  return frozen?.pass === true && observed?.pass === true && keys.every((key) => stableText(frozen[key]) === stableText(observed[key]));
}

export async function preflightContextAblation(labRoot = defaultLabRoot, protocolPath = defaultProtocolPath, approvalPath = defaultApprovalPath, options = {}) {
  if (options.writeArtifacts !== false && (await pathExists(defaultObservationPath) || await pathExists(defaultStoppedObservationPath))) {
    throw new Error("The retained WI-0141 run is sealed; preflight cannot replace its approval evidence");
  }
  const inspection = await inspectLab(labRoot, protocolPath);
  const protocol = inspection.protocol ?? (await pathExists(protocolPath) ? await readJson(protocolPath) : null);
  const readinessPath = path.join(assertSafeLabRoot(labRoot), "harness-readiness.json");
  const readiness = await pathExists(readinessPath) ? await readJson(readinessPath) : null;
  const provider = options.providerContract ?? await contextAblationProviderHandshake();
  const currentPredecessorIntegrity = await retainedRouteAdherenceIntegrity();
  const approval = await pathExists(approvalPath)
    ? validateContextAblationApproval(await readJson(approvalPath), protocol)
    : { accepted: false, errors: ["exact approval missing"] };
  const currentHarnessDigest = sha256(await fs.readFile(harnessPath, "utf8"));
  const checks = [
    { id: "lab-valid", pass: inspection.valid },
    { id: "harness-source-bound", pass: protocol?.harness_sha256 === currentHarnessDigest },
    { id: "provider-contract-matches", pass: providerContractMatches(protocol?.provider_contract, provider) },
    { id: "predecessor-artifacts-still-unchanged", pass: currentPredecessorIntegrity.pass === true && stableText(currentPredecessorIntegrity) === stableText(protocol?.predecessor_integrity) },
    { id: "readiness-present-and-passing", pass: readiness?.pass === true && readiness?.protocol_sha256 === protocol?.protocol_sha256 },
    { id: "exact-approval", pass: approval.accepted }
  ];
  const blockers = checks.filter((entry) => !entry.pass).map((entry) => entry.id);
  const preflight = {
    schema_version: "temple.context-capsule-ablation-preflight/v1",
    work_item_id: "WI-0141",
    observed_at: options.observedAt ?? new Date().toISOString(),
    protocol_sha256: protocol?.protocol_sha256 ?? null,
    generation_ready: blockers.length === 0,
    checks,
    blockers,
    inspection_errors: inspection.errors,
    approval_errors: approval.errors,
    provider_handshake_performed: options.providerContract ? false : true,
    model_generation_performed: false
  };
  const outputPath = approval.accepted
    ? path.join(artifactRoot, "approved-preflight.json")
    : defaultPreflightPath;
  if (options.writeArtifacts !== false) await writeJson(outputPath, preflight);
  await writeJson(path.join(assertSafeLabRoot(labRoot), path.basename(outputPath)), preflight);
  return preflight;
}

function operationalTokens(usage) {
  if (!usage) return null;
  return usage.input_tokens - usage.cached_input_tokens + usage.output_tokens;
}

function parseStructuredCompletion(value) {
  if (typeof value !== "string" || value.trim() === "") throw new Error("structured completion message missing");
  const normalized = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(normalized);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("structured completion must be an object");
  return parsed;
}

function createBudget(limit) {
  const active = new Map();
  let settled = 0;
  return {
    update(id, value) {
      active.set(id, value);
      return settled + [...active.values()].reduce((sum, entry) => sum + entry, 0);
    },
    settle(id, value) {
      active.delete(id);
      settled += value;
      return settled;
    },
    total() {
      return settled + [...active.values()].reduce((sum, entry) => sum + entry, 0);
    },
    limit
  };
}

function emptyToolActivity() {
  return {
    command_items: 0,
    command_actions: 0,
    temple_md_reads: 0,
    context_package_reads: 0,
    reported_output_bytes: 0,
    item_types: {}
  };
}

function pathWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function retainedOutputBytes(item) {
  for (const key of ["aggregatedOutput", "output", "formattedOutput"]) {
    if (typeof item?.[key] === "string") return Buffer.byteLength(item[key]);
  }
  return null;
}

function strictSedPath(commandText) {
  const match = /^sed\s+-n\s+(?:'[^']+'|"[^"]+"|\S+)\s+(?:"([^"]+)"|'([^']+)'|(\S+))$/.exec(commandText ?? "");
  return match ? match[1] ?? match[2] ?? match[3] : null;
}

function strictCatPath(commandText) {
  const match = /^cat\s+(?:"([^"]+)"|'([^']+)'|([^\s'"]+))$/.exec(commandText ?? "");
  return match ? match[1] ?? match[2] ?? match[3] : null;
}

function strictReadPath(commandText) {
  return strictSedPath(commandText) ?? strictCatPath(commandText);
}

function gitAcquisition(commandText) {
  const match = /^git\s+-C\s+(coordinator|gateway|catalog|orders|notifications)\s+(rev-parse\s+HEAD|status\s+--short)$/.exec(commandText ?? "");
  if (!match) return null;
  return {
    repository_id: match[1],
    path: match[2].startsWith("rev-parse") ? "@git/HEAD" : "@git/status",
    access_kind: "git",
    classification: "required-evidence"
  };
}

async function repositoryRootForCwd(itemCwd, conditionRoot, repositoryRoots) {
  if (typeof itemCwd !== "string" || itemCwd.trim() === "") return null;
  if (repositoryRoots.has(itemCwd)) return { id: itemCwd, root: repositoryRoots.get(itemCwd) };
  if (!path.isAbsolute(itemCwd)) return null;
  let canonical;
  try {
    canonical = await fs.realpath(itemCwd);
  } catch {
    return null;
  }
  for (const [id, root] of repositoryRoots) {
    if (pathWithin(root, canonical)) return { id, root };
  }
  return null;
}

async function cwdIsConditionRoot(itemCwd, conditionRoot) {
  if (typeof itemCwd !== "string" || itemCwd.trim() === "" || !path.isAbsolute(itemCwd)) return false;
  try {
    return await fs.realpath(itemCwd) === conditionRoot;
  } catch {
    return false;
  }
}

function safeRelativePath(value) {
  if (typeof value !== "string" || value.trim() === "" || value.includes("\0")) return null;
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (Buffer.byteLength(normalized) > acquisitionLimits.maximum_path_bytes) return null;
  if (path.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../") || normalized.split("/").includes("..")) return null;
  return normalized;
}

async function normalizeAcquisitionAction({ action, item, conditionRoot, repositoryRoots, routedSources, fallbackSource }) {
  const commandText = normalizeProviderCommandText(action?.command);
  const gitEntry = gitAcquisition(commandText);
  if (gitEntry) return gitEntry;
  const accessKind = action?.type === "read" ? "read" : action?.type === "search" ? "search" : "unknown";
  let candidate = typeof action?.path === "string" ? action.path : strictReadPath(commandText);
  if (candidate === "CONTEXT_PACKAGE.json" || candidate === "./CONTEXT_PACKAGE.json") {
    return await cwdIsConditionRoot(item?.cwd, conditionRoot)
      ? { repository_id: null, path: "CONTEXT_PACKAGE.json", access_kind: accessKind, classification: "control" }
      : { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
  }
  if (typeof candidate !== "string") {
    return { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
  }

  let repositoryId = null;
  let repositoryRoot = null;
  let relativePath = null;
  if (path.isAbsolute(candidate)) {
    let canonical;
    try {
      canonical = await fs.realpath(candidate);
    } catch {
      return { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
    }
    const controlPath = await fs.realpath(path.join(conditionRoot, "CONTEXT_PACKAGE.json")).catch(() => null);
    if (controlPath !== null && canonical === controlPath) {
      return { repository_id: null, path: "CONTEXT_PACKAGE.json", access_kind: accessKind, classification: "control" };
    }
    for (const [id, root] of repositoryRoots) {
      if (pathWithin(root, canonical)) {
        repositoryId = id;
        repositoryRoot = root;
        relativePath = path.relative(root, canonical).split(path.sep).join("/");
        break;
      }
    }
  } else {
    const safe = safeRelativePath(candidate);
    if (safe === null) return { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
    const [first, ...rest] = safe.split("/");
    if (repositoryRoots.has(first) && rest.length > 0) {
      repositoryId = first;
      repositoryRoot = repositoryRoots.get(first);
      relativePath = rest.join("/");
    } else {
      const inferred = await repositoryRootForCwd(item?.cwd, conditionRoot, repositoryRoots);
      if (inferred) {
        repositoryId = inferred.id;
        repositoryRoot = inferred.root;
        relativePath = safe;
      }
    }
  }
  if (!repositoryId || !repositoryRoot || !relativePath || Buffer.byteLength(relativePath) > acquisitionLimits.maximum_path_bytes) {
    return { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
  }

  const candidatePath = path.join(repositoryRoot, ...relativePath.split("/"));
  let canonicalCandidate;
  let stat;
  try {
    canonicalCandidate = await fs.realpath(candidatePath);
    stat = await fs.stat(canonicalCandidate);
  } catch {
    return { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
  }
  if (!pathWithin(repositoryRoot, canonicalCandidate)) {
    return { repository_id: null, path: null, access_kind: accessKind, classification: "unknown" };
  }
  relativePath = path.relative(repositoryRoot, canonicalCandidate).split(path.sep).join("/");
  const fullPath = `${repositoryId}/${relativePath}`;
  let classification = "off-route";
  if (stat.isDirectory() && accessKind === "search") classification = "unknown";
  else if (routedSources.some((source) => fullPath === source || fullPath.startsWith(`${source}/`))) classification = "routed";
  else if (fallbackSource !== null && fullPath === fallbackSource) classification = "permitted-fallback";
  return {
    repository_id: repositoryId,
    path: relativePath,
    access_kind: accessKind,
    classification
  };
}

export async function buildAcquisitionObservation({ items, conditionRoot, treatmentPackage }) {
  const canonicalConditionRoot = await fs.realpath(conditionRoot);
  const repositoryRoots = new Map();
  for (const repositoryId of ["coordinator", ...componentRepositoryIds]) {
    const candidate = path.join(canonicalConditionRoot, repositoryId);
    if (await pathExists(candidate)) repositoryRoots.set(repositoryId, await fs.realpath(candidate));
  }
  const routedSources = (treatmentPackage?.sources ?? [])
    .map((entry) => safeRelativePath(entry?.path))
    .filter(Boolean);
  const fallbackPath = safeRelativePath(treatmentPackage?.route?.fallback?.path);
  const fallbackSource = fallbackPath === null ? null : `coordinator/${fallbackPath}`;
  const entries = [];
  let overflowCount = 0;
  let failedCommandItems = 0;

  for (const record of items ?? []) {
    const item = record?.item ?? record;
    if (item?.type !== "commandExecution" || item.exitCode !== 0) {
      if (item?.type === "commandExecution") failedCommandItems += 1;
      continue;
    }
    const actions = Array.isArray(item.commandActions) && item.commandActions.length > 0
      ? item.commandActions
      : record?.fallbackActions ?? [];
    const outputBytes = actions.length === 1 ? retainedOutputBytes(item) : null;
    for (const action of actions) {
      const normalized = await normalizeAcquisitionAction({
        action,
        item,
        conditionRoot: canonicalConditionRoot,
        repositoryRoots,
        routedSources,
        fallbackSource
      });
      const entry = {
        repository_id: normalized.repository_id,
        path: normalized.path,
        access_kind: normalized.access_kind,
        classification: normalized.classification,
        reported_output_bytes: outputBytes
      };
      if (entries.length < acquisitionLimits.maximum_entries) entries.push(entry);
      else overflowCount += 1;
    }
  }

  const classifications = ["control", "required-evidence", "routed", "permitted-fallback", "off-route", "unknown"];
  const counts = Object.fromEntries(classifications.map((classification) => [
    classification,
    entries.filter((entry) => entry.classification === classification).length
  ]));
  const bytesByClassification = Object.fromEntries(classifications.map((classification) => [
    classification,
    entries.filter((entry) => entry.classification === classification && Number.isSafeInteger(entry.reported_output_bytes))
      .reduce((sum, entry) => sum + entry.reported_output_bytes, 0)
  ]));
  const classifiableContextReads = counts.routed + counts["permitted-fallback"] + counts["off-route"];
  const policyAdherentReads = counts.routed + counts["permitted-fallback"];
  const uniquePaths = new Set(entries
    .filter((entry) => entry.path !== null)
    .map((entry) => `${entry.repository_id ?? "control"}:${entry.path}`));
  const unknownCount = counts.unknown + overflowCount;
  return {
    schema_version: "temple.context-acquisition/v1",
    limits: acquisitionLimits,
    entries,
    entry_count: entries.length,
    unique_path_count: uniquePaths.size,
    overflow_count: overflowCount,
    failed_command_items: failedCommandItems,
    counts,
    reported_output_bytes_by_classification: bytesByClassification,
    classifiable_context_reads: classifiableContextReads,
    policy_adherent_reads: policyAdherentReads,
    known_policy_adherence_percent: classifiableContextReads === 0 ? null : round((policyAdherentReads / classifiableContextReads) * 100),
    routed_share_percent: classifiableContextReads === 0 ? null : round((counts.routed / classifiableContextReads) * 100),
    coverage_complete: unknownCount === 0,
    adherence_pass: unknownCount === 0 && counts["off-route"] === 0,
    raw_commands_retained: false,
    raw_output_retained: false
  };
}

function summarizeCommandItem(item, activity, completed = false) {
  if (item?.type !== "commandExecution") return;
  if (!completed) {
    activity.command_items += 1;
    activity.command_actions += Array.isArray(item.commandActions) ? item.commandActions.length : 0;
  }
  if (completed && item.exitCode === 0) {
    const commands = (item.commandActions ?? []).map((entry) => entry?.command).filter((entry) => typeof entry === "string");
    if (commands.some((entry) => /(?:^|[ /])TEMPLE\.md(?:$|[ '"/])/i.test(entry))) activity.temple_md_reads += 1;
    if (commands.some((entry) => /CONTEXT_PACKAGE\.json/i.test(entry))) activity.context_package_reads += 1;
  }
  for (const key of ["aggregatedOutput", "output", "formattedOutput"]) {
    if (typeof item?.[key] === "string") activity.reported_output_bytes += Buffer.byteLength(item[key]);
  }
}

async function launchCandidateTurn({ definition, cwd, protocol, budget, deadline }) {
  let connection;
  let threadId = null;
  let turnId = null;
  let terminal = null;
  let completionText = null;
  let latestUsage = null;
  let violation = null;
  let processFailure = null;
  const activity = emptyToolActivity();
  const commandActionsByItem = new Map();
  const completedCommandItems = [];
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  let turnRequestedMs = null;
  let firstActivityMs = null;
  const startedCommandIds = new Set();
  let resolveTerminal;
  let resolveExit;
  let resolveDeadline;
  const terminalPromise = new Promise((resolve) => { resolveTerminal = resolve; });
  const exitPromise = new Promise((resolve) => { resolveExit = resolve; });
  const deadlinePromise = new Promise((resolve) => { resolveDeadline = resolve; });

  async function interrupt(reason) {
    if (violation === null) violation = reason;
    if (connection && threadId && turnId) await connection.request("turn/interrupt", { threadId, turnId }, 15000).catch(() => {});
  }

  connection = createJsonRpcProcess("codex", representativeAppServerArguments, {
    cwd,
    env: isolateWave5CodexEnvironment({ ...process.env, TEMPLE_CLI_PATH: path.join(repositoryRoot, "bin/temple.mjs") }),
    onNotification(message) {
      const params = message.params ?? {};
      const matchingTurn = !turnId || params.turnId === turnId || params.turn?.id === turnId;
      if (turnRequestedMs !== null && message.method === "item/started" && matchingTurn && firstActivityMs === null) firstActivityMs = Date.now();
      if (message.method === "thread/tokenUsage/updated" && matchingTurn) {
        const usage = normalizeTokenUsage(params);
        if (usage) {
          latestUsage = usage;
          const conditionTokens = operationalTokens(usage);
          const aggregate = budget.update(definition.id, conditionTokens);
          if (aggregate > budget.limit) void interrupt("aggregate-operational-token-limit");
          else if (conditionTokens > definition.operational_token_limit) void interrupt("condition-operational-token-limit");
        }
      }
      const policyViolation = representativeProtocolViolationForMessage(message, { turnId, armRoot: cwd });
      if (policyViolation) void interrupt(`${policyViolation.code}:${policyViolation.message}`);
      if (message.method === "item/started" && matchingTurn) {
        const item = params.item ?? {};
        const type = typeof item.type === "string" ? item.type : "missing";
        activity.item_types[type] = (activity.item_types[type] ?? 0) + 1;
        const itemViolation = modelTurnItemPolicyViolation(type, true);
        if (itemViolation) void interrupt(`disallowed-item:${itemViolation}`);
        if (item.type === "commandExecution" && !startedCommandIds.has(item.id)) {
          startedCommandIds.add(item.id);
          commandActionsByItem.set(item.id, item.commandActions ?? []);
          summarizeCommandItem(item, activity, false);
        }
      }
      if (message.method === "item/completed" && matchingTurn) {
        const item = params.item ?? {};
        if (item.type === "commandExecution") {
          const fallbackActions = commandActionsByItem.get(item.id) ?? [];
          const completedItem = Array.isArray(item.commandActions) && item.commandActions.length > 0
            ? item
            : { ...item, commandActions: fallbackActions };
          summarizeCommandItem(completedItem, activity, true);
          completedCommandItems.push({ item: completedItem, fallbackActions });
        }
        if (item.type === "agentMessage") completionText = item.text;
      }
      if (message.method === "turn/completed" && matchingTurn) {
        terminal = params.turn;
        resolveTerminal();
      }
    },
    onRequest(message, responder) {
      if (["item/commandExecution/requestApproval", "item/fileChange/requestApproval", "item/permissions/requestApproval"].includes(message.method)) {
        try { responder.respond(buildCodexRuntimeRequestResponse(message.method, message.params, { decision: "decline" })); } catch {}
      }
      void interrupt(`runtime-request:${message.method}`);
    },
    onProtocolError(error) {
      processFailure = `app-server-protocol-error:${String(error.message ?? error)}`;
      resolveExit();
    },
    onExit(error) {
      processFailure = `app-server-exit:${String(error.message ?? error)}`;
      resolveExit();
    }
  });

  const timer = setTimeout(() => {
    void interrupt("program-wall-clock-limit");
    resolveDeadline();
  }, Math.max(1, deadline - Date.now()));
  try {
    await connection.request("initialize", {
      clientInfo: { name: "temple-wi0141", title: "Temple WI-0141 Context Acquisition Ablation", version: "4" },
      capabilities: { experimentalApi: false }
    });
    connection.notify("initialized", {});
    const route = { model: definition.model, reasoning_effort: definition.reasoning_effort };
    const thread = await connection.request("thread/start", threadStartParams({ id: definition.id, cwd, route }));
    threadId = thread?.thread?.id;
    if (!threadId || thread.model !== definition.model) throw new Error(`${definition.id}: requested model was not acknowledged`);
    if (thread.reasoningEffort !== definition.reasoning_effort) {
      throw new Error(`${definition.id}: requested reasoning effort was not acknowledged before generation`);
    }
    turnRequestedMs = Date.now();
    const turn = await connection.request("turn/start", turnStartParams({
      id: definition.id,
      threadId,
      cwd,
      route,
      instruction: candidateInstruction(definition.shape),
      outputSchema: outputSchemaForShape(definition.shape)
    }));
    turnId = turn?.turn?.id;
    if (!turnId) throw new Error(`${definition.id}: turn did not start`);
    await Promise.race([terminalPromise, exitPromise, deadlinePromise]);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (processFailure && !terminal && !violation) violation = processFailure;
    const terminalProblem = terminalFailure(terminal);
    const stopReason = modelTurnStopReason(terminal, violation ?? terminalProblem?.code ?? null);
    const completedMs = Date.now();
    const tokens = operationalTokens(latestUsage);
    if (tokens !== null) budget.settle(definition.id, tokens);
    const treatmentPackage = await readJson(path.join(cwd, "CONTEXT_PACKAGE.json"));
    const contextAcquisition = await buildAcquisitionObservation({
      items: completedCommandItems,
      conditionRoot: cwd,
      treatmentPackage
    });
    const retained = {
      id: definition.id,
      shape: definition.shape,
      strategy: definition.strategy,
      repetition: definition.repetition,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      elapsed_ms: completedMs - startedMs,
      turn_elapsed_ms: turnRequestedMs === null ? null : completedMs - turnRequestedMs,
      time_to_first_activity_ms: firstActivityMs === null || turnRequestedMs === null ? null : firstActivityMs - turnRequestedMs,
      requested_model: definition.model,
      acknowledged_model: thread.model,
      requested_reasoning_effort: definition.reasoning_effort,
      acknowledged_configured_reasoning_effort: thread.reasoningEffort ?? null,
      effective_turn_reasoning_effort: null,
      reasoning_effort_evidence_kind: "requested-and-thread-configured-not-per-turn-execution-telemetry",
      usage: latestUsage,
      operational_tokens: tokens,
      tool_activity: activity,
      context_acquisition: contextAcquisition,
      retry_count: 0,
      fallback_count: 0,
      raw_prompt_retained: false,
      raw_response_retained: false,
      hidden_reasoning_retained: false,
      model_generation_performed: true
    };
    if (stopReason) {
      return {
        ...retained,
        status: stopReason === "condition-operational-token-limit" ? "censored" : "stopped",
        stop_scope: stopReason === "condition-operational-token-limit" ? "condition" : "run",
        stop_reason: stopReason,
        completion: null,
        objective: null
      };
    }
    if (!latestUsage) return { ...retained, status: "stopped", stop_scope: "run", stop_reason: "detailed-token-usage-missing", completion: null, objective: null };
    let completion;
    try {
      completion = parseStructuredCompletion(completionText);
    } catch (error) {
      return { ...retained, status: "stopped", stop_scope: "run", stop_reason: `malformed-completion:${error.message}`, completion: null, objective: null };
    }
    const schemaValidation = validateStructuredOutput(completion, outputSchemaForShape(definition.shape));
    if (!schemaValidation.pass) {
      return { ...retained, status: "stopped", stop_scope: "run", stop_reason: `completion-schema:${schemaValidation.errors.join(";")}`, completion: null, objective: null };
    }
    return { ...retained, status: "completed", stop_scope: null, stop_reason: null, completion };
  } finally {
    clearTimeout(timer);
    await connection?.close().catch(() => {});
  }
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function delta(baseline, treatment) {
  if (!Number.isFinite(baseline) || !Number.isFinite(treatment) || baseline === 0) return null;
  return {
    absolute: round(treatment - baseline),
    percent: round(((treatment - baseline) / baseline) * 100)
  };
}

function observedMetric(condition, key) {
  if (key === "latency_ms") return condition.turn_elapsed_ms;
  if (key === "tool_output_bytes") return condition.tool_activity?.reported_output_bytes;
  return condition[key];
}

function mean(values) {
  return values.length > 0 && values.every(Number.isFinite)
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function spread(values) {
  if (values.length === 0 || !values.every(Number.isFinite)) return null;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  return {
    values,
    minimum,
    maximum,
    absolute: maximum - minimum,
    percent_of_minimum: minimum === 0 ? null : round(((maximum - minimum) / minimum) * 100)
  };
}

function cacheShare(condition) {
  const input = condition.usage?.input_tokens;
  const cached = condition.usage?.cached_input_tokens;
  return Number.isFinite(input) && input > 0 && Number.isFinite(cached)
    ? round((cached / input) * 100)
    : null;
}

function nonCachedInputTokens(condition) {
  const input = condition.usage?.input_tokens;
  const cached = condition.usage?.cached_input_tokens;
  return Number.isFinite(input) && Number.isFinite(cached) && cached >= 0 && cached <= input
    ? input - cached
    : null;
}

function metricPair(legacy, stage, selector) {
  const legacyValue = legacy ? selector(legacy) : null;
  const stageValue = stage ? selector(stage) : null;
  return {
    legacy: legacyValue,
    stage_aware: stageValue,
    delta: Number.isFinite(legacyValue) && Number.isFinite(stageValue) ? delta(legacyValue, stageValue) : null
  };
}

function cacheControlAssessment(protocol, conditions, repetitionPairs) {
  const declared = protocol?.cache_control;
  const method = typeof declared?.method === "string" ? declared.method : "not-declared";
  const pairDeltas = repetitionPairs.map((pair) => {
    const legacy = pair.cache_share_percent.legacy;
    const stage = pair.cache_share_percent.stage_aware;
    return Number.isFinite(legacy) && Number.isFinite(stage) ? round(Math.abs(stage - legacy)) : null;
  });
  const observed = {
    pair_cache_share_delta_percentage_points: pairDeltas,
    maximum_pair_cache_share_delta_percentage_points: pairDeltas.every(Number.isFinite) && pairDeltas.length > 0
      ? Math.max(...pairDeltas)
      : null
  };
  const blocked = (status, reasonCodes) => ({
    status,
    method,
    causal_efficiency_claim: "blocked",
    reason_codes: reasonCodes,
    observed
  });
  if (method === "not-declared") return blocked("insufficient", ["protocol-cache-control-not-declared"]);
  if (method === "uncontrolled") return blocked("insufficient", ["cache-state-uncontrolled"]);
  if (declared?.predeclared !== true) return blocked("insufficient", ["cache-control-not-predeclared"]);
  if (method === "provider-cache-disabled") {
    if (declared?.provider_acknowledged !== true) return blocked("insufficient", ["provider-cache-control-not-acknowledged"]);
    const cachedValues = conditions.map((entry) => entry.usage?.cached_input_tokens);
    if (!cachedValues.every((value) => value === 0)) return blocked("failed", ["cached-input-observed-while-disabled"]);
    return { status: "sufficient", method, causal_efficiency_claim: "eligible", reason_codes: [], observed };
  }
  if (method === "matched-cache-share") {
    const maximum = declared?.maximum_pair_delta_percentage_points;
    if (!Number.isFinite(maximum) || maximum < 0) return blocked("insufficient", ["predeclared-cache-balance-limit-missing"]);
    if (!pairDeltas.every(Number.isFinite)) return blocked("failed", ["cache-share-observation-incomplete"]);
    if (pairDeltas.some((value) => value > maximum)) return blocked("failed", ["cache-share-balance-limit-exceeded"]);
    return { status: "sufficient", method, causal_efficiency_claim: "eligible", reason_codes: [], observed };
  }
  return blocked("insufficient", ["cache-control-method-unsupported-by-analysis"]);
}

function aggregateAcquisition(conditions) {
  const observations = conditions.map((entry) => entry.context_acquisition).filter(Boolean);
  if (observations.length !== conditions.length || observations.length === 0) {
    return {
      available: false,
      coverage_complete: false,
      counts: null,
      classifiable_context_reads: null,
      policy_adherent_reads: null,
      known_policy_adherence_percent: null,
      routed_share_percent: null,
      reported_output_bytes_by_classification: null
    };
  }
  const classifications = ["control", "required-evidence", "routed", "permitted-fallback", "off-route", "unknown"];
  const counts = Object.fromEntries(classifications.map((classification) => [
    classification,
    observations.reduce((sum, entry) => sum + (entry.counts?.[classification] ?? 0), 0)
  ]));
  const bytes = Object.fromEntries(classifications.map((classification) => [
    classification,
    observations.reduce((sum, entry) => sum + (entry.reported_output_bytes_by_classification?.[classification] ?? 0), 0)
  ]));
  const overflow = observations.reduce((sum, entry) => sum + (entry.overflow_count ?? 0), 0);
  const classifiable = counts.routed + counts["permitted-fallback"] + counts["off-route"];
  const adherent = counts.routed + counts["permitted-fallback"];
  return {
    available: true,
    coverage_complete: observations.every((entry) => entry.coverage_complete === true) && overflow === 0,
    overflow_count: overflow,
    counts,
    classifiable_context_reads: classifiable,
    policy_adherent_reads: adherent,
    known_policy_adherence_percent: classifiable === 0 ? null : round((adherent / classifiable) * 100),
    routed_share_percent: classifiable === 0 ? null : round((counts.routed / classifiable) * 100),
    reported_output_bytes_by_classification: bytes
  };
}

function shapeComparison(shape, protocol, conditions) {
  const legacy = conditions.filter((entry) => entry.shape === shape && entry.strategy === "legacy-expanded");
  const stage = conditions.filter((entry) => entry.shape === shape && entry.strategy === "stage-aware");
  const protocolLegacy = protocol.conditions.filter((entry) => entry.shape === shape && entry.strategy === "legacy-expanded");
  const protocolStage = protocol.conditions.filter((entry) => entry.shape === shape && entry.strategy === "stage-aware");
  const completed = legacy.length === 2 && stage.length === 2 && [...legacy, ...stage].every((entry) => entry.status === "completed");
  const legacyPass = completed ? legacy.every((entry) => entry.objective?.pass === true) : null;
  const stagePass = completed ? stage.every((entry) => entry.objective?.pass === true) : null;
  const bothPass = completed && legacyPass === true && stagePass === true;
  const legacyTokens = mean(legacy.map((entry) => observedMetric(entry, "operational_tokens")));
  const stageTokens = mean(stage.map((entry) => observedMetric(entry, "operational_tokens")));
  const legacyLatency = mean(legacy.map((entry) => observedMetric(entry, "latency_ms")));
  const stageLatency = mean(stage.map((entry) => observedMetric(entry, "latency_ms")));
  const legacyToolBytes = mean(legacy.map((entry) => observedMetric(entry, "tool_output_bytes")));
  const stageToolBytes = mean(stage.map((entry) => observedMetric(entry, "tool_output_bytes")));
  const legacyInputTokens = mean(legacy.map((entry) => entry.usage?.input_tokens));
  const stageInputTokens = mean(stage.map((entry) => entry.usage?.input_tokens));
  const legacyCachedTokens = mean(legacy.map((entry) => entry.usage?.cached_input_tokens));
  const stageCachedTokens = mean(stage.map((entry) => entry.usage?.cached_input_tokens));
  const legacyOutputTokens = mean(legacy.map((entry) => entry.usage?.output_tokens));
  const stageOutputTokens = mean(stage.map((entry) => entry.usage?.output_tokens));
  const legacyNonCachedTokens = mean(legacy.map(nonCachedInputTokens));
  const stageNonCachedTokens = mean(stage.map(nonCachedInputTokens));
  const tokens = completed ? delta(legacyTokens, stageTokens) : null;
  const latency = completed ? delta(legacyLatency, stageLatency) : null;
  let outcome = "inconclusive";
  if (completed && legacyPass === true && stagePass === false) outcome = "quality-regression";
  else if (bothPass && tokens && latency) {
    const tokensBetter = tokens.percent < -5;
    const tokensWorse = tokens.percent > 5;
    const latencyBetter = latency.percent < -5;
    const latencyWorse = latency.percent > 5;
    if ((tokensBetter && latencyWorse) || (tokensWorse && latencyBetter)) outcome = "tradeoff";
    else if ((tokensBetter || latencyBetter) && !tokensWorse && !latencyWorse) outcome = "supported";
    else if ((tokensWorse || latencyWorse) && !tokensBetter && !latencyBetter) outcome = "overhead-regression";
    else outcome = "neutral";
  }
  const sourceValue = (entries, key) => entries.length === 2 && entries[0]?.treatment?.[key] === entries[1]?.treatment?.[key]
    ? entries[0].treatment[key]
    : null;
  const legacySourceBytes = sourceValue(protocolLegacy, "measured_source_bytes");
  const stageSourceBytes = sourceValue(protocolStage, "measured_source_bytes");
  const legacySourceCount = sourceValue(protocolLegacy, "selected_source_count");
  const stageSourceCount = sourceValue(protocolStage, "selected_source_count");
  const legacyAcquisition = aggregateAcquisition(legacy);
  const stageAcquisition = aggregateAcquisition(stage);
  const acquisitionCoverageComplete = legacyAcquisition.coverage_complete === true && stageAcquisition.coverage_complete === true;
  const observedOffRoute = (legacyAcquisition.counts?.["off-route"] ?? 0) + (stageAcquisition.counts?.["off-route"] ?? 0);
  const routeAdherenceConclusion = !legacyAcquisition.available || !stageAcquisition.available
    ? "unavailable"
    : !acquisitionCoverageComplete
      ? "inconclusive-incomplete-coverage"
      : observedOffRoute > 0
        ? "off-route-observed"
        : "no-off-route-observed-with-complete-coverage";
  const repetitionPairs = ["a", "b"].map((repetition) => {
    const legacyEntry = legacy.find((entry) => entry.repetition === repetition);
    const stageEntry = stage.find((entry) => entry.repetition === repetition);
    return {
      repetition,
      operational_tokens: metricPair(legacyEntry, stageEntry, (entry) => entry.operational_tokens),
      latency_ms: metricPair(legacyEntry, stageEntry, (entry) => entry.turn_elapsed_ms),
      provider_input_tokens: metricPair(legacyEntry, stageEntry, (entry) => entry.usage?.input_tokens),
      cached_input_tokens: metricPair(legacyEntry, stageEntry, (entry) => entry.usage?.cached_input_tokens),
      non_cached_input_tokens: metricPair(legacyEntry, stageEntry, nonCachedInputTokens),
      output_tokens: metricPair(legacyEntry, stageEntry, (entry) => entry.usage?.output_tokens),
      cache_share_percent: metricPair(legacyEntry, stageEntry, cacheShare)
    };
  });
  const cacheControl = cacheControlAssessment(protocol, [...legacy, ...stage], repetitionPairs);
  return {
    shape,
    outcome,
    repetitions: { legacy: legacy.length, stage_aware: stage.length },
    correctness: {
      legacy_pass: legacyPass,
      stage_aware_pass: stagePass,
      legacy_by_repetition: legacy.map((entry) => ({ repetition: entry.repetition, pass: entry.objective?.pass ?? null })),
      stage_aware_by_repetition: stage.map((entry) => ({ repetition: entry.repetition, pass: entry.objective?.pass ?? null }))
    },
    source_selection: {
      legacy_bytes: legacySourceBytes,
      stage_aware_bytes: stageSourceBytes,
      bytes_delta: delta(legacySourceBytes, stageSourceBytes),
      legacy_source_count: legacySourceCount,
      stage_aware_source_count: stageSourceCount
    },
    operational_tokens: {
      legacy_mean: legacyTokens,
      stage_aware_mean: stageTokens,
      delta: tokens
    },
    provider_usage: {
      input_tokens: { legacy_mean: legacyInputTokens, stage_aware_mean: stageInputTokens, delta: completed ? delta(legacyInputTokens, stageInputTokens) : null },
      cached_input_tokens: { legacy_mean: legacyCachedTokens, stage_aware_mean: stageCachedTokens, delta: completed ? delta(legacyCachedTokens, stageCachedTokens) : null },
      non_cached_input_tokens: { legacy_mean: legacyNonCachedTokens, stage_aware_mean: stageNonCachedTokens, delta: completed ? delta(legacyNonCachedTokens, stageNonCachedTokens) : null },
      output_tokens: { legacy_mean: legacyOutputTokens, stage_aware_mean: stageOutputTokens, delta: completed ? delta(legacyOutputTokens, stageOutputTokens) : null },
      cache_share_percent: {
        legacy_mean: Number.isFinite(mean(legacy.map(cacheShare))) ? round(mean(legacy.map(cacheShare))) : null,
        stage_aware_mean: Number.isFinite(mean(stage.map(cacheShare))) ? round(mean(stage.map(cacheShare))) : null
      }
    },
    cache_control: cacheControl,
    causal_efficiency_claim: {
      status: bothPass && cacheControl.causal_efficiency_claim === "eligible" ? "eligible" : "blocked",
      reason_codes: [
        ...(bothPass ? [] : ["correctness-gate-not-satisfied"]),
        ...cacheControl.reason_codes
      ]
    },
    latency_ms: {
      legacy_mean: legacyLatency,
      stage_aware_mean: stageLatency,
      delta: latency
    },
    tool_output_bytes: {
      legacy_mean: legacyToolBytes,
      stage_aware_mean: stageToolBytes,
      delta: completed ? delta(legacyToolBytes, stageToolBytes) : null
    },
    context_acquisition: {
      legacy: legacyAcquisition,
      stage_aware: stageAcquisition,
      coverage_complete: acquisitionCoverageComplete,
      observed_off_route_count: observedOffRoute,
      conclusion: routeAdherenceConclusion
    },
    repetition_pairs: repetitionPairs,
    repetition_spread: {
      operational_tokens: {
        legacy: spread(legacy.map((entry) => entry.operational_tokens)),
        stage_aware: spread(stage.map((entry) => entry.operational_tokens))
      },
      cache_share_percent: {
        legacy: spread(legacy.map(cacheShare)),
        stage_aware: spread(stage.map(cacheShare))
      }
    }
  };
}

export function analyzeContextAblation({ protocol, observation, generatedAt = new Date().toISOString() }) {
  const comparisons = ["single-repository", "coordinator-multi-repository"]
    .map((shape) => shapeComparison(shape, protocol, observation.conditions ?? []));
  const allCompleted = (observation.conditions ?? []).length === conditionDefinitions.length && observation.conditions.every((entry) => entry.status === "completed");
  const allCorrect = allCompleted && observation.conditions.every((entry) => entry.objective?.pass === true);
  const usageKnown = allCompleted && observation.conditions.every((entry) => Number.isFinite(entry.operational_tokens) && Number.isFinite(entry.turn_elapsed_ms));
  const legacyConditions = (observation.conditions ?? []).filter((entry) => entry.strategy === "legacy-expanded");
  const stageConditions = (observation.conditions ?? []).filter((entry) => entry.strategy === "stage-aware");
  const sum = (values, selector) => values.reduce((total, entry) => total + selector(entry), 0);
  const providerUsageKnown = usageKnown && observation.conditions.every((entry) =>
    Number.isFinite(entry.usage?.input_tokens) &&
    Number.isFinite(entry.usage?.cached_input_tokens) &&
    Number.isFinite(entry.usage?.output_tokens) &&
    Number.isFinite(nonCachedInputTokens(entry))
  );
  const aggregate = providerUsageKnown ? {
    legacy_operational_tokens: sum(legacyConditions, (entry) => entry.operational_tokens),
    stage_aware_operational_tokens: sum(stageConditions, (entry) => entry.operational_tokens),
    operational_tokens_delta: delta(sum(legacyConditions, (entry) => entry.operational_tokens), sum(stageConditions, (entry) => entry.operational_tokens)),
    legacy_provider_input_tokens: sum(legacyConditions, (entry) => entry.usage.input_tokens),
    stage_aware_provider_input_tokens: sum(stageConditions, (entry) => entry.usage.input_tokens),
    provider_input_tokens_delta: delta(sum(legacyConditions, (entry) => entry.usage.input_tokens), sum(stageConditions, (entry) => entry.usage.input_tokens)),
    legacy_cached_input_tokens: sum(legacyConditions, (entry) => entry.usage.cached_input_tokens),
    stage_aware_cached_input_tokens: sum(stageConditions, (entry) => entry.usage.cached_input_tokens),
    cached_input_tokens_delta: delta(sum(legacyConditions, (entry) => entry.usage.cached_input_tokens), sum(stageConditions, (entry) => entry.usage.cached_input_tokens)),
    legacy_non_cached_input_tokens: sum(legacyConditions, nonCachedInputTokens),
    stage_aware_non_cached_input_tokens: sum(stageConditions, nonCachedInputTokens),
    non_cached_input_tokens_delta: delta(sum(legacyConditions, nonCachedInputTokens), sum(stageConditions, nonCachedInputTokens)),
    legacy_output_tokens: sum(legacyConditions, (entry) => entry.usage.output_tokens),
    stage_aware_output_tokens: sum(stageConditions, (entry) => entry.usage.output_tokens),
    output_tokens_delta: delta(sum(legacyConditions, (entry) => entry.usage.output_tokens), sum(stageConditions, (entry) => entry.usage.output_tokens)),
    legacy_latency_ms: sum(legacyConditions, (entry) => entry.turn_elapsed_ms),
    stage_aware_latency_ms: sum(stageConditions, (entry) => entry.turn_elapsed_ms),
    latency_delta: delta(sum(legacyConditions, (entry) => entry.turn_elapsed_ms), sum(stageConditions, (entry) => entry.turn_elapsed_ms))
  } : null;
  return {
    schema_version: CONTEXT_ABLATION_ANALYSIS_SCHEMA,
    work_item_id: "WI-0141",
    protocol_sha256: protocol.protocol_sha256,
    generated_at: generatedAt,
    status: allCompleted && usageKnown ? "complete" : "inconclusive",
    correctness_primary: true,
    all_candidates_completed: allCompleted,
    all_candidates_correct: allCorrect,
    comparisons,
    diagnostic_aggregate: aggregate,
    retry_count: observation.retry_count ?? 0,
    fallback_count: observation.fallback_count ?? 0,
    interpretation_boundary: {
      sample_per_condition: 2,
      statistical_claim: false,
      monetary_claim: false,
      cache_control_required_for_causal_efficiency: true,
      causal_efficiency_claim: comparisons.every((entry) => entry.causal_efficiency_claim.status === "eligible"),
      automatic_routing_authority: false
    }
  };
}

function reportMarkdown(protocol, observation, analysis) {
  const lines = [
    "# WI-0141 Context Capsule route-adherence effectiveness report",
    "",
    `- Protocol: \`${protocol.protocol_sha256}\``,
    `- Candidate turns: ${observation.conditions.length} of ${conditionDefinitions.length} retained`,
    `- Retry: ${observation.retry_count}; fallback: ${observation.fallback_count}`,
    `- Analysis status: \`${analysis.status}\``,
    "",
    "## Results by project shape",
    "",
    "| Shape | Correctness (legacy / stage-aware) | Source bytes delta | Operational Tokens delta | Latency delta | Route evidence | Diagnostic outcome | Causal efficiency |",
    "|---|---:|---:|---:|---:|---|---|---|"
  ];
  for (const comparison of analysis.comparisons) {
    const tokenDelta = comparison.operational_tokens.delta ? `${comparison.operational_tokens.delta.percent}%` : "unknown";
    const latencyDelta = comparison.latency_ms.delta ? `${comparison.latency_ms.delta.percent}%` : "unknown";
    const sourceDelta = comparison.source_selection.bytes_delta ? `${comparison.source_selection.bytes_delta.percent}%` : "unknown";
    const legacyAcquisition = comparison.context_acquisition.legacy;
    const stageAcquisition = comparison.context_acquisition.stage_aware;
    const unknownReads = `${legacyAcquisition.counts?.unknown ?? "unknown"} / ${stageAcquisition.counts?.unknown ?? "unknown"}`;
    const routeEvidence = `${comparison.context_acquisition.conclusion}; unknown reads ${unknownReads}`;
    lines.push(`| ${comparison.shape} | ${comparison.correctness.legacy_pass ?? "unknown"} / ${comparison.correctness.stage_aware_pass ?? "unknown"} | ${sourceDelta} | ${tokenDelta} | ${latencyDelta} | ${routeEvidence} | ${comparison.outcome} | ${comparison.causal_efficiency_claim.status} |`);
  }
  lines.push(
    "",
    "## Repetition and cache detail",
    "",
    "| Shape | Repetition | Operational Tokens (legacy / stage-aware) | Token delta | Latency ms (legacy / stage-aware) | Latency delta | Cache share % (legacy / stage-aware) |",
    "|---|---|---:|---:|---:|---:|---:|"
  );
  for (const comparison of analysis.comparisons) {
    for (const pair of comparison.repetition_pairs) {
      const tokenDelta = pair.operational_tokens.delta ? `${pair.operational_tokens.delta.percent}%` : "unknown";
      const latencyDelta = pair.latency_ms.delta ? `${pair.latency_ms.delta.percent}%` : "unknown";
      lines.push(`| ${comparison.shape} | ${pair.repetition} | ${pair.operational_tokens.legacy} / ${pair.operational_tokens.stage_aware} | ${tokenDelta} | ${pair.latency_ms.legacy} / ${pair.latency_ms.stage_aware} | ${latencyDelta} | ${pair.cache_share_percent.legacy} / ${pair.cache_share_percent.stage_aware} |`);
    }
  }
  lines.push(
    "",
    "## Provider usage and cache control",
    "",
    "| Shape | Gross input (legacy / stage-aware) | Cached input | Non-cached input | Output | Cache share % | Cache-control validity |",
    "|---|---:|---:|---:|---:|---:|---|"
  );
  for (const comparison of analysis.comparisons) {
    const usage = comparison.provider_usage;
    lines.push(`| ${comparison.shape} | ${usage.input_tokens.legacy_mean} / ${usage.input_tokens.stage_aware_mean} | ${usage.cached_input_tokens.legacy_mean} / ${usage.cached_input_tokens.stage_aware_mean} | ${usage.non_cached_input_tokens.legacy_mean} / ${usage.non_cached_input_tokens.stage_aware_mean} | ${usage.output_tokens.legacy_mean} / ${usage.output_tokens.stage_aware_mean} | ${usage.cache_share_percent.legacy_mean} / ${usage.cache_share_percent.stage_aware_mean} | ${comparison.cache_control.status} (${comparison.cache_control.method}) |`);
  }
  lines.push(
    "",
    "## Interpretation limits",
    "",
    "Correctness is evaluated from canonical typed facts and gates every efficiency interpretation. Initial source bytes, bounded post-route acquisition, Provider Tokens, latency, and tool-output bytes are separate measurements. Two counterbalanced repetitions per condition remain diagnostic evidence and do not establish statistical, monetary, or automatic-routing claims.",
    "",
    "This analyzer keeps unknown acquisition records fail-closed. A successor sanitized regression recognizes exact single-file control-package reads, but the sealed historical observation is not rewritten and its unknown records are not retroactively relabelled.",
    "",
    "Gross input, cached input, non-cached input, output, Operational Tokens, and cache share are reported together. The WI-0141 protocol did not predeclare a verifiable cache-control method, so causal efficiency remains blocked even where a diagnostic average is favorable.",
    "",
    "The route is described as requested-and-thread-configured Terra medium. The installed App Server does not expose per-turn execution-effort telemetry, so effective execution effort remains unknown rather than inferred.",
    "",
    "Raw commands, command output content, prompts, responses, hidden reasoning, credentials, and temporary repositories were not retained in Git.",
    ""
  );
  return lines.join("\n");
}

export async function runContextAblation(labRoot = defaultLabRoot, protocolPath = defaultProtocolPath, approvalPath = defaultApprovalPath) {
  if (await pathExists(defaultObservationPath) || await pathExists(defaultStoppedObservationPath)) {
    throw new Error("A retained WI-0141 run already exists; this protocol authorizes no retry");
  }
  const preflight = await preflightContextAblation(labRoot, protocolPath, approvalPath);
  if (!preflight.generation_ready) throw new Error(`Generation is blocked: ${preflight.blockers.join(", ")}`);
  const inspection = await inspectLab(labRoot, protocolPath);
  if (!inspection.valid) throw new Error(`Lab inspection failed: ${inspection.errors.join(", ")}`);
  const { protocol, labManifest } = inspection;
  const budget = createBudget(protocol.execution.aggregate_operational_token_limit);
  const deadline = Date.now() + protocol.execution.program_wall_clock_limit_ms;
  const conditions = [];
  const startedAt = new Date().toISOString();
  try {
    for (const definition of conditionDefinitions) {
      const conditionRoot = path.join(assertSafeLabRoot(labRoot), "conditions", definition.id);
      const turn = await launchCandidateTurn({ definition, cwd: conditionRoot, protocol, budget, deadline });
      if (turn.status === "completed") {
        turn.objective = evaluateContextAblationOutput(definition.shape, turn.completion, labManifest.shapes[definition.shape].expected);
      }
      conditions.push(turn);
      const repositoryState = await conditionRepositoryManifest(conditionRoot);
      const frozen = protocol.conditions.find((entry) => entry.id === definition.id)?.repository_manifest;
      if (stableText(repositoryState) !== stableText(frozen)) {
        throw Object.assign(new Error(`${definition.id}: repository state changed during read-only turn`), { condition: definition.id });
      }
      if (turn.status === "stopped" && turn.stop_scope === "run") throw Object.assign(new Error(`${definition.id}:${turn.stop_reason}`), { condition: definition.id });
    }
    const observation = {
      schema_version: CONTEXT_ABLATION_OBSERVATION_SCHEMA,
      work_item_id: "WI-0141",
      protocol_sha256: protocol.protocol_sha256,
      kind: "live-provider-run",
      status: conditions.every((entry) => entry.status === "completed") ? "completed" : "completed-with-censored-condition",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      conditions,
      total_operational_tokens: budget.total(),
      retry_count: 0,
      fallback_count: 0,
      model_generation_performed: true
    };
    await writeJson(defaultObservationPath, observation, { exclusive: true });
    const analysis = analyzeContextAblation({ protocol, observation });
    await writeJson(defaultAnalysisPath, analysis, { exclusive: true });
    await writeText(defaultReportPath, reportMarkdown(protocol, observation, analysis));
    return { observation, analysis, report_path: path.relative(repositoryRoot, defaultReportPath) };
  } catch (error) {
    const stopped = {
      schema_version: CONTEXT_ABLATION_OBSERVATION_SCHEMA,
      work_item_id: "WI-0141",
      protocol_sha256: protocol.protocol_sha256,
      kind: "live-provider-run",
      status: "stopped",
      started_at: startedAt,
      stopped_at: new Date().toISOString(),
      stop_reason: String(error.message ?? error),
      active_condition: error.condition ?? conditionDefinitions[conditions.length]?.id ?? null,
      conditions,
      total_operational_tokens: budget.total(),
      retry_count: 0,
      fallback_count: 0,
      model_generation_performed: conditions.length > 0 || budget.total() > 0
    };
    await writeJson(defaultStoppedObservationPath, stopped, { exclusive: true }).catch(() => {});
    throw error;
  }
}

async function analyzeRetained(protocolPath = defaultProtocolPath, observationPath = defaultObservationPath) {
  const protocol = await readJson(protocolPath);
  const observation = await readJson(observationPath);
  const analysis = analyzeContextAblation({ protocol, observation });
  await writeJson(defaultAnalysisPath, analysis);
  await writeText(defaultReportPath, reportMarkdown(protocol, observation, analysis));
  return { analysis, report_path: path.relative(repositoryRoot, defaultReportPath) };
}

function parseArguments(argv) {
  const result = {
    command: argv[0] ?? "inspect",
    labRoot: defaultLabRoot,
    protocolPath: defaultProtocolPath,
    approvalPath: defaultApprovalPath,
    observationPath: defaultObservationPath
  };
  for (let index = 1; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key === "--lab-root") result.labRoot = value;
    else if (key === "--protocol") result.protocolPath = path.resolve(value);
    else if (key === "--approval") result.approvalPath = path.resolve(value);
    else if (key === "--observation") result.observationPath = path.resolve(value);
    else throw new Error(`Unknown argument: ${key}`);
    index += 1;
  }
  return result;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  let output;
  if (args.command === "prepare") {
    const result = await prepareContextAblationLab(args.labRoot);
    output = {
      schema_version: "temple.context-capsule-ablation-prepare/v1",
      work_item_id: "WI-0141",
      protocol_sha256: result.protocol.protocol_sha256,
      conditions: conditionIds,
      lab_root_id: path.basename(result.labRoot),
      generation_ready: false,
      model_generation_performed: false
    };
  } else if (args.command === "rehearse") {
    output = await rehearseContextAblation(args.labRoot, args.protocolPath);
  } else if (args.command === "preflight") {
    output = await preflightContextAblation(args.labRoot, args.protocolPath, args.approvalPath);
  } else if (args.command === "run") {
    output = await runContextAblation(args.labRoot, args.protocolPath, args.approvalPath);
  } else if (args.command === "analyze") {
    output = await analyzeRetained(args.protocolPath, args.observationPath);
  } else if (args.command === "inspect") {
    output = await inspectLab(args.labRoot, args.protocolPath);
  } else {
    throw new Error(`Unknown command: ${args.command}`);
  }
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (output.valid === false || output.pass === false || output.generation_ready === false && args.command === "run") process.exitCode = 2;
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
