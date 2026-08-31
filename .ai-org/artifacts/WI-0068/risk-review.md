# WI-0068 risk review

- Linked worktrees: use the existing Git-common-directory resolver rather than assuming `.git` is a directory.
- Path disclosure: inspection returns only a repository-relative display and policy label.
- Backward compatibility: omitted configuration continues to select the existing default; explicit worktree-local locations now fail earlier rather than failing only at report time.
- Evidence integrity: do not change WI-0067 participant repositories, manifest, runner state, or telemetry.
