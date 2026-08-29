# ADR-0006: Use the CLI for lifecycle mutation and a registry for Codex tasks

- Status: Accepted
- Date: 2026-08-29

## Context

The first English Learning Inbox pilot showed that repository canonical state can carry work from Developer to Independent QA. However, work items, events, and release closeout still required manual editing, and Codex task IDs were not formally linked back to work items. Relying on chat titles alone can still cause duplicate work, incorrect handoffs, and sidebar clutter.

## Decision

Temple provides `work-item create`, `handoff`, `transition`, and `close` as the lifecycle mutation boundary. A transition must provide an evidence reference for every named workflow requirement. The CLI rejects invalid edges and missing gate evidence.

Codex tasks and threads are registered in `.ai-org/project/tasks.json` with a stable task ID, work item, Position, Agent, thread or client-thread ID, revision, and status. Titles use only the reproducible suggested format `WI-#### · Position · Agent Name`; the actual identifiers are the work item ID and thread ID. Temple calculates archive readiness but does not directly create, rename, or archive Codex app tasks.

## Consequences

- A new conversation can recover work from the work item, registry, and exact revision without depending on a title or chat memory.
- Manual JSON drift and skipped gates become less likely, but the user or Agent must explicitly provide evidence mappings.
- Actual Codex app task mutations still use product tools and follow user authorization; the CLI only maintains the canonical registry.
- The Observer can identify blocked, attention, and archive-ready states, but cannot make decisions for the Manager, QA, or Release Manager.
