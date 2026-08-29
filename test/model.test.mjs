import assert from "node:assert/strict";
import test from "node:test";
import { validateInitConfig } from "../src/model.mjs";

function validConfig() {
  return {
    schema_version: "temple.init/v1",
    project: { id: "sample-product", name: "Sample Product" },
    naming_mode: "ai-suggested",
    agents: [
      { display_name: "Test Rowan", positions: ["engineering_manager", "release_manager", "observer"] },
      { display_name: "Test Linden", positions: ["product_manager", "ux_designer"] },
      { display_name: "Test Ellis", positions: ["tech_lead"] },
      { display_name: "Test Devon", positions: ["developer"] },
      { display_name: "Test Hollis", positions: ["quality_evaluator", "independent_qa"] }
    ]
  };
}

test("valid config produces stable project Agent IDs", async () => {
  const first = await validateInitConfig(validConfig());
  const second = await validateInitConfig(validConfig());
  assert.deepEqual(first, second);
  assert.equal(first.agents[0].id, "agent-test-rowan");
});

test("Agent A style labels are rejected", async () => {
  const config = validConfig();
  config.agents[0].display_name = "Agent A";
  await assert.rejects(() => validateInitConfig(config), /meaningful name/);
});

test("Developer cannot also be Independent QA", async () => {
  const config = validConfig();
  config.agents[3].positions.push("independent_qa");
  config.agents[4].positions = ["quality_evaluator"];
  await assert.rejects(() => validateInitConfig(config), /Developer and Independent QA must be different/);
});

test("all nine Positions must remain assigned", async () => {
  const config = validConfig();
  config.agents[0].positions = ["engineering_manager", "release_manager"];
  await assert.rejects(() => validateInitConfig(config), /Missing Position assignment: observer/);
});
