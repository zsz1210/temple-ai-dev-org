# WI-0089 Live Codex Title Observation

## Purpose

Verify that the proposed human-readable title preserves the Work Item, outcome, Position, and Agent on the actual Codex task-list surface rather than only in repository output.

## Observation

- Requested bounded-task title: 86 Unicode code points.
- The rename API accepted and returned the complete title.
- A subsequent task-list read returned the first 58 code points plus `…`.
- The visible projection therefore removed the complete Position and Agent suffix.
- The 48-code-point project-control title was read back unchanged.

## Correction

Limit ordinary generated suggestions to 58 Unicode code points in total. Budget the Work Item prefix and Position/Agent suffix first, then shorten only the goal with `…`. Do not silently abbreviate the Work Item ID, Position, or Agent display name.

## Authority boundary

This is application-behavior evidence for navigation copy only. It does not change task identity, Work Item lifecycle, claims, model routing, archive state, or release authority. The repository registry refresh and Codex app rename remain separate actions.
