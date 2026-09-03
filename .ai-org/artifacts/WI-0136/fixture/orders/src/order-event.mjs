export function createOrderPlaced(input) {
  return {
    type: "OrderPlaced",
    version: "v1",
    id: `event-${input.requestId}`,
    orderId: `order-${input.requestId}`,
    sku: input.sku,
    quantity: input.quantity
  };
}
