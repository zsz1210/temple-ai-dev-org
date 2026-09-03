import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const armRoot = path.resolve(import.meta.dirname, "../..");
const load = (relative) => import(pathToFileURL(path.join(armRoot, relative)).href);

test("checkout converges on OrderPlaced v2 across all four repositories", async () => {
  const [{ getAvailability }, { createOrderPlaced }, { consumeOrderPlaced }, { toCheckoutResponse }] = await Promise.all([
    load("catalog/src/catalog.mjs"),
    load("orders/src/order-event.mjs"),
    load("notifications/src/consumer.mjs"),
    load("gateway/src/checkout-response.mjs")
  ]);
  const availability = getAvailability("SKU-1");
  const event = createOrderPlaced({
    requestId: "request-1",
    sku: availability.sku,
    quantity: 2,
    locale: "ja-JP",
    inventoryRevision: availability.inventoryRevision,
    occurredAt: "2026-09-03T00:00:00.000Z"
  });
  assert.equal(event.version, "v2");
  assert.equal(event.inventoryRevision, "inventory-7");
  assert.deepEqual(consumeOrderPlaced(event, new Map()), {
    accepted: true,
    duplicate: false,
    deliveryCount: 1
  });
  assert.deepEqual(toCheckoutResponse({ order: event.order, event }), {
    orderId: "order-request-1",
    status: "accepted",
    eventVersion: "v2"
  });
});
