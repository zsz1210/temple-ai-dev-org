# WI-0190 integration handoff

## Candidate boundary

Implementation candidate: `50ae4f50fcf74d8468e09956e44e1eb9da99ef71`.
Immediate base: `b15b741` on `codex/wi-0189-parallel-sales-poc`.
Candidate acceptance and integration readiness are separate decisions. Quality evaluation is recorded in `evaluation.md`; the separately assigned reviewer records its own result in `independent-qa.md`.

Integration Owner `agent-mog` joined the completed independent review against the exact candidate above: reviewer `agent-lulu` is distinct from Developer `agent-rikku`; independent focused checks passed 5/5, repository/docs/package checks passed, and no candidate blocker was found. Source files remain unchanged from the full-verification candidate (632/632 Developer evidence). The worker is completed; its claim is released for Release Gate handoff. This join accepts the review evidence, not the inherited branch chain or an integrated main revision.

## Integration dependency

The remote `main` reference was refreshed during this handoff. The immediate base contains 33 commits not reachable from `origin/main`. PR #58 (`codex/wi-0179-optimized-comparison` into `main`) is open. Neither the immediate base branch nor the WI-0190 branch is currently published to origin.

Do not submit the whole inherited chain as an isolated WI-0190 PR, silently accept predecessors, or retarget the existing comparison PR. The Integration Owner must reconcile the predecessor chain and its review evidence before selecting an isolated PR base. A stacked PR requires an intentionally published and reviewed base; an extraction onto main requires its own compatibility check because this change references the inherited Lean functionality.

## Deferred work

- Test-suite inventory and slimming are deferred at the maintainer's request.
- No new model comparison, retry, or modification to sealed WI-0189 evidence is authorized by this handoff.
- No merge, npm publication, or new release is performed.

## Rollback

Before integration, leave the candidate branch unmerged. After authorized integration, revert the isolated WI-0190 instruction and test change through the normal reviewed workflow, preserving project-owned files and predecessor evidence. No schema migration is introduced.
