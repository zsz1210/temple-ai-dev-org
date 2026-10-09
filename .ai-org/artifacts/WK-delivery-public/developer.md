# Public delivery integration

Candidate: `9cc6e1c49d86e1434bae35de333f87e3673d60b6`.
Public base: `362c3a39489f39c6a6939d6891c3ad898edeead0`.

## Changes and rationale

- Separate 1,024 retained usage/capture records from the 128 live-record limit.
  Finished history no longer exhausts live capacity. Readiness and binding use
  the same inventory rules, retaining upstream source and authority checks.
- Retain exact claim snapshots when dispatch is prepared. Historical usage
  distinguishes missing from invalid claim proof. Recovery requires original
  matching bytes; it never reconstructs task authority or recreates deleted media.
- Add optional attributed delivery progress and iteration evidence. Produced,
  functionally verified and quality accepted counts remain separate; missing
  measurements remain unknown. The three-round cohort counts the first three
  real-task iterations in the latest explicit comparison group.
- Add bounded iteration preflight for evidence, disk headroom, probe, revision
  and authorization. Repeating an unresolved approach requires a changed approach.
- Add explicit media retention planning with protected files, validated replacement
  hashes and durable receipts. Retirement requires confirmation of the exact
  plan. This delivery exercised disposable fixtures only.

The integration preserves newer public binding readiness, usage-scope references,
collection closeout, candidate-file preflight, optional check observations,
Beta.1/bootstrap behavior and the observer analysis/filter/help/motion changes.

The capture-capacity regression now uses a unique overflow source. Reusing the
existing source was correctly rejected by upstream duplicate-source readiness
before the intended capacity assertion. The revised case checks capacity and
confirms that rejection leaves no overflow ledger.

The legacy Console browser gate exposed a native/legacy boundary error: selecting
an active WK task requested the WI-only delivery endpoint and received HTTP 404.
Native task details now explicitly identify the Workkeel observer as the place to
inspect native evidence. They make no legacy delivery request. A real-browser
regression checks that boundary while retaining all six legacy attention states.

## Verification and evidence

See `verification.json` for actual commands, outcomes and
retained log hashes. The focused six-file suite passed 83 tests. The full monitor
browser gate passed nine groups with zero external requests and zero model calls.
Desktop (1440 px) and narrow-screen (390 px) progress captures were inspected:
produced 200/200, functionally verified unknown and quality accepted 0/200 remain
distinct and readable without horizontal overflow. These are synthetic UI fixtures,
not measurements or acceptance of another project.

The full repository suite and both browser gates are repeated on the revised
candidate; their final outcomes are reported in the
verification record. Native Doctor is checked after lifecycle changes. A distinct
actual Agent owns `independent-review.md`.

Applied Skills: native workkeel-work for pinned lifecycle, bounded dispatch and
exact candidate evidence; Playwright for the existing repository browser gates
using the installed Chrome. No new browser framework or runtime was installed.

## Publication and limitations

Only product files, this new public task and sanitized task evidence are added.
The private source checkout is not an ancestor of this branch. Package metadata,
lockfile, public native policy, legacy history and documentation language rules
remain unchanged. Raw execution sources, machine paths, unrelated task records
and generated screenshots remain local. The verification record retains bounded
metadata and digests rather than publishing bulky browser evidence.

This integration does not measure general AI speed, cost savings or game quality.
No original project media was read or deleted. The current coordinator turn may
still lack terminal token collection at acceptance; any such gap is explicit in
the collection report. Local task acceptance and GitHub merge are separate steps.
No npm publication, release tag, service deployment or game change is included.
