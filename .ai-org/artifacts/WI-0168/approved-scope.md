# WI-0168 Approved Scope

## Reader outcome

A maintainer can prepare a verified package asset, attach it to a draft GitHub Release, and intentionally publish that Release. Temple then verifies and publishes the same bytes to the appropriate npm channel without another long-lived npm credential or routine second-factor ceremony.

## Acceptance criteria

1. The workflow subscribes only to the GitHub `release` event with activity type `published`; it exposes no manual or ordinary development trigger.
2. The checked-out ref, Release tag, `package.json` version, release prerelease flag, package repository URL, npm access policy, and selected dist-tag are mutually consistent.
3. A newly packed archive from the Release tag is byte-for-byte identical to the uniquely named `.tgz` attached to that Release.
4. Prerelease versions can publish only from GitHub prereleases and use `next`. Stable versions can publish only from non-prerelease GitHub Releases and use `latest`.
5. The job uses a GitHub-hosted runner, `contents: read`, and `id-token: write`; it contains no npm token, cache, retry, fallback, or provenance opt-out.
6. The workflow requires npm CLI 11.5.1 or newer and Node.js 24, then runs `npm run verify` before `npm publish`.
7. Documentation explains draft preparation, immutable inputs, one-time npm trust setup, failure handling, and the fact that a live OIDC publish cannot be proven until a new version is intentionally released.

## Non-claims

- A passing local test does not prove npm accepted OIDC.
- Merging this implementation does not publish a package.
- Publishing a GitHub Release is an external release decision, not a routine merge side effect.
- No automatic versioning, release-note generation, rollback deletion, or announcement is introduced.
