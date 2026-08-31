# WI-0078 product direction

- Product Manager: Yuna
- Reader: a solo developer, teammate, or technical decision-maker encountering Temple for the first time
- Canonical public language: English
- Localized entry points: Japanese and Traditional Chinese

## Reader outcome

Within the first screen and one short scroll, the reader should understand that:

- a human still sets direction and approval boundaries;
- Temple supplies the shared operating structure around development work;
- people and AI agents can participate without sharing one chat or becoming one undifferentiated actor;
- specifications, decisions, code, tests, and evidence remain recoverable in the repository;
- a result is not treated as ready merely because an agent says it is finished.

The reader should not need to know the terms Prompt Engineering, Context Engineering, Harness Engineering, Loop Engineering, Graph Engineering, Agent Identity, Context Capsule, Evidence Registry, or Integration Owner to understand the first visual.

## Public story

Use the following four-part story in every language:

1. **You set the direction.** Product intent, priorities, and meaningful approvals remain human responsibilities.
2. **Temple creates the shared way of working.** It keeps roles clear, context findable, work bounded, verification separate, and learning reusable.
3. **People and AI work together.** Different contributors may plan, design, build, test, and review without being collapsed into one conversation.
4. **The result is trustworthy and recoverable.** The repository retains the work and its evidence so another task or teammate can continue.

## README changes

- Replace the current Mermaid operating-loop diagram with the localized overview SVG and a short explanation.
- Add a compact request-to-release walkthrough using roles, not fixed character or four-person examples.
- Explain the categories of project-owned state created by initialization without turning the README into a file reference.
- Add a small capability-maturity table using `Available now`, `Experimental or bounded`, and `Planned or unverified` language.
- Add direct links to `CONTRIBUTING.md` and `SECURITY.md`.
- Retain the current audience scenarios, assignment-based scaling, quick start, learning, evidence, authority, documentation, and license boundaries unless concise reconciliation removes duplication.

## Content constraints

- Do not claim enterprise, distributed, production-monitoring, unattended-action, token-savings, or universal model-support evidence that the repository does not have.
- Do not describe Graph execution or semantic RAG as required Temple architecture.
- Do not show project-specific Agent names in the conceptual overview.
- Do not add a Console screenshot while `WI-0077` remains a design-only review without implemented and independently verified production Console code.
- Do not add competitive comparisons to the public entry point.

## Acceptance criteria

- The visual can be summarized accurately as: “A person sets direction, Temple coordinates how people and AI work, and the repository preserves evidence for a trustworthy result.”
- Each README contains equivalent meaning and section order in natural language.
- The visual and nearby text remain useful when either one is unavailable.
- A user can find Quick start, maturity limitations, deeper documentation, contribution guidance, security reporting, and licensing without reading internal architecture documents.
