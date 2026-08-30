# Product specification — WI-0041

The Dashboard must become current after a large retained-event replay without opening an unbounded number of simultaneous snapshot requests. Missing or delayed data must continue to produce the existing stale-state warning and disabled mutations. The correction must not weaken the private read-only boundary or generate new telemetry.

Acceptance is satisfied only when automated regression evidence and a real Chromium run show current state at both desktop and 420px widths.
