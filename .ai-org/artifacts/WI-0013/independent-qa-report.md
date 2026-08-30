# Independent QA report — WI-0013

- Position: Independent QA
- Agent Identity: Lulu
- Candidate revision: `835dc57d909d140d365e577acfa412789d91864f`
- Verdict: pass

## Reproduction

- Created a fresh detached Git worktree at the exact candidate revision.
- The host exposed a competing global Temple command at `/opt/homebrew/bin/temple`.
- `npm ci` installed 6 packages, audited 7 packages, and reported 0 vulnerabilities.
- `npm run verify` completed from `2026-08-30T06:36:57Z` through `2026-08-30T06:37:34Z` with exit code 0.
- Repository checks and documentation-link checks passed; all 164 tests passed with zero failures, skips, or todos.
- With `TEMPLE_CLI_PATH` explicitly removed, `node ./templew.mjs doctor . --json` reported 35 pass, 1 warning, and 0 failures.
- Doctor passed the CLI bootstrap, toolkit self-host installation boundary, and all 75 managed-file checks. The warning was the existing stale generated parallel plan.
- The detached worktree remained clean and was removed after evidence capture.

## Independence and boundary

Independent QA installed dependencies inside the fresh checkout and did not use the primary checkout's `node_modules` or Developer claims as execution evidence. The defining Doctor command used no CLI override despite the available global command, so a same-version global checkout could not satisfy the result.

No push, package publication, deployment, external tracker write, model switch, or spend occurred. The pass covers current macOS detached-worktree behavior and the automated ordinary-project regression; it does not claim Windows symlink verification, offline package recovery, or a published distribution.

## Conclusion

The candidate closes the retained WI-0012 bootstrap follow-up. Toolkit self-host verification now binds to the candidate worktree by default and fails closed on an invalid local boundary.
