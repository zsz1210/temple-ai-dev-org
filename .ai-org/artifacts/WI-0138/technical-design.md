# WI-0138 technical design

## Architecture

Implement a dedicated experiment harness in `scripts/run-context-capsule-ablation.mjs`. It reuses Temple's production Context resolver and installed Codex App Server adapter, but owns its own fixture, protocol, approval, observation, and analysis schemas. It does not modify or reinterpret the frozen WI-0135 or WI-0136 records.

The harness supports four explicit operations:

```text
prepare   -> create clean matched fixtures and generation-disabled protocol
rehearse  -> exercise production validation paths with injected deterministic completions
preflight -> validate Provider wire compatibility and exact approval without generation
run       -> execute four fresh candidate turns only when exact approval is valid
analyze   -> reproduce the descriptive report from protocol plus normalized observation
```

`prepare`, `rehearse`, and an unapproved `preflight` perform zero model generation. `run` fails closed unless every readiness check and the exact approval pass.

## Fixture model

The lab root is temporary and outside the repository. Fixture definitions live as short deterministic builders in the script; raw fixture copies are never committed.

### Single repository

Create one initialized Temple repository named `coordinator` with:

- a current product requirement;
- an accepted architecture decision;
- a Developer handoff and exact candidate revision;
- a public test record and one unresolved risk;
- unrelated discovery, deployment, UI, security, and historical sources;
- Context Map routes whose stage and purpose constraints make relevance objectively known.

The frozen recovery stage is `test` with purpose `primary`.

### Coordinator-led multi-repository

Create one initialized Temple coordinator and four small Git component repositories: `gateway`, `catalog`, `orders`, and `notifications`. The coordinator contains the governing contract, portfolio revisions, completed slice handoffs, unresolved integration risk, and safe next action. It also contains unrelated discovery, release, incident, and historical sources.

The frozen recovery stage is `build` with purpose `integration`. Component repositories remain read-only implementation sources; the coordinator owns lifecycle truth.

## Treatment generation

Both condition packages are generated from the same source repository before candidate execution.

1. Resolve the actual v2 Context Capsule for the frozen stage and purpose.
2. Temporarily normalize the same route corpus as a v1 unscoped Context Map and resolve it through the same production resolver.
3. Add the full `TEMPLE.md` source to the legacy-expanded package, matching the pre-WI-0137 operating pattern.
4. Restore the committed v2 map and verify the source repository is clean.
5. Store both body-free treatment packages outside the source repository.

The treatment packages contain selected paths, categories, byte sizes, content digests, selection digest, route metadata, and warnings. They contain no source bodies. The fixture truth, Git revisions, task contract, and expected output remain identical between conditions.

The live prompt tells each candidate to begin with its assigned treatment package and then open only the selected canonical source bodies needed for the frozen output. It does not embed those bodies in the prompt.

## Candidate execution

Each candidate starts in a fresh ephemeral Codex thread with memory generation disabled, read-only sandboxing, no network access, `approvalPolicy: never`, no subagents, and no fallback. The App Server event stream is checked while the turn runs.

Allowed actions are bounded repository reads using the already tested representative command policy. File changes, external tools, network activity, unsupported App Server requests, model rerouting, invalid paths, unrecognized event types, schema failure, missing detailed usage, or dirty repositories stop the condition or whole run according to the frozen protocol.

Candidate order is fixed and interleaved across shapes so both context treatments appear early and late:

1. `single-stage-aware`
2. `multi-legacy-expanded`
3. `single-legacy-expanded`
4. `multi-stage-aware`

The runner executes sequentially. This avoids concurrent resource contention becoming a context-treatment confound.

## Output and objective evaluation

Use separate strict JSON Schemas for the single- and multi-repository outputs. The expected values live only in the coordinator process and are not included in candidate-visible files.

The runner compares every returned field exactly, including revision lengths and set membership. Correctness evaluation is deterministic, so this experiment does not spend Tokens on a model evaluator. Independent QA later reproduces the same checks from retained normalized evidence.

## Protocol and approval

The protocol binds:

- source revision and relevant source digests;
- fixture and treatment digests;
- condition order and exact prompt-component digests;
- model and requested effort;
- output-schema digests;
- command policy and App Server schema digests;
- per-condition, aggregate, and wall-clock limits;
- zero retry, fallback, reset, purchase, refill, network, and external-write policy;
- privacy and retention policy;
- predecessor evidence from WI-0135, WI-0136, and WI-0137.

Compute `protocol_sha256` over stable JSON with that field set to `null`. Approval must match the digest, all condition identities, model, effort, limits, and safety declarations exactly. A changed protocol consumes no old approval and requires a new one.

## Retained records

Commit only:

- generation-disabled protocol;
- approval template and, after explicit approval, the exact approval record;
- readiness report;
- normalized live or stopped observation;
- deterministic analysis and human report;
- test and QA evidence.

Do not commit raw prompts, raw responses, hidden reasoning, temporary repositories, App Server logs, credentials, or absolute user paths.

## Failure semantics

- A candidate reaching its independent Token ceiling is retained as censored; unused independent conditions may continue.
- Aggregate Token, wall-clock, policy, Provider, path, revision, cleanup, or protocol drift stops the whole run.
- A stopped or malformed condition is never retried automatically.
- Missing usage remains `null`, not `0`.
- Percent deltas are omitted when a matched comparison is incomplete or has an invalid denominator.

## Verification plan

- protocol and exact-approval rejection tests;
- v1-expanded versus v2-stage/purpose treatment-difference tests;
- fixture parity and clean-tree tests for both shapes;
- deterministic source-manifest and protocol digest tests;
- strict output-schema and objective-check tests;
- stopped/censored observation and unknown-telemetry tests;
- analyzer classification and arithmetic tests;
- injected production-path rehearsal with zero Provider generation;
- full `npm run verify` at the exact candidate revision;
- detached-worktree Independent QA reproduction.

## Risk review

| Risk | Control |
|---|---|
| Context condition also changes task truth | Generate both packages from one restored, clean source fixture and compare frozen truth digests |
| Legacy condition is a straw man | Reproduce the previously observed unscoped-plus-operating-contract loading pattern; label it legacy-expanded, not normal development |
| App Server drift causes repeated live failures | Validate installed wire schemas and inject a complete production-path rehearsal before approval |
| Strict policy rejects a harmless read | Prescribe tested read-only commands and validate the exact event shape generation-free; any later repair creates a new protocol |
| Context bytes are presented as Tokens | Keep repository bytes, explicit prompt bytes, Provider Tokens, tool bytes, and price as separate fields |
| One shape hides another | Report single and multi results separately before any diagnostic aggregate |
| A single run becomes a marketing claim | Outcome labels remain diagnostic and cannot authorize routing or public savings claims |

The entire preparation is reversible by deleting the temporary lab and the WI-0138-only harness and artifacts. No release, publication, deployment, Provider generation, or external write is part of Design.
