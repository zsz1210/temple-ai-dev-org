# WI-0167 Work Order

## Outcome

Remove the public repository's Archify dependency alerts without weakening its provenance boundary, then publish the exact verified Temple `0.1.0-alpha.30` candidate as a GitHub prerelease and npm prerelease.

## Authorized decision

On 2026-09-05, the repository owner explicitly selected direct public release and instructed Temple to complete the recommended release sequence. This authorizes the bounded GitHub Release and npm publication actions described here. It does not authorize deployment, an npm `latest` dist-tag, paid Credits, or a broad announcement.

## Included

- Replace the pinned Archify `v2.15.0` copy with upstream `v2.16.0` at exact commit `c826e6c3a7abad19c0f3cd1ca57207d54b1ad8de`.
- Apply one deterministic, disclosed downstream lock override from vulnerable `fast-uri` `3.1.5` to `3.1.7` while copying the clean upstream checkout.
- Record upstream provenance, downstream patch identity, license, and every installed file digest.
- Test the isolated adapter and the complete Temple repository.
- Requalify one exact npm tarball from the final release revision.
- Create GitHub prerelease `v0.1.0-alpha.30` and publish that same tarball as `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30` under npm dist-tag `next`.
- Close the superseded Dependabot PR after the validated fix reaches `main`.

## Excluded

- npm `latest`, production deployment, or release announcement.
- Automatic adapter download or execution.
- Weakening digest, source-revision, or clean-checkout validation.
- Rewriting historical validation evidence that accurately describes older releases.
- Reviewing or regenerating documentation images.

## Acceptance

The installed adapter is reproducible from its exact clean upstream base plus the named deterministic patch, GitHub reports no remaining open dependency alert attributable to the old adapter, all repository and clean-package checks pass at the exact release revision, and both public prerelease surfaces resolve to `0.1.0-alpha.30` without assigning npm `latest`.
