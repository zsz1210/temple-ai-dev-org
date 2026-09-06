# Developer verification

Candidate: cbc18f9b7d15c98c3236325f3a0734b1a7853f4b.

Final full-verification log SHA-256: `4b22d02e0980b379afe898725147fcac02fe83b359d2a34aebdaf1e5afa54067`.
Focused log SHA-256: `1d28fdcdd468a0aaaffa37d26a1310d975dbae25e551cefbfec25f3e46a751bf`.

## Results

- `npm run verify`: 635 passed, zero failures, cancellations or skips; 156843.89125 ms for the Node test suite. Check, documentation links and package checks also passed as prerequisites. Log retained locally at `/tmp/wi0206-verify-final.log`.
- Focused new regressions: 3 passed, zero failures or skips. Exact/current whole sources can omit their body; defaults and empty declarations remain unchanged. Malformed/duplicate/unsafe input, stale hashes, unselected paths, projections, recovery, incomplete acquisition, missing files, wrong actor and changed preview bindings preserve the boundary.
- Synthetic installed entry source-body bytes: 57,843 before, 51,230 after an explicit available AGENTS.md declaration, a reduction of 6,613 bytes. This is one fixture's emitted source-body measurement, not total JSON size, model-visible input, Tokens or a live efficiency result.
- `git diff --check`: passed.
- Doctor before handoff: 36 pass, one stale generated parallel-plan warning, zero failures. No parallel dispatch occurred. Historical worker-attention observations remain unchanged.

The first broad verification ran while CLI edits were still in progress and reported source-drift and the initial unknown-option defect. It is invalid as acceptance evidence and is retained in `/tmp/wi0206-verify.log`. The final complete run above used a fixed committed candidate, with no further source edits during verification.

## Scope and remaining work

No new model calls, replay of live approvals, Credits purchase, reset, publication or merge. WI-0203/0205 records and historical labs remain unchanged. This completes the Developer slice only; Test, evaluation and distinct Independent QA have not been performed for this candidate. The default authority/gate selection remains unchanged. Semantic source-selection minimization and any live efficiency comparison are deferred to separate reviewed work.

Caller availability is an explicit assertion, not something the CLI can prove. Fresh sessions must not reuse another session's declaration. All source safety, freshness, authority and mutation guards still run; no reading or bootstrap requirement is waived.
