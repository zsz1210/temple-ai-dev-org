# Rollback plan — WI-0117

No runtime, deployment, publication, external service, or persistent Observer was changed. The candidate is isolated on `codex/wi-0115-0117-validation-program` and has not been merged by this closeout.

If the evaluator-runner repair must be removed before a later merge, revert candidate commit `b8f41dd0e1255526f63c0e541ea480ef3d35e059` and retain the WI-0117 evidence artifacts as historical no-go records. Do not delete or rewrite the stopped evaluator records or the preserved candidate lab. Re-run `npm run verify` after any revert.
