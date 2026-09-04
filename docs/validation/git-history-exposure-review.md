# Git history text exposure review

Status: Git object review complete; privacy disposition remains a repository-owner decision

Work Item: `WI-0165`

## Result

Temple's public Git ref boundary contains no credible credential finding in the reviewed text. The scanner initially found 57 OpenAI-key-shaped occurrences, but exact blob and value-redacted context review established that all 57 are one deliberate Agent Command redaction fixture repeated through ten historical versions. No private-key header, GitHub token, AWS key, npm token, other OpenAI-key candidate, unreadable blob, or oversized uninspected text blob was found.

The history does contain substantial local-environment and email metadata. These values are not credentials, but they would become downloadable if the current repository becomes public:

| Rule | Occurrences | Unique historical blobs | Paths |
| --- | ---: | ---: | ---: |
| Maintainer home path | 955 | 355 | 95 |
| Private IPv4 address | 2,462 | 277 | 33 |
| Private Tailnet hostname | 38 | 15 | 5 |
| Email address in tracked text | 290 | 224 | 33 |
| **Total** | **3,745** | **738 across all rules** | **158 across all rules** |

All 3,745 occurrences are already reachable from `main`. There are no additional tag-only or pull-request-only findings. Deleting old branches or tags therefore would not resolve this privacy surface.

Commit metadata is a separate surface: the 764 reachable commits use two unique author names, four unique author email addresses, two unique committer names, and four unique committer email addresses. This report does not repeat those values. The repository owner previously accepted retaining contributor identity metadata; that decision does not automatically accept local paths, addresses, or email strings embedded in historical files.

## Exact boundary

The review pinned:

- `main` and `origin/main` at `06a88d84e12a7a2a23538d67749701c18c093343`;
- nine Git tags; and
- all 42 GitHub pull-request head refs visible from `origin`.

Together those 52 refs reached 14,512 unique Git objects: 764 commits, 5,757 trees, seven annotated tag objects, and 7,984 blobs. The scanner read 7,870 text blobs totaling 604,370,939 historical bytes.

The large byte count reflects repeated historical versions, not current checkout size.

## Explicit media exclusion

Per the repository owner's instruction, this Work Item did not inspect image or media content. It skipped 114 historical media blobs totaling 15,924,250 bytes: 68 PNGs and 46 SVGs. No other non-text binary blob and no inspection failure remained.

This exclusion is intentional. It neither repeats nor invalidates WI-0160's separate current-digest PNG review.

## Recommendation

There is no evidence-based reason to rotate a credential, and no security emergency justifies an immediate destructive rewrite.

There is, however, a real product/privacy decision before public visibility:

1. **Publish the current repository only after explicitly accepting the historical local metadata.** This preserves all commit and pull-request history. It is the lowest-operational-cost path, but the values above become public.
2. **Keep this development repository private and publish a clean source snapshot or distribution repository.** This best satisfies the preference not to expose unnecessary machine-local data while preserving the complete development record privately. It does not carry the original pull-request UI into the public repository.
3. **Rewrite this repository in place only if preserving the repository identity is more important than stable history.** This is the least-recommended path. It would change most or all of the 764 commit identities, invalidate revision-bound Temple evidence and tags, require collaborator coordination and temporary protection changes, and still leave GitHub pull-request or cached references requiring separate treatment.

GitHub's current guidance confirms that history rewriting changes commit IDs, can break pull-request diffs and signatures, requires coordination with every clone, and may leave data reachable through pull-request refs or cached views. GitHub Support's full purge path is intended for genuinely sensitive data whose risk cannot be mitigated, not ordinary non-secret privacy cleanup. See [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

Based on the observed data, the recommended path is option 2 unless the owner consciously accepts the 3,745 historical metadata occurrences in exchange for preserving the current repository's public history.

## Coverage limit still outside Git objects

This review covers Git objects and commit identity metadata. GitHub documents that changing a private repository to public also exposes existing Actions history and logs. Those hosting records are not Git blobs and were not scanned here. Review them separately before a visibility change. See [Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility).

## Reproduction

The PR head refs must be fetched into a temporary local namespace before running the scanner. The namespace is removed immediately afterward and no remote ref changes.

```bash
git fetch --no-tags origin '+refs/pull/*/head:refs/temple-audit/pull/*/head'
node ./.ai-org/artifacts/WI-0165/audit-git-history-text.mjs \
  --output .ai-org/artifacts/WI-0165/git-history-text-audit.json
node ./.ai-org/artifacts/WI-0165/verify-review.mjs
```

The retained machine-readable report contains rules, relative paths, lines, object IDs, and counts only. It contains no matched value, source-line excerpt, email address, username, or reversible value digest.

No history rewrite, remote-ref change, repository-visibility change, tag, GitHub Release, npm publication, deployment, or announcement was performed.
