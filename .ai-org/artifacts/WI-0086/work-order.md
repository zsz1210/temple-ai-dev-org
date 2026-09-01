# WI-0086 Work Order

- Position: Engineering Manager
- Agent Identity: Mog (`agent-mog`)
- Base revision: `d59ac2a9f0a56c41a7731fe8572c74be63a2e338`
- Delivery mode: sequential
- Interface impact: not applicable

## Outcome

Prepare one exact, versioned candidate for Temple's first public Alpha. GitHub Release is the proposed first distribution channel; npm remains deferred.

## Included work

- Reconcile the successful hosted Node.js 22 and 24 run with the release-readiness record.
- Select `0.1.0-alpha.29` as the next candidate identity and align package metadata, changelog, and validation documentation.
- Repeat the repository, package, clean-consumer, runtime, dependency, provenance, privacy, and rollback checks at the exact candidate.
- Preserve the Human approval boundary for GitHub settings, repository visibility, tag creation, Release creation, announcement, and npm publication.

## Gates that cannot be self-certified

- The Human Principal must approve a private conduct-reporting route before an enforceable Code of Conduct is published.
- A genuinely independent new user must follow only the public instructions. A maintainer-run disposable-directory smoke test is useful but cannot satisfy this gate.
- Every external GitHub mutation and the final public release action requires separate explicit approval.

## Stop condition

Stop with a reproducible local release candidate and an explicit list of unsatisfied public gates. Do not change repository visibility, GitHub settings, create or push a tag, create a GitHub Release, announce publicly, or publish npm under this work order.
