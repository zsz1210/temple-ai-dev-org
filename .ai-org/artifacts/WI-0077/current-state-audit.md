# Current-state audit — WI-0077

The table separates verified current behavior from the proposed correction. “After” is a design proposal, not implemented Console behavior.

| Before | After | Why |
| --- | --- | --- |
| Overview reports `0 Active work` when open Work Items exist in Spec, Test, and Release Gate. | Use **Open work** for non-terminal lifecycle work and **Running now** only for an active claim or Worker. | The current label exposes an internal claim category as though it represented all active delivery. |
| Any blocked Work Item produces “Resolve blocked work before starting more execution.” | Escalate only a blocker that affects the selected objective or dependency chain. Put intentionally retained validation under **Follow-up**. | WI-0064 and WI-0067 are retained validation, not a global stop condition for WI-0077. |
| “Work in focus” omits current Spec and Release Gate items. | Show the current objective, running items, upcoming gates, and material blockers in one prioritized queue. | Humans need lifecycle relevance, not only the `active`, `blocked`, and `qa_pending` Observer categories. |
| Work repeats blocked items in both “Responsibility map” and “Open work”. | Use one filterable Work inventory. Open a selected item to reveal its responsibility and evidence chain. | Repetition lengthens scanning, especially on mobile, without adding a second decision. |
| “In progress and testing” includes blocked items. | Use explicit lifecycle and execution labels: **Spec**, **Build**, **Test**, **Release Gate**, **Blocked**, **Running**. | Lifecycle, execution, and impediment are separate dimensions. |
| The responsibility chain is rendered in every card. | Keep `Agent → Position → Work Item → Codex task → model/evidence` in selected-item details. | The chain is valuable for diagnosis but too dense for a first-pass list. |
| Team is Position-first, but the relationship among people, Agents, and model use takes several clicks to reconstruct. | Preserve the three Team lenses and add concise current work and effective-model evidence where it exists. Label every identity as **Agent** or **Human**. | Team is the strongest current surface; it needs clarification, not structural replacement. |
| Usage says `1 / 10 Qualified Work Items`. | Say **Calibration coverage: 1/10 diagnostic Work Items** and **Statistical qualification: not configured**. | The usage policy explicitly says the fixed count is diagnostic coverage, not statistical qualification or routing authority. |
| Usage presents totals but has too little evidence for meaningful trends. | Show an honest insufficient-data state and define when time series, task-type share, and anomaly views become available. | An empty chart would imply evidence that does not exist. |
| Health promotes raw evidence IDs and revision hashes to the first layer. | Lead with human impact, affected scope, freshness, and recommended action. Put technical evidence in disclosure details. | An operator should understand the condition before learning its storage identity. |
| `codex-app-server · observed not observed` exposes machine-oriented phrasing. | Use **Codex task connection: no observation received** with a concise implication. | A human-facing Console should not leak serialization grammar. |
| Activity combines an unbounded finished-work list with raw audit event names. | Use **History** with `Finished work`, `Audit trail`, and `Evidence` tabs plus search, date range, filters, and pagination. | The current design becomes less usable as the repository grows. |
| Wide screens keep the main content near 1180 px while leaving large unused areas. | Use an adaptive content grid up to roughly 1680 px, while bounding reading-width text. | Extra width should improve comparison and scan density, not stretch paragraphs. |
| The page title and its explanatory paragraph separate to opposite sides on wide screens. | Keep title, one-sentence purpose, freshness, and access context in a coherent header block. | A page needs one obvious reading start. |
| Generic repository-authority doctrine repeats in the footer. | Show persistent access mode and freshness in the global shell; link detailed governance once. | Repetition reads like implementation commentary and competes with operational content. |
| Tablet navigation collapses successfully, but long pages remain card-heavy. | Retain the icon rail and reduce repeated cards through tables, filters, and selected details. | Responsive navigation alone does not solve information density. |
| The private viewer removes local tools and says it is read-only. | Retain this behavior unchanged and make **Read-only private view** visible in the global access indicator. | This is a verified trust and authority boundary, not a styling preference. |

## Priority

### P0 — correctness and trust

- Correct “active”, “open”, “running”, and “blocked” semantics.
- Replace the misleading usage qualification label.
- Prevent historical or intentionally retained evidence from becoming a false global alarm.
- Translate technical conditions into human impact without hiding source evidence.

### P1 — comprehension and scale

- Create one Work inventory with filters and selected-item details.
- Add bounded History search, filters, date range, and pagination.
- Use adaptive wide-screen composition and a coherent global header.
- Preserve access mode and data freshness across destinations.

### P2 — polish

- Normalize terminology and state chips.
- Remove repeated doctrine and machine-oriented copy.
- Refine hover, focus, empty, loading, and update states after the information model is validated.
