# Field remediation verification record

Scope: WI-0230 and joined modules WI-0231, WI-0232 and WI-0233. Baseline: Alpha.32 `e63829dc01e50a10e8bbb4c7cdd4ea2a950c6f6b`. Developer: agent-rikku. This document records observed checks, not an independent acceptance decision.

## Candidate history

- `56700f3abe03a43ca1d2dd6c9ed19ba70231e53b`: first complete implementation. Full `npm run verify` on Node v24.20.0/macOS ran 1229 tests in 292.505 seconds: 1222 passed, 7 failed. This candidate was not accepted.
- Repairs preserve eligibility and expiry rejection, correct scalar/repeated Learning argument parsing, classify configure argument rejection as no-write, expose actual selected actors in compact navigation, derive stage qualifications consistently, and repair old fixtures that substituted a default participant or omitted actual authorship.
- `535c306e38355864adc336f0a1289f105855bbdd`: full verification passed 1232/1232 in 297.835 seconds, and the repeated browser/installation gates passed. Independent Test/Eval rejected it for two V10 gaps (IR-01/IR-02): post-apply view rebuilding and unchanged active claims. Automated success did not authorize acceptance.
- Same-scope rework is tracked by a new attempt-specific verification record and independent review; no failed attempt is counted as a pass.

## Finding-to-implementation map

| Finding | Implemented surface |
| --- | --- |
| F01 actual actors | Shared actor resolution, Work Item claim/handoff/transition/close, assurance and context |
| F02 Solo-to-team | Fingerprinted collaboration transition preview/apply preserving work and claims |
| F03 first use | Contributor readiness and authorized idempotent setup |
| F04 task risk | Workflow default independent of team size; escalation floors retained |
| F05 recovery guidance | Typed diagnostics with missing condition, owner, mutation state and next action |
| F06 command support | Trusted-local argv adapter, confined-node boundary and explicit capabilities |
| F07 repeated checks | Complete declared-input fingerprints, immutable measurements and conservative reuse |
| F08 slow-looking QA | Separate active execution, completed review, waiting and historical evidence debt |
| F09 merge friction | Stable-ID reconciliation, conflict preview, validation and recoverable journal |
| F10 evidence portability | Exact historical-byte archives, integrity inspection and clone retrieval |
| F11 inconsistent guidance | Pinned CLI, common entry, managed contract/Skill, console and public guides |
| F12 local identity | Fresh ordinary attribution without framework login; legacy and strict policies explicit |
| F13 shared names | Duplicate labels with distinct stable IDs, sponsored selection and readable disambiguation |

## Frozen acceptance coverage

Every row requires independent judgment of the final candidate; test names describe fixtures rather than human trials.

| Case | Evidence source and negative control |
| --- | --- |
| V01 | `field-actors`, `field-lifecycle`: default/non-default roles, active claim priority, mismatch, inactive/expired and stage-qualified membership |
| V02 | `field-lifecycle`: actual Developer handoff/sponsor; self-approval and same Developer/reviewer rejected |
| V03 | `field-actors`: profile adoption preserves IDs, claims and file bytes; stale proposal rejected |
| V04 | `field-actors`, `field-lifecycle`: ordinary clone without binding, compatible existing provenance, unknown/mismatched/expired rejection |
| V05 | `field-lifecycle`, workflow/High-Assurance suites: ordinary visual vs deployment and security assurance floors |
| V06 | `field-verification`, `field-cli`: administrative change gives a hit without running or approving; lost/tampered evidence gives a miss |
| V07 | `field-verification`: dependencies, fixture/test bytes, directory additions/deletions/modes, toolchain, environment and command invalidation |
| V08 | `field-attention`, `field-cli`, browser gate: completed review awaiting device, privacy redaction, stale claim/evidence and no false running spinner |
| V09 | `field-verification`, `field-cli`: real macOS Node and non-Node execution, argument safety, timeout/output/descendant cleanup, spawn failure and no unrestricted fallback |
| V10 | `field-reconciliation`: independent records/histories, deterministic views, schema/reference validation and competing ownership/lifecycle conflicts |
| V11 | `field-evidence`: actual new local Git clone, binary/empty/spaced paths, exact historical retrieval, tampering/escape/collision and missing source controls |
| V12 | `field-reconciliation`, `field-attention`, existing rework/Lean recovery: real SIGKILL rollback, intervening-edit preservation, owner and unmet conditions |
| V13 | `field-lifecycle`: actual local product edit and test by a synthetic new contributor, zero extra framework login or manual intervention |
| V14 | `field-actors`: identical display labels produce distinct IDs and reuse existing identities; ambiguity is not silently resolved |
| V15 | `field-lifecycle`, `field-attention`: human and Agent measurements share acceptance criteria; views neither backdate claims nor grant acceptance |
| V16 | `field-actors`, `field-lifecycle`, High-Assurance: ordinary/legacy/strict policy, current qualification, actual sponsor and no provider-authentication claim |

## Installation and browser observations

Candidate `56700f3a` passed the browser gate at 390, 768, 1440 and 3440 pixels, six primary views, reduced motion and six synthetic attention states. The environmental waiting screen was visually inspected; its impediment and next step now agree.

A disposable installation rehearsal using the candidate's explicitly selected pinned CLI passed fresh initialization/Doctor, legacy upgrade/Doctor and status. Fresh configuration uses attribution; an existing missing actor policy retains exact prior bytes and project-owned company documentation. The rehearsal made zero network calls. This is source-candidate installation, not a published-package adoption.

## Measurement interpretation and limits

Separate token use, elapsed delivery and observed quality. No account quota polling, paid model experiment, input/output token measurement or monetary estimate was performed. A first-use fixture previously measured 162 ms to claim, 162 ms to edit and 198 ms to verifiable output; full-suite contention produced 378/379/428 ms. These are synthetic local automation observations, not representative human or model speed.

Windows command execution remains explicitly unavailable pending a Job Object adapter and real Windows validation. Trusted-local execution is not a sandbox and commands must not detach/daemonize. Same-machine clones do not prove independently operated human machines. An archive proves available bytes/integrity, not external source authentication; absent historical bytes remain absent. Existing downstream configurations, identities, expiring grants, Git hosting policy and product repositories were not changed. No publication, deployment or main-branch merge is part of this record.
