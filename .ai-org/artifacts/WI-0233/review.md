# WI-0233 review

Reviewer: agent-lulu, Principal human; distinct from Developer agent-rikku.
Exact candidate: `3697a4f578cfc26bcb83f08b286670b740dc28b7`.
HEAD and the two source/test files match that candidate. Prior bounded source
inspection applies unchanged. Authority and Skill bodies are unchanged from the
already-read sequential review context; brief, Work Item and handoff were checked.
Coordination in the brief confines this work to new files and WI-0233 evidence;
WI-0190/WI-0211 retained files are untouched and no parallel dispatch occurs.

## Test — pass

Independent `node --test test/continuity-named-permissions.test.mjs`: 7/7 passed,
zero failed/skipped/cancelled/todo, 96.995166 ms. These tests use simulated
transports/runtime resolvers, local synthetic files and an owned loopback listener;
no installed Codex or model probe was rerun. They exercise explicit permissions,
schema-declaration limits, malformed/input rejection, positive controls, symlink
leakage, first provider failure, privacy, cleanup and sticky generation uncertainty.

Reuse Developer's exact-candidate full `npm run verify` in `report.md`:
739/739 passed, zero fail/skip/cancel, 189458.460917 ms, Node 24.20.0. Package
boundary remains 415 files. Full verification was not independently duplicated.

## Eval — pass within bounded scope

The report attributes the actual command-only confirmation to this exact candidate,
Codex 0.153.1 and explicitly selected bundled Node 24.19.0, separate from full-suite
Node 24.20.0. Experimental field declarations are distinguished from absent stable
fields and from effective permissions. I reviewed that evidence, not a fresh
installed-runtime execution.

All requested controls are recorded: own read/write and synthetic Git succeed;
sibling read/write, symlink read and sandboxed loopback receive explicit permission
denial; the coordinator reaches the owned listener. Server/listener/scratch cleanup
is recorded. Fourteen development invocations remain disclosed separately from
the fifteenth exact-candidate confirmation, including the failed Homebrew route
and conservatively labelled wrapper observations. They are not model samples.

These results accept the diagnostic instrument, not a general sandbox or future
experiment. WI-0232's legacy route remains unqualified. Native tools, descendants,
fresh sessions, instruction loading, usage and numeric launch/value decisions
remain later prerequisites; live_ready is false. No Token or efficiency claim.

## Independent QA — pass

No remaining concrete P1/P2 finding. Source uses an explicit process-local named
profile, no legacy override or generation method. Negative controls require
permission errors rather than generic failures. Positive controls prevent unusable
runtimes from passing. Owned transport close confirms child exit; uncertain close
retains scratch, listener cleanup is separate, and raw errors become typed failures.
The recorded Git revision is correctly limited to a command observation, not product
acceptance. Runtime read grants remain scoped to the selected executable directories.

Hand off only to Release Gate with claim released. No source, global configuration,
model launch, merge, release or publication is authorized by this acceptance.
