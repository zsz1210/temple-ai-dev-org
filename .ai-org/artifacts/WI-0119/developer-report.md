# WI-0119 Developer report

## Outcome

Temple now has a separate adaptive execution-routing foundation:

- Position remains responsibility and authority rather than a model assignment;
- one Work Item can describe several independently routed Execution Steps;
- each step declares a structured Task Shape, required and optional capabilities, policy constraints, and typed resource observations;
- the project-owned Execution Policy filters hard constraints before applying an explicit preference and fallback;
- requested Provider, model, and reasoning remain separate from future effective observations; and
- pinned, shadow, and advisory resolution performs no Provider contact, task launch, model switch, or canonical mutation.

The distribution seed is Provider-neutral. This repository maps its own profiles to approved GPT-5.6 configurations without changing the reusable default. A content-production fixture proves that a project can add media capabilities and a `video_producer` responsibility without adding a framework core Position.

## Verification

Candidate revision: `d5862757d29d77ef77d2d833350aa20ddd62a4f4`.

- `npm run verify`: 325 tests passed; zero failures, skips, or cancellations. Repository checks, documentation-link checks, and npm package-boundary checks passed.
- Focused execution-routing, installation, Observer, Console, and viewer tests: 49 tests passed before the final exact-revision run.
- `npm run test:browser`: Chrome 152 passed all six primary Management Console views at 390×844, 768×1024, 1440×1000, and 3440×1440, plus the reduced-motion contract.
- Manual Playwright inspection of System → Configuration at 1600×1000 and 720×1000 exposed and then verified one real integration repair: the safe Management Console projection now retains `execution_routing` instead of rendering `Unavailable` and zero counts.
- The repaired real page showed `Advisory`, 4 profiles, 5 capabilities, and 10 resource measures with no horizontal overflow and zero browser console errors or warnings.
- `temple schema validate` reported 143 valid project documents across 33 cataloged schemas.
- The WI-0119 sample request resolved all three execution steps independently: critical planning for high-risk architecture and Independent QA, standard execution for implementation, and no effective Provider observation.
- `temple doctor --no-write` reported 36 passes, one pre-existing stale-parallel-plan warning, and zero failures.

## Failure-driven corrections

Two integration failures improved the candidate before handoff:

1. the schema catalog initially used an unsupported filename pattern and was corrected to the catalog's explicit `*.json` contract; and
2. the Console's compact safe projection initially omitted the new execution-routing summary and was corrected with a regression test plus real-browser verification.

Unknown required capabilities now fail closed, while unknown optional capabilities remain visible without blocking an eligible route. Resource ceilings reject an over-budget preference before a lower eligible profile is selected. Command-like quoted input remains inert data.

## Boundary

This evidence qualifies the deterministic local foundation only. No model comparison, Provider call, autonomous execution, deployment, publication, push, merge, or release was performed. Automatic execution requires a later separately governed design and evidence threshold.
