<h1 align="center">Temple</h1>

<p align="center"><strong>AI Development Organization Framework</strong></p>

<p align="center">Give every change an owner, a method, and evidence.</p>

<p align="center"><strong>English</strong> · <a href="README.ja.md">Japanese</a> · <a href="README.zh-TW.md">Traditional Chinese</a></p>

<p align="center">
  <a href="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml"><img alt="CI status" src="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml/badge.svg"></a>
  &nbsp;·&nbsp; Early Alpha
  &nbsp;·&nbsp; Node.js 24+
  &nbsp;·&nbsp; <a href="LICENSE">MIT</a>
</p>

---

## Software moves faster with AI. Coordination does not.

AI agents can plan, code, test, and review. But once a project has several tasks, conversations, people, or agents in motion, the difficult questions are organizational:

- Who owns this change?
- What was actually approved?
- Can these tasks run together safely?
- Which revision was tested?
- What should the next agent read—and what can it ignore?
- Which lesson is reusable, and which was true only once?

Temple gives a software project a durable development organization inside its repository. It keeps responsibility, work state, context, methods, handoffs, evidence, and learning outside chat so another person or AI can continue without reconstructing the project from old conversations.

Temple is not an application framework, issue tracker, or autonomous manager. Your project keeps its own architecture, stack, documents, and tools. Temple defines how humans and AI work together around them.

> **Your project decides how the product is built. Temple defines how the work is organized, verified, and remembered.**

## Start with one project

