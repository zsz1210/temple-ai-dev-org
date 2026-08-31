# WI-0074 control-plane CI race repair

## Observed failures

Hosted run `33410153285` reached the full behavior suite after repository checks, schema validation, and Doctor passed.

1. `control-plane-live.test.mjs` waited a fixed 50 ms, observed the later approval request, and asserted the earlier plan and diff records before their asynchronous journal writes had completed.
2. `control-plane-private-viewer.test.mjs` returned while its control-plane repository poller was still active. Fixture cleanup raced a Git read and failed with `ENOTEMPTY` under `.git/info`; the surviving server/process handles then kept the test job alive until cancellation.

## Approved design

- Use the existing `waitForJournalRecord` helper to await the exact normalized plan and diff events. Do not increase arbitrary sleeps.
- Explicitly close the private-viewer control plane before the test returns; retain the existing `context.after` close as failure-path protection because `close()` is idempotent.
- Change tests only. Do not alter production timing, privacy behavior, assertions, workflow topology, or the ten-minute CI limit.
- Run each affected file repeatedly, then run the complete local suite and hosted CI.

## Overlap

WI-0029 also declares `test/control-plane-live.test.mjs`. This Work Item changes only test synchronization and does not alter Agent Command Gateway behavior or production sources.
