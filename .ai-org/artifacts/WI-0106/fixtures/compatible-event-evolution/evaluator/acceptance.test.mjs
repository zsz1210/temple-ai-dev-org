import assert from "node:assert/strict";
import test from "node:test";
import { decodeOrderPlaced, encodeOrderPlaced } from "../candidate/src/order-events.mjs";

test("version 1 remains compatible", () => {
  const v1 = { type: "OrderPlaced", version: 1, order_id: "ord-1", amount_minor: 1200 };
  assert.deepEqual(decodeOrderPlaced(v1), { orderId: "ord-1", amountMinor: 1200 });
  assert.deepEqual(encodeOrderPlaced({ id: "ord-1", amountMinor: 1200 }), v1);
});

test("version 2 decodes to the stable normalized shape", () => {
  const v2 = { type: "OrderPlaced", version: 2, order: { id: "ord-2" }, amount_minor: 3400 };
  assert.deepEqual(decodeOrderPlaced(v2), { orderId: "ord-2", amountMinor: 3400 });
});

test("version 2 encoding round trips", () => {
  const event = encodeOrderPlaced({ id: "ord-3", amountMinor: 5600 }, 2);
  assert.deepEqual(event, {
    type: "OrderPlaced",
    version: 2,
    order: { id: "ord-3" },
    amount_minor: 5600
  });
  assert.deepEqual(decodeOrderPlaced(event), { orderId: "ord-3", amountMinor: 5600 });
});

test("unknown versions remain rejected", () => {
  assert.throws(() => encodeOrderPlaced({ id: "ord-4", amountMinor: 1 }, 9), /unsupported/);
  assert.throws(() => decodeOrderPlaced({ type: "OrderPlaced", version: 9 }), /unsupported/);
});
