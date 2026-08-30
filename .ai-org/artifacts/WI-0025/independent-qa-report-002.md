# Independent QA report 002 — WI-0025

- Candidate: `d6833dc2eb25949d067e83a53e47344c9e8c131f`
- Verdict: **NO-GO** because repository Doctor was unhealthy

The three original CLI findings were fixed. Accepted `--root` paths worked, legacy `--backup-root` remained compatible, conflicting aliases failed, `--allowed-root` was parsed and enforced, and the real `.ai-org/views/portfolio.json` output was schema-validated and rejected after an unsafe authority mutation. Retention consent/staleness, audit redaction/exclusive creation, coordinator-only writes, participant hash stability, and no-write behavior also passed.

Focused CLI passed 3/3, combined Phase 4 suites passed 33/33, full verification passed 193/193, and schema validation checked 45 documents against 24 schemas with no errors. Doctor nevertheless returned 34 pass, 1 warn, 1 fail because two previously registered NO-GO records bound five corrected working-tree hashes to the older `7dda4c6` scope revision. This provenance blocker requires correction and another exact-revision QA run.

Retained limits: disposable local repositories only; no production, protected-branch, multi-human, multi-machine, or enterprise federation evidence.
