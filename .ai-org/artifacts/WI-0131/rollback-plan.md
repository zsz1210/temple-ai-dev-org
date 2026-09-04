# Rollback plan — WI-0131

Before integration, abandon or revert the WI-0131 commits. After integration, revert the WI-0131 merge commit, then run `npm run verify`.

Rollback restores the earlier broad bounded-to-Luna shadow recommendation and removes the v2 experiment preparation. It does not delete historical WI-0130 evidence or any project-owned live experiment lab.
