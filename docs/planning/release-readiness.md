# Release readiness

- Audit date: 2026-09-01
- Audit baseline: `6ad69d7c627036b0fef9529f9dc67ae794d32cb7`
- Package metadata: `0.1.0-alpha.28`
- Target: first public Alpha, not `1.0` or production qualification

## Conclusion

Temple has entered final public-Alpha hardening. The bounded local framework is implemented, exact-candidate tests cover its core safety contracts, and current `main` passed hosted CI. Publication is still a **NO-GO** until the package surface, release identity, supported runtime matrix, public security boundary, and clean-consumer path are corrected and verified at one final candidate.

## Verified current facts

- GitHub is private and npm publication remains disabled through `private: true`.
- The scoped npm package does not exist in the public registry.
- GitHub Actions is enabled, has retained 64 runs, and run `33509813104` passed at audit baseline `6ad69d7`.
- WI-0083 independently passed 260 tests at its exact candidate; WI-0081 and WI-0082 received fresh exact-candidate verification during the release-truth reconciliation.
- `npm audit --omit=dev` reported zero known dependency vulnerabilities on the audit date.
- A clean package dry run at the audit baseline produced 1,906 files, approximately 17.4 MB packed and 29.0 MB unpacked. It included self-host `.ai-org` state, test screenshots, evidence, and optional-adapter examples because no explicit publish allowlist exists.
- The CI workflow uses minimal `contents: read` permission, but `actions/checkout@v7` and `actions/setup-node@v7` are not pinned to immutable full commit SHAs.
- The package declares `node >=20`, while the Node.js project now marks v20 and v25 end-of-life. Current maintained LTS lines are v22 and v24.
- The current repository has an MIT License, contribution guidance, a security file, and third-party notices; the security file does not yet name supported versions or a private reporting route.

## Gates before the first public Alpha

| Gate | Current status | Required evidence at the final candidate |
| --- | --- | --- |
| Canonical release truth | In progress | Only intentionally active or retained blocked Work Items; rebuilt status; version, changelog, tag, release record, and Dashboard agree |
| Release identity | Pending | Next version chosen; package metadata, changelog, roadmap, validation index, and immutable Git tag aligned |
| Package boundary | Blocked | Explicit `files` allowlist or equivalent; dry-run manifest reviewed; no self-host state, private evidence, screenshots, test fixtures, or unneeded adapter examples |
| Clean installation | Pending final candidate | `npm ci --ignore-scripts`, exact-revision launcher recovery, fresh init, re-init, schema validation, Doctor, and status in a clean repository |
| Data-bearing upgrade | Proven historically; pending final candidate | Upgrade from the last supported Alpha with Work Items, evidence, learning, custom instructions, and optional extensions preserved or explicitly migrated |
| Runtime support | Contract is stale | CI matrix for Node.js 22 and 24 LTS; macOS and Linux supported only after both pass; Windows either tested or explicitly unsupported for this release |
| Hosted CI | Current baseline passed | Full manual or push run at the exact release candidate, with governance and behavior results visible independently |
| GitHub Actions supply chain | Pending | Pin every external Action to a reviewed full-length commit SHA and keep least-privilege permissions |
| Dependency and provenance review | Partial | Lockfile audit, production-license inventory, `THIRD_PARTY_NOTICES.md`, adapter provenance, and final package manifest reviewed together |
| Secret and privacy review | Partial | Tracked-file and history-oriented secret review; no local identity binding, runtime telemetry, private prompts, credentials, or project evidence in the release artifact |
| Security reporting | Pending | Supported versions, private vulnerability contact or GitHub private reporting path, response expectations, and public security features configured |
| Repository protection | Pending visibility decision | Public ruleset or branch protection, required CI, review policy, and push/secret protection configured when visibility allows |
| License decision | Human decision pending | MIT retained or an approved migration plan completed before public contributions are accepted |
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

1. Close the package and runtime-contract gaps without changing public visibility.
2. Choose the license and first distribution channel.
3. Create one versioned release candidate and run the complete matrix in clean environments.
4. Review the package manifest, third-party notices, security surface, and public documentation together.
5. Make the repository public only after repository protections and private vulnerability reporting are ready.
6. Publish npm only if the reviewed artifact and clean-consumer smoke both pass; otherwise ship the first public Alpha by immutable Git tag and keep npm deferred.

## Source references

- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [GitHub Actions secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository)
- [MIT License text](https://opensource.org/license/mit)
- [Apache License 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
