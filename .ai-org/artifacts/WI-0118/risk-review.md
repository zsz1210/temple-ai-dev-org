# Risk review — WI-0118

## Risk classification

Standard framework change. It modifies managed lifecycle semantics and project-owned historical projection but performs no external release or production action.

## Main risks and controls

- **Split-brain terminal behavior:** use one workflow resolver and test every consumer named in the technical design.
- **Silent project-owned migration:** installation and upgrade only add managed support; historical Work Items change only through an explicit idempotent command.
- **Converting real blockers:** legacy normalization requires the complete release-gate no-go structural signature. WI-0086 must remain blocked and actionable.
- **Treating no-go as success:** `concluded` is terminal but not accepted; usage calibration and external tracker mapping keep the outcome distinct.
- **Lean bypassing assurance:** only explicit low-risk bounded work without escalation triggers can use Lean. Standard remains the compatibility default, and High-Assurance prerequisites remain unchanged.
- **Profile terminology collision:** UI and documentation distinguish organization, workflow, and model profiles.
- **Automating unsupported model routing:** this Work Item records advisory guidance only; no model dispatch is automated.
- **UI regression:** perform browser-level desktop, wide, tablet, and narrow review against real project data after tests.

## Rollback

Revert the implementation commit before release. The explicit historical migration is content-visible in Git and can be reversed with the same revision if the new terminal semantics are rejected. No external state requires rollback.
