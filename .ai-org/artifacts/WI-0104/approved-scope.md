# WI-0104 approved scope

## Outcome

Run one disposable, no-generation, four-repository commerce system locally and retain evidence that Temple can coordinate a small multi-repository contract rollout without relying on the stopped `WI-0067` model run.

## Repositories

- Coordinator: experiment protocol, scenario runner, exact repository references, and aggregate result.
- Catalog: authoritative availability response in v1 or v2 form.
- Orders: checkout state, v1-only then v1/v2-compatible consumer behavior, and `OrderPlaced` production.
- Notifications: idempotent `OrderPlaced` consumption and delivery state.

Each repository is created in a disposable experiment directory, initialized independently, and committed separately. The coordinator may observe exact revisions but cannot change another repository's lifecycle authority.

## Scenarios

1. v1 baseline succeeds end to end.
2. A producer-first switch to Catalog v2 fails visibly while Orders remains v1-only.
3. Rolling Catalog back to v1 restores checkout.
4. A consumer-first Orders change accepts v1 before Catalog switches.
5. Catalog v2 then succeeds through the compatible consumer.
6. Notifications rejects malformed input without state mutation and accepts a later valid event.
7. A fresh aggregate inspection recovers exact repository revisions and results from retained files.

## Runtime and resource boundary

The host currently has no container runtime and about 38 GiB free. Use a non-autostart Colima profile named `temple-wave3` with Docker runtime, no Kubernetes, at most 2 CPUs, 2 GiB memory, and a 10 GiB sparse disk ceiling. Install only the Homebrew `colima`, `docker`, and `docker-compose` packages needed by the approved local experiment. Record installed versions.

Use one small official Node Alpine base image, record its immutable digest, expose services only on loopback or the private Compose network, and set per-service memory/CPU limits. After evidence capture, stop and delete only the `temple-wave3` profile so its VM, images, containers, networks, and volumes do not become a permanent disk cost. Keep the CLI packages installed unless separately requested otherwise.

## Measurement

Retain setup, build, startup, scenario, verification, cleanup, and total wall time; host free space before and after; container image size; exact Git revisions; service health; scenario results; and cleanup state. Token and model fields are `not_applicable` because the experiment launches no model task.

## Safety and exclusions

- No company, personal, production, or secret data.
- No public ports, cloud resources, registry push, GitHub mutation, hosted CI, deployment, publication, or release.
- No Observer, Usage Collector, or Management Console requirement.
- No resume, retry, or reinterpretation of `WI-0067`.
- No savings, cost, enterprise-readiness, or production-readiness claim.

## Overlap resolution

`WI-0064`, `WI-0067`, and `WI-0086` retain their historical stopped or blocked state. `WI-0104` owns a new no-generation local fixture and its documentation only; it does not reuse their runtime state, raise their Token ceiling, or mutate their lifecycle records.

## Stop condition

Stop on the first runtime install/start failure, more than 5 GiB measured host disk growth, more than 10 minutes total runtime, any non-loopback host publication, an unclean participant repository, a scenario result that cannot be attributed, or cleanup failure. A stopped result remains evidence and is not retried automatically.
