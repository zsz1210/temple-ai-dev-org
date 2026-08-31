# WI-0066 technical design

## Contracts

`temple.validation-program/v1` is a project-owned manifest. It contains a coordinator project ID, finite limits, local participants, and ordered waves. Each turn names one participant, Work Item, Position, instruction file, allowed paths, `gpt-5.6-*` model, requested reasoning effort, read-only network policy, and `approval_policy: never`.

`temple.validation-program-report/v1` is a generated observation. It records participant revisions, per-repository qualification, aggregate descriptive totals when all inputs are known, and explicit false claim-authority flags.

## Validation boundary

- Resolve every participant and instruction path below an explicit allowed root with real-path containment checks.
- Require unique participant, wave, and turn IDs.
- Require zero retries, no fallback, finite positive ceilings, and warning values no greater than hard values.
- Require total turns and launch attempts within declared maxima.
- Limit each wave to `max_concurrency` and to one turn per participant repository.
- Permit only the 5.6 model family; the retained experiment requests `gpt-5.6-luna` with `max` effort.
- Reject secret-like keys, remote URLs, network access, and any approval policy other than `never`.

## Runner state machine

1. Validate and digest the manifest before reading or creating state.
2. Refuse resume when the persisted manifest digest differs.
3. Inspect all repositories and resource counters before each wave.
4. Persist `running` before launch, increment one launch attempt, and never retry a failed or interrupted turn.
5. Accept cumulative usage callbacks. Request interruption at a per-turn or aggregate Token hard limit and stop the program before another launch.
6. Inspect revision, dirty paths, disk delta, and allowlist conformance after every turn.
7. Persist a completed wave checkpoint only after all turns in the wave complete and all postconditions pass.
8. On restart, skip completed turns and waves. A turn left `running` becomes an ambiguous-attempt hard stop; it is never relaunched automatically.

The module receives injected launch, repository-inspection, disk-measurement, clock, and persistence dependencies so all limit behavior is testable without a model or network.

## Aggregate report

Each participant contributes an exact repository revision and a locally built `temple.usage-baseline/v1`. The aggregator trusts only the baseline's already-qualified completed Work Item IDs and task-shape identities. Composite IDs use `project_id:work_item_id`, preventing collisions across repositories. A report reaches observational qualification only with at least ten distinct composite Work Items and two task shapes. Unknown participant totals keep aggregate totals unknown rather than becoming zero.

The report always denies authority for savings, cost, model quality, routing, enterprise readiness, and automatic routing. Participant repositories remain the sole lifecycle authority.

## CLI surface

- `temple experiment inspect [target] --manifest path --allowed-root path [--json]`
- `temple experiment report [target] --manifest path --allowed-root path [--no-write] [--json]`

The reusable runner remains a module API for an explicitly reviewed experiment adapter. This avoids turning a generic CLI command into unreviewed model-execution authority.

## Installation and ownership

The manifest schema and starter template are framework-managed. An initialized project's manifest is project-owned; the derived report is generated. Upgrades must not overwrite either project state or observations.
