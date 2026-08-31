# Decision Ledger

## Decision

- ID: DEC-0004
- Status: accepted
- Date: 2026-08-31
- Owner position: Product Manager and Tech Lead
- Work item: WI-0076

## Context

Temple's Collaborative foundation already records Human Principals, sponsorship, Position pools, Disciplines, claims, and an honest not-run real-environment gate. It does not yet distinguish personnel lifecycle, membership qualification, Human Authority Grant, bootstrap retirement, configurable recovery, local actor binding, or simulated versus real validation. The current Team structure also places one Human Principal above every Position, which reads as a hierarchy when several people use the project.

The framework must support Solo, company, and OSS participation without using email as identity, treating job title as authority, requiring a fixed team size, or promising a distributed lock.

## Decision and rationale

Adopt a versioned collaboration v2 contract while retaining v1 compatibility until an explicit project migration. Keep Human Principal, Agent Identity, Position, Discipline, Position Membership, default Assignment, Work claim, Human Authority Grant, and Git-hosting permission separate.

Use immutable IDs and lifecycle status; allow duplicate human display names; preserve sponsorship and offboarding history. Store the current clone's actor binding below the Git common directory and label its verification provenance without claiming Temple performed provider authentication.

Use a temporary Bootstrap Owner only to establish initial scoped grants and recovery. Retirement is irreversible and requires viable distributed governance; no permanent backdoor remains. Recovery trustee count and threshold are project configuration, not a hardcoded two-of-three rule.

Keep Team human-facing and read-only with Responsibilities, People & Agents, and Authority views. Remove the single Human Principal apex. Keep live claims and execution details in Work. Redact Principal, sponsorship, grant-holder, trustee, and binding detail from the private viewer.

Split automated, simulated, real Collaborative, representative pilot, and High-Assurance validation. Repository coordination promises conflict visibility, no silent canonical loss, and recoverability; it does not promise remote atomic claim prevention.

## Rejected alternatives

- Email or display-name uniqueness as durable identity.
- One permanent Human Principal or bootstrap superuser above the organization.
- Job-title-derived grants.
- Silent low-risk governance expansion.
- A fixed four-person, three-person, or other example-sized product model.
- Treating local clones or one person on two machines as real multi-human evidence.
- Adding a provider-specific verifier or distributed coordination service without a separate adapter decision and evidence.

## Consequences

- Fresh init writes collaboration v2; old project state is preserved until explicit migration.
- CLI and Doctor gain lifecycle, qualification, grant, recovery, identity-provenance, and validation checks.
- Team becomes more useful for Collaborative and High-Assurance profiles without changing its navigation route.
- Real multi-human validation remains `not_run` after this implementation; local simulation may pass only its own gate.
- A future remote coordination or provider-verification adapter requires a separate ADR, threat model, pinned contract, and tests.

## Revisit triggers

- Representative cross-machine claim collisions justify a remote coordination backend.
- A provider offers a stable signed local actor assertion suitable for an optional adapter.
- Real team evidence shows that grant categories or qualification scopes are too broad or too narrow.
