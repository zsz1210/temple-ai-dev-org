# Simulated Collaborative report — two disposable clones

- Work Item: `WI-0076`
- Environment: one local macOS host, two disposable Git clones, one bare origin
- Classification: `simulated_collaborative`
- Result: pass with retained real-environment gate

## Scenario

1. Clone A and Clone B start from the same canonical collaboration revision.
2. A records one governance change, commits, and pushes it.
3. B independently records another governance change and commits without first receiving A.
4. B's push is rejected as non-fast-forward.
5. Fetch and merge expose the competing canonical edit as a visible conflict rather than silently choosing one writer.
6. Each writer's record remains recoverable from its commit, and a cold clone of the accepted origin recovers A's canonical record.

The automated scenario is implemented in `test/collaboration-governance.test.mjs` and passed in both the focused suite and the complete 257-test verification run.

## Supported conclusion

Repository coordination makes a competing canonical write visible, retains both commits for reconciliation, and permits cold recovery of the accepted state. It does not provide or prove an atomic cross-machine claim lock.

## Retained gates

- `real_collaborative`: not run; requires at least two distinct active humans in independently administered environments.
- `representative_pilot`: not run.
- `high_assurance_drill`: not run.
