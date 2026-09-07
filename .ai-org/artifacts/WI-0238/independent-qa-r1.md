# WI-0238 Independent QA — corrected attempt R1

Verdict: **PASS** for the corrected instruction candidate and offline comparison
readiness. F1–F3 are resolved; semantic review found no remaining acceptance defect.
The prior [failed QA](independent-qa.md) remains historical evidence for `173f43e1`.
This judgment does not authorize a live comparison, integration or production.

## Identity and exact candidate

- Independent QA: Lulu (`agent-lulu`), Position `independent_qa`, runtime
  `/root/wi0238_qa_r1`.
- Developer: Rikku (`agent-rikku`). Fresh inspection of the active entries in
  `.ai-org/project/assignments.json` confirms different Agent Identities.
- Attached worker: `worker-20260907124026-08601f87`; active claim:
  `claim-20260907124026-74a5ec7c`; Principal: `human`.
- Candidate: `af5a984aee6706ab308c693d95e138134162d5d6`.
- Baseline: `4c606f7113600caeec04daf29477daa17b07409c`.
- Checkout: `temple-wi0238-operating-contract`, branch
  `codex/small-task-operating-contract`; date: 2026-09-07 UTC.
- Environment: Darwin arm64, Node.js `24.20.0`, executable
  `/opt/homebrew/Cellar/node@24/24.20.0/bin/node`.
- Effective workflow/risk: Standard. This is not High-Assurance or Release Gate
  evidence. The coordinator owns worker terminal state, handoff, gates and integration.

First used the pinned compact read-only Context preview for this Work Item and
Position, then read the native instructions, complete TEMPLE contract, Work Skill,
relevant assurance/parallel/support/initialization references, Work Item,
assignments, design, obligation map, prior failed QA, corrected Developer and
Test/Eval evidence, readiness summary and comparison proposal. Reviewed all four
complete base/current distribution instruction bodies. The Work Item records
overlap coordination with WI-0190, WI-0211, WI-0234 and WI-0236.

HEAD matched the candidate; tracked implementation, tests, installed/distributed
instructions, dependencies and lock had no diff from that SHA. Existing dirty
coordination and evidence files were preserved. R1 changes since the rejected
candidate are the restored instructions, map, matching installed copies/lock and
additional installed-contract assertions; executable lifecycle code is unchanged.

## Consolidated semantic findings

| Prior finding | Corrected owner and counterexample review |
| --- | --- |
| F1: missing first-init pre-write route | TEMPLE's first-initialization row explicitly requires temple-init before writes, combined names/mappings/integration confirmation and existing-file conflict resolution. The unchanged Skill still requires explicit confirmation and dry-run conflict review. An actor initializing another repository cannot satisfy the stated contract by using only post-init bootstrap. |
| F2: generic changed-scope/risk/ownership stop omitted | TEMPLE's task opening now stops the narrow path before further mutation when any of these changes. It applies to otherwise valid Standard work as well as Lean and does not depend on a prior CLI rejection. |
| F3: explicit routes and abandonment release omitted | AGENTS again records explicit routes with `--context-ref`; the Work Skill explicitly releases ownership on handoff or abandonment after applicable worker cleanup. These conditions do not require inventing routes or adding a packet call. |

The obligation map now assigns all four corrections to these owners. The whole
old/current review retains canonical evidence, required whole/nested sources,
profile/risk floors, distinct Verifier/QA, scoped claims and exact ownership,
current specification authority, UI and High-Assurance triggers, tracker and human
approval boundaries, parallel/support eligibility, uncertain-write recovery,
diagnostic reuse, actual tests and bounded completion. Consolidating repetition
does not change the number of required claim/finish operations or named gates.

Fresh installed assertions cover all six core Skill entrypoints and the restored
conditions, while retaining whole-source Builder/Verifier reads, upgrade
preservation, managed drift/collision rejection and real fixture delivery. These
are structural checks; the semantic judgment above is separate from text matching.
No new implementation repair or additional negative execution was needed.

## Fresh independent checks

`node --test test/operating-contract.test.mjs test/skill-policy.test.mjs test/phase4-installation.test.mjs`

Exit **0**; **10/10 pass**, zero failed, skipped or cancelled;
**4,382.0055 ms** Node-reported duration. The initial focused launch shared a tool
response that was truncated; the command was repeated once to retain the complete
console result above. This is 10 distinct tests, not 20 or a full-suite claim.
The earlier QA's 73 tests are historical checks of the earlier candidate and are
not relabeled as fresh R1 executions.

