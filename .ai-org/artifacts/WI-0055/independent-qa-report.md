# Independent QA report

## Independence

- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)

The Developer and Independent QA Agent Identities are distinct.

## Fresh-checkout reproduction

Lulu reproduced exact candidate `eef2908440d900568b07a60a221a89566615e77d` in a new detached worktree under `/tmp`.

- Exact `HEAD` matched the candidate revision.
- `npm run verify` passed 229/229 tests.
- Doctor reported 35 pass, 1 warning, 0 fail, with `healthy: true`.
- The warning is the pre-existing stale generated parallel plan; WI-0055 is sequential and did not dispatch from it.
- A fresh local schema generation reproduced the recorded thread sandbox and approval enums.
- Fresh `ThreadStartParams` and `TurnStartParams` SHA-256 values matched the research evidence.
- `git diff --check` passed and the detached worktree remained clean.
- The temporary dependency link, generated schema, and worktree were removed after verification.

## Contract review

- `thread/start` receives `read-only` or `workspace-write`, never Temple's internal camelCase sandbox label.
- `turn/start` retains the separately required tagged sandbox-policy object.
- `onRequest` and `unlessTrusted` map to current string values; unsupported `onFailure` fails before Provider contact.
- Contract-aware fake Provider coverage prevents a self-consistent stale mock from silently accepting the original error.
- Thread and turn rejection preserve bounded diagnostic metadata and do not retain the secret Provider message.
- `LESSON-0003` remains a candidate Lesson and is not automatically promoted to Practice, Skill, or permission.

## Boundary review

No real `thread/start`, `turn/start`, task registration, model generation, Token use, external write, push, deployment, publication, or release occurred.

## Result

Pass to Release Manager for organizational closeout. This validates protocol compatibility at the local contract boundary only; a second live proof remains separately gated by explicit human approval.
