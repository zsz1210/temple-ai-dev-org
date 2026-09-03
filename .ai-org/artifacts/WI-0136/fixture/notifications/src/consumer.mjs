export function consumeOrderPlaced(event, deliveries = new Map()) {
  if (event?.type !== "OrderPlaced" || event.version !== "v1" || !event.id || !event.orderId) {
    return { accepted: false, duplicate: false, deliveryCount: deliveries.size };
  }
  const duplicate = deliveries.has(event.id);
  if (!duplicate) deliveries.set(event.id, { eventId: event.id, orderId: event.orderId });
  return { accepted: true, duplicate, deliveryCount: deliveries.size };
}
