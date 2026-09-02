# WI-0086 Final Package and Hosted Reconciliation

## Exact boundaries

- Package source revision: `b8d5ef34a9ef18cb1a9e1f597b520d5311c08e97`
- Hosted integration head: `296e16eb3528a050cff3f47e191774f3815583a3`
- Version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Technical release-candidate result: **pass**
- Public release result: **NO-GO pending independent Human evidence and separately authorized external actions**

The integration head adds only repository-owned evidence after the package source. The reviewed npm allowlist excludes root self-host state and tests, so the package was rebuilt from a clean detached worktree at the exact package source rather than from the later evidence head.

## Exact package

| Check | Result |
| --- | --- |
| Package files | 309 |
| Packed size | 652,650 bytes |
| Unpacked size | 2,616,268 bytes |
| Tarball SHA-256 | `0cb912f37796642c844b5c1da6e661e57a0690c82bc0192dd80c95ed8bf89bbc` |
| npm SHA-1 | `ce75793b9d6f40cb91959b89bd4032ecaebc809a` |

The file count, byte sizes, and SHA-256 are identical to the earlier `02cc922` package checkpoint. The two later source corrections changed test files only and therefore did not change the allowlisted distribution artifact.

## Clean consumers

- Node.js `v22.23.2`: version, tarball install, first init, idempotent re-init, installed-package launcher override, status, and Doctor passed. Doctor: 36 pass, 0 warning, 0 failure.
- Node.js `v24.20.0`: version, tarball install, first init, idempotent re-init, installed-package launcher override, status, and Doctor passed. Doctor: 36 pass, 0 warning, 0 failure.

The launcher used the documented compatible `TEMPLE_CLI_PATH` override to exercise the CLI from the locally installed private tarball. The default package-spec bootstrap cannot resolve from the public npm registry while `private: true` and npm publication remain intentionally disabled.

## Hosted CI

[GitHub Actions run 33583589078](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33583589078) completed successfully at integration head `296e16e`:

- Node.js 24 job `100102911600` passed repository checks, schema validation, Doctor, all 276 tests, and the installed-Chrome Management Console gate.
- Node.js 22 job `100102911822` passed repository checks, schema validation, Doctor, and all 276 tests.
- The managed Observer non-macOS contract from WI-0095 and the Phase 4B cleanup correction from WI-0096 both passed in hosted Linux.
- WI-0095 and WI-0096 are organizationally closed. Their earlier failed hosted runs remain preserved and were not waived.

## Remaining boundary

Technical package and hosted qualification are complete. This evidence does not authorize repository visibility, GitHub settings, a tag, a GitHub Release, an announcement, or npm publication. The remaining release gates are the genuinely independent public-instructions test and the separately approved public GitHub actions recorded in `public-release-blockers.md`.
