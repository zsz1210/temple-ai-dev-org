import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import { executeInit, planInit } from "../../../src/install.mjs";
import { validateInitConfig } from "../../../src/model.mjs";

const execFile = promisify(execFileCallback);
const frameworkRoot = path.resolve(import.meta.dirname, "../../..");
const experimentRoot = "/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab";
const templeCli = path.join(frameworkRoot, "bin/temple.mjs");
const gitIdentity = Object.freeze({ name: "Temple Validation", email: "temple-validation@localhost" });

const projects = Object.freeze([
  {
    id: "commerce-coordinator",
    config: "init-commerce-coordinator.json",
    workItems: [
      mechanical("Define the bounded protocol and budget", ["docs/protocol.md"]),
      mechanical("Define federation and rollout waves", ["docs/waves.md", ".ai-org/project/federation.json"]),
      mechanical("Run the failure matrix and build the portfolio", ["qa/failure-matrix.json", "docs/portfolio.md"]),
      modelWork({
        title: "Cold-recover and independently evaluate the rehearsal",
        stage: "independent_qa",
        position: "independent_qa",
        agent: "agent-lulu",
        paths: ["qa/coordinator-independent-qa.md"],
        instruction: `Act as the independent QA for the bounded four-repository commerce rehearsal. Read TEMPLE.md, the current Work Item, docs/protocol.md, docs/waves.md, docs/portfolio.md, qa/failure-matrix.json, and the sibling Catalog, Orders, and Notifications repositories. Use repository files and Git evidence only; do not rely on prior conversation. Run npm test in all four repositories, inspect their current revisions and completed Temple task records, and verify the v1/v2 availability and OrderPlaced contracts. Write only qa/coordinator-independent-qa.md with: exact revisions, commands and outcomes, lifecycle/task/usage correlation findings, cold-recovery findings, unresolved limitations, and a pass/fail recommendation. Do not modify .ai-org, source code, tests, package files, or sibling repositories. Do not access the network, ask the user, commit, deploy, publish, or claim savings, cost, model superiority, enterprise readiness, or release approval.`
      })
    ]
  },
  {
    id: "commerce-catalog",
    config: "init-commerce-catalog.json",
    workItems: [
      modelWork({
        title: "Design the versioned availability contract",
        stage: "design",
        position: "tech_lead",
        agent: "agent-tidus",
        paths: ["docs/contracts/availability.md"],
        instruction: `Act as Tech Lead. Design a small deterministic availability contract for the Catalog service. Write only docs/contracts/availability.md. Define v1 as { sku, available: boolean } and v2 as { sku, status: "in_stock" | "out_of_stock", contract_version: "v2" }. Specify validation, unknown-SKU behavior, consumer-first rollout, v1 rollback, compatibility expectations, and examples. Keep Catalog authoritative for stock and Orders authoritative for checkout. Do not modify .ai-org, source code, tests, package files, or Git history. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      modelWork({
        title: "Implement the deterministic availability provider",
        stage: "build",
        position: "developer",
        agent: "agent-rikku",
        paths: ["src/catalog.mjs", "test/catalog.test.mjs"],
        instruction: `Act as Developer. Read docs/contracts/availability.md and implement a dependency-free deterministic Catalog provider in src/catalog.mjs plus focused node:test coverage in test/catalog.test.mjs. Export a small inventory fixture, a function that returns availability v1 or v2 for a SKU, strict version validation, and explicit unknown-SKU behavior. Preserve both versions so a runtime switch can demonstrate producer-first v2 failure and rollback to v1. Do not modify .ai-org, docs, package files, or unrelated tests. Run npm test. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      mechanical("Inject producer-first v2 failure and verify v1 rollback", ["qa/producer-first-failure.json"])
    ]
  },
  {
    id: "commerce-orders",
    config: "init-commerce-orders.json",
    workItems: [
      modelWork({
        title: "Specify deterministic checkout behavior",
        stage: "spec",
        position: "product_manager",
        agent: "agent-yuna",
        paths: ["docs/product/checkout.md"],
        instruction: `Act as Product Manager. Write only docs/product/checkout.md for a bounded deterministic checkout slice. Describe user outcome, accepted SKU and positive integer quantity, out-of-stock and invalid-input behavior, deterministic order identity, Orders ownership of order state, dependency on Catalog availability, OrderPlaced emission, acceptance criteria, exclusions, and the consumer-first v1/v2 rollout. Do not modify .ai-org, source code, tests, package files, or Git history. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      modelWork({
        title: "Implement the v1 checkout adapter and order state",
        stage: "build",
        position: "developer",
        agent: "agent-rikku",
        paths: ["src/orders.mjs", "test/orders.test.mjs"],
        instruction: `Act as Developer. Read docs/product/checkout.md and implement a dependency-free Orders module in src/orders.mjs with node:test coverage in test/orders.test.mjs. This first version must accept only Catalog availability v1 { sku, available }, reject v2 as unsupported, validate SKU and positive integer quantity, reject unavailable products, create deterministic order IDs, and keep in-memory order state owned by Orders. Export clear functions for later extension. Do not modify .ai-org, docs, package files, or unrelated tests. Run npm test. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      modelWork({
        title: "Add the consumer-first v1 and v2 availability adapter",
        stage: "build",
        position: "developer",
        agent: "agent-rikku",
        paths: ["src/orders.mjs", "test/orders.test.mjs"],
        instruction: `Act as Developer. Extend the existing Orders module and its focused tests so Orders accepts Catalog availability v1 { sku, available } and v2 { sku, status, contract_version: "v2" }, normalizes both to one internal availability decision, rejects malformed or unsupported versions, and preserves all existing checkout behavior. This is the consumer-first compatibility change; do not remove v1. Modify only src/orders.mjs and test/orders.test.mjs. Do not modify .ai-org, docs, package files, or Git history. Run npm test. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      modelWork({
        title: "Produce the versioned OrderPlaced event",
        stage: "build",
        position: "developer",
        agent: "agent-rikku",
        paths: ["src/orders.mjs", "test/orders.test.mjs", "docs/contracts/order-placed.md"],
        instruction: `Act as Developer. Extend Orders to create a deterministic OrderPlaced v1 event for each successful checkout. The event must contain event_id, order_id, sku, quantity, occurred_at, and contract_version: "v1"; unsuccessful checkout must emit nothing. Keep event identity deterministic for the same stored order. Document the contract in docs/contracts/order-placed.md and test success, failure, and repeat-read behavior. Modify only src/orders.mjs, test/orders.test.mjs, and docs/contracts/order-placed.md. Do not modify .ai-org or package files. Run npm test. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      modelWork({
        title: "Independently verify Orders on the exact candidate",
        stage: "independent_qa",
        position: "independent_qa",
        agent: "agent-lulu",
        paths: ["qa/orders-independent-qa.md"],
        instruction: `Act as Independent QA, distinct from the Developer. Read the current Work Item, product specification, source, tests, and contracts. Run npm test and independently test valid and invalid checkout, v1/v2 equivalence, malformed contract rejection, unavailable inventory, deterministic order state, and OrderPlaced emission. Write only qa/orders-independent-qa.md with the exact Git revision tested, commands, observations, acceptance mapping, defects, limitations, and pass/fail recommendation. Do not modify .ai-org, source code, tests, docs outside the QA report, or Git history. Do not access the network, ask the user, commit, deploy, publish, or claim release approval.`
      })
    ]
  },
  {
    id: "commerce-notifications",
    config: "init-commerce-notifications.json",
    workItems: [
      modelWork({
        title: "Implement the idempotent OrderPlaced consumer",
        stage: "build",
        position: "developer",
        agent: "agent-rikku",
        paths: ["src/notifications.mjs", "test/notifications.test.mjs"],
        instruction: `Act as Developer. Implement a dependency-free Notifications consumer in src/notifications.mjs with node:test coverage in test/notifications.test.mjs. Accept only a valid OrderPlaced v1 event containing event_id, order_id, sku, positive integer quantity, occurred_at, and contract_version: "v1". Record deterministic delivery state, make duplicate event IDs idempotent, and reject malformed or unsupported events without creating or changing delivery state. Export functions suitable for integration testing. Modify only src/notifications.mjs and test/notifications.test.mjs. Do not modify .ai-org, docs, package files, or Git history. Run npm test. Do not access the network, ask the user, commit, deploy, or publish.`
      }),
      mechanical("Inject a malformed event and verify recovery", ["qa/malformed-event-recovery.json"]),
      modelWork({
        title: "Independently verify Notifications on the exact candidate",
        stage: "independent_qa",
        position: "independent_qa",
        agent: "agent-lulu",
        paths: ["qa/notifications-independent-qa.md"],
        instruction: `Act as Independent QA, distinct from the Developer. Read the current Work Item, source, tests, and available OrderPlaced contract evidence. Run npm test and independently test one valid event, a duplicate, missing fields, an unsupported version, invalid quantity, and a valid event after rejection. Verify rejected input never creates delivery state. Write only qa/notifications-independent-qa.md with the exact Git revision tested, commands, observations, acceptance mapping, defects, limitations, and pass/fail recommendation. Do not modify .ai-org, source code, tests, other docs, or Git history. Do not access the network, ask the user, commit, deploy, publish, or claim release approval.`
      })
    ]
  }
]);

function mechanical(title, paths) {
  return { title, model: false, paths };
}

function modelWork({ title, stage, position, agent, paths, instruction }) {
  return { title, model: true, stage, position, agent, paths, instruction };
}

async function run(command, args, options = {}) {
  const result = await execFile(command, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    ...options
  });
  return result.stdout.trim();
}

async function temple(root, args) {
  const targetIndex = ["work-item"].includes(args[0]) ? 2 : 1;
  return run(process.execPath, [templeCli, ...args.slice(0, targetIndex), root, ...args.slice(targetIndex)], {
    env: { ...process.env, TEMPLE_CLI_PATH: templeCli }
  });
}

async function git(root, args) {
  return run("git", ["-C", root, ...args], {
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  });
}

async function write(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, value.endsWith("\n") ? value : `${value}\n`, { encoding: "utf8", flag: "wx" });
}

function lifecycleArtifact(id, title, label) {
  return `# ${id} ${label}\n\nWork Item: ${title}\n\nThis bounded synthetic artifact exists to exercise Temple lifecycle gates. It grants no external, release, publication, deployment, or spending authority.\n`;
}

async function createBaseRepository(project) {
  const root = path.join(experimentRoot, project.id);
  const configPath = path.join(import.meta.dirname, project.config);
  const config = await validateInitConfig(JSON.parse(await fs.readFile(configPath, "utf8")));
  const plan = await planInit(root, config);
  await executeInit(plan);
  await write(path.join(root, ".gitignore"), "node_modules/\n.DS_Store\n.ai-org/runtime/\n*.log\n");
  await write(path.join(root, "package.json"), `${JSON.stringify({
    name: project.id,
    version: "0.0.0-validation",
    private: true,
    type: "module",
    scripts: { test: "node --test" }
  }, null, 2)}\n`);
  await write(path.join(root, "README.md"), `# ${config.project.name}\n\nSynthetic local repository for Temple WI-0067. It is not a production service and has no external authority.\n`);
  await write(path.join(root, "test/baseline.test.mjs"), `import test from "node:test";\nimport assert from "node:assert/strict";\n\ntest("synthetic repository baseline", () => assert.equal(true, true));\n`);
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.name", gitIdentity.name]);
  await git(root, ["config", "user.email", gitIdentity.email]);
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Initialize synthetic Temple repository"]);
  return root;
}

async function createWorkItems(root, project) {
  for (const [index, item] of project.workItems.entries()) {
    const expectedId = `WI-${String(index + 1).padStart(4, "0")}`;
    const args = [
      "work-item", "create",
      "--title", item.title,
      "--scope", `Complete only the bounded synthetic ${project.id} responsibility named by this Work Item.`,
      "--acceptance", item.model
        ? "The declared output is committed, locally verified, and correlated to exactly one bounded Provider-owned task."
        : "The declared deterministic evidence is committed without a model turn.",
      "--spec-mode", "gate-evidence",
      "--ui-mode", "not-applicable",
      "--tracker-visibility", "internal"
    ];
    for (const affectedPath of item.paths) args.push("--affected-path", affectedPath);
    await temple(root, args);
    const workItemPath = path.join(root, ".ai-org/work-items", `${expectedId}.json`);
    const workItem = JSON.parse(await fs.readFile(workItemPath, "utf8"));
    if (workItem.id !== expectedId || workItem.title !== item.title) throw new Error(`unexpected Work Item allocation in ${project.id}`);
    const artifactRoot = path.join(root, ".ai-org/artifacts", expectedId);
    await write(path.join(artifactRoot, "work-order.md"), lifecycleArtifact(expectedId, item.title, "work order"));
    await write(path.join(artifactRoot, "approved-scope.md"), lifecycleArtifact(expectedId, item.title, "approved scope and acceptance criteria"));
    await write(path.join(artifactRoot, "technical-design.md"), lifecycleArtifact(expectedId, item.title, "technical design"));
    await write(path.join(artifactRoot, "risk-review.md"), lifecycleArtifact(expectedId, item.title, "risk review"));
    await write(path.join(artifactRoot, "developer-report.md"), lifecycleArtifact(expectedId, item.title, "planned developer evidence"));
    await write(path.join(artifactRoot, "quality-test-observation.json"), `${JSON.stringify({
      schema_version: "temple.synthetic-test-observation/v1",
      work_item_id: expectedId,
      status: "planned",
      synthetic: true
    }, null, 2)}\n`);
    await write(path.join(artifactRoot, "evaluation-report.md"), lifecycleArtifact(expectedId, item.title, "planned evaluation"));
    await write(path.join(artifactRoot, "independent-qa-report.md"), lifecycleArtifact(expectedId, item.title, "planned independent QA"));
    await write(path.join(artifactRoot, "rollback-plan.md"), `# ${expectedId} rollback plan\n\nRevert only the exact local synthetic candidate commit. No external state exists.\n`);
    if (item.model) await write(path.join(artifactRoot, "instructions.md"), `${item.instruction}\n\nReturn a concise final summary naming ${project.id}, ${expectedId}, your Position, tests run, changed files, and unresolved issues.\n`);
  }
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Define bounded commerce rehearsal work"]);
}

async function transition(root, id, target, requirements) {
  const args = ["transition", "--work-item", id, "--to", target];
  for (const [name, reference] of Object.entries(requirements)) args.push("--satisfy", `${name}=${reference}`);
  await temple(root, args);
}

async function prepareModelWork(root, project) {
  const baseRevision = await git(root, ["rev-parse", "HEAD"]);
  let activeClaimCreated = false;
  for (const [index, item] of project.workItems.entries()) {
    if (!item.model) continue;
    const id = `WI-${String(index + 1).padStart(4, "0")}`;
    const artifact = `.ai-org/artifacts/${id}`;
    await temple(root, ["work-item", "configure", "--work-item", id, "--agent-id", "agent-mog", "--base-revision", baseRevision, "--parallel-mode", "sequential"]);
    await transition(root, id, "spec", { work_order: `${artifact}/work-order.md` });
    if (["design", "build", "independent_qa"].includes(item.stage)) {
      await transition(root, id, "design", {
        approved_scope: `${artifact}/approved-scope.md`,
        acceptance_criteria: `${artifact}/approved-scope.md`
      });
    }
    if (["build", "independent_qa"].includes(item.stage)) {
      await transition(root, id, "build", {
        technical_design: `${artifact}/technical-design.md`,
        risk_review: `${artifact}/risk-review.md`
      });
    }
    if (item.stage === "independent_qa") {
      await transition(root, id, "test", {
        developer_handoff: `${artifact}/developer-report.md`,
        developer_evidence: `${artifact}/developer-report.md`
      });
      await transition(root, id, "eval", { test_evidence: `${artifact}/quality-test-observation.json` });
      await transition(root, id, "independent_qa", { evaluation_report: `${artifact}/evaluation-report.md` });
    }
    if (!activeClaimCreated) {
      const currentRevision = await git(root, ["rev-parse", "HEAD"]);
      await temple(root, [
        "work-item", "claim", "--work-item", id,
        "--agent-id", item.agent,
        "--principal-id", "human",
        "--base-revision", currentRevision,
        "--branch", "main",
        "--worktree", root
      ]);
      activeClaimCreated = true;
    }
  }
  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Prepare model-owned rehearsal stages"]);
}

async function main() {
  await fs.mkdir(experimentRoot, { recursive: true });
  const targets = projects.map((project) => path.join(experimentRoot, project.id));
  const existing = [];
  for (const target of targets) {
    try {
      await fs.access(target);
      existing.push(target);
    } catch {
      // Expected for a fresh bounded setup.
    }
  }
  if (existing.length > 0) throw new Error(`refusing to replace existing rehearsal repositories: ${existing.join(", ")}`);

  const result = [];
  for (const project of projects) {
    const root = await createBaseRepository(project);
    await createWorkItems(root, project);
    await prepareModelWork(root, project);
    const status = await git(root, ["status", "--porcelain=v1"]);
    if (status) throw new Error(`${project.id} is dirty after setup`);
    result.push({
      project_id: project.id,
      root,
      revision: await git(root, ["rev-parse", "HEAD"]),
      work_items: project.workItems.length,
      model_turns: project.workItems.filter((item) => item.model).length
    });
  }
  process.stdout.write(`${JSON.stringify({ schema_version: "temple.commerce-rehearsal-setup/v1", repositories: result }, null, 2)}\n`);
}

await main();
