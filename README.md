# Temple — AI Development Organization Framework

**English** | [日本語](README.ja.md) | [繁體中文](README.zh-TW.md)

**Turn product intent into trustworthy software with an AI development organization that can think, build, verify, continue, and evolve.**

Temple is a repository-native framework for Codex. It connects product thinking, stable responsibilities, reusable engineering methods, evidence-based delivery, and durable project state. The current implementation is an early alpha intended for low-risk validation.

```text
Intent → Shared model → Bounded work → Method-assisted build → Independent evidence → Durable continuation
```

## Why Temple?

Coding agents can produce code quickly. That does not automatically create a development organization. An AI task can begin implementation before the product is understood, use a different method from the task beside it, blur responsibility with approval, declare success without reproducible evidence, or lose important decisions when its conversation ends.

Adding more tasks or more Skills can amplify those problems when nothing connects them. Temple provides that connection: product intent is clarified before it becomes scope, responsibilities remain stable even when the executing Agent changes, engineering methods operate inside explicit authority boundaries, delivery claims pass through evidence gates, and later tasks recover state from the repository instead of reconstructing it from chat.

Temple is not a shared-chat-memory system and not a collection of prompts. It is an operating framework for turning an idea into work that an AI development organization can continue and verify.

## The framework

| Layer | What Temple provides today |
|---|---|
| Product intent and domain | `$decision-interview` challenges ambiguity; `$domain-modeling` establishes shared language, boundaries, rules, and invariants; Specs, Decision Ledger entries, and ADRs preserve decisions |
| Organization and authority | Ten stable Positions, project-specific Agent Identities, default Assignments, Human Principals, Agent sponsorship, Position pools with Disciplines, explicit human approval boundaries, and separation between Developer and Independent QA |
| Engineering methods | Core Skills plus the opt-in Build Quality pack with `$tdd` and `$diagnosing-bugs` |
| Work orchestration | A fixed `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle with durable work items and handoffs |
| Team and tracker coordination | Separate company tracker, team-visible outcome, internal AI decomposition, and Codex session layers; explicit mappings, field ownership, bounded observations, and evidence-backed reconciliation |
| Verification and delivery | Named gate evidence, evaluation, independent reproduction, revision references, approval records, rollback plans, and bounded closeout |
| Durable state, learning, and observability | Repository-owned decisions, Context Map, Lessons and Practices, work items, events, task registry, generated Capability Registry and Context Capsules, status, and conflict-aware upgrades |

A Position defines responsibility and approval limits. An Agent Identity is the project-specific executor assigned to that Position. A Skill is a reusable method for performing a kind of work; it never grants additional authority or replaces an evidence gate.

UI Designer is a formal Position when interface scope exists, but Temple does not require every project to produce Figma designs first. A Work Item can record no UI, let its responsible AI begin code-first, use a preview, or follow an approved design source; the selected [UI delivery mode](docs/ui-design.md) scales evidence to risk.

## Getting started

Requirements: Git, Node.js 20 or later, Codex, and a target project directory.

### 1. Install Temple

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
npm link
```

The repository is private during early alpha, so cloning currently requires GitHub access.

### 2. Initialize a project

Open the Temple checkout in Codex and ask:

> Use `$temple-init` to initialize `/absolute/path/to/my-project`. Propose English names for the five Agent Identities and wait for my confirmation before making changes.

Temple inspects the target, proposes names and Position Assignments, performs a dry run, installs the organization, and runs health and status checks. Interactive and config-file setup are documented in the [usage guide](docs/usage.md).

### 3. Start one bounded work item

```bash
cd /absolute/path/to/my-project

temple work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the candidate revision" \
  --ui-mode code-first \
  --affected-path "src/verified-flow/**"

temple capability find . --query "verify one user flow"
temple context resolve . --work-item WI-0001 --no-write
temple doctor .
temple status .
```

Use `temple handoff`, `temple transition`, and `temple close` as the work moves through the lifecycle. Run `temple --help` for the complete command list.

## Engineering methods and extension

Temple keeps the default installation focused. Product-thinking and organizational Skills are installed as core capabilities; development procedures are opt-in. The shipped Build Quality pack adds TDD and bounded bug diagnosis without changing Position ownership or lifecycle authority.

