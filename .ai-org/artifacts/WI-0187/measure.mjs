import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fixture, cli, deliveryArgs } from "../../../test/helpers/lean-delivery-fixture.mjs";

const observations = [];
for (const mode of ["separate", "finish"]) {
  const f = await fixture();
  try {
    // Equal synthetic integration prerequisites; no real project policy is changed.
    const integrationPath = path.join(f.target, ".ai-org/project/repository-integration.json");
    const integration = JSON.parse(await fs.readFile(integrationPath));
    await fs.writeFile(integrationPath, JSON.stringify({ ...integration, status: "confirmed", source: "human-confirmed", summary: "Local fixture only", change_isolation: "not-required", review_gate: "not-required", recorded_at: "2026-09-01T00:00:00.000Z", recorded_by: "human" }));
    const collect = (stage, commands) => {
      const runs = commands.map(args => cli(args));
      observations.push({ mode, stage, command_count: runs.length,
        command_elapsed_ms: runs.reduce((sum, run) => sum + run.elapsed_ms, 0),
        response_bytes: runs.reduce((sum, run) => sum + run.output_bytes, 0),
        exit_codes: runs.map(run => run.status) });
    };
    const diagnostics = [["status", f.target, "--compact", "--json", "--work-item", f.item.id], ["doctor", f.target, "--compact", "--json"]];
    collect("developer", mode === "separate" ? [deliveryArgs(f), ...diagnostics]
      : [deliveryArgs(f).map((value, index) => index === 1 ? "finish" : value).concat(["--position", "developer"])]);
    const result = spawnSync(process.execPath, ["--test", "app.test.mjs"], { cwd: f.target, encoding: "utf8" });
    if (result.status !== 0) throw new Error("Product verification failed");
    await fs.writeFile(path.join(f.target, "docs/verifier-test.md"), `# Verification\nCandidate: ${f.request.revision}\nExit: ${result.status}\n${result.stdout}`);
    await fs.writeFile(path.join(f.target, "docs/closeout.md"), `# Lean acceptance\nAccepted fixture scope at ${f.request.revision}. Product tests passed. No unresolved work. No external release.\n`);
    const claimed = JSON.parse(cli(["work-item", "claim", f.target, "--work-item", f.item.id, "--agent-id", f.qualityAgent, "--principal-id", "human", "--base-revision", f.request.revision, "--branch", "main", "--json"]).stdout).item;
    collect("quality_evaluator", mode === "separate"
      ? [["transition", f.target, "--work-item", f.item.id, "--to", "done", "--satisfy", "test_evidence=docs/verifier-test.md", "--satisfy", "lean_closeout=docs/closeout.md", "--json"], ...diagnostics]
      : [["work-item", "finish", f.target, "--work-item", f.item.id, "--position", "quality_evaluator", "--operation-id", "verify-finish", "--claim-id", claimed.claim.id, "--agent-id", f.qualityAgent, "--principal-id", "human", "--revision", f.request.revision, "--judgment", "pass", "--test-evidence", "docs/verifier-test.md", "--lean-closeout", "docs/closeout.md", "--json"]]);
  } finally { await f.cleanup(); }
}
console.log(JSON.stringify({ model_calls: 0, observations,
  method: "One synthetic run per mode; completion plus explicit full Status inspection and Doctor. Existing individual mutations also rebuild views internally.",
  exclusions: ["fixture setup", "claim", "product tests", "evidence authoring", "model inference"],
  limitations: ["command counts are structural, not AI turns", "elapsed command time is a local diagnostic sample", "response bytes are not Tokens", "no ordinary-versus-Temple delivery comparison"] }, null, 2));
