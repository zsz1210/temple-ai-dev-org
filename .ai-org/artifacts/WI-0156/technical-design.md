# WI-0156 Technical Design

## Documentation path

`docs/getting-started/temple-init.example.json` becomes the one copyable minimal config. It omits `repository_integration`, allowing Temple to create the truthful `unconfirmed` state instead of encouraging a user or Agent to invent policy. The Usage guide links to it and separately lists the three accepted `source` values for cases where policy was actually inspected or confirmed.

The Evidence guide shows the existing test-observation template body, the capture command, representative output, and a later `transition --satisfy` reference. The observation path and normalized Evidence ID are named as separate artifacts with separate purposes.

The existing greenfield cold-recovery protocol will require a neutral pre-recovery task title. Only after repository inspection discovers a real target Work Item may the task adopt and register Temple's ordinary suggested title.

## CLI feedback

Non-interactive init without `--config` will name the package-visible example and state that repository integration may be omitted. Evidence capture will print a dedicated `Reusable gate reference` line while retaining the existing non-automatic gate boundary.

Test and runtime evidence adapters will wrap invalid JSON with an actionable message pointing to the matching installed template. Validation rules and accepted schemas remain unchanged.

## Verification

- Focused CLI, evidence, documentation-link, and unknown-usage tests.
- `npm run verify` on the exact integrated candidate.
- Independent QA from a distinct Agent Identity.
- One new projectless delivery task and one new projectless cold-recovery task using the same QueueKeep product brief and model settings as WI-0155.

The comparison is directional. It does not establish statistical significance or a general efficiency claim.

