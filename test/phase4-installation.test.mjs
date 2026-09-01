import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildFederatedPortfolio,
  emptyFederationRegistry,
  ensureFederationRegistry,
  FEDERATION_REGISTRY_RELATIVE_PATH,
  validateFederationRegistry
} from "../src/federation.mjs";
import { executeInit, planInit } from "../src/install.mjs";
import { readJson } from "../src/files.mjs";
import { validateInitConfig } from "../src/model.mjs";
import { validateProjectSchemas } from "../src/schema-validation.mjs";
import { executeUpgrade, planUpgrade } from "../src/upgrade.mjs";
import {
  defaultUsagePolicy,
  USAGE_POLICY_RELATIVE_PATH,
  validateUsagePolicy
} from "../src/usage-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseVersion = "0.1.0-alpha.28";
const phase4Capabilities = [
  "backup_retention",
  "redacted_audit_export",
  "usage_qualification",
  "progressive_usage_calibration",
  "matched_model_advisory",
  "exception_only_autonomy",
  "provider_attach_outcomes",
  "repository_federation",
  "read_only_portfolio"
];

function configDocument(projectId) {
  return {
    schema_version: "temple.init/v1",
    project: { id: projectId, name: `Fixture ${projectId}` },
    naming_mode: "manual",
    agents: [
      { display_name: "Mog", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Yuna", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Tidus", positions: ["tech_lead"] },
      { display_name: "Rikku", positions: ["developer"] },
      { display_name: "Lulu", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

async function temporaryProject(testContext, projectId) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-phase4-installation-"));
  const target = path.join(temporaryRoot, projectId);
  testContext.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const plan = await planInit(target, await validateInitConfig(configDocument(projectId)));
  assert.deepEqual(plan.conflicts, []);
  await executeInit(plan);
  return target;
}

async function markAsOlderInstallation(target) {
  const lockPath = path.join(target, "temple.lock");
  const lock = await readJson(lockPath);
  lock.template.version = "0.1.0-alpha.26";
  for (const capability of phase4Capabilities) delete lock.capabilities[capability];
  await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

test("federation registry creation is exclusive and preserves existing project bytes", async (testContext) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "temple-federation-registry-"));
  testContext.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));

  const timestamp = new Date("2026-08-30T00:00:00.000Z");
  const empty = emptyFederationRegistry(timestamp);
  assert.deepEqual(empty, {
    schema_version: "temple.federation/v1",
    participants: [],
    initiatives: [],
    dependencies: [],
    contracts: [],
    rollout_waves: [],
    updated_at: timestamp.toISOString()
  });
  assert.deepEqual(validateFederationRegistry(empty), { valid: true, errors: [] });

  const results = await Promise.all(Array.from({ length: 8 }, () => ensureFederationRegistry(temporaryRoot)));
  assert.equal(results.filter((result) => result.created).length, 1);
  assert.ok(results.find((result) => result.created)?.afterHash);

  const registryPath = path.join(temporaryRoot, FEDERATION_REGISTRY_RELATIVE_PATH);
  const projectOwnedBytes = `${JSON.stringify({ ...empty, updated_at: "2026-08-30T00:00:01.000Z" })}\n\n`;
  await fs.writeFile(registryPath, projectOwnedBytes);
  const preserved = await ensureFederationRegistry(temporaryRoot);
  assert.equal(preserved.created, false);
  assert.equal(await fs.readFile(registryPath, "utf8"), projectOwnedBytes);
});

