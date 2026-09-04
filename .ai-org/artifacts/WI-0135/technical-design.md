# Technical design - WI-0135

## Reuse the governed runner

The existing runner already enforces isolated repositories, App Server contract checks, detailed Token observations, tool restrictions, path restrictions, objective tests, blind packages, score freezing, and one-attempt semantics. Extend it through protocol-shape helpers instead of creating a second ungoverned live-call implementation.

## Protocol support

- Preserve `temple.effectiveness-pilot/v2` and its four-arm validation unchanged.
- Generalize `temple.effectiveness-terra-ab/v1` so the frozen WI-0133 prepared protocol remains valid and a durable follow-up Work Item may bind a live copy to an exact Provider contract.
- Treat `minimal-responsible` as conventional and any allowlisted Temple process as native Lean treatment.
- Derive expected candidates per case from the protocol rather than the old hard-coded four.
- Require matched product inputs for all arms. A one-Temple-arm comparison does not pretend to prove matched context between multiple Temple model routes.

## Analysis

Add an A/B analyzer that validates the complete two-by-two matrix, aggregates each condition, computes optimized-minus-baseline percentage deltas, and passes one aggregate decision input to the existing v3 efficiency classifier. Preserve per-case pairs so variance and asymmetric outcomes remain visible.

## Live boundary

The executable protocol is copied into WI-0135 and pins:

- source protocol and fixture digests;
- launch instruction and tool-policy digests;
- installed Codex CLI and App Server schema digests;
- Terra medium candidates and Terra high evaluator;
- four candidate turns, one evaluator turn, 209,000 combined operational Tokens, ten minutes, zero retries, and zero fallback.

The approval record binds the exact protocol digest and permits only existing Pro allowance. If setup, preflight, generation, or evaluation stops, preserve the reason and do not retry.

## Retention

The local lab remains outside the repository. Git retains only the exact protocol, approval boundary, preflight audit, normalized observations, frozen blind scores and rationales, compact evidence and analysis, and textual reports. Raw prompts, responses, hidden reasoning, authentication material, candidate repositories, and the PDF are excluded.
