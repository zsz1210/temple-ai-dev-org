import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createRepositoryRetrievalProvider,
  measureContextEnvelope,
  RETRIEVAL_PROVIDER_SCHEMA,
  validateAcceptanceContract,
  validateRetrievalProvider
} from "../src/context.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

test("acceptance contracts fail closed on unknown semantics", () => {
  const dimensions = Object.fromEntries([
    "identity_semantics",
    "input_immutability",
    "idempotency",
    "compatibility",
    "error_semantics"
  ].map((id) => [id, { status: "not-applicable", rationale: `${id} does not apply` }]));
  dimensions.identity_semantics = {
    status: "specified",
    requirement: "Return a fresh result object",
    evidence_ref: "TASK.md"
  };
  const valid = validateAcceptanceContract({
    schema_version: "temple.acceptance-contract/v1",
    case_id: "fixture",
    dimensions
  });
  assert.deepEqual(valid, { valid: true, ready: true, errors: [], blockers: [] });
  dimensions.error_semantics = { status: "unknown" };
  const blocked = validateAcceptanceContract({
    schema_version: "temple.acceptance-contract/v1",
    case_id: "fixture",
    dimensions
  });
  assert.equal(blocked.valid, true);
  assert.equal(blocked.ready, false);
  assert.deepEqual(blocked.blockers, ["acceptance dimension error_semantics is unknown"]);
});

test("context envelope accounting is stable, componentized, and content-sensitive", () => {
  const first = measureContextEnvelope({ task: { title: "Bounded work", rules: ["one", "two"] }, instructions: "Read TASK.md" });
  const reordered = measureContextEnvelope({ instructions: "Read TASK.md", task: { rules: ["one", "two"], title: "Bounded work" } });
  const changed = measureContextEnvelope({ instructions: "Read TASK.md", task: { rules: ["one", "three"], title: "Bounded work" } });
  assert.equal(first.context_profile_digest, reordered.context_profile_digest);
  assert.equal(first.utf8_bytes, reordered.utf8_bytes);
  assert.deepEqual(first.components.map((entry) => entry.id), ["instructions", "task"]);
  assert.equal(first.largest_component.id, "task");
  assert.equal(first.components.reduce((total, entry) => total + entry.utf8_bytes, 0), first.utf8_bytes);
  assert.ok(first.components.every((entry) => Number.isFinite(entry.share_percent)));
  assert.notEqual(first.context_profile_digest, changed.context_profile_digest);
  assert.match(first.context_profile_digest, /^sha256:[0-9a-f]{64}$/);
});

