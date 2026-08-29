<!-- temple:instructions:start -->
# Temple project instructions

- Read `TEMPLE.md` and `.ai-org/project/assignments.json` before taking a Position.
- A Codex custom agent name in `.codex/agents` is a Position configuration, not the project's Agent display name.
- Use durable work item IDs. Do not use chat titles as identifiers.
- Use `$temple-work` and Temple CLI commands for work items, handoffs, state transitions, closeout, and Codex task registration instead of hand-editing canonical JSON when the CLI supports the operation.
- Use the suggested title `WI-#### · Position · Agent Name` when creating a Codex task, then register its stable thread ID.
- Persist confirmed specs, decisions, handoffs, and evidence in repository files.
- Follow `Spec → Design → Build → Test → Eval → Independent QA → Release Gate`.
- Developer and Independent QA must be different Agent Identities for the same work.
- Do not overwrite project-owned files during a template update.
- Ask for human approval at the boundaries listed in `.ai-org/core/policies.json`.
- A completed Codex task may be marked archive-ready, but Temple never archives app tasks by itself.
<!-- temple:instructions:end -->
