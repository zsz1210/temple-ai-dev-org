# Management Console requirements audit — WI-0046

Audit date: 2026-08-31

## Result

The current surface is already a multi-workspace control plane, not a single Dashboard. Its product framing is only partial: `Now` behaves as an operational Dashboard, while the application shell still uses Dashboard-oriented labels and does not expose the canonical organization topology.

| Capability | State before WI-0046 | Evidence and boundary | Destination |
| --- | --- | --- | --- |
| Management Console application frame | Partial | Sidebar and multiple workspaces exist, but naming and navigation do not include Organization. | Global shell |
| Operational health, attention, next action, and work in focus | Shipped | `Now` renders the question-led operational summary and bounded metrics. | Now |
| Permanent organization topology | Planned in WI-0046 | Canonical Agents, Positions, Assignments, memberships, and profile exist; the Observer snapshot does not project them. | Organization |
| Agent-centric and Position-centric roster | Planned in WI-0046 | Five active Agents and ten active assignments exist only in canonical files. | Organization |
| Position purpose, ownership, and approval exclusions | Planned in WI-0046 | `positions.json` is authoritative but not rendered. | Organization |
| Collaboration profile, Disciplines, and separation safeguards | Planned in WI-0046 | Canonical collaboration and assignment data exists but is not rendered. | Organization |
| Agent → Position → Work Item → task → observed model | Shipped with evidence limits | Execution renders the chain for claimed, blocked, or live-attached work. Missing task or model evidence stays explicit. | Execution |
| Universal visibility of every Codex task or internal subagent | Partial | Only registered tasks and successfully attached provider observations are reliable. Unregistered app tasks are not universally discoverable. | Execution |
| Model currently observed for a task | Partial | The renderer supports observed task usage/model evidence; current history-only tasks may have no observed model. | Execution |
| Model policy, selection, or automatic routing | Intentionally deferred | Policy is documented but no trusted routing authority or mutation surface exists. | Future Settings or local tool |
| Per-task, Position, stage, model, and outcome Token attribution | Shipped contract; evidence not yet populated | Usage projection and driver groups exist, but no qualified correlated observations currently support analysis. | Usage |
| Token trend by time and proportional charts | Intentionally deferred | No normalized time-series contract exists; aggregate timestamps are insufficient for a trustworthy trend chart. | Future Usage |
| Monetary cost, savings, and model-quality claims | Intentionally deferred | Qualification and price/quality evidence are not available. | Future Usage |
| Provider health, conditions, and recovery guidance | Shipped | Provider and condition projections are visible. | System |
| Live refresh over one snapshot and event stream | Shipped | Snapshot refresh and SSE coordination are already implemented. | Global shell |
| Home-LAN and Tailscale private read-only viewing | Shipped | Private snapshots omit mutation authority and local-only state; private writes are rejected. | Global shell |
| Human Inbox | Shipped, loopback only | The destination is omitted from private viewers. | Local tools |
| Agent Commands prototype | Shipped, loopback and opt-in only | Exact eligible task targeting and confirmation exist; private POST remains rejected. | Local tools |
| Remote or tablet Agent commands | Intentionally deferred | Private surfaces remain read-only by design. | Deferred |
| Terminal work and canonical/observed history | Shipped | Terminal Work Items and occurrence/observation timestamps are separated. | History |
| Multi-repository or microservice portfolio | Partial framework capability | Read-only federation/portfolio CLI exists, but no Management Console portfolio backend or workspace is included here. | Future Projects or Portfolio |
| SRE and Security production telemetry | Planned | The organizational responsibilities are extensible, but production adapters and incident views are not implemented. | Future System or Incidents |

## Priority after WI-0046

1. Finish the canonical Organization projection and view without weakening private-viewer boundaries.
2. Make execution coverage labels explicit so `registered`, `attached`, `live`, `history-only`, and `unknown` cannot be confused.
3. Collect real correlated Token observations before designing time-series analysis or making efficiency claims.
4. Validate cross-repository organization and portfolio behavior before adding a Projects workspace.
5. Keep remote commands, model switching, and production telemetry outside the read-only Management Console until their authority and safety contracts are separately approved.
