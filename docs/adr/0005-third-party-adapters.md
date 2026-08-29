# ADR-0005: Keep third-party capabilities behind an adapter boundary

- Status: Accepted
- Date: 2026-08-29

## Context

Tools such as Archify can improve architecture communication, but making them core state or implicit dependencies increases supply-chain, upgrade, and portability risk.

## Decision

Third-party capabilities use opt-in adapters: pin the version and commit, record the license, constrain inputs and outputs, and prohibit changes to canonical state or gate approvals. Phase 1 defines only the Archify contract and does not install it.

## Consequences

The visualization can be replaced or disabled while the text and JSON workflow continues to work in full.
