# WI-0168 Technical Design

## Decision

Add a single workflow, `.github/workflows/publish-npm.yml`, whose only event is `release.published`. Use npm Trusted Publishing directly from that workflow on a GitHub-hosted Node.js 24 runner.

The workflow does not treat the Git tag alone as sufficient evidence. It performs this sequence:

1. Check out the exact Release tag.
2. Install the lockfile without lifecycle scripts and run complete repository verification.
3. Pack the exact checkout into an isolated temporary directory.
4. Validate Release metadata and derive the only allowed dist-tag.
5. Download the uniquely named `.tgz` Release asset.
6. Compare its bytes and SHA-256 digest with the fresh pack.
7. Publish the downloaded, matched asset through OIDC.

## Validation boundary

`scripts/validate-npm-release.mjs` is a dependency-free validation program with two modes:

- `prepare` validates package metadata, release channel, repository identity, npm CLI version, and `npm pack --json` output, then writes narrowly scoped GitHub outputs.
- `verify-asset` requires two regular files with identical bytes and reports their shared SHA-256.

The validator performs no network request and no publication. The workflow owns the network steps.

## Channel rules

| Package version | GitHub Release | npm dist-tag |
| --- | --- | --- |
| Semantic prerelease, such as `0.2.0-alpha.1` | `prerelease: true` | `next` |
| Stable semantic version, such as `0.2.0` | `prerelease: false` | `latest` |

Any crossed combination fails. `publishConfig.tag` remains `next` as a conservative package-level default; the validated workflow passes the derived tag explicitly.

## Supply-chain controls

- Both third-party Actions remain pinned to reviewed commit SHAs.
- npm dependency caching is disabled for the release job.
- The job receives only `contents: read` and `id-token: write`.
- No `NPM_TOKEN` or other write secret is referenced.
- npm's short-lived OIDC exchange occurs only inside `npm publish`.
- The public repository and public package retain npm's automatic provenance path.

## Failure and rollback

Every pre-publication mismatch exits nonzero before `npm publish`. npm package versions are immutable; after a successful publish, rollback means deprecating or superseding the affected version and correcting future dist-tags according to the release record. Deleting history or silently replacing package bytes is not a supported rollback.

## First-live-proof boundary

Static tests, a dry-run validator, and npm trust configuration can qualify the mechanism without publishing. Only the next new, deliberately published GitHub Release can prove the end-to-end OIDC exchange and registry result. The current Alpha.30 Release is not replayed.
