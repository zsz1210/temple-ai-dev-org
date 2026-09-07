# Retained cost audit and unknown-reason diagnostics

The maintainer approved auditing retained work before selecting one evidence-based
improvement, with offline validation and no new model experiment. Inspection found
that WI-0242 retains command/cwd hashes, not raw commands or outputs. Its twelve
unknown commands cannot be retrospectively classified from those hashes. This
limits the approved optimization: do not invent a redundant workflow step to cut.

## One bounded improvement

Keep all current command classifications unchanged. Add fixed reason-count and
observed-output-byte maps for commands already classified unknown: absent/non-text
command, over-limit command, non-literal outer command, unsupported shell wrapper,
non-literal shell body, or unsupported literal command. These are parser coverage
reasons, not proof of what a command did, wasted work or per-command Token cost.
Shell parsing remains conservative; do not split or execute scripts.

Version the observation record as v3. Reasons contain no raw command, path, output
or free-form error. They are computed only from already-transient inputs, with the
same length, event-count, deduplication and output caps. Six fixed counters per
map, no growing per-command trace. No new actor-visible prompt or core/Console
dependency. Old v2 records remain immutable and lack reasons; do not backfill zero
as an observed historical reason count.

Tests prove unchanged category decisions, every reason, wrapper/expansion cases,
deduplication, missing IDs, count limits, capped/missing output, conservation of
unknown counts/observed bytes and absence of raw sentinel data in serialized
results. Test actual ledger integration without launching a provider. Run one
exact-candidate full suite and distinct QA. This improves future diagnosis only;
it does not establish a Token reduction or recover WI-0242 command bodies.

## Audit and stop

Report exact completed signature repetition separately from semantic rereads,
which remain unknown. Inspect retained candidate changes and evidence registrations
without running its lifecycle CLI or changing any sealed file. Keep the original
failure and historical measurements. Existing Learning evidence-reuse guidance
applies, but no Learning schema, promotion or automatic behavior changes.

Stop after the evidence report, verified diagnostics and focused PR. Do not alter
Lean instructions, model routes, gates, retention policy, test budgets, historical
scores, or launch/prepare another live batch. Further workflow tuning needs an
identified operation-level cause and separate discussion.
