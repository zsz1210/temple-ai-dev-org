# Independent QA report — WI-0124

## Result

**Pass.** No in-scope public execution-resolver closure discrepancy was found.

Independent QA was performed by `agent-lulu`, distinct from Developer `agent-rikku`.

## Revisions

- Implementation candidate: `0e32149b98e5984b45dac15ec33e8fa99d98e63c`
- Clean QA handoff: `7b5caf1f72d8e65ea144127ed3cb4c5d4d5d81b2`
- Window: `2026-09-03T04:20:40Z` through `2026-09-03T04:26:45Z`

The candidate is an ancestor of the handoff revision. Candidate-to-handoff changes are limited to lifecycle, evidence, and generated-view files; runtime source, tests, schemas, overlay, documentation, and `temple.lock` are blob-identical.

## Independent adversarial evaluation

| Area | Evidence | Result |
| --- | --- | --- |
| Request object closure | All eight managed `additionalProperties: false` boundaries plus missing selection were rejected by Request Ajv, semantic validation, and the resolver before output | Pass |
| Timestamp closure | 18 invalid timestamps, including expanded years, offsets, noncanonical forms, invalid dates, null, and number, were rejected before output; seven canonical/default UTC values passed | Pass |
| Capability grammar | 16 invalid required and optional capability identifiers were rejected at all Request and resolver boundaries | Pass |
| Route validator totality | 14 malformed or missing resource-collection probes returned invalid without throwing | Pass |
| Semantic and structural contradictions | 17 semantic contradictions and 17 managed-schema structural counterexamples were rejected | Pass |
| Positive compatibility | 24 representative Routes passed both managed Ajv and semantic Route validation | Pass |
| Explicit projection | Three non-enumerable projection-defense values were absent from emitted Task Shape and resource objects | Pass |
| Cross-product closure | 864 accepted policy, request, and option combinations produced Routes accepted by both Route validators | Pass |
| Historical repairs | Reason precedence, provenance, mapping, authority, hard-filter ordering, fallback, resource, multi-step, policy-source, and media-extension cases remained correct | Pass |

Pinned unknown-required precedence remained deterministic: existing eligible or otherwise-ineligible pins produced `pinned-profile-ineligible`; a missing pin produced `pinned-profile-not-found`; every case remained unresolved with no selected profile or fallback.

## Repository gates

- Focused route and installation suite: 23 passed, zero failed.
- Full `npm run verify`: 331 passed, zero failed, skipped, cancelled, or TODO.
- Schema validation: 148 documents across 33 schemas valid.
- Doctor: 36 pass, one known stale parallel-plan warning, zero fail.
- Managed and overlay Request digest: `be8bcea41d700ad0a6088a26d85f7ee7c591fa21968f998a9624221cdb813d9b`.
- Managed and overlay Route digest: `97b2f77fbd1811e39c2d4b346b1f9fa9f74398ead0b9f21ca4609586b371013d`.
- Final QA working tree: clean at handoff revision `7b5caf1f72d8e65ea144127ed3cb4c5d4d5d81b2`.

The full verification and Doctor commands were repeated once only to retain their final output; the captured passing runs are the cited evidence.

## Authority boundary

The resolver remained advisory-only. Independent QA performed no Provider contact, model execution, automatic routing, file or lifecycle mutation, push, merge, deployment, publication, or release.
