# WI-0072 work order

## Problem

GitHub Actions run `33404489796` failed because four historical evidence entries refer to two exact candidate commits that remain available only in local worker branches:

- WI-0032: `27d735d89d30915ee2399f80f85ad563477d420c`
- WI-0035: `0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72`

The corresponding patches entered `main` as `ee84f5f4d2f26bccdc6a066a1ddb52c9cf5f43ec` and `d2e86136d0f5c24c9b6c2cfbadb124179bf78a69`, but patch equivalence does not make the original evidence revisions available to a fresh clone. Historical evidence must not be silently rebound to a commit on which the recorded observation did not run.

## Authorized outcome

1. Preserve both original candidate commits under deterministic Temple evidence tags and publish only those exact tags to `origin`.
2. Make Doctor fail locally when an evidence revision is neither reachable from `HEAD` nor preserved by its deterministic evidence tag.
3. Add an explicit local preservation command. It creates a local tag only; it never pushes, publishes, or changes a remote.
4. Improve Git evidence metadata so a dirty worktree distinguishes affected implementation paths from unrelated governance artifacts. Reject Git candidate capture only when declared affected paths are dirty.
5. Reproduce the correction from a fresh remote clone and retain normal Test, Evaluation, Independent QA, and Release Gate separation.

## Boundaries

- Do not rewrite or invalidate the four historical evidence entries.
- Do not weaken the existing unavailable-revision or artifact-digest checks.
- Do not modify `temple.lock`; WI-0069 retains ownership of that path through its release-gate closeout.
- Do not publish a release or make the repository public.
- The only authorized remote mutations are the two evidence-tag pushes and the normal branch/main push needed to repair CI.
