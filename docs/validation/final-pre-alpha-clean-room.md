# Final pre-Alpha clean-room rehearsal

WI-0158 tested whether a new Codex task could use the exact post-WI-0157 Temple package to complete a small product request, and whether a second task could recover the result from repository evidence alone. Both tasks completed. The observation supports the narrow AI-assisted Core Path; it does not prove general speed, Token savings, or unaided human usability.

## What was tested

- Source revision: `54d14f4e94a930719ca7674ebf1ad74be89de7ac`
- Unpublished package: `@zsz1210/temple-ai-dev-org@0.1.0-alpha.29`
- Package SHA-256: `43cefd40bcb5d21a3159419eb89d31d691f0ac81a9489a38a4b4824ad5cf2f0b`
- Package size: 804,392 bytes packed; 3,192,729 bytes unpacked; 374 archive entries
- Scenario: build QueueKeep, a local persistent CLI with add, list, complete, and deterministic tests
- Provider route: two sequential `gpt-5.6-terra` Medium tasks, one attempt each, no fallback or reset
- Isolation: the delivery task received only the frozen package and product brief; the recovery task received only the resulting repository path and a read-only recovery question

No source or target remote write, repository visibility change, tag, GitHub Release, npm publication, deployment, announcement, credit purchase, automatic reload, reset, retry, or model fallback occurred.

## Result

The delivery task created and accepted QueueKeep `WI-0001`. Developer Devon and Independent QA Elliot were distinct Agent Identities. The exact implementation and QA revision was `f8ab903756b091c5b48643b972119dab03c5394e`; the final closeout-only HEAD was `e2af608f4e6ab96c461b7d91a6322aee1ae34938`.

Independent QA and the coordinator each reproduced two passing application tests. Final Doctor reported 37 passes, no warnings, and no failures. The repository was clean after delivery and remained clean after recovery.

The recovery task correctly identified QueueKeep, its accepted Work Item, the responsibility split, scope exclusions, tested and closeout revisions, test and QA evidence, healthy state, and the safe stop boundary. It received no delivery conversation or coordinator Work Item ID, performed no repository mutation, and did not confuse `WI-0158` with the target's `WI-0001`.

## Matched observations

| Observation | WI-0155 | WI-0156 | WI-0158 |
| --- | ---: | ---: | ---: |
| Delivery elapsed | 434.800 s | 436.937 s | 444.325 s |
| Cold recovery elapsed | 85.823 s | 104.683 s | 86.210 s |
| Combined elapsed | 520.623 s | 541.620 s | 530.535 s |
| Human interventions | 0 | 0 | 0 |
| Accepted bounded Work Item | Yes | Yes | Yes |
| Clean read-only recovery | Yes | No — generated timestamp changed | Yes |
| Reliable Token total | Unknown | Unknown | Unknown |

Compared with WI-0155, WI-0158 was 1.90% slower overall. Compared with WI-0156, it was 2.05% faster overall. Those small, opposite deltas do not establish a speed change. The useful repeated result is functional: all three tasks completed the bounded outcome without Human intervention, and the WI-0157 read-only correction removed the recovery mutation observed in WI-0156.

## Friction retained

The delivery task made two recoverable mistakes:

1. Its first test exposed a duplicate CommonJS package setting that overrode the intended ESM configuration. It corrected the scaffold and reran the deterministic suite.
2. One lifecycle transition contained a placeholder Evidence ID. Temple rejected it before mutation, after which the task used the exact recorded ID.

These events show that the workflow is fail-closed and recoverable, but not friction-free. The ESM correction is ordinary implementation rework rather than evidence of a Temple contract defect. The placeholder error is a candidate for future CLI ergonomics or structured command generation, but one occurrence does not justify another pre-Alpha product change by itself.

## Decision

The clean-room gate passes for the pre-freeze Alpha preparation boundary. Another identical rehearsal is not recommended before the release scope and version are selected: it would add another small sample without resolving the unavailable Token telemetry or unaided-human-usability questions.

The next release steps remain separate Human decisions: choose the candidate version and claim boundary, freeze one exact commit, repeat exact-candidate package and browser qualification where required, review publication evidence, and separately authorize repository visibility, tag, GitHub Release, npm, or announcement actions.

A read-only public-profile audit during evidence reconciliation also found four blocked maintainer-path occurrences in retained WI-0155 and WI-0156 artifacts. The package surface remained clean. Those historical records need a provenance-preserving redaction or an explicitly reviewed publication treatment before repository visibility changes; they do not change the clean-room result.

## Evidence

- Protocol: `.ai-org/artifacts/WI-0158/clean-room-protocol.json`
- Exact approval: `.ai-org/artifacts/WI-0158/account-approval.json`
- Machine-readable result: `.ai-org/artifacts/WI-0158/final-clean-room-result.json`
- Prior baseline: `.ai-org/artifacts/WI-0155/clean-room-result.json`
- Prior matched rerun: `.ai-org/artifacts/WI-0156/clean-room-comparison.json`

The disposable repository's absolute local path is intentionally omitted from retained public-facing evidence.
