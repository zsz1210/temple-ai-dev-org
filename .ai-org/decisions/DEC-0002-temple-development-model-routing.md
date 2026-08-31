# Decision Ledger

## Decision

- ID: DEC-0002
- Status: accepted
- Date: 2026-08-31
- Owner position: Tech Lead
- Work item: WI-0053

## Context

Temple's own development has historically favored the most capable model and very high reasoning because careful planning matters. That is a sound bias for consequential decisions, but applying it to every bounded or mechanical task can add avoidable Token use and latency. The user also prefers `gpt-5.6-luna` at `max` reasoning for inexpensive lightweight work rather than lowering reasoning quality solely to minimize cost.

The project needs a durable selection policy that preserves the quality-first intent without hard-coding model preferences into the reusable Temple framework or claiming that automatic routing has been implemented.

## Options considered

1. Use `gpt-5.6-sol` with `xhigh` reasoning for every model-backed task. This maximizes a consistent quality bias but spends premium reasoning on narrow, reversible, or mechanically verifiable work and is inherited by subagents unless overridden.
2. Use `gpt-5.6-luna` with `max` reasoning for nearly all work. This is economical and can retain substantial reasoning effort, but it treats task risk and capability needs as uniform and lacks representative project evidence for consequential planning.
3. Select a GPT-5.6 model and reasoning effort by task shape, retain a quality-first `Luna max` profile, and keep routing manual until representative evidence supports automation.

## Decision and rationale

Adopt option 3 for development of the Temple repository:

| Profile | Model | Reasoning | Use when |
|---|---|---|---|
| `critical-planning` | `gpt-5.6-sol` | `xhigh` | product or architecture decisions, security, migrations, ambiguous cross-system design, or other high-risk judgment |
| `standard` | `gpt-5.6-terra` | `medium` or `high` | ordinary implementation, diagnosis, documentation synthesis, and broad exploration |
| `lightweight-quality` | `gpt-5.6-luna` | `max` | the task is bounded and reversible, has objective acceptance checks, and quality matters more than minimum latency |
| `mechanical-fast` | `gpt-5.6-luna` or deterministic local tooling | `medium`, `low`, or no model | formatting, extraction, inventory, repetitive transformation, or checks that do not require model judgment |

Selection is based on task shape and risk, not Position or Agent display name alone. An explicit human choice for the exact task takes precedence within the authorized scope and spending boundary. A fallback outside the GPT-5.6 family requires an explicit task-level exception and must not be silent.

Requested and effective model remain separate facts. Reasoning effort is recorded independently when available. `Luna max` is a quality-first lightweight profile, not proof that the task is cheapest overall: higher reasoning can increase Tokens and latency, and accepted outcomes must still be evaluated.

This policy is manual and advisory. It does not enable CLI, Management Console, coordinator, or Agent-level automatic routing. It is project-owned and is not a default copied into repositories that adopt Temple.

## Consequences and follow-up

- Files or work items affected: `WI-0053` and `docs/operations/token-efficiency-and-model-routing.md`.
- Open questions: actual Token, latency, quality, retry, and rework differences across representative Temple task shapes; whether later machine-readable project policy is justified.
- Revisit trigger: ten or more qualified accepted Temple Work Items across at least two task shapes provide correlated model, reasoning, Token, outcome, and rework evidence; a matched evaluation authorizes comparison; or the available GPT-5.6 models or official guidance materially change.