Temple also includes `$skill-authoring` and a [Skill authoring guide](docs/skill-authoring.md) for creating clearly bounded, project-owned Skills. A Temple-compatible Skill should define a distinct trigger, authority boundary, evidence inputs, procedure, output, stopping condition, and verification.

The [Engineering Learning Loop](docs/engineering-learning.md) gives completed work a governed path from evidence to Lesson, adopted Practice, and—only when justified—a Skill, automated check, ADR, or instruction. Its compact project index helps later Agents retrieve relevant learning without loading the full history or turning every observation into a rule.

The generated Capability Registry now inventories core, optional-pack, and project-owned repository Skills without taking ownership of extensions. `temple capability find` and work-item Context Capsules help an Agent select a bounded evidence set and likely methods; selection never grants authority or installs dependencies. Temple still does not provide Skill mutation commands, a custom-pack publisher, a third-party Skill installer, or automated model-routing evaluation. Architecture, exploration, review, security, Git, and retrospective packs remain evaluated candidates rather than shipped capabilities. See the [capability catalog](docs/capability-catalog.md) and [context routing guide](docs/context-routing.md).

## Scale and current boundaries

The default Solo configuration assigns all ten Positions to five Agent Identities. The Product Design Identity initially holds Product Manager, UX Designer, and UI Designer. The Collaborative foundation can add Human Principals, additional Agent Identities, sponsorships, and multiple Position members with frontend, backend, full-stack, infrastructure, UI, UX, and other Disciplines. Default Assignments remain backward compatible while a bounded Work Item may be claimed by another eligible pool member.

Solo and Collaborative are selectable profiles; High-Assurance is reserved but not yet selectable. Collaborative mode adds collision-resistant Work Item IDs, parent/dependency and shared-contract fields, parallel-readiness checks, Principal-backed claims, and status warnings. The retained large multi-human, multi-machine test is still `not_run`, so this foundation is not yet evidence that every company topology or distributed race is production-ready. See the [Collaborative development model](docs/collaboration.md).

Temple records revision references today; the CLI does not yet resolve every reference as an exact Git object. It does not create, rename, or archive Codex tasks, and it does not deploy or publish externally. Business truth, priorities, sensitive data, material cost, irreversible actions, and high-risk approval remain human responsibilities.

Company teams may keep Jira, GitHub Issues, or another tracker as their planning surface while Temple keeps AI execution and evidence in repository Work Items. Team-visible parents can map externally while internal child items remain quiet; external completion never bypasses QA or the Release Gate. Alpha.15 can read bounded GitHub Issue data or supplied observations and record reconciliation evidence, but it performs no external writes.

Temple is installed into a project; the project is not forked from this repository. Its organization and state become part of the project, while the central framework remains independently upgradeable.

## Documentation

- [Usage guide](docs/usage.md) — initialization, daily commands, upgrades, and troubleshooting
- [Vision and operating model](docs/vision.md) — framework layers, Positions, and lifecycle
- [Architecture](docs/architecture.md) — identity, ownership, extension, and canonical-state boundaries
- [Collaborative development model](docs/collaboration.md) — Human Principals, Position pools, task slicing, parallel readiness, claims, and diagrams
- [Task and external tracker coordination](docs/task-and-tracker-coordination.md) — company boards, internal AI work, field ownership, mappings, and reconciliation
- [Product specification system](docs/product-specifications.md) — product truth, revisioned Work Item references, and iterative delivery
- [Enterprise document adoption](docs/enterprise-document-adoption.md) — preserve, bridge, or migrate existing document systems without dual authority
- [UI interaction contracts](docs/ui-interaction-contracts.md) — connect interface behavior, design artifacts, implementation, and backend contracts
- [Skill authoring guide](docs/skill-authoring.md) — project-owned Skill design and verification
- [Engineering Learning Loop](docs/engineering-learning.md) — evidence, Lessons, Practices, retrieval, and promotion
- [Progressive context routing](docs/context-routing.md) — Context Map, Capability Registry, Context Capsules, affected-path overlap, and future Retrieval Providers
- [UI design modes](docs/ui-design.md) — no-UI recording, code-first, preview-first, design-led, and tool policy
- [Capability catalog](docs/capability-catalog.md) — shipped, optional, and candidate engineering methods
- [Roadmap](docs/roadmap.md) — validated scope and planned work
- [Architecture decisions](docs/adr/README.md) — design decisions and rationale

## License

[MIT](LICENSE). Third-party sources and adoption boundaries are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
