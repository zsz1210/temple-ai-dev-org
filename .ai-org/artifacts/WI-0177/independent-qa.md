# Independent QA

Decision: PASS. Candidate `c8fc420da7ef570c80419bc8ff771fddb22f45dc`; base `7d68ff125ba6ae6651732e8393ab9ab7629ed349`.

Reviewer: Lulu / `agent-lulu`, separate internal runtime `/root/wi0177_instruction_qa`, prepared worker `worker-20260905072735-79a889e8`. Requested route: `gpt-5.6-terra`, `medium`, from the project usage policy. This records the requested configuration, not independently observed provider model attribution. Developer was Rikku / `agent-rikku`.

## Independently reproduced evidence

- Skill policy: 3/3 passed.
- Context and workflow: 37/37 passed in 27.248 seconds.
- Installed and overlay `temple-work` entrypoints are byte-identical.
- `git diff --check` passed; source paths stayed identical to the candidate despite later organizational evidence writes.
- Doctor: 37 pass, 0 warn, 0 fail.
- Reviewed the exact diff, approved work order, developer evidence, and evaluation. No actionable source/instruction finding. Effective-profile gates, required authority reads, bootstrap, distinct-identity QA, CLI-owned title, and local-only closeout remain intact.
- No comparison artifact is in the candidate source diff. The parent separately checked the other worktree's actual state and frozen digests; the reviewer did not access that worktree.

The parent-owned full 492/492 run is not counted as this reviewer's independent test execution. No end-to-end live project, paid comparison run, publication, or efficiency result was produced by this review.

## Initial synthetic reading probe — preserved verbatim

The reviewer received the Skill and seven raw hypothetical situations before opening the acceptance work order, diff, or expected scenario fixtures. This is a model-assisted instruction walkthrough, not an isolated execution benchmark or proof of every future invocation.

> A) WI-0201 Lean/test: preview routed context and verify the effective Lean workflow plus supplied test evidence/closeout; if authorized and requirements are satisfied, finish via `transition --to done` with `test_evidence` and `lean_closeout`—not Independent QA or release approval.
>
> B) WI-0202 Standard/test: preview context, inspect its effective workflow and evidence, then independently reproduce the exact candidate under a distinct QA Identity; test evidence alone does not finish it—record separate QA evidence and take only the allowed next edge.
>
> C) WI-0203 fresh session/digest but no bodies: treat digest as selection only, reread required authority/instruction bodies before any action; unchanged hashes cannot prove they were read.
>
> D) status-only WI-0204: use read-only status/context/evidence inspection and report it; make no lifecycle or tracker mutation.
>
> E) TEMPLE_BOOTSTRAP_REQUIRED: stop governed mutation, read every named source and run the required read-only checks; only then resume normal routing.
>
> F) explicitly authorized separate app task WI-0206: after the governed preparation/reservation path succeeds, register the stable task using exactly `WI-0206 · Correct parsing · Developer (Fixture Devon)`; do not reconstruct/rename the title.
>
> G) unchanged selected hashes but unreadable required authority: mutation is blocked; report the unavailable source rather than relying on digest/hash or bypassing the guard.

## Subsequent clarification and limits

The initial B and F descriptions compressed operations and did not establish their exact order. The parent requested a concrete sequence without supplying an expected answer. After inspecting the canonical workflow, the reviewer clarified B: the first Standard-at-Test lifecycle mutation is `transition --to eval` with `test_evidence`; evaluation precedes distinct-identity Independent QA and Release Gate. It clarified F as prepare reservation → create the explicitly requested app task → register its stable identity with the reserved worker. These later clarifications are not retroactive initial-probe passes.

The reviewer also described `parallel prepare` as returning a title. The actual CLI output inspected by the parent contains `worker`, `claim`, `resource_reservations`, and `instruction`, not `suggested_title`. The scenario supplied the title separately, as ordinary create/handoff/task output can. Preserve this imprecision as a walkthrough limitation; neither the Skill nor the CLI should be changed to match an invented output field.

The source review passes, while the probe demonstrates why a concise model answer is not sufficient evidence of exact operational adherence. A later controlled execution must check actual commands, gates, final quality, Tokens, and latency rather than scoring this prose as seven successful runs.
