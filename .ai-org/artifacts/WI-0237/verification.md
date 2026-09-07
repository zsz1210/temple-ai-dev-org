# WI-0237 Developer verification

Runtime: Node.js v24.20.0 on macOS. Repository-local dependencies were installed
with `npm ci --ignore-scripts --offline`; no package or lockfile change.

- Focused real fixture, observation, sequence and native-runner tests: **41/41**,
  no failures, skips or cancellations; 34,656.868459 ms in the recorded invocation.
- Complete `npm run verify`: exit 0, **763/763**, no failures, skips or
  cancellations; 166,115.362458 ms reported suite duration. Repository/package
  checks passed. Full log is local, not a public raw execution artifact.
- Additional observation preflight probe: **9/9** synthetic supported/unknown
  cases, no generation and no raw data returned. The unit corpus also checks 42
  supported wrapper/category combinations plus rejected/unknown forms.
- Doctor after canonical mutation: 36 pass, one pre-existing stale parallel-plan
  warning, no failure. No worker was dispatched from that stale plan.
- `git diff --check` passed. The diff from `f61f755d` contains no changes to
  WI-0234/WI-0236 artifacts or the historical continuity adapter.

Scope: Developer behavioral evidence only. Browser gate is not applicable: no UI
changes. This is not Independent QA, evidence of lower model Token use, live
provider qualification, merge approval or a release. No model experiment ran.
The tested code will be pinned by the Developer handoff; subsequent report-only
updates require fast verification and cannot silently change that candidate.
