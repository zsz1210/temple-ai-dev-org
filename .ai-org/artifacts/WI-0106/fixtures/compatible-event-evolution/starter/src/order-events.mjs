export function decodeOrderPlaced(event) {
  if (event?.type !== "OrderPlaced") throw new TypeError("OrderPlaced event required");
  if (event.version !== 1) throw new RangeError(`unsupported OrderPlaced version: ${event.version}`);
  return { orderId: event.order_id, amountMinor: event.amount_minor };
}

export function encodeOrderPlaced(order, version = 1) {
  if (version !== 1) throw new RangeError(`unsupported OrderPlaced version: ${version}`);
  return {
    type: "OrderPlaced",
    version: 1,
    order_id: order.id,
    amount_minor: order.amountMinor
  };
}
