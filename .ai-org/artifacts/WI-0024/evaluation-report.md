# Evaluation report — WI-0024

Independent QA must use exact candidate `2bf07c0dcc94769b6c964c2a935b1d74bb3b5734` in a fresh worktree, inspect the validator boundary, and reproduce a legacy restored lock without `template.bootstrap`. Confirm Doctor returns a bounded unhealthy result with `cli_bootstrap` failure instead of throwing, upgrade recreates valid metadata, post-upgrade Doctor is healthy, focused/full tests pass, and the checkout remains clean.
