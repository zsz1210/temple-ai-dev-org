# Collaborative delivery field remediation

Status: approved outcome and scope; detailed design delegated by the maintainer for WI-0230 on 2026-09-16. This document is a specification, not completion evidence. Baseline: Alpha.32, `e63829dc01e50a10e8bbb4c7cdd4ea2a950c6f6b`.

## User outcome and scope

A solo author can invite contributors without interrupting existing work. An invited contributor can begin an authorized ordinary task, use their own Agent, understand any real blocker, and deliver evidence without repeatedly asking the project owner to repair framework configuration. Human-written and AI-written code use the same candidate acceptance criteria.

Implement all thirteen findings and sixteen scenarios below. The three batches are dependency ordering, not approval pauses. The maintainer authorized design, implementation, repair and testing through completion. Generic fixtures are required; downstream names, product content and private evidence do not belong in this framework repository.

## Vocabulary and invariants

| Term | Meaning and boundary |
| --- | --- |
| Contributor / Principal | The recorded accountable person. A statement of attribution is not external authentication or hosting permission. |
| Agent Identity | Stable project ID for an AI participant. Display names are editable labels and may repeat across people. |
| Position | A responsibility and eligibility contract. Changing responsibility does not inherently start another model or require another human approval. |
| Default Assignment | A fallback recommendation. It cannot override an explicit qualified member or the actual active claimant. |
| Work claim | Current scoped responsibility. It is not a cross-machine distributed lock. |
| Ordinary attribution | Recorded contributor/Agent correspondence without mandatory clone-local login. Unverified provenance is labelled honestly. |
| Strict actor policy | An explicitly selected requirement for stronger identity provenance. A local JSON label alone is not provider authentication. |
| Measurement | Exact observed input, tool/environment identity, command, result and artifacts. |
| Acceptance | An eligible independent reviewer's judgment that relevant measurements satisfy the requirement for a candidate. |
| Reuse | Reference a prior successful compatible measurement; no invented test execution or automatic approval. |
| Waiting | Missing owner, environment, evidence or decision. Distinct from an attached running reviewer and from completed review. |
| Durable evidence | Bytes retrievable for the recorded version, with verified digest and immutable attempt history. |

Preserve real human authority, current scope, actual Developer/reviewer separation, strict assurance, exact managed ownership, and historical IDs. No provider login is fabricated. Unknown attribution cannot qualify as independently authenticated approval. No local policy claims to enforce Git hosting access.

## Required changes

| Finding | Required behavior | Primary verification |
| --- | --- | --- |
| F01 | Resolve actual claimant/member/reviewer consistently at creation, transition, handoff, close and assurance; use the actual Developer sponsor for independence. | V01, V02, V16 |
| F02 | Preview Solo-to-team impact; preserve existing work; make missing mappings and recovery explicit; do not silently rewrite active claims. | V03, V04, V12 |
| F03 | Provide a contributor readiness result with the current eligible Agent path and missing requirements. Reuse existing identities. | V01, V04, V13 |
| F04 | Derive default workflow from task risk and scope, independent of team size/profile; retain explicit assurance floors and escalation triggers. | V05, V16 |
| F05 | Structured failure classification with mutation status, missing condition, responsible actor and safe next action. Ordinary recoverable setup must not demand redundant owner approval. | V04, V12, V13 |
| F06 | Surface the supported autonomous path by capability. Provide explicit trusted-local command checks for appropriate non-Node projects and platforms while preserving confined-node restrictions. | V09, V13 |
| F07 | Deterministic measurement reuse keyed by complete declared inputs and actual result/artifact provenance. Conservative misses for unknown, stale, changed or failed evidence. | V06, V07 |
| F08 | Present separate execution, evidence and blocker state with owner and next action. Show missing real-world conditions without pretending review is running. | V08, V12 |
| F09 | Provide previewable semantic reconciliation of independent records, explicit conflicts and deterministic view rebuilding. Preserve both valid histories and never silently resolve competing claims or lifecycle states. | V10, V12 |
| F10 | Provide durable evidence inspection/export/retrieval checks, distinguish old baseline debt from the current candidate, and retain invalidated attempts. | V08, V11 |
| F11 | Align CLI, Skills, managed operating text and public documentation; keep integration, organizational acceptance and publication distinct. | V09, V12, V15 |
| F12 | Ordinary development requires no Temple-specific login/binding. Existing verified bindings remain usable. Strict identity requirements are explicit and cannot be silently bypassed. | V04, V13, V16 |
| F13 | Permit repeated display names with distinct stable IDs; disambiguate by contributor/ID; creation, validation and rendering agree. | V14 |

## Frozen acceptance scenarios

Each scenario needs a named test or evidence record, observed result and remaining environment limitation. A fixture only proves its stated layer. These cases do not all require model calls.

