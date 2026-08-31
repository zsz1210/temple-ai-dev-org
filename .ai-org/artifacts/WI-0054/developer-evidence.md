# Developer evidence

Rikku prepared and ran the accepted one-shot Provider-owned proof against exact candidate `5de1ae88304d7c6d7876d28f2518c812f0443f65`.

## Result

- The real Provider reported ready before dispatch.
- `thread/start` was attempted exactly once and rejected after `2628 ms`.
- No thread, canonical task, turn, instruction delivery, Token observation, or interrupt followed.
- The zero-retry contract held.
- The repository remained clean across the attempt.
- The normal private-LAN read-only Dashboard was restarted successfully.

## Diagnosis

The installed App Server v2 JSON schema requires kebab-case `SandboxMode` values, including `read-only`. The bridge passed the internal camelCase value `readOnly` directly to `thread/start`. Existing mock tests encoded the same stale expectation and therefore did not catch the live protocol mismatch.

## Evidence

- `.ai-org/artifacts/WI-0054/runtime-observation.json`
- `.ai-org/artifacts/WI-0054/live-proof-result.md`
- `src/codex-app-server-provider.mjs:1193-1199`
- `test/control-plane-live.test.mjs:649-668`
- local `codex app-server generate-json-schema` output for `SandboxMode`

## Boundaries

- No source-code correction or retry is included in this Work Item.
- No model generation or detailed Token use was observed.
- No cost, savings, quality, routing, publication, deployment, or release claim is made.
