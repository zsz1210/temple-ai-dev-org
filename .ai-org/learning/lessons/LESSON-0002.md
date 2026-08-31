# Engineering lesson: Task registration does not guarantee live Token observation

- ID: `LESSON-0002`
- Status: `candidate`
- Confidence: `medium`
- Owner Position: not assigned
- Created: `2026-08-31T05:51:17.367Z`
- Last validated: not yet

## Summary

A one-turn Codex task was registered and history-correlated to its Work Item, Position, thread, and revision, but live attachment returned thread-resume-invalid and no thread/tokenUsage/updated event was captured. Future baselines must establish observer readiness or a provider-owned launch before work begins, and missing usage must remain unknown rather than zero.

## Applicability

- solo

## Tags

- instrumentation
- codex
- token-usage

## Source Work Items

- WI-0051

## Derived Lessons

None recorded.

## Evidence

- .ai-org/artifacts/WI-0051/pilot-result.md

## Authority boundary

This learning guides relevant work. It does not grant permission, change lifecycle state, or replace verification.

## Validation history

No revalidation recorded.
