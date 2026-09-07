# WI-0242 verification and evaluation

This is an evidence-only delivery for the authorized experiment. The behavioral
instrument remains `afb048d10a7c1554afa75b8121d733d753b0a49b`; execution used
`2ef970b6d82d2f7aef4ea3067883f82b67323fc6`. No source, actor instructions,
Learning schema or frozen protocol was changed during the run or diagnosis.

## Reused readiness, not new efficacy evidence

- WI-0241 full verification: 770/770 on the unchanged behavioral candidate;
  [record](../WI-0241/verification.md).
- Distinct reviewer checked the candidate and ran 23/23 focused runner cases;
  [independent readiness](../WI-0241/independent-qa.md).
- Pre-dispatch evidence packaging: verify:fast passed 54/54 and repository/link/
  package checks. Doctor: 36 pass, one stale generated parallel-plan warning,
  zero failures. That projection was not used to dispatch model subjects.

These do not prove complete instrument-contract coverage. The legitimate short
baseline reference missed by these tests is explicitly reported as a defect.

## Execution and separate diagnostic checks

The single approved invocation returned a sealed stopped result (process exit 1)
after one completed turn. Final usage, process exit and empty background terminals
were observed. The changed-spec subject remained unattempted. Protocol and run
SHA-256 seals match before/after read-only diagnosis; there was no second run.

Read-only inspection found that only the two raw baseline-string equality tests
in deliveryRecords rejected the otherwise valid record. Git resolved the supplied
short reference uniquely to the frozen baseline. The existing claim API preserves
this accepted input string; the actor supplied the required full candidate SHA.

The separate post-hoc diagnostic cloned the checkpoint in memory, substituted the
equivalent short spelling only after Git resolution, and called the existing
assessContinuityCandidate with allowRecordDescendant and isolatedOracleExecutor.
Its fresh temporary product extraction passed 46 oracle cases and regression
checks (exit 0); scratch cleanup completed. No source/frozen input/actor record
was changed and no model generation was performed. The original rejected score
is preserved. Diagnostic acceptance is not a replacement live acceptance.

## Evaluation judgment

The completed model observation supplies valid observed usage and elapsed data,
but the original acceptance screen has a false-rejection defect and only one of
two planned conditions was attempted. The [report](report.md) preserves that
distinction and uses historical comparisons descriptively. Overall experiment:
inconclusive; no continuation or broad efficiency claim is justified.

Developer/evaluation evidence is not Independent QA. The final report needs a
distinct review of numbers, retained seals, diagnosis and missing-data claims
before organizational closeout. No live generation is needed for that review.

## Subsequent review and closeout

Distinct QA accepted report accuracy at `56de97b3803c646cbaa7341c9915240615d2eece`;
see [independent review](independent-qa.md). Its record-only replay reproduced the
original rejection and passed all 41 record checks with the Git-verified alias.
It did not repeat the coordinator's product oracle execution.

The [release-gate record](release-record.md) closes this attempt as `concluded` /
`inconclusive`, not an accepted two-condition comparison. Final canonical-state
Doctor passed 37 checks with no warnings or failures. Evidence packaging before
QA passed repository/link/package checks and 54/54 fast tests in 1,146.703542 ms;
the first packaging check found a historical-document link typo, corrected before
the reviewed candidate. No behavioral/full-suite rerun is claimed.
