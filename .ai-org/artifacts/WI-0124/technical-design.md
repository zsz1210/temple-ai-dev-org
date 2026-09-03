# Technical design — WI-0124

Add one safe `rejectUnknownProperties` helper and invoke it at every `additionalProperties: false` Request object boundary. Extend resource-entry validation with the exact allowed key set for limits and observations. Require the selection object rather than silently substituting a policy mode for a structurally absent object.

Restrict canonical generated time with a four-digit UTC-millisecond regex plus exact `Date.toISOString()` round-trip. Replace object spreading in Route generation with explicit field projection for Task Shape and both resource entry kinds.

Regression tests cover all unknown-property boundaries, expanded years, retained valid timestamps, output stripping defense, and all previous suites. Separate Independent QA must test the exact candidate.
