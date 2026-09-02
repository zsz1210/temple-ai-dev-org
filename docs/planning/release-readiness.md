# Release readiness

- Audit date: 2026-09-02
- Last hosted integration head: `d55314f1dbb7ca0e26f1960bb0f7a10d72b14509`
- Latest local requalification checkpoint: `cbd8f2aadd1f5bfe9ef4b961ec24b6fbc3eb5b57`
- Final exact candidate: recorded after this documentation reconciliation in repository-owned WI-0086 evidence
- Package metadata: `0.1.0-alpha.29` release candidate verified; public action not approved
- Target: first public Alpha, not `1.0` or production qualification

## Conclusion

Temple has a locally requalified private `0.1.0-alpha.29` candidate for its first public Alpha. It includes the real-browser Management Console gate, outcome-first Codex task titles, truthful Usage capture health, localized public documentation, and the OSS conduct and security boundary. The Human Principal approved and tested the private moderation route. Publication remains a **NO-GO** until the reconciled candidate passes hosted CI, a genuinely independent new user completes the public path, the approved GitHub protections are configured, and the Human Principal separately authorizes repository visibility, the tag, and the GitHub Release.

## Verified current facts

- GitHub is private and npm publication remains disabled through `private: true`.
- The scoped npm package does not exist in the public registry.
- GitHub Actions run [`33522030500`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33522030500) passed Node.js 22 and 24 at the earlier corrective candidate `680230f`. It remains historical evidence rather than qualification for the later WI-0088 and WI-0089 integration baseline.
- GitHub Actions run [`33570955370`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33570955370) passed the private integration head `d55314f`: Node.js 22 and 24 each passed the complete 270-test suite, and the installed-Chrome Management Console gate passed in the Node.js 24 full lane while remaining skipped under Node.js 22.
- That hosted run predates WI-0091 and the public conduct/documentation reconciliation. It is retained as historical evidence; the new private push requires a fresh hosted result.
- WI-0091 made Usage capture health truthful and verifiable. Its exact implementation candidate `43444e1` passed 270 tests and the browser gate through distinct Quality and Independent QA review; the bounded live proof recorded Provider usage without retaining prompt content.
- WI-0083 independently passed 260 tests at its exact candidate; WI-0081 and WI-0082 received fresh exact-candidate verification during the release-truth reconciliation.
- `npm audit --omit=dev` reported zero known dependency vulnerabilities on the audit date.
- The Alpha.29 package uses an explicit inclusion allowlist. The latest dry run contains 307 files, 641,344 bytes packed and 2,574,860 bytes unpacked, including localized README diagrams and public ADRs while excluding the repository's root `.ai-org`, tests, examples, screenshots, output, integrations, and development scripts. The original audit baseline produced 1,906 files and approximately 17.4 MB packed.
- The WI-0085 workflow candidate retains minimal `contents: read` permission and pins `actions/checkout` and `actions/setup-node` v7 to reviewed full commit SHAs.
- The package and installed bootstrap declare `^22.0.0 || ^24.0.0`. The 270-test suite passed locally under Node.js `v22.23.2` and `v24.20.0`, in hosted Linux under both majors, and again in a fresh detached Node.js 24 QA worktree.
- The installed-Chrome regression gate checks four responsive viewports, semantic navigation, live-state labels, keyboard traversal, reduced motion, console failures, overflow, clipping, and collisions. It uses the pinned development-only `playwright-core` package, downloads no browser, and runs only in the Node.js 24 full CI lane.
- Codex task-title suggestions now use `WI-#### · short goal · Position (Agent)` within a live-verified 58-code-point ceiling. Explicit refresh changes only the stored suggestion; titles remain navigation labels rather than lifecycle or authority state.
- At local checkpoint `cbd8f2a`, the complete 270-test suite passed under Node.js `v22.23.2` and `v24.20.0`; installed Chrome `152.0.7977.65` passed four viewports, six primary views, and reduced-motion checks. Runtime schema validation passed 112 documents against 28 schemas. Doctor reported 35 pass, one stale generated-plan warning, and zero failures.
- The exact checkpoint tarball has SHA-256 `491a5b94783ee6fe56fc5cfc632aa930b4c6502a80466941ccd9bf24c6e9a2d5`. It completed version, install, init, idempotent re-init, project launcher, status, and Doctor checks under both supported Node.js majors; each clean consumer reported 36 pass, 0 warning, and 0 failure.
- Both the production-only and complete locked dependency audits report zero known vulnerabilities. The dependency-license inventory is recorded in `THIRD_PARTY_NOTICES.md`.
- The Human Principal accepted retaining MIT for the first public Alpha. Apache-2.0 remains a revisit option if explicit patent terms become an evidenced requirement.
- Contribution, governance, security, ownership, pull-request, issue-intake, and Code of Conduct files now define the repository-local boundary. The Human Principal approved and successfully tested `zsz1210+oss.temple@gmail.com` for private conduct reports and transition security reports. GitHub private vulnerability reporting, repository protections, secret scanning, and push protection remain external gates.

