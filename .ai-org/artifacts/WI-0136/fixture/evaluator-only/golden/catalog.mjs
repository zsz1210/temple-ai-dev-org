const inventory = new Map([
  ["SKU-1", { available: true, inventoryRevision: "inventory-7" }],
  ["SKU-2", { available: false, inventoryRevision: "inventory-3" }]
]);

export function getAvailability(sku) {
  const item = inventory.get(sku);
  return {
    sku,
    available: item?.available === true,
    inventoryRevision: item?.inventoryRevision ?? null
  };
}
