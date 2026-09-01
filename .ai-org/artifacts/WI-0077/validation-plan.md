# Validation plan — WI-0077

## Purpose

Validate comprehension and trust before changing production Console code. Visual preference alone is not sufficient evidence.

## Current validation status

| Evidence | Status |
| --- | --- |
| Owner review of information architecture and visual direction | Accepted on 2026-09-01 |
| Browser smoke, responsive reflow, reduced motion, private-view treatment | Passed for the preview artifact |
| Seven scripted comprehension tasks | One owner-led directional session started on 2026-09-01 and stopped after Proposal T3; no comparable timing was recorded |
| Current Console versus preview comparison | Same-dataset qualitative evidence recorded; incomplete and not statistically qualified |
| First production slice comparison | Not available; Build not authorized |
| Real multi-human and enterprise-scale qualification | Deferred |

The accepted preview may guide implementation planning. It does not yet support a quantitative usability-improvement claim.

## Owner-led directional observation — 2026-09-01

The owner used the same controlled fixture on the baseline and proposal. Timing and confidence were not recorded, and the owner intentionally stopped the session after Proposal T3. These results are product feedback, not a completed usability comparison.

| Surface | Result | Observation |
| --- | --- | --- |
| Baseline | 0 pass · 4 partial · 3 fail | The owner could often find a destination but could not reliably interpret urgency, execution, Provider state, responsibility, or a specific history record. Usage was discovered, but the static one-observation total looked like a broken live meter. |
| Proposal | 1 pass · 2 partial · 4 not run | The owner immediately preferred the direction and correctly read Design, Unclaimed, and Clear. The review button's side effect was ambiguous, and duplicate `WI-0077` appearances caused UI Designer Yuna to be mistaken for the responsible owner. |

Resulting refinements:

- label read-only navigation separately from Agent execution or approval;
- show Work Item responsibility, supporting artifact ownership, and Human review authority as distinct relationships;
- label Usage coverage and freshness before showing totals;
- make fixed-preview History retrieval controls functional rather than decorative.

The refined preview is the current design baseline. Production Build, deployment, release, and publication remain outside WI-0077.

## Diagnostic usability rehearsal — 2026-09-01

This was a browser-driven diagnostic, not a human usability study.

- Participants: zero human test participants; one Playwright-driven inspection.
- Viewport: 1440 × 900 CSS pixels.
- Baseline: the live private-LAN Console after a repository refresh.
- Proposal: the static WI-0077 preview in its `current state` scenario.
- Comparison control: not satisfied. The baseline read current repository state, while the preview contains an illustrative fixed dataset and did not reflect the claim created for this rehearsal.
- Timing: automation duration was not recorded as human task-completion time.
- Step count: direct navigation or disclosure interactions from Overview to the first surface containing the answer.

`Pass` below means the answer was mechanically present and semantically matched the inspected scenario. `Partial` means that only part of the answer or an illustrative control was available. `Fail` means the visible answer was absent or contradicted the current objective. These labels are design diagnostics, not usability scores.

| Task | Live Console baseline | Static preview | Machine-observed conclusion |
| --- | --- | --- | --- |
| Identify the next human action | **Fail · 0 steps.** Overview says to resolve two blocked Work Items before more execution. | **Pass · 0 steps.** Overview identifies the WI-0077 direction review as the current decision. | The proposal removes a false-attention path, but a human must still confirm that the wording leads to the intended decision. |
| Find lifecycle, execution, and impediment for WI-0077 | **Partial · 2 steps.** Work → WI-0077 exposes `In progress` and `Stage: Designing`, but not three separate state axes. | **Structural pass · 1 step.** Work exposes `Design`, `Unclaimed`, and `Clear` together. | The proposed state model is retrievable. Its values are illustrative and cannot prove live data correctness. |
| Find the responsible Position, Agent or Human, and effective model | **Partial · 1 step.** Work shows Tidus, Tech Lead, and `not observed`; it does not connect an accountable Human to the item. | **Partial · 1 step.** Work shows Tidus, Tech Lead, the Work Item/task chain, and `Not recorded`; it still does not connect an accountable Human to this item. | Unknown model evidence remains honest in both. The Human-authority relationship needs an explicit design decision or task-specific explanation. |
| Explain whether a blocked item stops the current objective | **Fail · 0 steps.** Overview treats every blocked Work Item as a reason to stop new execution. | **Pass · 0 steps.** The retained validations appear under `Follow-up` with `Important, but not blocking this objective`. | This is the strongest evidence for Slice 1 semantic correction. |
| Distinguish a current Provider incident from historical evidence | **Partial · 2 surfaces.** Health contains current Provider state and Activity contains history, but the user must reconcile them across pages; `observed not observed` is also difficult to parse. | **Pass · 0 steps for the headline, 2 for detail.** Overview states that no current Provider failure blocks review; System → Status labels operational impact rather than historical failure. | The proposed hierarchy is clearer, but must later be tested with a fixture containing both a live incident and a historical failure. |
| Explain what the usage evidence supports | **Pass · 1 step.** Usage says that observations are measured-only and do not prove cost, savings, quality, or routing authority. | **Pass · 1 step.** Usage separates `Supported` from `Not supported yet`. | The production baseline is already strong here; implementation should preserve its evidence boundaries while improving scanability. |
| Retrieve a completed item or audit event | **Partial · 2 steps.** Activity → WI-0001 opens a completed item, but the page requires scanning a very long unfiltered list. | **Partial · 1 step for a visible recent item.** History presents search, tabs, and pagination visually, but entering `WI-0067` and switching to `Audit trail` did not filter or replace the rows. | The information architecture is plausible; retrieval controls remain unimplemented and cannot be counted as working. |

