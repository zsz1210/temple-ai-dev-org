# WI-0193: Stopped support comparison

## Actual result

The authorized run started once on 2026-09-06 after exact independent readiness and funding checks. It stopped during the first case. There is no completed before/after pair, no helper correctness result and no measured Temple efficiency difference.

| Observation | Result |
| --- | --- |
| Attempted case | support-read / before |
| Parent route | Terra medium |
| Parent elapsed | 26.475 seconds |
| Whole run elapsed | 26.551 seconds |
| Parent last-observed input / cached / output | 66,944 / 40,448 / 656 |
| Parent observed Operational Tokens | 27,152 |
| Parent terminal | interrupted |
| Helpers bound / expected | 0 / 1 |
| Unbound pending events | 1 |
| Product out-of-scope changes | none observed |
| Remaining planned cases | 3 not run |
| Retry / fallback / reset / purchase | none |

The operational counter is not account-final or aggregate cost. An unbound actor has no settled attributed usage; do not interpret the parent counter as the entire run's cost.

## Cause and responsibility

Top-level stop reason is event-contract-violation; the native tracker's retained cause is unknown-item. The tracker rejects item kinds outside its handwritten allowlist. Installed schema validation accepts a broader item surface, but the recorder does not preserve the rejected item's type. Therefore the evidence establishes a recorder/runtime compatibility failure, not which specific kind was received. It does not establish a quota failure, model incompatibility, a bad Temple answer or an unauthorized write.

No structured answer or helper findings were captured. The case is unmeasurable, not a functional rejection of Temple. A native error list of zero entries does not prove there was no provider error. It means this failure path did not retain such an error.

The implementation and readiness coverage were inadequate: replaying old event fixtures and checking request schemas did not cover all legitimate runtime item types or early child-activity ordering. That gap belongs to the evaluation tooling and its verification, not the tested product. The original independent readiness report is preserved as a historical assessment; this live result limits that assessment and prevents any claim of demonstrated native compatibility.

## Cleanup evidence

The recorder observed the parent interrupted but one unbound actor did not have an observed terminal. Cleanup remains unconfirmed in live-results.json. Subsequent local process and open-cwd inspection found no experiment runner, no experiment-configured app-server and no Codex process with this lab as cwd. Existing desktop/project services were left untouched. This is local process evidence, not proof of a missing provider actor's terminal state or final usage.

## Next change before considering further generation

1. Preserve safe method, item type, hashed correlation IDs and lifecycle status before dispatch to event-specific handlers, including on errors. Keep raw prompts, reasoning, messages and credentials out of generic metadata.
2. Classify every declared installed-schema item type: supported, harmless observation-only, or explicit authority/scope violation. Do not silently accept all unknown events, but distinguish a known harmless item from a violated execution contract.
3. Add generation-free contract coverage for the complete installed item union and ordering cases: child activity before spawn completion, native spawn failure, foreign event, rejected type and cleanup with an unbound actor. Tests must prove the diagnosis survives the failure path.
4. Independently review those specific cases before proposing another tightly bounded compatibility probe. Do not repeat another full comparison matrix to debug transport or silently reuse this spent zero-retry approval.

Current evidence cannot deliver the requested comparison. No further live run is started by this report. The protocol, source, seal and all attempted results remain unchanged.

## Reproducibility

Candidate: 2628319f75c01d1bf9d9879569b504ab40f44b1f. Seal: 4e1aba74edad70caeba387cc9ce7ae98f28829fe400a1e35ed325ed1d0d75174. Retained structured result: live-results.json. Approval: live-approval.json and live-authorization.md. Readiness: independent-qa.md and readiness-review.json. Pre-run local validation: 12 focused checks and 632 full regressions passed; those counts did not establish live native compatibility.
