# ADR-0061: Opt-in operation-scoped Lean procedures

Status: accepted for bounded implementation; no default or verification-policy change.

## Context

Lean entry currently sends the combined Build/Test completion procedure to each
actor. Smaller inventory output alone does not remove that reading obligation.
The active operation can select a complete authored module without an LLM summary.

## Decision

Add explicit `context enter --material operation`. Retain native instructions,
full policy acquisition, task contract, current evidence, actor checks and existing
Lean eligibility. The complete common procedure plus the current Build/Test module
can replace the combined procedure only when all required procedure bytes match
the supported framework source. Unknown or independently required sources keep
the whole-source route; never strip arbitrary Markdown sections.

Record module provenance, byte measurements and a representation digest. Reading
and comprehension are not inferred. Cold sessions read current material; declared
reuse remains restricted to whole sources actually available in that session.
The distinct Verifier and existing finish/recovery behavior are unchanged.

The installed Skill links both stage modules. The framework distribution source
owns these files; existing project-owned files and managed-file collision rules
remain protected by ordinary init/upgrade handling.

## Consequences

Default stage/task entry remains available. The smaller procedure may reduce
irrelevant reading, but full governance sources still impose cost. Byte changes
are deterministic structural evidence, not Token, elapsed-time or quality gains.
Model-following and complete-delivery benefit require a separate live comparison.
