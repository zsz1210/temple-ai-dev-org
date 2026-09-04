# WI-0153 Work Order

## Problem

The diagram is named **Temple Concept Layers**, but its visible markers are generic sequence numbers (`01` through `06`). That makes the rows look like steps instead of conceptual layers.

## Approved scope

- Change the six visible markers to `L1` through `L6`.
- Apply the same labels to English, Japanese, and Traditional Chinese desktop and mobile SVG assets.
- Preserve the diagram title, descriptions, colors, geometry, row order, README references, and all other wording.
- Do not change runtime behavior, release state, repository visibility, or npm publication state.

## Acceptance criteria

1. Every localized desktop and mobile Concept Layers SVG contains `L1` through `L6` exactly once and no former `01` through `06` marker.
2. The six assets remain valid XML and all three README references remain valid.
3. Desktop and mobile renders remain legible without clipping, overlap, or shifted alignment.

## Design and risk review

This is a label-only documentation correction. The existing index column is wide enough for two-character `L1` through `L6` labels, so no geometry change is expected. Risk is low and rollback is a one-commit revert.
