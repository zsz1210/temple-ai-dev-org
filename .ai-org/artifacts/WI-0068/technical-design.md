# WI-0068 technical design

Import `resolveControlPlaneStateDirectory` into the validation-program module. While resolving every participant, resolve either the explicit relative `usage_state_directory` or the default and attach the resulting absolute path only to the in-memory participant record. An invalid worktree-local directory throws a participant-scoped error before the runner can start.

The report builder consumes that already validated path. Public inspection exposes only the policy and a repository-relative safe display, never an unconstrained external path. The manifest remains project-owned and the stopped WI-0067 manifest is not rewritten.
