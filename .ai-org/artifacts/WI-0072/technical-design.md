# WI-0072 technical design and risk review

## Preservation contract

Temple defines one deterministic lightweight tag per preserved commit:

```text
refs/tags/temple/evidence/<lowercase-40-character-sha>
```

An evidence-bound revision is durable in the local repository when either:

1. `git merge-base --is-ancestor <revision> HEAD` succeeds; or
2. the deterministic Temple evidence tag peels to that exact commit.

Local branches do not satisfy this contract. They are routinely rebased or deleted and caused the current failure. A tag with the expected name but a different target is an error.

## CLI behavior

Add:

```text
temple evidence preserve [target] --work-item WI-ID --revision ref
```

The command:

1. resolves the revision to an exact commit;
2. verifies that the named Work Item already has Evidence Registry entries bound to it;
3. creates the deterministic lightweight local tag, or returns an idempotent result;
4. appends a canonical preservation event;
5. reports `External action: not performed` and the exact explicit `git push` command required for remote preservation.

It never invokes `git push`. Conflicting tags and revisions not already referenced by the named Work Item fail closed.

## Doctor behavior

The existing unavailable-object and historical artifact-digest checks remain unchanged. After confirming the object exists, Doctor also checks the durability contract. This lets a local checkout detect worker-branch-only evidence before CI discovers it.

## Dirty-scope behavior

Git evidence capture reads staged, unstaged, and untracked repository paths. It records:

- whether the worktree is dirty;
- the total dirty-path count;
- whether dirt is outside or inside the Work Item's declared affected scope;
- the matching affected paths when present.

Capture fails when a declared affected path is dirty because the exact commit cannot represent those implementation changes. Governance-only or unrelated changes remain allowed and explicitly classified.

## Risk review

- Tag names are derived only from a validated exact SHA, preventing ref-name or shell injection.
- Git commands use argument arrays and do not execute a shell.
- Lightweight tags avoid requiring local signing or identity configuration.
- Automatic external writes remain forbidden; publishing tags stays a separately visible operator action.
- A tag is retention, not release or approval evidence. It does not advance a Work Item.
- Deleting or moving a preservation tag causes Doctor to fail again.
- The current repair must verify tag availability from a fresh GitHub clone before calling the CI issue resolved.
