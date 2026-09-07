# Corrected Developer verification

Candidate: `af5a984aee6706ab308c693d95e138134162d5d6`.
Developer: Rikku (`agent-rikku`). Date: 2026-09-07 UTC.

The rejected `173f43e1` remains in `independent-qa.md` and the Work Item's
same-scope rework history. This attempt restores all four missing conditional
obligations: pre-init Skill/confirmation/conflict routing, general scope/risk/
ownership stop-and-reroute, explicit context references, and release on abandonment.
The obligation map and the existing real installed-contract test cover them.
No executable lifecycle guard, required test, source-read rule or profile changed.

## Fresh verification

- `node --test test/operating-contract.test.mjs test/skill-policy.test.mjs test/phase4-installation.test.mjs`:
  **10/10 pass**, exit 0, **4,676.640041 ms**. The added assertions are structural
  reachability checks, not model understanding evidence.
- `npm run verify`, Node.js **24.20.0**: exit **0**, **767/767 pass**, zero
  failed/skipped/cancelled, **195,764.197167 ms** Node-reported test duration.
  Repository, documentation-link and actual package-boundary checks passed.
  Package: **416 files**, **893,980 packed bytes**, **3,503,986 unpacked bytes**.
  This is the complete behavioral candidate check; focused counts are not added.
- The managed upgrade updated only the two changed managed bodies and lock;
  root AGENTS is project-owned and its marked section was explicitly reconciled,
  preserving the project instructions above it. Fresh installed tests preserve
  user-owned bytes, reject drift/collisions, and exercise whole Builder/Verifier reads.

## New generation-free qualification

Standalone Node.js **24.19.0** ran the committed `prepare.mjs` successfully on
this exact candidate. Both old/current provider configurations reached
`thread-configured`, passed runtime controls, and confirmed server exit without
sending a model turn. Real current/old Temple record controls each passed the
**46-case** product oracle; current/stale requirement controls behaved as expected;
the observation qualifier matched **9/9** cases.

Current digest: `sha256:dafc7fa80cdb274770c8bb339df2bb74a5067f615ce783c02856e80b5804cd27`.
The former `5291b060` digest is retired with the rejected candidate. New fixtures,
bundles and protocol were created exclusively; no frozen lab was modified.
The two bundles differ only in the four named instruction files, with previous
instructions pinned to `4c606f71` and current code/model/request/oracle held fixed.
No model generation, consumed approval, Credits purchase, reset or live result.

Four whole instruction bodies: **27,200 → 15,934 UTF-8 bytes** (−41.42%).
Changed-spec selected whole bodies: **74,588 → 63,322** (−15.10%). Product facts
remain 1,400 bytes; compact navigation remains 4,827 bytes. See the body-free
`readiness-summary.json`; these are not provider Token or delivery-speed results.

## Handoff

All first-review corrections are implemented and full verification passed.
Test/Eval and fresh distinct-Identity Independent QA must judge this candidate;
no old pass or retired readiness is reused to claim completion. The optional
Python Skill validator remains unavailable as recorded in `verification.md`;
repository-native Skill checks are included in the passing full suite.
