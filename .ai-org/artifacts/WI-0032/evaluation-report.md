# Evaluation report — WI-0032

- Tested integrated revision: `8ae349e072c25297810c9e5320a782d5199fbc8c`
- Developer candidate revision: `27d735d89d30915ee2399f80f85ad563477d420c`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Decision: **pass to Independent QA**

## Acceptance evaluation

1. **Exact worktree root before canonical reads:** passed. A nested participant path failed closed as `repository_root_mismatch`, retained null source provenance, and exposed no project or Work Items.
2. **Bounded noninteractive Git execution:** passed. Participant-local and ambient fsmonitor attempts did not execute; ambient Git directory, worktree, index, object, config, askpass, SSH, and credential-agent injection did not redirect inspection.
3. **No lazy fetch or participant mutation:** passed. A missing promisor blob caused zero loopback requests and an unknown projection with bounded diagnostics. Content digests remained unchanged across every hostile inspection.
4. **Regression and evidence quality:** passed. Focused 11/11, full 202/202, schema 55/24, Doctor 35 pass/1 known warning/0 fail, diff checks, exact revision provenance, and security-limit documentation all passed.

## Counterexample result

Quality attempted executable participant Git configuration, nested-root authority confusion, ambient repository and credential redirection, missing-object lazy retrieval, canonical projection disclosure after failure, and participant content mutation. No blocking counterexample was found.

## Evaluation boundary

This pass applies to the affected implementation at Developer candidate `27d735d89d30915ee2399f80f85ad563477d420c` as integrated without affected-path changes at `8ae349e072c25297810c9e5320a782d5199fbc8c`. It does not prove safety against same-read repository replacement, operator-controlled Git executable selection, non-POSIX platforms, hosted-provider identity, or multi-machine races. Independent QA remains required before Release Gate, and Release Manager review remains required before organizational closeout.
