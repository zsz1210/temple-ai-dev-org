# WI-0141 technical design

## Decision

Advance the existing controlled-comparison runner to a WI-0141 live protocol while preserving the accepted experimental design from WI-0140. All mutable protocol, approval, readiness, observation, analysis, and report outputs move to `.ai-org/artifacts/WI-0141/`. The closed WI-0140 artifact subtree becomes read-only predecessor evidence.

## Protocol identity

The protocol uses a new schema revision and binds:

- the exact source revision and harness SHA-256;
- the full condition order and each condition's repository manifest, treatment digest, selected-source count, and selected-source bytes;
- the requested model and reasoning effort;
- per-condition, aggregate, and wall-clock limits;
- the installed Provider contract acknowledgement;
- the WI-0138 false-negative regression, WI-0139 diagnostic regression and limit derivation, and WI-0140 artifact integrity record;
- privacy and interpretation boundaries.

Any change to a bound field changes the protocol digest and invalidates an earlier approval.

## Predecessor integrity

Preparation and preflight resolve commit `25b846d` to an exact revision and compare `.ai-org/artifacts/WI-0140/` against it. A tracked diff or working-tree change blocks the experiment. WI-0139 remains the numeric diagnostic and ceiling source; its retained observation digest is also bound into the protocol.

## Generation gate

`prepare`, `rehearse`, `inspect`, and unapproved `preflight` may contact the local Codex App Server only for schema/configuration acknowledgement and must perform no model turn. `run` first repeats all inspection, harness, Provider-contract, predecessor-integrity, readiness, and exact-approval checks. Generation begins only when every check passes.

## Execution and stop behavior

Conditions execute sequentially in the frozen counterbalanced order. Each condition has one fresh thread and a hard Token/time boundary. Completed conditions are immediately retained in memory and their repository state is rechecked. A condition-level Token ceiling yields a censored observation and execution proceeds; a run-level protocol, provider, schema, repository-state, aggregate-budget, or time failure writes one exclusive stopped observation and ends the run. No condition is retried and no model fallback is allowed.

## Analysis

Correctness gates all efficiency interpretation. For each repository shape, analysis compares the two legacy-expanded repetitions with the two stage-aware repetitions across:

- selected source count and bytes;
- bounded acquisition counts, known-policy adherence, routed share, and off-route reads;
- Operational Tokens;
- elapsed time;
- reported tool-output bytes.

Exact deltas require both matched arms to complete. Partial or censored evidence remains descriptive only.

## Risks and controls

- **Closed evidence mutation:** all new outputs use WI-0141 and preflight verifies WI-0140 integrity.
- **Repeated spend:** output files are exclusive, retry is zero, and a retained live or stopped observation blocks another run.
- **Approval drift:** approval binds the complete protocol digest and account-impact fields.
- **Hidden reroute:** requested/configured model is checked; unsupported per-turn effort remains unknown rather than inferred.
- **Sensitive telemetry:** only bounded path metadata and numeric summaries are retained.
- **Overclaiming:** per-shape reporting, correctness gating, and explicit diagnostic-only language are enforced in the analysis.
