# WI-0089 Rollback Plan

If the outcome-first title contract causes navigation regressions or becomes incompatible with a later Codex task-list boundary:

1. Create a dedicated rollback Work Item from the then-current revision; do not rewrite Git history.
2. Preserve WI-0089 lifecycle and test evidence, including the live truncation observation and Independent QA report.
3. Apply a forward change that restores the last accepted title-generation behavior in source, project overlay policy, root managed copies, tests, and documentation. Do not delete historical task-registry or app-title evidence.
4. Run the self-host upgrade, focused workflow and orchestration tests, complete repository verification, schema validation, Doctor, and a fresh Codex task-list readback.
5. Refresh repository title suggestions explicitly only after the rollback behavior is verified. Rename visible Codex tasks separately and verify each app response; do not create, message, archive, dispatch, or model-switch a task.
6. Record the exact rollback candidate, remaining navigation limits, and any required future revalidation before closeout.

No push, publication, or release is part of this rollback plan without separate authorization.
