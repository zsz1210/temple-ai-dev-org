# Technical design — WI-0045

## Approach

Change only the client-side `actionableAttention` normalization and hero copy in `src/control-plane-dashboard.mjs`.

1. Preserve existing Work Item attention exclusions for stale and historical evidence rows.
2. Partition currently firing conditions into stale-evidence and other recovery conditions.
3. Add one normalized stale-evidence entry with `count`, a recovery message, `jump_view: "system"`, and `suggested_action: "Review system conditions"`.
4. Keep other firing conditions as individual entries.
5. Derive the hero's operational count from each entry's `count ?? 1`, so grouped signals retain their underlying magnitude.

## Verification

- Add static regression assertions for grouped stale-evidence normalization and count-aware hero logic.
- Run the focused Control Plane suites and `npm run verify`.
- Restart the live server and prove that 10 firing stale-evidence conditions outrank 9 release decisions while producing one attention card.
- Recheck desktop, mobile, and private LAN behavior with no overflow or private local-tool leakage.

## Risk review

The change is presentation-only and consumes the existing condition projection. The System view remains the authoritative detail list. No condition lifecycle, evidence authority, mutation route, or private-viewer permission changes.
