# WI-0231: offline continuity instrument

Implement the [reviewed design](../WI-0230/design.md) as offline reusable fixture
and oracle functions with integration tests. The maintainer authorized continuing
the next implementation step; no live dispatch, account action, policy mutation,
release or administrator merge is included. Source is based on reviewed PR #74.

Synthetic product contract: quote(subtotalCents, discountCents) takes two integers
from 0 through 1,000,000,000, with discount at most subtotal; invalid values throw
TypeError. Preserve the completed discount.mjs function. Return exactly subtotalCents,
discountedCents, shippingCents and totalCents. Apply discount before deciding shipping;
zero discounted value ships free, otherwise shipping is 500 unless discounted value
is at least the inclusive current threshold. State A uses 3000, State B changes a
previously implemented v1 threshold of 3000 to v2 threshold 5000. These numbers are
synthetic boundary-test inputs, not real business requirements or budget limits.

State A has a tested discount module and unfinished quote integration. State B has
the same completed discount module plus a valid old quote implementation and an
explicit new spec; its remaining work is the v2 update. Preserve genuine historical
test outcomes and exact revisions. This concretizes the proposed partial-work states;
it does not pretend that their remaining source bytes are identical across A and B.
Within each state ordinary and Temple product/history/fact inputs must be identical.

Create fixtures exclusively in caller-owned fresh scratch directories. Use ordinary
Git history and normal CLI initialization/lifecycle for the synthetic Temple arm;
do not hand-edit Work Item JSON. No model process is created. Actor checkouts contain
public tests and facts, never the coordinator reference implementation or oracle.
Keep checksums and expected answers outside the actor roots.

The oracle reads the exact committed candidate, enforces ancestor/current/clean
product boundaries, preserves baseline files except named editable paths, and
checks behavior through a bounded isolated scratch subprocess with coordinator-side
expected results. Isolation here is filesystem separation and process cleanup, not
a proven hostile-code sandbox. A real live adapter must still enforce its OS/process/
network constraints, neutral fact manifest, privacy/usage and frozen launch contract.
No offline report may label that unimplemented adapter live-ready.

Acceptance: correct completions pass both arms/states; stale threshold, damaged
discount, replaced public tests, unauthorized paths, dirty product and wrong revision
reject; cold fixtures and coordinator expected values remain separated; historical
observations are real; successful/failed oracle subprocesses clean their own scratch.
Run focused new tests, existing revision/first-stop/usage/cleanup replay coverage,
and full verification at the final candidate. Use Standard Test/Eval/Independent QA
with a reviewer distinct from Developer. Report observed results and remaining
launch prerequisites; no Token or effectiveness claim follows.

Risk: a broken instrument could manufacture a winner. Mitigate through symmetric
negative controls, byte-bound source/scope, independent review and no automatic
launch. Keep existing experiment code and historical evidence unchanged. Rollback
withdraws these repository-only scripts/tests; preserve reports. No UI applies.
