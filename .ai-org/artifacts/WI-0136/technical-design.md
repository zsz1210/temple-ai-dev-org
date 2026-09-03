# WI-0136 technical design

## Architecture

Use one versioned fixture bundle and one command-oriented runner. The runner supports `setup`, `preflight`, `run`, `evaluate`, and `report`; only `run` and `evaluate` may contact a model for generation. `setup`, `preflight`, and tests remain deterministic and generation-free.

The lab contains two isolated arm directories. Each arm contains independent Gateway, Catalog, Orders, Notifications, and Coordinator Git repositories cloned from the same product-source commits. The Temple arm then receives its organizational overlay in separate commits, so product-source digests remain comparable even though the declared intervention changes repository metadata.

## Fixture contract

Versioned source files live under `.ai-org/artifacts/WI-0136/fixture/`:

- `task.md` — shared product outcome and compatibility requirement;
- `tool-policy.json` — exact command prefixes and write boundaries;
- `gateway/`, `catalog/`, `orders/`, and `notifications/` — starting source and public tests;
- `coordinator/public-integration.test.mjs` — visible end-to-end acceptance;
- `coordinator/held-out-integration.test.mjs` — evaluator-only compatibility evidence;
- `rubric.json` — arm-neutral quality and recovery scoring contract.

Fixture Git commits use fixed author/committer identity and timestamps. Setup records every base revision, file-bundle digest, public-test digest, held-out-test digest, and policy digest. The seeded contract suite must fail before candidate work for the expected reason.

## Organizational intervention

The minimal-responsible coordinator stores a bounded work brief, responsibility map, design record, per-slice handoffs, and integration checklist. These are ordinary competent engineering controls.

The Temple coordinator and participant repositories use the repository-pinned CLI and current project overlay. Each model-owned slice receives a Work Item with affected paths, an eligible Agent Identity and Position, exact base revision, claim, routed context, and evidence-bearing handoff. The integration turn starts fresh and must recover only from repository state.

No prompt may describe one arm as expected to win. Product requirements, acceptance wording, output schema, tool access, and model route remain matched. Arm-specific instructions describe only the mechanism needed to find equivalent state.

## Execution graph

For each arm:

1. Run one Sol xhigh design turn and validate its structured design record.
2. Freeze the shared contract decision.
3. Start three Terra medium build turns as one bounded wave: Orders plus Catalog, Notifications, and Gateway. Their writable repositories do not overlap.
4. Record exact revisions and handoffs.
5. Start one fresh Terra medium integration turn. It must recover the current state, run public integration, inspect declared handoffs, and return a structured recovery record before any integration-owned correction.
6. Run public and held-out tests from the coordinator and seal the candidate.

After both arms are sealed, start one fresh Sol xhigh evaluator with no tools. It receives only arm-neutral packages and the frozen rubric. Scores are written exclusively before the arm mapping is unsealed.

The arms run in a pre-registered order and the three slice turns run concurrently within each arm. Candidate and evaluator attempts remain exactly one each; a stopped turn stops the entire program.

## Provider and safety boundary

Reuse the tested Codex App Server JSON-RPC boundary and the repository's structured replay helpers. Preflight verifies the installed CLI version, exact generated schema digests, required model/effort availability, clean repositories, fixture digests, expected seeded failure, command-policy replay, absence of prior run artifacts, and exact approval record.

Model turns use `approvalPolicy: never`, workspace-write or read-only sandbox as appropriate, network disabled, ephemeral threads, no Provider fallback, and a structured completion schema. Any approval request, disallowed command, out-of-scope file change, model reroute, missing usage update, malformed completion, dirty candidate, Token boundary, or wall-clock boundary stops once and is retained.

Raw prompts, raw responses, and hidden reasoning are not retained. The protocol retains hashes, normalized completion fields, exact revisions, test outcomes, usage counters, timing, and bounded error summaries.

## Measurement

- Operational Tokens are `input - cached_input + output`; gross Tokens remain the Provider total.
- Recovery is scored from an exact-revision/state checklist plus time and operational Tokens for the integration turn.
- Boundary events come from Git changes and Temple preparation/claim results, not model self-report alone.
- Rework counts failed integration attempts, corrective commits, reverted commits, repeated slice attempts, and non-retained changed lines.
- Human intervention is reason-coded. The pre-generation account approval is reported separately.
- Footprint compares product bytes, organizational bytes, telemetry/result bytes, and retained artifact bytes.
- Correctness gates every efficiency interpretation.

## Initial resource envelope method

The final numeric envelope is generated only after fixture context sizes and a fresh Provider handshake are known. Its priors are the retained matched runs: WI-0132 observed up to 78,497 operational Tokens for Sol xhigh candidates and WI-0135 used a 69,000 per-candidate Terra ceiling. Limits are rounded upward from those observations and constrained by a separately frozen aggregate ceiling; they are safety stops, not forecasts or prices.

## Rollback and stop

Before live generation, rollback is deletion of the disposable lab and reversal of this branch. After generation, raw stopped or completed observations are immutable; harness correction requires a new protocol revision and Work Item. The final experiment ends at its report and cannot authorize deployment, publication, release, or routing-policy changes.
