# WI-0149 Work Order

## Reader and decision

The repository owner needs one current, concise answer to three questions: what has already been qualified, what still blocks a first public Alpha, and which external actions remain separate Human decisions. The document must support a go/no-go discussion without presenting old candidate evidence as current release proof.

## Approved scope

- Replace `docs/planning/release-readiness.md` with a current readiness snapshot and staged preparation path.
- Distinguish the historical private `v0.1.0-alpha.5` GitHub prerelease, the latest semantic version tag, current `0.1.0-alpha.29` package metadata, and the absence of an npm package.
- Record `v0.1.0-alpha.30` only as the recommended next public candidate; changing the version remains a later Human decision.
- Separate completed foundations, candidate-specific evidence that must be repeated, Human publication decisions, deferred npm distribution, and stronger enterprise qualification.
- Retain `WI-0086` and its evidence as history. Do not reopen it or treat its earlier candidate as current qualification.

## Current observations

Observed on 2026-09-04 from private `main` at `79defd22aa4084720bfd92747211347e3bfa26de`:

- GitHub visibility is private.
- The only GitHub Release is the historical prerelease `v0.1.0-alpha.5`.
- The latest ordinary semantic version tag is `v0.1.0-alpha.27`; no `v0.1.0-alpha.29` tag or Release exists.
- `package.json` identifies `@zsz1210/temple-ai-dev-org@0.1.0-alpha.29` and retains `private: true`.
- The npm registry returns `E404` for the scoped package.
- `npm pack --dry-run --json --ignore-scripts` reports 364 files, 788,829 packed bytes, and 3,136,265 unpacked bytes. These bytes describe this observation, not a frozen future candidate.
- `npm audit --omit=dev --json` reports zero known vulnerabilities across all severities.
- The latest `main` GitHub Actions run `33854507459` passed the required Node.js 24 gate.
- Branch protection requires strict `Verify (Node.js 24)`, one approving review, Code Owner review, last-push approval, stale-review dismissal, and resolved conversations. Administrators are not included so the solo maintainer can perform an explicit admin merge after independent repository evidence.
- GitHub private vulnerability reporting and public-repository security controls are not currently qualified; they must be verified at the visibility transition.

## Acceptance criteria

1. A reader can identify the current release state and the next decision without reading historical CI chronology.
2. Every current claim is backed by repository metadata, a local package/audit observation, or live read-only GitHub/npm inspection.
3. Candidate-only tests are not called complete until repeated at the future exact revision.
4. No repository visibility, permission, package version, tag, Release, npm, or announcement mutation occurs.

## Design and risk

Use a short status card, four readiness groups, a gate table, and an ordered preparation sequence. Keep historical detail in `WI-0086` rather than duplicating it. The change is a reversible planning-document update with no release authority or external mutation.
