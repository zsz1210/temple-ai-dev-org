# Diagnostic format comparison: design, not an executed experiment

Status: design complete; fixture implementation, protocol freeze and live approval
remain outstanding. Base: merged PR70, `29a7439e3bd4ab06d1643056e0893ccc49a70635`.
Owner: Tech Lead (agent-tidus). Integration: Engineering Manager (agent-mog).

## Decision this experiment can support

Determine whether the Full/Model representation signal repeats across two bounded
task families without a worse observed acceptance outcome, and identify observable
repair/read patterns worth investigating. Both arms use Temple. This cannot prove
Temple outperforms ordinary Codex, select a different model, or justify a default
change. An ordinary-Codex comparison is a separate later intervention.

WI-0220 completed four deliveries: Full averaged 117,715.5 Operational Tokens and
253.484 actor seconds; Model averaged 107,737 and 242.156. Final acceptance was
2/2 for each format. Full Builder test exit sequences were [0], [0]; Model's were
[1,0], [1,1,0]. These three nonzero commands cannot retrospectively be classified
from the retained exit codes. Preserve the old sealed evidence unchanged.

## Matched design

| Family | Task contract | Frozen delivery order |
| --- | --- | --- |
| A: replication | Existing shipping-quote fixture and its acceptance/oracle, unchanged | Full, Model, Model, Full |
| B: maintenance | Repair a seeded shipping-quote compatibility regression in an existing implementation; retain valid API behavior and add regression coverage | Model, Full, Full, Model |

Eight fresh isolated repositories, one Builder and a fresh distinct-Identity
Verifier per delivery: sixteen sequential stages. Within each family, both formats
receive identical task, starting tree, tools, permissions, source bodies, bootstrap,
acceptance and hidden oracle. Only the explicit format changes. Same requested
Terra medium route as WI-0220; acknowledge installed model and record actual exposed
effort fields. Do not infer effective turn effort from thread settings.

Family B is not yet an executable fixture. Before freeze specify the exact seeded
regression, compatibility examples, expected API errors and hidden boundary cases.
The broken seed must fail a named oracle check and a minimal reference repair must
pass the entire oracle. Neither reference repair nor hidden checks may enter actor
context. Family B remains a small single-repository maintenance task, not evidence
about enterprise scale or microservices. Report families separately, not as equal
complexity. Use fresh sessions, identical global instructions and matched tool maps.

Do not adapt order, prompts, limits or fixtures after seeing live outcomes. Format
orders balance first/second exposure within each family; sequential execution does
not eliminate provider load, stochastic generation or uncontrolled-cache effects.

## Measurements and honest interpretation

| Question | Measurement | What it does not establish |
| --- | --- | --- |
| Was delivery accepted? | Product tests, hidden oracle, exact candidate, independent Verifier and lifecycle checks | General production quality or security |
| What did it consume? | Input, cached input, output, total and Operational Tokens per stage and delivery | Credits, billing, or per-command Token attribution |
| How long did it take? | Actor duration, harness duration and end-to-end duration separately | Decode throughput |
| Were corrections observed? | Test exit sequence, count of nonzero commands and later passing commands | Implementation defect versus bad test versus environment cause |
| Did the same named failure recur? | Within-stage keyed test IDs, allowlisted error class and recognition status | Stable identity after renaming or equivalence across stages/runs |
| Did inputs differ? | Compare complete fingerprints after consecutive test commands; separately report before/after each command | Atomic inputs throughout execution or causal explanation |
| Were source bodies repeated? | Whole-output-matched first/repeated/changed source events within each stage | Waste, unnecessary Verifier reading, or comprehension |

Operational Tokens = input - cached input + output. Cached Tokens are not asserted
free. Always show raw components and total Tokens alongside this derived measure.
Use per-stage identifiers only: keys reset between observers, so never join hashed
IDs across actors or deliveries. Unknown, partial, unsupported and over-limit data
are explicit categories, never zeros. Publish coverage denominators (all observed
test commands and all eligible read commands), not just recognized events.

The current snapshot covers only the fixed fixture source/test/package paths.
Family B must stay within that declared coverage or first add a bounded, reviewed
manifest; never claim complete input coverage from a partial snapshot. Source
exposure counters cover literal whole cat and emitted context bodies, not arbitrary
searches, ranges or all prompt content. A fresh Verifier's first read is not a
Builder duplicate. Changes between test commands and changes during one command
must be reported as different observations.

