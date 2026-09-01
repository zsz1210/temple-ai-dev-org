# Technical design — WI-0081

## Change boundary

`src/control-plane-dashboard.mjs` remains the only production implementation surface. The existing server, Observer, provider, redaction, request classification, snapshot, and SSE contracts remain unchanged.

## Data flow

1. The server renders only the shell and access-mode flags.
2. The browser loads `/api/v1/snapshot` with `cache: no-store`.
3. View renderers consume canonical and observed fields without manufacturing missing semantics.
4. `/api/v1/events` schedules a coalesced snapshot refresh.
5. Private viewers continue to receive cursor-only refresh events and redacted snapshots.

## Presentation mapping

- Overview: current actionable conditions, open delivery movement, and bounded operating metrics.
- Work: one searchable/filterable inventory plus selected-item details derived from the selected Work Item.
- Team: Position-first responsibility lanes and a People & Agents directory derived from `observer.organization`.
- Usage: observed Token composition, evidence coverage, driver attribution, and an explicit insufficient-evidence state.
- System: human-readable status plus view-only configuration sourced from project/snapshot fields that are actually present; unavailable facts remain unavailable.
- History: terminal Work Items and the occurrence-aware timeline with bounded search/filter behavior.

## State preservation

DOM refreshes preserve active destination, selected Team tab, selected Work Item when still present, filter values, open disclosures, and focused command controls. Recreated controls never imply successful mutation.

## Security and authority invariants

- No session secret in private HTML.
- No Inbox or Agent Commands markup in private HTML.
- No private mutation client or POST path.
- No expansion of data fields returned by `privateViewerSnapshot`.
- No automatic command retry or remote control.

## Verification

Focused renderer/private/inbox tests run before the full suite. Runtime browser review uses real repository state and checks desktop, tablet, mobile, reduced motion, keyboard semantics, refresh behavior, console output, and overflow.
