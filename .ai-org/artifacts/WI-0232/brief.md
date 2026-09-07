# WI-0232: Codex continuity compatibility boundary

Continue the accepted WI-0231 instrument with a repository-only request blueprint
and no-generation compatibility probe. No live executor, model choice, launch,
budget, runtime upgrade, global config change or external publication is authorized.

Use installed version-specific stable and experimental schemas, not permissive
JSON validation alone. Require every intended top-level and sandbox field to be
declared. Thread sandbox spelling and experimental fields are version-specific.
Plan a fresh Build takeover, common product instructions and a separate Temple
governance addendum using the actual fixture Agent Identity, never old harness IDs.
The future endpoint is exact committed product plus a structured handoff; Temple
Developer proceeds only to Test. The plan remains non-executable and live_ready false.

The probe may start one owned stdio App Server and issue initialize/initialized and
bounded command/exec requests against exclusively created synthetic files. It must
not create threads, start turns, inspect accounts or call external tools. Compare
allowed read/write controls with sibling read/write controls under the installed
legacy workspace policy; this diagnoses capabilities, never supplies a permissive
fallback for the desired restricted-read policy. Raw command output and host paths
stay local; retain booleans, schema hashes, CLI version and typed failures only.
Close only the owned server, remove only its exclusive scratch, and surface cleanup
failure separately. Sibling reads use harmless markers created by this probe, not
private files. Network and descendant-process isolation remain unqualified.

Acceptance: requests separate common facts from governance; unknown schema fields
and missing restricted reads/experimental opt-in are explicit blockers; generation
methods cannot be sent through the probe; deterministic failure/cleanup and unsafe
input tests pass; one actual installed no-model probe records its result honestly.
Run full verification and distinct Independent QA. An incompatible installed runtime
is an informative result, not permission to weaken checks or repeatedly launch.
Stop when the instrument and compatibility result are recorded; later execution
design must address remaining capability gaps before a frozen model experiment.

Official basis (retrieved 2026-09-07):
[Codex App Server](https://developers.openai.com/codex/app-server), Message schema,
Experimental API opt-in, Sandbox read access, Command execution and Turn events.
The docs describe version-specific generated schemas, restricted read roots,
command/exec without model turns, and sandbox-exempt thread/shellCommand/process
operations. Local schema inspection already distinguishes stable versus experimental
fields; further runtime claims require the probe. Reuse Temple's existing JSON-RPC
transport; no new third-party code, package or optional integration is installed.

Risk: false capability claims could invalidate later experiments. Keep raw local
protocol inputs separate from public evidence and leave unavailable guarantees
unqualified. Rollback withdraws only these new repository-only adapter/tests while
retaining evidence. No UI applies.
