# Proposed implementation slices — WI-0077

These slices are planning inputs only. They require separate authorization and Work Items.

## Decision status

- The owner accepted the preview direction on 2026-09-01.
- This ordering is approved for planning, not implementation or task dispatch.
- The next recommended activity is the bounded task-based preview rehearsal in `validation-plan.md`.
- A future Build Work Item must pin its own scope, affected paths, base revision, UI mode, Developer, Independent QA, and acceptance evidence.

## Slice 1 — semantic correctness

- Separate open lifecycle work from active claim/Worker execution.
- Distinguish a global blocking dependency from retained blocked validation.
- Correct the calibration-coverage label.
- Translate provider conditions into human impact with technical disclosure details.
- Add focused regression fixtures for every corrected state.

**Reason to start here:** the current terms can produce wrong operational decisions even if no layout changes.

### Slice 1 implementation brief

**Outcome:** establish one truthful read model that later visual slices can consume without reinterpreting lifecycle, execution, impediment, or evidence coverage in the browser.

**Planned production surfaces:**

- `src/observer.mjs` — derive lifecycle category independently from execution and impediment.
- `src/live-observer.mjs` — preserve provider/task observation without turning registration or history into live execution.
- `src/control-plane-dashboard.mjs` — consume explicit semantic fields and render human labels without recomputing authority.
- `test/control-plane-foundation.test.mjs` — cover summary labels, retained blockers, diagnostic coverage, and human-impact copy.
- `test/control-plane-live.test.mjs` — cover claim, prepared Worker, running Worker, waiting Worker, completed task, and history-only observations.
- `test/control-plane-private-viewer.test.mjs` — prove that the same read model remains redacted and mutation-free over private access.

**Semantic contract:**

| Dimension | Values and rule |
| --- | --- |
| Lifecycle | Read directly from the canonical Work Item workflow state. |
| Execution | `unclaimed`, `claimed`, `prepared`, `running`, `waiting`, or `finished`; task registration and historical observations alone never mean running. |
| Impediment | `clear`, `at-risk`, or `blocked`; a blocked item becomes a global blocker only when a current objective depends on it or another explicit current condition establishes impact. |
| Open work | Every nonterminal Work Item, regardless of claim or Worker state. |
| Running now | Only current runtime/provider execution evidence; retained blocked validation and history are excluded. |
| Usage coverage | Diagnostic observation coverage, never statistical qualification or automatic-routing readiness. |
| System condition | Current status plus human impact; raw provider fields remain in technical disclosure. |

**Acceptance fixtures:**

1. Open Design work with no claim reports `open` and `unclaimed`, not zero work and not running.
2. A claimed item without an attached Worker reports `claimed`, not `running`.
3. A reserved Worker reports `prepared`; an active Worker or current live provider task reports `running`.
4. A retained blocked validation appears in follow-up but does not produce a global red alert.
5. A blocked dependency of the current objective produces a global blocker with the affected Work Item named.
6. A completed or history-only task never appears in `Running now`.
7. One usage observation is labeled diagnostic coverage and cannot imply cost, savings, model superiority, or statistical qualification.
8. Private-view snapshots expose identical semantic status after redaction and no mutation surface.

**Non-goals:**

- No new visual shell, charts, animation, configuration editing, remote command capability, external integration, or release.
- No automatic model routing or inferred cost.
- No migration of lifecycle authority from canonical repository records into the Console.

**Verification gate:** focused tests for the eight fixtures, the existing full suite, schema validation, private-view checks, 320 px reflow smoke, and Independent QA by an Agent Identity distinct from the Developer.

## Slice 2 — Overview and global shell

- Implement the proposed attention hierarchy.
- Add access mode, operating profile, and freshness to the persistent shell.
- Remove repeated footer doctrine.
- Introduce adaptive wide-screen grid behavior without changing private-view authority.

## Slice 3 — unified Work experience

- Replace duplicate Work card collections with one searchable/filterable inventory.
- Add selected-item responsibility, dependency, task, model, usage, and evidence detail.
- Preserve usable priority fields at tablet and mobile widths.

## Slice 4 — Team clarification

- Retain the accepted Position-first structure.
- Clarify Agent versus Human identity.
- Add evidence-backed current work and effective-model summaries.
- Verify solo, collaborative, and high-assurance examples without hardcoding one staffing pattern.

## Slice 5 — Usage evidence

- Separate facts, coverage, and recommendations.
- Add an honest insufficient-data state.
- Add time range and attribution filters before adding charts.
- Render trends and task-type proportions only after evidence satisfies the configured threshold.

## Slice 6 — System and History scalability

- Humanize system conditions and defer raw evidence to details.
- Add finished-work, audit, and evidence retrieval tabs.
- Add search, date range, filters, bounded pagination, and large-fixture tests.

## Required verification for every slice

- Deterministic Observer fixtures.
- Unit and integration tests for state semantics.
- Keyboard, focus, label, and reflow checks.
- Runtime visual review at `2560`, `1440`, `1024`, and `390` CSS-pixel widths.
- Loopback and private-view capability comparison.
- Independent QA by an Agent Identity distinct from the Developer.
