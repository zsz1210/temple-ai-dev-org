# Token Efficiency and Model Routing

- Status: Alpha.27 exposes telemetry qualification and low-confidence read-only candidates through the integrated toolkit; matched evaluation and routing remain unavailable
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

OpenAI's Responses API, for example, returns input, cached-input, output, reasoning-output, and total usage fields in the response itself. Current official guidance also recommends comparing model and reasoning configurations on representative tasks by quality, tokens, latency, and cost rather than assuming one configuration is always best. See the [Responses usage schema](https://developers.openai.com/api/reference/cli/resources/responses/methods/retrieve) and [model guidance](https://developers.openai.com/api/docs/guides/latest-model). For Codex, the official [App Server protocol](https://developers.openai.com/codex/app-server/) identifies `thread/tokenUsage/updated` as a thread notification and `account/usage/read` as an account activity query.

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

Alpha.26 keeps App Server and Desktop/session ownership separate. `thread/read` and `thread/resume` are attempted as independent operations: failure to read history does not prove that live resume is unavailable, and failure to resume does not erase history already read. Each registered task receives a bounded attach outcome with separate `history_read`, `live_resume`, and `attach_outcome` fields. The Provider registry exposes zero-filled outcome counts and a bounded 100-task summary for control-plane observation. Known unsupported, invalid, or missing-session failures use bounded reason codes; their failed operation is suppressed for that task on later provider reconnects instead of creating retry churn. A provider process still retries transient transport failures after a real reconnect.

The missing-session code `thread-not-in-app-server-store` means only that this App Server process cannot resume the registered host-owned thread. It does not mean that the Desktop task is absent, failed, or safe to recreate. Temple retains any available history, marks the provider degraded, and never creates a replacement task automatically.

### Provider-owned launch bridge

Current `main` includes a locally tested provider-owned launch primitive. It follows the official App Server boundary: `thread/start` creates and subscribes the local connection, Temple registers the returned thread as canonical state, and only then may `turn/start` begin generation. If canonical registration fails, no turn is started and no automatic retry occurs.

New task registrations distinguish `codex-host-owned` from `temple-provider-owned` execution. They can retain requested and effective model, reasoning effort, service tier when known, Provider ID, and three separate revisions: claim base, task launch, and current candidate. A successful request does not make the requested model an observed effective model, and the stable App Server launch surface does not currently accept a service-tier override. Legacy task documents remain valid and missing values remain unknown.

The first bounded live proof reached the real App Server but failed before thread creation because Temple sent its internal `readOnly` label where the installed `thread/start` schema required `read-only`. No Temple task, turn, instruction delivery, model generation, or detailed Token observation followed, and the zero-retry boundary held. See the [WI-0054 result](../../.ai-org/artifacts/WI-0054/live-proof-result.md). This failure is not evidence that Luna, Codex Desktop, or detailed usage is unavailable; it is evidence that Provider readiness and self-consistent mocks do not prove wire compatibility.

### App Server protocol compatibility gate

Before a future live proof, Temple keeps its caller vocabulary separate from the inspected App Server wire contract:

| Temple internal policy | `thread/start` | `turn/start` |
|---|---|---|
| `readOnly` | `read-only` | `sandboxPolicy.type = readOnly` with network disabled |
| `workspaceWrite` | `workspace-write` | `sandboxPolicy.type = workspaceWrite` with explicit writable roots and network policy |
| `never` | `never` | `never` |
| `onRequest` | `on-request` | `on-request` |
| `unlessTrusted` | `untrusted` | `untrusted` |
| `onFailure` | unsupported; fail before Provider contact | no request |

The contract snapshot records the official lifecycle source, inspected CLI version, and generated-schema digests in [WI-0055 protocol research](../../.ai-org/artifacts/WI-0055/protocol-research.md). Tests validate the emitted request against those separately recorded enums rather than teaching the fake Provider to accept Temple's internal names. A Provider rejection exposes only a stable Temple reason, integer JSON-RPC code when available, and bounded category; the raw Provider message remains outside returned and durable launch state.

