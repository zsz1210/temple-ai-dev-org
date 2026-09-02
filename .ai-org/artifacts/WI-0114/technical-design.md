# WI-0114 technical design

Apply the exact qualified product diff to latest `origin/main` without importing prior canonical Work Item state.

`src/install.mjs` owns planning and application of the project-owned Claude entrypoint. `src/cli.mjs` renders the versioned post-init result. Overlay documentation describes the bootstrap report and trust boundary. CLI and installation tests cover human, JSON, filesystem, ownership, race, conflict, and idempotency behavior.

Resolve every revision directly from Git. The candidate is the first commit containing both current-main history and the product diff. All evidence names that exact revision. A later main advancement stops merge readiness until the combined tree is requalified.
