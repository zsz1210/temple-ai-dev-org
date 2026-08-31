# Developer report — WI-0044

- Candidate revision: `d17a5f263e4e93eab2922d14e55456fd3d6c5b25`
- Developer: Rikku (`agent-rikku`)
- Decision: ready for Test

## Change

The Control Plane Dashboard now uses one-level navigation for **Now**, **Execution**, **Usage**, **System**, and **History**, with local-only Human Inbox and Agent Commands kept in a separate navigation group. The default view gives one health conclusion, one next action, four operating metrics, and a bounded work-in-focus list. Execution shows the current `Agent → Position → Work Item → Codex task → observed model` responsibility chain and collapses queued or approval-pending inventory by default.

The Observer projection now exposes canonical assigned and active-claim Agent IDs so the Dashboard does not infer current ownership from historical task data. Private LAN and Tailscale viewers remain server-rendered without Human Inbox or Agent Command surfaces, while release decisions remain visible as read-only operational state. Usage preserves an explicit evidence-not-ready state when detailed provider Token observations are absent.

## Verification

- Focused Control Plane tests: 27/27 pass.
- Agent Command and Inbox compatibility tests: 6/6 pass.
- Full repository verification: 221/221 pass, with repository and documentation link checks passing.
- Desktop Chromium at 1440 × 1000: persistent sidebar, one active responsibility chain, three in-motion/QA rows, queued inventory collapsed, no horizontal overflow.
- Local mobile Chromium at 420 × 900: sticky scrollable navigation, four metrics, correct current Position ownership, no document-level horizontal overflow.
- Home-LAN private Chromium at 1024 × 1366: read-only copy, five primary views, zero local-tool navigation, nine release decisions consistently reflected in the hero and metrics, no horizontal overflow.
- Fresh home-LAN Chromium session: 0 console errors and 0 warnings.

Transient screenshots were used for visual inspection and moved outside the repository after review because they contain live operational state. No screenshot is treated as canonical evidence.

## Boundaries retained

This change does not add remote commands, new mutation authority, automatic model switching, invented Token or monetary data, publication, release, or open-source preparation. The Dashboard remains an observer over canonical repository state; its navigation and progressive disclosure do not change lifecycle authority.
