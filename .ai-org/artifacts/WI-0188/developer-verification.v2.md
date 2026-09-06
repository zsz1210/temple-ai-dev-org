# WI-0188 corrected Developer evidence

The correction follows the preserved failing `independent-qa.md` and `verification-attempt-1.md` without changing the accepted capability or weakening checks.

- Optional entry now requires shared contracts to be `stable` or `not_required`, matching existing readiness. A valid draft with a shared reference returns body-free fallback. An actual installed-launcher regression verifies draft rejection, rejection of the prior entry digest without canonical writes, and eligible entry after explicit stabilization.
- The existing Skill-policy exact reference set now includes the accepted fourth procedure. The allowlist and reachable-file assertions remain intact. The necessary additional test path and lack of overlap are recorded in the attempt record; no canonical JSON was hand-edited.
- Entry errors now use the same existing structured read-only error boundary as compact Context/packet, so a stale expected digest yields `STALE_PREVIEW` with `mutation_status=not_started`. The new regression checks the machine-readable fields directly.

Focused actual entry plus Skill-policy suites: **14/14 passed**, zero failures/skips, **28.868 seconds**. Log SHA-256: `9aa62b540eedca8abb3e1c0e5e8d6e006f48d5c72b8cb15caf354b6f39170555`. The full corrected candidate and fresh distinct QA are required before acceptance; the first full run is failed evidence and remains preserved.
