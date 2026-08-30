# Temple roadmap

**English** | [日本語](roadmap.ja.md) | [繁體中文](roadmap.zh-TW.md)

Temple is moving from a locally proven AI development organization framework toward reliable everyday use across several real projects. This roadmap shows direction and exit evidence. Version-by-version history lives in the [changelog](../../CHANGELOG.md), and detailed proof lives in [validation records](../validation/README.md).

## Current position

- **Current release line:** `0.1.0-alpha.27`
- **Current stage:** Phase 4 local implementation and bounded exit rehearsals are complete; enterprise and statistical qualification remain retained validations
- **Suitable today:** individual, small-team, and bounded multi-repository local workflows with human supervision
- **Not yet claimed:** production-grade distributed coordination, regulated operation, or unattended external actions

## Delivered foundation

The first three phases established the framework's operating model:

- Install into new or existing projects without forking the framework.
- Separate ten stable Positions from project-specific Agent Identities and Assignments.
- Preserve product specifications, decisions, Work Items, handoffs, learning, and evidence in repository-owned state.
- Run a visible `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle.
- Support Solo, Collaborative, and High-Assurance profiles with explicit human-accountability boundaries.
- Route bounded context and likely Skills without loading the full repository or enabling semantic retrieval by default.
- Coordinate dependency-safe parallel waves, affected paths, claims, shared resources, runtime workers, and integration joins.
- Keep company trackers, Temple Work Items, and Codex tasks as separate layers with explicit reconciliation.
- Observe exact-revision evidence, stale claims, approvals, risks, and recovery through static and local live views.
- Extend the framework with project-owned Skills and optional Packs while preserving ownership, provenance, migration, and rollback boundaries.

The detailed release sequence is intentionally not repeated here. See the [changelog](../../CHANGELOG.md), [ADR index](../adr/README.md), and [validation index](../validation/README.md).

## Now — make Temple understandable and dependable

The immediate priority is to turn the proven local foundation into something a developer can adopt and operate without reading the project's history.

### Public usability and release integrity

- Maintain a human-first trilingual README and a categorized documentation map.
- Keep the roadmap focused on direction while changelog and validation records retain history.
- Use change-aware CI: documentation changes run repository checks; behavioral changes run the complete suite.
- Make installation reproducible with lockfile-strict dependencies and clean-source recovery.
- Define the supported Node.js and operating-system matrix before public package publication.
- Review package contents, security reporting, contribution guidance, and public branch protection.

### Durability and recovery

- Alpha.24 ships a local versioned backup manifest, complete payload verification, stale-safe restore preview, and recoverable multi-file apply for project-owned Temple state.
- Generated views remain rebuildable; framework-managed files, application source and data, external systems, and control-plane telemetry remain outside this backup boundary.
- Alpha.27 adds digest-bound retention preview/apply, redacted audit export, and exact rollback plus interrupted-recovery evidence from disposable copies of AiPet. Physical power loss, filesystem corruption, remote transport, production recovery, and additional operating systems remain retained validations.

### Everyday operating signals

- Alpha.25 provides a seven-scenario adversarial policy scorecard across Solo, Collaborative, and High-Assurance fixtures; Alpha.26 adds truthful live-usage preflight; Alpha.27 exposes the qualification and attach-outcome contracts without manufacturing observations. The self-host result remains not-qualified with zero detailed live observations, so no Token, cost, quality, or routing improvement is claimed.
- Attribute provider usage to every provable Work Item, Position, observed stage, task, attempt, provider, model, and outcome dimension while keeping missing data and monetary cost unknown.
- Define useful, low-noise historical measures for duplicate scope, lost context, stale evidence, rework, blocked time, and verification quality.
- Keep usage and cost visible without allowing the framework to authorize spending or switch models automatically.
- Make Human Inbox and Observer attention actionable without turning them into a second tracker.

## Next — qualify broader environments and repeated outcomes

Alpha.27 closes the bounded local Phase 4 implementation. The following retained tests qualify broader environments and stronger claims; fixtures or extra features do not replace them.

- Collect at least ten correlated, varied, completed Work Items before qualifying a longitudinal Token baseline or making any savings claim.
- Repeat disaster recovery with physical or process-level failure, another supported operating system, and an explicitly authorized production-like environment.
- Exercise the project-owned federation and read-only portfolio across real separately maintained repositories without centralizing credentials or business truth.
- Run the retained large multi-human, multi-machine collaboration test with real branches, pull requests, protected rules, CI, conflicts, and integration ownership.
- Run explicitly authorized live provider, soak, disconnect, and crash-recovery validation before making production-readiness claims.

## Later — optional enterprise integrations

Only after the relevant retained qualification evidence:

- Approved write actions for Jira, GitHub, Linear, Asana, or other trackers.
- CI/CD and deployment actions with explicit authorization, preview, rollback, and audit evidence.
- Organizational RBAC, remote workers, centralized audit export, and cross-team portfolios.
- Optional SRE and Security responsibilities for production observability, incident coordination, vulnerability handling, policy evidence, and operational risk review.
- Read-only production telemetry and alert-provider adapters before any authorized remediation or deployment action.
- Slack, email, or other notifications with throttling, privacy, and responsibility boundaries.
- Evaluated semantic or local-model retrieval for repositories where deterministic routing is no longer sufficient.

External systems must not replace project-local truth or the Human Approval boundary.

## Intentionally not default

Temple will not make these core merely because they are popular:

- Installing every candidate engineering Skill.
- Requiring Figma or another design vendor.
- Requiring RAG, a vector database, a local model, or a daemon for small projects.
- Treating external tracker status as release authority.
- Creating unlimited agent tasks or parallel work without clean task boundaries.
- Turning a pilot application into a product after its validation question is answered.

## Success measures

Temple is improving when:

- a new agent recovers the current project state without the originating chat;
- overlapping Work Items and unsafe parallel plans are caught before edits collide;
- completion claims point to reproducible exact-revision evidence;
- Developer and Independent QA remain meaningfully separate;
- project-owned files survive init, upgrade, extension installation, rollback, and failure;
- a human can understand active work, decisions, risks, and approvals without reading every agent conversation;
- the framework reduces rework and coordination cost instead of merely producing more artifacts.
