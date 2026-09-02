# Wave 3 local multi-repository service evidence

- Work Item: `WI-0104`
- Result: Developer rehearsal passed; Independent QA pending
- Environment: one local Apple Silicon Mac, four disposable Git repositories, one isolated Colima profile
- Product, production, enterprise, savings, and release claims: not established

## Question

Can Temple coordinate a small, versioned service change across independent repositories without relying on conversation memory, while keeping the runtime optional and bounded?

This run tested a fictional commerce system. The coordinator, Catalog, Orders, and Notifications were separate Git repositories. Catalog owned availability, Orders owned checkout and the `OrderPlaced` event, and Notifications owned retained delivery state.

## Result

The bounded Developer run passed all six declared scenarios in 95.005 seconds:

| Scenario | Observed result |
|---|---|
| Catalog v1 baseline | Checkout `200`; one notification retained |
| Producer-first Catalog v2 | Orders rejected the unsupported contract with `409`; notification count stayed at one |
| Catalog rollback to v1 | Checkout recovered; notification count became two |
| Consumer-first Orders compatibility | Compatible Orders still accepted Catalog v1; count became three |
| Catalog v2 after consumer preparation | Checkout succeeded; count became four |
| Malformed event and recovery | Notifications rejected the malformed event with `422` without changing state, then accepted a valid event |

The cold child process reconstructed the aggregate from repository files and Git history. Both the baseline and final federation portfolios resolved all three participants as current. No participant lifecycle or external system was mutated by the portfolio build.

## Measured runtime

| Measurement | Value |
|---|---:|
| Preflight | 0.363 s |
| Base-image pull | 6.872 s |
| Four-repository fixture and native tests | 3.542 s |
| Initial Compose build and health | 6.922 s |
| Version switches, rebuilds, and scenarios | 65.776 s |
| Cold inspection | 0.568 s |
| Total retained run | 95.005 s |
| Peak measured host growth during the run | 304,959,488 bytes |
| Host bytes reclaimed after profile and cache deletion | 1,812,885,504 bytes |

The runtime was Colima 0.10.3 with Docker 29.7.2 and Docker Compose 5.5.0. It used the explicit `colima-temple-wave3` context, 2 CPUs, 2 GiB memory, a 10 GiB sparse data disk, no Kubernetes, an internal Compose network, no published host ports, read-only service roots, capability dropping, and bounded service resources.

The official Node 24 Alpine base resolved to `node@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf`. Its reported size was 58,947,744 bytes. The three final service images each reported approximately 58.95 MB and shared the base layers inside the disposable runtime.

## Repository and test evidence

The retained result records exact commits for all four repositories and both sides of each changing contract:

- Coordinator final: `f4f86d3c91bec492131e1ce6b943ecd7465589a8`
- Catalog v1: `f97d6507fcfb2fc206f3b54712b8155627dc1269`
- Catalog v2 and final: `97f82c97a38caf9a4d0bf03a00a9798738bea369`
- Orders v1-only: `d7759a9acc33feed28afccaf4d8a5e7b356af4e3`
- Orders compatible and final: `4a19005e48eea6bfa8fccfc7f4093b910aec4f49`
- Notifications final: `6af72278b4fd493965ffa77bbf015c96700f5869`

Each distinct service revision and the coordinator ran one native Node test before its first relevant build. All six native test invocations passed. All repositories were clean when cold inspection ran.

## Cleanup

Compose teardown removed the rehearsal containers, network, local service images, and fixture repositories. The outer cleanup then stopped and deleted only the `temple-wave3` profile and its container data. It also removed the one resolved 317 MiB Colima VM-image cache file downloaded for this run. No broad Docker prune was used, and Homebrew-installed CLI packages remain available.

The deleted profile and cache are recoverable by creating the profile and downloading the image again. They contained no user or production data.

## Failed preflight retained separately

The first invocation stopped after 2.032 milliseconds because the runner supplied a fractional millisecond value to Node's process timeout API. It performed no Docker command, image pull, repository creation, or container start. The result is retained as `local-microservice-attempt-1-preflight-failure.json`; the runner was corrected to use an integer timeout before the explicit second invocation.

This is tooling-development evidence, not a failed service scenario, and it is not omitted from the record.

## Evidence files

- `.ai-org/artifacts/WI-0104/local-microservice-observation.json` — SHA-256 `f0ffcfcd827052ae24ba41e4213843126b6f1100b7cd40f81174b27d8baacf66`
- `.ai-org/artifacts/WI-0104/runtime-cleanup-observation.json` — SHA-256 `5a9b333b7255b0851db2a489c38b71c34eed57122239de4ffb12e0e6bec1b9e8`
- `.ai-org/artifacts/WI-0104/local-microservice-attempt-1-preflight-failure.json` — SHA-256 `d8f52a4cd7c94d732c55fca9a58114bed4c5772bd58f319ac1318c97fa010b80`
- `scripts/validate-local-microservice-rehearsal.mjs` — SHA-256 `df4f6e9cf0f3ae817895a0d8eb4857153c08ab321146806aff4e4fb2bd75dbed`

## What this supports

This result supports only a single-human, single-machine, local four-repository rehearsal. It demonstrates repository-backed exact references, an explicit consumer-first rollout, a visible incompatible producer-first failure, rollback, event rejection and recovery, cold aggregate reconstruction, and bounded cleanup.

It does not show production networking, persistent databases, queues, load, authentication, encryption, fault tolerance, multi-machine Git conflict resolution, several human maintainers, hosted CI, cost savings, or Token savings. Model and Token fields are `not_applicable` because this was a deterministic no-generation validation.

Independent QA must still reproduce the exact Temple candidate and verify the retained observation before `WI-0104` can close.
