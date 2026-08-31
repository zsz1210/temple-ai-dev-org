# Independent QA report — multi-human team governance

- Work Item: `WI-0076`
- Candidate revision: `006ef1123d7d00560f56e0d03477737ea0ab9d10`
- Position: Independent QA
- Agent Identity: `agent-lulu`
- Developer Identity: `agent-rikku`
- Result: pass

## Independent reproduction

A second fresh detached worktree was created from the exact candidate, separate from the Quality worktree. It installed the six lockfile-pinned packages and passed:

- `npm run verify`: repository checks and documentation links passed; 257/257 tests passed.
- `node ./templew.mjs schema validate . --json`: 97 documents matched 27 schemas, 0 errors.
- `node ./templew.mjs doctor . --json`: 35 pass, 1 warning, 0 fail, healthy.

The single Doctor warning is the existing stale generated parallel-plan projection. It does not affect this sequential Work Item and must be rebuilt before any future dispatch.

## Challenge findings

- A newcomer to a migrated project is not silently made Bootstrap Owner; migrated governance requires explicit establishment.
- Duplicate human display names do not collide because immutable Principal IDs and provider subjects are checked separately.
- A self-asserted Solo binding cannot satisfy Collaborative verification.
- Non-default Position membership remains provisional until evidence-qualified.
- Local two-clone evidence is labelled simulated and cannot satisfy `real_collaborative`.
- Private-viewer redaction occurs server-side and does not rely on hidden browser elements.
- Developer and Independent QA are distinct Agent Identities.

## Verdict

Pass for organizational closeout at the exact candidate. Real Collaborative, representative pilot, and High-Assurance drill validation remain `not_run`; this verdict does not authorize publication, deployment, package release, or another external action.
