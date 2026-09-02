# Wave 2 coordination evidence

- Status: **passed for bounded single-human coordination, with retained collaborative limits**
- Date: 2026-09-02
- Work Item: `WI-0103`
- New runtime experiment: not run because the retained evidence already covers the bounded local behaviors
- External write, model-backed validation wave, Docker run, deployment, or release: not performed

## What this wave answers

Temple's coordination evidence was spread across a real greenfield pilot, implementation tests, a clean-source recovery exercise, a disposable two-clone simulation, and the framework's own Work Item history. This record puts those results on one evidence scale.

The result supports a bounded claim: one person on one machine can use repository-backed roles, isolated workers, deterministic planning, exact candidate revisions, integration joins, resource-aware fallback, and cold recovery. It does not support a claim that Temple already coordinates a real company team across machines.

## Evidence vocabulary

- **Demonstrated** means the behavior occurred in a retained live Agent or project run.
- **Verified implementation** means deterministic automated tests exercised the behavior.
- **Simulated** means controlled fixtures or disposable clones reproduced the condition, but not the named real environment.
- **Not run** means qualifying evidence for the named claim does not exist yet.

## Coverage matrix

| Coordination behavior | Evidence class | Strongest retained source | Supported conclusion | Retained boundary |
| --- | --- | --- | --- | --- |
| Position-to-Position handoff survives conversation boundaries | Demonstrated | [Temple self-host dogfood](alpha-23-temple-self-host-dogfood.md) and canonical Work Item handoffs | Scope, evidence, revision, and next responsibility can live in the repository instead of a chat title | One maintainer and one machine; a handoff record does not prove another person understood it |
| Fresh task recovers the next work without the originating chat | Demonstrated | [IdeaDock cold-task recovery](greenfield-cold-task-recovery-result.md) | A new task reconstructed the product, five Agents, Work Items, wave order, and stop boundary from repository state | One person and one prepared host |
| Three disjoint implementation workers produce isolated candidates | Demonstrated | [IdeaDock runtime execution and join](greenfield-cold-task-recovery-result.md#runtime-execution-and-join) | Three live workers used separate worktrees from one base and returned exact candidate revisions | Internal subagents were not separate user-owned Codex tasks |
| Integration Owner joins candidates before dependent work | Demonstrated | [IdeaDock runtime execution and join](greenfield-cold-task-recovery-result.md#runtime-execution-and-join) | The join mapped three candidate revisions to one integrated revision and verification result before the dependent wave | One repository, one Integration Owner, no hosted pull requests |
| Affected-path overlap, dependencies, capacity, and worker limits produce deterministic waves | Verified implementation | [Alpha.16 orchestration validation](alpha-16-safe-group-parallel-orchestration.md) | The planner separates unsafe work, bounds waves, rejects tampering, and reports explicit blocked or sequential reasons | Path declarations do not prove semantic merge safety |
| Claim, resource, and worker state exist before runtime attachment | Verified implementation | [Alpha.17 runtime coordination](alpha-17-recoverable-runtime-coordination.md) | `parallel prepare` atomically records ownership and capacity, and distinguishes internal workers from user-owned tasks | Runtime IDs were controlled fixtures; Temple does not create runtimes |
| Failed preparation rolls canonical state back | Verified implementation | [Alpha.17 runtime coordination](alpha-17-recoverable-runtime-coordination.md) | Injected persistence failure restored Work Item, event, resource, and worker records byte-for-byte | One filesystem and a local mutation lock |
| Stale or edited plans cannot authorize later work | Verified implementation and demonstrated | [Alpha.16](alpha-16-safe-group-parallel-orchestration.md) plus [IdeaDock](greenfield-cold-task-recovery-result.md) | Tests reject stale or edited plans; the live pilot rebuilt its plan after lifecycle changes | No distributed clock or cross-machine lock |
| Scarce verification capacity degrades safely to serialization | Verified implementation and demonstrated | [Alpha.17](alpha-17-recoverable-runtime-coordination.md) plus [IdeaDock limits](greenfield-cold-task-recovery-result.md#limits-and-observed-friction) | Capacity-one resources split waves; real Simulator contention caused verification to serialize while source work stayed parallel | Temple records declared capacity but does not lock the real Simulator |
| Competing canonical Git writes remain visible and recoverable | Simulated | [Alpha.28 two-clone drill](alpha-28-multi-human-governance.md) and its [retained report](../../.ai-org/artifacts/WI-0076/simulated-collaboration-report.md) | A non-fast-forward push and merge conflict exposed competing writes; both commits remained recoverable | Two disposable clones on one host, not two people or machines |
| Several humans and machines use protected PRs, CI, reviews, and conflict recovery | Not run | [Collaborative real-environment test plan](collaborative-large-scale-test-plan.md) | No enterprise-readiness conclusion is permitted yet | Requires at least two real people and independently administered environments |

## Why no additional local exercise was added

A new local fixture would repeat an existing evidence class:

- Alpha.16 already tests path conflict, dependency ordering, worker limits, freshness, and plan tampering.
- Alpha.17 already tests atomic preparation, resource capacity, injected rollback, runtime correlation, release, and clean-source recovery.
- Alpha.28 already creates competing Git commits in two disposable clones.
- IdeaDock is stronger than another fixture for live workers, an exact-revision join, stale-plan handling, and actual Simulator contention.

Repeating those behaviors would increase the number of runs without reducing the main uncertainty. The missing evidence requires independent people, environments, hosting controls, and human reconciliation. It cannot be manufactured by adding more local automation.

## Friction that became design input

The IdeaDock run did not pass without learning:

1. workers initially began before claims were recorded;
2. internal subagents were not distinguishable from user-owned tasks;
3. one Work Item-wide Discipline did not fit every lifecycle stage;
4. parallel Simulator verification contended for one scarce resource; and
5. lifecycle mutations made an old plan stale.

[ADR-0022](../adr/0022-recoverable-runtime-dispatch.md) and Alpha.17 converted those observations into a claim-before-runtime boundary, explicit worker kinds, stage-specific requirements, shared-resource capacity, and recoverable preparation. This is evidence of a learning loop, not evidence that every future project will behave the same way.

## What this proves

- Repository state can carry bounded work, responsibility, exact revisions, handoffs, and joins across Agent tasks.
- Disjoint source work can execute concurrently while a scarce verification resource remains serialized.
- Local planning and preparation failures are observable and recoverable without silently advancing the lifecycle.
- A simulated competing Git write remains visible instead of silently overwriting accepted state.
- Existing evidence is sufficient to stop repeating single-host coordination fixtures solely to increase a count.

## What remains unknown

- Whether two or more real developers can adopt the conventions without maintainer coaching.
- Whether separate machines and hosted Git latency expose new claim, synchronization, or recovery failures.
- Whether protected pull requests, required CI, reviews, and an Integration Owner remain usable under real contention.
- How much coordination time, rework, or Token use Temple saves compared with a matched minimal process.
- Whether the same operating model scales across a multi-repository service change.

## Next evidence boundary

Wave 3 should test a small multi-repository service change locally before any GitHub or production action. The previously stopped model-backed four-repository run is not resumed by this result. A replacement protocol must keep the revised Token ceiling and telemetry-path checks, while Docker installation and any new model-backed task wave require their own explicit resource approval.

Real multi-human, multi-machine qualification remains a later Wave 4 activity. The [retained collaborative test](collaborative-large-scale-test-plan.md) must stay `not_run` until different people use independently administered environments and preserve hosted PR, CI, review, conflict, and recovery evidence.

## Stop condition

Wave 2 stops at evidence reconciliation. It creates no external task, runtime worker, Docker service, publication, deployment, or release, and it does not alter the `real_collaborative` validation state.
