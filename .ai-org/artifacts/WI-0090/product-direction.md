# WI-0090 Product Direction

## Release problem

Alpha.29 was previously qualified, but two later completed improvements changed the repository after that exact candidate: WI-0088 added a real-browser Management Console regression gate, and WI-0089 changed Codex task-title behavior. The earlier candidate evidence therefore remains historical rather than current release evidence.

## Intended outcome

Produce one new private Alpha.29 candidate whose documentation, package boundary, supported runtime matrix, browser coverage, hosted CI, and exact revision agree. The candidate should be technically ready for Human review without implying that the repository is already public or released.

## Acceptance meaning

- “Candidate passed” means the exact revision passed the named automated and independent checks.
- “Pushed” means private `origin/main` contains the recorded revision and its hosted CI result is visible.
- Neither statement means visibility, repository settings, an immutable tag, GitHub Release, announcement, or npm publication was authorized.

## Non-goals

- Adding another Alpha feature.
- Reopening the completed design of WI-0088 or WI-0089.
- Treating maintainer-run smoke as the independent new-user public-adoption gate.
- Satisfying moderation, repository protection, or public-release decisions through automation.
