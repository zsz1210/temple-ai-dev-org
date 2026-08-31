# WI-0065 technical design

## Data contract

`temple.tasks/v1` remains the schema identifier for backwards compatibility. New task fields are nullable:

| Field | Meaning | Allowed provenance |
|---|---|---|
| `requested_reasoning_effort` | exact `turn/start.effort` requested by Temple | canonical request |
| `observed_thread_reasoning_effort` | top-level `thread/start.reasoningEffort` | Provider thread acknowledgement |
| `effective_turn_reasoning_effort` | Provider acknowledgement tied to one turn | Provider turn acknowledgement; unavailable today |
| `reasoning_effort` | legacy compatibility projection | selected by the precedence below |
| `reasoning_effort_source` | provenance for the compatibility value | `provider-turn`, `provider-thread`, `canonical-requested`, or `unknown` |

Compatibility precedence is effective turn, observed thread, requested turn, then unknown. Precedence preserves old displays while the source prevents the compatibility value from being mislabeled. Legacy documents that contain only `reasoning_effort` remain valid and project that value as legacy/unknown provenance rather than silently rewriting canonical state.

## Provider flow

1. Normalize and validate the requested effort before Provider contact.
2. Read thread reasoning only from top-level `thread/start.reasoningEffort`.
3. Register both values before `turn/start`.
4. Do not derive effective-turn effort from `turn/start` acceptance, token usage, output, or the thread response.
5. Return all provenance fields from the launch result.

## Usage flow

Usage attribution carries the three explicit fields and the source-labeled compatibility projection. Missing-dimension quality evaluates `effective_turn_reasoning_effort` as optional protocol coverage rather than converting it to zero or a guessed value. Grouping continues to include the compatibility dimension for old consumers while the new fields are available for analysis and drill-down.

## Human surface

Team cards show three short facts when available:

- `Requested turn · max`
- `Thread reported · xhigh`
- `Effective turn · Not observed`

The language describes evidence, not internal field names. Model status, task identity, and last observation remain unchanged.

## Migration and ownership

- No in-place migration of project-owned task history.
- New registrations write the explicit fields.
- Existing registries remain readable and schema-valid.
- Framework-managed task schemas are updated in source and overlay together.
- WI-0065 owns only reasoning-provenance edits in shared files; WI-0029 command-gateway behavior and WI-0033 provider-trust design remain unchanged.

## Verification

- Provider contract fixture with requested `max`, observed thread `xhigh`, effective turn `null`.
- Legacy registration and update coverage.
- Usage-event projection and report grouping coverage.
- Team runtime visual review at desktop and narrow widths.
- Full `npm run verify`, Doctor, diff check, and exact-candidate Independent QA.
