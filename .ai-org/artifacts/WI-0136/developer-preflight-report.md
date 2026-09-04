# Developer preflight report

## Result

WI-0136 is ready for its explicit live-generation approval boundary. No candidate or evaluator model turn has run.

## Frozen protocol

- Protocol SHA-256: `858f296e1582b5d5570882c85a3c5a773457a7c054ad3d8f194be68855dd6c83`
- Candidate turns: 10
- Blind evaluator turns: 1
- Candidate operational-Token stop: 520,000
- Evaluator operational-Token stop: 100,000
- Combined operational-Token stop: 620,000
- Program wall-clock stop: 45 minutes
- Retry and fallback: disabled
- Account boundary: Pro included allowance only; no Credits purchase, automatic refill, or usage reset

The Token values are safety stops based on retained WI-0132 and WI-0135 observations. They are not forecasts, prices, or statistical estimates.

## Verified locally

- Both arms start from identical product revisions across gateway, catalog, orders, notifications, and coordinator repositories.
- All seeded public service tests, the public integration path, and the held-out compatibility path fail before implementation.
- The evaluator-only golden implementation passes every public and held-out check.
- The Temple federation registry validates exact participant revisions and contract dependencies.
- The no-generation Temple lifecycle rehearsal moves all five participant Work Items to `test`; participant Doctor checks and objective tests pass.
- Codex App Server `codex-cli 0.151.0-alpha.7.2` matches the frozen request, response, notification, and interrupt schema digests.
- `gpt-5.6-sol` supports `xhigh`; `gpt-5.6-terra` supports `medium`.
- An unapproved `run` exits with `exact-human-approval-required` and creates no candidate, evaluator, score, or analysis artifact.
- The experiment-specific Node test suite passes 5 of 5 tests.
- `npm run verify` passes 364 of 364 tests, with no failures, skips, or cancellations.
- `git diff --check` passes.
- Repository Doctor reports 36 passes, one stale generated parallel-plan warning, and no failures. The warning does not authorize or describe this experiment's cross-repository execution plan.

## Remaining boundary

Live generation remains disabled until an exact affirmative account-approval record matches the frozen protocol. After approval, candidate execution, blind evaluation, analysis, and lifecycle evidence are still unverified work.
