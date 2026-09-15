# Field remediation rework 02 verification

Developer: agent-rikku. Scope: WI-0230 public executable guidance and regression reliability. Previous candidate: `aff1b86e608b15273f9874cc49971cab9e69940a`. Findings and independent positive controls remain in `rework-01-independent-review.md`; they are not a passing whole-candidate judgment.

## Observed failure and correction

- IR-03: the public JSON uses bare `node`, so its environment must declare `PATH`. The corrected guide names that requirement and keeps environment isolation. A new test extracts the actual Markdown JSON, executes it unchanged with representative input files, and proves that removing PATH prevents execution. This tests the published example, not a second handwritten copy.
- Full `aff1b86e` verification: 1249 tests, 1248 passed, one optional Console refresh timeout, 285.050 seconds. An unchanged isolated replay passed its event assertion in 791.325 ms (894.066 ms test process). This did not reproduce a server correctness defect. The test's resource deadline now has 30 seconds of headroom instead of 10 under full-suite filesystem/CPU contention; it still requires the real refresh event, bounds connection/read time and cleans up streams/timers. This is a harness deadline, not a relaxed product latency SLA or proof that OS notifications are infallible. The failed full attempt remains recorded.

No production module in `src/` changed after `aff1b86e`. The new candidate still requires complete verification because executable guidance and test behavior changed. Do not report the unchanged isolated replay as a full-suite pass.

## Compatible runtime visual evidence

The browser observation on `535c306e38355864adc336f0a1289f105855bbdd` remains applicable to unchanged dashboard/server/status/observer/attention/browser-script sources. Four viewports, six primary views, reduced motion and six synthetic attention states passed. `.ai-org/artifacts/WI-0230/ui-runtime.png` was visually inspected: completed review, environmental impediment, next step, not-running execution and not-complete acceptance agree. The independent reviewer also examined this image. No new browser execution is claimed for this attempt.

The full corrected run, final independent decision and Doctor results will be appended when observed. Existing V01-V16/F01-F13 coverage is in the main verification record; no new scope, publication, deployment or external permission change is included.
