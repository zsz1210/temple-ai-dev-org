# WI-0085 Developer Report

- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Candidate revision: `31eb17071a304f16f2af740520e1821fd23589bd`
- UI mode: `not-applicable` for framework behavior; README diagrams received documentation render review
- External action: no visibility change, npm publication, tag, GitHub Release, repository-setting mutation, or announcement

## Delivered

- Replaced the unsupported `node >=20` promise with the exact `^22.0.0 || ^24.0.0` LTS range in package metadata, generated bootstrap metadata, the self-host lock, CI, tests, and three native-language README entry points.
- Expanded hosted CI over Node.js 22 and 24 while preserving fail-closed scope selection, minimal `contents: read` permission, and independent reporting of governance and behavior results.
- Pinned `actions/checkout` and `actions/setup-node` v7 to reviewed full commit SHAs.
- Added an npm inclusion allowlist and an enforced dry-run package boundary. The candidate contains 304 files and includes runtime, overlay, Packs, public docs, and responsive README diagrams while excluding root self-host state, tests, examples, integrations, output, screenshots, and development scripts.
- Added contributor guidance, maintainer governance, supported-version and private vulnerability-reporting guidance, CODEOWNERS, issue forms, a pull-request template, and runtime dependency-license inventory.
- Recorded the retained-MIT, maintained-LTS, immutable-Action, and explicit-distribution decision in DEC-0007 and ADR-0039.
- Replaced the three public README entry points with the approved human-facing structure and localized responsive delivery diagrams. Mermaid source and static SVG outputs are versioned; Mermaid remains authoring-only.

## Developer verification

- Focused package, CI, bootstrap, and recovery tests passed.
- Full local suites passed all 262 tests on Node.js `v22.23.2` and `v24.20.0` before candidate fixation.
- Node.js `v26.8.1` passed all 262 tests as a non-blocking compatibility signal.
- A real tarball installed in a temporary consumer directory and completed version, init, re-init, Doctor, and status smoke under Node.js 22 and 24.
- The package boundary reported 304 files and approximately 0.63 MB packed / 2.54 MB unpacked.
- `npm audit --omit=dev` reported zero known vulnerabilities.
- Schema validation passed 106 documents through 28 schemas.
- Doctor passed after the self-host `temple.lock` Node range was reconciled.
- All six delivery SVGs passed `xmllint`.
- English, Japanese, and Traditional Chinese READMEs were rendered at 1440 px and 390 px. The local Playwright screenshots are review output only and remain excluded from Git and the package.

## Boundaries retained

- `private: true` remains in package metadata.
- The repository remains private and the scoped npm package remains unpublished.
- Public branch protection, required-check settings, private vulnerability reporting, secret push protection, and a private conduct-reporting route are not configured by this Work Item.
- An enforceable code of conduct and moderation contact remain required before opening public contribution.
- The next version, immutable tag, GitHub Release, first external announcement, and any npm publication remain separate Human Principal decisions or actions.
- Node.js 26 is not supported while it remains Current. Windows is not qualified for the first public Alpha.
