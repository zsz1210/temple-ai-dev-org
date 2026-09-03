# Product specification - WI-0135

## Question

After preserving the corrected product and acceptance contracts, does optimized native Lean Temple reduce operational Tokens and latency relative to a responsible conventional workflow when both use Terra medium?

## Accepted scope

The comparison contains two cases and two conditions per case:

1. `idempotent-command`: optimized Temple first, conventional second.
2. `compatible-event-evolution`: conventional first, optimized Temple second.

The alternating order limits, but does not eliminate, order effects. Every candidate receives the same product task and explicit acceptance contract for its case. Only the process context differs.

## Acceptance criteria

- Both conditions request `gpt-5.6-terra` with `medium` reasoning and acknowledge that model without rerouting.
- Every candidate begins in a clean isolated repository and may change only `src/` and `test/`.
- Public and coordinator-held objective tests remain the primary quality evidence.
- One fresh `gpt-5.6-terra` `high` evaluator sees only arm-neutral packages and frozen rubrics. Scores are frozen before mappings are unsealed.
- The protocol digest, fixture digests, executable Provider contract, approval envelope, model availability, limits, and no-network tool policy pass before generation.
- The report includes per-case results, aggregate quality, operational Tokens, latency, context size, limitations, decision classification, and concrete next actions.

## Decision contract

The optimized process is `promising-efficiency` only if both arms are objectively correct, its mean blind quality is no more than three points below the baseline, and it improves both aggregate operational Tokens and aggregate latency by at least 10%.

Any classification remains diagnostic. It cannot change routing policy, model defaults, or public product claims by itself.
