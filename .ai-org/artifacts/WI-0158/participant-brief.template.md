# Fresh-session participant brief

You are operating a clean-room release rehearsal. You have no prior Temple conversation context. Use repository-visible instructions and the frozen local package below as your only Temple guidance.

## Inputs

- Frozen Temple package: `<FROZEN_TARBALL>`
- Expected package SHA-256: `43cefd40bcb5d21a3159419eb89d31d691f0ac81a9489a38a4b4824ad5cf2f0b`
- Empty disposable project directory: `<DISPOSABLE_TARGET>`
- Runtime: Node.js 24 or another version permitted by the package's declared engine

Before installation, verify the archive digest. Do not fetch or substitute another Temple version.

## Product request

Build a small local command-line application named **QueueKeep**. A user should be able to add a short text item, list pending items, and mark one item complete. State must survive separate command invocations in a local file. Include deterministic automated tests. No network service, user interface, account, deployment, or external integration is needed.

Use Temple to turn this request into one bounded project Work Item and carry it through accepted closeout. Keep Developer and Independent QA as different project Agent Identities.

## Test-only Human decisions

- This disposable repository may use direct work on its current local branch. It has no remote and must not push, publish, deploy, tag, or create a release.
- You may choose five natural English display names for this project's Agent Identities. This delegation applies only to this disposable rehearsal and does not create framework defaults.
- Prefer a Lean workflow when the installed policy judges the work eligible; follow the installed policy if it requires a stronger profile.
- Make reversible local implementation decisions without asking for confirmation.

## Completion

Stop after the bounded Work Item is accepted and read-only `temple status` and `temple doctor` checks are healthy. Report:

- disposable project basename and final Git revision;
- Work Item ID, outcome, responsible Position and Agent Identity;
- tests and Independent QA evidence;
- elapsed time, encountered errors, retries, rework, Human interventions, and documentation gaps;
- requested/effective model and Token usage only if the Provider exposes reliable values; otherwise say `unknown`.

Do not start the cold-recovery task and do not add more product features.
