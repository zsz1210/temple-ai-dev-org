# Git-hidden product change recovery repair

The human authorized completing the fix after PR review reproduced changed
`app.mjs` hidden by both `assume-unchanged` and `skip-worktree`: unchanged preview
fingerprint, successful reconciliation, Doctor 37/0/0 despite different bytes.
This supersedes the affected product-scope claim of WI-0247; its records remain
historical. No merge, release, publication or provider experiment is authorized.

Keep Standard gates, approved scope, original receipts and current actor checks.
Replace reliance on status alone with direct filesystem inventory/content/mode
comparison to the original candidate's Git tree, without changing index flags.
Use NUL-delimited tree entries and literal paths. Hash actual bytes as Git blobs;
do not execute clean filters. Recheck with every preview, including apply's
post-diagnostics and pre-settlement checks. Reject symlinks, submodules and
nonregular scope entries rather than following them. Fail closed for missing
files, mode drift, unexpected files or unsupported object formats.

Acceptance: both hidden-change flags reject preview/apply with no settled record;
unchanged flagged files pass. Detect hidden mutation during diagnostics, missing
files, binary content, ignored additions and unsafe links. Preserve normal recovery
and test fixtures. Run full offline tests on the corrected exact candidate and
distinct review; retain the pre-existing nonblocking D1 error-quality limitation.

Ownership: only recovery module, its regression tests and operator guide. No
overlap with terminal README work. Ordinary finish and unrelated product behavior
are not redesigned. Rollback: stop use of recovery and revert this correction by
reviewed change; never delete or hand-edit journals to bypass a guard.
