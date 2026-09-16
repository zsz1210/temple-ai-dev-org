# Fast contract test audit

Baseline: `477e0b60ecbe83caea18430ccb649c67ecd690ca`. Audited all ten root-owned files in `audit-inventory.json` by reading complete tests and the relevant checks or retained boundaries.

## Removal

`test/doc-links.test.mjs`: **localized Temple Concept Layers assets use explicit L1 through L6 labels**. The test parses six static SVG sources and repeats the same literal label list. It does not validate links, rendering, accessibility or runtime behavior; harmless diagram renumbering or SVG class changes require test edits. Delete this presentation snapshot. The two link extraction/resolution tests and the actual `check-doc-links.mjs` gate retain link behavior and missing-asset detection. Exact diagram numbering is intentionally no longer asserted; visual correctness is not claimed from link checks. No replacement test or fixture is introduced.

## Retained inventory

| File | Reason to retain |
| --- | --- |
| test/ci-scope.test.mjs | Enforces actual hosted verification wiring, bounded jobs, permissions, pinned Actions and complete release checks. Similar publication assertions also protect a different workflow. |
| test/doc-links.test.mjs | Retains parser edge cases and recovery/unknown-usage instruction boundaries; deletes only the nonbehavioral SVG snapshot above. |
| test/evidence-git.test.mjs | Protects batched historical binary bytes, invocation-scoped caching, fallback, durability tags and unusual paths. Performance assertions here guard a real repeated-I/O regression. |
| test/model.test.mjs | Distinct normalization, stable identity, integration policy and Developer/QA staffing validation cases. |
| test/npm-release-workflow.test.mjs | Keeps release metadata, channels, artifact bytes and external OIDC publishing boundary. |
| test/publication-audit.test.mjs | Separate surfaces, legacy exceptions, credentials and exact adapter provenance; not duplicate happy paths. |
| test/release-package.test.mjs | Preserves installed bootstrap runtime compatibility and negative package-validator controls; the successful real package check runs only in the repository gate. |
| test/skill-policy.test.mjs | Agent instructions are behavioral input, including authority/recovery and profile-specific closeout. Source-text checks here are not ordinary UI copy. |
| test/specifications.test.mjs | Distinct authority, path, approval, schema, drift and category invariants. |
| test/test-groups.test.mjs | Prevents missing tests, unsafe fallback or silently narrowed discovery; no grouping/discovery change is made. |

No duplicate assertion transfer or case-count consolidation was performed in this root scope. Full baseline remains the previously measured 1250 tests; no rerun solely for baseline collection is needed. Focused and final integration results will be recorded in the aggregate report.
