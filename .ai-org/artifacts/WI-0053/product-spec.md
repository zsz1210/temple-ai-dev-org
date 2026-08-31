# Product specification: Temple development model policy

## User need

Temple's own development should preserve strong judgment where mistakes are expensive while avoiding an all-`Sol xhigh` habit for work that is narrow, reversible, or mechanically verifiable. The user also wants low-cost Luna work to retain enough reasoning quality instead of being reduced to a lowest-effort default.

## Policy profiles

| Profile | Default model | Reasoning | Intended task shape |
|---|---|---|---|
| `critical-planning` | `gpt-5.6-sol` | `xhigh` | consequential product or architecture decisions, security, migrations, ambiguous cross-system design, and high-risk review |
| `standard` | `gpt-5.6-terra` | `medium` or `high` | normal implementation, diagnosis, documentation synthesis, and broad exploration |
| `lightweight-quality` | `gpt-5.6-luna` | `max` | bounded, reversible tasks with clear acceptance checks where quality matters more than minimum latency |
| `mechanical-fast` | `gpt-5.6-luna` or deterministic tooling | `medium`, `low`, or no model | formatting, extraction, inventory, repetitive transformations, and local checks with objective verification |

## Selection rules

1. Choose by task shape and risk, not Agent display name alone.
2. Explicit human task-level selection overrides the advisory profile when it stays inside authorized scope and spending boundaries.
3. Purely deterministic work should not call a model just because a model is available.
4. A fallback outside the GPT-5.6 family requires an explicit task-level exception; it is never silent.
5. Record requested model and effective model separately whenever execution metadata is available.
6. Reasoning effort is part of the selection and must not be inferred from the model alias.

## Authority and implementation state

This policy belongs to development of the Temple repository. It is not a framework-managed default and is not copied into repositories that adopt Temple. It is initially manual and advisory: neither the CLI nor the Management Console chooses or changes a model automatically.

## Evaluation boundary

The policy does not claim that one profile is cheaper, faster, or better. Automatic routing may be proposed only after representative accepted Work Items provide correlated model, reasoning, Token, latency, outcome, and rework evidence. Any later automation requires a separate Work Item, design, tests, safe fallback, and human approval.
