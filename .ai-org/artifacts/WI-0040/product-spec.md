# Product specification — Dashboard usage and model observability

## User question

The Dashboard must answer five questions without requiring the operator to run a CLI report:

1. Is detailed Token evidence available for this project?
2. How close is the evidence to Temple's longitudinal comparison threshold?
3. What Token composition and usage drivers are actually observed?
4. Which models and task shapes are represented by the evidence?
5. Which conclusions are still prohibited because the evidence is incomplete?

## Information contract

The control-plane snapshot includes one bounded `usage` object using the existing `temple.usage-baseline/v1` contract. It is generated from retained provider-reported usage events, canonical Work Item state, and the registered task topology. Snapshot generation must not write `.ai-org/views/usage-baseline.json`, call a model, query account-wide usage, calculate a price, or change canonical state.

The Dashboard displays:

- baseline state and detailed observation count;
- qualified completed Work Items against the configured threshold;
- qualified task-shape count and registered completed-Work-Item coverage;
- input, cached-input, output, reasoning-output, and total Tokens, preserving `unknown` independently for every field;
- monetary cost as `unknown` until a versioned approved price source exists;
- observed driver groups ordered by total Tokens when total Tokens are known, with Work Item, Position, lifecycle stage, model, and outcome dimensions;
- the read-only recommendation state and why no automatic route or model switch is authorized.

## Required states

### Insufficient data

Show `No detailed Token observations yet`, `0 / 10 qualified Work Items`, the registered-task coverage, all unavailable numeric fields as `unknown`, and the next evidence needed. Do not render an empty chart with a zero-valued axis.

### Partial data

Show each observed Token field separately, mark missing fields and dimensions as `partial` or `unknown`, and retain uncorrelated or stale observation counts. Do not sum a field across groups when any included observation lacks that field.

### Qualified longitudinal coverage

Show the qualified status and available within-shape model comparison as exploratory, low-confidence evidence. Keep savings, monetary cost, model quality, routing authority, and automatic switching disabled until separately matched evaluation evidence exists.

### Snapshot stale or unavailable

Keep the last visible usage data, inherit the global stale warning, and do not present the data as current. This workspace has no mutations in either the loopback or private viewer.

## Privacy and authority

The projection may contain bounded project, Work Item, Position, stage, task, provider, model, reasoning-setting, service-tier, digest, outcome, timestamp, and numeric usage fields already allowed by the usage-baseline contract. It excludes raw prompts, hidden reasoning, source bodies, tool payloads, credentials, raw provider payloads, and account-wide usage values.

The workspace is observational. It cannot approve a gate, authorize spending, select or switch a model, create a task, execute an Agent Command, or mutate any participant repository.

## Acceptance focus

The first self-host state is expected to remain `insufficient-data`, with zero detailed observations and no Token or cost claim. Correctly displaying that absence is a passing state, not a reason to manufacture fixture data in the live Dashboard.
