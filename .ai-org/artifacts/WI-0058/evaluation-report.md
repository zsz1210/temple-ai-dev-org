# Evaluation report — WI-0058

## Decision

Advance the exact candidate `31c78a2d7a523de6991c50de19db59235bc78166` to Independent QA.

## Acceptance evaluation

1. **Active plus archive usage:** passed. `usage report`, preflight, Control Plane snapshots, and Temple Workspace share the archive-aware projection.
2. **Failure isolation:** passed. Invalid, unsafe, oversized, and conflicting inputs are excluded without suppressing valid observations; partial coverage is explicit.
3. **Real WI-0056 restoration:** passed. The preserved event appears as `23,433` total Tokens with the expected Work Item, task, Position, stage, model, and reasoning attribution.
4. **Automated coverage:** passed. Focused tests cover discovery, bounds, cursor independence, strict projection, deduplication, conflicts, privacy, active-only compatibility, and rebuild integration; the full Developer suite passed 232 tests.
5. **UI contract:** passed at the Quality gate. Wide and tablet snapshots show the restored-history explanation and driver data in the existing responsive dark Workspace.
6. **Authority and cost boundaries:** passed. No lifecycle gate, routing, monetary cost, model switch, Provider command, model generation, external release, publication, deployment, or push was performed.

## Independent QA instructions

Use a different Agent Identity (`agent-lulu` is allowed because Developer was `agent-rikku`) and a new detached worktree at the exact candidate. Run the full suite, reproduce archive-oriented focused tests, verify the two pinned archive digests and the live read-only projection without starting another model turn, and confirm the Usage UI contract from the current local service. Do not rewrite an archive or accept telemetry as lifecycle authority.
