# Temple

**English** | [日本語](README.ja.md) | [繁體中文](README.zh-TW.md)

**An installable, repository-native operating model for AI development teams using Codex.**

Temple helps separate Codex tasks participate in one observable workflow. It gives each task repository state for recovering context, a defined Position to work through, and evidence-based handoffs tied to a recorded revision reference.

```text
Goal → Spec → Design → Build → Test → Eval → Independent QA → Release Gate
```

Temple does not try to make agents share chat memory. It makes the repository the source of truth.

## Why Temple?

Multiple Codex tasks are useful, but conversations are poor state stores. Without a shared operating model:

- work gets repeated or abandoned between tasks;
- decisions and unresolved questions disappear into chat history;
- a task title becomes a fragile substitute for real identity;
- “done” can be claimed without a tested revision or reproducible evidence.

Temple keeps work items, assignments, decisions, handoffs, revisions, and verification evidence inside the project so a new task has durable state from which to resume.

## Getting started

Requirements: Git, Node.js 20 or later, and a target project directory.

### 1. Install the toolkit

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
npm link
```

The repository is currently private during early alpha, so the clone command requires GitHub access. Making it public is a separate release step.

### 2. Initialize a project

The recommended path is to open the Temple checkout in Codex and ask:

> Use `$temple-init` to initialize `/absolute/path/to/my-project`. Propose English names for the five Agent Identities and wait for my confirmation before making changes.

The init workflow inspects the target, proposes names and Position assignments, performs a dry run, installs the project organization, and runs its health and status checks.

For interactive or config-file setup, see the [usage guide](docs/usage.md).

### 3. Start observable work

```bash
cd /absolute/path/to/my-project

temple work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the exact revision"

temple doctor .
temple status .
```

Use `temple handoff`, `temple transition`, and `temple close` as the work moves through its lifecycle. Run `temple --help` for the complete command list.

## What you get

| Capability | What it provides |
|---|---|
| Durable context | Repository-owned work items, decisions, events, and evidence |
| Defined accountability | Nine stable Positions assigned to project-specific Agent Identities |
| Evidence-based handoffs | Recorded revision references, completed work, evidence, and unresolved items |
| Observable status | A generated project view plus a Codex task registry |
| Safe maintenance | Conflict-aware init and upgrades, with optional managed Skill packs |

Small projects begin with five Agent Identities covering all nine Positions. As the team grows, Positions can be reassigned without rewriting the workflow or its history. Developer and Independent QA always remain separate Identities.

## How it fits your project

Temple is installed into a project; the project is not forked from this repository. The installed organization becomes part of that project's own instructions and state, while the central toolkit remains independently upgradeable.

Temple deliberately does not create, rename, or archive Codex tasks, and it does not perform external releases. High-risk approvals, business priorities, sensitive data, and irreversible actions remain human responsibilities.

Temple is currently an early alpha. Start with a low-risk project before relying on it for critical delivery.

## Documentation

- [Usage guide](docs/usage.md) — initialization, daily commands, upgrades, and troubleshooting
- [Vision and operating model](docs/vision.md) — Positions, responsibilities, and lifecycle
- [Architecture](docs/architecture.md) — identity model, ownership boundaries, and canonical state
- [Capability catalog](docs/capability-catalog.md) — core and optional Skills
- [Roadmap](docs/roadmap.md) — current direction and planned validation
- [Architecture decisions](docs/adr/README.md) — design decisions and rationale

## License

[MIT](LICENSE). Third-party sources and adoption boundaries are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
