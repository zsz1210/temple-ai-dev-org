# WI-0239 — Independent QA

Reviewer: Lulu (`agent-lulu`), distinct from Developer Rikku (`agent-rikku`).
Date: 2026-09-07 UTC. Reviewed report candidate:
`312fc3cc0a53b8e4543b267d1068ce0922bff80f`.
Claim: `claim-20260907132014-0d223e01`; worker:
`worker-20260907132014-d4e58e3f`; sponsoring Principal: `human`.

## Judgment

**Independent QA PASS for the evidence report; experiment INCONCLUSIVE.**
No blocking numerical, provenance, missing-data or interpretation finding remains.
The bounded evidence may proceed to Release Gate for inconclusive closeout. This
does not mean the six-subject experiment passed or supply compact-Temple efficacy.

## Independent evidence checks

A fresh `node --input-type=module` assertion pass read the retained private lab
identified in [design.md](design.md), importing only the inert `digest` and `files`
helpers from `scripts/delivery-control-pair.mjs`. It exited 0 and independently
recomputed the protocol and run digests, matched the export seal, checked all six
planned rows against the frozen protocol and both attempted rows against run data,
and compared both 744-file runtime manifests. Exactly the four declared instruction
files differ; both runtime hashes match the protocol. No provider was started.

- Protocol: `sha256:dafc7fa80cdb274770c8bb339df2bb74a5067f615ce783c02856e80b5804cd27`.
- Run: `sha256:f989e35cd9e0f22c67623397434ebd5603a8a38493b076fd77b8ea2d4e216bd3`.
- Ordinary stable: accepted frozen 46-case oracle, 31,374 Operational Tokens,
  81,175 ms including setup and cleanup.
- Previous stable: 101,176 observed Operational Tokens, incomplete final usage,
  242,098 ms until stop/cleanup; no accepted completion or independent oracle.
- Four unattempted rows preserve null usage, including both compact-Temple rows.
  The aggregate 132,550 remains incomplete; both attempted processes have confirmed
  exit and empty background-terminal lists.

The pass also checked input minus cached input plus output, total input plus
output, reasoning-output inclusion, durations, complete/incomplete flags, command
category counts/bytes, nonzero completed-command exits, request-byte metadata and
repeated completed-command signatures. The 1,176 ceiling overshoot, 69,802 observed
Token difference, 64,742 uncached-input difference and 14 classified reading/context/
administration items totaling 57,709 bytes reconcile. Rounded percentages in the
report agree with these inputs. Started and completed events must not both count
as completed-command repeats; an initial QA assertion used both and was corrected
to select `item/completed`, without changing retained evidence or report data.

Read-only Git and JSON inspection of the previous fixture confirmed Lean Test,
released claim and Developer-to-Evaluator handoff at
`48dd95b4245c7feaf1c36370b51c8ead9ac6ff7c`, two candidate-matched normalized
Git/test registrations and uncommitted bookkeeping. Its passing test observation
is actor-authored, not an independent oracle. `currentEvidencePaths` in
`src/lean-delivery.mjs` accepts a safe local evidence path; the previous fixture's
Lean execution reference also permits `--evidence <repository-ref>`. Those two
separate registrations are not mandatory for that eligible local-artifact path.
Their presence does not prove their causal contribution to the Token stop.

The runner checks unknown final usage before oracle evaluation and continuation,
preserving the first `token-limit` reason. A terminal event does not supply a
missing completion object. Fixed order, one sample per cell, uncontrolled cache,
partially unknown command classification and absent compact/changed observations
prevent efficacy or causal conclusions. The report preserves these limits.

## Scope, provenance and reproducibility

`git diff --name-only af5a984aee6706ab308c693d95e138134162d5d6 HEAD` showed only
evidence and organization records, with no source, instruction, dependency, test
or lock changes. The accepted source's 767/767 verification is recorded in
[WI-0238 verification-r1](../WI-0238/verification-r1.md); it is reused exact-source
evidence, not a fresh full-suite run here. No live subject, retry, repair,
retrospective product test, re-scoring, reset or purchase was performed by QA.

The public export contains numeric metadata and hashes, with no raw provider
events, command bodies, prompts or host coordinates. The protocol/run seal binds
those JSON records, not a separately recomputed whole-lab artifact seal. Current
bundle hashes were independently checked; post-stop fixture observations remain
read-only observations, not upgrades to the frozen experiment. Reproducing the
private checks requires access to the retained lab; the public export alone cannot
independently establish its raw observations. Initial metadata probes encountered
an absent optional `manifest.json` and a numeric command-count field; subsequent
checks used the actual protocol/run structure and emitted no raw event bodies.

## Repository verification

- `npm run verify:fast`: exit 0, **54/54 pass**, zero failures/skips/cancellations,
  Node-reported test duration **1,141.253334 ms**, Node.js **24.20.0**. Repository,
  documentation-link and actual package-boundary checks passed (416 files,
  893,980 bytes packed, 3,503,986 bytes unpacked).
- `node ./templew.mjs doctor . --json`: initially exit 0, healthy, 36 pass / one
  stale-plan warning / zero failures. After the integration owner refreshed that
  generated plan, `node ./templew.mjs doctor . --compact --json` performed full
  validation and exited 0: **37 pass / 0 warnings / 0 failures**.
- After finalizing this record, `git diff --check` and the documentation-link
  checker passed. The final Doctor result above supersedes the earlier warning.

Only this QA artifact is owned and edited by this reviewer. The integration owner
retains canonical state, lifecycle and PR responsibility. No commit or lifecycle
transition is performed by QA.