Passing the compatibility gate proves local encoding and fail-closed behavior only. No Dashboard launch control or remote mutation route exists, and another real proof still requires explicit approval for its exact model, reasoning, instruction, Token threshold, retry ceiling, and wall-clock boundary.

Create a read-only report:

```bash
node ./templew.mjs usage report . --no-write --json
```

Remove `--no-write` to create `.ai-org/views/usage-baseline.json`. The report sums provider last-usage deltas instead of cumulative totals, groups drivers by the attribution dimensions below, and leaves monetary cost unknown without a versioned price source. This remains observation infrastructure, not a completed optimization system.

### Read longitudinal coverage

`source.longitudinal_coverage` compares three bounded sources without promoting an observation into canonical state:

- `canonical_work_items` counts repository Work Items and identifies those in `done`;
- `registered_task_coverage` reports how many completed Work Items have a registered Codex task;
- `task_eligibility` separates live-resumable tasks, history-reconcilable tasks, historical-only tasks, terminal tasks, and detached archived tasks;
- `detailed_token_observation_coverage` counts only an exact Work Item/task pair as correlated and reports `observed`, `partial`, or `unknown` support for each Token field;
- `qualification` shows the remaining gap to ten distinct qualified completed Work Items and at least two task shapes;
- `recommendation` is a deterministic, read-only exploratory candidate only after that threshold and a within-shape, two-model comparison with at least two accepted Work Items per model.

The lists are sorted so coverage does not depend on repository-directory or task-registry order. A provider event with a missing or mismatched Work Item/task pair remains uncorrelated. A detailed event may prove one Token field while others remain `unknown`; if any included observation lacks a field, that aggregate remains unknown instead of treating the missing value as zero.

Qualification is deliberately strict. A Work Item contributes only when it is currently `done`, its registered task is `completed`, its Work Item/task pair matches, the observation revision matches the task's launch revision when recorded (otherwise its current revision), the Position and task shape are known, the Position matches the registered task, a provider-reported `total_tokens` delta is present, and the model is known. Mismatched, stale, partial, zero-field, and uncorrelated observations remain visible but do not fill the threshold. Multiple task/model/shape identities for one Work Item are excluded rather than cherry-picked.

The ten-Work-Item count is only an observation threshold. Even when the exploratory candidate is available, its confidence is `low`, its evidence basis is `accepted-closeout-token-observation-only`, and `matched_evaluation` remains false. Different Work Items can differ in difficulty, so lower observed Tokens do not prove superior model quality or causal savings. Savings, cost, model-quality, and routing claims remain disabled; a future matched evaluation must authorize any routing policy separately.

The report places this observation at `source.longitudinal_coverage.recommendation`. The top-level `routing` contract remains `not-implemented` and fully disabled because Alpha.27 does not add routing authority. `usage preflight` mirrors the exploratory object under `routing.recommendation` for read-only inspection.

## Check whether a real baseline is possible

Run the preflight before interpreting a zero or missing usage report:

```bash
node ./templew.mjs usage preflight . --json
```

The command is read-only. It separates two sources that must not be merged:

| Source | What it can prove | What it cannot prove |
|---|---|---|
| `thread/tokenUsage/updated` | Usage for an observed provider thread, with Work Item and task attribution when the registered thread matches | Account billing totals or a project it did not observe |
| `account/usage/read` | Whether Codex-backed account activity fields and daily buckets are available | Which project, Work Item, Position, Agent, task, model, outcome, price, or cost produced that activity |

The detailed source reports one of four states:

- `observed`: at least one detailed usage event exists;
- `awaiting-observation`: an active, waiting, or attention task is registered and detailed Token notifications are supported, but no usage event has arrived; inspect Provider health and `degraded_reason` before interpreting it;
- `no-live-registered-task`: only terminal, setup, or history-only tasks exist;
- `provider-unavailable`: a live-resumable task exists but the required Provider capability is unavailable.

