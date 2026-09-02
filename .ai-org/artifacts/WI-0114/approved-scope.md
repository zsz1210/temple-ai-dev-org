# WI-0114 approved scope

Integrate the qualified agent-led post-init bootstrap contract and Claude entrypoint compatibility behavior onto current `main`.

The bounded write scope is the nine paths recorded on WI-0114 plus Temple-owned work-item, evidence, event, handoff, and generated-view records for WI-0114. Superseded init-handshake records under earlier collided IDs must not be imported.

Acceptance requires deterministic human and JSON bootstrap output; fresh-session and explicit-read paths; all lifecycle authority flags remaining false; safe absent, compatible, incompatible, dry-run, conflict, race, and re-init behavior for `CLAUDE.md`; full verification; distinct Independent QA; and a release-gate decision on the exact current-main candidate.

This item does not authorize package publication, deployment, provider invocation, credential changes, or external action beyond the user-authorized branch push, pull request, and merge after all gates pass.