## Analysis fixed before execution

Report every attempted stage, failures and stop reasons. For each family display
both adjacent matched pairs, each arm's two individual deliveries, mean/median,
range, first-pass test results and final accepted fraction. Pair 1 is deliveries
1/2 and pair 2 is 3/4, with format direction normalized. Compute relative differences
against Full; mark zero denominators undefined. Retain failed attempts in the cost
table; do not produce a success-only headline or impute missing stages. Do not pool
WI-0220 into these samples because the instrument changed.

No p-values, significance, optimal routing or guaranteed percentage saving from
two deliveries per format per family. A repeated direction across all four pairs
is a replication signal, not statistical qualification. Any worse acceptance or
authority outcome prevents an efficiency recommendation. Mixed directions mean
task-sensitive/inconclusive. Equal quality with lower Tokens but longer time is a
tradeoff, not a combined win. Practical adoption thresholds remain a later product
decision; this diagnostic study cannot auto-promote Model to the default.

If recurrence appears with unchanged covered inputs, inspect a bounded cause next;
do not automatically alter prompts. If same-content reads recur, separate required
authority refresh and verification from unexplained repetition before proposing a
read-reuse intervention. If measurement coverage is poor, fix the instrument rather
than interpret missingness as absence. Implement at most one evidence-supported
intervention in a later comparison, holding task/model/acceptance fixed.

## Resource proposal, not spending authorization

WI-0220 used 450,905 Operational Tokens and 16.56 minutes for four deliveries;
the maximum observed stage was 68,286 Tokens. Linear scaling to eight deliveries
is 901,810 Tokens and approximately 33.11 minutes. This is a planning extrapolation
from one task, not a forecast or coverage guarantee for Family B.

Proposed envelope: 1,280,000 aggregate Operational Tokens, 96 minutes aggregate,
6 minutes per stage, 80,000 Tokens per-stage warning (not a per-stage hard stop).
These are exactly twice the preceding approved aggregate envelope for twice the
stages, with unchanged stage controls: an inherited operational allowance, not an
empirically optimal budget or confidence bound. The Token ceiling is about 41.9%
above the linear baseline estimate. Provider usage is delayed, so a hard stop based
on observed totals cannot guarantee zero overshoot. Report this explicitly.

No purchases, automatic refill, reset, retries, fallback or extra model judge.
Recheck subscription/provider availability and freeze exact protocol/source hashes
before requesting live approval. Existing consumed approvals cannot authorize this
new design. Keep work local until then; no thread/turn generation in readiness.

## Readiness and stop conditions

1. Implement a new versioned scenario-aware instrument instead of editing an old
   frozen protocol. Reuse existing command guards, observer and sealing code.
2. Prove both families' starting/reference oracle behavior, hidden-test isolation,
   identical Full/Model task material, truthful whole-source reuse, fresh Verifier
   separation, and complete scoped snapshot coverage with deterministic local tests.
3. Test the sixteen-stage schedule and limits with a fake provider: exactly one
   attempt each, first fatal failure stops, usage missingness is explicit, evidence
   is persisted/sealed on failure, no stage after stop and no unsafe writes.
4. Exercise actual installed provider schema and sandbox via generation-free probes;
   require independent exact-candidate review, full repository verify and clean
   readiness. Report any required installation/authentication separately.
5. Freeze source, fixtures, request digests, provider contract, analysis, order and
   numeric envelope; then obtain approval bound to that protocol.

On source/provider drift, rejected command, missing required usage, fatal stage
failure, quality/lifecycle failure, authority violation or observed aggregate/time
limit: stop safely, retain partial evidence, do not retry or silently change route.
Unsupported optional diagnostic records alone are not an execution failure: retain
them and downgrade diagnostic conclusions. End after the authorized sixteen stages
or first stop condition. Do not add samples to rescue a desired result.

## Delivery boundary

WI-0223 produces this design and a design-stage handoff only. It does not claim
Build, experiment readiness, live results or implementation acceptance. The next
authorized local slice is fixture/instrument implementation and offline validation;
the live generation gate stays closed until its frozen protocol is approved.
