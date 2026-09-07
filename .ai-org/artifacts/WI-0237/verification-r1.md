# WI-0237 R1 Developer evidence

Candidate: `e88f3274645b497b08d1a359e7617247791a25c4`.
Developer: Rikku (`agent-rikku`). UI: not applicable.

Corrected the final filesystem presence check to include all committed delivery
records in explicit record-descendant mode. Legacy exact-HEAD behavior remains
unchanged. Independent review of the previous candidate failed; its evidence is
retained in [independent-review.md](independent-review.md), not reused as a pass.

- Focused real claim/finish control: **1/1**, 11,719.195 ms total. Five isolated
  deletions (evidence, Work Item, events, handoff, receipt) each reject with
  `missing-source`.
- Complete `npm run verify`: exit 0, **763/763**; zero failures, skipped,
  cancelled or todo tests; 168,762.120917 ms suite duration.
- Node.js v24.20.0, same repository-local dependency installation and unchanged
  lockfile. No UI/browser or model experiment was run.

The source/test bytes verified above are committed in this candidate. Subsequent
handoff/report-only changes do not change these behavioral bytes. Separate
re-review is the next action; this document is not Independent QA, merge approval,
release readiness or measured efficiency improvement.

## Final Test/Eval handoff checks

- Separate [R1 re-review](review-r1.md): PASS, focused 1/1 plus two additional
  deletion controls; original failed review preserved.
- Report/governance verification: `npm run verify:fast`, **54/54**, exit 0,
  1,005.65325 ms suite duration in the coordinator's recorded invocation.
- After Test/Eval handoff, claim release and fresh plan: Doctor **37 pass,
  0 warnings, 0 failures**. No active WI-0237 worker/claim remains.
- Publication audit: no blocked findings; 68 existing binary surfaces remain
  review-required. This change adds no binary file and does not claim an audit
  of those images. No machine-local personal paths found in new WI-0237 reports.

Organizational state is `independent_qa`, awaiting that named verification stage.
Test/Eval is complete; formal Independent QA, Release Gate and maintainer merge
are not recorded as passed. No automatic model comparison or release follows.
