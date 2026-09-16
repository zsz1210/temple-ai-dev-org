# Alpha.33 publication work order and design

The user approved the immediately preceding recommendation: reconcile existing
publication-surface findings, then publish the exact Alpha.33 candidate. This
authorizes the bounded prerequisite repairs, ordinary PR integration, GitHub
prerelease and npm next publication, and clean registry verification. It does not
authorize npm latest changes, hosting/permission changes, real downstream upgrades,
paid model experiments or history rewriting.

Base: 5106bf13c0dc006f60d227ee2156e15d88c8ea52. Developer Rikku; distinct QA Lulu;
release coordination Mog, Principal human. Standard publication profile.

## Acceptance and design

- Preserve the qualified Alpha.33 archive SHA-256
  03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2.
- Replace one historical helper's machine-specific import with its equivalent
  repository-relative import. Reword two already-redacted placeholder references
  so the value-blind scanner no longer mistakes them for actual home paths.
  Retain original bytes in Git and record before/after digests and evidence impact.
- Classify all 110 binary reminders by exact digest: 68 unchanged PNGs match
  WI-0160's rendered/OCR/metadata review; inspect one new screenshot and 41 compressed
  evidence files. Inspect archive structure and expanded text without executing any
  archive member or printing credential-like matches. Reuse existing normalized
  public-member provenance where hashes match. Preserve any unresolved finding.
- Leave audit rules and historical evidence intact. A manual digest-bound review
  complements binary-review reminders; it does not make the scanner claim safety.
- Run full release-candidate verification and distinct QA. Repack to byte equality,
  merge via ordinary CI, review a draft Release tag/target/asset/prerelease flag,
  then publish under this user approval. The unchanged Release-only workflow runs
  its own full verification and archive comparison before npm OIDC upload.
- Verify registry version, integrity, next/latest channels and a clean package
  installation with CLI/init/Doctor. Stop after publication evidence and report.

## Rollback and failure

Before publication, retain or withdraw the draft and repair only within approved
scope. Never bypass failing verification, change npm credentials/trusted publisher,
silently replace a published tag/version or rerun a successful publication.
After an immutable upload, a defective version requires a separately reviewed
successor/deprecation decision; no production or real-project rollback is implied.

No public package files, dependency versions or framework behavior are planned to
change. Documentation is limited to evidence and release notes outside npm contents.

## Expanded evidence review findings

The completed bounded archive inventory found twelve public copies with local
paths or owner/AppleDouble metadata. Their exact affected paths and original hashes
are declared in normalization-plan.json. This necessary publication cleanup remains
within the user-approved reminder reconciliation; no other active Work Item overlaps.
The CLI cannot append affected paths after creation, so retain the exact additional
scope here rather than hand-edit canonical Work Item JSON.

Preview: 2766 repeated home-path occurrences, four email literals and 47 AppleDouble
records; zero affected active normalized Evidence registry entries. Redact only
those text values and remove auxiliary metadata/owners. Original history and all
before/after member hashes remain available; do not rewrite prior verdicts.

The first inventory attempts rejected non-UTF8 AppleDouble members and directory
entries before modifying anything. The corrected reader explicitly identifies
non-text members for review and permits only safe directories/regular files.
It neither extracts nor executes content. The new screenshot shows only synthetic
Work Items and public framework labels; rendered inspection found no private values.

## Packaging recovery after the first Release attempt

See compression-recovery.md for the observed environment-dependent gzip mismatch.
The original exact-gzip goal could not pass the unchanged hosted byte gate. Retain
that archive as a named reference; the recovery qualifies an official-Node gzip
whose complete decompressed tar is byte-identical, without changing the published
source tag or replacing any npm version. This explicit packaging correction stays
within the authorized release repair and is not a new product change. The final
asset and registry must match the newly qualified gzip exactly; original hashes
and the failed workflow remain visible. No verification gate is waived.

Final publication and acceptance observations are in closeout.md and
completion-checks.md; registry-smoke.json proves the successfully retrieved
qualified package, intended next channel and unchanged latest channel.
