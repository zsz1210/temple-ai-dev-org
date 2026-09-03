# Approved scope — WI-0121

The repair covers every bypass retained in `.ai-org/artifacts/WI-0120/independent-qa-attempt-1.md`:

- partial Provider/model/reasoning mappings;
- whitespace-only Work Item, Task Shape, Provider/model/reasoning, capability, and rejection-reason strings;
- pinned selection marked as fallback;
- non-pinned selection using pinned-only unresolved reasons;
- resolved selection with unknown required capabilities; and
- overlap between required and optional capability sets.

Valid resolver output and all WI-0120 rejection behavior must remain compatible. The parent stays blocked until a separate Independent QA task passes the child candidate.
