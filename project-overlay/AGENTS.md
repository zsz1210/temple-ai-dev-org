<!-- temple:instructions:start -->
# Project AI development organization instructions

- Read `TEMPLE.md`, `.ai-org/project/assignments.json`, `.ai-org/project/collaboration.json`, `.ai-org/project/spec-index.json`, and `.ai-org/project/tracker.json` before taking a Position.
- A Codex custom agent name in `.codex/agents` is a Position configuration, not the project's Agent display name.
- Use durable work item IDs. Do not use chat titles as identifiers.
- Use `$temple-work` and `temple` CLI commands for work items, handoffs, state transitions, closeout, and Codex task registration instead of hand-editing canonical JSON when the CLI supports the operation.
- Use the suggested title `Work Item ID · Position · Agent Name` when creating a Codex task, then register its stable thread ID.
- Before scoped work, preview `temple context resolve . --work-item WI-#### --position <position> --no-write --json`; open only the routed canonical sources needed for the current responsibility.
- Use `temple capability find` when the relevant repository Skill is uncertain. A discovered Skill does not grant authority, approve dependencies, or change its lifecycle ownership.
- Treat `.ai-org/project/context-map.json` as a project-owned routing index. Treat `.ai-org/views/capabilities.json` and `.ai-org/views/work-items/**` as rebuildable projections, never as stronger authority than their canonical sources.
- Keep company-visible tracker items, repository Work Items, and Codex tasks distinct. Use team-visible parent Work Items for external mappings and internal child Work Items for AI-only decomposition unless the configured granularity says otherwise. External tracker observations and `.ai-org/views/tracker.json` are projections, not lifecycle authority. Never store tracker credentials, infer permission to write externally, or accept an external completion as QA or Release Gate evidence.
- When asked only to inspect, explain, diagnose, review, or report status, keep the task read-only.
- Persist confirmed specs, decisions, handoffs, and evidence only when the request or current authorized work item includes repository updates; otherwise propose the exact change.
- Treat `.ai-org/project/spec-index.json` as the compact authority registry, not as a copy of each document. Use `indexed` mode to pin at least one approved current product-specification revision and any supporting UX, UI, API, or technical-design revisions. Use explicit `gate-evidence` mode for a bounded lightweight item that relies on named approved-scope and acceptance evidence instead of an indexed product specification; supporting indexed contracts may still govern their declared subjects. A derived projection cannot satisfy authority; approved repository-native sources pin a content digest; stale, unapproved, or drifted references must be reconciled and intentionally repinned before delivery continues.
- Record likely write scope with `--affected-path` and explicit canonical routes with `--context-ref` when creating work. Coordinate reported overlap with other non-terminal work items before editing shared paths.
- In Collaborative mode, act only through the sponsored Agent Identity and eligible Position Membership recorded for the current claim. A Discipline never expands the Position's authority.
- Before parallel execution, record dependencies, base revision, affected paths, shared-contract status, integration owner, and required Disciplines. Run `temple parallel check`; do not parallelize work reported as sequential or blocked.
- Use `temple work-item claim/release` around active ownership. Separate machines must still coordinate through branches, pull requests, CI, and Git conflict resolution; the local mutation lock is not distributed.
- Search `.ai-org/learning/index.json` for active Practices and relevant validated Lessons before repeating similar work. Read only the referenced records that match the current Position, scope, and technical area.
- When learning capture is authorized, keep the Lesson or Practice record and its index entry consistent. A Lesson is not automatically an instruction, Practice, Skill, or permission.
- Use `$domain-modeling` when product documents, code, or people assign conflicting meanings to important terms.
- Use `$project-documentation` when human-facing README, setup, usage, contribution, or documentation-index claims must be created or reconciled with repository evidence.
- Use `$skill-authoring` when asked to turn a reusable project procedure into a repository-local Skill. Check exact `temple.lock.managed_files` ownership first; do not edit the lock, install dependencies, publish, or promote the Skill without separate authorization.
- Follow `Spec → Design → Build → Test → Eval → Independent QA → Release Gate`.
- Record `not-applicable` for work with no user-facing interface and attach no `ui_refs`. For user-interface work, resolve the UI Designer Assignment and select `code-first`, `preview-first`, or `design-led` from `.ai-org/core/ui-design.json`. Make the choice explicit before Build, record it on the Work Item, and preserve its rationale and evidence in a project-owned UI design brief. Preview-first and design-led require an approved `ui_ref`; satisfy the selected mode's named prebuild and closeout evidence and never interpret code-first as permission to skip runtime visual review.
- When a work item is a pilot, example, or template validation, stop when its stated evidence and closeout are complete; do not infer authorization for another product work item or continued feature development.
- Developer and Independent QA must be different Agent Identities for the same work.
- Do not overwrite project-owned files during an organization system upgrade.
- Ask for human approval at the boundaries listed in `.ai-org/core/policies.json`.
- A completed Codex task may be marked archive-ready, but the CLI never archives app tasks by itself.
<!-- temple:instructions:end -->