## Gates before the first public Alpha

| Gate | Current status | Required evidence at the final candidate |
| --- | --- | --- |
| Canonical release truth | Latest local checkpoint passed; final repository-only evidence and hosted result pending | Keep the exact candidate, verified integration head, proposed tag, release record, Dashboard, and remaining Human gates aligned |
| Release identity | Verified | `0.1.0-alpha.29`, package metadata, changelog, roadmap, validation index, WI-0090 candidate, and proposed `v0.1.0-alpha.29` tag align |
| Package boundary | Passed | Explicit `files` allowlist and enforced dry-run manifest passed with 307 files |
| Clean installation | Passed | Exact tarball version, install, init, re-init, project launcher, and Doctor passed under Node.js 22 and 24 |
| Data-bearing upgrade | Passed | Alpha.28 Work Item, Learning, and application data remained byte-identical through the Alpha.29 upgrade rehearsal |
| Runtime support | Passed for declared scope | Node.js 22 and 24 passed locally, in clean consumers, and on hosted Linux; Windows remains unqualified |
| Real-browser console gate | Passed | Installed Chrome passed four-view semantic and layout checks locally, in fresh QA, and in the Node.js 24 full CI lane |
| Hosted CI | Historical candidate passed; latest candidate pending private push | Push the reconciled private candidate and require fresh Node.js 22 and Node.js 24 success, including the Node.js 24 browser gate |
| GitHub Actions supply chain | Passed at candidate | Reviewed full-length SHA pins and least-privilege permissions remained green |
| Dependency and provenance review | Passed locally | Lockfile audit reported zero known production vulnerabilities; notices and the allowlisted manifest were reviewed together |
| Secret and privacy review | Local review passed; hosting controls pending | High-confidence tracked-history review found no non-synthetic match; hosting-side scanning and push protection remain to be configured |
| Security reporting | Repository guidance added; external route pending | Enable and verify GitHub private vulnerability reporting; name the supported release; keep public issues out of the vulnerability path |
| Repository protection | Pending visibility decision | Public ruleset or branch protection, required CI, review policy, and push/secret protection configured when visibility allows |
| Contributor safety and moderation | Passed locally | Human-approved tested private route and enforceable Code of Conduct are committed; retain the route after visibility changes |
| License decision | MIT confirmed for first Alpha | Keep package metadata, repository license, contribution terms, notices, and release notes consistent; revisit Apache-2.0 only at a named trigger |
| Maintainer clean-package smoke | Passed | The real tarball passed the supported Node.js majors with 36 Doctor passes and no warning or failure |
| Independent public-instructions test | Not run | A person without Temple development history follows only the public docs and reaches healthy init, status, and Doctor output without maintainer coaching |
| Rollback | Candidate procedure recorded | Before publication, bind withdrawal or superseding-release steps to the approved immutable tag; project-owned-state recovery remains separate from framework rollback |

## Tests that do not block the first public Alpha claim

These remain required before stronger production or enterprise claims, but they should not delay a narrowly and honestly labeled local Alpha:

- real multi-human, multi-machine collaboration with independently administered environments;
- representative company or OSS adoption and a real High-Assurance drill;
- live Provider soak, disconnect, crash recovery, and provider-owned trust under untrusted repositories;
- real matched-model shadow evaluations and longitudinal Token or cost qualification;
- physical power-loss, filesystem-corruption, remote backup transport, and production recovery exercises;
- cross-platform qualification beyond the operating systems explicitly supported by the first public Alpha;
- external tracker, CI/CD, deployment, or notification writes.

## Recommended release sequence

1. Push the reconciled candidate privately and require a fresh full GitHub Actions result.
2. Have a genuinely independent new user follow only the public instructions and retain their result separately from maintainer smoke evidence.
3. Separately authorize repository visibility. Immediately after the repository becomes public, configure and verify branch or ruleset protection, required CI, private vulnerability reporting, secret scanning, and push protection.
4. Review the final diff, independent-user result, and exact GitHub Actions result, then separately authorize immutable `v0.1.0-alpha.29` tag creation and the GitHub Release.
5. Keep npm deferred until a later distribution decision explicitly removes `private: true` and repeats the publication-specific review.

## Source references

- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [GitHub Actions secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository)
- [MIT License text](https://opensource.org/license/mit)
- [Apache License 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
