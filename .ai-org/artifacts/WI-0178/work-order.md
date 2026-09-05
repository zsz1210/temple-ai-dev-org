# WI-0178 — Bounded delivery entry and recoverable operations

## Approved scope

The maintainer approved the combined design after reviewing the comparison results and PR #56. Integrate the existing Lean delivery implementation; provide a compact read-only Context entry; layer the lifecycle Skill; classify recoverable failures without weakening guards. This is Standard, standard-risk, bounded maintainer work with no user-facing graphical interface. Mog integrates, Rikku implements, and Lulu independently reviews the exact candidate through a separate runtime.

No model experiment, routing-policy change, Credits purchase, reset, release, npm publication, Console, daemon, or external integration is included. A passing candidate may be submitted as a PR under the standing instruction. Main integration is not included in this slice.

## Acceptance

1. `work-item deliver` composes the existing validated Lean Developer handoff, claim release and Build-to-Test edge. It preserves main's exact-revision, rework, authority, profile, evidence, and claim checks. The same completed request is idempotent; interrupted writes resume only with unchanged inputs and recognized before/after images. Invalid or conflicting recovery fails closed.
2. `context resolve --compact --no-write --json` projects current responsibility, scope, acceptance, candidate, unresolved work, required source references and the next profile edge without becoming lifecycle authority. It does not mark sources as read, change state, hide warnings, or create an approval. Full output remains compatible.
3. `temple-work` keeps essential boundaries and routes specialized parallel/assurance procedures to conditional references. Managed installed copies change only through a supported upgrade. No project extension is overwritten.
4. JSON errors on the new entry/delivery paths identify preflight input repair, stale plans, pending recovery, and guard/unknown failures. No automatic command execution or unlimited retry is added. Unknown persistence state must never be reported as no mutation.
5. Local behavioral tests exercise ordinary and composed delivery, interruption boundaries, rework, compact-output freshness, input/authority failures, install/upgrade, and read-only operation. Complete `npm run verify` and distinct exact-candidate QA precede completion claims.
6. The sealed comparison remains unchanged. Local bytes, invocation counts and elapsed measurements are not model Token, quality, or efficiency proof. A future matched experiment needs a fresh protocol and an exercised command policy.

## Branch isolation and provenance

Base: `18c954cfe7f276c46b89a680f05224da5f80ac33`. Implementation source: `bba20cc140b72068827c7c858008c9768a16f067` on `codex/wi-0173-comparison-diagnostics`. Import only the named Lean delivery source/tests, adapted to current main; do not import that branch's canonical Work Items, event stream, Evidence IDs, ADR numbering, or experiment harness. Existing Temple code retains Temple's MIT provenance; no third-party implementation is copied.

The source branch's independently allocated WI-0178 is a different historical record. Every reference to it here is qualified by source branch and commit. This main-derived WI-0178 does not replace that record. Main WI-0172 reserves the other task's comparison scope; its `scripts/delivery-control-pair.mjs`, `test/delivery-control-pair.test.mjs`, and artifacts remain untouched. The broad `test` affected-path overlap is resolved by this exclusion.

Frozen SHA-256 checks on the source branch:

- `terra.protocol.frozen.json`: `88f8810639b8938f508a3e834d96ff03b82f015c52a2fe78f6e8e8430dff1475`
- `gpt6.protocol.frozen.json`: `c956a2e13170df7487303a75faf9df286a9825f86da45f44fc2a3b1b2ada147d`
- `comparison.json`: `25b71ddfecc2e6b69a12c937c09093b8bcd9d7347cce7b7c65771ad0cf64bfc4`

## Delivery and rollback

Implementation stays sequential because shared lifecycle and CLI contracts overlap. Independent review may run alongside coordinator evidence checks after the behavioral candidate is committed, without concurrent product edits. Record claims and exact handoffs through the pinned CLI. Retain separate runtime QA, and do not describe author's checks as independent.

Rollback uses a normal revert PR and supported upgrade from the reverted source after any pending delivery transaction has been recovered or explicitly investigated. Never delete a pending journal to bypass its lock. No live service or publication is changed.

Stop after an evidence-backed PR candidate. Model comparisons and their quantified conclusions remain a separately frozen follow-up.
