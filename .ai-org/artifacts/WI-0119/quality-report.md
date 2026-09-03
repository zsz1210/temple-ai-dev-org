# WI-0119 Quality evaluation

## Result

Pass for candidate `d5862757d29d77ef77d2d833350aa20ddd62a4f4`.

The Quality & Evaluation Engineer evaluated the implementation against every WI-0119 acceptance criterion. The focused matrix passed 25 tests with zero failures, skips, or cancellations; the Developer's exact-revision full suite separately passed 325 tests.

## Acceptance analysis

| Criterion | Evidence | Result |
|---|---|---|
| Responsibility is separate from execution configuration | Position and Agent schemas are unchanged; multi-step tests vary task kind and risk independently of Position identity | Pass |
| One Work Item supports independent step routes | Three-step WI-0119 request resolves architecture, implementation, and Independent QA separately | Pass |
| Deterministic, explainable, non-executing result | First-rule and explicit preference behavior, canonical duplicate-match rejection, stable reasons, and false authority constants are tested | Pass |
| Required policy constraints filter before preference | Capability, modality, Provider, data class, execution boundary, risk, and resource ceilings all reject before selection | Pass |
| Missing evidence remains honest | Unavailable resource observation requires `null`; requested and effective model fields stay separate | Pass |
| Extension is not software-role-bound | Content-production fixture adds media capabilities, a local profile, and `video_producer` without changing core Positions | Pass |
| Init, upgrade, schema, Console, and package compatibility | Fresh init, preserve-on-upgrade, semantic request validation, compact viewer allowlist, and package checks pass | Pass |

## Adversarial checks

- Unknown required capability fails closed; unknown optional capability is reported but does not block an eligible route.
- Ineligible pinned selection never falls back silently.
- An unmatched rule uses only the named fallback and only when the fallback passes hard filters.
- A lower-preference profile can win only after the higher preference exceeds an explicit resource ceiling.
- A repository-relative request cannot escape through a symlink.
- Quoted command-like task data remains inert and creates no filesystem effect.
- The Console displays policy counts but exposes no editor, launch control, Provider contact, or mutation route.

## Limits

This evaluation proves the local deterministic contract and truthful human projection. It does not compare real model quality or cost, validate automatic execution, prove every future Provider mapping, or authorize a live Provider call. Those remain later evidence questions.
