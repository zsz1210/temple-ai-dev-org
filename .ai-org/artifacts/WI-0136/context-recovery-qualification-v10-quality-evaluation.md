# WI-0136 context-recovery qualification v10 quality evaluation

## Decision

Pass the v10 context-recovery qualification as directional evidence and retain Context Capsule-first retrieval for the replacement main comparison.

Do not treat this decision as completion of WI-0136. The Temple-versus-minimal candidate run and blind evaluation have not started.

## Independent checks

- Recomputed `context-recovery-qualification-v10-analysis.json` from the preserved protocol and raw run; the result matched byte-for-byte at the parsed JSON level.
- Confirmed both conditions completed once with zero retry and zero fallback.
- Confirmed the routed condition recovered all four exact revisions and every other required recovery field.
- Confirmed the full-load condition returned a 39-character Notifications revision where the frozen expected revision is 40 characters; appending the omitted final `d` produces the expected revision exactly.
- Confirmed the reported Operational-Token delta is −13,447 (−19.01%) and the reported turn-time delta is −55.245 seconds (−24.52%).
- Confirmed the report does not present gross Tokens as price, does not claim equal-quality efficiency, and does not authorize automatic routing.
- Re-ran the 19 focused representative-comparison tests and the complete repository verification suite.

## Verification result

- Command: `npm run verify`
- Revision: `5b224ddeae83181b7322a39b3a0d3b3cdcd51aec`
- Started: `2026-09-03T14:50:18Z`
- Completed: `2026-09-03T14:51:27Z`
- Result: pass
- Tests: 378 passed, 0 failed, 0 skipped
- Repository, documentation-link, and package-boundary checks: pass

## Remaining boundary

The v10 pair qualifies the retrieval treatment only. It has one observation per condition, unequal objective quality, no independently observable effective turn effort, and no minimal-responsible arm. The next protocol must therefore preserve routed retrieval while separately testing Temple's organizational intervention against the competent minimal workflow.
