# Product Direction — First public Alpha hardening

## User problem

A public Temple consumer should be able to tell which Node.js versions are supported, install only the files needed to run and understand Temple, report problems without exposing private project data, and see who owns release decisions. A maintainer should not be able to publish self-host evidence or depend on a movable CI Action reference by accident.

## Accepted product rules

1. “Latest” means the latest qualified LTS for the support promise, not the newest Current major.
2. Node.js 24 is primary and Node.js 22 is the compatibility floor for the first Alpha.
3. Node.js 26 may inform future compatibility but is not supported until it reaches LTS and passes the exact candidate.
4. The package uses an inclusion allowlist. Temple's own `.ai-org`, test evidence, examples, screenshots, and development scripts are not consumer runtime.
5. Public intake must tell contributors not to disclose credentials, prompts, telemetry, customer data, or real-project evidence.
6. GitHub permission, Temple Position, contribution, merge, and release authority remain separate.
7. MIT remains the first-Alpha license. Apache-2.0 is reconsidered only when its explicit patent terms solve an evidenced need.

## Acceptance boundary

WI-0085 may close when repository-local contracts, package checks, CI files, OSS health files, and exact-candidate verification agree. Repository visibility, vulnerability-reporting settings, branch protection, secret protection, a private conduct-reporting channel, release identity, tagging, public consumer testing, and publication remain visible follow-up gates.
