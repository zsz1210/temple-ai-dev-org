# ADR-0009：單一 Decision Interview 與明確 Skill 權限

- Status: Accepted
- Date: 2026-08-29

## Context

`decision-interview` 與 `evidence-backed-decision-interview` 具有相同的訪談核心，只差是否先讀 repository 證據。兩個相鄰 trigger 會讓 Agent 和使用者猜測該選哪一個，也增加每個專案的 recurring context。另一方面，原有 Skill 與 Position instructions 常直接要求「persist」，可能把只讀 review 或狀態問題誤解成寫檔授權。

## Decision

Temple 只安裝一個 `$decision-interview`。它根據決策是否受現有 repository 事實限制，選擇 conversational 或 evidence-backed mode；兩種模式共用同一套 facts、assumptions、options、decisions、unknowns 與 completion frontier。

所有 repository Skills 都必須區分分析與 mutation：inspect、explain、diagnose、review、status 預設只讀；只有使用者要求或目前已授權 work item 包含 repository 更新時才持久化。`$temple-work` 僅處理明確授權的 lifecycle canonical-state mutation，不代表一般實作權限。

Required Skill 清單由 `src/constants.mjs` 單一 registry 提供給 doctor 與 repository checks。從舊版升級時，只有 checksum 與舊 lock 相符的 `evidence-backed-decision-interview` managed file 會被移除；專案自行修改的版本仍以 conflict 停止。

## Consequences

- Agent 不需要在兩個高度重疊的訪談 Skill 間選擇。
- 需要 repository 證據時仍保留來源路徑、revision、ADR 與 glossary 行為。
- 只讀請求不再被 Skill 文字本身擴張成寫入授權。
- Skill 數量與 recurring context 降低，但 scenario matrix 和真實 pilot 仍需驗證實際模型 routing；結構測試不能取代 forward test 或 Independent QA。
