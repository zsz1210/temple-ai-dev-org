# UI brief — WI-0034 current-state Dashboard

## Primary job

Answer, in order: what needs attention now, what is currently executing or awaiting verification/approval, whether the view is fresh enough to act on, and where historical evidence can be inspected.

## Required interaction states

- Dirty command draft during an unrelated live event: preserve text, selection, and focus.
- Dirty draft during a target/turn change: preserve text, clear confirmation, show the changed precondition, and require review.
- Stream connected but snapshot stale: show a global stale state and disable mutations.
- Canonical attention: show failed workers, unresolved Work Items, and approval/QA queues before terminal history.
- Historical timeline: show one canonical record per repository event; do not relabel replay time as occurrence time.
- Narrow layout: keep current attention and actions above collapsed history without horizontal overflow.

## Accessibility

Use native controls, a skip link, visible focus, polite live status for connection and successful updates, assertive error announcement, and textual state labels independent of color.
