# Alpha.26 history visibility stabilization

Status: **passed with one bootstrap follow-up retained**

## Scope

This validation covers WI-0012 at candidate `3872ac71630e8a52d69f1b624793bfa6e7cf5475`: stable Codex history reconciliation identity, honest `history-only` projection, Dashboard counters, and a real two-start self-host rehearsal.

## Automated verification

- Focused Control Plane suite: 16 passed, 0 failed, 0 skipped, 0 todo.
- Developer exact-candidate `npm run verify`: repository checks passed, documentation links passed, 160 tests passed.
- Independent QA: fresh detached worktree, `npm ci` installed 6 packages and reported 0 vulnerabilities; exact-candidate `npm run verify` passed all 160 tests.
- Exact-candidate Doctor through the local candidate CLI: 35 pass, 1 stale generated-plan warning, 0 fail.

## Real self-host observation

1. The prior generated journal contained 7,229 events. The built-in rebuild archived it and reconstructed 169 canonical repository events.
2. The first real Codex Provider start reached `ready` and retained 390 events after bounded history reconciliation.
3. The registered completed task projected as `history-only` / `historical`; counters were `live=0`, `history_only=1`, and current attention was absent.
4. A second start occurred after the upstream thread gained four items. The journal retained 395 events: one changed snapshot-summary event and four new history events, rather than another copy of the complete 200-item window.
5. The Provider remained `ready` with no degraded reason and zero firing conditions.

## Result

Equivalent snapshots now deduplicate. Changed snapshots grow proportionally to their changed summary and new or changed bounded events. Reconciled terminal history remains inspectable without presenting it as an active subscription or current runtime failure.

## Retained limits

- The configured event-retention cap, rather than a permanent per-thread union cap, bounds long-running generated journals.
- No active registered Work Item was available, so this pass does not qualify detailed live Token attribution or the longitudinal Phase 4B baseline.
- A detached toolkit-self-host worktree must currently set `TEMPLE_CLI_PATH=./bin/temple.mjs` to guarantee Doctor uses the exact local candidate rather than a same-version globally linked package. Candidate-SHA bootstrap binding is separate follow-up work.
- No external write, publication, deployment, model switch, spending action, or production release occurred.

## Rollback

Revert `3872ac71630e8a52d69f1b624793bfa6e7cf5475`. Generated telemetry may be rebuilt from canonical repository events, and the pre-rebuild journals remain in the local archive.
