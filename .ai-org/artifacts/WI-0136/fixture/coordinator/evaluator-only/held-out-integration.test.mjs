import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const armRoot = process.env.TEMPLE_BENCHMARK_ARM_ROOT
  ? path.resolve(process.env.TEMPLE_BENCHMARK_ARM_ROOT)
  : path.resolve(import.meta.dirname, "../..");
const { consumeOrderPlaced } = await import(pathToFileURL(path.join(armRoot, "notifications/src/consumer.mjs")).href);

test("the new v2 envelope is consumable", () => {
  const deliveries = new Map();
  const next = {
    type: "OrderPlaced",
    version: "v2",
    id: "event-next-1",
    occurredAt: "2026-09-03T00:00:00.000Z",
    locale: "ja-JP",
    inventoryRevision: "inventory-7",
    order: { id: "order-next-1", sku: "SKU-1", quantity: 1 }
  };
  assert.deepEqual(consumeOrderPlaced(next, deliveries), {
    accepted: true,
    duplicate: false,
    deliveryCount: 1
  });
});

test("retained v1 events remain consumable after the v2 rollout", () => {
  const deliveries = new Map();
  const retained = {
    type: "OrderPlaced",
    version: "v1",
    id: "event-retained-1",
    orderId: "order-retained-1",
    sku: "SKU-1",
    quantity: 1
  };
  assert.deepEqual(consumeOrderPlaced(retained, deliveries), {
    accepted: true,
    duplicate: false,
    deliveryCount: 1
  });
  assert.deepEqual(consumeOrderPlaced(retained, deliveries), {
    accepted: true,
    duplicate: true,
    deliveryCount: 1
  });
});

test("malformed and unsupported events do not change retained delivery state", () => {
  const deliveries = new Map([["existing", { eventId: "existing", orderId: "order-existing" }]]);
  assert.deepEqual(consumeOrderPlaced({ type: "OrderPlaced", version: "v3", id: "event-bad" }, deliveries), {
    accepted: false,
    duplicate: false,
    deliveryCount: 1
  });
  assert.equal(deliveries.size, 1);
});
