# Risk review — WI-0081

| Risk | Control | Residual status |
| --- | --- | --- |
| Static proposal examples appear as real state | Every repeated value is generated from the snapshot; fixture scenarios are omitted | Controlled by focused tests and browser inspection |
| UI implies unsupported execution, authority, cost, or model claims | Missing semantic fields render as unavailable; no browser inference | Controlled by copy and fixture coverage |
| Private viewer exposes local actions or sensitive records | Preserve server classification/redaction and omit local-tool markup for private mode | Controlled by private-view tests |
| Refresh resets user context | Preserve navigation, selection, filters, disclosures, and focus | Controlled by focused refresh tests |
| Large inventories become unreadable | Bounded visible sets, search/filter controls, and disclosure-based technical details | Requires runtime review with current 80-item repository |
| Motion distracts or misrepresents activity | Motion requires real current evidence and respects reduced motion | Controlled by browser review |
| Shared path conflicts with WI-0029 | WI-0029 is unclaimed; WI-0081 is the sole current renderer editor and must retain all command-gateway invariants | Controlled by overlap resolution and inbox regression tests |

No production deployment, external write, public exposure, or irreversible action is part of this slice.
