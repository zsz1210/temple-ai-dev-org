# WI-0168 Work Order

## Outcome

Make npm publication a deliberate consequence of publishing a GitHub Release, without requiring the maintainer to repeat an interactive npm login and second-factor flow for every version.

## Authorized decision

On 2026-09-05, the repository owner accepted release-triggered npm Trusted Publishing and asked Temple to continue to the next item. The approved channel policy is:

- publishing a GitHub prerelease routes the matching package version to npm `next`;
- publishing a stable GitHub Release routes the matching stable package version to npm `latest`;
- pull requests, pushes, merges, edits, manual dispatch, and local verification never publish;
- publication uses npm Trusted Publishing from a GitHub-hosted runner, not a stored npm write token.

This authorization permits implementation, repository review, and the one-time trusted-publisher relationship for `@zsz1210/temple-ai-dev-org`. It does not authorize a new package version, a new GitHub Release, a deployment, paid Credits, or an announcement.

## Included

- Add a SHA-pinned GitHub Actions workflow triggered only by `release.published`.
- Check out the Release tag and run complete repository verification on that exact source.
- Fail closed unless the tag, package version, GitHub prerelease flag, repository metadata, npm CLI capability, packed archive, and attached Release asset agree.
- Publish the byte-matched Release asset with short-lived OIDC credentials and the selected npm dist-tag.
- Document the release procedure, one-time npm configuration, rollback boundary, and first-live-proof limitation.
- Add deterministic tests that do not contact npm or publish anything.

## Excluded

- Publishing or republishing `0.1.0-alpha.30`.
- Publishing from a pull request, push, merge, tag push alone, or `workflow_dispatch`.
- Storing `NPM_TOKEN`, recovery codes, passkeys, or other credentials in GitHub or the repository.
- Self-hosted publishing runners, automatic retries, fallback publication paths, or automatic version creation.
- Changing npm dist-tags outside the publish command or announcing a release.

## Acceptance

The repository contains one independently tested release-only workflow and a human-readable runbook. The workflow has only the permissions required to read Release contents and request an OIDC identity token, rejects mismatched or unqualified releases before publication, and cannot be triggered by ordinary development activity. Live OIDC publication remains unverified until the owner intentionally publishes the next new GitHub Release.
