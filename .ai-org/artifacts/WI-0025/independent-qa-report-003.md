# Independent QA report 003 — WI-0025

- Candidate: `0d48f087b12dfa1b96d4f3bb5ed73375cb67407c`
- Verdict: **GO**

The prior evidence-provenance blocker is resolved: Doctor validates all 70 evidence records and digests. The accepted `--root` syntax works in human and JSON modes; the legacy alias remains compatible and conflicting roots fail. Retention refuses missing consent and stale digests. Audit redacts the injected credential marker and refuses overwrite. `--allowed-root` is enforced, no-write produces no output, participant and coordinator lifecycle hashes remain unchanged, and the real portfolio output is schema-validated and rejected after an unsafe authority mutation.

Focused CLI tests passed 3/3, full verification passed 193/193, repository checks passed for 93 overlay files and 10 Positions, and schema validation checked 45 documents against 24 schemas with zero errors. Doctor reported 35 pass, 1 accepted stale-plan warning, and 0 fail. Exact HEAD, clean worktree/index, and diff checks passed.

Retained limits: local disposable repositories only; no multi-machine, protected-branch, production, or enterprise federation evidence.
