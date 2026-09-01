# WI-0090 Rollback Plan

If the private Alpha.29 integration is found to contain a release-truth, package, browser-gate, or task-title regression:

1. Keep the repository private and create no tag, GitHub Release, announcement, or npm publication.
2. Open a bounded corrective Work Item from the then-current `main`; preserve WI-0090, GitHub Actions run `33570955370`, and all exact-revision evidence.
3. Use reviewed forward Git reversions for only the defective WI-0090 reconciliation or the identified WI-0088/WI-0089 change. Do not rewrite shared history or delete project-owned Temple state.
4. If runtime package content changes, rebuild the exact tarball and repeat Node.js 22/24 verification, clean consumer smoke, dependency audits, installed-Chrome checks, schema validation, Doctor, Independent QA, and hosted CI.
5. If only release documentation is wrong, correct all public release surfaces together and still require the repository documentation, schema, Doctor, package-boundary, and hosted-scope checks.
6. Record the new exact candidate and remaining Human gates before asking for any public action again.

Withdrawal or superseding-release procedures for an immutable public tag are intentionally absent because no tag or public release exists. Those procedures must be approved and bound to the actual tag immediately before public release.
