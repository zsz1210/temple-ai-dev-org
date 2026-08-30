# Independent QA report — WI-0019

- Candidate: `0d48f087b12dfa1b96d4f3bb5ed73375cb67407c`
- Verdict: **GO for bounded local Alpha.27 integration**

Two fresh clean exact-revision worktrees independently reproduced the CLI and installation slices after the preceding NO-GO findings were corrected.

- Focused CLI: 3/3 passed.
- Focused installation and federation: 11/11 passed.
- Full verification in each worktree: 193/193 passed.
- Root schemas: 45 documents, 24 schemas, 0 errors.
- Root Doctor: 35 pass, 1 accepted stale-plan warning, 0 fail.
- Fresh init and upgrade Doctors: 36/0/0.
- Evidence registry: 70 records and artifact digests valid.
- Exact HEAD, diff check, index, and worktree: clean.

The QA runs reproduced accepted `--root`, alias conflict, retention consent and staleness, audit redaction and exclusivity, `--allowed-root` enforcement, coordinator-only/no-write behavior, participant immutability, actual portfolio schema enforcement, exclusive registry creation, project ownership, upgrade byte preservation, capability flags, and Alpha.27 metadata/lock consistency.

Detailed reports: `.ai-org/artifacts/WI-0025/independent-qa-report-003.md` and `.ai-org/artifacts/WI-0026/independent-qa-report-003.md`.

Retained limits: local disposable and same-filesystem/process evidence only; no publication, production, protected-branch, distributed multi-machine, or enterprise qualification.