A fresh `node --input-type=module` read-only assertion command also exited **0**.
It used `fs.readFile`, exported `files`/`digest` from
`scripts/delivery-control-pair.mjs`, `assertInstructionOnlyRuntimes`,
`assertContinuityMatrix` and `liveRequests` from the continuity runner, and
read-only Git revision/tree/status queries with optional Git locks disabled.
It never called prepare, qualification, an approved runner or a model turn.

- Recomputed protocol: `sha256:dafc7fa80cdb274770c8bb339df2bb74a5067f615ce783c02856e80b5804cd27`.
- Recomputed instrument: `sha256:dc0d0f17e1d4ce4ab85937e8b1cd773ee29978007e706d06a2dff86428000124`.
- Current runtime: `sha256:ddbf85b0a72e5c4a7bee0816f3e6c746c6d70fdd44263da1286535400f582ef6`.
- Previous runtime: `sha256:eadf806d728767d8aa829c7f3e8de4fbffe2ffcb60841f01d3f9e23dec1e1922`.
- Both manifests contain **744 files**. Exactly four distribution bodies differ:
  AGENTS, TEMPLE, Work Skill and its Lean execution reference. Old hashes match
  `git show` at the baseline; current hashes match `git show` at the candidate and
  actual files. There is no executable, dependency or policy-file runtime difference.
- The six subjects have unique physical roots, clean tracked/untracked status,
  exact baseline HEAD/tree, their assigned runtime root and `TEMPLE_CLI_PATH`, and
  unchanged shared product facts for each condition. Installed bodies match each
  subject's own distribution. Both Temple requests match after normalizing only
  their two assigned-directory `cwd` fields.
- Every stored audit source was independently read, hashed and byte-counted;
  whole-source representations and all four public summary rows match. Protocol,
  runtime and instrument hashes match both frozen and public records.
- The private lab ending `temple-continuity-live-Q2n9Ja` remains unconsumed.
  Approval, consumed, result, run and seal files are absent; stored live authority,
  live-start and model-generation flags are false. The old `5291b060` protocol
  remains retired with the rejected candidate.

After writing this artifact, the single `npm run verify:fast` run exited **0**:
repository and documentation links passed; actual package boundary was **416
files**, **893,980 packed bytes**, **3,503,986 unpacked bytes**; fast tests were
**54/54 pass**, zero failed/skipped/cancelled, **1,127.569 ms**. This overlaps the
focused group and is not added to its distinct test count or presented as full
verification. Only evidence/result wording was finalized afterward.

## Explicitly reused evidence and limits

Reuse [corrected Developer verification](verification-r1.md) at this exact SHA:
`npm run verify`, Node.js 24.20.0, exit **0**, **767/767 pass**, zero
failed/skipped/cancelled, **195,764.197167 ms**. Its package check records 416 files,
893,980 packed bytes and 3,503,986 unpacked bytes. QA did not rerun or claim authorship
of this full suite. Further implementation/fixture/dependency/contract changes
require new applicable verification.

The frozen current/previous qualifications each record `thread-configured`, passed
runtime controls, confirmed server exit, no cleanup failure and no model generation.
The actual stored record controls each pass **46 cases**, current/stale product
controls respectively pass/reject, and observation qualification matches **9/9**.
These are inspected reused qualification/control results, not QA's executions.
Preparation used the documented standalone Node.js 24.19.0 runtime; fresh hash
checks bind that preparation to this candidate, without claiming live execution.

Four instruction bodies decrease **27,200 → 15,934 UTF-8 bytes** (41.42%);
matched changed-spec selected whole bodies decrease **74,588 → 63,322** (15.10%).
Product facts remain 1,400 bytes and compact navigation remains 4,827 bytes there.
Body and serialized bytes are different measurements. Actual provider Tokens,
source acquisition, delivery time and quality effects remain unobserved.

The future comparison has one subject per treatment/condition, fixed order and
uncontrolled cache, so it is diagnostic rather than population evidence. Its
finite ceiling, no-retry/no-fallback rules and exact-digest approval boundary remain
explicit. Optional Python Skill validation remains unavailable as documented by
Developer; repository-native checks passed. No UI or production behavior was tested.

QA stops after this sole authored evidence file. The Work Skill kept the review
bound to the assigned stage and separate from canonical lifecycle operations.
No implementation, canonical JSON, lock, frozen lab, commit, push or external
system was changed by this runtime. Next owner: coordinator/Release Manager.
