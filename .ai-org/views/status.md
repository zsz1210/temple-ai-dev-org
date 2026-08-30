# Temple AI Development Organization Framework — AI development organization status

- Project ID: `temple`
- Organization system version: `0.1.0-alpha.26`
- Active Agent Identities: 5
- Collaboration profile: `solo` (0 Human Principals, 0 active claims)
- Parallel plan: 2 wave(s), fresh=false
- Work items: 19 total, 5 active
- Codex tasks: 3 registered, 3 archive-ready
- Runtime workers: 6 registered, 0 reserved, 0 active
- Shared resources: 0 defined, 0 active reservation(s)
- Optional Skill packs: 0 installed
- Repository capabilities: 6 available, 0 invalid
- Context routes: 0 active (repository-deterministic, semantic=false)
- Engineering learning: 0 Lessons, 0 Practices
- Learning revalidation: 0 due, 0 contradicted
- Specifications: 0 indexed, 0 approved (hybrid)
- Tracker: `repository-only` (0 active provider(s), 0 linked Work Item(s))
- Attention signals: 4

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
- Fresh: no
- Safe waves: 2
- Dispatchable Work Items: 4
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
| WI-0016 | Complete Phase 4A durability operations | independent_qa | Independent QA | Lulu | parallel | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `1c3ca9c8` | 0 | 8 | 0 |
| WI-0017 | Complete Phase 4B policy and usage reliability | independent_qa | Independent QA | Lulu | parallel | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `1c3ca9c8` | 0 | 8 | 0 |
| WI-0018 | Implement Phase 4C multi-repository federation | independent_qa | Independent QA | Lulu | parallel | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `1c3ca9c8` | 0 | 8 | 0 |
| WI-0019 | Integrate the Phase 4 CLI, schemas, and release line | design | Tech Lead | Tidus | pending | internal | 0 | gate-evidence | not-applicable | 0 | 0 | 0 | — | `—` | 0 | 2 | 0 |

## Codex task registry

| Task | Work item | Suggested title | Position / Agent | Principal | Branch | Status | Revision | Archive |
|---|---|---|---|---|---|---|---|---|
| task-0001 | WI-0008 | WI-0008 · Developer · Rikku | Developer / Rikku | — | — | completed | `0e9891cf` | ready |
| task-0002 | WI-0014 | WI-0014 · Developer · Rikku | Developer / Rikku | — | — | completed | `a172ecec` | ready |
| task-0003 | WI-0014 | WI-0014 · Independent QA · Lulu | Independent QA / Lulu | — | — | completed | `23768e74` | ready |

## Runtime workers and shared resources

| Worker | Kind | Work item | Position / Agent | Status | Correlation | Revision | Resources |
|---|---|---|---|---|---|---|---:|
| worker-20260830072608-b7b8004f | internal-subagent | WI-0016 | Developer / Rikku | completed | /root/framework_docs_review | `88652ecc` | 0 |
| worker-20260830072609-1d5724c1 | internal-subagent | WI-0017 | Developer / Rikku | completed | /root/ownership_code_review | `ab96c713` | 0 |
| worker-20260830072609-5c71b9c9 | internal-subagent | WI-0018 | Developer / Rikku | completed | /root/skill_forward_test | `48cc6697` | 0 |
| worker-20260830075323-5000a6cb | internal-subagent | WI-0016 | Independent QA / Lulu | completed | /root/ownership_code_review:qa-wi-0016 | `642f03cb` | 0 |
| worker-20260830075323-140fcc4c | internal-subagent | WI-0017 | Independent QA / Lulu | completed | /root/skill_forward_test:qa-wi-0017 | `642f03cb` | 0 |
| worker-20260830075324-a849e6f4 | internal-subagent | WI-0018 | Independent QA / Lulu | completed | /root/framework_docs_review:qa-wi-0018 | `642f03cb` | 0 |

- Shared resource registry: `.ai-org/project/resources.json`
- Runtime worker registry: `.ai-org/project/runtime-workers.json`
- Active resource reservations: 0

## Attention

- task-0001 can be archived
- task-0002 can be archived
- task-0003 can be archived
- Generated parallel plan is stale; rebuild it before dispatch

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
| 2026-08-30T08:00:51.706Z | work_item_claim_released | WI-0018 | project-owner |
| 2026-08-30T08:00:51.413Z | runtime_worker_status_changed | WI-0018 | agent-lulu |
| 2026-08-30T08:00:51.118Z | work_item_claim_released | WI-0017 | project-owner |
| 2026-08-30T08:00:50.810Z | runtime_worker_status_changed | WI-0017 | agent-lulu |
| 2026-08-30T08:00:50.469Z | work_item_claim_released | WI-0016 | project-owner |
| 2026-08-30T08:00:50.169Z | runtime_worker_status_changed | WI-0016 | agent-lulu |
| 2026-08-30T07:53:39.954Z | runtime_worker_attached | WI-0018 | agent-lulu |
| 2026-08-30T07:53:39.660Z | runtime_worker_attached | WI-0017 | agent-lulu |

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
