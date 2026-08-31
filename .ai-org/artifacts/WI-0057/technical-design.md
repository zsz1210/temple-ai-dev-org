# Technical design: ordered telemetry mutation queue

## Design

Keep the existing process-level lease as the inter-instance writer boundary. Inside one opened journal, add a promise-tail mutation queue:

1. Each accepted append synchronously joins the current tail.
2. Its identity lookup, cursor allocation, durable append, in-memory update, compaction, checkpoint, and listener notification execute as one ordered operation.
3. The public append promise still receives its own success or failure.
4. A rejected operation is absorbed only by the private queue tail so later operations continue; its caller still sees the rejection.
5. Close synchronously stops admission, waits for the settled queue tail, clears listeners, and writes the final checkpoint.

Read-only journal behavior stays unchanged. In-memory read methods expose only fully committed records.

## Regression design

Use `Promise.all` to start a bounded burst before any durable append can finish. Assert consecutive cursors, ordered records, one-record duplicate behavior, successful read-only reopen, and explicit append rejection after close. The test must fail deterministically on the pre-fix implementation.

## Recovery boundary

The immutable WI-0056 archive remains the evidence for the original failure. This candidate prevents recurrence; it does not rewrite or normalize old cursors.

