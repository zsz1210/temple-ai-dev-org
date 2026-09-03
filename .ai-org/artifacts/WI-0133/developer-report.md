# Developer report — WI-0133

## Result

The Lean context reduction and future measurement boundary are implemented at revision `1df92590bb3fd8c33e494b75a17c094a7b81d3ec`.

- The project-facing instruction block is now a compact router while retaining the named authority, lifecycle, UI, High-Assurance, bootstrap, QA-separation, tracker, Learning, and pilot-stop contracts.
- Deterministic retrieval no longer includes a Skill from Position membership alone. The exact two-case generic request retrieves no Skills; explicit IDs and meaningful documentation/domain queries still resolve.
- Context accounting retains the stable digest and adds component byte share and largest-component reporting.
- WI-0132 artifacts and its v2 interpretation remain frozen. A separate v3 helper can classify future `promising-efficiency` evidence without granting routing authority.
- The four-candidate Terra confirmation protocol validates locally and remains generation-disabled pending a fresh Provider handshake and exact approval.
- LESSON-0004 captures the two-case acceptance-contract finding at low confidence without promotion.

## Measured static context

| Component or case | Before | After | Change |
| --- | ---: | ---: | ---: |
| Candidate instructions | 9,350 B | 6,039 B | -35.41% |
| Idempotent-command routed context | 4,409 B | 1,634 B | -62.94% |
| Compatible-event routed context | 4,425 B | 1,650 B | -62.71% |
| Idempotent-command total context | 15,412 B | 9,326 B | -39.49% |
| Compatible-event total context | 15,458 B | 9,372 B | -39.37% |

Both optimized fresh fixtures returned zero generic capability matches, down from the five false-positive Skills observed in the retained WI-0132 treatment. These are UTF-8 byte measurements before Provider generation, not Token, cost, or runtime-quality claims.

## Verification

- `npm run verify`: passed; repository checks, documentation links, package boundary, and 356 tests passed.
- `node ./templew.mjs schema validate . --json`: passed; 157 documents matched 33 schemas.
- Focused Context and effectiveness tests: 21 passed.
- WI-0132 frozen-artifact regression: passed.
- Provider generation, retry, fallback, automatic routing, publication, push, and merge: not performed.

## Existing repository-health finding

`node ./templew.mjs doctor . --json` completed but the repository remained unhealthy because two evidence records created before WI-0133 cite artifact bytes that do not match their recorded historical revisions:

- `EVID-20260903T070838Z-903FABE9` for WI-0130
- `EVID-20260903T075942Z-C6F47254` for WI-0131

The same Doctor failure is present at WI-0133's base revision and neither referenced artifact changed in this Work Item. The generated parallel plan is also stale, which is expected while canonical state changes and blocks dispatch rather than delivery. WI-0133 does not rewrite or silently invalidate those older records.

## Rollback

Revert revision `1df92590bb3fd8c33e494b75a17c094a7b81d3ec`. The prepared A/B protocol is inert and no external cleanup is required.
