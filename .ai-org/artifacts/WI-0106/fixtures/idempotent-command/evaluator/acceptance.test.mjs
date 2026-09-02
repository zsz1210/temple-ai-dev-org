import assert from "node:assert/strict";
import test from "node:test";
import { applyCommand } from "../candidate/src/command-store.mjs";

test("a repeated command ID is a no-op", () => {
  const state = { balance: 15, processedCommandIds: ["cmd-1"] };
  const result = applyCommand(state, { id: "cmd-1", amount: 5 });
  assert.deepEqual(result, { state, events: [] });
  assert.notEqual(result.state, state);
});

test("idempotency is based on command identity", () => {
  const state = { balance: 15, processedCommandIds: ["cmd-1"] };
  const result = applyCommand(state, { id: "cmd-1", amount: 999 });
  assert.deepEqual(result.state, state);
  assert.deepEqual(result.events, []);
});

test("a different command still applies once without mutating input", () => {
  const state = { balance: 15, processedCommandIds: ["cmd-1"] };
  const result = applyCommand(state, { id: "cmd-2", amount: 7 });
  assert.deepEqual(result.state, { balance: 22, processedCommandIds: ["cmd-1", "cmd-2"] });
  assert.equal(result.events.length, 1);
  assert.deepEqual(state, { balance: 15, processedCommandIds: ["cmd-1"] });
});
