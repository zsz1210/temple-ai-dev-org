# Token Efficiency and Model Routing

- Status: Alpha.25 observation and attribution foundation implemented; recommendation and routing do not exist
- Primary readers: maintainers, Engineering Managers, Tech Leads, Observers, and cost-accountable humans

Temple treats Token usage as an operational signal. The goal is not the smallest prompt or the cheapest individual turn. The goal is a correct, accepted Work Item with less waste, rework, latency, and coordination cost.

## Does counting Tokens consume more Tokens?

Usually, no.

| Measurement method | Additional model Tokens | Temple policy |
|---|---:|---|
| Read usage metadata returned by the provider | None | Preferred exact source |
| Run a local tokenizer before or after a request | None | Allowed as an explicitly versioned estimate |
| Read a provider billing or usage API | None for inference; may have API and operational cost | Optional and separately authorized |
| Ask another model to inspect a prompt and estimate its usage | Yes | Prohibited solely for Token counting |

Recording numeric metadata still uses a small amount of local CPU, memory, disk, and dashboard bandwidth. That overhead must be measured separately from model Tokens and kept bounded through aggregation and retention.

OpenAI's Responses API, for example, returns input, cached-input, output, reasoning-output, and total usage fields in the response itself. Current official guidance also recommends comparing model and reasoning configurations on representative tasks by quality, tokens, latency, and cost rather than assuming one configuration is always best. See the [Responses usage schema](https://developers.openai.com/api/reference/cli/resources/responses/methods/retrieve) and [model guidance](https://developers.openai.com/api/docs/guides/latest-model).

## What Temple already has

The control plane can normalize provider-emitted:

- input Tokens;
- cached-input Tokens;
- output Tokens;
- reasoning-output Tokens;
- total Tokens;
- model context-window size;
- an explicit project Token budget and usage-anomaly condition.

It deliberately keeps raw prompts, hidden reasoning, command output, secrets, and full tool payloads out of durable telemetry. Monetary cost remains unavailable without a configured, versioned price source.

Alpha.25 adds a usage-attribution envelope and a read-only baseline report. Every observation carries the dimensions the provider and repository can prove, plus a `missing_dimensions` list and `partial` quality when model, version, service tier, Context Capsule digest, capability digest, or another field is unavailable. Reconciled history labels lifecycle stage as the current canonical stage at reconciliation rather than inventing a historical stage.

Create a read-only report:

```bash
node ./templew.mjs usage report . --no-write --json
```

Remove `--no-write` to create `.ai-org/views/usage-baseline.json`. The report sums provider last-usage deltas instead of cumulative totals, groups drivers by the attribution dimensions below, and leaves monetary cost unknown without a versioned price source. This remains observation infrastructure, not a completed optimization system.

## Attribution contract

Each usage observation should carry the dimensions the provider and Temple can prove:

| Dimension | Why it matters |
|---|---|
| `project_id` | Separates authoritative project boundaries |
| `work_item_id` | Connects consumption to one intended outcome |
| `position_id` | Shows which responsibility used the context |
| `lifecycle_stage` | Distinguishes Spec, Design, Build, Test, Eval, QA, and Release Gate |
| `task_id` and provider task ID | Identifies the actual execution session |
| attempt or retry chain | Exposes repeated work and failure loops |
| provider, model, and effective model version | Makes comparisons reproducible |
| reasoning configuration and service tier | Explains material execution differences |
| Context Capsule and capability-set digest | Detects repeated or oversized routed context without storing its body |
| source and quality | Distinguishes provider-reported, locally estimated, and unknown usage |
| outcome | Relates usage to accepted, rejected, blocked, or abandoned work |

One Agent Identity may hold several Positions. Attribute usage to the effective Position and lifecycle stage at event time, not to the display name alone. Missing correlation is `unknown`, never zero and never silently assigned to the nearest task.

## Finding the consumption driver

A high Token count is a lead for investigation, not proof of waste. The Observer should support drill-down in this order:

1. Project and Work Item.
2. Position and lifecycle stage.
3. Agent task and attempt chain.
4. Provider, model, reasoning configuration, and service tier.
5. Input, cached input, output, and reasoning-output composition.
6. Context Capsule size, capability set, tool-call count, retry count, and final outcome.

