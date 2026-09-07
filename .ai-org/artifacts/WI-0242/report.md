# Compact continuity experiment — WI-0242

## Conclusion

**One of two approved subjects ran. The model completed its stable-requirement
task, but the instrument rejected equivalent short/full Git commit references.
The changed-specification subject did not run. The experiment is inconclusive.**

A separate, generation-free post-hoc check confirmed that the recorded short
reference resolves to the frozen baseline and that the same candidate passes
the 46-case product oracle and regression checks. This does not overwrite the
original rejection or make the second subject measured.

The current stable attempt used 62,917 Operational Tokens and 140.862 seconds.
It is descriptively cheaper than one older Temple attempt, but still about twice
the Tokens of the most recent ordinary-use reference. We cannot claim that
compact Temple beats ordinary usage, or that the instruction change caused any
historical difference. The automatic Learning Loop remains design-only.

## Actual execution

The frozen protocol used Terra medium, stable then changed-spec, at most 100,000
Operational Tokens/eight minutes each and 200,000/twenty minutes overall. It ran
once with no retry, fallback, reset, purchase, refill or additional judge subject.

| Condition | Model execution | Original acceptance | Product verification | Operational Tokens | Attempt elapsed |
| --- | --- | --- | --- | ---: | ---: |
| Stable | Completed; final usage observed; cleanup confirmed | Rejected: `delivery-record-invalid` | Not evaluated originally; separate post-hoc oracle/regression pass | 62,917 | 140.862 s |
| Changed specification | Not run after shared stop | Unmeasured | Unmeasured | — | — |

The first subject's original administration flag is true; that flag is not the
stricter delivery-record oracle. The sequence stopped as
`shared-validity-unconfirmed`. Neither the Token/time ceiling nor account
exhaustion caused this stop. The provider exited and background terminals were
empty. Batch elapsed was 141.223 seconds. Missing measurements are null, not zero.

## What failed, and what the post-hoc check means

The actor recorded `6a1ba6b` as both Work Item and claim `base_revision`. Git
uniquely resolves it to frozen baseline
`6a1ba6b71be2c922212a043ebe1b2f2c728d7a01`. The framework claim operation preserves
the supplied revision string. The actor contract requires a full candidate SHA,
which the actor supplied; it does not require full baseline spelling.

However, `deliveryRecords` in `scripts/continuity-fixture.mjs` compares each
baseline string directly with the checkpoint's full SHA. Those two string tests
reject the legitimate alias. Read-only diagnosis found the other delivery record,
receipt, identity, handoff, scope and ancestry checks satisfied. This is an
instrument/reference-contract mismatch, not evidence that the actor selected the
wrong commit. Passing 770 repository tests had not covered this legitimate CLI
output shape: our preflight coverage was insufficient.

The offline diagnostic first verified Git identity, then cloned the checkpoint
in memory and changed only its baseline spelling to the recorded short SHA. The
existing assessor and isolated oracle executed against the same candidate; no
framework source, actor record, frozen checkpoint, protocol or original run was
edited. All 46 product cases and regression checks passed. Original seals still
match. No model turn was generated for this check.

- Product candidate: `1d7a4126137a0f941f49317d316db36279ed35f4`.
- Final delivery/bookkeeping revision: `23ae1d786a0ed48a023abc55e193d98f62e3043c`.
- Original status remains rejected. Post-hoc acceptance is diagnostic evidence,
  not original protocol acceptance, a replacement subject or a second sample.

## Historical comparisons: descriptive only

These are condition-labeled retained references, not newly randomized concurrent
controls. Revisions, instruction contracts and runtime conditions differ between
studies; each row is a single attempt. Attempt time includes setup/cleanup and is
not automatically time to an accepted delivery.

| Stable condition | Operational Tokens | Attempt elapsed | Acceptance qualification |
| --- | ---: | ---: | --- |
| WI-0239 ordinary | 31,374 | 81.175 s | Originally accepted |
| WI-0236 ordinary | 19,272 | 136.612 s | Originally accepted |
| WI-0236 Temple | 75,433 | 354.890 s | Originally accepted under older contract |
| WI-0242 compact Temple | 62,917 | 140.862 s | Original record rejection; post-hoc product/regression pass |

