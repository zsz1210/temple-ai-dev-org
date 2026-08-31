# Work order — WI-0045

## Objective

Correct the blocking Independent QA mismatch in WI-0044 without restoring a long alert wall on the Dashboard's default view.

## Authorized scope

- Group all currently firing `stale-evidence` conditions into one actionable Now signal.
- Preserve the exact underlying condition count and link the operator to System for details.
- Prioritize the grouped recovery signal ahead of release decisions.
- Add regression coverage and rerun responsive browser verification.

## Boundaries

Do not change condition authority, lifecycle state, private-viewer permissions, remote commands, model routing, release state, or publication state. WI-0044 remains the parent redesign and retains the failed candidate evidence.
