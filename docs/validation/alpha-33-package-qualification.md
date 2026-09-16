# Alpha.33 package qualification and upgrade guide

Alpha.33 is a preparation candidate. Until its public release is verified, the
published Alpha channel remains Alpha.32. The exact-candidate results are retained
in WI-0243; this document defines the reusable acceptance boundary rather than
embedding a self-referential archive hash.

## What is being qualified

- Node.js 24 with lockfile-strict dependency installation and complete verification.
- The allowlisted npm archive, package version, manifest, integrity and SHA-256.
- A disposable consumer installing that exact archive and performing dry-run init,
  first init, repeat init, pinned-launcher execution, Doctor and Status.
- An existing fixture initialized from the published Alpha.32 archive, containing
  custom instructions, application content and organization history. Upgrade must
  preserve every existing project-owned file's bytes and the actor policy.
- A modified managed-file negative control: upgrade must preserve the local edit
  and report the conflict, rather than overwrite it or claim a clean upgrade.
- Distinct Independent QA judgment and exact evidence before ordinary integration.

These are synthetic local fixtures, not real multi-machine collaboration or
evidence that every downstream project is ready. This preparation changes no real
consumer repository, publishes no registry version and launches no paid model run.

## Upgrading an existing project

After Alpha.33 publication has been explicitly completed and verified:

1. Save or commit project changes and preserve a backup of organization state and
   the old lock. Rehearse on a disposable copy before a shared project.
2. Invoke the new **exact version** for the upgrade; the installed project's launcher
   correctly remains pinned to the old version until the lock has been upgraded:

   ```bash
   npm exec --yes --package=@zsz1210/temple-ai-dev-org@0.1.0-alpha.33 -- temple upgrade . --dry-run
   npm exec --yes --package=@zsz1210/temple-ai-dev-org@0.1.0-alpha.33 -- temple upgrade .
   node ./templew.mjs doctor . --compact
   node ./templew.mjs status . --no-write
   ```

3. Review each reported managed-file conflict. Preserve the local edit and resolve
   it deliberately; a completed CLI invocation is not proof that all files updated.
4. Review contributor readiness for the intended Principal and work before resuming
   delivery. Project-owned identities, assignments, policy and history are preserved.

An old project does **not** silently acquire the new ordinary-attribution policy.
If its owner chooses that policy, preview the intended profile and actor policy,
review the impact, then apply the returned fingerprint through the collaboration
CLI. Do not remove a login check by editing canonical JSON or borrowing another
member's Agent identity. See [collaboration operations](../operations/collaboration.md).

## Interpreting the results

The archive identity is independent of subsequent evidence-only commits. Before a
Release, repack the chosen source and require byte equality with the retained
candidate. Any change to packaged files invalidates the previous archive result.
The Release-only workflow repeats full verification and archive comparison before
upload; merging or creating a draft does not publish npm.

Dependency audit results are a dated registry observation. Full test counts are
not Token or financial measurements. Local durations are diagnostic and are not a
comparison with older runs on different machines or under different load.

## Rollback boundary

Before publication, abandon or supersede the candidate without changing npm.
For a project rehearsal, restore its saved pre-upgrade state rather than assume a
newer framework supports automatic downgrade. A published defective version must
be handled by an explicitly authorized successor and, if appropriate, deprecation;
immutable registry bytes and release tags are never silently replaced.
