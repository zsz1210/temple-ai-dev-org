# WI-0226 — bounded reliability Test and Eval

## Authority and candidate

Reviewer: `quality_evaluator` / `agent-lulu`, Principal `human`; Developer:
`agent-rikku`. The 2026-09-07 follow-up authorizes qualification of the retained
evaluation-reliability subset and Test → Eval only. It does not replace the
original acceptance criteria, authorize Independent QA, or permit a live run.

Exact candidate: `5aca59ce9058877576c4d06542680fc5f71984b1`.
Review checkout: `e88fc87dca33209389327687adb4fdbda4629355`, branch
`codex/small-task-lean-design`, Node.js `v24.20.0`.

The three retained scripts and corresponding tests are byte-identical to the
candidate: `delivery-command-policy`, `delivery-control-pair`, and
`evaluation-sequence`. Since that candidate, the only changes under source,
scripts, tests and distribution are WI-0227's distributed TEMPLE and new
operating-contract test. Baseline `1b62e5e5` → candidate comparison confirms
the withdrawn prototype leaves no source, distributed Skill, documentation,
package.json or package-check change. No source or test was edited in this review.
Existing recorded overlap resolutions remain intact; the reviewer writes only
WI-0226 evidence and its supported sequential lifecycle records, not shared code.

## Test — retained subset passed

Independently executed:

```text
node --test test/delivery-command-policy.test.mjs test/delivery-control-pair.test.mjs test/evaluation-sequence.test.mjs
61 tests; 61 passed; 0 failed, cancelled, skipped or todo
duration_ms: 78346.2855
```

These are generation-free tests using disposable Git/product fixtures and an
injected provider. They include actual local Builder/Verifier lifecycle commands,
not live model turns. Full-suite evidence is reused explicitly, not claimed as
independently rerun: [Developer report](report.md) records candidate 696/696,
zero failure/skip/cancel, 171302 ms; the later integrated candidate
`f706239624b3fe9748767ea58128ebf5a2b587ea` records 698/698, zero
failure/skip/cancel, 172370 ms in [WI-0227 report](../WI-0227/report.md).
The retained six-file equivalence supports reuse for this subset. Full verification
includes disposable initialization and ordinary lifecycle coverage; focused
checks alone are not represented as the full gate.

## Eval — reliability qualified; original efficiency acceptance not met

| Retained behavior | Reviewed mechanism and reproduced evidence |
| --- | --- |
| Bounded read revisions without weaker lifecycle binding | `scripts/delivery-command-policy.mjs:182` recognizes documented SHA prefixes and bounded HEAD ancestors. Real Git resolves accepted forms; named refs/ranges/unbounded ancestry are rejected, while lifecycle claim tests reject abbreviated candidates. |
| Private, useful rejection diagnostics | Classification retains fixed revision category and argument index, not operands. `scripts/delivery-control-pair.mjs:299` preserves the first stop and its hashed item/event correlation. The injected observer retains that rejection across a trailing command completion with exit code 0; serialized output excludes the secret sentinel. |
| Failed stages remain measured | `scripts/evaluation-sequence.mjs:73` classifies incomplete runtime before usage persistence and budget/deadline exits. Known failed-stage costs remain in the subtotal; missing usage or incomplete runtime marks usage incomplete. Both conjunction regressions retain invalid status, original diagnostic and known tokens, with no later assessment/dispatch. |
| Continuation is conditional, not whole-batch erasure | Failed builds produce dependency-skipped verification. Product failure or subject-local invalidity continues only under the explicit selected policy, with confirmed isolation/cleanup and the appropriate validity assertions. No retries or replacement samples occur. |
| Shared uncertainty stops globally | Source drift, unconfirmed isolation/cleanup, missing usage, runtime/protocol stops, malformed assessments and exhausted limits stop later dispatch. Persistence failure throws and does not dispatch another actor. Seeded-stop tests preserve available failure evidence. |

No concrete P1/P2 blocker was found in this retained, offline-qualified subset.
This is bounded Test/Eval judgment, not an Independent QA pass.

Important limits remain: command observation plus interruption is not prevention
of a command that already began and is not an OS per-file security boundary.
The sequence trusts separately qualified caller callbacks for actual isolation,
protocol binding, acceptance and persistence; it creates none of those guarantees.
It is not wired into the historical runners or a new launchable experiment.
An optional observation digest is syntax-validated, not independently fetched or
verified against artifact bytes. Unknown provenance stays null, and totals are
known observation subtotals, not settled account-wide or parent/child billing.
The review does not reconstruct any historical unretained Git command.

The original operation-material prototype was withdrawn after complete Full JSON
increased from 90573 to 94969 bytes (+4.85%); its separate failed inventory test
also remains recorded in the Developer report. There is no retained Lean routing
feature or demonstrated Token, elapsed-time or delivery-quality improvement.
Neither these 61 passes nor the full 696/698 results satisfy that missing outcome.

## Stop and next minimal action

Stop at Eval with the existing unresolved scope retained and the reviewer claim
released. Do not advance to Independent QA, Release Gate or integration. The next
minimal action is a coordinator/human disposition of the unresolved efficiency
scope separately from this qualified reliability subset, retaining the negative
measurement. No further model experiment or new harness is necessary to make that
decision. No source fix is requested by this review.

No live provider call, reset, credit use, purchase, external write, source/test
edit, commit, push, merge, release or sealed-experiment change was performed.

Final canonical checks confirm `eval`, `quality_evaluator` / `agent-lulu`, exact
candidate above, no active claim, and the two original unresolved entries intact.
Doctor: 36 pass, 1 warning, 0 fail. The warning is the existing stale generated
parallel plan; it must be rebuilt before future dispatch, but no dispatch was
performed here. Evidence and supported lifecycle changes remain uncommitted.
