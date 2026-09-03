# WI-0136 representative harness readiness report

## Outcome

The production comparison orchestration completed end to end with a generation-free Provider double. The result covers both arms, all ten candidate stages, both three-way Build waves, both cold-integration stages, the blind evaluator, the analysis pipeline, repository cleanliness, the shell-wrapped Provider command-event shape that stopped v9, and the equivalent `/tmp` versus `/private/tmp` cwd shape that stopped v10. It used zero Operational Tokens and performed no model generation.

This is harness evidence, not a Temple-versus-baseline result. It proves that the runner can carry valid stage outputs through its real lifecycle and evidence paths before account capacity is exposed to another live attempt.

## Why this gate was added

Earlier attempts repeatedly discovered runner, Provider-event, path-normalization, structured-output, and stop-record defects only after a model turn had started. Local unit checks were too narrow: they did not prove that the same production orchestrator could complete the entire experiment.

The readiness command now clones the frozen source lab, injects a deterministic local Provider double at the same turn boundary used by live generation, applies evaluator-only golden source files, and exercises the production runner without calling Codex generation. A successful record is required by live preflight.

## Results

| Check | Result |
|---|---|
| Frozen source-lab inspection | Pass |
| Two comparison arms | Pass |
| Ten candidate stages | Pass |
| Three concurrent Build slices per arm | Pass |
| Public and held-out objective tests | Pass in both arms |
| Exact four-repository cold recovery | Pass in both arms |
| Arm-neutral evaluator and score freeze | Pass |
| Analysis generation | Pass |
| Ten generated repositories clean | Pass |
| Shell-wrapped `unknown` Context Capsule command event | Pass |
| Canonical Provider cwd alias replay | Pass |
| Retry / fallback | 0 / 0 |
| Operational Tokens / model generation | 0 / none |

The readiness gate itself also exposed a macOS path-boundary assumption before the successful rehearsal: `/tmp` may canonicalize to `/private/tmp`, while `os.tmpdir()` may use a separate per-user temporary root. The final guard validates canonical paths against both legitimate temporary roots and still rejects non-temporary labs. These stopped setup checks occurred before candidate execution and used no model generation.

## Live boundary

Protocol v11 is frozen at `d729c503d8e8a9d35e0eb6367fda51fa76dbf34e7db45a5ef0a0408166283040`. The final preflight passes fixture inspection, Provider contract matching, Temple lifecycle rehearsal, full orchestration readiness, Provider command-event replay, and canonical cwd-alias replay. Its only remaining blocker is a new exact human approval for this digest and resource envelope.

No previous approval applies to v11. No live candidate or evaluator turn has started under this protocol.
