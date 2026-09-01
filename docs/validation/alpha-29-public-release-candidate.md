# Alpha.29 first public release candidate

- Version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Proposed first distribution: GitHub Release
- npm publication: deferred
- Repository visibility: private while this record is prepared
- External release: not performed

## Purpose

This record defines the evidence boundary for Temple's first public Alpha. It packages the human-facing documentation, deterministic matched-model advisory, Node.js LTS contract, scoped distribution artifact, CI supply-chain hardening, and OSS health material completed after Alpha.28 into one reviewable release candidate.

It does not claim production, enterprise, Windows, npm, autonomous external-operation, automatic model-routing, or measured cost-savings readiness.

## Pre-candidate baseline

Pushed revision `d59ac2a9f0a56c41a7731fe8572c74be63a2e338` passed GitHub Actions run [`33517466651`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33517466651) under Node.js 22 and 24. Local WI-0085 verification passed 262 tests on both supported majors, the package boundary, schema validation, Doctor, dependency audit, responsive SVG checks, and real tarball consumer smoke. Node.js 26.8.1 passed as a non-blocking compatibility signal and remains outside the support contract while it is Current.

These results justify constructing Alpha.29. They do not replace verification of the final Alpha.29 revision.

## Required final-candidate evidence

- Package, lockfile, changelog, roadmap, this record, and proposed tag identify `0.1.0-alpha.29`.
- The exact committed candidate passes `npm run verify`, dependency audit, package-manifest inspection, and disposable tarball installation under Node.js 22 and 24.
- Hosted Node.js 22 and 24 CI passes that exact commit.
- Package contents exclude repository self-host state, tests, examples, screenshots, local telemetry, project evidence, and credentials.
- The tracked repository and relevant history receive a final privacy and secret review.
- The rollback procedure identifies the immutable candidate, withdrawal or superseding release behavior, and project-owned-state recovery boundary.

## Human and external gates

The following cannot be satisfied by the maintainer's automated candidate run:

1. The Human Principal approves a private conduct-reporting route that the maintainer will operate, then the repository publishes an enforceable Code of Conduct.
2. A genuinely independent new user follows only the public instructions in both a new-project or agreed representative path. A maintainer-run temporary-directory smoke remains separate evidence.
3. GitHub branch or ruleset protection, required checks, private vulnerability reporting, secret scanning, push protection, and the moderation route are approved, configured, and verified.
4. Repository visibility, tag creation, GitHub Release creation, public announcement, and any later npm publication receive separate explicit approval.

Until all four gates are satisfied, the public release decision remains **NO-GO** even when the local candidate is green.
