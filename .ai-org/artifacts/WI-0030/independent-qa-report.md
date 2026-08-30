# Independent QA report — WI-0030

- Exact candidate: `ba066d73900ba2cba70366aeb65af11ec6b944d3`
- Independent QA identity: Lulu
- Position: Independent QA
- Verdict: **PASS — advance to Release Gate without closing it**

## Independent revision authority

Independent QA began only after the Work Item entered `independent_qa`. It used a second fresh detached worktree at the exact Developer candidate, separate from the Quality worktree and main checkout. The worktree remained clean, its `HEAD` resolved exactly to the candidate, and `git diff --check` passed. No implementation change after the candidate was included.

## Fresh contract reproduction

- focused Control Plane inbox, live-provider, and foundation suites: 25/25 passed;
- fresh adversarial contract harness: eight accepted cases and eight exact first-dispatch provider calls;
- one-character, ordinary short, 240, 241, 4,000, secret-bearing, provider-rejected, and delivery-unknown instructions all retained only omission metadata;
- 4,001-character input, same-process same-key/same-length mismatch, and stale target state were rejected before dispatch;
- restart replay returned the prior result with zero redispatches;
- legacy content and content-derived digest fields were scrubbed before projection;
- durable adversarial scan: two generated Inbox files, zero raw, digest, legacy-field, or reconstructable-content findings;
- full `npm run verify`: repository and documentation checks passed; 198/198 tests passed with zero failures, skips, cancellations, or TODOs;
- schema validation: 50 documents against 24 schemas, zero errors;
- Doctor: 35 pass, one known nonblocking stale generated parallel-plan warning, zero failures;
- no command reached a real Codex task.

## Fresh headed Dashboard reproduction

Independent QA started a new disposable Temple project and deterministic fake Codex App Server from the exact candidate, then drove headed Chromium at 1440 by 1,000 and 420 by 920 pixels.

- The exact 36-character fixture appeared only in the transient input and local confirmation.
- Six deliberate submissions produced exactly six fake-provider command calls: two `turn/start`, three `turn/steer`, and one `turn/interrupt`.
- The exact transient fixture reached the fake provider once.
- Accepted/active, provider-rejected, delivery-unknown, interrupted, and completed history states were reproduced.
- Six retained command records all reported `instruction_content_retained: false` and contained none of the prohibited legacy/content fields.
- Durable command state, audit, event, checkpoint, condition, daemon, provider, project event, and generated snapshot surfaces contained none of the submitted fixture instructions.
- Retained history showed only omission summary, instruction length, transport status, and execution status.
- Desktop and narrow layouts remained readable without page overflow; the command composer and history collapsed to one column at narrow width.
- Browser console: zero errors and zero warnings.

The fake-provider transcript necessarily held the exact transport payload for the one-time comparison. It stayed outside repository and product durable state and was removed with the disposable fixture.

## Independent decision and boundary

No blocking counterexample was found. Independent QA supports transition to the unclosed Release Gate for this exact candidate only.

Real Codex execution, remote task mutation, new task creation, push, release, publication, and deployment remain unauthorized and untested. Restart replay intentionally cannot distinguish different same-length instruction content because durable content and reversible digests are prohibited; it returns the stored result without dispatch. The stale generated parallel plan must be rebuilt only before a future parallel dispatch and does not affect this sequential item.
