# Repository instructions

This repository builds the Temple AI Development Organization Framework.

- Never add project-specific Agent display names to `project-overlay/`.
- Keep Position definitions separate from Agent Identity and Assignment data.
- Treat files and evidence as canonical; chat titles and conversation memory are not state.
- Preserve managed, project-owned, and generated boundaries.
- Treat only exact `temple.lock.managed_files` entries as framework-managed; allowed roots are not ownership claims.
- Never make Developer and Independent QA the same Agent Identity.
- Follow `docs/extensions/skill-authoring.md` and `docs/extensions/skill-design.md` when creating or promoting a Skill.
- Follow `docs/extensions/engineering-learning.md` when changing the learning schema, templates, promotion rules, or retrieval behavior; do not treat one Lesson as a framework-wide rule.
- Follow `docs/concepts/ui-design.md` and ADR-0016 when changing UI ownership, delivery modes, evidence, or tool policy; do not make one design vendor a core dependency.
- Follow `docs/operations/task-and-tracker-coordination.md` and ADR-0020 when changing external-tracker mapping, field ownership, observations, reconciliation, or write policy; never store credentials or infer permission to mutate an external system.
- Use `apply_patch` for edits. Follow `docs/getting-started/testing.md`: run `npm run verify:fast` for prose-only changes and `npm run verify` for behavioral candidates or releases; focused groups are editing aids, not full-verification evidence. Run Doctor after canonical organization-state changes and the browser gate for UI changes.
- Do not vendor or activate optional integrations without an ADR, pinned version, license review, and tests.

<!-- temple:instructions:start -->
# Project AI development organization instructions

## Start

- Repository files and recorded evidence are canonical. Conversation memory, chat titles, generated views, and external tracker observations are not lifecycle authority. Use durable Work Item IDs; a Codex custom-agent name identifies a Position configuration, not the project's Agent display name.
- For a known Work Item, first preview `node ./templew.mjs context resolve . --work-item WI-#### --position <position> --no-write --json`, then open only the routed sources needed for that responsibility. The Work Item stage and `primary` purpose are defaults; select `--purpose integration` or `--purpose recovery` deliberately, and compare the body-free selection digest before reopening unchanged context. Use `node ./templew.mjs capability find` when the relevant repository Skill is uncertain. Discovery grants no authority and changes no lifecycle ownership.
- For new work, recovery, or specialized operations, read `TEMPLE.md` and the applicable repository Skill. If `temple init` ran during this session, resolve its `TEMPLE_BOOTSTRAP_REQUIRED` result before governed mutation; a fresh session is preferred, while continuity requires the named explicit reads and read-only Doctor, Status, and Context checks. The result is not evidence of instruction loading, comprehension, authority, or lifecycle progress.
- Use `$temple-work` and the repository launcher `node ./templew.mjs` for supported Work Item, claim, worker, resource, handoff, transition, closeout, and task-registry mutations. Do not hand-edit their canonical JSON or substitute an unversioned global CLI after a bootstrap mismatch.

## Authority

- Keep Position, Agent Identity, Assignment, Discipline, Human Principal, and authority grant separate. In Collaborative or High-Assurance mode, act only through the sponsored Identity and eligible Position Membership on the claim; a Discipline never expands Position authority.
- Keep repository Work Items, Codex tasks, and company-visible tracker items distinct. External observations and `.ai-org/views/**` are projections. Never store tracker credentials, infer external write permission, or accept external completion as QA or Release Gate evidence.
- `.ai-org/project/spec-index.json` is the compact authority registry, not a copy of documents. Indexed work pins approved current repository-native revisions; bounded gate-evidence work cites named approved scope and acceptance evidence. Derived, stale, unapproved, or drifted references cannot satisfy authority until reconciled and intentionally repinned.
- `.ai-org/project/context-map.json` and Engineering Learning route context; neither grants permission. Search active Practices and matching validated Lessons before repeated work. Use the Learning CLI for authorized capture, and never promote one Lesson automatically into a Practice, Skill, instruction, or framework-wide rule.
- Only exact `temple.lock.managed_files` entries are framework-managed. Allowed roots are not ownership claims, and upgrades must preserve project-owned files.

## Delivery

- When work is authorized, record likely write scope with `--affected-path` and explicit routes with `--context-ref`. Coordinate every reported overlap by Work Item ID before editing shared paths. Use `work-item claim/release` around active ownership.
- Before parallel execution, record dependencies, base revision, affected paths, contract status, integration owner, stage Disciplines, and shared resources. Run `parallel check` or `parallel plan`; never dispatch a rejected, sequential, blocked, or unauthorized plan. Planning alone creates no claim or Codex task.
- Prepare each first-wave worker before dispatch, attach internal subagents with `worker attach`, and register only separate user-owned Codex tasks. Worker completion releases resources but neither releases the claim nor advances lifecycle state. The Integration Owner joins exact revisions, checks, and unresolved items before dependent work, then rebuilds the plan.
- Separate machines still coordinate through branches, pull requests, CI, and Git conflict resolution; the local lock is not distributed. Follow the project's repository-integration record—the framework does not impose GitHub Flow or infer merge, release, deployment, or hosting authority.
- Follow `Spec → Design → Build → Test → Eval → Independent QA → Release Gate`. Developer and Independent QA must be different Agent Identities for the same work.
- For user-interface work, resolve the UI Designer Assignment and select `code-first`, `preview-first`, or `design-led` from `.ai-org/core/ui-design.json`; record the mode, rationale, references, and required prebuild/runtime evidence. Use `not-applicable` with no `ui_refs` only when there is no user-facing interface.
- For High-Assurance work, read `.ai-org/core/high-assurance.json`, preserve the risk tier, use normalized revision-matched Evidence IDs, satisfy distinct Human Principal and rollback requirements, and remember that organizational closeout never authorizes production.

## Safety

- Inspection, explanation, diagnosis, review, and status requests are read-only. Persist decisions, specs, handoffs, or evidence only within authorized repository-update scope.
- Read `.ai-org/project/usage-policy.json` before model, reasoning, Credits, or calibration choices. Routine actions are automatic only inside its approved reversible local allowlisted budget; ask at named exceptions and every other governing boundary. Diagnostic sample counts are not statistical proof or routing authority.
- Use the suggested title `Work Item ID · short goal · Position (Agent Name)` for bounded Codex tasks and `Project · control scope · Primary Position (Agent Name)` for the long-lived control task; register stable task IDs. The CLI never creates, renames, archives, or resumes app tasks by itself.
- A pilot, example, template validation, or bounded experiment stops when its stated evidence and closeout are complete. Do not infer another product task, dependency, publication, external action, or continued feature development.
<!-- temple:instructions:end -->
