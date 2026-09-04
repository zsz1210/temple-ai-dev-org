# WI-0158 Work Order

## Outcome

Establish whether the exact post-WI-0157 Temple candidate can guide a new Agent through one bounded product delivery and a separate repository-only recovery without maintainer coaching, then reconcile Alpha readiness using only the observed evidence.

## Approved scope

- Freeze the exact local package built from revision `54d14f4e94a930719ca7674ebf1ad74be89de7ac`.
- Reuse the bounded QueueKeep product request from WI-0155 and WI-0156.
- Run one fresh Terra Medium delivery task, followed by one separate Terra Medium cold-recovery task.
- Record lifecycle outcome, identity separation, tests, Doctor and Status results, elapsed time, errors, retries, rework, Human interventions, and reliable or unknown Token telemetry.
- Compare the observation with WI-0155 and WI-0156 without treating three runs as statistical proof.
- Reconcile the validation index and release-readiness document.

## Acceptance criteria

1. The source revision, package identity, archive digest, size, and inventory are frozen before Provider execution.
2. The delivery task receives no prior Temple conversation and either closes one bounded Work Item or preserves its exact stop condition.
3. Developer and Independent QA are different Agent Identities in the disposable project.
4. The recovery task receives no delivery conversation or coordinator Work Item identifier and makes no project mutation.
5. The report preserves unavailable Token telemetry as `unknown` and separates observations from claims.
6. The exact candidate passes repository verification, distinct Independent QA, and hosted CI before integration.

## Risk and rollback

The product target is disposable, local, and has no remote. Provider use is bounded by an exact two-task protocol and separate approval. No retry, fallback, reset, credit purchase, publication, deployment, tag, release, or package publication is allowed. Rollback is deletion of the disposable project plus reversal of this Work Item's documentation-only changes.

## Exclusions

- No public Alpha release or version decision.
- No repository visibility change, tag, GitHub Release, npm publication, deployment, or announcement.
- No new QueueKeep features after the bounded Work Item is accepted.
- No broad speed, quality, Token, or cost claim from this rehearsal.
