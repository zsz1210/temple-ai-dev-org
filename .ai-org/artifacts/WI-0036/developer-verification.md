# Developer verification — WI-0036

## Revision candidate

The candidate consists of the private-viewer request boundary, redacted projection, refresh-only SSE, Tailscale Serve launcher, tests, ADR, operations guide, and security guidance recorded by this Work Item.

## Automated evidence

```text
npm run verify
tests 211
pass 211
fail 0
duration_ms 41825.350333
```

Focused private-viewer coverage passed:

```text
node --test test/control-plane-private-viewer.test.mjs
tests 2
pass 2
fail 0
```

The focused tests prove exact private Host and identity classification, redacted HTML and snapshot output, missing Inbox and Agent Command surface, rejected remote POST, refresh-only SSE, unchanged full loopback projection, pinned Tailscale command construction, pre-existing Serve refusal, Funnel refusal, and cleanup behavior with a deterministic mock.

## Runtime evidence

The installed Tailscale CLI is `1.98.8`, the node is online, its private DNS name is `<PRIVATE_TAILNET_HOST>`, and its initial Serve configuration is empty. Tailscale requires the account owner to approve first-time Serve enablement at its authenticated control-plane page. Until that approval is completed, the real tailnet HTTPS URL and tablet rendering remain unverified.

## Remaining verification

- Complete the one-time Tailscale Serve enablement.
- Start Temple with `--codex --tailscale-viewer`.
- Verify the private HTTPS page, redacted snapshot, rejected mutation, refresh stream, and 420-pixel tablet layout against the live Mac mini.

The Work Item must remain in Test after Developer handoff until those real-network checks are recorded.
