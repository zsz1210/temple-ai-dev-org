# WI-0112 evidence revision reconciliation

The normalized Developer, Quality Evaluator, and Independent QA observation documents retain `a836643ab9aae4b0690bedae2b2c15ef98b0695e` as the exact repository revision that launched the bounded run and was independently reproduced.

The Developer run artifacts were committed at `896840569829410a392cd66d806191617b481984`, the Quality Evaluator artifacts at `18f1670f3d6b670b6943670d1d04b5ea041801b8`, and the Independent QA artifacts at `f605721a11f6b703173c302818d37a583f4d99d8`.

Their corresponding Evidence Registry entries therefore use those artifact-bearing commits as `scope_revision`, allowing Doctor to reproduce every recorded digest from Git without changing the launch revision, observed result, or no-rerun boundary.
