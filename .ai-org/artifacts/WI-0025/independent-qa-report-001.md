# Independent QA report 001 — WI-0025

- Candidate: `7dda4c6b3e1fc9fd16b1fcc55b794e1f1c5d5de5`
- Verdict: **NO-GO**

Fresh exact-revision QA found three release-blocking contract mismatches that the passing automated suites did not cover:

1. The accepted retention syntax uses `--root`, but help, parsing, and tests expose only `--backup-root`.
2. The accepted portfolio boundary `--allowed-root` is absent from help and parsing and is not forwarded to `buildFederatedPortfolio`.
3. The CLI writes `.ai-org/views/portfolio.json`, while the shipped schema catalog watches `.ai-org/views/federated-portfolio.json`; therefore the actual generated view can bypass schema validation.

The focused CLI suite passed 3/3, the combined Phase 4 suite passed 29/29, and full verification passed 193/193. Those green results are insufficient because direct contract reproductions failed. Correct the three mismatches, add end-to-end regression coverage, and repeat Independent QA at a new exact revision.

Retained limits: local disposable evidence only; no production, protected-branch, multi-machine, published-package, or enterprise validation.
