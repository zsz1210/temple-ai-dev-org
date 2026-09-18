# Independent authority-drift finding

Remote reviewer agent-lulu, task 01a0b1fb-7c1d-7f40-8e27-701d232a62e9, reproduced
an actual acceptance defect against source candidate 11b46412. Candidate 4a6c9d8f
has identical product code, so the finding applies to both. Its 101 affected tests
passed in 188.77 seconds; the additional independent probe found the uncovered case.

A pre-candidate `.ai-org/artifacts/WI-0001/approved-scope.md` referenced by gate
evidence was changed in a descendant commit. Verifier finish nevertheless returned
`accepted:true`, `status:applied`, resulting state `done`. Original scope SHA-256:
`d9de6fe03dcb3a9ba6a45d06d0960edac502939945da117d840fefd00ef019c8`;
changed hash `7924e84f1bd0f3ce243b072adf2af9b27e46b70d45490db47bd8f661af2343a6`.
The first probe setup omitted position and was rejected before mutation; the
corrected setup reproduced the defect in 3.22 seconds. Preserve both observations.

The descendant allowlist treats every own-artifact path as administration, even
when it is an existing scope/approval/technical gate input. Repair within the
approved integration boundary: protected gate evidence must outrank the directory
allowlist, including normalized references and physical content hidden from Git.
Keep normal handoff/report/diagnostic output legal. Add a combined regression for
dirty, committed, hidden and changed-then-reverted protected evidence, and verify
rejection does not write lifecycle state. Requalify the exact corrected candidate;
prior full pass is not acceptance of this defect.
