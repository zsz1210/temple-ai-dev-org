export function createOrderPlaced(input) {
  return {
    type: "OrderPlaced",
    version: "v2",
    id: `event-${input.requestId}`,
    occurredAt: input.occurredAt,
    locale: input.locale,
    inventoryRevision: input.inventoryRevision,
    order: {
      id: `order-${input.requestId}`,
      sku: input.sku,
      quantity: input.quantity
    }
  };
}
