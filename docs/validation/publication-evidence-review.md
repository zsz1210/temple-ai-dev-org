# Publication evidence review

Status: review complete; canonical-state normalization implemented and dogfooded, exact-candidate assurance pending

Work Item: `WI-0160`

This review answers a narrow question: what remains in Temple's current tracked evidence surface after blocked private values were removed, and what must happen before the repository owner considers public visibility?

## Result

The public-profile audit reports zero blocked findings on both repository and package surfaces. `WI-0161` reduced the canonical-state queue from 245 occurrences to zero through a stale-safe, field-aware operation. The remaining repository queue consists of:

- 85 retained-legacy text finding records, representing 89 matched occurrences outside canonical state;
- 68 PNG files requiring content review.

All 68 PNGs passed this review at their recorded SHA-256 digests. The remaining text findings still need retained-artifact normalization or an explicit fixture disposition. The repository is therefore better understood, not yet declared ready for publication.

## Text findings

| Area | Finding records | Occurrences | Files | Recommended treatment |
| --- | ---: | ---: | ---: | --- |
| Canonical Work Items and project registries | 245 | 245 | 50 | Add a supported Temple migration; do not hand-edit canonical JSON |
| Retained self-host artifacts | 70 | 70 | 59 | Normalize current-tree copies with revision-pinned provenance |
| First-party test fixtures | 14 | 18 | 2 | Replace maintainer-shaped values with unmistakably synthetic fixtures |
| Pinned Archify test fixture | 1 | 1 | 1 | Record a vendored-fixture disposition or update the pinned dependency; do not patch vendored code casually |
| **Total** | **330** | **334** | **112** | |

The first row is now resolved in the current tree by `WI-0161`; it remains in the table as the original review baseline. The implemented command normalized 315 fields across two exact plans: released claim worktrees, terminal worker and task worktrees, twelve Evidence-detail values, and one allowlisted Work Item description. Evidence IDs, revisions, artifact paths, and artifact digests remained unchanged.

By rule, the queue contains 279 home-path occurrences, 49 private-address occurrences, and six private-Tailnet-host occurrences. The new inventory retains paths, line numbers, rule classes, and counts, but never copies the matched value or source-line text.

The largest cluster is durable lifecycle history: 187 values occur in historical claim entries and 40 in the current claim field of terminal Work Items. That is why a mass search-and-replace would be the wrong fix. Temple needs a schema-aware maintenance operation that preserves claim identity, branch, revision, timestamps, and release history while minimizing machine-local location data.

## Binary review

All 68 tracked binaries are PNGs: 21 retained artifact images and 47 real-browser screenshots. Together they occupy 15,455,256 bytes.

Every image was included in an ordered contact-sheet inspection. Dense command, configuration, and workflow views also received original-size inspection. Apple Vision OCR found no home path, maintainer identifier, private address, Tailnet hostname, email address, or live account-state value. Five command-gateway screenshots contain generic credential-warning copy; that is safety guidance, not a credential. PNG chunk inspection found no embedded text or EXIF payload in any file.

The images may remain at their current digests. Any changed image bytes require a new review.

## What Temple can automate safely

- Rebuild the value-redacted finding inventory.
- Verify audit totals, file paths, line numbers, rules, binary digests, dimensions, and metadata.
- Detect drift when a reviewed binary changes.
- Apply a future schema-aware canonical-data migration after that behavior has its own tests and review.

## What remains separate

1. Complete exact-candidate Independent QA for `WI-0161`.
2. Normalize retained artifacts with provenance manifests.
3. Replace first-party maintainer-shaped fixtures and document the pinned vendored fixture's disposition.
4. Repeat the public audit at the frozen candidate.
5. Let the repository owner decide whether already-shared historical Git objects are acceptable and, separately, whether repository visibility may change.

No version, tag, GitHub Release, npm publication, announcement, visibility change, or Git-history rewrite was authorized or performed by this review.

## Reproduction

```bash
node ./templew.mjs publication audit . --profile public --surface both --json
node ./.ai-org/artifacts/WI-0160/verify-review.mjs
node ./.ai-org/artifacts/WI-0161/verify-canonical-normalization.mjs
npm run verify
```

Machine-readable evidence:

- [Text inventory](../../.ai-org/artifacts/WI-0160/text-inventory.json)
- [Binary review](../../.ai-org/artifacts/WI-0160/binary-review.json)
