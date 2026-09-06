# WI-0191 readiness history

## Executor implementation update

This section supersedes the initial design-only status below. The executor,
isolated product fixtures, native actor tracker and generation-free checks now
exist. The recorded initial preflight is historical, not the current runnable
seal. See `executor-report.md` for checked behavior and remaining gates. No live
before/after result is claimed.

Formal readiness QA is now recorded in `independent-qa.md` for candidate
`85beb7acef3c3f9d8fe2678a66f3c3b10c45b2dd` and the exact sealed protocol.
The current remaining authorization boundary is the numerical live envelope
in `approval-request.md`; no live run has started. The old sections below
remain historical and do not override this update.

## Completed

- Recorded six paired scenarios, balanced AB/BA order, authority/stale-evidence/injection counterexamples and a 16-subject-turn accounting boundary.
- Pinned sanitized before/after revisions; generation-free source comparison confirmed identical runtime/dependency inputs and unchanged sealed WI-0189 artifacts.
- `node --test .ai-org/artifacts/WI-0191/preflight.test.mjs`: **7/7 passed**, zero failures/skips. These are design/accounting checks, not subject task outcomes.
- `node .ai-org/artifacts/WI-0191/preflight.mjs`: captured in `preflight-result.json`; **zero model calls**, live readiness false.
- Repository/documentation/package checks and **54/54 fast tests** passed. Doctor reported 36 pass, zero failures and one retained stale-plan warning; no dispatch used the plan. Framework source and its 632-test suite are unchanged; a new full-suite result is not claimed for this design-only slice.
- Installed Codex CLI 0.153.1 generated the current JSON schemas. Existing generation-free provider discovery confirmed Terra medium availability and disabled memory, while reporting final usage completeness as not established.
- Official App Server/subagent documentation was inspected; references and implications are in `design.md`. No API key or model-generation request was used.

## Measured context tradeoff

Across the five changed distributed instruction paths, before contains 26,721 bytes and after contains 31,148 bytes: **+4,427 bytes**. This includes the newly added support reference (absent before). These are stored UTF-8 source bytes, not actual loaded context, billed Tokens, or an efficiency result. The before/after difference may be unfavorable if the subject reads more new guidance than it saves in repeated work. Report actual acquisition and invocation traces rather than assuming a benefit.

## Not ready for live execution

The old runner's no-subagent instruction and single-thread event check are incompatible with the third hypothesis. A new experiment-local native child adapter, source/prompt/fixture bindings, sandbox counterexamples, per-actor usage coverage and held-out product oracle remain to be implemented and verified. The draft deliberately provides no live execution command. The current adapter/protocol discovery does not prove child cost aggregation or read-only containment.

The usage policy has no configured automatic experiment budget. The design proposes an explicitly non-optimal planning envelope from named prior observations, but no approval is recorded. Obtain approval only after a runnable frozen protocol exists. No old approval, consumed reset or fallback is reused. The user authorized design and testing conditional on readiness; that condition has not yet been met.

Next: implement and verify those experiment-local prerequisites within WI-0191's declared artifact scope, retain the old runner unchanged, freeze exact artifacts, then obtain the scoped live envelope. If native helper behavior cannot be observed reliably, report the support pair as not testable instead of substituting simulated savings. Do not mark WI-0191 complete or WI-0190 efficient based on this preflight.

The initial worktree lacked installed dependencies, causing the launcher to fail before Work Item creation. `npm ci --ignore-scripts` resolved that local setup issue; the subsequent create/claim succeeded. No failed model run occurred.
