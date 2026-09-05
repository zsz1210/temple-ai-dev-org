// Adapted from the sealed comparison branch bba20cc; local diagnostics only.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { fixture, cli, git, deliveryArgs, itemState } from "../../../test/helpers/lean-delivery-fixture.mjs";

const sum = (entries, key) => entries.reduce((total, entry) => total + entry[key], 0);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const digest = (value) => createHash("sha256").update(value).digest("hex");

async function sourceSnapshot() {
  const files = [...new Set(git(root, ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "src", "bin", "package.json", "project-overlay", ".ai-org/artifacts/WI-0178/measure-local.mjs", "test/helpers/lean-delivery-fixture.mjs"]).split("\0").filter(Boolean))].sort();
  const entries = await Promise.all(files.map(async (file) => ({ path: file, sha256: digest(await fs.readFile(path.join(root, file))) })));
  return { revision: git(root, ["rev-parse", "HEAD"]), source_digest: digest(JSON.stringify(entries)), files: entries };
}

export async function measureLeanDelivery() {
  const source = await sourceSnapshot();
  // Interleaved unchanged controls; descriptive local measurement, not a powered experiment.
  const order = ["documented-three", "deliver", "existing-two", "deliver-preview", "deliver", "documented-three"];
  const observations = [];
  for (const treatment of order) {
    const f = await fixture();
    try {
      const operations = [];
      let result;
      if (treatment.startsWith("deliver")) {
        const extra = [];
        if (treatment === "deliver-preview") {
          operations.push(cli(deliveryArgs(f, ["--dry-run"])));
          extra.push("--expected-plan", JSON.parse(operations.at(-1).stdout).plan_digest);
        }
        operations.push(cli(deliveryArgs(f, extra)));
        result = JSON.parse(operations.at(-1).stdout);
      } else {
        operations.push(cli(["handoff", f.target, "--work-item", f.item.id, "--to", "quality_evaluator", "--input-revision", f.request.revision, "--completed", f.request.completed[0], "--evidence", f.request.evidence[0], "--json"]));
        if (treatment === "documented-three") operations.push(cli(["work-item", "release", f.target, "--work-item", f.item.id, "--agent-id", f.request.agentId, "--principal-id", "human", "--reason", "Developer handoff recorded", "--json"]));
        operations.push(cli(["transition", f.target, "--work-item", f.item.id, "--to", "test", "--json"]));
      }
      const item = await itemState(f);
      const accepted = item.state === "test" && item.owner_position === "quality_evaluator" && item.claim?.status === "released" && item.handoffs?.length === 1 && item.developer_candidate_revision === f.request.revision && item.gate_evidence.developer_evidence.includes("docs/developer-test.md");
      if (!accepted) throw new Error(`${treatment} failed the fixed Test-entry oracle`);
      const recovery = cli(["context", "resolve", f.target, "--work-item", f.item.id, "--position", "quality_evaluator", "--purpose", "recovery", "--no-write", "--json"]);
      const capsule = JSON.parse(recovery.stdout);
      if (capsule.work_item.state !== "test" || capsule.work_item.id !== item.id) throw new Error("Recovery projection failed");
      const retry = treatment.startsWith("deliver") ? cli(deliveryArgs(f)) : null;
      observations.push({
        treatment, objective_test_entry: "pass", product_fixture_test: "pass",
        administrative_cli_invocations: operations.length,
        administrative_elapsed_ms: sum(operations, "elapsed_ms"),
        administrative_output_bytes: sum(operations, "output_bytes"),
        setup_cli_invocations: f.setup.length, setup_cli_elapsed_ms: sum(f.setup, "elapsed_ms"),
        setup_scope: "Temple init and Work Item setup only; Git, product fixture construction, dependency installation, and human onboarding are not included",
        recovery_projection_elapsed_ms: recovery.elapsed_ms, recovery_projection_output_bytes: recovery.output_bytes,
        recovery_source_bytes: capsule.source_manifest.measured_bytes,
        idempotent_retry_elapsed_ms: retry?.elapsed_ms ?? null,
        idempotent_retry_outcome: retry ? JSON.parse(retry.stdout).status : "not_applicable",
        tool_round_trips: null, model_turns: null, provider_tokens: null, human_active_minutes: null,
        status: result?.status ?? "low_level_path"
      });
    } finally { await f.cleanup(); }
  }
  if ((await sourceSnapshot()).source_digest !== source.source_digest) throw new Error("Measurement source changed during the run");
  return {
    schema_version: "temple.lean-delivery-local-baseline/v1", measured_at: new Date().toISOString(),
    source, runtime: { node: process.version, platform: process.platform, architecture: process.arch },
    generation_performed: false, financial_cost: null, observations,
    interpretation: {
      cli_consolidation: "Documented sequence 3 -> 1; existing handoff plus auto-release transition 2 -> 1; explicit preview plus apply takes 2.",
      batching: "A programmed caller can batch every baseline into one host tool invocation. CLI counts do not establish fewer model turns or tool round trips.",
      timing: "Local Node/CLI timing only. Two unchanged documented controls and two direct-operation observations expose noise; no statistical or Provider-latency claim.",
      output: "Default JSON output bytes are observed; baseline callers may filter output. Byte savings are not equivalent to measured Tokens.",
      continuity: "The recovery command projection is checked; fresh-agent understanding, guide usability, and end-to-end recovery remain unmeasured.",
      scope: "This is the Developer-to-Test administrative segment. It excludes full product reasoning, later Test/QA, broader setup, and future rework. No full-delivery break-even point is claimed."
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--output")) throw new Error("Usage: node scripts/measure-lean-delivery.mjs [--output file]");
  const report = await measureLeanDelivery();
  const content = `${JSON.stringify(report, null, 2)}\n`;
  if (args.length) await fs.writeFile(path.resolve(args[1]), content, { flag: "wx" });
  else process.stdout.write(content);
}
