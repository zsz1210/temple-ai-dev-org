import { fixture, cli, deliveryArgs } from "../../../test/helpers/lean-delivery-fixture.mjs";

const f = await fixture();
try {
  const stages = [];
  for (const position of ["developer", "quality_evaluator"]) {
    if (position === "quality_evaluator") cli(deliveryArgs(f));
    const args = ["context", "packet", f.target, "--work-item", f.item.id, "--position", position, "--no-write", "--json"];
    const fullRun = cli(args), stageRun = cli([...args, "--material", "stage"]);
    const full = JSON.parse(fullRun.stdout), stage = JSON.parse(stageRun.stdout);
    stages.push({
      position, full_source_bytes: full.measurements.emitted_source_bytes, stage_body_bytes: stage.measurements.emitted_source_bytes,
      full_output_bytes: fullRun.output_bytes, stage_output_bytes: stageRun.output_bytes,
      body_reduction_percent: 100 * (1 - stage.measurements.emitted_source_bytes / full.measurements.emitted_source_bytes),
      output_reduction_percent: 100 * (1 - stageRun.output_bytes / fullRun.output_bytes),
      acquired_bytes_unchanged: full.measurements.acquired_source_bytes === stage.measurements.acquired_source_bytes,
      projected_sources: stage.sources.filter(source => source.representation === "structured-projection").map(source => source.path),
      mandatory_reads_waived: stage.coverage.required_reads_waived
    });
  }
  console.log(JSON.stringify({ schema_version: "temple.stage-material-byte-observation/v1", model_calls: 0,
    method: "same-snapshot full/stage actual CLI responses on synthetic Lean Builder and fresh Verifier fixtures",
    limitations: ["bytes are not Tokens or cost", "full source acquisition remains", "no model quality or delivery efficiency comparison", "single fixture observation per stage"], stages }, null, 2));
} finally { await f.cleanup(); }