| ID | Setup and positive expectation | Negative control |
| --- | --- | --- |
| V01 | Default and non-default members complete applicable lifecycle operations with their own qualified Agent. | Reject another active claim, inactive membership and an explicitly mismatched Principal. |
| V02 | Actual Developer differs from the default. QA and approval independence follow the actual handoff and sponsor. | Actual Developer's own Principal cannot masquerade as an independent human approver. |
| V03 | Solo has existing work when a person joins. Preview and application preserve IDs, modified files, evidence and history. | Active anonymous ownership is not silently relabelled as another human; stale previews cannot mutate. |
| V04 | New clone with no binding begins authorized ordinary work using explicit attribution; existing valid binding remains compatible. | Unknown contributor, stale/mismatched explicit binding and strict-policy missing evidence produce actionable results without impersonation. |
| V05 | An ordinary visual task and a deployment task exist in one project. Their assurance requirements follow their own risk. | Deployment/security/irreversible triggers still raise the assurance floor. |
| V06 | Administrative-only change with identical declared validation inputs reuses successful measurement and validates artifact availability. | Mere matching filename, commit message or old pass cannot authorize reuse. |
| V07 | Change dependencies, test code, fixtures, command or toolchain identity. The relevant measurement becomes a miss. | Unspecified/unavailable environmental inputs cannot be assumed identical. |
| V08 | Native/UI work has developer measurement and completed reviewer judgment, but a real-device condition is unavailable. | Show the missing condition, not endless running QA or false runtime success. |
| V09 | Exercise portable trusted-local commands and the supported Node path; expose platform capabilities before execution. | Confined-node never silently falls back to unrestricted execution; unsupported tools remain unavailable. |
| V10 | Independent branch records can be reconciled without losing either history; generated views rebuild deterministically. | Competing claims, same-ID divergent artifacts and incompatible lifecycle changes remain explicit conflicts with no partial apply. |
| V11 | A fresh clone can retrieve the recorded artifact bytes and verify their exact digest. | Missing historical files are not repaired by hashing unrelated current bytes; tampering, path escape and collisions fail. |
| V12 | Interruption, same-scope rework and merged-but-not-accepted work are recoverable with clear owner/next action. | No duplicate identities/tasks, blind historical closure or fake acceptance. |
| V13 | Timed first-use fixture follows authorized ordinary task through initial product edit and verifiable result without extra Temple login. | Success obtained by disabling an applicable guard is not onboarding success. |
| V14 | Two contributors choose the same display name and reopen sessions. IDs stay distinct and existing identities are reused. | Neither rename nor role change merges histories or resolves an ambiguous actor silently. |
| V15 | Human edits, ordinary AI edits and governed Agent edits can be associated with the same acceptance and actual measurements. | No backdated claim, fabricated review or assumption that local commit bypasses hosting controls. |
| V16 | Ordinary attribution and an explicitly strict policy both behave as documented. | Local self-description/different Agent labels are not trusted external authentication or independent human approval. |

## User-facing diagnostic contract

The CLI and console show: current responsibility, actual participant (or unknown), execution state, evidence readiness, specific missing condition, and the next eligible action. The first sentence describes the user's next step, not an internal Skill name. Explanations distinguish task routing, identity provenance, eligibility, missing prerequisite, environmental unavailability, stale evidence and conflicting work.

Code-first UI scope is limited to diagnostic/status presentation in existing views. Required states: ready; attributed ordinary work without binding; strict verification required; another active claimant; multiple eligible Agents; completed review awaiting environment; reusable measurement; reuse miss; historical evidence debt; reconciliation conflict. Keep private-view redaction and keyboard/responsive behavior. Use existing components and no new design vendor.

## Delivery and measurement

1. Batch one: attribution policy, actual participant resolution, naming, onboarding/transition preview, risk defaults and recovery.
2. Batch two: complete measurement keys, conservative reuse, durable evidence and truthful status.
3. Batch three: reconciliation, supported command adapters, instruction/documentation alignment and complete regression.

Measure first claim, first product edit and first verifiable output separately; count human interventions by reason, wrong Agent selection, duplicate identity creation, unnecessary login, conflicts, reuse hit/miss and actual test invocations. Record wall time rather than summed concurrent test durations. Record model input/cached-input/output only when observed, otherwise unknown. Do not poll account quotas or infer money from event/file counts.

Run focused tests during editing. Run `npm run verify` on the final behavioral candidate under Node 24, Doctor after canonical changes, the applicable browser gate, installation/upgrade rehearsal and a distinct independent review. Fix discovered defects within this scope and repeat the affected checks; a changed behavioral candidate needs renewed full verification.

## Compatibility and completion

Preserve project-owned configuration and existing identities during framework upgrade. Preview policy and membership changes rather than silently extending expired authority. The default policy for existing configurations must be documented in ADR-0067. Keep strict verification available and fail clearly when its required provider evidence is not available.

The completion report maps every F and V ID to changed files and exact evidence. Automated fixtures, real local platform execution, independent review and real independently operated machines are distinct statuses. Remaining unobservable history or unavailable human/device validation stays explicit. Do not claim those validations passed or leave implementable framework work undone merely because a real-machine check is unavailable.
