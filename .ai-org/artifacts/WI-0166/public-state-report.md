# WI-0166 Public State Report

## Published surface

- Repository: `https://github.com/zsz1210/temple-ai-dev-org`
- Visibility: **public**
- Public revision observed: `879bcd6e8c4068e1e83954fe8ce36b944eb87ae2`
- Anonymous repository API, Git remote, README, and MIT License access: pass
- Issues: enabled
- Community profile: 100%

## Protection after publication

- Required `Verify (Node.js 24)` check: enabled and strict
- Required approving reviews: 1
- Code Owner review, last-push approval, and stale-review dismissal: enabled
- Secret scanning and push protection: enabled
- Secret-scanning alerts after enablement: 0
- Private vulnerability reporting: enabled
- Dependabot alerts and security updates: enabled
- Head-branch deletion after merge: enabled

## Newly surfaced dependency work

Dependabot reported six open high-severity advisories. All six describe `fast-uri` below `3.1.6` in the development lockfile of the pinned optional Archify adapter at `.ai-org/adapters/archify/v2.15.0/archify/package-lock.json`. The adapter path is excluded from the npm package, so these alerts are not evidence of a vulnerability in the qualified Temple tarball. They still require an upstream-compatible update or an evidence-backed disposition before the tagged Alpha and npm publication.

## Surfaces intentionally unchanged

- Latest ordinary tag remains `v0.1.0-alpha.27`.
- The only GitHub Release remains the historical `v0.1.0-alpha.5` prerelease.
- `package.json` remains `0.1.0-alpha.30` with `private: true`.
- `@zsz1210/temple-ai-dev-org` remains absent from the public npm registry.
- No deployment or announcement was performed.
