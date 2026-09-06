# WI-0183: Reduce the cost of executing an existing Lean task

Status: reviewable proposal, not approved architecture or implemented behavior.

The user authorized design after WI-0182. This document completes the bounded intake proposal. It does not authorize runtime changes, policy activation, model comparisons, merge or release. WI-0183 remains in intake for review; no delivery gate or Independent QA is claimed.

## Problem and observed baseline

The [WI-0182 comparison](../WI-0182/report.md) completed all eight stages, including a fresh Verifier for each delivery. Ordinary and Temple both passed the same acceptance checks. Temple operational Tokens were 45.60% higher for Terra medium and 155.08% higher for GPT-6 Astra medium; stage time was 28.85% and 44.14% higher. This is one pair per model with uncontrolled cache behavior, not a general causal result.

That experiment already used Lean, compact Context/Status/Doctor and composed Developer delivery. Naming a shorter workflow or shrinking successful diagnostic output again is insufficient as the main proposal.

[Recorded operations](../WI-0182/results.json) expose two investigation targets:

| Combined Builder and Verifier | Terra ordinary / Temple | GPT-6 ordinary / Temple |
| --- | ---: | ---: |
| Completed command executions | 24 / 36 | 17 / 34 |
| Reported `cat` output bytes | 11,072 / 74,288 | 13,049 / 94,414 |

Commands include useful product work as well as administration. Bytes are not Token attribution, and command counts are not model-round counts. These observations justify testing narrower acquisition and fewer administrative interactions, not claiming that either explains all overhead.

## Recommended decision

Keep the existing Lean workflow and its evidence requirements. Add an opt-in execution path that prepares stage-specific material and composes mechanical administration. Do not introduce a fourth workflow, an automatic profile downgrade, a model change, or another AI coordinator.

Two boundaries remain explicit: a stage input is a derived view of repository authority; a completion receipt reports validated administration and cannot substitute for product judgment.

## 1. Prepare stage material once, with traceable coverage

Extend the existing resolver rather than create a separate search system. A proposed transient response, provisionally called a stage packet, contains:

- Work Item, effective stage/purpose/profile, assigned Position and explicit Agent/Principal identity.
- Scope, acceptance, applicable constraints, exact candidate and handoff references, current claim and unresolved issues.
- Required source material for that responsibility, with source path, content digest and section identity where applicable.
- A manifest that distinguishes mandatory material, supporting on-demand references, missing inputs and the reason for every selection.
- Proposed next operation and eligibility reasons, explicitly marked as navigation until the mutation validates authority.

This differs from today's compact Context, which routes to files but does not deliver their bodies. Keep existing compact/full schemas and defaults compatible. Do not store source bodies in `.ai-org/views`, an index, a Work Item or an audit event. Stream authorized local material to the caller; retain only references and hashes in framework records. Provider retention remains governed by the existing provider/privacy policy; this feature must not silently expand it.

### Coverage and freshness

Use explicit stage rules and source mappings, not an LLM-generated summary of policy. Generic mandatory instructions are retained. Prefer complete relevant small documents; section extraction needs stable explicit markers and source provenance. If a source lacks trustworthy applicability metadata, read the whole required source or use the existing route. Do not silently truncate a required restriction to meet a byte target.

Bind material to repository identity, Work Item revision, stage, purpose, profile, source manifest and the complete relevant authority snapshot. Recheck at use and again inside the mutation lock. Changed authority, candidate, evidence, claim or stage invalidates the prepared operation. Unchanged hashes can avoid rereading only within a session that actually received the material; they never prove that a fresh session loaded or understood it.

Native provider instructions and the current bootstrap contract remain mandatory. In particular, this proposal does not simply delete AGENTS.md/TEMPLE.md reads from the experiment. Changing cold-entry acquisition needs an explicit reviewed entry contract and instruction-coverage tests. Count provider-injected material as part of acquisition where observable; label it unknown otherwise.

