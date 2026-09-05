# Alpha release readiness

> **The source repository and Alpha.30 package are public.** WI-0167 records the exact GitHub prerelease, npm package, registry integrity, and clean consumer result. npm assigned both `next` and the registry-required first-version `latest` alias to Alpha.30; the owner accepted that temporary alias without treating the prerelease as stable. Deployment and any announcement remain separate decisions.

Last refreshed: 2026-09-05

Current roadmap stage: [Real-world qualification](roadmap.md#4-real-world-qualification--current)

Release target: a narrowly described public Alpha, not `1.0` or production qualification

## Current answer

Temple has a public source repository, GitHub prerelease `v0.1.0-alpha.30`, and public npm package `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30`. WI-0167 is the authoritative repository record for those exact publication actions; the public services remain the observable source for their current availability.

- The existing repository became public after the owner explicitly accepted the historical metadata quantified by WI-0165 and WI-0166 verified all available GitHub Actions logs.
- The historical `v0.1.0-alpha.5` prerelease remains release history, not the current recommended build.
- `WI-0163` and WI-0164 froze and qualified an earlier Alpha.30 candidate; later public-state documentation and dependency remediation deliberately replaced those exact package bytes.
- WI-0167 upgrades the optional Archify adapter to upstream `v2.16.0`, applies one disclosed deterministic `fast-uri` `3.1.7` downstream security patch, and requires fresh exact-package qualification.
- `package.json` keeps `next` as its conservative publication default. The npm registry nevertheless assigned `latest` to the first published package version; the owner accepted that platform constraint for Alpha.30.
- WI-0168 replaces routine interactive publication with a Release-only npm Trusted Publishing design. It does not retroactively republish Alpha.30 or authorize another version.

The approved version is `v0.1.0-alpha.30`. Its release approval does not authorize deployment, an announcement, or stronger product and performance claims. Future prereleases remain on `next`; only a deliberately published stable GitHub Release may intentionally route a stable version to `latest`.

## Release surfaces

| Surface | Current truth | Next action |
| --- | --- | --- |
| GitHub repository | Public at `879bcd6e`; anonymous API, Git, README, and License access verified | Keep public and observe the source surface |
| Branch protection | Reverified after publication: strict required Node.js 24 check, one approval, Code Owner review, last-push approval, stale-review dismissal, and resolved conversations | Keep enabled and monitor public contributions |
| GitHub Release | `v0.1.0-alpha.30` is published as a prerelease at exact release revision `d2b2a51` | Keep later Releases bound to an exact qualified tag and asset |
| Package metadata | `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30`; public access and conservative `next` default are explicit | Change the version only through a separately qualified release candidate |
| npm | Alpha.30 is retrievable; `next` and the accepted first-version `latest` alias both resolve to it | Configure and prove Release-only OIDC on the next new version; do not infer stable readiness from the alias |
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

These observations span the private qualification work and the later public-source verification. Each result remains bound to its named revision and release surface.

- Required `main` CI run [`33854507459`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33854507459) passed the Node.js 24 repository gate.
- The unpublished archive built from `54d14f4e94a930719ca7674ebf1ad74be89de7ac` contained 374 entries, 804,392 packed bytes, and 3,192,729 unpacked bytes; its SHA-256 was `43cefd40bcb5d21a3159419eb89d31d691f0ac81a9489a38a4b4824ad5cf2f0b`.
- `npm audit --omit=dev --json` reported zero known vulnerabilities across all severities.
- The WI-0158 fresh-session delivery and separate cold recovery completed without Human intervention. QueueKeep reached accepted closeout with distinct Developer and Independent QA identities, two passing application tests, Doctor 37/0/0, and a clean read-only recovery. Token totals remained unavailable.
- WI-0159 privacy-normalized the current copies of the affected WI-0155 and WI-0156 artifacts while retaining their original revision-pinned Git evidence. WI-0160 reviewed all 68 PNGs at their current digests and found no restricted values or embedded text/EXIF payloads; it also classified 334 text occurrences. WI-0161 reduced the 245 canonical-state occurrences to zero while preserving Evidence identity and artifact references. WI-0162 resolved the remaining 89 current-tree text occurrences: 70 retained-artifact values were normalized through a revision-bound plan, 18 first-party fixture literals were replaced without removing behavior coverage, and the unchanged Archify security fixture is allowed only at its installed-manifest digest. Clean-worktree Independent QA passed all 443 tests at exact candidate `9012ece9e1ff3871f8e24bfc68ec79f77060d5a8`. WI-0165 subsequently quantified the remaining historical-Git privacy decision.
- WI-0164 built `zsz1210-temple-ai-dev-org-0.1.0-alpha.30.tgz` from exact candidate `a6849519c6067b2f73ca1a44d556faf7a5168b1d`. It contained 380 files, 819,744 packed bytes, and 3,254,381 unpacked bytes; SHA-256 was `8f93462cdea25068920279740450a72977f1a82b375fbf82bb26dac54aa36c95`.
- WI-0165 scanned all 7,870 text blobs reachable from `main`, nine tags, and 42 GitHub pull-request heads. It found no credible credential exposure or inspection failure. It did find 3,745 historical local-environment and email occurrences across 738 blobs and 158 paths, all already reachable from `main`; 114 PNG/SVG blobs were explicitly excluded from content review. The owner accepted that history. WI-0166 then scanned all 167 available Actions-run archives, 464 log files, and 16,486,283 log bytes without finding a credential, email, home path, private IP, Tailnet hostname, binary log, or read failure.
- After repository publication, Secret Scanning and Push Protection reported zero alerts; private vulnerability reporting and Dependabot security updates are enabled. WI-0167 replaces the alerted Archify `v2.15.0` development lockfile with upstream `v2.16.0` plus a deterministic `fast-uri` `3.1.7` override. The resulting lock is byte-identical to npm's package-lock-only resolution and reports zero known vulnerabilities.
- The exact candidate passed all 443 tests, 188-document schema validation, the installed-Chrome browser gate, dependency audits with zero known vulnerabilities, and the public repository/package audit with zero blockers. Its one Doctor warning was the expected stale generated parallel plan at the historical Work Item revision.
- A clean Node.js `v24.20.0` consumer installed the exact local tarball and passed version, first init, idempotent re-init, installed launcher, status, and Doctor. A separate Alpha.29 fixture upgraded lock-only while 15 sampled project-owned digests remained unchanged.
- The historical Alpha.29 work and its earlier package, installation, browser, upgrade, and hosted observations remain available in `WI-0086`. They are history, not qualification for this candidate.

The exact published package bytes, manifest, consumer result, audits, test count, browser result, and public registry retrieval are captured by WI-0167. Future package evidence must remain bound to its own version and revision.

## Gates for the next public Alpha

| Gate | Status now | Evidence required at the frozen candidate |
| --- | --- | --- |
| Release scope | Frozen internally by `WI-0163` | Preserve the supported claim and explicit non-claims during package qualification |
| Version identity | `0.1.0-alpha.30` applied to current candidate files | Confirm the archive reports the same version; any later tag and Release must match it |
| Exact revision | Qualified at `a6849519c6067b2f73ca1a44d556faf7a5168b1d` | Reject rather than silently repoint if later source changes are required |
| Repository checks | Passed at the exact candidate | Repeat only if the candidate is replaced |
| Full behavior suite | Passed all 443 tests at the exact candidate | Repeat only if the candidate is replaced |
| Browser presentation | Installed-Chrome gate passed at the exact candidate | Retain the bounded platform and usability limits |
| Package boundary | Exact 380-file manifest, sizes, integrity, and SHA-256 recorded | Preserve the archive identity in any later tag or Release review |
| Clean consumer | Node.js 24 exact-tarball and public-registry paths passed for Alpha.30 | Repeat against the exact package version after each release |
| Upgrade safety | Alpha.29-to-.30 lock-only upgrade passed; 15 project-owned digests unchanged | Repeat only if the candidate or migration boundary changes |
| Dependency and secret review | Secret alerts are zero; WI-0167 contains the reviewed optional-adapter replacement | Confirm GitHub closes the six obsolete alerts after merge and retain the zero-vulnerability audits |
| Evidence publication boundary | Existing history accepted; all available Actions logs reviewed; public anonymous access verified; media remained explicitly excluded | Preserve the recorded limits and review any new publication surface independently |
| Fresh-session clean-room path | Passed at the pre-freeze revision | WI-0158 completed one bounded Work Item and a separate repository-only recovery without maintainer coaching; repeat only if later candidate changes affect the Core Path |
| Rollback | Earlier procedure exists | Bind withdrawal or superseding-release instructions to the approved immutable tag |
| Publication authority | Repository visibility and Alpha.30 publication were separately granted and exercised | A future GitHub Release publication remains the deliberate Human release action; OIDC must not broaden merge authority |

## Decisions reserved for the repository owner

The following choices cannot be inferred from passing tests:

1. Whether the historical `v0.1.0-alpha.5` prerelease should remain as-is or be relabeled as an early internal preview.
2. Whether an announcement should be made and what claims it may contain.
3. When the product evidence is strong enough to publish the first intentional stable version under npm `latest`.
4. Whether deployment or hosted services should ever be part of a later release.

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

- `WI-0163` selected `0.1.0-alpha.30`, froze the supported claim and non-claims, and aligned the version-bearing files and release notes.
- Its implementation commit is the exact technical candidate; unrelated changes must not enter its qualification evidence set.

### Step 3 — qualify the exact package — completed

- WI-0164 ran repository, schema, Doctor, complete behavior, browser, dependency, and publication-surface checks at the exact technical candidate.
- It produced and retained the exact tarball identity and complete manifest without committing the archive.
- A clean Node.js 24 consumer reproduced installation and the deterministic Core Path; the Alpha.29 comparison upgraded lock-only without changing sampled project-owned bytes.
- Independent QA independently reproduced the same package digest, complete manifest, browser result, clean consumer, and upgrade boundary before organizational closeout.

### Step 4 — publish the exact prerelease surfaces — completed

- The owner accepted the existing history recorded by WI-0165.
- WI-0166 reviewed every available GitHub Actions log, then published the repository and verified anonymous access.
- Required CI, review rules, vulnerability reporting, secret scanning, push protection, and Dependabot security updates are enabled in the public state.
- WI-0167 replaces the alerted optional adapter through a reviewed upstream pin and deterministic downstream security patch.
- The owner separately authorized the exact immutable tag, GitHub prerelease, and npm `next` package.
- WI-0167 built, verified, published, and independently retrieved the same Alpha.30 archive bytes. npm's forced first-version `latest` alias is recorded as an accepted platform constraint, not a stable-product claim.
- Observe early use before considering a stable release, deployment, or announcement.

## npm release boundary

The npm package is a separate identity, access, authentication, provenance, package-content, and rollback surface. WI-0167 authorizes only the completed Alpha.30 publication. WI-0168 introduces the future Release-only automation described in [npm release operations](../operations/npm-release.md) and [ADR-0050](../adr/0050-release-triggered-npm-trusted-publishing.md).

Before any later npm publication:

- qualify one new semantic version and exact revision;
- attach the exact candidate archive to a draft GitHub Release;
- make the Release prerelease flag agree with the package version;
- publish the Release only after reviewing its tag, target, notes, and asset;
- let the OIDC workflow fail closed on any metadata, verification, or byte mismatch;
- verify the registry version, dist-tags, integrity, provenance, and a clean consumer after publication.

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
