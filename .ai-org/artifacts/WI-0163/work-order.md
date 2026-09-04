# WI-0163 Work Order

## Objective

Freeze a narrow `0.1.0-alpha.30` technical candidate that can be qualified next without confusing technical readiness with publication authority.

## Included

- Align current version-bearing source, package metadata, self-host installation metadata, tests, and human release documentation.
- Add an Alpha.30 candidate record with one supported product claim and explicit non-claims.
- Name one immutable technical candidate for WI-0164 exact-package qualification.
- Keep source-first GitHub distribution as the proposed first path and npm deferred.

## Excluded

- Repository visibility changes.
- Git tag or GitHub Release creation.
- npm publication or removal of `private: true`.
- Deployment, announcement, automatic model switching, or Provider execution.
- Claims of universal Token, cost, latency, or productivity improvement.
- Claims of completed enterprise, regulated, multi-company, or broad cross-platform qualification.

## Workflow

Standard workflow, sequential execution, and Independent QA against the exact technical candidate. UI delivery is not applicable because this Work Item changes release identity and documentation rather than a user interface.

## Stop condition

Stop after the version and claim boundary are internally consistent, the exact candidate passes Independent QA, and the Work Item closes. That closeout is not permission to publish.
