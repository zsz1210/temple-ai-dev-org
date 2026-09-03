# Work order — WI-0120

Repair the versioned Execution Route validation boundary exposed by the separate post-close Independent QA of WI-0119.

The correction must preserve WI-0119's historical closeout, define the complete `temple.execution-route/v1` JSON shape, add semantic consistency checks that JSON Schema cannot express, and retain provider-neutral, read-only resolver behavior. The repair is local and must not contact a Provider, create or resume a Codex task, purchase Credits, push, merge, deploy, publish, or release.

WI-0086 continues to own public-release qualification. The shared installation test is used only to verify the corrected managed schema is installed and preserved.
