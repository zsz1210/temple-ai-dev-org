# Developer evidence — WI-0010

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `7052388e4197ef1654e30ab33576ac6bb80d81d7`
- Result: pass to Quality & Evaluation

## Verification

- `npm run verify` passed at the exact candidate revision.
- Repository and documentation checks passed for 90 overlay files and 10 Positions.
- The full suite passed 157 tests with zero failures, skips, or todos.
- The Phase 4B suite passed five focused tests covering the managed catalog, three operating profiles, fail-closed negative cases, provider attribution, delta aggregation, missing numeric usage, privacy, price uncertainty, and disabled automatic routing.
- Direct read-only evaluation of the Solo, Collaborative, and High-Assurance fixtures passed all seven scenarios for each profile with zero failed or incomplete cases.

## Self-host observation

- Temple's retained Control Plane journal produced `insufficient-data` with zero usage observations.
- Total Token usage remained `null`/unknown rather than being reported as zero.
- Monetary cost remained unknown and automatic routing remained disabled.
- This is a successful honesty check, not a Token-efficiency baseline or savings claim.

## Authority and privacy

- Evaluation fixtures and generated scorecards do not advance lifecycle state or satisfy gates.
- Reports aggregate provider-reported last-turn deltas and bounded identifiers only.
- No prompt, hidden reasoning, source body, command, diff, tool payload, credential, price lookup, external action, or model switch was introduced.

## Rollback

Revert candidate revision `7052388e4197ef1654e30ab33576ac6bb80d81d7`. Generated `.ai-org/views/policy-evaluation.json` and `.ai-org/views/usage-baseline.json` files are disposable; canonical Work Items, evidence, approvals, and provider journals retain their existing authority.
