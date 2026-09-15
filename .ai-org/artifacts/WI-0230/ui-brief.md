# Delivery attention and recovery UI brief

- Work Item: WI-0230
- UI Designer responsibility: agent-yuna
- Delivery mode: code-first
- Medium: existing console components and CLI status views
- Specification: docs/planning/field-remediation.md
- Technical contract: docs/adr/0067-low-friction-collaborative-delivery.md

## Scope and visual direction

Preserve existing navigation, typography and responsive layout. Add concise status and next-action text within the existing Work/detail presentation. The first visible line states whether work is running, ready for a person, waiting for an environment, or complete at its recorded boundary. Do not use a generic QA spinner for missing conditions. Show actual Agent labels with disambiguation when needed; preserve private-view redaction.

## Required state coverage

Ready; attributed ordinary work without local binding; strict actor evidence required; another claimant; ambiguous eligible Agents; completed review waiting for environment; reusable measurement; reuse miss; historical evidence debt; reconciliation conflict. Unknown remains visibly unknown. Do not add visual claims of authenticated identity or accepted delivery merely because navigation succeeded.

## Verification

Review CLI wording with focused fixtures. For console changes run the existing real-browser gate at its four responsive layouts, keyboard tabs, reduced motion, clipping and horizontal overflow checks. Inspect the rendered changed states with synthetic data. A passing schema or screenshot alone is not independent acceptance of lifecycle behavior.
