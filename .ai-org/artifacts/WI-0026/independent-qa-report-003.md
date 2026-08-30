# Independent QA report 003 — WI-0026

- Candidate: `0d48f087b12dfa1b96d4f3bb5ed73375cb67407c`
- Verdict: **GO**

The prior portfolio schema and evidence-provenance blockers are resolved. A real CLI build wrote `.ai-org/views/portfolio.json`; schema validation listed that exact document and rejected both unsafe authority state and an unknown top-level property. Fresh registry creation, project ownership, exclusion from `managed_files`, missing-registry upgrade, existing byte preservation, 64-call exclusive creation and preservation races, six capability flags, Alpha.27 metadata, launcher bytes, and lock checksum all passed.

Focused installation and federation tests passed 11/11, full verification passed 193/193, root schema validation checked 45 documents against 24 schemas with zero errors, and fresh init plus two upgrades each reported Doctor 36/0/0. Root Doctor reported 35 pass, 1 accepted stale-plan warning, and 0 fail. Exact HEAD and clean Git checks passed.

Retained limits: local disposable same-filesystem/process concurrency only; no distributed multi-machine or published-package proof.
