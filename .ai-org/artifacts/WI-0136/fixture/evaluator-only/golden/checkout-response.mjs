export function toCheckoutResponse({ order, event }) {
  return {
    orderId: order.id,
    status: "accepted",
    eventVersion: event.version
  };
}
