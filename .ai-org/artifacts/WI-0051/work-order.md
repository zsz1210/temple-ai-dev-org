# WI-0051 work order

## Outcome

Run one bounded local instrumentation pilot that tests whether Temple can correlate one real Codex task to an exact repository, Work Item, Position, revision, model, and provider usage observation.

The pilot may conclude `observed`, `partial`, or `unavailable`. It must not conclude that Temple saves Tokens, time, cost, or defects.

## Proposed local target

`/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`

This will be a new local Git repository containing synthetic data only. It will not have a GitHub remote.

## Proposed Agent identities

| Assignment slot | Display name | Positions |
|---|---|---|
| Coordination | Rowan | Engineering Manager, Release Manager, Observer |
| Product Design | Claire | Product Manager, UX Designer, UI Designer |
| Technical | Nolan | Tech Lead |
| Delivery | Casey | Developer |
| Quality | Iris | Quality & Evaluation Engineer, Independent QA |

The names are project-local labels. Stable IDs remain separate. Casey and Iris keep Developer and Independent QA identity-distinct.

## Proposed synthetic task

Implement a dependency-free Node.js availability summary:

- `summarizeAvailability(items)` accepts synthetic items whose status is `available`, `reserved`, or `out_of_stock`;
- it returns deterministic total and per-status counts;
- invalid input fails explicitly;
- local Node tests and a short README example pass;
- the task stops after one accepted candidate and its handoff evidence.

This task is deliberately small but still exercises specification, source changes, tests, revision evidence, task registration, and Independent QA boundaries.

## Fixed pilot budget proposed for approval

| Budget dimension | Ceiling |
|---|---:|
| User-owned Codex tasks | 1 |
| Model | `gpt-5.4-mini` |
| Reasoning effort | `low` |
| User turns sent to the task | 1 implementation instruction |
| Provider-reported total Tokens | 25,000, when observable |
| Wall-clock execution | 15 minutes before stop and review |
| Local experiment disk growth | 250 MB |
| Automatic retries | 0 |
| Network dependencies and external writes | 0 |

The Token ceiling cannot be enforced mid-turn if the provider does not expose live usage. In that case the one-turn, one-task, one-deliverable boundary is the enforceable limit. Any post-run exceedance is recorded and no retry is started.

## Initialization protocol

1. Wait for explicit human confirmation of all five display names and the budget above.
2. Create the local repository and a temporary `temple.init/v1` config outside it.
3. Run Temple dry-run, real init, the repository launcher, Doctor, and Status.
4. Confirm the central `project-overlay/` contains none of the pilot names.
5. Create and prepare one synthetic Work Item in the pilot repository.
6. Create one user-owned Codex task using the approved model and reasoning effort, then register its stable thread ID before interpreting telemetry.
7. Observe preflight and usage report before, during when possible, and after task completion.
8. Record exact success, partial support, or unavailability; verify and stop.

## Excluded actions

- Four-repository rehearsal or any second synthetic service.
- A second Codex task, retry task, automatic continuation, or model switch.
- GitHub, pull requests, hosted CI, external trackers, network packages, deployment, production, release, or publication.
- Company data, credentials, personal information, raw prompts, hidden reasoning, source bodies, or full tool payloads in telemetry.
- Any savings, model-quality, routing, cost, or enterprise-readiness claim.

## Human confirmation required

Initialization and task creation remain blocked until the owner explicitly confirms:

1. Rowan, Claire, Nolan, Casey, and Iris with the mappings above; and
2. the one-task `gpt-5.4-mini` / low-reasoning / 25,000 observed-Token / 15-minute budget.

