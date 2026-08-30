# Alpha.23 Temple self-host dogfood

- Status: independently verified and organizationally closed
- Candidate revision: `ed624187b01200deb087bd69a48f93231c3734b3`
- Environment: local macOS checkout, Node.js repository toolchain
- Work Items: `WI-0001`, `WI-0002`
- Profiles exercised: Solo organization with explicit parallel planning

## Question

Can the Temple toolkit use its own repository-native organization for real framework work without leaking project identity into the distributable overlay or weakening ordinary initialization safety?

## Scope

The run activated the explicit toolkit-only self-host mode, created two real Work Items, routed them through Product Manager and Tech Lead gates into Build, produced a safe one-wave parallel plan, reorganized documentation, and rewrote the trilingual public entry point.

The self-host organization assigned ten stable Positions to five project-specific Agent Identities:

- Mog: Engineering Manager, Release Manager, Observer
- Yuna: Product Manager, UX Designer, UI Designer
- Tidus: Tech Lead
- Rikku: Developer
- Lulu: Quality & Evaluation Engineer, Independent QA

These names exist only in root project state. `project-overlay/` remains identity-free.

## Observed results

- Self-host initialization completed with one allowlisted byte-identical bootstrap adoption and no general collision exception.
- Immediate doctor result: 36 pass, 0 warn, 0 fail.
- Two non-overlapping Work Items were accepted into one parallel-ready wave with Mog as Integration Owner.
- No concurrent runtime worker was created in this session; the planned wave was executed through the documented sequential fallback.
- Documentation now has one top-level index and eight purpose-based directories rather than a crowded file list.
- The English, Japanese, and Traditional Chinese README files share ten sections, three collapsible scale scenarios, a compact horizontal operating-loop diagram, and the same capability boundaries.
- Repository and Markdown link checks passed.
- Exact-revision Developer verification passed all 136 tests.
- Fresh detached-worktree Independent QA installed lockfile dependencies, passed all 136 tests, and reproduced doctor health at 36 pass, 0 warn, and 0 fail.
- The first full run exposed one stale hard-coded Alpha.22 test expectation. It was changed to compare the shared package name and framework version constants; the focused 9-test suite and two later complete 136-test runs passed.

## What this proves

- The toolkit can keep its own project state separate from its distribution overlay.
- Self-host activation is explicitly scoped and ordinary targets retain strict collision behavior.
- Real documentation and positioning work can be represented as repository-owned Work Items instead of retroactively reconstructed chat history.
- The current local organization and verification workflow are usable for bounded framework maintenance.

## What this does not prove

- No multi-human or multi-machine contention was exercised.
- No external tracker, pull request, deployment, or production system was mutated.
- No controlled comparison measured time, token, rework, or coordination savings.
- No SRE, Security, incident-response, vulnerability-management, or production-telemetry integration was implemented.
- The same Lulu identity currently covers evaluation and Independent QA. This is acceptable for the low-risk Solo profile because it remains separate from Rikku as Developer, but a High-Assurance run should split these responsibilities further.

## Next evidence

Comparative efficiency claims remain deferred until a baseline protocol is executed. The retained multi-human, multi-machine collaboration plan and future SRE, Security, and production-observability contracts remain separate validation work.
