# Closeout-0A release-integrity validation

- Framework version: `0.1.0-alpha.22`
- Validated source revision: `6db279e1084a208b36845f6a31bec0e6e0c19066`
- Validation date: 2026-08-30
- Local environment: macOS arm64, Node.js `v25.6.1`, npm `11.11.0`
- Remote environment: GitHub Actions Ubuntu runner, Node.js 22
- Scope: Closeout findings C0-01 and C0-02
- Result: Passed with retained limits

## Release ledger and local verification

- `CHANGELOG.md` now records Alpha.20, Alpha.21, and Alpha.22 in newest-first order and preserves their bounded claims and retained limits.
- The roadmap identifies `0.1.0-alpha.22` as the implemented version, labels Phase 1 as a delivered foundation, labels Phase 3A through 3C as delivered increments, and keeps Phase 4 implementation behind the Closeout-0 entry gate.
- The English, Japanese, and Traditional Chinese README entry points remained aligned on the Alpha.20–22 control-plane capability and authority boundaries; no README content change was required.
- `scripts/check-repo.mjs` now fails when the first changelog version is not the current framework version.
- `npm run verify` passed repository checks and all 129 tests at the validated source revision.
- A bounded local link check covered 119 Markdown files and found zero missing repository-relative targets.

## Remote reproducibility evidence

- `main` was pushed and `git ls-remote origin refs/heads/main` resolved to the exact validated source revision.
- GitHub Actions [CI run 33282173931](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33282173931) completed successfully for head SHA `6db279e1084a208b36845f6a31bec0e6e0c19066`.
- The `verify` job `99179055785` completed in 3 minutes 35 seconds after checkout, Node.js setup, and dependency installation; `npm run verify` passed.

## Clean exact-revision recovery

A disposable directory was created outside the repository. The validation did not reuse the maintainer checkout or a development CLI override.

1. The GitHub repository was cloned into a new source directory.
2. The source resolved to `6db279e1084a208b36845f6a31bec0e6e0c19066`, `git status --porcelain` was empty, and `npm ci --ignore-scripts` completed with zero reported vulnerabilities.
3. A new empty Git repository was initialized as the target and received a disposable five-Identity Solo configuration.
4. The clean source initialized the target successfully. The automatic post-init doctor reported 35 passes, zero warnings, and zero failures.
5. The installed `temple.cli-bootstrap/v1` record contained:
   - `version`: `0.1.0-alpha.22`
   - `repository_spec`: `git+https://github.com/zsz1210/temple-ai-dev-org.git#6db279e1084a208b36845f6a31bec0e6e0c19066`
   - `source_revision`: `6db279e1084a208b36845f6a31bec0e6e0c19066`
   - `source_clean`: `true`
6. With `TEMPLE_CLI_PATH` explicitly removed, `node ./templew.mjs --version` recovered the remote Git source and returned `0.1.0-alpha.22`.
7. With the same override removed, `node ./templew.mjs doctor . --json` exited successfully and reported 35 passes, zero warnings, zero failures, and `healthy: true`.

The launcher emitted npm Git-package integrity and `.npmignore` fallback warnings. They did not prevent exact-revision recovery. Explicit package-content control remains tracked separately as OS-02 in the [Pre-Phase 4 closeout review](../planning/pre-phase-4-closeout-review.md).

## Retained limits

- Closeout-0A does not complete the live Codex Human Inbox thin slice, the live read-only GitHub PR and Checks thin slice, or the data-bearing Alpha.19-to-22 upgrade rehearsal. These remain C0-03, C0-04, and C0-05.
- The repository remains private. No release tag or npm package was published, and no repository visibility or protection setting changed.
- This validation proves exact-revision recovery from the configured Git source for the stated environment. It does not claim offline recovery, Windows support, public-consumer access, or generic third-party Git-host compatibility.

Closeout-0A is complete. Phase 4 implementation remains held until Closeout-0B passes or each remaining validation receives an explicit owner, reason, stop condition, and next review point.
