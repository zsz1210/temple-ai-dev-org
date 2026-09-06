# Local reproduction evidence

Candidate: `ba3bcc60`.

The focused generated-command integration test passed in 5073.155667 ms:
twelve actual CLI executions and sixteen synthetic argument diagnostics.
The test extracts the generated prompt command rather than rebuilding it,
executes both formats and lifecycle-valid Builder/Verifier positions, checks
direct and zsh-wrapped forms, and verifies no canonical writes from context entry.
It checks exact whole-body reacquisition when optional reuse is omitted.

No valid command incompatibility was reproduced. The change adds a regression
test, not a production workaround. Malformed cases are synthetic; the original
WI-0217 command remains unretained and unknown. No model turns occurred.

Full `npm run verify` passed: 666 tests, zero failed/skipped/cancelled,
156481.057875 ms. The earlier experiment seal and diff check passed unchanged.
Distinct reviewer evidence is recorded separately. See next-comparison.md for
the decision-ready, not-yet-authorized live follow-up.
