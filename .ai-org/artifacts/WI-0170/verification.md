# WI-0170 — Developer verification and performance observations

## Scope and method

Local Node.js 24.20.0 measurements on the same development machine. Baseline source: `65bf39cc5aa4783e5887810f1dbfd7a71bfe3bde`. Timings are single diagnostic observations, not statistical estimates or hosted CI results. No provider calls or paid model experiment ran.

| Observation | Before | After |
| --- | ---: | ---: |
| Doctor elapsed time with subprocess instrumentation | 33,226 ms | 4,926 ms |
| Doctor Git subprocess count | 3,638 | 463 |
| Doctor findings | 36 pass / 1 warning / 0 failures | 36 pass / 1 warning / 0 failures |
| Complete Node test run | 449 pass / 0 failures; 83,223 ms | 458 pass / 0 failures; 77,260 ms |

The existing Doctor warning is a stale generated parallel plan, not an evidence validation failure. The evidence registry was unchanged for the timing comparison. A Work Item and generated status changed during implementation. Doctor time fell about 85% in these observations; full-suite wall time fell about 7%. Do not add individual test durations or promise these percentages on another machine. Hosted CI has not been rerun for this candidate.

The acquisition-classifier test was previously about 11,099 ms within the full parallel run and now took about 21 ms in an isolated run. These execution conditions differ; the structural change is removal of complete lab construction from that classifier test. Both full preparation tests remain.

## Checks

- `npm run verify`: repository, documentation-link, package checks and 458 passing tests; zero failures or skips.
- `npm run test:fast`: 50 passing tests in about 1.1 seconds locally.
- New evidence-reader behavior covers deduplication, binary/empty/space/newline paths, per-entry mismatches, missing revisions, unknown Work Items, mutable fallback files, preservation tags across invocations, malformed batch fallback, and non-blob rejection.
- New selection tests cover complete group inventory, safe default classification, unknown/shared fallback, and committed/staged/unstaged/untracked/rename paths.
- Browser-harness lifecycle tests inject server, browser-launch, and view failures; both resources and temporary state are cleaned. This is not a new visual acceptance claim.
- The actual npm dry-run remains in `npm run check`. Unit tests now exercise forbidden/missing/undeclared/oversized manifests rather than repeat the same successful package construction.
- Ordinary CI retains a bounded fast suite and Doctor; Release retains `npm run verify`. No publishing, hosting settings, model routing, or sealed experiment data changed.

## Review boundary

Developer evidence is not Independent QA. Exact candidate revision and independent findings are recorded at handoff. Full verification remains required for code changes made after this result. Later documentation or lifecycle records require their applicable checks without misrepresenting their revision as a separately tested code revision.
