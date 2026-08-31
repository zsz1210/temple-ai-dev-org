# Management Console research — WI-0077

## Research question

How should Temple present organizational work, responsibility, usage evidence, and system conditions so that a human can decide what to do next without learning Temple's storage schemas first?

## Repository evidence reviewed

- Live Console at wide desktop (`2560 × 1080`), tablet (`1024 × 768`), and mobile (`390 × 844`) widths.
- Loopback operator view and the read-only private-network viewer.
- Current Overview, Team, Work, Usage, Health, and Activity destinations.
- Canonical Work Item state, claims, Assignments, usage evidence, system conditions, and event history.
- `UI-0002@ui-1`, ADR-0016, the UI design policy, and prior Console work in WI-0043, WI-0048, and WI-0076.

Screenshots are stored under `output/playwright/wi-0077/`. They are review evidence, not an approved design.

## External guidance

The proposed direction applies these current principles:

1. A dashboard should answer a question and tell a coherent story. Use hierarchy and drill-down rather than a wall of equally weighted panels.<br>
   Source: [Grafana dashboard best practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/)
2. Reusable filters should adapt one view instead of multiplying near-duplicate dashboards.<br>
   Source: [Grafana dashboard variables](https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/)
3. Present an overview first, then zoom and filter, then details on demand. Important information must not be hidden behind interaction.<br>
   Sources: [IBM data visualization basics](https://www.ibm.com/design/language/data-visualization/design/basics/), [IBM progressive disclosure](https://www.ibm.com/docs/en/technical-content?topic=practices-progressive-disclosure)
4. Give each page a clear visual entry point and order content by significance.<br>
   Sources: [IBM data visualization overview](https://www.ibm.com/design/language/data-visualization/overview/), [IBM layout hierarchy](https://www.ibm.com/design/language/layout/tips-and-techniques/)
5. Reserve global banners for system-level conditions. Use section-level messages and empty states for scoped conditions.<br>
   Sources: [Atlassian message guidance](https://atlassian.design/foundations/content/designing-messages/), [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/)
6. Large inventories need search, filters, and pagination rather than unbounded cards.<br>
   Source: [Carbon data table guidance](https://v10.carbondesignsystem.com/components/data-table/usage/)
7. Navigation should distinguish the persistent application shell from contextual panels.<br>
   Source: [Carbon UI shell guidance](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/)
8. Responsive pages should reflow at narrow widths without requiring two-dimensional scrolling, except for content that is inherently two-dimensional. Interactive targets, focus, headings, and status updates must remain perceivable.<br>
   Sources: [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## Design conclusions

- Temple Workspace is a Management Console, not a single dashboard. Overview is one destination within it.
- The first screen should answer **“What needs my attention now?”**, not summarize every available field.
- “Blocked”, “historical evidence”, and “currently stopping delivery” are different concepts and must not share one global alarm treatment.
- The Work inventory is the canonical human index. Responsibility chains belong in selected-item details, not in a duplicate card collection.
- Team remains Position-first. Agent Identity, Human Principal, Assignment, authority, current work, and model evidence stay visibly distinct.
- Usage must expose measurement coverage before interpretation. It must not imply cost or statistically qualified routing when the evidence is absent.
- System conditions should lead with impact and recovery action; evidence IDs, provider payloads, and revision hashes are details.
- History requires filtering and bounded retrieval from its first scalable design, even while the current dataset is small.
- Wide layouts should add useful columns and comparison space. They should not stretch prose or constrain a 34-inch display to an arbitrary narrow strip.
- Private-network viewing remains read-only. Local actions are separated from observational navigation and disappear entirely when unavailable.

## Non-conclusions

- This research does not select a new UI framework or design vendor.
- It does not prove usability. The proposed prototype must still be tested with realistic tasks.
- It does not authorize production changes, remote commands, new telemetry, or a release.
