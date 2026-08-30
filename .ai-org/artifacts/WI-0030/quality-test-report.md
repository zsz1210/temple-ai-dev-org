# Quality test report — WI-0030

- Exact candidate: `ba066d73900ba2cba70366aeb65af11ec6b944d3`
- Quality identity: Lulu
- Position: Quality & Evaluation Engineer
- Verdict: **GO — the WI-0029 privacy blocker is corrected**

## Revision authority

Quality used a fresh detached worktree at the exact Developer candidate. The committed range after the candidate contains only WI-0030 lifecycle, evidence, and generated-view changes; no later implementation change was included in this result. The candidate worktree remained clean and `git diff --check` passed.

## Fresh deterministic checks

- focused Control Plane inbox, live-provider, and foundation suites: 25/25 passed;
- independent adversarial contract harness: eight accepted cases covering one character, ordinary short, 240, 241, 4,000, secret-bearing, provider-rejected, and delivery-unknown instructions;
- 4,001 characters: rejected before provider dispatch;
- same-process same-key/same-length content mismatch: rejected before redispatch;
- restart replay with the same key and non-content request shape: prior result returned without redispatch;
- stale target state: rejected before provider dispatch;
- provider observations: eight exact calls for eight first submissions, zero replay calls, and zero stale-state calls;
- durable scan: two generated Inbox files inspected, zero raw-instruction, SHA-256, legacy-field, or reconstructable-content findings;
- legacy record read: prior `instruction`, `instruction_preview`, `instruction_sha256`, `preview_truncated`, and `request_digest` fields were scrubbed before history projection;
- full `npm run verify`: repository and documentation checks passed; 198/198 tests passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 50 documents against 24 schemas, zero errors;
- Doctor: 35 pass, one known nonblocking stale generated parallel-plan warning, zero failures;
- no command reached a real Codex task.

The first focused attempt in the detached worktree stopped before discovery because dependencies were not yet installed (`ajv` missing). After `npm ci` installed the lockfile-pinned six packages, the same focused command was rerun from scratch and passed 25/25. This setup failure is excluded from the product verdict but retained here for reproducibility.

## Fresh headed Dashboard review

A deterministic fake Codex App Server and isolated disposable Temple project reproduced disabled, idle, exact transient confirmation, accepted/active, provider-rejected, delivery-unknown, interrupted, completed, desktop, and 420-pixel narrow states.

- The complete 36-character fixture instruction appeared in the transient form and confirmation only.
- The fake provider received that exact value once.
- Six deliberate UI submissions produced exactly six provider command calls: two `turn/start`, three `turn/steer`, and one `turn/interrupt`; no automatic retry occurred.
- Generated command state contained six records, all with `instruction_content_retained: false` and none of the prohibited legacy/content fields.
- Durable command state, audit, snapshot/history, telemetry, provider rejection, and error surfaces contained none of the submitted fixture instructions.
- History consistently rendered `Retained summary`, instruction length, and `content retained: no` across accepted, rejected, delivery-unknown, interrupted, and completed states.
- Desktop and 420-pixel layouts remained readable without page overflow; the command composer and history collapsed to one column at narrow width.
- Browser console: zero errors and zero warnings in disabled, desktop, and narrow review.

The fake-provider transcript necessarily held the exact transport payload so Quality could compare it once; it remained outside repository and product durable state and was removed with the disposable fixture.

## Remaining boundary

Real Codex execution remains separately unauthorized and untested. Restart replay intentionally cannot distinguish different same-length instruction content because durable content and reversible digests are prohibited; it returns the stored result without dispatch. The stale generated parallel plan must be rebuilt only before a future parallel dispatch and is unrelated to this sequential item.
