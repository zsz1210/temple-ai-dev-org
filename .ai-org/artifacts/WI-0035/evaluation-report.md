# WI-0035 Evaluation Report

- Integrated revision: `5db98cf25ff62cd73356f114e6cb15dee9474818`
- Test evidence: `EVID-20260901T151713Z-240D8B93`
- Evaluation result: pass

## Does the implementation reduce CI time without deleting behavioral coverage?

Yes for the bounded scopes it was designed to optimize. The full 262-test suite remains unchanged and mandatory for executable, package, workflow, schema, source, test, unknown, unsafe, or ambiguous changes. Strict evidence/state changes use focused contracts instead of the full suite.

The hosted comparison measured 734 aggregate runner-seconds for a full run and 103 aggregate runner-seconds for an evidence/state run, an 86.0% reduction. Workflow wall time fell from 407 seconds to 60 seconds, an 85.3% reduction.

## Does a governance failure hide behavioral information?

No. Required steps use `always()`, lane outcomes are reported separately, and the final aggregation is the blocking authority. The failed Node.js 24 behavioral run `33520595751` retained its completed governance results and failed at aggregation instead of presenting a false green state. Static workflow tests enforce the same property for governance failures.

## Does the classifier fail closed?

Yes. The narrow paths are explicit allowlists. Empty, unavailable, malformed, renamed, copied, deleted, executable, mode-changing, mixed-scope, unknown, and behavioral changes select full verification. Manual dispatch always selects full verification.

## What remains unknown?

GitHub-hosted execution and timing are now observed. Actual account-level allowance consumption and paid charges are not observable with the current credential. GitHub's run timing endpoint returned zero billable milliseconds, which is retained as an API observation but is not treated as an invoice or proof that no plan minutes were consumed.

## Cost and test recommendation

1. Retain all tests; optimize selection and frequency, not the existence of safety coverage.
2. Keep local focused tests as the normal development loop.
3. Keep the full Node.js 22/24 hosted matrix for behavioral and public compatibility changes.
4. Keep the current evidence/state lane for canonical lifecycle updates.
5. Treat documentation plus evidence/state unions as a possible later optimization. The current classifier intentionally sends that mixed scope to full verification, so changing it needs its own acceptance boundary and adversarial tests.
6. Configure a GitHub Actions hard budget separately if the repository owner wants a guaranteed paid-overage stop. This Work Item does not mutate account settings.

## Conclusion

WI-0035 satisfies its approved scope and may proceed to Independent QA. It does not claim a universal speedup or a verified monetary saving; it records repository-specific hosted runtime evidence and preserves the account-billing uncertainty.
