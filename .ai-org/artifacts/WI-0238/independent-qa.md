# WI-0238 Independent QA — rejected candidate

Verdict: **FAIL** for obligation-preservation acceptance. Passing executable
checks do not establish semantic equivalence. No implementation was repaired.

## Identity, revision and scope

- QA: Lulu, `agent-lulu`, Position `independent_qa`, runtime `/root/wi0238_qa`.
- Developer: Rikku, `agent-rikku`. Current `assignments.json` independently
  confirms these are different active Agent Identities.
- Worker: `worker-20260907122239-523a6a13`; active claim:
  `claim-20260907122239-548e4186`, Principal `human`.
- Exact candidate: `173f43e1becdca8c3f1e672b173497b95441cd71`.
- Base: `4c606f7113600caeec04daf29477daa17b07409c`.
- Worktree: `temple-wi0238-operating-contract`, branch
  `codex/small-task-operating-contract`; 2026-09-07 UTC.
- Effective profile/risk: Standard. This is not High-Assurance evidence or a
  Release Gate decision. The coordinator owns canonical records and integration.

First resolved `context resolve . --work-item WI-0238 --position independent_qa
--compact --no-write --json` with the pinned launcher, then read native instructions,
the complete TEMPLE contract, Work Skill, routed Work Item, assignments, design,
obligation map, verification, Test/Eval, readiness and proposal. Reviewed the old/new
four bodies and their retained assurance, parallel and read-only-support references.
The recorded overlap coordination covers WI-0190/WI-0211/WI-0234/WI-0236.
Only coordination/evidence was dirty; tested implementation files matched HEAD.

## Findings

### F1 — P2: first initialization lost its required pre-write Skill route

At the base, `project-overlay/TEMPLE.md:73` requires reading
`.agents/skills/temple-init/SKILL.md` **before first initialization**, preserving
confirmation and conflict resolution before writes. Candidate TEMPLE's trigger
table at lines 41–50 omits that route; lines 54–62 apply only **after** `temple init`
ran. None of the other three changed entrypoint bodies restores the pre-init route.

Counterexample: an actor using this Toolkit to initialize another repository can
follow every newly stated trigger without opening the initialization Skill. That
misses its combined pre-write confirmation of names, mappings and integration
policy, and its exact existing-file/conflict procedure. The Skill still exists and
can be discovered; existence is not the explicit mandatory routing retained by the
baseline. Post-init bootstrap cannot replace the earlier obligation.

Restore the pre-init trigger and reference in the complete contract and map it
separately from post-init bootstrap. No actual unauthorized init was performed.

### F2 — P2: generic changed-scope/risk/ownership stop is no longer explicit

Base `project-overlay/TEMPLE.md:62–63` says that if scope, risk or ownership changes,
stop the narrow path and resolve the applicable route. Candidate TEMPLE omits this
general trigger. Lean execution lines 3–5 retain eligibility exclusions, and lines
22–23 require rechecking changed state/authority. Failed-operation recovery also
retains reconciliation. Those protect specific paths but do not directly preserve
the general pre-mutation rule for every responsibility.

Counterexample: newly discovered risk or a changed ownership boundary during
otherwise valid Standard work need not change canonical state or first produce a
CLI rejection. The old contract explicitly stopped the currently selected path
for that condition; the new contract relies on inference from effective policy.
Restore a general stop-and-reroute sentence and its obligation-map entry.

This is an instruction-preservation defect, not evidence that profile/claim guards
can be bypassed. Fresh negative tests confirmed those guards still reject their
covered invalid inputs.

### F3 — P3: two coordination obligations have no explicit retained owner

The four-body comparison and unchanged Work references also expose two smaller
traceability gaps:

- Base AGENTS records explicit context routes with `--context-ref` together with
  affected paths. Candidate retains affected paths and overlap coordination, but
  not the explicit-route recording instruction. Keeping `context-map.json` concise
  is a different operation. Preserve this condition when an explicit route exists;
  this is not a request to invent routes or add a mandatory packet call.
- Base Work Skill explicitly releases ownership on handoff **or abandonment**.
  Candidate retains release in the handoff sequence, while abandonment is no
  longer named. Preserve release when active ownership is abandoned, including
  applicable worker cleanup before release.

These are lower-severity procedure omissions; no leaked claim or failed context
selection was reproduced in this cycle. They should be reconciled with the
acceptance requirement to map every prior obligation rather than silently counted
as removed duplication.

## Fresh independent executable evidence

Environment: macOS/Darwin arm64, Node.js **24.20.0** at
`/opt/homebrew/Cellar/node@24/24.20.0/bin/node`. Tests used disposable fixtures;
they did not launch model generations or alter the frozen comparison lab.

1. `node --test test/operating-contract.test.mjs test/continuity-fixture.test.mjs test/continuity-live-runner.test.mjs test/phase4-installation.test.mjs test/skill-policy.test.mjs`
   — exit **0**, **42/42 pass**, 0 failed/skipped/cancelled,
   **53,801.11975 ms** Node-reported duration.
2. `node --test test/context-enter.test.mjs test/context.test.mjs`
   — exit **0**, **31/31 pass**, 0 failed/skipped/cancelled,
   **53,187.474375 ms** Node-reported duration.

These are **73 fresh tests in two focused runs**, not another full verification.
After writing this QA artifact, `npm run verify:fast` also exited **0**: repository,
documentation-link and actual package-boundary checks passed (416 files, 893,838
packed bytes, 3,503,460 unpacked bytes), followed by **54/54** fast tests in
**1,100.946166 ms**. The fast group overlaps focused tests and is not added to the
73-test count or presented as full verification.
Coverage includes whole installed cold Builder/Verifier sources; managed drift
and untracked collision rejection; preserved project-owned instructions; native
bootstrap/import behavior; actual claim/product-test/finish and record-only commits;
46-case product oracle; stale/malformed behavior and protected-file changes;
wrong/dirty candidates; current policy/sponsorship; missing/unsafe authority;
same-Identity rejection; pending recovery; fixed protocol limits; wrong variant and
confounded runtime manifests; exclusive preparation; provider-event cancellation,
missing usage and uncertain cleanup using simulated providers.

