# Bounded experiment observations

## Approved scope and acceptance

Implement the user's approved next step after WI-0220: improve diagnostic evidence
using local tests only. No model run, default-format change, guard relaxation,
release or edits to sealed laboratories. Preserve the existing command decisions.

Capture recognized Node TAP/spec failure IDs as per-run keyed hashes and allowlisted error
types, never names, messages, stacks, expected/actual values or raw output. Unknown
formats and truncation remain explicit. Snapshot the fixed fixture implementation,
public/added tests and package configuration at command boundaries using bounded
reads and keyed content fingerprints. This is boundary observation, not atomic
proof of inputs throughout execution. Missing inputs are not empty files.

For successful literal unnumbered cat reads, verify complete output against bounded
file snapshots before recording whole-file exposure. Use the existing recognizer
and path policy; unsupported glob/range/numbered forms remain unknown. For context
entry, record only bounded whole bodies actually included, not null/reused rows.
Identify sources and content with per-run keyed hashes. Deduplicate within one
stage observer; a new Verifier gets fresh state. Repeated same-content exposure is
a candidate for analysis, not proof of redundancy, comprehension or wasted Tokens.

## Risk controls

No raw text in new evidence. Cap output inspected, file sizes, source rows, failure
rows, and retained stage observation state. Reject symlink/nonregular/outside-root
reads. Fail observation to unknown without granting execution or changing policy.
Do not scan repositories, contact a provider or spawn processes for telemetry.
Bind the new observer and tests into the existing source digest. Old sealed runs
are verified but never enriched retrospectively.

## Local verification

Test anonymization, arbitrary secret sentinels, malformed/truncated output, missing
and oversized inputs, symlinks/traversal, same-content versus changed-content,
fresh-stage reset, context reused rows, unsupported reads and unchanged allow/deny.
Run the focused suites and required full verification before submitting a PR.

## Coordination

WI-0172, WI-0190, WI-0208, WI-0209, WI-0210, WI-0211, WI-0212, WI-0215, WI-0216 and
WI-0218 are historical overlapping scopes with no active claim at inspection.
This successor starts from merged main 5ce1148f, preserves their evidence, and
owns only the declared diagnostic source/test paths. No parallel writer is dispatched.
