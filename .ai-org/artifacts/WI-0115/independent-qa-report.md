# Independent QA — WI-0115

- Candidate: `11012a38523676f1187fbea8b4a388ba4d81bb18`
- Independent QA: Lulu (`agent-lulu`)
- Decision: **PASS WITH PROVIDER LIMITS**

An exact detached checkout of the Developer candidate passed the complete repository verification suite: 297 tests passed, with no failures, skips, or cancellations. A separate clean-consumer run packed and installed that same candidate offline, initialized a synthetic project, and reported Doctor results of 36 pass, 1 warning, and 0 failures. The detached candidate remained clean.

This evidence verifies deterministic installation and repository behavior only. It does not claim that a provider-owned model session loaded or understood the generated instructions. Provider validation remains `not_run`, Token fields remain unknown, and the generated bootstrap record grants no lifecycle or external-action authority.
