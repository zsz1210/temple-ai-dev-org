# WI-0170 — Verification efficiency

## Authority and scope

The maintainer approved the preceding CI/test audit and its recommendations in this task. This is reversible implementation and local verification, not release, publication, or a model experiment. Standard workflow; Developer Rikku and Independent QA Lulu remain distinct identities.

## Acceptance and design

- Keep every evidence integrity failure: missing revisions, non-durable revisions, wrong preservation tags, missing artifacts, and digest mismatch.
- Deduplicate immutable Git-object and durability queries within one validation invocation only. Batch object reads with bounded memory; never persist a cache across checks or silently drop historical evidence.
- Keep ordinary hosted CI bounded under ADR-0043, consolidate duplicate Schema work into Doctor, and retain full Release verification. Add cheap behavior regressions for the optimized validator.
- Add explicit local core, optional, and experiment test groups. A conservative local changed-path selector includes staged, unstaged, untracked, and comparison-base changes; unknown/shared changes select the full suite. Selection is an editing aid, not release evidence.
- Shrink the acquisition-classifier fixture without changing sealed experiment records or removing full preparation coverage. Consolidate duplicate package/Skill checks and incidental string assertions.
- Align contributor and Agent guidance: documentation-only work uses fast checks; behavioral candidates and Release still require full verification. UI changes retain browser review.
- Record before/after local measurements separately from hosted measurements. Preserve all safety checks and report no unmeasured speedup.

## Risks and stop boundary

Cache lifetime and Git batch parsing must be adversarially tested. Unknown selection must fail toward full coverage, not no coverage. No new dependencies, provider calls, account changes, hosted settings, or overlap with model/workflow-efficiency experiments. Finish with exact-candidate tests and independent review; external integration remains separately authorized.
