# WI-0118 rollback plan

This Work Item performs no deployment, publication, package release, production mutation, or external write.

Before any later merge, revert the WI-0118 commits on `codex/wi-0115-0117-validation-program` if a regression is found. Rebuild the generated status view with `node ./templew.mjs status .`, then run `npm run verify` before considering a replacement candidate. Do not reverse the seven historical outcome migrations by relabeling them as active blockers; if their interpretation is disputed, create a new reconciliation Work Item and preserve the original evidence.
