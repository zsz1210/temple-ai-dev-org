import assert from "node:assert/strict";
import test from "node:test";
import { createOrderPlaced } from "../src/order-event.mjs";

test("orders emits the exact v2 envelope", () => {
  assert.deepEqual(createOrderPlaced({
    requestId: "request-1",
    sku: "SKU-1",
    quantity: 2,
    locale: "ja-JP",
    inventoryRevision: "inventory-7",
    occurredAt: "2026-09-03T00:00:00.000Z"
  }), {
    type: "OrderPlaced",
    version: "v2",
    id: "event-request-1",
    occurredAt: "2026-09-03T00:00:00.000Z",
    locale: "ja-JP",
    inventoryRevision: "inventory-7",
    order: {
      id: "order-request-1",
      sku: "SKU-1",
      quantity: 2
    }
  });
});
