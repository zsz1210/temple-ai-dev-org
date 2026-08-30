# Temple — AI Development Organization Framework

**English** | [日本語](README.ja.md) | [繁體中文](README.zh-TW.md)

**Build with multiple AI agents without turning your project into a pile of disconnected chats.**

Temple installs a small, repository-native development organization into a new or existing project. It gives AI agents stable responsibilities, shared project state, reusable engineering methods, bounded work, and evidence-based delivery—so another agent can continue the work without reconstructing the original conversation.

> Temple is an early alpha for low-risk projects and framework validation. It is not yet an npm release or a production control plane.

## Why Temple?

Coding agents are fast, but speed alone does not create a team.

Without a shared operating model, agents can start before the product is understood, repeat work from another conversation, edit the same files, confuse implementation with approval, or declare success without reproducible evidence. Important decisions disappear when the chat ends.

Temple keeps the durable parts in the repository:

- **Responsibilities:** Product, architecture, development, quality, integration, release, and observation remain distinct even when one AI fills several roles.
- **Shared truth:** Specs, decisions, Work Items, handoffs, learning, and evidence survive beyond one task.
- **Engineering methods:** Skills provide repeatable ways to interview, model a domain, document, test, diagnose, and extend the organization.
- **Safe coordination:** Work is split by dependency, affected paths, ownership, and shared resources before agents run in parallel.
- **Verification:** Developer claims, evaluation, Independent QA, approval, and release are separate steps tied to an exact revision.

Temple is not shared chat memory and not a prompt collection. It is the operating layer between a product idea and the agents that build it.

## How it works

```text
Idea
  ↓ clarify product intent and shared language
Specification
  ↓ create bounded Work Items and assign responsibility
Build
  ↓ apply engineering Skills and coordinate safe parallel work
Verification
  ↓ evaluate, reproduce independently, approve, and close
Repository state
  → lets the next human or agent continue
```

For example, when you ask to add guest checkout, the Product Manager first turns the idea into a reviewable outcome. The Architect and UI/UX responsibilities define the affected contracts. Developers receive separate, non-overlapping Work Items. Quality evaluates the behavior, Independent QA reproduces it from the candidate revision, and Release decides whether the evidence is sufficient. Each step reads and updates the repository instead of depending on one long chat.

Temple defines ten stable Positions: Product Manager, UX Designer, UI Designer, Software Architect, Developer, Quality & Evaluation Engineer, Independent QA, Release Manager, Integration Owner, and Observer. During initialization, those Positions are assigned to project-specific Agent Identities. A small project can start with five agents; a larger team can add specialists without redesigning the organization.

A **Position** defines responsibility. An **Agent Identity** is the project-specific executor. A **Skill** is a reusable method. A Skill can improve how work is done, but it cannot grant authority or bypass a verification gate.

## Quick start

Requirements: Git, Node.js 20 or later, Codex, and a target project directory.

### 1. Install from source

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

The repository is private during early alpha, so cloning currently requires access.

### 2. Initialize a project

Open this repository in Codex and ask:

> Use `$temple-init` to initialize `/absolute/path/to/my-project`. Propose English names for the Agent Identities and wait for my confirmation before writing files.

Temple inspects the target, proposes the organization, shows a dry run, installs the project-owned state and framework-managed files, then runs health checks. You do not fork Temple for every product; Temple becomes an installed part of that product repository and remains independently upgradeable.

### 3. Start a bounded outcome

Inside the initialized project, ask Codex:

> Use `$decision-interview` to clarify this change, then use `$temple-work` to create the smallest Work Item that can be independently verified.

Useful checks:

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

See the [usage guide](docs/usage.md) for existing-project adoption, CLI commands, upgrades, parallel work, trackers, UI modes, and troubleshooting.

## Choose the level of organization you need

| Profile | Use it when | What changes |
|---|---|---|
| **Solo** | One person uses several AI agents | Ten Positions default to five Agent Identities; responsibilities and Independent QA remain visible |
| **Collaborative** | Several people or specialists share the project | Adds Human Principals, agent sponsorship, Position pools, Disciplines, claims, dependencies, and integration ownership |
| **High-Assurance** | Risk requires stronger human accountability | Adds risk-scaled evidence, rollback, independent approval, and stricter separation of duties |

UI work can be `not-applicable`, `code-first`, `preview-first`, or `design-led`. Figma is optional; the required evidence scales with the project and risk rather than a mandatory design tool.

## Methods that grow with the project

The core installation includes Skills for initialization, bounded work, decision interviews, domain modeling, project documentation, and Skill authoring. The optional Build Quality pack adds TDD and disciplined bug diagnosis.

Projects can add their own Skills without giving Temple ownership of them. The Engineering Learning Loop captures Lessons and Practices first, then promotes repeated evidence into a Skill, check, ADR, or instruction only when justified. Context routing helps agents retrieve the relevant methods and project knowledge without loading the entire repository.

Temple does not install every possible engineering Skill, semantic search system, external tracker integration, or model by default. Optional capabilities must remain explicit, reviewable, and removable.

## What remains human

Temple coordinates repository work; it does not take ownership of business truth, priorities, credentials, material spending, irreversible external actions, or high-risk approval. Jira, GitHub Projects, and other company trackers may remain the human planning surface while Temple Work Items manage AI execution and evidence inside the repository.

The current alpha proves local and fixture-backed behavior. It does not yet prove every multi-company topology, distributed race, regulated audit, or production deployment.

## Documentation

Start with the [documentation map](docs/README.md). It organizes guides by reader and purpose instead of exposing the repository's implementation history on this page.

- [Usage](docs/usage.md) — install, initialize, operate, and upgrade
- [Vision](docs/vision.md) — responsibilities, lifecycle, and design philosophy
- [Roadmap](docs/roadmap.md) — what is delivered, now, next, and later
- [Testing strategy](docs/testing.md) — local, CI, release, and live validation levels
- [Architecture decisions](docs/adr/README.md) — why important choices were made
- [Validation records](docs/validation/README.md) — bounded evidence and remaining gaps
- [Changelog](CHANGELOG.md) — release history

## License

[MIT](LICENSE). Third-party sources and adoption boundaries are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
