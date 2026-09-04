# WI-0145 work order

## Outcome

Give a newly initialized Temple project a deterministic, read-only way to turn Provider catalog facts, compatibility evidence, explicit preferences, and optional aggregate usage history into an explainable model-profile proposal.

## Authorized slice

- add a local-input `temple execution onboarding-plan` command;
- define versioned input and output contracts;
- treat explicit preferences as project direction and historical usage only as a familiarity prior;
- reject catalog-only or incompatible candidates rather than inferring suitability from a model name;
- emit profile-by-profile recommendations, alternatives, unresolved reasons, provenance, and authority flags;
- add focused behavior, CLI, schema, package-installation, and documentation coverage.

## Boundaries

The command may read repository files supplied by the caller. It must not contact a Provider, inspect conversation contents, mutate `execution-policy.json`, start model execution, buy Credits, or promote a proposal into adopted policy.
