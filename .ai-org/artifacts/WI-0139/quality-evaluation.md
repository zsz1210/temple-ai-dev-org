# WI-0139 generation-free quality evaluation

## Decision

The repaired evaluator and frozen protocol are ready for one explicitly approved live comparison. No live comparison has run, and this record does not evaluate the effectiveness of stage-aware context.

## Acceptance review

| Requirement | Result | Evidence |
|---|---|---|
| Score canonical facts instead of prose | Pass | typed output fields and deterministic semantic validator |
| Keep strict validation outside unsupported Provider schema keywords | Pass | malformed IDs, revisions, counts, paths, and lists fail locally |
| Prevent answer leakage | Pass | both schemas reject `const`, `enum`, `default`, and `examples`; prompts omit frozen values |
| Reproduce known WI-0138 false negatives without rescoring history | Pass | both test-status variants become 18/0; both contract descriptions yield `OrderPlaced/v2` |
| Hold model and configured effort constant before generation | Pass | ephemeral thread acknowledgement reports Terra / medium |
| Avoid claiming unobserved effective effort | Pass | effective per-turn effort remains null and the protocol labels only requested-and-configured state |
| Preserve WI-0138 | Pass | no diff from `b766d67`; historical result unchanged |
| Require a new exact approval | Pass | preflight's only blocker is `exact-approval` |

## Why this fixes the previous failure

The candidate no longer decides how a scored fact is phrased. It returns `public_tests_passed: 18` and `contract_id: OrderPlaced/v2`. Punctuation and explanatory prose are absent from those fields, while an incorrect count or identifier still fails exact comparison.

## Remaining validity limits

- One candidate per condition is diagnostic, not statistical evidence.
- Thread configuration confirms the requested reasoning setting, but the installed Provider does not expose effective per-turn execution effort.
- Passing rehearsal proves evaluator and protocol readiness, not the treatment effect.
- The real result must still report single-repository and multi-repository outcomes separately.

## Live gate

Protocol `ef5c9608f83fb7a70793f64d400f0c2434a8c1f1ccf8f37a7cbea9dc665ea81b` permits four sequential Terra medium candidate turns, zero evaluator turns, zero retries, zero fallback, at most 240,000 Operational Tokens and 40 minutes. It forbids Credits purchase, automatic refill, reset use, external writes, release, and publication. A matching affirmative WI-0139 approval is still required.

