# WI-0103 integration review

Independent QA inspected exact candidate `0598100f175be746a7a92d4294bf77144e6c9310` and found one classification/source traceability defect. The first matrix row said a Position handoff survived a conversation boundary, while its cited Alpha.23 run used one session and the sequential fallback.

The row was narrowed to the behavior actually demonstrated: Position-to-Position handoff data is retained in repository state. The separate IdeaDock row remains the evidence for recovery by a fresh task without the originating conversation.

No other classification or enterprise-claim issue was found. The correction changes documentation only and does not alter a historical validation state.

## Developer evidence normalization

The first Developer test evidence record was created after changing the working-tree observation format while its scope revision still pointed to the earlier committed artifact bytes. Doctor correctly reported a digest mismatch. The original artifact bytes were restored, that superseded record was marked invalidated with its historical digest, and the exact-candidate run was retained under the new `developer-exact-test-observation.json` path. The Work Item gate is rebound to the replacement normalized evidence; the original event remains in the audit stream.
