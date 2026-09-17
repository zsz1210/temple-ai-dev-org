## Problem

Ordinary completion relied on HEAD equality and Git status. In an isolated
diagnosis, `assume-unchanged` and `skip-worktree` concealed broken working files:
Developer handed them off and Verifier reached Done despite a failing product
test. Doctor checks organization consistency, not product correctness.

## Change

- Share the existing physical candidate check between completion and recovery.
  Compare scoped actual bytes, executable modes and inventory against Git blobs.
- Await the check at preparation and journal revalidation for ordinary finish,
  direct deliver and workflow-stage completion; use literal Git paths.
- Preserve unchanged flagged positives, index flags, evidence/identity gates and
  historical receipt semantics. No extra product-test runner, dependency or CLI flag.
- Add ten regression tests for Developer/Verifier hidden changes and deletion,
  read-only preview, old-plan apply, interruption, diagnostics-time mutation,
  direct delivery and ignored additions within literal directory scope.

## Verification

Exact behavioral candidate: `360b1b86266692aadda590b18419d3c3f004c352`.
Focused completion/recovery suite: **60/60 passed**, including existing recovery
regressions. Full offline `npm run verify`: **1,279/1,279 passed**, exit 0 on
Node.js 24.20.0. Independent Test passed six selected cases and a separate actual
parser-failure/restoration/historical-replay probe. Evidence is recorded in
`.ai-org/artifacts/WI-0249/`; later evidence-only commits do not change the tested
product candidate. Remote CI is a separate bounded consistency gate.

Formal Independent QA: **PASS**, including a separate mode-drift probe with
`core.filemode=false`; Developer and QA use distinct Agent Identities. WI-0249
is accepted locally with workers completed and claims released. Final Doctor:
**37 pass, 0 warn, 0 fail**. These local gates do not merge or publish the change.

## Boundaries

A hidden change present before completion rejects without lifecycle writes.
A change during diagnostics rejects settlement but does not pretend earlier
lifecycle writes were rolled back; the pending diagnostic record remains.
Historical receipts are not fresh verification. Raw checkout transformations,
links, submodules and nonregular entries remain fail-closed; no hostile
concurrent-filesystem or performance guarantee is claimed.

No live model experiment, release, npm publication or deployment. This is source
work on top of Alpha.33, not a claim that the npm package already contains it.
