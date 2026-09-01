# Technical Design — Roadmap and release-readiness reconciliation

## Documentation structure

- `docs/planning/roadmap.md` is the canonical English direction.
- `docs/planning/roadmap.ja.md` and `roadmap.zh-TW.md` mirror its facts and section structure with native-language prose.
- `docs/planning/release-readiness.md` owns dated audit facts, hard Alpha gates, retained later tests, and the recommended release sequence.
- `docs/README.md` routes maintainers and evaluators to both planning documents.
- `.ai-org/artifacts/WI-0084/license-decision-brief.md` records the MIT and Apache-2.0 comparison without changing repository policy.
- `.ai-org/artifacts/WI-0084/state-reconciliation.md` explains every lifecycle correction made during the audit.

The roadmap does not duplicate the changelog or individual validation records. The release-readiness page is a dated gate register, not a claim that pending tests passed.

## Canonical-state method

For each non-terminal Work Item at the audit baseline:

1. inspect its declared state, exact candidate revision, normalized evidence, artifacts, and later superseding work;
2. close it only if its required gate evidence already supports the lifecycle decision;
3. cancel it only when its bounded scope was explicitly consumed, superseded, or stopped without hidden remaining delivery;
4. retain it when an unresolved product decision, failed experiment, or final-candidate release test remains meaningful;
5. rebuild generated views through the Temple CLI after canonical mutation.

No generated status projection is treated as stronger authority than Work Item and evidence records.

## Release-readiness method

Read-only checks establish the audit baseline:

- Git visibility, current hosted CI, and registry publication state;
- package metadata and `npm pack --dry-run --json` manifest shape;
- dependency vulnerability audit;
- Node.js maintenance status from the official release table;
- workflow permissions and external Action references;
- existing security, contribution, notice, validation, and exact-candidate evidence.

Remaining tests are separated into:

- blockers for a narrowly labeled first public Alpha;
- historical checks that must be rerun at the final candidate;
- real-environment qualification needed only for stronger production or enterprise claims.

## Verification design

- repository link checks for all new relative links;
- consistent roadmap section structure and release facts across all three editions;
- native-language review for Japanese and Traditional Chinese rather than sentence-by-sentence translation;
- `git diff --check` and schema validation;
- the complete repository verification suite;
- fresh detached-worktree reproduction by Quality and a distinct Independent QA Agent Identity at the exact documentation candidate;
- Release Manager review confirming that no license, visibility, publication, tag, or external setting changed.

## Rollback

Revert the documentation and canonical-state candidate commit, rebuild generated views, and retain the audit artifacts as historical evidence. No public release, external write, license migration, or package publication occurs in this Work Item, so rollback has no external remediation step.
