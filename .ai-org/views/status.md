# Temple AI Development Organization Framework — AI development organization status

- Project ID: `temple`
- Organization system version: `0.1.0-alpha.26`
- Active Agent Identities: 5
- Collaboration profile: `solo` (0 Human Principals, 0 active claims)
- Parallel plan: 1 wave(s), fresh=true
- Work items: 18 total, 4 active
- Codex tasks: 3 registered, 3 archive-ready
- Runtime workers: 0 registered, 0 reserved, 0 active
- Shared resources: 0 defined, 0 active reservation(s)
- Optional Skill packs: 0 installed
- Repository capabilities: 6 available, 0 invalid
- Context routes: 0 active (repository-deterministic, semantic=false)
- Engineering learning: 0 Lessons, 0 Practices
- Learning revalidation: 0 due, 0 contradicted
- Specifications: 0 indexed, 0 approved (hybrid)
- Tracker: `repository-only` (0 active provider(s), 0 linked Work Item(s))
- Attention signals: 3

## Collaboration

- Profile: `solo`
- Coordination backend: `repository`
- Human Principals: 0
- Agent sponsorships: 0
- Active Position memberships: 10
- Active Work Item claims: 0
- Large-scale validation: `not_run` (.ai-org/templates/collaborative-large-scale-test-plan.md)

## Parallel orchestration

- Generated plan: `.ai-org/views/parallel-plan.json`
- Installed: yes
- Valid: yes
- Fresh: yes
- Safe waves: 1
- Dispatchable Work Items: 3
- Active / sequential / blocked: 0 / 0 / 0
- Next wave: WI-0016, WI-0017, WI-0018
- Codex tasks, claims, or external actions performed by planning: no

## Work items

| ID | Title | State | Owner | Agent | Parallel | Tracker | Links | Spec mode | UI | Specs | Stale | Unapproved | Claim | Revision | Tasks | Evidence | Unresolved |
|---|---|---|---|---|---|---|---:|---|---|---:|---:|---:|---|---|---:|---:|---:|
| WI-0001 | Reorganize documentation by reader purpose | done | Engineering Manager | Mog | parallel | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `ed624187` | 0 | 9 | 0 |
| WI-0002 | Reposition the public README for every project scale | done | Engineering Manager | Mog | parallel | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `ed624187` | 0 | 9 | 0 |
| WI-0003 | Polish the trilingual README layout | done | Engineering Manager | Mog | sequential | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `f77b44e5` | 0 | 9 | 0 |
| WI-0004 | Rewrite README audience scenarios | done | Engineering Manager | Mog | sequential | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `815b43ae` | 0 | 11 | 0 |
| WI-0005 | Validate historical evidence at its recorded revision | done | Engineering Manager | Mog | sequential | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `891e3ab6` | 0 | 9 | 0 |
| WI-0006 | Design Phase 4 reliability, token efficiency, and model routing | done | Engineering Manager | Mog | sequential | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `7b6a7abe` | 0 | 9 | 0 |
| WI-0007 | Implement Phase 4A backup and crash-safe restore | done | Engineering Manager | Mog | sequential | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `ffba88a` | 0 | 12 | 0 |
| WI-0008 | Validate Phase 4A recovery with AiPet | done | Engineering Manager | Mog | sequential | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `0e9891cf` | 1 | 10 | 0 |
| WI-0009 | Harden Dashboard lifecycle semantics and startup | done | Engineering Manager | Mog | sequential | internal | 0 | gate-evidence | code-first | 0 | 0 | 0 | — | `98718675` | 0 | 13 | 0 |
| WI-0010 | Implement Phase 4B policy evaluation and usage attribution | done | Engineering Manager | Mog | sequential | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `7052388e` | 0 | 12 | 0 |
| WI-0011 | Qualify live Token telemetry and establish the first real baseline | done | Engineering Manager | Mog | sequential | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `25a979e5` | 0 | 12 | 0 |
| WI-0012 | Keep reconciled Codex history out of live task signals | done | Engineering Manager | Mog | pending | team-visible | 0 | gate-evidence | code-first | 0 | 0 | 0 | — | `3872ac71` | 0 | 13 | 0 |
| WI-0013 | Bind toolkit self-host launcher to the current worktree | done | Engineering Manager | Mog | pending | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `835dc57d` | 0 | 14 | 0 |
| WI-0014 | Establish the first correlated active-task usage baseline | done | Engineering Manager | Mog | sequential | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `23768e74` | 2 | 14 | 0 |
| WI-0015 | Complete Phase 4 reliability and federation exit | design | Tech Lead | Tidus | sequential | team-visible | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `—` | 0 | 2 | 0 |
| WI-0016 | Complete Phase 4A durability operations | build | Developer | Rikku | parallel | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `—` | 0 | 2 | 0 |
| WI-0017 | Complete Phase 4B policy and usage reliability | build | Developer | Rikku | parallel | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `—` | 0 | 2 | 0 |
| WI-0018 | Implement Phase 4C multi-repository federation | build | Developer | Rikku | parallel | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `—` | 0 | 2 | 0 |

