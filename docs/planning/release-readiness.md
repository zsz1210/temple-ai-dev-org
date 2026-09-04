# Alpha release readiness

> **Preparation only — no publication is authorized.** This page records what is ready, what must be repeated at a frozen candidate, and which external actions still require the repository owner's explicit decision.

Last refreshed: 2026-09-04

Current roadmap stage: [Real-world qualification](roadmap.md#4-real-world-qualification--current)

Release target: a narrowly described public Alpha, not `1.0` or production qualification

## Current answer

Temple does **not** have a current public Alpha or an npm release.

- The repository remains private.
- A historical private GitHub prerelease, `v0.1.0-alpha.5`, exists. It is not the current recommended build.
- The latest ordinary semantic version tag is `v0.1.0-alpha.27`.
- `package.json` currently says `0.1.0-alpha.29`, but there is no matching `v0.1.0-alpha.29` tag or GitHub Release.
- `@zsz1210/temple-ai-dev-org` does not exist in the public npm registry, and `private: true` prevents accidental publication.
- No exact revision is currently frozen as the next release candidate. Revision `54d14f4e94a930719ca7674ebf1ad74be89de7ac` passed the pre-freeze clean-room rehearsal, but the later evidence reconciliation means it is not being declared the release commit.

Because Temple has changed materially since the Alpha.29 candidate evidence was recorded, `v0.1.0-alpha.30` is the recommended next public candidate. This is a proposal, not an approved version change.

## Release surfaces

| Surface | Current truth | Next action |
| --- | --- | --- |
| GitHub repository | Private | Keep private while the candidate and new-user path are tested |
| Branch protection | Strict required Node.js 24 check, one approval, Code Owner review, last-push approval, stale-review dismissal, and resolved conversations are configured | Recheck after any visibility change |
| GitHub Release | Historical private `v0.1.0-alpha.5` prerelease only | Decide how to label that history, then create a new Release only after the exact tag is approved |
| Package metadata | `@zsz1210/temple-ai-dev-org@0.1.0-alpha.29`, `private: true` | Choose and apply the next candidate version only when scope freezes |
| npm | Package lookup returns `E404`; nothing has been published | Keep deferred until after the GitHub Alpha is exercised |
| Announcement | None | Treat as a separate decision after the Release exists |

The package version, a Git tag, a GitHub Release, repository visibility, and npm publication are different states. One never proves or authorizes another.

## Foundations already in place

- Human-facing English, Japanese, and Traditional Chinese README entry points.
- MIT License, contribution rules, governance, Code of Conduct, security guidance, ownership, issue templates, and pull-request templates.
- A protected `main` branch with required CI and review controls.
- An explicit package inclusion allowlist that excludes root self-hosting state, tests, examples, local output, integrations, and development scripts from npm contents.
- Project-owned Evidence Profiles and a value-redacted publication audit that separates useful self-host evidence from blocked or local-only data without changing repository visibility.
- Repository-native Work Items, evidence, Independent QA separation, recovery, learning, context routing, and advisory execution routing.
- A local real-browser Management Console regression gate.
- A private reporting route previously tested by the Human Principal.

These foundations reduce release risk. They do not replace exact-candidate verification or Human publication approval.

## Current diagnostic observations

These observations describe the private repository before this refresh. They are useful preparation evidence, but they are not a frozen release record.

- Required `main` CI run [`33854507459`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33854507459) passed the Node.js 24 repository gate.
- The unpublished archive built from `54d14f4e94a930719ca7674ebf1ad74be89de7ac` contained 374 entries, 804,392 packed bytes, and 3,192,729 unpacked bytes; its SHA-256 was `43cefd40bcb5d21a3159419eb89d31d691f0ac81a9489a38a4b4824ad5cf2f0b`.
- `npm audit --omit=dev --json` reported zero known vulnerabilities across all severities.
- The WI-0158 fresh-session delivery and separate cold recovery completed without Human intervention. QueueKeep reached accepted closeout with distinct Developer and Independent QA identities, two passing application tests, Doctor 37/0/0, and a clean read-only recovery. Token totals remained unavailable.
- WI-0159 privacy-normalized the current copies of the affected WI-0155 and WI-0156 artifacts while retaining their original revision-pinned Git evidence. The current public-profile audit reports zero blocked findings on both repository and package surfaces. WI-0160 reviewed all 68 PNGs at their current digests and found no restricted values or embedded text/EXIF payloads. It also classified all 330 retained-legacy text records, representing 334 occurrences across 112 files. WI-0161 then dogfooded a supported canonical-state operation and reduced that area's 245 occurrences to zero while preserving Evidence identity and artifact references. Retained-artifact and fixture normalization remain, together with exact-candidate assurance and the separate historical-Git exposure decision.
- The historical Alpha.29 work and its earlier package, installation, browser, upgrade, and hosted observations remain available in `WI-0086`. They are history, not qualification for a later candidate.

Exact file bytes, digests, audit results, test counts, and hosting state must be captured again after the candidate revision is frozen.

## Gates for the next public Alpha

| Gate | Status now | Evidence required at the frozen candidate |
| --- | --- | --- |
| Release scope | Not frozen | One explicit feature and claim boundary; no unreviewed follow-up work in the candidate |
| Version identity | Human decision pending | Package metadata, changelog, validation record, tag, and Release notes name the same approved version |
| Exact revision | Not selected | One immutable commit is named by every candidate-specific check |
| Repository checks | Current private `main` is green | `npm run check`, schema validation, and Doctor pass at the exact candidate |
| Full behavior suite | Prior revision passed 422 tests | Repeat the complete suite at the exact candidate |
| Browser presentation | Prior revision passed | Repeat the responsive README and Management Console gate at the exact candidate |
| Package boundary | Current diagnostic dry run passes | Freeze the exact `npm pack` manifest, size, digest, license, and provenance inventory |
| Clean consumer | Must be repeated | Install the real tarball in a clean Node.js 24 environment; run version, init, re-init, project launcher, status, and Doctor |
| Upgrade safety | Prior Alpha.28-to-.29 rehearsal passed | Reconcile whether the candidate changes managed files or migration behavior; repeat only the affected upgrade path |
| Dependency and secret review | Current dependency audit is clean; hosting controls not fully qualified | Repeat the locked audit and tracked-content review; verify hosting security controls after visibility changes |
| Evidence publication boundary | Current repository and package surfaces have zero blocked findings; all 68 PNGs passed digest-bound review; canonical-state findings fell from 245 to zero; 89 retained-artifact or fixture text occurrences remain | Complete exact-candidate assurance and the remaining bounded text normalization, repeat the audit, decide how to treat already-shared historical Git objects, and record the Human disposition |
| Fresh-session clean-room path | Passed at the pre-freeze revision | WI-0158 completed one bounded Work Item and a separate repository-only recovery without maintainer coaching; repeat only if later candidate changes affect the Core Path |
| Rollback | Earlier procedure exists | Bind withdrawal or superseding-release instructions to the approved immutable tag |
| Publication authority | Not granted | Separate Human approval for visibility, tag, GitHub Release, and any later npm publication |

## Decisions reserved for the repository owner

The following choices cannot be inferred from passing tests:

1. Whether the next candidate should be `v0.1.0-alpha.30`.
2. When the feature and documentation scope is stable enough to freeze.
3. Whether the historical `v0.1.0-alpha.5` prerelease should remain as-is or be relabeled as an early internal preview.
4. When the repository may become public.
5. Whether the exact tag and GitHub Release may be created.
6. Whether and when npm distribution may be enabled.
7. Whether an announcement should be made and what claims it may contain.

Approval of one item does not approve the later items.

## Recommended preparation sequence

### Step 1 — rehearse the AI-assisted path in a clean room — completed

- Start from a disposable new repository and a frozen Temple revision while the source repository remains private.
- Open a fresh AI session with no prior Temple conversation, hidden fixture answer, or maintainer-only instruction.
- Give that session only the repository-visible README, Core Path, and files it discovers through the normal Temple bootstrap and context flow.
- Let the AI initialize the project and complete one bounded Work Item through closeout; using AI to read and execute the documentation is the supported path, not a test exception.
- Start a second cold session and require it to recover the project, Position, Work Item result, evidence, and next safe action from repository state.
- Retain completion, elapsed time, errors, rework, Human interventions, and documentation gaps. Token observation is optional, and unavailable values remain unknown.
- Correct any hidden dependency or broken path before freezing a release candidate.

WI-0158 completed this step at revision `54d14f4e94a930719ca7674ebf1ad74be89de7ac`. All three retained QueueKeep observations completed without Human intervention. The final run preserved a clean read-only recovery after the WI-0157 correction, while two recoverable delivery mistakes and unavailable Token telemetry remain explicitly recorded. See [Final pre-Alpha clean-room rehearsal](../validation/final-pre-alpha-clean-room.md).

This rehearsal validates the AI-assisted operating path. It does not establish that an unaided first-time human finds every document intuitive, and the first Alpha must not make that stronger usability claim. An external human study may be run later when broader adoption evidence is useful; it is not a publication gate.

### Step 2 — freeze one candidate

- Decide the version and supported claim boundary.
- Update version-bearing files and release notes together.
- Name one exact commit and stop unrelated changes from entering its evidence set.

### Step 3 — qualify the exact package

- Run repository, schema, Doctor, complete behavior, and browser checks.
- Produce the exact tarball and manifest.
- Reproduce installation and the Core Path in a clean Node.js 24 consumer.
- Perform Independent QA against that exact revision and package.

### Step 4 — make publication decisions separately

- Explicitly authorize repository visibility.
- Verify required CI, review rules, vulnerability reporting, secret scanning, and push protection in the public state.
- Review the final evidence and separately authorize the immutable tag and GitHub Release.
- Observe the first users before deciding whether npm is needed.

## npm remains a later distribution decision

The first public Alpha can be source-first through GitHub. npm adds a second identity, access, authentication, provenance, package-content, and rollback surface, so it should not be coupled to the first GitHub Release by default.

Before any npm publication:

- confirm the final scoped package name;
- remove `private: true` only in an explicitly approved publication candidate;
- configure public scoped-package access and maintainer account protection;
- repeat the exact tarball and clean-consumer checks;
- verify README, license, repository metadata, executable entrypoints, and provenance;
- approve the exact version and publish command separately.

## Not required for a narrowly labeled first Alpha

These remain important before stronger production or enterprise claims, but they do not need to block a small, human-supervised local Alpha:

- large multi-human and multi-machine qualification;
- representative enterprise adoption and a real High-Assurance drill;
- production monitoring, remediation, deployment, or external tracker writes;
- automatic Provider execution or automatic model switching;
- statistically qualified universal Token, latency, or cost savings;
- production disaster recovery or regulated acceptance;
- broad cross-platform support beyond the explicitly tested environment.

## Canonical references

- [Roadmap](roadmap.md)
- [Core Path](../getting-started/core-path.md)
- [Current validation records](../validation/README.md)
- [`WI-0086` historical public-Alpha candidate](../../.ai-org/work-items/WI-0086.json)
- [`WI-0149` readiness refresh](../../.ai-org/work-items/WI-0149.json)
- [Changelog](../../CHANGELOG.md)
- [Security policy](../../SECURITY.md)
- [Governance](../../GOVERNANCE.md)
