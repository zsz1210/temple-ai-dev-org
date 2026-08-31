# WI-0049 work order

## Outcome

Make Temple Workspace understandable as a human operating console. Open work must read as work, status must read as status, and expandable details must look expandable without requiring knowledge of Temple's internal telemetry vocabulary.

## Authorized scope

- Refine Work Item headings, grouping, status labels, disclosure affordances, and detail hierarchy.
- Replace the healthy snapshot success banner with one quiet last-updated timestamp.
- Preserve a prominent stale/error state and the existing mutation lockout.
- Audit prominent Workspace copy for internal implementation language and move trace details into progressive disclosure where appropriate.
- Update focused tests and the operator documentation.

## Boundaries

- No lifecycle semantics or canonical state changes.
- No new remote command or write capability.
- No release, publication, deployment, or public-network exposure.
- Existing Work Items keep their evidence. WI-0049 is the sequential successor for this bounded presentation refinement.

## Evidence expected

- Focused automated tests for labels, grouping, status freshness, and private-viewer boundaries.
- Full `npm run verify` result.
- Browser review at wide desktop, tablet, and mobile widths.
- Independent QA on the exact candidate revision.

