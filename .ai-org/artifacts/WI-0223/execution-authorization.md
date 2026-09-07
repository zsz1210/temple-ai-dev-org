# Conditional execution authorization

The maintainer requested checking available allowance and directly approved starting after reviewing the WI-0223
proposal. This authorizes implementation/readiness and one new execution of that
design after the checks pass, within its unchanged envelope. It is not approval
to reuse an old consumed protocol or waive independent review. The coordinator
may bind this authorization to the final protocol only after verifying that the
frozen contents match this scope; any material expansion requires a new decision.

- Two families, eight deliveries, sixteen Builder/Verifier stages.
- Requested Terra medium throughout, no fallback or extra model judge.
- Aggregate 1,280,000 Operational Tokens and 96 minutes; six minutes per stage;
  80,000 Tokens is a stage warning only. Delayed usage can overshoot observed caps.
- Subscription allowance only, no purchase/refill/reset, no experiment retry.
- Preserve all existing stopping, privacy, isolation and evidence-sealing rules.
- No routing-default change, release or npm publication.

Account check at intake reported Pro, 28% of the weekly window consumed, zero
Credits balance and no rate-limit-reached flag. This is account-wide availability,
not a Token guarantee. The account API does not prove auto-refill configuration;
the executor must never purchase/refill and must stop on quota failure. Recheck
immediately before execution. No reset is authorized, regardless of availability.

Implementation and independent readiness remain required. The current design PR
is not executable evidence, and no live stage has started at this record's creation.
