# 願景與 operating model

## 要解決的問題

多個 AI 對話各自擁有局部脈絡時，常見結果是重複實作、決策遺失、任務無法延續、對話數量失控，以及標題取代真正的工作識別。Temple 的目標不是讓每個對話記得所有事情，而是讓每個職位都能從同一份外部狀態恢復工作。

## 組織原則

1. Position 是穩定的責任與權限；Agent Identity 是某個專案中的具名執行者；Assignment 才把兩者連起來。
2. 一個 Agent 可以兼任多個 Position，因此小型專案不需要同時運行九個 AI。
3. Position 從第一天就完整存在，未來增加 Agent 時只改 Assignment，不改流程語言與歷史資料。
4. Developer 和 Independent QA 必須是不同 Agent Identity，避免同一執行者自行證明自己的成果。
5. 人類擁有商業真相、優先順序、成本與高風險批准；Engineering Manager 是主要入口。
6. 文件、Git 狀態、測試結果、runtime evidence 與 approval record 才是 canonical state。

## 九個 Position

| Position | 主要責任 | 主要輸出 | 不可自行批准 |
|---|---|---|---|
| Engineering Manager | intake、拆分、委派、解阻、整體狀態 | work order、handoff、status | 商業優先級、高風險 release |
| Product Manager | 問題、範圍、驗收條件 | spec、acceptance criteria | 技術設計與 release |
| UX Designer | 使用者流程、狀態與互動風險 | UX notes、flow、copy decisions | 實作品質與 release |
| Tech Lead | 架構、介面、風險與技術決策 | design、ADR、implementation plan | 產品範圍與獨立 QA |
| Developer | 實作、單元測試、自我驗證 | code、test evidence、handoff | 自己工作的獨立 QA |
| Quality & Evaluation Engineer | 測試設計、eval、回歸證據 | test plan、eval report | release |
| Independent QA | 獨立重現、驗收、反例搜尋 | QA report、pass/fail | 自己的 upstream 實作 |
| Release Manager | release gate、版本、rollback readiness | release record、go/no-go proposal | 高風險人類批准 |
| Observer | 從 canonical state 建立可觀測 view | status、timeline、stale alerts | 任何產品或 release 決策 |

## 建議的第一個配置

小型專案可以用五個 Agent Identity 覆蓋九個 Position：

1. Coordination：Engineering Manager、Release Manager、Observer。
2. Product：Product Manager、UX Designer。
3. Technical：Tech Lead。
4. Delivery：Developer。
5. Quality：Quality & Evaluation Engineer、Independent QA。

這些是 assignment slots，不是 Agent 名字。名字只在專案第一次初始化時建立。

## 工作生命週期

```text
Intake
  → Spec
  → Design
  → Build
  → Test
  → Eval
  → Independent QA
  → Release Gate
  → Done
```

每次 handoff 都必須包含：work item ID、輸入版本、已完成內容、證據位置、未解決問題、下一位 Position。缺少這些欄位時，不應把聊天內容當作完成證明。
