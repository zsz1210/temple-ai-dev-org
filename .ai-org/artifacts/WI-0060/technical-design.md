# WI-0060 technical design

## Data boundary

Do not add a model field to Agent Identity, Assignment, Membership, or Position schemas. Team overlays execution telemetry from the existing bounded control-plane snapshot:

- registered task metadata from `live_observer.work.items[].tasks`;
- correlated model evidence from `usage.driver_groups` when task-local usage is absent;
- task freshness and Work Item/task identifiers for provenance.

This keeps organization state canonical and model state observational.

## Resolver

Add one deterministic, side-effect-free `agentModelStatus(snapshot, agentId)` export and inject the same function into the browser document. It returns one of:

- `active`: a live, nonterminal task has an observed model;
- `observed`: correlated effective/provider evidence exists but is not currently active;
- `requested`: canonical task registration records a request but no effective evidence;
- `unknown`: neither observed nor requested model evidence exists.

The resolver ranks `active > observed > requested > unknown`, then selects the newest observation inside a rank. It keeps `requested_model` separately and includes it only when it differs from the selected observed model.

## Rendering

`renderOrganizationAgents` receives the full snapshot in addition to the organization projection. Each Agent card renders:

- a state label;
- model identifier or `Not observed`;
- optional reasoning effort;
- optional differing requested model;
- Work Item/task provenance and observation time when known;
- neutral explanation for requested-only and unknown states.

No new control, API route, persistence, provider call, or private-viewer field is added.

## Verification

- Unit-test precedence and all four result states with representative snapshots.
- Assert the generated HTML contains the model labels and resolver.
- Run the focused control-plane test file and `npm run verify`.
- Review Team in a real browser at wide desktop, tablet, and mobile widths.
- Confirm the LAN page contains no Agent Commands navigation or mutation controls.

## Risk review

- **False permanence:** mitigated by deriving the panel per snapshot and using execution-state labels.
- **Requested/effective confusion:** mitigated by separate fields and requested-only copy.
- **Stale history shown as active:** mitigated by requiring live visibility plus a nonterminal observed status for `active`.
- **Missing evidence shown as a model default:** mitigated by explicit `unknown` state.
- **Privacy regression:** no prompt, raw event, credentials, or new snapshot fields are introduced.
- **Responsive overflow:** model/task strings wrap and browser widths are verified.

