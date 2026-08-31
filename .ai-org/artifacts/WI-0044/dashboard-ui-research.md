# Dashboard UI/UX research — WI-0044

Research date: 2026-08-31

## Sources reviewed

| Source | Relevant guidance | Temple decision |
| --- | --- | --- |
| [IBM Carbon — Dashboards](https://carbondesignsystem.com/data-visualization/dashboards/) | A dashboard's context determines its form; establish strong hierarchy, limit metrics, put important information first, and use space to clarify priority. | Replace ten equal opening metrics with one operating conclusion, a next action, and a small supporting set. |
| [Microsoft Fluent 2 — Nav](https://fluent2.microsoft.design/components/web/react/core/nav/usage) | Keep navigation brief, plain, scannable, goal-focused, visibly selected, and usually one level deep; use an inline drawer on wide screens and reclaim space on narrow screens. | Use five short primary destinations plus a separate local-tools group; persistent sidebar for desktop/tablet and compact navigation for mobile. |
| [Nielsen Norman Group — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Show the most important and frequent capabilities first; make secondary destinations obvious; avoid more than two disclosure levels. | Preserve advanced evidence without placing it on the landing view; use direct destinations and native disclosure inside a view. |
| [Nielsen Norman Group — Complex Application Design](https://www.nngroup.com/articles/complex-application-design/) | Reduce clutter without removing capability, provide flexible paths, ease movement between primary and secondary information, and make critical information salient by removing noise. | Navigation is non-linear, details stay in context, and historical noise moves away from operational attention. |
| [Nielsen Norman Group — Prompt to Design Interfaces](https://www.nngroup.com/articles/vague-prototyping/) | AI-generated dashboards often suffer from repeated content, illogical flow, and large low-information cards when goals and hierarchy are vague. | Treat the prior page as a known failure mode; every prominent container must answer an operator question. |
| [Grafana — Dashboard best practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/) | A dashboard should tell a story or answer a question, progress general-to-specific, reduce cognitive load, avoid unnecessary refresh, and support directed browsing. | Each Temple view owns one question; the existing SSE cadence remains provider-driven rather than adding UI polling. |
| [Grafana — Alerting best practices](https://grafana.com/docs/grafana-cloud/observe-and-act/alert-and-measure-reliability/alerting/guides/best-practices/) | Alerts should be understandable and actionable by a first responder; informational alerts add noise and should not be escalated as action. | `Now` ranks blocked/runtime/actionable conditions above approvals and moves stale or informational evidence to History/System. |

## Synthesis

Temple is not only a presentation dashboard and not yet a full exploration dashboard. It is an operational cockpit with three layers:

1. **Decision:** current health and the next human action.
2. **Coordination:** Agent ownership, lifecycle, task, model, and handoff evidence.
3. **Diagnosis:** provider health, usage qualification, stale evidence, and history.

The previous single page mixed all three layers. The redesign separates them while keeping one snapshot and one navigation taxonomy.

## Resulting design rules

1. Every view title is a question the view can answer.
2. The landing view contains at most four supporting metrics.
3. A warning shown in `Now` must identify an owner or concrete next action.
4. Historical or informational evidence never outranks live work merely because it has a warning color.
5. Unknown data uses explicit text; charts and large metric containers are omitted when evidence is insufficient.
6. Primary navigation stays one level deep and the active destination has both structural and visual indication.
7. Tablet keeps the persistent sidebar when enough width remains; mobile uses the same labels in a compact sticky row.
8. No added animation delays frequent navigation or live refresh.

## Validation questions

- Can a first-time operator find the current Work Item owner and next action in ten seconds?
- Can the operator reach organization/task/model mapping in one interaction?
- Can the operator tell live problems from release bookkeeping and historical evidence?
- Can the operator tell whether data is current and which private transport is in use from every view?
- Are powerful local tools discoverable locally and absent remotely?
