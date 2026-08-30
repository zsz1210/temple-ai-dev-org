# Alpha.26 self-host worktree bootstrap

Status: **passed and independently verified**

## Scope

This record validates WI-0013 at candidate `835dc57d909d140d365e577acfa412789d91864f`: Temple's toolkit self-host launcher binds to the current worktree by default, rejects an invalid repository-local CLI boundary, and no longer requires `TEMPLE_CLI_PATH` for exact-candidate detached-worktree verification.

It closes the bootstrap follow-up retained by the [Alpha.26 history visibility stabilization](alpha-26-history-visibility-stabilization.md). It does not change ordinary product repositories from their exact-revision or version-pinned package recovery path.

## Automated verification

- The runtime-coordination suite added current-worktree execution, missing local CLI, version mismatch, and canonical-path escape cases. Each failure case proved that a competing package runner was not invoked.
- Ordinary init retained version-pinned bootstrap metadata, bootstrap inspection, and compatible explicit-override coverage.
- Developer verification passed repository checks, documentation-link checks, and all 164 tests at the exact candidate revision.
- Root `templew.mjs` and `project-overlay/templew.mjs` were byte-identical after the checksum-managed self-host upgrade.
- Default self-host Doctor ran without `TEMPLE_CLI_PATH` and reported 35 pass, 1 existing stale-plan warning, and 0 failures.

## Independent QA

Independent QA created a fresh detached worktree at the exact candidate. The host had a competing global Temple command at `/opt/homebrew/bin/temple`, while the QA command explicitly removed `TEMPLE_CLI_PATH`.

`npm ci` installed 6 packages and reported 0 vulnerabilities. `npm run verify` passed all 164 tests. Default `node ./templew.mjs doctor . --json` then passed the pinned bootstrap, toolkit self-host boundary, and all 75 managed-file checks, with 35 pass, 1 existing warning, and 0 failures. The worktree remained clean and was removed after evidence capture.

## Result

Toolkit self-host mode canonicalizes the current repository root, source overlay, and local `bin/temple.mjs`; requires both local paths to remain within the worktree; verifies the local CLI version; and fails closed before package fallback. `TEMPLE_CLI_PATH` remains an explicit compatible-version diagnostic override. Ordinary projects continue to use the package source recorded in their lock.

## Retained limits

- Windows symlink creation can require privileges, so the canonical-path escape regression is skipped on Windows. The macOS candidate and detached-worktree boundary passed.
- This evidence does not publish a package, prove an offline cache, or validate remote multi-host bootstrap behavior.
- Organizational closeout does not authorize a push, publication, deployment, external tracker write, model switch, or spend.
