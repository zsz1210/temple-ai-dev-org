# Quality test report — WI-0069

- Tested candidate revision: `aead7f548adde729e607d3db2806f62dd2251967`
- Quality identity: Lulu (`agent-lulu`)
- Position: Quality & Evaluation Engineer
- Verdict: **GO — pass to Independent QA**

## Revision authority

Quality reproduced the Developer candidate in a separate detached Git worktree at the exact revision above. The worktree was removed after the checks. No dependency was installed, fetched, vendored, or committed.

## Focused verification

- `test/phase-4b.test.mjs` and `test/phase4-installation.test.mjs`: 17/17 passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 90 documents matched 27 Draft 2020-12 schemas with zero errors;
- Doctor: 35 pass, one pre-existing stale parallel-plan warning, zero failures.

The focused tests cover provider usage dimensions, provider-owned launch-revision qualification, live and history telemetry correlation, account-usage fail-closed behavior, deterministic longitudinal coverage, diagnostic-only observation thresholds, project-owned usage-policy initialization, and upgrade preservation.

## Acceptance evaluation

1. **Project-owned policy:** passed. Fresh initialization seeds the policy, and upgrade creates it only when absent while preserving an existing project-owned file.
2. **Progressive calibration:** passed. Missing task shape, matched quality evidence, or statistical criteria remains an explicit blocker; the seed remains usable without promoting automatic routing.
3. **Exception-only approval:** passed at the policy and projection boundary. Routine inspection stays automatic, while configured risk, authority, privacy, cost, and confidence exceptions remain approval triggers.
4. **Token and cost separation:** passed. Observation counts remain diagnostic-only, Token ceilings remain safety guards, and Credits or cost stay unknown without versioned provenance.
5. **No live generation:** passed. The evaluation used local deterministic commands only.

## Boundary

This result proves the policy, schema, report projection, installation, and upgrade behavior at the exact candidate revision. It does not prove a live provider, monetary cost source, automatic model execution, or cross-project statistical transfer. Independent QA must still run the complete repository verification suite.

No model generation, provider call, external network action, push, release, publication, deployment, external-system write, or paid action was performed.
