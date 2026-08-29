import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  RETRIEVAL_PROVIDER_SCHEMA,
  validateRetrievalProvider
} from "../src/context.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin/temple.mjs");

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
