# WI-0173 — Developer verification

- Developer: Rikku (`agent-rikku`).
- Candidate and complete-suite revision: `974d65782720e1264da869221cc38022ea60295f`.
- Scope: all-profile handoff commit identity, focused regression fixtures, and three aligned roadmap entry points. No UI, deployment, release, Provider execution, model calibration, or historical artifact changes.

## Results

- Focused handoff regressions: 6 passed, 0 failed/skipped; 5,821.591 ms on this local machine. HEAD, branch, lightweight/annotated tag, abbreviated and exact commits agree across the Work Item, Markdown, and event; later reference movement leaves all recorded values unchanged. Invalid refs, blobs/trees, and unborn/non-Git projects preserve the pre-call records.
- `npm run verify`: repository, documentation-link, and package-boundary checks passed; 466 tests passed, 0 failed, 0 skipped, 0 cancelled. Node's complete test-run duration was 70,716.012 ms, not an end-to-end product performance measurement.
- Package check: 387 entries, 839,907 packed bytes, 3,312,065 unpacked bytes. These are local development package observations, not a new registry publication or replacement of Alpha.30.
- `git diff --check`: passed before candidate commit.
- Developer Doctor: 36 passed, 1 warning, 0 failures. The warning is the generated parallel plan being stale after new Work Items; rebuild at final closeout, and do not use that stale plan for dispatch.
- The existing workflow test still exercises init, lifecycle, Doctor, and Status in a disposable repository. Its fake handoff revision was replaced with a real Git commit. High-Assurance's existing end-to-end test now also asserts the exact handoff and Developer candidate identity.

## Documentation evidence and limitations

GitHub reports prerelease `v0.1.0-alpha.30`, published `2026-09-04T18:56:48Z`; npm reports `next` and `latest` at `0.1.0-alpha.30`. Read-only observations were checked on 2026-09-05. Source at the recorded release revision `d2b2a5142c7e9b8d98e9474e0fe1cc8bdbf10324` confirms that its handoff resolver normalizes only High-Assurance work. Roadmaps now distinguish that published package from subsequent development changes and future capabilities.

Existing bounded comparison reports support mixed resource outcomes, not universal Token savings. The prepared field-validation plan remains a plan; another task owns the current comparison branch. No new model experiment ran here.

This report is Developer evidence, not Independent QA. Organizational closeout, integration, and public distribution remain distinct steps.

## Coordinator closeout check

After Lulu's independent PASS and evidence-only lifecycle closeout, the generated parallel plan was rebuilt: zero dispatchable workers and no claim or external action created. Doctor reported 37 passed, 0 warnings, 0 failures. WI-0173 is accepted/done with its claim released; WI-0172 remains an unclaimed intake reservation for the separate comparison. No `src/`, `test/`, or `docs/` bytes changed after the fully tested candidate. Main remains at `44a1c9fc23efa067dcbe1f47beadb6f1b1ed64c8`; this branch has not been pushed, merged, or released.
