# WI-0240 local closeout

Accepted implementation: `2d4c018cacde20072c2deba738117da689ad9ce3`, on `codex/continuity-batched-git`, based on `860344965b36a95714fd0087f2148b8f2b23d1dd`.

The original 33 continuity results remain and pass. Three added controls pass. Exact-candidate `npm run verify` exited 0 with 1245/1245 tests passing, no failures/skips/cancellations/todos, 739137.255583 ms. Independent reviewer Lulu, distinct from Developer Rikku, accepted the exact candidate after source review and three actual failure injections plus a restored positive control. See `verification.md` and `independent-review.md`; no acceptance is inferred from a handoff alone.

The completed worker was joined with the exact revision and independent evidence. Standard Test, Eval, Independent QA and Release Gate were recorded using the pinned CLI. The Work Item is done, lifecycle outcome accepted, unresolved count zero, active claim null and active workers empty. The release decision is local go; no external release occurred.

Fresh Status and parallel plan confirm the terminal state. Doctor: 37 passes, 1 existing warning, 0 failures. The warning is the repository's absent actor policy, which preserves legacy verification requirements until an explicit policy transition; it is not introduced or changed by this task. Evidence-only `npm run verify:fast` passed 53/53 after canonical closeout. Final logs and diagnostic snapshots are retained in `closeout-evidence.tar.gz`.

Performance evidence is scoped: 2403 binary per-file reads became 180 batches; all direct synchronous subprocesses fell from 3469 to 1246. Other command counts, phase calls and outcome distributions match. Focused time fell from 182.534 to 81.936 seconds in this observed pair, but unchanged phases also became faster, so no guaranteed causal percentage or full-suite speedup is claimed. No AI token/cost measurement was made.

The final evidence commit changes only canonical state, generated observations and this task's artifacts; the tested implementation stays byte-identical. No merge, publication, downstream installation, initialization cache or live model experiment is included. Recommended next decision: integrate this accepted bounded change first; then separately assess initialization reuse against state-isolation requirements.
