# WI-0065 work order

- Outcome: make reasoning configuration provenance truthful before any multi-repository model run.
- Authority: local framework implementation and local verification only; no deployment, publication, remote write, API-key use, reset, or automatic routing.
- Governing UI reference: `UI-0002@ui-1`.
- Protocol evidence: installed Codex App Server `0.151.0-alpha.7.2` exposes a requested `turn/start.effort` and a thread-level `thread/start.reasoningEffort`, but no direct turn-effective reasoning acknowledgement.
- Compatibility rule: retain the legacy `reasoning_effort` field only as a source-labeled projection; new consumers use the three explicit provenance fields.
- Overlap coordination: WI-0065 owns only reasoning-provenance changes in files also named by WI-0029 and WI-0033. Those Work Items have no active claim; their command-gateway and provider-trust scopes are unchanged.
- Stop condition: focused tests, full verification, runtime visual review, and Independent QA either pass on one exact candidate or the item stops with the failing evidence.
