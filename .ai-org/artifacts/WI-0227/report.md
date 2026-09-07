# WI-0227: smaller whole-contract candidate

## Result and limits

This candidate rewrites the distributed operating contract and clarifies native
entry routing. It adds no source selector, new Skill, workflow, dependency or
runtime mode. Existing procedure files and all CLI guards remain unchanged.
The repository's project-owned root instructions are deliberately not overwritten.

The cold-entry byte reduction is real but modest; this is not a measured Token,
speed, quality or total delivery improvement. Formal acceptance and integration
remain pending. No live generation, reset, purchase or publication ran.

## Controlled local comparison

Reproduce with [measure.mjs](measure.mjs), from the repository root. Baseline
instruction source is `34c4fb71`. Same current fixture/CLI, same stage/Identity,
scope, procedure bodies and source paths; only the two instruction files and their
synthetic installation's matching lock digest change. This isolates instruction
content, not two product versions. Fixture-only lock construction is never an
upgrade technique for real repositories. The actual upgrade test is separate.

Two-space UTF-8 JSON excludes the CLI trailing newline. In each stage, baseline and
candidate read the same complete source set. No available-body declaration or
inherited Builder context is supplied to the distinct Verifier. All non-instruction
source bodies except the affected lock projection are asserted byte-identical.

| Cold entry | Baseline full | Candidate full | Baseline model | Candidate model |
| --- | ---: | ---: | ---: | ---: |
| Builder | 89,622 | 85,718 | 84,789 | 80,885 |
| Distinct Verifier | 94,473 | 90,569 | 88,984 | 85,080 |

Each full result shrinks by 3,904 bytes: about 4.36% / 4.13%. Source-body totals
shrink by 3,943 bytes (Builder 60,051 to 56,108; Verifier 62,269 to 58,326).
The two instruction bodies together shrink from 21,838 to 17,895 bytes. These
denominators must not be presented interchangeably. Temporary metadata and test
duration can change absolute fixture lengths; paired differences are the comparison.

Normal Build/Test still reads the same whole Skill and Lean procedure, already in
the measured packet; no new follow-up read is required on this path. Both versions
require applicable project/product evidence and native-provider context beyond
this packet. Those unchanged inputs, provider scaffolding and actual tool traces
are not measured here, so 4.36% is not an end-to-end session claim. Exception paths
retain their existing whole procedures; no lower cost is claimed for bootstrap,
recovery, UI, high-assurance or external-system work.

Measured instruction SHA-256:

- TEMPLE: `c0a487a85cf3afb3a79f0236bc0ebb675d296320b45aede43c7ae054c186a04a`
- AGENTS: `7115c4c2c9d40235e428da869e1a6fb9f24c69956aacbfa3c59d4c403250954c`

## Obligation preservation

| Previous instruction area | Retained destination |
| --- | --- |
| Read-only scope, current Position/Identity/Principal, pinned CLI and bounded route | Start with the actual task; native AGENTS Start |
| Authority, exact managed paths, project-owned upgrades, sponsorship and gates | Boundaries that always apply; native AGENTS Authority/Delivery |
| Specification revisions, gate-evidence limits, implementation versus product contracts | Boundaries that always apply |
| Bootstrap native merges, Claude import limits, explicit continuity reads/checks | Bootstrap is a blocking condition; existing temple-init |
| Claim/handoff/finish, failed mutation recovery, distinct Verifier | Existing temple-work, Lean execution/delivery and assurance references |
| Parallel runtime versus support, joins, non-distributed locks, app-task boundary | Procedure triggers plus paragraph below the table; native AGENTS Delivery |
| UI modes, required evidence, normalized High-Assurance evidence and approvals | Conditional table plus unchanged core policies; native AGENTS Delivery |
| Learning lookup, capture, revalidation and intentional promotion | Universal lookup plus conditional Learning row; native AGENTS Authority |
| Four specialized Skills | Four explicit conditional rows: decision, domain, documentation, authoring |
| External reference prerequisite, credentials, tracker and telemetry authority | External systems and integration; native AGENTS Authority |
| Confirmed/unconfirmed/deferred repository policy and no implicit external action | External systems and integration |
| One evidence record, exact candidate, failed/historical diagnostic limits | Finish the approved slice; unchanged lifecycle Skill |
| Pilot purpose, excluded work, freeze and return at stop, no implied follow-on | Finish the approved slice; native AGENTS Safety |

Background capability inventories and duplicate command recipes were removed.
Existing specialized procedures supply their operation details; they are not new
modules appended to every normal task. Whole-source acquisition and independent
required reads remain, including old or project-modified instruction content.

## Verification

Two focused integration cases passed before final review edits: installed whole
contract/procedure reachability for both actors, and synthetic older whole-content
handling with upgrade preservation. The latter preserves custom AGENTS, updates
only tracked unchanged TEMPLE, invalidates stale entry previews, and refuses both
user-edited managed content and untracked ownership adoption.

Separate read-only semantic review found two P2 omissions: four named Skill routes
and the external-reference tracker prerequisite. Both were restored before final
qualification. This review is informational, not Independent QA acceptance.
Final candidate full verification and final semantic recheck are recorded below.
