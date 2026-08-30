# Developer evidence — WI-0013

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `835dc57d909d140d365e577acfa412789d91864f`
- Result: pass to Quality & Evaluation

## Exact-revision verification

- `npm run verify` ran after the candidate commit from `2026-08-30T06:34:26Z` through `2026-08-30T06:35:03Z` with exit code 0.
- Repository checks and documentation-link checks passed; all 164 tests passed with zero failures, skips, or todos.
- The runtime-coordination suite includes four focused self-host launcher cases: current-worktree execution, missing local CLI refusal, version mismatch refusal, and canonical-path escape refusal.
- `node ./templew.mjs doctor . --json` ran without `TEMPLE_CLI_PATH` and reported 35 pass, 1 warning, and 0 failures. The warning is the existing stale generated parallel plan.

## Behavior and boundaries

- Toolkit self-host mode now resolves the current checkout's canonical `bin/temple.mjs`, keeps it below the current worktree, verifies its pinned version, and fails closed before any package fallback.
- An explicit compatible `TEMPLE_CLI_PATH` remains the highest-priority diagnostic override.
- Ordinary initialized projects continue to use the lock's exact Git package source when available or its version-pinned package source.
- The managed root launcher was refreshed through `temple upgrade`, and its checksum matches `temple.lock`.

## Limits and rollback

This evidence does not claim a published package, offline cache, remote-host behavior, or cross-platform symlink behavior on Windows. Revert candidate `835dc57d909d140d365e577acfa412789d91864f` to restore the previous launcher; exact-candidate self-host checks can temporarily use `TEMPLE_CLI_PATH=./bin/temple.mjs` after rollback.
