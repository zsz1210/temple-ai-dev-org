# Technical design — WI-0041

Introduce a client-side refresh coordinator around the existing snapshot loader:

- only one snapshot fetch may be in flight;
- any number of SSE notifications received during that fetch collapse into one pending follow-up;
- replay notifications received in the same task are debounced into one refresh;
- direct callers may still await `load()`;
- failure keeps the existing stale-state behavior.

The SSE protocol and server replay contract remain unchanged. The implementation stays dependency-free and is covered by a source-level regression contract plus the existing HTTP/SSE integration tests. Runtime evaluation uses a fresh Chromium session so an earlier exhausted session cannot supply false evidence.
