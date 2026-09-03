# WI-0136 representative harness readiness report

## Outcome

The production comparison orchestration completed end to end with a generation-free Provider double. The result covers both arms, all ten candidate stages, both three-way Build waves, both cold-integration stages, the blind evaluator, the analysis pipeline, repository cleanliness, the historical Provider event shapes that stopped v9 through v12, explicit outside-path rejection, the installed Provider sandbox schema, and effective Memory isolation. It used zero Operational Tokens and performed no model generation.

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
| Nested Code Mode cwd presentation replay | Pass |
| Explicit outside-path rejection | Pass |
| Installed Provider sandbox schema replay | Pass |
| Ambient personal-Memory path rejection | Pass |
| Effective Memory-isolation config handshake | Pass |
| Retry / fallback | 0 / 0 |
| Operational Tokens / model generation | 0 / none |

The readiness gate preserves canonical macOS path handling: `/tmp` may canonicalize to `/private/tmp`, while `os.tmpdir()` may use a separate per-user temporary root. It records that the installed `codex-cli 0.153.0-alpha.5` schema supports arm-scoped writable roots and a network-access toggle but does not expose newer restricted-read-root fields. V13 therefore disables Memory instruction injection at App Server startup, verifies the effective config through `config/read`, and still rejects every personal Memory path instead of claiming a stronger filesystem read boundary.

## Live boundary

Protocol v13 is frozen at `ffc48213ef3704418cb031a1fdf0621fb79763df259c9bc290d340224a4ec06c`. The final preflight passes fixture inspection, Provider contract matching, Temple lifecycle rehearsal, all seventeen readiness checks, command-event replay, explicit-path rejection, installed sandbox-schema replay, and effective Memory-isolation verification. Its only remaining blocker is a new exact human approval for this digest and resource envelope.

No previous approval applies to v13. No live candidate or evaluator turn has started under this protocol.
