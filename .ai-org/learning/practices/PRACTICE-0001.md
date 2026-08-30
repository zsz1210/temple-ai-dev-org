# Engineering practice: Dispatch role work through coordinator-owned subagents

- ID: `PRACTICE-0001`
- Status: `candidate`
- Confidence: `high`
- Owner Position: engineering_manager
- Created: `2026-08-30T13:20:54.003Z`
- Last validated: not yet

## Summary

Mog keeps the main task as coordinator, gives each internal subagent one Position, Work Item, exact revision, claim, bounded paths, stop conditions, and evidence requirements, and avoids concurrent edits to the same scope. After the subagent returns, Mog verifies canonical repository state before dispatching the next Position. Use a separate user-owned Codex task only when independent user follow-up is itself required.

## Applicability

- solo
- collaborative

## Tags

- orchestration
- handoff
- subagent

## Source Work Items

None recorded.

## Derived Lessons

- LESSON-0001

## Evidence

None recorded.

## Authority boundary

This learning guides relevant work. It does not grant permission, change lifecycle state, or replace verification.

## Validation history

No revalidation recorded.
