# Technical design — WI-0070

## Diagnosis

The production provider serializes every notification that has reached `onNotification` through `notificationQueue`. `stop()` drains that queue before and after closing the process. The failing test nevertheless stops immediately after `launchProviderOwnedTask()` resolves. If the fake process's response line is delivered before its later notification lines, the first drain sees an empty queue and shutdown can terminate the fixture before those later lines reach Temple.

This is a test contract error, not evidence that Temple dropped a notification it had received. A `turn/start` response acknowledges a turn; it is not a usage-event barrier.

## Design

Add a test-local, subscription-first `waitForJournalRecord` helper:

1. subscribe to the telemetry journal;
2. check already retained records after subscribing, closing the subscribe/read race;
3. resolve only when the predicate matches a durably appended record;
4. use a bounded timeout only to fail a missing event and always unsubscribe.

The provider-owned fixture will send the `turn/start` response first and schedule `turn/started`, `model/rerouted`, and `thread/tokenUsage/updated` on the next event-loop turn. The test creates the exact usage-record wait before launch, awaits it after launch, and only then stops the provider.

No production source change is planned. If this event-driven test still exposes a received-but-undurable notification, Build must stop and return to Design rather than adding time delays.

## Verification

- focused test with deliberately asynchronous notification delivery;
- at least 48 repeated focused executions with concurrency eight;
- `npm run verify`;
- schema validation, Doctor, and diff checks;
- confirm `src/codex-app-server-provider.mjs` remains byte-identical to the base revision.

## Risk review

- **False green through time delay:** prevented because elapsed time and shutdown do not satisfy the promise; only the exact durable journal record does.
- **Subscribe/read race:** prevented by subscribing before checking retained records.
- **Listener leak:** every success and timeout path unsubscribes and clears its timer.
- **Scope collision:** production command and trust code remains unchanged; WI-0029 and WI-0033 ownership is preserved.
- **Live side effect:** all verification uses a fake local App Server and disposable repositories.
