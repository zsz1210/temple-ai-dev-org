# WI-0157 Developer evidence

- Developer: Rikku (`agent-rikku`)
- Candidate revision: `0155149dbcb6f5ee250b01b5f0d3078dc81c72fb`
- Scope: lifecycle evidence guidance and repository-artifact validation
- External action: none

## Delivered

- The global closeout help now names all four Standard release-gate `--satisfy` keys.
- Transition and closeout reject unsafe, missing, directory, symlink, and repository-escaping artifact references before canonical Work Item or event mutation.
- Normalized Evidence IDs, bare Git revisions, `git:` references, URLs, and intentional non-path literals retain their existing behavior.
- Doctor and `status --no-write` generated-view byte preservation is covered by regression tests; write-enabled `status` remains the explicit view writer.
- The WI-0156 timestamp attribution is corrected through an indexed append-only erratum without changing the sealed source report or comparison artifact.

## Verification history

The first full run exposed ten legacy tests that named fixture artifact paths without creating the corresponding files. Those fixtures were corrected to create real evidence. One existing Console refresh test timed out once under the concurrent full-suite load and then passed in both a focused rerun and the final full run.

The final exact-candidate verification ran in an isolated detached worktree after lockfile-based dependency installation:

- `npm run verify`
- Repository checks: pass
- Documentation links: pass
- Package boundary: pass
- Node tests: 434 passed, 0 failed
- Duration: 81.887 seconds

No model generation, clean-room Provider run, retry, reset, fallback, publication, or release occurred.
