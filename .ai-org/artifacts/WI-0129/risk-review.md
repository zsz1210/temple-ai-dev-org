# WI-0129 risk review

Risk is standard because the user-facing product direction and operating path require separate Independent QA. The changes remain local and reversible, with no production, privacy, security, data-migration, or external-operation effect.

Primary risks are inaccurate capability status, commands that drift from the CLI, accidental release-state changes, and an experiment that confounds process with model selection. Mitigations are repository evidence, focused executable tests, link checks, explicit separation of experiment arms, exact-candidate Independent QA, and Git revert as rollback.