Directional result: the live baseline produced **1 pass, 4 partial results, and 2 failures**. The static proposal produced **5 structural passes and 2 partial results**. This does not establish a measured improvement because there were no human participants, the datasets differed, and some preview controls are intentionally non-functional.

## Controlled comparison kit

The next comparison no longer depends on the repository's changing live state:

- `controlled-usability-fixture.json` defines one fixed mixed-state semantic dataset and seven task prompts.
- `controlled-comparison-server.mjs` gives that dataset to the actual production Dashboard renderer and contract-checks the design preview before serving it.
- `human-usability-test.md` separates participant prompts, observation fields, evaluator answers, thresholds, and interpretation rules.

The harness refreshes only the snapshot generation timestamp so the production renderer does not disable the read-only page as stale. Work Items, conditions, history, organization, and usage facts remain fixed. The proposal's historical Provider event is materialized by the harness from the same fixture because the static preview did not previously contain that mixed-state row.

This kit removes the prior dataset mismatch. It does not remove participant learning effects, implement the proposal's illustrative History controls, or produce human usability evidence by itself.

### Harness verification — 2026-09-01

The controlled kit was exercised in Chromium at 1440 × 900 and 390 × 844 CSS pixels:

- the actual production renderer loaded all six primary views from the fixture with no browser console errors;
- the proposal contract passed and its controlled Overview, Work, Team, Usage, System, and History surfaces loaded with no browser console errors;
- both Overview surfaces had no page-level horizontal overflow at 390 CSS pixels;
- the proposal's six icon navigation controls now expose human-readable accessible names;
- the proposal's closed mobile navigation is inert, opens from the keyboard, moves focus to the current destination, closes with Escape, and returns focus to the menu button;
- the proposal's History search and type/outcome filters now change the fixed preview rows; pagination remains intentionally disabled because the preview contains only a bounded record set.

Comparison screenshots are under `output/playwright/wi-0077/controlled-comparison/`. These machine checks validate harness operability and responsive mechanics, not human comprehension time.

### Browser evidence

Local screenshots were captured under `output/playwright/wi-0077/usability-rehearsal/`:

- `baseline-overview.png`, `baseline-work-detail.png`, `baseline-health.png`, and `baseline-activity.png`;
- `preview-overview.png`, `preview-work.png`, `preview-usage.png`, `preview-system-status.png`, and `preview-history.png`.

The browser run also verified that the live private-LAN Console refreshed its `Last updated` value after reload. It did not establish unattended real-time refresh behavior.

### Decision impact

- Preserve the baseline Usage interpretation boundaries.
- Keep Slice 1 focused on lifecycle, execution, impediment, and objective-specific blocker semantics.
- Treat History search, filtering, pagination, and tab contents as future behavior to implement and test, not completed preview functionality.
- Do not use this rehearsal to authorize Build or claim a usability improvement.
- Before a production comparison, use the deterministic mixed-state fixture below so the baseline candidate and implementation candidate answer against the same facts.

## Test contexts

- Solo developer coordinating several AI Agents.
- Collaborative lead or Product Manager coordinating humans and Agents.
- Developer, Designer, QA, or Release owner filtering to their responsibility.
- Enterprise observer with read-only authority.
- Loopback operator and private-network viewer.

## Scenario dataset

Use a deterministic mixed-state fixture containing:

- one current specification item;
- one actively claimed build item;
- one testing item;
- one release-gate item;
- one true dependency blocker;
- one intentionally retained future validation;
- one provider condition and one historical failure;
- one Work Item with Token/model evidence and several without it;
- enough completed work and audit events to require filtering and pagination.

The fixture must not imply that the current one-observation usage dataset is statistically meaningful.

## Tasks and success thresholds

| Task | Target | Failure signal |
| --- | --- | --- |
| Identify the next human action | Correct within 10 seconds | Chooses retained validation or historical evidence as urgent |
| Find lifecycle, execution, and impediment for a named Work Item | Correct within 15 seconds | Conflates blocked with lifecycle or running state |
| Find the responsible Position, Agent/Human, and effective model | Correct within 15 seconds | Relies on memorizing an Agent display name |
| Explain whether a blocked item stops the current objective | Correct within 20 seconds | Treats every blocked item as global |
| Distinguish a current provider incident from historical evidence | Correct within 15 seconds | Treats a closed observation as live failure |
| Explain what the usage evidence supports | Correct within 15 seconds | Infers cost or statistical qualification |
| Retrieve a completed item or audit event | Correct within 20 seconds | Requires unbounded scrolling or raw-file lookup |

## Measures

- Task success rate.
- Time to correct answer.
- Wrong-inference rate.
- Navigation steps and filter changes.
- Scroll distance at each viewport.
- False-attention rate: non-urgent items selected as urgent.
- Confidence rating after each task.
- Accessibility checks for keyboard completion, focus order, labels, reflow, and status announcements.

## Comparison

Run the same scripted tasks against:

1. the current live Console baseline;
2. the static design prototype;
3. the first authorized production slice.

Record raw observations and viewport. Do not claim improvement without a comparable baseline and repeatable task.

## Exit criteria for implementation approval

- No P0 correctness or privacy contradiction remains in the prototype.
- All seven tasks can be completed without opening canonical raw files.
- No false global blocker or false usage qualification is presented.
- Mobile and tablet flows complete without horizontal overflow.
- Private view exposes no local Action Center or command control.
- The owner approves the information architecture and terminology before Build.

## Deferred larger validation

Real multi-human, multi-machine, microservice, and enterprise data-volume validation remains a separate qualification effort. Simulated states validate the UI model only; they do not prove distributed governance or production scalability.
