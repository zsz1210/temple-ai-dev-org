# WI-0228: retained reliability acceptance

## Approved boundary

On 2026-09-07 the maintainer approved separating the withdrawn Lean prototype
from retained offline evaluation reliability and continuing acceptance review.
[WI-0226 disposition](../WI-0226/disposition.md) cancels the combined request
without claiming its original acceptance was met. This successor covers only
existing reliability code; no implementation, new API, model run, permission,
dependency, integration, release or efficiency claim is added.

## Candidate and design

Adopt for review the existing Developer candidate
`5aca59ce9058877576c4d06542680fc5f71984b1`, authored under `agent-rikku`.
The three scripts and corresponding tests named below are unchanged in the
current branch. This is a separately scoped acceptance of that candidate, not
a claim that development happened again. Retain the original
[design and limits](../WI-0226/implementation.md),
[Developer evidence](../WI-0226/report.md) and
[bounded Test/Eval](../WI-0226/qa.md) by reference.

| Surface | Required acceptance |
| --- | --- |
| `scripts/delivery-command-policy.mjs`, `test/delivery-command-policy.test.mjs` | Documented bounded read revisions work with real Git; lifecycle revisions stay exact; rejection metadata excludes operands. |
| `scripts/delivery-control-pair.mjs`, `test/delivery-control-pair.test.mjs` | First-stop reason and event remain correlated across trailing completion; privacy sentinels never enter persisted diagnostics. Observation is not execution prevention. |
| `scripts/evaluation-sequence.mjs`, `test/evaluation-sequence.test.mjs` | Preserve observed failed-stage cost and unknown usage; skip dependent verification; require explicit continuation and confirmed isolation; stop globally on uncertainty or limits; no retries or replacement samples. |

## Review and risk

The main risk is accepting more than the retained subset. Independent QA must
be `agent-lulu`, distinct from Developer, and bind this scope to the six unchanged
files. Reuse the recent 61/61 replay and exact-candidate full 696/696 evidence,
plus integrated 698/698 where applicable; do not repeat the whole suite merely
because the Work Item ID changed. New behavioral findings require targeted
reproduction and rework, not a fabricated pass.

The sequence is only an offline-qualified helper. Caller isolation, persistence,
protocol binding and real provider behavior still need separate qualification.
Historical protocols and sealed runs are not resumed or changed. Counts are
known observation subtotals, not final account billing. No Token, speed, quality
or general Temple-efficiency improvement is demonstrated by this acceptance.

No user-facing interface is changed. Work is sequential. Write scope is this
successor's evidence and supported lifecycle records, not any shared source.
Stop at Release Gate after Test, Eval and Independent QA. Repository integration
and publication remain separate decisions. Before any future integration,
rollback means reverting only the retained reliability changes in a reviewed
follow-up change; it must not delete evidence or restore the withdrawn prototype.
