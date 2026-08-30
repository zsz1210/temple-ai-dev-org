# Quality test report — WI-0013

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu
- Candidate revision: `835dc57d909d140d365e577acfa412789d91864f`
- Verdict: pass

## Acceptance coverage

1. A self-host fixture with a competing same-version package runner invoked the worktree-local CLI and preserved the requested arguments.
2. Missing and version-mismatched local CLIs stopped with bootstrap errors and never invoked the competing package runner.
3. On non-Windows hosts, a local CLI symlink escaping the worktree stopped before execution.
4. Ordinary init retained project installation mode, version-pinned bootstrap metadata, `--bootstrap-info`, and compatible explicit override behavior.
5. The managed root launcher and distribution overlay are byte-identical, and Doctor accepted the recorded checksum.

## Evidence reviewed

- Exact-candidate Git evidence: `EVID-20260830T063540Z-8737A2FA`.
- Exact-candidate test evidence: `EVID-20260830T063556Z-6780BE71`.
- Repository and documentation checks passed; all 164 tests passed.
- Default self-host Doctor ran without `TEMPLE_CLI_PATH`: 35 pass, 1 stale-plan warning, 0 failures.

## Limits

The escape regression is skipped on Windows because symlink creation may require privileges. Independent QA must still prove the defining detached-worktree behavior on the current macOS environment and must not use `TEMPLE_CLI_PATH` for Doctor.
