# WI-0140 generation-free quality evaluation

## Decision

Pass the route-adherence measurement implementation and the generation-free successor protocol. This evaluates the measurement contract and safety boundaries only. It does not claim that stage-aware context improves Tokens, latency, or correctness.

## Acceptance review

| Requirement | Result | Evidence |
|---|---|---|
| Retain bounded path-only acquisition facts | Pass | entries contain only repository ID, relative path, access kind, classification, and optional byte count |
| Exclude raw or sensitive content | Pass | adversarial assertions reject command and output text retention |
| Keep unsafe paths from becoming adherence | Pass | absolute paths, traversal, symlink escape, and oversized paths become unknown |
| Keep failed and ambiguous activity honest | Pass | failed commands are excluded; multi-action output bytes remain null |
| Expose incomplete observation | Pass | unknown and overflow counts make coverage incomplete and adherence fail-closed |
| Reproduce prior evidence | Pass | WI-0139's 136,851-Token result, 6.38% Token regression, 8.01% latency regression, and two censored single-repository conditions reproduce |
| Remove the known ceiling confounder | Pass for protocol design | the new 51,000 ceiling is derived mechanically from the retained 40,460 lower bound plus the declared headroom rule |
| Reduce obvious order dependence | Pass for protocol design | two matched repetitions reverse strategy order per project shape |
| Preserve predecessor evidence | Pass | WI-0139 remains unchanged from commit `1461cf6`, and preflight rechecks it |
| Require separate account authorization | Pass | preflight's only blocker is `exact-approval` |

## Counterexamples

- Changing one repetition's measured source bytes invalidates the protocol even after recomputing its digest.
- Changing one per-condition Token limit invalidates the protocol even after recomputing its digest.
- An in-repository off-route read is visible and prevents adherence from passing.
- An absolute, traversing, oversized, or symlink-escaped path cannot become a compliant path record.
- More than 64 actions increments overflow and makes coverage incomplete.

## Verification

- Focused test: 8 passed, 0 failed.
- Frozen lab inspection: 30 checks passed, 0 failed.
- Generation-free readiness: 52 checks passed, 0 failed.
- Repository suite inherited from the exact harness candidate: 408 passed, 0 failed.
- Candidate turns, evaluator turns, Operational Tokens, retries, and fallback during preparation: all zero.

## Remaining validity boundary

The eight-turn live run is not part of this evaluation and has not started. Two repetitions are diagnostic rather than statistical evidence. Effective per-turn reasoning effort remains unavailable and must not be inferred from thread configuration. A later live experiment requires a new Work Item or an explicitly approved continuation bound to the exact frozen protocol.

