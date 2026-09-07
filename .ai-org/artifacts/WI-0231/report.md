# WI-0231: offline continuity instrument results

This report is for the maintainer deciding whether the proposed takeover experiment
has a usable product instrument. It does not report a live comparison or approve one.
Scope: [brief](brief.md), based on the [reviewed design](../WI-0230/design.md).
Behavioral candidate: `ccb6dcfdf506a8342129152c935c9d389cbdb534`.

## What was implemented

Two synthetic single-repository checkpoints now have reusable fixture generation:

| Checkpoint | Predecessor state | Current task |
| --- | --- | --- |
| Stable | Discount module actually tested; shipping integration unfinished | Finish the approved quote behavior without damaging completed work |
| Changed specification | Previous shipping behavior actually tested at threshold 3000 | Apply current approved threshold 5000; old passing evidence remains historical |

For each checkpoint, ordinary and Temple arms share the exact product files,
history, current specification, public tests and competent handoff. Their physical
checkouts are separate. Temple adds its installed organization and a Build-stage
Work Item; it does not receive hidden additional product facts. Preparation time
is recorded per arm, not declared free or treated as model time.

The product oracle checks the exact new current commit, protected scope and actual
working-tree bytes, then runs 46 deterministic input cases and the public/added
tests in separate scratch storage. Expected answers remain coordinator-side.
The actor roots contain neither the oracle module nor the reference solution.

## Verification

Final `npm run verify` passed at the exact behavioral candidate on Node.js 24.20.0:
722/722 tests, zero failed, cancelled or skipped; test-run duration 190.736 seconds.
Repository and documentation-link checks passed. The actual npm dry-run boundary
remains 415 files (895603 packed bytes, 3510029 unpacked bytes). The complete run
includes all 10 continuity tests and the existing first-stop/usage/revision/cleanup
replays. It performs no live model generation.

Doctor: 36 passed, 1 warning, 0 failed. The existing generated parallel plan is
stale; this sequential item does not dispatch from it. This warning is retained,
not silently repaired or counted as a pass. No browser gate applies to this
repository-only instrument. Later report/lifecycle-only commits preserve the
tested source revision and require their own fast checks and Doctor.

Focused development results: all 10 new tests passed before the last boxed-number
repair (29.704 seconds). After that repair, its targeted transport test passed
(1 test, 2.668 seconds). These are local editing checks, not a substitute for the
final complete suite. Durations are diagnostic observations, not speed guarantees.

| Control | Passing test observation |
| --- | --- |
| Correct reference completion in both states and arms | Four accepted candidates, 46 oracle cases each |
| Wrong current threshold in both states and arms | Four rejected candidates |
| Damaged discount, replaced public test, changed spec, unauthorized file | Rejected in both states and arms |
| Wrong/current-base revision, hidden dirty bytes, untracked or unsafe files | Rejected before behavioral acceptance |
| Module exception or infinite loop | Failure; only the oracle's exclusive scratch is removed |
| Added failing test or test-side product rewrite | Rejected even when initial oracle answers match |
| Inconsistent coordinator facts | Rejected before candidate execution |
| Extra undefined field, boxed numeric field, fake TypeError | Rejected before JSON can erase the distinction |

These are synthetic controls, not model subjects, reliability estimates or measured
real-world error rates. Existing replay tests cover revision, first-stop, usage and
cleanup behavior in the existing harness; they do not qualify a new live adapter.

## Problems found and repaired

- Initial test setup falsely matched the normal `references` directory as a
  forbidden answer filename. Exact forbidden filenames replaced that check.
- The stale-spec negative control made no code change, so its test commit failed.
  A new empty commit represents the false completion; the product oracle still
  rejects the old behavior. No business assertion was relaxed.
- Source review found that JSON serialization could erase an extra undefined
  return field, unwrap a boxed number, or confuse a named object with a TypeError.
  The child now checks exact own keys, primitive safe-integer fields and genuine
  error type before transport. Parent-side expected answers remain separate.

## Boundaries and next decision

No model experiment, Credits purchase, reset, policy change or package publication
was performed. These repository-only scripts and tests are not distributed in npm.

This is product-scope offline qualification only. It does not certify lifecycle
adherence, a successful fresh-Agent takeover, full delivery, Token savings or a
Temple advantage. Local scratch separation and bounded direct subprocesses are
not a hostile-code, descendant-process or network sandbox.

Before any live launch, implement and qualify the exact adapter: supported provider
entrypoints and bootstrap, fair prompts/fact manifests, authority and handoff
evidence, OS/process/network isolation, usage capture and first-stop cleanup. Freeze
the resulting protocol and resolve useful-effect/resource tradeoffs, model,
budget, duration and privacy with the maintainer. Existing historical caps grant
no new allowance. Do not launch automatically from this offline result.

Rollback: withdraw these two repository-only source/test files if their instrument
is rejected; preserve this report and historical experiment evidence. Organizational
closeout does not merge a PR, publish a package or authorize live generation.
