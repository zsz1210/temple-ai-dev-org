# Collaboration closeout improvement report

Date: 2026-09-18 JST. Work: WI-0250 and mechanical child WI-0251.
Qualified behavioral candidate: `9148bd6478dbb25eff5cf0c9d1af91cd4d03c683`.
Branch: `codex/collaboration-closeout`, based on main `cec7b1f1`.

## Completed behavior

- `measurement report` reuses the existing measurement store to produce
  candidate-bound mechanical evidence. It does not execute tests or grant QA
  acceptance. Optional Markdown exports stay under the named Work Item, reject
  unsafe paths and conflicting overwrites, and preserve failed observations.
- `collaboration readiness` distinguishes actor eligibility from task assignment,
  current owner, active claim and next operation. A valid active claim has priority;
  a different planned assignment remains visible without misdirecting its owner.
  Unclaimed assignment mismatches and attempted claim takeover remain blocked.
- Invalid `--context-ref` route IDs now produce an actionable `INVALID_INPUT`
  before Work Item creation instead of an uncertain-execution diagnostic.
- Measurement attempts also record monotonic elapsed time. Unknown token usage
  and cost are not converted into zero or inferred from command duration.

## Verification

| Evidence | Outcome |
| --- | --- |
| Final complete local verification | 1,288 passed; zero failures, cancellations or skips; 266.78 s wall time |
| Initial focused new checks | 9 passed |
| Existing actor/measurement regression checks | 31 passed |
| Independent remote initial focused checks | 9 passed, 3.24 s; additional probe found a readiness defect |
| Independent corrected-candidate recheck | 3 passed, 0.32 s; separate combined-case probe passed all four conditions |
| Final package boundary | 448 files; 3,924,251 unpacked bytes; original roots/exclusions retained |
| Final Doctor after closeout/view refresh | 37 passed, zero warnings or failures |
| Lifecycle | Both items accepted/done; all their claims released |

The initial candidate passed its tests but was correctly rejected by the separate
reviewer: a differing planned assignment displaced the current claimant in the
new navigation output. Same-scope rework repaired it and added the combined
regression. The original passing tests and rejection are retained separately;
they were not relabeled as final acceptance.

The remote review ran through SSH using the other Mac's Codex runtime and account.
This is distinct Agent review, not evidence of two independent human participants.
The reviewer left tracked files unchanged. Its second review reused verified
unchanged measurement/package source and reran only the relevant ownership cases.

## Measurement observations and interpretation

Each host executed a three-case synthetic test once, reused that immutable result
once, and generated three evidence reports. Each store retained one attempt.

| Observation | Local Mac, Node 24.20.0 | Remote Mac, Node 24.7.0 |
| --- | ---: | ---: |
| Initial measurement, including collection | 217.20 ms | 239.83 ms |
| Compatible reuse lookup; no command execution | 7.11 ms | 43.10 ms |
| Three evidence report exports | 66.17–72.30 ms | 125.05–127.19 ms |

These samples establish that evidence collection/export can be mechanical and
does not require another test execution. They do not prove an overall token,
billing or delivery-time reduction. Host versions differ; three samples on a
small fixture are not a controlled speed comparison. These measurements belong
to the initial candidate's unchanged report/measurement modules, not a relabeled
new benchmark after the readiness-only correction.

The remote CLI emitted input/cache/output counters, preserved verbatim in its two
review records. Resumed-session accumulation semantics were not verified, so the
counters are not added together and no billing estimate is asserted. No remaining
quota check or reset-credit operation was performed.

## Retained limits and next step

Reports bind only declared input bytes/modes; reviewers still assess missing
dependencies and acceptance relevance. This is not a hostile-filesystem sandbox.
Remote npm's existing cache permission error was handled with a temporary cache,
without changing account or system permissions. Temporary duplicate parent/child
branch claims were resolved by sequential closeout; history remains intact.

Main remains unchanged. No PR merge, framework release, package publication or
deployment occurred. The earlier `codex/collaboration-recovery` branch remains
separate: it and main contain different historical WI-0247 records. This candidate
does not silently merge or overwrite either history.

Recommended next step: prepare one integration candidate containing the earlier
collaboration fixes and this improvement, preserve and reconcile their distinct
Work Item evidence, then qualify that combined candidate for a single reviewed PR.
Do not infer that the current results already validate the combined branch.

## Evidence

- [Design and scope](design.md)
- [Final Developer evidence](developer-evidence-final.md)
- [Final full verification log](full-verification-final.md)
- [Original independent rejection](independent-review-attempt-01.md)
- [Corrected-candidate independent pass](independent-review-final.md)
- [Evaluation and gate evidence](evaluation-final.md)
- [Two-host raw measurement observations](measurements.md)
- [Organizational closeout](release-record.md)
