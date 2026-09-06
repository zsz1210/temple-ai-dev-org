# WI-0191 executor verification

## Outcome

Implemented an experiment-local executor for the six paired scenarios. The
framework runtime, distributed instructions and prior experiment records were
not changed by this slice. This is executor verification, not evidence that
WI-0190 saves time or Tokens. Live model calls performed: **0**.

## Observed checks

- `npm run verify`: repository, documentation and package checks passed;
  **632/632** full-suite tests passed, zero failures/skips, 157.201 seconds.
- `node --test .ai-org/artifacts/WI-0191/*.test.mjs`: independent advisory
  rerun **32/32** passed, zero failures/skips, 14.443 seconds. Developer's
  final affected runner/grader rerun passed **13/13**, 9.971 seconds.
  The artifact suite is separate from the
  framework suite; it includes provider replays, not live model behavior.
- The latest event-count correction was additionally checked with the native
  tracker suite: **8/8** passed. Streaming deltas do not consume the bounded
  semantic-event quota.
- Both source-pinned product fixtures reject the unimplemented module, accept
  the reference, and reject three deliberately broken implementations.
- An actually ineligible actor cannot claim Developer work. Completion
  fixtures use receipts produced by the real CLI, including stale/failed
  diagnostic evidence. Support fixtures authorize the TTL lookup itself.
- Generation-free preparation created all **12** fixtures and tested native
  sandbox commands: allowed write exit **0**, outside write exit **1** with
  no outside file created, read-only write exit **1**. Product files inside a
  workspace-write fixture remain OS-writable; this is explicitly disclosed.

## Implemented controls

- Same source-pinned runtime, model/effort and prompt per pair; balanced order.
- Actual provider schemas, disabled memory checks and route acknowledgements.
- Native parent/child correlation, bounded unknown-event buffering, extra-child
  and extra-turn rejection, last-observed usage, missing values kept unknown.
- Explicit expiry, route, funding and numerical approval checks, exact protocol
  and source/request bindings, review-evidence hash, exclusive run-once marker.
- Known-active-turn cancellation, bounded cleanup, retained stop classification,
  protected-path outcome checks and a read-only held-out product oracle.
- Case-specific positive/negative grading controls; real lifecycle and receipt
  checks, submitted-test execution, source revision lookup and retained bounded
  synthetic helper findings. Raw subject observations are saved before grading.
- Advisory review found gaps despite the original passing tests. Corrections
  add human authorization provenance, exact-candidate review bindings, full
  Provider contract comparison, visible dependency-directory mutations, stricter
  authority-case writes and explicit unconfirmed cancellation. The advisory is
  not a formal QA pass and does not satisfy the live readiness gate.
- Follow-up counterexamples cover root-level dependency-lock bindings, helper
  findings arriving before parent spawn completion, and cleanup with wholly
  unbound actors. These records cannot be reported as successful termination.
- Exact test-invocation recognition rejects echo, substitutions, chaining,
  unsupported wrappers and foreign working directories. A substring hint is
  never used as evidence that the subject ran the required tests.

## Limitations that remain gates, not successful results

1. Independent readiness review must evaluate the exact executable seal.
2. The first native helper run must establish actual child event visibility and
   subscription behavior. Mock event replays cannot establish that capability.
3. Parent/child nonduplication and account-final usage are not established.
   Support aggregate cost is unavailable. Conservative limiter totals are not
   cost measurements or a promised hard account spending cap.
4. Product no-write is an instruction-compliance result within an isolated
   synthetic workspace, not a per-file OS security boundary. Restored transient
   shell writes are not proved absent by final hashes.
5. Lifecycle/answer quality still needs post-run evidence review. Command hashes
   do not establish same-content rereads or equivalent diagnostic scopes.
6. No numerical live budget is approved. The draft remains Terra medium,
   at most 16 subject turns, 1.6M Operational Tokens and 75 minutes, without
   retries, fallback, purchase, top-up or reset. It is not executable authority.

## How to resume

`runner.mjs prepare` performs generation-free preparation and emits a private
lab seal plus an unapproved approval template. `runner.mjs run LAB APPROVAL
REVIEW` requires the exact approval and an independently authored, hash-bound
review. Any code, source or prompt change invalidates that seal. Do not edit a
prior result, delete a run-once marker to retry, reuse an older approval or push
private lab paths/provider transcripts. The live matrix remains unstarted.
