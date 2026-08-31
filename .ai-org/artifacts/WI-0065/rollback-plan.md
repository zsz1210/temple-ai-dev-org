# WI-0065 rollback plan

If the additive task fields or Team display cause a regression, revert commits `c984f2497a458c873b4cd1b8043d2d0f87ffd43a` and `dccc20596bf5061cd14ed963b5756ff72bd59a37` together. Existing project-owned task registries remain compatible because the fields are additive and `additionalProperties` was already allowed. Re-run `npm run verify` and Doctor after the revert. No data migration, external state, deployment, or credential rollback is required.
