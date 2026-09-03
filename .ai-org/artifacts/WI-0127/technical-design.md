# WI-0127 technical design

## Evidence sources

- `README.md`
- `docs/getting-started/usage.md`
- `docs/getting-started/core-skills.md`
- `docs/concepts/workflow-profiles.md`
- `TEMPLE.md`
- `.agents/skills/temple-work/SKILL.md`
- `.ai-org/core/workflow.json`
- `src/work-items.mjs`
- `scripts/validate-agent-led-onboarding.mjs`
- `scripts/validate-brownfield-adoption.mjs`
- retained Wave 1 and cold-task validation records

## Execution

Run both existing validators from the merged `main` baseline. They create and delete disposable repositories and perform no network write, model generation, Console startup, Observer startup, publication, or deployment.

The report will compare the executable fixture with the public human path. It will not treat the fixture's direct file generation as proof that a first-time user knows what evidence to write.

## Output

Publish `docs/validation/core-operating-path-audit.md` and add one entry to the validation index. The report will end with ordered next Work Items, not an unbounded feature list.