test("deterministic retrieval does not treat Position membership as relevance", async () => {
  const provider = createRepositoryRetrievalProvider();
  const documents = [
    {
      id: "project-documentation",
      name: "project-documentation",
      description: "Create human-facing repository documentation from verified project evidence.",
      position_hints: ["developer"],
      retrieval_kind: "capability",
      status: "available"
    },
    {
      id: "domain-modeling",
      name: "domain-modeling",
      description: "Clarify domain language, boundaries, and invariants.",
      position_hints: ["developer"],
      retrieval_kind: "capability",
      status: "available"
    }
  ];
  const generic = await provider.search({
    documents,
    query: "Complete only the task in TASK.md, change src and tests, and make no out-of-scope writes",
    position: "developer",
    work_item_id: "WI-0001"
  });
  assert.deepEqual(generic, []);

  const byId = await provider.search({ documents, query: "project documentation", position: "developer" });
  assert.equal(byId[0].id, "project-documentation");
  assert.ok(byId[0].reasons.includes("position-match"));
  const byDescription = await provider.search({ documents, query: "domain invariants", position: "developer" });
  assert.equal(byDescription[0].id, "domain-modeling");
});

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function initConfig() {
  return {
    schema_version: "temple.init/v1",
    project: { id: "context-product", name: "Context Product" },
    naming_mode: "manual",
    agents: [
      { display_name: "Fixture Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Fixture Linden", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Fixture Ellis", positions: ["tech_lead"] },
      { display_name: "Fixture Devon", positions: ["developer"] },
      { display_name: "Fixture Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

async function fixture(context) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-context-test-"));
  const target = path.join(temporaryRoot, "context-product");
  const configPath = path.join(temporaryRoot, "init.json");
  context.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  await fs.writeFile(configPath, `${JSON.stringify(initConfig(), null, 2)}\n`);
  const initialized = run(["init", target, "--config", configPath]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  return { target, configPath };
}

test("fresh initialization installs a compact authority-equivalent instruction router", async (context) => {
  const { target } = await fixture(context);
  const installed = await fs.readFile(path.join(target, "AGENTS.md"), "utf8");
  const distribution = await fs.readFile(path.join(root, "project-overlay/AGENTS.md"), "utf8");
  const toolkit = await fs.readFile(path.join(root, "AGENTS.md"), "utf8");
  const marker = /<!-- temple:instructions:start -->[\s\S]*?<!-- temple:instructions:end -->/;
  assert.equal(installed, distribution);
  assert.equal(toolkit.match(marker)?.[0], distribution.trim());
  assert.ok(Buffer.byteLength(installed, "utf8") < 9310);
  for (const invariant of [
    "Repository files and recorded evidence are canonical",
    "Position, Agent Identity, Assignment, Discipline, Human Principal",
    "node ./templew.mjs context resolve",
    "result is not evidence of instruction loading, comprehension, authority, or lifecycle progress",
    "Only exact `temple.lock.managed_files` entries are framework-managed",
    "Spec → Design → Build → Test → Eval → Independent QA → Release Gate",
    "Developer and Independent QA must be different Agent Identities",
    "A pilot, example, template validation, or bounded experiment stops",
    ".ai-org/project/usage-policy.json",
    ".ai-org/core/high-assurance.json",
    "work-item claim/release",
    "UI Designer Assignment"
  ]) {
    assert.match(installed, new RegExp(invariant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("fresh bounded Lean fixture does not route unrelated Skills from generic task wording", async (context) => {
  const { target } = await fixture(context);
  const created = run([
    "work-item",
    "create",
    target,
    "--title",
    "Complete idempotent-command fixture",
    "--scope",
    "Complete only TASK.md and change only src/ and test/.",
    "--acceptance",
    "Satisfy TASK.md and ACCEPTANCE-CONTRACT.json with no out-of-scope writes.",
    "--affected-path",
    "src",
    "--affected-path",
    "test",
    "--spec-mode",
    "gate-evidence",
    "--ui-mode",
    "not-applicable",
    "--workflow-profile",
    "lean",
    "--risk-tier",
    "low",
    "--scope-class",
    "bounded",
    "--profile-rationale",
    "The fixture is explicit, local, reversible, and bounded."
  ]);
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const resolved = run(["context", "resolve", target, "--work-item", "WI-0001", "--position", "developer", "--no-write", "--json"]);
  assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
  const capsule = JSON.parse(resolved.stdout);
  assert.deepEqual(capsule.capabilities, []);
  assert.equal(capsule.retrieval.provider_id, "repository-deterministic");
});

test("capability registry observes managed and project-owned Skills without taking ownership", async (context) => {
  const { target } = await fixture(context);
  const registryPath = path.join(target, ".ai-org/views/capabilities.json");
  const initialRegistry = JSON.parse(await fs.readFile(registryPath, "utf8"));
  assert.equal(initialRegistry.schema_version, "temple.capability-registry/v1");
  assert.equal(initialRegistry.counts.core, 6);
  assert.equal(initialRegistry.counts.project_extension, 0);

  const extensionPath = path.join(target, ".agents/skills/checkout-support/SKILL.md");
  await fs.mkdir(path.dirname(extensionPath), { recursive: true });
  await fs.writeFile(
    extensionPath,
    "---\nname: checkout-support\ndescription: Explain and verify the project checkout flow. Use for checkout documentation and tests.\n---\n\n# Checkout support\n"
  );

  const listed = run(["capability", "list", target, "--json"]);
  assert.equal(listed.status, 0, listed.stderr || listed.stdout);
  const registry = JSON.parse(listed.stdout);
  const extension = registry.capabilities.find((entry) => entry.id === "checkout-support");
  assert.deepEqual(
    {
      lifecycle_owner: extension.lifecycle_owner,
      distribution: extension.distribution,
      origin: extension.origin,
      status: extension.status
    },
    { lifecycle_owner: "project", distribution: "project-extension", origin: "undeclared", status: "available" }
  );
  const lock = JSON.parse(await fs.readFile(path.join(target, "temple.lock"), "utf8"));
  assert.ok(!lock.managed_files.some((entry) => entry.path === ".agents/skills/checkout-support/SKILL.md"));

  const found = run(["capability", "find", target, "--query", "checkout documentation", "--json"]);
  assert.equal(found.status, 0, found.stderr || found.stdout);
  assert.equal(JSON.parse(found.stdout)[0].id, "checkout-support");
});

test("context resolve builds a bounded capsule from routes, learning, capabilities, and active-scope overlap", async (context) => {
  const { target } = await fixture(context);
  const routePath = "docs/checkout.md";
  await fs.mkdir(path.join(target, "docs"), { recursive: true });
  await fs.writeFile(path.join(target, routePath), "# Checkout\n\nThe checkout specification.\n");
  const contextMap = {
    schema_version: "temple.context-map/v1",
    routes: [
      {
        id: "checkout-spec",
        kind: "product-spec",
        title: "Checkout specification",
        summary: "Product rules and acceptance criteria for checkout.",
        paths: [routePath],
        tags: ["checkout", "documentation"],
        positions: ["engineering_manager", "product_manager", "developer"],
        work_items: ["WI-0001"],
        read_when: ["Changing checkout behavior or documentation"],
        owner_position: "product_manager",
        status: "active"
      }
    ]
  };
  await fs.writeFile(
    path.join(target, ".ai-org/project/context-map.json"),
    `${JSON.stringify(contextMap, null, 2)}\n`
  );

  const lessonPath = path.join(target, ".ai-org/learning/lessons/LESSON-0001.md");
  await fs.mkdir(path.dirname(lessonPath), { recursive: true });
  await fs.writeFile(lessonPath, "# Checkout validation\n\nVerify totals at the public boundary.\n");
  await fs.writeFile(
    path.join(target, ".ai-org/learning/index.json"),
    `${JSON.stringify(
      {
        schema_version: "ai-org.learning-index/v1",
        entries: [
          {
            id: "LESSON-0001",
            kind: "lesson",
            title: "Validate checkout totals at the public boundary",
            summary: "Checkout evidence should use public totals rather than private implementation details.",
            status: "validated",
            confidence: "high",
            tags: ["checkout", "testing"],
            applies_to: ["developer", "quality-evaluation"],
            source_work_items: ["WI-0001"],
            path: ".ai-org/learning/lessons/LESSON-0001.md",
            updated_at: "2026-08-29",
            last_validated_at: "2026-08-29",
            promotion: { target: "none", status: "none", reference: null }
          }
        ]
      },
      null,
      2
    )}\n`
  );

  const first = run([
    "work-item",
    "create",
    target,
    "--title",
    "Document checkout behavior",
    "--scope",
    "Checkout documentation and public totals",
    "--acceptance",
    "The checkout specification is accurate",
    "--affected-path",
    "src/checkout/**",
    "--context-ref",
    "checkout-spec"
  ]);
  assert.equal(first.status, 0, first.stderr || first.stdout);
  const second = run([
    "work-item",
    "create",
    target,
    "--title",
    "Adjust checkout service",
    "--affected-path",
    "src/checkout/service.mjs"
  ]);
  assert.equal(second.status, 0, second.stderr || second.stdout);

  const preview = run([
    "context",
    "resolve",
    target,
    "--work-item",
    "WI-0001",
    "--position",
    "developer",
    "--revision",
    "abc1234",
    "--limit",
    "4",
    "--no-write",
    "--json"
  ]);
  assert.equal(preview.status, 0, preview.stderr || preview.stdout);
  const capsule = JSON.parse(preview.stdout);
  assert.equal(capsule.schema_version, "temple.context-capsule/v1");
  assert.deepEqual(capsule.context_routes.map((entry) => entry.id), ["checkout-spec"]);
  assert.deepEqual(capsule.learning.map((entry) => entry.id), ["LESSON-0001"]);
  assert.ok(capsule.capabilities.some((entry) => entry.id === "project-documentation"));
  assert.equal(capsule.revision, "abc1234");
  assert.equal(capsule.retrieval.provider_id, "repository-deterministic");
  assert.equal(capsule.retrieval.semantic, false);
  assert.equal(capsule.affected_path_overlaps[0].work_item_id, "WI-0002");
  await assert.rejects(() => fs.access(path.join(target, ".ai-org/views/work-items/WI-0001.json")));

  const persisted = run(["context", "resolve", target, "--work-item", "WI-0001"]);
  assert.equal(persisted.status, 0, persisted.stderr || persisted.stdout);
  const stored = JSON.parse(await fs.readFile(path.join(target, ".ai-org/views/work-items/WI-0001.json"), "utf8"));
  assert.equal(stored.work_item.id, "WI-0001");
  assert.match(persisted.stdout, /Affected-path overlaps: 1/);
});

test("doctor validates active context routes and canonical work-item references", async (context) => {
  const { target } = await fixture(context);
  const contextMapPath = path.join(target, ".ai-org/project/context-map.json");
  const invalidMap = {
    schema_version: "temple.context-map/v1",
    routes: [
      {
        id: "missing-spec",
        kind: "technical-spec",
        title: "Missing technical specification",
        summary: "This active route points at a missing canonical file.",
        paths: ["docs/missing.md"],
        tags: ["missing"],
        positions: ["tech_lead"],
        work_items: [],
        read_when: ["Changing the missing subsystem"],
        owner_position: "tech_lead",
        status: "active"
      }
    ]
  };
  await fs.writeFile(contextMapPath, `${JSON.stringify(invalidMap, null, 2)}\n`);
  const missing = run(["doctor", target]);
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /active route paths are missing: missing-spec:docs\/missing\.md/);

  await fs.mkdir(path.join(target, "docs"), { recursive: true });
  await fs.writeFile(path.join(target, "docs/missing.md"), "# Present now\n");
  const healthy = run(["doctor", target, "--json"]);
  assert.equal(healthy.status, 0, healthy.stderr || healthy.stdout);
  assert.equal(JSON.parse(healthy.stdout).summary.fail, 0);

  const unsafeWork = run([
    "work-item",
    "create",
    target,
    "--title",
    "Unsafe scope",
    "--affected-path",
    "../outside"
  ]);
  assert.equal(unsafeWork.status, 1);
  assert.match(unsafeWork.stderr, /Unsafe affected path/);
  const missingReference = run([
    "work-item",
    "create",
    target,
    "--title",
    "Unknown context",
    "--context-ref",
    "unknown-route"
  ]);
  assert.equal(missingReference.status, 1);
  assert.match(missingReference.stderr, /Unknown context route/);
});

test("upgrade creates the project-owned Context Map and preserves later project changes", async (context) => {
  const { target } = await fixture(context);
  const mapPath = path.join(target, ".ai-org/project/context-map.json");
  await fs.rm(mapPath);
  const lockPath = path.join(target, "temple.lock");
  const lock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  lock.template.version = "0.1.0-alpha.11";
  delete lock.capabilities.progressive_context_routing;
  delete lock.capabilities.capability_registry;
  delete lock.capabilities.retrieval_provider_contract;
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const upgraded = run(["upgrade", target]);
  assert.equal(upgraded.status, 0, upgraded.stderr || upgraded.stdout);
  const created = JSON.parse(await fs.readFile(mapPath, "utf8"));
  assert.deepEqual(created.routes, []);
  const upgradedLock = JSON.parse(await fs.readFile(lockPath, "utf8"));
  assert.ok(!upgradedLock.managed_files.some((entry) => entry.path === ".ai-org/project/context-map.json"));

  created.routes.push({
    id: "project-readme",
    kind: "documentation",
    title: "Project README",
    summary: "Human-facing project entry point.",
    paths: ["README.md"],
    tags: ["documentation"],
    positions: ["product_manager"],
    work_items: [],
    read_when: ["Changing project documentation"],
    owner_position: "product_manager",
    status: "deprecated"
  });
  await fs.writeFile(mapPath, `${JSON.stringify(created, null, 2)}\n`);
  const reupgrade = run(["upgrade", target]);
  assert.equal(reupgrade.status, 0, reupgrade.stderr || reupgrade.stdout);
  assert.deepEqual(JSON.parse(await fs.readFile(mapPath, "utf8")), created);
});

test("Retrieval Provider contract accepts a semantic adapter without requiring one", () => {
  const adapter = {
    schema_version: RETRIEVAL_PROVIDER_SCHEMA,
    id: "local-semantic-test",
    mode: "hybrid",
    semantic: true,
    async search() {
      return [];
    }
  };
  assert.deepEqual(validateRetrievalProvider(adapter), { valid: true, errors: [] });
  assert.equal(validateRetrievalProvider({ ...adapter, search: null }).valid, false);
});
