# Alpha release readiness

> **The source repository is public.** A tagged GitHub Alpha, npm package, deployment, and announcement remain separate release surfaces that still require their own gates.

Last refreshed: 2026-09-05

Current roadmap stage: [Real-world qualification](roadmap.md#4-real-world-qualification--current)

Release target: a narrowly described public Alpha, not `1.0` or production qualification

## Current answer

Temple now has a public source repository, but it does **not** yet have a tagged current Alpha or an npm release.

- The existing repository became public after the owner explicitly accepted the historical metadata quantified by WI-0165 and WI-0166 verified all available GitHub Actions logs.
- A historical private GitHub prerelease, `v0.1.0-alpha.5`, exists. It is not the current recommended build.
- The latest ordinary semantic version tag is `v0.1.0-alpha.27`.
- `package.json` and the self-host lock now identify the internal `0.1.0-alpha.30` candidate, but there is no matching tag or GitHub Release.
- `@zsz1210/temple-ai-dev-org` does not exist in the public npm registry, and `private: true` prevents accidental publication.
- `WI-0163` froze the claim and version boundary at technical candidate `a6849519c6067b2f73ca1a44d556faf7a5168b1d`. `WI-0164` built and qualified the exact archive from that commit; publication decisions remain open.

The approved internal candidate version is `v0.1.0-alpha.30`. That version decision does not authorize repository visibility, a tag, a GitHub Release, npm publication, deployment, or announcement.

## Release surfaces

| Surface | Current truth | Next action |
| --- | --- | --- |
| GitHub repository | Public at `879bcd6e`; anonymous API, Git, README, and License access verified | Keep public and observe the source surface |
| Branch protection | Reverified after publication: strict required Node.js 24 check, one approval, Code Owner review, last-push approval, stale-review dismissal, and resolved conversations | Keep enabled and monitor public contributions |
| GitHub Release | Historical private `v0.1.0-alpha.5` prerelease only | Decide how to label that history, then create a new Release only after the exact tag is approved |
| Package metadata | `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30`, `private: true`; the earlier exact archive is retained evidence, but public-state documentation changed the package bytes | Build and requalify one new exact npm candidate before publication |
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

These observations span the private qualification work and the later public-source verification. Each result remains bound to its named revision and release surface.

- Required `main` CI run [`33854507459`](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33854507459) passed the Node.js 24 repository gate.
- The unpublished archive built from `54d14f4e94a930719ca7674ebf1ad74be89de7ac` contained 374 entries, 804,392 packed bytes, and 3,192,729 unpacked bytes; its SHA-256 was `43cefd40bcb5d21a3159419eb89d31d691f0ac81a9489a38a4b4824ad5cf2f0b`.
- `npm audit --omit=dev --json` reported zero known vulnerabilities across all severities.
- The WI-0158 fresh-session delivery and separate cold recovery completed without Human intervention. QueueKeep reached accepted closeout with distinct Developer and Independent QA identities, two passing application tests, Doctor 37/0/0, and a clean read-only recovery. Token totals remained unavailable.
- WI-0159 privacy-normalized the current copies of the affected WI-0155 and WI-0156 artifacts while retaining their original revision-pinned Git evidence. WI-0160 reviewed all 68 PNGs at their current digests and found no restricted values or embedded text/EXIF payloads; it also classified 334 text occurrences. WI-0161 reduced the 245 canonical-state occurrences to zero while preserving Evidence identity and artifact references. WI-0162 resolved the remaining 89 current-tree text occurrences: 70 retained-artifact values were normalized through a revision-bound plan, 18 first-party fixture literals were replaced without removing behavior coverage, and the unchanged Archify security fixture is allowed only at its installed-manifest digest. Clean-worktree Independent QA passed all 443 tests at exact candidate `9012ece9e1ff3871f8e24bfc68ec79f77060d5a8`. WI-0165 subsequently quantified the remaining historical-Git privacy decision.
- WI-0164 built `zsz1210-temple-ai-dev-org-0.1.0-alpha.30.tgz` from exact candidate `a6849519c6067b2f73ca1a44d556faf7a5168b1d`. It contained 380 files, 819,744 packed bytes, and 3,254,381 unpacked bytes; SHA-256 was `8f93462cdea25068920279740450a72977f1a82b375fbf82bb26dac54aa36c95`.
- WI-0165 scanned all 7,870 text blobs reachable from `main`, nine tags, and 42 GitHub pull-request heads. It found no credible credential exposure or inspection failure. It did find 3,745 historical local-environment and email occurrences across 738 blobs and 158 paths, all already reachable from `main`; 114 PNG/SVG blobs were explicitly excluded from content review. The owner accepted that history. WI-0166 then scanned all 167 available Actions-run archives, 464 log files, and 16,486,283 log bytes without finding a credential, email, home path, private IP, Tailnet hostname, binary log, or read failure.
- After publication, Secret Scanning and Push Protection reported zero alerts; private vulnerability reporting and Dependabot security updates are enabled. Dependabot identified six high-severity advisories for `fast-uri` in the development lockfile of the pinned optional Archify adapter. That adapter is outside the npm package, but the alerts require an upstream-compatible update or evidence-backed disposition before the tagged Alpha and npm publication.
- The exact candidate passed all 443 tests, 188-document schema validation, the installed-Chrome browser gate, dependency audits with zero known vulnerabilities, and the public repository/package audit with zero blockers. Its one Doctor warning was the expected stale generated parallel plan at the historical Work Item revision.
- A clean Node.js `v24.20.0` consumer installed the exact local tarball and passed version, first init, idempotent re-init, installed launcher, status, and Doctor. A separate Alpha.29 fixture upgraded lock-only while 15 sampled project-owned digests remained unchanged.
- The historical Alpha.29 work and its earlier package, installation, browser, upgrade, and hosted observations remain available in `WI-0086`. They are history, not qualification for this candidate.

The exact local package bytes, manifest, consumer result, audits, test count, and browser result are now captured. Public-hosting controls must still be checked after any separately approved visibility change.

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
| Clean consumer | Node.js 24 exact-tarball path passed | Public registry recovery remains unavailable until separately published |
| Upgrade safety | Alpha.29-to-.30 lock-only upgrade passed; 15 project-owned digests unchanged | Repeat only if the candidate or migration boundary changes |
| Dependency and secret review | Secret alerts are zero; six high Dependabot alerts affect the optional Archify development lockfile outside the npm package | Update the pinned adapter or record an evidence-backed disposition before tag/npm release |
| Evidence publication boundary | Existing history accepted; all available Actions logs reviewed; public anonymous access verified; media remained explicitly excluded | Preserve the recorded limits and review any new publication surface independently |
| Fresh-session clean-room path | Passed at the pre-freeze revision | WI-0158 completed one bounded Work Item and a separate repository-only recovery without maintainer coaching; repeat only if later candidate changes affect the Core Path |
| Rollback | Earlier procedure exists | Bind withdrawal or superseding-release instructions to the approved immutable tag |
| Publication authority | Repository visibility granted and exercised | Separate Human approval remains required for the immutable tag, GitHub Release, and npm publication |

## Decisions reserved for the repository owner

The following choices cannot be inferred from passing tests:

1. Whether the historical `v0.1.0-alpha.5` prerelease should remain as-is or be relabeled as an early internal preview.
2. Whether the exact tag and GitHub Release may be created after the current dependency alerts are dispositioned.
3. Whether and when npm distribution may be enabled.
4. Whether an announcement should be made and what claims it may contain.

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

### Step 4 — make publication decisions separately

- The owner accepted the existing history recorded by WI-0165.
- WI-0166 reviewed every available GitHub Actions log, then published the repository and verified anonymous access.
- Required CI, review rules, vulnerability reporting, secret scanning, push protection, and Dependabot security updates are enabled in the public state.
- Resolve or formally disposition the six optional-adapter development alerts.
- Review the final evidence and separately authorize the immutable tag and GitHub Release.
- Observe the first users before deciding whether npm is needed.

## npm remains a later distribution decision

The first public Alpha can be source-first through GitHub. npm adds a second identity, access, authentication, provenance, package-content, and rollback surface, so it should not be coupled to the first GitHub Release by default.

Before any npm publication:

- confirm the final scoped package name;
- remove `private: true` only in an explicitly approved publication candidate;
- rebuild and requalify the archive because the public-state documentation changed package bytes after WI-0164;
- update the pinned optional Archify adapter or record an evidence-backed disposition for its six `fast-uri` alerts;
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
