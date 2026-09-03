# Independent QA attempt 1 — WI-0120

## Verdict

**Fail** for candidate `486c64df3006e6e8df6c3dd6d51a8a6e29c9843d` and handoff HEAD `52b2b70aa5d8425a88c8e28a22a89373c8905923`.

The review ran in a separate Codex task as Lulu (`agent-lulu`), distinct from Developer Rikku (`agent-rikku`). It was read-only and left the repository clean.

## Release-blocking findings

1. A Route with non-empty `unknown_required` could remain `resolved` with an eligible selected profile and pass both Ajv and `validateExecutionRoute`.
2. Requested `provider_id`, `model`, and `reasoning_effort` were independently nullable, so a partial concrete mapping could pass both layers.
3. Selection contradictions could pass: pinned resolved with fallback applied, or advisory unresolved with a pinned-only failure reason.

Additional low-severity gaps allowed whitespace-only Work Item, Task Shape, Provider, and capability strings, plus overlap between required and optional capability sets.

## Evidence

- Independent adversarial matrix at `2026-09-03T03:26:13Z`: four valid routes passed; 35 malicious mutations tested; 26 rejected and nine unexpectedly accepted.
- `npm run verify`, `2026-09-03T03:26:43Z` through `2026-09-03T03:27:52Z`: 327 passed, confirming the committed tests did not cover these bypasses.
- Schema validation reported 144 documents across 33 schemas as valid.
- Doctor reported 36 pass, one unrelated stale-plan warning, and zero failures.
- CLI route resolution performed no canonical mutation.
- The implementation and handoff revisions differed only in evidence and lifecycle records, so the findings apply to both.

The next candidate must retain all nine accepted bypasses as negative regressions and re-enter Independent QA from Build.
