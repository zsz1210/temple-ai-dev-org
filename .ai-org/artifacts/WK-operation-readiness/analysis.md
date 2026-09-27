# Operation readiness results

Behavior candidate: `ccc02e9885588b745bab0599748d769fa0efbfa4`.
Baseline: `807141e51d51180a928fef8f63f241e50306a027`.

## Changes

Binding readiness now identifies occupied execution sources, incomplete dispatch
dependencies, conflicting scopes and unavailable retained dispatches before a new
prepared capture is persisted. Binding repeats the shared checks under its lock.
Readiness does not scan model sources, reserve execution or authorize work.

Candidate diagnostics share classification with the lifecycle writer. They name
out-of-scope changes, product drift, unlisted new reports and changes to existing
candidate artifacts. File readiness is separate from authority, verification,
review and acceptance. Existing evidence and executable-file restrictions remain.

## Same-case offline comparison

The harness created independent Git/task fixtures for each baseline/candidate
case using the same approval, claim, host report and operation setup. No model
was invoked. The three cases were an occupied thread, a missing dispatch
dependency and an unlisted new report at handoff. Raw observations, source
revisions and rejected-operation timings are in `comparison.json`.

| Outcome | Baseline | Candidate |
| --- | ---: | ---: |
| Unsafe/incomplete operations rejected | 3/3 | 3/3 |
| Exact blocker identified in structured error or file message | 0/3 | 3/3 |
| Prepared capture records left by the two predictable binding failures | 2 | 0 |

This demonstrates preserved refusal and easier diagnosis/retry for these cases.
It does not demonstrate zero possible interrupted preparations: races after
preflight remain fail-closed. No automatic history repair or retrospective usage
estimation was added. Elapsed values measure only the rejected operation, are
single samples with different validation work, and are not a speed benchmark.

## Development findings

A reused checkout contained ignored active bindings for a historical task absent
from its current branch. Both coordinator and worker capture attempts were
rejected before implementation; the original ignored records were preserved and
work continued in a clean managed checkout. The new diagnostic now returns a
bounded offending binding ID for unavailable retained dispatches. It deliberately
does not delete records or reinterpret history to pass admission.

The initial candidate CLI test used a macOS temporary path through a symlink;
normalizing the test input path fixed the fixture while retaining the bounded
reader's rejection. The initial orphan-dispatch test used overlapping active task
scopes; separate fixture scopes fixed it without weakening the ownership guard.
These were development fixture corrections, not formal review rejections.

The first full verification of `275cbe1f9b34c2bac9c4f36a688fd9c553929da4`
found one compatibility regression: the shared binding diagnostic replaced an
existing historical-claim error message. Rejection remained intact. The final
candidate preserves the native error message and adds safe metadata; read-only
diagnostics still return only bounded codes and IDs. All 53 focused host, capture
and dispatch tests passed after that correction. The initial failed full run is
retained as `verification-initial.txt` and `verification-initial.json`; it was a
development verification failure, not a formal independent-review failure.

The second full run on the corrected candidate encountered an environment-only
failure: the installed-CLI rehearsal rejects symlinks, and this worktree reused
installed dependencies through package-level symlinks. Those links were replaced
with local copies of the same installed files. No dependency was downloaded,
installed or upgraded, and no source or test guard changed. The failed run is
retained as `verification-environment.txt` and `verification-environment.json`.

The coordinator retained the selected main-conversation model. Implementation and
independent review use distinct Sol medium executions under the repository policy.
Task-bound receipts are collected privately; partial intervals do not establish
whole-task time or token totals. Setup before attachment and the final conversation
tail remain outside complete coverage. The previous product sample stays frozen.

## Next use

Use capture `check` with the actual begin request, then `begin`. Prepare candidate
evidence before handoff and run the `candidate` diagnostic with the exact pending
handoff/review/close request. Fix reported setup problems before invoking the
lifecycle writer. Keep independent review. Use programs for numeric summaries;
this sample supplies no evidence that adding further Agents improves efficiency.

Full verification and actual independent review are recorded in `verification.md`
and `review.md`. No UI, model provider dependency, installation or service change
is part of this candidate.
