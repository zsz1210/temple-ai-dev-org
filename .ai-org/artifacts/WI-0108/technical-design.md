# WI-0108 technical design

## Isolation and authority binding

Use the existing fail-closed setup with a new exclusive lab root. The runner receives explicit `--work-item-id`, `--approval-path`, and `--preflight-output` values. It rejects an approval whose Work Item ID does not match and never writes the new preflight over WI-0107 evidence.

## Execution

The no-generation preflight validates fixture digests, installed Codex CLI and App Server schema digests, the supported structured-output subset, Luna Max availability, manifest semantics, repository cleanliness, minimal-arm isolation, and the WI-0108 approval record. Only a passing preflight permits model generation.

The existing validation-program engine launches four sequential one-attempt turns through the local Codex App Server. It declines runtime permission requests and stops without retry for model reroute, missing usage, missing terminal completion, disallowed commands, forbidden file changes, test failure, Token/time/disk limits, or ambiguous state.

Objective public and hidden tests run after each candidate. Allowed product changes are committed inside the disposable candidate repository. Blind packages omit condition and provenance; the separately sealed mapping retains them until quality scores are frozen.

## Evidence boundary

Repository evidence records bounded summaries and numeric observations, not raw prompts, raw responses, hidden reasoning, credentials, or account billing claims. The local lab is retained after the run and requires separate authority to delete.
