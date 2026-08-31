# Product specification — WI-0070

## User-visible truth

A successful provider-owned launch means the App Server accepted and identified the turn. It does not mean that later Token usage has already arrived. Temple may display or evaluate detailed usage only after the corresponding durable telemetry record exists; missing usage remains unknown.

## Event-ordering contract

1. Temple registers the provider-owned task before sending `turn/start`.
2. The `turn/start` response and later Provider notifications are separate protocol messages.
3. Tests that require a notification must subscribe to the telemetry journal before the triggering operation and await the exact matching durable record.
4. `provider.stop()` drains Temple notifications already received by the transport, but it is not an acknowledgement that the external Provider has emitted all future notifications.
5. A bounded timeout may report a missing observation as failure. Time passing, polling, or shutdown alone cannot satisfy the expectation.

## Acceptance scenarios

- A fake App Server returns `turn/start`, then asynchronously emits `turn/started`, `model/rerouted`, and `thread/tokenUsage/updated`; the test waits for and verifies the exact correlated usage record before shutdown.
- If the usage event never arrives, the bounded event wait fails explicitly.
- Repeated concurrent focused runs and the complete repository suite pass without changing Agent Commands, provider trust, or live-provider behavior.

## Exclusions

No live Codex turn, provider retry, fixed-delay workaround, Dashboard change, command mutation, credential change, origin policy, executable policy, deployment, publication, or release is included.
