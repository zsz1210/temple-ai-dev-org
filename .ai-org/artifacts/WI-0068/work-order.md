# WI-0068 work order

Correct the validation-program telemetry boundary discovered by WI-0067. Inspection, live adapters, and reporting must agree that private Provider telemetry belongs in the repository's Git common directory, never in the version-controlled worktree. The fix must reject an invalid explicit location before generation and must not alter or resume the retained stopped run.
