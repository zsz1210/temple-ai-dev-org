# Work order — WI-0046

## Outcome

Reframe the current browser surface as the **Temple Management Console**. Keep **Now** as its operational Dashboard, add a distinct always-visible **Organization** workspace, and preserve **Execution** as the live responsibility view rather than using it as a substitute for permanent organization topology.

## Why now

The WI-0044 redesign correctly separated current operations into Now, Execution, Usage, System, and History, but the label "Organization and tasks" over-promised: the implementation renders only claimed, blocked, or live-attached responsibility chains. Canonical Agent Identity, Position, Assignment, membership, collaboration-profile, and separation data exists but is not projected into the browser. When no execution is active, the user cannot see the organization at all.

## Authorized scope

- Add canonical organization data to the bounded control-plane projection.
- Add a primary Organization workspace with Agent-centric and Position-centric views.
- Show collaboration profile, permanent assignments, Position responsibilities, and visible separation safeguards.
- Rename and regroup presentation copy so the whole surface is a management console and Now is the Dashboard.
- Preserve Execution as current claimed, blocked, or live-attached work.
- Audit previously discussed management-console requirements and record shipped, partial, planned, and intentionally deferred status.
- Use official shadcn/ui Dashboard and Sidebar patterns as composition and density references only.
- Update the focused human-facing operations documentation.
- Verify desktop, tablet, mobile, private-viewer redaction, keyboard navigation, console output, and horizontal overflow.

## Explicit exclusions

- No shadcn/ui, React, Tailwind, icon package, or other dependency installation.
- No vendored or copied shadcn component source.
- No remote command expansion, new mutation endpoint, automatic model routing, invented Token or cost data, tracker write-back, public hosting, release, push, publication, or open-source preparation.
- No change to project Agent display names or distributable `project-overlay/` identities.

## Coordination

WI-0046 is the sole sequential editor for the shared control-plane UI and documentation. Earlier overlapping Work Items are retained as verified behavior or inactive planning; their privacy, command, usage, refresh, private-viewer, and current-state guarantees remain regression requirements. Mog is the Integration Owner.

## Stop condition

Stop with one exact candidate independently verified and both WI-0046 and its WI-0044 parent chain left unclosed at Release Gate. Do not release or publish.
