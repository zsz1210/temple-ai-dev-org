# WI-0089 Risk Review

| Risk | Control |
| --- | --- |
| A title is mistaken for canonical identity | Keep Work Item ID and thread ID canonical in policy, docs, registry, and UI copy. |
| A long Work Item title lets Codex truncate Position and Agent | Keep the whole suggestion within the live-verified 58-code-point budget by shortening only the goal. |
| Delimiters inside a goal make the structure ambiguous | Replace embedded `·` with `-` before formatting. |
| Refresh mutates runtime or model evidence | Compare every field except `suggested_title` in tests and leave timestamps unchanged. |
| A no-op refresh adds event noise | Do not write the registry or event stream when no title changes. |
| Temple claims to rename Codex by updating JSON | Return `external_action_performed: false`; use the app rename API separately and read back results. |
| Historical tasks are renamed unexpectedly | Refresh is explicit and can target one task; app renames are limited to resolved accessible tasks. |
| Main control task is falsely registered as bounded work | Document it as a navigation convention only; do not create a fake Work Item or task record. |
| Framework source and self-host managed copies drift | Edit `project-overlay/` first, run the self-host upgrade, and require Doctor checksum validation. |
| Blocked Alpha candidate appears current after lock changes | Keep WI-0086 stale and require a later exact candidate before any publication. |