Completed tasks and tasks attached to `done` or `cancelled` Work Items remain eligible for bounded history reconciliation, but Temple never resumes them as live subscriptions. Archived tasks remain detached from Provider reconciliation. Registering a Codex task does not itself create or take ownership of a live task.

`usage preflight` uses the same completed-Work-Item qualification as `usage report`; a first Token observation is still `not-qualified`. If the threshold is met it includes the same exploratory candidate and all authority-denial flags. It never changes a model setting.

An optional account capability probe must be requested explicitly:

```bash
node ./templew.mjs usage preflight . --probe-codex-account --json
```

The probe makes no model-generation request. It retains only endpoint availability, returned field names, whether daily buckets exist, their count, and local request latency. It deliberately discards account Token values and labels the result `account-wide` and `unallocated`. Account activity can never qualify the project baseline; only correlated detailed thread observations can do that.

The preflight's local parsing, process startup, JSON exchange, and reporting consume a small amount of CPU, memory, time, and output bytes. `measurement_overhead` reports probe latency and confirms that no model call was used for Token counting. Temple does not yet claim that this overhead or the resulting measurements reduce Tokens.

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

Concrete model preferences belong to project-owned policy, not the framework-managed template. Temple's own development project uses the accepted manual profiles in [DEC-0002](../../.ai-org/decisions/DEC-0002-temple-development-model-routing.md):

| Profile | Model and reasoning | Typical Temple task |
|---|---|---|
| `critical-planning` | `gpt-5.6-sol`, `xhigh` | consequential planning, architecture, security, migrations, and high-risk review |
| `standard` | `gpt-5.6-terra`, `medium` or `high` | ordinary implementation, diagnosis, documentation synthesis, and broad exploration |
| `lightweight-quality` | `gpt-5.6-luna`, `max` | bounded and reversible work with objective acceptance checks where quality matters |
| `mechanical-fast` | `gpt-5.6-luna`, `medium` or `low`, or no model | formatting, extraction, inventory, repetitive transformation, and deterministic checks |

These are coordinator choices for the exact task, not automatic-routing behavior and not defaults imposed on repositories that adopt Temple. Task shape and risk take precedence over Position or Agent display name. Explicit human task-level selection still wins within the authorized scope and spending boundary, and a fallback outside the GPT-5.6 family requires an explicit exception. Requested and effective model remain distinct facts.

OpenAI's current [GPT-5.6 guidance](https://developers.openai.com/api/docs/guides/latest-model) describes Luna for efficient high-volume work, Terra for a balance of capability and cost, and Sol for flagship capability. Higher reasoning effort can improve difficult-task quality while increasing Token use and latency. `Luna max` is therefore a deliberate quality-first lightweight profile, not a claim that every task becomes cheaper or better. Temple still requires project-specific evaluation before automating any choice.

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

1. **Telemetry qualification — implemented:** `usage preflight` distinguishes live task readiness, detailed observations, and optional account-wide capability without mixing their authority.
2. **Attribution — implemented:** normalized usage includes proven Work Item, Position, observed stage, task, attempt, provider, model, provenance, quality, and outcome fields; unavailable values stay unknown.
3. **Reporting — longitudinal coverage implemented:** `usage report` compares canonical Work Items, registered task eligibility, exact correlated observations, revision freshness, task shapes, and per-field support.
4. **Provider-owned execution — locally implemented, live proof pending:** fake App Server tests enforce thread creation, canonical registration, and then turn start without prompt retention or automatic retry.
5. **Policy — pending:** add hierarchical warning budgets and model allowlists without automatic switching.
6. **Recommendation — exploratory observation implemented:** after the local threshold, display a low-confidence read-only candidate with explicit non-authority. Matched representative evaluation remains pending.
7. **Opt-in routing — later:** apply an approved route, record the effective configuration, and preserve fallback and refusal evidence.

None of these slices changes lifecycle authority or replaces outcome-based evaluation.
