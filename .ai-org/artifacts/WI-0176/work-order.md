# WI-0176 — Owned provider process cleanup

## Approved scope and ownership

The user authorized continuing the proposed owned-process cleanup after PR #54. Fix the process started by `createJsonRpcProcess`, not arbitrary existing Node services, descendants or Codex app processes. The other task owns comparison diagnostics and was notified of this narrow function and WI ID. No live model calls, release, deployment or unrelated process cleanup.

## Design and acceptance

- Preserve normal JSON-RPC traffic. Closing must reject pending requests and disallow new requests without leaving timeout handles behind.
- Keep one shared close operation. Send SIGTERM only to the owned ChildProcess; wait for observed exit. If it ignores TERM for the existing one-second grace, send SIGKILL to that same handle, wait one further bounded second, and report failure if exit still cannot be confirmed.
- Do not infer termination from `child.killed`; distinguish closing from observed process exit. Attach terminal observation before signals. Handle natural exit and spawn failure safely; close owned pipes and readline state.
- Regression fixtures cover graceful exit, ignored SIGTERM, concurrent/repeated close, pending/rejected requests, spawn failure and an unrelated sibling that must remain alive. Fixture children have unconditional test cleanup.
- No process table scan, detached process group or PID registry. Descendant cleanup and parent SIGKILL/crash recovery remain outside this slice.
- Run focused real-process fixtures, the full offline suite and separate Independent QA against an exact commit. No UI mode applies.

Mog coordinates and integrates; Yuna owns acceptance; Tidus owns design; Rikku implements; Lulu independently checks. Standard reversible change. Rollback is reverting the implementation commit without rewriting canonical history. Stop after verified PR submission; Git merge and publication remain separate boundaries.
