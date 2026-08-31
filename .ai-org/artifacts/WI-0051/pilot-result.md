# WI-0051 pilot result

## Outcome

The bounded local instrumentation pilot completed with a **partial** telemetry result and a passing synthetic product candidate.

Temple successfully correlated one initialized repository, `WI-0001`, Developer Casey, `task-0001`, one stable Codex thread, the exact launch revision, and the completed candidate revision. The live Codex observer did not capture `thread/tokenUsage/updated`, so per-task Token fields remain unavailable rather than zero.

No Token, cost, quality, routing, or savings claim is supported by this run.

## Local target

- Repository: `/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`
- Project ID: `temple-instrumentation-pilot`
- Initialized Temple version: `0.1.0-alpha.27`
- Governance-ready task launch revision: `abb54194d1c1d53c8d3561005615b9ebabe19d40`
- Product candidate: `c6ca2189b32be5e5346914350c33acd69291f739`
- Organizational closeout: `341e866942e6b9633226d76330f9d107a4995b3d`
- Final target state: clean `main`, `WI-0001` done, Doctor 36 pass / 0 warn / 0 fail

The target uses project-local Rowan, Claire, Nolan, Casey, and Iris identities. The central `project-overlay/` contains none of those display names.

## Task execution

- Codex title: `WI-0001 · Developer · Casey`
- Stable thread ID: `01a05656-0751-77e2-9868-d729e34eef96`
- Model requested: `gpt-5.4-mini`
- Reasoning requested: `low`
- Implementation prompts: 1
- Automatic retries: 0
- Model switches: 0
- Turn duration: 69,533 ms
- Candidate changes: `README.md`, implementation module, and one Node test module
- Candidate tests: 5 pass / 0 fail

## Independent verification

Iris reproduced the exact candidate from a fresh detached worktree. The built-in suite passed 5/5, the revision delta contained only the three expected files, `git diff --check` passed, the worktree stayed clean, and additional frozen-input plus invalid-status counterexamples passed.

The target's Developer and Independent QA identities are distinct: Casey and Iris.

## Telemetry result

- Pre-task: zero registered tasks and no live detailed usage source.
- Post-registration: one active registered task and exact Work Item/thread/revision correlation.
- Codex control plane: bounded history reconciliation succeeded, but live attachment returned `thread-resume-invalid`; the retained evidence does not prove the cause.
- Detailed per-thread usage observations: 0.
- Provider-reported task Tokens: unavailable.
- Account capability probe: available in 638 ms, no model call, raw account values discarded, account-wide and unallocated.
- Final usage baseline: `insufficient-data`; 0 qualified completed Work Items out of the required 10; savings claim disallowed.

## Budget result

| Boundary | Result |
|---|---|
| User-owned Codex tasks | 1 of 1 |
| Implementation prompts | 1 of 1 |
| Automatic retries | 0 of 0 |
| Wall clock | 69.533 s, below 15 min |
| Target footprint after closeout | 1,380 KiB, below 250 MB |
| Provider-reported total Tokens | unavailable; ceiling compliance cannot be verified |
| Product dependency installation | none |
| GitHub, tracker, hosted CI, deployment, external release, publication | none |

## Framework findings retained for later review

1. Registering a task after creation is not equivalent to having a live Token subscription. The observer needs a provider-owned launch or another race-free host bridge before detailed usage can be relied upon.
2. The canonical task registry does not persist the requested model and reasoning effort, so the human-facing task and usage surfaces cannot reconstruct them from canonical state alone.
3. Work Item claim base, exact task-launch revision, and completed candidate are different revisions. The task record and console must label them separately.
4. Casey correctly left coordinator-owned `.ai-org` mutations untouched, but reported them as unrelated pre-existing changes. Developer guidance or isolation should make coordinator-owned dirtiness easier to interpret.
5. Casey read local Codex memory before the routed repository capsule. Context routing is currently guidance, not enforced containment.
6. Two default-launcher checks during initialization had no captured output before all later commands were pinned to the exact local CLI. Strict zero-network initialization is therefore not proven.

These are findings, not authorization for a second task or framework implementation in this Work Item.

## Stop boundary

The target is preserved for review. No second feature, retry task, alternate model, repository rehearsal, release, publication, or follow-up implementation was started.