ADR-0047 intentionally rejects stored capsule bodies and ADR-0054 keeps compact Context navigation-only. Before implementation, a successor ADR must define the transient source-delivery boundary and any narrowly scoped entry-contract change. Until that is accepted, the existing required reads continue. If those reads leave insufficient savings, record that result rather than bypass them.

## 2. Compose administration through existing validators

Proposed interfaces are conceptual, not executable CLI syntax:

| Operation | AI supplies | CLI performs | Result |
| --- | --- | --- | --- |
| Prepare stage, read-only | Work Item, Position, explicit Identity/Principal | Resolve material, check eligibility, identify missing inputs | Material plus bound operation preview; no claim or state change |
| Start stage, mutation | Same explicit identity, request ID and prepared-state binding | Revalidate and claim through the current claim operation | Claim receipt or a typed rejection |
| Finish Developer stage | Claim, exact committed candidate, completion facts, existing evidence, stable operation ID | Existing composed `deliver`, then full Status rebuild and Doctor with compact reporting | Administrative receipt plus separately scoped diagnostics |
| Finish Verifier stage | Its own claim, exact candidate, judgment and verification evidence | Validate distinct identity and evidence; compose authorized release and Lean acceptance transition, then full diagnostics | Judgment reference, mutation receipt and diagnostics |

Do not execute arbitrary shell strings from the packet. Implementation and test commands remain explicit actor work in the first version. The CLI checks evidence structure, provenance and revision; it does not invent evidence or infer semantic correctness from a successful command.

Initially support only the eligibility envelope of current bounded local low-risk Lean delivery, no interface and no active runtime worker. The fresh Verifier remains a different Agent Identity from Builder and does not claim formal Independent QA. Standard and High-Assurance retain their existing operations and gates. Do not weaken sponsorship, membership, conflict, resource, approval or candidate checks.

### Recovery and truthful receipts

Reuse the delivery journal and shared preparation functions where appropriate. Normalize each request, bind evidence and authority, and record operation identity before mutation. Test interruption at each persistence boundary. An exact replay reports historical application and never creates duplicate handoffs or transitions; a changed request cannot reuse an unsettled operation.

Separate lifecycle mutation from subsequent projection/diagnostics. A diagnostic failure after a committed handoff or acceptance is not atomic rollback. Return `mutation=applied`, the resulting stage, `diagnostics=failed` and scoped failure evidence; never return overall success or repeat the lifecycle mutation to retry a view rebuild. A diagnostic repair refreshes diagnostics only after state validation. Changed source/state invalidates that diagnostic result too. Preserve attention even if the lifecycle record is already terminal.

The first version runs the existing full checks. Incremental Doctor caching and dependency invalidation are excluded until their correctness and actual local cost justify separate work.

## 3. Select a smaller execution path without reducing assurance

Use existing workflow/profile assessment as the eligibility authority. Lean remains opt-in with recorded low risk, bounded scope, clear acceptance and rationale. The new execution path is also opt-in initially; no free-text guess or observed Token threshold can downgrade a Work Item.

If scope becomes ambiguous, ownership conflicts appear, required material is unavailable, or stronger risk signals arise, stop the prepared mutation and explain the required existing route. After Build, preserve produced evidence and follow the existing replan procedure instead of silently changing profiles. Cost limits stop work; they never convert incomplete checks into a pass.

The intended fast case still has a brief, a Builder, a fresh Verifier and durable evidence. Small tasks should avoid unrelated organization documents and repeated administrative decisions. Larger or riskier work receives the additional controls already required by its profile.

## Delivery slices and dependencies

