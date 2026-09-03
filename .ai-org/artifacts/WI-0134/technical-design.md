# Technical design - WI-0134

## CLI contract

Add:

```text
temple evidence invalidate [target] --evidence-id EVID-... --reason text [--replacement-evidence-id EVID-...] [--actor id]
```

The command uses the existing project mutation lock. It does not change a Work Item state or perform an external action.

## Domain mutation

`invalidateEvidence(target, options)` will:

1. validate the registry before mutation;
2. resolve and validate the target and optional replacement;
3. validate the actor against active project Agent identities or `human`;
4. update the existing immutable record only with explicit invalidation metadata;
5. write the registry, append `evidence_invalidated`, and restore the original registry if event append fails.

The optional replacement is stored under `details.invalidation.replacement_evidence_id` so the v1 schema remains compatible and no project-owned migration is required.

## Doctor behavior

`validateEvidenceArtifacts` continues validating registry structure for every record. It skips revision durability and artifact-byte checks only when `invalidated_at` is present, because that record is already ineligible for gates and Observer reports its invalidation. Every active entry keeps the current fail-closed behavior.

## Historical repair

The two malformed records will be invalidated with a reason naming the observation-rewrite defect and the later valid evidence that supersedes the claim. No artifact bytes or past commits are altered.
