# Independent QA

Reviewed candidate: `d1898b45ab0388115d8172c46e61253cd1f84f4f`.
Reviewer: distinct Independent QA identity Lulu (`agent-lulu`), existing `wi0201_lifecycle_recheck` evaluator. Developer: Rikku (`agent-rikku`). This record transcribes the independent evaluator's returned findings; the evaluator made no source or lifecycle writes.

Verdict: pass, no outstanding findings.

- `node --test test/context-enter.test.mjs test/context-packet.test.mjs`: 34 passed, zero failures, skips or cancellations. Source/tests remained identical to the candidate before and after the run.
- Initial candidate review identified an obsolete test that rejected newly supported `--material stage`. Corrected candidate proves explicit stage matches the default digest, sources and schema, while retaining invalid-option rejection.
- Independent challenges retained historical source provenance, mixed-requirement bodies and bodies outside Build/Test. Projected references cannot claim whole-source reuse; composition retains v4.
- Full acquisition precedes optional selection. Exact known inventories and complete actor relations are required; additional source reasons retain whole bodies. No projection safety finding remained.
- The package inventory has 410 files. ADR-0059 is its sole new path relative to the prior reviewed distribution; a synthetic 411th file is rejected. The 8 MiB bound, allowed roots and exclusions are unchanged.
- Distribution instructions match the bounded prompt audit and retain required gates, independent identities and bootstrap obligations. Frozen experiment prompts remain unchanged.

The parent's full verification is separate evidence in verification.md. No live model comparison, external release or production acceptance is claimed.
