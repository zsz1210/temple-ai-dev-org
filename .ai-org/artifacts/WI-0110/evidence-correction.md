# WI-0110 evidence revision reconciliation

The Developer, Quality Evaluator, and Independent QA observations retain `19b78371b603d5ca25970c8c325bbce1bcfce158` as the exact launch revision they tested.

Their observation and report files were committed together at `29f77ec68ca08b1f95c7b1d820b739bbee4a882a`. The corresponding Evidence Registry entries therefore use that artifact-bearing commit as `scope_revision`, allowing Doctor to reproduce every recorded digest without changing the tested launch revision, stopped result, Token count, or no-retry boundary.
