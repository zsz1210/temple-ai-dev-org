# WI-0065 Independent QA report

- Independent QA Agent: Lulu (`agent-lulu`)
- Developer Agent: Rikku (`agent-rikku`)
- Exact candidate: `c984f2497a458c873b4cd1b8043d2d0f87ffd43a`
- Result: pass

## Reproduction

A second fresh detached worktree installed dependencies offline, passed all 234 repository tests, passed the 32 focused control-plane tests, passed Doctor with no failure, passed diff checks, and remained clean. Developer and Independent QA are different Agent Identities.

## Adversarial findings

- A requested turn value is not accepted as Provider observation.
- A thread-level observation is not labeled as effective-turn evidence.
- Missing effective-turn metadata remains `null` and renders `Not observed`.
- Legacy source-less values remain visibly legacy/unknown rather than being promoted.
- Provider reroute continues to change only effective model, not reasoning provenance.
- Generated Dashboard script syntax is compiled by tests, closing the gap found during runtime review.
- The self-host managed-file digest matches the changed task schema.

## Limitation retained

The installed App Server does not prove the effective reasoning effort for an individual turn. This is now a truthful protocol limitation, not a failed Temple correlation. No routing, remote command, release, or external action is authorized by this result.
