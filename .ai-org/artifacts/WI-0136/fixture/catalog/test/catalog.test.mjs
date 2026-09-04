import assert from "node:assert/strict";
import test from "node:test";
import { getAvailability } from "../src/catalog.mjs";

test("catalog exposes the inventory revision", () => {
  assert.deepEqual(getAvailability("SKU-1"), {
    sku: "SKU-1",
    available: true,
    inventoryRevision: "inventory-7"
  });
});
