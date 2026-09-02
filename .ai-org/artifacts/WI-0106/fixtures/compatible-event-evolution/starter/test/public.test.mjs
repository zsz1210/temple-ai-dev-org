import assert from "node:assert/strict";
import test from "node:test";
import { decodeOrderPlaced, encodeOrderPlaced } from "../src/order-events.mjs";

test("version 1 remains the default encoding and normalized decoding", () => {
  const event = encodeOrderPlaced({ id: "ord-1", amountMinor: 1200 });
  assert.deepEqual(event, {
    type: "OrderPlaced",
    version: 1,
    order_id: "ord-1",
    amount_minor: 1200
  });
  assert.deepEqual(decodeOrderPlaced(event), { orderId: "ord-1", amountMinor: 1200 });
});

test("unknown versions remain rejected", () => {
  assert.throws(() => decodeOrderPlaced({ type: "OrderPlaced", version: 9 }), /unsupported/);
});
