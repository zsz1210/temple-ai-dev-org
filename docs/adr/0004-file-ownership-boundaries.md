# ADR-0004：Managed、Project-owned、Generated 三種邊界

- Status: Accepted
- Date: 2026-08-29

## Context

中央模板需要更新規則與 Skill，但不能覆蓋產品規格、Agent 名字或工作歷史。

## Decision

每個安裝檔案都歸類為 managed、project-owned 或 generated。`temple.lock` 記錄 managed checksum；不同內容的 managed file 必須停止而非強制覆蓋。

## Consequences

升級較可預測，也需要明確的 extension point 與 conflict resolution 流程。
