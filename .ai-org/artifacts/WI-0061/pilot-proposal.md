# WI-0061 bounded instrumentation pilot proposal

## Decision status

**Approved by the repository owner on 2026-08-31.** This approval authorizes one execution attempt inside the exact resource and stop limits below. It does not record that the pilot has run.

## Exact local scope

- Lab root: `/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab`
- Synthetic repository: `/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`
- Repository count: 1
- Codex task count: 1 disposable provider-owned task
- Model turns: 1
- Concurrent model workers: 1
- Company or production data: none
- GitHub, hosted CI, deployment, publication, and additional machines: prohibited

The repository is initialized mechanically from the current local Temple launcher. Mechanical setup does not use a model. It contains one synthetic Work Item whose task reads a bounded Context Capsule and returns a small structured confirmation of the project ID, Work Item ID, Position, and launch revision without modifying product code.

## Proposed model profile

- Requested model: `gpt-5.6-luna`
- Reasoning effort: `max`
- Routing profile: `lightweight-quality` from `DEC-0002`
- Fallback: none
- Retry: none
- Service tier override: none
- Provider: the existing local Codex App Server connection only
- API keys or pay-as-you-go credentials: prohibited

The model choice is for a bounded, reversible task with objective checks. It is not an Agent default and does not authorize automatic routing.

## Approved experiment resources and stop limits

| Resource or boundary | Warning | Hard stop |
|---|---:|---:|
| Provider-reported total Tokens | 40,000 | 60,000 |
| Model turns | — | 1 |
| Provider launch attempts | — | 1 |
| Automatic or manual retries | — | 0 |
| Wall-clock time after launch | 10 minutes | 15 minutes |
| Entire local pilot | 30 minutes | 45 minutes |
| Additional local disk | 150 MiB | 250 MiB |
| Concurrent model tasks | — | 1 |
| External infrastructure spend | ¥0 | ¥0 |

Token observation may arrive during or after the single turn, so the hard limit authorizes interruption when observable and always forbids a second turn or retry. If the first report already exceeds 60,000 Tokens, the pilot records the overrun and stops; it does not attempt to repair the sample with another model call.

These limits are not a quoted monetary price or a new paid plan. They bound the experiment's use of the existing signed-in Codex entitlement, elapsed time, local storage, and execution attempts.

The task uses the user's existing Codex account entitlement only. Temple cannot infer billing from Token telemetry. If the provider requests an API key, pay-as-you-go account, purchase, usage reset, or other paid action, the pilot stops before proceeding.

## Minimum successful correlation

Before the four-repository rehearsal may begin, one provider-owned observation must correlate all of:

- project ID;
- Work Item ID;
- registered task ID;
- Position and Agent Identity;
- execution origin and Provider ID;
- launch revision;
- requested model;
- effective or provider-observed model;
- reasoning effort when the provider exposes it;
- task outcome;
- numeric provider-reported `total_tokens` greater than zero;
- observation time and provenance.

Input, cached-input, output, reasoning-output, model version, and service tier are retained when available. A missing optional field remains unknown. Account-wide usage cannot substitute for task correlation.

## Stop conditions

Stop without retry when any of the following occurs:

- the exact path or resource and stop limits are not approved;
- the provider is unavailable or protocol compatibility fails;
- the effective model is outside GPT-5.6 or differs from the requested Luna profile without explicit approval;
- Work Item, task, Position, Agent, or revision correlation is missing or conflicting;
- a Token, wall-clock, disk, turn, attempt, or concurrency ceiling is reached;
- a credential, paid provider, external write, hosted CI, push, deployment, or release would be required;
- raw prompt content, secrets, or company data would enter retained telemetry;
- Developer and Independent QA separation cannot be maintained.

## Evidence and cleanup

The pilot records its exact configuration, task registration, provider handshake, usage observation or failure, elapsed time, local overhead, and cleanup result. The disposable task is marked completed or failed and archive-ready; actual task archiving remains an explicit app action. The synthetic repository is retained until the human reviews the report, then removed only by a separate explicit cleanup instruction.

## What success does not prove

One correlated task proves only that this instrumentation path worked once. It does not prove Token savings, cost savings, model quality, automatic routing, microservice coordination, enterprise readiness, or the ten-Work-Item longitudinal threshold.
