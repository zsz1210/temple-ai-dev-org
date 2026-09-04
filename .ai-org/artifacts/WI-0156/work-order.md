# WI-0156 Work Order

## Outcome

Reduce the avoidable trial and error observed in WI-0155 so a fresh Codex task can initialize Temple, record test Evidence, and recover another repository without guessing configuration values, Evidence formats, or Work Item namespaces.

## Approved scope

- Add a package-visible, valid, copyable minimal `temple.init/v1` example that intentionally leaves repository integration unconfirmed when no policy has been reviewed.
- Make non-interactive init guidance point directly to that example and document every accepted repository-integration `source` value.
- Show the minimum `temple.test-observation/v1` JSON and the exact relationship between an observation path, a returned Evidence ID, and a later lifecycle gate.
- Make evidence-capture output label the complete reusable Evidence ID and make malformed non-JSON observation failures point to the installed template.
- Amend the reusable cold-recovery protocol so a task receives no coordinator Work Item identifier before it discovers the target repository's own namespace.
- Preserve missing Token telemetry as `unknown`; do not require Observer or usage collection for Temple's core workflow.
- Add deterministic regression coverage and repeat the bounded WI-0155 fresh-session delivery and cold-recovery scenario in a new disposable repository.

## Acceptance criteria

1. The example config passes the same validation used by `temple init --dry-run`.
2. A non-interactive invocation without `--config` names the example path and says that `repository_integration` is optional.
3. Evidence documentation and CLI output let a reader distinguish the JSON observation file from the exact `EVID-...` gate reference.
4. A malformed observation produces an actionable error without changing repository evidence.
5. The cold-recovery protocol uses a neutral task title until the target Work Item is discovered.
6. Existing unknown-safe Token behavior remains covered and no zero or estimated value is introduced.
7. The full repository gate and distinct Independent QA pass at the exact candidate.
8. A new clean-room run records matched metrics against WI-0155 and stops without publication, release, purchase, reset, retry, or fallback.

## Technical approach

- Keep the change at the documentation and CLI feedback boundary; do not add a configuration generator or automatic lifecycle transition.
- Reuse the shipped `.ai-org/templates/test-observation.json` rather than introducing another observation format.
- Validate the new example through tests instead of duplicating validation rules in documentation tooling.
- Add explicit CLI text only; recording Evidence still does not satisfy a gate automatically.
- Treat the second clean-room run as a bounded observation. Compare command-correction categories, elapsed time, Human intervention, rework, tests, Doctor, and available or unknown Token data without claiming universal improvement.

## Risk and rollback

Risk is low. The main compatibility risk is changing user-visible CLI text or accidentally implying that Evidence capture advances lifecycle state. Tests must retain `Lifecycle gate satisfied: no`. Roll back by reverting the bounded documentation, CLI-message, and test changes.

## Exclusions

- No new Agent identity, Position, workflow, model-routing rule, Observer requirement, or automatic Token collector.
- No continuation of QueueKeep after its bounded Work Item closes.
- No repository visibility change, npm publication, Alpha tag, GitHub Release, announcement, purchase, reset, retry, or model fallback.

