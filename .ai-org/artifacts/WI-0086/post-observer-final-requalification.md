# WI-0086 Post-Observer Final Local Requalification

## Exact package candidate

- Revision: `02cc9228a6b9d20e4875d3f7f7352aab0b7012dd`
- Version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Local technical result: **pass**
- Public release result: **NO-GO pending Human and external gates**

## Exact-revision results

| Check | Result |
| --- | --- |
| Node.js `v22.22.0` `npm run verify` | 276 passed, 0 failed |
| Node.js `v24.20.0` `npm run verify` | 276 passed, 0 failed |
| Installed Chrome `152.0.7977.65` | Four viewports, six primary views, and reduced motion passed |
| Runtime schema | 115 documents against 28 schemas; valid |
| Doctor | 36 pass, 0 warning, 0 failure |
| Production dependency audit | 0 vulnerabilities |
| Complete locked dependency audit | 0 vulnerabilities |
| Package allowlist | 309 files; 653,440-byte dry run |
| Exact tarball | 309 files; 652,650 bytes packed; 2,616,268 bytes unpacked |
| Exact tarball SHA-256 | `0cb912f37796642c844b5c1da6e661e57a0690c82bc0192dd80c95ed8bf89bbc` |
| Node.js 22 clean consumer | Version, install, init, idempotent re-init, launcher, status, and Doctor passed; 36 pass, 0 warning, 0 failure |
| Node.js 24 clean consumer | Version, install, init, idempotent re-init, launcher, status, and Doctor passed; 36 pass, 0 warning, 0 failure |

The first combined clean-consumer reporting wrapper returned exit code 3 after all Temple steps had passed because nested shell quoting stripped the final `jq` object syntax. Status and Doctor were then rerun directly under both Node.js versions and returned exit code 0. This was a test-reporting wrapper error, not a Temple failure.

## Managed observation boundary

- WI-0092 and corrective WI-0093 are organizationally closed at the corrected implementation lineage.
- The managed-local Observer remains `running` by user request.
- The private LAN viewer is read-only, omits reviewed local runtime paths, and retains local diagnostics only on loopback.
- The measured 38.293503-second, approximately 1.864 MB snapshot is recorded as non-blocking follow-up WI-0094. No low-latency claim is made.

User-owned `.playwright-cli/` and `output/playwright/**` remain untracked and outside the package. No visibility, repository-setting, tag, GitHub Release, announcement, or npm publication action was performed.

## Remaining public gates

1. Push this private candidate and require a fresh hosted Node.js 22 and 24 result, including the Node.js 24 browser gate.
2. Obtain the genuinely independent public-instructions test from a person without Temple development history.
3. Separately authorize repository visibility and configure the GitHub protections and security settings that become available.
4. Separately authorize the immutable tag and GitHub Release.
