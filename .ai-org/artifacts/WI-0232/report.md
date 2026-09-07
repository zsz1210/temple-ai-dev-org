# WI-0232: installed Codex continuity compatibility

## Decision

Do not launch the continuity comparison using the existing workspace-write policy.
The installed runtime lets the actor read a sibling synthetic file, despite denying
its sibling write. The desired restricted-read field is absent from this runtime's
generated schema. A prompt asking the actor not to read coordinator files is not
equivalent to an enforced read boundary.

This result qualifies a diagnostic instrument, not the live execution environment.
It does not establish that a previous model actually read answers, invalidate every
historical result, or describe the security of every Codex configuration.

## Evidence and implementation

Environment observed on 2026-09-07: installed `codex-cli 0.153.1`, Node.js 24.20.0,
macOS. Schemas were generated locally with and without `--experimental` before
request design. No account lookup, authentication change or model generation ran.

| Intended capability | Stable schema | Experimental schema |
| --- | --- | --- |
| Thread workspace sandbox spelling | `workspace-write` | `workspace-write` |
| `allowProviderModelFallback` | Not declared | Declared; experimental opt-in required |
| `sandboxPolicy.readOnlyAccess` | Not declared | Not declared |

Schema-set SHA-256 (ThreadStartParams, TurnStartParams, CommandExecParams and
CommandExecResponse; canonical keyed JSON):

- Stable: `ffa25fdb5c838c7388e5c704ebe0c251fdf822293ad157c6eb0fbf8f4ac1e898`.
- Experimental: `8ac6a06282e8bcf9a11b18ca98f9e79ff12500d5569ba369b386d7c7da03d451`.

Both ordinary and Temple preview requests fail the installed-schema compatibility
check. Generic schema acceptance can allow unknown keys; the new inspector also
requires each intended request and sandbox field to be explicitly declared.
Schema compatibility never certifies effective permissions or model availability.
Model and reasoning remain explicit preview parameters, not selected run settings.

The reusable preview shares product instructions and completion shape across arms,
using current SPEC.md and HANDOFF.md. Temple adds its actual fixture Identity and
Work Item, required entry/claim and Developer Build-to-Test procedure. No old
Builder identity or fixed Work Item is assumed. No live dispatcher is implemented.

## Actual no-generation probe

Two no-generation probes were performed: one development check and one exact
candidate check at `9fe179bb198861bf6a701333d3b39fd39ebc2339`. Both returned the
same result below. Each owned stdio App Server received initialize, initialized
and four bounded command/exec requests. Commands use Node only to read/write harmless markers in
fresh probe-owned directories. No thread or turn was created. The legacy policy
was tested as a diagnostic, never substituted for the requested restricted policy.

| Control | Observed |
| --- | --- |
| Read own marker | Allowed; marker matched |
| Write own file | Allowed; file independently observed |
| Read sibling marker | Allowed; marker matched |
| Write sibling file | Denied; no file created |

Outcome: `isolation-gap-observed`. Server exit was confirmed and exclusive scratch
was removed. No cleanup failure. No private file content, host path, raw provider
response or credential is retained here. Network and descendant-process isolation
are explicitly not qualified. Zero generation requests is not a measured account
billing or Token result.

## Verification

Behavioral candidate: `9fe179bb198861bf6a701333d3b39fd39ebc2339`.
Final `npm run verify` passed: 732/732 tests, zero failed, skipped or cancelled;
test duration 186936.437541 ms. Repository and documentation checks passed; the
actual npm dry-run boundary is unchanged at 415 files (895603 packed bytes,
3510029 unpacked bytes). These repository-only scripts/tests are not distributed.
Doctor before handoff: 36 pass, 1 existing stale-parallel-plan warning, 0 fail.
This sequential work does not dispatch from that plan. No UI/browser gate applies.
Later evidence-only revisions must retain source equivalence to this candidate.
Initial focused test run: 9/9 passed, 367.152084 ms. Controls cover shared facts and
explicit identities, invalid inputs, permissive-schema false positives, no-launch
status, sibling-read leakage, failure redaction, no retry, malformed responses,
cleanup failure and late unexpected generation events. Simulated results identify
themselves as simulated; they cannot certify the installed runtime.

Source review additionally found that a later protocol error could overwrite the
observation of generation, and that permissive nested schemas could omit individual
read safeguards. Sticky generation observation and explicit restricted-variant
field checks repaired both. The final focused run passed 10/10 (381.163916 ms).
The reusable schema reader reproduced both recorded schema-set hashes and blockers.

On uncertain server shutdown, the probe retains its scratch instead of deleting
storage possibly still in use. An unexpected generation notification changes the
generation observation to unknown and fails the probe. These tests exercise only
the diagnostic adapter; they do not qualify descendant cleanup for live agents.

## What remains before a model comparison

1. Select and qualify a supported isolation route: an explicitly verified named
   permission profile, a runtime that implements the documented restricted reads,
   or a separate OS-isolated execution environment. None is selected, configured
   or silently installed here. Check allowed tool access too, not only command/exec.
2. Verify native instruction loading, fresh-thread behavior, exact fixture Identity,
   lifecycle/handoff binding, usage collection, first-stop cleanup and no fallback
   on that same execution route. Schema presence alone is insufficient.
3. Freeze the resulting protocol and obtain exact model/budget/duration/privacy and
   useful-effect decisions. Do not reuse historical caps or automatically retry.

The next work should close the isolation gap before spending model capacity.
The existing four-stage delivery runner is unchanged; its private command policy,
schema checks and historical evidence are not newly certified by this report.

## Sources and limits

[Official Codex App Server documentation](https://developers.openai.com/codex/app-server)
describes generated version-specific schemas, experimental opt-in, restricted read
roots, command/exec without turns, and sandbox-exempt process/thread-shell commands.
The actual installed schemas and probe narrow what can be claimed locally. The
documentation's current examples are not a promise that every installed version
accepts every shown field. The existing JSON-RPC transport was reused; no SDK,
third-party dependency or optional integration was added.

Rollback withdraws the new repository-only adapter/tests while retaining this
result. Acceptance of WI-0232 is not launch approval, an environment upgrade,
administrator merge or package publication.
