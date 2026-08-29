# Vision and operating model

Temple is a repository-native, extensible framework for turning product intent into trustworthy software through role-based AI collaboration, composable engineering methods, durable project state, and evidence-gated delivery.

It does not try to make every AI conversation remember everything. It gives every Position a shared operating model and a recoverable source of truth, so work can continue across tasks, Agents, and time without reconstructing the development organization.

## The six framework layers

| Layer | Question it answers | Primary mechanisms |
|---|---|---|
| Product intent and domain | What problem, language, boundary, and outcome are real? | Decision interview, domain modeling, specs, glossary, ADRs |
| Organization and authority | Who is responsible, and who may approve what? | Positions, Agent Identities, Assignments, human approval boundaries |
| Engineering methods and capabilities | How should this kind of work be performed? | Core Skills, official packs, project and third-party extensions |
| Work orchestration | What is happening now, and what comes next? | Work items, lifecycle transitions, handoffs, task registry |
| Verification and delivery | What evidence supports completion? | Tests, evaluation, Independent QA, exact revision, release gate |
| Durable state and observability | Can another task recover, learn from, and inspect the truth? | Project files, Learning Loop, event log, status projections, checksums, future adapters |

No single layer is the framework by itself. Roles without engineering methods only divide labor. Skills without authority and durable state become disconnected prompts. Workflow without evidence produces ceremonial completion. Temple connects these parts while keeping product truth in the repository.

## Scaling principle

The responsibilities remain stable as a project grows; staffing, method depth, artifacts, and gates change in proportion to risk.

- A small experiment may use five Agent Identities across ten Positions, a short Spec, one vertical slice, and local verification.
- A future larger-product profile can separate more Positions into dedicated Identities, install focused capability packs, require deeper design and evaluation, and integrate additional evidence sources.
- A future high-risk profile can add specialized Skills, stricter approval policy, security review, release evidence, and external adapters without replacing the core lifecycle.

The current alpha proves a lean configuration, core Skills, one optional Build Quality pack, project-local state, and bounded pilots. Risk-based profiles, custom Positions and workflows, a capability registry, custom packs, multi-repository operation, and full cross-task recovery evidence are planned rather than claimed as shipped.

The same scaling principle applies to learning. Evidence from one work item begins as a project Lesson, not a universal rule. Repeated and validated learning may become a Practice, then the project may deliberately promote it to a Skill, automated check, ADR, or instruction. See the [Engineering Learning Loop](engineering-learning.md).

## Organizational principles

1. A Position is a stable set of responsibilities and authority. An Agent Identity is a named executor in a project. An Assignment connects them.
2. One Agent may hold multiple Positions, so a small project does not need ten AI workers running at once.
3. Every Position exists from day one. Adding Agents later changes Assignments, not workflow language or historical data.
4. Developer and Independent QA must use different Agent Identities so one executor does not certify its own work.
5. Humans own business truth, priorities, cost, and high-risk approval. The Engineering Manager is the primary entry point.
6. Documents, Git state, test results, runtime evidence, and approval records—not chat memory—are canonical state.
7. Engineering methods are composable. A Skill changes the reusable procedure, not the Position's authority or the user's authorization.
8. Extensions remain project-owned unless an explicit promotion process transfers them into core or an official pack.

## The ten Positions

| Position | Primary responsibilities | Primary outputs | Cannot self-approve |
|---|---|---|---|
| Engineering Manager | Intake, decomposition, delegation, unblocking, learning triage, overall status | Work order, handoff, learning triage, status | Business priority, high-risk release |
| Product Manager | Problem, scope, acceptance criteria | Specification, acceptance criteria | Technical design, release |
| UX Designer | User flow, states, interaction risks | UX notes, flow, copy decisions | Implementation quality, release |
| UI Designer | Visual hierarchy, layout, components, design-system guidance, UI delivery mode | UI brief, visual direction, preview or design source when required | Implementation quality, release |
| Tech Lead | Architecture, interfaces, risk, technical decisions, technical Practices | Design, ADR, implementation plan, technical Practice | Product scope, independent QA |
| Developer | Implementation, unit tests, self-verification | Code, test evidence, handoff | Independent QA of their own work |
| Quality & Evaluation Engineer | Test design, evaluation, regression evidence | Test plan, evaluation report | Release |
| Independent QA | Independent reproduction, acceptance, counterexample search | QA report, pass or fail | Their own upstream implementation |
| Release Manager | Release gate, versioning, rollback readiness | Release record, go or no-go proposal | High-risk human approval |
| Observer | Observable views derived from canonical state | Status, timeline, learning signals, stale alerts | Any product or release decision |

## Recommended initial configuration

A small project can cover ten Positions with five Agent Identities:

1. Coordination: Engineering Manager, Release Manager, Observer.
2. Product Design: Product Manager, UX Designer, UI Designer.
3. Technical: Tech Lead.
4. Delivery: Developer.
5. Quality: Quality & Evaluation Engineer, Independent QA.

These are Assignment slots, not Agent names. Names are created only during the project's first initialization.

## UI design depth

UI design is always owned, but pre-implementation visual artifacts scale with risk:

- **Code-first:** implementation is the first visual artifact; a concise UI brief, state coverage, and runtime visual review remain required.
- **Preview-first:** review a wireframe, code preview, prototype, or equivalent artifact before full implementation.
- **Design-led:** use an approved, versioned design source and implementation mapping for brand-sensitive, expensive, or multi-party work.

The framework defines evidence rather than mandating Figma. See [UI design responsibility and delivery modes](ui-design.md).

## Work lifecycle

```text
Intake
  → Spec
  → Design
  → Build
  → Test
  → Eval
  → Independent QA
  → Release Gate
  → Done
```

Every handoff must include the work item ID, input revision, completed work, evidence location, unresolved issues, and next Position. Without those fields, conversation content is context—not proof of completion.
