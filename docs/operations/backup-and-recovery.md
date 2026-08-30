# Backup and recovery

Temple `0.1.0-alpha.24` can create and restore a local, transparent backup of the project-owned organization state that Temple coordinates. This is a recovery mechanism for Temple state, not a replacement for Git hosting, application backups, database backups, or organization-wide disaster recovery.

## Recovery boundary

A backup includes:

- `temple.lock` and the project's `AGENTS.md`, when present;
- project identity, assignments, collaboration state, specifications, context routes, Work Items, learning, decisions, events, artifacts, adapters, evidence, and other project-owned files below the declared `.ai-org/` roots;
- project-owned Skills below `.agents/skills/` that are not exact checksum-managed entries in `temple.lock`.

It excludes generated `.ai-org/views/`, framework-managed core files and Skills, application source, dependencies, Git objects, external systems, and local control-plane telemetry outside the worktree. The manifest records these boundaries, the installed Temple version, project ID, Git revision and dirty signal when available, file modes, sizes, and SHA-256 digests.

The backup directory is intentionally inspectable:

```text
project-backup/
├── manifest.json
└── files/
    ├── temple.lock
    ├── AGENTS.md
    └── .ai-org/...
```

Backups are not compressed or encrypted. They may contain sensitive project-owned documentation, so store and transmit them according to the project's own access and retention policy.

## Create and verify a backup

Write the backup outside the project worktree. The destination must not already exist. Temple stages the complete output in a unique sibling directory, verifies every payload against the manifest, and only then renames it into place.

```bash
node ./templew.mjs backup create . \
  --output /absolute/recovery/location/project-backup

node ./templew.mjs backup inspect . \
  --backup /absolute/recovery/location/project-backup
```

Use `--json` when another tool needs the content digest, manifest digest, file count, or installed-version metadata. `backup inspect` is read-only and rejects missing, extra, oversized, linked, special, or checksum-mismatched payloads.

## Prepare a restore target

This backup does not contain the application repository or framework-managed files. Recover the repository checkout through its normal Git or source-distribution path first. The target must have the same immutable project ID and the same installed Temple version as the backup. For an older backup, prepare a checkout at that backup's source revision and Temple version, restore it, and then use the normal checksum-safe upgrade path.

Do not restore an older `temple.lock` over a newer set of managed framework files. Temple reports this as a compatibility conflict instead of manufacturing a mixed installation.

## Preview, apply, and recover

Preview is mandatory and read-only:

```bash
node ./templew.mjs restore preview . \
  --backup /absolute/recovery/location/project-backup
```

The plan classifies every backed-up path as `create`, `replace`, or `identical`, lists target-only project files that will be preserved, reports compatibility conflicts, and returns a content-derived `plan_digest`. A later target or backup change makes that digest stale.

Apply the exact reviewed plan:

```bash
node ./templew.mjs restore apply . \
  --backup /absolute/recovery/location/project-backup \
  --expected-plan PLAN_DIGEST \
  --allow-replace
```

Omit `--allow-replace` when the preview contains no replacement. Temple never deletes target-only files in this release.

Before writing, Temple records before-images and a durable transaction ledger outside the worktree, preferably below the Git common directory. It updates the ledger around each target write. Ordinary errors trigger immediate rollback. If the process or machine stops mid-command, run:

```bash
node ./templew.mjs restore recover .
```

Recovery rolls back only a path that still matches the interrupted restore output. If a person or another process changed that path afterward, Temple stops and preserves the newer content for manual resolution. Completed transaction metadata is retained in a bounded local history; before-images are removed after completion or rollback.

## Current evidence and limits

Automated fixtures cover boundary selection, payload tampering, stale plans, replacement consent, target-only preservation, project and version conflicts, interruption rollback, and post-interruption human changes. The following Phase 4A exit evidence remains separate:

- restore a real data-bearing project checkout in a clean environment and reproduce canonical digests;
- run Doctor after generated views are rebuilt;
- rehearse one real forward migration and documented rollback;
- exercise broader operating-system and actual machine-loss conditions.

Until that evidence exists, describe this capability as local alpha recovery rather than production disaster recovery.