- Versus WI-0239 ordinary: **2.005 times the Operational Tokens; 1.735 times
  the attempt elapsed time**. There is no measured ordinary-use efficiency win.
- Versus WI-0236 Temple: **16.6% fewer Operational Tokens and 60.3% less attempt
  time**, historical arithmetic only, not a causal improvement estimate.
- Earlier WI-0234 stable Temple observations were 64,673 and 83,393 Operational
  Tokens. The new observation is only 2.7% below that lower observation, so the
  older high-cost example must not be selected as the sole reference. WI-0234's
  first Temple row also failed its original strict acceptance despite product
  and administration success; do not pool these rows into a success-rate claim.
- WI-0239 previous Temple stopped at 101,176 observed Operational Tokens with
  incomplete final usage. It is censored, not a completed-delivery cost benchmark.
- No current changed-spec result exists. Older changed-spec results cannot prove
  that current compact instructions recover changed requirements correctly.

See retained [WI-0239 report](../WI-0239/report.md),
[WI-0236 report](../WI-0236/comparison-report.md) and
[WI-0234 measurements](../WI-0234/comparison-v2.json). None was rerun or rewritten.

## Usage and observability

| Stable-attempt measurement | Observed value |
| --- | ---: |
| Input Tokens | 521,089 |
| Cached input Tokens | 462,848 |
| Uncached input Tokens | 58,241 |
| Output Tokens | 4,676 |
| Operational Tokens: uncached input + output | 62,917 |
| Provider total Tokens: input + output | 525,765 |
| Reasoning output, already included in output | 895 |
| Setup / turn including cleanup | 0.827 s / 140.035 s |
| Completed command items / nonzero exits | 14 / 1 |
| Observed command-output bytes | 100,487 |

Cache coverage is 88.8%; uncached input still accounts for 92.6% of Operational
Tokens. Operational Tokens are the study's accounting measure, not an npm/API
invoice or total organization cost. Coordinator, preparation, report/review and
post-hoc diagnostic effort are outside candidate usage/elapsed measurements.

Twelve of fourteen commands and 96,689 output bytes are classified unknown.
That does not mean no reading or testing occurred, or that the output was waste.
We lack per-command Token attribution. Authored user/developer text was
2,107/624 bytes and output schema 678 bytes; native and total model-context size
remain unknown. Prompt bytes, output bytes and Tokens are different measures.

## Recommended next decision

1. Fix the instrument offline to compare verified commit identity, not spelling.
   Keep rejection of wrong, ambiguous or nonexistent references and all existing
   authority, receipt and product checks. Do not weaken acceptance to a prefix test.
2. Add generation-free contract cases produced through the real CLI: full SHA,
   unique short SHA, equivalent resolvable reference, wrong commit and invalid or
   ambiguous reference. Recheck the retained candidate separately, keeping the
   original score immutable. This closes a concrete blind spot, not a reason to
   enlarge the budget or generate another broad comparison.
3. After that repair and protocol review, consider only the still-missing
   changed-spec compact subject. Reuse this completed stable observation and
   compatible historical references with their provenance/limitations. Do not
   rerun every baseline or claim the post-hoc score was originally accepted.

These are recommendations, **not repairs or additional experiments performed in
WI-0242**. No new Learning automation, routing policy, merge, release or publication
is included. The approved run is sealed and stops here.

## Evidence

- [Exact authorization](authorization.md).
- [Allowlisted numeric export and seal](comparison.json).
- [Verification scope](verification.md).

Instrument candidate: `afb048d10a7c1554afa75b8121d733d753b0a49b`.
Execution revision: `2ef970b6d82d2f7aef4ea3067883f82b67323fc6`.
Protocol digest:
`sha256:3568e1f6ec0bf33665d0275661829a9c10c8a0ccde4b3f2fc4dfa453d2333dc2`.
Run digest:
`sha256:6b6fb0db1c0848be30d99432ed0106e642f0a613fda3a2f321b5945378ddb6be`.
Sealed at `2026-09-07T14:30:57.651Z`. Raw provider content and host coordinates
stay local; the checked-in export contains numeric results and provenance only.
