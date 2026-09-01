# WI-0090 Developer Verification

## Candidate

- Revision: `5b01b4f4b0022d0334edf0ca2a7304e16f4d4e96`
- Developer: Rikku (`agent-rikku`)
- Integration baseline: `fadd4a5e36f90ad1e683546b6e0f9e5374c72e33`
- UI mode: `not-applicable`; WI-0090 reconciles and qualifies already completed work rather than changing the Management Console interface.

## Exact-revision results

| Check | Result |
| --- | --- |
| Node.js `v22.23.2` `npm run verify` | 270 passed, 0 failed |
| Node.js `v24.20.0` `npm run verify` | 270 passed, 0 failed |
| Installed Chrome `152.0.7977.65` | Four viewports, six primary views, and reduced-motion checks passed |
| Runtime schema | 111 documents against 28 schemas; valid |
| Doctor | 35 pass, one known stale generated-plan warning, 0 fail |
| Production dependency audit | 0 vulnerabilities |
| Complete locked dependency audit | 0 vulnerabilities |
| Package allowlist dry run | 307 files; 638,564 bytes packed; 2,560,085 bytes unpacked |
| Exact tarball | 307 files; 636,986 bytes packed; SHA-256 `4e27969ffd16e865cb669ea62008061a8b02ffdca4ceedf592db8f873b1f0c4c` |
| Node.js 22 clean consumer | Version, install, init, re-init, launcher, status, and Doctor passed; 36 pass, 0 warn, 0 fail |
| Node.js 24 clean consumer | Version, install, init, re-init, launcher, status, and Doctor passed; 36 pass, 0 warn, 0 fail |

The browser gate used the locally installed Chrome channel. No browser binary was downloaded or added to the package. The package excludes `playwright-core`, repository self-host state, tests, local output, and WI-0090 evidence.

## Candidate boundary

The tracked tree was clean at the candidate except for committed history. User-owned `.playwright-cli/` and `output/playwright/**` remained untracked and were neither staged nor deleted. No repository setting, visibility, tag, GitHub Release, announcement, or npm publication action was performed.

Hosted CI remains required after the private push and is not claimed by this local Developer result.
