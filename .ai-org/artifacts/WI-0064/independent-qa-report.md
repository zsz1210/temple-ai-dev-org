# Independent QA report — WI-0064

- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Exact tested revision: `6bdcf18173a80f7bf314f20b44fa71f33a7628c0`
- Environment: clean detached Git worktree

## Verdict

Pass for evidence integrity and fail-closed behavior; no-go for the WI-0064 strict live gate.

Independent QA installed dependencies offline with scripts disabled, reran 234/234 tests, and obtained a healthy Doctor result with one non-blocking stale generated-plan warning. The synthetic repository independently passes 5/5 with Doctor 36/36.

The effective-model correction is proven against the live Provider: `gpt-5.6-luna`, service tier `priority`, exact canonical identity, terminal completion, 23,265 detailed Tokens, no reroute, no retry, and no product-file mutation. The corrected `thread/read` with `includeTurns: true` finds the expected response.

The strict gate still fails because the protocol exposes `xhigh` only as the thread acknowledgement and no effective turn-effort acknowledgement after the requested `max` override. Independent QA rejects both possible false claims: that the turn definitely ran `xhigh`, and that the turn definitely ran `max`.

The four-repository rehearsal must remain blocked until reasoning provenance is represented honestly and the separately identified large-run harness and cross-repository reporting gaps are addressed.
