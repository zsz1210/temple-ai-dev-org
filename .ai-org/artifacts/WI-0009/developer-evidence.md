# Developer evidence

- Candidate revision: `987186756be5c996f0a12438c7a5b13aa8c7030d`
- Full verification: `npm run verify` passed with 152 tests, zero failures.
- Focused verification: both Control Plane suites passed with 15 tests, including new terminal-category, bounded-history, HTTP-first startup, configuration, and Dashboard rendering regressions.
- Repository dogfood: `control-plane start . --port 49313 --state-dir .git/temple/control-plane-wi0009 --codex` exposed HTTP within the first one-second observation window.
- Health and snapshot: both returned HTTP 200 before the background provider synchronization was required to finish.
- Canonical projection: 9 Work Items total, 8 `terminal`, 1 `queued`, and 0 falsely active or blocked.
- Clean-state Codex reconciliation: the first observed journal held 175 events rather than the previous multi-thousand-event import; later steady state remained bounded by the configured 20-turn and 200-item window plus canonical repository events.
- Browser review: the live Dashboard rendered the Terminal metric, green terminal badges, responsive cards, Human Inbox boundaries, and provider status without layout breakage.
- Provider limitation: the registered historical task could be read, while its later `thread/resume` request returned App Server error `-32600`; the provider truthfully degraded instead of claiming live coverage. Canonical state and Dashboard availability were unaffected.
- Privacy and authority: no raw prompt, hidden reasoning, command, diff body, credential, or external mutation was introduced.

## Rollback

Revert candidate revision `987186756be5c996f0a12438c7a5b13aa8c7030d`. Generated local telemetry under `.git/temple/control-plane-wi0009/` is disposable and is not canonical project state.
