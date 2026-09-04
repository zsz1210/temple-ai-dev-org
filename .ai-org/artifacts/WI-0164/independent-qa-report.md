# WI-0164 Independent QA Report

- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Frozen technical candidate: `a6849519c6067b2f73ca1a44d556faf7a5168b1d`
- Exact package SHA-256: `8f93462cdea25068920279740450a72977f1a82b375fbf82bb26dac54aa36c95`
- Verdict: **Pass for exact-package qualification**

## Independent reproduction

- Ran the sealed qualification runner again from a new set of detached worktrees and disposable consumers.
- Rebuilt a byte-identical package: same SHA-256, npm integrity, SHA-1, filename, version, byte sizes, and complete ordered 380-entry manifest.
- Reproduced 443/443 tests, 188-document schema validation, zero Doctor failures, zero dependency vulnerabilities, zero publication blockers, and the installed-Chrome browser pass.
- Reproduced the clean Node.js `v24.20.0` exact-tarball install, first init, idempotent re-init, installed launcher, status, and zero-failure Doctor result.
- Reproduced the Alpha.29-to-Alpha.30 lock-only upgrade with no managed-file replacement or project-data migration, 15 sampled project-owned digests unchanged, and zero Doctor failures.

## Timing observations

Timing is descriptive and was not an acceptance threshold:

- Developer run: complete verification 74.168 seconds; browser gate 41.943 seconds.
- Independent run: complete verification 76.077 seconds; browser gate 40.717 seconds.

The small timing variation did not change artifact identity or functional results and is not used as a performance claim.

## Independence and retained limits

The Independent QA Agent Identity differs from the Developer Agent Identity. Both runs used the same immutable protocol and source revision but separate worktrees, archives, and consumers.

This verdict qualifies the local source-built archive for the documented Alpha boundary. It does not authorize repository visibility, a tag, GitHub Release, npm publication, deployment, or announcement, and it does not establish universal efficiency, automatic routing safety, broad platform compatibility, or enterprise qualification.
