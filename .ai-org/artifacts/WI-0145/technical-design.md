# WI-0145 technical design

## Command

```bash
node ./templew.mjs execution onboarding-plan . --input path/to/onboarding-input.json --json
```

The command resolves `--input` inside the repository, rejects path or symlink escape, reads the current project-owned execution policy, validates both documents, and prints a plan without writing any file.

## Contracts

`temple.model-onboarding-input/v1` contains a Provider observation, normalized candidates, compatibility status and evidence, explicit preferences, and aggregate history. Candidate identity is the tuple `provider_id + model + reasoning_effort`.

`temple.model-onboarding-plan/v1` contains one result per current abstract execution profile. A result is `proposed`, `already-adopted`, or `unresolved`. It reports the recommendation source (`explicit-preference`, `historical-familiarity`, or `sole-compatible-candidate`), confidence, alternatives, evidence, and unknowns.

Historical observations influence only familiarity. They never claim quality, cost, safety, or compatibility. Compatibility must be stated separately and cite evidence. Raw prompts and hidden reasoning are not accepted fields.

## Deterministic selection

1. Reject candidates missing from the observed catalog or using an unsupported reasoning effort.
2. Retain only candidates whose compatibility status is `compatible` and whose eligible profile list contains the current profile.
3. Resolve exactly one compatible explicit preference first.
4. Without one, aggregate compatible historical execution counts and resolve only a unique maximum greater than zero.
5. Without history, resolve a sole compatible candidate.
6. Preserve all other cases as unresolved.

No model-name ranking, Provider-specific alias assumption, or LLM judgment participates in this algorithm.

## Packaging

The two JSON Schemas are framework-managed installation assets and are listed in the managed schema catalog. The onboarding input is caller-owned and is not installed into a project. The generated plan is returned to stdout and is not retained unless a future authorized operation does so.

## Risk review

- Habit can encode an inefficient default, so historical selection is labeled a low-confidence familiarity prior.
- Provider catalogs can drift, so the observation timestamp and source are mandatory.
- Compatibility claims can be false, so evidence references are mandatory and catalog presence alone is rejected.
- A proposal can be mistaken for authority, so all mutation and execution flags are fixed to `false` and adoption state is read from the existing policy only.
