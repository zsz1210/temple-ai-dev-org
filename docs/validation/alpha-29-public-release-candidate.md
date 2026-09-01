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

## Verified candidate evidence

- Package metadata, lockfile, changelog, roadmap, this record, and proposed tag identify `0.1.0-alpha.29`.
- Candidate revision `fe9f7d9846bf0741cb2bc34443c0db34ade7c5d7` passed clean local Node.js 22 and 24 verification, package inspection, exact-tarball consumer smoke, an Alpha.28 data-bearing upgrade rehearsal, dependency audit, schema validation, Doctor, SVG validation, and a high-confidence tracked-history credential-pattern review.
- Its first hosted run exposed a Linux-only temporary Git cleanup race under Node.js 24. The release remained blocked; the failure was not waived.
- Corrective revision `680230f021386f7d8ecd52addca9f81f68a2cb3a` added bounded retry behavior only to the test-owned temporary-tree cleanup. GitHub Actions run [`33522030500`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33522030500) then passed the full Node.js 22 and 24 matrix.
- Fresh-worktree Independent QA repeated the formerly failing Node.js 24 file ten times at the corrective revision without a failure.
- The packed tarballs produced from the original and corrective candidate revisions are byte-identical, with SHA-256 `89e3b6900de079c54f730b455f138c029341696e2f342e3b83ca965c20270784`. The cleanup correction and repository evidence are excluded from the package boundary.
- The allowlisted package contains 305 files and excludes repository self-host state, tests, examples, screenshots, local telemetry, project evidence, and credentials.

The final documentation and evidence reconciliation commit must remain green before a tag is proposed for approval. Tag creation itself remains an unperformed external action.

## Human and external gates

The following cannot be satisfied by the maintainer's automated candidate run:

1. The Human Principal approves a private conduct-reporting route that the maintainer will operate, then the repository publishes an enforceable Code of Conduct.
2. A genuinely independent new user follows only the public instructions in both a new-project or agreed representative path. A maintainer-run temporary-directory smoke remains separate evidence.
3. GitHub branch or ruleset protection, required checks, private vulnerability reporting, secret scanning, push protection, and the moderation route are approved, configured, and verified.
4. Repository visibility, tag creation, GitHub Release creation, public announcement, and any later npm publication receive separate explicit approval.

Until all four gates are satisfied, the public release decision remains **NO-GO** even when the local candidate is green.
