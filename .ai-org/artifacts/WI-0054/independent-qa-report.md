# Independent QA report

## Independence

- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)

The Developer and Independent QA Agent Identities are distinct.

## Fresh-checkout reproduction

Lulu reproduced exact candidate `5de1ae88304d7c6d7876d28f2518c812f0443f65` in a new detached worktree under `/tmp` without calling the Provider launch path.

- Exact `HEAD` matched the candidate revision.
- `npm run verify` passed 227/227 tests.
- Doctor reported 35 pass, 1 warning, 0 fail, with `healthy: true`.
- `git diff --check` passed and the detached worktree remained clean.
- The temporary dependency link and worktree were removed after verification.
- The single Doctor warning is the pre-existing stale generated parallel plan; WI-0054 is sequential.

## Evidence review

- The result is correctly classified `fail` because `thread/start` did not create a Provider thread.
- No canonical WI-0054 task, turn, instruction delivery, Token observation, interrupt, automatic retry, or model-generated repository change followed.
- The private-LAN read-only Dashboard was restored and reports the Codex Provider ready with Provider-owned launch capability exposed.
- The installed schema uses kebab-case `SandboxMode`; the candidate bridge and mocks use camelCase `readOnly` at thread start.
- The original RPC rejection detail is not retained, but the local request/schema mismatch is concrete and sufficient to explain the rejection without a second live attempt.
- No missing Token values are converted into zero, cost, savings, quality, or routing claims.

## Result

Pass the experiment record to Release Manager for organizational closeout. This QA pass means the failed live outcome and its safety evidence are accurate; it does **not** mean Provider-owned launch works. A corrected implementation and any new live attempt require a separate Work Item and explicit authorization.
