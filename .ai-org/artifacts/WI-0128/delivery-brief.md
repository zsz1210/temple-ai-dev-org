# WI-0128 delivery brief

## Work order and approved scope

Turn the Roadmap into a product-level view and repair the human path exposed by the Console-free core audit. The change is limited to documentation and retained validation planning. It does not modify runtime behavior, start a Provider, change model policy, alter the Management Console, or authorize release.

## Acceptance criteria

- The English, Japanese, and Traditional Chinese Roadmaps explain product purpose, capabilities, delivered milestones, current work, next qualification, and later direction without using Work Item-level execution history as the main narrative.
- One short English Core Path gives a first-time user a Lean-first journey using the repository-pinned launcher and explains when Standard or High-Assurance replaces it.
- The main Usage guide links to that path, demonstrates ordinary claim and release, places capability, context, and Execution Route resolution immediately before execution, and describes `no-go` as terminal `concluded` work.
- A separate validation plan distinguishes framework-process value from adaptive-route value and states its decision, measures, validity gates, and stop conditions.
- Documentation links and repository verification pass. Independent QA reviews the exact candidate separately from the Developer evidence.

## Technical design

Keep the Roadmap intentionally high level. Move operational truth, exact experiments, and release blockers behind links to Work Items, validation records, and release-readiness documents. Add `docs/getting-started/core-path.md` as the primary post-initialization journey while retaining `usage.md` as the complete reference manual. Add only small bridge sections to `usage.md`; do not duplicate every command or concept.

The experiment document records a future decision protocol only. It must not imply that route resolution automatically launches a model or that prior Wave 5 evidence proves Temple efficiency.

## Risk review

Risk is low. The change is local, reversible, documentation-only, and has no external or user-data effect. The principal risk is publishing commands or capability claims that drift from the implemented CLI. Mitigate it by deriving commands from existing executable tests, running documentation-link checks and the full suite, and performing exact-candidate Independent QA.

## Lean profile eligibility

The scope is bounded to named Markdown files and repository lifecycle artifacts. It has no external write, publication, migration, shared runtime contract, sensitive data, or Independent QA requirement imposed by the product risk. Separate Independent QA is retained as an acceptance check for this framework's own documentation discipline, not as a reason to escalate the Work Item.
