export function decodeOrderPlaced(event) {
  if (event?.type !== "OrderPlaced") throw new TypeError("OrderPlaced event required");
  if (event.version === 1) {
    return { orderId: event.order_id, amountMinor: event.amount_minor };
  }
  if (event.version === 2) {
    return { orderId: event.order?.id, amountMinor: event.amount_minor };
  }
  throw new RangeError(`unsupported OrderPlaced version: ${event.version}`);
}

export function encodeOrderPlaced(order, version = 1) {
  if (version === 1) {
    return {
      type: "OrderPlaced",
      version: 1,
      order_id: order.id,
      amount_minor: order.amountMinor
    };
  }
  if (version === 2) {
    return {
      type: "OrderPlaced",
      version: 2,
      order: { id: order.id },
      amount_minor: order.amountMinor
    };
  }
  throw new RangeError(`unsupported OrderPlaced version: ${version}`);
}
