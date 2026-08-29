# Phase 1：可安裝、可驗證的組織骨架

## 完成定義

Phase 1 只有在以下條件成立時才算完成：

- 新 repository 可以用一份已確認名字的設定檔成功初始化。
- `project-overlay/` 內沒有預先定義的專案 Agent 名字。
- 九個 Position 都有唯一 active assignment。
- Developer 與 Independent QA 是不同 Identity。
- 重跑 init 不會覆蓋使用者內容，managed conflict 會停止。
- doctor 能發現 managed tampering、模型錯誤與 instructions 未整合。
- status 能從 canonical files 產生摘要。
- work item、handoff、transition 與 closeout 可透過 CLI 完成，非法 gate 會被拒絕。
- Codex task/thread 能以 stable ID 登錄，並投影 suggested title、revision、attention 與 archive readiness。
- 舊版 package identity 與已重新命名的 managed Skills 可以透過 checksum-aware upgrade 遷移，且 project-owned state 不被覆蓋。
- `$temple-work`、具 conversational／evidence-backed modes 的 `$decision-interview` 與 `$domain-modeling` 可在 repository 本地被 Codex 發現。
- Core init 不自動擴張 development Skills；Build Quality pack 可以 dry-run、明確安裝、status 觀測、checksum upgrade 與安全移除。
- 至少一張低風險真實 work item 完成 Developer、Independent QA 與 release gate 全流程。
- CI 能在乾淨環境執行所有測試。
- GitHub repository 已建立並推送可重現的 commit；公開前具備 MIT License 與第三方來源說明。

## 本 Phase 不包含

- 自動啟動多個長駐 Agent 或背景排程。
- 由 CLI 直接呼叫模型替 Agent 命名。
- 自動安裝 Archify、第三方 Skill 或任何 optional pack。
- 直接建立、改名、開啟或封存 Codex app task。
- Web dashboard、即時事件串流、跨 repository portfolio view。
- 自動發布 production 或繞過人類 release approval。
- 從模糊產品點子完成 Project Charter、產品與技術基線，再交付第一個垂直切片；這屬於 Phase 1.5。Phase 1 的「新 repository」只證明技術初始化。

## 下一步

1. AiPet 已完成第二個既有 repository 的可攜性與 Build Quality friction 驗證。
2. FlowDeck 已完成 Phase 1.5 的第一個 greenfield lifecycle closeout，並凍結為驗證樣本；詳見 [retrospective](pilots/flowdeck-greenfield-retrospective.md)。
3. 先補 unresolved resolution、candidate revision projection、CLI discoverability 與 pilot stop boundary，再驗證新 Codex task 的 context recovery。
4. 實作並 forward-test `$project-documentation`，完成 Phase 1.5 exit gate 後，再進入 Phase 2 的 affected-path ownership、Observer 與 evidence adapter。
