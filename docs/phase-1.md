# Phase 1: An installable, verifiable organization skeleton

## Definition of done

Phase 1 is complete only when all of the following are true:

- A new repository initializes successfully from a configuration whose names have been confirmed.
- `project-overlay/` contains no predefined project Agent names.
- All nine Positions have exactly one active Assignment.
- Developer and Independent QA use different Identities.
- Re-running init does not overwrite user content, and a managed conflict stops the operation.
- Doctor detects managed tampering, model errors, and incomplete instruction integration.
- Status generates a summary from canonical files.
- The CLI completes work-item creation, handoff, transition, and closeout while rejecting invalid gates.
- Codex tasks and threads can be registered with stable IDs and projected with suggested titles, revisions, attention signals, and archive readiness.
- Checksum-aware upgrade migrates legacy package identity and renamed managed Skills without overwriting project-owned state.
- Codex discovers `$temple-work`, `$decision-interview` with conversational and evidence-backed modes, `$domain-modeling`, `$project-documentation`, and `$skill-authoring` locally in the repository.
- Project and third-party Skill files remain project-owned unless their exact paths appear in `temple.lock.managed_files`; untracked collisions stop before writes.
- Core init does not expand development Skills automatically. The Build Quality pack supports dry-run, explicit installation, status observation, checksum-aware upgrade, and safe removal.
- At least one real low-risk work item completes the full Developer, Independent QA, and release-gate flow.
- CI runs all tests in a clean environment.
- A GitHub repository exists with a reproducible commit pushed to it, plus an MIT License and third-party source notices before public release.

## Out of scope for this phase

- Automatically starting multiple persistent Agents or background schedules.
- Having the CLI call a model directly to name Agents.
- Automatically installing Archify, third-party Skills, or any optional pack.
- Directly creating, renaming, opening, or archiving Codex app tasks.
- A web dashboard, real-time event streaming, or a cross-repository portfolio view.
- Automatic production release or bypassing human release approval.
- Turning an ambiguous product idea into a Project Charter, product and technical baselines, and a first vertical slice. That belongs to Phase 1.5; the "new repository" criterion in Phase 1 proves only technical initialization.

## Next steps

1. AiPet completed the second existing-repository portability and Build Quality friction validation.
2. FlowDeck completed the first Phase 1.5 greenfield lifecycle closeout and is frozen as a validation sample; see the [retrospective](pilots/flowdeck-greenfield-retrospective.md).
3. Alpha.8 addresses unresolved-item resolution, candidate-revision projection, CLI discoverability, and the pilot stop boundary.
4. Alpha.8 implements and forward-tests `$project-documentation` against the public README redesign.
5. Alpha.9 establishes governed `$skill-authoring`, public extension rules, and exact-path ownership without claiming a Skill CLI, registry, custom-pack installer, or automated routing evaluation.
6. Validate read-only context recovery in a new Codex task. Enter Phase 2 affected-path ownership, Observer, and evidence-adapter work only after that remaining Phase 1.5 exit gate is complete.
