# WI-0227: smaller whole-contract candidate

## Result and limits

This candidate rewrites the distributed operating contract. The existing native
entry routing is retained unchanged. It adds no source selector, new Skill, workflow, dependency or
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
candidate read the same complete source set. The final AGENTS body is identical;
only TEMPLE and its matching lock digest change. No available-body declaration or
inherited Builder context is supplied to the distinct Verifier. All non-instruction
source bodies except the affected lock projection are asserted byte-identical.

| Cold entry | Baseline full | Candidate full | Baseline model | Candidate model |
| --- | ---: | ---: | ---: | ---: |
| Builder | 89,622 | 85,647 | 84,789 | 80,814 |
| Distinct Verifier | 94,475 | 90,500 | 88,986 | 85,011 |

Each full result shrinks by 3,975 bytes: about 4.44% / 4.21%. Source-body totals
shrink by 4,015 bytes (Builder 60,051 to 56,036; Verifier 62,271 to 58,256).
The two instruction bodies together shrink from 21,838 to 17,823 bytes. These
denominators must not be presented interchangeably. Temporary metadata and test
duration can change absolute fixture lengths; paired differences are the comparison.

Normal Build/Test still reads the same whole Skill and Lean procedure, already in
the measured packet; no new follow-up read is required on this path. Both versions
require applicable project/product evidence and native-provider context beyond
this packet. Those unchanged inputs, provider scaffolding and actual tool traces
are not measured here, so 4.44% is not an end-to-end session claim. Exception paths
retain their existing whole procedures; no lower cost is claimed for bootstrap,
recovery, UI, high-assurance or external-system work.

Measured instruction SHA-256:

- TEMPLE: `eb77e0a0d26c449814f57dde268c7eb6cec5ac2db55014af3669a6bb04eda080`
- AGENTS: `2dc46c464766b4fe45fb27cc3fdd29c7357fe837db9035d0c7f07c6e9864bce3`

## Obligation preservation

| Previous instruction area | Retained destination |
| --- | --- |
| Read-only scope, current Position/Identity/Principal, pinned CLI and bounded route | Start with the actual task; native AGENTS Start |
| Authority, exact managed paths, project-owned upgrades, sponsorship and gates | Boundaries that always apply; native AGENTS Authority/Delivery |
| Specification revisions, gate-evidence limits, implementation versus product contracts | Boundaries that always apply |
| Bootstrap native merges, Claude import limits, explicit continuity reads/checks | Agent-led initialization continuity; existing temple-init |
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

The first full-verification command stopped at the repository naming check before
running tests: an installed project-facing paragraph used the central product name.
It was changed to "The framework". The next full run exposed existing source-text
assertions for the initialization heading/import wording and sequential/parallel
labels. Compatible wording was restored without deleting those assertions or
adding another procedure. Both targeted cases then passed. The final pair above
includes these corrections; the earlier 3,904/3,897-byte deltas are not final.
That intermediate candidate was `fc2cb724646604af0d5b037597d21ef103fa0dad`.
Its full run then exposed central/distributed native-router parity: adding a
redundant AGENTS sentence while preserving project-owned root instructions broke
the parity assertion. The existing router already selects TEMPLE and applicable
Skills, so the redundant addition was withdrawn rather than overwriting the root
or weakening the test. All three targeted compatibility cases passed. The final
candidate is `f706239624b3fe9748767ea58128ebf5a2b587ea`.

The reviewer rechecked both initial omissions and found no remaining concrete
obligation loss, broken destination or expanded permission. Subsequent changes
only restored compatibility wording, the project-native name and the unchanged
native router. Full suite and
formal lifecycle acceptance remain distinct from that informational review.

Final candidate `f706239624b3fe9748767ea58128ebf5a2b587ea` passed
`npm run verify`: **698/698**, zero failed/skipped/cancelled, 172,370 ms test duration.
Repository/link/package checks passed (412 packaged files). Only evidence/state
updates follow that behavioral revision; those do not alter its tested instructions.
