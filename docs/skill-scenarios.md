# Skill scenario matrix

This matrix is the routing, authority, and completion contract for repository Skills. The machine-readable fixture in `test/fixtures/skill-scenarios.json` prevents the contract from drifting away from the canonical Skill registry.

| Scenario | Expected Skill | Mode | Repository authority | Completion boundary |
|---|---|---|---|---|
| A fuzzy product idea with no authoritative project documents | `$decision-interview` | conversational | Read-only unless persistence is explicitly requested | Confirmed decisions, rejected alternatives, open evidence, owner, and readiness |
| An architecture choice conflicts with an ADR, code, or tests | `$decision-interview` | evidence-backed | Read the smallest authoritative set and cite paths; do not write unless authorized | Same decision frontier plus evidence gaps and proposed downstream updates |
| Product documents and code disagree on a domain term | `$domain-modeling` | evidence-backed proposal | Read-only by default; propose glossary and ADR entries when persistence is not authorized | Definitions, examples, invariants, boundaries, conflicts, owners, and impacts |
| The user asks only for current status or a diagnosis | none | read-only | `temple status --no-write`, doctor, and repository inspection only | Evidence-backed report with no lifecycle or source mutation |
| The user authorizes creation or transition of a work item | `$temple-work` | lifecycle mutation | Mutate only the named canonical state through the CLI | Requested state change, evidence, rebuilt status, and doctor result |
| A new project needs names but the proposed mapping is unconfirmed | `$temple-init` | confirmation gate | Inspect and suggest only; do not initialize | User confirms five names and nine Position mappings, or an explicit blocker remains |
| A confirmed decision must be recorded by an authorized work item | `$decision-interview` | persistence authorized | Update only the focused Decision Ledger or ADR described by the work item | Changed path, source references, revision, and verification are reported |
| The user asks to implement an already approved feature | none | normal implementation | Follow the Position and task scope; `$temple-work` is used only for a separate lifecycle mutation | Implementation and requested verification, without invented lifecycle state |

## Validation status

- Automated: required Skill directory equality, frontmatter shape, unique descriptions, bootstrap init equality, scenario fixture references, and checksum-aware removal of obsolete managed Skills.
- Manual design review: trigger overlap, authority wording, evidence mode, and completion boundaries.
- Forward-test evidence: English Learning Inbox validates upgrade portability. AiPet will test routing during a second existing-project pilot; the Phase 1.5 greenfield pilot will test initialization and product-definition routing.

The first two checks verify structure and policy consistency. They do not prove that every model invocation will route correctly, and they are not Independent QA evidence.
