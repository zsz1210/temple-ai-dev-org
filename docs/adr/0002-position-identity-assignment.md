# ADR-0002：Position、Agent Identity、Assignment 分離

- Status: Accepted
- Date: 2026-08-29

## Context

把名字直接寫死在職位設定中，會讓未來擴編、換人、合併責任與歷史追蹤都變得困難。

## Decision

模板只定義 Position。每個專案在第一次 init 建立自己的 Agent Identity 與英文 `display_name`，再用 Assignment 連接兩者。Identity 的 `agent_id` 穩定；顯示名稱可以變更。

## Consequences

同一 Agent 能兼任多個 Position，之後增加 AI 時只需要移動 Assignment。所有稽核紀錄都引用穩定 ID，不引用聊天標題。
