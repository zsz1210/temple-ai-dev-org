# WI-0105 technical design

## Architecture

`scripts/validate-wave-4-operating-boundaries.mjs` is a deterministic, no-generation runner with two inputs: the repository root and an explicit output path. It reads canonical configuration, executes one bounded local test set, performs one disposable tracker CLI rehearsal, classifies the resulting facts, validates its own observation, and writes JSON atomically only after every required assertion passes.

```text
canonical files ─┐
focused tests ───┼─> normalized assertions ─> evidence matrix ─> retained JSON
temp tracker CLI ┘                                  │
                                                   └─> explicit limits / not-run gaps
```

The runner never changes the source repository. The only mutable rehearsal lives under an operating-system temporary directory and is removed in `finally`.

## Focused executable evidence

Run the following test files in one Node test command so their TAP summary and elapsed time can be retained without repeatedly paying process startup cost:

- `test/collaboration-governance.test.mjs`
- `test/tracker.test.mjs`
- `test/workflow.test.mjs`
- `test/high-assurance.test.mjs`
- `test/evidence-observer.test.mjs`
- `test/audit-export.test.mjs`
- `test/recovery.test.mjs`
- `test/control-plane-private-viewer.test.mjs`
- `test/control-plane-inbox.test.mjs`
- `test/ci-scope.test.mjs`
- `test/release-package.test.mjs`

The runner records the complete command, exit code, elapsed time, and TAP pass/fail totals. It fails closed on a non-zero exit or an unparseable summary.

## Disposable tracker rehearsal

Create one temporary Temple project with a synthetic linked GitHub provider, one team-visible parent, and one internal child. Supply a bounded local observation file rather than invoking a provider. Exercise the exact CLI boundaries that current unit tests do not join end to end:

1. reject a direct external link on the internal child;
2. link only the team-visible parent;
3. run `tracker inspect --observation ... --no-write --json`;
4. run `tracker plan --observation ... --no-write --json`;
5. verify the source work item state and generated-view file set are unchanged; and
6. assert every observation and plan says `external_write_performed: false`.

All identities and provider data are labelled synthetic. The rehearsal proves local command behavior, not GitHub or Jira interoperability.

## Canonical assertions

Read and validate these sources:

- `.ai-org/project/collaboration.json`
- `.ai-org/project/tracker.json`
- `.ai-org/project/control-plane.json`
- `.ai-org/project/assignments.json`
- `.ai-org/core/positions.json`
- `.ai-org/core/ui-design.json`
- `.ai-org/core/high-assurance.json`
- `.ai-org/core/validation-cases.json`

The observation must assert, rather than merely print:

- current profile, counts, recovery state, validation ladder, and Agent separation;
- repository-only tracker state, zero providers/mappings, and field-ownership groups;
- exact four UI modes, their evidence arrays, UI-reference requirements, and `required_tool: null`;
- Observer presence and absence of dedicated SRE/Security Positions;
- loopback Control Plane, raw-payload capture disabled, required secret redaction keys, repository-only Provider, and Agent Commands disabled unless explicitly configured;
- High-Assurance Principal, sponsorship, separation, evidence, approval, UI-mode, and rollback rules; and
- current real-collaboration and High-Assurance-drill statuses without changing them.

## Matrix model

Each row has a stable ID and contains:

- `boundary`;
- `claim`;
- `status`: `pass`, `gap`, or `not-applicable`;
- `evidence_class` from the approved five-value vocabulary;
- `verified_facts`;
- `evidence_refs`;
- `limitations`;
- `current_revision_applicability`: `exact`, `historical`, or `none`.

Rows are ordered by the five product boundaries and then by stable ID. The summary counts rows by boundary, status, and evidence class. A historical exact-revision observation is useful context but cannot qualify the current candidate.

## Observation safety

- Capture no raw prompts, credentials, personal data, environment dump, repository absolute path, or temporary absolute path.
- Bound stdout and stderr summaries for each command.
- Set `external_actions.external_write_performed`, `network_contact_performed`, `production_action_performed`, and `service_started` to `false`.
- Set model and Token fields to `not_applicable`; no model task or usage collector is involved.
- Record a dirty-path list only as repository-relative names so the exact-candidate check is auditable.
- Use a temporary output followed by rename; do not leave a passing document after failure.

## Documentation

`docs/validation/wave-4-operating-boundaries.md` explains the human meaning of the result, separates present safeguards from missing organizational roles and real-environment trials, and links the retained observation. The validation index and program plan receive only compact status updates.

## Verification and evidence boundary

The focused runner is the retained Wave 4 behavior observation. Ordinary `npm run verify` then validates the whole repository on the exact candidate. Independent QA runs from a detached exact-candidate worktree with a different Agent Identity. Evidence references must include only immutable artifacts that existed at the tested revision; later lifecycle reports do not become part of an earlier test observation.

## Stop and rollback

Stop immediately on a failed focused test, failed canonical assertion, ambiguous evidence class, attempted network or external write, or observation validation error. No automatic retry is allowed. Rollback removes the WI-0105 files and reverts its commits; the temporary rehearsal directory is disposable and must already be absent.
