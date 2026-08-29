# Alpha.14 product specification contracts validation

- Date: 2026-08-29
- Version: `0.1.0-alpha.14`
- Tested revision: `a41306ee5253e0879ac64d1723e774dd5766205b`
- Environment: macOS 26.5.2, arm64, Node.js v25.6.1
- Result: **local automated contract foundation passed; external-system and large-scale enterprise validation not run**

## Question

Can a clean or upgraded repository add project-owned product-specification authority, preserve existing enterprise documents, bind Work Items to approved current product, UX, UI, API, and technical-design revisions, support explicit UI delivery depth, and expose contract health without taking ownership of project documents or weakening existing lifecycle gates?

## Commands

```bash
npm run verify
git diff --check
git rev-parse HEAD
```

`npm run verify` executed repository policy checks and the complete Node test suite against the feature content at the tested revision. The validation record itself was added afterward and rechecked before publication.

## Observed evidence

- Repository checks passed with 60 installed-overlay files and all ten Positions.
- All 66 automated tests passed.
- Clean initialization created an empty project-owned specification index without adding it to managed ownership.
- Upgrade created only a missing empty index, preserved an existing customized index byte-for-byte, and removed a newly seeded index if a later migration step failed.
- The registry validated stable IDs, document kinds, authority classes, adoption profiles, source types, approval actor/time/reference, related Work Items, and source provenance.
- Approved repository-native sources required a SHA-256 digest; global doctor/status observation and Work Item-bounded lifecycle/context checks detected missing or drifted content at the intended scope.
- `gate-evidence` and `indexed` product-specification modes remained distinguishable and observable. Indexed delivery required an approved current product reference before Design.
- Work Items pinned product, UX, UI, API, and technical-design revisions. Stale, unapproved, malformed, category-mismatched, or derived-authority references were rejected at their lifecycle boundary.
- Configure operations preserved sibling references, provided explicit replace semantics, prevented governance downgrades after Design or Build, and allowed same-ID repinning only to a current approved revision.
- UI work selected `not-applicable`, `code-first`, `preview-first`, or `design-led`; contradictory mode/reference combinations were rejected, pre-Build evidence was enforced, and go closeout rechecked mode-specific evidence.
- Status v5, doctor, parallel readiness, and bounded Context Capsules exposed specification mode, UI delivery mode, resolved references, stale or unapproved counts, source integrity, and attention signals.
- Existing Work Items that predated the UI-mode field remained readable and configurable, while new Work Items required an explicit UI decision before Build.
- Independent bounded reviews checked documentation consistency, managed versus project-owned boundaries, lifecycle authority, downgrade resistance, backward compatibility, and upgrade rollback.

## Supported claim

Alpha.14 provides a repository-native product-specification and interface-contract foundation for bounded iterative delivery. It supports new projects, federated enterprise documents, hybrid migrate-on-touch adoption, and Temple-native sources without forcing one documentation tool or a waterfall process.

## Explicitly unsupported claim

This validation does not prove live synchronization or write-back with Confluence, Jira, Figma, Google Drive, or another external system. External URLs were not contacted. It does not prove migration of a real enterprise documentation estate, semantic compatibility between UI and API contracts, automated design-token synchronization, visual-regression infrastructure, High-Assurance governance, large-repository performance, or multi-human and multi-machine operation. The retained [Collaborative large-scale real-environment test plan](collaborative-large-scale-test-plan.md) remains `planned / not run`.
