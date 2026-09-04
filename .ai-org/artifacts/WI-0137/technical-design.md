# WI-0137 technical design

## Contract changes

### Context Map

`temple.context-map/v2` keeps the v1 route fields and adds two optional arrays to each route:

- `stages`: workflow state IDs for which the route applies; `[]` means every stage.
- `purposes`: any of `primary`, `integration`, or `recovery`; `[]` means every purpose.

The runtime and JSON Schema continue to accept `temple.context-map/v1`. A v1 route is normalized in memory as having empty `stages` and `purposes`; Temple does not rewrite the project-owned file during resolution or upgrade.

### Context resolution

The CLI adds:

```text
temple context resolve . --work-item WI-0001 \
  [--stage build] [--purpose primary|integration|recovery]
```

Resolution rules:

1. read and validate the Work Item and configured workflow;
2. choose `--stage` or the Work Item's effective lifecycle stage;
3. choose `--purpose` or `primary`;
4. reject an unknown stage or purpose before retrieval;
5. filter Context Map routes by the selected stage and purpose;
6. warn when an explicitly pinned route exists but is outside the selected route scope;
7. perform the current deterministic retrieval over the remaining route corpus;
8. build a content-addressed manifest from the selected repository paths.

Explicit pinning does not override a route's stage or purpose boundary. The project must intentionally widen the route if it should apply.

### Context Capsule

`temple.context-capsule/v2` adds:

- `route`: selected stage, its source, purpose, and fallback policy;
- `source_manifest`: deterministic digest, unique source totals, per-source categories, status, bytes, and SHA-256.

Source categories are:

- `work-item`;
- `specification`;
- `context-route`;
- `learning`;
- `capability`.
- `operating-contract` for `TEMPLE.md` in explicit recovery context.

The same path appears once with all applicable categories so totals do not double count it.

## Filesystem safety

Manifest measurement:

- accepts only normalized repository-relative paths;
- rejects symbolic links and non-regular files;
- resolves parent-directory symlinks and verifies the real file remains below the real project root;
- streams file content through SHA-256 so measurement does not retain the full body in memory or output;
- reports `missing`, `unsafe`, `non-regular`, or `unreadable` rather than following an unsafe source;
- sorts paths and categories before digesting the manifest.

The selection digest excludes timestamps, requested revision labels, and absolute paths. It changes only when selected paths, categories, status, size, or content digests change.

## Generated output and compatibility

The existing `.ai-org/views/work-items/WI-####.json` latest-view path remains unchanged. It is generated and may be overwritten by a later Position, stage, or purpose resolution. Durable coordination must cite canonical files and evidence rather than treating a generated capsule as history.

Fresh initialization creates Context Map v2. Existing v1 maps remain byte-for-byte project-owned and valid. No automatic project-data migration is required.

## Verification

- unit tests for stable and content-sensitive source manifests;
- CLI tests for default and explicit stage/purpose selection;
- v1 compatibility and v2 validation tests;
- stage/purpose exclusion and pinned-route warning tests;
- symlink and repository-boundary tests;
- a component-scoped integration fixture showing that unrelated service context is not selected;
- schema, Doctor, installation, package, and full repository verification.

## Risk review

| Risk | Control |
|---|---|
| A stage filter hides required authority | Empty constraints preserve legacy behavior; out-of-scope pinned routes warn; fallback stays explicit |
| Manifest follows a link outside the repository | `lstat`, `realpath`, and root containment checks fail closed |
| Measurement is mistaken for Token cost | Field names use bytes; documentation explicitly separates provider Tokens and price |
| Project-owned v1 maps are rewritten | Resolver normalizes only in memory; upgrade preserves the file |
| Generated capsule becomes authority | ADR, schema, and documentation retain generated-view status |

The change is reversible by removing the new CLI options and v2-only fields. It performs no external action, model call, automatic route execution, or project-file migration.
