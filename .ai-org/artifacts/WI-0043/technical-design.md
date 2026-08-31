# Technical design — Team review closeout

- Work Item: `WI-0043`
- Position: Tech Lead
- Agent Identity: `agent-tidus`
- UI delivery mode: `not-applicable`

## Design

`WI-0043` remains a read-only design review. It produces no Dashboard implementation, remote command, external write, release, or publication. Its approved output is the information architecture and validation boundary in `product-review.md`.

Implementation belongs to a new bounded Work Item with its own affected paths, UI mode, runtime visual evidence, migration tests, exact candidate revision, and Independent QA. That implementation should:

1. extend the collaboration model without merging Position, Membership, Assignment, sponsorship, claim, or Human Authority Grant;
2. preserve Solo compatibility and project-owned collaboration state during upgrade;
3. make duplicate display names safe through immutable IDs rather than email uniqueness;
4. keep local actor binding below the Git common directory and outside repository state;
5. expose Responsibilities, People & Agents, and Authority as read-only projections;
6. replace the single Human Principal apex without changing the Work execution view;
7. split simulated, real Collaborative, representative pilot, and High-Assurance validation status;
8. retain repository coordination's detect-and-recover contract without claiming a distributed lock.

## Risk review

- **Authority inflation:** UI presentation must not create grants or interpret job titles as grants.
- **Privacy regression:** private-viewer projection must omit Principal records, sponsorships, detailed grants, and local binding.
- **Compatibility:** an upgrade must not overwrite project-owned collaboration data; any shape migration is explicit and testable.
- **False validation:** local multi-clone evidence must not change real-environment status.
- **Overlapping work:** `WI-0029` and `WI-0033` touch shared control-plane paths. Implementation must name both overlaps and proceed sequentially from the current integrated base.
- **Scope growth:** provider-specific identity verification and a distributed coordination backend require separate evidence and are not silently introduced.

## Completion boundary

This design review is complete when its product review is repository-visible, its no-code boundary is independently checked, and a separate implementation Work Item owns the approved follow-up.
