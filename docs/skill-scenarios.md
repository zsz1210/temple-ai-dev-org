# Skill scenario matrix

This matrix is the routing, authority, and completion contract for repository Skills. The machine-readable fixture in `test/fixtures/skill-scenarios.json` prevents the contract from drifting away from the canonical Skill registry.

| Scenario | Expected Skill | Mode | Repository authority | Completion boundary |
|---|---|---|---|---|
| A fuzzy product idea with no authoritative project documents | `$decision-interview` | conversational | Read-only unless persistence is explicitly requested | Confirmed decisions, rejected alternatives, open evidence, owner, and readiness |
| An architecture choice conflicts with an ADR, code, or tests | `$decision-interview` | evidence-backed | Read the smallest authoritative set and cite paths; do not write unless authorized | Same decision frontier plus evidence gaps and proposed downstream updates |
| Product documents and code disagree on a domain term | `$domain-modeling` | evidence-backed proposal | Read-only by default; propose glossary and ADR entries when persistence is not authorized | Definitions, examples, invariants, boundaries, conflicts, owners, and impacts |
| A README or setup guide must match shipped commands, links, and capabilities | `$project-documentation` | human documentation mutation | Read evidence first; edit only when documentation changes are authorized | Focused human documentation, checked commands and links, honest claims, and explicit unverified gaps |
| The user asks only for current status or a diagnosis | none | read-only | `temple status --no-write`, doctor, and repository inspection only | Evidence-backed report with no lifecycle or source mutation |
| The user authorizes creation or transition of a work item | `$temple-work` | lifecycle mutation | Mutate only the named canonical state through the CLI | Requested state change, evidence, rebuilt status, and doctor result |
| A new project needs names but the proposed mapping is unconfirmed | `$temple-init` | confirmation gate | Inspect and suggest only; do not initialize | User confirms five names and nine Position mappings, or an explicit blocker remains |
| A confirmed decision must be recorded by an authorized work item | `$decision-interview` | persistence authorized | Update only the focused Decision Ledger or ADR described by the work item | Changed path, source references, revision, and verification are reported |
| The user asks to implement an already approved feature | none | normal implementation | Follow the Position and task scope; `$temple-work` is used only for a separate lifecycle mutation | Implementation and requested verification, without invented lifecycle state |
| An approved behavior can be expressed at a stable public test seam | `$tdd` from Build Quality | red-green implementation | Production mutation must already be authorized; pack use does not change lifecycle state | Real red reason, minimal green change, regression result, exact revision, and unresolved environments |
| A reproducible test or runtime symptom has no supported cause yet | `$diagnosing-bugs` from Build Quality | fault isolation | Diagnosis is read-only unless the user or work item also authorizes a fix | Reproduction, ranked hypotheses, discriminating evidence, supported cause or explicit uncertainty |

## Validation status

- Automated: core Skill directory equality, optional pack manifest and frontmatter shape, unique descriptions, bootstrap init equality, scenario fixture references, opt-in install/remove, and checksum-aware upgrade/removal.
- Manual design review: trigger overlap, authority wording, evidence mode, and completion boundaries.
- Forward-test evidence: English Learning Inbox validates upgrade portability. AiPet `WI-0001` validates lifecycle routing, red-to-green test evidence, screenshot inspection, exact-revision Independent QA, and closeout in a second existing repository. FlowDeck validates greenfield initialization, product-definition routing, domain modeling, Build Quality, exact-revision closeout, and the need for an explicit pilot stop boundary. The `$project-documentation` audit of Temple's trilingual README caught stale capability state, a failing documented command, missing prerequisites, private-repository access, and an overstated revision guarantee. Cross-task recovery remains unverified.

The first two checks verify structure and policy consistency. They do not prove that every model invocation will route correctly, and they are not Independent QA evidence.
