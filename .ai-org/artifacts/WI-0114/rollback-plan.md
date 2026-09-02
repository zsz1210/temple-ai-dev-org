# WI-0114 rollback plan

If a post-merge regression is found, revert the WI-0114 merge commit through a new reviewed pull request. This restores the prior init output and removes the added project-overlay Claude entrypoint while preserving later unrelated main history.

Before merging a rollback, run `npm run verify` on the revert candidate and confirm that only the WI-0114 product paths and canonical closeout records are reversed. No package publication or deployment rollback is required because WI-0114 performs neither action.
