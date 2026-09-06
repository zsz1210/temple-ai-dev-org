# WI-0184 corrected package candidate verification

Candidate: `85994e3b5e6310e0f684bc1299d1d1cb60e5b7f2`.

`npm run verify` passed repository, documentation-link and package checks, then 579/579 tests, zero failures/skips, in 106.917 seconds. This includes the real-CLI packet fixtures; no model comparisons were called.

Additional synthetic local acquisition using the existing Lean delivery fixture produced:

| Stage | Selected source count | Emitted source bytes | JSON/CLI output bytes | One local CLI observation |
| --- | ---: | ---: | ---: | ---: |
| Developer | 16 | 71,293 | 90,861 | 175 ms |
| Fresh Verifier | 18 | 73,508 | 94,754 | 148 ms |

Both acquisitions completed with zero duplicate paths and `required_reads_waived=false`. These are fixture byte/timing observations, not Token measurements or a comparison against ordinary delivery. Conservative full authority inclusion makes this initial acquisition response large; it remains opt-in and must not replace the default route on an efficiency claim.

Independent review is separate and has identified a root-level evidence-path counterexample despite this full-suite pass. Preserve this record as evidence for this candidate only; it does not accept the finding or qualify a later correction. Future changed source requires fresh verification.
