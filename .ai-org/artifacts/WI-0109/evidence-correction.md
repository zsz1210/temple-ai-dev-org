# WI-0109 evidence revision reconciliation

The normalized Developer, Quality Evaluator, and Independent QA observation documents retain `a21fbc4f6ebe60043e3ed61690131b281ebc6bed` as the exact code candidate they tested.

The initial Developer observation artifacts were committed at `b73dd37bfe33bbf8967a0fbc33ab355344aaa4dd`. The hardened Developer observation artifacts were committed at `ffa51c3db04d9c6473d9434095180a1def2ff0a8`. Quality and Independent QA artifacts were committed together at `83a18f4b91d7c9dfb0b80866327c292b958bc1d9`.

Their corresponding Evidence Registry entries therefore use those artifact-bearing commits as `scope_revision`, allowing Doctor to reproduce every recorded digest from Git without changing the tested revision, result, or zero-generation boundary.

The Git-revision evidence remains scoped directly to the original `04ce81c0421526f6d10566dd41debbee660dd4cb` candidate. The later hardened candidate is identified by the normalized Developer, Quality Evaluator, Independent QA, and release-gate records.
