# Evaluation report — WI-0013

- Candidate revision: `835dc57d909d140d365e577acfa412789d91864f`
- Result: pass to Independent QA

## Evaluation

| Requirement | Result | Evidence |
|---|---|---|
| Self-host uses the current worktree | Pass | Competing-runner fixture returned only the worktree-local marker and exact arguments |
| Invalid local boundary fails closed | Pass | Missing, mismatched-version, and path-escape regression cases never reached the competing package runner |
| Ordinary projects retain pinned recovery | Pass | Ordinary init and bootstrap inspection regression coverage; package path remains unchanged in the launcher |
| Explicit override remains compatible | Pass | Existing compatible and incompatible `TEMPLE_CLI_PATH` assertions |
| Installed self-host launcher is healthy | Pass | Root and overlay launchers are byte-identical; default Doctor reported 35 pass, 1 known warning, 0 fail |

## Independent QA target

Check out exact candidate `835dc57d909d140d365e577acfa412789d91864f` in a fresh detached worktree, install only its lockfile dependencies, and run both the full suite and default `node ./templew.mjs doctor . --json`. Do not set `TEMPLE_CLI_PATH`; the test is invalid if Doctor can resolve a different checkout.

## Retained limits

This candidate does not publish a package, prove offline package recovery, or expand self-host behavior beyond the Temple toolkit repository. The Windows symlink case remains platform-limited, while the current macOS path boundary is covered.
