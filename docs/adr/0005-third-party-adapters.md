# ADR-0005：第三方能力必須位於 Adapter 邊界

- Status: Accepted
- Date: 2026-08-29

## Context

Archify 等工具能改善架構溝通，但若直接成為核心狀態或隱性依賴，會增加供應鏈、升級與可移植風險。

## Decision

第三方能力採 opt-in Adapter：釘選版本與 commit、記錄 license、限制輸入輸出，且不得改寫 canonical state 或批准 gate。Phase 1 只建立 Archify 合約，不執行安裝。

## Consequences

視覺化可以替換或停用，文字與 JSON 工作流仍能完整運作。
