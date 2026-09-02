# Risk Review — WI-0091

## Primary risks

| Risk | Consequence | Mitigation |
| --- | --- | --- |
| Historical evidence is presented as live capture | Operators trust an incomplete total | Capture health is derived from current Provider readiness and live task topology, not observation count alone. |
| Ready Provider is presented as actively collecting without an eligible task | False expectation that totals will move | Use a separate `ready-no-live-task` state. |
| Coverage is confused with qualification | One observed Work Item appears sufficient for model or savings decisions | Completed-work coverage and qualification remain separate fields and separate UI copy. |
| Missing usage is estimated | Fabricated measurements contaminate later analysis | Accept only detailed Provider usage events; missing remains unknown. |
| Private viewer receives local authority or sensitive payloads | Security and privacy regression | Add only aggregate fields already safe for the private snapshot; retain existing private redaction and GET-only tests. |
| Explicit opt-in is silently removed | Unexpected local Provider process or task access | Do not change Provider defaults; real validation uses an explicit runtime flag. |
| Real validation creates unbounded usage | Avoidable Credits consumption | One short Luna turn, no retry, capture-only outcome, and immediate stop after the first terminal result. |
| Old consumers depend on `observed` preflight status | Alpha compatibility regression | Add `evidence_status`, document the state change, and cover all new states in focused tests. |

## Decision

Proceed with a sequential implementation. The change is local, reversible, read-only in the browser, and bounded to truthful observability. Public release, automatic routing, pricing, and external access remain excluded.
