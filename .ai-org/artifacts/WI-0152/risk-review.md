# WI-0152 Risk Review

## Assessment

Risk tier remains **standard**. This changes a privacy and publication policy but performs no publication, credential operation, remote write, deployment, or history rewrite.

## Risks and controls

| Risk | Control |
| --- | --- |
| The scanner prints a detected secret while trying to help | Report metadata only; never return matched values, source lines, or fingerprints. Tests assert absence. |
| A broad legacy exception hides new leaks | Baseline is an exact commit and counted per rule/path/value fingerprint; only unchanged repository occurrences are retained. Package scans ignore the baseline. |
| A user mistakes a pass for safety certification | Documentation and CLI explicitly state the bounded surfaces and that a pass is not publication authority. |
| Binary screenshots contain private text | Count binaries and require a separate visual/manual review; do not label them clean. |
| Project policy weakens credential protection | Semantic validation fixes credential and local-only data floors across every profile. |
| Audit adds expensive CI work | Keep the command opt-in; package-only checks are suitable for ordinary CI, while full repository/history/log review belongs to a release gate. |
| Existing evidence is broken by cleanup | Do not rewrite historical artifacts or Git history; normalize package-facing docs and use the frozen baseline for unchanged legacy records. |
| Upgrade takes ownership of project policy | Schema is managed; configuration is project-owned, created only when absent, and never overwritten. |

## Rollback

Revert the implementation commit and remove the newly added managed schema through Temple's normal upgrade semantics. Preserve the project-owned policy file as inert data unless the project owner explicitly removes it. No repository visibility or history rollback is needed because this Work Item performs neither action.
