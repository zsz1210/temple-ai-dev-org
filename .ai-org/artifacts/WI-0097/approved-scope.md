# WI-0097 approved scope

## User outcome

First-time Temple users should not need to understand Temple's internal vocabulary or choose a vendor-specific Git workflow before they can begin. During AI-assisted initialization, the Agent inspects existing repository policy first, summarizes what it found, and asks only for consequential information that remains missing.

## Confirmed decisions

- Temple's own repository uses GitHub Flow as its maintainer workflow.
- Temple adopters keep their existing repository, review, integration, and release workflow.
- Temple records a small project-owned integration contract for routing and observability; it does not copy or replace the authoritative company policy.
- A detected policy is included in the same confirmation boundary as Agent names and Position mappings.
- When no policy is confirmed, Temple records `unconfirmed` instead of guessing GitHub Flow, direct-to-main, or another workflow.
- Later Agents ask only when the missing integration decision affects the requested work. Routine work inside a confirmed policy does not trigger repeated questions.

## Acceptance boundary

- New AI-assisted initialization can produce a confirmed project-owned integration record.
- Older or manual init configs remain accepted and receive an explicit unconfirmed record.
- Upgrade creates a missing record without overwriting an existing project-owned record.
- Doctor and status expose confirmed, deferred, or unconfirmed state without treating a missing business decision as fabricated truth.
- Distributed instructions and human documentation describe the adaptive behavior and vendor-neutral boundary.

## Non-goals

- Enforcing GitHub Flow for adopter projects.
- Mutating GitHub, GitLab, Bitbucket, Gerrit, CI, branch protection, or repository permissions.
- Mirroring the full contents of an enterprise source-control policy.
- Automatically choosing a collaboration profile from headcount alone.

## Approval

The Human Principal approved this direction in the project control conversation on 2026-09-02.
