# WI-0190 integration handoff

## Candidate boundary

Implementation candidate: `50ae4f50fcf74d8468e09956e44e1eb9da99ef71`.
Immediate base: `b15b741` on `codex/wi-0189-parallel-sales-poc`.
Candidate acceptance and integration readiness are separate decisions. Quality evaluation is recorded in `evaluation.md`; the separately assigned reviewer records its own result in `independent-qa.md`.

Integration Owner `agent-mog` joined the completed independent review against the exact candidate above: reviewer `agent-lulu` is distinct from Developer `agent-rikku`; independent focused checks passed 5/5, repository/docs/package checks passed, and no candidate blocker was found. Source files remain unchanged from the full-verification candidate (632/632 Developer evidence). The worker is completed; its claim is released for Release Gate handoff. This join accepts the review evidence, not the inherited branch chain or an integrated main revision.

## Integration dependency

The remote `main` reference was refreshed during this handoff. The immediate base contains 33 commits not reachable from `origin/main`. PR #58 (`codex/wi-0179-optimized-comparison` into `main`) is open. Neither the immediate base branch nor the WI-0190 branch is currently published to origin.

Do not submit the whole inherited chain as an isolated WI-0190 PR, silently accept predecessors, or retarget the existing comparison PR. The Integration Owner must reconcile the predecessor chain and its review evidence before selecting an isolated PR base. A stacked PR requires an intentionally published and reviewed base; an extraction onto main requires its own compatibility check because this change references the inherited Lean functionality.

## Follow-up: predecessor audit and publication hold

The maintainer authorized processing the predecessor chain. Read-only Git/GitHub inspection reconfirmed the open PR #58 at `9ef5d331858f30b2fd78fdac0e93fdc126396bd5`. No branch was pushed, rewritten, deleted, merged, or retargeted during this audit.

Proposed review boundaries (not created PRs):

| Boundary | Head | Review status |
| --- | --- | --- |
| Existing comparison PR | `9ef5d33` | PR #58 remains unchanged; stopped results are not an efficiency claim. |
| Compact diagnostics and opt-in Lean chain | `7c9c1b8` | Includes concluded experiment records and accepted implementation slices through WI-0188. WI-0183 remains a design intake, not a completed implementation claim. WI-0188 records corrected-candidate 630/630 full verification and distinct QA. |
| Retained parallel experiment | `b15b741` | WI-0189 remains at Test with unresolved outer QA; publishable draft evidence must not imply accepted parallel delivery. No retry is authorized. |
| Proportionate instruction routes | `f897ebe` | WI-0190 candidate passed 632/632 and distinct QA, but remains at Release Gate pending integration. |

Current-tree publication audit reported zero blocked text findings and 68 existing binary review items; no new image review was performed. This is not a full-history clearance. A separate added-line scan of unpublished history found two local absolute-path fields in `.ai-org/work-items/WI-0183.json`: introduced by `17f39f6` and removed by `7174489`. The literal private path is intentionally not repeated here. Pushing descendant branches would still publish those old blobs.

Publication hold: do not push the proposed stack while that history remains reachable. Obtain the maintainer's decision on preparing a separate sanitized integration lineage for unpublished commits. Preserve original local branches and already-public history; use no force push. A rewritten lineage changes commit IDs, so retain a private original-to-sanitized mapping and explicitly reconcile revision-based evidence rather than silently treating old SHA references as publicly resolvable or newly tested candidates. Validate the resulting source/tree relationship and integration candidate before opening PRs. The current-tree cleanup alone does not resolve this hold.

The scan was targeted, not proof that every historical secret pattern or binary is safe. Full-history publication clearance remains part of preparing the sanitized lineage.

Audit-record verification: `npm run verify:fast` passed repository, documentation and package checks plus 54/54 fast tests. Doctor reported 36 pass, zero failures and one stale-plan warning after claim release; no dispatch used that stale plan. No product source changed and no full-suite or live-model rerun was performed for this evidence-only update.

## Deferred work (unchanged)

- Test-suite inventory and slimming are deferred at the maintainer's request.
- No new model comparison, retry, or modification to sealed WI-0189 evidence is authorized by this handoff.
- No merge, npm publication, or new release is performed.

## Rollback

Before integration, leave the candidate branch unmerged. After authorized integration, revert the isolated WI-0190 instruction and test change through the normal reviewed workflow, preserving project-owned files and predecessor evidence. No schema migration is introduced.
