# WI-0080 Human Review Selection

- Date: 2026-09-01
- Review boundary: uncommitted local README preview
- Selected direction: C4-inspired system-context overview
- Selected candidate: `.ai-org/artifacts/WI-0080/diagram-candidates/temple-overview-c4.zh-TW.svg`
- Decision: replace all three localized public overview SVGs with this shared structure
- External action: no commit, push, publication, dependency installation, or integration activation

## Review outcome

The first infographic direction and the later responsibility-table direction were rejected during human review because they felt too corporate, lacked an engineering-diagram character, or required too much interpretation. The selected direction keeps Temple at the center as a project-local framework boundary and makes the surrounding relationships explicit:

- the Human Principal provides direction and authority and receives approval requests;
- Temple groups its internal behavior into four mechanisms;
- human and AI executors receive work and context and return status and handoffs;
- the project repository stores shared truth and supplies the current facts needed to resume work.

The approved candidate is C4-inspired rather than a claim of formal C4 compliance. Its notation research is recorded in `diagram-candidates/research-notes.md`. The final localized SVGs preserve the same geometry and visual hierarchy while shortening English and Japanese display copy where their text width would otherwise cross a component or actor boundary.

## Release boundary

This selection authorizes the local documentation revision and verification only. The Work Item remains at Release Gate until an exact revision exists and commit or push is separately authorized.

## Commit and push authorization

On 2026-09-01, after reviewing the selected local preview, the Human Principal explicitly requested that this version be pushed so it could be inspected on GitHub. This authorizes a bounded commit and push of WI-0080's README, localized overview assets, and canonical evidence. It does not authorize inclusion of concurrent WI-0077 or WI-0079 work, dependency installation, deployment, package publication, or another external action.