Reviewed changed tests: they move paragraph-location checks to the required whole
contract and preserve underlying installation, ownership, identity and workflow
checks. Package count increases exactly one for ADR-0062; the size ceiling and
allowlist exclusions remain. The tests do not detect F1/F2/F3, which is why semantic
review overrides their passing status for overall acceptance.

## Independent frozen-lab inspection

Read-only inspection of the coordinator's existing private lab recomputed hashes
and compared the actual subjects. It never called preparation, provider
qualification, `runApprovedContinuity`, or a live subject function.

- Frozen protocol matches
  `sha256:5291b060d39a21618adbb48de9c31da489b306655fea693a96fcfb45adc3b5e8`.
- Recomputed instrument hash from tracked `bin`, `src`, `project-overlay`, `packs`,
  `package.json`, `package-lock.json` and `scripts` matches the frozen protocol at
  the tested candidate.
- Both runtime manifests match their frozen digests. There are **744 files** in
  each bundle; `assertInstructionOnlyRuntimes` finds exactly these four differences:
  `project-overlay/AGENTS.md`, `project-overlay/TEMPLE.md`,
  `project-overlay/.agents/skills/temple-work/SKILL.md`, and its
  `references/lean-execution.md`.
- Old instruction hashes were independently checked against `git show` at the
  base; current hashes against candidate files. No executable, dependency or
  policy-file difference exists between the two runtime manifests.
- `assertContinuityMatrix` accepts the frozen six subjects. Each has a distinct
  physical root, clean Git status, HEAD equal to its recorded baseline, the correct
  runtime read root and `TEMPLE_CLI_PATH`, and the same recorded product facts per
  condition. Installed four-body hashes match each subject's own distribution.
- Stable order is ordinary/previous/current; changed-spec order is
  current/previous/ordinary. Both Temple variants retain `arm=temple` for the shared
  request while `variant` selects the correct fixture/runtime/oracle baseline.
- `liveRequests` are identical between Temple variants after normalizing only the
  two expected assigned-directory `cwd` fields. The first QA assertion incorrectly
  compared those physical paths literally and failed; correcting that assertion
  produced a pass. No implementation or frozen data changed to obtain that pass.
- All four stored audit rows match the public summary's body bytes, serialized
  bytes, compact-navigation bytes, product facts and unknown provider Tokens.
- Current/previous stored qualification each says `thread-configured`, runtime
  controls passed and server exit confirmed without cleanup failure. Stored
  record-oracle controls each pass **46 cases**; observation qualification passes.
  These runtime/oracle results are **inspected reused evidence**, not new provider
  executions by QA.
- `consumed.json` and `result.json` are absent. No live result is claimed.

The read-only assertions ran via `node --input-type=module` with `fs.readFile`,
`files`/`digest` from `scripts/delivery-control-pair.mjs`, exported matrix/runtime
assertions, `git ls-files`, `git show`, `git rev-parse` and `git status`. They exited
**0** after the assigned-directory normalization described above. The lab is the
existing exclusive root ending `temple-continuity-live-ahuyEY`; private provider
configuration is intentionally not copied into this repository evidence.

## Reuse and interpretation boundaries

- Explicitly reuse [Developer verification](verification.md): exact candidate
  `173f43e1`, `npm run verify`, **767/767**, exit 0, Node 24.20.0,
  **183,915.620625 ms**. QA did not rerun or relabel this full suite.
- Preparation used standalone Node **24.19.0** at `f7587a0f22b5c182cb5e5d175253cae92ec60c97`.
  Fresh Git comparison to this QA candidate shows only `design.md` and
  `test/phase4-installation.test.mjs` changed; the recomputed instrument and runtime
  hashes independently support the documented reuse. This does not qualify a new
  instruction revision after the requested corrections.
- Independently counted four-body size: **27,200 → 15,408 UTF-8 bytes**, a
  **43.352941%** reduction. Stored changed-spec whole-source counts are
  **74,588 → 62,796 bytes**, with **1,400 product-fact bytes** in both variants.
  Serialization and body size are separate; actual source acquisition, provider
  Tokens, elapsed delivery and quality effects remain unobserved.
- One subject per treatment/condition, fixed order and uncontrolled cache limit
  future causal interpretation. The proposal names these limits, finite stops,
  zero retries/fallback/purchase/reset, and fresh approval of the exact digest.
  Historical experiments are not pooled or rescored. These are truthful current
  limitations, not additional acceptance defects.
- Role separation, named workflow/risk gates, exact ownership, whole-source rules,
  spec authority, UI/HA triggers, tracker boundaries, parallel/support eligibility,
  uncertain-write recovery, diagnostic reuse and bounded closeout otherwise retain
  their required owners. No new Position, automatic cache or production authority
  was found.

## Required next owner and stop

Return to the coordinator for same-scope Developer rework of F1/F2/F3. A corrected
instruction candidate needs fresh applicable verification, refreshed obligation
mapping and distinct Independent QA. Because its instruction bytes will change,
the current readiness digest and byte counts cannot qualify the corrected candidate;
produce a new unconsumed preparation and seek only its separately required future
execution authority.

QA stops here. No source, canonical JSON, lock, lifecycle, commit, push, merge,
Credits, reset or external write was performed by this runtime. This artifact is
the sole repository file authored by QA.
