# Alpha.22 Human Inbox and GitHub evidence validation

- Version: `0.1.0-alpha.22`
- Feature revision: `9dec9a73b80903dfe4fa59f34db2258c3275834c`
- Validation date: 2026-08-30
- Environment: macOS 26.5.2 arm64, Node.js `v25.6.1`, Codex CLI `0.150.0-alpha.12.2`
- Result: Passed with retained limits

## Automated evidence

- `npm run verify` passed repository integrity and all 129 tests at the feature revision.
- Human Inbox tests passed authority-class separation, one-result idempotency, secret-answer omission, explicit business-fact incorporation, exact-state and exact-revision checks, active-principal validation, approval-count policy, High-Assurance Developer-sponsor independence, and rejection of cross-origin, unauthenticated, or arbitrary mutations.
- The Codex response adapter was checked against locally generated official App Server JSON schemas for command approval, file-change approval, general permission approval, and `request_user_input` responses.
- GitHub adapter tests passed GET-only PR and Check Runs access, exact-SHA binding, ETag reuse, rate-limit visibility, wrong-head degradation, deterministic offline fixtures, explicit evidence capture, and the rule that captured evidence cannot change a Work Item lifecycle or satisfy a gate by itself.
- Provider and Inbox state inspection found no persisted GitHub token, authorization header, raw command, secret answer, or dashboard session secret.

## Local integration and browser evidence

- A fresh Temple `0.1.0-alpha.22` repository was initialized with five project identities, two Human Principals, High-Assurance sponsorship, and one revision-bound release-gate Work Item. `temple doctor` reported 35 passes, the expected retained large-scale collaboration warning, and no failure.
- The loopback control plane exposed one governance candidate and three visually separate queues: runtime permissions, business facts, and governance approvals. The governance card showed the exact candidate revision, approval minimum, risk tier, active principals, and separate go/no-go controls.
- A headed Playwright pass inspected the real dashboard at `1440 × 1100` and `390 × 844`. Both final layouts had no horizontal overflow and the browser console reported zero errors and zero warnings.
- The first mobile inspection exposed a `566 px` document width inside a `390 px` viewport. The responsive grid and long event labels were corrected, then both widths were rerun successfully. This record therefore reflects the corrected feature revision, not the initial visual attempt.

## Authority, security, and recovery checks

- Runtime permission answers require the corresponding live, unchanged provider request and do not create project approval.
- Business answers first become local proposals. Only a separate Human Principal action may add their generated context artifact to a Work Item; the artifact does not independently change scope, acceptance criteria, specifications, decisions, or gates.
- Governance approvals require a release-gate Work Item, the current exact candidate revision, active distinct Human Principals, the configured approval count, and High-Assurance sponsor independence. The approval record does not itself close the Work Item or authorize an external action.
- The HTTP command surface is limited to four named Human Inbox routes on loopback. Same-origin, per-session secret, JSON content type, matching idempotency header, and a 64 KiB request limit are enforced; arbitrary POST routes return method-not-allowed.
- The GitHub provider observes only a configured PR and Check Runs for one exact SHA. Credentials come only from a named environment variable, and no GitHub write path exists in this increment.

## Retained limits

- No user-authorized live GitHub repository, pull request, or token was used. GitHub HTTP behavior is proven through deterministic fixtures and request-level mocks, not a live external integration run.
- Runtime response shapes were validated against the installed Codex App Server schemas and deterministic provider tests; a live interactive permission or business-question round trip was not forced during this validation.
- Long-duration soak, process termination at every persistence boundary, large-journal performance, cross-clone convergence, remote access, and large multi-human or multi-machine operation remain unverified.
- The command ledger limits normal retries and concurrent duplicate submissions. It is not claimed to provide distributed exactly-once delivery across machine loss or every possible crash point.
- GitHub remains read-only. Issue updates, comments, labels, merges, deployments, and other external mutations are outside Phase 3C.
