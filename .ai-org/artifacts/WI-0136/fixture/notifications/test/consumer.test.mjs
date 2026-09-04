import assert from "node:assert/strict";
import test from "node:test";
import { consumeOrderPlaced } from "../src/consumer.mjs";

const event = {
  type: "OrderPlaced",
  version: "v2",
  id: "event-request-1",
  occurredAt: "2026-09-03T00:00:00.000Z",
  locale: "ja-JP",
  inventoryRevision: "inventory-7",
  order: { id: "order-request-1", sku: "SKU-1", quantity: 2 }
};

test("notifications accepts v2 and remains idempotent", () => {
  const deliveries = new Map();
  assert.deepEqual(consumeOrderPlaced(event, deliveries), {
    accepted: true,
    duplicate: false,
    deliveryCount: 1
  });
  assert.deepEqual(consumeOrderPlaced(event, deliveries), {
    accepted: true,
    duplicate: true,
    deliveryCount: 1
  });
});
