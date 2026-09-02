# Product Direction — WI-0092

## User problem

Temple can show retained Token totals while the current Codex observation path is off. Operators need to know whether new work is being measured, whether old measurements will remain available, and whether missing work can be reconstructed. A framework user who does not want Token analytics must still be able to use the organization, lifecycle, evidence, and QA features without running a background service.

## Confirmed vocabulary

| Term | Definition | Not the same as |
| --- | --- | --- |
| Management Console | The human-facing web interface served by the local Control Plane. | The Codex App Server or an AI task. |
| Control Plane Server | Temple's local process that serves the Console, projects repository state, and owns the local telemetry journal lease. | A remote control service; the LAN listener remains read-only. |
| Codex App Server | The official local Codex protocol process used for authentication, thread history, approvals, and streamed events. | Temple's Console. |
| Observer | Temple's read-only Codex Provider connection that subscribes to supported App Server events and correlates them with registered tasks. | A model, Agent Identity, task runner, or lifecycle authority. |
| Observation mode | One clone operator's choice for whether and how the Control Plane and Observer run. | Canonical project policy shared through Git. |

The UI and documentation may use **Token observation** as the reader-facing feature name. `OB Server` is not a product term because it hides which process is running.

## Modes

| Mode | How it runs | Intended use | Token outcome |
| --- | --- | --- | --- |
| `off` | No local Observer is selected or running. | Users who only need Temple's development organization. | Previously retained detail remains visible; new per-Work-Item detail is not collected. |
| `on-demand` | The operator explicitly runs `control-plane start --codex` for the current session. | Occasional diagnostics or bounded validation. | Correlated live tasks may produce detail while that process is available. |
| `managed-local` | An explicitly installed local OS service starts the same Control Plane and Observer for this clone. | Frequent local development and longitudinal analysis. | Continuous observation is expected, but only supported, registered, correlated tasks can be measured. |

Temple initialization and upgrade select no managed service. On unsupported operating systems the framework must keep `off` and `on-demand` available and report `managed-local` as unsupported rather than silently installing an alternative.

## Retention and reconstruction

- Detailed observations are local generated telemetry below the Git common directory. Stopping the Observer does not delete them.
- Git push, a fresh clone, or canonical Work Item backup does not by itself move this telemetry.
- A completed Work Item does not store a Token total directly. Usage joins separate observations through proven task and Work Item identities.
- Work completed without a correlated detailed notification cannot be reconstructed at Work Item level from repository events, elapsed time, output text, or account-wide usage.
- `account/usage/read` remains account-wide and unallocated. Its availability or daily buckets must never improve Work Item coverage.

## Human experience

Usage must answer these questions in order:

1. Which observation mode is selected for this clone?
2. Is the current Provider capable of collecting detailed usage now?
3. What retained history exists and when was it last captured?
4. How much completed project work is represented?
5. Has work completed after the declared managed observation boundary without detailed correlation?
6. What action is safe: start on demand, inspect the local managed service, or register an external task?

The view must not imply that a running service observes every task. Provider-owned Temple tasks are registered before their first turn. Codex tasks created elsewhere remain outside Work Item attribution until the operator explicitly registers the thread with one Work Item and Position.

## Product defaults

- Framework default: observation optional; no managed service installation.
- Current Temple development clone: `managed-local` is the intended operator mode after this Work Item passes local and independent verification.
- Private LAN: read-only Console only; local Inbox and Agent Commands remain loopback-only.
- Data: numeric usage metadata and bounded identifiers only; no prompts, responses, hidden reasoning, raw Provider payloads, credentials, or account totals.

## Accepted scope

The acceptance criteria in `.ai-org/work-items/WI-0092.json` are approved. Cross-machine aggregation, Linux systemd, Windows service integration, remote mutation, automatic task discovery, and automatic model routing remain future work.
