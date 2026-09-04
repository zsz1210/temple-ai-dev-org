# WI-0140 independent QA

## Decision

Pass the bounded route-adherence implementation and generation-free protocol. This accepts the measurement mechanism and its safety envelope. It does not approve or report a live Context Capsule treatment effect.

## Independent checks

| Check | Result |
|---|---|
| Frozen protocol digest, source revision, and harness digest agree | Pass |
| Eight conditions retain matched repositories and matched same-strategy selections | Pass |
| Per-shape strategy order is reversed in repetition B | Pass |
| Retained WI-0139 diagnostic reproduces exactly | Pass: 136,851 Operational Tokens; +6.38% Tokens and +8.01% latency for the completed stage-aware multi-repository arm |
| Single-repository limit is mechanically derived from retained censoring | Pass: 40,460 lower bound to 51,000 hard ceiling |
| Absolute, traversal, oversized, and symlink-escaped paths cannot become adherence | Pass |
| Failed commands, unknown paths, ambiguous output, and overflow fail closed | Pass |
| Raw commands, output, prompts, responses, reasoning, credentials, and temporary roots are absent | Pass |
| Focused route-adherence tests | Pass: 8/8 |
| Frozen lab inspection | Pass: 30/30 |
| Generation-free readiness | Pass: 52/52 |
| First full repository verification | Pass: 408/408 |
| WI-0139 artifact subtree against `1461cf6` | Pass: no tracked or working-tree diff |
| Preapproval state | Pass: `exact-approval` is the only blocker; zero candidate generation |

## Full-suite flake observed during Independent QA

A second full-suite run completed 407 of 408 tests. The only failure was the pre-existing optional Console refresh-signal test, which rewrites identical bytes and waits two seconds for a filesystem notification. The same test passed alone immediately afterward, receiving the event in 765ms. The route-adherence tests, frozen lab inspection, and predecessor-integrity checks passed in that run.

This is retained as a non-blocking test-reliability observation rather than hidden or misclassified as a WI-0140 product failure. The current Work Item did not modify the Console server or its tests. A future test-infrastructure slice should make the fixture perform a real canonical change and remove its dependence on scheduler contention.

## Independence

The Developer is Rikku (`agent-rikku`). Independent QA is Lulu (`agent-lulu`). They are distinct Agent Identities.

## Remaining boundary

The frozen eight-turn live comparison has not run. The approval template is intentionally negative, no approval record exists, and no Provider candidate turn was started. Live evidence must be authorized and evaluated as a separate account-impacting slice.

