# npm release operations

Temple publishes npm packages only after a maintainer deliberately publishes a GitHub Release. Pull requests, pushes, merges, and draft Releases do not publish anything.

## One-time npm setup

The package owner creates one [npm Trusted Publisher](https://docs.npmjs.com/trusted-publishers/) connection for `@zsz1210/temple-ai-dev-org` with these exact values:

| Field | Value |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `zsz1210` |
| Repository | `temple-ai-dev-org` |
| Workflow filename | `publish-npm.yml` |
| Environment | none |
| Allowed action | direct `npm publish` |

The filename is case-sensitive and names only the file inside `.github/workflows/`. Do not add an npm write token to GitHub. npm CLI 11.5.1 or newer and Node.js 24 are required by the workflow.

After `publish-npm.yml` reaches the repository's default branch, an authenticated maintainer can create the relationship with the npm CLI:

```bash
npm trust github @zsz1210/temple-ai-dev-org \
  --repo zsz1210/temple-ai-dev-org \
  --file publish-npm.yml \
  --allow-publish \
  --yes
```

This is a one-time external permission change, not part of ordinary release preparation. Confirm the exact package, repository, workflow filename, and allowed action before completing it.

After the first successful OIDC release, the package owner should confirm the registry provenance and may change npm's traditional publishing access to require two-factor authentication while disallowing tokens. Keep any interactive maintainer access needed for recovery until the OIDC path has succeeded once.

## Prepare a release

1. Choose a new semantic version. Use a prerelease version such as `0.2.0-alpha.1` for npm `next`, or a stable version such as `0.2.0` for npm `latest`.
2. Update all version-bearing files and the changelog on a reviewed branch.
3. Run `npm ci --ignore-scripts` and `npm run verify` on the exact candidate.
4. Run `npm pack --ignore-scripts --json` and retain the resulting `.tgz` as the package candidate.
5. Merge the candidate through the repository's normal review path.
6. Create a draft GitHub Release whose tag is exactly `v<package version>` at the verified commit.
7. Attach the exact candidate `.tgz`. Mark the GitHub Release as a prerelease if and only if the package version contains a semantic prerelease component.
8. Review the tag, target commit, prerelease flag, notes, and asset, then publish the GitHub Release.

Publishing the Release triggers `.github/workflows/publish-npm.yml`. GitHub recommends the `release.published` event for workflows that must cover both stable and prerelease publications, including prereleases published from drafts. The workflow rechecks the source, creates a fresh archive, downloads the attached archive, and compares their bytes before calling npm through OIDC. See [GitHub's release-event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release).

## Channel mapping

| GitHub Release and package | npm channel |
| --- | --- |
| Prerelease Release + semantic prerelease version | `next` |
| Stable Release + stable semantic version | `latest` |
| Any crossed or mismatched combination | stop before publish |

## Verify the result

After the workflow succeeds, verify the immutable version and channel separately:

```bash
npm view @zsz1210/temple-ai-dev-org@<version> version dist.shasum dist.integrity
npm view @zsz1210/temple-ai-dev-org dist-tags --json
```

Also inspect the npm package page for provenance and perform a clean installation from the intended dist-tag. A green GitHub job alone is not proof that consumers can retrieve and execute the package.

## Failure and recovery

- If any step before `npm publish` fails, correct the candidate and create a new Release/version as appropriate. Do not add a fallback token or bypass the validator.
- If npm rejects OIDC, first compare the npm Trusted Publisher repository and workflow filename with the exact GitHub workflow. npm does not validate that relationship when it is saved.
- If publication succeeds but the package is defective, npm versions cannot be replaced. Deprecate the affected version when appropriate, publish a corrected successor, and intentionally repair dist-tags.
- Do not rerun a successful workflow for an already published version.

## Evidence boundary

The workflow and its local tests prove trigger, metadata, permission, and archive-validation policy. The one-time npm setting proves only that the relationship was configured. The first new Release published through this path supplies the first end-to-end OIDC and registry evidence.
