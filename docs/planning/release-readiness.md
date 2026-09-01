# Release readiness

- Audit date: 2026-09-02
- Verified corrective candidate: `680230f021386f7d8ecd52addca9f81f68a2cb3a`
- Package metadata: `0.1.0-alpha.29` release candidate verified; public action not approved
- Target: first public Alpha, not `1.0` or production qualification

## Conclusion

Temple has a technically verified `0.1.0-alpha.29` candidate for its first public Alpha. The bounded local framework, package boundary, supported Node.js majors, clean consumer path, data-preserving upgrade, and hosted Linux matrix have passed. Publication remains a **NO-GO** until a private moderation route is approved, a genuinely independent new user completes the public path, the approved GitHub protections are configured, and the Human Principal separately authorizes the visibility, tag, and GitHub Release actions.

## Verified current facts

- GitHub is private and npm publication remains disabled through `private: true`.
- The scoped npm package does not exist in the public registry.
- GitHub Actions run [`33522030500`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33522030500) passed Node.js 22 and 24 at corrective candidate `680230f`; the earlier Node.js 24 cleanup failure remains preserved in WI-0086 and WI-0087 evidence.
- WI-0083 independently passed 260 tests at its exact candidate; WI-0081 and WI-0082 received fresh exact-candidate verification during the release-truth reconciliation.
- `npm audit --omit=dev` reported zero known dependency vulnerabilities on the audit date.
- The Alpha.29 package uses an explicit inclusion allowlist. Its dry run contains 305 files, approximately 0.63 MB packed and 2.54 MB unpacked, including the localized responsive README diagrams while excluding the repository's root `.ai-org`, tests, examples, screenshots, output, integrations, and development scripts. The original audit baseline produced 1,906 files and approximately 17.4 MB packed.
- The WI-0085 workflow candidate retains minimal `contents: read` permission and pins `actions/checkout` and `actions/setup-node` v7 to reviewed full commit SHAs.
- The package and installed bootstrap declare `^22.0.0 || ^24.0.0`. Local full suites pass all 262 tests under Node.js `v22.23.2` and `v24.20.0`, and hosted corrective candidate `680230f` passed both majors.
- A real tarball installed into a temporary consumer directory and completed version, init, re-init, Doctor, and status smoke checks under both supported Node.js majors. Node.js `v26.8.1` also passes all 262 tests as a non-blocking forward-compatibility signal, but remains outside the support contract while it is Current rather than LTS.
- `npm audit --omit=dev` reports zero known vulnerabilities for the current locked production graph, and the dependency-license inventory is recorded in `THIRD_PARTY_NOTICES.md`.
- The Human Principal accepted retaining MIT for the first public Alpha. Apache-2.0 remains a revisit option if explicit patent terms become an evidenced requirement.
- Contribution, governance, security, ownership, pull-request, and issue-intake files now define the repository-local boundary. GitHub private vulnerability reporting, repository protections, secret push protection, and a private conduct-reporting route remain external gates.

## Gates before the first public Alpha

| Gate | Current status | Required evidence at the final candidate |
| --- | --- | --- |
| Canonical release truth | Candidate reconciled; public closeout blocked | Keep the verified candidate, proposed tag, release record, Dashboard, and remaining Human gates aligned |
| Release identity | Verified | `0.1.0-alpha.29`, package metadata, changelog, roadmap, validation index, corrective candidate, and proposed `v0.1.0-alpha.29` tag align |
| Package boundary | Passed | Explicit `files` allowlist and enforced dry-run manifest passed with 305 files |
| Clean installation | Passed | Exact tarball version, install, init, re-init, project launcher, and Doctor passed under Node.js 22 and 24 |
| Data-bearing upgrade | Passed | Alpha.28 Work Item, Learning, and application data remained byte-identical through the Alpha.29 upgrade rehearsal |
| Runtime support | Passed for declared scope | Node.js 22 and 24 passed locally and on hosted Linux; Windows remains unqualified |
| Hosted CI | Passed | Corrective candidate `680230f` passed independently visible Node.js 22 and 24 jobs in run `33522030500` |
| GitHub Actions supply chain | Passed at candidate | Reviewed full-length SHA pins and least-privilege permissions remained green |
| Dependency and provenance review | Passed locally | Lockfile audit reported zero known production vulnerabilities; notices and the allowlisted manifest were reviewed together |
| Secret and privacy review | Local review passed; hosting controls pending | High-confidence tracked-history review found no non-synthetic match; hosting-side scanning and push protection remain to be configured |
| Security reporting | Repository guidance added; external route pending | Enable and verify GitHub private vulnerability reporting; name the supported release; keep public issues out of the vulnerability path |
| Repository protection | Pending visibility decision | Public ruleset or branch protection, required CI, review policy, and push/secret protection configured when visibility allows |
| Contributor safety and moderation | Partial | Contribution and governance boundaries exist; publish an enforceable code of conduct and private conduct-reporting route before opening public contribution |
| License decision | MIT confirmed for first Alpha | Keep package metadata, repository license, contribution terms, notices, and release notes consistent; revisit Apache-2.0 only at a named trigger |
| Public consumer smoke | Not run | A person or clean task without Temple development history follows only the public docs and reaches healthy init, status, and Doctor output |
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

1. Approve a private moderation route and add an enforceable Code of Conduct without publishing personal contact information.
2. Have a genuinely independent new user follow only the public instructions and retain their result separately from maintainer smoke evidence.
3. Approve and configure branch or ruleset protection, required CI, private vulnerability reporting, secret scanning, and push protection.
4. Review the final diff and exact GitHub Actions result, then separately authorize repository visibility, immutable `v0.1.0-alpha.29` tag creation, and the GitHub Release.
5. Keep npm deferred until a later distribution decision explicitly removes `private: true` and repeats the publication-specific review.

## Source references

- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [GitHub Actions secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository)
- [MIT License text](https://opensource.org/license/mit)
- [Apache License 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
