# Fresh-session clean-room rehearsal v2

- Work Item: `WI-0156`
- Result: **Pass with follow-up findings**
- Matched baseline: `WI-0155`
- Temple source: `bcda3975efd11368e633b241a505efc6f72931e4`
- Package: `@zsz1210/temple-ai-dev-org@0.1.0-alpha.29` (local frozen archive; not published)
- Date: 2026-09-04

## Question

Did the focused onboarding corrections remove the avoidable initialization, Evidence, and cross-repository recovery friction observed in the first QueueKeep clean-room rehearsal?

## Method

The same bounded QueueKeep product request was run with the same model family and reasoning effort as the baseline. The delivery task received only a neutral participant brief and a frozen local package. A second task received only the resulting repository path and a neutral cold-recovery question. Neither task could inspect the Temple source repository or earlier QueueKeep conversations.

The successor run changed only the tested Temple package and the deliberately neutral recovery title. There was no publication, remote write, release, purchase, reset, model retry, or fallback.

## Result

QueueKeep reached accepted closeout without Human intervention or product rework. The separate recovery task found the target repository's own `WI-0001`, recovered the correct responsibilities and revisions, reproduced the tests, and identified the safe stop boundary.

| Measure | WI-0155 baseline | WI-0156 successor | Difference |
| --- | ---: | ---: | ---: |
| Delivery task | 434.800 s | 436.937 s | +2.137 s (+0.49%) |
| Cold recovery | 85.823 s | 104.683 s | +18.860 s (+21.98%) |
| Combined task time | 520.623 s | 541.620 s | +20.997 s (+4.03%) |
| Human interventions | 0 | 0 | no change |
| Product rework after first verification | 0 | 0 | no change |
| Application tests | 2/2 pass | 2/2 pass | no change |
| Doctor | 37 pass, 0 warn, 0 fail | 36 pass, 1 warn, 0 fail | expected unconfirmed-integration warning |
| Provider-reported Tokens | unknown | unknown | not measurable |

This one rerun shows no speed improvement. The elapsed-time difference is descriptive and cannot be attributed to the onboarding changes.

## What improved

- The task found and copied the packaged minimal initialization example. Initialization completed without guessing the configuration shape or repository-source value.
- The frozen scoped package was installed and addressed correctly without the earlier unscoped-module correction.
- The cold-recovery title contained no coordinator Work Item ID. The recovery task selected `WI-0001` directly and did not cross repository namespaces.
- Missing Token telemetry remained `unknown`; no zero or estimated usage was invented.

The structured observation and exact Evidence ID improvements passed deterministic source tests, but the clean-room delivery task chose direct gate artifacts and did not invoke normalized `temple evidence test` capture. This rerun therefore does not claim end-to-end validation of that path.

## New findings

The rerun exposed different friction that should be handled as follow-up work:

1. `temple close --help` does not show the named `--satisfy` gate references required by closeout. The first close command failed, then succeeded after the task inferred and supplied the existing artifacts.
2. A lifecycle transition accepted `.ai-org/artifacts/WI-0001/handoffs/handoff-0001.md` even though that path did not exist. The real generated handoff path was also recorded, so closeout remained recoverable, but gate references should not accept nonexistent local artifacts.
3. Running Doctor during the nominally read-only recovery changed only `.ai-org/views/capabilities.json.generated_at`. Recovery conclusions remained correct, but the command side effect means the repository was no longer byte-for-byte clean after the task.
4. The recovery task first tried invalid Position ID `project_manager`, then corrected it to `release_manager`; a separate shell-quoting error was also corrected. Neither error changed product or lifecycle state.
5. The disposable repository intentionally retained an unconfirmed repository-integration policy. Doctor reported this as one non-blocking warning rather than silently asserting a policy.

## Recovered state

- Product Work Item: `WI-0001`, done and accepted.
- Terminal owner: Engineering Manager Avery (`agent-avery`).
- Developer: Devon (`agent-devon`).
- Independent QA: Emery (`agent-emery`), a distinct identity.
- Implementation and tested revision: `411410751a941e2e34576bfb6fd1fc5f6546ec65`.
- Evidence-only target HEAD: `293b23d6cfdd8d18443ab48c4c8523a6d622482f`.
- Tests: 2 passed, 0 failed.
- Doctor: 36 passed, 1 warning, 0 failures.
- Remote: none.
- Unresolved Work Items: none.

## Decision

The four focused WI-0156 corrections are suitable to retain. The run supports a narrow claim that packaged initialization and cross-task recovery became more direct without increasing Human intervention or product rework. It does not support a general speed, Token, quality, human-usability, or multi-repository efficiency claim.

Before a public Alpha freeze, address the closeout-help, nonexistent-evidence-path, and read-only Doctor findings with deterministic regression tests. Do not rerun this clean-room scenario merely to obtain a prettier result; run it again only after those product behaviors change under a separately approved validation slice.
