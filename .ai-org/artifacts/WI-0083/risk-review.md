# Risk Review — WI-0083

## Overall disposition

Proceed with Build inside the read-only advisory boundary. Do not add a task launcher, routing executor, live evaluation, or policy mutation.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Easier work is mistaken for a better model | False efficiency recommendation | Only compare repository-declared matched cases with identical shape, digest, revision, and rubric. Keep natural Work Items in shadow evidence. |
| Token reduction hides quality loss | Rework or defects increase | Quality is a per-case gate. A failed case rejects the candidate before any resource comparison. |
| A tiny sample is presented as universal truth | Overconfident routing | Require a project-configured statistical contract and exact paired sign-test result; label scope and never supply a universal case count. |
| Requested model or reasoning is mistaken for effective execution | Wrong candidate identity | Preserve separate requested/effective fields and fail qualification when effective evidence is missing. |
| Old evidence remains active after model or rubric drift | Stale recommendation | Require expiry, rubric revision, content digests, source revision, and current policy/profile mapping; report stale explicitly. |
| Evaluation files expose prompts or sensitive content | Repository privacy leak | Schema stores case IDs and digests only; privacy constants are required; unknown fields are rejected; no raw payload is copied into generated views. |
| A recommendation silently becomes permission | Authority violation | Every result reports zero routing authority. Execution status, automatic routing, and model-switch flags are hard-coded false and tested adversarially. |
| Invalid configured source breaks all usage visibility | Loss of observability | Isolate source failures, report each blocker, and continue ordinary usage aggregation and Seed Policy fallback. |
| New project policy fields overwrite adopter choices | Upgrade data loss | Make the extension optional for legacy policies, seed only fresh files, and preserve existing project-owned policy byte-for-byte on upgrade. |
| Sign test is inappropriate for a project | Misleading statistical claim | Version the supported method, expose all assumptions and result fields, and leave unsupported methods not-qualified pending a separate reviewed implementation. |

## Rollback

Revert the WI-0083 implementation commit, restore the prior managed schema checksums, retain project-owned evaluation files without reading them, and rerun schema, Doctor, focused usage, installation/upgrade, and full repository verification. Because the feature performs no external action or model switch, rollback requires no provider or production remediation.
