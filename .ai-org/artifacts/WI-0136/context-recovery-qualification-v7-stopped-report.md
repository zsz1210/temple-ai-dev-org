# WI-0136 context-recovery qualification v7 stopped report

## Outcome

V7 stopped after its first condition because the routed-context treatment was not followed. The Terra medium candidate recovered the repository state correctly, but it read `TEMPLE.md` before running `context resolve`. The full-load condition was therefore not started, and v7 cannot support a routed-versus-full-load comparison.

- Protocol SHA-256: `5f20f1143394b4e0b6cc19d2a8736029ca4c54e361b93a04310556ec75d6f92d`
- Observed conditions: 1 of 2
- Completed candidate conditions: 1
- Objective recovery: passed
- Exact revisions: 4 of 4
- Completed slices: 3 of 3
- Operational Tokens: 73,381
- Gross Tokens: 1,321,381, including 1,248,000 cached input Tokens
- Turn elapsed time: 215,628 ms
- Retry and fallback: 0
- Preserved raw stopped record SHA-256: `d71defc370bfa7ca89a521eb7377a2d8f0a018ad95c0d418cc0ae8b30131a1ef`

The requested route was `gpt-5.6-terra` with medium reasoning. The thread reported high reasoning, while the effective per-turn effort was not reported. V7 is therefore also not evidence of an exact medium-effort execution.

## What the candidate demonstrated

The candidate named the exact Gateway, Catalog, Orders, and Notifications revisions; identified the `OrderPlaced/v2` contract; recovered all three required slice IDs; reported unresolved quality-evaluation work; and proposed a bounded next action. This is useful recovery evidence for that single candidate, but it does not isolate the context strategy.

## Why the treatment failed

The recorded command sequence was:

1. `temple-md`
2. `context-resolve`
3. `context-resolve`

The v7 prompt described a fresh recovery and asked the candidate to inspect all repositories before presenting the routed-context instruction. That ordering conflicted with the intended intervention and made a default `TEMPLE.md` read plausible. The observer correctly detected the sequence; this was a prompt-order defect, not missing telemetry.

## Interpretation boundary

V7 does not show that routed context is better, worse, or more expensive than full load. It has no full-load observation and its routed candidate did not receive the intended treatment. Its Token and timing values must not be combined with an earlier condition to manufacture an exact comparison.

## Corrective action

V8 classifies the task explicitly as a known bounded Work Item, places the condition-specific first action before all repository inspection, forbids a routed candidate from reading `TEMPLE.md` before `context resolve`, and adds regression checks for prompt order. V8 has a new digest and requires new exact approval before generation.
