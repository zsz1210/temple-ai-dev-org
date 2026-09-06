# Ephemeral helper dispatch repair

WI-0198's sanitized result remains unchanged. A subsequent read-only inspection of the local Codex diagnostic database found a native spawn invocation with `fork_turns: "5"` and a router error `collab spawn failed: no thread with id: <parent>`. The parent identifier hashes to `0ee0c904d916d6e703d25b0b350895c73922c53228f80d92caedc40dabd489c1`, matching the recorded actor. The error occurred at 2026-09-06T05:27:43Z. No raw log, prompt, encrypted payload, or local path is copied here.

The runner starts an ephemeral parent. The installed native tool permits `fork_turns: "none"` for a fresh helper. The successor explicitly requires that option and a self-contained brief with fixture path, task, read-only scope, and stop condition. It keeps memory isolation and ephemeral retention unchanged. This addresses the observed request's dependency on missing parent history; successful live helper execution remains to be demonstrated.

The successor is isolated from all sealed predecessors. Its seal includes its executor and the reused acquisition and event policy implementations. Old approvals cannot authorize the changed request. There is no automatic retry or fallback.

Generation-free tests cover the corrected request, protocol rejection of history-policy drift, and child acquisition/replay. These establish harness behavior, not real Provider compatibility. The `fork_turns` constraint is an instruction to the native model tool, not an independently enforced tool-argument gate.

The optional local `diagnose.mjs` reads a bounded time window from a Codex diagnostic database in read-only mode, matches the parent by hash, and emits only fixed error categories and booleans. Unknown and foreign errors remain unknown. It does not start a Provider or retry work.

Official background: https://learn.chatgpt.com/docs/agent-configuration/subagents describes delegated task context. The exact ephemeral failure diagnosis comes from the locally installed runtime's diagnostic record, not a general documentation guarantee.