test("fresh init seeds project-owned federation state, schemas, capabilities, and Alpha.28 metadata", async (testContext) => {
  const target = await temporaryProject(testContext, "fresh-phase4");
  const registryPath = path.join(target, FEDERATION_REGISTRY_RELATIVE_PATH);
  const registry = await readJson(registryPath);
  assert.deepEqual(registry, emptyFederationRegistry());
  assert.deepEqual(validateFederationRegistry(registry), { valid: true, errors: [] });

  const lock = await readJson(path.join(target, "temple.lock"));
  assert.equal(lock.template.version, releaseVersion);
  for (const capability of phase4Capabilities) assert.equal(lock.capabilities[capability], true, capability);
  assert.equal(lock.managed_files.some((entry) => entry.path === FEDERATION_REGISTRY_RELATIVE_PATH), false);
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/core/schemas/federation.schema.json"));
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/core/schemas/federated-portfolio.schema.json"));
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/core/schemas/validation-program.schema.json"));
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/core/schemas/validation-program-report.schema.json"));
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/core/schemas/usage-policy.schema.json"));
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/core/schemas/matched-model-evaluation.schema.json"));
  assert.ok(lock.managed_files.some((entry) => entry.path === ".ai-org/templates/validation-program.json"));
  assert.equal(lock.managed_files.some((entry) => entry.path === ".ai-org/project/validation-program.json"), false);
  assert.equal(lock.managed_files.some((entry) => entry.path === USAGE_POLICY_RELATIVE_PATH), false);

  const usagePolicy = await readJson(path.join(target, USAGE_POLICY_RELATIVE_PATH));
  assert.deepEqual(usagePolicy, defaultUsagePolicy());
  assert.deepEqual(validateUsagePolicy(usagePolicy), { valid: true, errors: [] });
  assert.deepEqual(usagePolicy.calibration.matched_evaluation, {
    sources: [],
    maximum_age_days: 90,
    supported_method: "paired-sign-test-v1"
  });

  const packageDocument = await readJson(path.join(root, "package.json"));
  const packageLock = await readJson(path.join(root, "package-lock.json"));
  assert.equal(packageDocument.version, releaseVersion);
  assert.equal(packageLock.version, releaseVersion);
  assert.equal(packageLock.packages[""].version, releaseVersion);

  const catalog = await readJson(path.join(target, ".ai-org/core/schemas/schema-catalog.json"));
  assert.deepEqual(
    catalog.documents.find((entry) => entry.id === "federation"),
    {
      id: "federation",
      path: FEDERATION_REGISTRY_RELATIVE_PATH,
      schema: "federation.schema.json",
      required: true,
      ownership: "project"
    }
  );
  assert.deepEqual(
    catalog.documents.find((entry) => entry.id === "federated-portfolio"),
    {
      id: "federated-portfolio",
      path: ".ai-org/views/portfolio.json",
      schema: "federated-portfolio.schema.json",
      required: false,
      ownership: "generated"
    }
  );
  assert.deepEqual(
    catalog.documents.find((entry) => entry.id === "usage-policy"),
    {
      id: "usage-policy",
      path: USAGE_POLICY_RELATIVE_PATH,
      schema: "usage-policy.schema.json",
      required: true,
      ownership: "project"
    }
  );
  assert.deepEqual(
    catalog.documents.find((entry) => entry.id === "matched-model-evaluations"),
    {
      id: "matched-model-evaluations",
      path: ".ai-org/evaluations/model/*.json",
      schema: "matched-model-evaluation.schema.json",
      required: false,
      ownership: "project"
    }
  );
  assert.deepEqual(
    catalog.documents.find((entry) => entry.id === "validation-program"),
    {
      id: "validation-program",
      path: ".ai-org/project/validation-program.json",
      schema: "validation-program.schema.json",
      required: false,
      ownership: "project"
    }
  );
  assert.deepEqual(
    catalog.documents.find((entry) => entry.id === "validation-program-report"),
    {
      id: "validation-program-report",
      path: ".ai-org/views/validation-program-report.json",
      schema: "validation-program-report.schema.json",
      required: false,
      ownership: "generated"
    }
  );

  const validationTemplate = await readJson(path.join(target, ".ai-org/templates/validation-program.json"));
  validationTemplate.id = "fresh-phase4-validation";
  validationTemplate.coordinator_project_id = "fresh-phase4";
  validationTemplate.participants[0].id = "fresh-phase4";
  validationTemplate.participants[0].expected_project_id = "fresh-phase4";
  validationTemplate.waves[0].turns[0].project_id = "fresh-phase4";
  await fs.writeFile(
    path.join(target, ".ai-org/project/validation-program.json"),
    `${JSON.stringify(validationTemplate, null, 2)}\n`
  );

  registry.participants.push({
    id: "missing-participant",
    path: "../missing-participant",
    expected_project_id: "missing-participant",
    expected_revision: "a".repeat(40),
    expected_revision_observed_at: "2026-08-30T00:00:00.000Z"
  });
  registry.updated_at = "2026-08-30T00:01:00.000Z";
  assert.deepEqual(validateFederationRegistry(registry), { valid: true, errors: [] });
  await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  const portfolioPath = path.join(target, ".ai-org/views/portfolio.json");
  const portfolio = await buildFederatedPortfolio(target, { now: new Date("2026-08-30T00:05:00.000Z") });
  assert.equal(portfolio.summary.unknown, 1);
  await fs.mkdir(path.dirname(portfolioPath), { recursive: true });
  await fs.writeFile(portfolioPath, `${JSON.stringify(portfolio, null, 2)}\n`);
  const validSchemas = await validateProjectSchemas(target);
  assert.equal(validSchemas.valid, true, JSON.stringify(validSchemas.errors, null, 2));
  assert.ok(validSchemas.checked.some((entry) => entry.document === FEDERATION_REGISTRY_RELATIVE_PATH && entry.valid));
  assert.ok(validSchemas.checked.some((entry) => entry.document === ".ai-org/views/portfolio.json" && entry.valid));
  assert.ok(validSchemas.checked.some((entry) => entry.document === ".ai-org/project/validation-program.json" && entry.valid));
  assert.ok(validSchemas.checked.some((entry) => entry.document === USAGE_POLICY_RELATIVE_PATH && entry.valid));

  usagePolicy.seed_policy.rules[0].profile_id = "missing-profile";
  await fs.writeFile(path.join(target, USAGE_POLICY_RELATIVE_PATH), `${JSON.stringify(usagePolicy, null, 2)}\n`);
  const rejectedUsagePolicy = await validateProjectSchemas(target);
  assert.equal(rejectedUsagePolicy.valid, false);
  assert.ok(
    rejectedUsagePolicy.errors.some(
      (entry) => entry.document === USAGE_POLICY_RELATIVE_PATH && entry.keyword === "semantic"
    )
  );
  await fs.writeFile(path.join(target, USAGE_POLICY_RELATIVE_PATH), `${JSON.stringify(defaultUsagePolicy(), null, 2)}\n`);

  portfolio.authority.lifecycle_mutations_performed = true;
  await fs.writeFile(portfolioPath, `${JSON.stringify(portfolio, null, 2)}\n`);
  const rejectedSchemas = await validateProjectSchemas(target);
  assert.equal(rejectedSchemas.valid, false);
  assert.ok(
    rejectedSchemas.errors.some(
      (entry) =>
        entry.document === ".ai-org/views/portfolio.json" &&
        entry.instance_path === "/authority/lifecycle_mutations_performed"
    )
  );

  portfolio.authority.lifecycle_mutations_performed = false;
  await fs.writeFile(portfolioPath, `${JSON.stringify(portfolio, null, 2)}\n`);
  registry.credentials = { token: "must-not-be-catalogued" };
  await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  const rejectedRegistry = await validateProjectSchemas(target);
  assert.equal(rejectedRegistry.valid, false);
  assert.ok(
    rejectedRegistry.errors.some(
      (entry) => entry.document === FEDERATION_REGISTRY_RELATIVE_PATH && entry.keyword === "additionalProperties"
    )
  );
});

