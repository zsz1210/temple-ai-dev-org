# Evidence-reuse verification

## Scope and interpretation

This work changes project-owned guidance and evidence, not the live runner,
framework instructions or frozen experiments. No new model subject or historical
rescore is performed. The proposed incremental experiment remains unexecuted.

The inventory references 18 original rows across WI-0234/0236/0239: 13 attempted,
five missing, including one attempted row with incomplete usage. Original
product/strict-handoff distinctions remain in the referenced reports and exports.
The new index is not a pooled dataset or a new independent sample.

Two narrowly scoped Lessons are confirmed, and one project Practice is active.
The five existing candidate entries remain untouched. Medium confidence reflects
the specific experiment family; this is not a statistically validated model policy.
The review date is a reminder; applicability must be reconsidered sooner on
task/provider/measurement changes. The current CLI calls a date within 30 days
`due`, not overdue, so the reminder may already be visible.

## Fresh offline checks

`node --test .ai-org/artifacts/WI-0240/offline.test.mjs`: **6/6 pass**, exit 0,
579.994416 ms on Node.js 24.20.0. Checks cover exact export hashes/seals and rows,
Learning eligibility, two actual CLI retrieval cases, an unrelated-query negative,
actual Work Item Context routing and six existing stop-policy decisions. No
provider, raw lab data or source mutation is used. The first local attempt failed
because the new test used one extra parent directory in its imports; corrected
before this passing run. No model quota was spent repairing that test.

The stop cases confirm current conservative behavior. They do not implement or
qualify a future budget-censor continuation mechanism. Retrieval proves the
guidance is available to an Agent, not that every Agent will follow it.

Complete candidate verification and distinct Lean verification are recorded below
when actually performed; the focused six checks alone are not a full-suite claim.

## Candidate verification attempt

Candidate: `f80651d68b75d72682448ac2bac3823b02bbd385`.
`npm run verify`: exit 1, **766/767 pass**, 199,758.917334 ms. Repository/link/
package checks passed. The single failure was the unchanged optional Console
refresh-event test's two-second timeout. It is retained as a failed full attempt,
not erased by a focused pass. Node also emitted the existing recursive test-runner
warning from `scripts/test-groups.mjs`.

Read-only inspection found a fixed 2,000 ms wait for a filesystem-triggered event.
No Console/runtime/test source differs from the parent. A focused
`node --test test/optional-console-collector.test.mjs` run then passed **8/8**, exit
0, 4,778.268208 ms, without any change or timeout relaxation. This suggests timing
sensitivity but does not establish its cause or repair it. The distinct Verifier
will run one fresh full attempt with no concurrent test suite; a repeated failure
must remain unresolved rather than trigger an unbounded rerun loop.

A default Context resolution without an explicit query also returned the active
Practice and both validated Lessons. The original five index entries compare
byte-for-byte as parsed records against the parent and remain candidates. These
checks add routing/preservation evidence, not new experiment outcomes.

## Retained initial-work availability

Read-only inspection of the WI-0239 private lab confirmed all six original
pre-work commits remain available, and `git ls-tree -r -z` reproduces every
recorded file mode/object ID in the frozen protocol (stable: 7/133/133 files;
changed: 8/134/134 for ordinary/current/previous). Protocol digest still matches
its seal. No checkout, reset, actor rerun or lab write occurred.

The current compact starting commits are
`5d5adbe61cdebc1171b46d180e7e232ee237387b` (stable) and
`aa2843fd3585a7df88dfb3c9717e621c73d60e47` (changed). This confirms material exists
to reuse the same unfinished work, not qualification or authorization to run it
again. Future reconstruction still checks the runtime and original task contract.
An initial assertion treated the protocol's per-file `tree` map as a Git tree
OID; the check was corrected to compare the actual mapped modes/OIDs. Retained
data was never altered to satisfy the check.

## Final distinct verification

The [Lean Verifier review](lean-review.md) accepts the exact candidate
`f80651d68b75d72682448ac2bac3823b02bbd385`. Fresh full verification passed
**767/767**, exit 0, 193,651.823584 ms test duration and 195.33 s wall time;
the six dedicated offline checks passed separately. Doctor passed 37 checks with
zero warnings/failures at review. The original full timeout remains above and is
not claimed repaired. This is distinct Lean verification, not formal Independent
QA, measured efficiency or live-experiment approval.
