function orderId(event) {
  if (event.version === "v1") return event.orderId;
  if (event.version === "v2") return event.order?.id;
  return null;
}

export function consumeOrderPlaced(event, deliveries = new Map()) {
  const resolvedOrderId = event?.type === "OrderPlaced" ? orderId(event) : null;
  if (!event?.id || !resolvedOrderId) {
    return { accepted: false, duplicate: false, deliveryCount: deliveries.size };
  }
  const duplicate = deliveries.has(event.id);
  if (!duplicate) deliveries.set(event.id, { eventId: event.id, orderId: resolvedOrderId });
  return { accepted: true, duplicate, deliveryCount: deliveries.size };
}
