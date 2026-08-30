# Independent QA report — WI-0027

- Candidate: `591b4369ee385037a50f71e3f8651a6b15a5694d`
- Verdict: **GO**
- Environment: fresh detached disposable worktree, exact-clean before and after verification

## Independent reproduction

- Focused Observer and live-control-plane tests: 20/20 passed.
- Full repository verification: 195/195 passed with zero failures, skips, cancellations, or TODOs.
- Repository checks: 93 overlay files and 10 Positions passed.
- Documentation link checks: passed.
- Schema validation: 46 documents against 24 schemas with zero errors.
- Doctor: healthy, 35 pass, 1 accepted stale-plan warning, 0 fail; 27 Work Items and 73 evidence records and digests valid.
- Exact SHA, index, worktree, porcelain, and `git diff --check`: clean.

An independent adversarial fixture set top-level `tested_revision` to a value different from a nested legacy release revision. The terminal projection selected the top-level exact SHA; one older evidence record remained stale and countable while stale attention and firing stale conditions remained zero. Moving the same item back to Build preserved the historical stale count and restored one stale attention signal plus one true stale-evidence condition.

The disposable QA worktree was removed. No network, Provider or account probe, model call or switch, push, deployment, tracker action, or paid action occurred.

## Retained limits

This is local deterministic repository and control-plane evidence. Long-duration dashboard or Provider soak and multi-machine behavior remain untested. The correction intentionally suppresses only revision-stale attention for `done` and `cancelled` Work Items; invalidated, expired, failed, unverified, and open-risk evidence behavior is unchanged.

