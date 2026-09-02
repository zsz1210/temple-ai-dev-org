# WI-0105 Independent QA attempt 1

## Decision

No-go at candidate `0a63edf3c06118c8c3cb55af3a2623191d5a1983`.

## What passed

- A fresh detached worktree passed 280 of 280 repository tests in 56.52 seconds.
- Developer Rikku and Independent QA Lulu remained different Agent Identities.
- Matrix values and evidence classes generally matched the canonical sources.
- Revision lineage, privacy scanning, zero external actions, and candidate cleanliness passed.

## Blocking findings

The runner's prose was stronger than its assertions in four places:

1. it claimed zero current external tracker mappings without counting every Work Item's `tracker_refs`;
2. it copied tracker field ownership into the observation without asserting the expected boundary;
3. it did not record and assert the UI-reference requirement for each UI mode; and
4. it did not assert every mode's complete prebuild and closeout evidence arrays.

The actual current tracker mapping count was zero, so the defect was missing evidence rather than a contradictory result. Candidate `0a63edf3…` cannot proceed because a truthful value still needs an executable assertion.

## Evidence-source clarification

QA also questioned normalized observation files created after their tested revisions. Temple's current evidence validator intentionally content-addresses the source observation from the current repository when that source did not yet exist at the tested revision; separately declared `artifact_refs` are checked against their recorded revision when present there. Both prior entries passed Doctor under that explicit behavior. This Work Item does not change the evidence contract. The replacement observations will continue to reference only immutable supporting artifacts already present at their tested revision.

## Required correction

Count and assert every current `tracker_ref`, assert all three field-ownership arrays, normalize each UI mode's `ui_ref_required` and `ui_refs_forbidden` result, and assert the exact prebuild and closeout evidence arrays. Then create a new exact candidate and repeat Independent QA.
