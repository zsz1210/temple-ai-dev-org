# WI-0136 independent QA report

- Work item ID: `WI-0136`
- Tested revision: `6a7abb6c3e86e78c3e638a35d6e1f9d28843adda`
- QA Agent ID: `agent-lulu`
- Developer Agent ID: `agent-rikku`
- Environment: local macOS repository and frozen v16 evaluator lab; Node.js `v24.20.0`
- Result: pass for the exact bounded comparison and its descriptive claims

## Acceptance criteria checked

- Both frozen arms retain identical scenario, repository, model-route, retry, fallback, and network boundaries.
- Both candidate arms completed once, and all public and held-out objective checks pass at the retained revisions.
- The evaluator result binds the exact v16 continuation protocol and immutable v13 candidate record.
- Anonymous scores froze before the arm mapping was unsealed.
- Both packages contain every exact rubric dimension once, score 8/8, and contain no critical failure.
- Candidate and evaluator records contain zero retry and zero fallback.
- The final findings remain descriptive and do not claim statistical generalization, monetary savings, or automatic routing authority.

## Reproduction steps and evidence

1. Re-ran the four service tests and public coordinator integration test in each frozen arm: ten of ten test commands passed.
2. Re-ran the evaluator-only held-out compatibility suite against each arm: six of six held-out assertions passed.
3. Recomputed the arm summaries and comparison deltas from the frozen v13 candidate and v16 evaluator records; every generated analysis field matched the archived analysis.
4. Compared the five archived machine-readable outputs byte-for-byte with the v16 lab sources; all five SHA-256 digests matched.
5. Verified the continuation and candidate digests, score-freeze ordering, two complete rubric packages, zero evaluator command items, zero retry, and zero fallback.
6. Confirmed that revision `6a7abb6c3e86e78c3e638a35d6e1f9d28843adda` passes `npm run verify` with 398 of 398 tests.

Primary evidence:

- `EVID-20260903T232923Z-A114E9C1`
- `representative-main-v16-evaluator-result.json`
- `representative-main-v16-quality-scores-frozen.json`
- `representative-main-v16-analysis.json`
- `representative-main-v16-report.md`
- `representative-main-v16-findings.md`

## Counterexamples attempted

- Missing archive digest registry: the first QA helper incorrectly expected report-return metadata inside `analysis.json`. Inspection confirmed the hashes were intentionally returned by the report command rather than persisted there; the corrected check compared the declared five lab/archive pairs directly and passed.
- Hidden compatibility regression: independently executed the retained v1, new v2, duplicate, malformed, and unsupported-event assertions against both arms; all passed.
- Premature mapping unseal or incomplete rubric: checked score-freeze flags, two exact packages, eight dimensions per package, and null critical failures; all passed.
- Tool-policy breach: the evaluator retained zero command items and only passive `userMessage`, `reasoning`, and `agentMessage` events.

## Residual risk

- This is one matched scenario and cannot establish a population effect.
- The rubric reached its ceiling in both arms, so it cannot demonstrate a quality advantage.
- The Provider acknowledged the requested Sol model, but did not expose an effective turn-level reasoning value; `xhigh` remains a verified request rather than an independently observed effective setting.
- Temple's substantially larger artifact footprint and slower integration stage require follow-up measurement before any efficiency claim.

