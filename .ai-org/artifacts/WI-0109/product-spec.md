# WI-0109 product specification

## User outcome

Before spending Tokens on another controlled comparison, a maintainer can run one local deterministic test suite that demonstrates how Temple will interpret representative Codex App Server events.

## Required scenarios

1. A completed turn with a shell-formatted display command and an allowed structured `sed` action succeeds and retains exact numeric Token fields.
2. A forbidden action, a mixed allowed/forbidden action list, or missing `commandActions` fails closed.
3. A model reroute fails closed.
4. Any runtime permission request fails closed with a bounded code.
5. A Provider `invalid_json_schema` terminal failure is distinguished from an ordinary incomplete terminal.
6. A completed turn without detailed usage fails closed.
7. Notifications for another turn are ignored.
8. Structured completion text is validated without accepting additional or missing fields.

## Acceptance

- Fixtures contain bounded synthetic protocol metadata only—no prompts, responses, reasoning, credentials, or personal data.
- Replay functions are pure and perform no process launch, network call, filesystem mutation, or model generation.
- The live Wave 5A runner imports the same policy and classification helpers exercised by replay tests.
- The exact installed `ItemStartedNotification` schema remains pinned by preflight.
- Focused tests, full repository verification, Doctor, and a second exact-revision Independent QA run pass.
- Completion does not authorize a further Luna run.
