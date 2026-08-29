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
| Organization and authority | Ten stable Positions, project-specific Agent Identities, Assignments, explicit human approval boundaries, and separation between Developer and Independent QA |
| Engineering methods | Core Skills plus the opt-in Build Quality pack with `$tdd` and `$diagnosing-bugs` |
| Work orchestration | A fixed `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle with durable work items and handoffs |
| Verification and delivery | Named gate evidence, evaluation, independent reproduction, revision references, approval records, rollback plans, and bounded closeout |
| Durable state, learning, and observability | Repository-owned decisions, Lessons and Practices, work items, events, task registry, generated status, and conflict-aware upgrades |

A Position defines responsibility and approval limits. An Agent Identity is the project-specific executor assigned to that Position. A Skill is a reusable method for performing a kind of work; it never grants additional authority or replaces an evidence gate.

UI Designer is a formal Position, but Temple does not require every project to produce Figma designs first. The selected [UI delivery mode](docs/ui-design.md)—code-first, preview-first, or design-led—scales design artifacts and review evidence to risk.

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
  --acceptance "Independent QA verifies the candidate revision"

temple doctor .
temple status .
```

Use `temple handoff`, `temple transition`, and `temple close` as the work moves through the lifecycle. Run `temple --help` for the complete command list.

## Engineering methods and extension

Temple keeps the default installation focused. Product-thinking and organizational Skills are installed as core capabilities; development procedures are opt-in. The shipped Build Quality pack adds TDD and bounded bug diagnosis without changing Position ownership or lifecycle authority.

Temple also includes `$skill-authoring` and a [Skill authoring guide](docs/skill-authoring.md) for creating clearly bounded, project-owned Skills. A Temple-compatible Skill should define a distinct trigger, authority boundary, evidence inputs, procedure, output, stopping condition, and verification.

The [Engineering Learning Loop](docs/engineering-learning.md) gives completed work a governed path from evidence to Lesson, adopted Practice, and—only when justified—a Skill, automated check, ADR, or instruction. Its compact project index helps later Agents retrieve relevant learning without loading the full history or turning every observation into a rule.

This is the beginning of the extension model, not a complete Skill ecosystem. Temple does not yet provide a Skill CLI, capability registry, custom-pack publisher, or third-party Skill installer. Architecture, exploration, review, security, Git, and retrospective packs remain evaluated candidates rather than shipped capabilities. See the [capability catalog](docs/capability-catalog.md).

## Scale and current boundaries

The current small-team configuration assigns all ten Positions to five Agent Identities. The Product Design Identity initially holds Product Manager, UX Designer, and UI Designer. The data model preserves Position vocabulary and historical Identity IDs as staffing grows, while Developer and Independent QA remain separate. The current alpha does not yet provide a reassignment CLI or a risk-based staffing workflow.

Temple is designed to grow beyond that starting point, but support for every project size has not been proven. The current release has one fixed lifecycle and one optional development pack. Risk-based Lite, Standard, and High-Assurance profiles are planned, as are broader capability packs, exact Git and external-evidence adapters, stronger cross-task recovery proof, live observation, and multi-project views.

Temple records revision references today; the CLI does not yet resolve every reference as an exact Git object. It does not create, rename, or archive Codex tasks, and it does not deploy or publish externally. Business truth, priorities, sensitive data, material cost, irreversible actions, and high-risk approval remain human responsibilities.

Temple is installed into a project; the project is not forked from this repository. Its organization and state become part of the project, while the central framework remains independently upgradeable.

## Documentation

- [Usage guide](docs/usage.md) — initialization, daily commands, upgrades, and troubleshooting
- [Vision and operating model](docs/vision.md) — framework layers, Positions, and lifecycle
- [Architecture](docs/architecture.md) — identity, ownership, extension, and canonical-state boundaries
- [Skill authoring guide](docs/skill-authoring.md) — project-owned Skill design and verification
- [Engineering Learning Loop](docs/engineering-learning.md) — evidence, Lessons, Practices, retrieval, and promotion
- [UI design modes](docs/ui-design.md) — UI ownership, code-first, preview-first, design-led, and tool policy
- [Capability catalog](docs/capability-catalog.md) — shipped, optional, and candidate engineering methods
- [Roadmap](docs/roadmap.md) — validated scope and planned work
- [Architecture decisions](docs/adr/README.md) — design decisions and rationale

## License

[MIT](LICENSE). Third-party sources and adoption boundaries are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