| Slice | Scope and likely modules | Exit evidence |
| --- | --- | --- |
| A: contract and acquisition | Proposed ADR; source applicability and transient packet schema; `src/context.mjs`, `src/context-entry.mjs`, routing tests | Coverage, stale-source, cold-entry, privacy and fallback fixtures; measured source and response bytes |
| B: composed completion | `src/lean-delivery.mjs`, `src/lean-delivery-state.mjs`, shared preparations in `src/work-items.mjs`, CLI and recovery tests | Administrative equivalence to existing commands; failure-boundary/replay tests; fresh Verifier separation |
| C: bounded entry integration | Existing profile assessment and narrowly updated entry/Skill references after contract approval | Correct routing and required-read coverage for eligible, ineligible and ambiguous cases; no new profile |
| D: future comparison | New protocol and versioned command grammar in the comparison harness | Frozen treatment, ordinary baseline, exact model/effort records and bounded generation authorization |

These are suggested implementation boundaries, not dispatched tasks. A and B should be measured separately before combining them. Do not activate entry shortcuts before A proves coverage. Do not change existing Skills or managed instructions from this proposal alone.

## Validation before any new model run

1. Run deterministic fixtures for ordinary eligible work, missing acceptance, stale candidate/handoff, revoked membership, conflicting claim, stronger risk, wrong Position, changed source, missing mandatory material and a cold session with no prior acquisition.
2. Test safe path containment, symlinks, missing/unreadable sources, hostile repository content treated as data, complete source provenance and absence of persisted packet bodies. An incomplete packet is explicitly incomplete.
3. Compare separate and composed operations semantically: same resulting stage, ownership, gate evidence and artifact content, allowing only expected IDs/timestamps to differ. Inject failure before and after each write and each diagnostic step; assert exactly which writes occurred and whether retry is legal.
4. Prove positive and negative route adherence in the actual installed-provider sandbox without model generation. A shorter-looking prompt or grammar-only test is insufficient.
5. Run focused editing tests, then full repository verification and an independent review for the behavioral candidate. Keep Developer and Independent QA distinct. No live generation until known readiness blockers are resolved.

## Future measurement contract

Preserve WI-0182 exactly. Do not edit its labs, protocol, approval, consumed locks or results. A future comparison needs a new frozen protocol because the treatment and possibly entry contract change. This design request authorizes no such generation.

Keep the same small feature, shared specification, product acceptance and fresh Verifier so the improvement cannot be explained by easier work or deleted validation. Compare against a competent ordinary process. Record packet-only and administration-only effects in bounded incremental trials before relying on the combined result; do not automatically launch a large factorial matrix.

Predeclare exact models and requested effort, sample count, counterbalanced order within each model, stage/aggregate limits and stop conditions. Observe effective model/effort only where the provider supplies evidence. Record all failed, interrupted, ineligible and fallback cases, and keep caches/unknown acquisition separate. Freeze any repeated-sample analysis before looking at outcomes; do not rerun until favorable.

Measure accepted correctness, omitted obligations, rework, human intervention, elapsed delivery, uncached input, cached input and output separately. Report framework setup/coordinator usage outside the actor table but alongside it. Do not claim per-operation Tokens from output bytes. Log operation count, acquisition bytes and per-operation local time as diagnostic measurements.

The proposed engineering target is no lost acceptance or required safeguards, with at most 10% extra operational Tokens and elapsed stage time for this simple task class relative to ordinary delivery. This is a candidate target, not a measured result, a universal threshold or a statistically qualified non-inferiority claim. Source/command reductions are readiness evidence only. If the bounded trial misses the target, report the miss and stop; retain opt-in status and do not advertise an efficiency win.

## Design review decisions and completion

Recommended defaults: existing Lean, deterministic source selection, transient material, shared CLI validators, full diagnostics, explicit fresh verification, staged measurement and no model switch. Avoid a fourth profile, vector retrieval, another agent layer, LLM policy summarization and more globally shortened prose as the first response to this result.

The important unresolved engineering question is whether a validated cold-entry contract can remove enough redundant acquisition without hiding mandatory instructions. Slice A must answer that before promising Token savings. This draft records the design; implementation, accepted ADR status and a new comparison remain separate future decisions.
