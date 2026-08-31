# WI-0060 product specification

## User question

When I open Team, what model is each AI teammate using now, and what is the most recent model evidence when nobody is running?

## Product behavior

Each active Agent card includes one compact model panel. The panel uses this precedence:

1. `Active model` when an active provider task has an observed effective or correlated model.
2. `Last observed` when a completed or non-active task has correlated model evidence.
3. `Requested model` when canonical task registration records only a request and no effective observation exists.
4. `No model observation` when no task-level model evidence exists for the Agent.

Observed/effective model and requested model remain different facts. If they differ, the requested value is shown as secondary context. A requested-only record never receives an `Active` or `Last observed` label.

## Human-readable provenance

When known, the panel may show:

- reasoning effort;
- Work Item ID and task ID;
- observation time;
- requested model when it differs from observed execution.

It must not show prompt content, hidden reasoning, credentials, raw provider payloads, or an invented online state.

## Acceptance scenarios

- An Agent with a live observed task sees `Active model` even if an older completed task exists.
- An Agent with only a correlated completed-task observation sees `Last observed`.
- An Agent with a requested model but no effective observation sees `Requested model` and explanatory copy.
- An Agent with no registered or correlated task evidence sees `No model observation`.
- The five configured Temple teammates remain readable on wide desktop, tablet, and mobile.
- Private LAN access remains read-only and contains no local mutation controls.

## Non-goals

- assigning a permanent model to an Agent Identity;
- choosing or switching models;
- claiming cost, quality, or Token savings;
- adding remote Agent Commands;
- changing organization assignments or model-routing policy.

