# Independent QA report 001 — WI-0026

- Candidate: `7dda4c6b3e1fc9fd16b1fcc55b794e1f1c5d5de5`
- Verdict: **NO-GO**

The generated-portfolio schema is strict, but it is wired to `.ai-org/views/federated-portfolio.json` while the real CLI writes `.ai-org/views/portfolio.json`. A disposable initialized project accepted intentionally invalid CLI-generated portfolio content because `schema validate` did not catalog the actual output path.

All other contract checks passed: focused installation and federation tests 11/11, full verification 193/193, fresh-init and two upgrade Doctors 36/0/0, exclusive concurrent registry creation, byte-for-byte upgrade preservation, project ownership, all six capability flags, Alpha.27 metadata consistency, and clean exact-revision Git state.

Align the catalog with the actual CLI output, add an end-to-end schema-validation test for that output, and repeat Independent QA at a new exact revision.

Retained limits: local disposable evidence and same-filesystem concurrency only; no real multi-machine or published-package validation.
