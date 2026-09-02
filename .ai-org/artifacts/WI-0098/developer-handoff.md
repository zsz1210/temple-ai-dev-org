# WI-0098 Developer handoff

## Candidate

- Revision: `f9323f582ffde3188f1d7dd917dac91d9091262e`
- Branch: `codex/wi-0097-adaptive-onboarding`
- UI delivery mode: `not-applicable`

## Completed

- Added the project-owned `temple.repository-integration/v1` contract and runtime validation.
- Added confirmed, deferred, and exact unconfirmed states without treating the record as permission or as a replacement for project policy.
- Seeded the record during init and upgrade while preserving existing project-owned bytes.
- Exposed the state through Doctor and status.
- Updated installed Agent guidance to inspect existing policy and ask only about consequential gaps.
- Updated the English, Traditional Chinese, and Japanese entry points, the detailed usage and collaboration guides, the changelog, ADR index, and ADR-0042.
- Recorded Temple's own GitHub Flow separately from adopter workflow defaults.

## Verification

`npm run verify` completed successfully against the candidate revision on Node.js `v25.6.1` and npm `11.11.0`:

- repository checks passed for 100 overlay files and 10 Positions;
- documentation link checks passed;
- package boundary verified 312 files, 658,941 packed bytes, and 2,644,178 unpacked bytes;
- 281 tests passed with zero failures, skips, cancellations, or todos.

The focused scenarios include confirmed init, omitted-config unconfirmed init, inconsistent state rejection, normalized policy-reference uniqueness, re-init preservation, upgrade creation, upgrade byte preservation, schema ownership, Doctor warning/pass behavior, status attention, and bootstrap Skill parity.

Hosted Node.js 22 and 24 CI remains an integration requirement after the branch is pushed; no remote workflow, pull request, merge, release, or hosting-setting mutation was performed here.