Useful initial measures include:

- total Tokens per accepted Work Item;
- Tokens per passed lifecycle gate;
- retry and abandoned-attempt share;
- cached-input ratio and repeated-context share;
- context loaded but not referenced in the final evidence path;
- Token change alongside acceptance rate, defects, rework, elapsed time, and human intervention.

Temple should call this **usage-driver analysis**, not blame an Agent or Position for being a "culprit." Product discovery, architecture, security review, and Independent QA may justifiably consume more Tokens when they prevent expensive failure later.

## Budget contract

Budgets may be declared at project, Work Item, Position, lifecycle-stage, or task level. More-specific policies can tighten a parent budget; relaxing an organizational limit requires explicit authority.

The first implementation uses budgets as:

- forecasts before dispatch;
- warnings as consumption approaches a threshold;
- anomaly signals after an unexpected spike;
- inputs to a human-approved routing recommendation.

A budget must not authorize Temple to remove required specifications, evidence, privacy controls, Independent QA, or approval gates. When safe completion cannot fit the budget, Temple escalates the conflict instead of silently degrading the work.

## Model-routing contract

Positions provide useful defaults, but Position alone is not enough to choose a model. Routing also considers task shape, lifecycle stage, risk, required capabilities, context size, privacy, latency, provider availability, and the project's spending policy.

Examples of reasonable defaults—not hard-coded model names—are:

- Product Manager and Tech Lead: broader context and stronger synthesis for consequential scope or architecture decisions.
- Developer: bounded code and contract context, with capability scaled to implementation difficulty.
- Quality Evaluator and Independent QA: exact candidate, acceptance criteria, and evidence with sufficient independence and reasoning quality.
- Observer: compact structured projections and inexpensive deterministic aggregation whenever model judgment is unnecessary.

Selection precedence is:

1. an explicit human override for the exact task, within the configured allowlist and spending boundary;
2. mandatory High-Assurance, privacy, data-residency, or capability requirements;
3. project and Work Item routing policy;
4. Position and lifecycle-stage default;
5. provider default, recorded as such.

Every routed task records requested and effective provider, model, model version or alias resolution when available, reasoning configuration, service tier, routing-policy version, and fallback reason. An unavailable preferred model must not silently fall back to a model that violates a capability, privacy, or risk requirement.

## Evaluation before automation

Model choice is promoted only after representative evaluations compare:

- acceptance and task-success rate;
- required evidence completeness;
- defect and rework rate;
- total and cached Tokens;
- latency and human intervention;
- monetary cost when a user-approved versioned price source exists.

The initial release should show observations and recommendations. Opt-in automatic routing follows only after the policy has reproducible evaluation evidence and a safe fallback. Adaptive self-modifying routing is later scope.

## Cost and pricing boundary

Token counts are not monetary cost. Cost also depends on provider, model, date, input or output class, cache reads and writes, service tier, currency, discounts, and provider-specific billing rules.

Temple therefore:

- stores numeric usage independently from price;
- accepts price data only from an identified, versioned, user-approved source;
- records the pricing source and effective date with every calculated projection;
- never purchases capacity, changes plans, or authorizes spending;
- marks cost `unknown` when usage or pricing provenance is incomplete.

## Privacy and retention

Usage reporting retains bounded identifiers and numeric measurements. It does not require raw prompts, hidden reasoning, source-code bodies, tool payloads, credentials, or personal data. Portfolio aggregation should prefer project-level summaries and drill-down links to the authoritative project rather than copying detailed telemetry across repositories.

## Delivery slices

1. **Attribution — implemented:** normalized usage includes proven Work Item, Position, observed stage, task, attempt, provider, model, provenance, quality, and outcome fields; unavailable values stay unknown.
2. **Reporting — foundation implemented:** `usage report` creates a bounded driver view and versioned baseline, while longitudinal comparison remains pending.
3. **Policy — pending:** add hierarchical warning budgets and model allowlists without automatic switching.
4. **Recommendation — pending:** evaluate representative task classes and display a proposed route with its reasons.
5. **Opt-in routing — later:** apply an approved route, record the effective configuration, and preserve fallback and refusal evidence.

None of these slices changes lifecycle authority or replaces outcome-based evaluation.
