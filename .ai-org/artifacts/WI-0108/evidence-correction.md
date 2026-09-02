# WI-0108 evidence revision reconciliation

The normalized Developer, Quality Evaluator, and Independent QA observation documents retain `1211d700717417f5a585cd9f488ea09000ffd1d0` as the exact code and stopped-run candidate they tested.

Those observation and report files were committed together at `cdf24c0c2b4a824eacbb241e6b0db46388a6109c`. The three corresponding Evidence Registry entries therefore use `cdf24c0c2b4a824eacbb241e6b0db46388a6109c` as their artifact-bearing `scope_revision`, allowing Doctor to reproduce each recorded digest from Git without changing the tested revision, result, Token count, or claim.

The Git-revision evidence remains scoped directly to `1211d700717417f5a585cd9f488ea09000ffd1d0`.
