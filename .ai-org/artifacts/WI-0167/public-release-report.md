# Public Alpha.30 release report

## Outcome

Temple `0.1.0-alpha.30` is publicly available as a GitHub prerelease and as `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30` on the public npm registry. The exact npm tarball matches the independently qualified archive by SHA-1, SHA-512 integrity, and SHA-256.

- GitHub prerelease: <https://github.com/zsz1210/temple-ai-dev-org/releases/tag/v0.1.0-alpha.30>
- npm package: <https://www.npmjs.com/package/@zsz1210/temple-ai-dev-org/v/0.1.0-alpha.30>
- Supported Alpha install selector: `@zsz1210/temple-ai-dev-org@next`
- Release revision: `d2b2a5142c7e9b8d98e9474e0fe1cc8bdbf10324`
- Qualified tarball SHA-256: `6b4ab4f1a0bbbe3d8eae532dcec8a04c92797f4254fc992b2c5b9f8d91efda88`

## External verification

The npm registry resolved `next` to `0.1.0-alpha.30`. A new Node.js `v24.20.0` consumer installed that selector from the public registry, reported the expected CLI and launcher version, completed first initialization and idempotent reinitialization, returned the expected project from status, and completed Doctor with zero failures.

npm publish-time malware scanning temporarily returned 404 for the new version. The version became publicly resolvable after the scan without another publish. No npm package version was rebuilt or republished.

## Retained npm first-version exception

The owner approved `next` and explicitly excluded `latest`. npm nevertheless added both tags for the first version of this newly created package. Two completed interactive 2FA removal attempts returned HTTP 400, matching the npm CLI project's recorded first-version behavior. The public registry currently reports:

```text
latest: 0.1.0-alpha.30
next:   0.1.0-alpha.30
```

This exception is not silently accepted. WI-0167 remains at Release Gate until the owner chooses between:

1. accepting the registry-enforced first-version alias until the first stable Release intentionally moves `latest`; or
2. authorizing destructive package withdrawal, with the understanding that npm never permits reuse of the same package name and version combination.

The recommended option is the bounded temporary exception. Every Alpha instruction and future automation should continue to use `@next`; future publishing should run only from a published GitHub Release. Prereleases should request `next`, while the first stable Release intentionally assigns `latest`.

## Scope boundary

No production deployment, broad announcement, paid Credits, automatic replenishment, npm token creation, or unattended Registry write occurred. GitHub Release creation and npm publication remained separate external actions from organizational closeout.
