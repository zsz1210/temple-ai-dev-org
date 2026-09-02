# WI-0086 Final Local Requalification

## Candidate

- Revision: `dba1866ae0ebbcf7ada1474be38016970355b040`
- Version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Decision: local technical checks passed; public release remains NO-GO

## Results

| Check | Result |
| --- | --- |
| Node.js `v22.23.2` `npm run verify` | 270 passed, 0 failed |
| Node.js `v24.20.0` `npm run verify` | 270 passed, 0 failed |
| Installed Chrome `152.0.7977.65` | Four viewports, six primary views, and reduced-motion checks passed |
| Runtime schema | 112 documents against 28 schemas; valid |
| Doctor | 35 pass, one known stale generated-plan warning, 0 fail |
| Production dependency audit | 0 vulnerabilities |
| Complete locked dependency audit | 0 vulnerabilities |
| Package allowlist dry run | 307 files; 643,839 bytes packed; 2,578,013 bytes unpacked |
| Exact tarball | 307 files; 642,387 bytes packed; SHA-256 `ad44f94007d10326639a77876f50384e2a22888cc482da7355a3a151d7109a05` |
| Node.js 22 clean consumer | Version, install, init, idempotent re-init, launcher, status, and Doctor passed; 36 pass, 0 warn, 0 fail |
| Node.js 24 clean consumer | Version, install, init, idempotent re-init, launcher, status, and Doctor passed; 36 pass, 0 warn, 0 fail |

The stale parallel-plan warning is expected generated-state hygiene: no parallel dispatch is authorized, and Temple requires rebuilding the plan before any future dispatch. It does not weaken the package, runtime, or release gates.

User-owned `.playwright-cli/` and `output/playwright/**` remained untracked and outside the package. The moderation route is Human-approved and tested. No repository visibility, GitHub setting, tag, GitHub Release, announcement, or npm publication action was performed.

## Remaining gates

1. Push this private candidate and require fresh hosted Node.js 22 and 24 success, including the Node.js 24 browser gate.
2. Obtain the genuinely independent public-instructions test described in `independent-user-test-plan.md`.
3. Separately authorize repository visibility and then configure and verify the GitHub protection and security settings that become available.
4. Separately authorize the immutable tag and GitHub Release.
