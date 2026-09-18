# Integration evaluation

Exact candidate: `4a6c9d8f2571e27e8419674fc7a919285e7509f8`.
Full verification: **1,294/1,294 passed**, zero failures, skips or cancellations.
`npm run verify` exited 0, 257.600320 seconds wall; Node runner duration
256,162.298208 ms. Raw output: [full-final.log](full-final.log).
Node 24.20.0, macOS arm64; offline tests, no provider experiment or quota query.

Repository structure, documentation links and the actual 451-file package manifest
passed in the same command. No runtime, script, framework overlay or documentation
changes followed the candidate. Later lifecycle/evidence files do not silently
change the tested candidate. No Console/UI modification requires a new browser run.

The first full attempt at 11b46412 was 1,293/1,294, 257.731085 seconds wall. One
additional legacy test expected a general HEAD error after a committed product
change; the actual physical mismatch rejection was correct. Same-scope rework
updated the test and preserved no-write checks. The two full runs total
515.331405 seconds of command wall time, excluding review and coordination. This
avoidable stale-assertion cost is retained, not counted as useful extra coverage.
The initial focused failures, corrected checks and scope limits are in the
[developer record](developer-evidence.md) and [correction](developer-evidence-final.md).

The combined tests cover ordinary completion, explicit recovery, portable fresh
clone diagnostics, proposals, conflict refusal, safe administrative descendants,
hidden physical modifications and changed-then-reverted history. Existing
measurement and readiness suites remain in the full run. Historical archive
verification preserved 23 files and 31 event lines, with current WI-0247 unchanged.

This supports the bounded integration's technical test gate. The separate remote
review must still provide its own exact-candidate judgment before organizational
acceptance or PR readiness. It is not multi-human onboarding, billing comparison,
release or deployment evidence.