## Codex task registry

| Task | Work item | Suggested title | Position / Agent | Principal | Branch | Status | Revision | Archive |
|---|---|---|---|---|---|---|---|---|
| task-0001 | WI-0008 | WI-0008 · Developer · Rikku | Developer / Rikku | — | — | completed | `0e9891cf` | ready |
| task-0002 | WI-0014 | WI-0014 · Developer · Rikku | Developer / Rikku | — | — | completed | `a172ecec` | ready |
| task-0003 | WI-0014 | WI-0014 · Independent QA · Lulu | Independent QA / Lulu | — | — | completed | `23768e74` | ready |

## Runtime workers and shared resources

No runtime workers registered yet.

- Shared resource registry: `.ai-org/project/resources.json`
- Runtime worker registry: `.ai-org/project/runtime-workers.json`
- Active resource reservations: 0

## Attention

- task-0001 can be archived
- task-0002 can be archived
- task-0003 can be archived

## External tracker coordination

- Profile: `repository-only`
- Sync granularity: `team-visible`
- Active providers: 0
- Team-visible Work Items: 9
- Linked Work Items: 0
- Observed external items: 0
- Reconciliation actions: 0
- External write performed by status: no
- Configuration: `.ai-org/project/tracker.json`
- Generated observations: `.ai-org/views/tracker.json`

## Product specifications

- Adoption profile: `hybrid`
- Delivery method: `contract-guided-iterative`
- Indexed: 0
- Approved: 0
- Registry installed: yes
- Registry valid: yes
- Repository sources valid: yes
- External authorities: 0
- Derived projections: 0
- Legacy unverified: 0
- Registry: `.ai-org/project/spec-index.json`

## Progressive context routing

- Context Map: `.ai-org/project/context-map.json`
- Active routes: 0
- Capability Registry: `.ai-org/views/capabilities.json`
- Available capabilities: 6
- Retrieval Provider: `repository-deterministic`
- Semantic retrieval: disabled
- Local hybrid boundary: `available_not_configured` (runtime installed: no)
- Large-repository retrieval validation: `not_run`

## Engineering learning

- Candidate: 0
- Validated: 0
- Active: 0
- Deprecated: 0
- Revalidation due: 0
- Contradicted: 0
- Retrieval index: `.ai-org/learning/index.json`


## Recent events

| Time | Event | Work item | Actor |
|---|---|---|---|
| 2026-08-30T07:25:49.916Z | work_item_coordination_configured | WI-0018 | agent-rikku |
| 2026-08-30T07:25:49.641Z | work_item_coordination_configured | WI-0017 | agent-rikku |
| 2026-08-30T07:25:49.379Z | work_item_coordination_configured | WI-0016 | agent-rikku |
| 2026-08-30T07:25:49.120Z | work_item_coordination_configured | WI-0015 | agent-tidus |
| 2026-08-30T07:25:21.395Z | work_item_transitioned | WI-0015 | agent-yuna |
| 2026-08-30T07:25:21.120Z | work_item_transitioned | WI-0015 | agent-mog |
| 2026-08-30T07:25:20.838Z | work_item_coordination_configured | WI-0018 | agent-rikku |
| 2026-08-30T07:25:20.551Z | work_item_transitioned | WI-0018 | agent-tidus |

## Assignments

| Position | Agent Identity | Stable ID |
|---|---|---|
| Developer | Rikku | `agent-rikku` |
| Engineering Manager | Mog | `agent-mog` |
| Independent QA | Lulu | `agent-lulu` |
| Observer | Mog | `agent-mog` |
| Product Manager | Yuna | `agent-yuna` |
| Quality & Evaluation Engineer | Lulu | `agent-lulu` |
| Release Manager | Mog | `agent-mog` |
| Tech Lead | Tidus | `agent-tidus` |
| UI Designer | Yuna | `agent-yuna` |
| UX Designer | Yuna | `agent-yuna` |

## Optional Skill packs

No optional Skill packs installed.

## Integration

- Root AGENTS.md: appended
- Archify contract: available_not_enabled
- Archify adapter: not_installed

> This file is a generated projection. Update canonical files, then rebuild this view.
