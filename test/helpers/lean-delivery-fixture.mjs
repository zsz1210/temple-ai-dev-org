import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export function cli(args, { allowFailure = false } = {}) {
  const start = performance.now();
  const result = spawnSync(process.execPath, [path.join(root, "bin/temple.mjs"), ...args], { encoding: "utf8" });
  if (!allowFailure && result.status !== 0) throw new Error(result.stderr || result.stdout);
  return { ...result, elapsed_ms: performance.now() - start, output_bytes: Buffer.byteLength(result.stdout ?? "") + Buffer.byteLength(result.stderr ?? "") };
}
export function git(target, args) {
  const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}
export async function fixture() {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "temple-lean-delivery-"));
  const target = path.join(temporary, "project");
  const config = path.join(temporary, "init.json");
  await fs.writeFile(config, JSON.stringify({
    schema_version: "temple.init/v1", project: { id: "delivery-fixture", name: "Delivery fixture" }, naming_mode: "ai-suggested",
    agents: [
      { display_name: "Coordinator", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Planner", positions: ["product_manager", "ux_designer", "ui_designer"] },
      { display_name: "Architect", positions: ["tech_lead"] },
      { display_name: "Builder", positions: ["developer"] },
      { display_name: "Verifier", positions: ["quality_evaluator", "independent_qa"] }
    ]
  }));
  const setup = [];
  setup.push(cli(["init", target, "--config", config]));
  await fs.mkdir(path.join(target, "docs"), { recursive: true });
  await fs.writeFile(path.join(target, "app.mjs"), 'export function parseCount(value) { if (!/^\\d+$/.test(value)) throw new Error("invalid count"); return Number(value); }\n');
  await fs.writeFile(path.join(target, "app.test.mjs"), 'import assert from "node:assert/strict"; import {parseCount} from "./app.mjs"; assert.equal(parseCount("12"),12); assert.throws(()=>parseCount("x"));\n');
  await fs.writeFile(path.join(target, "docs/brief.md"), "# Approved fixture brief\nParse decimal counts; reject non-digits. Local bounded work, no interface, no external action.\n");
  const productTest = spawnSync(process.execPath, ["--test", "app.test.mjs"], { cwd: target, encoding: "utf8" });
  if (productTest.status !== 0) throw new Error(productTest.stderr || productTest.stdout);
  await fs.writeFile(path.join(target, "docs/developer-test.md"), `# Developer observation\nCommand: node --test app.test.mjs\nExit: ${productTest.status}\n\n${productTest.stdout}`);
  git(target, ["init", "-b", "main"]);
  git(target, ["config", "user.name", "Fixture"]);
  git(target, ["config", "user.email", "fixture@example.invalid"]);
  git(target, ["add", "."]);
  git(target, ["commit", "-m", "Freeze product and contract fixture"]);
  const revision = git(target, ["rev-parse", "HEAD"]);
  setup.push(cli(["work-item", "create", target, "--title", "Deliver the parser fixture", "--scope", "Local parser", "--acceptance", "Decimal input parses and non-digits fail", "--affected-path", "app.mjs", "--affected-path", "app.test.mjs", "--workflow-profile", "lean", "--risk-tier", "low", "--scope-class", "bounded", "--profile-rationale", "Local reversible fixture", "--ui-mode", "not-applicable", "--json"]));
  const item = JSON.parse(setup.at(-1).stdout).item;
  setup.push(cli(["transition", target, "--work-item", item.id, "--to", "build", ...["work_order", "approved_scope", "acceptance_criteria", "technical_design", "risk_review", "profile_eligibility"].flatMap((gate) => ["--satisfy", `${gate}=docs/brief.md`])]));
  const assignments = JSON.parse(await fs.readFile(path.join(target, ".ai-org/project/assignments.json")));
  const agent = assignments.assignments.find((entry) => entry.position_id === "developer").agent_id;
  const qualityAgent = assignments.assignments.find((entry) => entry.position_id === "quality_evaluator").agent_id;
  setup.push(cli(["work-item", "claim", target, "--work-item", item.id, "--agent-id", agent, "--principal-id", "human", "--base-revision", revision, "--branch", "main", "--json"]));
  const claimed = JSON.parse(setup.at(-1).stdout).item;
  const request = { workItemId: item.id, operationId: "parser-delivery", claimId: claimed.claim.id, agentId: agent, principalId: "human", revision, completed: ["Implemented and tested parser fixture"], evidence: ["docs/developer-test.md"], unresolved: [] };
  return { temporary, target, item, request, setup, qualityAgent, cleanup: () => fs.rm(temporary, { recursive: true, force: true }) };
}
export function deliveryArgs(f, extra = []) {
  const r = f.request;
  return ["work-item", "deliver", f.target, "--work-item", r.workItemId, "--operation-id", r.operationId, "--claim-id", r.claimId, "--agent-id", r.agentId, "--principal-id", r.principalId, "--revision", r.revision, ...r.completed.flatMap((x) => ["--completed", x]), ...r.evidence.flatMap((x) => ["--evidence", x]), ...r.unresolved.flatMap((x) => ["--unresolved", x]), "--json", ...extra];
}
export async function itemState(f) {
  return JSON.parse(await fs.readFile(path.join(f.target, `.ai-org/work-items/${f.item.id}.json`)));
}
export async function canonicalBytes(f) {
  const output = {};
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) output[path.relative(f.target, absolute)] = await fs.readFile(absolute, "utf8");
    }
  }
  await walk(path.join(f.target, ".ai-org"));
  return output;
}
