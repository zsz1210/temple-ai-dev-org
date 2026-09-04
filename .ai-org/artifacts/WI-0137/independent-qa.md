# WI-0137 independent QA report

- Work item: `WI-0137`
- Tested revision: `94d8ceb987ecce2bd444c2ca98209fd4f1a6f66d`
- Independent QA identity: `agent-lulu`
- Developer identity: `agent-rikku`
- Result: pass for the approved bounded improvement

## Independent findings

- Reproduced the context-routing and representative-comparison tests in a detached worktree at the exact Developer revision: 51 passed, 0 failed, 0 skipped.
- Confirmed the broader detached verification already passed at the same revision: 400 passed, 0 failed, with repository, documentation-link, and package-boundary checks passing.
- Confirmed a v2 capsule reports its selected stage, purpose, fallback, selection digest, source count, and measured bytes without retaining source bodies.
- Confirmed primary and integration routing no longer automatically load `TEMPLE.md`; recovery still provides the explicit fallback path.
- Confirmed v1 Context Maps remain readable and project-owned maps remain preserved during upgrade.
- Confirmed repository topology does not grant cross-repository authority: manifests describe only sources selected inside the current repository.

## Counterexamples challenged

- Stage mismatch and purpose mismatch exclude a route instead of widening the capsule.
- Explicitly pinned but inapplicable routes are reported and excluded.
- Symlink and repository-escape attempts fail closed during measurement.
- Duplicate source selection is de-duplicated before byte accounting.
- The future representative comparison expects the v2 capsule and therefore cannot silently revert to the old route shape.

## Residual risk

- Selected source bytes are a deterministic routing metric, not provider input Tokens, latency, cost, or outcome quality.
- The implementation has not yet been tested in a fresh cold-handoff A/B comparison. It therefore supports measurement but does not establish an efficiency improvement by itself.
- Stage and purpose filters reduce avoidable expansion only where the project declares routes precisely. Generic capability matches may still select unnecessary Skills; the new manifest makes that behavior measurable for the next tuning pass.
- Coordinator-led multi-repository route declarations and autonomous federation policy remain separate future design work.

## Decision

Pass WI-0137 to Release Gate as an organizationally complete, unreleased improvement. Do not publish or claim Token savings until the planned comparison supplies outcome evidence.
