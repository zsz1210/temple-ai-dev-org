# WI-0077 controlled usability test

## Test boundary

This is a comprehension test of two read-only Console directions. It does not authorize production implementation, Agent commands, deployment, release, publication, or a usability-improvement claim.

Both surfaces use `controlled-usability-fixture.json`:

- **Baseline:** the current production `renderControlPlaneDashboard()` output.
- **Proposal:** the WI-0077 design preview, contract-checked and materialized for the controlled scenario.

The proposal contains local search, type, and outcome filtering for its fixed History records. Record what works; do not treat this preview-only behavior as production implementation.

## Start the local harness

From the repository root:

```bash
node .ai-org/artifacts/WI-0077/controlled-comparison-server.mjs --port 0
```

Open the printed index URL. The server binds to loopback by default and performs no write operation.

## Participant preparation

1. Use a viewport representative of the participant's normal device and record its CSS width and height.
2. Start every task from the surface's **Overview** route and refresh the page before starting the timer.
3. Ask the participant to think aloud, but do not explain Temple terms during a timed task.
4. Stop timing when the participant gives a final answer or abandons the task.
5. Record wrong inferences before revealing the expected answer.
6. After each task, ask for confidence from 1 (guessing) to 5 (certain).

Avoid a fixed baseline-first order. For an even participant number, test Proposal then Baseline; for an odd number, test Baseline then Proposal. A single owner running both surfaces is a qualitative diagnostic because the first surface teaches the dataset. Use a separate session or another participant before treating timing differences as comparative evidence.

## Participant task sheet — do not show the evaluator key

Use these prompts exactly.

1. Identify the next human action and say what it does not authorize.
2. Find the lifecycle, execution, and impediment states for `WI-0077`.
3. Find the responsible Position, Agent or Human, and effective model for `WI-0077`. State unavailable facts explicitly.
4. Explain whether `WI-0067` stops the current `WI-0077` objective.
5. Distinguish the current Provider condition from the recovered historical Provider failure.
6. Explain what the recorded usage evidence supports and what it cannot establish.
7. Retrieve the completed `WI-0064` record or its audit event without opening raw project files.

## Observation record

- Participant ID:
- Date:
- Viewport:
- Input method:
- Surface order:
- Facilitator:

Record one row per task and surface. `Steps` means navigation, disclosure, search, filter, or pagination actions after the starting page loads. Scrolling is recorded separately.

| Surface | Task | Outcome (`pass`, `partial`, `fail`) | Seconds | Steps | Wrong inference | Scroll / retrieval notes | Confidence (1–5) |
| --- | --- | --- | ---: | ---: | --- | --- | ---: |
| Baseline | T1 |  |  |  |  |  |  |
| Baseline | T2 |  |  |  |  |  |  |
| Baseline | T3 |  |  |  |  |  |  |
| Baseline | T4 |  |  |  |  |  |  |
| Baseline | T5 |  |  |  |  |  |  |
| Baseline | T6 |  |  |  |  |  |  |
| Baseline | T7 |  |  |  |  |  |  |
| Proposal | T1 |  |  |  |  |  |  |
| Proposal | T2 |  |  |  |  |  |  |
| Proposal | T3 |  |  |  |  |  |  |
| Proposal | T4 |  |  |  |  |  |  |
| Proposal | T5 |  |  |  |  |  |  |
| Proposal | T6 |  |  |  |  |  |  |
| Proposal | T7 |  |  |  |  |  |  |

## Accessibility pass

Run this separately from the timed comparison.

- Complete navigation and disclosures with a keyboard.
- Confirm visible focus and logical focus order.
- At 320 CSS pixels, confirm there is no page-level horizontal overflow.
- At 200% zoom, confirm that labels, state, and controls remain understandable.
- With reduced motion enabled, confirm that status meaning does not depend on animation.
- Confirm that the private view exposes no Human Inbox or Agent Command controls.

---

# Evaluator key — keep hidden until the participant finishes

## Expected answers and thresholds

| Task | Correct interpretation | Target |
| --- | --- | ---: |
| T1 | Open the `WI-0077` review details before Build planning. This is a read-only navigation action: it does not start an Agent or authorize production Build, release, or publication. | 10 seconds |
| T2 | Lifecycle: **Design**. Execution: **Unclaimed / no active Worker for WI-0077**. Impediment: **Clear**. A label that collapses these axes is only partial. | 15 seconds |
| T3 | Responsible Position: **Tech Lead**. Assigned Agent: **Tidus**. Review authority: **Project Owner / Human**. The UI Designer Yuna relationship is supporting artifact ownership, not Work Item responsibility. Effective model: **not observed / not recorded**. Inventing model evidence fails the task. | 15 seconds |
| T4 | `WI-0067` is genuinely blocked by its approved Token ceiling, but it is not a dependency of the current `WI-0077` design objective. It must not become a global stop signal. | 20 seconds |
| T5 | Current condition: Codex live-task observation coverage is limited, while repository lifecycle state remains available; it does not block review. Historical failure: a Provider disconnect recovered and is retained only in Activity / history. | 15 seconds |
| T6 | One observation supports attribution to `WI-0056`, Developer, Build, `gpt-5.6-luna`, and the recorded Token fields. It cannot establish monetary cost, savings, model superiority, automatic routing, or cross-project generalization. | 15 seconds |
| T7 | Retrieve `WI-0064` as completed with Provider protocol limits retained, or retrieve its matching history or evidence record. Proposal search and type/outcome filters must actually change the visible result. | 20 seconds |

## Scoring rules

- **Pass:** correct interpretation, within the threshold, without raw project files or facilitator help.
- **Partial:** correct after the threshold, incomplete, or reached through a control that does not actually retrieve the requested record.
- **Fail:** wrong conclusion, abandonment, raw-file fallback, or facilitator explanation.
- An honest **not observed** answer is correct when the fixture contains no evidence.
- Do not convert machine navigation duration into human completion time.

## Aggregate measures

For each surface, report:

- task success rate;
- median time for passed tasks;
- wrong-inference rate;
- false-attention rate for T1 and T4;
- median navigation steps;
- confidence distribution;
- accessibility defects by severity.

With fewer than five independent participants, label the result **directional usability evidence**, not statistical qualification. Even with more participants, this controlled fixture only validates comprehension of the UI model; it does not qualify distributed governance, enterprise scale, real Provider reliability, or production performance.

## Decision rule

The evidence may support planning a first production slice only when:

- no participant interprets the retained blocker as a global stop signal;
- no participant invents missing model or cost evidence;
- all seven tasks are completable without raw files;
- no P0 privacy or authority contradiction appears; and
- the owner separately authorizes Build after reviewing the recorded results.
