# WI-0035 Rollback Plan

If the scope selector or focused evidence/state lane produces an incorrect result:

1. Disable narrow selection in a new reviewed commit by making every event select the existing `full` scope.
2. Retain the separate governance, behavior, summary, and final aggregation steps; do not bypass a failed result.
3. Run `node --test test/ci-scope.test.mjs` and the complete `npm run verify` locally.
4. Push only after the exact rollback candidate is clean, then require the Node.js 22 and 24 hosted matrix to pass.
5. Record the rollback revision and hosted run before treating the incident as resolved.

This procedure restores conservative full verification without deleting tests, changing repository visibility, publishing a release, or mutating GitHub billing settings.
