# Work order — WI-0041

## Problem

The live loopback Dashboard opens an SSE connection without a cursor. The server correctly replays retained events, but the browser currently calls the snapshot endpoint once for every replayed record. A sufficiently large journal therefore creates hundreds or thousands of concurrent requests and Chromium eventually reports `ERR_INSUFFICIENT_RESOURCES`.

## Authorized slice

- Coalesce replay-triggered refresh requests in the Dashboard client.
- Preserve an immediate initial snapshot load and later live refresh behavior.
- Add a deterministic regression contract.
- Re-run runtime visual review at desktop and 420px widths.

No server protocol, Agent Command behavior, private-viewer authority, release action, external write, model routing, or Token claim is authorized.

## Stop condition

Stop after the corrected candidate is independently reproduced and WI-0040 can resume its usage-panel evaluation.
