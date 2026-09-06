# Exact available-source reuse

## Scope and authority

The maintainer approved the first context-minimization slice after WI-0203's negative cost result and source audit. This Standard work changes optional material delivery only. It preserves authority, freshness, source safety, bootstrap obligations, independent verification and existing defaults. No model experiment, historical evidence mutation, merge or release is included.

## Decision

Implement a deliberately narrow first slice: `context enter --available-whole-sources JSON_ARRAY`. Each record has exactly `path` and `sha256` (the `sha256:`-prefixed digest of the complete source). Supplying the option explicitly asserts that these complete bodies were read and remain available in the current caller context. It is not proof of reading or comprehension, and must not be persisted or reused across fresh sessions. Empty/default input retains original output.

All current source acquisition, safety, drift and eligibility checks run before material suppression. Only a currently selected whole-source representation with an exact digest match can omit its body. A stale or unselected declaration never suppresses content and is reported. Structured projections cannot masquerade as a read of the whole original source. Recovery does not suppress material. Invalid or duplicate declarations fail input validation. The emitted packet uses an explicit v3 schema only for an opted-in reuse request, labels caller-attested availability, preserves provenance, and binds availability to its digest. Changed reuse input invalidates a previous entry preview.

The default selection of authority sources and historical gate evidence is unchanged in this slice: changing those semantic read obligations requires a separate reviewed selection contract. This avoids mixing redundancy elimination with authority-selection changes in the next measurement.

## Acceptance and tests

- Default output remains unchanged; no source read is waived.
- Exact whole-source availability reduces emitted bytes and retains source provenance.
- Changed, unselected, projected, duplicate, malformed and unsafe declarations cannot hide required text.
- Required missing/unreadable sources still fail acquisition; fallback still carries no packet.
- Authority changes and invalid actors still fail existing eligibility checks.
- Changed availability invalidates expected-plan binding; no canonical mutation.
- Installed CLI tests and full `npm run verify` pass before developer handoff.

## Risk and stop

Caller assertions cannot establish actual context residency; never auto-generate them from filesystem hashes alone. Unknown residency means omit the option. This is a transmission optimization, not an efficiency claim. Stop at Developer evidence and handoff; distinct QA remains pending until independently performed. A later controlled comparison must use a newly bound protocol.

## Ownership

Developer source scope: src/context-packet.mjs, src/context-enter.mjs, src/cli.mjs, test/context-enter.test.mjs. This design and verification evidence live only under WI-0206. Work occurs on an isolated successor of 87d68a1; WI-0203/0205 and all labs remain unchanged. No parallel workers are dispatched.
