# Temple roadmap

**English** | [日本語](roadmap.ja.md) | [繁體中文](roadmap.zh-TW.md)

Temple is an operating framework for AI-assisted software development. It gives people and AI Agents explicit responsibilities, turns product intent into bounded work, and keeps decisions, evidence, and recovery state in the repository.

## Product goal

Make multi-Agent development dependable at any project scale:

- a solo developer can coordinate several AI Agents without losing context or duplicating work;
- a multidisciplinary team can divide responsibility and run safe work in parallel; and
- a larger organization can retain its existing repositories, specifications, trackers, and approval boundaries.

Temple scales the process to the work. Small, reversible changes stay lightweight; ordinary delivery retains review; consequential work receives stronger assurance.

## Product capabilities

| Capability | What Temple provides today |
| --- | --- |
| Organization | Separate Positions, Agent Identities, assignments, authority, and work claims |
| Delivery | Bounded Work Items, proportionate workflows, handoffs, evidence gates, Independent QA, and closeout |
| Continuity | Repository-backed state, context routing, task correlation, backup, recovery, and engineering learning |
| Team scale | Safe parallel waves, multi-human governance, external-tracker boundaries, and multi-repository federation |
| Extensibility | Project-owned specifications, UI delivery modes, Skills, capabilities, and optional integrations |
| Execution guidance | Per-step, explainable model and tool recommendations that remain separate from responsibility and execution authority |

The Management Console and continuous Usage observation are optional. Semantic retrieval and broader Provider execution remain future extensions; the core organization does not depend on them.

## Availability

The source repository and **Alpha.30** are public on GitHub and npm. The published package is an early Alpha, not a stable or enterprise-qualified release. See [release readiness](release-readiness.md) for the exact published version and qualification evidence.

Work on `main` after a release is unreleased until a separate version is qualified and published. Development fixes, draft comparisons, and planned capabilities must not be presented as behavior or results of the installed npm package. Adaptive execution routing currently recommends a route; it does not automatically select and launch a model.

## Milestones

### 1. Organization foundation — delivered

- Position, Agent Identity, and Assignment contracts
- repository-native Work Items and lifecycle state
- handoff, evidence, Independent QA, and closeout boundaries
- installation, upgrade, backup, restore, and cold-task recovery

### 2. Team and project scale — delivered with bounded validation

- product, UX, UI, API, and technical-specification authority
- Lean, Standard, and High-Assurance workflow profiles
- safe parallel planning and runtime coordination
- multi-human collaboration, external-tracker mapping, and multi-repository federation
- governed Skills and an Engineering Learning Loop

Real multi-company, multi-machine, and regulated operation still requires representative validation.

### 3. Adaptive execution — foundation delivered, bounded evidence collected

- responsibility is separate from model selection
- one Work Item can resolve different execution profiles for different steps
- Capability, privacy, risk, Provider, and resource constraints are checked before preference
- requested settings remain separate from the model and reasoning actually observed
- route resolution is advisory and does not launch a Provider or change project state

Bounded comparisons have shown equal observed quality with mixed resource and integration costs. They do not establish general Token savings or qualify automatic routing. The [validation index](../validation/README.md) separates measured results from prepared experiments; the next priority is to reduce operating friction and evaluate end-to-end delivery before changing defaults.

### 4. Real-world qualification — current

- extend the demonstrated bounded fresh-Agent Core Path and cold recovery to representative existing-project work
- simplify first use, same-scope review corrections, and owned runtime cleanup while preserving exact revisions and authority
- compare Temple with a competent conventional workflow under matched tasks, models, tools, and acceptance tests
- test whether smaller context and simpler operations reduce measured overhead without losing quality; do not assume that they do
- compare Temple's adaptive route with a fixed model route while keeping the Temple process unchanged
- validate real multi-human, multi-machine, and multi-repository delivery
- measure correctness, recovery, rework, human intervention, Tokens, latency, and operating overhead

This milestone succeeds only with decision-grade evidence. A neutral or negative result must narrow, simplify, or remove the mechanism that failed to justify its cost.

An external first-time-human study can add broader usability evidence later, but it is not required for a narrowly labeled AI-assisted Alpha. Temple must not claim unaided beginner usability until that separate question is actually tested.

Follow the existing [field-validation plan](../validation/post-alpha-field-validation.md): start with bounded delivery and fresh-task recovery, then existing-project adoption and cross-repository coordination. Turn observed workflows into short User Guide examples; keep planned examples separate from tested outcomes.

### 5. Ecosystem expansion — later

- add Provider execution only after its trust, protocol, authority, and rollback contracts are proven
- add semantic or local retrieval where measured repository scale shows deterministic routing is insufficient
- consider automatic routing only for task shapes with qualified evidence and a safe fallback
- mature optional operational views and integrations without making them framework dependencies
- evolve the public Alpha through separately qualified releases; merging changes alone does not publish to npm

## Where to follow the work

- [Core Path](../getting-started/core-path.md) — the shortest end-to-end operating journey
- [Work Items](../../.ai-org/work-items/) — detailed implementation state
- [Validation records](../validation/README.md) — what has been tested and what remains unproven
- [Release readiness](release-readiness.md) — distribution-specific gates
- [Changelog](../../CHANGELOG.md) — version history

This Roadmap describes product direction and capability milestones. It is not the task backlog, experiment log, or release checklist.