Requirements: Git, Node.js 24 or later, Codex for guided setup, and a project directory. The current public prerelease is [Alpha.33](https://github.com/zsz1210/temple-ai-dev-org/releases/tag/v0.1.0-alpha.33), available on npm's `next` channel.

### AI-guided setup

Clone Temple once so Codex can read its initialization Skill:

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
```

Open this checkout in Codex and ask:

> Use [`$temple-init`](docs/getting-started/core-skills.md#temple-init) to initialize `/absolute/path/to/my-project`. Inspect existing development and integration rules, propose Agent names and responsibilities, and ask only about missing choices. Show me the setup summary and wait for confirmation before writing files.

After initialization, resolve reported instruction-file conflicts and follow the bootstrap checks. Then open a **fresh conversation in the initialized project** and confirm its instructions loaded. Installation alone does not prove that the current conversation read them. See [first initialization](docs/getting-started/usage.md#2-first-initialization).

Install Temple into each project; do not fork the framework for every product. Existing code, documents and repository-hosting rules remain yours.

<details>
<summary>CLI-only installation or contributing to Temple</summary>

```bash
npm install --global @zsz1210/temple-ai-dev-org@next
temple --version
```

This installs the CLI, not the pre-init `$temple-init` Skill context in an uninitialized project. Follow the [initialization guide](docs/getting-started/usage.md#2-first-initialization) for configuration and confirmation; use the source checkout above for guided setup.

When developing Temple itself, follow [Contributing](CONTRIBUTING.md) and the [testing guide](docs/getting-started/testing.md). Full behavioral verification and an optional global link belong to that workflow:

```bash
npm run verify
npm link
```

Run these in the Temple source checkout, not as routine preparation for every product task.

</details>

## What working with Temple looks like

In the initialized project, start with one concrete request:

> Fix the checkout total when a discount is applied. Limit the change to the calculation and its tests; do not deploy. Use Temple to record the approved scope, implement the fix, and have a different Agent verify it. Ask me only when a necessary decision or authorization is missing.

Use [`$decision-interview`](docs/getting-started/core-skills.md#decision-interview) when the outcome is unclear. For already-approved scope and acceptance, continue with [`$temple-work`](docs/getting-started/core-skills.md#temple-work) instead of repeating discovery.

- **Lean:** bounded, low-risk, reversible work with a distinct Verifier.
- **Standard:** product delivery requiring evaluation and Independent QA.
- **High-Assurance:** higher-risk work requiring stronger evidence and human approvals.

Optional [Autonomous Delivery](docs/operations/autonomous-delivery.md) lets the coordinating AI continue authorized implementation, verification and bounded repair, with CLI support for fixed checks and records. It is an execution style, not a background manager: it does not launch models, grant new authority, or require a separate model conversation for every stage. Required responsibilities and independent judgments remain.

A Console, Observer and usage collection are **optional**. Inspect work without them:

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

Start with the [Solo guide](docs/getting-started/solo.md) or [step-by-step Core Path](docs/getting-started/core-path.md). Solo describes who directs the work; workflow profiles describe how each change is verified.

## Temple Concept Layers

<picture>
  <source media="(max-width: 640px)" srcset="docs/assets/temple-layers-mobile.en.svg">
  <img alt="Temple places human direction above six connected concerns: responsibility, bounded work, context and execution guidance, coordination, assurance, and memory and learning. Repository-backed organizational memory supports every layer." src="docs/assets/temple-layers.en.svg">
</picture>

Temple is a layered operating model, not one large prompt or one autonomous Agent. Human direction remains above the system; durable repository state sits below it. The layers in between keep ownership, approved work, methods, coordination, verification, and learning connected without treating them as the same thing.

The Guidance layer deliberately contains two different routes. **Context Routing** answers what the current Position and step should read. **Adaptive Execution Routing** answers how that bounded step should be attempted, using its Task Shape, required capabilities, constraints, and project policy. The current Alpha produces explainable requested settings; it does not launch a Provider or silently switch the model. See the [architecture](docs/concepts/architecture.md#three-routes-three-decisions) and [model-routing guide](docs/getting-started/model-routing.md).

## What Temple adds to a project

- **Stable responsibilities:** Positions define ownership and authority without tying them permanently to one person or AI.
- **Bounded work:** every change becomes a Work Item with scope, dependencies, acceptance criteria, and a durable state.
- **Relevant context:** Context Routing points each Position to the specifications, decisions, Skills, and evidence needed for the current step.
- **Compact evidence:** an optional [reading view](docs/operations/compact-evidence.md) shortens saved test logs and JSON while retaining failure details, limitations, and a digest-bound path to the original.
- **Explainable execution choices:** Adaptive Execution Routing selects an eligible project-owned execution profile from the step's needs; responsibility never hard-codes a model.
- **Evidence-gated delivery:** implementation, evaluation, Independent QA, and release readiness remain separate claims.
- **Safe parallel work:** independent tasks can run together; overlapping work waits for coordination and an explicit integration owner.
- **Learning that earns trust:** Lessons can be captured, revalidated, and deliberately promoted into Practices or Skills instead of silently becoming rules.

Temple stores these contracts beside the code. Jira, GitHub Projects, Figma, existing specifications, and company documents can remain authoritative for the subjects they already own.

## One Work Item through Temple

<picture>
  <source media="(max-width: 640px)" srcset="docs/assets/temple-delivery-path.en-mobile.svg">
  <img alt="A Temple Work Item moves from an approved outcome through approach, production, evaluation, proportionate independent review, and closeout. Every step separately resolves its responsible Position, relevant context, and eligible execution route while repository evidence accumulates." src="docs/assets/temple-delivery-path.en.svg">
</picture>

A Work Item advances only when the next stage has the evidence it requires. Its workflow profile and risk determine how much independent review and release readiness are required. At every step, Temple separately resolves the responsible Position, relevant context, and eligible execution route.

The stages describe responsibilities, not fixed job titles. Temple currently ships its core development Positions; custom Positions and workflows remain planned, so a future domain-specific configuration may assign different Positions without replacing this operating model.

## One operating model, different scales

- **Solo** — one person directs AI-assisted development. A small set of Agent Identities can cover several Positions, while Developer and Independent QA stay separate.
- **Collaborative** — several people operate their own agents. Sponsorship, eligible responsibility pools, shared resources, claims, and integration ownership become explicit.
- **High-Assurance** — failure has higher operational or business impact. Temple adds risk-scaled evidence, stronger identity separation, rollback readiness, and distinct human approvals.

Temple uses the same core concepts at each scale. Teams add separation and evidence when the risk requires it instead of replacing the organization with a new process.

## Extend the methods, not the authority boundary

A Temple Skill is a reusable engineering method: it can guide product discovery, domain modeling, UI work, implementation, testing, review, documentation, or another bounded practice. Projects can add their own Skills and keep them beside the code.

Skills do not grant permission, approve dependencies, or bypass delivery gates. A captured Lesson also does not automatically become a project-wide rule. Temple separates observation, revalidation, deliberate promotion, and authority so the organization can learn without turning every successful experiment into permanent policy.

See the [Capability catalog](docs/extensions/capability-catalog.md), [Skill authoring guide](docs/extensions/skill-authoring.md), and [Engineering Learning Loop](docs/extensions/engineering-learning.md).

## Current maturity

Temple is an **Early Alpha** intended for human-supervised, low-risk local projects and bounded pilots.

- **Available now:** repository-native Solo workflow, proportionate profiles, opt-in autonomous delivery, stable Positions, Work Items, deterministic context and capability routing, explainable non-executing Adaptive Execution Routing, governed Skills and learning, lifecycle evidence, Auditable Self-Hosting profiles, local status, and upgrade boundaries.
- **Experimental or bounded:** collaborative and high-assurance contracts, parallel planning, Provider observation and calibration, local control-plane views, tracker coordination, and per-Work-Item usage attribution.
- **Not yet claimed:** broad multi-human and multi-machine qualification, production monitoring or remediation, unattended external writes, automatic model routing, regulated acceptance, or measured universal time and Token savings.

The framework reports retained gaps instead of treating a passing local test as enterprise proof.

## Read next

- [Usage guide](docs/getting-started/usage.md) — adoption, operation, upgrades, and troubleshooting.
- [Temple terminology](docs/concepts/terminology.md) — Positions, Agent Identities, Work Items, Evidence, and profiles.
- [Architecture](docs/concepts/architecture.md) — repository boundaries and canonical state.
- [Auditable Self-Hosting](docs/operations/auditable-self-hosting.md) — inspect Temple's own development records; they are not copied into your project.
- [Documentation map](docs/README.md) — collaboration, UI modes, trackers, assurance, learning, validation, and decisions.
- [Contributing](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md), and [Security](SECURITY.md) — contribution expectations and private reporting routes.

## Human authority remains explicit

Temple can coordinate work and preserve evidence. It does not own business truth, priorities, credentials, spending, irreversible external actions, production remediation, or high-risk approval.

## License

[MIT](LICENSE). Third-party sources and adoption boundaries are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
