# WI-0238: Small-task instruction reduction

## Outcome

The implementation now removes repeated instruction content, not merely JSON
formatting. The four existing entrypoints remain; authority, required reads,
verification and current lifecycle commands are retained. No extra Position,
router, session cache or workflow layer was introduced.

Candidate: `af5a984aee6706ab308c693d95e138134162d5d6`.
The first candidate passed its executable checks but failed Independent QA for
four omitted conditional obligations. Those rules are restored; corrected full
verification passed **767/767** in **195,764.197167 ms**. Corrected Test/Eval passed;
fresh formal Independent QA passed with **10/10** focused checks and independent
frozen-lab inspection. WI-0238 is **done**, accepted for this bounded implementation
and comparison-readiness scope. No live comparison, merge or external release occurred.

## Measured change

Actual UTF-8 bytes from the same installed changed-spec fixture:

| Measurement | Previous Temple | Compact Temple | Difference |
| --- | ---: | ---: | ---: |
| Four operating instruction bodies | 27,200 | 15,934 | -41.42% |
| All selected whole-source bodies | 74,588 | 63,322 | -15.10% |
| Optional full entry JSON | 103,624 | 92,322 | -10.91% |
| Compact navigation JSON | 4,827 | 4,827 | Unchanged |
| Current product facts | 1,400 | 1,400 | Unchanged |

The stable fixture shows the same 11,266-byte instruction reduction. Source counts
remain unchanged; there is no silent truncation. Other project-owned/nested
instructions still apply and may increase a real project's read set. Fresh
installs receive the new native router. Upgrade replaces only exact managed
entries; a project's existing AGENTS file requires explicit maintainer reconciliation.

These are **not Token or speed results**. Required claim/finish calls and canonical
records are unchanged. The earlier one-finish and diagnostics-reuse features are
not counted again. Actual acquisition, cache behavior, quality and latency can
only be assessed in a real matched diagnostic.

## What was preserved

The [obligation map](obligation-map.md) traces whole native/project authority,
scope/claims, current specs, identity separation, risk/profile gates, UI, trackers,
bootstrap, managed ownership, recovery, budget and bounded stopping requirements.
Exact CLI-suggested task titles and unreadable-source stopping remain explicit.
The corrective pass also restores first-init confirmation, general scope/risk/
ownership rerouting, explicit context-route recording and release on abandonment.
The initial failed QA is preserved rather than hidden by a later pass.
Work Skill references cover only triggered procedures; duplicate narrative and
reporting are removed without turning receipts into acceptance evidence.

The tests continue to exercise actual install/upgrade/claim/finish paths and
negative cases. Some instruction tests previously required the old paragraph
location. They now inspect the retained installed owner, while real bootstrap,
hash, identity, profile and recovery checks stay intact. No full-suite test was
deleted. The optional Python Skill validator was unavailable (missing PyYAML);
its pass is not claimed. Repository-native Skill checks passed.

## Prepared comparison, not a result

[The prepared diagnostic](comparison-proposal.md) compares competent ordinary,
previous Temple and compact Temple on stable and changed-spec work: six subjects,
the same Terra medium model, same product facts, current repaired evaluator and
one fixed request per family. The old/new executable bundles differ only in the
four pinned instruction files. Old historical performance samples are not pooled.

Generation-free runtime configuration, real record-only delivery, 46-case oracle
and observation qualification passed. Both provider processes exited. The current
[readiness summary](readiness-summary.json) retains the frozen digest; no model
turn, consumed approval, Credits purchase or reset occurred. A previous preparation
used the wrong local Node dependency shape and was stopped without widening access;
obsolete preparations are not runnable evidence for the current proposal.

The next live report must compare correctness, complete attempted-stage Token
usage, cached input, elapsed time and administrative behavior separately. One
sample per condition/treatment is diagnostic, not broad proof of organizational
efficiency. An authority or acceptance regression rejects adoption; otherwise the
measured tradeoff determines the next improvement, without an automatic rerun.

## Evidence and integration boundary

- [Developer verification and preserved failures](verification.md)
- [Corrected full verification](verification-r1.md)
- [Corrected Test/Eval](test-eval-r1.md)
- [Corrected Independent QA](independent-qa-r1.md)
- [Bounded organizational acceptance and rollback](release-record.md)
- [Historical Test/Eval join](test-eval.md)
- [Rejected-candidate Independent QA](independent-qa.md)
- [Design and approved stopping point](design.md)
- [ADR-0062](../../../docs/adr/0062-compact-operating-instructions.md)

This stage stops at a reviewable, qualified comparison candidate. Merge, release,
publication and another paid model diagnostic are separate actions. PR ancestry
remains on the existing WI-0237 review branch; no main-history rewrite is needed.
