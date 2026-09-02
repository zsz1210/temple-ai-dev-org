import assert from "node:assert/strict";
import test from "node:test";
import { applyCommand } from "../src/command-store.mjs";

test("a new command adjusts the balance and emits one event", () => {
  const original = { balance: 10, processedCommandIds: [] };
  const result = applyCommand(original, { id: "cmd-1", amount: 5 });
  assert.deepEqual(result.state, { balance: 15, processedCommandIds: ["cmd-1"] });
  assert.deepEqual(result.events, [{ type: "BalanceAdjusted", commandId: "cmd-1", amount: 5 }]);
  assert.deepEqual(original, { balance: 10, processedCommandIds: [] });
});

test("invalid commands retain the public validation contract", () => {
  assert.throws(
    () => applyCommand({ balance: 0, processedCommandIds: [] }, { id: "", amount: 1 }),
    /command.id is required/
  );
});