test("upgrade creates a missing federation registry without adopting it as managed", async (testContext) => {
  const target = await temporaryProject(testContext, "upgrade-missing-federation");
  await markAsOlderInstallation(target);
  await fs.unlink(path.join(target, FEDERATION_REGISTRY_RELATIVE_PATH));
  await fs.unlink(path.join(target, USAGE_POLICY_RELATIVE_PATH));

  const plan = await planUpgrade(target);
  assert.deepEqual(plan.conflicts, []);
  assert.ok(plan.actions.some((entry) => entry.type === "create-federation-registry"));
  assert.ok(plan.actions.some((entry) => entry.type === "create-usage-policy"));
  const lock = await executeUpgrade(plan);

  assert.equal(lock.template.version, releaseVersion);
  for (const capability of phase4Capabilities) assert.equal(lock.capabilities[capability], true, capability);
  assert.equal(lock.managed_files.some((entry) => entry.path === FEDERATION_REGISTRY_RELATIVE_PATH), false);
  assert.equal(lock.managed_files.some((entry) => entry.path === USAGE_POLICY_RELATIVE_PATH), false);
  assert.deepEqual(validateFederationRegistry(await readJson(path.join(target, FEDERATION_REGISTRY_RELATIVE_PATH))), {
    valid: true,
    errors: []
  });
  assert.deepEqual(await readJson(path.join(target, USAGE_POLICY_RELATIVE_PATH)), defaultUsagePolicy());
});

test("upgrade preserves an existing federation registry byte for byte", async (testContext) => {
  const target = await temporaryProject(testContext, "upgrade-existing-federation");
  await markAsOlderInstallation(target);
  const registryPath = path.join(target, FEDERATION_REGISTRY_RELATIVE_PATH);
  const customRegistry = {
    ...emptyFederationRegistry(new Date("2026-08-30T01:00:00.000Z")),
    participants: [
      {
        id: "orders",
        path: "../orders",
        expected_project_id: "orders",
        expected_revision: "a".repeat(40),
        expected_revision_observed_at: "2026-08-30T00:59:00.000Z"
      }
    ]
  };
  const projectOwnedBytes = `${JSON.stringify(customRegistry)}\n\n`;
  await fs.writeFile(registryPath, projectOwnedBytes);
  const usagePolicyPath = path.join(target, USAGE_POLICY_RELATIVE_PATH);
  const customUsagePolicy = defaultUsagePolicy();
  customUsagePolicy.objective = "quality-first";
  delete customUsagePolicy.calibration.matched_evaluation;
  assert.deepEqual(validateUsagePolicy(customUsagePolicy), { valid: true, errors: [] });
  const usagePolicyBytes = `${JSON.stringify(customUsagePolicy)}\n\n`;
  await fs.writeFile(usagePolicyPath, usagePolicyBytes);

  const plan = await planUpgrade(target);
  assert.deepEqual(plan.conflicts, []);
  assert.ok(plan.actions.some((entry) => entry.type === "skip-federation-registry"));
  assert.ok(plan.actions.some((entry) => entry.type === "skip-usage-policy"));
  const lock = await executeUpgrade(plan);

  assert.equal(await fs.readFile(registryPath, "utf8"), projectOwnedBytes);
  assert.equal(await fs.readFile(usagePolicyPath, "utf8"), usagePolicyBytes);
  assert.equal(lock.managed_files.some((entry) => entry.path === FEDERATION_REGISTRY_RELATIVE_PATH), false);
  assert.equal(lock.managed_files.some((entry) => entry.path === USAGE_POLICY_RELATIVE_PATH), false);
});
