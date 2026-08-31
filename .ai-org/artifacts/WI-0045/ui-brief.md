# UI brief — WI-0045

- Delivery mode: `code-first`
- Parent UI contract: `.ai-org/artifacts/WI-0044/ui-brief.md`

## Presentation

Keep the existing Now hierarchy and density. The hero may use the existing warning treatment. The grouped attention card uses the ordinary actionable card style and text such as `10 stale evidence conditions` with one `Review system conditions` action.

Do not add a fifth metric, a separate alert wall, nested navigation, a modal, or an auto-opening detail list. System remains the detail destination.

## Required runtime states

- one or many firing stale-evidence conditions aggregate correctly;
- no stale-evidence condition produces no grouped card;
- other firing recovery conditions remain individually visible;
- release decisions become the hero only when no higher-priority recovery condition exists;
- private viewer receives the same read-only operational priority without local action surfaces.
