## Summary

- Refresh English, Japanese and Traditional Chinese README onboarding: adoption
  versus contribution, bootstrap, optional delivery, profiles, model routing and
  maturity. Preserve the existing diagrams.
- Apply the approved project-owned Solo attribution policy without changing
  downstream defaults or Developer/QA identity separation.
- Add explicit fingerprinted, diagnostics-only recovery for fully applied failed
  Developer Lean handoffs. Preserve original records and acceptance boundaries.
- Repair the subsequent P1 review finding: Git index flags can hide changed
  product bytes from status. Recovery now compares physical scoped files,
  inventory and executable modes against the original candidate's Git blobs.
  Unchanged flagged files recover without resetting the flags; hidden changes,
  ignored additions and unsafe links reject recovery.

## Verification and evidence

- README candidate: `ca962508ef41d7e6b16f9e8b9d5ddf56f6684765`.
  Distinct README verification and the actual approved WI-0246 recovery remain
  retained in `.ai-org/artifacts/WI-0246/`.
- Corrected recovery candidate: `0c1c6f1cc999bcf50a8d8ae0e1e89fe05b991ed7`.
  `npm run verify` exited 0 on Node.js 24.20.0: **1,269/1,269 passed**,
  no failures, skips or cancellations; 342,059.383625 ms test duration.
- Independent Test: **16/16** focused tests and **3/3** additional probes,
  including hidden mutation after artifact creation. These are separate runs,
  not additional unique full-suite tests.
- Formal Independent QA: **PASS**, including one additional hidden-FIFO
  rejection probe. Developer and QA use distinct Agent Identities. WI-0248 is
  accepted locally; workers are completed and claims released. Final Doctor:
  **37 pass, 0 warn, 0 fail**.
- Current correction's Test, full verification and QA records are retained in
  `.ai-org/artifacts/WI-0248/`. Prior WI-0247 evidence remains historical;
  its affected product-consistency claim is superseded, not silently rewritten.

## Boundaries

The repair qualifies `finish-recover`, not the unchanged ordinary `finish` path.
Physical comparison intentionally requires raw Git-blob bytes and fails closed
for unsupported links/submodules/nonregular entries. No general transformed-
checkout or hostile concurrent-filesystem qualification is claimed.

Pre-existing D1 remains: malformed unrelated worker data can yield a raw
status-renderer TypeError. Earlier evidence established fail-closed behavior;
improving that diagnostic is separate work.

No merge, tag, npm publication, deployment or live model experiment is performed.
The recovery command remains source-only, not part of published Alpha.33.
Updated-head CI is separate from complete local verification.
