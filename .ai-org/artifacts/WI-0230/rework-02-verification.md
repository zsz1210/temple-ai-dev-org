# Field remediation rework 02 verification

Developer: agent-rikku. Scope: WI-0230 public executable guidance and regression reliability. Previous candidate: `aff1b86e608b15273f9874cc49971cab9e69940a`. Findings and independent positive controls remain in `rework-01-independent-review.md`; they are not a passing whole-candidate judgment.

## Observed failure and correction

- IR-03: the public JSON uses bare `node`, so its environment must declare `PATH`. The corrected guide names that requirement and keeps environment isolation. A new test extracts the actual Markdown JSON, executes it unchanged with representative input files, and proves that removing PATH prevents execution. This tests the published example, not a second handwritten copy.
- Full `aff1b86e` verification: 1249 tests, 1248 passed, one optional Console refresh timeout, 285.050 seconds. An unchanged isolated replay passed its event assertion in 791.325 ms (894.066 ms test process). This did not reproduce a server correctness defect. The test's resource deadline now has 30 seconds of headroom instead of 10 under full-suite filesystem/CPU contention; it still requires the real refresh event, bounds connection/read time and cleans up streams/timers. This is a harness deadline, not a relaxed product latency SLA or proof that OS notifications are infallible. The failed full attempt remains recorded.

No production module in `src/` changed after `aff1b86e`. The new candidate still requires complete verification because executable guidance and test behavior changed. Do not report the unchanged isolated replay as a full-suite pass.

## Compatible runtime visual evidence

The browser observation on `535c306e38355864adc336f0a1289f105855bbdd` remains applicable to unchanged dashboard/server/status/observer/attention/browser-script sources. Four viewports, six primary views, reduced motion and six synthetic attention states passed. `.ai-org/artifacts/WI-0230/ui-runtime.png` was visually inspected: completed review, environmental impediment, next step, not-running execution and not-complete acceptance agree. The independent reviewer also examined this image. No new browser execution is claimed for this attempt.

## Exact final verification

Candidate `8bfe38892283744ba0c71bec0cd25f7cf1a02986` passed `npm run verify` on macOS / Node v24.20.0: 1250 tests, 1250 passed, 0 failed/cancelled/skipped/todo, 285611.118583 ms. The real Console refresh event test passed in 1754.319583 ms. Repository, documentation-link and package checks passed; package boundary was 443 files, 999159 packed bytes and 3880242 unpacked bytes.

The raw full-run log is preserved in `verification-8bfe3889.log.gz`; the uncompressed SHA-256 is `a4ab6f69103f606850046f912cec6460e3f8322951da5cffe69a80135ba8030a`. `verification-metrics.json` records every attempt, digest, measured installation/browser applicability and the synthetic contributor timing limits. Earlier failed attempts remain preserved.

`rework-02-independent-review.md` records actual independent Test/Eval/Independent QA PASS judgments for all V01-V16, IR-01/IR-02/IR-03 corrections and the unchanged named module candidates. It independently exercises the copied public JSON, successful reuse without execution and missing-PATH refusal. No behavioral files changed after the tested candidate. Canonical gate recording, derived views and final repository diagnostics are administrative closeout and are recorded separately.

## Canonical closeout diagnostics

WI-0230 and all three joined module items reached `done` with actual independent evidence, exact candidate references and rollback records. After rebuilding the parallel plan and Status, Doctor reported healthy: 37 pass, one legacy actor-policy warning, zero failures. This warning preserves existing project policy; no implicit migration was performed. Status reports acceptance complete, execution not running, no active claim and no unresolved item for WI-0230. The subsequent changes contain only canonical administration, evidence and report prose.

Existing F01-F13 coverage is in the main verification record; no new scope, publication, deployment or external permission change is included.
