# Release readiness

- Audit date: 2026-09-01
- Audit baseline: `6ad69d7c627036b0fef9529f9dc67ae794d32cb7`
- Package metadata: `0.1.0-alpha.28`
- Target: first public Alpha, not `1.0` or production qualification

## Conclusion

Temple has entered final public-Alpha hardening. The bounded local framework is implemented, exact-candidate tests cover its core safety contracts, and current `main` passed hosted CI. WI-0085 now has local implementations for the package boundary, Node.js LTS contract, immutable Action references, and core OSS health files. Publication remains a **NO-GO** until those changes are integrated with the public documentation, committed as one candidate, repeated in hosted and clean-consumer environments, and combined with the remaining external repository and release gates.

## Verified current facts

- GitHub is private and npm publication remains disabled through `private: true`.
- The scoped npm package does not exist in the public registry.
- GitHub Actions is enabled, has retained 64 runs, and run `33509813104` passed at audit baseline `6ad69d7`.
- WI-0083 independently passed 260 tests at its exact candidate; WI-0081 and WI-0082 received fresh exact-candidate verification during the release-truth reconciliation.
- `npm audit --omit=dev` reported zero known dependency vulnerabilities on the audit date.
- The combined WI-0085 package candidate uses an explicit inclusion allowlist. Its dry run contains 304 files, approximately 0.63 MB packed and 2.54 MB unpacked, including the localized responsive README diagrams while excluding the repository's root `.ai-org`, tests, examples, screenshots, output, integrations, and development scripts. The original audit baseline produced 1,906 files and approximately 17.4 MB packed.
- The WI-0085 workflow candidate retains minimal `contents: read` permission and pins `actions/checkout` and `actions/setup-node` v7 to reviewed full commit SHAs.
- The package and installed bootstrap candidate declare `^22.0.0 || ^24.0.0`. Local full suites pass all 262 tests under Node.js `v22.23.2` and `v24.20.0`; a hosted exact-candidate run remains pending.
- A real tarball installed into a temporary consumer directory and completed version, init, re-init, Doctor, and status smoke checks under both supported Node.js majors. Node.js `v26.8.1` also passes all 262 tests as a non-blocking forward-compatibility signal, but remains outside the support contract while it is Current rather than LTS.
- `npm audit --omit=dev` reports zero known vulnerabilities for the current locked production graph, and the dependency-license inventory is recorded in `THIRD_PARTY_NOTICES.md`.
- The Human Principal accepted retaining MIT for the first public Alpha. Apache-2.0 remains a revisit option if explicit patent terms become an evidenced requirement.
- Contribution, governance, security, ownership, pull-request, and issue-intake files now define the repository-local boundary. GitHub private vulnerability reporting, repository protections, secret push protection, and a private conduct-reporting route remain external gates.

## Gates before the first public Alpha

| Gate | Current status | Required evidence at the final candidate |
| --- | --- | --- |
| Canonical release truth | In progress | Only intentionally active or retained blocked Work Items; rebuilt status; version, changelog, tag, release record, and Dashboard agree |
| Release identity | Pending | Next version chosen; package metadata, changelog, roadmap, validation index, and immutable Git tag aligned |
| Package boundary | Implemented locally; pending exact candidate | Explicit `files` allowlist and enforced dry-run manifest; rerun after documentation integration and version selection |
| Clean installation | Local tarball smoke passed; final candidate pending | Repeat the tarball install, init, re-init, schema, Doctor, status, and exact-revision launcher recovery after version selection and commit |
| Data-bearing upgrade | Proven historically; pending final candidate | Upgrade from the last supported Alpha with Work Items, evidence, learning, custom instructions, and optional extensions preserved or explicitly migrated |
| Runtime support | Local matrix passed | Node.js 22 and 24 LTS passed locally; hosted Linux must pass the exact candidate; macOS and Linux claims must cite their own evidence; Windows remains unqualified unless separately tested |
| Hosted CI | Current baseline passed | Full manual or push run at the exact release candidate, with governance and behavior results visible independently |
| GitHub Actions supply chain | Implemented locally; hosted run pending | Reviewed full-length SHA pins and least-privilege permissions must pass on the pushed candidate |
| Dependency and provenance review | Local review complete; final candidate pending | Repeat lockfile audit and review the production-license inventory, notices, adapter provenance, and final package manifest together |
| Secret and privacy review | Partial | Tracked-file and history-oriented secret review; no local identity binding, runtime telemetry, private prompts, credentials, or project evidence in the release artifact |
| Security reporting | Repository guidance added; external route pending | Enable and verify GitHub private vulnerability reporting; name the supported release; keep public issues out of the vulnerability path |
| Repository protection | Pending visibility decision | Public ruleset or branch protection, required CI, review policy, and push/secret protection configured when visibility allows |
| Contributor safety and moderation | Partial | Contribution and governance boundaries exist; publish an enforceable code of conduct and private conduct-reporting route before opening public contribution |
| License decision | MIT confirmed for first Alpha | Keep package metadata, repository license, contribution terms, notices, and release notes consistent; revisit Apache-2.0 only at a named trigger |
| Public consumer smoke | Not run | A person or clean task without Temple development history follows only the public docs and reaches healthy init, status, and Doctor output |
| Rollback | Pending final candidate | Git tag and package withdrawal/deprecation procedure; project-owned-state restore and framework-version rollback boundaries documented |

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

1. Integrate the README redesign with WI-0085, select the next version, and keep the package allowlist green.
2. Choose the first distribution channel: the safer initial default is an immutable GitHub Release while npm remains deferred.
3. Create one versioned release candidate and run the complete Node.js 22 and 24 matrix in clean macOS and hosted Linux environments.
4. Review the package manifest, dependency licenses, third-party notices, security surface, code of conduct, and public documentation together.
5. Configure branch or ruleset protection, required CI, private vulnerability reporting, secret push protection, and the private moderation route before changing visibility.
6. Run a clean-consumer smoke using only public instructions, then make the repository public and create the immutable release under a separately approved external action.
7. Publish npm only after the reviewed artifact and clean-consumer smoke pass and a separate decision removes `private: true`.

## Source references

- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [GitHub Actions secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository)
- [MIT License text](https://opensource.org/license/mit)
- [Apache License 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
