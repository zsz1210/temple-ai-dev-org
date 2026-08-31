# WI-0071 Product Specification

## Problem

Temple preserves engineering learning but leaves the human to notice when a repeated Practice is mature enough for Skill review. That makes learning durable without making promotion manageable. Automatically activating a Skill would solve the management problem by crossing the wrong authority boundary: a Skill changes recurring Agent behavior.

## Intended outcome

Temple manages candidate discovery, evidence aggregation, proposal preparation, reminders, and approved Work Item creation. The human makes one explicit activation decision. No proposal or approval directly creates or activates a Skill.

## Product contract

### Candidate detection

- REQ-001: Candidate detection is deterministic, local, and read-only against canonical Learning records.
- REQ-002: Only an active, high-confidence Practice with a confirmed validation and evidence from at least two distinct Work Items is eligible for automatic Skill review.
- REQ-003: Evidence from a Practice includes its direct source Work Items and the source Work Items of its derived Lessons.
- REQ-004: Contradicted, deprecated, already accepted, rejected, or not-yet-due deferred entries are not surfaced as pending candidates.
- REQ-005: Near-miss entries retain explicit blockers so the system can explain why they were not surfaced.

### Skill Proposal

- REQ-006: A proposal is a project-owned canonical JSON record referenced by the compact Learning Index.
- REQ-007: Proposal creation requires an eligible candidate and records the proposed Skill name, summary, trigger, non-trigger, authority, risk class, dependencies, alternatives, overlap review, evidence references, and source Work Items.
- REQ-008: Exact Skill-name or path collisions fail closed. A proposal is not evidence that semantic trigger overlap has been cleared unless the Tech Lead records that review.
- REQ-009: Proposal creation does not install dependencies, create a Skill, change `temple.lock`, perform an external action, or create another Work Item.

### Human decision

- REQ-010: A Human Principal may approve, reject, or defer a pending proposal through the local CLI. Management Console viewers remain read-only.
- REQ-011: Approval is idempotent and creates exactly one internal Skill-authoring Work Item linked to the proposal and source learning.
- REQ-012: The generated Work Item starts at Intake, declares `.agents/skills/<name>/**` as its bounded write scope, and explicitly excludes dependency installation, publication, core promotion, and the target procedure itself.
- REQ-013: Rejection creates no Work Item. Deferral creates no Work Item and requires a future review time.
- REQ-014: Neither approval nor the generated Work Item creates or activates `SKILL.md`; `$skill-authoring` and the normal lifecycle remain authoritative.

### Observer and Management Console

- REQ-015: Eligible unproposed candidates and pending proposals appear as actionable Observer attention.
- REQ-016: The existing Now attention surface shows proposal evidence and authority boundaries without adding a new navigation area or a remote decision endpoint.
- REQ-017: Generated candidate views are rebuildable projections and never override Learning, proposal, Work Item, approval, or Skill files.
- REQ-018: Existing Capability Registry behavior remains the only Skill index after an authored Skill exists.

## Acceptance scenarios

1. An active confirmed high-confidence Practice derived from Lessons spanning two Work Items appears as eligible without mutating `.ai-org/learning/index.json`.
2. The same Practice with only one distinct Work Item reports `recurrence-evidence-missing` and does not create approval attention.
3. A Tech Lead proposal with a valid collision-free name creates one proposal record, updates the Learning promotion pointer, and emits an audit event.
4. A duplicate proposal request returns the existing proposal or fails without creating a second record.
5. Approval creates exactly one linked internal Work Item, including on idempotent replay.
6. Rejection and deferral never create Work Items; deferral stops attention until its review time.
7. A private Management Console viewer can see that a proposal is pending but cannot submit a decision.
8. Schema validation, Doctor, focused tests, and the full repository verification suite pass.

## Non-goals

- Automatically writing or activating a Skill.
- Automatically deciding that every repeated Practice should be a Skill instead of an automated check, ADR, instruction, or retained Practice.
- Installing dependencies, publishing packs, or promoting project learning to Temple core.
- Scheduling model-backed retrospectives or adding a semantic runtime.
- Enabling standing low-risk auto-activation.

## Evidence and stop boundary

This Work Item is complete only when the local deterministic pipeline, proposal and decision records, Work Item creation boundary, Observer/Now projection, documentation, regression tests, Independent QA, and release-gate evidence are present. It does not need to create a real project Skill from the current candidate Learning records.
