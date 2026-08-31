# Work order — WI-0070

## Purpose

Remove the intermittent timing assumption discovered during WI-0069 Independent QA. The provider-owned launch test currently calls `provider.stop()` immediately after the launch response and treats shutdown as proof that a later usage notification has already been durably recorded. That is not the protocol contract: `turn/start` acknowledges the turn, while `thread/tokenUsage/updated` is an independent asynchronous notification.

## Authorized scope

- establish an explicit event-driven wait for the exact durable usage observation before the test stops the provider;
- make the fake App Server deliver the notification asynchronously after the `turn/start` response so the test exercises the real ordering boundary;
- repeat the focused scenario under concurrency and run the full repository verification suite;
- change production code only if measurement proves that the provider loses an observation after Temple has received it.

No fixed sleep or polling loop may be used as passing evidence. A bounded timeout may fail a missing event, but only the journal subscription may satisfy the test.

## Overlap boundary

- `WI-0029` retains Agent Command behavior and its separate real-command validation boundary.
- `WI-0033` retains executable selection, approved origins, credential handles, and operator-owned provider trust.
- WI-0070 owns only the provider usage-notification test ordering described above.

## Baseline evidence

- WI-0069 Independent QA observed one missing usage record during a full concurrent suite, followed by an immediate focused pass and a final 246/246 pass.
- A fresh baseline ran the focused scenario 24 times with concurrency six and produced 24 passes. This confirms intermittency rather than proving the current assertion correct.
- Source inspection shows that `stop()` drains notifications already placed on Temple's internal queue; it cannot prove that the external process has emitted a future asynchronous notification before shutdown.

## Acceptance

1. The test subscribes before launch and waits for the exact `org.temple.codex.usage.updated.v1` record for the Work Item.
2. The fixture emits the reroute and usage notifications asynchronously after the `turn/start` response.
3. Repeated concurrent focused execution and `npm run verify` pass without a live provider call.
4. Command Gateway and operator-trust behavior remain byte-unchanged.
