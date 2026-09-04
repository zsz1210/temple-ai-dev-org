# WI-0167 Developer Verification

- Candidate revision: `6a8760f9669c58085b069e91776b89d0a857fc83`
- Exact package SHA-256: `6b4ab4f1a0bbbe3d8eae532dcec8a04c92797f4254fc992b2c5b9f8d91efda88`
- Developer Agent Identity: Rikku (`agent-rikku`)
- Result: **Pass**

## Adapter remediation

- Official upstream base: Archify `v2.16.0` at `c826e6c3a7abad19c0f3cd1ca57207d54b1ad8de`.
- Installed file count: 191, with exact clean-upstream and downstream-patch provenance.
- Deterministic patch: `fast-uri-3.1.5` to `3.1.7`; patched `package.json` and `package-lock.json` are byte-identical to npm's package-lock-only resolution.
- Archify's own suite: 979 passed, 0 failed, 31 skipped out of 1,010 tests.
- Archify complete dependency audit: zero known vulnerabilities at every severity.
- Temple adapter tests cover exact patching, provenance, failed preconditions, dirty source, digest drift, and unrecorded files.

## Exact package qualification

- Name and version: `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30`
- Filename: `zsz1210-temple-ai-dev-org-0.1.0-alpha.30.tgz`
- npm SHA-1: `4549715c32b545812806f16a0d9977ecce033d52`
- npm integrity: `sha512-Anrdxd+mNgMUjf7C9aLoIOe3onUZcQts/DF1HePDsOjeLulE6GyAEACnAAJ90MU2TlEOvHtPXEULvnQtciHCFw==`
- File count: 382
- Packed size: 826,084 bytes
- Unpacked size: 3,273,284 bytes
- Publication metadata: public access, dist-tag `next`

From a clean detached worktree, all 444 Temple tests passed, all 192 cataloged JSON documents passed 36 schemas, the installed-Chrome browser gate passed, both root dependency audits reported zero known vulnerabilities, and the public package surface had zero blockers and zero binary-review items. The repository surface retained the previously accepted 68-image manual-review boundary and one exact-provenance Archify fixture.

A clean Node.js `v24.20.0` consumer installed the exact local tarball, reproduced first and idempotent initialization, ran the installed launcher, and completed status and Doctor without failure. The Alpha.29 comparison upgraded lock-only while 15 sampled project-owned digests remained unchanged.

No tag, GitHub Release, npm publication, deployment, or announcement occurred during this verification.
