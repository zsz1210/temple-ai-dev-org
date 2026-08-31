# Engineering lesson: Validate external wire contracts before live integration

- ID: `LESSON-0003`
- Status: `candidate`
- Confidence: `high`
- Owner Position: not assigned
- Created: `2026-08-31T07:30:13.919Z`
- Last validated: not yet

## Summary

Before the first live external-service call, inspect current official documentation and the exact installed schema or discovery endpoint, define explicit internal-to-wire mappings, and test emitted requests against that independently recorded contract. Mocks that repeat implementation assumptions do not prove compatibility; unsupported values must fail before provider contact and protocol drift must not trigger automatic retries.

## Applicability

- solo
- collaborative

## Tags

- external-integration
- protocol
- contract-test

## Source Work Items

- WI-0055

## Derived Lessons

None recorded.

## Evidence

- .ai-org/artifacts/WI-0054/live-proof-result.md
- .ai-org/artifacts/WI-0055/protocol-research.md

## Authority boundary

This learning guides relevant work. It does not grant permission, change lifecycle state, or replace verification.

## Validation history

No revalidation recorded.
