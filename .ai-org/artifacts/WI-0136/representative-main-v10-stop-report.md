# Representative comparison v10 stop report

## Outcome

The exact-approved v10 run stopped fail closed during the first arm's parallel Build wave. It did not retry, use a fallback model, start the Temple arm, or run the blind evaluator.

- Protocol: `16591db95bde29d6becd273ce6df3cd39569f016ebdd03c5fd2fb2c21d9253e0`
- Started: `2026-09-03T17:45:55.994Z`
- Stopped: `2026-09-03T17:49:04.758Z`
- Candidate Operational Tokens: `77,224`
- Completed arms: `0`
- Retry count: `0`
- Fallback count: `0`

## Completed evidence

The minimal-responsible Design turn completed with `49,216` Operational Tokens and produced the rollout order and three non-overlapping Build slices. The three Build turns then started concurrently. All ten generated repositories were clean after sibling interruption and settlement.

## Stop condition

The orders-catalog Build turn reported an allowed repository discovery command while its Provider cwd used the canonical macOS `/private/tmp/...` spelling. The frozen arm root used the equivalent `/tmp/...` spelling. The v10 containment check compared normalized strings without resolving filesystem aliases, classified the cwd as outside the arm, and stopped the run with `command-cwd-outside-arm`.

The command display wrapper was not the rejection cause. `/tmp` resolving to `/private/tmp` was reproduced locally with `realpath`; the next protocol must canonicalize existing filesystem paths before applying containment and exact repository-root checks. This is a harness compatibility defect, not candidate product evidence.

## Disposition

Preserve this stopped run as negative harness evidence. Do not include it as a completed matched comparison and do not reuse its approval for a revised protocol.
