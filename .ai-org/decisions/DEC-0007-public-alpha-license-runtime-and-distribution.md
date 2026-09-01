# Decision Ledger

## Decision

- ID: DEC-0007
- Status: accepted
- Date: 2026-09-01
- Owner position: Human Principal, Product Manager, and Tech Lead
- Work item: WI-0085

## Context

The first public Alpha needs an honest runtime promise, a reviewed distribution boundary, and a license decision. The repository currently uses MIT, promises an end-of-life Node.js floor, packages development state by default, and references GitHub Actions by movable tags.

## Decision and rationale

Retain MIT for the first public Alpha because Temple currently prioritizes low-friction adoption, has no evidenced patent-policy requirement, and already distributes its own source under MIT. Review Apache-2.0 again before a stable release if contributors, organizational adopters, or legal review require explicit patent-license and retaliation terms.

Support Node.js 22 and 24 LTS. Treat Node.js 24 as primary and Node.js 22 as the compatibility floor. Do not promise Node.js 26 while it remains Current; reconsider it after the LTS transition and exact-candidate tests.

Distribute only the runtime, project overlay, framework packs, and public documentation through an explicit package allowlist. Keep npm publication disabled until a separate release decision. Pin CI Actions to immutable revisions.

## Authority boundary

This decision authorizes repository-local hardening and verification. It does not authorize making GitHub public, enabling or changing GitHub settings, publishing npm, creating a Git tag or GitHub Release, sending an external announcement, or accepting an unreviewed contributor policy.

## Revisit triggers

- Node.js 26 reaches LTS and passes the supported matrix.
- Public contributors require a different inbound contribution or patent policy.
- Enterprise adoption introduces a documented patent or notice requirement.
- npm becomes the approved first distribution channel.
