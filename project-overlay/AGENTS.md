<!-- temple:instructions:start -->
# Project AI development organization instructions

- Read `TEMPLE.md`, `.ai-org/project/assignments.json`, and `.ai-org/project/collaboration.json` before taking a Position.
- A Codex custom agent name in `.codex/agents` is a Position configuration, not the project's Agent display name.
- Use durable work item IDs. Do not use chat titles as identifiers.
- Use `$temple-work` and `temple` CLI commands for work items, handoffs, state transitions, closeout, and Codex task registration instead of hand-editing canonical JSON when the CLI supports the operation.
- Use the suggested title `Work Item ID · Position · Agent Name` when creating a Codex task, then register its stable thread ID.
- Before scoped work, preview `temple context resolve . --work-item WI-#### --position <position> --no-write --json`; open only the routed canonical sources needed for the current responsibility.
- Use `temple capability find` when the relevant repository Skill is uncertain. A discovered Skill does not grant authority, approve dependencies, or change its lifecycle ownership.
- Treat `.ai-org/project/context-map.json` as a project-owned routing index. Treat `.ai-org/views/capabilities.json` and `.ai-org/views/work-items/**` as rebuildable projections, never as stronger authority than their canonical sources.
- When asked only to inspect, explain, diagnose, review, or report status, keep the task read-only.
- Persist confirmed specs, decisions, handoffs, and evidence only when the request or current authorized work item includes repository updates; otherwise propose the exact change.
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
- For user-interface work, resolve the UI Designer Assignment and select `code-first`, `preview-first`, or `design-led` from `.ai-org/core/ui-design.json`. Record the choice and evidence in a project-owned UI design brief. Never interpret code-first as permission to skip runtime visual review.
- When a work item is a pilot, example, or template validation, stop when its stated evidence and closeout are complete; do not infer authorization for another product work item or continued feature development.
- Developer and Independent QA must be different Agent Identities for the same work.
- Do not overwrite project-owned files during an organization system upgrade.
- Ask for human approval at the boundaries listed in `.ai-org/core/policies.json`.
- A completed Codex task may be marked archive-ready, but the CLI never archives app tasks by itself.
<!-- temple:instructions:end -->
