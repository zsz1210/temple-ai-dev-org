# Technical design — multi-human team governance

- Work Item: `WI-0076`
- Tech Lead: `agent-tidus`
- Base revision: `8d41f2bbe2d68e2540a7a000f733bcc3c44a3a50`

## Compatibility model

Fresh projects write `temple.collaboration/v2`. The installed collaboration schema accepts both v1 and v2 so an organization upgrade can update managed code and schemas without overwriting project-owned collaboration state. Existing v1 projects continue to read and use their legacy actions. New lifecycle, authority, recovery, identity, and tiered-validation actions require an explicit `collaboration migrate`; `--dry-run` reports the deterministic conversion first.

The self-host project is migrated explicitly in this Work Item. Migration maps:

- `active` booleans to lifecycle `status` values;
- default memberships to active `bootstrap-assignment` qualification;
- non-default memberships to provisional qualification unless existing evidence proves otherwise;
- `large_scale_validation` to the `real_collaborative` validation gate;
- missing grants, bootstrap owner, and recovery to explicit empty or not-configured states.

Upgrade never invents a Human Principal, provider identity, authority holder, trustee, or passed validation result.

## Collaboration v2 aggregates

`collaboration.json` remains project-owned and contains:

- profile and repository coordination backend;
- Human Principals with immutable ID, duplicate-safe display name, lifecycle status, and public provider references when supplied;
- append-preserving sponsorship history;
- Position Membership qualification, Discipline, evidence, risk ceiling, review, and expiry;
- scoped Human Authority Grants;
- temporary Bootstrap Owner state;
- configurable recovery trustee set and threshold;
- separate automated, simulated, real Collaborative, representative pilot, and High-Assurance drill validation gates.

Default Assignment remains in `assignments.json`; Agent lifecycle remains in `agents.json`; active Work claim remains in the Work Item. The v2 document references but does not absorb those aggregates.

## Local actor binding

`src/local-identity.mjs` stores one `temple.local-actor-binding/v1` document at `<git-common-dir>/temple/identity.json`, shared by linked worktrees but outside the version-controlled worktree. It uses atomic mode-`0600` writes and validates project ID, Principal ID, verification class, optional provider subject, evidence reference, timestamps, and optional expiry.

Verification classes are:

- `self-asserted` — permitted for Solo attribution;
- `external-evidence` — Temple records a provider and evidence reference but does not claim it performed provider authentication;
- `step-up-evidence` — evidence for a bounded stronger-authentication event; the external verifier remains authoritative.

No token, email, password, cookie, or provider credential is accepted. Binding is attribution evidence, not a substitute for repository access control or Human Authority Grant.

## Governance operations

- Add Principal permits duplicate display names and never reuses an ID.
- Set Principal status preserves history and prevents suspended or inactive Principals from active sponsorship, grant, trustee, and approval checks.
- New non-default Position Membership begins `provisional`; qualification requires evidence and may set review, expiry, scope, and risk ceiling.
- Sponsorship replacement closes the prior active record instead of deleting it.
- Bootstrap Owner may establish the first grants and recovery configuration. Retirement requires at least two active `manage-authority` grants, a valid recovery quorum, and distinct approval including the bootstrap holder; retirement is irreversible.
- After retirement, authority expansion and recovery reconfiguration require two distinct active `manage-authority` holders. No permanent fallback actor exists.
- Validation recording resolves an exact revision and requires evidence. Real Collaborative pass additionally requires at least two distinct active Principals and two independently administered environment identifiers.

## Projection and privacy

Observer normalizes v1 and v2 into one Organization projection. The full loopback projection contains bounded Principal, sponsorship, membership qualification, grant, bootstrap, recovery, validation, and safeguard data. It contains no local actor binding or credentials.

The private-viewer server removes Principal records, sponsorships, detailed grants, grant-holder identities, and recovery trustee identities before serialization. It retains Agent cards, Position coverage, aggregate governance readiness, validation status, and safeguards.

## Team UI

The existing Team destination and route stay stable. Replace Structure and Teammates with:

- Responsibilities: Position lanes, default Agent, eligible active pool, Disciplines, qualification status, and active-work count;
- People & Agents: accountable people plus sponsored Agents in the loopback view, Agent-only redacted presentation remotely;
- Authority: profile, grants, bootstrap, recovery, tiered validation, safeguards, and explicit read-only boundary.

Remove the Human Principal apex and delegated-responsibility connector. Keep tab switching immediate. No animation communicates online status or hierarchy.

## Risk review

- V1 compatibility is preserved through a dual-version schema and explicit migration.
- No provider-specific authentication or optional dependency is added.
- Authority data cannot alter Git hosting permissions, release externally, or bypass lifecycle evidence.
- Simulated validation cannot write a real-environment pass.
- Private redaction occurs on the server, not only in browser rendering.
- Repository coordination remains detect-and-recover; no distributed-lock claim is added.
- Existing Agent Commands, provider trust, usage policy, and blocked experiment scopes are preserved through named sequential overlap resolution.

## Rollback

Revert the implementation commit and restore the pre-migration `collaboration.json` from the committed parent revision. The local binding file is generated and can be removed independently. No external service, credential, or deployment requires rollback.

