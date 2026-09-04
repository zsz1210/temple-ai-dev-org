import assert from "node:assert/strict";
import test from "node:test";
import { toCheckoutResponse } from "../src/checkout-response.mjs";

test("gateway preserves stable fields and exposes the event version", () => {
  assert.deepEqual(toCheckoutResponse({
    order: { id: "order-request-1" },
    event: { version: "v2" }
  }), {
    orderId: "order-request-1",
    status: "accepted",
    eventVersion: "v2"
  });
});
