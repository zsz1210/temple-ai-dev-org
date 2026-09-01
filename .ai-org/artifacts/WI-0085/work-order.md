# Work Order — WI-0085

## Authorized outcome

Prepare Temple's repository for a narrowly labeled first public Alpha by correcting the Node.js support contract, constraining the distributable package, hardening hosted CI provenance, and adding the local OSS health files that can be completed without changing an external system.

## Confirmed direction

The repository owner accepted the recommended direction on 2026-09-01:

1. retain MIT for the first public Alpha and define triggers for reconsidering Apache-2.0;
2. use maintained Node.js LTS lines as the formal support promise rather than the newest Current release;
3. explicitly allowlist package contents and verify them automatically;
4. add contributor, governance, security, ownership, pull-request, and issue-intake boundaries;
5. preserve external publication and GitHub configuration as separate Human Principal gates.

## Delivery boundary

- Repository-local files and canonical WI-0085 evidence may change.
- Node.js 22 and 24 are the supported Alpha matrix; Node.js 26 is not promised before LTS qualification.
- Do not make the repository public, publish npm, create a tag or GitHub Release, change GitHub settings, or announce a release.
- Do not include user-owned Playwright output or local browser state.

## Delivery sequence

`Spec → Design → Build → Test → Eval → Independent QA → Release Gate`

Developer and Independent QA must remain distinct Agent Identities. Closeout means the local hardening candidate is ready for the remaining external gates; it does not mean Temple is public.
