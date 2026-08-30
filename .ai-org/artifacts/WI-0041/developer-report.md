# Developer report — WI-0041

- Candidate revision: `660f397a6f17c805ec2ef0467d27c8a53ca28134`
- Developer: Rikku (`agent-rikku`)
- Decision: ready for Test

## Change

The Dashboard now sends SSE replay notifications through a dependency-free refresh coordinator. An idle burst is debounced to one load; notifications arriving during a load request at most one sequential follow-up. The existing stale-state failure path, initial load, server replay protocol, private-viewer boundary, and Agent Command behavior remain unchanged.

## Verification

- A deterministic 2,000-event regression proves one in-flight refresh, one pending follow-up, and no concurrent snapshot fetches.
- Focused control-plane regression passed 27/27.
- Full repository verification passed 218/218.
- Live Chromium reached `Snapshot current` with 0 console errors at 1440 × 1000, 420 × 900, and the 1024 × 1366 private tailnet viewer.
- All three viewports had no horizontal page overflow. The private viewer contained neither Inbox nor Agent Command surfaces.

Runtime screenshots were treated as transient review material; their dimensions and SHA-256 digests are recorded in the evaluation report rather than added to the public repository.
