# WI-0163 Developer Verification

- Exact technical candidate: `a6849519c6067b2f73ca1a44d556faf7a5168b1d`
- Developer Agent Identity: Rikku (`agent-rikku`)

## Results

- Version identity: `package.json`, the root lockfile package, `src/constants.mjs`, the toolkit self-host lock, current-version tests, changelog, release-readiness page, and candidate record identify `0.1.0-alpha.30`.
- Self-host transition: the repository-local Alpha.30 implementation upgraded the checksum-clean Alpha.29 self-host lock; the version-pinned launcher then reported `0.1.0-alpha.30`.
- Claim boundary: the candidate record describes repository-native, human-directed AI-assisted development and explicitly excludes guaranteed efficiency, automatic model execution, enterprise qualification, and mandatory optional tooling.
- Working-tree verification: repository, documentation-link, and package checks passed; all 443 Node tests passed. Package boundary: 380 files, 819,744 packed bytes, and 3,254,381 unpacked bytes.
- Clean exact-revision verification: a detached worktree at the exact candidate completed `npm ci --ignore-scripts`, all 443 tests, Doctor with 36 pass / 1 non-blocking stale-plan warning / 0 fail, and the public repository audit with 0 blockers. The audit retained 68 previously digest-reviewed binaries as an explicit review boundary and one exact-provenance reviewed adapter fixture.

The initial clean-install invocation used npm's `--prefix` option and npm interpreted the random worktree directory name as the root package identity. Re-running `npm ci` from inside the same unchanged worktree succeeded. This was an invocation correction, not a candidate-source change or test retry.

No repository visibility, tag, GitHub Release, npm publication, deployment, or announcement state changed.
