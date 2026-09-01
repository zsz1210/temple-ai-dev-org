# WI-0089 Technical Design

## Title construction

Add one shared helper in `src/project.mjs`:

- `shortTaskGoal(title, maximumCodePoints?)` collapses whitespace, replaces embedded `·`, and applies a caller-supplied Unicode code-point budget with `…`.
- `suggestedTaskTitle(context, workItemId, positionId, workItemTitle, agentDisplayName?)` returns `WI-* · goal · Position (Agent)` and computes the goal budget from a 58-code-point complete-title ceiling.

The initial 48-code-point goal design failed its live application check: Codex read an accepted 86-code-point title back as a 58-code-point prefix plus `…`, hiding Position and Agent. The corrected algorithm budgets prefix and suffix first, then shortens only the goal. Identity and responsibility fields are never silently abbreviated.

Work Item creation, lifecycle transitions, task registration, and parallel dispatch use the same helper. Claimed or pooled Agents pass their actual display name rather than falling back to the default Assignment.

## Explicit registry refresh

Add `temple task refresh-titles [target] [--task-id task-####] [--json]`.

- Read every selected task's canonical Work Item, Position, and Agent Identity.
- Change only `suggested_title` when the deterministic value differs.
- Preserve all task/thread IDs, execution origin, provider/model metadata, status, revision, claim, worker, timestamps, and archive state byte-for-byte.
- Write one event only when at least one title changes; a second run is idempotent and performs no write.
- Return `external_action_performed: false`. The command does not call Codex or rename an app task.
- Use the existing project mutation lock and rollback snapshots.

## Distribution and self-host boundary

Update the identity-free `project-overlay/` policy, `TEMPLE.md`, and `AGENTS.md` source. Then run the self-host upgrade so only checksum-clean managed root files and `temple.lock` are refreshed. Root project identities remain outside the overlay.

## Human operating documentation

- ADR-0041 supersedes only ADR-0006's old title-format sentence; the registry and canonical-ID decision remains accepted.
- The usage and task/tracker guides explain ordinary versus main-control tasks, show the refresh command, and separate repository suggestion refresh from Codex app rename.

## Application to this project

After tests pass:

1. run the explicit registry refresh and verify only `suggested_title` fields changed;
2. list accessible Codex tasks and resolve stable thread IDs;
3. rename the main control task and bounded Work Item task(s) using the app API;
4. read back visible titles; do not create, message, archive, or navigate as part of the rename.
