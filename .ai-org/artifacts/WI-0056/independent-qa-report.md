# Independent QA report — WI-0056

## Decision

`pass` for exact candidate `ca33afdc038584a105a801fe7da6eb4f912dd1fa`.

Independent QA was performed as Lulu, distinct from Developer Rikku. No new Provider thread or turn was created.

## Independent reproduction

- Created a second fresh detached worktree at the exact candidate.
- `npm run verify`: 229 passed, 0 failed.
- Regenerated the installed App Server schemas independently.
- `ThreadStartParams` SHA-256 matched `792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd`.
- `TurnStartParams` SHA-256 matched `a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea`.
- A fresh no-generation App Server connection found the target turn `completed`, one Agent message, one exact marker, no non-exact marker-containing message, and the thread in `thread/list`.
- The local archive independently matched SHA-256 `af32cd123e67beb0b0c0b128cc00306f13c128978c3e6e76cdf15eaae9d93da1`.
- The archive contained 4,938 records, 12 records correlated to the target thread, 23,433 total Tokens, terminal `completed`, and no retained exact instruction text.
- Four non-increasing adjacent cursor pairs independently reproduced the disclosed journal race.
- The home-LAN Dashboard returned a private read-only snapshot, exposed no mutations, and reported the Codex Provider `ready`.
- The detached worktree was removed after verification.

## Acceptance and truthfulness

The one-thread, one-turn, zero-retry proof; exact fixed output; canonical correlation; detailed Token observation; repository read-only boundary; and Dashboard restoration are all supported by current evidence.

The 20,000 threshold remains a reactive signal, not a hard cap. Independent QA does not infer interrupt acceptance, effective model version, service tier, price, savings, routing superiority, or large-scale reliability.

## Residual defect

Concurrent Provider notifications can assign duplicate journal cursors. The preserved archive proves the defect and the built-in rebuild restored operation, but the ingestion race requires a separate corrected candidate and regression test. This defect does not change WI-0056's bounded question or justify repeating its live model turn.

## Recommendation

Advance WI-0056 to Release Gate as an organizational closeout only. Do not publish or release Temple, and create a separate Work Item for telemetry append serialization before relying on bursty live ingestion.
