# Alpha.29 first public release candidate

- Version: `0.1.0-alpha.29`
- Proposed tag: `v0.1.0-alpha.29`
- Proposed first distribution: GitHub Release
- npm publication: deferred
- Repository visibility: private while this record is prepared
- External release: not performed

## Purpose

This record defines the evidence boundary for Temple's first public Alpha. It packages the human-facing documentation, deterministic matched-model advisory, Node.js LTS contract, scoped distribution artifact, CI supply-chain hardening, real-browser Management Console gate, outcome-first Codex task navigation, and OSS health material completed after Alpha.28 into one reviewable release candidate.

It does not claim production, enterprise, Windows, npm, autonomous external-operation, automatic model-routing, or measured cost-savings readiness.

## Pre-candidate baseline

Pushed revision `d59ac2a9f0a56c41a7731fe8572c74be63a2e338` passed GitHub Actions run [`33517466651`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33517466651) under Node.js 22 and 24. Local WI-0085 verification passed 262 tests on both supported majors, the package boundary, schema validation, Doctor, dependency audit, responsive SVG checks, and real tarball consumer smoke. Node.js 26.8.1 passed as a non-blocking compatibility signal and remains outside the support contract while it is Current.

These results justify constructing Alpha.29. They do not replace verification of the final Alpha.29 revision.

## Post-baseline integrations

- WI-0088 added an installed-Chrome semantic and responsive regression gate for the Management Console. It covers navigation, live-state labeling, keyboard traversal, reduced motion, console failures, overflow, clipping, and collisions at four viewports. CI runs the gate only in the Node.js 24 full lane; `playwright-core` is pinned, development-only, downloads no browser, and is excluded from the package artifact.
- WI-0089 changed generated Codex task-title suggestions to `WI-#### · short goal · Position (Agent)` within a 58-code-point whole-title ceiling and added an explicit idempotent registry refresh operation. Titles remain mutable navigation labels; stable Work Item and thread IDs remain canonical.
- Integration baseline `fadd4a5e36f90ad1e683546b6e0f9e5374c72e33` contains both completed Work Items. WI-0090 owns the later exact-candidate verification and private push without clearing any Human or public-action gate.

## Historical candidate evidence

- Candidate revision `fe9f7d9846bf0741cb2bc34443c0db34ade7c5d7` passed clean local Node.js 22 and 24 verification, package inspection, exact-tarball consumer smoke, an Alpha.28 data-bearing upgrade rehearsal, dependency audit, schema validation, Doctor, SVG validation, and a high-confidence tracked-history credential-pattern review.
- Its first hosted run exposed a Linux-only temporary Git cleanup race under Node.js 24. The release remained blocked; the failure was not waived.
- Corrective revision `680230f021386f7d8ecd52addca9f81f68a2cb3a` added bounded retry behavior only to the test-owned temporary-tree cleanup. GitHub Actions run [`33522030500`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33522030500) then passed the full Node.js 22 and 24 matrix.
- Fresh-worktree Independent QA repeated the formerly failing Node.js 24 file ten times at the corrective revision without a failure.
- The packed tarballs produced from the original and corrective candidate revisions are byte-identical, with SHA-256 `89e3b6900de079c54f730b455f138c029341696e2f342e3b83ca965c20270784`. The cleanup correction and repository evidence are excluded from the package boundary.
- The earlier allowlisted package contained 305 files and excluded repository self-host state, tests, examples, screenshots, local telemetry, project evidence, and credentials.

Those results explain the candidate history but do not qualify the post-baseline integrations.

## Requalified candidate requirements

- Package metadata, lockfile, changelog, roadmap, this record, and proposed tag identify `0.1.0-alpha.29`.
- The current allowlisted package contains 307 files, is approximately 0.64 MB packed and 2.56 MB unpacked, and preserves the same exclusion boundary.
- One exact WI-0090 technical candidate must pass all 270 repository tests under Node.js 22 and 24, the installed-Chrome browser gate, schema validation, Doctor, dependency audits, package review, and exact-tarball consumer smoke under both supported majors.
- Private `origin/main` must contain that candidate and its hosted Node.js 22 and 24 jobs must pass, with the installed-Chrome gate executing in the Node.js 24 full lane.
- Exact-revision Developer, Quality, Independent QA, and rollback evidence must be recorded without treating the evidence commit as public release approval.

The final documentation and evidence reconciliation commit must remain green before a tag is proposed for approval. Tag creation itself remains an unperformed external action.

## Verified requalified evidence

- Exact technical candidate `5b01b4f4b0022d0334edf0ca2a7304e16f4d4e96` passed 270 tests under local Node.js `v22.23.2` and `v24.20.0`, the installed-Chrome gate, schema validation, Doctor, production and complete dependency audits, package review, and clean exact-tarball consumer smoke under both supported majors.
- The allowlisted package contains 307 files. The exact tarball SHA-256 is `4e27969ffd16e865cb669ea62008061a8b02ffdca4ceedf592db8f873b1f0c4c`.
- Each clean consumer completed version, install, init, idempotent re-init, project launcher, status, and Doctor with 36 pass, 0 warning, and 0 failure.
- A fresh detached Node.js 24 QA worktree repeated all 270 tests and the installed-Chrome four-viewport, six-view, reduced-motion gate at the exact technical candidate.
- Private integration head `d55314f1dbb7ca0e26f1960bb0f7a10d72b14509` contains the technical candidate plus repository-only verification evidence. GitHub Actions run [`33570955370`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33570955370) passed Node.js 22 job `100064577716` and Node.js 24 job `100064577877`; the browser step passed only in the intended Node.js 24 full lane.
- User-owned `.playwright-cli/` and `output/playwright/**` remained untracked and outside the package. No visibility, repository-setting, tag, GitHub Release, announcement, or npm action was performed.

## Human and external gates

The following cannot be satisfied by the maintainer's automated candidate run:

1. The Human Principal approves a private conduct-reporting route that the maintainer will operate, then the repository publishes an enforceable Code of Conduct.
2. A genuinely independent new user follows only the public instructions in both a new-project or agreed representative path. A maintainer-run temporary-directory smoke remains separate evidence.
3. GitHub branch or ruleset protection, required checks, private vulnerability reporting, secret scanning, push protection, and the moderation route are approved, configured, and verified.
4. Repository visibility, tag creation, GitHub Release creation, public announcement, and any later npm publication receive separate explicit approval.

Until all four gates are satisfied, the public release decision remains **NO-GO** even when the local candidate is green.
