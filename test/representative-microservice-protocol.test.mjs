import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { validateRepresentativeMicroserviceProtocol } from "../scripts/validate-representative-microservice-protocol.mjs";

const protocolPath = new URL("../.ai-org/artifacts/WI-0118/representative-microservice-protocol.json", import.meta.url);

test("representative microservice protocol qualifies locally without model generation", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolPath, "utf8"));
  const result = validateRepresentativeMicroserviceProtocol(protocol);
  assert.equal(result.status, "qualified-for-local-fixture-execution");
  assert.deepEqual(result.failures, []);
  assert.equal(result.model_generation_performed, false);
  assert.equal(result.live_execution_authorized, false);
});

test("representative microservice protocol rejects an unmatched arm and invalid evaluator scale", async () => {
  const protocol = JSON.parse(await fs.readFile(protocolPath, "utf8"));
  protocol.arms[1].model_route[1].model = "gpt-5.6-luna";
  protocol.evaluator.score_maximum = 100;
  protocol.limits.automatic_retries = 1;
  const result = validateRepresentativeMicroserviceProtocol(protocol);
  assert.equal(result.status, "rejected");
  assert.ok(result.failures.includes("model routes must match across arms"));
  assert.ok(result.failures.includes("evaluator score range must be 0 through 1"));
  assert.ok(result.failures.includes("automatic retries must be zero"));
});
