# WI-0164 Developer Verification

- Frozen technical candidate: `a6849519c6067b2f73ca1a44d556faf7a5168b1d`
- Exact package SHA-256: `8f93462cdea25068920279740450a72977f1a82b375fbf82bb26dac54aa36c95`
- Developer Agent Identity: Rikku (`agent-rikku`)
- Result: **Pass**

## Package identity

- Name and version: `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30`
- Filename: `zsz1210-temple-ai-dev-org-0.1.0-alpha.30.tgz`
- npm SHA-1: `2a0e1f0bef2c6d1833e03405a589dfef2eec836f`
- File count: 380
- Packed size: 819,744 bytes
- Unpacked size: 3,254,381 bytes
- License: MIT
- Package state: `private: true`, unpublished

The exact archive remained temporary. Its complete 380-entry manifest, npm integrity, SHA-256, sizes, and normalized results are retained in `package-qualification-result.json`.

## Candidate checks

- `npm ci --ignore-scripts` passed in a clean detached worktree.
- Repository, documentation-link, and package checks passed; all 443 tests passed with no failures or skips.
- All 188 cataloged JSON documents passed 36 schemas.
- Doctor reported 36 pass, one stale generated-plan warning, and zero failures at the historical candidate revision.
- The installed-Chrome browser gate passed in 41.943 seconds.
- Production and complete dependency audits reported zero known vulnerabilities.
- The public repository/package audit reported zero blockers, 68 explicit binary-review items, and one exact-provenance reviewed adapter fixture.

## Consumer and upgrade checks

- Node.js `v24.20.0` installed the exact local tarball offline and passed version, first init, identical re-init, installed launcher, read-only status, and Doctor with zero failures.
- An Alpha.29 project upgraded to Alpha.30 with one lock update, no managed-file replacement, no project-data creation, 15 sampled project-owned digests unchanged, and zero Doctor failures.

No candidate source, repository visibility, tag, GitHub Release, npm publication, deployment, or announcement state changed.
