# ADR-0003：聊天不是 canonical state

- Status: Accepted
- Date: 2026-08-29

## Context

AI 對話之間不能可靠共享完整記憶，標題也可能改動或失去意義。

## Decision

Spec、Design、ADR、work item、assignment、evidence 與 approval 必須保存在 project files、Git 或明確連結的外部系統。聊天只負責討論、操作與 handoff。

## Consequences

任何 Agent 都能從 repository 恢復狀態，但每次工作都多了一項必要責任：將已確認資訊寫回 canonical files。
