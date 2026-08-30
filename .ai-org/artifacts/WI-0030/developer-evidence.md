# Developer evidence — WI-0030

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `ba066d73900ba2cba70366aeb65af11ec6b944d3`
- Result: pass to Quality & Evaluation

## Corrected privacy boundary

- Durable Agent Command state and Dashboard history now retain only a fixed non-content summary, instruction length, and `instruction_content_retained: false`.
- The durable representation contains no instruction prefix or suffix, reversible hash, request digest, or other reconstructable content for one-character, short, boundary-length, long, or secret-bearing instructions.
- Existing legacy Agent Command records are scrubbed on read so the Dashboard cannot reconstruct an earlier raw preview or digest.
- The exact instruction remains available only in the transient confirmation flow and the single provider call. Target, operation, confirmation, provider delivery states, terminal correlation, and no-automatic-retry behavior remain unchanged.
- After a process restart, durable idempotency remains at-most-once for a matching command key and non-content request shape; a same-process replay additionally compares the exact request in transient memory. This avoids reconstructing or retaining raw instructions after restart.

## Deterministic verification

- Focused Control Plane verification passed 25/25 tests across `test/control-plane-inbox.test.mjs`, `test/control-plane-live.test.mjs`, and `test/control-plane-foundation.test.mjs`.
- Adversarial regressions cover one-character, short, 240-character, 241-character, 4,000-character, secret-bearing, and rejected 4,001-character inputs; exact provider input; exactly-once replay; same-length content mismatch; legacy-state scrubbing; and durable-state, history, and audit non-retention.
- `npm run verify` passed repository checks, documentation-link checks, and all 198 tests with zero failures, skips, cancellations, or TODOs.
- `node ./templew.mjs schema validate . --json` passed 50 documents against 24 schemas with zero errors before handoff.
- `node ./templew.mjs doctor . --json` reported 35 pass, one nonblocking stale generated parallel-plan warning, and zero failures before handoff. WI-0030 is explicitly sequential and no dispatch was taken from that projection.
- `git diff --check` passed.

## Code-first runtime visual review

Two fresh headed-Chromium fixture runs used isolated temporary Temple state and a deterministic fake Codex App Server. The first proved that a complete 40-character secret-bearing instruction was visible in the transient confirmation and sent exactly once to the provider, while the durable command document, Dashboard history, and audit retained only the non-content summary and length. The second re-ran disabled, idle, active, confirmed, accepted, provider-rejected, delivery-unknown, interrupted, completed, desktop, and 420-pixel narrow states. History consistently displayed `Retained summary`, instruction length, and `content retained: no`; the durable state scan found none of the submitted fixture instructions or legacy content fields. The browser console reported zero errors and zero warnings.

All runtime roots and Playwright artifacts were disposable and moved recoverably to Trash after review; no generated runtime state was added to the repository.

## Retained validation boundary and rollback

No command was sent to a real Codex task. Real execution remains separately authorized and untested; the provider observations are deterministic fixtures only. This work performed no task creation, push, release, publication, deployment, external write, model switch, or automatic retry.

Rollback is to keep `agent_commands.enabled` false or revert candidate revision `ba066d73900ba2cba70366aeb65af11ec6b944d3`. Generated local Control Plane state is rebuildable; legacy state is sanitized again on read.
