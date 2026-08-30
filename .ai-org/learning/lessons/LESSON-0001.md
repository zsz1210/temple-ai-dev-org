# Engineering lesson: Keep bounded role work inside the coordinator task

- ID: `LESSON-0001`
- Status: `candidate`
- Confidence: `high`
- Owner Position: not assigned
- Created: `2026-08-30T13:20:45.038Z`
- Last validated: not yet

## Summary

For bounded role handoffs that should return automatically and let Mog continue the workflow, use internal subagents inside the main Codex task. Keep the canonical Work Item, claim, exact revision, and evidence in the repository; reserve separate user-owned Codex tasks for genuinely independent work the user needs to revisit directly. Temple currently requires an ordinary claim for sequential internal-subagent work because parallel prepare only dispatches safe parallel waves.

## Applicability

- solo
- collaborative

## Tags

- orchestration
- codex
- subagent

## Source Work Items

- WI-0030

## Derived Lessons

None recorded.

## Evidence

- a24092385967173c61c12597e1e8c3d12910a846
- .ai-org/artifacts/WI-0030/independent-qa-report.md

## Authority boundary

This learning guides relevant work. It does not grant permission, change lifecycle state, or replace verification.

## Validation history

No revalidation recorded.
