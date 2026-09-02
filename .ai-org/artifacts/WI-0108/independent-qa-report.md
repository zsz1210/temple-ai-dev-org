# WI-0108 Independent QA report

## Verdict

**Pass for truthful fail-closed behavior and the post-stop correction; no-go for Wave 5A mechanism qualification.**

Independent QA used a second fresh detached worktree at exact candidate revision `1211d700717417f5a585cd9f488ea09000ffd1d0`. The Developer identity is Rikku (`agent-rikku`); Independent QA is Lulu (`agent-lulu`).

## Reproduced evidence

- The WI-0108 no-generation preflight passes without starting a model turn.
- The exact `ItemStartedNotification` schema digest matches the installed Codex CLI.
- The structured command-action policy accepts the recorded wrapped `sed` shape and rejects a `curl` action.
- Full repository verification passes 280/280 tests.
- The retained program state and event ledger agree on one launch attempt, zero completed candidates, 24,456 observed Tokens, and `command-policy-violation`.
- All four candidates are clean and unchanged; no blind package exists.
- No retry, fallback, external write, deployment, release, or publication occurred.

## Boundary

This validates the evidence trail and the safety correction only. It does not validate a completed candidate, the four-turn harness, a Temple/minimal comparison, causal savings, model routing, account billing, or Credit consumption. WI-0108 has consumed its one permitted first-candidate attempt and cannot be rerun.
